// ProfileDashboard.jsx
import React, { useState } from "react";
import UserProfileSidebar from "./profilesidebar";
import Header from "../dashboardcontent/header";

// These are example pages — you can replace or expand them
import ProfilePage from "./profilepage";

export default function ProfileDashboard() {
  const [activeTab, setActiveTab] = useState("profile");

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfilePage />;
      default:
        return <div className="text-gray-500 p-8">Select a tab</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <UserProfileSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onBackHome={() => {
          window.location.href = "/dashboard"; // or setActiveContent()
        }}
        onLogout={() => {
          console.log("Logging out...");
          localStorage.clear();
          window.location.href = "/login";
        }}
      />

      {/* Main Layout */}
      <div className="flex-1 flex flex-col">
        {/* Header — same as main dashboard */}
        <Header />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          
          <div>{renderContent()}</div>
          
        </main>
      </div>
    </div>
  );
}
