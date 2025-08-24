import { useState, useCallback, useMemo } from "react";
import { Menu, X } from "lucide-react";

// Memoized components to prevent unnecessary re-renders
const Logo = () => (
  <div className="flex items-center space-x-3">
    <div className="relative">
      <div className="w-10 h-10 bg-gradient-to-br from-[#7FA0A8] to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
        <span className="text-white font-bold text-xl">NA</span>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-[#7FA0A8] to-purple-500 rounded-xl blur opacity-50 -z-10" />
    </div>
    <span className="text-gray-800 font-bold text-xl tracking-wide hidden sm:block">
      NEXUS<span className="text-[#7FA0A8]">AI</span>
    </span>
  </div>
);

const NavLink = ({ item, onClick, isMobile = false, index, totalItems }) => {
  const baseClasses = "text-gray-700 hover:text-gray-900 font-medium transition-all duration-300 cursor-pointer";
  const desktopClasses = "relative px-6 py-2 rounded-xl group overflow-hidden hover:bg-white/10 hover:shadow-lg";
  const mobileClasses = `block px-6 py-3 hover:bg-white/10 duration-200 ${
    index !== totalItems - 1 ? "border-b border-gray-200" : ""
  }`;

 const scrollToSection = () => {
  const element = document.getElementById(item.to);
  if (element) {
    const offset = 20; // height of your navbar
    const y = element.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: y, behavior: "smooth" });
  }
  if (onClick) onClick();
};


  return (
    <button
      onClick={scrollToSection}
      className={`${baseClasses} ${isMobile ? mobileClasses : desktopClasses}`}
    >
      {!isMobile && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-[#7FA0A8]/20 to-purple-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="relative z-10">{item.name}</span>
          <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-[#7FA0A8] to-purple-500 group-hover:w-full group-hover:left-0 transition-all duration-300 rounded-full" />
        </>
      )}
      {isMobile && item.name}
    </button>
  );
};

const CTAButton = ({ onClick, isMobile = false }) => {
  const baseClasses = "bg-gradient-to-r from-[#7FA0A8] to-[#6A8B94] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer";
  const desktopClasses = "relative px-6 py-2.5 overflow-hidden group";
  const mobileClasses = "w-full block text-center py-3";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isMobile ? mobileClasses : desktopClasses}`}
    >
      {!isMobile && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-full group-hover:animate-shine" />
      )}
      <span className={!isMobile ? "relative z-10" : ""}>Get Started</span>
    </button>
  );
};

const GlassContainer = ({ children, className = "" }) => (
  <div className={`relative bg-white/20 backdrop-blur-md border-b border-white/30 overflow-hidden ${className}`}>
    {children}
  </div>
);

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Memoize navigation items to prevent recreation on every render
  const navItems = useMemo(() => [
    { name: "Home", to: "home" },
    { name: "Features", to: "features" },
    { name: "About Us", to: "about" },
  ], []);

  // Memoize callbacks to prevent unnecessary re-renders
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleMobileLinkClick = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // Memoize mobile menu transition classes
  const mobileMenuClasses = useMemo(() => ({
    container: `fixed inset-x-0 top-0 z-40 md:hidden transition-all duration-300 ease-out ${
      isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
    }`,
    content: `relative mt-0 mx-6 transform transition-all duration-300 ease-out ${
      isMobileMenuOpen ? "translate-y-0 scale-100" : "-translate-y-4 scale-95"
    }`
  }), [isMobileMenuOpen]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-black/30 border-[0.1px]">
        <div className="w-full">
          <GlassContainer>
 
              <div className="relative z-10 px-6 py-4 flex items-center justify-between">
              <Logo />

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-1">
                {navItems.map((item) => (
                  <NavLink key={item.name} item={item} />
                ))}
              </div>

              {/* Desktop CTA Button */}
              <div className="hidden md:block">
                <CTAButton />
              </div>

              {/* Mobile menu button */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 text-gray-800 hover:bg-white/10 rounded-lg transition-colors duration-200"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </GlassContainer>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={mobileMenuClasses.container}>
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />

        <GlassContainer className={mobileMenuClasses.content}>
          <div className="relative z-10 py-6">
            {navItems.map((item, index) => (
              <NavLink
                key={item.name}
                item={item}
                onClick={handleMobileLinkClick}
                isMobile={true}
                index={index}
                totalItems={navItems.length}
              />
            ))}

            {/* Mobile CTA */}
            <div className="px-6 pt-4">
              <CTAButton onClick={handleMobileLinkClick} isMobile={true} />
            </div>
          </div>
        </GlassContainer>
      </div>

      <style jsx>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%) skewX(-12deg);
          }
          100% {
            transform: translateX(200%) skewX(-12deg);
          }
        }
        .animate-shine {
          animation: shine 1.5s ease-out;
        }
        html {
          scroll-padding-top: 120px;
        }
      `}</style>
    </>
  );
};

export default Navbar;