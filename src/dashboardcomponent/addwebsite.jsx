// AddToWebsiteModal.jsx - Simplified Classic Layout
import React, { useEffect, useState, useRef, useCallback } from "react";

// Simple classic icons
const ICON_INLINE = (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="2"/>
    <path d="M7 9h10"/>
    <path d="M7 13h10"/>
  </svg>
);

const ICON_POPUP = (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="3"/>
    <path d="M6 14h12v4H6z"/>
  </svg>
);

const ICON_TEXT = (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 6h16"/>
    <path d="M4 12h10"/>
    <path d="M4 18h7"/>
  </svg>
);

// Fixed color since theme color is removed
const FIXED_COLOR = "#2563EB";

// Static embed code templates (simplified for classic feel, using fixed color)
const EMBED_CODES = {
  inline: (eventUrl) => `<!-- Inline Embed Widget -->
<div class="scheduler-inline-widget" 
     data-event-url="${eventUrl}"
     style="position:relative;
            min-width:300px;
            height:600px;
            background:${FIXED_COLOR};
            border:1px solid #ddd;
            border-radius:8px;
            overflow:hidden;">
  <div style="padding:20px;text-align:center;color:#fff;">
    <div style="font-size:20px;font-weight:bold;margin-bottom:8px;">Schedule Meeting</div>
    <div style="font-size:14px;">Select available time slots</div>
  </div>
</div>

<script>
  console.log('Inline embed loaded:', '${eventUrl}');
</script>`,

  popupWidget: (eventUrl) => `<!-- Floating Popup Widget -->
<div class="scheduler-popup-widget" 
     data-event-url="${eventUrl}"
     style="position:fixed;
            bottom:20px;
            right:20px;
            z-index:1000;
            width:60px;
            height:60px;
            background:${FIXED_COLOR};
            border-radius:50%;
            cursor:pointer;">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="white" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
</div>

<script>
  document.querySelector('.scheduler-popup-widget').addEventListener('click', function() {
    console.log('Opening scheduler:', '${eventUrl}');
  });
</script>`,

  popupText: (eventUrl) => `<!-- Text Link Popup -->
<a href="#" 
   onclick="openScheduler('${eventUrl}'); return false;"
   class="scheduler-text-link"
   style="display:inline-block;
          padding:10px 20px;
          background:white;
          color:${FIXED_COLOR};
          font-weight:bold;
          text-decoration:none;
          border:1px solid ${FIXED_COLOR};
          border-radius:8px;
          cursor:pointer;">
  Schedule a Meeting
</a>

<script>
function openScheduler(url) {
  console.log('Opening scheduler from text link:', url);
}
</script>`
};

