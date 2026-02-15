'use client';

import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'; // Adjust import if needed

export default function FilePreviewModal({ file, onClose }) {
  if (!file) return null;

  const isVideo = ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(
    file.type?.toLowerCase(),
  );
  const isAudio = ['mp3', 'wav', 'ogg'].includes(file.type?.toLowerCase());
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(
    file.type?.toLowerCase(),
  );
  const isPdf = file.type?.toLowerCase() === 'pdf';
  const isOffice = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(
    file.type?.toLowerCase(),
  );
  const isText = ['txt', 'csv', 'json', 'md'].includes(
    file.type?.toLowerCase(),
  );

  // Prepare docs for DocViewer
  const docs = [
    { uri: file.url, fileType: file.type }, // fileType is optional but helps
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              {/* Icon placeholder or reuse existing icon component */}
              <span className="text-blue-600 font-bold uppercase text-xs">
                {file.type}
              </span>
            </div>
            <div>
              <h3
                className="font-semibold text-gray-800 truncate max-w-md"
                title={file.name}
              >
                {file.name}
              </h3>
              <p className="text-xs text-gray-500">Preview Mode</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={file.url}
              download={file.name}
              target="_blank"
              rel="noreferrer"
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              title="Download"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
            </a>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-gray-50 overflow-y-auto relative flex items-center justify-center">
          {isVideo || isAudio ? (
            <div className="w-full h-full bg-black flex items-center justify-center">
              <ReactPlayer
                url={file.url}
                controls
                width="100%"
                height="100%"
                playing={true}
              />
            </div>
          ) : (
            <div className="w-full h-full doc-viewer-wrapper">
              <DocViewer
                documents={docs}
                pluginRenderers={DocViewerRenderers}
                style={{ height: '100%' }}
                config={{
                  header: {
                    disableHeader: true,
                    disableFileName: true,
                    retainURLParams: false,
                  },
                  csvDelimiter: ',', // Default csv delimiter
                  pdfZoom: {
                    defaultZoom: 1.1, // 1 as default zoom
                    zoomJump: 0.2, // 0.1 as default zoom jump
                  },
                  pdfVerticalScrollByDefault: true, // false as default
                }}
                theme={{
                  primary: '#5296d8',
                  secondary: '#ffffff',
                  tertiary: '#5296d899',
                  text_primary: '#ffffff',
                  text_secondary: '#5296d8',
                  text_tertiary: '#00000099',
                  disableThemeScrollbar: false,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
