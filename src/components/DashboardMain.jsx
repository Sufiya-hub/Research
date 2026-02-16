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
  setActiveItem,
}) => {
  const { data: session } = useSession();
  const [responseGenerated, setResponseGenerated] = React.useState(false);

  return (
    <main className="flex-1 gap-4 p-4 h-full overflow-hidden flex flex-col">
      <div
        className={`transition-all duration-500 ease-in-out ${
          responseGenerated ? 'flex-1 h-full' : 'h-auto'
        }`}
      >
        <Chatbot
          onResponseGenerated={() => setResponseGenerated(true)}
          onClose={() => setResponseGenerated(false)}
          isFullscreen={responseGenerated}
        />
      </div>

      <div
        className={`flex-1 overflow-hidden transition-all duration-300 ${
          responseGenerated ? 'hidden' : ''
        }`}
      >
        <CloudManager activeItem={activeItem} setActiveItem={setActiveItem} />
      </div>
    </main>
  );
};

export default DashboardMain;
