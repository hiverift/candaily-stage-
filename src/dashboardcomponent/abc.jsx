// src/dashboardcomponent/CalendarView.jsx
import { useEffect, useState } from "react";
import { Calendar, List, X } from "lucide-react";
import ScheduleSwitcherDropdown from "./createschedule";
import CalendarGrid from "./calendarbutton";
import ListView from "./listbutton";

const timezones = [
  { value: "America/New_York", label: "Eastern Time - US & Canada" },
  { value: "America/Chicago", label: "Central Time - US & Canada" },
  { value: "America/Denver", label: "Mountain Time - US & Canada" },
  { value: "America/Los_Angeles", label: "Pacific Time - US & Canada" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Australia/Sydney", label: "Sydney" },
];

const EventTypeSelectionModal = ({ isOpen, onClose }) => {
  const [activeList, setActiveList] = useState([]);
  const [inactiveList, setInactiveList] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchEventTypes = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await fetch("http://192.168.0.245:4000/event-types", { headers });

        if (!res.ok) {
          if (res.status === 401) {
            setError("Please log in to view event types");
            return;
          }
          throw new Error(`Request failed: ${res.status}`);
        }

        const data = await res.json();

        const allEvents = Array.isArray(data) ? data : [];
        const active = allEvents.filter((item) => item.isActive === true);
        const inactive = allEvents.filter((item) => item.isActive !== true);

        const activeFormatted = active.map((item) => ({
          id: item._id,
          name: item.title,
          duration: `${item.duration} min`,
          callType: item.locationValue || item.location,
        }));

        const inactiveFormatted = inactive.map((item) => ({
          id: item._id,
          name: item.title,
          duration: `${item.duration} min`,
          callType: item.locationValue || item.location,
        }));

        setActiveList(activeFormatted);
        setInactiveList(inactiveFormatted);
        setSelected(activeFormatted.map((item) => item.id));
      } catch (err) {
        console.error(err);
        setError("Failed to load event types");
      } finally {
        setLoading(false);
      }
    };

    fetchEventTypes();
  }, [isOpen]);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearAll = () => setSelected([]);

  const handleApply = () => {
    console.log("Applied event type IDs:", selected);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Apply to event types</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-end mb-4">
          <button
            onClick={clearAll}
            className="text-blue-600 hover:underline text-sm"
            disabled={loading}
          >
            Clear all
          </button>
        </div>

        {/* Loading / Error */}
        {loading && (
          <p className="text-sm text-gray-500 mb-4">Loading event types...</p>
        )}
        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        {/* List Area */}
        <div className="max-h-96 overflow-y-auto pr-2 space-y-6">
          {/* Active */}
          <div>
            <p className="font-semibold text-gray-700 mb-2">
              Using this schedule
            </p>
            {activeList.length === 0 && !loading && !error && (
              <p className="text-xs text-gray-500 py-2">
                No active event types.
              </p>
            )}
            {activeList.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between py-2 border-b border-gray-200 last:border-0"
              >
                <label className="flex items-start gap-3 cursor-pointer w-full">
                  <input
                    type="checkbox"
                    checked={selected.includes(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    disabled={loading}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-600 flex gap-1 items-center">
                      {item.duration}
                      {item.callType && <span>• {item.callType}</span>}
                    </p>
                  </div>
                </label>
              </div>
            ))}
          </div>

          {/* Inactive */}
          <div>
            <p className="font-semibold text-gray-700 mb-2">
              Not using this schedule
            </p>
            {inactiveList.length === 0 && !loading && !error && (
              <p className="text-xs text-gray-500 py-2">
                No inactive event types.
              </p>
            )}
            {inactiveList.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between py-2 border-b border-gray-200 last:border-0"
              >
                <label className="flex items-start gap-3 cursor-pointer w-full">
                  <input
                    type="checkbox"
                    checked={selected.includes(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    disabled={loading}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                  />
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-600 flex gap-1 items-center">
                      {item.duration}
                      {item.callType && <span>• {item.callType}</span>}
                    </p>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={loading || activeList.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : "Apply"}
          </button>
        </div>
      </div>
    </div>
  );
};

const CalendarView = ({
  initialScheduleId = "default",
  initialScheduleName = "Working hours (default)",
  onScheduleChange,
  onDayClick,
  className = "",
  modalMode = false,
  onClose = () => {},
}) => {
  const [showListView, setShowListView] = useState(false);
  const [currentScheduleId, setCurrentScheduleId] = useState(initialScheduleId);
  const [currentScheduleName, setCurrentScheduleName] = useState(
    initialScheduleName
  );
  const [timezone, setTimezone] = useState("America/New_York");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showEventTypeModal, setShowEventTypeModal] = useState(false);

  const handleScheduleChange = (id, name) => {
    setCurrentScheduleId(id);
    setCurrentScheduleName(name);
    onScheduleChange?.(id, name);
  };

  // Reusable Header with "Active on" link in both modes
  const ViewHeader = () => (
    <div className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left: Schedule Selector */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            Schedule
          </p>
          <ScheduleSwitcherDropdown
            currentScheduleId={currentScheduleId}
            currentScheduleName={currentScheduleName}
            onScheduleSelect={handleScheduleChange}
          />
        </div>

        {/* Right: View Toggle */}
        <div className="flex justify-end">
          <div className="inline-flex rounded-xl border border-gray-300 bg-white p-1 shadow-sm">
            <button
              onClick={() => setShowListView(true)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
                ${showListView
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
                }
              `}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>

            <button
              onClick={() => setShowListView(false)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
                ${!showListView
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
                }
              `}
              aria-label="Calendar view"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Calendar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active on event types – shown in BOTH modes */}
      <div className="mt-3 text-sm text-gray-600">
        Active on:{" "}
        <button
          type="button"
          onClick={() => setShowEventTypeModal(true)}
          className="text-blue-600 font-medium underline hover:text-blue-700 cursor-pointer transition focus:outline-none focus:underline"
        >
           event type
        </button>
      </div>
    </div>
  );

  /* ——————————————————————— MODAL MODE ——————————————————————— */
  if (modalMode) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white/30  flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-5xl max-h-[92vh] rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Sticky Header */}
          <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
            <div className="relative">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 z-10 p-2 rounded-lg hover:bg-gray-100 transition active:scale-95"
                aria-label="Close modal"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <ViewHeader />
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-3 sm:p-4 lg:p-6">
              {!showListView ? (
                <CalendarGrid
                  currentMonth={currentMonth}
                  setCurrentMonth={setCurrentMonth}
                  openDayEditor={onDayClick}
                  timezone={timezone}
                  setTimezone={setTimezone}
                  timezones={timezones}
                />
              ) : (
                <ListView
                  currentScheduleId={currentScheduleId}
                  currentScheduleName={currentScheduleName}
                  onScheduleChange={handleScheduleChange}
                  timezone={timezone}
                  setTimezone={setTimezone}
                  timezones={timezones}
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-4 py-4 sm:px-6 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:scale-95 transition"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 transition shadow-md"
            >
              Apply Changes
            </button>
          </div>
        </div>

        {/* Event Type Modal */}
        <EventTypeSelectionModal
          isOpen={showEventTypeModal}
          onClose={() => setShowEventTypeModal(false)}
        />
      </div>
    );
  }

  /* ——————————————————————— DEFAULT VIEW ——————————————————————— */
  return (
    <div className={`w-full ${className}`}>
      {/* Calendar Mode */}
      {!showListView && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <ViewHeader />
          <div className="p-3 sm:p-4 lg:p-6">
            <CalendarGrid
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
              openDayEditor={onDayClick}
              timezone={timezone}
              setTimezone={setTimezone}
              timezones={timezones}
            />
          </div>
        </div>
      )}

      {/* List Mode */}
      {showListView && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <ViewHeader />
          <div className="p-3 sm:p-4 lg:p-6">
            <ListView
              currentScheduleId={currentScheduleId}
              currentScheduleName={currentScheduleName}
              onScheduleChange={handleScheduleChange}
              timezone={timezone}
              setTimezone={setTimezone}
              timezones={timezones}
            />
          </div>
        </div>
      )}

      {/* Event Type Modal */}
      <EventTypeSelectionModal
        isOpen={showEventTypeModal}
        onClose={() => setShowEventTypeModal(false)}
      />
    </div>
  );
};

export default CalendarView;