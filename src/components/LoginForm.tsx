
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('restaurant');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      setIsLoading(true);
      await login(email, password, role);
      
      toast.success('Login successful!');
      
      // Redirect based on role
      if (role === 'restaurant') {
        navigate('/restaurant/dashboard');
      } else if (role === 'ngo') {
        navigate('/ngo/dashboard');
      } else if (role === 'admin') {
        navigate('/admin/dashboard');
      }
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
        <Label>I am a:</Label>
        <RadioGroup defaultValue="restaurant" value={role} onValueChange={(value) => setRole(value as UserRole)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="restaurant" id="restaurant" />
            <Label htmlFor="restaurant">Restaurant</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ngo" id="ngo" />
            <Label htmlFor="ngo">NGO</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="admin" id="admin" />
            <Label htmlFor="admin">Admin</Label>
          </div>
        </RadioGroup>
      </div>
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>
      
      <p className="text-center text-sm">
        Don't have an account?{' '}
        <a href="/register" className="text-primary hover:underline">
          Register
        </a>
      </p>
    </form>
  );
};

export default LoginForm;
