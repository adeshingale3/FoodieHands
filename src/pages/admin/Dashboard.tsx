import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  role: 'restaurant' | 'ngo';
}

interface Donation {
  id: string;
  restaurantName: string;
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

interface Stats {
  totalRestaurants: number;
  totalNGOs: number;
  totalDonations: number;
  totalFoodSaved: number;
  totalValue: number;
}

const AdminDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalRestaurants: 0,
    totalNGOs: 0,
    totalDonations: 0,
    totalFoodSaved: 0,
    totalValue: 0,
  });
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log('Starting to fetch dashboard data...');
        
        // Fetch users
        const usersRef = collection(db, 'users');
        console.log('Fetching users from:', usersRef.path);
        const usersSnapshot = await getDocs(usersRef);
        const users: User[] = [];
        
        usersSnapshot.forEach((doc) => {
          users.push({
            id: doc.id,
            ...doc.data()
          } as User);
        });
        console.log('Fetched users:', users.length);

        // Calculate user stats
        const totalRestaurants = users.filter(user => user.role === 'restaurant').length;
        const totalNGOs = users.filter(user => user.role === 'ngo').length;
        console.log('User stats:', { totalRestaurants, totalNGOs });

        // Fetch all donations for stats
        const allDonationsRef = collection(db, 'fooddetails');
        console.log('Fetching donations from:', allDonationsRef.path);
        const allDonationsSnapshot = await getDocs(allDonationsRef);
        const allDonations: Donation[] = [];
        
        allDonationsSnapshot.forEach((doc) => {
          allDonations.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt
          } as Donation);
        });
        console.log('Fetched donations:', allDonations.length);

        // Fetch recent donations for display
        const recentDonationsQuery = query(allDonationsRef, orderBy('createdAt', 'desc'), limit(5));
        console.log('Fetching recent donations...');
        const recentDonationsSnapshot = await getDocs(recentDonationsQuery);
        const recentDonationsList: Donation[] = [];
        
        recentDonationsSnapshot.forEach((doc) => {
          recentDonationsList.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt
          } as Donation);
        });
        console.log('Fetched recent donations:', recentDonationsList.length);

        // Calculate donation stats from all donations
        const totalDonations = allDonations.length;
        const totalFoodSaved = allDonations.reduce((sum, donation) => {
          return sum + donation.foodItems.reduce((itemSum, item) => {
            let quantity = item.quantity;
            if (item.unit.toLowerCase() === 'g') {
              quantity = quantity / 1000;
            } else if (item.unit.toLowerCase() === 'ml') {
              quantity = quantity / 1000;
            }
            return itemSum + quantity;
          }, 0);
        }, 0);
        const totalValue = allDonations.reduce((sum, donation) => sum + donation.totalValue, 0);

        console.log('Calculated stats:', {
          totalDonations,
          totalFoodSaved,
          totalValue
        });

        // Update state
        setStats({
          totalRestaurants,
          totalNGOs,
          totalDonations,
          totalFoodSaved,
          totalValue,
        });
        setRecentDonations(recentDonationsList);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of the food donation system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Restaurants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRestaurants}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total NGOs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalNGOs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDonations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Food Saved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFoodSaved.toFixed(2)} kg</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalValue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Donations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Donations</CardTitle>
          <CardDescription>Latest food donations in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Restaurant</th>
                  <th className="p-2 text-left">NGO</th>
                  <th className="p-2 text-left">Food Items</th>
                  <th className="p-2 text-left">Value</th>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentDonations.map((donation) => (
                  <tr key={donation.id} className="border-b">
                    <td className="p-2">{donation.restaurantName}</td>
                    <td className="p-2">{donation.ngoName}</td>
                    <td className="p-2">
                      {donation.foodItems.map(item => 
                        `${item.name} (${item.quantity} ${item.unit})`
                      ).join(', ')}
                    </td>
                    <td className="p-2">${donation.totalValue}</td>
                    <td className="p-2">{format(donation.createdAt.toDate(), 'PPP')}</td>
                    <td className="p-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        donation.status === 'completed' ? 'bg-green-100 text-green-800' :
                        donation.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                        donation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
