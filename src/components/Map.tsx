
import React, { useState, useEffect } from 'react';
import { useMap } from '@/contexts/MapContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Simple Map Component - In a real implementation, this would use a map library
const Map: React.FC = () => {
  const { selectedLocation, setSelectedLocation } = useMap();
  const [address, setAddress] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // Mock function to simulate geocoding 
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate random coordinates near the center of a city
    // In a real app, this would use a geocoding service
    const mockLocation = {
      lat: 40.7128 + (Math.random() * 0.05 - 0.025),
      lng: -74.006 + (Math.random() * 0.05 - 0.025),
      address: address,
    };
    
    setSelectedLocation(mockLocation);
    toast.success("Location set successfully!");
  };

  // Use browser's Geolocation API to get current position
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Success handler
        const { latitude, lng } = position.coords;
        
        // Reverse geocoding would typically be done here to get the address
        // For mock purposes, we'll just use coordinates in the address
        const currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: `Location at ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
        };
        
        setSelectedLocation(currentLocation);
        setAddress(currentLocation.address);
        setIsLocating(false);
        toast.success("Current location detected!");
      },
      (error) => {
        // Error handler
        setIsLocating(false);
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Location permission denied. Please enable location services.");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            toast.error("The request to get location timed out.");
            break;
          default:
            toast.error("An unknown error occurred when trying to get your location.");
            break;
        }
        
        console.error("Geolocation error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="rounded-lg border shadow-sm overflow-hidden">
      <div className="p-4 bg-muted/20">
        <form onSubmit={handleSearch} className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter address"
              className="flex-1"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <Button 
              type="submit"
              className="bg-primary text-white hover:bg-primary-600"
            >
              Search
            </Button>
          </div>
          <Button 
            type="button" 
            variant="outline" 
            className="flex items-center justify-center"
            onClick={getCurrentLocation}
            disabled={isLocating}
          >
            {isLocating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Detecting location...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                Use my current location
              </>
            )}
          </Button>
        </form>
      </div>
      
      <div className="bg-gray-200 h-56 flex items-center justify-center">
        {selectedLocation ? (
          <div className="text-center p-4">
            <p className="font-semibold">Selected Location:</p>
            <p>{selectedLocation.address}</p>
            <p className="text-sm text-gray-500">
              Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
            </p>
          </div>
        ) : (
          <p className="text-gray-500">Search for an address or use your current location</p>
        )}
      </div>
    </div>
  );
};

export default Map;
