import { useState, useEffect } from 'react';
import { User, Rating } from '../../types';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { StarIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';

interface StoreStats {
  averageRating: number;
  totalRatings: number;
}

interface UserRating extends Rating {
  user: User;
}

export default function StoreOwnerDashboard() {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<StoreStats>({
    averageRating: 0,
    totalRatings: 0,
  });
  const [userRatings, setUserRatings] = useState<UserRating[]>([]);
  const [sortField, setSortField] = useState<keyof (Rating & { userName: string })>('rating');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStoreStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch store details including ratings
        const storeResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/stores/${user?.email}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log("store response: ",storeResponse)
        if (!storeResponse.ok) {
          throw new Error('Failed to fetch store data');
        }

        const storeData = await storeResponse.json();
        const ratings = storeData.data.store.ratings;

        // Calculate stats
        const totalRatings = ratings.length;
        const averageRating = totalRatings > 0
          ? ratings.reduce((acc: number, curr: Rating) => acc + curr.rating, 0) / totalRatings
          : 0;

        setStats({
          averageRating,
          totalRatings,
        });

        // Format ratings with user data
        const formattedRatings = ratings.map((rating: any) => ({
          ...rating,
          user: rating.user
        }));

        setUserRatings(formattedRatings);
      } catch (error) {
        console.error('Failed to fetch store stats:', error);
        setError('Failed to load store data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchStoreStats();
  }, [token]);

  const handleSort = (field: keyof (Rating & { userName: string })) => {
    if (field === sortField) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedRatings = [...userRatings].sort((a, b) => {
    let aValue: any = a[sortField as keyof Rating];
    let bValue: any = b[sortField as keyof Rating];

    if (sortField === 'userName') {
      aValue = a.user.name;
      bValue = b.user.name;
    }

    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
    }
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">{error}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Store Dashboard</h1>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <div className="py-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <StarIcon className="h-6 w-6 text-yellow-400" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Average Rating
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {stats.averageRating.toFixed(1)}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <StarIcon className="h-6 w-6 text-yellow-400" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total Ratings
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {stats.totalRatings}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ratings Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      { key: 'userName', label: 'User Name' },
                      { key: 'rating', label: 'Rating' },
                      { key: 'createdAt', label: 'Submitted Date' },
                    ].map(({ key, label }) => (
                      <th
                        key={key}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                        onClick={() => handleSort(key as keyof (Rating & { userName: string }))}
                      >
                        <div className="flex items-center">
                          {label}
                          {sortField === key && (
                            <span className="ml-2">
                              {sortDirection === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedRatings.map(({ id, user, rating, createdAt }) => (
                    <tr key={id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <StarIcon className="h-5 w-5 text-yellow-400 mr-1" />
                          <span>{rating}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}