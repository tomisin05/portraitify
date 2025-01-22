// src/components/Navigation.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const { user, logout, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-purple-600">
            Portraitify
          </Link>
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md"
            >
              Home
            </Link>
            
            {user ? (
              <>
                <Link 
                  to="/create" 
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md"
                >
                  Create Portrait
                </Link>
                <Link
                  to="/gallery"
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md"
                >
                  My Gallery
                </Link>
                <Link
                  to="/checkout"
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md"
                >
                  Checkout
                </Link>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-700">
                    {user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={handleGoogleSignIn}
                  className="flex items-center bg-white border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <img 
                    src="https://www.google.com/favicon.ico" 
                    alt="Google" 
                    className="w-4 h-4 mr-2"
                  />
                  Sign in with Google
                </button>
                <Link 
                  to="/login" 
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
