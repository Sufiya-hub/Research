import React from 'react';
import Image from 'next/image';

const FileStructure = ({ content, navigateToFolder }) => {
  return (
    <div className="grid grid-cols-7 gap-1">
      {content.map((item, index) => (
        <div
          key={index}
          onClick={() => {
            if (item.type === 'folder') navigateToFolder(item.id, item.name);
          }}
          className="flex flex-col  items-center cursor-pointer border-[1px] border-transparent p-2 hover:bg-gray-200/50 rounded-xs"
        >
          <Image
            src={`/icons/${item.type}.svg`}
            alt={item.name}
            width={96}
            height={96}
          />
          <h1 className="text-sm">{item.name}</h1>
        </div>
      ))}
    </div>
  );
};

export default FileStructure;
