import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Transform Your Photos into Professional Portraits
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Using advanced AI technology, we turn your everyday photos into stunning professional portraits.
            Perfect for LinkedIn profiles, professional websites, or any occasion where you need to look your best.
          </p>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8 text-left">
              <div className="p-6 bg-white rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-2">1. Upload Your Photo</h3>
                <p className="text-gray-600">Start by uploading a clear photo of yourself. The better the quality, the better the results!</p>
              </div>
              
              <div className="p-6 bg-white rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-2">2. Customize Your Look</h3>
                <p className="text-gray-600">Choose your desired style, attire, and setting through our easy-to-use form.</p>
              </div>
              
              <div className="p-6 bg-white rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-2">3. Get Your Portrait</h3>
                <p className="text-gray-600">Our AI will generate a professional portrait based on your preferences.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12">
            <Link 
              to="/create" 
              className="bg-purple-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;