// Simplified Inline Embed Modal
function InlineEmbedModal({ eventUrl, onClose, onBack, code, onChangeType }) {
  const textareaRef = useRef(null);

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(code);
    if (textareaRef.current) {
      textareaRef.current.style.background = '#f3f4f6';
      setTimeout(() => {
        textareaRef.current.style.background = '#f9fafb';
      }, 200);
    }
  }, [code]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-xl font-semibold text-gray-900">Inline Embed</h3>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Type Switcher */}
        <div className="px-6 py-3 border-b border-gray-200 flex gap-4">
          <button 
            onClick={() => onChangeType('inline')} 
            className="px-4 py-2 font-medium rounded bg-blue-50 text-blue-600"
          >
            Inline Embed
          </button>
          <button 
            onClick={() => onChangeType('popup-widget')} 
            className="px-4 py-2 font-medium rounded hover:bg-gray-100"
          >
            Popup Widget
          </button>
          <button 
            onClick={() => onChangeType('popup-text')} 
            className="px-4 py-2 font-medium rounded hover:bg-gray-100"
          >
            Text Link
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Preview */}
          {/* <div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Preview</h4>
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50" style={{ backgroundColor: FIXED_COLOR, color: '#fff' }}>
              <div className="text-center">
                <h2 className="text-xl font-bold">Book Your Meeting</h2>
                <p className="text-sm">Select from available time slots</p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {['9:00 AM', '10:30 AM', '2:00 PM'].map(time => (
                    <div key={time} className="bg-white/20 rounded p-2 text-center">
                      {time}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div> */}

          {/* Code */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Embed Code</h4>
            <div className="relative">
              <textarea
                ref={textareaRef}
                readOnly
                value={code}
                className="w-full h-32 p-4 bg-gray-100 border border-gray-300 rounded-lg font-mono text-sm resize-none"
              />
              <button
                onClick={copyCode}
                className="absolute top-2 right-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-4">
          <button onClick={onBack} className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-100">
            Back
          </button>
          <button onClick={onClose} className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-100">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Simplified Popup Widget Modal
function PopupWidgetModal({ eventUrl, onClose, onBack, code, onChangeType }) {
  const textareaRef = useRef(null);

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(code);
    if (textareaRef.current) {
      textareaRef.current.style.background = '#f3f4f6';
      setTimeout(() => {
        textareaRef.current.style.background = '#f9fafb';
      }, 200);
    }
  }, [code]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-xl font-semibold text-gray-900">Popup Widget</h3>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Type Switcher */}
        <div className="px-6 py-3 border-b border-gray-200 flex gap-4">
          <button 
            onClick={() => onChangeType('inline')} 
            className="px-4 py-2 font-medium rounded hover:bg-gray-100"
          >
            Inline Embed
          </button>
          <button 
            onClick={() => onChangeType('popup-widget')} 
            className="px-4 py-2 font-medium rounded bg-blue-50 text-blue-600"
          >
            Popup Widget
          </button>
          <button 
            onClick={() => onChangeType('popup-text')} 
            className="px-4 py-2 font-medium rounded hover:bg-gray-100"
          >
            Text Link
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Preview */}
          {/* <div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Preview</h4>
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 relative h-64 flex items-end justify-end">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: FIXED_COLOR }}>
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div> */}

          {/* Code */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Embed Code</h4>
            <div className="relative">
              <textarea
                ref={textareaRef}
                readOnly
                value={code}
                className="w-full h-32 p-4 bg-gray-100 border border-gray-300 rounded-lg font-mono text-sm resize-none"
              />
              <button
                onClick={copyCode}
                className="absolute top-2 right-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-4">
          <button onClick={onBack} className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-100">
            Back
          </button>
          <button onClick={onClose} className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-100">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Simplified Popup Text Modal
function PopupTextModal({ eventUrl, onClose, onBack, code, onChangeType }) {
  const textareaRef = useRef(null);

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(code);
    if (textareaRef.current) {
      textareaRef.current.style.background = '#f3f4f6';
      setTimeout(() => {
        textareaRef.current.style.background = '#f9fafb';
      }, 200);
    }
  }, [code]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h3 className="text-xl font-semibold text-gray-900">Text Link</h3>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Type Switcher */}
        <div className="px-6 py-3 border-b border-gray-200 flex gap-4">
          <button 
            onClick={() => onChangeType('inline')} 
            className="px-4 py-2 font-medium rounded hover:bg-gray-100"
          >
            Inline Embed
          </button>
          <button 
            onClick={() => onChangeType('popup-widget')} 
            className="px-4 py-2 font-medium rounded hover:bg-gray-100"
          >
            Popup Widget
          </button>
          <button 
            onClick={() => onChangeType('popup-text')} 
            className="px-4 py-2 font-medium rounded bg-blue-50 text-blue-600"
          >
            Text Link
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Preview */}
          {/* <div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Preview</h4>
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 flex items-center justify-center">
              <button className="px-6 py-3 border rounded-lg" style={{ color: FIXED_COLOR, borderColor: FIXED_COLOR }}>
                Schedule Meeting
              </button>
            </div>
          </div> */}

          {/* Code */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Embed Code</h4>
            <div className="relative">
              <textarea
                ref={textareaRef}
                readOnly
                value={code}
                className="w-full h-32 p-4 bg-gray-100 border border-gray-300 rounded-lg font-mono text-sm resize-none"
              />
              <button
                onClick={copyCode}
                className="absolute top-2 right-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-4">
          <button onClick={onBack} className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-100">
            Back
          </button>
          <button onClick={onClose} className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-100">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Selection Modal - Simplified Classic Layout inspired by Calendly
export default function AddToWebsiteModal({ open, onClose, eventUrl = "https://example.com/your-event", eventName = "New Meeting" }) {
  const [step, setStep] = useState('selection');
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setStep('selection');
      setSelectedOption(null);
    }
  }, [open]);

  if (!open) return null;

  const options = [
    {
      id: "inline",
      title: "Inline Embed",
      subtitle: "Embed in your page",
      description: "Displays the full scheduler directly on your site.",
      icon: ICON_INLINE
    },
    {
      id: "popup-widget",
      title: "Popup Widget", 
      subtitle: "Floating button",
      description: "A button that opens the scheduler in a popup.",
      icon: ICON_POPUP
    },
    {
      id: "popup-text",
      title: "Text Link",
      subtitle: "Simple link",
      description: "A text link that opens the scheduler.",
      icon: ICON_TEXT
    }
  ];

  const currentCode = EMBED_CODES[selectedOption || 'inline']?.(eventUrl);

  const handleChangeType = (newType) => {
    setSelectedOption(newType);
    setStep(newType);
  };

  if (step === 'selection') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Add to Website - {eventName}</h1>
            <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Options */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {options.map((option) => (
              <div
                key={option.id}
                className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 ${selectedOption === option.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                onClick={() => {
                  setSelectedOption(option.id);
                  setStep(option.id);
                }}
              >
                <div className="flex items-center gap-4 mb-2">
                  {option.icon}
                  <h3 className="text-lg font-medium text-gray-900">{option.title}</h3>
                </div>
                <p className="text-sm text-gray-600">{option.description}</p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-100">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render specific modals with onChangeType
  if (step === 'inline') {
    return <InlineEmbedModal eventUrl={eventUrl} onClose={onClose} onBack={() => setStep('selection')} code={currentCode} onChangeType={handleChangeType} />;
  }
  if (step === 'popup-widget') {
    return <PopupWidgetModal eventUrl={eventUrl} onClose={onClose} onBack={() => setStep('selection')} code={currentCode} onChangeType={handleChangeType} />;
  }
  if (step === 'popup-text') {
    return <PopupTextModal eventUrl={eventUrl} onClose={onClose} onBack={() => setStep('selection')} code={currentCode} onChangeType={handleChangeType} />;
  }

  return null;
}