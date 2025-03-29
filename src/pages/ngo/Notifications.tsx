import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { getFirestore, collection, query, where, onSnapshot, updateDoc, doc, addDoc, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: Timestamp;
  donationId: string;
}

interface Donation {
  id: string;
  restaurantId: string;
  restaurantName: string;
  ngoId: string;
  ngoName: string;
  foodItems: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: Timestamp;
  totalValue: number;
}

const NGONotifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const db = getFirestore();
    
    // Listen for notifications
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.id)
    );

    const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationList: Notification[] = [];
      snapshot.forEach((doc) => {
        notificationList.push({ id: doc.id, ...doc.data() } as Notification);
      });
      setNotifications(notificationList);
    });

    // Listen for donations
    const donationsQuery = query(
      collection(db, 'donations'),
      where('ngoId', '==', user.id)
    );

    const unsubscribeDonations = onSnapshot(donationsQuery, (snapshot) => {
      const donationList: Donation[] = [];
      snapshot.forEach((doc) => {
        donationList.push({ id: doc.id, ...doc.data() } as Donation);
      });
      setDonations(donationList);
    });

    setLoading(false);

    return () => {
      unsubscribeNotifications();
      unsubscribeDonations();
    };
  }, [user]);

  const handleAccept = async (donationId: string) => {
    try {
      const db = getFirestore();
      const donationRef = doc(db, 'donations', donationId);
      
      // Update donation status
      await updateDoc(donationRef, {
        status: 'accepted',
        acceptedAt: Timestamp.now()
      });

      // Create notification for restaurant
      const donation = donations.find(d => d.id === donationId);
      if (donation) {
        await addDoc(collection(db, 'notifications'), {
          userId: donation.restaurantId,
          title: 'Donation Request Accepted',
          message: `${user?.name} has accepted your donation request`,
          type: 'donation_accepted',
          read: false,
          donationId: donationId,
          createdAt: Timestamp.now()
        });
      }

      toast.success('Donation request accepted successfully');
    } catch (error) {
      console.error('Error accepting donation:', error);
      toast.error('Failed to accept donation request');
    }
  };

  const handleReject = async (donationId: string) => {
    try {
      const db = getFirestore();
      const donationRef = doc(db, 'donations', donationId);
      
      // Update donation status
      await updateDoc(donationRef, {
        status: 'rejected',
        rejectedAt: Timestamp.now()
      });

      // Create notification for restaurant
      const donation = donations.find(d => d.id === donationId);
      if (donation) {
        await addDoc(collection(db, 'notifications'), {
          userId: donation.restaurantId,
          title: 'Donation Request Rejected',
          message: `${user?.name} has rejected your donation request`,
          type: 'donation_rejected',
          read: false,
          donationId: donationId,
          createdAt: Timestamp.now()
        });
      }

      toast.success('Donation request rejected');
    } catch (error) {
      console.error('Error rejecting donation:', error);
      toast.error('Failed to reject donation request');
    }
  };

  if (loading) {
    return <div>Loading notifications...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      
      <div className="space-y-4">
        {donations
          .filter(donation => donation.status === 'pending')
          .map((donation) => (
            <Card key={donation.id}>
              <CardHeader>
                <CardTitle>New Donation Request</CardTitle>
                <CardDescription>
                  From: {donation.restaurantName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Food Items:</h3>
                    <ul className="list-disc list-inside">
                      {donation.foodItems.map((item, index) => (
                        <li key={index}>
                          {item.name} - {item.quantity} {item.unit}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">
                        Requested on: {format(donation.createdAt.toDate(), 'PPP')}
                      </p>
                      <p className="text-sm text-gray-500">
                        Estimated Value: ${donation.totalValue}
                      </p>
                    </div>
                    
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => handleReject(donation.id)}
                      >
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleAccept(donation.id)}
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
        {donations.filter(donation => donation.status === 'pending').length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No pending donation requests
          </div>
        )}
      </div>
    </div>
  );
};

export default NGONotifications;
