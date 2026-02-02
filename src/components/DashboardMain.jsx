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
  const { data: session } = useSession();
  return (
    <main className="flex-1 p-4 h-full overflow-hidden flex flex-col">
      <CloudManager />
    </main>
  );
};

export default DashboardMain;
