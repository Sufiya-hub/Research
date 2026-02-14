import React, { useEffect, useState } from 'react';
import {
  FaArrowUp,
  FaFile,
  FaFilePdf,
  FaFileImage,
  FaFileCode,
  FaFileCsv,
  FaFileLines,
} from 'react-icons/fa6';
import AiText from '../AiText';
import { useSession } from 'next-auth/react';

const Chatbot = ({ onResponseGenerated, isFullscreen }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [relatedFiles, setRelatedFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const { data: session } = useSession();

  const sendQuery = () => {
    if (!session?.user?.id) return;
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    const raw = JSON.stringify({
      query,
      user_id: session?.user?.id,
    });

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };

    // MOCK DATA FOR DEVELOPMENT
    const mockData = {
      answer:
        "**Detail Note on Kalyan Pendem's Skills:**\n\nKalyan Pendem possesses a broad and modern skill set spanning multiple domains, including programming languages, databases, cloud technologies, full-stack development, testing/DevOps, and Applied AI.\n\n**Skills Breakdown:**\n\n1.  **Languages:** Python, TypeScript, Java, JavaScript.\n2.  **Databases:** MongoDB, SQL, PostgreSQL.\n3.  **Cloud Platforms & Distributed Systems:** AWS, GCP, Docker.\n4.  **Full-Stack Technologies:** React, Node.js, Express.js, NEXT, REST, GraphQL.\n5.  **Testing & DevOps:** Jest, Snyk, Git, Linux/Unix.\n6.  **Applied AI:** Retrieval-based systems, LLM-powered query translation, data analytics (NumPy, Pandas).\n\n**Summarization:**\n\nKalyan Pendem's skills cover essential areas for modern software engineering. He is proficient in core languages like **Python and TypeScript**, is skilled in both relational (**SQL, PostgreSQL**) and non-relational (**MongoDB**) databases, and has experience with major cloud providers (**AWS, GCP**). His full-stack capabilities include modern frameworks like **React, Node.js, and NEXT**. Furthermore, he has specific expertise in **Applied AI**, including LLM query translation and retrieval systems, complemented by standard DevOps and testing tools (**Git, Jest**).\n\n***\n\n**Direct Answer:**\n\nKalyan's skills include:\n\n*   **Languages:** Python, TypeScript, Java, JavaScript\n*   **Databases:** MongoDB, SQL, PostgreSQL\n*   **Cloud Platforms & Distributed Systems:** AWS, GCP, Docker\n*   **Full-Stack Technologies:** React, Node.js, Express.js, NEXT, REST, GraphQL\n*   **Testing & DevOps:** Jest, Snyk, Git, Linux/Unix\n*   **Applied AI:** Retrieval-based systems, LLM-powered query translation, data analytics (NumPy, Pandas)",
      sources: [
        'paths, and community collaboration. • Secured 3rd place in a state-level hackathon by architecting an agentic AI-powered knowledge graph system to uncover relational patterns within complex police datasets.',
        'Kalyan Pendem kalyanpendem007@gmail.com|+91 9381034364 linkedin.com/in/kalyanpendem|github.com/Kalyan5252|leetcode.com/KALYAN5252 Skills Languages:Python, TypeScript, Java, JavaScript Databases:MongoDB, SQL, PostgreSQL Cloud Platforms & Distributed Systems:AWS, GCP, Docker Full-Stack Technologies:React, Node.js, Express.js, NEXT, REST, GraphQL Testing & DevOps:Jest, Snyk, Git, Linux/Unix Applied AI:Retrieval-based systems, LLM-powered query translation, data analytics (NumPy , Pandas)...',
      ],
      file_ids: [
        'b2bf8848-78b8-4721-b755-849398056307',
        'b2bf8848-78b8-4721-b755-849398056307',
        '0322b345-68b5-45b4-8387-700017233611',
        '0322b345-68b5-45b4-8387-700017233611',
      ],
    };

    // console.log('Using Mock Data for Dev');
    // Simulate API delay
    // setTimeout(async () => {
    //   const result = mockData;
    //   console.log(result);
    //   setResponse(result?.answer);

    //   // Handle Valid File IDs
    //   if (result?.file_ids && Array.isArray(result.file_ids)) {
    //     console.log('Fetching files for IDs:', result.file_ids);
    //     await fetchRelatedFiles(result.file_ids);
    //   } else {
    //     setRelatedFiles([]);
    //   }

    //   if (onResponseGenerated) {
    //     onResponseGenerated(true);
    //   }
    // }, 1000);

    fetch('http://127.0.0.1:8000/api/v1/query', requestOptions)
      .then((response) => response.json())
      .then(async (result) => {
        console.log(result);
        setResponse(result?.answer);

        // Handle Valid File IDs
        if (result?.file_ids && Array.isArray(result.file_ids)) {
          console.log('Fetching files for IDs:', result.file_ids);
          await fetchRelatedFiles(result.file_ids);
        } else {
          setRelatedFiles([]);
        }
      })
      .catch((error) => console.error(error));
  };

  const fetchRelatedFiles = async (fileIds) => {
    if (!fileIds || fileIds.length === 0) return;
    setIsLoadingFiles(true);
    try {
      // Use Set to remove duplicates
      const uniqueIds = [...new Set(fileIds)];

      const res = await fetch('/api/cloud/files/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: uniqueIds }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log('Fetched related files:', data);
        setRelatedFiles(data);
      } else {
        console.error('Failed to fetch related files');
      }
    } catch (error) {
      console.error('Error fetching related files:', error);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const getFileIcon = (fileType) => {
    const type = fileType?.toLowerCase() || '';
    if (type.includes('pdf')) return <FaFilePdf className="text-red-500" />;
    if (type.includes('image') || type.includes('jpg') || type.includes('png'))
      return <FaFileImage className="text-blue-500" />;
    if (
      type.includes('code') ||
      type.includes('js') ||
      type.includes('py') ||
      type.includes('html')
    )
      return <FaFileCode className="text-yellow-500" />;
    if (type.includes('csv') || type.includes('xls'))
      return <FaFileCsv className="text-green-500" />;
    return <FaFileLines className="text-gray-500" />;
  };

  useEffect(() => console.log(response), [response]);

  return (
    <div
      className={`bg-white p-4 shadow-sm border border-gray-200 rounded-xl flex flex-col transition-all duration-300 ${isFullscreen ? 'h-full' : ''}`}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendQuery();
        }}
        className="flex justify-between items-center bg-gray-100 px-4 py-1 border border-gray-300 rounded-full flex-shrink-0"
      >
        <input
          type="text"
          placeholder="Enter your prompt.."
          className="outline-none w-full"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="p-2 -mr-2 rounded-full bg-white">
          <FaArrowUp />
        </button>
      </form>
      {/* CONTAINER FOR RESPONSE */}
      <div
        className={`flex flex-col min-h-0 transition-all duration-300 ease-in-out ${isFullscreen ? 'flex-1 mt-4 overflow-hidden' : ''}`}
      >
        {/* AI GENERATION */}
        <div
          className={` mt-2 rounded-xl bg-gray-100 transition-all duration-300 ease-in ${
            response !== ''
              ? isFullscreen
                ? 'flex-1 overflow-y-auto p-4 scroller'
                : 'h-auto p-4 max-h-[600px] overflow-y-auto'
              : 'h-0 p-0'
          }`}
        >
          <AiText text={response} />
        </div>

        {/* RELATED FILES GRID */}
        {/* RELATED FILES GRID */}
        {relatedFiles.length > 0 && (
          <div
            className={`mt-4 border-t border-gray-200 pt-3 transition-all duration-500 ease-in-out flex-shrink-0 ${isFullscreen ? 'overflow-y-auto max-h-64' : ''}`}
          >
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Related Files
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {relatedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer bg-white shadow-sm"
                  onClick={() => {
                    // Potential future action: open file preview
                    console.log('Clicked file:', file.name);
                  }}
                >
                  <div className="mr-3 text-lg">{getFileIcon(file.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium text-gray-900 truncate"
                      title={file.name}
                    >
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {file.size}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* SEARCH FILES */}
        <div></div>
      </div>
    </div>
  );
};

export default Chatbot;
