import React, { useState, useEffect } from 'react';
import { StyleSheet, Image, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { TextInput } from '../components/ui/TextInput';
import { Button } from '../components/ui/Button';

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const { login, register } = useAuth();

  // Check for pending actions when the component mounts
  useEffect(() => {
    const checkPendingActions = async () => {
      try {
        const pendingLikePostId = await AsyncStorage.getItem('pendingLikePostId');
        if (pendingLikePostId) {
          setPendingAction('like');
        }
      } catch (error) {
        console.error('Error checking pending actions:', error);
      }
    };

    checkPendingActions();
  }, []);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!isLogin && !name) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name);
      }

      // Handle any pending actions
      if (pendingAction === 'like') {
        const pendingLikePostId = await AsyncStorage.getItem('pendingLikePostId');
        if (pendingLikePostId) {
          // Clear the pending action
          await AsyncStorage.removeItem('pendingLikePostId');
          // Navigate back to the forum with the post ID
          router.replace({
            pathname: '/(tabs)/forum',
            params: { postId: pendingLikePostId }
          });
          return;
        }
      }

      // Default navigation if no pending actions
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert(
        'Authentication Error',
        error.message || 'Failed to authenticate. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <LinearGradient
      colors={['#000000', '#1A3A40']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.contentContainer}>
          <Image
            source={require('../assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          
          <ThemedView style={styles.formContainer}>
            <ThemedText type="title" style={styles.title}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </ThemedText>
            
            {!isLogin && (
              <TextInput
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                style={styles.input}
                autoCapitalize="words"
              />
            )}
            
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry
            />
            
            <Button
              title={isLogin ? 'Login' : 'Sign Up'}
              onPress={handleAuth}
              style={styles.button}
              loading={loading}
            />
            
            <TouchableOpacity onPress={toggleAuthMode} style={styles.toggleButton}>
              <ThemedText style={styles.toggleText}>
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 30,
  },
  formContainer: {
    width: '100%',
    padding: 20,
    borderRadius: 10,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
  },
  toggleButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleText: {
    textAlign: 'center',
  },
});
