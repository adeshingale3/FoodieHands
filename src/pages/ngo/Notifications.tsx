
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// Mock data
const mockNotifications = [
  {
    id: 'notif-1',
    donationId: 'don-123',
    restaurant: 'Italian Bistro',
    items: 'Pasta, Bread, Vegetables',
    quantity: 8.5,
    value: 95,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    status: 'pending',
  },
  {
    id: 'notif-2',
    donationId: 'don-124',
    restaurant: 'Sushi Express',
    items: 'Rice, Fish, Vegetables',
    quantity: 5.2,
    value: 78,
    createdAt: new Date(Date.now() - 1000 * 60 * 90), // 90 minutes ago
    status: 'pending',
  },
  {
    id: 'notif-3',
    donationId: 'don-125',
    restaurant: 'Burger Place',
    items: 'Bread, Meat, Vegetables',
    quantity: 7.8,
    value: 85,
    createdAt: new Date(Date.now() - 1000 * 60 * 240), // 4 hours ago
    status: 'pending',
  },
];

const NGONotifications: React.FC = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [otpVerification, setOtpVerification] = useState<{
    donationId: string;
    otp: string;
    isVerifying: boolean;
  } | null>(null);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

  const handleAccept = (donationId: string) => {
    // In a real app, this would send a request to your backend
    // which would generate and send an OTP
    
    // Mock OTP generation
    const mockOtp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log('Generated OTP:', mockOtp); // For testing
    
    toast.success('Donation accepted, verification code sent to restaurant');
    
    // Update notification status
    setNotifications(notifications.map(notif => 
      notif.donationId === donationId 
        ? { ...notif, status: 'accepted' } 
        : notif
    ));
    
    // Show OTP verification form
    setOtpVerification({
      donationId,
      otp: '',
      isVerifying: false,
    });
  };

  const handleReject = (donationId: string) => {
    toast.info('Donation request rejected');
    
    // Remove notification
    setNotifications(notifications.filter(notif => notif.donationId !== donationId));
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (otpVerification) {
      setOtpVerification({
        ...otpVerification,
        otp: e.target.value,
      });
    }
  };

  const handleVerifyOtp = () => {
    if (!otpVerification) return;
    
    setOtpVerification({
      ...otpVerification,
      isVerifying: true,
    });
    
    // In a real app, this would verify the OTP with your backend
    setTimeout(() => {
      // Mock successful verification
      toast.success('Donation completed successfully!');
      
      // Remove notification
      setNotifications(notifications.filter(notif => 
        notif.donationId !== otpVerification.donationId
      ));
      
      // Clear OTP verification
      setOtpVerification(null);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">
          Manage incoming donation requests
        </p>
      </div>

      {otpVerification && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle>Verify Donation</CardTitle>
            <CardDescription>
              Enter the verification code shown by the restaurant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter verification code"
                value={otpVerification.otp}
                onChange={handleOtpChange}
                maxLength={4}
                className="text-center text-lg font-mono"
                disabled={otpVerification.isVerifying}
              />
              <Button 
                onClick={handleVerifyOtp} 
                disabled={!otpVerification.otp || otpVerification.isVerifying}
              >
                {otpVerification.isVerifying ? 'Verifying...' : 'Verify'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No notifications at the moment</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{notification.restaurant}</CardTitle>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(notification.createdAt)}
                  </span>
                </div>
                <CardDescription>
                  New donation request
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Items:</span>
                    <span className="text-sm font-medium">{notification.items}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Quantity:</span>
                    <span className="text-sm font-medium">{notification.quantity} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Estimated Value:</span>
                    <span className="text-sm font-medium">${notification.value}</span>
                  </div>
                </div>
              </CardContent>
              
              {notification.status === 'pending' && (
                <CardFooter className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleReject(notification.donationId)}
                  >
                    Reject
                  </Button>
                  <Button 
                    onClick={() => handleAccept(notification.donationId)}
                  >
                    Accept
                  </Button>
                </CardFooter>
              )}
              
              {notification.status === 'accepted' && (
                <CardFooter>
                  <p className="text-sm text-primary w-full text-center">
                    Waiting for restaurant to confirm donation
                  </p>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NGONotifications;
