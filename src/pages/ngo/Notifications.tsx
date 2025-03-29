import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, onSnapshot, updateDoc, doc, Timestamp, getDoc, addDoc, increment, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  donationId: string;
  createdAt: Timestamp;
  foodDetails: {
    items: string;
    totalValue: number;
    expiryDate: string;
    pickupAddress: string;
  };
}

const Notifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchNotifications = async () => {
      try {
        const notificationsRef = collection(db, 'notifications');
        const q = query(notificationsRef, where('userId', '==', user.id));
        
        // Get initial data
        const querySnapshot = await getDocs(q);
        const notificationList: Notification[] = [];
        
        querySnapshot.forEach((doc) => {
          notificationList.push({
            id: doc.id,
            ...doc.data()
          } as Notification);
        });

        // Sort notifications by creation date (newest first)
        notificationList.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
        setNotifications(notificationList);

        // Set up real-time listener
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const updatedNotifications: Notification[] = [];
          snapshot.forEach((doc) => {
            updatedNotifications.push({
              id: doc.id,
              ...doc.data()
            } as Notification);
          });
          // Sort updated notifications by creation date (newest first)
          updatedNotifications.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
          setNotifications(updatedNotifications);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast.error('Failed to load notifications');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [user?.id]);

  const handleAccept = async (notification: Notification) => {
    try {
      // Get the food donation details to get restaurant ID
      const foodDonationDoc = await getDoc(doc(db, 'fooddetails', notification.donationId));
      if (!foodDonationDoc.exists()) {
        throw new Error('Food donation not found');
      }

      const foodDonationData = foodDonationDoc.data();
      const restaurantId = foodDonationData.restaurantId;

      // Calculate total quantity in kg
      const totalQuantityInKg = foodDonationData.foodItems.reduce((sum: number, item: any) => {
        let quantity = item.quantity;
        if (item.unit.toLowerCase() === 'g') {
          quantity = quantity / 1000;
        } else if (item.unit.toLowerCase() === 'ml') {
          quantity = quantity / 1000;
        }
        return sum + quantity;
      }, 0);

      // Calculate points (5 points per kg)
      const pointsEarned = Math.round(totalQuantityInKg * 5);

      // Update notification status
      await updateDoc(doc(db, 'notifications', notification.id), {
        read: true,
        status: 'accepted'
      });

      // Update food donation status
      await updateDoc(doc(db, 'fooddetails', notification.donationId), {
        status: 'accepted',
        acceptedAt: Timestamp.now()
      });

      // Update NGO stats
      const statsRef = doc(db, 'ngoStats', user?.id || '');
      const statsDoc = await getDoc(statsRef);

      if (statsDoc.exists()) {
        // Update existing stats
        await setDoc(statsRef, {
          totalReceivedFood: increment(totalQuantityInKg),
          totalValue: increment(foodDonationData.totalValue),
          totalPoints: increment(pointsEarned),
          pendingDonations: increment(-1),
          lastUpdated: Timestamp.now()
        }, { merge: true });
      } else {
        // Create new stats document
        await setDoc(statsRef, {
          totalReceivedFood: totalQuantityInKg,
          totalValue: foodDonationData.totalValue,
          totalPoints: pointsEarned,
          pendingDonations: 0,
          lastUpdated: Timestamp.now()
        });
      }

      // Create notification for restaurant
      await addDoc(collection(db, 'notifications'), {
        userId: restaurantId,
        title: 'Food Donation Accepted',
        message: `${user?.name} has accepted your food donation request`,
        type: 'donation_accepted',
        read: false,
        donationId: notification.donationId,
        createdAt: Timestamp.now(),
        foodDetails: notification.foodDetails
      });

      toast.success('Food donation accepted successfully');
    } catch (error) {
      console.error('Error accepting donation:', error);
      toast.error('Failed to accept donation');
    }
  };

  const handleReject = async (notification: Notification) => {
    try {
      // Get the food donation details to get restaurant ID
      const foodDonationDoc = await getDoc(doc(db, 'fooddetails', notification.donationId));
      if (!foodDonationDoc.exists()) {
        throw new Error('Food donation not found');
      }

      const foodDonationData = foodDonationDoc.data();
      const restaurantId = foodDonationData.restaurantId;

      // Update notification status
      await updateDoc(doc(db, 'notifications', notification.id), {
        read: true,
        status: 'rejected'
      });

      // Update food donation status
      await updateDoc(doc(db, 'fooddetails', notification.donationId), {
        status: 'rejected',
        rejectedAt: Timestamp.now()
      });

      // Create notification for restaurant
      await addDoc(collection(db, 'notifications'), {
        userId: restaurantId,
        title: 'Food Donation Rejected',
        message: `${user?.name} has rejected your food donation request`,
        type: 'donation_rejected',
        read: false,
        donationId: notification.donationId,
        createdAt: Timestamp.now(),
        foodDetails: notification.foodDetails
      });

      toast.success('Food donation rejected');
    } catch (error) {
      console.error('Error rejecting donation:', error);
      toast.error('Failed to reject donation');
    }
  };

  if (isLoading) {
    return <div className="max-w-4xl mx-auto p-4">Loading notifications...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      
      {notifications.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No notifications yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id} className={!notification.read ? 'border-primary' : ''}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{notification.title}</CardTitle>
                    <CardDescription>
                      {format(notification.createdAt.toDate(), 'PPP p')}
                    </CardDescription>
                  </div>
                  {!notification.read && (
                    <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs">
                      New
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{notification.message}</p>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h3 className="font-semibold mb-2">Food Details:</h3>
                  <p>Items: {notification.foodDetails.items}</p>
                  <p>Total Value: ${notification.foodDetails.totalValue}</p>
                  <p>Expiry Date: {format(new Date(notification.foodDetails.expiryDate), 'PPP')}</p>
                  <p>Pickup Address: {notification.foodDetails.pickupAddress}</p>
                </div>

                {!notification.read && notification.type === 'food_donation' && (
                  <div className="flex gap-2">
                    <Button onClick={() => handleAccept(notification)}>
                      Accept
                    </Button>
                    <Button variant="destructive" onClick={() => handleReject(notification)}>
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
