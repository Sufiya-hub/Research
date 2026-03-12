'use client';

import React, { useState } from 'react';

export default function OrgShareModal({
  file,
  organizations,
  onConfirm,
  onClose,
}) {
  const [selectedOrgIds, setSelectedOrgIds] = useState(
    organizations.map((o) => o.id),
  );

  const toggleOrg = (id) => {
    setSelectedOrgIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  if (!file) return null;

  const handleConfirm = () => {
    if (!selectedOrgIds.length) {
      // Require at least one organization
      return;
    }
    onConfirm(selectedOrgIds);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Add to organizations
            </h2>
            <p className="text-xs text-gray-500">
              Select one or more organizations to share{' '}
              <span className="font-medium text-gray-700">{file.name}</span>.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none px-2"
          >
            ×
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto px-4 py-3 space-y-2">
          {organizations.length === 0 ? (
            <p className="text-xs text-gray-400">
              You don&apos;t belong to any organizations yet.
            </p>
          ) : (
            organizations.map((org) => (
              <label
                key={org.id}
                className="flex items-start gap-3 rounded-lg border border-gray-200 px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="mt-1 h-3.5 w-3.5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  checked={selectedOrgIds.includes(org.id)}
                  onChange={() => toggleOrg(org.id)}
                />
                <div>
                  <p className="text-gray-900 font-medium">
                    {org.name}{' '}
                    <span className="text-gray-400 font-normal">
                      ({org.orgKey})
                    </span>
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Role: {org.role} • Access: {org.accessLevel}
                  </p>
                </div>
              </label>
            ))
          )}
        </div>

        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-end gap-2 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedOrgIds.length}
            className="px-3 py-1.5 text-xs font-medium rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

