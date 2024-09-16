import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
const backendURL=process.env.REACT_APP_BACKEND_URL;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

