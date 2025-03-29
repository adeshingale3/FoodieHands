
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Users, DollarSign, Award, TrendingUp } from 'lucide-react';

const RestaurantDashboard: React.FC = () => {
  // Mock data - in a real app, this would come from API calls
  const stats = {
    totalDonated: 287, // kg
    totalValue: 2500, // $
    pointsEarned: 1450,
    ngosHelped: 12,
  };

  const recentDonations = [
    { id: 1, ngo: 'Food For All', items: 'Bread, Vegetables, Rice', quantity: 10.5, value: 120, date: '2023-06-15' },
    { id: 2, ngo: 'Hunger Relief', items: 'Pasta, Sauce, Salad', quantity: 8.2, value: 95, date: '2023-06-10' },
    { id: 3, ngo: 'Community Food Bank', items: 'Fruits, Dairy, Desserts', quantity: 12.3, value: 150, date: '2023-06-05' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Restaurant Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your food donations and impact
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donated</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDonated} kg</div>
            <p className="text-xs text-muted-foreground">
              of food saved from waste
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalValue}</div>
            <p className="text-xs text-muted-foreground">
              value of donated food
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Earned</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pointsEarned}</div>
            <p className="text-xs text-muted-foreground">
              redeem for rewards
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NGOs Helped</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ngosHelped}</div>
            <p className="text-xs text-muted-foreground">
              organizations supported
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Donations</CardTitle>
            <CardDescription>Your latest food contributions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDonations.map((donation) => (
                <div key={donation.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <p className="font-medium">{donation.ngo}</p>
                    <p className="text-sm text-muted-foreground">{donation.items}</p>
                    <p className="text-xs text-muted-foreground">{donation.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{donation.quantity} kg</p>
                    <p className="text-sm text-muted-foreground">${donation.value}</p>
                  </div>
                </div>
              ))}
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
                  <p className="text-2xl font-bold">145 kg</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Water Saved</p>
                  <p className="text-2xl font-bold">2,300 liters</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Meals Provided</p>
                  <p className="text-2xl font-bold">430</p>
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

export default RestaurantDashboard;
