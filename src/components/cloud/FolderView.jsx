'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  FolderIcon,
  OpenFolderIcon,
  FileIcon,
  VideoIcon,
  ImageIcon,
  MusicIcon,
  UnknownIcon,
} from './Icons';

export default function FolderView({
  items,
  selectedIds,
  onNavigate,
  onSelectionChange,
  onDelete,
  onMove,
  onCopy,
  onCut,
  onPaste,
  onUpload,
  viewMode = 'grid',
}) {
  const containerRef = useRef(null);
  const [selectionBox, setSelectionBox] = useState(null); // { startX, startY, endX, endY }
  const [contextMenu, setContextMenu] = useState(null); // { x, y, type: 'item'|'bg', itemId }
  const isDraggingRef = useRef(false);

  // --- Helpers for Icons ---
  const getIcon = (item) => {
    if (item.type === 'folder')
      return <FolderIcon className="w-16 h-16 text-yellow-400" />;
    if (['png', 'jpg', 'jpeg', 'gif'].includes(item.type))
      return <ImageIcon className="w-12 h-12" />;
    if (['mp4', 'mov', 'avi'].includes(item.type))
      return <VideoIcon className="w-12 h-12" />;
    if (['mp3', 'wav'].includes(item.type))
      return <MusicIcon className="w-12 h-12" />;
    return <FileIcon className="w-12 h-12" type={item.type} />;
  };

  // --- Selection Logic ---
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    if (e.target.closest('[data-item-id]')) return;

    e.preventDefault();
    e.stopPropagation();

    if (!e.metaKey && !e.shiftKey) {
      onSelectionChange([], false);
    }

    const rect = containerRef.current.getBoundingClientRect();

    isDraggingRef.current = true;

    setSelectionBox({
      startX: e.clientX,
      startY: e.clientY,
      endX: e.clientX,
      endY: e.clientY,
      containerRect: rect,
    });
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!selectionBox) return;

      const rect = containerRef.current.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top + containerRef.current.scrollTop;

      setSelectionBox((prev) => ({
        ...prev,
        endX: currentX,
        endY: currentY,
      }));
    },
    [selectionBox]
  );

  const handleMouseUp = useCallback(() => {
    if (!selectionBox) return;

    // Calculate Final Selection
    const scrollLeft = containerRef.current.scrollLeft;
    // Don't double add scrollTop here as values already have it from move/down

    // Normalize Box
    const box = {
      left: Math.min(selectionBox.startX, selectionBox.endX), // Relative to container content top
      top: Math.min(selectionBox.startY, selectionBox.endY),
      width: Math.abs(selectionBox.endX - selectionBox.startX),
      height: Math.abs(selectionBox.endY - selectionBox.startY),
    };

    // Very basic intersection check using DOM elements
    const itemElements =
      containerRef.current.querySelectorAll('[data-item-id]');
    const newSelected = [];

    itemElements.forEach((el) => {
      // Calculate relative to container
      // el.offsetTop is relative to offsetParent (container relative)

      const elRelative = {
        left: el.offsetLeft,
        top: el.offsetTop,
        width: el.offsetWidth,
        height: el.offsetHeight,
      };

      if (
        box.left < elRelative.left + elRelative.width &&
        box.left + box.width > elRelative.left &&
        box.top < elRelative.top + elRelative.height &&
        box.top + box.height > elRelative.top
      ) {
        newSelected.push(el.getAttribute('data-item-id'));
      }
    });

    if (box.width > 5 || box.height > 5) {
      onSelectionChange(newSelected, true);
    }

    setSelectionBox(null);
  }, [selectionBox, onSelectionChange]);

  // --- Drag and Drop Logic (Native HTML5) ---
  const handleDragStart = (e, item) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        ids: selectedIds.includes(item.id) ? selectedIds : [item.id],
      })
    );
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, item) => {
    e.preventDefault(); // Allow drop
    if (item && item.type === 'folder') {
      e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)';
    } else if (!item) {
      // Background drag over (for upload)
      e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)';
    }
  };

  const handleDragLeave = (e) => {
    e.currentTarget.style.backgroundColor = '';
  };

  const handleDrop = (e, targetItem) => {
    e.preventDefault();
    e.stopPropagation(); // Stop bubbling
    e.currentTarget.style.backgroundColor = '';

    // Check for Files (Upload)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (onUpload) onUpload(e.dataTransfer.files);
      return;
    }

    // Check for Internal Move
    const data = e.dataTransfer.getData('application/json');
    if (!data) return;

    const { ids } = JSON.parse(data);

    // If dropping on a folder, move there.
    if (targetItem && targetItem.type === 'folder') {
      if (ids.includes(targetItem.id)) return; // Can't drop into itself
      onMove(ids, targetItem.id);
    }
    // If dropping on whitespace (targetItem null), do nothing or move to current path (noop)
  };

  // --- Context Menu ---
  const handleContextMenu = (e, item) => {
    e.preventDefault();
    e.stopPropagation();

    const x = e.clientX;
    const y = e.clientY;

    if (item) {
      // Item Menu
      if (!selectedIds.includes(item.id)) {
        onSelectionChange(item.id, false); // Select this item if not already part of selection
      }
      setContextMenu({ x, y, type: 'item', itemId: item.id, item });
    } else {
      // Background Menu
      setContextMenu({ x, y, type: 'bg' });
    }
  };

  // Global close for context menu
  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  // --- Render Context Menu ---
  const renderContextMenu = () => {
    if (!contextMenu) return null;

    const menuStyle = {
      top: contextMenu.y,
      left: contextMenu.x,
    };

    return (
      <div
        className="fixed z-50 bg-white shadow-xl rounded-lg border border-gray-100 py-1 min-w-[160px] animate-in fade-in duration-100"
        style={menuStyle}
        onClick={(e) => e.stopPropagation()} // Keep menu open if clicking inside (actually standard is to close, but for actions we close)
      >
        {contextMenu.type === 'item' ? (
          <>
            <button
              onClick={() => {
                if (contextMenu.item.type === 'folder')
                  onNavigate(contextMenu.item.id);
                else alert('Opening ' + contextMenu.item.name);
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
            >
              Open
            </button>
            <div className="h-px bg-gray-200 my-1" />
            <button
              onClick={() => {
                onCopy(selectedIds.length ? selectedIds : [contextMenu.itemId]);
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
            >
              Copy
            </button>
            <button
              onClick={() => {
                onCut(selectedIds.length ? selectedIds : [contextMenu.itemId]);
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
            >
              Cut
            </button>
            <div className="h-px bg-gray-200 my-1" />
            <button
              onClick={() => {
                onDelete(
                  selectedIds.length ? selectedIds : [contextMenu.itemId]
                );
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-600"
            >
              Delete
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                onPaste();
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
            >
              Paste
            </button>
            <div className="h-px bg-gray-200 my-1" />
            <button
              onClick={() => {
                document.getElementById('cloud-upload').click();
                setContextMenu(null);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
            >
              Upload Files
            </button>
          </>
        )}
      </div>
    );
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!isDraggingRef.current) return;

      setSelectionBox((prev) =>
        prev
          ? {
              ...prev,
              endX: e.clientX,
              endY: e.clientY,
            }
          : null
      );
    };

    const onUp = () => {
      if (!isDraggingRef.current || !selectionBox) return;

      isDraggingRef.current = false;

      const boxRect = {
        left: Math.min(selectionBox.startX, selectionBox.endX),
        right: Math.max(selectionBox.startX, selectionBox.endX),
        top: Math.min(selectionBox.startY, selectionBox.endY),
        bottom: Math.max(selectionBox.startY, selectionBox.endY),
      };

      const selected = [];
      const items = containerRef.current.querySelectorAll('[data-item-id]');

      items.forEach((el) => {
        const r = el.getBoundingClientRect();

        const intersects =
          boxRect.left < r.right &&
          boxRect.right > r.left &&
          boxRect.top < r.bottom &&
          boxRect.bottom > r.top;

        if (intersects) {
          selected.push(el.dataset.itemId);
        }
      });

      if (
        Math.abs(selectionBox.endX - selectionBox.startX) > 5 ||
        Math.abs(selectionBox.endY - selectionBox.startY) > 5
      ) {
        onSelectionChange(selected, true);
      }

      setSelectionBox(null);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [selectionBox, onSelectionChange]);

  return (
    <>
      <div
        ref={containerRef}
        className={`selectable-area w-full h-full overflow-y-auto p-4 relative grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 content-start`}
        onMouseDown={handleMouseDown}
        onContextMenu={(e) => handleContextMenu(e, null)}
        onDragOver={(e) => handleDragOver(e, null)}
        onDrop={(e) => handleDrop(e, null)}
      >
        {/* Selection Box Visual */}
        {selectionBox && (
          <div
            className="fixed border border-blue-400 bg-blue-200/60 z-50 pointer-events-none"
            style={{
              left: Math.min(selectionBox.startX, selectionBox.endX),
              top: Math.min(selectionBox.startY, selectionBox.endY),
              width: Math.abs(selectionBox.endX - selectionBox.startX),
              height: Math.abs(selectionBox.endY - selectionBox.startY),
            }}
          />
        )}

        {items.map((item) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <div
              key={item.id}
              data-item-id={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
              onDragOver={(e) => handleDragOver(e, item)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, item)}
              onClick={(e) => {
                e.stopPropagation();
                if (e.metaKey || e.ctrlKey) {
                  onSelectionChange(item.id, true);
                } else {
                  onSelectionChange(item.id, false);
                }
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (item.type === 'folder') onNavigate(item.id);
                else alert('Opening file: ' + item.name);
              }}
              onContextMenu={(e) => handleContextMenu(e, item)}
              className={`
                group relative flex flex-col min-h-40 max-h-50 items-center justify-center p-4 transition-all duration-200 cursor-pointer border
                ${
                  isSelected
                    ? 'bg-blue-50 border-blue-400 shadow-sm scale-[1.02]'
                    : 'bg-white hover:bg-gray-50 hover:shadow-sm border-gray-100'
                }
             `}
            >
              <div className="mb-3 transform transition-transform group-hover:scale-110">
                {getIcon(item)}
              </div>
              <span
                className={`text-sm text-center font-medium truncate w-full px-2 ${
                  isSelected ? 'text-blue-700' : 'text-gray-700'
                }`}
              >
                {item.name}
              </span>

              <span className="text-[10px] text-gray-400 mt-1">
                {item.size || (item.type === 'folder' ? 'Folder' : '')}
              </span>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="col-span-full h-64 flex flex-col items-center justify-center text-gray-400 pointer-events-none">
            <span className="text-4xl mb-4 opacity-50">📂</span>
            <p>This folder is empty</p>
            <p className="text-sm opacity-75">
              Drag files here or create a new folder
            </p>
          </div>
        )}
      </div>
      {renderContextMenu()}
    </>
  );
}
