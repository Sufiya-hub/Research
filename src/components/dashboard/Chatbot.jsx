import React, { useEffect, useState } from 'react';
import { FaArrowUp } from 'react-icons/fa6';
import AiText from '../AiText';

const Chatbot = (userId) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');

  const sendQuery = () => {
    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    const raw = JSON.stringify({
      query,
      user_id: userId,
    });
    console.log({ userId });
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow',
    };

    fetch('http://127.0.0.1:8000/api/v1/query', requestOptions)
      .then((response) => response.text())
      .then((result) => {
        console.log(result);
        const parserdResult = JSON.parse(result);
        setResponse(parserdResult?.answer);
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => console.log(response), [response]);

  return (
    <div className="bg-white p-4 shadow-sm border border-gray-200 rounded-xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendQuery();
        }}
        className="flex justify-between items-center bg-gray-100 px-4 py-1 border border-gray-300 rounded-full"
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
      <div>
        {/* AI GENERATION */}
        <div
          className={`rounded-xl bg-gray-100 h-0 transition-all duration-300 ease-in p-0 mt-2 ${
            response !== '' ? 'h-auto p-4' : 'h-0 p-0'
          }`}
        >
          <AiText text={response} />
        </div>
        {/* SEARCH FILES */}
        <div></div>
      </div>
    </div>
  );
};

export default Chatbot;
