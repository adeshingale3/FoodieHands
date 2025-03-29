
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center">
            <span className="bg-primary text-white p-1 rounded mr-2">w2t</span>
            waste2taste
          </h2>
          <div className="space-x-3">
            <Button variant="outline" onClick={() => navigate('/login')}>Login</Button>
            <Button onClick={() => navigate('/register')}>Register</Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-16 md:py-24 container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Reducing Food Waste,<br />
                <span className="text-primary">One Donation at a Time</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-md">
                Connect restaurants with surplus food to nearby NGOs, reduce waste, help communities, and earn rewards.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" onClick={() => navigate('/register')}>
                  Join as Restaurant
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/register')}>
                  Join as NGO
                </Button>
              </div>
              <div className="pt-4 flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">2,540+</div>
                  <div className="text-sm text-gray-500">kg of food saved</div>
                </div>
                <div className="h-8 border-r border-gray-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">70+</div>
                  <div className="text-sm text-gray-500">partners</div>
                </div>
                <div className="h-8 border-r border-gray-200"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">485+</div>
                  <div className="text-sm text-gray-500">donations</div>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-gray-100 p-8 aspect-square flex items-center justify-center">
              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <div className="text-7xl font-bold mb-2 text-primary">w2t</div>
                <p className="text-lg">Platform mockup illustration</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 rounded-full bg-primary-100 text-primary flex items-center justify-center mb-4 text-xl font-bold">1</div>
                <h3 className="text-xl font-semibold mb-2">Restaurants List Food</h3>
                <p className="text-gray-600">
                  Restaurants upload details about surplus food, quantity, and estimated value.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 rounded-full bg-primary-100 text-primary flex items-center justify-center mb-4 text-xl font-bold">2</div>
                <h3 className="text-xl font-semibold mb-2">NGOs Receive Alerts</h3>
                <p className="text-gray-600">
                  Nearby NGOs are notified about available donations and can accept or decline.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 rounded-full bg-primary-100 text-primary flex items-center justify-center mb-4 text-xl font-bold">3</div>
                <h3 className="text-xl font-semibold mb-2">Both Earn Rewards</h3>
                <p className="text-gray-600">
                  Completed donations earn points for both parties, redeemable for benefits.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Join Our Mission Today</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Whether you're a restaurant with surplus food or an NGO helping those in need, become part of the solution to food waste.
            </p>
            <Button size="lg" onClick={() => navigate('/register')}>
              Get Started
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">waste2taste</h3>
              <p className="text-gray-400">
                Reducing food waste through community connection.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="/login" className="text-gray-400 hover:text-white">Login</a></li>
                <li><a href="/register" className="text-gray-400 hover:text-white">Register</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-3">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-3">Contact</h4>
              <p className="text-gray-400">info@waste2taste.com</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} waste2taste. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
