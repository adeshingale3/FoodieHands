import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Restaurant {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  createdAt: Timestamp;
  status: 'active' | 'inactive';
}

const Restaurants: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef);
      const querySnapshot = await getDocs(q);
      
      const restaurantList: Restaurant[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.role === 'restaurant') {
          restaurantList.push({
            id: doc.id,
            ...data
          } as Restaurant);
        }
      });

      setRestaurants(restaurantList);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Failed to load restaurants');
      setIsLoading(false);
    }
  };

  const handleDelete = async (restaurantId: string) => {
    if (!confirm('Are you sure you want to delete this restaurant? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(restaurantId);
      await deleteDoc(doc(db, 'users', restaurantId));
      setRestaurants(restaurants.filter(r => r.id !== restaurantId));
      toast.success('Restaurant deleted successfully');
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      toast.error('Failed to delete restaurant');
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Restaurant Management</h1>
        <p className="text-muted-foreground">Manage all registered restaurants</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Restaurants</CardTitle>
          <CardDescription>List of all registered restaurants</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {restaurants.length === 0 ? (
              <p className="text-muted-foreground text-center">No restaurants found</p>
            ) : (
              restaurants.map((restaurant) => (
                <div key={restaurant.id} className="flex items-center justify-between border-b pb-4">
                  <div className="space-y-1">
                    <p className="font-medium">{restaurant.name}</p>
                    <p className="text-sm text-muted-foreground">{restaurant.email}</p>
                    <p className="text-sm text-muted-foreground">{restaurant.phone}</p>
                    <p className="text-sm text-muted-foreground">
                      {restaurant.location.address}, {restaurant.location.city}, {restaurant.location.state}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Registered on {format(restaurant.createdAt.toDate(), 'PPP')}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(restaurant.id)}
                    disabled={isDeleting === restaurant.id}
                  >
                    {isDeleting === restaurant.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Restaurants; 