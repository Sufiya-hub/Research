// components/DashboardMain.jsx
'use client';

import React from 'react';
import CloudManager from './cloud/CloudManager';

import { useSession } from 'next-auth/react';
const DashboardMain = ({
  filesData,
  setFilesData,
  uploading,
  uploadMessage,
  handleFileUpload,
  activeItem,
}) => {
  // We are replacing the old flat-list view with the new hierarchical CloudManager.
  // The props coming from Dashboard (filesData, etc.) are currently ignored in favor of the CloudManager's internal state
  // which implements the requested Folder Structure and Cloud features.
  // In a real app, we would hoist the CloudManager state up to Dashboard or sync them.

  const { data: session } = useSession();
  console.log('DashboardMain session:', session);
  return (
    <main className="flex-1 p-4 h-full overflow-hidden flex flex-col">
      {/* We can re-introduce the header here if we want the title 'My Cloud' outside CloudManager, or let CloudManager handle it. */}
      {/* CloudManager is full height and handles its own layout */}
      <CloudManager />
    </main>
  );
};

export default DashboardMain;
