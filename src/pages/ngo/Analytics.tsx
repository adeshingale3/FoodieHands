import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface Donation {
  id: string;
  restaurantId: string;
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

interface MonthlyStats {
  month: string;
  donations: number;
  foodQuantity: number;
  totalValue: number;
}

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [restaurantConnections, setRestaurantConnections] = useState<number>(0);

  useEffect(() => {
    if (!user?.id) return;

    const fetchAnalyticsData = async () => {
      try {
        const donationsRef = collection(db, 'fooddetails');
        const q = query(donationsRef, where('ngoId', '==', user.id));
        
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

        setDonations(donationList);

        // Calculate monthly stats
        const last6Months = eachMonthOfInterval({
          start: subMonths(new Date(), 5),
          end: new Date()
        });

        const monthlyData = last6Months.map(month => {
          const monthStart = startOfMonth(month);
          const monthEnd = endOfMonth(month);
          
          const monthDonations = donationList.filter(donation => {
            const donationDate = donation.createdAt.toDate();
            return donationDate >= monthStart && donationDate <= monthEnd;
          });

          const totalQuantity = monthDonations.reduce((sum, donation) => {
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

          const totalValue = monthDonations.reduce((sum, donation) => sum + donation.totalValue, 0);

          return {
            month: format(month, 'MMM yyyy'),
            donations: monthDonations.length,
            foodQuantity: totalQuantity,
            totalValue: totalValue
          };
        });

        setMonthlyStats(monthlyData);

        // Calculate unique restaurant connections
        const uniqueRestaurants = new Set(donationList.map(donation => donation.restaurantId));
        setRestaurantConnections(uniqueRestaurants.size);

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const monthlyDonationsData = {
    labels: monthlyStats.map(stat => stat.month),
    datasets: [
      {
        label: 'Number of Donations',
        data: monthlyStats.map(stat => stat.donations),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  };

  const foodQuantityData = {
    labels: monthlyStats.map(stat => stat.month),
    datasets: [
      {
        label: 'Food Quantity (kg)',
        data: monthlyStats.map(stat => stat.foodQuantity),
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
      },
    ],
  };

  const totalValueData = {
    labels: monthlyStats.map(stat => stat.month),
    datasets: [
      {
        label: 'Total Value ($)',
        data: monthlyStats.map(stat => stat.totalValue),
        backgroundColor: 'rgba(245, 158, 11, 0.5)',
        borderColor: 'rgb(245, 158, 11)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Monthly Statistics',
      },
    },
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Detailed insights about your food donations</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {donations.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Total number of donations received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Food Saved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {donations.reduce((sum, donation) => sum + donation.foodItems.reduce((itemSum, item) => {
                let quantity = item.quantity;
                if (item.unit.toLowerCase() === 'g') {
                  quantity = quantity / 1000;
                } else if (item.unit.toLowerCase() === 'ml') {
                  quantity = quantity / 1000;
                }
                return itemSum + quantity;
              }, 0), 0).toFixed(1)} kg
            </div>
            <p className="text-xs text-muted-foreground">
              Total quantity of food saved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${donations.reduce((sum, donation) => sum + donation.totalValue, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total value of food saved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Restaurant Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {restaurantConnections}
            </div>
            <p className="text-xs text-muted-foreground">
              Unique restaurants connected
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Donations</CardTitle>
            <CardDescription>Number of donations received per month</CardDescription>
          </CardHeader>
          <CardContent>
            <Bar options={chartOptions} data={monthlyDonationsData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Food Quantity Trend</CardTitle>
            <CardDescription>Amount of food saved per month</CardDescription>
          </CardHeader>
          <CardContent>
            <Line options={chartOptions} data={foodQuantityData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Value Trend</CardTitle>
            <CardDescription>Value of food saved per month</CardDescription>
          </CardHeader>
          <CardContent>
            <Line options={chartOptions} data={totalValueData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Donation Status Distribution</CardTitle>
            <CardDescription>Breakdown of donation statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <Pie
              data={{
                labels: ['Pending', 'Accepted', 'Rejected', 'Completed'],
                datasets: [
                  {
                    data: [
                      donations.filter(d => d.status === 'pending').length,
                      donations.filter(d => d.status === 'accepted').length,
                      donations.filter(d => d.status === 'rejected').length,
                      donations.filter(d => d.status === 'completed').length,
                    ],
                    backgroundColor: [
                      'rgba(59, 130, 246, 0.5)',
                      'rgba(16, 185, 129, 0.5)',
                      'rgba(239, 68, 68, 0.5)',
                      'rgba(245, 158, 11, 0.5)',
                    ],
                    borderColor: [
                      'rgb(59, 130, 246)',
                      'rgb(16, 185, 129)',
                      'rgb(239, 68, 68)',
                      'rgb(245, 158, 11)',
                    ],
                    borderWidth: 1,
                  },
                ],
              }}
              options={chartOptions}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics; 