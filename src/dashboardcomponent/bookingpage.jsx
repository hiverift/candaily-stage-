
import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isBefore, startOfDay, addMinutes } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, Phone, Calendar, Globe, Plus, Search, X, Video, Edit, Check, Link, Users, ChevronDown } from 'lucide-react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { useAuth } from './src/context/authContext';  // Adjust path if your file is elsewhere

// --- MOCK DATA ---
const EVENT_DURATIONS = [15, 30, 60];

const TIMEZONES = [
    { value: 'America/New_York', label: 'Eastern Time - US & Canada', offset: '(UTC-05:00)' },
    { value: 'America/Chicago', label: 'Central Time - US & Canada', offset: '(UTC-06:00)' },
    { value: 'Europe/London', label: 'London, Dublin, Lisbon', offset: '(UTC+00:00)' },
    { value: 'Asia/Kolkata', label: 'India Standard Time', offset: '(UTC+05:30)' },
    { value: 'Asia/Tokyo', label: 'Tokyo', offset: '(UTC+09:00)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time - US & Canada', offset: '(UTC-08:00)' },
];

const CONNECTION_METHODS = [
    { value: 'phone', label: 'Phone call', icon: Phone },
    { value: 'zoom', label: 'Zoom Meeting', icon: Video },
    { value: 'google_meet', label: 'Google Meet', icon: Link },
    { value: 'teams', label: 'Microsoft Teams', icon: Users },
];

const INTEGRATION_STATUS = {
    zoom: false,
    google_meet: false,
    teams: false,
    phone: true,
};

const MOCK_CONTACTS = [
    { id: 1, name: 'John Doe (Client)', phone: '+14155552671' },
    { id: 2, name: 'Jane Smith (Lead)', phone: '+442079460958' },
    { id: 3, name: 'Alex Johnson (Partner)', phone: '+61298765432' },
];

const AVAILABLE_SLOTS = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM',
    '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM'
];

const generateCalendar = (date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const today = startOfDay(new Date(2025, 11, 10));

    const days = eachDayOfInterval({ start, end });

    const unavailableDates = days.filter(day => {
        const dayOfWeek = day.getDay();
        const dateNum = day.getDate();
        const isPast = isBefore(day, today) && !isSameDay(day, today);
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isSpecificUnavailable = [6, 13, 20, 27].includes(dateNum);

        return isPast || isWeekend || isSpecificUnavailable;
    });

    return days.map(day => ({
        date: day,
        day: day.getDate(),
        available: !unavailableDates.some(unavailableDay => isSameDay(day, unavailableDay)),
        isToday: isSameDay(day, today),
        isCurrentMonth: day.getMonth() === date.getMonth(),
    }));
};

