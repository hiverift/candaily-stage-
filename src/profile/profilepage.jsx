import React, { useState, useEffect, useRef } from 'react';
import { Camera, Info, Trash2, ChevronDown } from 'lucide-react';

// Reusable DeleteAccountModal Component (exact UI you provided)
function DeleteAccountModal({ isOpen, onClose, onDelete }) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const [reasonOpen, setReasonOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [message, setMessage] = useState("");

  const reasonOptions = [
    "I no longer need Hiverift",
    "I’m switching to another service",
    "Privacy concerns",
    "Creating a new account",
    "Other",
  ];

  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalOtp = otp.join("");
    if (finalOtp.length < 6) {
      alert("Enter a valid 6-digit verification code.");
      return;
    }
    if (!selectedReason) {
      alert("Please select a reason for deleting your account.");
      return;
    }
    onDelete({ verification_code: finalOtp, reason: selectedReason, message });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/40 flex justify-center items-center z-50">
      <div className="bg-gray-50 rounded-xl shadow-lg p-6 w-full max-w-min animate-fadeIn">
        <h1 className="text-2xl font-semibold mb-4">Delete Account</h1>
        <form onSubmit={handleSubmit}>
          <p className="text-gray-700 mb-2">
            Proceed with deleting your account by entering the verification
            code sent to <b>sam@gmail.com</b>
          </p>

          <div className="flex gap-2 justify-between mb-6">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                maxLength={1}
                value={digit}
                ref={(el) => (inputRefs.current[idx] = el)}
                onChange={(e) => handleOtpChange(e.target.value, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className="w-12 h-12 border border-gray-400 rounded-lg text-center text-xl focus:outline-blue-500"
              />
            ))}
          </div>

          <div className="text-sm text-gray-600 mb-2">
            You are about to delete your Hiverift account. This will go into
            effect immediately, and you will no longer have access to your
            account data.
          </div>
          <div className="text-sm text-gray-600 mb-4">
            We will also delete any information that Hiverift has stored with
            third-party vendors.{" "}
           
          </div>

          <label className="font-medium">Reason for deleting your account *</label>
          <div className="relative mb-6">
            <div
              className="border rounded-lg p-3 flex justify-between items-center cursor-pointer"
              onClick={() => setReasonOpen(!reasonOpen)}
            >
              <span className="text-gray-700">
                {selectedReason || "Select reason"}
              </span>
              <ChevronDown className="w-4" />
            </div>
            {reasonOpen && (
              <div className="absolute top-full left-0 right-0 bg-white border rounded-lg mt-1 shadow-lg z-10">
                {reasonOptions.map((r, i) => (
                  <div
                    key={i}
                    className="p-3 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedReason(r);
                      setReasonOpen(false);
                    }}
                  >
                    {r}
                  </div>
                ))}
              </div>
            )}
          </div>

          <label className="font-medium">Anything else you'd like to share</label>
          <textarea
            className="w-full border rounded-lg p-3 mt-1 h-28"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>

          <div className="flex justify-end mt-6 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100"
            >
              Nevermind
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Yes, delete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const ProfilePage = () => {
  const [formData, setFormData] = useState({
    name: '',
    welcomeMessage: '',
    language: 'English',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h (am/pm)',
    country: 'India',
    timeZone: 'Eastern Time - US & Canada',
    profileImage: null
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const result = await window.storage.get('scheduling-settings');
      if (result) {
        const savedData = JSON.parse(result.value);
        setFormData(savedData);
        if (savedData.profileImage) {
          setImagePreview(savedData.profileImage);
        }
      }
    } catch (error) {
      console.log('No saved settings found');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({
          ...prev,
          profileImage: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      await window.storage.set('scheduling-settings', JSON.stringify(formData));
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    }
  };

  const handleCancel = () => {
    loadSettings();
  };

  const handleDeleteConfirm = async (data) => {
    // Simulate OTP success for demo (in real app, validate OTP on backend)
    console.log("Delete request with:", data);

    try {
      await window.storage.delete('scheduling-settings');
      setFormData({
        name: '',
        welcomeMessage: '',
        language: 'English',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '12h (am/pm)',
        country: 'India',
        timeZone: 'Eastern Time - US & Canada',
        profileImage: null
      });
      setImagePreview(null);
      setShowDeleteModal(false);
      alert('Account deleted successfully!');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account. Please try again.');
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: formData.timeFormat === '12h (am/pm)'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="text-neutral-600">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 bg-white border-b border-gray-200 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-5">
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          </div>
        </div>
        
        <div className="max-w-2xl mx-auto bg-gray-50 p-8 ml-20">
          {/* Profile Image Section */}
          <div className="flex items-start gap-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-neutral-200 flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-16 h-16 text-neutral-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                )}
              </div>
            </div>
            <div>
              <label className="inline-block">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.gif,.png"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <span className="px-4 py-2 border border-neutral-300 rounded-lg text-sm cursor-pointer hover:bg-neutral-50 inline-block">
                  Upload picture
                </span>
              </label>
              <p className="text-sm text-neutral-500 mt-2">JPG, GIF or PNG. Max size of 5MB.</p>
            </div>
          </div>

          {/* Name Field */}
          <div className="mb-6">
            <label className="flex items-center gap-1 text-sm font-medium text-neutral-700 mb-2">
              Name
              <Info className="w-4 h-4 text-neutral-400" />
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Welcome Message Field */}
          <div className="mb-6">
            <label className="flex items-center gap-1 text-sm font-medium text-neutral-700 mb-2">
              Welcome Message
              <Info className="w-4 h-4 text-neutral-400" />
            </label>
            <textarea
              name="welcomeMessage"
              value={formData.welcomeMessage}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Language Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Language
            </label>
            <select
              name="language"
              value={formData.language}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
              <option>Hindi</option>
            </select>
          </div>

          {/* Date and Time Format */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-neutral-700 mb-2">
                Date Format
                <Info className="w-4 h-4 text-neutral-400" />
              </label>
              <select
                name="dateFormat"
                value={formData.dateFormat}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                <option>DD/MM/YYYY</option>
                <option>MM/DD/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-neutral-700 mb-2">
                Time Format
                <Info className="w-4 h-4 text-neutral-400" />
              </label>
              <select
                name="timeFormat"
                value={formData.timeFormat}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                <option>12h (am/pm)</option>
                <option>24h</option>
              </select>
            </div>
          </div>

          {/* Country Field */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Country
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option>India</option>
              <option>United States</option>
              <option>United Kingdom</option>
              <option>Canada</option>
              <option>Australia</option>
            </select>
          </div>

          {/* Time Zone Field */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-neutral-700">
                Time Zone
              </label>
              <span className="text-sm text-neutral-500">Current Time: {getCurrentTime()}</span>
            </div>
            <select
              name="timeZone"
              value={formData.timeZone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option>Eastern Time - US & Canada</option>
              <option>Central Time - US & Canada</option>
              <option>Mountain Time - US & Canada</option>
              <option>Pacific Time - US & Canada</option>
              <option>India Standard Time</option>
              <option>Greenwich Mean Time</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-4xl hover:bg-blue-700 transition-colors font-medium"
              >
                Save Changes

              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-2 border border-neutral-300 text-neutral-700 rounded-4xl hover:bg-neutral-50 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-6 py-2 bg-red-600 text-white rounded-4xl hover:bg-red-700 transition-colors font-medium"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* New Professional Delete Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDeleteConfirm}
      />
    </>
  );
};

export default ProfilePage;