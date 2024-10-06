import './App.css';

function App() {
  const role = 'user'; // 여기서 role이 'user' 또는 'admin'으로 설정됩니다.

  return (
    <div className={role === 'user' ? 'mobile-container' : 'web-container'}>
      {role === 'user' ? '모바일 프레임' : '웹 프레임'}
    </div>
  );
}

export default App;
