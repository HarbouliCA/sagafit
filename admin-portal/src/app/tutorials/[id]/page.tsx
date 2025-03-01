'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, Firestore } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { Tutorial } from '@/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, PencilIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function TutorialDetailPage({ params }: { params: { id: string } }) {
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Only run this effect on the client side
    if (typeof window === 'undefined' || !firestore) return;
    
    const fetchTutorial = async () => {
      setLoading(true);
      try {
        const tutorialDoc = await getDoc(doc(firestore as Firestore, 'tutorials', params.id));
        
        if (!tutorialDoc.exists()) {
          setError('Tutorial not found');
          setTutorial(null);
          return;
        }
        
        const data = tutorialDoc.data();
        setTutorial({
          ...data,
          id: tutorialDoc.id,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as Tutorial);
        
      } catch (error: any) {
        console.error('Error fetching tutorial:', error);
        setError(error.message || 'Failed to fetch tutorial');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTutorial();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error || !tutorial) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || 'Tutorial not found'}
        </div>
        <Link href="/tutorials" className="text-primary-600 hover:text-primary-700">
          ← Back to Tutorials
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/tutorials" className="text-primary-600 hover:text-primary-700 flex items-center">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Tutorials
        </Link>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="h-64 bg-gray-200 relative">
          {tutorial.imageUrl ? (
            <img 
              src={tutorial.imageUrl} 
              alt={tutorial.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No image
            </div>
          )}
          <div className="absolute top-4 right-4 bg-primary-600 text-white px-3 py-1 rounded-full">
            {tutorial.section === 'musculation' ? 'Musculation' : 'Diete'}
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold">{tutorial.name}</h1>
            <Link 
              href={`/tutorials/${tutorial.id}/edit`}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md flex items-center text-sm"
            >
              <PencilIcon className="h-4 w-4 mr-1" />
              Edit
            </Link>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{tutorial.description}</p>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            {tutorial.section === 'musculation' ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Exercises</h2>
                  <Link 
                    href={`/tutorials/${tutorial.id}/exercises/add`}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded-md flex items-center text-sm"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Exercise
                  </Link>
                </div>
                
                {tutorial.exercises && tutorial.exercises.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tutorial.exercises.map((exercise, index) => (
                      <div key={index} className="border border-gray-200 rounded-md p-4">
                        <h3 className="font-semibold mb-2">{exercise.name}</h3>
                        <p className="text-gray-600 text-sm mb-3">{exercise.description}</p>
                        
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="bg-gray-50 p-2 rounded">
                            <span className="font-medium">Sets:</span> {exercise.sets}
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <span className="font-medium">Reps:</span> {exercise.reps}
                          </div>
                          <div className="bg-gray-50 p-2 rounded">
                            <span className="font-medium">Rest:</span> {exercise.restTime}s
                          </div>
                        </div>
                        
                        {exercise.imageUrl && (
                          <div className="mt-3 h-32 bg-gray-100">
                            <img 
                              src={exercise.imageUrl} 
                              alt={exercise.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-md">
                    <p className="text-gray-500">No exercises added yet.</p>
                    <p className="text-gray-500 text-sm mt-1">Click the "Add Exercise" button to add exercises to this tutorial.</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Diet Plans</h2>
                  <Link 
                    href={`/tutorials/${tutorial.id}/diet-plans/add`}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded-md flex items-center text-sm"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Diet Plan
                  </Link>
                </div>
                
                {tutorial.dietPlans && tutorial.dietPlans.length > 0 ? (
                  <div className="space-y-6">
                    {tutorial.dietPlans.map((plan, index) => (
                      <div key={index} className="border border-gray-200 rounded-md p-4">
                        <h3 className="font-semibold mb-2">{plan.name}</h3>
                        <p className="text-gray-600 text-sm mb-3">{plan.description}</p>
                        
                        <div className="mb-3 text-sm">
                          <span className="font-medium">Duration:</span> {plan.duration} days
                        </div>
                        
                        <h4 className="font-medium text-sm mb-2">Meal Plan:</h4>
                        <div className="space-y-3">
                          {plan.mealPlan.map((meal, mealIndex) => (
                            <div key={mealIndex} className="bg-gray-50 p-3 rounded">
                              <h5 className="font-medium text-sm mb-2">{meal.mealName}</h5>
                              <ul className="text-sm space-y-1">
                                {meal.foods.map((food, foodIndex) => (
                                  <li key={foodIndex} className="flex justify-between">
                                    <span>{food.name} ({food.quantity})</span>
                                    <span className="text-gray-500">{food.calories} cal</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                        
                        {plan.imageUrl && (
                          <div className="mt-3 h-32 bg-gray-100">
                            <img 
                              src={plan.imageUrl} 
                              alt={plan.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-md">
                    <p className="text-gray-500">No diet plans added yet.</p>
                    <p className="text-gray-500 text-sm mt-1">Click the "Add Diet Plan" button to add diet plans to this tutorial.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
