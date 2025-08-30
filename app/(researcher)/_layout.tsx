import { Stack } from 'expo-router';

export default function ResearcherLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="dashboard" 
        options={{ 
          title: 'Research Dashboard',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#9C27B0',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
      <Stack.Screen 
        name="data" 
        options={{ 
          title: 'Research Data',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#9C27B0',
          },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="analysis" 
        options={{ 
          title: 'Data Analysis',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#9C27B0',
          },
          headerTintColor: '#fff',
        }} 
      />
      <Stack.Screen 
        name="publications" 
        options={{ 
          title: 'Publications',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#9C27B0',
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
            backgroundColor: '#9C27B0',
          },
          headerTintColor: '#fff',
        }} 
      />
    </Stack>
  );
}
