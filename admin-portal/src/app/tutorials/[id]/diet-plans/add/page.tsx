'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form';
import { doc, getDoc, updateDoc, arrayUnion, Firestore } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { Tutorial } from '@/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import ImageUploader from '@/components/ui/ImageUploader';

type Food = {
  name: string;
  quantity: string;
  calories: number;
};

type Meal = {
  mealName: string;
  foods: Food[];
};

type FormValues = {
  name: string;
  description: string;
  duration: number;
  mealPlan: Meal[];
};

export default function AddDietPlanPage({ params }: { params: { id: string } }) {
  const { register, control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      mealPlan: [{ mealName: 'Breakfast', foods: [{ name: '', quantity: '', calories: 0 }] }]
    }
  });
  
  const { fields: mealFields, append: appendMeal, remove: removeMeal } = useFieldArray({
    control,
    name: 'mealPlan'
  });
  
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
        
        // Check if this is a diete tutorial
        if (tutorialData.section !== 'diete') {
          setError('This tutorial does not support diet plans');
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
      
      // Create diet plan object
      const dietPlan = {
        name: data.name,
        description: data.description,
        duration: Number(data.duration),
        mealPlan: data.mealPlan.map(meal => ({
          ...meal,
          foods: meal.foods.map(food => ({
            ...food,
            calories: Number(food.calories)
          }))
        })),
        imageUrl: imageUrl || null
      };
      
      // Add diet plan to tutorial
      await updateDoc(doc(firestore as Firestore, 'tutorials', params.id), {
        dietPlans: arrayUnion(dietPlan)
      });
      
      router.push(`/tutorials/${params.id}`);
      
    } catch (error: any) {
      console.error('Error adding diet plan:', error);
      setError(error.message || 'Failed to add diet plan');
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
      
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Add Diet Plan</h1>
        <p className="text-gray-600 mb-6">Adding diet plan to: {tutorial.name}</p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-md rounded-lg p-6">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Diet Plan Name
            </label>
            <input
              id="name"
              type="text"
              {...register('name', { required: 'Diet plan name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter diet plan name"
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
              placeholder="Enter diet plan description"
            ></textarea>
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="duration">
              Duration (days)
            </label>
            <input
              id="duration"
              type="number"
              min="1"
              {...register('duration', { 
                required: 'Duration is required',
                min: { value: 1, message: 'Minimum 1 day' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.duration && (
              <p className="text-red-500 text-xs mt-1">{errors.duration.message}</p>
            )}
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image">
              Diet Plan Image
            </label>
            <ImageUploader 
              folder="tutorials/diet-plans"
              onImageUploaded={handleImageUploaded}
              onError={handleImageError}
            />
            <p className="text-gray-500 text-xs mt-1">
              Upload an image for the diet plan (optional).
            </p>
            {imageUrl && (
              <div className="mt-2">
                <p className="text-green-500 text-xs">Image uploaded successfully!</p>
                <img 
                  src={imageUrl} 
                  alt="Diet plan preview" 
                  className="mt-2 h-40 w-auto object-cover rounded"
                />
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Meal Plan</h3>
              <button
                type="button"
                onClick={() => appendMeal({ mealName: '', foods: [{ name: '', quantity: '', calories: 0 }] })}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md flex items-center text-sm"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Meal
              </button>
            </div>
            
            <div className="space-y-6">
              {mealFields.map((meal, mealIndex) => (
                <div key={meal.id} className="border border-gray-200 rounded-md p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex-1 mr-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`mealPlan.${mealIndex}.mealName`}>
                        Meal Name
                      </label>
                      <input
                        id={`mealPlan.${mealIndex}.mealName`}
                        type="text"
                        {...register(`mealPlan.${mealIndex}.mealName` as const, { required: 'Meal name is required' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="e.g., Breakfast, Lunch, Dinner"
                      />
                    </div>
                    
                    {mealIndex > 0 && (
                      <button
                        type="button"
                        onClick={() => removeMeal(mealIndex)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-semibold">Foods</h4>
                      <button
                        type="button"
                        onClick={() => {
                          const foods = [...meal.foods, { name: '', quantity: '', calories: 0 }];
                          // This is a workaround since useFieldArray doesn't directly support nested arrays
                          const newMealPlan = [...mealFields];
                          newMealPlan[mealIndex] = { ...meal, foods };
                          removeMeal(mealIndex);
                          appendMeal({ mealName: meal.mealName, foods });
                        }}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded flex items-center"
                      >
                        <PlusIcon className="h-3 w-3 mr-1" />
                        Add Food
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {meal.foods.map((food, foodIndex) => (
                        <div key={foodIndex} className="grid grid-cols-12 gap-2">
                          <div className="col-span-5">
                            <input
                              type="text"
                              {...register(`mealPlan.${mealIndex}.foods.${foodIndex}.name` as const, { required: 'Required' })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                              placeholder="Food name"
                            />
                          </div>
                          <div className="col-span-4">
                            <input
                              type="text"
                              {...register(`mealPlan.${mealIndex}.foods.${foodIndex}.quantity` as const, { required: 'Required' })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                              placeholder="Quantity"
                            />
                          </div>
                          <div className="col-span-3">
                            <input
                              type="number"
                              min="0"
                              {...register(`mealPlan.${mealIndex}.foods.${foodIndex}.calories` as const, { 
                                required: 'Required',
                                min: { value: 0, message: 'Min 0' }
                              })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                              placeholder="Calories"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
              {isSubmitting ? 'Adding...' : 'Add Diet Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
