// src/dashboardcomponent/ListView.jsx
import React, { useState, useMemo } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import {
  Plus,
  X,
  Copy,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ScheduleSwitcherDropdown from "./createschedule";

// Time options (12-hour format with 30-min intervals)
const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2) % 12 || 12;
  const minute = i % 2 === 0 ? "00" : "30";
  const period = Math.floor(i / 2) < 12 ? "am" : "pm";
  return `${hour}:${minute}${period}`;
});

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

// Calendar Modal for selecting override dates
function OverrideCalendarModal({ isOpen, onClose, onApply, existingOverrides = [] }) {
  const [selectedDates, setSelectedDates] = useState([]);
  const [timeRanges, setTimeRanges] = useState([
    { id: Date.now(), from: "9:00am", to: "5:00pm" },
  ]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const toggleDate = (date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    if (date < today) return;
    setSelectedDates((prev) =>
      prev.includes(dateStr)
        ? prev.filter((d) => d !== dateStr)
        : [...prev, dateStr]
    );
  };

  const addTimeRange = () => {
    setTimeRanges((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), from: "9:00am", to: "5:00pm" },
    ]);
  };

  const updateTimeRange = (id, field, value) => {
    setTimeRanges((prev) =>
      prev.map((tr) => (tr.id === id ? { ...tr, [field]: value } : tr))
    );
  };

  const removeTimeRange = (id) => {
    if (timeRanges.length <= 1) return;
    setTimeRanges((prev) => prev.filter((tr) => tr.id !== id));
  };

  const handleApply = () => {
    if (selectedDates.length === 0) return;
    const cleanRanges = timeRanges.map(({ id, ...r }) => r);
    onApply({ dates: selectedDates, timeRanges: cleanRanges });
    onClose();
  };

  if (!isOpen) return null;

  const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start, end }).slice(0, 42);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center p-4 border-b border-gray-100">
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-gray-900 flex-1 text-center">Override dates</h2>
        </div>

        <div className="flex flex-col h-[500px]">
          {/* Calendar */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{format(currentMonth, "MMM yyyy")}</h3>
              <div className="flex gap-1">
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 rounded hover:bg-gray-100">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 rounded hover:bg-gray-100">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
              {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
                <div key={d} className="py-1 font-medium">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, i) => {
                const dateStr = format(date, "yyyy-MM-dd");
                const isSelected = selectedDates.includes(dateStr);
                const isOverridden = existingOverrides.includes(dateStr);
                const isToday = dateStr === format(new Date(), "yyyy-MM-dd");
                const isPast = date < today;
                return (
                  <button
                    key={i}
                    onClick={() => toggleDate(date)}
                    disabled={isPast}
                    className={`
                      h-10 rounded-lg text-sm font-medium transition-all
                      ${isPast ? "text-gray-300 cursor-not-allowed" : "hover:bg-gray-100 cursor-pointer"}
                      ${isSelected ? "bg-blue-500 text-white shadow-sm" : "bg-white"}
                      ${isOverridden && !isSelected ? "ring-2 ring-orange-400 ring-inset" : ""}
                      ${isToday && !isSelected ? "text-blue-600 font-bold ring-1 ring-blue-200" : ""}
                      ${!isSameMonth(date, currentMonth) ? "text-gray-400" : "text-gray-900"}
                    `}
                  >
                    {format(date, "d")}
                  </button>
                );
              })}
            </div>
            {selectedDates.length > 0 && (
              <p className="text-center text-sm font-semibold text-blue-600">
                {selectedDates.length} date{selectedDates.length > 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          {/* Time Slots */}
          <div className="p-4 border-t border-gray-100 space-y-3">
            <h3 className="text-base font-semibold">Available hours</h3>
            <div className="space-y-2">
              {timeRanges.map((range) => (
                <div key={range.id} className="flex items-center gap-2">
                  <select 
                    value={range.from} 
                    onChange={(e) => updateTimeRange(range.id, "from", e.target.value)} 
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  >
                    {["9:00am", "10:00am", "11:00am", "12:00pm", "1:00pm", "2:00pm", "3:00pm", "4:00pm", "5:00pm", "6:00pm"].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                  <span className="text-gray-400 px-2">—</span>
                  <select 
                    value={range.to} 
                    onChange={(e) => updateTimeRange(range.id, "to", e.target.value)} 
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  >
                    {["9:00am", "10:00am", "11:00am", "12:00pm", "1:00pm", "2:00pm", "3:00pm", "4:00pm", "5:00pm", "6:00pm"].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                  {timeRanges.length > 1 && (
                    <button onClick={() => removeTimeRange(range.id)} className="p-2 text-gray-400 hover:text-red-500 rounded hover:bg-red-50">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button onClick={addTimeRange} className="w-full p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg border border-dashed border-gray-300">
                + Add time
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-2 p-4 bg-gray-50 border-t border-gray-100">
            <button 
              onClick={onClose} 
              className="flex-1 py-2 px-4 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
            >
              Cancel
            </button>
            <button 
              onClick={handleApply} 
              disabled={selectedDates.length === 0}
              className="flex-1 py-2 px-4 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply to {selectedDates.length || 0} date{selectedDates.length !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


// Main ListView Component
export default function ListView({
  currentScheduleId,
  currentScheduleName,
  onScheduleChange,
  timezone,
  setTimezone,
  timezones,
}) {
  const [weeklyHours, setWeeklyHours] = useState(() =>
    daysOfWeek.reduce(
      (acc, day, i) => ({
        ...acc,
        [day]: i >= 1 && i <= 5 ? [{ id: Date.now() + i, from: "9:00am", to: "5:00pm" }] : [],
      }),
      {}
    )
  );

  const [dateOverrides, setDateOverrides] = useState([]);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  const overriddenDates = dateOverrides.map((o) => o.date);

  const handleCalendarApply = ({ dates, timeRanges }) => {
    setDateOverrides((prev) => {
      const filtered = prev.filter((o) => !dates.includes(o.date));
      const newOnes = dates.map((date) => ({
        date,
        slots: timeRanges.map((r, i) => ({
          id: Date.now() + Math.random() + i,
          ...r,
        })),
      }));
      return [...filtered, ...newOnes].sort((a, b) => a.date.localeCompare(b.date));
    });
  };

  // Weekly slots handlers
  const addWeeklySlot = (day) => {
    setWeeklyHours((prev) => ({
      ...prev,
      [day]: [...(prev[day] || []), { id: Date.now() + Math.random(), from: "9:00am", to: "5:00pm" }],
    }));
  };

  const updateWeeklySlot = (day, id, field, value) => {
    setWeeklyHours((prev) => ({
      ...prev,
      [day]: prev[day].map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    }));
  };

  const removeWeeklySlot = (day, id) => {
    setWeeklyHours((prev) => ({
      ...prev,
      [day]: prev[day].filter((s) => s.id !== id),
    }));
  };

  const copyToWeekdays = (sourceDay) => {
    const slots = weeklyHours[sourceDay] || [];
    if (slots.length === 0) return;
    setWeeklyHours((prev) => {
      const copy = { ...prev };
      daysOfWeek.slice(1, 6).forEach((day) => {
        copy[day] = slots.map((s) => ({ ...s, id: Date.now() + Math.random() }));
      });
      return copy;
    });
  };

  // Override handlers
  const addOverrideSlot = (date) => {
    setDateOverrides((prev) =>
      prev.map((o) =>
        o.date === date
          ? { ...o, slots: [...o.slots, { id: Date.now() + Math.random(), from: "9:00am", to: "5:00pm" }] }
          : o
      )
    );
  };

  const updateOverrideSlot = (date, id, field, value) => {
    setDateOverrides((prev) =>
      prev.map((o) =>
        o.date === date
          ? { ...o, slots: o.slots.map((s) => (s.id === id ? { ...s, [field]: value } : s)) }
          : o
      )
    );
  };

  const removeOverrideSlot = (date, id) => {
    setDateOverrides((prev) =>
      prev
        .map((o) => (o.date === date ? { ...o, slots: o.slots.filter((s) => s.id !== id) } : o))
        .filter((o) => o.slots.length > 0)
    );
  };

  const removeOverride = (date) => {
    setDateOverrides((prev) => prev.filter((o) => o.date !== date));
  };

  return (
    <>
      <div className="bg-white  overflow-hidden">
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
          {/* Weekly Hours */}
          <div className="p-5 sm:p-8">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Weekly hours</h3>
            <p className="text-sm text-gray-600 mb-6">Default availability for each day</p>

            <div className="space-y-6">
              {daysOfWeek.map((day, i) => {
                const slots = weeklyHours[day] || [];
                const isWeekday = i >= 1 && i <= 5;

                return (
                  <div key={day} className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${isWeekday ? "bg-gray-900" : "bg-gray-300"}`}>
                      {WEEKDAYS[i]}
                    </div>
                    <div className="flex-1 min-w-0">
                      {slots.length > 0 ? (
                        <div className="space-y-3">
                          {slots.map((slot, idx) => (
                            <div key={slot.id} className="flex flex-wrap items-center gap-3">
                              <select
                                value={slot.from}
                                onChange={(e) => updateWeeklySlot(day, slot.id, "from", e.target.value)}
                                className="flex-1 min-w-[110px] px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                {timeOptions.map((t) => <option key={t}>{t}</option>)}
                              </select>
                              <span className="text-gray-500 font-medium">—</span>
                              <select
                                value={slot.to}
                                onChange={(e) => updateWeeklySlot(day, slot.id, "to", e.target.value)}
                                className="flex-1 min-w-[110px] px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                {timeOptions.map((t) => <option key={t}>{t}</option>)}
                              </select>
                              <button onClick={() => removeWeeklySlot(day, slot.id)} className="text-gray-400 hover:text-red-600">
                                <X className="w-5 h-5" />
                              </button>
                              {idx === 0 && isWeekday && (
                                <button onClick={() => copyToWeekdays(day)} className="text-gray-500 hover:text-gray-700" title="Copy to Mon–Fri">
                                  <Copy className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          ))}
                          {slots.length < 4 && (
                            <button onClick={() => addWeeklySlot(day)} className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5">
                              <Plus className="w-4 h-4" /> Add time range
                            </button>
                          )}
                        </div>
                      ) : (
                        <button onClick={() => addWeeklySlot(day)} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5 py-2">
                          <Plus className="w-4 h-4" /> Set hours
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Timezone */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">Time zone</label>
              <div className="relative">
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg text-sm appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timezones.map((tz) => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Date-specific overrides */}
          <div className="p-5 sm:p-8 bg-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Date-specific hours</h3>
                <p className="text-sm text-gray-600 mt-1">Override availability for specific dates</p>
              </div>
              <button
                onClick={() => setShowCalendarModal(true)}
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm transition"
              >
                <Plus className="w-4 h-4" /> Hours
              </button>
            </div>

            <div className="space-y-4">
              {dateOverrides.length === 0 ? (
                <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-medium">No date overrides yet</p>
                </div>
              ) : (
                dateOverrides.map((override) => (
                  <div key={override.date} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <CalendarIcon className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-900 text-sm sm:text-base">
                          {format(new Date(override.date), "EEEE, MMMM d, yyyy")}
                        </span>
                      </div>
                      <button onClick={() => removeOverride(override.date)} className="text-gray-400 hover:text-red-600">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {override.slots.map((slot) => (
                        <div key={slot.id} className="flex flex-wrap items-center gap-3 mb-3">
                          <select
                            value={slot.from}
                            onChange={(e) => updateOverrideSlot(override.date, slot.id, "from", e.target.value)}
                            className="flex-1 min-w-[110px] px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {timeOptions.map((t) => <option key={t}>{t}</option>)}
                          </select>
                          <span className="text-gray-500 font-medium">—</span>
                          <select
                            value={slot.to}
                            onChange={(e) => updateOverrideSlot(override.date, slot.id, "to", e.target.value)}
                            className="flex-1 min-w-[110px] px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {timeOptions.map((t) => <option key={t}>{t}</option>)}
                          </select>
                          <button onClick={() => removeOverrideSlot(override.date, slot.id)} className="text-gray-400 hover:text-red-600">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                      {override.slots.length < 4 && (
                        <button onClick={() => addOverrideSlot(override.date)} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1.5">
                          <Plus className="w-4 h-4" /> Add time range
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Modal */}
      <OverrideCalendarModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        onApply={handleCalendarApply}
        existingOverrides={overriddenDates}
      />
    </>
  );
}