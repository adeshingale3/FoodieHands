import React from 'react';
import { MapProvider } from '@/contexts/MapContext';
import LoginForm from '@/components/LoginForm';
import {GithubBG} from 'wavyjs';
const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12">
      <GithubBG />
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          <span className="text-primary">Foodie Hands</span>
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Reducing food waste, one donation at a time
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <MapProvider>
            <LoginForm />
          </MapProvider>
        </div>
      </div>
    </div>
  );
};

export default Login;
