// OfferTimeSlotsModal.jsx
import React, { useState, useCallback, useMemo, useEffect } from "react";

const availabilityOptions = [
  { label: "Next 3 available days", value: "NEXT_3_DAYS" },
  { label: "Next 5 available days", value: "NEXT_5_DAYS" },
  { label: "This week", value: "THIS_WEEK" },
  { label: "Next week", value: "NEXT_WEEK" },
  { label: "Specific dates", value: "SPECIFIC_DATES" },
];

const formatTime = (hour, minute) => {
  const h = hour % 12 || 12;
  const m = minute.toString().padStart(2, "0");
  const period = hour < 12 ? "am" : "pm";
  return `${h}:${m} ${period}`;
};

const generateSlots = (date) => {
  const slots = [];
  for (let h = 9; h <= 17; h++) {
    for (let m of [0, 30]) {
      if (h === 17 && m > 0) continue; // stop at 5:00 pm
      const timeStr = formatTime(h, m);
      const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate()
      ).padStart(2, "0")}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00-05:00`;
      slots.push({ time: timeStr, value: iso, selected: true });
    }
  }
  return slots;
};

const createDayObject = (date) => ({
  date: date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
  isoDate: date.toISOString().split("T")[0],
  slots: generateSlots(date),
});

const OfferTimeSlotsModal = ({ isOpen, onClose }) => {
  const [selectedOption, setSelectedOption] = useState(availabilityOptions[0]);
  const [days, setDays] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [selectedTimes, setSelectedTimes] = useState([]); // checkbox state
  const [copyStatus, setCopyStatus] = useState("Copy to clipboard");
  const [specificDate, setSpecificDate] = useState("");

  /* ---------- Generate days based on selected option ---------- */
  const generateDays = useCallback((option) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    start.setDate(today.getDate() + 1);

    let generated = [];

    switch (option.value) {
      case "NEXT_3_DAYS": {
        let count = 0;
        for (let i = 0; count < 3 && i < 60; i++) {
          const d = new Date(start);
          d.setDate(start.getDate() + i);
          if (d.getDay() !== 0 && d.getDay() !== 6) {
            generated.push(createDayObject(d));
            count++;
          }
        }
        break;
      }
      case "NEXT_5_DAYS": {
        let count = 0;
        for (let i = 0; count < 5 && i < 60; i++) {
          const d = new Date(start);
          d.setDate(start.getDate() + i);
          if (d.getDay() !== 0 && d.getDay() !== 6) {
            generated.push(createDayObject(d));
            count++;
          }
        }
        break;
      }
      case "THIS_WEEK": {
        const daysUntilEnd = 7 - today.getDay();
        for (let i = 1; i < daysUntilEnd; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() + i);
          generated.push(createDayObject(d));
        }
        break;
      }
      case "NEXT_WEEK": {
        const nextMon = new Date(start);
        const offset = (8 - start.getDay() || 7); // next Monday
        nextMon.setDate(start.getDate() + offset);
        for (let i = 0; i < 7; i++) {
          const d = new Date(nextMon);
          d.setDate(nextMon.getDate() + i);
          generated.push(createDayObject(d));
        }
        break;
      }
      default:
        generated = [];
    }

    setDays(generated);
  }, []);

  useEffect(() => {
    if (selectedOption.value !== "SPECIFIC_DATES") {
      generateDays(selectedOption);
    } else {
      setDays([]);
    }
  }, [selectedOption, generateDays]);

  /* ---------- Sync selected times when opening editor ---------- */
  useEffect(() => {
    if (editingDay) {
      setSelectedTimes(editingDay.slots.filter((s) => s.selected).map((s) => s.value));
    }
  }, [editingDay]);

  /* ---------- Specific date handling ---------- */
  const addSpecificDate = () => {
    if (!specificDate) return;
    const newDate = new Date(specificDate);
    if (isNaN(newDate.getTime()) || newDate <= new Date()) return;

    const iso = newDate.toISOString().split("T")[0];
    if (days.some((d) => d.isoDate === iso)) {
      setSpecificDate("");
      return;
    }

    setDays((prev) =>
      [...prev, createDayObject(newDate)].sort((a, b) => a.isoDate.localeCompare(b.isoDate))
    );
    setSpecificDate("");
  };

  const removeDay = (dateStr) => {
    setDays((prev) => prev.filter((d) => d.date !== dateStr));
  };

  const saveEditedDay = () => {
    setDays((prev) =>
      days.map((day) =>
        day.isoDate === editingDay.isoDate
          ? {
              ...day,
              slots: day.slots.map((slot) => ({
                ...slot,
                selected: selectedTimes.includes(slot.value),
              })),
            }
          : day
      )
    );
    setEditingDay(null);
  };

  const handleTimeToggle = (value) => {
    setSelectedTimes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleSelectAll = () => {
    if (editingDay) {
      setSelectedTimes(editingDay.slots.map((s) => s.value));
    }
  };

  const handleClearAll = () => {
    setSelectedTimes([]);
  };

  /* ---------- Preview data ---------- */
  const displayedDays = useMemo(() => {
    return days
      .map((day) => ({
        ...day,
        slots: day.slots.filter((s) => s.selected),
      }))
      .filter((day) => day.slots.length > 0);
  }, [days]);

  const generateEmailText = useCallback(() => {
    let text = "Here are some times I'm available (Eastern Time - US & Canada):\n\n";
    displayedDays.forEach((day) => {
      text += `${day.date}:\n`;
      day.slots.forEach((slot) => {
        text += `• ${slot.time}\n`;
      });
      text += "\n";
    });
    text += "Let me know what works best!\n\nOr book directly: [Your Calendly Link]";
    return text;
  }, [displayedDays]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateEmailText());
      setCopyStatus("Copied!");
      setTimeout(() => setCopyStatus("Copy to clipboard"), 2000);
    } catch {
      setCopyStatus("Failed to copy");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Main Modal – fully responsive */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-5 md:p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                Offer time slots in email
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-3 h-3 rounded-full bg-purple-600" />
                <span className="text-sm text-gray-600">New Meeting (clone)</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body – scrollable */}
          <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
            <p className="text-sm md:text-base text-gray-600">
              Select dates and times you’re available, then copy to paste into an email.
            </p>

            {/* Availability dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Offer availability
              </label>
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-xl hover:border-gray-400 transition text-left"
                >
                  <span className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-2 0v1H6zM6 7h8v8H6V7z" />
                    </svg>
                    {selectedOption.label}
                  </span>
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-64 overflow-y-auto">
                    {availabilityOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSelectedOption(opt);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-indigo-50 flex items-center justify-between ${
                          selectedOption.value === opt.value ? "bg-indigo-50 text-indigo-700 font-medium" : ""
                        }`}
                      >
                        {opt.label}
                        {selectedOption.value === opt.value && (
                          <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Specific dates input */}
            {selectedOption.value === "SPECIFIC_DATES" && (
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="date"
                  value={specificDate}
                  onChange={(e) => setSpecificDate(e.target.value)}
                  min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={addSpecificDate}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium"
                >
                  Add date
                </button>
              </div>
            )}

            {/* Preview */}
            <div className="bg-gray-50 rounded-2xl p-5 md:p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-semibold text-gray-900">Preview</h3>
                <span className="text-xs text-gray-500">Eastern Time</span>
              </div>

              <div className="space-y-6">
                {displayedDays.length === 0 ? (
                  <p className="text-center text-gray-500 py-12">No time slots selected yet</p>
                ) : (
                  displayedDays.map((day) => (
                    <div key={day.isoDate} className="group">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{day.date}</h4>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => setEditingDay(day)}
                            className="p-2 rounded-lg hover:bg-white hover:shadow"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H15v-3.586l6.586-6.586a2 2 0 012.828 2.828l-6.586 6.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => removeDay(day.date)}
                            className="p-2 rounded-lg hover:bg-white hover:shadow"
                          >
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {day.slots.map((slot) => (
                          <span
                            key={slot.value}
                            className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 border border-gray-300 shadow-sm"
                          >
                            {slot.time}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 md:p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={copyToClipboard}
              disabled={displayedDays.length === 0}
              className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg transition flex items-center justify-center gap-3 text-base"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2H6zM5 5h10v11H5V5z" />
              </svg>
              {copyStatus}
            </button>
          </div>
        </div>
      </div>

      {/* Edit modal – checkbox list with checkboxes */}
      {editingDay && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setEditingDay(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-5 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Edit available times</h3>
                <p className="text-sm text-gray-600 mt-1">{editingDay.date}</p>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4">
                <div className="flex justify-between items-center mb-5">
                  <button
                    onClick={handleSelectAll}
                    className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                  >
                    Select all
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="text-gray-600 hover:text-gray-800 font-medium text-sm"
                  >
                    Clear all
                  </button>
                </div>

                <div className="space-y-2">
                  {editingDay.slots.map((slot) => (
                    <label
                      key={slot.value}
                      className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTimes.includes(slot.value)}
                        onChange={() => handleTimeToggle(slot.value)}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="ml-4 text-sm font-medium text-gray-900">{slot.time}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 p-5 border-t border-gray-200">
                <button
                  onClick={() => setEditingDay(null)}
                  className="flex-1 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEditedDay}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default OfferTimeSlotsModal;