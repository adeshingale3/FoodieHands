import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, onSnapshot, updateDoc, doc, Timestamp } from 'firebase/firestore';
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

const RestaurantNotifications = () => {
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

  const handleMarkAsRead = async (notification: Notification) => {
    try {
      await updateDoc(doc(db, 'notifications', notification.id), {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
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

                {!notification.read && (
                  <Button onClick={() => handleMarkAsRead(notification)}>
                    Mark as Read
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantNotifications; 