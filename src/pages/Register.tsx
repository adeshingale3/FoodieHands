
import React from 'react';
import { MapProvider } from '@/contexts/MapContext';
import RegisterForm from '@/components/RegisterForm';

const Register: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          <span className="text-primary">waste2taste</span>
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join our platform to reduce food waste
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <MapProvider>
            <RegisterForm />
          </MapProvider>
        </div>
      </div>
    </div>
  );
};

export default Register;
