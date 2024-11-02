import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const KakaoCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const hasFetched = useRef(false); // 중복 호출 방지

  useEffect(() => {
    if (hasFetched.current) return; // 이미 실행된 경우 종료
    hasFetched.current = true; // 첫 실행 후 true로 설정

    const existingToken = localStorage.getItem('access_token');
    if (existingToken) {
      navigate('/'); // 이미 로그인된 경우 메인 화면으로 이동
      return;
    }

    const queryParams = new URLSearchParams(location.search);
    const authCode = queryParams.get('code');

    if (authCode) {
      console.log('인가 코드:', authCode);
      setIsLoading(true); // 로딩 시작
      handleAuthCode(authCode);
    } else {
      console.log('인가 코드가 없습니다.');
    }
  }, [location, navigate]);

  const handleAuthCode = async (authCode) => {
    try {
      const response = await fetch('http://3.37.122.192:8000/api/auth/login/kakao/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: authCode }),
      });


      const result = await response.json() 

      if (response.status === 200) {
        console.log('액세스 토큰:', result.access_token); 
        localStorage.setItem('access_token', result.access_token);
        navigate('/'); // 메인 화면으로 이동
      } else {
        console.error('토큰 요청 실패:', result); // JSON이 아닌 경우 텍스트 형태로 출력
      }
    } catch (error) {
      console.error('오류 발생:', error);
    } finally {
      setIsLoading(false); // 로딩 완료
    }
  };

  return (
    <div className="kakao-callback">
      <div className="spinner"></div> {/* 항상 스피너만 표시 */}
    </div>
  );
};

export default KakaoCallback;
