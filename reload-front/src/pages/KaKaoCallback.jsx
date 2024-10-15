// KakaoCallback.jsx
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const KakaoCallback = () => {
  const location = useLocation();

  useEffect(() => {
    // URL에서 쿼리 파라미터로 인가 코드 추출
    const queryParams = new URLSearchParams(location.search);
    const authCode = queryParams.get('code'); // 인가 코드

    if (authCode) {
      console.log('인가 코드:', authCode); // 콘솔에 인가 코드 출력
      // 인가 코드를 백엔드 API에 전송하는 함수 호출
      handleAuthCode(authCode);
    } else {
      console.log('인가 코드가 없습니다.');
    }
  }, [location]);

  const handleAuthCode = async (authCode) => {
    try {
      const response = await fetch('http://localhost:10000/api/auth/login/kakao/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: authCode }), // 인가 코드를 백엔드로 전송
      });

      const result = await response.json();

      if (response.ok) {
        console.log('액세스 토큰:', result.access_token); // 받은 액세스 토큰 출력
        // 토큰을 로컬 스토리지에 저장하거나 상태 관리
        localStorage.setItem('access_token', result.access_token);
        // 추가적인 사용자 정보 처리 로직을 여기에 추가할 수 있습니다.
      } else {
        console.error('토큰 요청 실패:', result);
      }
    } catch (error) {
      console.error('오류 발생:', error);
    }
  };

  return (
    <div>
      <h1>카카오 로그인 성공</h1>
      <p>인가 코드가 콘솔에 출력되었습니다.</p>
    </div>
  );
};

export default KakaoCallback;
