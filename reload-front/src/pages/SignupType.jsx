import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import kakaoStart from '../images/kakao_signup_large_wide.png';
import Header from '../components/Header';
import logo from '../images/Logo.png';

const SignupType = () => {
    const [activeTab, setActiveTab] = useState("personal");
    const navigate = useNavigate();

    useEffect(() => {
        // 환경 변수로부터 키를 가져와 Kakao SDK 초기화
        if (!window.Kakao.isInitialized()) {
            window.Kakao.init(process.env.REACT_APP_KAKAO_KEY);
            console.log("Kakao SDK initialized with key:", process.env.REACT_APP_KAKAO_KEY);
        }
    }, []);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const handleKakaoSignup = () => {
        window.Kakao.Auth.authorize({
            redirectUri: 'http://localhost:3000/kakao/callback'
        });
    };

    return (
        <div className="social-login-container">
            <Header />
            <img src={logo} className='signup-type-logo' alt="로고" />
            <div className="tab-buttons">
                <button 
                    className={`tab-button ${activeTab === "personal" ? "active" : ""}`}
                    onClick={() => handleTabClick("personal")}
                >
                    일반 회원
                </button>
                <button 
                    className={`tab-button ${activeTab === "business" ? "active" : ""}`}
                    onClick={() => handleTabClick("business")}
                >
                    관리자
                </button>
            </div>

            <div className="social-login-content">
                {activeTab === "personal" && (
                    <>
                        <div className="login-title">소셜 계정으로 간편 회원가입</div>
                        <div className="social-buttons">
                            <img
                                src={kakaoStart}
                                alt="카카오 회원가입"
                                onClick={handleKakaoSignup}
                                className="kakao-signup-button"
                            />
                        </div>
                        <button className="create-account-button" onClick={() => navigate("/signup")}>
                            RELOAD 통합 아이디 만들기
                        </button>
                        <div className="login-footer">
                            이미 계정이 있나요? <Link to="/login" className='login-link'>로그인</Link>
                        </div>
                    </>
                )}
                {activeTab === "business" && (
                    <div className="business-login">
                        서비스 준비 중입니다.
                    </div>
                )}
            </div>
        </div>
    );
};

export default SignupType;
