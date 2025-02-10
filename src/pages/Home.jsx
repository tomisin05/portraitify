import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-5xl font-bold text-gray-900 mb-6">
                    Transform Your Photos into Professional Portraits
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                    Using advanced AI technology, we turn your everyday photos into stunning professional portraits.
                    Perfect for LinkedIn profiles, professional websites, or any occasion where you need to look your best.
                </p>
                <Link to="/create" className="bg-purple-500 text-white px-6 py-3 rounded-lg text-lg">
                    Get Started
                </Link>
            </div>

            <div className="container mx-auto px-4 py-16">
                <h2 className="text-3xl font-semibold text-gray-800 mb-4 text-center">How It Works</h2>
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

            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-3xl font-semibold text-gray-800 mb-4">Explore Your Gallery</h2>
                <p className="text-gray-600 mb-8">View and download all your generated portraits in one place.</p>
                <Link to="/gallery" className="bg-blue-500 text-white px-6 py-3 rounded-lg text-lg">
                    View Gallery
                </Link>
            </div>

            {/* <footer className="bg-gray-800 text-white py-4">
                <div className="container mx-auto text-center">
                    <p>&copy; {new Date().getFullYear()} Your Company Name. All rights reserved.</p>
                    <p>Follow us on social media!</p>
                </div>
            </footer> */}
        </div>
    );
};

export default Home;