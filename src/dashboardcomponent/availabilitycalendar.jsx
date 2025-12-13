// src/components/AvailabilityOverrideModal.jsx
import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TIME_OPTIONS = [
  "12:00am", "12:30am",
  "1:00am", "1:30am",
  "2:00am", "2:30am",
  "3:00am", "3:30am",
  "4:00am", "4:30am",
  "5:00am", "5:30am",
  "6:00am", "6:30am",
  "7:00am", "7:30am",
  "8:00am", "8:30am",
  "9:00am", "9:30am",
  "10:00am", "10:30am",
  "11:00am", "11:30am",
  "12:00pm", "12:30pm",
  "1:00pm", "1:30pm",
  "2:00pm", "2:30pm",
  "3:00pm", "3:30pm",
  "4:00pm", "4:30pm",
  "5:00pm", "5:30pm",
  "6:00pm", "6:30pm",
  "7:00pm", "7:30pm",
  "8:00pm", "8:30pm",
  "9:00pm", "9:30pm",
  "10:00pm", "10:30pm",
  "11:00pm", "11:30pm",
];

export default function AvailabilityOverrideModal({
  isOpen,
  onClose,
  initialDate = new Date(),
}) {
  const [scope, setScope] = useState(null);
  const [selectedDates, setSelectedDates] = useState([initialDate]);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(initialDate));
  const [intervals, setIntervals] = useState([
    { id: Date.now(), from: "9:00am", to: "5:00pm" },
  ]);

  // Use refs to track previous values and avoid infinite loops
  const prevIsOpenRef = useRef(false);
  const prevInitialDateRef = useRef(initialDate);

  // Only reset when modal actually opens or initialDate meaningfully changes
  useEffect(() => {
    const dateChanged = !isSameDay(prevInitialDateRef.current, initialDate);
    const modalJustOpened = isOpen && !prevIsOpenRef.current;

    if (modalJustOpened || (isOpen && dateChanged)) {
      setScope(null);
      setSelectedDates([initialDate]);
      setCurrentMonth(startOfMonth(initialDate));
      setIntervals([{ id: Date.now(), from: "9:00am", to: "5:00pm" }]);
    }

    // Update refs
    prevIsOpenRef.current = isOpen;
    prevInitialDateRef.current = initialDate;
  }, [isOpen, initialDate]);

  const today = new Date();
  const weekdayName = format(initialDate, "EEEE");
  const weekdayNamePlural = weekdayName + "s";

  // Calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = useMemo(
    () => eachDayOfInterval({ start: gridStart, end: gridEnd }),
    [gridStart, gridEnd]
  );

  const addInterval = () => {
    setIntervals((prev) => [
      ...prev,
      { id: Date.now(), from: "9:00am", to: "5:00pm" },
    ]);
  };

  const removeInterval = (id) => {
    setIntervals((prev) => prev.filter((i) => i.id !== id));
  };

  const updateInterval = (id, field, value) => {
    setIntervals((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  };

  const handleDateClick = (date) => {
    if (!isSameMonth(date, currentMonth)) return;
    setSelectedDates((prev) => {
      const exists = prev.some((d) => isSameDay(d, date));
      let newDates = exists
        ? prev.filter((d) => !isSameDay(d, date))
        : [...prev, date];
      if (newDates.length === 0) newDates = [date];
      return newDates.sort((a, b) => a - b);
    });
  };

  const handleApply = () => {
    // Add your save logic here
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

 return (
  <div
    className="fixed inset-0 z-[9999] flex items-center justify-center px-3 sm:px-4 py-4 bg-black/40 backdrop-blur-sm"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-lg max-h-[90vh] flex flex-col overflow-hidden mx-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      {scope && (
        <div className="flex items-center px-4 sm:px-6 py-4 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-20">
          <button
            onClick={onClose}
            className="p-1.5 -ml-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 flex-1 text-center mx-2 truncate">
            {scope === "specific"
              ? "Select date(s) for specific hours"
              : `${weekdayName} availability`}
          </h2>
        </div>
      )}

      {/* Scope selection screen (first screen) */}
      {!scope ? (
        <div className="flex-1 flex flex-col">
          <div className="px-4 sm:px-6 py-5 border-b border-gray-100">
            <h2 className="text-center text-lg sm:text-xl font-semibold text-gray-900">
              {format(initialDate, "MMM d")}
            </h2>
          </div>

          <div className="flex-1 px-4 sm:px-6 py-6 space-y-4 overflow-y-auto">
            <div className="space-y-3">
              <button
                onClick={() => setScope("specific")}
                className="w-full p-4 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center gap-3 transition-all duration-200"
              >
                <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm sm:text-base">This date only</div>
                  <div className="text-xs sm:text-sm text-gray-500">Set hours for today</div>
                </div>
              </button>

              <button
                onClick={() => setScope("recurring")}
                className="w-full p-4 rounded-xl border border-gray-200 hover:bg-gray-50 flex items-center gap-3 transition-all duration-200"
              >
                <div className="p-2 bg-emerald-50 rounded-lg flex-shrink-0">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm sm:text-base">
                    Every {weekdayName.toLowerCase()}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500">Repeating weekly</div>
                </div>
              </button>
            </div>
          </div>

          {/* Footer for first screen */}
          <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-100">
            <button
              onClick={onClose}
              className="w-full py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* Content screens (calendar + time) */
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Calendar Screen - only for specific scope */}
          {scope === "specific" && (
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5">
              {/* Month Navigation */}
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  {format(currentMonth, "MMMM yyyy")}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6 pb-2">
                <div className="min-w-[300px]">
                  <table className="w-full">
                    <thead>
                      <tr className="text-gray-500">
                        {WEEKDAYS.map((day) => (
                          <th
                            key={day}
                            className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide py-2 sm:py-3 text-center px-1"
                          >
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 6 }).map((_, weekIdx) => (
                        <tr key={weekIdx}>
                          {calendarDays
                            .slice(weekIdx * 7, (weekIdx + 1) * 7)
                            .map((date) => {
                              const inMonth = isSameMonth(date, currentMonth);
                              const isSelected = selectedDates.some((d) => isSameDay(d, date));
                              const isToday = isSameDay(date, today);

                              return (
                                <td key={date.toISOString()} className="py-1.5 sm:py-2 px-1">
                                  <button
                                    onClick={() => handleDateClick(date)}
                                    disabled={!inMonth}
                                    className={`
                                      w-8 h-8 sm:w-10 sm:h-10 rounded-xl text-xs sm:text-sm font-semibold
                                      transition-all duration-200 mx-auto flex items-center justify-center
                                      ${
                                        !inMonth
                                          ? "text-gray-300 cursor-default"
                                          : "hover:bg-blue-50 text-gray-900 hover:scale-105 hover:shadow-sm"
                                      }
                                      ${
                                        isSelected
                                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md scale-105"
                                          : ""
                                      }
                                      ${
                                        isToday && !isSelected
                                          ? "bg-blue-50 text-blue-600 border border-blue-200 font-bold"
                                          : ""
                                      }
                                    `}
                                  >
                                    {format(date, "d")}
                                  </button>
                                </td>
                              );
                            })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Time Selection */}
          <div className="px-4 sm:px-6 py-5 border-t border-gray-100 bg-white/90 backdrop-blur-sm">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
              What hours are you available?
            </h3>
            <div className="space-y-3 max-h-[260px] sm:max-h-[280px] overflow-y-auto pr-1">
              {intervals.map((interval) => (
                <div
                  key={interval.id}
                  className="flex items-stretch gap-2 sm:gap-3 bg-gray-50/60 rounded-xl p-2.5 sm:p-3"
                >
                  <select
                    value={interval.from}
                    onChange={(e) => updateInterval(interval.id, "from", e.target.value)}
                    className="flex-1 px-3 sm:px-4 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {TIME_OPTIONS.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center px-2 text-gray-400 font-semibold text-xs sm:text-sm">
                    —
                  </div>
                  <select
                    value={interval.to}
                    onChange={(e) => updateInterval(interval.id, "to", e.target.value)}
                    className="flex-1 px-3 sm:px-4 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {TIME_OPTIONS.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeInterval(interval.id)}
                    className="p-2.5 sm:p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-105 flex-shrink-0"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                onClick={addInterval}
                className="w-full p-3 sm:p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 text-xs sm:text-sm font-medium"
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add another time slot</span>
                </div>
              </button>
            </div>
          </div>

          {/* Footer */}
          {scope && (
            <div className="px-4 sm:px-6 py-4 bg-gradient-to-t from-gray-50 to-white border-t border-gray-100 sticky bottom-0">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={handleCancel}
                  className="w-full sm:flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:shadow-md transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  className="w-full sm:flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
);

}