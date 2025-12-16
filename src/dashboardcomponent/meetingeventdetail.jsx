// components/EventDetails.jsx
import React, { useState, useMemo } from "react";
import { toast, Toaster } from "react-hot-toast";
import { X } from "lucide-react";
import eventBus from "../lib/eventBus";

// === ALL SVG ICONS ===
const RescheduleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.3333 8C13.3333 11.3137 10.3137 14.3333 7 14.3333C3.68629 14.3333 0.666667 11.3137 0.666667 8C0.666667 4.68629 3.68629 1.66667 7 1.66667C10.3137 1.66667 13.3333 4.68629 13.3333 8ZM13.3333 8L10 11.3333M13.3333 8L10 4.66667" stroke="#4A4A4A" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CancelIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4L4 12M4 4L12 12" stroke="#4A4A4A" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const EditEventTypeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.33333 8H14.6667M8 1.33333V14.6667" stroke="#4A4A4A" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ScheduleAgainIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.3333 8C13.3333 11.3137 10.3137 14.3333 7 14.3333C3.68629 14.3333 0.666667 11.3137 0.666667 8C0.666667 4.68629 3.68629 1.66667 7 1.66667C10.3137 1.66667 13.3333 4.68629 13.3333 8ZM13.3333 8L10 11.3333M13.3333 8L10 4.66667" stroke="#4A4A4A" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AddNotesIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 1.33333V14.6667M1.33333 8H14.6667" stroke="#3182CE" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// === MOCK DATA ===
const MOCK_EVENT_DATA = {
  invitee: {
    avatarInitial: "T",
    name: "test",
    email: "test@example.com",
  },
  location: "+91 88149 30229",
  timezone: "India Standard Time",
  questions: [
    {
      label: "Please share anything that will help prepare for our meeting.",
      answer: "test",
    },
  ],
  host: { avatarInitial: "S" },
  created: "1 December 2025",
  date: "2025-12-01",
};

// === Reusable Components ===
const PrimaryActionButton = ({ Icon, label, onClick }) => (
  <button
    className="flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors w-full"
    onClick={onClick}
  >
    <Icon />
    {label}
  </button>
);

const SecondaryActionLink = ({ Icon, label, onClick }) => (
  <button
    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors w-full justify-start"
    onClick={onClick}
  >
    <Icon />
    {label}
  </button>
);

const DataSection = ({ label, children }) => (
  <div className="py-4 border-b border-gray-100 last:border-b-0">
    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</h4>
    <div className="text-base text-gray-900">{children}</div>
  </div>
);

