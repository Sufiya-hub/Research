import React, { useState } from 'react';

const OldFileStructure = ({ filesData }) => {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <>
      {/* 3. File List (List Structure) */}
      <h3 className="text-lg font-semibold mb-2 text-gray-700">
        {filesData.length > 0 ? 'All Items' : 'Get Started'}
      </h3>

      {isLoading ? (
        <div className="text-center p-10 text-gray-500">Loading files...</div>
      ) : filesData.length === 0 ? (
        // --- EMPTY STATE UI (omitted for brevity) ---
        <div className="flex flex-col items-center justify-center p-20 bg-white border-2 border-dashed border-gray-300 rounded-xl">
          <svg
            className="w-16 h-16 text-green-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 014 4v2a4 4 0 01-4 4h-1"
            />
          </svg>
          <p className="text-xl font-semibold text-gray-700 mb-2">
            Your Smart Cloud is Empty
          </p>
          <p className="text-gray-500 mb-4">
            Upload your first file to begin using AI features like Semantic
            Search and Tiering.
          </p>
          <label
            htmlFor="file-upload-input"
            className="px-6 py-3 font-medium rounded-lg flex items-center shadow-lg transition-colors cursor-pointer bg-green-600 hover:bg-green-700 text-white"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              />
            </svg>
            Upload First File
          </label>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          {/* List Header/Column Titles */}
          <div className="flex items-center justify-between p-3 bg-gray-100 text-gray-600 font-semibold text-sm rounded-t-lg">
            <span className="w-1/3 min-w-[200px]">Name</span>
            <span className="w-1/4">Status/Tags</span>
            <span className="w-16 text-right hidden sm:block">Size</span>
            <span className="w-24 text-right">Actions</span>
          </div>

          {/* File Rows */}
          <div className="divide-y divide-gray-100">
            {filesData.map((file, index) => (
              <FileRow
                key={file.s3Key || index}
                fileName={file.fileName}
                size={file.size}
                tags={file.tags}
                type={file.type}
                isUrgent={file.isUrgent}
                isShared={file.isShared}
                s3Key={file.s3Key}
                onDoubleClick={handleFileOpen}
                onDelete={handleFileDelete}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default OldFileStructure;
