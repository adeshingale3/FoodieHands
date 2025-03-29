import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { registerUser, loginUser, logoutUser, getCurrentUser, getUserData } from '@/firebase';

interface AuthContextProps {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const firebaseUser = await getCurrentUser();
        if (firebaseUser) {
          const userData = await getUserData(firebaseUser.uid);
          if (userData) {
            setUser(userData as User);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    try {
      const firebaseUser = await loginUser(email, password);
      const userData = await getUserData(firebaseUser.uid);
      
      console.log('Login attempt:', {
        email,
        selectedRole: role,
        userData: userData
      });

      if (!userData) {
        throw new Error('User data not found in Firestore');
      }

      if (userData.role !== role) {
        throw new Error(`Invalid role. Expected: ${role}, Found: ${userData.role}`);
      }

      setUser(userData as User);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (userData: Partial<User> & { password: string }) => {
    try {
      const { password, ...userDataWithoutPassword } = userData;
      
      // Ensure role is set
      if (!userDataWithoutPassword.role) {
        throw new Error('Role is required during registration');
      }

      console.log('Registering user with data:', userDataWithoutPassword);

      const firebaseUser = await registerUser(userData.email!, password, userDataWithoutPassword);
      const userDataFromFirestore = await getUserData(firebaseUser.uid);
      
      if (userDataFromFirestore) {
        console.log('User registered successfully:', userDataFromFirestore);
        setUser(userDataFromFirestore as User);
      } else {
        throw new Error('Failed to retrieve user data after registration');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
