'use client';

import { useState } from 'react';
import { collection, addDoc, Firestore } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { Session } from '@/types';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import PageNavigation from '@/components/ui/PageNavigation';

type FormData = Omit<Session, 'id'>;

export default function CreateSessionPage() {
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    if (!firestore) return;
    
    setSaving(true);
    try {
      const newSession = {
        ...data,
        startTime: new Date(),
        duration: Number(data.duration),
        caloriesBurned: Number(data.caloriesBurned),
        avgHeartRate: Number(data.avgHeartRate)
      };

      const docRef = await addDoc(collection(firestore as Firestore, 'sessions'), newSession);
      router.push(`/dashboard/sessions/${docRef.id}`);
    } catch (error) {
      console.error('Error creating session:', error);
      setError('Failed to create session');
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageNavigation
        backUrl="/dashboard/sessions"
        backLabel="Back to Sessions"
        title="Create Session"
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">User ID</label>
                <input
                  type="text"
                  {...register('userId', { required: 'User ID is required' })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                {errors.userId && (
                  <p className="mt-1 text-sm text-red-600">{errors.userId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Activity ID</label>
                <input
                  type="text"
                  {...register('activityId', { required: 'Activity ID is required' })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                {errors.activityId && (
                  <p className="mt-1 text-sm text-red-600">{errors.activityId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                <input
                  type="number"
                  {...register('duration', { 
                    required: 'Duration is required',
                    min: { value: 1, message: 'Duration must be at least 1 minute' }
                  })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                {errors.duration && (
                  <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Calories Burned</label>
                <input
                  type="number"
                  {...register('caloriesBurned', { 
                    required: 'Calories burned is required',
                    min: { value: 0, message: 'Calories burned cannot be negative' }
                  })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                {errors.caloriesBurned && (
                  <p className="mt-1 text-sm text-red-600">{errors.caloriesBurned.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Average Heart Rate</label>
                <input
                  type="number"
                  {...register('avgHeartRate', { 
                    min: { value: 0, message: 'Heart rate cannot be negative' }
                  })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
                {errors.avgHeartRate && (
                  <p className="mt-1 text-sm text-red-600">{errors.avgHeartRate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Intensity Level</label>
                <select
                  {...register('intensityLevel')}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">Select intensity</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                {...register('notes')}
                rows={4}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
              >
                {saving ? 'Creating...' : 'Create Session'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
