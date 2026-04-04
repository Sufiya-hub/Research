import React, { useState, useEffect } from 'react';
import { FaXmark, FaShare, FaUserPlus, FaUser } from 'react-icons/fa6';
import { toast } from 'react-toastify';

export default function ShareModal({ file, onClose, onShare }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const res = await fetch('/api/cloud/friends');
        if (res.ok) {
          const data = await res.json();
          // Keep only items that look like friend objects to prevent breakage
          setFriends(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error('Failed to fetch friends list', e);
      }
    };
    fetchFriends();
  }, []);

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);

    if (val.trim()) {
      const filtered = friends.filter(
        (f) =>
          f?.email?.toLowerCase().includes(val.toLowerCase()) ||
          (f?.fullName && f.fullName.toLowerCase().includes(val.toLowerCase())),
      );
      setFilteredFriends(filtered);
      setShowDropdown(true);
    } else {
      setFilteredFriends(friends);
      setShowDropdown(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await onShare(file.id, email);
      setEmail('');
      onClose();
    } catch (error) {
      // Error is handled in parent or toast
    } finally {
      setLoading(false);
    }
  };

  if (!file) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all scale-100">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FaShare className="text-blue-500" />
            Share &quot;{file?.name}&quot;
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200"
          >
            <FaXmark />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Recipient Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUserPlus className="text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="friend@example.com"
                  value={email}
                  onChange={handleEmailChange}
                  onFocus={() => {
                    if (email.trim()) {
                      handleEmailChange({ target: { value: email } });
                    } else if (friends.length > 0) {
                      setFilteredFriends(friends);
                      setShowDropdown(true);
                    }
                  }}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  autoComplete="off"
                  required
                />

                {/* Autocomplete Dropdown */}
                {showDropdown && filteredFriends.length > 0 && (
                  <div className="absolute top-full left-0 z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
                    {filteredFriends.map((f, i) => (
                      <div
                        key={i}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b border-gray-50 last:border-0 transition-colors"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setEmail(f.email);
                          setShowDropdown(false);
                        }}
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <FaUser className="text-blue-500 text-xs" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {f.fullName || 'Platform User'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {f.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <p className="mt-2 text-xs text-gray-500">
                The user must have an account on this platform.
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Sharing...' : 'Share File'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
