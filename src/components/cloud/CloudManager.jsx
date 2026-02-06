'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import FolderView from './FolderView';
import Breadcrumbs from './Breadcrumbs';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';

export default function CloudManager() {
  const [items, setItems] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState('root');
  // Breadcrumbs State: Start with Root
  const [breadcrumbs, setBreadcrumbs] = useState([
    { id: 'root', name: 'My Cloud' },
  ]);

  const [selectedIds, setSelectedIds] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  // --- Fetch Data ---
  const fetchItems = useCallback(
    async (folderId, showLoading = true, bypassCache = false) => {
      const cacheKey = `cloud_cache_${folderId}`;

      if (!bypassCache) {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          setItems(JSON.parse(cached));
          return;
        }
      }

      if (showLoading) setIsLoading(true);
      try {
        const res = await fetch(`/api/cloud/items?parentId=${folderId}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setItems(data);
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
      } catch (e) {
        console.error('Fetch Error:', e);
        // Toast error?
      } finally {
        if (showLoading) setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchItems(currentFolderId);
    setSelectedIds([]); // Clear selection on change
  }, [currentFolderId, fetchItems]);

  // --- Actions ---

  const handleNavigate = (folderId) => {
    // Find folder name from current items to update breadcrumbs
    // Note: if folderId is 'root', we reset.
    if (folderId === 'root') {
      setBreadcrumbs([{ id: 'root', name: 'My Cloud' }]);
      setCurrentFolderId('root');
      return;
    }

    const folder = items.find((i) => i.id === folderId);
    if (folder) {
      setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
      setCurrentFolderId(folderId);
    } else {
      setCurrentFolderId(folderId);
    }
  };

  // Breadcrumb specific nav
  const handleBreadcrumbNavigate = (folderId) => {
    const index = breadcrumbs.findIndex((b) => b.id === folderId);
    if (index !== -1) {
      setBreadcrumbs((prev) => prev.slice(0, index + 1));
      setCurrentFolderId(folderId);
    }
  };

  const handleCreateFolder = async (name) => {
    try {
      const res = await fetch('/api/cloud/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, parentId: currentFolderId }),
      });
      if (res.ok) {
        fetchItems(currentFolderId, false, true);
      }
    } catch (e) {
      alert('Error creating folder');
    }
  };

  const handleDelete = async (idsToDelete) => {
    if (!confirm(`Delete ${idsToDelete.length} items?`)) return;

    const folderIds = [];
    const fileIds = [];

    idsToDelete.forEach((id) => {
      const item = items.find((i) => i.id === id);
      if (item) {
        if (item.type === 'folder') folderIds.push(id);
        else fileIds.push(id);
      }
    });

    try {
      const res = await fetch('/api/cloud/items', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderIds, fileIds }),
      });
      if (res.ok) fetchItems(currentFolderId, false, true);
    } catch (e) {
      alert('Delete failed');
    }
  };

  const triggerIngestion = async (file, userId, fileId) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', userId);
      formData.append('file_id', fileId);

      const ingestRes = await fetch('http://127.0.0.1:8000/api/v1/ingest', {
        method: 'POST',
        body: formData,
      });

      if (ingestRes.ok) {
        const ingestData = await ingestRes.json();
        toast.success(ingestData.message || 'File ingested successfully');
      } else {
        toast.warning('File uploaded, but ingestion failed');
      }
    } catch (ingestErr) {
      console.error('Ingestion error:', ingestErr);
      toast.warning('File uploaded, but ingestion service unavailable');
    }
  };

  const handleUpload = async (fileList) => {
    const files = Array.from(fileList);

    // Upload sequentially to avoid overwhelming (or Parallel with Promise.all)
    for (const file of files) {
      try {
        // 1. Get Presigned URL
        const preRes = await fetch('/api/cloud/upload/presigned', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: file.name, fileType: file.type }),
        });
        const { url, key } = await preRes.json();

        // 2. Upload to S3
        await fetch(url, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });

        // 3. Save Metadata
        const metaRes = await fetch('/api/cloud/files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            s3Key: key,
            size: file.size,
            type: file.name.split('.').pop(),
            parentId: currentFolderId,
          }),
        });

        if (!metaRes.ok) throw new Error('Failed to save metadata');
        const fileData = await metaRes.json();
        const fileId = fileData.id;

        // 4. Fire-and-Forget Ingestion (if userId exists)
        if (session?.user?.id && fileId) {
          triggerIngestion(file, session.user.id, fileId);
        }
      } catch (e) {
        console.error('Upload failed for ' + file.name, e);
        toast.error('Upload failed for ' + file.name);
      }
    }
    fetchItems(currentFolderId, false, true);
  };
  const handleMove = async (sourceIds, targetFolderId) => {
    try {
      // Need to separate types.
      const itemsToMove = sourceIds.map((id) => {
        const item = items.find((i) => i.id === id);
        return { id, type: item?.type === 'folder' ? 'folder' : 'file' };
      });

      console.log('Moving items:', itemsToMove, 'to', targetFolderId);

      const res = await fetch('/api/cloud/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsToMove, targetFolderId }),
      });

      if (!res.ok) {
        throw new Error('Move failed');
      }

      // Always refresh the current folder after move
      fetchItems(currentFolderId, false, true);
      setSelectedIds([]); // Clear selection after move
    } catch (e) {
      console.error('Move Error:', e);
      alert('Failed to move items');
    }
  };

  // --- Clipboard ---
  const [clipboard, setClipboard] = useState({ items: [], action: null });

  const handleCopy = (ids) => {
    setClipboard({ items: ids, action: 'copy' });
  };

  const handleCut = (ids) => {
    setClipboard({ items: ids, action: 'move' });
  };

  const handlePaste = async () => {
    if (!clipboard.items.length || !clipboard.action) {
      alert('Nothing to paste');
      return;
    }

    if (clipboard.action === 'move') {
      await handleMove(clipboard.items, currentFolderId); // Paste into current
      setClipboard({ items: [], action: null });
    } else if (clipboard.action === 'copy') {
      try {
        const res = await fetch('/api/cloud/copy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceIds: clipboard.items,
            targetFolderId: currentFolderId,
          }),
        });

        if (!res.ok) {
          throw new Error('Copy failed');
        }

        fetchItems(currentFolderId, false, true);
        setClipboard({ items: [], action: null });
      } catch (e) {
        console.error('Copy Error:', e);
        alert('Failed to copy items');
      }
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
          : [...prev, idOrIds],
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
      <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
        <Breadcrumbs path={breadcrumbs} onNavigate={handleBreadcrumbNavigate} />

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

      <div className="flex-1 overflow-hidden relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            Loading...
          </div>
        ) : (
          <FolderView
            items={items}
            selectedIds={selectedIds}
            onNavigate={handleNavigate}
            onSelectionChange={toggleSelection}
            onDelete={handleDelete}
            onMove={handleMove}
            onCopy={handleCopy}
            onCut={handleCut}
            onPaste={handlePaste}
            onUpload={handleUpload}
            onSelectRange={selectRange}
            viewMode={viewMode}
          />
        )}
      </div>

      <div className="bg-white border-t border-gray-200 px-4 py-2 text-xs text-gray-500 flex justify-between">
        <span>{items.length} items</span>
        <span>{selectedIds.length} selected</span>
      </div>
    </div>
  );
}
