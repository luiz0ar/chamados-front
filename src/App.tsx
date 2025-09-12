import React from 'react';
import { AppRoutes } from './routes';
import { ToastContainer } from 'react-toastify';
import { Tooltip } from 'react-tooltip';
import 'react-toastify/dist/ReactToastify.css';
import 'react-tooltip/dist/react-tooltip.css';

function App() {
  return (
    <React.StrictMode>
      <AppRoutes />
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <Tooltip id="app-tooltip" /> 
    </React.StrictMode>
  );
}

export default App;
