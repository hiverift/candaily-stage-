// src/components/ScheduleSwitcherWithModal.jsx
import React, { useState, useRef, useEffect } from "react";

export default function ScheduleSwitcherDropdown({
  onScheduleSelect,
  currentScheduleId = "default",
  currentScheduleName = "Working hours (default)",
}) {
  const [schedules, setSchedules] = useState([
    { id: "default", name: "Working hours (default)", isActive: true },
  ]);

  const [selectedId, setSelectedId] = useState(currentScheduleId);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newScheduleName, setNewScheduleName] = useState("");

  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (id) => {
    const schedule = schedules.find((s) => s.id === id);
    if (!schedule) return;

    setSelectedId(id);
    setSchedules((prev) =>
      prev.map((s) => ({ ...s, isActive: s.id === id }))
    );
    onScheduleSelect?.(id, schedule.name);
    setIsDropdownOpen(false); // Close after selection
  };

  const handleCreateSchedule = (e) => {
    e.preventDefault();
    if (!newScheduleName.trim()) return;

    const newSchedule = {
      id: Date.now().toString(),
      name: newScheduleName.trim(),
      isActive: true,
    };

    setSchedules((prev) => {
      const updated = prev.map((s) => ({ ...s, isActive: false }));
      return [...updated, newSchedule];
    });

    setSelectedId(newSchedule.id);
    onScheduleSelect?.(newSchedule.id, newSchedule.name);
    setNewScheduleName("");
    setIsCreateModalOpen(false);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="text-base font-medium text-gray-800 hover:text-blue-600 flex items-center gap-1 transition-colors"
      >
        {currentScheduleName}
        <svg
          className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 20 20"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-md shadow-md border border-gray-200 z-50 overflow-hidden sm:w-72">
          <ul className="py-2">
            {schedules.map((schedule) => (
              <li key={schedule.id}>
                <button
                  onClick={() => handleSelect(schedule.id)}
                  className={`w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors ${
                    selectedId === schedule.id ? "bg-gray-50 font-medium" : ""
                  }`}
                >
                  <span className="truncate">{schedule.name}</span>
                  {selectedId === schedule.id && (
                    <svg className="w-4 h-4 text-blue-600 `shrink-0`" fill="none" viewBox="0 0 10 10">
                      <path
                        d="M.5 6.25 2.245 8.4a.971.971 0 0 0 1.5-.009L9.5 1.25"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t border-gray-200">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 3v14M3 10h14"
                />
              </svg>
              Create new schedule
            </button>
          </div>
        </div>
      )}

      {/* Create Schedule Modal */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Create Schedule</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 1l18 18M1 19L19 1"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} className="p-6">
              <div className="mb-4">
                <label htmlFor="schedule-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule name
                </label>
                <input
                  id="schedule-name"
                  type="text"
                  value={newScheduleName}
                  onChange={(e) => setNewScheduleName(e.target.value)}
                  placeholder="e.g., Working Hours, Exclusive Hours"
                  maxLength={255}
                  autoFocus
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setNewScheduleName("");
                    setIsCreateModalOpen(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newScheduleName.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}