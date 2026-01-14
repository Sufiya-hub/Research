import React from 'react';

export const FolderIcon = ({ className }) => (
  <svg
    className={className}
    fill="#FCD34D"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={0}
  >
    <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
  </svg>
);

export const OpenFolderIcon = ({ className }) => (
  <svg
    className={className}
    fill="#FCD34D"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={0}
  >
    <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z m0 12H4V8h16v10z" />
  </svg>
);

export const FileIcon = ({ className, type = 'file' }) => {
  let color = '#9CA3AF'; // Default gray
  let label = type.toUpperCase().slice(0, 4);

  if (type === 'pdf') {
    color = '#EF4444';
    label = 'PDF';
  }
  if (type === 'ppt' || type === 'pptx') {
    color = '#F97316';
    label = 'PPT';
  }
  if (type === 'xls' || type === 'xlsx') {
    color = '#10B981';
    label = 'XLS';
  }
  if (type === 'doc' || type === 'docx') {
    color = '#3B82F6';
    label = 'DOC';
  }
  if (type === 'zip' || type === 'rar') {
    color = '#F59E0B';
    label = 'ZIP';
  }
  if (type === 'txt') {
    color = '#6B7280';
    label = 'TXT';
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      {/* Paper Background */}
      <path
        d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
        fill="white"
        stroke={color}
        strokeWidth="2"
      />
      {/* Folded Corner */}
      <path
        d="M14 2V8H20"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Label Box */}
      <rect
        x="5.5"
        y="11"
        width="13"
        height="6"
        rx="1"
        fill={color}
        fillOpacity="0.1"
      />
      <text
        x="12"
        y="15"
        textAnchor="middle"
        fill={color}
        style={{
          fontSize: '5px',
          fontWeight: 'bold',
          fontFamily: 'sans-serif',
        }}
        dy=".3em"
      >
        {label}
      </text>
    </svg>
  );
};

export const VideoIcon = ({ className }) => (
  <svg className={className} fill="#EC4899" viewBox="0 0 24 24">
    <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.5zM12 16l-5-5h10l-5 5z" />
  </svg>
);

export const ImageIcon = ({ className }) => (
  <svg className={className} fill="#6366F1" viewBox="0 0 24 24">
    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
  </svg>
);

export const MusicIcon = ({ className }) => (
  <svg className={className} fill="#8B5CF6" viewBox="0 0 24 24">
    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
  </svg>
);

export const UnknownIcon = ({ className }) => (
  <svg className={className} fill="#9CA3AF" viewBox="0 0 24 24">
    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
  </svg>
);
