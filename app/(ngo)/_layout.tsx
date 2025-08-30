import { Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function NGOLayout() {
  const { user } = useAuth();

  useEffect(() => {
    // Redirect non-NGO users
    if (user && user.role !== 'conservation_ngos') {
      router.replace('/(tabs)');
    }
  }, [user]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="report-details" />
    </Stack>
  );
}
