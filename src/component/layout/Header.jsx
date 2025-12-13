// components/layout/Header.jsx
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Calendar } from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleEscape = (e) => e.key === "Escape" && setMobileMenuOpen(false);
    const handleClickOutside = (e) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
    { href: "#about", label: "About" },
  ];

  return (
    <>
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden" />
      )}

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 border-b border-gray-200/70 shadow-sm"
            : "bg-white/90 border-b border-transparent"
        } backdrop-blur-xl`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-3 group -ml-3 p-2 rounded-xl"
            >
              <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-2xl">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                BookEasy
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-10 lg:gap-12">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="relative text-gray-700 hover:text-gray-950 font-semibold text-sm lg:text-base"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center gap-5">
              <Link
                to="/login"
                className="px-5 py-2.5 text-gray-700 hover:text-gray-900 font-medium rounded-xl"
              >
                Log in
              </Link>

              <Link
                to="/signup"
                className="relative px-7 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-2xl shadow-lg"
              >
                Sign up
              </Link>
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-3 rounded-xl hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          ref={mobileMenuRef}
          className={`md:hidden overflow-hidden transition-all duration-500 ${
            mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-6 py-8 bg-white/95 backdrop-blur-2xl border-t border-gray-200 shadow-2xl">
            <nav className="space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-5 py-4 text-lg font-medium text-gray-800"
                >
                  {link.label}
                </a>
              ))}

              <div className="mt-8 pt-6 border-t border-gray-200 space-y-4">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-3 text-gray-700"
                >
                  Log in
                </Link>

                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold rounded-2xl shadow-lg"
                >
                  Sign up
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
