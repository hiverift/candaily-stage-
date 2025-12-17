// meeting.jsx 
import React, { useState, useMemo } from "react";
import { Toaster, toast } from "react-hot-toast";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  isBefore,
  isAfter,
  subMonths,
} from "date-fns";
import { Clock, ChevronLeft, ChevronRight, Play } from "lucide-react";

// Import your EventDetails component
import EventDetails from "../dashboardcomponent/meetingeventdetail";

// No Events Illustration
const NoEventsIllustration = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="60" cy="60" r="56" stroke="#E5E7EB" strokeWidth="8" />
    <path d="M35 60L52 77L85 43" stroke="#9CA3AF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Date Range Picker (updated for responsiveness)
const DateRangePicker = ({ range, onRangeChange, onApply }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectionStep, setSelectionStep] = useState(range.start ? (range.end ? "start" : "end") : "start");

  const nextMonth = addMonths(currentMonth, 1);

  const handleDateClick = (date) => {
    const dateOnly = new Date(date.setHours(0, 0, 0, 0));

    if (selectionStep === "start" || (range.start && range.end)) {
      onRangeChange({ start: dateOnly, end: null });
      setSelectionStep("end");
    } else if (selectionStep === "end") {
      if (isBefore(dateOnly, range.start)) {
        onRangeChange({ start: dateOnly, end: null });
        toast.error("Start date must be before end date. Resetting selection.");
        setSelectionStep("end");
      } else {
        onRangeChange({ start: range.start, end: dateOnly });
        setSelectionStep("done");
      }
    } else {
      onRangeChange({ start: dateOnly, end: null });
      setSelectionStep("end");
    }
  };

  const isDateInRange = (date) => {
    if (!range.start) return false;
    const dateOnly = new Date(date.setHours(0, 0, 0, 0));
    if (!range.end) return isSameDay(dateOnly, range.start);
    const start = new Date(range.start.setHours(0, 0, 0, 0));
    const end = new Date(range.end.setHours(0, 0, 0, 0));
    return isAfter(dateOnly, start) && isBefore(dateOnly, end);
  };

  const isDateStart = (date) => range.start && isSameDay(date, range.start);
  const isDateEnd = (date) => range.end && isSameDay(date, range.end);

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const rangeStatusText = useMemo(() => {
    if (!range.start) return "Click a date to select the start of your range.";
    if (!range.end) return `Selecting end date. Start: ${format(range.start, "MMM dd, yyyy")}`;
    return `Selected: ${format(range.start, "MMM dd")} - ${format(range.end, "MMM dd, yyyy")}`;
  }, [range]);

  const renderCalendar = (month) => {
    const startDay = startOfMonth(month);
    const endDay = endOfMonth(month);
    const daysInMonth = eachDayOfInterval({ start: startDay, end: endDay });
    const startingDayOfWeek = startDay.getDay();
    const paddingDays = Array(startingDayOfWeek).fill(null);
    const days = [...paddingDays, ...daysInMonth];

    return (
      <div>
        <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-500 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="py-1">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (!day) return <div key={index} className="h-8"></div>;

            const isInRange = isDateInRange(day);
            const isStart = isDateStart(day);
            const isEnd = isDateEnd(day);

            let dayClasses = `h-8 w-8 flex items-center justify-center text-sm rounded-full transition-colors cursor-pointer`;

            if (isStart && isEnd) {
              dayClasses += " bg-blue-600 text-white font-bold hover:bg-blue-700";
            } else if (isStart) {
              dayClasses += " bg-blue-600 text-white font-bold rounded-r-none hover:bg-blue-700";
            } else if (isEnd) {
              dayClasses += " bg-blue-600 text-white font-bold rounded-l-none hover:bg-blue-700";
            } else if (isInRange) {
              dayClasses += " bg-blue-100 text-blue-800 rounded-none";
            } else {
              dayClasses += " text-gray-800 hover:bg-gray-100";
            }

            return (
              <div
                key={format(day, "yyyyMMdd")}
                className={`flex items-center justify-center ${isInRange ? "bg-blue-100" : ""} ${isStart ? "rounded-l-full" : ""} ${isEnd ? "rounded-r-full" : ""}`}
                style={{ padding: "2px 0" }}
              >
                <button onClick={() => handleDateClick(day)} className={dayClasses}>
                  {format(day, "d")}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-xl mx-auto">
      <div className="text-center mb-4">
        <p className="text-sm font-semibold text-blue-600">{rangeStatusText}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <button onClick={goToPreviousMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-lg font-semibold text-gray-900">{format(currentMonth, "MMMM yyyy")}</span>
            <div className="w-9 h-5 invisible"></div>
          </div>
          {renderCalendar(currentMonth)}
        </div>
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-5 invisible"></div>
            <span className="text-lg font-semibold text-gray-900">{format(nextMonth, "MMMM yyyy")}</span>
            <button onClick={goToNextMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          {renderCalendar(nextMonth)}
        </div>
      </div>

      <div className="mt-6 flex justify-between gap-4 border-t pt-4">
        <button
          onClick={() => {
            onRangeChange({ start: null, end: null });
            setSelectionStep("start");
            toast("Filter cleared.", { icon: "Reset" });
          }}
          className="flex-1 py-2 text-sm font-semibold text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50"
        >
          Clear Filter
        </button>
        <button
          onClick={onApply}
          disabled={!range.start || !range.end}
          className="flex-1 py-2 text-sm font-semibold rounded-xl transition-colors disabled:bg-blue-200 disabled:cursor-not-allowed bg-blue-600 text-white hover:bg-blue-700"
        >
          Apply Filter
        </button>
      </div>
    </div>
  );
};

// UPDATED EventListItem — Now with dropdown details
const EventListItem = ({ event }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDetails = (e) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };


    
  return (
  <div className="relative">
    {/* Event Card */}
    <div
      className={`rounded-xl shadow-sm hover:shadow-md transition-all duration-200 bg-white border border-gray-200 cursor-pointer ${
        isOpen ?  "border-gray-200 border-b-0 rounded-b-none shadow-lg z-20 relative" 
          : "border-gray-200 cursor-pointer"
      }`}
      onClick={toggleDetails}
    >
      <div className="flex flex-col p-4 sm:p-5">
        <div className="flex items-center justify-between min-w-0 mb-2">
          <div className="flex items-center gap-2 sm:gap-3 `shrink-0`min-w-0">
            <span
              className="w-2 h-2 rounded-full `shrink-0`"
              style={{ backgroundColor: event.eventColor }}
            />
            <div className="text-sm font-semibold text-gray-900 truncate">
              {event.timeOnly}
            </div>
          </div>
          <button
            onClick={toggleDetails}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors p-1 cursor-pointer"
          >
            <Play
              className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-90 " : ""}`}
              fill="currentColor"
            />
            Details
          </button>
        </div>

        <div className="flex flex-col pl-4 sm:pl-5 min-w-0">
          <div className="font-bold text-gray-900 text-sm truncate mb-0.5">
            {event.invitee.name}
          </div>
          <div className="text-sm text-gray-600 truncate">
            Event type <strong className="font-semibold text-gray-800">{event.type}</strong>
          </div>
        </div>
      </div>
    </div>

    {/* Dropdown Details - PERFECTLY MATCHES CARD WIDTH */}
    {isOpen && (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-20"
          onClick={() => setIsOpen(false)}
        />

        {/* Dropdown Panel - Same exact width as card */}
        <div className="absolute top-full left-0 right-0 z-20 -mt-px animate-in slide-in-from-top-2 duration-200">
          <div className="bg-white rounded-b-xl rounded-t-none border-x border-b border-gray-200 shadow-2xl overflow-hidden">
            <EventDetails
              event={event}
              isOpen={true}
              onClose={() => setIsOpen(false)}
            />
          </div>
        </div>
      </>
    )}
  </div>
);
};

// Sample Events Data
const events = [
  {
    id: "0",
    title: "test",
    date: "2025-12-21",
    timeOnly: "1:30 pm – 2 pm",
    dateInfo: "Monday, December 1, 2025",
    eventColor: "rgb(150, 50, 200)",
    hostCount: 1,
    nonHostCount: 0,
    invitee: { name: "test", email: "test@example.com", avatarInitial: "T" },
    host: "s",
    dateTime: "1:30 pm - 2 pm, Monday, December 1, 2025",
    timezone: "India Standard Time",
    type: "New Meeting",
    questions: [
      { label: "Please share anything that will help prepare for our meeting.", answer: "test" }
    ],
    location: "+91 88149 30229",
    created: "1 December 2025",
  },
  {
    id: "1",
    title: "30 Min Meeting with Jane",
    date: "2025-12-20",
    timeOnly: "2:30 pm – 3:00 pm",
    dateInfo: "Friday, December 5, 2025",
    eventColor: "rgb(130, 71, 245)",
    hostCount: 1,
    nonHostCount: 0,
    invitee: { name: "Jane Doe", email: "jane@example.com", avatarInitial: "J" },
    host: "Samunder",
    dateTime: "2:30pm - 3:00pm, Friday, December 5, 2025",
    timezone: "India Standard Time",
    type: "30 Min Meeting",
    questions: [{ label: "Purpose of meeting?", answer: "Follow-up on Q3 review." }],
    location: "Google Meet Link",
    created: "20 November 2025",
  },
  {
    id: "2",
    title: "30 Min Meeting with Jane",
    date: "2025-12-05",
    timeOnly: "2:30 pm – 3:00 pm",
    dateInfo: "Friday, December 5, 2025",
    eventColor: "rgb(130, 71, 245)",
    hostCount: 1,
    nonHostCount: 0,
    invitee: { name: "Jane Doe", email: "jane@example.com", avatarInitial: "J" },
    host: "Samunder",
    dateTime: "2:30pm - 3:00pm, Friday, December 5, 2025",
    timezone: "India Standard Time",
    type: "30 Min Meeting",
    questions: [{ label: "Purpose of meeting?", answer: "Follow-up on Q3 review." }],
    location: "Google Meet Link",
    created: "20 November 2025",
  },
  // Add more events as needed...
];

export default function App() {
  const [filter, setFilter] = useState("upcoming");
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [activeDateRange, setActiveDateRange] = useState({ start: null, end: null });

  const isUpcoming = (eventDateStr) => {
    const eventDate = new Date(eventDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate >= today;
  };

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (filter === "upcoming") return isUpcoming(event.date);
      if (filter === "past") return !isUpcoming(event.date);
      if (filter === "daterange") {
        if (!activeDateRange.start || !activeDateRange.end) return true;
        const eventDate = new Date(event.date);
        const start = new Date(activeDateRange.start);
        const end = new Date(activeDateRange.end);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return eventDate >= start && eventDate <= end;
      }
      return true;
    });
  }, [filter, activeDateRange]);

  const handleRangeApply = () => {
    if (dateRange.start && dateRange.end) {
      setActiveDateRange(dateRange);
      toast.success(`Filter applied: ${format(dateRange.start, "MMM dd")} - ${format(dateRange.end, "MMM dd, yyyy")}`);
    } else {
      toast.error("Please select both a start and end date.");
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    if (newFilter !== "daterange") {
      setActiveDateRange({ start: null, end: null });
    }
  };

  const formattedRange =
    activeDateRange.start && activeDateRange.end
      ? `${format(activeDateRange.start, "MMM dd")} - ${format(activeDateRange.end, "MMM dd, yyyy")}`
      : "Select Range";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Toaster position="top-center" />

     <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 sm:px-8 py-5 transition-shadow duration-200 shadow-sm `[&:has(+*scrolled)]:shadow-md">
  <div className="w-full max-w-7xl mx-auto">
    <h1 className="text-2xl font-semibold text-gray-900">Meetings </h1>
  </div>
</div>

      <div className="flex-1 p-4 sm:p-8">
        <div className="w-full max-w-7xl mx-auto mb-6">
          <div className="flex space-x-1 sm:space-x-3 border-b border-gray-200">
            {["Upcoming", "Past", "Date Range"].map((tab) => {
              const tabKey = tab.toLowerCase().replace(" ", "");
              const isActive = filter === tabKey;
              return (
                <button
                  key={tabKey}
                  onClick={() => handleFilterChange(tabKey)}
                  className={`py-2 px-3 sm:px-4 text-sm font-semibold rounded-t-lg transition-colors ${
                    isActive
                      ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {filter === "daterange" && (
            <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="mb-4">
                <button className="flex items-center gap-2 py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <Clock className="w-4 h-4" />
                  {formattedRange}
                </button>
              </div>
              <DateRangePicker range={dateRange} onRangeChange={setDateRange} onApply={handleRangeApply} />
            </div>
          )}
        </div>

        {filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center w-full max-w-7xl mx-auto">
            <NoEventsIllustration />
            <h2 className="mt-6 text-xl font-medium text-gray-600">No Events Found</h2>
            <p className="mt-2 text-sm text-gray-500">
              Adjust your filter. Currently showing: <strong className="font-semibold text-gray-700">{filter}</strong>.
            </p>
          </div>
        ) : (
          <div className="space-y-4 w-full max-w-7xl mx-auto">
            <p className="text-sm font-medium text-gray-600 mb-2">
              Showing {filteredEvents.length} events for {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </p>
            {filteredEvents.map((event) => (
              <EventListItem key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}