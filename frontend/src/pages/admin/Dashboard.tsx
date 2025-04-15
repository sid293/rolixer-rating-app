import { useEffect, useState, Fragment } from 'react';
// import { DashboardStats, User, Store, Rating } from '../../types';
import { DashboardStats } from '../../types';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { UserGroupIcon, BuildingStorefrontIcon, StarIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  description: string;
  onClick: () => void;
}

function StatsCard({ title, value, icon: Icon, description, onClick }: StatsCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3">
        <div className="text-sm">
          <span className="text-gray-500">{description}</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalData, setModalData] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  // const [newUser, setNewUser] = useState({
  //   name: '',
  //   email: '',
  //   password: '',
  //   address: '',
  //   role: 'USER'
  // });

  const registerSchema = z.object({
    name: z
      .string()
      .min(20, 'Name must be at least 20 characters')
      .max(60, 'Name must not exceed 60 characters'),
    email: z.string().email('Invalid email format'),
    address: z.string().max(400, 'Address must not exceed 400 characters'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(16, 'Password must not exceed 16 characters')
      .regex(
        /^(?=.*[A-Z])(?=.*[!@#$%^&*])/,
        'Password must contain at least one uppercase letter and one special character'
      ),
    role: z.enum(['USER', 'ADMIN', 'STORE_OWNER'])
  });

  type RegisterFormData = z.infer<typeof registerSchema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'USER'
    }
  });

  const fetchDetailData = async (endpoint: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')!).token : ''}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${endpoint}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Failed to fetch ${endpoint}:`, error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = async (type: 'users' | 'stores' | 'ratings') => {
    let title = '';
    let endpoint = '';

    switch (type) {
      case 'users':
        title = 'All Users';
        endpoint = '/api/admin/users';
        break;
      case 'stores':
        title = 'All Stores';
        endpoint = '/api/admin/stores';
        break;
      case 'ratings':
        title = 'All Ratings';
        endpoint = '/api/admin/ratings';
        break;
    }

    setModalTitle(title);
    setModalOpen(true);
    // console.log("request to endpoint");
    const data = await fetchDetailData(endpoint);
    // console.log("data fetched: ",data);
    setModalData(data.data || []); // Set the data from the response
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // console.log("fetchstats request to api/admin/stats")
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/stats`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')!).token : ''}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }

        const data = await response.json();
        // console.log("data: ",data)
        setStats(data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  const statsCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: UserGroupIcon,
      description: 'Click to view all users',
      onClick: () => handleCardClick('users'),
    },
    {
      title: 'Total Stores',
      value: stats.totalStores,
      icon: BuildingStorefrontIcon,
      description: 'Click to view all stores',
      onClick: () => handleCardClick('stores'),
    },
    {
      title: 'Total Ratings',
      value: stats.totalRatings,
      icon: StarIcon,
      description: 'Click to view all ratings',
      onClick: () => handleCardClick('ratings'),
    },
  ];

  const renderModalContent = () => {
    if (loading) {
      return <div className="text-center py-4">Loading...</div>;
    }

    if (!modalData.length) {
      return <div className="text-center py-4">No data available</div>;
    }

    const renderTableHeaders = () => {
      if (modalTitle === 'All Stores') {
        return ['Name', 'Email', 'Address', 'Average Rating'].map((header) => (
          <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            {header}
          </th>
        ));
      }
      if (modalTitle === 'All Ratings') {
        return ['User', 'Store', 'Rating', 'Date'].map((header) => (
          <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            {header}
          </th>
        ));
      }
      return Object.keys(modalData[0]).map((header) => (
        <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          {header}
        </th>
      ));
    };

    const renderTableCell = (item: any) => {
      if (modalTitle === 'All Stores') {
        return (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.name}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.email}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.address}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{typeof item.averageRating === 'number' ? item.averageRating.toFixed(1) : '0.0'}</td>
          </>
        );
      }
      if (modalTitle === 'All Ratings') {
        return (
          <>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.user.name}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.store.name}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.rating}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</td>
          </>
        );
      }
      return Object.values(item).map((value: any, cellIndex: number) => (
        <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {typeof value === 'object' ? JSON.stringify(value) : value}
        </td>
      ));
    };

    const handleDeleteUser = async (userId: number) => {
      if (!confirm('Are you sure you want to delete this user?')) return;
      
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')!).token : ''}`
          }
        });
    
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete user');
        }
    
        // Update the UI by removing the deleted user
        setModalData(modalData.filter(user => user.id !== userId));
        
        // Fetch fresh stats to update the dashboard
        const statsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/stats`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')!).token : ''}`
          }
        });
    
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.data);
        }
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert(error instanceof Error ? error.message : 'Failed to delete user');
      }
    };

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {renderTableHeaders()}
              {modalTitle === 'All Users' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {modalData.map((item, index) => (
              <tr key={index}>
                {renderTableCell(item)}
                {modalTitle === 'All Users' && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleDeleteUser(item.id)}
                      className="text-red-600 hover:text-red-900 focus:outline-none"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {statsCards.map((card) => (
                <StatsCard key={card.title} {...card} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <Transition.Root show={modalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setModalOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-5xl sm:p-6">
                  <div className="absolute right-0 top-0 pr-4 pt-4">
                    <button
                      type="button"
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      onClick={() => setModalOpen(false)}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                      <div className="flex justify-between items-center mb-4">
                        <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                          {modalTitle}
                        </Dialog.Title>

                      </div>
                      <div className="mt-4">
                        {showAddUserForm ? (
                          <form className="space-y-4" onSubmit={handleSubmit(async (data) => {
                            try {
                              const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/register`, {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')!).token : ''}`
                                },
                                body: JSON.stringify({
                                  ...data,
                                  store: data.role === 'STORE_OWNER' ? {
                                    name: `${data.name}'s Store`,
                                    email: data.email,
                                    address: data.address
                                  } : undefined
                                })
                              });

                              if (!response.ok) {
                                const errorData = await response.json();
                                throw new Error(errorData.message || 'Failed to create user');
                              }
                              
                              const updatedData = await fetchDetailData('/api/admin/users');
                              setModalData(updatedData);
                              setShowAddUserForm(false);
                              reset();
                              alert('User' + (data.role === 'STORE_OWNER' ? ' and store' : '') + ' created successfully');
                            } catch (error) {
                              console.error('Failed to create user:', error);
                              alert(error instanceof Error ? error.message : 'Failed to create user');
                            }
                          })}>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Name</label>
                              <input
                                type="text"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                {...register('name')}
                              />
                              {errors.name && (
                                <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Email</label>
                              <input
                                type="email"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                {...register('email')}
                              />
                              {errors.email && (
                                <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Password</label>
                              <input
                                type="password"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                {...register('password')}
                              />
                              {errors.password && (
                                <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Address</label>
                              <input
                                type="text"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                {...register('address')}
                              />
                              {errors.address && (
                                <p className="mt-2 text-sm text-red-600">{errors.address.message}</p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Role</label>
                              <select
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                {...register('role')}
                              >
                                <option value="USER">User</option>
                                <option value="ADMIN">Admin</option>
                                <option value="STORE_OWNER">Store Owner</option>
                              </select>
                              {errors.role && (
                                <p className="mt-2 text-sm text-red-600">{errors.role.message}</p>
                              )}
                            </div>
                            <div className="flex justify-end space-x-3 mt-6">
                              <button
                                type="button"
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                onClick={() => setShowAddUserForm(false)}
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                              >
                                Create User
                              </button>
                            </div>
                          </form>
                        ) : (
                          <>
                            {modalTitle === 'All Users' && (
                              <div className="flex justify-center mb-4">
                                <button
                                  type="button"
                                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                  onClick={() => setShowAddUserForm(true)}
                                >
                                  Add User
                                </button>
                              </div>
                            )}
                            {renderModalContent()}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </DashboardLayout>
  );
}