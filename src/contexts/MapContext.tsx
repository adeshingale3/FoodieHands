
import React, { createContext, useContext, useState } from 'react';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface MapContextProps {
  selectedLocation: Location | null;
  setSelectedLocation: (location: Location | null) => void;
  findNearbyNGOs: (location: Location, radius?: number) => Promise<any[]>;
  calculateDistance: (loc1: Location, loc2: Location) => number;
}

const MapContext = createContext<MapContextProps>({
  selectedLocation: null,
  setSelectedLocation: () => {},
  findNearbyNGOs: async () => [],
  calculateDistance: () => 0,
});

export const useMap = () => useContext(MapContext);

export const MapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  // Calculate distance between two points using the Haversine formula
  const calculateDistance = (loc1: Location, loc2: Location): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (loc2.lat - loc1.lat) * (Math.PI / 180);
    const dLon = (loc2.lng - loc1.lng) * (Math.PI / 180);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(loc1.lat * (Math.PI / 180)) * Math.cos(loc2.lat * (Math.PI / 180)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  };

  // Mock function to find nearby NGOs
  // In a real app, this would call an API with geospatial queries
  const findNearbyNGOs = async (location: Location, radius = 10) => {
    // Mock data
    const mockNGOs = [
      {
        id: 'ngo-1',
        name: 'Food For All',
        location: {
          lat: location.lat + 0.01,
          lng: location.lng + 0.01,
          address: '123 Charity St, City',
        },
      },
      {
        id: 'ngo-2',
        name: 'Hunger Relief',
        location: {
          lat: location.lat - 0.01,
          lng: location.lng - 0.02,
          address: '456 Help Ave, City',
        },
      },
      {
        id: 'ngo-3',
        name: 'Community Food Bank',
        location: {
          lat: location.lat + 0.02,
          lng: location.lng - 0.01,
          address: '789 Support Blvd, City',
        },
      },
      {
        id: 'ngo-4',
        name: 'Food Rescue',
        location: {
          lat: location.lat - 0.015,
          lng: location.lng + 0.015,
          address: '321 Rescue Rd, City',
        },
      },
      {
        id: 'ngo-5',
        name: 'Zero Hunger Initiative',
        location: {
          lat: location.lat + 0.03,
          lng: location.lng + 0.02,
          address: '555 Hope St, City',
        },
      },
    ];

    // Calculate distance for each NGO and filter by radius
    return mockNGOs
      .map(ngo => ({
        ...ngo,
        distance: calculateDistance(location, ngo.location)
      }))
      .filter(ngo => ngo.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
  };

  return (
    <MapContext.Provider
      value={{
        selectedLocation,
        setSelectedLocation,
        findNearbyNGOs,
        calculateDistance,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};
