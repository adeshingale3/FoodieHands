import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';

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
    expiryDate: string;
  }[];
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: Date;
  completedAt?: Date;
  verificationCode?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'donation_request' | 'donation_completed' | 'general';
  read: boolean;
  donationId?: string;
  createdAt: Date;
}

const RestaurantDonations: React.FC = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationCode, setVerificationCode] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        const db = getFirestore();
        
        // Load donations
        const donationsRef = collection(db, 'donations');
        const donationsQuery = query(donationsRef, where('restaurantId', '==', user.id));
        const donationsSnapshot = await getDocs(donationsQuery);

        const loadedDonations: Donation[] = [];
        donationsSnapshot.forEach((doc) => {
          loadedDonations.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            completedAt: doc.data().completedAt?.toDate(),
          } as Donation);
        });

        setDonations(loadedDonations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));

        // Load notifications
        const notificationsRef = collection(db, 'notifications');
        const notificationsQuery = query(notificationsRef, where('userId', '==', user.id));
        const notificationsSnapshot = await getDocs(notificationsQuery);

        const loadedNotifications: Notification[] = [];
        notificationsSnapshot.forEach((doc) => {
          loadedNotifications.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
          } as Notification);
        });

        setNotifications(loadedNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load donations and notifications');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleVerifyCode = async (donationId: string) => {
    try {
      const db = getFirestore();
      const donationRef = doc(db, 'donations', donationId);
      const donation = donations.find(d => d.id === donationId);

      if (!donation) {
        throw new Error('Donation not found');
      }

      if (donation.verificationCode !== verificationCode) {
        toast.error('Invalid verification code');
        return;
      }

      // Update donation status
      await updateDoc(donationRef, {
        status: 'completed',
        completedAt: new Date(),
      });

      // Create notification for NGO
      await addDoc(collection(db, 'notifications'), {
        userId: donation.ngoId,
        title: 'Donation Completed',
        message: `${user?.name} has completed the donation`,
        type: 'donation_completed',
        read: false,
        donationId,
        createdAt: new Date(),
      });

      // Update local state
      setDonations(donations.map(d => 
        d.id === donationId 
          ? { ...d, status: 'completed', completedAt: new Date() }
          : d
      ));

      toast.success('Donation completed successfully!');
      setVerificationCode('');
    } catch (error) {
      console.error('Error completing donation:', error);
      toast.error('Failed to complete donation');
    }
  };

  if (isLoading) {
    return <div>Loading donations...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Donations</h2>
      
      {donations.length === 0 ? (
        <p className="text-gray-500">No donations yet</p>
      ) : (
        <div className="space-y-4">
          {donations.map((donation) => (
            <div key={donation.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{donation.ngoName}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(donation.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-sm ${
                  donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  donation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  donation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Food Items:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {donation.foodItems.map((item, index) => (
                    <li key={index}>
                      {item.name} - {item.quantity} {item.unit} (Expires: {item.expiryDate})
                    </li>
                  ))}
                </ul>
              </div>

              {donation.status === 'accepted' && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Enter the verification code provided by the NGO to complete the donation:
                  </p>
                  <div className="flex space-x-2">
                    <Input
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Enter verification code"
                      maxLength={4}
                    />
                    <Button onClick={() => handleVerifyCode(donation.id)}>
                      Verify
                    </Button>
                  </div>
                </div>
              )}

              {donation.status === 'completed' && donation.completedAt && (
                <p className="text-sm text-green-600">
                  Completed on: {new Date(donation.completedAt).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Notifications</h2>
        {notifications.length === 0 ? (
          <p className="text-gray-500">No notifications</p>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{notification.title}</h3>
                    <p className="text-gray-600">{notification.message}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      New
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDonations; 