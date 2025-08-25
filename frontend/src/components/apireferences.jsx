import React, { useState } from 'react';
import { 
  Code, 
  Copy, 
  CheckCircle, 
  Book, 
  Key, 
  Globe, 
  Terminal,
  ExternalLink,
  Play,
  Settings,
  Shield,
  Zap
} from 'lucide-react';

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
      parameters: [
        { name: 'page', type: 'integer', required: false, description: 'Page number for pagination' },
        { name: 'limit', type: 'integer', required: false, description: 'Number of agents per page (max 100)' }
      ],
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
      parameters: [
        { name: 'name', type: 'string', required: true, description: 'Agent name' },
        { name: 'type', type: 'string', required: true, description: 'Agent type (conversational, analytical, creative)' },
        { name: 'description', type: 'string', required: false, description: 'Agent description' }
      ],
      response: `{
  "id": "agent_456",
  "name": "New Agent",
  "type": "conversational",
  "status": "active",
  "created_at": "2024-01-20T14:22:00Z"
}`
    },
    {
      id: 'execute-task',
      method: 'POST',
      endpoint: '/api/v1/agents/{agent_id}/tasks',
      description: 'Execute a task with a specific agent',
      parameters: [
        { name: 'agent_id', type: 'string', required: true, description: 'The ID of the agent' },
        { name: 'prompt', type: 'string', required: true, description: 'Task prompt or instruction' },
        { name: 'context', type: 'object', required: false, description: 'Additional context data' }
      ],
      response: `{
  "task_id": "task_789",
  "agent_id": "agent_123",
  "status": "completed",
  "result": "Task completed successfully",
  "execution_time": 1.23,
  "created_at": "2024-01-20T15:30:00Z"
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
.catch(error => console.error('Error:', error));`,
      createAgent: `// Create a new agent
const newAgent = {
  name: "My Custom Agent",
  type: "conversational",
  description: "A helpful customer service agent"
};

fetch('\${baseURL}/api/v1/agents', {
  method: 'POST',
  headers: headers,
  body: JSON.stringify(newAgent)
})
.then(response => response.json())
.then(data => console.log('Agent created:', data));`
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
print(agents)`,
      createAgent: `# Create a new agent
new_agent = {
    "name": "My Custom Agent",
    "type": "conversational",
    "description": "A helpful customer service agent"
}

response = requests.post(
    f"{base_url}/api/v1/agents",
    headers=headers,
    json=new_agent
)
print(response.json())`
    }
  };

  const [selectedLanguage, setSelectedLanguage] = useState('javascript');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-[#7FA0A8] to-[#6A8B94] rounded-lg">
              <Book className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">API References</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Complete documentation for integrating with our Multi-AI Agent platform
          </p>
        </div>

        {/* Quick Start Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <Key className="w-8 h-8 text-[#7FA0A8]" />
              <h3 className="text-lg font-semibold text-gray-900">Authentication</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Get started with API key authentication and secure access to your agents.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <Zap className="w-8 h-8 text-[#7FA0A8]" />
              <h3 className="text-lg font-semibold text-gray-900">Quick Start</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Make your first API call in minutes with our simple getting started guide.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-8 h-8 text-[#7FA0A8]" />
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
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Navigation</h3>
              <nav className="space-y-2">
                {[
                  { id: 'authentication', name: 'Authentication', icon: Key },
                  { id: 'endpoints', name: 'API Endpoints', icon: Globe },
                  { id: 'examples', name: 'Code Examples', icon: Code },
                  { id: 'sdks', name: 'SDKs & Libraries', icon: Terminal }
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
          </div>

          {/* Content Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              
              {/* Authentication Tab */}
              {activeTab === 'authentication' && (
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Key className="w-6 h-6 text-[#7FA0A8]" />
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
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
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
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Globe className="w-6 h-6 text-[#7FA0A8]" />
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
                        
                        {endpoint.parameters.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Parameters</h4>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-gray-200">
                                    <th className="text-left py-2 text-gray-700">Name</th>
                                    <th className="text-left py-2 text-gray-700">Type</th>
                                    <th className="text-left py-2 text-gray-700">Required</th>
                                    <th className="text-left py-2 text-gray-700">Description</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {endpoint.parameters.map((param, idx) => (
                                    <tr key={idx} className="border-b border-gray-100">
                                      <td className="py-2 font-mono text-xs">{param.name}</td>
                                      <td className="py-2 text-gray-600">{param.type}</td>
                                      <td className="py-2">
                                        <span className={`px-2 py-1 rounded text-xs ${
                                          param.required 
                                            ? 'bg-red-100 text-red-800' 
                                            : 'bg-gray-100 text-gray-600'
                                        }`}>
                                          {param.required ? 'Required' : 'Optional'}
                                        </span>
                                      </td>
                                      <td className="py-2 text-gray-600">{param.description}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Response Example</h4>
                          <div className="bg-gray-900 rounded-lg p-4 relative">
                            <button
                              onClick={() => copyToClipboard(endpoint.response, endpoint.id)}
                              className="absolute top-3 right-3 p-2 hover:bg-gray-700 rounded transition-colors"
                            >
                              {copiedCode === endpoint.id ? (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
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
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Code className="w-6 h-6 text-[#7FA0A8]" />
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
                        <div className="bg-gray-900 rounded-lg p-4 relative">
                          <button
                            onClick={() => copyToClipboard(code, `${selectedLanguage}-${key}`)}
                            className="absolute top-3 right-3 p-2 hover:bg-gray-700 rounded transition-colors"
                          >
                            {copiedCode === `${selectedLanguage}-${key}` ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
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
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Terminal className="w-6 h-6 text-[#7FA0A8]" />
                    <h2 className="text-xl font-semibold text-gray-900">SDKs & Libraries</h2>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      {
                        name: 'JavaScript SDK',
                        description: 'Official JavaScript/Node.js SDK for easy integration',
                        install: 'npm install @multiagent/sdk',
                        github: 'https://github.com/multiagent/js-sdk'
                      },
                      {
                        name: 'Python SDK',
                        description: 'Official Python SDK with async support',
                        install: 'pip install multiagent-sdk',
                        github: 'https://github.com/multiagent/python-sdk'
                      },
                      {
                        name: 'React Components',
                        description: 'Pre-built React components for quick UI integration',
                        install: 'npm install @multiagent/react',
                        github: 'https://github.com/multiagent/react-components'
                      },
                      {
                        name: 'REST API',
                        description: 'Direct REST API access for any programming language',
                        install: 'curl -X GET https://api.multiagent.com',
                        github: 'https://docs.multiagent.com/api'
                      }
                    ].map((sdk, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-5">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{sdk.name}</h3>
                        <p className="text-gray-600 mb-4">{sdk.description}</p>
                        
                        <div className="bg-gray-900 rounded-lg p-3 mb-4">
                          <code className="text-green-400 text-sm">{sdk.install}</code>
                        </div>
                        
                        <a
                          href={sdk.github}
                          className="inline-flex items-center space-x-2 text-[#7FA0A8] hover:text-[#6A8B94] transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span className="text-sm font-medium">View Documentation</span>
                        </a>
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

export default ApiReferences;