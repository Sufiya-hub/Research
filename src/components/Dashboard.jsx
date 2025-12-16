// components/Dashboard.jsx (Updated Upload Logic - Removed 'Processing' Status)

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import DashboardMain from './DashboardMain';

const Dashboard = () => {
  const router = useRouter();
  const [activeItem, setActiveItem] = useState('My Cloud');

  const [filesData, setFilesData] = useState([]);
  const [uploading, setUploading] = useState(false);
  // Note: uploadMessage state is used for the temporary banner only.
  const [uploadMessage, setUploadMessage] = useState({ type: '', text: '' });

  // Mock Data (Assuming files are already classified)
  const initialFilesData = [
    {
      fileName: 'Dat Canonstets',
      size: 'S12',
      tags: ['Hot Tier'],
      type: 'Folder',
      isUrgent: true,
      isShared: false,
      s3Key: 'key_1',
    },
    {
      fileName: 'Hap Tufr',
      size: 'S1Z, 60',
      tags: ['Hot Tier'],
      type: 'Folder',
      isUrgent: true,
      isShared: false,
      s3Key: 'key_2',
    },
    {
      fileName: 'Dast Sdf',
      size: 'S1Z, 62',
      tags: ['Hot Tier'],
      type: 'PDF',
      isUrgent: false,
      isShared: false,
      s3Key: 'key_3',
    },
    {
      fileName: 'AI Procesed',
      size: 'S1Z, 10',
      tags: ['Hot Tier'],
      type: 'Folder',
      isUrgent: true,
      isShared: false,
      s3Key: 'key_4',
    },
    {
      fileName: 'Eiyt Raf',
      size: 'S1Z, 10',
      tags: ['Hot Tier'],
      type: 'PDF',
      isUrgent: true,
      isShared: false,
      s3Key: 'key_5',
    },
    {
      fileName: 'Row Cutbrs',
      size: 'S1Z, 10',
      tags: ['Hot Tier'],
      type: 'PDF',
      isUrgent: false,
      isShared: true,
      s3Key: 'key_6',
    },
  ];

  useEffect(() => {
    // NOTE: Initial data load should ideally happen in DashboardMain useEffect
  }, []);

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
    alert('Logging out...');
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      <Sidebar
        handleLogout={handleLogout}
        activeItem={activeItem}
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
