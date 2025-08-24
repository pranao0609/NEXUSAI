import React, { useState ,useEffect} from 'react';
import { Mail, Lock, Phone, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function LoginComponent({ onClose }) {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'phone'
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
        const response = await axios.get(`${API_BASE_URL}/auth/me`, { withCredentials: true });

        if (response.data && response.data.username) {
          localStorage.setItem('user', JSON.stringify(response.data));  
          // Already authenticated → go to dashboard
          navigate('/dashboard');
        }
      } catch (err) {
        console.log("Not authenticated yet", err.response?.data || err.message);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  // Store authentication data
  const setAuthData = (token, userData) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('isAuthenticated', 'true');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

      if (mode === 'login') {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
          username: formData.email,
          password: formData.password
        }, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          transformRequest: [(data) => Object.entries(data).map(([k,v])=>`${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')]
        });

        if (response.data.access_token) {
          // Store authentication data
          setAuthData(response.data.access_token, {
            name: response.data.user?.name || 'User',
            email: formData.email
          });

          // Close modal and redirect to dashboard
          if (onClose) onClose();
          navigate('/dashboard');
        }

      } else if (mode === 'signup') {
        const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        });

        if (response.data.success) {
          // Auto-login after successful signup
          const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
            username: formData.email,
            password: formData.password
          }, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            transformRequest: [(data) => Object.entries(data).map(([k,v])=>`${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')]
          });

          if (loginResponse.data.access_token) {
            // Store authentication data
            setAuthData(loginResponse.data.access_token, {
              name: formData.name,
              email: formData.email
            });

            // Close modal and redirect to dashboard
            if (onClose) onClose();
            navigate('/dashboard');
          }
        }
      }

    } catch (err) {
      setError(mode === 'login' ? 'Invalid credentials. Please try again.' : 'Sign up failed. Try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const response = await axios.get(`${API_BASE_URL}/auth/google/login`);
      if (response.data.url) {
        // Store a flag to redirect after Google auth
        localStorage.setItem('googleAuthPending', 'true');
        window.location.href = response.data.url;
      }
    } catch (err) {
      console.error(err);
      setError('Could not initiate Google login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          {mode === 'login' ? 'Sign in to access your dashboard' : 'Sign up to get started with AI agents'}
        </p>
      </div>

      {/* Error Message */}
      {error && <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg"><p className="text-sm text-red-600">{error}</p></div>}

      {/* Google SSO */}
      <div className="mb-6">
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {isLoading ? 'Loading...' : 'Continue with Google'}
        </button>
      </div>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or {mode === 'login' ? 'continue with' : 'sign up with'}</span>
        </div>
      </div>

      {/* Login / Sign Up Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleInputChange}
              disabled={isLoading}
              className="appearance-none relative block w-full pl-3 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50"
              placeholder="Enter your full name"
            />
          </div>
        )}

        {/* Email/Phone Input */}
        <div>
          <label htmlFor={loginMethod} className="block text-sm font-medium text-gray-700 mb-1">
            {loginMethod === 'email' ? 'Email address' : 'Phone number'}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {loginMethod === 'email' ? <Mail className="h-5 w-5 text-gray-400" /> : <Phone className="h-5 w-5 text-gray-400" />}
            </div>
            <input
              id={loginMethod}
              name={loginMethod}
              type={loginMethod === 'email' ? 'email' : 'tel'}
              required
              value={loginMethod === 'email' ? formData.email : formData.phone}
              onChange={handleInputChange}
              disabled={isLoading}
              className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50"
              placeholder={loginMethod === 'email' ? 'Enter your email' : 'Enter your phone number'}
            />
          </div>
        </div>

        {/* Password Input */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={handleInputChange}
              disabled={isLoading}
              className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:opacity-50"
              placeholder="Enter your password"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                className="text-gray-400 hover:text-gray-600 focus:outline-none disabled:cursor-not-allowed"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#7FA0A8] hover:bg-[#6A8B94] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7FA0A8] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (mode === 'login' ? 'Signing in...' : 'Signing up...') : (mode === 'login' ? 'Sign in to Dashboard' : 'Create Account & Continue')}
          </button>
        </div>
      </form>

      {/* Switch Mode */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="font-medium text-[#7FA0A8] hover:text-[#6A8B94]"
          >
            {mode === 'login' ? 'Sign up now' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
};