export default function EventDetails({
  event = MOCK_EVENT_DATA,
  onBookMeeting
}) {

  const [isDeleted, setIsDeleted] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [email, setEmail] = useState(event.invitee.email);
  const [isAddingNotes, setIsAddingNotes] = useState(false);
  const [notes, setNotes] = useState('');

  const isPast = useMemo(() => {
    if (!event.date) return false;
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate < today;
  }, [event.date]);

  const handleEditEmail = () => {
    if (isEditingEmail) toast.success("Email updated!");
    setIsEditingEmail(!isEditingEmail);
  };

  // Instant Delete
  const handleDelete = () => {
    toast.success("Event permanently deleted!", { duration: 4000 });
    setIsDeleted(true);
  };

  // RESCHEDULE → New Tab + reschedule mode
  const openReschedule = () => {
    const params = new URLSearchParams({
      reschedule: "true",
      name: event.invitee.name,
      email: event.invitee.email,
    });
    window.open(`/book/1?${params.toString()}`, "_blank", "noopener,noreferrer");
  };

  // SCHEDULE AGAIN → New Tab + normal booking
  const openScheduleAgain = () => {
    const params = new URLSearchParams({
      name: event.invitee.name,
      email: event.invitee.email,
    });
    window.open(`/book/1?${params.toString()}`, "_blank", "noopener,noreferrer");
  };

  // === DELETED SCREEN ===
  if (isDeleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border-t-8 border-red-600 max-w-2xl w-full">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Event Deleted</h1>
          <p className="text-xl text-gray-600">This event has been permanently removed.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* MAIN EVENT DETAILS PAGE */}
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex-1 max-w-4xl w-full mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] divide-y lg:divide-y-0 lg:divide-x divide-gray-200 bg-white">

            {/* LEFT PANEL - ACTIONS */}
            <div className="p-6 space-y-6">
              {!isPast && (
                <div className="space-y-3">
                  <PrimaryActionButton Icon={RescheduleIcon} label="Reschedule" onClick={openReschedule} />
                  <PrimaryActionButton Icon={CancelIcon} label="Delete Event" onClick={handleDelete} />
                </div>
              )}

              {!isPast && <hr className="border-gray-200" />}

              {!isPast && (
                <div className="space-y-4">
                  <SecondaryActionLink
                    Icon={EditEventTypeIcon}
                    label="Edit Event Type"
                    onClick={() => {
                      // 1. Switch to Scheduling tab
                      eventBus.emit("switchToSchedulingTab");

                      // 2. Open edit modal with data (small delay so tab switches first)
                      setTimeout(() => {
                        eventBus.emit("openEditEventModal", {
                          id: 1,
                          title: "30 Minute Meeting",
                          duration: "30",
                          location: "Google Meet",
                          locationType: "google-meet",
                          eventType: "one-on-one",
                          maxBookings: 5,
                          questions: { phone: true, purpose: true },
                          status: "active",
                        });
                      }, 100);
                    }}
                  />
                  <SecondaryActionLink Icon={ScheduleAgainIcon} label="Schedule Invitee Again" onClick={openScheduleAgain} />
                </div>
              )}
            </div>

            {/* RIGHT PANEL - EVENT INFO */}
            <div className="p-6 space-y-0">
              <DataSection label="INVITEE">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600">
                    {event.invitee.avatarInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-gray-900 truncate">{event.invitee.name}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1 text-sm">
                      {isEditingEmail ? (
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="px-2 py-1 border-b border-blue-500 focus:outline-none text-sm w-full sm:w-auto"
                          autoFocus
                        />
                      ) : (
                        <p className="text-sm text-gray-900 truncate">{email}</p>
                      )}
                      {!isPast && (
                        <div className="flex items-center gap-3 text-blue-600">
                          <button onClick={handleEditEmail} className="hover:underline text-sm">
                            {isEditingEmail ? "Save" : "Edit email"}
                          </button>
                          <span className="hidden sm:inline text-gray-300">|</span>
                          <button className="hover:underline text-sm">View contact</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </DataSection>

              <DataSection label="LOCATION">
                <p className="truncate">{event.location}</p>
              </DataSection>

              <DataSection label="INVITEE TIME ZONE">
                <p>{event.timezone}</p>
              </DataSection>

              <DataSection label="QUESTIONS">
                <p className="text-sm text-gray-600 leading-relaxed">{event.questions[0].label}</p>
                <p className="font-medium mt-1">{event.questions[0].answer}</p>
              </DataSection>

              <DataSection label="MEETING HOST">
                <p className="text-sm text-gray-600 mb-3">Host will attend this meeting</p>
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-base font-bold text-gray-600">
                  {event.host.avatarInitial}
                </div>
              </DataSection>

              <div className="py-4">
                <button
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  onClick={() => setIsAddingNotes(true)}
                >
                  <AddNotesIcon />
                  Add meeting notes
                </button>
                <p className="text-xs text-gray-500 ml-6 mt-1">(only the host will see these)</p>
                {isAddingNotes && (
                  <div className="mt-4">
                    <textarea
                      className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none text-sm text-gray-900"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Type your meeting notes here... These are private and only visible to you."
                    />
                    <div className="mt-3 flex justify-end gap-3">
                      <button
                        onClick={() => {
                          setIsAddingNotes(false);
                          setNotes('');
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setIsAddingNotes(false);
                          toast.success("Meeting notes saved successfully!");
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
                      >
                        Save Notes
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="py-4 text-sm text-gray-500 border-t border-gray-100">
                Created {event.created}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-4xl w-full mx-auto border-t border-blue-100 bg-blue-50 text-center py-3 text-sm text-blue-600">
          You've reached the end of the list.
        </div>
      </div>

      <Toaster position="top-center" />
    </>
  );
  <PrimaryActionButton
  Icon={ScheduleAgainIcon}
  label="Book This Meeting"
  onClick={() => onBookMeeting(event)}
/>

}