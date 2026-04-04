'use client';

import React, { useState, useEffect, useRef } from 'react';
import AiText from '../AiText';
import { FaUser, FaRobot } from 'react-icons/fa6';

const SummarizationHistory = () => {
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchHistories = async () => {
      try {
        const res = await fetch('/api/ai/summarizations');
        if (res.ok) {
          const data = await res.json();
          // The API returns desc (newest first). Let's reverse it to show chronologically if we want a chat feel,
          // or keep newest first and user scrolls down. Standard chat has newest at bottom.
          setHistories(data.reverse());
        }
      } catch (e) {
        console.error('Failed to fetch summarization histories:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchHistories();
  }, []);

  useEffect(() => {
    // Scroll to bottom when histories load
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [histories]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-3"></div>
          <p className="text-gray-500 font-medium">Loading History...</p>
        </div>
      </div>
    );
  }

  if (histories.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 h-full bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="text-center">
          <FaRobot className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Summarizations Yet
          </h3>
          <p className="text-gray-500">
            Use the smart search in your dashboard to generate AI insights, and
            they will appear here.
          </p>
        </div>
      </div>
    );
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-xl overflow-hidden shadow-sm border border-gray-200">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-lg">
            <FaRobot className="text-green-600 w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Summarization History
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Your previous Smart AI queries
            </p>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth scroller"
      >
        {histories.map((history) => (
          <div
            key={history.id || history.createdAt}
            className="flex flex-col space-y-4"
          >
            {/* User Query (Right Aligned) */}
            <div className="flex items-end justify-end gap-2">
              <div className="flex flex-col items-end max-w-[85%] md:max-w-[70%]">
                <span className="text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1 tracking-wider">
                  {formatTime(history.createdAt)}
                </span>
                <div className="bg-green-600 text-white px-5 py-3 rounded-2xl rounded-tr-sm shadow-sm border border-green-700">
                  <p className="text-sm font-medium leading-relaxed">
                    {history.query}
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shadow-sm shrink-0">
                <FaUser className="text-gray-500 text-xs" />
              </div>
            </div>

            {/* AI Response (Left Aligned) */}
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-green-100 border border-green-200 flex items-center justify-center shadow-sm shrink-0 mt-4">
                <FaRobot className="text-green-600 text-sm" />
              </div>
              <div className="flex flex-col items-start max-w-[90%] md:max-w-[80%]">
                <div className="bg-white px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm border border-gray-200">
                  <AiText text={history.response} />
                </div>
              </div>
            </div>

            <div className="border-b border-gray-100/50 w-full pt-2"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SummarizationHistory;
