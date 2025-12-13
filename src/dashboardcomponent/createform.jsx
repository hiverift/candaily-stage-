// components/CreateEventPanel.jsx
import React, { useState, useRef, useEffect, use } from "react";
import axios from "axios";
import {
  X,
  Clock,
  Calendar,
  Users,
  MapPin,
  MessageSquare,
  Video,
  Phone,
  Building,
  Globe,
  Check,
  ChevronDown,
} from "lucide-react";
import CalendarView from "./abc.jsx";

// ----- Main Component -----
export default function CreateForm({ onClose, onCreate, eventToEdit }) {
  const isEditMode = !!eventToEdit;

  // Form state
  const [title, setTitle] = useState(eventToEdit?.title || "");
  const [duration, setDuration] = useState(
    eventToEdit?.duration?.toString() || "30"
  );
  const [maxBookings, setMaxBookings] = useState(
    eventToEdit?.maxBookingsPerDay?.toString() || "5"
  );
  const [locationType, setLocationType] = useState(
    eventToEdit?.location || "google_meet"
  );
  const [askPhone, setAskPhone] = useState(true);
  const [askPurpose, setAskPurpose] = useState(true);
  const [eventType, setEventType] = useState(eventToEdit?.type || "one-on-one");

  // UI state
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [openLocationModal, setOpenLocationModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const modalRef = useRef(null);

  // Location config state
  const [zoomConnected, setZoomConnected] = useState(false);
  const [googleMeetConnected, setGoogleMeetConnected] = useState(true);
  const [countryCode, setCountryCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [physicalAddress, setPhysicalAddress] = useState("");
  const [AUTH_TOKEN, setToken] = useState();
 
  // ----- CONFIG -----
  const API_BASE_URL = "http://192.168.0.245:5000";

  // ----- AXIOS CLIENT -----
  const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AUTH_TOKEN}`,
    },
  });

  // Request interceptor (ensures token is sent)
  axiosClient.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${AUTH_TOKEN}`;
    return config;
  });

  // Response interceptor with retry on 5xx
  axiosClient.interceptors.response.use(
    (res) => res,
    async (error) => {
      const original = error.config;
      if (error.response?.status >= 500 && !original?._retry) {
        original._retry = true;
        await new Promise((r) => setTimeout(r, 800));
        return axiosClient(original);
      }
      return Promise.reject(error);
    }
  );

  useEffect(() => {

     const token = localStorage.getItem("token");
  console.log("Auth Token in CreateForm:", token);
  setToken(token);

  });
  // Sync with eventToEdit when editing
  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title || "");
      setDuration((eventToEdit.duration || 30).toString());
      setMaxBookings((eventToEdit.maxBookingsPerDay || 5).toString());
      setLocationType(eventToEdit.location || "google_meet");
      setEventType(eventToEdit.type || "one-on-one");

      // Questions
      const questions = eventToEdit.questions || [];
      setAskPhone(questions.some((q) => q.question === "Phone Number"));
      setAskPurpose(questions.some((q) => q.question === "Purpose of Meeting"));

      // Location details
      if (eventToEdit.location === "phone" && eventToEdit.locationValue) {
        const match = eventToEdit.locationValue.match(
          /Phone Call • ([+]\d+) (.+)/
        );
        if (match) {
          setCountryCode(match[1]);
          setPhoneNumber(match[2]);
        }
      }
      if (eventToEdit.location === "physical" && eventToEdit.locationValue) {
        setPhysicalAddress(
          eventToEdit.locationValue.replace("In Person • ", "")
        );
      }
    }
  }, [eventToEdit]);

  useEffect(() => {
    setIsMounted(true);
    const t = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  // Close location modal on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setOpenLocationModal(null);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const locations = [
    { value: "google_meet", label: "Google Meet", icon: Globe },
    { value: "zoom", label: "Zoom", icon: Video },
    { value: "phone", label: "Phone Call", icon: Phone },
    { value: "physical", label: "In Person", icon: Building },
  ];

  const isConfigured = {
    google_meet: googleMeetConnected,
    zoom: zoomConnected,
    phone: !!phoneNumber.trim(),
    physical: !!physicalAddress.trim(),
  };

  const handleSaveLocation = () => setOpenLocationModal(null);

  // === API CALLS ===
  const createEventType = async (data) => {
    const response = await axiosClient.post("/event-types", data);
    return response.data;
  };

  const updateEventType = async (id, data) => {
    const response = await axiosClient.patch(`/event-types/${id}`, data);
    return response.data;
  };

  const testServerConnection = async () => {
    try {
      await axiosClient.get("/health");
      return true;
    } catch {
      try {
        await axiosClient.get("/");
        return true;
      } catch {
        return false;
      }
    }
  };

  // === FORM SUBMIT ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Event title is required");
      return;
    }

    if (!isConfigured[locationType]) {
      setOpenLocationModal(locationType);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const serverOk = await testServerConnection();
      if (!serverOk) throw new Error("Server is not reachable");

      const locationValue =
        locationType === "google_meet"
          ? "Google Meet"
          : locationType === "zoom"
          ? "Zoom"
          : locationType === "phone"
          ? `Phone Call • ${countryCode} ${phoneNumber}`
          : `In Person • ${physicalAddress}`;

      const questions = [
        { question: "Name & Email" },
        ...(askPhone ? [{ question: "Phone Number" }] : []),
        ...(askPurpose ? [{ question: "Purpose of Meeting" }] : []),
      ];

      const availabilityData= [
  {
    day: "Monday",
    start: "09:00",
    end: "12:00",
  },
  {
    day: "Monday",
    start: "13:00",
    end: "17:00",
  },
  {
    day: "Tuesday",
    start: "09:00",
    end: "12:00",
  },
  {
    day: "Tuesday",
    start: "13:00",
    end: "17:00",
  },
  
]

  


      const payload = {
        title: title.trim(),
        type: eventType,
        duration: parseInt(duration),
        availability: availabilityData,
        maxBookingsPerDay: parseInt(maxBookings),
        location: locationType,
        locationValue,
        questions,
        isActive: true,
      };

      let result;
      if (isEditMode && eventToEdit?._id) {
        result = await updateEventType(eventToEdit._id, payload);
      } else {
        result = await createEventType(payload);
      }

      onCreate(result);
      onClose();
    } catch (error) {
      console.error("Submit error:", error);
      let msg = "Failed to save event";

      if (!error.response) {
        msg = "Network error — check if backend is running";
      } else if (error.response.status === 401) {
        msg = "Unauthorized — invalid or expired token";
      } else if (error.response.status === 404) {
        msg = "Event not found";
      } else if (error.response.data?.message) {
        msg = error.response.data.message;
      }

      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 z-40 ${
          isMounted ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Main Panel */}
      <div
        className={`fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col overflow-hidden transition-transform duration-500 ease-out ${
          isMounted ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Loading */}
        {isLoading && (
          <div className="absolute inset-0 bg-white z-50 flex items-center justify-center">
            <div className="flex space-x-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditMode ? "Edit Event Type" : "Create Event Type"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
            {submitError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
                <div className="flex items-center gap-2 text-sm text-red-800">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    !
                  </div>
                  {submitError}
                  <button
                    type="button"
                    onClick={() => setSubmitError("")}
                    className="ml-auto hover:bg-red-100 p-1 rounded-full transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., 30-minute Strategy Call"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition disabled:opacity-50"
                disabled={isSubmitting}
              />
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Event Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["one-on-one", "group"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setEventType(type)}
                    className={`py-4 rounded-xl font-semibold capitalize transition-all ${
                      eventType === type
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={isSubmitting}
                  >
                    {type.replace("-", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                <Clock className="w-5 h-5" /> Duration
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["15", "30", "60"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDuration(m)}
                    className={`py-4 rounded-xl font-semibold transition-all ${
                      duration === m
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 hover:bg-gray-200"
                    } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={isSubmitting}
                  >
                    {m} min
                  </button>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div>
              <button
                type="button"
                onClick={() => setIsAvailabilityOpen(!isAvailabilityOpen)}
                className="w-full flex items-center justify-between p-5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
                disabled={isSubmitting}
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-gray-700" />
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">
                      Availability
                    </div>
                    <div className="text-sm text-gray-600">
                      Working hours (default)
                    </div>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                    isAvailabilityOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  isAvailabilityOpen ? "max-h-96 mt-4" : "max-h-0 mt-0"
                }`}
              >
                <div className="border border-gray-300 rounded-xl p-6 bg-white space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="text-base font-medium text-gray-800">
                      Working hours (default)
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditModalOpen(true);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                      disabled={isSubmitting}
                    >
                      <svg
                        className="w-5 h-5 text-gray-600"
                        viewBox="0 0 10 10"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m3.72 8.78-3.188.7.7-3.189L6.794.706a.739.739 0 0 1 1.038.07L9.217 2.16a.739.739 0 0 1 .069 1.04Z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Max Bookings */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                <Users className="w-5 h-5" /> Max Bookings Per Day
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={maxBookings}
                onChange={(e) => setMaxBookings(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                disabled={isSubmitting}
              />
            </div>

            {/* Location Selector */}
            <div className="relative" ref={modalRef}>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
                <MapPin className="w-5 h-5" /> Location
              </label>
              <div className="space-y-3">
                {locations.map((loc) => {
                  const Icon = loc.icon;
                  const selected = locationType === loc.value;
                  const configured = isConfigured[loc.value];

                  return (
                    <div key={loc.value} className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          if (!isSubmitting) {
                            setLocationType(loc.value);
                            setOpenLocationModal(
                              openLocationModal === loc.value ? null : loc.value
                            );
                          }
                        }}
                        className={`w-full p-5 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                          selected
                            ? "border-blue-600 bg-blue-50 shadow-sm"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        } ${
                          isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={isSubmitting}
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <Icon className="w-6 h-6 text-gray-700" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {loc.label}
                            </div>
                            {configured && (
                              <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                                <Check className="w-3 h-3" /> Configured
                              </div>
                            )}
                          </div>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-500 transition-transform ${
                            openLocationModal === loc.value ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* Location Settings Modal */}
                      {openLocationModal === loc.value && !isSubmitting && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                          <div className="p-6">
                            <h4 className="text-lg font-bold mb-4">
                              {loc.label} Settings
                            </h4>
                            {loc.value === "google_meet" && (
                              <div className="text-center py-8">
                                {googleMeetConnected ? (
                                  <div className="p-6 bg-green-50 rounded-xl">
                                    <Check className="w-12 h-12 text-green-600 mx-auto mb-3" />
                                    <p className="font-semibold text-green-800">
                                      Connected!
                                    </p>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setGoogleMeetConnected(true)}
                                    className="w-full py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700"
                                  >
                                    Connect Google Account
                                  </button>
                                )}
                              </div>
                            )}
                            {loc.value === "phone" && (
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Country Code
                                  </label>
                                  <select
                                    value={countryCode}
                                    onChange={(e) =>
                                      setCountryCode(e.target.value)
                                    }
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="+1">+1 (US)</option>
                                    <option value="+44">+44 (UK)</option>
                                    <option value="+91">+91 (India)</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number
                                  </label>
                                  <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) =>
                                      setPhoneNumber(e.target.value)
                                    }
                                    placeholder="123-456-7890"
                                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                              </div>
                            )}
                            {loc.value === "physical" && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Address
                                </label>
                                <textarea
                                  value={physicalAddress}
                                  onChange={(e) =>
                                    setPhysicalAddress(e.target.value)
                                  }
                                  placeholder="Enter full address"
                                  rows={3}
                                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 resize-vertical"
                                />
                              </div>
                            )}
                          </div>
                          <div className="flex border-t bg-gray-50">
                            <button
                              type="button"
                              onClick={() => setOpenLocationModal(null)}
                              className="flex-1 py-4 font-medium text-gray-700 hover:bg-gray-100"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveLocation}
                              className="flex-1 py-4 font-bold text-blue-600 hover:bg-blue-50"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Questions */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
                <MessageSquare className="w-5 h-5" /> Additional Questions
              </label>
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-xl font-medium">
                  Name & Email (required)
                </div>
                {["Phone Number", "Purpose of Meeting"].map((q, i) => (
                  <label
                    key={i}
                    className="flex items-center justify-between p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    <span className="font-medium">{q}</span>
                    <input
                      type="checkbox"
                      checked={i === 0 ? askPhone : askPurpose}
                      onChange={(e) =>
                        i === 0
                          ? setAskPhone(e.target.checked)
                          : setAskPurpose(e.target.checked)
                      }
                      className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500"
                      disabled={isSubmitting}
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-6 bg-gray-50">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 border rounded-xl font-semibold hover:bg-gray-100 transition disabled:opacity-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className={`flex-1 py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center ${
                  isSubmitting
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : isEditMode ? (
                  "Update Event"
                ) : (
                  "Publish Event"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Availability Edit Modal */}
      {isEditModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/70 z-50"
            onClick={() => setIsEditModalOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
              <CalendarView
                modalMode={true}
                onClose={() => setIsEditModalOpen(false)}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}
