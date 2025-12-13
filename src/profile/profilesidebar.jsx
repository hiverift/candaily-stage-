// UserProfileSidebar.jsx
import React, { useState } from "react";
import { Home, ChevronRight, X, Menu, LogOut, User } from "lucide-react";

// Logo component
const Logo = ({ isCollapsed }) => (
  <div className="flex items-center gap-2 overflow-hidden transition-all duration-300">
    {/* Circle Logo */}
    <div className="w-7 h-7 rounded-full border-2 border-indigo-600 flex items-center justify-center shrink-0">
      <div className="w-3.5 h-3.5 bg-indigo-600 rounded-full" />
    </div>

    {/* Brand Name */}
    {!isCollapsed && (
      <span className="text-xl font-bold text-gray-900 whitespace-nowrap">
        Hiverift
      </span>
    )}
  </div>
);

export default function UserProfileSidebar({
  activeTab,
  setActiveTab,
  onBackHome,
  onLogout,
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  const menuItems = [
    {
      key: "profile",
      name: "Profile",
      icon: User,
    },
  ];

  const SidebarContent = ({ isFullSize }) => (
    <>
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 border-b border-gray-100 ${
          isCollapsed ? "flex-col gap-3" : ""
        }`}
      >
        <Logo isCollapsed={isCollapsed} />

        {/* Collapse Button (Desktop) */}
        {isFullSize && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-1 rounded-full text-gray-400 hover:bg-gray-100 transition flex-shrink-0 ${
              isCollapsed ? "mt-4" : ""
            }`}
          >
            <ChevronRight
              className={`w-5 h-5 transition-transform duration-300 ${
                isCollapsed ? "" : "rotate-180"
              }`}
            />
          </button>
        )}

        {/* Mobile Close Button */}
        {!isFullSize && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Back to Dashboard */}
      <div className={`p-4 ${isCollapsed ? "flex justify-center" : ""}`}>
        <button
          onClick={onBackHome}
          className={`flex items-center gap-2 px-4 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow-lg hover:bg-indigo-700 transition cursor-pointer${
            isCollapsed ? "w-12 h-12 justify-center" : "w-full"
          }`}
        >
          <Home className="w-5 h-5" />
          {!isCollapsed && <span>Back to Dashboard</span>}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 overflow-y-auto">
        <ul className="space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;

            return (
              <li key={item.key}>
                <button
                  onClick={() => {
                    setActiveTab(item.key);
                    if (!isFullSize) setIsMobileOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all
                    ${isCollapsed ? "justify-center p-0 w-12 h-12 mx-auto" : ""}
                    ${
                      isActive
                        ? "bg-[#D7E4FF] text-[#1A56DB] font-semibold"
                        : "text-gray-700 hover:bg-[#E2ECFF]"
                    }
                  `}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom User Info */}
      <div className="pt-2">
        <div className="border-t border-gray-200 my-2" />
        <div
          className={`p-4 flex ${
            isCollapsed ? "justify-center" : "items-center gap-3"
          }`}
        >
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-semibold shrink-0">
            {initials}
          </div>

          {!isCollapsed && (
            <div>
              <p className="text-sm font-medium text-gray-900 whitespace-nowrap">
                {userName}
              </p>
              <p className="text-xs text-gray-500 whitespace-nowrap">
                {userEmail}
              </p>
            </div>
          )}
        </div>

        {/* Logout */}
        <div className={`p-4 ${isCollapsed ? "flex justify-center" : ""}`}>
          <button
            onClick={onLogout}
            className={`flex items-center gap-2 text-red-600 font-medium hover:bg-red-50 px-4 py-3 rounded-xl transition cursor-pointer ${
              isCollapsed ? "justify-center w-12 h-12" : "w-full"
            }`}
          >
            <LogOut className="w-5 h-5 " />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/25 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex lg:flex-col lg:h-screen lg:bg-white lg:border-r lg:border-gray-200 transition-all duration-300 ${
          isCollapsed ? "lg:w-20" : "lg:w-60"
        }`}
      >
        <SidebarContent isFullSize={true} />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-60 bg-white shadow-2xl transform transition-transform duration-300 lg:hidden
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <SidebarContent isFullSize={false} />
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>

          <Logo isCollapsed={false} />

          <div className="w-10 h-10 rounded-full bg-transparent"></div>
        </div>
      </div>
    </>
  );
}
