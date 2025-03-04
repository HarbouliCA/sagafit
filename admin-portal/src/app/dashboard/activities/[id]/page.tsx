'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, deleteDoc, Firestore } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { Activity } from '@/types';
import { useRouter } from 'next/navigation';
import { TrashIcon } from '@heroicons/react/24/outline';
import PageNavigation from '@/components/ui/PageNavigation';

export default function ActivityDetailPage({ params }: { params: { id: string } }) {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchActivity = async () => {
      if (!firestore) return;

      try {
        const activityDoc = await getDoc(doc(firestore as Firestore, 'activities', params.id));
        
        if (!activityDoc.exists()) {
          setError('Activity not found');
          setLoading(false);
          return;
        }

        setActivity({
          id: activityDoc.id,
          ...activityDoc.data()
        } as Activity);
      } catch (error) {
        console.error('Error fetching activity:', error);
        setError('Failed to load activity');
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [params.id]);

  const handleDelete = async () => {
    if (!firestore || !activity) return;
    
    setIsDeleting(true);
    try {
      await deleteDoc(doc(firestore as Firestore, 'activities', activity.id));
      router.push('/dashboard/activities');
    } catch (error) {
      console.error('Error deleting activity:', error);
      setError('Failed to delete activity');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={() => router.push('/dashboard/activities')}
            className="text-red-700 font-medium hover:text-red-800 mt-2"
          >
            Back to Activities
          </button>
        </div>
      </div>
    );
  }

  if (!activity) return null;

  const actions = (
    <div className="flex items-center space-x-4">
      <button
        onClick={() => setShowDeleteModal(true)}
        className="text-red-400 hover:text-red-600"
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageNavigation
        backUrl="/dashboard/activities"
        backLabel="Back to Activities"
        title={activity.name}
        actions={actions}
      />

      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Activity Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Type</label>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {activity.type}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Duration</label>
                  <div className="mt-1 text-sm text-gray-900">{activity.duration} minutes</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Calories</label>
                  <div className="mt-1 text-sm text-gray-900">{activity.calories} kcal</div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Additional Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Equipment Required</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {activity.equipment?.length ? (
                      <ul className="list-disc list-inside">
                        {activity.equipment.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      'No equipment required'
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Difficulty Level</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      activity.difficulty === 'beginner'
                        ? 'bg-green-100 text-green-800'
                        : activity.difficulty === 'intermediate'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {activity.difficulty}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {activity.description && (
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold mb-4">Description</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{activity.description}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Delete Activity</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {activity.name}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn-danger"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
