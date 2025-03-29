import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Users, DollarSign, Award, TrendingUp, Plus, Utensils, Bell, History } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import RestaurantStats from './RestaurantStats';
import { Button } from '@/components/ui/button';

interface Donation {
  id: string;
  ngoName: string;
  foodItems: {
    name: string;
    quantity: number;
    unit: string;
  }[];
  totalValue: number;
  createdAt: Timestamp;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
}

const RestaurantDashboard: React.FC = () => {
  const { user } = useAuth();
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.id) return;

    const fetchDashboardData = async () => {
      try {
        const donationsRef = collection(db, 'fooddetails');
        const q = query(donationsRef, where('restaurantId', '==', user.id));
        
        // Get initial data
        const querySnapshot = await getDocs(q);
        const donationList: Donation[] = [];
        let totalDonated = 0;
        let totalValue = 0;
        let completedDonations = 0;
        const uniqueNGOs = new Set<string>();
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.status === 'completed') {
            // Calculate total donated food in kg
            const totalKg = data.foodItems.reduce((sum: number, item: any) => {
              // Convert all units to kg for consistency
              let quantity = item.quantity;
              if (item.unit.toLowerCase() === 'g') {
                quantity = quantity / 1000;
              } else if (item.unit.toLowerCase() === 'ml') {
                quantity = quantity / 1000;
              }
              return sum + quantity;
            }, 0);
            
            totalDonated += totalKg;
            totalValue += data.totalValue;
            uniqueNGOs.add(data.ngoId);
            completedDonations++;
          }
          
          donationList.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt
          } as Donation);
        });

        // Sort donations by date (most recent first)
        donationList.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());

        // Calculate points (10 points per completed donation)
        const pointsEarned = completedDonations * 10;

        setRecentDonations(donationList.slice(0, 5)); // Get only the 5 most recent donations

        // Set up real-time listener
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const updatedDonations: Donation[] = [];
          let newTotalDonated = 0;
          let newTotalValue = 0;
          let newCompletedDonations = 0;
          const newUniqueNGOs = new Set<string>();
          
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.status === 'completed') {
              // Calculate total donated food in kg
              const totalKg = data.foodItems.reduce((sum: number, item: any) => {
                // Convert all units to kg for consistency
                let quantity = item.quantity;
                if (item.unit.toLowerCase() === 'g') {
                  quantity = quantity / 1000;
                } else if (item.unit.toLowerCase() === 'ml') {
                  quantity = quantity / 1000;
                }
                return sum + quantity;
              }, 0);
              
              newTotalDonated += totalKg;
              newTotalValue += data.totalValue;
              newUniqueNGOs.add(data.ngoId);
              newCompletedDonations++;
            }
            
            updatedDonations.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt
            } as Donation);
          });

          // Sort donations by date (most recent first)
          updatedDonations.sort((a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime());

          // Calculate points (10 points per completed donation)
          const newPointsEarned = newCompletedDonations * 10;

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
        <h1 className="text-3xl font-bold">Restaurant Dashboard</h1>
        <Button onClick={() => navigate('/restaurant/donate')}>
          <Plus className="h-4 w-4 mr-2" />
          Donate Food
        </Button>
      </div>

      {/* Stats Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Your Impact</h2>
        <RestaurantStats />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => navigate('/restaurant/donate')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Donate Food
            </CardTitle>
            <CardDescription>Submit a new food donation</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => navigate('/restaurant/notifications')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>View your notifications</CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => navigate('/restaurant/donations')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Donation History
            </CardTitle>
            <CardDescription>View your donation history</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Restaurant Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your food donations and impact
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Donations</CardTitle>
              <CardDescription>Your latest food contributions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentDonations.length === 0 ? (
                  <p className="text-muted-foreground text-center">No donations yet</p>
                ) : (
                  recentDonations.map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between border-b pb-4">
                      <div>
                        <p className="font-medium">{donation.ngoName}</p>
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
    </div>
  );
};

export default RestaurantDashboard;
