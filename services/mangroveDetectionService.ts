import { LocationInfo } from './locationService';

// Simplified mangrove area definitions for key regions
// These are approximate bounding boxes for major mangrove areas
const MANGROVE_REGIONS = [
  // Sundarbans, India/Bangladesh
  {
    name: 'Sundarbans',
    bounds: {
      north: 22.5,
      south: 21.5,
      east: 89.5,
      west: 88.5
    }
  },
  // Bhitarkanika, Odisha, India
  {
    name: 'Bhitarkanika',
    bounds: {
      north: 20.8,
      south: 20.4,
      east: 87.0,
      west: 86.7
    }
  },
  // Pichavaram, Tamil Nadu, India
  {
    name: 'Pichavaram',
    bounds: {
      north: 11.5,
      south: 11.3,
      east: 79.8,
      west: 79.7
    }
  },
  // Godavari-Krishna, Andhra Pradesh, India
  {
    name: 'Godavari-Krishna',
    bounds: {
      north: 16.8,
      south: 16.0,
      east: 82.5,
      west: 81.5
    }
  },
  // Mumbai Metropolitan Region, Maharashtra, India
  {
    name: 'Mumbai Metropolitan',
    bounds: {
      north: 19.3,
      south: 18.9,
      east: 73.0,
      west: 72.7
    }
  },
  // Gulf of Kutch, Gujarat, India
  {
    name: 'Gulf of Kutch',
    bounds: {
      north: 22.8,
      south: 22.0,
      east: 70.5,
      west: 69.5
    }
  },
  // Andaman and Nicobar Islands
  {
    name: 'Andaman and Nicobar',
    bounds: {
      north: 13.5,
      south: 6.5,
      east: 94.0,
      west: 92.0
    }
  },
  // Lakshadweep Islands
  {
    name: 'Lakshadweep',
    bounds: {
      north: 12.0,
      south: 10.0,
      east: 73.0,
      west: 71.5
    }
  }
];

export interface MangroveDetectionResult {
  isInMangroveArea: boolean;
  regionName?: string;
  confidence: 'high' | 'medium' | 'low';
  coordinates: {
    latitude: number;
    longitude: number;
  };
  distanceToNearestMangrove?: number;
}

/**
 * Check if coordinates fall within any known mangrove region
 */
export const detectMangroveArea = (
  latitude: number,
  longitude: number
): MangroveDetectionResult => {
  console.log('🌿 MANGROVE DETECTION STARTED:');
  console.log(`   Coordinates: ${latitude}, ${longitude}`);
  
  // Check if point is within any mangrove region
  for (const region of MANGROVE_REGIONS) {
    const { bounds } = region;
    
    if (
      latitude >= bounds.south &&
      latitude <= bounds.north &&
      longitude >= bounds.west &&
      longitude <= bounds.east
    ) {
      console.log(`✅ Location detected in ${region.name} mangrove region`);
      
      return {
        isInMangroveArea: true,
        regionName: region.name,
        confidence: 'high',
        coordinates: { latitude, longitude }
      };
    }
  }
  
  // If not in any region, calculate distance to nearest mangrove area
  let nearestDistance = Infinity;
  let nearestRegion = '';
  
  for (const region of MANGROVE_REGIONS) {
    const { bounds } = region;
    
    // Calculate center of the region
    const regionCenterLat = (bounds.north + bounds.south) / 2;
    const regionCenterLon = (bounds.east + bounds.west) / 2;
    
    // Calculate distance to region center
    const distance = calculateDistance(
      latitude,
      longitude,
      regionCenterLat,
      regionCenterLon
    );
    
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestRegion = region.name;
    }
  }
  
  console.log(`❌ Location NOT in mangrove area`);
  console.log(`   Nearest mangrove region: ${nearestRegion}`);
  console.log(`   Distance: ${nearestDistance.toFixed(2)} km`);
  
  // Determine confidence based on distance
  let confidence: 'high' | 'medium' | 'low' = 'high';
  if (nearestDistance > 50) {
    confidence = 'low';
  } else if (nearestDistance > 10) {
    confidence = 'medium';
  }
  
  return {
    isInMangroveArea: false,
    regionName: nearestRegion,
    confidence,
    coordinates: { latitude, longitude },
    distanceToNearestMangrove: nearestDistance
  };
};

/**
 * Enhanced mangrove detection with location info
 */
export const detectMangroveAreaWithLocation = (
  locationInfo: LocationInfo
): MangroveDetectionResult => {
  const { coordinates } = locationInfo;
  
  console.log('🌿 ENHANCED MANGROVE DETECTION:');
  console.log(`   Location: ${locationInfo.fullAddress}`);
  console.log(`   Coordinates: ${coordinates.latitude}, ${coordinates.longitude}`);
  
  const result = detectMangroveArea(coordinates.latitude, coordinates.longitude);
  
  // Add additional context based on location info
  if (result.isInMangroveArea) {
    console.log(`✅ CONFIRMED: Location is in ${result.regionName} mangrove area`);
    console.log(`   Address: ${locationInfo.fullAddress}`);
  } else {
    console.log(`❌ CONFIRMED: Location is NOT in mangrove area`);
    console.log(`   Nearest mangrove: ${result.regionName} (${result.distanceToNearestMangrove?.toFixed(2)} km away)`);
  }
  
  return result;
};

/**
 * Calculate distance between two coordinates in kilometers
 * Using Haversine formula
 */
const calculateDistance = (
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

/**
 * Get mangrove detection summary for display
 */
export const getMangroveDetectionSummary = (result: MangroveDetectionResult): string => {
  if (result.isInMangroveArea) {
    return `✅ This location is inside the ${result.regionName} mangrove area.`;
  } else {
    const distance = result.distanceToNearestMangrove || 0;
    return `❌ This location is NOT inside a mangrove area.\nNearest mangrove: ${result.regionName} (${distance.toFixed(1)} km away)`;
  }
};

/**
 * Validate coordinates before mangrove detection
 */
export const validateCoordinates = (latitude: number, longitude: number): boolean => {
  return (
    latitude >= -90 && latitude <= 90 &&
    longitude >= -180 && longitude <= 180 &&
    !isNaN(latitude) && !isNaN(longitude)
  );
};
