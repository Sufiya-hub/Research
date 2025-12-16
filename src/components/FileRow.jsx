// components/FileRow.jsx (Removed 'Processing' from Styling)

import React from 'react';

const FileRow = ({
  fileName,
  size,
  tags,
  type,
  isUrgent,
  isShared,
  s3Key,
  onDoubleClick,
  onDelete,
}) => {
  // Logic for Status Tags
  const renderTags = tags.map((tag, index) => {
    let tagColor = 'bg-gray-400 text-gray-900';
    // Ensure tags reflect final state (Tiers and Classifications)
    if (tag.includes('Hot Tier')) tagColor = 'bg-green-100 text-green-800';
    if (tag.includes('Cold Tier')) tagColor = 'bg-blue-100 text-blue-800'; // Added Cold Tier
    if (tag.includes('AI Tags')) tagColor = 'bg-orange-100 text-orange-800';
    if (tag.includes('Urgent')) tagColor = 'bg-red-100 text-red-800';

    return (
      <span
        key={index}
        className={`px-2 py-0.5 text-xs font-semibold rounded-full ${tagColor} mr-1`}
      >
        {tag}
      </span>
    );
  });

  return (
    <div
      className="flex items-center justify-between p-3 border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
      onDoubleClick={() => onDoubleClick(s3Key)}
    >
      {/* 1. File Name and Icon */}
      <div className="flex items-center w-1/3 min-w-[200px] truncate">
        {/* File Icon (Dynamic by Type) */}
        <svg
          className="w-5 h-5 mr-3 text-green-600"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          {/* Placeholder Path: Folder or Document */}
          {type === 'Folder' ? (
            <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z" />
          ) : (
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 20V4h7v4h4v12H6z" />
          )}
        </svg>
        <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
      </div>

      {/* 2. Status/Tags */}
      <div className="flex flex-wrap w-1/4">{renderTags}</div>

      {/* 3. Size */}
      <span className="text-sm text-gray-500 w-16 text-right hidden sm:block">
        {size}
      </span>

      {/* 4. Actions (Download and Delete) */}
      <div className="w-24 flex justify-end space-x-3 opacity-80">
        {/* Download Icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDoubleClick(s3Key);
          }}
          className="text-gray-500 hover:text-green-600 transition-colors p-1"
          title={`Download ${fileName}`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </button>

        {/* Delete Icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(fileName, s3Key);
          }}
          className="text-gray-500 hover:text-red-600 transition-colors p-1"
          title={`Delete ${fileName}`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.17l2.12-2.12 1.41 1.41L13.41 13l2.12 2.12-1.41 1.41L12 14.83l-2.12 2.12-1.41-1.41L10.59 13l-2.13-2.12z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default FileRow;
