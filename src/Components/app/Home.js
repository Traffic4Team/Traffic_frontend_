import React, { useEffect } from 'react';
import Swiper from 'swiper/bundle'; // Import Swiper and necessary styles
import 'swiper/swiper-bundle.css'; // Import Swiper styles
import '../../assets/css/Home.css'; // Import your CSS file
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const navigator= useNavigate();

  const handleClick = () => {
    navigator('/login');
};

  useEffect(() => {
    const swiper = new Swiper('.swiper-container', {
      direction: 'vertical',
      effect: 'fade',
      speed: 1000,
      loop: true,
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      mousewheel: {
        invert: false,
        forceToAxis: false,
        thresholdDelta: 50,
        sensitivity: 1,
      },
      on: {
        slideChange: function () {
          this.slides.forEach((slide) => {
            let background = slide.querySelector('.background');
            if (background) {
              background.classList.remove('animation');
            }
          });
          let activeSlide = this.slides[this.activeIndex];
          let background = activeSlide.querySelector('.background');
          if (background) {
            background.classList.add('animation');
          }
        },
      },
    });

    return () => {
      if (swiper) swiper.destroy(); // Cleanup on component unmount
    };
  }, []);

  return (
    <div className="swiper-container">
      <div className="swiper-wrapper">
        {[
          {
            dataItem: 'one',
            background: 'https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/dd28eb02-d6b1-401e-bc10-aead024e9ebf',
          },
          {
            dataItem: 'two',
            background: 'https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/fc70e01c-17f9-4e74-a967-f039285524c5',
          },
          {
            dataItem: 'three',
            background: 'https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/4e3edcf1-1b68-408f-87e2-ee9fd477bf87',
          },
          {
            dataItem: 'four',
            background: 'https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/b772933f-6340-4c95-8d06-d809c4c9b739',
          },
          {
            dataItem: 'five',
            background: 'https://github.com/ecemgo/mini-samples-great-tricks/assets/13468728/9f0fab6b-c28d-47e9-80f0-868e00562c3f',
          },
        ].map((slide, index) => (
          <div className="swiper-slide" key={index}>
            <div className="white-container">
              <h1>Traffic</h1>
              <button className="start-button" onClick={handleClick}>시작하기</button>
            </div>
            <div className="content" data-content={slide.dataItem}>
              <h1>{slide.title}</h1>
              <p>{slide.content}</p>
              <Link to="/Login" className="login-button">
                Go to Login
              </Link>
            </div>
            <div
              className="background"
              data-item={slide.dataItem}
              style={{
                backgroundImage: `url(${slide.background})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            ></div>
          </div>
        ))}
      </div>
      <div className="swiper-pagination"></div>
      <a
        href="https://www.youtube.com/@ecemgokdogan/videos"
        target="_blank"
        rel="noopener noreferrer"
        className="logo"
      >
        <img
          src="https://assets.codepen.io/9868786/youtube.webp"
          alt="HTML tutorial"
        />
      </a>
    </div>
  );
};

export default Home;
