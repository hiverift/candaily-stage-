import React, { useState, useRef, useEffect } from "react";
import { UserPlus, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsAccountMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logout function
  const handleLogout = () => {
    localStorage.clear(); // Clear all tokens / user data
    navigate("/"); // Redirect to Home
  };

  const user = JSON.parse(localStorage.getItem("user"));
  const userEmail = user?.email || "No email found";
  const userName = user?.name || "User";

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const initials = getInitials(userName);

  return (
    <header className=" bg-white w-full">
      <div className="flex items-center justify-end px-4 py-3 w-full">
        {/* Container for Invite Button + Avatar */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Invite Button */}
          <button
            aria-label="Invite user"
            className="
              text-gray-600 hover:text-gray-900
              transition-colors p-2 rounded-full
              hover:bg-gray-100
              flex-shrink-0
            "
          >
            <UserPlus className="w-5 h-5" />
          </button>

          {/* Avatar + Dropdown */}
          <div className="relative flex-shrink-0 z-40 md:mr-40 lg:mr-40" ref={dropdownRef}>
            <button
              onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              className="flex items-center p-1 rounded-full"
            >
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-semibold shrink-0">
                {initials}
              </div>

              <ChevronDown
                className={`w-4 h-4 text-gray-400 ml-1 transition-transform cursor-pointer${
                  isAccountMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown */}
            {isAccountMenuOpen && (
              <div
                className="
                  absolute right-0 top-full mt-2
                  w-64 max-w-[90vw]
                  bg-white border border-gray-200 shadow-xl
                  rounded-lg py-2 z-50
                "
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    Signed in as
                  </p>
                  <p className="text-sm text-gray-600 truncate">{userEmail}</p>
                </div>

                <button
                  onClick={() => navigate("/profile")}
                  className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Your profile
                </button>
                {/* <a className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                  Account settings
                </a>
                <a className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                  Billing
                </a>
                <a className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                  Team settings
                </a> */}

                <div className="border-t border-gray-100 mt-2 pt-2">
                  <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">
                    Help & support
                  </button>

                  {/* SIGN OUT WITH REDIRECT */}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
