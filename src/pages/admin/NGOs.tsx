import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface NGO {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  createdAt: Timestamp;
  status: 'active' | 'inactive';
  description: string;
  registrationNumber: string;
}

const NGOs: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [ngos, setNGOs] = useState<NGO[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchNGOs();
  }, []);

  const fetchNGOs = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef);
      const querySnapshot = await getDocs(q);
      
      const ngoList: NGO[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.role === 'ngo') {
          ngoList.push({
            id: doc.id,
            ...data
          } as NGO);
        }
      });

      setNGOs(ngoList);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching NGOs:', error);
      toast.error('Failed to load NGOs');
      setIsLoading(false);
    }
  };

  const handleDelete = async (ngoId: string) => {
    if (!confirm('Are you sure you want to delete this NGO? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(ngoId);
      await deleteDoc(doc(db, 'users', ngoId));
      setNGOs(ngos.filter(n => n.id !== ngoId));
      toast.success('NGO deleted successfully');
    } catch (error) {
      console.error('Error deleting NGO:', error);
      toast.error('Failed to delete NGO');
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">NGO Management</h1>
        <p className="text-muted-foreground">Manage all registered NGOs</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>NGOs</CardTitle>
          <CardDescription>List of all registered NGOs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ngos.length === 0 ? (
              <p className="text-muted-foreground text-center">No NGOs found</p>
            ) : (
              ngos.map((ngo) => (
                <div key={ngo.id} className="flex items-center justify-between border-b pb-4">
                  <div className="space-y-1">
                    <p className="font-medium">{ngo.name}</p>
                    <p className="text-sm text-muted-foreground">{ngo.email}</p>
                    <p className="text-sm text-muted-foreground">{ngo.phone}</p>
                    <p className="text-sm text-muted-foreground">
                      {ngo.location.address}, {ngo.location.city}, {ngo.location.state}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Registration Number: {ngo.registrationNumber}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {ngo.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Registered on {format(ngo.createdAt.toDate(), 'PPP')}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(ngo.id)}
                    disabled={isDeleting === ngo.id}
                  >
                    {isDeleting === ngo.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NGOs; 