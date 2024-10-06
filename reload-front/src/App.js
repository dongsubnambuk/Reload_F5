import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';

function App() {
  const role = 'user'; // 여기서 role이 'user' 또는 'admin'으로 설정됩니다..

  return (
    <div className={role === 'user' ? 'mobile-container' : 'web-container'}>
      <Router>
        <Routes>
          {role === 'user' ? (
            <Route path="/" element={<MainPage />} />
          ) : (
          <div>관리자</div>
          )}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
