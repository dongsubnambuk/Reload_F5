import React from 'react';
import kakao from '../images/kakao_login_large_wide.png';
import '../CSS/KakaoLogin.css';

const handleKakaoLogin = () => {
  const clientId = process.env.REACT_APP_KAKAO_CLIENT_ID;
  const redirectUri = process.env.REACT_APP_KAKAO_REDIRECT_URI;

  const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;

  window.location.href = kakaoAuthUrl;
};

const KakaoLogin = () => {
  return (
    <div className="kakao-login">
      <img
        src={kakao}
        alt="카카오 로그인"
        onClick={handleKakaoLogin}
      />
    </div>
  );
};

export default KakaoLogin;
