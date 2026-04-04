import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FaCopy, FaTimes } from 'react-icons/fa';

export default function TempLinkModal({ file, onClose }) {
  const [expiresIn, setExpiresIn] = useState(3600);
  const [link, setLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateLink = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(
        `/api/cloud/files/${file.id}/view?expiresIn=${expiresIn}`,
      );
      if (res.ok) {
        const data = await res.json();
        setLink(data.url);
        toast.success('Temporary link generated!');
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || 'Failed to generate link');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate link');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (link) {
      navigator.clipboard.writeText(link);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 shadow-xl">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <FaTimes className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold mb-4 text-gray-900">
          Generate Temporary Link
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Create an expiring S3 link for{' '}
          <span className="font-semibold">{file.name}</span> that can be shared
          externally.
        </p>

        {!link ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiration Time
            </label>
            <select
              value={expiresIn}
              onChange={(e) => setExpiresIn(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-4"
            >
              <option value={3600}>1 Hour</option>
              <option value={86400}>1 Day</option>
              <option value={604800}>7 Days</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={generateLink}
                disabled={isGenerating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isGenerating ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex border rounded-lg overflow-hidden mb-4 bg-gray-50">
              <input
                type="text"
                readOnly
                value={link}
                className="flex-1 px-4 py-2 bg-transparent text-sm text-gray-700 outline-none"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors flex items-center justify-center gap-2 border-l"
              >
                <FaCopy />
              </button>
            </div>
            <p className="text-xs text-amber-600 mb-4 font-medium bg-amber-50 p-2 rounded border border-amber-100">
              This link encodes temporary access credentials that will expire
              exactly after the specified duration.
            </p>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
