// SchedulingPage.jsx
import React, { useState, useCallback, useEffect, memo } from "react";
import {
  Plus,
  Search,
  ExternalLink,
  MoreVertical,
  Link,
  CalendarDays,
  Clock,
  Share2,
  Timer,
  Trash2,
  ToggleLeft,
  X,
} from "lucide-react";
import eventBus from "../lib/eventBus";

import axios from "axios";
import BookingModal from "../dashboardcomponent/bookingpage.jsx";
import TimerModal from "../dashboardcomponent/timeslot.jsx";
import EmailShareForm from "../dashboardcomponent/emailShareForm.jsx";
import CreateForm from "../dashboardcomponent/createform";
import AddToWebsiteModal from "../dashboardcomponent/addwebsite.jsx";

// Custom SVG Icons (exact Cal.com style)
const IconEdit = (props) => (
  <svg
    viewBox="0 0 10 10"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m3.72 8.78-3.188.7.7-3.189L6.794.706a.739.739 0 0 1 1.038.07L9.217 2.16a.739.739 0 0 1 .069 1.04Z" />
  </svg>
);

const IconPermissions = (props) => (
  <svg
    viewBox="0 0 10 10"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2.75 2.75a2.25 2.25 0 1 0 4.5 0 2.25 2.25 0 1 0-4.5 0ZM9.244 9.5a4.5 4.5 0 0 0-8.488 0Z" />
  </svg>
);

const IconWebsite = (props) => (
  <svg
    viewBox="0 0 10 10"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="0.5" y="0.5" width="9" height="9" rx="1" />
    <path d="M.5 2.5h9M2.5 4.5 4 6 2.5 7.5M6 6h1.5" />
  </svg>
);

const IconNote = () => <Clock className="w-4 h-4" />;

const IconLanguage = (props) => (
  <svg
    viewBox="0 0 10 10"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M.5 5a4.5 4.5 0 1 0 9 0 4.5 4.5 0 1 0-9 0Z" />
    <path d="M.846 6.731h1.212a1.212 1.212 0 0 0 1.211-1.212V4.481a1.212 1.212 0 0 1 1.212-1.212 1.211 1.211 0 0 0 1.211-1.211V.553M9.5 4.929a2.469 2.469 0 0 0-1.117-.275H6.9a1.212 1.212 0 1 0 0 2.423.865.865 0 0 1 .865.865v.605" />
  </svg>
);

const IconSecret = (props) => (
  <svg
    viewBox="0 0 10 10"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M1.5 3.743c-.288.242-.56.501-.816.777a.67.67 0 0 0 0 .922C1.414 6.23 3.072 7.75 5 7.75M2.828 2.828S4.123 2.278 5 2.25c1.904-.06 3.227.98 4.316 2.27a.67.67 0 0 1 0 .922c-.257.277-.47.51-.816.784-.5.394-1.406.82-1.406.82M9.25 9.25.75.75" />
  </svg>
);

const IconDuplicate = (props) => (
  <svg viewBox="0 0 20 20" fill="none" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 5C0 4.44772 0.447715 4 1 4H15C15.5523 4 16 4.44772 16 5V19C16 19.5523 15.5523 20 15 20H1C0.447715 20 0 19.5523 0 19V5ZM2 6V18H14V6H2Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4.1543 1C4.1543 0.447715 4.60201 0 5.1543 0H17.6163C18.2486 0 18.855 0.251171 19.302 0.698257C19.7491 1.14534 20.0003 1.75172 20.0003 2.384V14.846C20.0003 15.3983 19.5526 15.846 19.0003 15.846C18.448 15.846 18.0003 15.3983 18.0003 14.846V2.384C18.0003 2.28216 17.9598 2.18449 17.8878 2.11247C17.8158 2.04046 17.7181 2 17.6163 2H5.1543C4.60201 2 4.1543 1.55228 4.1543 1Z"
      fill="currentColor"
    />
  </svg>
);

const IconDelete = (props) => (
  <svg
    viewBox="0 0 10 10"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M.75 2.504h8.5M7.25 9.5h-4.5a1 1 0 0 1-1-1v-6h6.5v6a1 1 0 0 1-1 1ZM3.208 2.5v-.229a1.771 1.771 0 0 1 3.542 0V2.5M3.989 4.5v3M6.015 4.5v3" />
  </svg>
);

