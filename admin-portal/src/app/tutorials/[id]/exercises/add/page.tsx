'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { doc, getDoc, updateDoc, arrayUnion, Firestore } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { Tutorial } from '@/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import ImageUploader from '@/components/ui/ImageUploader';

type FormValues = {
  name: string;
  description: string;
  sets: number;
  reps: number;
  restTime: number;
  videoUrl?: string;
};

export default function AddExercisePage({ params }: { params: { id: string } }) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Only run this effect on the client side
    if (typeof window === 'undefined' || !firestore) return;
    
    const fetchTutorial = async () => {
      try {
        const tutorialDoc = await getDoc(doc(firestore as Firestore, 'tutorials', params.id));
        
        if (!tutorialDoc.exists()) {
          setError('Tutorial not found');
          return;
        }
        
        const data = tutorialDoc.data();
        const tutorialData = {
          ...data,
          id: tutorialDoc.id,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as Tutorial;
        
        // Check if this is a musculation tutorial
        if (tutorialData.section !== 'musculation') {
          setError('This tutorial does not support exercises');
          return;
        }
        
        setTutorial(tutorialData);
        
      } catch (error: any) {
        console.error('Error fetching tutorial:', error);
        setError(error.message || 'Failed to fetch tutorial');
      }
    };
    
    fetchTutorial();
  }, [params.id]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsSubmitting(true);
    setError('');

    try {
      if (!firestore) {
        throw new Error('Firebase services not initialized');
      }
      
      // Create exercise object
      const exercise = {
        name: data.name,
        description: data.description,
        sets: Number(data.sets),
        reps: Number(data.reps),
        restTime: Number(data.restTime),
        imageUrl: imageUrl || null,
        videoUrl: data.videoUrl || null
      };
      
      // Add exercise to tutorial
      await updateDoc(doc(firestore as Firestore, 'tutorials', params.id), {
        exercises: arrayUnion(exercise)
      });
      
      router.push(`/tutorials/${params.id}`);
      
    } catch (error: any) {
      console.error('Error adding exercise:', error);
      setError(error.message || 'Failed to add exercise');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUploaded = (url: string) => {
    setImageUrl(url);
  };

  const handleImageError = (errorMessage: string) => {
    setError(`Image upload error: ${errorMessage}`);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <Link href={`/tutorials/${params.id}`} className="text-primary-600 hover:text-primary-700">
          ← Back to Tutorial
        </Link>
      </div>
    );
  }

  if (!tutorial) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/tutorials/${params.id}`} className="text-primary-600 hover:text-primary-700 flex items-center">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Tutorial
        </Link>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Add Exercise</h1>
        <p className="text-gray-600 mb-6">Adding exercise to: {tutorial.name}</p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded-lg p-6">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Exercise Name
            </label>
            <input
              id="name"
              type="text"
              {...register('name', { required: 'Exercise name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter exercise name"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              {...register('description', { required: 'Description is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              rows={3}
              placeholder="Enter exercise description"
            ></textarea>
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="sets">
                Sets
              </label>
              <input
                id="sets"
                type="number"
                min="1"
                {...register('sets', { 
                  required: 'Sets is required',
                  min: { value: 1, message: 'Minimum 1 set' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.sets && (
                <p className="text-red-500 text-xs mt-1">{errors.sets.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reps">
                Reps
              </label>
              <input
                id="reps"
                type="number"
                min="1"
                {...register('reps', { 
                  required: 'Reps is required',
                  min: { value: 1, message: 'Minimum 1 rep' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.reps && (
                <p className="text-red-500 text-xs mt-1">{errors.reps.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="restTime">
                Rest Time (seconds)
              </label>
              <input
                id="restTime"
                type="number"
                min="0"
                {...register('restTime', { 
                  required: 'Rest time is required',
                  min: { value: 0, message: 'Minimum 0 seconds' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.restTime && (
                <p className="text-red-500 text-xs mt-1">{errors.restTime.message}</p>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image">
              Exercise Image
            </label>
            <ImageUploader 
              folder="tutorials/exercises"
              onImageUploaded={handleImageUploaded}
              onError={handleImageError}
            />
            <p className="text-gray-500 text-xs mt-1">
              Upload an image for the exercise (optional).
            </p>
            {imageUrl && (
              <div className="mt-2">
                <p className="text-green-500 text-xs">Image uploaded successfully!</p>
                <img 
                  src={imageUrl} 
                  alt="Exercise preview" 
                  className="mt-2 h-40 w-auto object-cover rounded"
                />
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="videoUrl">
              Video URL (optional)
            </label>
            <input
              id="videoUrl"
              type="url"
              {...register('videoUrl')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="https://example.com/video"
            />
            <p className="text-gray-500 text-xs mt-1">
              Enter a URL to a video demonstrating the exercise (YouTube, Vimeo, etc.).
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
            >
              {isSubmitting ? 'Adding...' : 'Add Exercise'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
