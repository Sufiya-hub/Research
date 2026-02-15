// components/DashboardMain.jsx
'use client';

import React from 'react';
import CloudManager from './cloud/CloudManager';
import { useSession } from 'next-auth/react';
import Chatbot from './dashboard/Chatbot';

const DashboardMain = ({
  filesData,
  setFilesData,
  uploading,
  uploadMessage,
  handleFileUpload,
  activeItem,
}) => {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  // console.log(userId);
  return (
    <main className="flex-1 gap-4 p-4 h-full overflow-hidden flex flex-col">
      <Chatbot user={userId} />
      <CloudManager />
    </main>
  );
};

export default DashboardMain;
