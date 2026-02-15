// components/Dashboard.jsx (Updated Upload Logic - Removed 'Processing' Status)

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import DashboardMain from './DashboardMain';
import { useSession, signOut } from 'next-auth/react';

const Dashboard = () => {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [activeItem, setActiveItem] = useState('My Cloud');

  const [filesData, setFilesData] = useState([]);
  const [uploading, setUploading] = useState(false);
  // Note: uploadMessage state is used for the temporary banner only.
  const [uploadMessage, setUploadMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    console.log('Session Data:', session);
    console.log('Session Status:', status);
    // NOTE: Initial data load should ideally happen in DashboardMain useEffect
  }, [session, status]);
  const userName = session?.user?.name || 'User';

  const handleItemClick = (itemName) => {
    setActiveItem(itemName);
  };

  // --- UPDATED: handleFileUpload (Assumes instant classification to Hot Tier) ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadMessage({ type: 'info', text: `Uploading ${file.name}...` });

    // Simulate API call, S3 upload, and IMMEDIATE AI CLASSIFICATION (Backend job)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Message changed to confirm successful background processing
    setUploadMessage({
      type: 'success',
      text: `Upload successful! File is secured in Hot Tier.`,
    });

    // Add the new file assuming it starts in the 'Hot Tier'
    const newFile = {
      fileName: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      tags: ['Hot Tier', 'AI Tags'], // Immediate classification tags
      type: file.name.split('.').pop().toUpperCase() || 'FILE',
      s3Key: `temp_key_${Date.now()}`, // Unique key for rendering
    };
    setFilesData((prev) => [newFile, ...prev]);

    setUploading(false);
    e.target.value = null;
    setTimeout(() => setUploadMessage({ type: '', text: '' }), 5000);
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      <Sidebar
        handleLogout={handleLogout}
        activeItem={activeItem}
        userName={userName}
        handleItemClick={handleItemClick}
      />

      <DashboardMain
        filesData={filesData}
        setFilesData={setFilesData}
        uploading={uploading}
        uploadMessage={uploadMessage}
        handleFileUpload={handleFileUpload}
        activeItem={activeItem}
      />
    </div>
  );
};

export default Dashboard;
