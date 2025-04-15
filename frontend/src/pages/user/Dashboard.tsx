import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';

interface Store {
  id: string;
  name: string;
  address: string;
  rating: number;
  userRating?: number;
}

export default function UserDashboard() {
  const { user, token } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stores`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch stores');
        }

        const data = await response.json();
        setStores(data.data.stores || []);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch stores:', error);
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  console.log("stores: ",stores)
  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    store.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRatingSubmit = async (storeId: string, rating: number) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ratings/store/${storeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating })
      });

      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }

      setStores(stores.map(store =>
        store.id === storeId
          ? { ...store, userRating: rating }
          : store
      ));
    } catch (error) {
      console.error('Failed to submit rating:', error);
    }
  }

  const StarRating = ({ storeId, initialRating }: { storeId: string; initialRating?: number }) => {
    const [rating, setRating] = useState(initialRating || 0);
    const [hover, setHover] = useState(0);

    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            className={`text-2xl ${hover >= star || rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
            onClick={() => {
              setRating(star);
              handleRatingSubmit(storeId, star);
            }}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name || 'User'}!</h1>
        <div className="w-1/3">
          <input
            type="text"
            placeholder="Search stores by name or address..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStores.map(store => (
          <div key={store.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{store.name}</h2>
            <p className="text-gray-600 mb-4">{store.address}</p>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 mb-1">Average Rating</p>
                <div className="flex items-center">
                  <span className="text-yellow-400 text-lg mr-1">★</span>
                  <span className="font-medium">{store.rating ? store.rating.toFixed(1) : '0.0'}</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Your Rating</p>
                <StarRating storeId={store.id} initialRating={store.userRating} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredStores.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No stores found matching your search.</p>
        </div>
      )}
        </div>
      </div>
    </DashboardLayout>
  );
}