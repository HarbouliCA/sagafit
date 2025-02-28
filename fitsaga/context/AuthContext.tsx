import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { auth, firestore } from '../config/firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';

// Define types
type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

type UserProfile = {
  uid: string;
  email: string;
  name: string;
  photoURL?: string;
  credits: number;
  role: 'user' | 'trainer' | 'admin';
  memberSince: Date;
  lastActive: Date;
};

type AuthContextType = {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<UserProfile | null>;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for cached user on startup
  useEffect(() => {
    const loadCachedUser = async () => {
      try {
        const cachedUserJson = await AsyncStorage.getItem('user');
        if (cachedUserJson) {
          const cachedUser = JSON.parse(cachedUserJson);
          setCurrentUser(cachedUser);
          // If we have a cached user, fetch their profile
          if (cachedUser && cachedUser.uid) {
            await fetchUserProfile(cachedUser.uid);
          }
        }
      } catch (error) {
        console.error('Error loading cached user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCachedUser();
  }, []);

  // Fetch user profile from Firestore
  const fetchUserProfile = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(firestore, 'users', uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        await setUserProfile(userData);
        return userData;
      } else {
        console.log('User profile not found in Firestore');
        return null;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Refresh user profile
  const refreshUserProfile = async () => {
    if (!currentUser) return null;
    return await fetchUserProfile(currentUser.uid);
  };

  // Handle user authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      
      if (user) {
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        };
        
        setCurrentUser(userData);
        
        // Cache user data in AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        
        // Get user profile from Firestore
        await fetchUserProfile(user.uid);
        
        // Update last active timestamp
        try {
          await updateDoc(doc(firestore, 'users', user.uid), {
            lastActive: serverTimestamp()
          });
        } catch (error) {
          console.error('Error updating last active timestamp:', error);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        // Clear cached user data
        await AsyncStorage.removeItem('user');
      }
      
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await fetchUserProfile(userCredential.user.uid);
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Failed to login. Please try again.';
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'User not found.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      }
      
      Alert.alert('Login Error', errorMessage);
      throw error;
    }
  };

  // Register function
  const register = async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      const newUser: UserProfile = {
        uid: userCredential.user.uid,
        email: email,
        name: name,
        credits: 100, // Starting credits
        role: 'user',
        memberSince: new Date(),
        lastActive: new Date(),
      };
      
      await setDoc(doc(firestore, 'users', userCredential.user.uid), newUser);
      
      // Update user display name in Firestore instead of auth profile
      await setUserProfile(newUser);
      
      // Set current user
      setCurrentUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: name,
        photoURL: null,
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Failed to register. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already in use';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      }
      
      Alert.alert('Registration Error', errorMessage);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      await AsyncStorage.removeItem('user');
      setCurrentUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Logout Error', 'Failed to logout. Please try again.');
      throw error;
    }
  };

  const value = {
    currentUser,
    userProfile,
    isLoading,
    login,
    register,
    logout,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Create custom hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
