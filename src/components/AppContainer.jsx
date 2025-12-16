// src/components/AppContainer.jsx (NEW FILE)
// This file manages the view state between Login and Register

'use client';

import React, { useState } from 'react';
import Login from './Login'; // Assuming you put the updated Login component here
import Register from './Register'; // Assuming you put the Register component here

const AppContainer = () => {
  // State to track the current view: 'login' or 'register'
  const [currentView, setCurrentView] = useState('login');

  const navigateToLogin = () => setCurrentView('login');
  const navigateToRegister = () => setCurrentView('register');

  return (
    // The main container component that switches the view
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 text-gray-900">
      {/* Render Login or Register based on state */}
      {currentView === 'login' ? (
        <Login onNavigateToRegister={navigateToRegister} />
      ) : (
        <Register onNavigateToLogin={navigateToLogin} />
      )}
    </div>
  );
};

export default AppContainer;

// NOTE: You would use <AppContainer /> in your main page file (e.g., src/app/login/page.js)
