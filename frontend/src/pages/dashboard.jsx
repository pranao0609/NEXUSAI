import React, { useState } from 'react';
import { 
  User, 
  Search, 
  Heart, 
  GraduationCap, 
  Cpu, 
  Settings, 
  Home, 
  Book,
  BarChart3,
  ChevronRight,
  Sparkles,
  Activity,
  Brain,
  Stethoscope,
  BookOpen,
  Wifi,
  DollarSign
} from 'lucide-react';
import Profile from '../components/profile';
import PricingModal from '../components/PricingModal';



// API References Component
const ApiReferences = () => {
  const [copiedCode, setCopiedCode] = useState('');
  const [activeTab, setActiveTab] = useState('authentication');

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const apiEndpoints = [
    {
      id: 'list-agents',
      method: 'GET',
      endpoint: '/api/v1/agents',
      description: 'Retrieve all AI agents for your account',
      response: `{
  "agents": [
    {
      "id": "agent_123",
      "name": "Customer Support Bot",
      "type": "conversational",
      "status": "active",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 25,
  "page": 1
}`
    },
    {
      id: 'create-agent',
      method: 'POST',
      endpoint: '/api/v1/agents',
      description: 'Create a new AI agent',
      response: `{
  "id": "agent_456",
  "name": "New Agent",
  "type": "conversational",
  "status": "active",
  "created_at": "2024-01-20T14:22:00Z"
}`
    }
  ];

  const codeExamples = {
    javascript: {
      authentication: `// Initialize the API client
const apiKey = 'your_api_key_here';
const baseURL = 'https://api.multiagent.com';

const headers = {
  'Authorization': \`Bearer \${apiKey}\`,
  'Content-Type': 'application/json'
};`,
      listAgents: `// Get all agents
fetch('\${baseURL}/api/v1/agents', {
  method: 'GET',
  headers: headers
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`
    },
    python: {
      authentication: `import requests

# Initialize the API client
api_key = "your_api_key_here"
base_url = "https://api.multiagent.com"

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}`,
      listAgents: `# Get all agents
response = requests.get(f"{base_url}/api/v1/agents", headers=headers)
agents = response.json()
print(agents)`
    }
  };

  const [selectedLanguage, setSelectedLanguage] = useState('javascript');

  return (
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-[#7FA0A8] to-[#6A8B94] rounded-lg">
              <Book className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">API References</h1>
          </div>
          <p className="text-xl text-gray-600">
            Complete documentation for integrating with our Multi-AI Agent platform
          </p>
        </div>

        {/* Quick Start Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <Settings className="w-8 h-8 text-[#7FA0A8]" />
              <h3 className="text-lg font-semibold text-gray-900">Authentication</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Get started with API key authentication and secure access to your agents.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <Sparkles className="w-8 h-8 text-[#7FA0A8]" />
              <h3 className="text-lg font-semibold text-gray-900">Quick Start</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Make your first API call in minutes with our simple getting started guide.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <Activity className="w-8 h-8 text-[#7FA0A8]" />
              <h3 className="text-lg font-semibold text-gray-900">Rate Limits</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Understand API limits: 1000 requests/hour for free tier, unlimited for Enterprise.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Navigation Tabs */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Navigation</h3>
              <nav className="space-y-2">
                {[
                  { id: 'authentication', name: 'Authentication', icon: Settings },
                  { id: 'endpoints', name: 'API Endpoints', icon: Activity },
                  { id: 'examples', name: 'Code Examples', icon: Book },
                  { id: 'sdks', name: 'SDKs & Libraries', icon: BookOpen }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === item.id
                        ? 'bg-[#7FA0A8] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Pricing Box */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-400 rounded-lg">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">API Pricing</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Free Tier</span>
                  <span className="text-sm font-semibold text-gray-900">1K req/hour</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Pro Plan</span>
                  <span className="text-sm font-semibold text-[#7FA0A8]">$0.002/req</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Enterprise</span>
                  <span className="text-sm font-semibold text-purple-600">Custom</span>
                </div>
              </div>
              
              <button className="w-full mt-4 bg-gradient-to-r from-[#7FA0A8] to-[#6A8B94] text-white px-3 py-2 rounded-lg text-sm font-medium hover:from-[#6A8B94] hover:to-[#7FA0A8] transition-all duration-200">
                View Full Pricing
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              
              {/* Authentication Tab */}
              {activeTab === 'authentication' && (
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <Settings className="w-6 h-6 text-[#7FA0A8]" />
                    <h2 className="text-xl font-semibold text-gray-900">Authentication</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">API Key Authentication</h3>
                      <p className="text-gray-600 mb-4">
                        All API requests require authentication using your API key. Include your API key in the Authorization header:
                      </p>
                      
                      <div className="bg-gray-900 rounded-lg p-4 relative">
                        <button
                          onClick={() => copyToClipboard('Authorization: Bearer your_api_key_here', 'auth-header')}
                          className="absolute top-3 right-3 p-2 hover:bg-gray-700 rounded transition-colors"
                        >
                          {copiedCode === 'auth-header' ? (
                            <span className="text-green-400 text-xs">Copied!</span>
                          ) : (
                            <span className="text-gray-400 text-xs">Copy</span>
                          )}
                        </button>
                        <code className="text-green-400 text-sm">
                          Authorization: Bearer your_api_key_here
                        </code>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Settings className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-semibold text-blue-900 mb-1">Getting Your API Key</h4>
                          <p className="text-sm text-blue-800">
                            You can find your API key in your dashboard under Profile → API Settings. 
                            Keep your API key secure and never expose it in client-side code.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* API Endpoints Tab */}
              {activeTab === 'endpoints' && (
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <Activity className="w-6 h-6 text-[#7FA0A8]" />
                    <h2 className="text-xl font-semibold text-gray-900">API Endpoints</h2>
                  </div>
                  
                  <div className="space-y-6">
                    {apiEndpoints.map((endpoint) => (
                      <div key={endpoint.id} className="border border-gray-200 rounded-lg p-5">
                        <div className="flex items-center space-x-3 mb-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                            endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {endpoint.method}
                          </span>
                          <code className="text-sm font-mono text-gray-900">{endpoint.endpoint}</code>
                        </div>
                        
                        <p className="text-gray-600 mb-4">{endpoint.description}</p>
                        
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Response Example</h4>
                          <div className="bg-gray-900 rounded-lg p-4">
                            <pre className="text-green-400 text-xs overflow-x-auto">
                              {endpoint.response}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Code Examples Tab */}
              {activeTab === 'examples' && (
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <Book className="w-6 h-6 text-[#7FA0A8]" />
                    <h2 className="text-xl font-semibold text-gray-900">Code Examples</h2>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Language Selector */}
                    <div className="flex space-x-2">
                      {Object.keys(codeExamples).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setSelectedLanguage(lang)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedLanguage === lang
                              ? 'bg-[#7FA0A8] text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </button>
                      ))}
                    </div>
                    
                    {/* Code Examples */}
                    {Object.entries(codeExamples[selectedLanguage]).map(([key, code]) => (
                      <div key={key}>
                        <h3 className="text-lg font-medium text-gray-900 mb-3 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h3>
                        <div className="bg-gray-900 rounded-lg p-4">
                          <pre className="text-green-400 text-sm overflow-x-auto">
                            {code}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SDKs Tab */}
              {activeTab === 'sdks' && (
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <BookOpen className="w-6 h-6 text-[#7FA0A8]" />
                    <h2 className="text-xl font-semibold text-gray-900">SDKs & Libraries</h2>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      {
                        name: 'JavaScript SDK',
                        description: 'Official JavaScript/Node.js SDK for easy integration',
                        install: 'npm install @multiagent/sdk'
                      },
                      {
                        name: 'Python SDK',
                        description: 'Official Python SDK with async support',
                        install: 'pip install multiagent-sdk'
                      }
                    ].map((sdk, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-5">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{sdk.name}</h3>
                        <p className="text-gray-600 mb-4">{sdk.description}</p>
                        
                        <div className="bg-gray-900 rounded-lg p-3">
                          <code className="text-green-400 text-sm">{sdk.install}</code>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

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
              <h3 className="font-semibold text-white">John Doe</h3>
              <p className="text-sm text-gray-300">Premium User</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-6 px-4">
          <div className="space-y-2">
            <button 
              onClick={() => setCurrentView('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                currentView === 'dashboard' 
                  ? 'bg-[#7FA0A8] text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </button>
            
            <button 
              onClick={() => setCurrentView('api-references')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                currentView === 'api-references' 
                  ? 'bg-[#7FA0A8] text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">API References</span>
            </button>
            
            <button 
              onClick={() => setCurrentView('settings')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                currentView === 'settings' 
                  ? 'bg-[#7FA0A8] text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
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

      {/* Main Content - Conditional Rendering */}
      {currentView === 'dashboard' && (
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back, <span className="text-[#7FA0A8]">John</span>! 👋
            </h1>
            <p className="text-xl text-gray-600">
              Manage your AI agents and monitor their performance
            </p>
          </div>

          {/* Agent Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200"
              >
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
              </div>
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
      )}

      {currentView === 'api-references' && <ApiReferences />}

      {currentView === 'settings' && (
        <div className="flex-1 p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-xl text-gray-600">Configure your application settings</p>
        </div>
      )}

      {/* Profile Modal */}
      <Profile isOpen={isProfileOpen} onClose={handleCloseProfile} />
      
      {/* Pricing Modal */}
      <PricingModal isOpen={isPricingOpen} onClose={handleClosePricing} />
    </div>
  );
};

export default Dashboard;