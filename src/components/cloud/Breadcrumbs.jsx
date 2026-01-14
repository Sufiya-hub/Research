import React from 'react';

// Simple Icons to replace external dependency
const HomeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor">
    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
  </svg>
);

const ChevronRightIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor">
    <path
      fillRule="evenodd"
      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

const Separator = () => (
  <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-1" />
);

export default function Breadcrumbs({ path, onNavigate }) {
  return (
    <nav className="flex items-center text-sm font-medium text-gray-600 overflow-x-auto whitespace-nowrap scrollbar-hide">
      {path.map((item, index) => {
        const isLast = index === path.length - 1;
        return (
          <div key={item.id} className="flex items-center">
            {index > 0 && <Separator />}
            <button
              onClick={() => onNavigate(item.id)}
              disabled={isLast}
              className={`flex items-center hover:bg-gray-100 px-2 py-1 rounded-md transition-colors ${
                isLast
                  ? 'text-gray-900 font-bold cursor-default hover:bg-transparent'
                  : 'text-gray-500 hover:text-blue-600'
              }`}
            >
              {item.id === 'root' ? (
                <div className="flex items-center">
                  <HomeIcon className="w-4 h-4 mr-1 text-gray-500" />
                  <span>My Cloud</span>
                </div>
              ) : (
                item.name
              )}
            </button>
          </div>
        );
      })}
    </nav>
  );
}
