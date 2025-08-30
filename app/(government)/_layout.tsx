import { Stack } from 'expo-router';

export default function GovernmentLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="dashboard" 
        options={{ 
          title: 'Government Dashboard',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#2E8B57',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
      <Stack.Screen 
        name="reports" 
        options={{ 
          title: 'Incident Reports',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#2E8B57',
          },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="analytics" 
        options={{ 
          title: 'Analytics & Statistics',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#2E8B57',
          },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          title: 'Settings',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#2E8B57',
          },
          headerTintColor: '#fff',
        }} 
      />
    </Stack>
  );
}
