import { Stack } from 'expo-router';

export default function IncidentDetailsLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="[id]" 
        options={{ 
          title: 'Incident Details',
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
