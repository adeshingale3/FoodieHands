import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  totalDonations?: number;
  totalQuantityInKg?: number;
  totalValue?: number;
}

const GlobalLeaderboard: React.FC = () => {
  const [ngos, setNgos] = useState<LeaderboardEntry[]>([]);
  const [restaurants, setRestaurants] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setIsLoading(true);

        // Fetch NGO rankings
        const ngoStatsRef = collection(db, 'ngoStats');
        const ngoQuery = query(ngoStatsRef, orderBy('totalPoints', 'desc'), limit(10));
        const ngoSnapshot = await getDocs(ngoQuery);
        
        const ngoList: LeaderboardEntry[] = [];
        ngoSnapshot.forEach((doc) => {
          const data = doc.data();
          ngoList.push({
            id: doc.id,
            name: data.name || 'Unknown NGO',
            points: data.totalPoints || 0,
            totalDonations: data.totalReceived || 0,
            totalQuantityInKg: data.totalQuantityInKg || 0,
            totalValue: data.totalValue || 0
          });
        });
        setNgos(ngoList);

        // Fetch Restaurant rankings
        const restaurantStatsRef = collection(db, 'restaurantStats');
        const restaurantQuery = query(restaurantStatsRef, orderBy('totalPoints', 'desc'), limit(10));
        const restaurantSnapshot = await getDocs(restaurantQuery);
        
        const restaurantList: LeaderboardEntry[] = [];
        restaurantSnapshot.forEach((doc) => {
          const data = doc.data();
          restaurantList.push({
            id: doc.id,
            name: data.name || 'Unknown Restaurant',
            points: data.totalPoints || 0,
            totalDonations: data.totalDonations || 0,
            totalQuantityInKg: data.totalQuantityInKg || 0,
            totalValue: data.totalValue || 0
          });
        });
        setRestaurants(restaurantList);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        toast.error('Failed to load leaderboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  const LeaderboardTable: React.FC<{ entries: LeaderboardEntry[] }> = ({ entries }) => {
    return (
      <div className="space-y-4">
        {entries.map((entry, index) => (
          <Card key={entry.id} className={index < 3 ? 'border-yellow-500' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {index === 0 && <Trophy className="h-6 w-6 text-yellow-500" />}
                  {index === 1 && <Medal className="h-6 w-6 text-gray-400" />}
                  {index === 2 && <Award className="h-6 w-6 text-amber-600" />}
                  {index >= 3 && (
                    <span className="w-6 h-6 flex items-center justify-center font-semibold">
                      {index + 1}
                    </span>
                  )}
                  <div>
                    <h3 className="font-semibold">{entry.name}</h3>
                    <p className="text-sm text-gray-500">
                      {entry.totalDonations} donations • {entry.totalQuantityInKg?.toFixed(1)} kg • ${entry.totalValue?.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">{entry.points}</p>
                  <p className="text-sm text-gray-500">points</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Global Leaderboard</h1>
      
      <Tabs defaultValue="ngos" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ngos">NGO Rankings</TabsTrigger>
          <TabsTrigger value="restaurants">Restaurant Rankings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ngos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top NGOs</CardTitle>
              <CardDescription>Ranked by total points earned from food donations</CardDescription>
            </CardHeader>
            <CardContent>
              <LeaderboardTable entries={ngos} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="restaurants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Restaurants</CardTitle>
              <CardDescription>Ranked by total points earned from food donations</CardDescription>
            </CardHeader>
            <CardContent>
              <LeaderboardTable entries={restaurants} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GlobalLeaderboard; 