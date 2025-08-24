import React from 'react';
import Navbar from '../components/Navbar';
import ArchitectureDiagram from '../assets/homepage.drawio.svg';

const Homepage = () => {
  // Floating animation images data
  const floatingImages = [
    { id: 1, src: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=300&h=400&fit=crop&auto=format", delay: 0 },
    { id: 2, src: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=300&h=400&fit=crop&auto=format", delay: 1 },
    { id: 3, src: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=400&fit=crop&auto=format", delay: 2 },
    { id: 4, src: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&h=400&fit=crop&auto=format", delay: 0.5 },
    { id: 5, src: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=400&fit=crop&auto=format", delay: 1.5 },
    { id: 6, src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&auto=format", delay: 2.5 },
  ];

  return (
    <div className="min-h-screen bg-[#F2F2F2]">
      <Navbar />
      
      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center">
        <div className="w-full flex flex-col lg:flex-row items-center justify-between pt-15">
          
          {/* Left Content */}
          <div className="lg:w-1/2 space-y-8 text-center lg:text-left px-8 lg:px-16 mt-[-100px]">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="text-gray-800">The</span>{' '}
              <span className="bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 bg-clip-text text-transparent">Leading</span>{' '}
              <span className="text-gray-800">Multi-Agent</span>{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">Platform</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-2xl">
              Revolutionize your workflow with intelligent AI agents that collaborate seamlessly. 
              Experience the future of automation where multiple AI agents work together to solve complex problems.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button className="bg-[#7FA0A8] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#6A8B94] transition-all duration-300 transform hover:scale-105 shadow-2xl">
                Agent Studio
              </button>
              <button className="border-2 border-[#7FA0A8] text-[#7FA0A8] px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#7FA0A8] hover:text-white transition-all duration-300 transform hover:scale-105">
                Watch Demo
              </button>
            </div>
          </div>
          
          {/* Right Content - Multi-Agent Architecture SVG */}
          <div className="lg:w-1/2 relative h-screen flex items-start justify-center mt-0 lg:mt-15 mr-5">
            <div className="w-full max-w-4xl relative">
              <div className="architecture-container bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10 shadow-2xl">
                <div className="text-center mb-6">
                  <h3 className="text-3xl font-bold text-[#7FA0A8] mb-2">Multi-Agent Architecture</h3>
                  <p className="text-gray-600">Our innovative system design powering intelligent collaboration</p>
                </div>
                
                {/* Your Architecture SVG */}
                <div className="svg-container bg-white rounded-2xl p-4 shadow-inner">
                  <img 
                    src={ArchitectureDiagram} 
                    alt="Multi-Agent Architecture Diagram" 
                    className="w-full h-auto max-h-[500px] object-contain mx-auto"
                  />
                </div>
                
                {/* Optional: Add some key points about your architecture */}
                <div className="flex justify-around mt-6 text-center">
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-[#7FA0A8]">∞</div>
                    <div className="text-sm text-gray-600">Scalable Agents</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-[#7FA0A8]">⚡</div>
                    <div className="text-sm text-gray-600">Real-time Sync</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-[#7FA0A8]">🔄</div>
                    <div className="text-sm text-gray-600">Auto Coordination</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="min-h-screen bg-white py-20">
        <div className="w-full px-8 lg:px-16">
          <div className="text-center mb-5">
            <h2 className="text-5xl font-bold text-[#7FA0A8] mb-6">Our Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the powerful capabilities that make our multi-agent platform the future of AI automation
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: "Smart Collaboration",
                description: "AI agents communicate and coordinate to solve complex tasks efficiently",
                icon: "🤝"
              },
              {
                title: "Real-time Analytics",
                description: "Monitor agent performance and get insights with advanced analytics",
                icon: "📊"
              },
              {
                title: "Scalable Architecture",
                description: "Deploy thousands of agents with enterprise-grade infrastructure",
                icon: "🚀"
              },
              {
                title: "Custom Workflows",
                description: "Build tailored automation workflows for your specific needs",
                icon: "⚙️"
              },
              {
                title: "Security First",
                description: "Enterprise-level security with end-to-end encryption",
                icon: "🔒"
              },
              {
                title: "24/7 Support",
                description: "Round-the-clock technical support from our expert team",
                icon: "💬"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-[#7FA0A8] mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
     <section id="about" className="min-h-screen bg-white py-20">
  <div className="w-full px-8 lg:px-16">
    <div className="text-center mb-16">
      <h2 className="text-5xl font-bold text-black mb-6">About Us</h2>
      <p className="text-xl text-black/80 max-w-3xl mx-auto">
        We're pioneering the future of artificial intelligence through innovative multi-agent systems
      </p>
    </div>
    
    <div className="grid lg:grid-cols-2 gap-16 items-center">
      <div className="space-y-8">
        <h3 className="text-3xl font-bold text-black">
          Revolutionizing AI Collaboration
        </h3>
        <p className="text-lg text-black/80 leading-relaxed">
          Founded by AI visionaries, our platform represents a breakthrough in multi-agent artificial intelligence. 
          We believe the future lies not in singular AI systems, but in networks of intelligent agents working 
          together to solve humanity's greatest challenges.
        </p>
        <div className="grid sm:grid-cols-2 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-600">1M+</div>
            <div className="text-black/70">Active Agents</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-600">500+</div>
            <div className="text-black/70">Enterprise Clients</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-600">99.9%</div>
            <div className="text-black/70">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-600">24/7</div>
            <div className="text-black/70">Support</div>
          </div>
        </div>
      </div>
      
      <div className="relative">
        <div className="bg-black/5 backdrop-blur-md rounded-3xl p-8 border border-black/20">
          <h4 className="text-2xl font-bold text-black mb-6">Our Mission</h4>
          <p className="text-black/80 leading-relaxed mb-6">
            To democratize advanced AI capabilities through collaborative multi-agent systems that amplify 
            human potential and drive innovation across industries.
          </p>
          <div className="space-y-4">
            {["Innovation First", "Customer Centric", "Ethical AI", "Global Impact"].map((value, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                <span className="text-black/80">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
{/* Footer Section */}
<footer className="bg-[#1A1A1A] text-gray-300 py-12">
  <div className="w-full px-8 lg:px-16 max-w-7xl mx-auto grid md:grid-cols-4 gap-10">
    
    {/* Brand */}
    <div>
      <h3 className="text-2xl font-bold text-white mb-4">NEXUSAI</h3>
      <p className="text-gray-400 text-sm leading-relaxed">
        Pioneering the future of artificial intelligence through collaborative multi-agent systems. 
        Building technology that amplifies human potential.
      </p>
    </div>

    {/* Links */}
    <div>
      <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
      <ul className="space-y-2">
        <li><a href="#home" className="hover:text-yellow-400">Home</a></li>
        <li><a href="#features" className="hover:text-yellow-400">Features</a></li>
        <li><a href="#about" className="hover:text-yellow-400">About Us</a></li>
        <li><a href="#contact" className="hover:text-yellow-400">Contact</a></li>
      </ul>
    </div>

    {/* Contact */}
    <div>
      <h4 className="text-lg font-semibold text-white mb-4">Contact Us</h4>
      <ul className="space-y-2 text-sm">
        <li>Email: <a href="mailto:info@ainexus.com" className="hover:text-yellow-400">info@ainexus.com</a></li>
        <li>Phone: <span className="hover:text-yellow-400">+1 (555) 123-4567</span></li>
        <li>Location: <span className="hover:text-yellow-400">San Francisco, CA</span></li>
      </ul>
    </div>

    {/* Social */}
    <div>
      <h4 className="text-lg font-semibold text-white mb-4">Follow Us</h4>
      <div className="flex space-x-4 text-xl">
        <a href="#" className="hover:text-yellow-400">🌐</a>
        <a href="#" className="hover:text-yellow-400">🐦</a>
        <a href="#" className="hover:text-yellow-400">💼</a>
        <a href="#" className="hover:text-yellow-400">📸</a>
      </div>
    </div>
  </div>

  {/* Bottom Bar */}
  <div className="border-t border-gray-700 mt-12 pt-6 text-center text-gray-500 text-sm">
    © {new Date().getFullYear()} NEXUSAI. All rights reserved.
  </div>
</footer>



      {/* Architecture Animation Keyframes */}
      <style jsx>{`
        .architecture-container {
          animation: fadeInScale 1.2s ease-out;
        }
        
        @keyframes fadeInScale {
          0% { 
            opacity: 0; 
            transform: scale(0.95) translateY(30px); 
          }
          100% { 
            opacity: 1; 
            transform: scale(1) translateY(0); 
          }
        }
        
        .architecture-container:hover {
          transform: scale(1.02);
          transition: all 0.3s ease;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        
        .svg-container {
          transition: all 0.3s ease;
        }
        
        .svg-container:hover {
          transform: scale(1.05);
          box-shadow: 0 20px 40px -12px rgba(127, 160, 168, 0.3);
        }
        
        .architecture-container img {
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
          transition: filter 0.3s ease;
        }
        
        .architecture-container:hover img {
          filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15));
        }
      `}</style>
    </div>
  );
};

export default Homepage;