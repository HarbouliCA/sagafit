'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, Firestore } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { Activity } from '@/types';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';

const ACTIVITY_TYPES = {
  kingboxing: 'Kingboxing',
  yoga: 'Yoga',
  musculation: 'Musculation',
  free_access: 'Free Access',
  other: 'Other'
} as const;

type ActivityType = keyof typeof ACTIVITY_TYPES;

const isValidActivityType = (type: string): type is ActivityType => {
  return type in ACTIVITY_TYPES;
};

const formatActivityType = (type: string | undefined): string => {
  if (!type || !isValidActivityType(type)) return 'Other';
  return ACTIVITY_TYPES[type];
};

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only run this effect on the client side
    if (typeof window === 'undefined' || !firestore) return;
    
    const fetchActivities = async () => {
      setLoading(true);
      setError(null);
      try {
        const activitiesQuery = query(
          collection(firestore as Firestore, 'activities'),
          orderBy('name')
        );
        
        const activitiesSnapshot = await getDocs(activitiesQuery);
        
        const fetchedActivities = activitiesSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            type: isValidActivityType(data.type) ? data.type : 'other',
            creditValue: data.creditValue || 0,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          } as Activity;
        });
        
        setActivities(fetchedActivities);
      } catch (error) {
        console.error('Error fetching activities:', error);
        setError('Failed to load activities. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="page-title">Activities</h1>
        <Link 
          href="/activities/create" 
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Add Activity
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity) => (
            <div key={activity.id} className="card overflow-hidden">
              <div className="h-40 bg-gray-200 relative">
                {activity.imageUrl ? (
                  <img 
                    src={activity.imageUrl} 
                    alt={activity.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-200 text-gray-400">
                    No Image
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-primary-600 text-white px-2 py-1 rounded text-sm">
                  {activity.creditValue} Credits
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{activity.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{activity.description}</p>
                
                <div className="flex justify-between items-center">
                  <span className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs capitalize">
                    {formatActivityType(activity.type)}
                  </span>
                  
                  <div className="space-x-2">
                    <Link
                      href={`/activities/${activity.id}`}
                      className="text-primary-600 hover:text-primary-800 text-sm"
                    >
                      View
                    </Link>
                    <Link
                      href={`/activities/${activity.id}/edit`}
                      className="text-primary-600 hover:text-primary-800 text-sm"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {activities.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No activities found. Click "Add Activity" to create your first activity.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
