import React, { createContext, useContext, useState } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { User } from '@/types';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface MapContextProps {
  selectedLocation: Location | null;
  setSelectedLocation: (location: Location | null) => void;
  findNearbyNGOs: (maxDistance: number) => Promise<User[]>;
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
  const db = getFirestore();

  const calculateDistance = (loc1: Location, loc2: Location): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const findNearbyNGOs = async (maxDistance: number): Promise<User[]> => {
    if (!selectedLocation) {
      throw new Error('No location selected');
    }

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', 'ngo'));
      const querySnapshot = await getDocs(q);
      
      const nearbyNGOs: User[] = [];
      
      querySnapshot.forEach((doc) => {
        const ngoData = doc.data() as User;
        const distance = calculateDistance(selectedLocation, ngoData.location);
        
        if (distance <= maxDistance) {
          nearbyNGOs.push({
            ...ngoData,
            distance: distance
          });
        }
      });

      // Sort by distance
      return nearbyNGOs.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } catch (error) {
      console.error('Error finding nearby NGOs:', error);
      throw error;
    }
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
