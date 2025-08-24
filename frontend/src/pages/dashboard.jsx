import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Search, 
  Heart, 
  GraduationCap, 
  Cpu, 
  Settings, 
  Home, 
  BarChart3,
  ChevronRight,
  Sparkles,
  Activity,
  Brain,
  Stethoscope,
  BookOpen,
  Wifi
} from 'lucide-react';
import Profile from '../components/Profile'; // Import the Profile component
import PricingModal from '../components/PricingModal'; // Import the Pricing component

const Dashboard = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const localUserData = localStorage.getItem('user');
      if (localUserData) {
        setUserData(JSON.parse(localUserData));
        return;
      }

      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
        const response = await axios.get(`${API_BASE_URL}/auth/me`, { withCredentials: true });
        localStorage.setItem('user', JSON.stringify(response.data));
        setUserData(response.data);
      } catch (error) {
        console.error('Failed to fetch user data, redirecting to login.');
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  // Agent data
  const agents = [
    {
      id: 1,
      name: 'Research Agent',
      description: 'Advanced AI for research and data analysis with deep learning capabilities',
      icon: Search,
      color: 'from-blue-500 to-cyan-400',
      bgColor: 'bg-blue-50',
      status: 'Active',
      tasks: 142,
      efficiency: '97%'
    },
    {
      id: 2,
      name: 'Medical Agent',
      description: 'Healthcare AI assistant for medical diagnosis and patient care',
      icon: Stethoscope,
      color: 'from-green-500 to-emerald-400',
      bgColor: 'bg-green-50',
      status: 'Active',
      tasks: 89,
      efficiency: '94%'
    },
    {
      id: 3,
      name: 'Education Agent',
      description: 'Intelligent tutoring system for personalized learning experiences',
      icon: BookOpen,
      color: 'from-purple-500 to-pink-400',
      bgColor: 'bg-purple-50',
      status: 'Active',
      tasks: 67,
      efficiency: '96%'
    },
    {
      id: 4,
      name: 'IoT Agent',
      description: 'Smart device management and automation for connected ecosystems',
      icon: Wifi,
      color: 'from-orange-500 to-red-400',
      bgColor: 'bg-orange-50',
      status: 'Active',
      tasks: 234,
      efficiency: '99%'
    }
  ];

  const handleProfileClick = () => {
    setIsProfileOpen(true);
  };

  const handleCloseProfile = () => {
    setIsProfileOpen(false);
  };

  const handleUpgradeClick = () => {
    setIsPricingOpen(true);
  };

  const handleClosePricing = () => {
    setIsPricingOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl">
        {/* Profile Section */}
        <div className="p-6 border-b border-gray-700">
          <button
            onClick={handleProfileClick}
            className="w-full flex items-center space-x-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 group"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-[#7FA0A8] to-[#6A8B94] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-white">{userData ? userData.name : 'Guest'}</h3>
              <p className="text-sm text-gray-300">{userData ? userData.subscription_plan || 'Free User' : '...'}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-6 px-4">
          <div className="space-y-2">
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-[#7FA0A8] text-white shadow-lg">
              <Home className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </button>
            
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200">
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">Analytics</span>
            </button>
            
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200">
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </button>
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-6 left-6 right-6 w-[200px]">
          <button 
            onClick={handleUpgradeClick}
            className="w-full bg-gradient-to-r from-[#7FA0A8] to-[#6A8B94] rounded-lg p-3 hover:from-[#6A8B94] hover:to-[#7FA0A8] transition-all duration-300"
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-white" />
              <div>
                <h4 className="text-white font-medium text-sm">Upgrade Pro</h4>
                <p className="text-white/80 text-xs">Unlock premium features</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, <span className="text-[#7FA0A8]">{userData ? userData.name : 'Guest'}</span>! 👋
          </h1>
          <p className="text-xl text-gray-600">
            Manage your AI agents and monitor their performance
          </p>
        </div>

        {/* Agent Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {agents.map((agent) => (
            <Link to="/chat" key={agent.id} className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200">
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-r ${agent.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              {/* Card Content */}
              <div className="relative p-6">
                {/* Icon and Status */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl ${agent.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <agent.icon className={`w-7 h-7 bg-gradient-to-r ${agent.color} bg-clip-text text-transparent`} />
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-green-600">{agent.status}</span>
                  </div>
                </div>

                {/* Agent Name */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#7FA0A8] transition-colors duration-300">
                  {agent.name}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                  {agent.description}
                </p>

                {/* Stats */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{agent.tasks}</p>
                    <p className="text-xs text-gray-500">Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#7FA0A8]">{agent.efficiency}</p>
                    <p className="text-xs text-gray-500">Efficiency</p>
                  </div>
                  <button className="p-2 rounded-lg bg-gray-50 hover:bg-[#7FA0A8] hover:text-white transition-all duration-200 group">
                    <Activity className="w-4 h-4" />
                  </button>
                </div>

                {/* Hover Effect Button */}
                <button className="absolute inset-0 w-full h-full bg-transparent group-hover:bg-black/5 transition-all duration-300 rounded-2xl" />
              </div>

              {/* Animated Border */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#7FA0A8] transition-all duration-300 opacity-0 group-hover:opacity-100" />
            </Link>
          ))}
        </div>

        {/* Quick Stats Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Total Agents</h4>
                <p className="text-3xl font-bold text-[#7FA0A8] mt-2">4</p>
              </div>
              <Brain className="w-12 h-12 text-[#7FA0A8] opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Active Tasks</h4>
                <p className="text-3xl font-bold text-green-500 mt-2">532</p>
              </div>
              <Activity className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Avg Efficiency</h4>
                <p className="text-3xl font-bold text-purple-500 mt-2">96.5%</p>
              </div>
              <Sparkles className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      <Profile isOpen={isProfileOpen} onClose={handleCloseProfile} userData={userData} />
      
      {/* Pricing Modal */}
      <PricingModal isOpen={isPricingOpen} onClose={handleClosePricing} />
    </div>
  );
};

export default Dashboard;