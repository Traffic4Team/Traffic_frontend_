import React from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import Sidebar from './Components/app/Sidebar';
import Router from "./Components/router/Router";
import { AuthProvider } from "./context/AuthContext";
import { DateProvider } from './context/DateContext'; // 경로 수정
import "./App.css";

const AppContent = () => {
  const location = useLocation();
  
  const hideLayout = ["/"]; // 숨기고 싶은 경로 추가
  

  return (
    <div className="app-container">
      {!hideLayout.includes(location.pathname) && (
        <div className="sidebar">
          <Sidebar />
        </div>
      )}
      <div
        className="main-content"
        style={{ 
          marginLeft: hideLayout.includes(location.pathname) ? '0' : '200px', // 조건부로 margin-left 설정
          padding: hideLayout.includes(location.pathname) ? '0' : '20px' // 조건부로 padding 설정
        }}
      >
        <Router />
      </div>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DateProvider>
          <AppContent />
        </DateProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
