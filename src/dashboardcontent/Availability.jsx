// src/dashboardcontent/Availability.jsx
import React, { useState, useCallback } from "react";
import CalendarView from "../dashboardcomponent/abc.jsx";
import AvailabilityOverrideModal from "../dashboardcomponent/availabilitycalendar";

const CalendarSettingsView = () => {
  const handleConnect = (provider) => {
    alert(`Connecting to ${provider}... (Demo)`);
  };

  return (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-gray-200">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Calendar settings</h2>
        <p className="text-sm sm:text-base text-gray-600">Set which calendars we use to check for busy times</p>
      </div>

      <div className="p-6 sm:p-8">
        <p className="text-sm text-gray-600 mb-6">
          These calendars will be used to prevent double bookings
        </p>

        <div className="space-y-4 sm:space-y-6">
          {["Google Calendar", "Outlook Calendar", "Exchange Calendar"].map((name) => (
            <div
              key={name}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 bg-gray-50/50 rounded-xl border border-gray-200 hover:border-gray-300 transition"
            >
              <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto">
                <div className="w-12 h-12 sm:w-12 sm:h-12 bg-white rounded-lg shadow-sm flex items-center justify-center flex-shrink-0">
                  <img
                    src={
                      name.includes("Google")
                        ? "https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg"
                        : name.includes("Outlook")
                        ? "https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg"
                        : "https://upload.wikimedia.org/wikipedia/commons/4/4e/Microsoft_Exchange_Server_Logo.svg"
                    }
                    alt={name}
                    className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{name}</p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {name.includes("Google")
                      ? "Gmail, G Suite"
                      : name.includes("Outlook")
                      ? "Office 365, Outlook.com"
                      : "Exchange Server"}
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-auto mt-4 sm:mt-0 sm:ml-6 flex sm:flex-none">
                <button
                  onClick={() => handleConnect(name)}
                  className="w-full sm:w-auto px-5 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition shadow-sm"
                >
                  Connect
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
};

export default function Availability() {
  const [activeTab, setActiveTab] = useState("Schedules");
  const [modal, setModal] = useState({ isOpen: false, date: null });

  const openOverrideModal = useCallback((date) => {
    setModal({ isOpen: true, date });
  }, []);

  const closeModal = () => {
    setModal({ isOpen: false, date: null });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <h1 className="text-3xl font-bold text-gray-900">Availability</h1>
        </div>

        {/* Tabs */}
        <div className="">
          <div className="max-w-7xl mx-auto px-6">
            <nav className="flex space-x-10 py-4">
              {["Schedules", "Calendar settings"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 px-1 text-sm font-medium border-b-2 transition-all ${
                    activeTab === tab
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pt-10 pb-20">
        {activeTab === "Schedules" && (
          <CalendarView
            onDayClick={openOverrideModal}
            onScheduleChange={(id, name) => {
              console.log("Schedule changed to:", name);
              // You can add analytics, toast, etc. here
            }}
            className="max-w-5xl mx-auto"
          />
        )}

        {activeTab === "Calendar settings" && <CalendarSettingsView />}
      </main>

      {/* Date Override Modal */}
      <AvailabilityOverrideModal
        isOpen={modal.isOpen}
        onClose={closeModal}
        initialDate={modal.date || new Date()}
      />
    </div>
  );
}