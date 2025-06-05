// c:\Users\misba\OneDrive\Documents\workopoly1_proj\frontend\src\index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css'; // Make sure this path is correct
import { AuthProvider } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Your Google Client ID
const GOOGLE_CLIENT_ID = "601186003853-v1iqc2a4tpvr5dmm5jdod70qvnjh19s8.apps.googleusercontent.com";

const container = document.getElementById('root');
const root = createRoot(container); // Use createRoot

root.render(
  <React.StrictMode>
    {/* Wrap AuthProvider with GoogleOAuthProvider */}
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
