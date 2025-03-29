import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface RestaurantStats {
  totalDonations: number;
  totalQuantityInKg: number;
  totalValue: number;
  totalPoints: number;
  lastUpdated: Date;
}

const RestaurantStats: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<RestaurantStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const statsRef = doc(db, 'restaurantStats', user.id);
    
    const unsubscribe = onSnapshot(statsRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setStats({
          totalDonations: data.totalDonations || 0,
          totalQuantityInKg: data.totalQuantityInKg || 0,
          totalValue: data.totalValue || 0,
          totalPoints: data.totalPoints || 0,
          lastUpdated: data.lastUpdated?.toDate() || new Date()
        });
      } else {
        setStats({
          totalDonations: 0,
          totalQuantityInKg: 0,
          totalValue: 0,
          totalPoints: 0,
          lastUpdated: new Date()
        });
      }
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching stats:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalDonations || 0}</div>
          <p className="text-xs text-muted-foreground">
            Number of times food donated
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Food Donated</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(stats?.totalQuantityInKg || 0).toFixed(1)} kg
          </div>
          <p className="text-xs text-muted-foreground">
            Total quantity of food donated
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${(stats?.totalValue || 0).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            Total value of donated food
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Points Earned</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalPoints || 0}</div>
          <p className="text-xs text-muted-foreground">
            Points earned (5 points per kg)
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default RestaurantStats; 