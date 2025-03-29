import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'donation_request' | 'donation_completed' | 'general';
  read: boolean;
  donationId?: string;
  createdAt: Date;
}

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

const NGONotifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) return;

      try {
        const db = getFirestore();
        const notificationsRef = collection(db, 'notifications');
        const q = query(notificationsRef, where('userId', '==', user.id));
        const querySnapshot = await getDocs(q);

        const loadedNotifications: Notification[] = [];
        querySnapshot.forEach((doc) => {
          loadedNotifications.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
          } as Notification);
        });

        setNotifications(loadedNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));

        // Load associated donations
        const donationsRef = collection(db, 'donations');
        const donationsQuery = query(donationsRef, where('ngoId', '==', user.id));
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
      } catch (error) {
        console.error('Error loading notifications:', error);
        toast.error('Failed to load notifications');
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, [user]);

  const handleAccept = async (donationId: string) => {
    try {
      const db = getFirestore();
      const donationRef = doc(db, 'donations', donationId);
      const donation = donations.find(d => d.id === donationId);

      if (!donation) {
        throw new Error('Donation not found');
      }

      // Generate verification code
      const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

      // Update donation status
      await updateDoc(donationRef, {
        status: 'accepted',
        verificationCode,
      });

      // Create notification for restaurant
      await addDoc(collection(db, 'notifications'), {
        userId: donation.restaurantId,
        title: 'Donation Request Accepted',
        message: `${user?.name} has accepted your donation request`,
        type: 'donation_completed',
        read: false,
        donationId,
        createdAt: new Date(),
      });

      // Update local state
      setDonations(donations.map(d => 
        d.id === donationId 
          ? { ...d, status: 'accepted', verificationCode }
          : d
      ));

      toast.success('Donation request accepted!');
    } catch (error) {
      console.error('Error accepting donation:', error);
      toast.error('Failed to accept donation request');
    }
  };

  const handleReject = async (donationId: string) => {
    try {
      const db = getFirestore();
      const donationRef = doc(db, 'donations', donationId);
      const donation = donations.find(d => d.id === donationId);

      if (!donation) {
        throw new Error('Donation not found');
      }

      // Update donation status
      await updateDoc(donationRef, {
        status: 'rejected',
      });

      // Create notification for restaurant
      await addDoc(collection(db, 'notifications'), {
        userId: donation.restaurantId,
        title: 'Donation Request Rejected',
        message: `${user?.name} has rejected your donation request`,
        type: 'donation_completed',
        read: false,
        donationId,
        createdAt: new Date(),
      });

      // Update local state
      setDonations(donations.map(d => 
        d.id === donationId 
          ? { ...d, status: 'rejected' }
          : d
      ));

      toast.info('Donation request rejected');
    } catch (error) {
      console.error('Error rejecting donation:', error);
      toast.error('Failed to reject donation request');
    }
  };

  if (isLoading) {
    return <div>Loading notifications...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Donation Requests</h2>
      
      {donations.length === 0 ? (
        <p className="text-gray-500">No donation requests yet</p>
      ) : (
        <div className="space-y-4">
          {donations.map((donation) => (
            <div key={donation.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{donation.restaurantName}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(donation.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-sm ${
                  donation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  donation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
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

              {donation.status === 'pending' && (
                <div className="flex space-x-4">
                  <Button onClick={() => handleAccept(donation.id)}>
                    Accept
                  </Button>
                  <Button variant="destructive" onClick={() => handleReject(donation.id)}>
                    Reject
                  </Button>
                </div>
              )}

              {donation.status === 'accepted' && donation.verificationCode && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="font-medium">Verification Code:</p>
                  <p className="text-2xl font-bold text-green-600">{donation.verificationCode}</p>
                  <p className="text-sm text-green-700 mt-2">
                    Share this code with the restaurant to complete the donation
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NGONotifications; 