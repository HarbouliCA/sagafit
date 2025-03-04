'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, Firestore } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Activity } from '@/types';

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!firestore) return;
      
      try {
        const activitiesQuery = query(
          collection(firestore as Firestore, 'activities'),
          orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(activitiesQuery);
        const fetchedActivities = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Activity));
        
        setActivities(fetchedActivities);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
        <Link 
          href="/dashboard/activities/create" 
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Add Activity
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No activities found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{activity.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {activity.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activity.duration} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/dashboard/activities/${activity.id}`}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        View
                      </Link>
                      <Link
                        href={`/dashboard/activities/${activity.id}/edit`}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
