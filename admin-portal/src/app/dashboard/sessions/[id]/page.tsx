'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, deleteDoc, Firestore } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { Session } from '@/types';
import { useRouter } from 'next/navigation';
import { TrashIcon } from '@heroicons/react/24/outline';
import PageNavigation from '@/components/ui/PageNavigation';

export default function SessionDetailPage({ params }: { params: { id: string } }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      if (!firestore) return;

      try {
        const sessionDoc = await getDoc(doc(firestore as Firestore, 'sessions', params.id));
        
        if (!sessionDoc.exists()) {
          setError('Session not found');
          setLoading(false);
          return;
        }

        setSession({
          id: sessionDoc.id,
          ...sessionDoc.data()
        } as Session);
      } catch (error) {
        console.error('Error fetching session:', error);
        setError('Failed to load session');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [params.id]);

  const handleDelete = async () => {
    if (!firestore || !session) return;
    
    setIsDeleting(true);
    try {
      await deleteDoc(doc(firestore as Firestore, 'sessions', session.id));
      router.push('/dashboard/sessions');
    } catch (error) {
      console.error('Error deleting session:', error);
      setError('Failed to delete session');
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
            onClick={() => router.push('/dashboard/sessions')}
            className="text-red-700 font-medium hover:text-red-800 mt-2"
          >
            Back to Sessions
          </button>
        </div>
      </div>
    );
  }

  if (!session) return null;

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
        backUrl="/dashboard/sessions"
        backLabel="Back to Sessions"
        title={`Session ${session.id}`}
        actions={actions}
      />

      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Session Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">User</label>
                  <div className="mt-1 text-sm text-gray-900">{session.userId}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Activity</label>
                  <div className="mt-1 text-sm text-gray-900">{session.activityId}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Duration</label>
                  <div className="mt-1 text-sm text-gray-900">{session.duration} minutes</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Start Time</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {session.startTime?.toDate().toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Performance Data</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Calories Burned</label>
                  <div className="mt-1 text-sm text-gray-900">{session.caloriesBurned} kcal</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Average Heart Rate</label>
                  <div className="mt-1 text-sm text-gray-900">{session.avgHeartRate} bpm</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Intensity Level</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      session.intensityLevel === 'low'
                        ? 'bg-green-100 text-green-800'
                        : session.intensityLevel === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {session.intensityLevel}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {session.notes && (
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold mb-4">Notes</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{session.notes}</p>
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
            <h2 className="text-xl font-bold mb-4">Delete Session</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this session? This action cannot be undone.
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
