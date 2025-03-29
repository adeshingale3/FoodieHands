import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMap } from '@/contexts/MapContext';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import Map from '@/components/Map';

const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('restaurant');
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const { selectedLocation } = useMap();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !name) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!selectedLocation) {
      toast.error('Please select your location on the map');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const userData = {
        email,
        password,
        name,
        role,
        location: selectedLocation,
        isPremium: role === 'ngo' ? isPremium : false,
      };
      
      console.log('Registering user with data:', userData);
      
      await register(userData);
      
      toast.success('Registration successful!');
      
      // Redirect based on role
      switch (role) {
        case 'restaurant':
          navigate('/restaurant/dashboard');
          break;
        case 'ngo':
          navigate('/ngo/dashboard');
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Organization Name</Label>
        <Input
          id="name"
          placeholder="Your organization name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label>I am registering as:</Label>
        <RadioGroup defaultValue="restaurant" value={role} onValueChange={(value) => setRole(value as UserRole)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="restaurant" id="role-restaurant" />
            <Label htmlFor="role-restaurant">Restaurant</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ngo" id="role-ngo" />
            <Label htmlFor="role-ngo">NGO</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="admin" id="role-admin" />
            <Label htmlFor="role-admin">Admin</Label>
          </div>
        </RadioGroup>
      </div>
      
      {role === 'ngo' && (
        <div className="space-y-2 border p-4 rounded-lg">
          <Label>Subscription Plan:</Label>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <Button
              type="button"
              variant={isPremium ? "outline" : "default"}
              className={!isPremium ? "bg-primary" : ""}
              onClick={() => setIsPremium(false)}
            >
              Free Plan
            </Button>
            <Button
              type="button"
              variant={isPremium ? "default" : "outline"}
              className={isPremium ? "bg-primary" : ""}
              onClick={() => setIsPremium(true)}
            >
              Premium Plan
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {isPremium 
              ? "Get detailed analytics and premium features" 
              : "Basic access to food donation listings"}
          </p>
        </div>
      )}
      
      <div className="space-y-2">
        <Label>Your Location</Label>
        <Map />
        {!selectedLocation && (
          <p className="text-sm text-destructive">Please select your location</p>
        )}
      </div>
      
      <Button type="submit" className="w-full" disabled={isLoading || !selectedLocation}>
        {isLoading ? 'Registering...' : 'Register'}
      </Button>
      
      <p className="text-center text-sm">
        Already have an account?{' '}
        <a href="/login" className="text-primary hover:underline">
          Login
        </a>
      </p>
    </form>
  );
};

export default RegisterForm;