// --- YOUR EXACT AnswerQuestionsModal ---
function AnswerQuestionsModal({ isOpen, onClose, onSave }) {
    const [message, setMessage] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(message);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="relative bg-white w-full max-w-xl p-6 rounded-lg shadow-xl border animate-fadeIn">
                {/* Close Icon */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
                >
                    <X size={20} />
                </button>

                {/* Title */}
                <h1 className="text-xl font-semibold mb-4">
                    Answer questions on behalf of your invitee
                </h1>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <p className="font-medium mb-2">
                            Please share anything that will help prepare for our meeting.
                        </p>
                        <textarea
                            className="w-full min-h-[140px] border rounded-md p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            maxLength={10000}
                            placeholder="Type here..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        ></textarea>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-md hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// --- OTHER MODALS ---
function IntegrationConnectionModal({ isOpen, onClose, method }) {
    if (!isOpen) return null;
    const methodName = CONNECTION_METHODS.find(m => m.value === method)?.label || method;

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl border max-w-md w-full p-6 animate-fadeIn">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Connect {methodName}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <div className="flex items-start gap-3 text-red-600 mb-6">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="text-sm">
                        {methodName} is not connected.&nbsp;
                        Visit the <a href={`/integrations/${method}`} target="_blank" rel="noopener" className="text-blue-600 hover:underline font-medium">integration page</a> to connect.
                    </div>
                </div>
                <div className="flex justify-end">
                    <button onClick={onClose} className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
}

function HostPhoneDetailsModal({ isOpen, onClose, hostPhone, setHostPhone, additionalDetails, setAdditionalDetails }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl border max-w-md w-full animate-fadeIn">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Host phone number & call details</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Host’s phone number <span className="text-red-500">*</span>
                        </label>
                        <PhoneInput
                            international
                            defaultCountry="US"
                            value={hostPhone}
                            onChange={setHostPhone}
                            placeholder="Enter host phone number"
                            className="phone-input-host"
                        />
                        <p className="text-xs text-gray-500 mt-2">This is the number the invitee will call</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Additional information <span className="text-gray-500">(Optional)</span>
                        </label>
                        <textarea
                            value={additionalDetails}
                            onChange={(e) => setAdditionalDetails(e.target.value)}
                            placeholder="Extension number or additional call details"
                            rows={4}
                            maxLength={10000}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 p-6 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-100">
                        Cancel
                    </button>
                    <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium">
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}

function AddContactModal({ isOpen, onClose, onSave }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [timezone, setTimezone] = useState("");
    const [showTZ, setShowTZ] = useState(false);
    const timezones = ["Asia/Kolkata", "Asia/Dubai", "America/New_York", "Europe/London", "Australia/Sydney"];

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !email) return;
        onSave({ name, email, phone, timezone });
        setName(""); setEmail(""); setPhone(""); setTimezone(""); onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-white w-full max-w-lg rounded-lg shadow-xl border p-6 animate-fadeIn">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-semibold">Add Contact</h1>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="flex items-center gap-1 font-semibold">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input type="text" className="w-full border rounded-md px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div>
                        <label className="flex items-center gap-1 font-semibold">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input type="email" className="w-full border rounded-md px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="example@mail.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div>
                        <label className="flex items-center gap-1 font-semibold">
                            Phone <span className="text-gray-500 font-normal">(Optional)</span>
                        </label>
                        <PhoneInput
                            international
                            defaultCountry="US"
                            value={phone}
                            onChange={setPhone}
                            className="phone-input-custom"
                        />
                    </div>
                    <div className="relative">
                        <label className="flex items-center gap-2 font-semibold">
                            Time zone <span className="text-gray-500 font-normal">(Optional)</span>
                        </label>
                        <button type="button" className="w-full border rounded-md px-3 py-2 mt-1 flex items-center justify-between hover:bg-gray-50" onClick={() => setShowTZ(!showTZ)}>
                            {timezone || "Select time zone"}
                            <ChevronDown className="text-blue-600" />
                        </button>
                        {showTZ && (
                            <div className="absolute w-full border bg-white rounded-md mt-1 shadow-md z-20 max-h-48 overflow-y-auto">
                                {timezones.map((tz, idx) => (
                                    <div key={idx} onClick={() => { setTimezone(tz); setShowTZ(false); }} className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                                        {tz}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-gray-100">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            Save contact
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// --- MAIN COMPONENT ---
export default function BookingPage() {
    const [currentMonth, setCurrentMonth] = useState(new Date(2025, 11, 1));
    const [selectedDate, setSelectedDate] = useState(new Date(2025, 11, 10));
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedDuration, setSelectedDuration] = useState(30);
    const [meetingName, setMeetingName] = useState('New Meeting (clone)');
    const [isEditingName, setIsEditingName] = useState(false);
    const [selectedTimezone, setSelectedTimezone] = useState(TIMEZONES.find(tz => tz.value === 'America/New_York') || TIMEZONES[0]);
    const [connectionMethod, setConnectionMethod] = useState('phone');
    const [callDirection, setCallDirection] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [hostPhoneNumber, setHostPhoneNumber] = useState('+12125550123');
    const [callDetails, setCallDetails] = useState('');
    const [showIntegrationModal, setShowIntegrationModal] = useState(false);
    const [showHostPhoneModal, setShowHostPhoneModal] = useState(false);
    const [showAddContactModal, setShowAddContactModal] = useState(false);
    const { user , loading } = useAuth();
    const [showAnswerQuestionsModal, setShowAnswerQuestionsModal] = useState(false);
    const [showTimezoneModal, setShowTimezoneModal] = useState(false);
    const [timezoneSearch, setTimezoneSearch] = useState('');
    const [notesMessage, setNotesMessage] = useState('');
    const [contacts, setContacts] = useState([]);
    const [contactSearch, setContactSearch] = useState('');

    const calendarDays = generateCalendar(currentMonth);

    useEffect(() => {
        if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
            setPhoneError('Please enter a valid phone number');
        } else {
            setPhoneError('');
        }
    }, [phoneNumber]);

    const handleConnectionChange = (e) => {
        const method = e.target.value;
        setConnectionMethod(method);
        setCallDirection(null);

        if (method !== 'phone' && !INTEGRATION_STATUS[method]) {
            setShowIntegrationModal(true);
        }
    };

    const handleCallDirectionChange = (direction) => {
        setCallDirection(direction);
        if (direction === 'invitee_calls') {
            setShowHostPhoneModal(true);
        }
    };

    const handleEditName = () => setIsEditingName(true);
    const handleSaveName = () => {
        setIsEditingName(false);
        setMeetingName(meetingName.trim() || 'New Meeting');
    };

    // === FIXED BOOKING API CALL ===

    const handleBookMeeting = async () => {
        if (!selectedTime) {
            alert('Please select a time.');
            return;
        }
        if (connectionMethod === 'phone' && callDirection === 'host_calls' && (!phoneNumber || phoneError)) {
            alert('Please enter a valid invitee phone number.');
            return;
        }
        if (connectionMethod === 'phone' && !callDirection) {
            alert('Please select who calls whom.');
            return;
        }

        const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

        const formatTimeForAPI = (time) => {
            const [hourMinute, period] = time.split(' ');
            const [hourStr] = hourMinute.split(':');
            let hour = parseInt(hourStr);
            if (hour === 12) hour = period === 'AM' ? 12 : 0;
            hour = hour === 0 ? 12 : hour;
            const formattedHour = String(hour).padStart(2, '0');
            return `${formattedHour}:00 ${period}`;
        };

        const selectedTimeStr = formatTimeForAPI(selectedTime);

        const callTypeMap = {
            phone: 'phone_call',
            google_meet: 'google_meet',
            zoom: 'zoom',
            teams: 'teams',
        };

        // === SAFE HARDCODED VALUES (replace later with auth) ===
        const userEmail = user.email;
        // const hostName = "Shubham"; // Change when adding real user data
        const hostName = user.name || user.fullName || user.username || "Host";
        const hosts = [
            {
                id: "host1",
                name: hostName,
                timeZone: selectedTimezone.value,
            },
        ];

        const contactsPayload = contacts.length > 0
            ? contacts.map((c, i) => ({
                id: `contact${i + 1}`,
                name: c.name,
                email: c.email || "guest@example.com",
                phone: c.phone || "",
            }))
            : [
                {
                    id: "contact1",
                    name: "Guest",
                    email: "guest@example.com",
                    phone: "",
                },
            ];

        const contactQuestionsPayload = notesMessage
            ? [{
                question: "Please share anything that will help prepare for our meeting.",
                answer: notesMessage
            }]
            : [];

        const payload = {
            userEmail,
            meetingTitle: meetingName.trim() || "New Meeting",
            duration: selectedDuration,
            callType: callTypeMap[connectionMethod],
            selectedDate: selectedDateStr,
            selectedTime: selectedTimeStr,
            hosts,
            contacts: contactsPayload,
            contactQuestions: contactQuestionsPayload,
        };

        // ... rest remains the same
        if (connectionMethod === 'phone') {
            if (callDirection === 'host_calls') {
                payload.whoCallsWho = "host_calls_invitee";
                payload.inviteePhoneNumber = phoneNumber;
            } else if (callDirection === 'invitee_calls') {
                payload.whoCallsWho = "invitee_calls_host";
                payload.hostPhoneNumber = hostPhoneNumber;
            }
        }

        console.log("Booking Payload →", JSON.stringify(payload, null, 2));

        try {
            const response = await fetch('http://192.168.0.245:4000/meetings/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Uncomment if auth is required
                    // Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                const errorMsg = typeof result.message === 'string'
                    ? result.message
                    : Array.isArray(result.message)
                        ? result.message.join(', ')
                        : 'Failed to book meeting';
                alert(`Error: ${errorMsg}`);
                console.error("API Error:", result);
                return;
            }

            alert('Meeting booked successfully!');
            console.log("Success:", result);
        } catch (err) {
            console.error("Network Error:", err);
            alert('Failed to connect to server. Is backend running?');
        }
    };

    const TimezoneModal = () => (
        <div className={`fixed inset-0 bg-white/50 z-30 flex items-center justify-center p-4 ${showTimezoneModal ? '' : 'hidden'}`} onClick={() => setShowTimezoneModal(false)}>
            <div className="bg-white rounded-lg w-full max-w-xl max-h-[90vh] overflow-hidden border" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Select Time Zone</h3>
                    <button onClick={() => setShowTimezoneModal(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                    <div className="relative mb-4">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search time zones..."
                            value={timezoneSearch}
                            onChange={(e) => setTimezoneSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            autoFocus
                        />
                    </div>
                    <div className="space-y-1 max-h-96 overflow-y-auto">
                        {TIMEZONES.filter(tz => tz.label.toLowerCase().includes(timezoneSearch.toLowerCase())).map(tz => (
                            <button
                                key={tz.value}
                                onClick={() => {
                                    setSelectedTimezone(tz);
                                    setShowTimezoneModal(false);
                                    setTimezoneSearch('');
                                }}
                                className={`w-full text-left px-4 py-3 rounded-md flex justify-between items-center transition ${tz.value === selectedTimezone.value ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-800'}`}
                            >
                                <div>
                                    <p className="font-medium text-sm">{tz.label}</p>
                                    <p className="text-xs text-gray-500">{tz.offset}</p>
                                </div>
                                {tz.value === selectedTimezone.value && <Check className="w-4 h-4 text-blue-600" />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const filteredContacts = contacts.filter(c =>
        c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
        c.email.toLowerCase().includes(contactSearch.toLowerCase())
    );

    return (
        <>
            <div className="min-h-screen bg-hite flex items-center justify-center p-4">
                <div className="w-full bg-white rounded-lg overflow-hidden flex flex-col lg:flex-row max-w-7xl ">
                    {/* Left Panel */}
                    <div className="border-r border-gray-200 flex flex-col w-full lg:w-96">
                        <div className="p-6 flex-1 overflow-y-auto">
                            <div className="mb-6">
                                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Meeting Details</h2>
                                <div className="flex items-center gap-2">
                                    {isEditingName ? (
                                        <input
                                            type="text"
                                            value={meetingName}
                                            onChange={(e) => setMeetingName(e.target.value)}
                                            onBlur={handleSaveName}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                                            className="text-2xl font-bold text-gray-900 border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                                            autoFocus
                                        />
                                    ) : (
                                        <>
                                            <h1 className="text-2xl font-bold text-gray-900">{meetingName}</h1>
                                            <button onClick={handleEditName} className="text-gray-500 hover:text-blue-600">
                                                <Edit className="w-5 h-5" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Duration */}
                            <div className="mb-4">
                                <div className="relative">
                                    <Clock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                                    <select
                                        value={selectedDuration}
                                        onChange={(e) => setSelectedDuration(parseInt(e.target.value))}
                                        className="w-full pl-10 pr-10 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    >
                                        {EVENT_DURATIONS.map(d => (
                                            <option key={d} value={d}>{d} min</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>

                            {/* Connection Method */}
                            <div className="mb-6">
                                <div className="relative">
                                    <select
                                        value={connectionMethod}
                                        onChange={handleConnectionChange}
                                        className="w-full pl-10 pr-10 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    >
                                        {CONNECTION_METHODS.map(m => (
                                            <option key={m.value} value={m.value}>{m.label}</option>
                                        ))}
                                    </select>
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                        {React.createElement(CONNECTION_METHODS.find(m => m.value === connectionMethod)?.icon || Phone, { className: "w-4 h-4 text-gray-500" })}
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>

                            {/* Call Direction */}
                            {connectionMethod === 'phone' && (
                                <div className="mb-6">
                                    <p className="text-sm font-medium text-gray-700 mb-3">Who's calling who?</p>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="radio" name="callDirection" checked={callDirection === 'host_calls'} onChange={() => handleCallDirectionChange('host_calls')} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                                            <span className="text-sm text-gray-700">The host will call the invitee</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input type="radio" name="callDirection" checked={callDirection === 'invitee_calls'} onChange={() => handleCallDirectionChange('invitee_calls')} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500" />
                                            <span className="text-sm text-gray-700">The invitee will call the host</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* Invitee Phone Number */}
                            {connectionMethod === 'phone' && callDirection === 'host_calls' && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Invitee's phone number</label>
                                    <PhoneInput
                                        international
                                        defaultCountry="US"
                                        value={phoneNumber}
                                        onChange={setPhoneNumber}
                                        className="phone-input-custom"
                                    />
                                    {phoneError && <p className="text-red-600 text-xs mt-1">{phoneError}</p>}
                                </div>
                            )}

                            {/* Hosts */}
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Hosts</h3>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">S</div>
                                        <div><p className="font-medium text-sm text-gray-900">Samunder (you)</p></div>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Globe className="w-3.5 h-3.5" />
                                        <span>EST</span>
                                    </div>
                                </div>
                            </div>

                            {/* Contacts Section */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold text-gray-700">Contacts</h3>
                                    <button onClick={() => setShowAddContactModal(true)} className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1">
                                        <Plus className="w-4 h-4" />
                                        Add contact
                                    </button>
                                </div>
                                <div className="relative">
                                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                    <input type="text" placeholder="Search" value={contactSearch} onChange={(e) => setContactSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                </div>
                                <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                                    {filteredContacts.map(contact => (
                                        <div key={contact.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md text-sm">
                                            <div className="font-medium">{contact.name}</div>
                                            <div className="text-gray-500">{contact.email}</div>
                                        </div>
                                    ))}
                                    {filteredContacts.length === 0 && <p className="text-center text-gray-500 text-sm">No contacts added</p>}
                                </div>
                            </div>

                            {/* Contact Questions */}
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact questions</h3>
                                <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-md">
                                    <p className="text-xs text-gray-500">
                                        {notesMessage ? '1 / 1' : '0 / 1'} questions answered
                                    </p>
                                    <button onClick={() => setShowAnswerQuestionsModal(true)} className="text-blue-600 text-sm font-medium mt-2 hover:text-blue-700">
                                        View
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200">
                            <button
                                onClick={handleBookMeeting}
                                disabled={!selectedTime || (connectionMethod === 'phone' && callDirection === 'host_calls' && (!phoneNumber || phoneError))}
                                className={`w-full py-3 rounded-md font-semibold text-base transition-all ${selectedTime && !(connectionMethod === 'phone' && callDirection === 'host_calls' && (!phoneNumber || phoneError))
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                Book meeting
                            </button>
                        </div>
                    </div>

                    {/* Right Panel - Calendar */}
                    <div className="flex-1 p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Select a time to book</h2>

                        <button onClick={() => setShowTimezoneModal(true)} className="w-full flex items-center justify-between mb-6 text-left">
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-700">Time zone display:</span>
                                <span className="text-sm text-blue-600 font-medium">{selectedTimezone.label}</span>
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>

                        <div className="grid lg:grid-cols-2 gap-8">
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 hover:bg-gray-100 rounded">
                                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                                    </button>
                                    <h3 className="text-base font-semibold text-gray-900">{format(currentMonth, 'MMMM yyyy')}</h3>
                                    <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 hover:bg-gray-100 rounded">
                                        <ChevronRight className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                    {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => (
                                        <div key={d} className="text-xs font-semibold text-gray-600 py-2">{d}</div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {Array.from({ length: (new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() + 6) % 7 }).map((_, i) => (
                                        <div key={`empty-${i}`} />
                                    ))}
                                    {calendarDays.map(day => (
                                        <button
                                            key={day.date.toISOString()}
                                            onClick={() => day.available && setSelectedDate(day.date)}
                                            disabled={!day.available}
                                            className={`aspect-square rounded-md font-medium transition-all text-sm flex items-center justify-center ${!day.isCurrentMonth ? 'text-gray-300' :
                                                !day.available ? 'text-gray-400 cursor-not-allowed' :
                                                    isSameDay(day.date, selectedDate) ? 'bg-blue-600 text-white font-bold' :
                                                        day.isToday ? 'text-blue-600 font-semibold' :
                                                            'text-gray-900 hover:bg-gray-100'
                                                }`}
                                        >
                                            {day.day}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="mb-4">
                                    <h3 className="text-base font-medium text-gray-700">
                                        {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Select a date'}
                                    </h3>
                                </div>
                                {selectedDate && calendarDays.find(d => isSameDay(d.date, selectedDate))?.available ? (
                                    <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                                        {AVAILABLE_SLOTS.map(time => (
                                            <button
                                                key={time}
                                                onClick={() => setSelectedTime(time)}
                                                className={`py-2.5 px-3 rounded-md font-medium border transition-all text-sm ${selectedTime === time
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white border-gray-300 text-blue-600 hover:border-blue-500 hover:bg-blue-50'
                                                    }`}
                                            >
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
                                        <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                                        <p className="text-gray-500 text-sm">Select a date to see available times</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* All Modals */}
            <TimezoneModal />
            <IntegrationConnectionModal isOpen={showIntegrationModal} onClose={() => setShowIntegrationModal(false)} method={connectionMethod} />
            <HostPhoneDetailsModal isOpen={showHostPhoneModal} onClose={() => setShowHostPhoneModal(false)} hostPhone={hostPhoneNumber} setHostPhone={setHostPhoneNumber} additionalDetails={callDetails} setAdditionalDetails={setCallDetails} />
            <AddContactModal isOpen={showAddContactModal} onClose={() => setShowAddContactModal(false)} onSave={(c) => setContacts([...contacts, { id: `contact${contacts.length + 1}`, ...c }])} />
            <AnswerQuestionsModal
                isOpen={showAnswerQuestionsModal}
                onClose={() => setShowAnswerQuestionsModal(false)}
                onSave={(message) => setNotesMessage(message)}
            />

            {/* <style jsx global>{`
                .phone-input-custom, .phone-input-host { width: 100%; }
                .phone-input-custom input, .phone-input-host input {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #d1d5db;
                    border-radius: 0.375rem;
                    font-size: 0.875rem;
                }
                .phone-input-custom input:focus, .phone-input-host input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
            `}</style> */}
            <style jsx={'true'} global={'true'}>{`
  .phone-input-custom, .phone-input-host { width: 100%; }
  .phone-input-custom input, .phone-input-host input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.875rem;
  }
  .phone-input-custom input:focus, .phone-input-host input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
`}</style>
        </>
    );
}