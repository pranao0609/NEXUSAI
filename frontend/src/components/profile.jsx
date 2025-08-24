import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  CreditCard, 
  Crown, 
  LogOut, 
  X, 
  Edit3, 
  Shield,
  Calendar,
  Activity,
  Star
} from 'lucide-react';

const Profile = ({ isOpen, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    joinDate: '2024-01-15',
    avatar: null
  });

  // Mock user data - replace with real data from your backend
  const userData = {
    ...userInfo,
    credits: {
      used: 750,
      total: 1000,
      percentage: 75
    },
    subscription: {
      plan: 'Premium',
      status: 'Active',
      nextBilling: '2025-09-25',
      price: '$29.99/month'
    }
  };

  const handleLogout = () => {
    // Add your logout logic here
    console.log('Logging out...');
    // Example: redirect to login page, clear auth tokens, etc.
  };

  const handleSaveProfile = () => {
    // Add your save profile logic here
    setIsEditing(false);
    console.log('Profile saved:', userInfo);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#7FA0A8] to-[#6A8B94] px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="p-6 max-h-[calc(90vh-80px)] overflow-y-auto">
          {/* Profile Picture & Basic Info */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <div className="w-20 h-20 bg-gradient-to-r from-[#7FA0A8] to-[#6A8B94] rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              {isEditing && (
                <button className="absolute -bottom-1 -right-1 p-2 bg-blue-500 rounded-full text-white hover:bg-blue-600 transition-colors">
                  <Edit3 className="w-3 h-3" />
                </button>
              )}
            </div>
            
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={userInfo.name}
                  onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                  className="text-xl font-bold text-center w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7FA0A8]"
                />
                <input
                  type="email"
                  value={userInfo.email}
                  onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                  className="text-gray-600 text-center w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7FA0A8]"
                />
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-gray-900">{userData.name}</h3>
                <p className="text-gray-600">{userData.email}</p>
              </div>
            )}
          </div>

          {/* Profile Details */}
          <div className="space-y-4">
            {/* Email */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
              <Mail className="w-5 h-5 text-[#7FA0A8]" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Email</p>
                <p className="text-gray-900">{userData.email}</p>
              </div>
            </div>

            {/* Credits Usage */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">Credits</span>
                </div>
                <span className="text-sm text-gray-600">
                  {userData.credits.used} / {userData.credits.total} used
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${userData.credits.percentage}%` }}
                />
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{userData.credits.total - userData.credits.used} credits remaining</span>
                <span className="text-blue-600 font-medium">{userData.credits.percentage}% used</span>
              </div>
            </div>

            {/* Subscription Plan */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Crown className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-gray-900">Subscription</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-sm font-medium text-green-600">{userData.subscription.status}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan</span>
                  <span className="font-medium text-purple-600">{userData.subscription.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price</span>
                  <span className="font-medium text-gray-900">{userData.subscription.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Next Billing</span>
                  <span className="font-medium text-gray-900">{userData.subscription.nextBilling}</span>
                </div>
              </div>
            </div>

            {/* Member Since */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
              <Calendar className="w-5 h-5 text-[#7FA0A8]" />
              <div>
                <p className="text-sm font-medium text-gray-700">Member Since</p>
                <p className="text-gray-900">{new Date(userData.joinDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 space-y-3">
            {isEditing ? (
              <div className="flex space-x-3">
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 bg-[#7FA0A8] text-white py-3 px-4 rounded-xl font-semibold hover:bg-[#6A8B94] transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-[#7FA0A8] text-white py-3 px-4 rounded-xl font-semibold hover:bg-[#6A8B94] transition-colors flex items-center justify-center space-x-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="w-full bg-red-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;