import React from 'react';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/10 border-b border-white/20">
      <div className="w-full px-8 lg:px-16 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="text-2xl font-bold text-gray-800">
            MultiAgent<span className="text-[#7FA0A8]">AI</span>
          </div>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-gray-700 hover:text-gray-900 transition-colors duration-300 font-medium">
              Home
            </a>
            <a href="#features" className="text-gray-700 hover:text-gray-900 transition-colors duration-300 font-medium">
              Features
            </a>
            <a href="#about" className="text-gray-700 hover:text-gray-900 transition-colors duration-300 font-medium">
              About Us
            </a>
          </div>
          
          {/* Get Started Button */}
          <button className="bg-[#7FA0A8] hover:bg-[#6A8B94] text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            Get Started
          </button>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="text-gray-800 p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;