import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import { useEffect, useState } from 'react';
import SignupPage from './pages/SignupPage';

function App() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

  return (
    <div className={role === 'admin' ? 'web-container' : 'mobile-container'}>
      <Router>
        <Routes>
          {role === 'admin' ? (
           <Route 
           path="/admin-main" 
           element={
             <div>
               <h2>관리자 메인 페이지</h2>

               <p>여기에 관리자 기능 및 내용을 추가하세요.</p>
             </div>
           } 
         />
          ) : (
            <>
              <Route path="/" element={<MainPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </>
          )}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
