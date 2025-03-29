import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, History, TrendingUp, Utensils } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import NGOStats from './NGOStats';

interface Donation {
  id: string;
  restaurantName: string;
  foodItems: {
    name: string;
    quantity: number;
    unit: string;
  }[];
  totalValue: number;
  createdAt: Timestamp;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
}

const NGODashboard: React.FC = () => {
  const { user } = useAuth();
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.id) return;

    const fetchDashboardData = async () => {
      try {
        const donationsRef = collection(db, 'fooddetails');
        const q = query(donationsRef, where('ngoId', '==', user.id));
        
        // Get initial data
        const querySnapshot = await getDocs(q);
        const donationList: Donation[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          donationList.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt
          } as Donation);
        });

        // Sort donations by date (most recent first)
        donationList.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());

        setRecentDonations(donationList.slice(0, 5)); // Get only the 5 most recent donations

        // Set up real-time listener
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const updatedDonations: Donation[] = [];
          
          snapshot.forEach((doc) => {
            const data = doc.data();
            updatedDonations.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt
            } as Donation);
          });

          // Sort donations by date (most recent first)
          updatedDonations.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());
          setRecentDonations(updatedDonations.slice(0, 5));
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  if (isLoading) {
    return <div className="space-y-6">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">NGO Dashboard</h1>
      </div>

      {/* Stats Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Your Impact</h2>
        <NGOStats />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => navigate('/ngo/notifications')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>View your notifications</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => navigate('/ngo/donations')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Donations
            </CardTitle>
            <CardDescription>View all donations</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => navigate('/ngo/history')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              History
            </CardTitle>
            <CardDescription>View donation history</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => navigate('/ngo/analytics')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Analytics
            </CardTitle>
            <CardDescription>View detailed insights</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Donations</CardTitle>
            <CardDescription>Latest food donations received</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDonations.length === 0 ? (
                <p className="text-muted-foreground text-center">No donations yet</p>
              ) : (
                recentDonations.map((donation) => (
                  <div key={donation.id} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">{donation.restaurantName}</p>
                      <p className="text-sm text-muted-foreground">
                        {donation.foodItems.map(item => `${item.name} (${item.quantity} ${item.unit})`).join(', ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(donation.createdAt.toDate(), 'PPP')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {donation.foodItems.reduce((sum, item) => {
                          let quantity = item.quantity;
                          if (item.unit.toLowerCase() === 'g') {
                            quantity = quantity / 1000;
                          } else if (item.unit.toLowerCase() === 'ml') {
                            quantity = quantity / 1000;
                          }
                          return sum + quantity;
                        }, 0).toFixed(2)} kg
                      </p>
                      <p className="text-sm text-muted-foreground">${donation.totalValue}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Impact Overview</CardTitle>
            <CardDescription>The difference you're making</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">CO2 Emissions Saved</p>
                  <p className="text-2xl font-bold">{Math.round((recentDonations.reduce((sum, donation) => sum + donation.foodItems.reduce((itemSum, item) => {
                    let quantity = item.quantity;
                    if (item.unit.toLowerCase() === 'g') {
                      quantity = quantity / 1000;
                    } else if (item.unit.toLowerCase() === 'ml') {
                      quantity = quantity / 1000;
                    }
                    return itemSum + quantity;
                  }, 0), 0)) * 2.5)} kg</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Water Saved</p>
                  <p className="text-2xl font-bold">{Math.round((recentDonations.reduce((sum, donation) => sum + donation.foodItems.reduce((itemSum, item) => {
                    let quantity = item.quantity;
                    if (item.unit.toLowerCase() === 'g') {
                      quantity = quantity / 1000;
                    } else if (item.unit.toLowerCase() === 'ml') {
                      quantity = quantity / 1000;
                    }
                    return itemSum + quantity;
                  }, 0), 0)) * 100)} liters</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Meals Provided</p>
                  <p className="text-2xl font-bold">{Math.round((recentDonations.reduce((sum, donation) => sum + donation.foodItems.reduce((itemSum, item) => {
                    let quantity = item.quantity;
                    if (item.unit.toLowerCase() === 'g') {
                      quantity = quantity / 1000;
                    } else if (item.unit.toLowerCase() === 'ml') {
                      quantity = quantity / 1000;
                    }
                    return itemSum + quantity;
                  }, 0), 0)) * 4)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NGODashboard;
