// Dashboard.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "./sidebar";
import Scheduling from "./Scheduling";
import Meetings from "./Meetings";
import Availability from "./Availability";
import Header from "./header";
import CreateForm from "../dashboardcomponent/createform";
import eventBus from "../lib/eventBus"; 

export default function Dashboard() {
  const [activeContent, setActiveContent] = useState("scheduling");

  // Modal state — lives here so it's always available
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);

  useEffect(() => {
  const switchToScheduling = () => {
    setActiveContent("scheduling");
  };
  eventBus.on("switchToSchedulingTab", switchToScheduling);
  return () => eventBus.off("switchToSchedulingTab", switchToScheduling);
}, []);


  // Global listeners — always active
  useEffect(() => {
    const openCreate = () => {
      setEventToEdit(null);
      setIsCreateOpen(true);
    };
    eventBus.on("openCreateEventModal", openCreate);
    return () => eventBus.off("openCreateEventModal", openCreate);
  }, []);

  useEffect(() => {
    const openEdit = (eventData) => {
      setEventToEdit(eventData);
      setIsCreateOpen(true);
    };
    eventBus.on("openEditEventModal", openEdit);
    return () => eventBus.off("openEditEventModal", openEdit);
  }, []);

  const handleSaveEvent = (data) => {
    // Forward the saved data to Scheduling page
    eventBus.emit("eventUpdated", data);
    setIsCreateOpen(false);
    setEventToEdit(null);
  };

  const renderContent = () => {
    switch (activeContent) {
      case "scheduling":
        return <Scheduling />;
      case "meetings":
        return <Meetings />;
      case "availability":
        return <Availability />;
      default:
        return <div className="text-gray-500 p-8">Select a menu item</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar setActiveContent={setActiveContent} />

      {/* Main Layout */}
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto bg-black ">
          <div className="">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* GLOBAL MODAL — ALWAYS WORKS FROM ANY PAGE */}
      {isCreateOpen && (
        <CreateForm
          onClose={() => {
            setIsCreateOpen(false);
            setEventToEdit(null);
          }}
          onCreate={handleSaveEvent}
          eventToEdit={eventToEdit}
        />
      )}
    </div>
  );
}