import { useParams, useSearchParams } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { 
  Clock, Globe, Check, ChevronLeft, ChevronRight, 
  ArrowLeft, Users, Edit3, X 
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(isSameOrAfter);

const timezoneOptions = [
  { value: "Asia/Kolkata", label: "India Standard Time (IST)" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
];

// Helper to calculate end time
const getEndTime = (startTime, duration, baseDate) => {
  if (!startTime || !baseDate) return "";
  const match = startTime.match(/(\d{1,2}:\d{2})(am|pm)/i);
  if (!match) return "";

  const [time, period] = match.slice(1);
  let [hours, minutes] = time.split(':').map(Number);
  if (period.toLowerCase() === 'pm' && hours !== 12) hours += 12;
  if (period.toLowerCase() === 'am' && hours === 12) hours = 0;

  const startDate = new Date(baseDate);
  startDate.setHours(hours, minutes, 0, 0);
  startDate.setMinutes(startDate.getMinutes() + duration);

  return startDate.toLocaleTimeString([], { 
    hour: 'numeric', 
    minute: '2-digit', 
    hour12: true 
  });
};

export default function PublicBooking({ forceReschedule = false, onClose, prefill = {} }) {
  const [searchParams] = useSearchParams();

  const urlName = searchParams.get("name") || "";
  const urlEmail = searchParams.get("email") || "";
  const isRescheduleFromUrl = searchParams.get("reschedule") === "true";

  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token missing. Please log in again.");
        }

        const res = await fetch(
          `http://192.168.0.245:4000/event-types/${eventId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Failed to load event");
        }

        const data = await res.json();
        console.log("Fetched event data:", data);

        setEvent({
          id: data._id,
          title: data.title || "Untitled Event",
          duration: data.duration || 30,
          host: data.hostName || data.host?.name || "Host",
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data._id || "default"}`,
          timezone: data.timezone || "Asia/Kolkata",
        });

        if (data.timezone) {
          setSelectedTimezone(data.timezone);
        }
      } catch (err) {
        console.error("Event fetch error:", err);
        setError(err.message || "Something went wrong");
        toast.error(err.message || "Could not load event details");
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    } else {
      setError("Invalid event link");
      setLoading(false);
    }
  }, [eventId]);

  const [step, setStep] = useState(forceReschedule ? "calendar" : "calendar");

  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedTimezone, setSelectedTimezone] = useState(timezoneOptions[0].value);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  // Form state
  const [name, setName] = useState(prefill?.name || urlName || "");
  const [email, setEmail] = useState(prefill?.email || urlEmail || "");
  const [guestEmails, setGuestEmails] = useState("");
  const [note, setNote] = useState("");
  const [showGuestsInput, setShowGuestsInput] = useState(false);
  const [rescheduleReason, setRescheduleReason] = useState("");

  const [showRescheduleModal, setShowRescheduleModal] = useState(isRescheduleFromUrl);
  const [isRescheduleMode] = useState(isRescheduleFromUrl || forceReschedule);

  // Calendar Logic
  const goToPrevMonth = () => {
    setCurrentMonth(prev => prev.subtract(1, 'month'));
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => prev.add(1, 'month'));
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const today = dayjs();

  const days = useMemo(() => {
    const startOfMonth = currentMonth.startOf('month');
    const firstDayIndex = startOfMonth.day() === 0 ? 6 : startOfMonth.day() - 1;
    const daysInMonth = currentMonth.daysInMonth();
    const daysArray = [];

    for (let i = 0; i < firstDayIndex; i++) daysArray.push(null);

    for (let d = 1; d <= daysInMonth; d++) {
      const date = startOfMonth.date(d);
      const isAvailable = date.startOf('day').isSameOrAfter(today.startOf('day'));

      daysArray.push({ 
        date: date.toDate(),
        day: d, 
        isToday: date.isSame(today, 'day'), 
        available: isAvailable 
      });
    }
    return daysArray;
  }, [currentMonth, today]);

  const availableTimeSlots = [
    "12:00am", "12:30am", "1:00pm", "1:30pm", "2:00pm", "2:30pm", 
    "3:00pm", "3:30pm", "4:00pm", "4:30pm", "5:00pm", "5:30pm", "6:00pm"
  ];

  const handleSchedule = (e) => {
    e.preventDefault();
    setStep("success");
    toast.success(isRescheduleMode ? "Event rescheduled!" : "Event scheduled!");
    if (onClose) setTimeout(onClose, 2000);
  };

  const handleDateSelection = (dateObject) => {
    setSelectedDate(dateObject);
    setSelectedTime(null);
  };

  const handleTimeSelection = (time) => {
    setSelectedTime(time);
    setStep("form");
  };

  const handleBackToCalendar = () => {
    setStep("calendar");
    setSelectedTime(null);
  };

  const closeRescheduleModal = () => {
    setShowRescheduleModal(false);
    setRescheduleReason("");
    setStep("calendar");
  };

  // === LOADING STATE ===
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading event details...</p>
        </div>
      </div>
    );
  }

  // === ERROR STATE ===
  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Available</h2>
          <p className="text-gray-600">{error || "This scheduling link is invalid or no longer active."}</p>
        </div>
      </div>
    );
  }

  // === SUCCESS SCREEN ===
  if (step === "success") {
    const displayEndTime = getEndTime(selectedTime, event.duration, selectedDate);

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 font-inter">
        <div className="max-w-4xl w-full mt-10">
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-12 text-center border-t-8 border-blue-600">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
              {isRescheduleMode ? "Event rescheduled" : "You are scheduled"}
            </h1>
            <p className="text-base sm:text-xl text-gray-600 mb-8 sm:mb-10">
              A calendar invitation has been sent to your email address.
            </p>

            <div className="bg-gray-50 rounded-2xl p-4 sm:p-8 text-left max-w-2xl mx-auto space-y-4 sm:space-y-6 border border-gray-200">
              <h2 className="text-xl sm:text-2xl font-bold">{event.title}</h2>
              <div className="flex items-center gap-3 text-sm sm:text-base text-gray-700">
                <img src={event.avatar} alt={event.host} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full" />
                <span>{event.host}</span>
              </div>
              <div className="flex items-center gap-3 text-sm sm:text-base text-gray-700">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <span>
                  {selectedTime} - {displayEndTime},{" "}
                  {selectedDate?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm sm:text-base text-gray-700">
                <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <span>{timezoneOptions.find(t => t.value === selectedTimezone)?.label || "Timezone Unknown"}</span>
              </div>
            </div>
          </div>
        </div>
        <Toaster position="top-center" />
      </div>
    );
  }

  // === RESCHEDULE MODAL ===
  if (showRescheduleModal) {
    const selectedTzLabel = timezoneOptions.find(t => t.value === selectedTimezone)?.label;
    const displayEndTimeForSidebar = selectedTime ? getEndTime(selectedTime, event.duration, selectedDate) : null;

    return (
      <>
        <div className="fixed inset-0 bg-white bg-opacity-50 z-50" onClick={closeRescheduleModal} />
        <div className="fixed inset-0 z-50 overflow-y-auto font-inter">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="w-full max-w-7xl bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
                <h2 className="text-2xl font-bold text-gray-900">Reschedule Event</h2>
                <button onClick={closeRescheduleModal} className="p-2 hover:bg-gray-200 rounded-full transition">
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="grid lg:grid-cols-12 gap-6 lg:gap-10">
                <div className="lg:col-span-4 p-6 sm:p-8 lg:border-r border-gray-100 bg-gray-50/30">
                  <div className="lg:sticky lg:top-8">
                    <h2 className="text-lg sm:text-xl font-medium text-gray-600 mb-1">{event.host}</h2>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">{event.title}</h1>
                    <div className="space-y-4 sm:space-y-5 text-gray-700 text-sm sm:text-base">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">{event.duration} min</span>
                      </div>
                      {selectedDate && (
                        <>
                          <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-gray-500" />
                            <span className="font-medium">
                              {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                              {selectedTime && (
                                <span className="ml-1 text-blue-600 font-semibold">
                                  {selectedTime} - {displayEndTimeForSidebar}
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Globe className="w-5 h-5 text-gray-500" />
                            <span className="font-medium">{selectedTzLabel}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-8 p-6 sm:p-10">
                  {step === "calendar" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-gray-900">Select a Date & Time</h2>
                        <div className="flex justify-between items-center mb-6">
                          <button onClick={goToPrevMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition">
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                            {currentMonth.format("MMMM YYYY")}
                          </h3>
                          <button onClick={goToNextMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition">
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-7 text-center text-xs sm:text-sm font-medium text-gray-600 mb-3">
                          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => <div key={d}>{d}</div>)}
                        </div>

                        <div className="grid grid-cols-7 gap-1 sm:gap-3">
                          {days.map((day, i) =>
                            !day ? <div key={`empty-${i}`} className="h-10 sm:h-12" /> : (
                              <button
                                key={day.day}
                                onClick={() => day.available && handleDateSelection(day.date)}
                                disabled={!day.available}
                                className={`relative h-10 sm:h-12 rounded-full text-sm sm:text-base font-medium transition-all ${
                                  !day.available ? "text-gray-300 cursor-not-allowed" :
                                  selectedDate?.getDate() === day.day && selectedDate?.getMonth() === currentMonth.month() && selectedDate?.getYear() === currentMonth.year()
                                    ? "bg-blue-600 text-white shadow-lg" : 
                                  day.isToday && day.available 
                                    ? "border-2 border-blue-400 text-blue-600 hover:bg-blue-50" : 
                                  "text-gray-900 hover:bg-gray-100"
                                }`}
                              >
                                {day.day}
                              </button>
                            )
                          )}
                        </div>

                        <div className="mt-8 sm:mt-10 flex flex-col gap-2">
                          <div className="flex items-center gap-3 text-sm text-gray-700">
                            <Globe className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">Time zone</span>
                          </div>
                          <select 
                            value={selectedTimezone}
                            onChange={(e) => setSelectedTimezone(e.target.value)}
                            className="py-3 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white text-gray-700 cursor-pointer text-sm sm:text-base"
                          >
                            {timezoneOptions.map(tz => (
                              <option key={tz.value} value={tz.value}>{tz.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {selectedDate && (
                        <div className="pt-6 md:pt-0 md:border-l md:pl-10">
                          <h3 className="text-lg sm:text-xl font-semibold mb-5 text-gray-700">
                            {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                          </h3>
                          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                            {availableTimeSlots.map(time => (
                              <button
                                key={time}
                                onClick={() => handleTimeSelection(time)}
                                className="w-full py-3 px-4 border border-blue-600 text-blue-600 rounded-xl text-base sm:text-lg font-semibold hover:bg-blue-50 transition"
                              >
                                {time}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {step === "form" && (
                    <div className="max-w-xl">
                      <button onClick={handleBackToCalendar} className="mb-8 p-2 rounded-full hover:bg-gray-100 transition">
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                      </button>
                      <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-900">Confirm Your New Time</h2>

                      <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 mb-6">
                        <p className="text-yellow-800 font-medium">
                          Your original time will be freed up once you confirm the new time.
                        </p>
                      </div>

                      <form onSubmit={handleSchedule} className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reason for rescheduling <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            required
                            value={rescheduleReason}
                            onChange={(e) => setRescheduleReason(e.target.value)}
                            rows={5}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="Let the host know why you're rescheduling..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Name <span className="text-red-500">*</span>
                          </label>
                          <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Your name" />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="you@example.com" />
                        </div>

                        <div className="space-y-4">
                          <button type="button" onClick={() => setShowGuestsInput(!showGuestsInput)} className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium py-1 text-sm sm:text-base">
                            <Users className="w-5 h-5" />
                            {showGuestsInput ? '– Remove Guests' : '+ Add Guests'}
                          </button>
                          {showGuestsInput && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Guest Emails (comma separated)</label>
                              <input type="text" value={guestEmails} onChange={e => setGuestEmails(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="guest1@example.com, guest2@example.com" />
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Please share anything that will help prepare for our meeting.
                          </label>
                          <textarea value={note} onChange={e => setNote(e.target.value)} rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Optional" />
                        </div>

                        <p className="text-xs text-gray-500 pt-2">
                          By proceeding, you confirm that you have read and agree to Calendly's{" "}
                          <a href="#" className="text-blue-600 hover:underline">Terms of Use</a> and{" "}
                          <a href="#" className="text-blue-600 hover:underline">Privacy Notice</a>.
                        </p>

                        <div className="flex gap-4 pt-6">
                          <button
                            type="button"
                            onClick={closeRescheduleModal}
                            className="flex-1 py-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="flex-1 py-4 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700 transition shadow-lg"
                          >
                            Confirm Reschedule
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // === MAIN BOOKING FLOW ===
  const selectedTzLabel = timezoneOptions.find(t => t.value === selectedTimezone)?.label;
  const displayEndTimeForSidebar = selectedTime ? getEndTime(selectedTime, event.duration, selectedDate) : null;

  return (
    <>
      <div className="min-h-screen bg-gray-50 pt-12 font-inter">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-10">
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 bg-white shadow-xl rounded-3xl overflow-hidden">
            
            <div className="lg:col-span-4 p-6 sm:p-8 lg:border-r border-gray-100">
              <div className="lg:sticky lg:top-8">
                <h2 className="text-lg sm:text-xl font-medium text-gray-600 mb-1">{event.host}</h2>
                <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">{event.title}</h1>
                <div className="space-y-4 sm:space-y-5 text-gray-700 text-sm sm:text-base">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">{event.duration} min</span>
                  </div>
                  
                  {selectedDate && (
                    <>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">
                          {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                          {selectedTime && (
                            <span className="ml-1 text-blue-600 font-semibold">
                              {selectedTime} - {displayEndTimeForSidebar}
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">{selectedTzLabel}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 p-6 sm:p-10">
              {step === "calendar" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-gray-900">Select a Date & Time</h2>
                    <div className="flex justify-between items-center mb-6">
                      <button onClick={goToPrevMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                        {currentMonth.format("MMMM YYYY")}
                      </h3>
                      <button onClick={goToNextMonth} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 text-center text-xs sm:text-sm font-medium text-gray-600 mb-3">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => <div key={d}>{d}</div>)}
                    </div>

                    <div className="grid grid-cols-7 gap-1 sm:gap-3">
                      {days.map((day, i) =>
                        !day ? <div key={`empty-${i}`} className="h-10 sm:h-12" /> : (
                          <button
                            key={day.day}
                            onClick={() => day.available && handleDateSelection(day.date)}
                            disabled={!day.available}
                            className={`relative h-10 sm:h-12 rounded-full text-sm sm:text-base font-medium transition-all ${
                              !day.available ? "text-gray-300 cursor-not-allowed" :
                              selectedDate?.getDate() === day.day && selectedDate?.getMonth() === currentMonth.month() && selectedDate?.getYear() === currentMonth.year()
                                ? "bg-blue-600 text-white shadow-lg" : 
                              day.isToday && day.available 
                                ? "border-2 border-blue-400 text-blue-600 hover:bg-blue-50" : 
                              "text-gray-900 hover:bg-gray-100"
                            }`}
                          >
                            {day.day}
                          </button>
                        )
                      )}
                    </div>

                    <div className="mt-8 sm:mt-10 flex flex-col gap-2">
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">Time zone</span>
                      </div>
                      <select 
                        value={selectedTimezone}
                        onChange={(e) => setSelectedTimezone(e.target.value)}
                        className="py-3 px-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white text-gray-700 cursor-pointer text-sm sm:text-base"
                      >
                        {timezoneOptions.map(tz => (
                          <option key={tz.value} value={tz.value}>{tz.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {selectedDate && (
                    <div className="pt-6 md:pt-0 md:border-l md:pl-10">
                      <h3 className="text-lg sm:text-xl font-semibold mb-5 text-gray-700">
                        {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                      </h3>
                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {availableTimeSlots.map(time => (
                          <button
                            key={time}
                            onClick={() => handleTimeSelection(time)}
                            className="w-full py-3 px-4 border border-blue-600 text-blue-600 rounded-xl text-base sm:text-lg font-semibold hover:bg-blue-50 transition"
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === "form" && (
                <div className="max-w-xl">
                  <button onClick={handleBackToCalendar} className="mb-8 p-2 rounded-full hover:bg-gray-100 transition">
                    <ArrowLeft className="w-6 h-6 text-gray-700" />
                  </button>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-900">Enter Details</h2>
                  
                  <form onSubmit={handleSchedule} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Your name" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="you@example.com" />
                    </div>

                    <div className="space-y-4">
                      <button type="button" onClick={() => setShowGuestsInput(!showGuestsInput)} className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium py-1 text-sm sm:text-base">
                        <Users className="w-5 h-5" />
                        {showGuestsInput ? '– Remove Guests' : '+ Add Guests'}
                      </button>
                      {showGuestsInput && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Guest Emails (comma separated)</label>
                          <input type="text" value={guestEmails} onChange={e => setGuestEmails(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="guest1@example.com, guest2@example.com" />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Please share anything that will help prepare for our meeting.
                      </label>
                      <textarea value={note} onChange={e => setNote(e.target.value)} rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Optional" />
                    </div>

                    <p className="text-xs text-gray-500 pt-2">
                      By proceeding, you confirm that you have read and agree to Calendly's{" "}
                      <a href="#" className="text-blue-600 hover:underline">Terms of Use</a> and{" "}
                      <a href="#" className="text-blue-600 hover:underline">Privacy Notice</a>.
                    </p>

                    <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition shadow-lg mt-6">
                      Schedule Event
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Toaster position="top-center" />
    </>
  );
}