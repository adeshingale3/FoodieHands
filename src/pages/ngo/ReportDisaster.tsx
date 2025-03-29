import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, Timestamp, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const ReportDisaster: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    estimatedPeople: '',
    urgency: 'high',
    contactNumber: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id || !user?.name) {
      toast.error('Please complete your profile information');
      return;
    }

    try {
      setIsLoading(true);

      // Create disaster report
      const disasterData = {
        ngoId: user.id,
        ngoName: user.name,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        estimatedPeople: parseInt(formData.estimatedPeople),
        urgency: formData.urgency,
        contactNumber: formData.contactNumber,
        status: 'active',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      // Add to disasters collection
      const disasterRef = await addDoc(collection(db, 'disasters'), disasterData);

      // Get all restaurants
      const restaurantsSnapshot = await getDocs(collection(db, 'users'));
      const restaurantNotifications = [];

      restaurantsSnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.role === 'restaurant') {
          restaurantNotifications.push({
            userId: doc.id,
            title: 'New Disaster Alert',
            message: `${user.name} has reported a disaster: ${formData.title}`,
            type: 'disaster_alert',
            read: false,
            disasterId: disasterRef.id,
            createdAt: Timestamp.now(),
            disasterDetails: {
              title: formData.title,
              description: formData.description,
              location: formData.location,
              urgency: formData.urgency,
              contactNumber: formData.contactNumber
            }
          });
        }
      });

      // Create notifications for all restaurants
      const notificationsRef = collection(db, 'notifications');
      const batch = writeBatch(db);
      
      restaurantNotifications.forEach((notification) => {
        const notificationRef = doc(notificationsRef);
        batch.set(notificationRef, notification);
      });

      await batch.commit();

      toast.success('Disaster reported successfully! Restaurants have been notified.');
      navigate('/ngo/dashboard');
    } catch (error) {
      console.error('Error reporting disaster:', error);
      toast.error('Failed to report disaster');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Report a Disaster</CardTitle>
          <CardDescription>
            Report a disaster to notify restaurants and request food donations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Disaster Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Flood in Downtown Area"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the disaster and its impact..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., 123 Main St, City"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedPeople">Estimated Number of People Affected</Label>
              <Input
                id="estimatedPeople"
                name="estimatedPeople"
                type="number"
                value={formData.estimatedPeople}
                onChange={handleChange}
                placeholder="e.g., 100"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="e.g., +1234567890"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency Level</Label>
              <select
                id="urgency"
                name="urgency"
                value={formData.urgency}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Reporting...' : 'Report Disaster'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportDisaster; 