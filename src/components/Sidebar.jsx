// components/Sidebar.jsx (Updated to Hide Scrollbar)

import React, { useState } from 'react';

const Sidebar = ({ handleLogout, activeItem, handleItemClick, userName }) => {
  // State to manage which sections of the sidebar are expanded (optional sub-menus)
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (name) => {
    setExpandedSections((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const navItems = [
    {
      name: 'My Cloud',
      iconPath:
        'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
      hasSubMenu: false,
      subItems: [],
    },
    {
      name: 'Recents',
      iconPath: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      hasSubMenu: true,
      subItems: ['Recently Accessed', 'Recently Modified'],
    },
    {
      name: 'Shared',
      iconPath: 'M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6',
      hasSubMenu: true,
      subItems: ['Shared With Me', 'Shared By Me'],
    },
    {
      name: 'Favorites',
      iconPath:
        'M11.08 17.06a1 1 0 01-.73-1.74l1.39-1.4a1 1 0 011.4 0l1.39 1.4a1 1 0 01-.73 1.74z',
      hasSubMenu: false,
      subItems: [],
    },
    {
      name: 'AI Insights',
      iconPath:
        'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      hasSubMenu: true,
      subItems: ['Topic Clustering', 'Summarization History'],
    },
    {
      name: 'Storage Tiers',
      iconPath: 'M4 16h16M4 8h16m-5 4h5',
      hasSubMenu: true,
      subItems: ['Hot Tier View', 'Cold Tier View', 'Tiering Reports'],
    },
    {
      name: 'Settings',
      iconPath:
        'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.572-1.065c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35z',
      hasSubMenu: true,
      subItems: ['Account & Security', 'API Keys', 'Storage Limits'],
    },
  ];
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const initials = getInitials(userName);

  return (
    <aside className="w-64 p-4 bg-white flex flex-col shrink-0 border-r border-gray-100 shadow-md h-screen">
      {/* Logo Section (Fixed height) */}
      <h1 className="text-xl font-bold mb-4 text-green-600 flex items-center flex-none">
        <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        Smart Cloud AI
      </h1>

      {/* 2. Scrollable container for navigation links */}
      {/* ADDED scrollbar-hide CLASS HERE */}
      <div className="flex-1 overflow-y-auto mt-4 mb-4 scrollbar-hide">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <div key={item.name}>
              <a
                href="#"
                onClick={() => {
                  handleItemClick(item.name);
                  if (item.hasSubMenu) {
                    toggleSection(item.name);
                  }
                }}
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  item.name === activeItem
                    ? 'bg-green-100 text-green-800 font-semibold'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={item.iconPath}
                  />
                </svg>
                {item.name}
                {item.hasSubMenu && (
                  <svg
                    className={`w-4 h-4 ml-auto transform transition-transform ${
                      expandedSections[item.name] ? 'rotate-90' : 'rotate-0'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                  </svg>
                )}
              </a>

              {/* Sub-Menu Content */}
              {item.hasSubMenu && expandedSections[item.name] && (
                <div className="ml-6 py-1 space-y-1">
                  {item.subItems.map((subItem) => (
                    <a
                      key={subItem}
                      href="#"
                      onClick={() => handleItemClick(subItem)}
                      className={`block p-2 rounded-lg text-sm transition-colors ${
                        subItem === activeItem
                          ? 'bg-green-50 text-green-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {subItem}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* User Profile and Logout (Fixed height) */}
      <div className="border-t border-gray-200 pt-4 flex-none">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 rounded-full bg-green-500 mr-3 flex items-center justify-center text-sm font-bold text-white">
            {initials}
          </div>
          <span className="text-sm font-medium text-gray-700">
            {userName || 'User'}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors cursor-pointer"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
