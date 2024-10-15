import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css'; // Swiper 기본 CSS
import 'swiper/css/navigation'; // Navigation 모듈의 CSS
import 'swiper/css/pagination'; // Pagination 모듈의 CSS
import '../CSS/MainPage.css'; // MainPage 관련 CSS
import Header from '../components/Header';
import { Navigation, Pagination, Autoplay } from 'swiper/modules'; // 모듈을 swiper/modules에서 가져오기
import { Input } from 'antd'; // Ant Design의 Input 모듈을 가져오기

const { Search } = Input;

const MainPage = () => {
    const onSearch = (value) => console.log(value); // 검색창에서 입력된 값을 처리하는 함수

    return (
        <>
            <Header />
            <div className="swiper-container">
                <Swiper
                    spaceBetween={50}
                    slidesPerView={1}
                    navigation
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 3000, disableOnInteraction: false }}
                    modules={[Navigation, Pagination, Autoplay]}
                    style={{ height: '23vh' }}
                >
                    <SwiperSlide className="slide-content">
                        1
                    </SwiperSlide>
                    <SwiperSlide className="slide-content">
                        2
                    </SwiperSlide>
                    <SwiperSlide className="slide-content">
                        3
                    </SwiperSlide>
                    <SwiperSlide className="slide-content">
                        4
                    </SwiperSlide>
                </Swiper>
            </div>


            <div className="search-container">
                <div className="search-box">
                    <Search
                        placeholder="검색어를 입력하세요"
                        enterButton="검색"
                        size="large"
                        onSearch={onSearch} // 검색 버튼 클릭 시 실행될 함수
                    />
                </div>
            </div>
        </>
    );
};

export default MainPage;
