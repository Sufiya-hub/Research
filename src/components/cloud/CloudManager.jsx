'use client';

import React, { useState, useMemo } from 'react';
import FolderView from './FolderView';
import Breadcrumbs from './Breadcrumbs';
import { v4 as uuidv4 } from 'uuid'; // Assuming uuid is installed, if not I'll use simple math.random or just a counter.

// --- MOCK DATA ---
const INITIAL_DATA = [
  { id: '1', name: 'Documents', type: 'folder', parentId: 'root' },
  { id: '2', name: 'Images', type: 'folder', parentId: 'root' },
  { id: '21', name: 'Images', type: 'folder', parentId: 'root' },
  { id: '22', name: 'Images', type: 'folder', parentId: 'root' },
  { id: '23', name: 'Images', type: 'folder', parentId: 'root' },
  { id: '24', name: 'Images', type: 'folder', parentId: 'root' },

  { id: '3', name: 'Work', type: 'folder', parentId: '1' },
  { id: '4', name: 'Resume.pdf', type: 'pdf', parentId: '1', size: '1.2MB' },
  { id: '5', name: 'Vacation.jpg', type: 'img', parentId: '2', size: '3.4MB' },
  {
    id: '6',
    name: 'ProjectProposal.docx',
    type: 'doc',
    parentId: '3',
    size: '200KB',
  },
  { id: '7', name: 'Budget.xlsx', type: 'xls', parentId: '3', size: '45KB' },
  {
    id: '8',
    name: 'Presentation.pptx',
    type: 'ppt',
    parentId: 'root',
    size: '5.2MB',
  },
];

export default function CloudManager() {
  const [items, setItems] = useState(INITIAL_DATA);
  const [currentFolderId, setCurrentFolderId] = useState('root');
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // --- Derived State ---
  const currentItems = useMemo(() => {
    return items.filter((item) => item.parentId === currentFolderId);
  }, [items, currentFolderId]);

  const breadcrumbs = useMemo(() => {
    const path = [];
    let currentId = currentFolderId;
    while (currentId !== 'root') {
      const folder = items.find((i) => i.id === currentId);
      if (folder) {
        path.unshift({ id: folder.id, name: folder.name });
        currentId = folder.parentId;
      } else {
        break; // Should not happen
      }
    }
    path.unshift({ id: 'root', name: 'My Cloud' });
    return path;
  }, [items, currentFolderId]);

  // --- Actions ---
  const handleNavigate = (folderId) => {
    setCurrentFolderId(folderId);
    setSelectedIds([]); // Clear selection on navigate
  };

  const handleCreateFolder = (name) => {
    const newFolder = {
      id: crypto.randomUUID(),
      name,
      type: 'folder',
      parentId: currentFolderId,
    };
    setItems((prev) => [...prev, newFolder]);
  };

  const handleDelete = (idsToDelete) => {
    if (
      confirm(`Are you sure you want to delete ${idsToDelete.length} item(s)?`)
    ) {
      setItems((prev) => prev.filter((item) => !idsToDelete.includes(item.id)));
      setSelectedIds([]);
    }
  };

  const handleUpload = (files) => {
    // Mock upload
    const newFiles = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      type: file.name.split('.').pop() || 'unknown',
      parentId: currentFolderId,
      size: (file.size / 1024).toFixed(2) + ' KB',
    }));
    setItems((prev) => [...prev, ...newFiles]);
  };

  const handleMove = (sourceIds, targetFolderId) => {
    setItems((prev) =>
      prev.map((item) => {
        if (sourceIds.includes(item.id)) {
          return { ...item, parentId: targetFolderId };
        }
        return item;
      })
    );
    setSelectedIds([]);
  };

  const [clipboard, setClipboard] = useState({ items: [], action: null }); // action: 'copy' | 'move'

  const handleCopy = (ids) => {
    setClipboard({ items: ids, action: 'copy' });
  };

  const handleCut = (ids) => {
    setClipboard({ items: ids, action: 'move' });
  };

  const handlePaste = (targetFolderId) => {
    if (!clipboard.items.length || !clipboard.action) return;

    if (clipboard.action === 'move') {
      handleMove(clipboard.items, targetFolderId);
      setClipboard({ items: [], action: null });
    } else if (clipboard.action === 'copy') {
      // Find items and duplicate them
      const itemsToCopy = items.filter((i) => clipboard.items.includes(i.id));
      const newItems = itemsToCopy.map((item) => ({
        ...item,
        id: crypto.randomUUID(),
        parentId: targetFolderId,
        name: `${item.name} (Copy)`, // Simple naming strategy
      }));
      setItems((prev) => [...prev, ...newItems]);
      setClipboard({ items: [], action: null });
    }
  };

  const toggleSelection = (idOrIds, multiSelect) => {
    if (Array.isArray(idOrIds)) {
      setSelectedIds(idOrIds);
      return;
    }
    if (multiSelect) {
      setSelectedIds((prev) =>
        prev.includes(idOrIds)
          ? prev.filter((i) => i !== idOrIds)
          : [...prev, idOrIds]
      );
    } else {
      setSelectedIds([idOrIds]);
    }
  };

  const selectRange = (ids) => {
    setSelectedIds(ids);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-xl overflow-hidden shadow-sm border border-gray-200">
      {/* Search & Breadcrumbs Bar */}
      <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
        <Breadcrumbs path={breadcrumbs} onNavigate={handleNavigate} />

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              const name = prompt('Enter folder name:');
              if (name) handleCreateFolder(name);
            }}
            className="px-3 py-1.5 bg-green-50 text-green-700 rounded-md hover:bg-green-100 text-sm font-medium transition-colors"
          >
            New Folder
          </button>
          <button
            onClick={() => document.getElementById('cloud-upload').click()}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors shadow-sm"
          >
            Upload
          </button>
          <input
            type="file"
            id="cloud-upload"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          <button
            onClick={() =>
              setViewMode((prev) => (prev === 'grid' ? 'list' : 'grid'))
            }
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
            title="Toggle View"
          >
            {viewMode === 'grid' ? (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        <FolderView
          items={currentItems}
          selectedIds={selectedIds}
          onNavigate={handleNavigate}
          onSelectionChange={toggleSelection}
          onDelete={handleDelete}
          onMove={handleMove}
          onCopy={handleCopy}
          onCut={handleCut}
          onPaste={() => handlePaste(currentFolderId)}
          onUpload={handleUpload}
          onSelectRange={selectRange}
          viewMode={viewMode}
        />
      </div>

      {/* Footer / Status Bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-2 text-xs text-gray-500 flex justify-between">
        <span>{currentItems.length} items</span>
        <span>{selectedIds.length} selected</span>
      </div>
    </div>
  );
}
