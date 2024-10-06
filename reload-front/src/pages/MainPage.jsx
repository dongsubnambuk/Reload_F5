import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css'; // Swiper 기본 CSS
import 'swiper/css/navigation'; // Navigation 모듈의 CSS
import 'swiper/css/pagination'; // Pagination 모듈의 CSS
import '../CSS/MainPage.css';
import { Navigation, Pagination, Autoplay } from 'swiper/modules'; // 모듈을 swiper/modules에서 가져오기

const MainPage = () =>{

    return(
        <>
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
        </>
    );
};

export default MainPage;