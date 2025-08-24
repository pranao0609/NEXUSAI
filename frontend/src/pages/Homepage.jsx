import React from 'react';
import Navbar from '../components/Navbar';

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
      <section id="home" className="min-h-screen ">
        <div className="w-full flex flex-col lg:flex-row items-center justify-between pt-20">
          
          {/* Left Content */}
          <div className="lg:w-1/2 space-y-8 text-center lg:text-left px-8 lg:px-16">
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
                Start Free Trial
              </button>
              <button className="border-2 border-[#7FA0A8] text-[#7FA0A8] px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#7FA0A8] hover:text-white transition-all duration-300 transform hover:scale-105">
                Watch Demo
              </button>
            </div>
          </div>
          
          {/* Right Content - Floating Images */}
          <div className="lg:w-1/2 relative h-screen flex items-center justify-center mt-12 lg:mt-0">
            <div className="grid grid-cols-2 gap-8 relative">
              {/* Column 1 */}
              <div className="space-y-8">
                {floatingImages.slice(0, 3).map((img, index) => (
                  <div
                    key={img.id}
                    className="relative overflow-hidden rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
                    style={{
                      animation: `float ${3 + index}s ease-in-out infinite`,
                      animationDelay: `${img.delay}s`
                    }}
                  >
                    <img
                      src={img.src}
                      alt={`AI Technology ${img.id}`}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>
                ))}
              </div>
              
              {/* Column 2 */}
              <div className="space-y-8 mt-16">
                {floatingImages.slice(3, 6).map((img, index) => (
                  <div
                    key={img.id}
                    className="relative overflow-hidden rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
                    style={{
                      animation: `float ${3.5 + index}s ease-in-out infinite`,
                      animationDelay: `${img.delay}s`
                    }}
                  >
                    <img
                      src={img.src}
                      alt={`AI Technology ${img.id}`}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Animation Keyframes */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

export default Homepage;