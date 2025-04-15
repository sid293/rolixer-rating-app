import { useState, useEffect } from 'react';
import { Store } from '../../types';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { MagnifyingGlassIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface Filters {
  name: string;
  address: string;
}

interface RatingModalProps {
  store: Store;
  currentRating: number;
  onClose: () => void;
  onSubmit: (rating: number) => void;
}

function RatingModal({ store, currentRating, onClose, onSubmit }: RatingModalProps) {
  const [rating, setRating] = useState(currentRating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Rate {store.name}
        </h3>
        <div className="flex items-center justify-center space-x-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="p-1"
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star)}
            >
              {star <= (hoveredRating || rating) ? (
                <StarIconSolid className="h-8 w-8 text-yellow-400" />
              ) : (
                <StarIcon className="h-8 w-8 text-gray-300" />
              )}
            </button>
          ))}
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded-md"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 rounded-md"
            onClick={() => onSubmit(rating)}
          >
            Submit Rating
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StoreList() {
  const [stores, setStores] = useState<Store[]>([]);
  const [filters, setFilters] = useState<Filters>({
    name: '',
    address: '',
  });
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [sortField, setSortField] = useState<keyof Store>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    // TODO: Implement actual API call
    const fetchStores = async () => {
      try {
        // Mock data for now
        const mockStores: Store[] = [
          {
            id: 1,
            name: 'Downtown Grocery',
            email: 'downtown@example.com',
            address: '123 Main Street',
            ownerId: 1,
            rating: 4.5,
            userRating: 4,
          },
          {
            id: 2,
            name: 'Tech Haven',
            email: 'tech@example.com',
            address: '456 Innovation Ave',
            ownerId: 2,
            rating: 3.8,
            userRating: 0,
          },
          {
            id: 3,
            name: 'Fashion Boutique',
            email: 'fashion@example.com',
            address: '789 Style Street',
            ownerId: 3,
            rating: 4.2,
            userRating: 5,
          },
        ];
        setStores(mockStores);
      } catch (error) {
        console.error('Failed to fetch stores:', error);
      }
    };

    fetchStores();
  }, []);

  const handleFilterChange = (field: keyof Filters) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSort = (field: keyof Store) => {
    if (field === sortField) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleRatingSubmit = async (rating: number) => {
    if (!selectedStore) return;

    try {
      // TODO: Implement actual API call
      setStores(prevStores =>
        prevStores.map(store =>
          store.id === selectedStore.id
            ? { ...store, userRating: rating }
            : store
        )
      );
      setSelectedStore(null);
    } catch (error) {
      console.error('Failed to submit rating:', error);
    }
  };

  const filteredStores = stores.filter(store => {
    return (
      store.name.toLowerCase().includes(filters.name.toLowerCase()) &&
      store.address.toLowerCase().includes(filters.address.toLowerCase())
    );
  });

  const sortedStores = [...filteredStores].sort((a, b) => {
    const aValue = a[sortField] ?? '';
    const bValue = b[sortField] ?? '';
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
    }
  });

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Stores</h1>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <div className="py-4">
            {/* Filters */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="filter-name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="text"
                      name="filter-name"
                      id="filter-name"
                      className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder="Search by name"
                      value={filters.name}
                      onChange={handleFilterChange('name')}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="filter-address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      type="text"
                      name="filter-address"
                      id="filter-address"
                      className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder="Search by address"
                      value={filters.address}
                      onChange={handleFilterChange('address')}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Stores Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Name', 'Address', 'Overall Rating', 'Your Rating', 'Actions'].map(header => {
                      const field = header.toLowerCase().replace(' ', '_');
                      const isValidField = field === 'name' || field === 'address' || field === 'rating' || field === 'user_rating';
                      return (
                        <th
                          key={header}
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                          onClick={() => isValidField && handleSort(field as keyof Store)}
                        >
                          <div className="flex items-center">
                            {header}
                            {sortField === field && (
                              <span className="ml-2">
                                {sortDirection === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedStores.map(store => (
                    <tr key={store.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {store.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {store.address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <StarIconSolid className="h-5 w-5 text-yellow-400 mr-1" />
                          <span>{store.rating?.toFixed(1) || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          {store.userRating ? (
                            <>
                              <StarIconSolid className="h-5 w-5 text-yellow-400 mr-1" />
                              <span>{store.userRating}</span>
                            </>
                          ) : (
                            <span>Not rated</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          type="button"
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          onClick={() => setSelectedStore(store)}
                        >
                          {store.userRating ? 'Update Rating' : 'Rate Store'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {selectedStore && (
        <RatingModal
          store={selectedStore}
          currentRating={selectedStore.userRating || 0}
          onClose={() => setSelectedStore(null)}
          onSubmit={handleRatingSubmit}
        />
      )}
    </DashboardLayout>
  );
}