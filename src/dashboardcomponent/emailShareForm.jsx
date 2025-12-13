import React, { useState, useEffect, useRef } from 'react';

const EmailShareForm = ({ selectedEvent = null, onClose }) => {
  const [isEmailConnected, setIsEmailConnected] = useState(false); 
  const [selectedEmail] = useState('samunder@company.com');

  const [recipients, setRecipients] = useState([]);
  const [subject, setSubject] = useState('Schedule Example');
  const [editorContent, setEditorContent] = useState(`Hello,

I look forward to connecting. Feel free to share some times you're available, or choose a time that works best for you on my booking page.

Thanks,
Samunder`);
  const [isReminderActive, setIsReminderActive] = useState(true);
  const [reminderDays, setReminderDays] = useState('3');

  const editorRef = useRef(null);
  

  // Auto-fill when selectedEvent changes (optional enhancement)
  useEffect(() => {
    if (selectedEvent) {
      const eventInvitees = selectedEvent.invitees || [];
      const formattedRecipients = eventInvitees.map(email => ({
        name: '',
        email: email.trim()
      }));
      setRecipients(formattedRecipients);

      setSubject(`Schedule ${selectedEvent.name || 'Example'}`);
    }
  }, [selectedEvent]);

  const addRecipient = (email) => {
    if (!email || recipients.some(r => r.email === email)) return;
    setRecipients([...recipients, { name: '', email }]);
  };

  const removeRecipient = (index) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Sending email to: ${recipients.map(r => r.email).join(', ')}\nSubject: ${subject}`);
  };

  return (
    <div className="fixed inset-0 bg-white/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
            <h2 className="text-xl font-semibold text-gray-900">Sharing: Example</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {/* From */}
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">From:</label>
              <button
                type="button"
                onClick={() => setIsEmailConnected(true)}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                {isEmailConnected ? selectedEmail : 'Connect your email'}
              </button>
            </div>
          </div>

          {/* To */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To: <span className="text-gray-500">add contact or email address</span>
            </label>
            <div className="flex items-center gap-2 flex-wrap p-4 border border-gray-300 rounded-xl `min-h-14`">
              {recipients.map((r, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
                >
                  {r.email}
                  <button
                    type="button"
                    onClick={() => removeRecipient(i)}
                    className="ml-1 hover:text-indigo-900"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
              <input
                type="email"
                placeholder={recipients.length === 0 ? "Type email and press Enter" : ""}
                className="flex-1 min-w-[220px] outline-none text-sm text-gray-700"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    const val = e.target.value.trim();
                    if (val) {
                      addRecipient(val);
                      e.target.value = '';
                    }
                  }
                }}
              />
              <div className="flex gap-2 text-xs text-gray-500">
                <button type="button" className="hover:text-gray-700">Cc</button>
                <button type="button" className="hover:text-gray-700">Bcc</button>
              </div>
            </div>
          </div>

          {/* Subject */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject:</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-base"
              placeholder="Schedule Example"
            />
          </div>

          {/* Toolbar */}
          <div className="mb-2 flex items-center gap-1 bg-gray-50 px-3 py-2 rounded-t-xl border border-b-0 border-gray-300">
            {[
              { cmd: 'bold', icon: 'B', title: 'Bold' },
              { cmd: 'italic', icon: 'I', title: 'Italic' },
              { cmd: 'underline', icon: 'U', title: 'Underline' },
            ].map(({ cmd, icon, title }) => (
              <button
                key={cmd}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => document.execCommand(cmd, false)}
                className="p-2 hover:bg-gray-200 rounded transition text-sm font-medium"
                title={title}
              >
                {icon === 'B' && <strong>B</strong>}
                {icon === 'I' && <em>I</em>}
                {icon === 'U' && <u>U</u>}
              </button>
            ))}
            <div className="w-px h-6 bg-gray-300 mx-1"></div>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => document.execCommand('insertUnorderedList')}
              className="p-2 hover:bg-gray-200 rounded transition text-sm"
              title="Bullet List"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                const url = prompt('Enter URL:');
                if (url) document.execCommand('createLink', false, url);
              }}
              className="p-2 hover:bg-gray-200 rounded transition text-sm"
              title="Insert Link"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </button>
          </div>

          {/* Email Body Editor */}
          <div
            ref={editorRef}
            contentEditable
            className="w-full px-4 py-4 min-h-[280px] border border-gray-300 rounded-b-xl focus:outline-none prose prose-sm max-w-none text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: editorContent }}
            onInput={(e) => setEditorContent(e.currentTarget.innerHTML)}
          />

          {/* Reminder */}
          <div className="mt-8 mb-8 flex items-center gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isReminderActive}
                onChange={(e) => setIsReminderActive(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
              />
              <span className="text-sm text-gray-700">
                Send reminder to schedule if recipients haven’t scheduled in
              </span>
            </label>
            {isReminderActive && (
              <select
                value={reminderDays}
                onChange={(e) => setReminderDays(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                <option value="1">1 day</option>
                <option value="3">3 days</option>
                <option value="7">7 days</option>
                <option value="14">14 days</option>
              </select>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={recipients.length === 0 && !isEmailConnected}
              
              className={`px-8 py-2.5 rounded-lg font-medium text-white transition flex items-center gap-2 ${
                recipients.length === 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-md'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailShareForm;