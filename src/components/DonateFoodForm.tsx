import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getFirestore, collection, addDoc, query, where, onSnapshot, getDocs } from 'firebase/firestore';

interface FoodItem {
  name: string;
  quantity: number;
  unit: string;
  expiryDate: string;
}

const DonateFoodForm: React.FC = () => {
  const { user } = useAuth();
  const [ngos, setNGOs] = useState<User[]>([]);
  const [selectedNGO, setSelectedNGO] = useState<string>('');
  const [foodItems, setFoodItems] = useState<FoodItem[]>([{ name: '', quantity: 0, unit: '', expiryDate: '' }]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingNGOs, setIsLoadingNGOs] = useState(true);

  useEffect(() => {
    const fetchNGOs = async () => {
      if (!user) return;

      try {
        setIsLoadingNGOs(true);
        const db = getFirestore();
        const usersRef = collection(db, 'users');
        
        // Query for all users with role 'ngo'
        const q = query(usersRef, where('role', '==', 'ngo'));
        
        // Get initial data
        const querySnapshot = await getDocs(q);
        const ngoList: User[] = [];
        
        querySnapshot.forEach((doc) => {
          const ngoData = doc.data() as User;
          ngoList.push({
            id: doc.id,
            ...ngoData,
          });
        });

        // Set initial data
        setNGOs(ngoList);

        // Set up real-time listener for updates
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const updatedNGOs: User[] = [];
          snapshot.forEach((doc) => {
            const ngoData = doc.data() as User;
            updatedNGOs.push({
              id: doc.id,
              ...ngoData,
            });
          });
          setNGOs(updatedNGOs);
        }, (error) => {
          console.error('Error in NGO listener:', error);
          toast.error('Error updating NGO list');
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching NGOs:', error);
        toast.error('Failed to load NGOs');
      } finally {
        setIsLoadingNGOs(false);
      }
    };

    fetchNGOs();
  }, [user]);

  const addFoodItem = () => {
    setFoodItems([...foodItems, { name: '', quantity: 0, unit: '', expiryDate: '' }]);
  };

  const updateFoodItem = (index: number, field: keyof FoodItem, value: string | number) => {
    const newFoodItems = [...foodItems];
    if (field === 'quantity') {
      // Convert string to number for quantity
      const numValue = value === '' ? 0 : Number(value);
      newFoodItems[index] = { ...newFoodItems[index], [field]: numValue };
    } else {
      newFoodItems[index] = { ...newFoodItems[index], [field]: value };
    }
    setFoodItems(newFoodItems);
  };

  const removeFoodItem = (index: number) => {
    setFoodItems(foodItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedNGO) {
      toast.error('Please select an NGO');
      return;
    }

    if (foodItems.some(item => !item.name || !item.quantity || !item.unit || !item.expiryDate)) {
      toast.error('Please fill in all food item details');
      return;
    }

    try {
      setIsLoading(true);
      const db = getFirestore();

      const selectedNGOData = ngos.find(ngo => ngo.id === selectedNGO);
      if (!selectedNGOData) {
        throw new Error('Selected NGO not found');
      }

      const donationData = {
        restaurantId: user?.id,
        restaurantName: user?.name,
        ngoId: selectedNGO,
        ngoName: selectedNGOData.name,
        foodItems,
        status: 'pending',
        createdAt: new Date(),
      };

      await addDoc(collection(db, 'donations'), donationData);

      // Create notification for NGO
      await addDoc(collection(db, 'notifications'), {
        userId: selectedNGO,
        title: 'New Food Donation Request',
        message: `${user?.name} has food to donate`,
        type: 'donation_request',
        read: false,
        donationId: donationData.id,
        createdAt: new Date(),
      });

      toast.success('Donation request sent successfully!');
      setFoodItems([{ name: '', quantity: 0, unit: '', expiryDate: '' }]);
      setSelectedNGO('');
    } catch (error) {
      console.error('Error submitting donation:', error);
      toast.error('Failed to submit donation request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Select NGO</Label>
        {isLoadingNGOs ? (
          <div className="w-full p-2 border rounded-md bg-gray-50">
            Loading NGOs...
          </div>
        ) : ngos.length === 0 ? (
          <div className="w-full p-2 border rounded-md bg-gray-50">
            No NGOs registered yet
          </div>
        ) : (
          <select
            value={selectedNGO}
            onChange={(e) => setSelectedNGO(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          >
            <option value="">Select an NGO</option>
            {ngos.map((ngo) => (
              <option key={ngo.id} value={ngo.id}>
                {ngo.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Food Items</Label>
          <Button type="button" onClick={addFoodItem} variant="outline">
            Add Item
          </Button>
        </div>

        {foodItems.map((item, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
            <div className="space-y-2">
              <Label>Item Name</Label>
              <Input
                value={item.name}
                onChange={(e) => updateFoodItem(index, 'name', e.target.value)}
                placeholder="e.g., Rice"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="text"
                value={item.quantity}
                onChange={(e) => {
                  // Only allow numbers and decimal point
                  const value = e.target.value.replace(/[^0-9.]/g, '');
                  // Ensure only one decimal point
                  const parts = value.split('.');
                  if (parts.length > 2) return;
                  updateFoodItem(index, 'quantity', value);
                }}
                placeholder="Enter quantity"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Input
                value={item.unit}
                onChange={(e) => updateFoodItem(index, 'unit', e.target.value)}
                placeholder="e.g., kg"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Input
                type="date"
                value={item.expiryDate}
                onChange={(e) => updateFoodItem(index, 'expiryDate', e.target.value)}
                required
              />
            </div>
            {foodItems.length > 1 && (
              <div className="md:col-span-4 flex justify-end">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeFoodItem(index)}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Submit Donation'}
      </Button>
    </form>
  );
};

export default DonateFoodForm; 