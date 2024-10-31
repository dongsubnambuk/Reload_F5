import React from 'react';
import '../CSS/Mypage.css'; 
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';

const MyPage = () => {
    const navigate = useNavigate();
  return (
    <div className="my-page">
     <Header/>

    <div className='my-page-inner'>
    <div className="user-info">
          <div className="user-details">
            <h2 className="user-name">서동섭</h2>
            <p className="user-phone">010-3623-9285</p>
            <hr className="divider" /> {/* 번호 아래 구분선 */}
          </div>
          <div className="user-actions">
            <div className="refresh-section">
              <i className="fas fa-sync-alt refresh-icon"></i>
              <span className="refresh-text">새로고침</span>
            </div>
            <span 
              className="update-info-button" 
              onClick={() => navigate('/update-info')}
            >
              내정보 수정 &gt;
            </span> {/* 내정보 수정 버튼을 span으로 */}
          </div>
        </div>

      <section className="activity-section">
        <h3 className="section-title">활동 내역</h3>
        <div className="activity-item">
          <i className="fas fa-file-alt icon"></i>
          <div className="activity-details">
            <h4>주문 내역</h4>
            <p>내가 주문한 상품을 알고 싶다면?</p>
          </div>
          <button className="next-button">&gt;</button>
        </div>
        <div className="activity-item">
          <i className="fas fa-shipping-fast icon"></i>
          <div className="activity-details">
            <h4>수거 신청 내역</h4>
            <p>내가 신청한 수거 신청 내역을 알고 싶다면?</p>
          </div>
          <button className="next-button">&gt;</button>
        </div>
      </section>

      <section className="inquiry-section">
        <h3 className="section-title">문의/안내</h3>
        <div className="inquiry-item">
          <i className="fas fa-comments icon"></i>
          <div className="inquiry-details">
            <h4>채팅 상담</h4>
            <p>새로고침과 함께 지구를 지켜요!</p>
          </div>
          <button className="next-button">&gt;</button>
        </div>
        <div className="inquiry-item">
          <i className="fas fa-phone icon"></i>
          <div className="inquiry-details">
            <h4>전화 상담</h4>
            <p>정말 새로고침을 떠나실 건가요?</p>
          </div>
          <button className="next-button">&gt;</button>
        </div>
      </section>

      <section className="account-section">
        <h3 className="section-title">계정</h3>
        <div className="account-item">
          <i className="fas fa-sign-out-alt icon"></i>
          <div className="account-details">
            <h4>로그아웃</h4>
            <p>새로고침과 함께 지구를 지켜요!</p>
          </div>
          <button className="next-button">&gt;</button>
        </div>
        <div className="account-item">
          <i className="fas fa-user-times icon"></i>
          <div className="account-details">
            <h4>회원탈퇴</h4>
            <p>정말 새로고침을 떠나실 건가요?</p>
          </div>
          <button className="next-button">&gt;</button>
        </div>
      </section>
    </div>
    </div>
  );
};

export default MyPage;
