import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C43'];

const Donations: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [donations, setDonations] = useState<Donation[]>([]);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      console.log('Starting to fetch donations...');
      
      const donationsRef = collection(db, 'fooddetails');
      console.log('Fetching from collection:', donationsRef.path);
      
      const q = query(donationsRef, orderBy('createdAt', 'desc'));
      console.log('Query created with orderBy createdAt desc');
      
      const querySnapshot = await getDocs(q);
      console.log('Query snapshot received');
      
      const donationList: Donation[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Processing donation:', doc.id, data);
        donationList.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt
        } as Donation);
      });
      
      console.log('Total donations fetched:', donationList.length);
      setDonations(donationList);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching donations:', error);
      toast.error('Failed to load donations');
      setIsLoading(false);
    }
  };

  // Calculate total quantity in kg for a donation
  const calculateTotalQuantity = (donation: Donation) => {
    return donation.foodItems.reduce((sum, item) => {
      let quantity = item.quantity;
      if (item.unit.toLowerCase() === 'g') {
        quantity = quantity / 1000;
      } else if (item.unit.toLowerCase() === 'ml') {
        quantity = quantity / 1000;
      }
      return sum + quantity;
    }, 0);
  };

  // Prepare data for status distribution chart
  const statusDistribution = donations.reduce((acc, donation) => {
    acc[donation.status] = (acc[donation.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusChartData = Object.entries(statusDistribution).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count
  }));

  // Prepare data for monthly donations chart
  const monthlyDonations = donations.reduce((acc, donation) => {
    const month = format(donation.createdAt.toDate(), 'MMM yyyy');
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const monthlyChartData = Object.entries(monthlyDonations)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

  // Prepare data for food items distribution chart
  const foodItemsDistribution = donations.reduce((acc, donation) => {
    donation.foodItems.forEach(item => {
      const key = item.name.toLowerCase();
      acc[key] = (acc[key] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const foodItemsChartData = Object.entries(foodItemsDistribution)
    .map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: count
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8); // Show top 8 most common items

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
        <h1 className="text-3xl font-bold">Donation Management</h1>
        <p className="text-muted-foreground">Overview of all food donations</p>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Donation Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Donations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="Number of Donations" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Food Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={foodItemsChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {foodItemsChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Donations Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Donations</CardTitle>
          <CardDescription>Detailed list of all food donations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sr. No.</TableHead>
                  <TableHead>Restaurant</TableHead>
                  <TableHead>NGO</TableHead>
                  <TableHead>Food Items</TableHead>
                  <TableHead>Food Worth</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donations.map((donation, index) => (
                  <TableRow key={donation.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{donation.restaurantName}</TableCell>
                    <TableCell>{donation.ngoName}</TableCell>
                    <TableCell>
                      {donation.foodItems.map(item => 
                        `${item.name} (${item.quantity} ${item.unit})`
                      ).join(', ')}
                    </TableCell>
                    <TableCell>${donation.totalValue}</TableCell>
                    <TableCell>{calculateTotalQuantity(donation).toFixed(2)} kg</TableCell>
                    <TableCell>{format(donation.createdAt.toDate(), 'PPP')}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        donation.status === 'completed' ? 'bg-green-100 text-green-800' :
                        donation.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                        donation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Donations; 