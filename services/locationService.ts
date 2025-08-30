import * as Location from 'expo-location';

export interface LocationInfo {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address: string;
  city: string;
  state: string;
  country: string;
  fullAddress: string;
}

/**
 * Convert GPS coordinates to readable address
 */
export const getAddressFromCoordinates = async (
  latitude: number,
  longitude: number
): Promise<LocationInfo> => {
  try {
    // Request reverse geocoding
    const reverseGeocodeResult = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (reverseGeocodeResult.length > 0) {
      const location = reverseGeocodeResult[0];
      
      // Build address components
      const street = location.street || '';
      const city = location.city || location.subregion || 'Unknown City';
      const state = location.region || '';
      const country = location.country || '';
      const postalCode = location.postalCode || '';
      
      // Create readable address
      let address = '';
      if (street) address += street;
      if (city && city !== 'Unknown City') address += address ? `, ${city}` : city;
      if (state) address += address ? `, ${state}` : state;
      if (postalCode) address += address ? ` ${postalCode}` : postalCode;
      if (country) address += address ? `, ${country}` : country;
      
      // Fallback if no address found
      if (!address) {
        address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      }
      
      return {
        coordinates: { latitude, longitude },
        address: street,
        city,
        state,
        country,
        fullAddress: address,
      };
    }
    
    // Fallback if reverse geocoding fails
    return {
      coordinates: { latitude, longitude },
      address: '',
      city: 'Unknown Location',
      state: '',
      country: '',
      fullAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
    };
  } catch (error) {
    console.error('Error getting address from coordinates:', error);
    
    // Return coordinates as fallback
    return {
      coordinates: { latitude, longitude },
      address: '',
      city: 'Location Error',
      state: '',
      country: '',
      fullAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
    };
  }
};

/**
 * Get current location with address
 */
export const getCurrentLocationWithAddress = async (): Promise<LocationInfo> => {
  try {
    // Request location permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission denied');
    }

    // Get current position
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      maximumAge: 10000,
    });

    const { latitude, longitude } = location.coords;
    
    // Get address from coordinates
    return await getAddressFromCoordinates(latitude, longitude);
  } catch (error) {
    console.error('Error getting current location:', error);
    throw error;
  }
};

/**
 * Format coordinates for display
 */
export const formatCoordinates = (latitude: number, longitude: number): string => {
  const lat = latitude >= 0 ? `${latitude.toFixed(6)}°N` : `${Math.abs(latitude).toFixed(6)}°S`;
  const lng = longitude >= 0 ? `${longitude.toFixed(6)}°E` : `${Math.abs(longitude).toFixed(6)}°W`;
  return `${lat}, ${lng}`;
};

/**
 * Calculate distance between two coordinates in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}; 