// Sidebar.jsx
import React from "react";
import {
  CalendarDays,
  Video,
  Clock,
  Menu,
  X,
  ChevronRight,
  Users,
  Share2,
  Grid,
  Shuffle,
} from "lucide-react";
import eventBus from "../lib/eventBus";

// Logo
const CalendlyLogo = ({ isCollapsed }) => (
  <div className="flex items-center gap-1 overflow-hidden transition-all duration-300">
    <div className="w-6 h-6 rounded-full border-2 border-indigo-600 flex items-center justify-center `shrink-0`">
      <div className="w-3 h-3 bg-indigo-600 rounded-full" />
    </div>
    {!isCollapsed && (
      <span className="text-xl font-bold text-gray-900 whitespace-nowrap">
        Hiverift
      </span>
    )}
  </div>
);

export default function Sidebar({ activeContent, setActiveContent }) {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const mainMenuItems = [
    { name: "Scheduling", key: "scheduling", icon: CalendarDays },
    { name: "Meetings", key: "meetings", icon: Video },
    { name: "Availability", key: "availability", icon: Clock },
  ];

  const allMenuItems = [...mainMenuItems];
  const currentItem = allMenuItems.find((item) => item.key === activeContent);

  const user = JSON.parse(localStorage.getItem("user"));
  const userName = user?.name || " User";
  const userEmail = user?.email || "No email";

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const initials = getInitials(userName);

  const SidebarContent = ({ isFullSize }) => (
    <>
      {/* HEADER */}
      <div
        className={`flex items-center justify-between px-4 py-3 border-b border-gray-100 ${
          isCollapsed ? "flex-col gap-3" : ""
        }`}
      >
        <CalendlyLogo isCollapsed={isCollapsed} />

        {/* COLLAPSE BUTTON (DESKTOP) */}
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

        {/* MOBILE CLOSE BUTTON */}
        {!isFullSize && (
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* CREATE BUTTON */}
      <div className={`p-4 ${isCollapsed ? "flex justify-center" : ""}`}>
        <button
          onClick={() => {
            eventBus.emit("openCreateEventModal");
          }}
          className={`flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow-lg hover:bg-indigo-700 transition-colors ${
            isCollapsed ? "w-12 h-12 p-0" : "w-full"
          }`}
        >
          <div
            className={`w-4 h-4 text-white font-bold text-lg leading-none ${
              !isCollapsed ? "flex" : "flex items-center justify-center"
            }`}
          >
            +
          </div>
          {!isCollapsed && <span>Create</span>}
        </button>
      </div>

      {/* NAVIGATION TABS */}
      <nav className="flex-1 px-2 overflow-y-auto">
        <ul className="space-y-0.5">
          {mainMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeContent === item.key;

            return (
              <li key={item.key}>
                <button
                  onClick={() => {
                    setActiveContent(item.key);
                    if (!isFullSize) setIsMobileOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-150
                    ${isCollapsed ? "justify-center w-12 h-12 p-0 mx-auto" : ""}
                    ${
                      isActive
                        ? "bg-[#D7E4FF] text-[#1A56DB] font-semibold" // ACTIVE COLOR
                        : "text-gray-700 hover:bg-[#E2ECFF]" // LIGHT BLUE HOVER
                    }
                  `}
                >
                  <Icon className="w-5 h-5  `shrink-0`" />

                  {!isCollapsed && (
                    <span className="flex-1 text-left whitespace-nowrap">
                      {item.name}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* BOTTOM USER SECTION */}
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
            <div className="flex-1 text-left overflow-hidden">
              <p className="text-sm font-medium text-gray-900 whitespace-nowrap">
                {userName}
              </p>
              <p className="text-xs text-gray-500 whitespace-nowrap">
                {userEmail}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* MOBILE OVERLAY */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/25 backdrop-blur-[2px] z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* DESKTOP SIDEBAR */}
      <aside
        className={`hidden lg:flex lg:flex-col lg:h-screen lg:bg-white lg:border-r lg:border-gray-200 transition-all duration-300 flex-shrink-0 ${
          isCollapsed ? "lg:w-20" : "lg:w-60"
        }`}
      >
        <SidebarContent isFullSize={true} />
      </aside>

      {/* MOBILE SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-60 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out
          lg:hidden
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <SidebarContent isFullSize={false} />
      </aside>

      {/* MOBILE TOP BAR */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>

          <CalendlyLogo isCollapsed={false} />

          <div className="w-10 h-10 rounded-full" />
        </div>
      </div>
    </>
  );
}
