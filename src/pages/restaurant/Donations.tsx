import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Donation {
  id: string;
  restaurantId: string;
  restaurantName: string;
  ngoId: string;
  ngoName: string;
  foodItems: {
    name: string;
    quantity: number;
    unit: string;
  }[];
  totalValue: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: Timestamp;
  completedAt?: Timestamp;
  verificationCode?: string;
  expiryDate: string;
  pickupAddress: string;
}

const RestaurantDonations: React.FC = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchDonations = async () => {
      try {
        const donationsRef = collection(db, 'fooddetails');
        const q = query(donationsRef, where('restaurantId', '==', user.id));
        
        // Get initial data
        const querySnapshot = await getDocs(q);
        const donationList: Donation[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          donationList.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt,
            completedAt: data.completedAt
          } as Donation);
        });

        setDonations(donationList);

        // Set up real-time listener
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const updatedDonations: Donation[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            updatedDonations.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt,
              completedAt: data.completedAt
            } as Donation);
          });
          setDonations(updatedDonations);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching donations:', error);
        toast.error('Failed to load donations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDonations();
  }, [user?.id]);

  if (isLoading) {
    return <div className="max-w-4xl mx-auto p-4">Loading donations...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Donation History</h1>
      
      {donations.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No donations yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {donations.map((donation) => (
            <Card key={donation.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Donation to {donation.ngoName}</CardTitle>
                    <CardDescription>
                      {format(donation.createdAt.toDate(), 'PPP p')}
                    </CardDescription>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    donation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    donation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Food Items:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {donation.foodItems.map((item, index) => (
                        <li key={index}>
                          {item.name} - {item.quantity} {item.unit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold">Total Value</h3>
                      <p>${donation.totalValue}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Expiry Date</h3>
                      <p>{format(new Date(donation.expiryDate), 'PPP')}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold">Pickup Address</h3>
                    <p>{donation.pickupAddress}</p>
                  </div>

                  {donation.status === 'accepted' && donation.verificationCode && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="font-medium">Verification Code:</p>
                      <p className="text-2xl font-bold text-green-600">{donation.verificationCode}</p>
                      <p className="text-sm text-green-700 mt-2">
                        Share this code with the NGO to complete the donation
                      </p>
                    </div>
                  )}

                  {donation.completedAt && (
                    <div className="text-sm text-gray-500">
                      Completed on: {format(donation.completedAt.toDate(), 'PPP p')}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantDonations; 