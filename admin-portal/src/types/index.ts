export type User = {
  uid: string;
  email: string;
  name: string;
  photoURL?: string;
  credits: number;
  role: 'user' | 'trainer' | 'admin';
  memberSince: Date;
  lastActive: Date;
  height?: number; // in cm
  weight?: number; // in kg
  birthday?: Date;
  sex?: 'male' | 'female' | 'other';
  observations?: string;
  fidelityScore?: number;
  onboardingCompleted: boolean;
  accessStatus?: 'green' | 'red';
};

export type Activity = {
  id: string;
  name: string;
  description: string;
  type: 'kingboxing' | 'yoga' | 'musculation' | 'free_access' | 'other';
  creditValue: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Session = {
  id: string;
  activityId: string;
  activityName: string;
  title: string;
  description?: string;
  notes?: string;
  startTime: Date;
  endTime: Date;
  capacity: number;
  bookedCount: number;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    repeatEvery: number; // 1 = every day/week/month, 2 = every other day/week/month, etc.
    endDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
};

export type Booking = {
  id: string;
  userId: string;
  sessionId: string;
  status: 'confirmed' | 'cancelled' | 'attended';
  creditsUsed: number;
  bookedAt: Date;
};

export type Tutorial = {
  id: string;
  name: string;
  section: 'musculation' | 'diete';
  description: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
  // For musculation tutorials
  exercises?: {
    name: string;
    description: string;
    sets: number;
    reps: number;
    restTime: number; // in seconds
    imageUrl?: string;
    videoUrl?: string;
  }[];
  // For diete tutorials
  dietPlans?: {
    name: string;
    description: string;
    mealPlan: {
      mealName: string;
      foods: {
        name: string;
        quantity: string;
        calories: number;
      }[];
    }[];
    duration: number; // in days
    imageUrl?: string;
  }[];
};

export type ForumPost = {
  id: string;
  title: string;
  content: string;
  authorId: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  createdAt: Date;
  updatedAt: Date;
};
