import React from 'react';

export const WaitingPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="text-center text-white">
        <h1 className="mb-4 text-3xl font-bold">Connecting to Connectifi...</h1>
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-t-4 border-blue-500 border-opacity-25"></div>
        <p className="text-sm text-gray-500">
          Please wait, initializing the app.
        </p>
      </div>
    </div>
  );
};
