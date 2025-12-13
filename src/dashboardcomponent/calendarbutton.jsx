// src/dashboardcomponent/CalendarGrid.jsx
import React, { useMemo, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  startOfWeek,
  endOfWeek,
  isSunday,
  isSaturday,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronDown } from "lucide-react";
import AvailabilityOverrideModal from "./availabilitycalendar";

// Safety guard
const safeDate = (date) => {
  if (!date) return new Date();
  const d = new Date(date);
  return d instanceof Date && !isNaN(d) ? d : new Date();
};

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const DEFAULT_AVAILABILITY = "9:00 AM – 5:00 PM";

const CalendarRecurrenceIcon = (props) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,8 16,8" />
    <polyline points="12,16 12,18 8,18" />
    <polyline points="16,12 18,12 18,16" />
    <polyline points="8,12 6,12 6,8" />
  </svg>
);

const CalendarGrid = ({
  currentMonth: propCurrentMonth = new Date(),
  setCurrentMonth,
  timezone = "America/New_York",
  setTimezone,
  timezones = [],
}) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const month = safeDate(propCurrentMonth);
  const today = safeDate(new Date());

  const hasWeeklyAvailability = (date) => !isSunday(date) && !isSaturday(date);

  const startOfGrid = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
  const endOfGrid = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });

  const days = useMemo(() => {
    try {
      return eachDayOfInterval({
        start: safeDate(startOfGrid),
        end: safeDate(endOfGrid),
      }).slice(0, 42);
    } catch (err) {
      console.error("Invalid date range:", err);
      return [];
    }
  }, [startOfGrid, endOfGrid]);

  const goToPreviousMonth = () => setCurrentMonth(subMonths(month, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(month, 1));

  const openDayEditor = (date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="w-full bg-white  overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-4">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Previous month"
              >
                <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                {format(month, "MMMM yyyy")}
              </h2>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Next month"
              >
                <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Timezone Selector */}
          <div className="relative w-full sm:w-64">
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 sm:py-2.5 pr-10 text-xs sm:text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            >
              {timezones.length > 0 ? (
                timezones.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))
              ) : (
                <option>Loading timezones...</option>
              )}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-2 sm:p-4">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1 sm:mb-2">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="text-center text-[10px] sm:text-xs font-semibold text-gray-600 uppercase tracking-wider py-1 sm:py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {days.map((date, i) => {
              const dateObj = safeDate(date);
              const isCurrentMonth = isSameMonth(dateObj, month);
              const available = hasWeeklyAvailability(dateObj);
              const isToday =
                dateObj.toDateString() === today.toDateString();

              return (
                <button
                  key={i}
                  onClick={() => openDayEditor(dateObj)}
                  className={`
                    relative h-20 sm:h-24 md:h-28 rounded-xl border-2 transition-all duration-200
                    ${isToday 
                      ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200" 
                      : "border-gray-200 hover:border-gray-400 hover:shadow-sm"
                    }
                    ${!isCurrentMonth ? "opacity-40" : ""}
                    bg-white group
                  `}
                >
                  <div className="text-sm sm:text-base md:text-lg font-bold text-center mt-1 sm:mt-2 text-gray-800">
                    {format(dateObj, "d")}
                  </div>
                  <div className="px-1 sm:px-2 mt-0.5 sm:mt-1 text-[10px] sm:text-xs">
                    <div className="font-medium text-gray-700 truncate">
                      {available ? DEFAULT_AVAILABILITY : "Unavailable"}
                    </div>
                    {available && (
                      <CalendarRecurrenceIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 absolute bottom-1 sm:bottom-2 right-1 sm:right-2 group-hover:text-gray-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Availability Override Modal – Opens on Day Click */}
      <AvailabilityOverrideModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
        timezone={timezone}
      />
    </>
  );
};

export default CalendarGrid;