// Toast Hook
const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const addToast = (msg) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, msg }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3000
    );
  };
  return { toasts, addToast };
};

// Bulk Actions Toolbar
const BulkActionsToolbar = ({ selectedCount, onClose, onDelete, onToggle }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2 text-sm font-medium">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600">
              {selectedCount}
            </span>
            <span>selected</span>
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={onDelete}
              className="flex items-center space-x-1 text-sm font-medium text-red-600 hover:text-red-700 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
            <button
              onClick={onToggle}
              className="flex items-center space-x-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition"
            >
              <ToggleLeft className="w-4 h-4" />
              <span>Toggle on/off</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function SchedulingPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [openBooking, setOpenBooking] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [websiteModalEvent, setWebsiteModalEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [eventTypes, setEventTypes] = useState([]);
  const [isCopied, setIsCopied] = useState(false);

  const [events, setEvents] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState(new Set());
  const { toasts, addToast } = useToast();
  const [AUTH_TOKEN, setToken] = useState("");

  // Get token + initial data
  const getData = async () => {
    try {
      const token = localStorage.getItem("token") || "";
      setToken(token);
      const check = JSON.parse(localStorage.getItem('user'));

      console.log('get data user data', check.id)
      const response = await fetch(`http://192.168.0.245:4000/event-types/findByUserid/${check.id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      //  console.log('response',response)
      if (!response.ok) throw new Error("Failed to fetch events");

      // const data = await response.json();
      // console.log("Fetched events:", data.result.event);
      // setEvents(data.result.event);
      const data = await response.json();
      console.log("Fetched events:", data.result.event);

      const eventData = data.result.event;
      setEvents(Array.isArray(eventData) ? eventData : [eventData]);

    } catch (err) {
      console.error(err);
      addToast("Failed to fetch events");
    }
  };

  useEffect(() => {
    getData();

    const openCreateModal = () => {
      setEventToEdit(null);
      setIsCreateOpen(true);
    };

    eventBus.on("openCreateEventModal", openCreateModal);
    return () => eventBus.off("openCreateEventModal", openCreateModal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleOpenEdit = (eventData) => {
      setEventToEdit(eventData);
      setIsCreateOpen(true);
    };

    eventBus.on("openEditEventModal", handleOpenEdit);
    return () => eventBus.off("openEditEventModal", handleOpenEdit);
  }, []);

  // Refetch after create/update
  const handleSaveEvent = async () => {
    addToast(
      eventToEdit
        ? "Event updated successfully!"
        : "Event created successfully!"
    );
    await getData(); // Refresh list from server
    setIsCreateOpen(false);
    setEventToEdit(null);
  };

  const handleEditEvent = (event) => {
    setEventToEdit(event);
    setIsCreateOpen(true);
  };

  const handleSelectChange = useCallback((eventId, isChecked) => {
    setSelectedEvents((prev) => {
      const newSet = new Set(prev);
      if (isChecked) newSet.add(eventId);
      else newSet.delete(eventId);
      return newSet;
    });
  }, []);

  // PATCH to toggle isActive on backend (correct route with /toggle)
  const handleToggleEvent = async (id) => {
    const eventToToggle = events.find((e) => e._id === id);
    if (!eventToToggle) return;

    try {
      const response = await axios.patch(
        `http://192.168.0.245:4000/event-types/${id}/toggle`,
        {},
        {
          headers: {
            Authorization: `Bearer ${AUTH_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      // if backend returns updated event use it, otherwise optimistically flip
      const updatedEvent = response?.data || {
        ...eventToToggle,
        isActive: !eventToToggle.isActive,
      };

      setEvents((prev) => prev.map((e) => (e._id === id ? updatedEvent : e)));
      addToast("Status updated");
    } catch (error) {
      console.error("Error toggling event status:", error);
      addToast("Failed to update status");
    }
  };

  // DELETE request to delete event on backend
  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Delete this event type?")) return;

    try {
      await axios.delete(`http://192.168.0.245:4000/event-types/${id}`, {
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
        },
      });

      setEvents((prev) => prev.filter((e) => e._id !== id));
      addToast("Event deleted");
      setSelectedEvents((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (error) {
      console.error("Error deleting event:", error);
      addToast("Failed to delete event");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEvents.size === 0) return;
    if (!window.confirm(`Delete ${selectedEvents.size} event(s)?`)) return;

    // Try deleting on server; if you don't have a bulk endpoint, do sequential deletes
    const ids = Array.from(selectedEvents);
    try {
      // If your API supports bulk delete, replace this with that endpoint.
      await Promise.all(
        ids.map((id) =>
          axios.delete(`http://192.168.0.245:4000/event-types/${id}`, {
            headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
          })
        )
      );

      setEvents((prev) => prev.filter((e) => !selectedEvents.has(e._id)));
      addToast(`${selectedEvents.size} event(s) deleted`);
      setSelectedEvents(new Set());
    } catch (error) {
      console.error("Bulk delete error:", error);
      addToast("Failed to delete some events");
    }
  };

  const handleBulkToggle = async () => {
    if (selectedEvents.size === 0) return;

    const ids = Array.from(selectedEvents);
    try {
      // If API has a bulk toggle, use it. Otherwise toggle sequentially:
      const results = await Promise.all(
        ids.map((id) =>
          axios
            .patch(
              `http://192.168.0.245:4000/event-types/${id}/toggle`,
              {},
              { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
            )
            .then((res) => res.data)
            .catch((err) => {
              console.error("toggle error for", id, err);
              return null;
            })
        )
      );

      setEvents((prev) =>
        prev.map((e) => {
          const idx = ids.indexOf(e._id);
          if (idx === -1) return e;
          // if server returned updated object for that id, use it
          const updated = results[idx];
          if (updated) return updated;
          // fallback: flip
          return { ...e, isActive: !e.isActive };
        })
      );

      addToast(`${selectedEvents.size} event(s) toggled`);
      setSelectedEvents(new Set());
    } catch (error) {
      console.error("Bulk toggle error:", error);
      addToast("Failed to toggle events");
    }
  };

  const closeBulkToolbar = () => setSelectedEvents(new Set());

  const handleOpenWebsiteModal = (event) => {
    setWebsiteModalEvent(event);
  };

  const handleWebsiteContinue = (settings) => {
    addToast(`Embed code generated for ${websiteModalEvent?.title || "event"}`);
    setWebsiteModalEvent(null);
  };

  const EventCard = ({ event }) => {
    const [hovered, setHovered] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // const filteredEvents = eventTypes.filter((item) =>
    //   item.name?.toLowerCase().includes(searchTerm.toLowerCase())
    // );

    const handleCopyLink = async () => {
      try {
        const eventId = event._id || event.id;

        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        const headers = token
          ? {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
          : { "Content-Type": "application/json" };

        const response = await fetch(
          `http://192.168.0.245:4000/event-types/${eventId}/share-link`,
          { headers }
        );

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        const shareUrl = data.result?.shareUrl;

        if (!shareUrl) {
          throw new Error("Share URL not found in response");
        }

        await navigator.clipboard.writeText(shareUrl);
        addToast("Booking link copied!");

        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (error) {
        console.error("Failed to fetch/copy share link:", error);
        const fallbackUrl = `${window.location.origin}/book/${event.slug || event._id
          }`;
        await navigator.clipboard.writeText(fallbackUrl);
        addToast("Link copied (using fallback)!");

        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }
    };

    return (
      <div
        className="group relative bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-200"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="absolute left-0 top-0 bottom-0 w-3 bg-violet-600 rounded-l-xl" />

        <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <input
              type="checkbox"
              checked={selectedEvents.has(event._id)}
              onChange={(e) => handleSelectChange(event._id, e.target.checked)}
              className="mt-1 w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
            />

            {!event.isActive ? (
              <Clock className="w-6 h-6 text-amber-500 mt-1" />
            ) : (
              <CalendarDays className="w-6 h-6 text-gray-500 mt-1" />
            )}

            <div>
              <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                {event.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {event.duration} min • {event.locationValue || event.location}
              </p>
              <p className="text-xs text-gray-500 mt-1">Mon–Fri, hours vary</p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-3">
            <div
              className={`hidden sm:flex items-center gap-2 transition-opacity ${hovered ? "opacity-100" : "opacity-0"
                }`}
            >
              <button
                className="p-2.5 rounded-lg hover:bg-gray-100"
                title="Book Meeting"
                onClick={() => setOpenBooking(true)}
              >
                <CalendarDays className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => setIsTimerOpen(true)}
                className="p-2.5 rounded-lg hover:bg-gray-100"
                title="Offer Time Slots"
              >
                <Timer className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => setShowEmailModal(true)}
                className="p-2.5 rounded-lg hover:bg-gray-100"
                title="Share Options"
              >
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <button
              onClick={handleCopyLink}
              className={
                `flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition ` +
                (isCopied
                  ? "bg-green-500 text-white border border-green-500 hover:bg-green-600"
                  : "border border-gray-300 text-gray-800 hover:bg-gray-50")
              }
            >
              <Link className="w-4 h-4" />
              {isCopied ? "Copied" : "Copy link"}
            </button>

            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="p-2.5 hover:bg-gray-100 rounded-lg transition"
              >
                <MoreVertical className="w-5 h-5 text-gray-500" />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-12 w-60 bg-white rounded-xl shadow-xl border border-gray-200 z-50">
                    <div className="py-2 border-b">
                      <a
                        href={`/book/${event.slug || event._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View booking page
                      </a>
                      <button
                        onClick={() => {
                          handleEditEvent(event);
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700"
                      >
                        <IconEdit className="w-4 h-4 text-gray-500" />
                        Edit
                      </button>
                    </div>

                    <div className="py-2 border-b">
                      <button
                        onClick={() => {
                          handleOpenWebsiteModal(event);
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700"
                      >
                        <IconWebsite className="w-4 h-4 text-gray-500" />
                        Add to website
                      </button>
                    </div>

                    <div className="py-2">
                      <button
                        onClick={() => {
                          setEvents((prev) => [
                            ...prev,
                            {
                              ...event,
                              _id: Date.now().toString(),
                              title: event.title + " (Copy)",
                            },
                          ]);
                          addToast("Event duplicated!");
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm text-gray-700"
                      >
                        <IconDuplicate className="w-5 h-5 text-gray-500" />
                        Duplicate
                      </button>

                      <button
                        onClick={() => {
                          handleDeleteEvent(event._id);
                          setDropdownOpen(false);
                        }}
                        className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-red-600 text-sm"
                      >
                        <IconDelete className="w-4 h-4 text-red-600" />
                        Delete
                      </button>

                      <label className="w-full flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50">
                        <span className="text-sm font-medium text-gray-700">
                          On/Off
                        </span>
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={event.isActive}
                          onChange={() => {
                            handleToggleEvent(event._id);
                            setDropdownOpen(false);
                          }}
                        />
                        <div
                          className={`relative w-10 h-6 rounded-full peer ${event.isActive ? "bg-blue-600" : "bg-gray-200"
                            } after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full`}
                        />
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-screen-2xl mx-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Scheduling
            </h1>
            <button
              onClick={() => {
                setEventToEdit(null);
                setIsCreateOpen(true);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-medium hover:bg-blue-700 transition md:mr-28 lg:mr-15 "
            >
              <Plus className="w-5 h-5" />
              Create
            </button>
          </div>

          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search event types"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-50 min-h-screen pb-20">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-4">
            
            {events
              .filter((event) => event && event.title?.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((event) => (
                <EventCard key={event._id} event={event} />
              ))}


          </div>
        </div>
      </div>

      {/* Bulk Toolbar */}
      {selectedEvents.size > 0 && (
        <BulkActionsToolbar
          selectedCount={selectedEvents.size}
          onClose={closeBulkToolbar}
          onDelete={handleBulkDelete}
          onToggle={handleBulkToggle}
        />
      )}

      {/* Create/Edit Form */}
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

      {websiteModalEvent && (
        <AddToWebsiteModal
          open={!!websiteModalEvent}
          onClose={() => setWebsiteModalEvent(null)}
          onContinue={handleWebsiteContinue}
          eventTitle={websiteModalEvent?.title || ""}
        />
      )}

      {/* Toasts */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 space-y-3 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="bg-black text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 pointer-events-auto animate-fade-in"
          >
            <Link className="w-5 h-5" />
            <span className="font-medium text-sm">{t.msg}</span>
          </div>
        ))}
      </div>

      {/* Other Modals */}
      {openBooking && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setOpenBooking(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
            <BookingModal />
          </div>
        </div>
      )}

      {isTimerOpen && (
        <TimerModal
          isOpen={isTimerOpen}
          onClose={() => setIsTimerOpen(false)}
        />
      )}

      {showEmailModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full relative">
            <button
              onClick={() => setShowEmailModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <EmailShareForm onClose={() => setShowEmailModal(false)} />
          </div>
        </div>
      )}
    </>
  );
}
