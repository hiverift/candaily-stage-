// // Dashboard.jsx
// import React, { useState, useEffect } from "react";
// import Sidebar from "./sidebar";
// import Scheduling from "./Scheduling";
// import Meetings from "./Meetings";
// import Availability from "./Availability";
// import Header from "./header";
// import CreateForm from "../dashboardcomponent/createform";
// import eventBus from "../lib/eventBus"; 
// import { useNavigate } from "react-router-dom";


// export default function Dashboard() {
//   const navigate = useNavigate();
//   const [activeContent, setActiveContent] = useState("scheduling");

//   // Modal state — lives here so it's always available
//   const [isCreateOpen, setIsCreateOpen] = useState(false);
//   const [eventToEdit, setEventToEdit] = useState(null);

//   useEffect(() => {
//   const params = new URLSearchParams(window.location.search);
//   const token = params.get("token");

//   if (token) {
//     localStorage.setItem("token", token);
//     navigate("/dashboard", { replace: true });
//   }
// }, [navigate]);


//   useEffect(() => {
//   const switchToScheduling = () => {
//     setActiveContent("scheduling");
//   };
//   eventBus.on("switchToSchedulingTab", switchToScheduling);
//   return () => eventBus.off("switchToSchedulingTab", switchToScheduling);
// }, []);


//   // Global listeners — always active
//   useEffect(() => {
//     const openCreate = () => {
//       setEventToEdit(null);
//       setIsCreateOpen(true);
//     };
//     eventBus.on("openCreateEventModal", openCreate);
//     return () => eventBus.off("openCreateEventModal", openCreate);
//   }, []);

//   useEffect(() => {
//     const openEdit = (eventData) => {
//       setEventToEdit(eventData);
//       setIsCreateOpen(true);
//     };
//     eventBus.on("openEditEventModal", openEdit);
//     return () => eventBus.off("openEditEventModal", openEdit);
//   }, []);

//   const handleSaveEvent = (data) => {
//     // Forward the saved data to Scheduling page
//     eventBus.emit("eventUpdated", data);
//     setIsCreateOpen(false);
//     setEventToEdit(null);
//   };

//   const renderContent = () => {
//     switch (activeContent) {
//       case "scheduling":
//         return <Scheduling />;
//       case "meetings":
//         return <Meetings />;
//       case "availability":
//         return <Availability />;
//       default:
//         return <div className="text-gray-500 p-8">Select a menu item</div>;
//     }
//   };

//   return (
//     <div className="flex h-screen bg-gray-50">
//       {/* Sidebar */}
//       <Sidebar setActiveContent={setActiveContent} />

//       {/* Main Layout */}
//       <div className="flex-1 flex flex-col">
//         <Header />
//         <main className="flex-1 overflow-y-auto bg-white ">
//           <div className="">
//             {renderContent()}
//           </div>
//         </main>
//       </div>

//       {/* GLOBAL MODAL — ALWAYS WORKS FROM ANY PAGE */}
//       {isCreateOpen && (
//         <CreateForm
//           onClose={() => {
//             setIsCreateOpen(false);
//             setEventToEdit(null);
//           }}
//           onCreate={handleSaveEvent}
//           eventToEdit={eventToEdit}
//         />
//       )}
//     </div>
//   );
// }
// Dashboard.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "./sidebar";
import Scheduling from "./Scheduling";
import Meetings from "./Meetings";
import Availability from "./Availability";
import Header from "./header";
import CreateForm from "../dashboardcomponent/createform";
import eventBus from "../lib/eventBus"; 
import { useNavigate } from "react-router-dom";
import API_URL from "../config/config";

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeContent, setActiveContent] = useState("scheduling");

  // Modal state — lives here so it's always available
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);

  // STEP 1: Capture token from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  // STEP 2: Test API Gateway connection
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API_URL.BASE_URL}/event-types`, { // <-- Replace 5000 with your API Gateway port
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => console.log("Data from API Gateway:", data))
      .catch(err => console.error("Error connecting to API Gateway:", err));
  }, []);

  // STEP 3: Event Bus listeners
  useEffect(() => {
    const switchToScheduling = () => {
      setActiveContent("scheduling");
    };
    eventBus.on("switchToSchedulingTab", switchToScheduling);
    return () => eventBus.off("switchToSchedulingTab", switchToScheduling);
  }, []);

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
      <Sidebar setActiveContent={setActiveContent} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto bg-white ">
          <div>{renderContent()}</div>
        </main>
      </div>
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
