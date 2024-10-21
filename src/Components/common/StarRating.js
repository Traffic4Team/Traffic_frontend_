// StarRating.js
import React from 'react';
import PropTypes from 'prop-types';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa'; // 별 아이콘 사용

const StarRating = ({ rating, size = 20 }) => {
  // 평점을 반올림하여 5점 만점으로 나누기
  const roundedRating = Math.round(rating * 2) / 2;

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        stars.push(<FaStar key={i} color="#ffc107" size={size} />); // 꽉 찬 별
      } else if (i - 0.5 === roundedRating) {
        stars.push(<FaStarHalfAlt key={i} color="#ffc107" size={size} />); // 반 별
      } else {
        stars.push(<FaRegStar key={i} color="#ffc107" size={size} />); // 빈 별
      }
    }
    return stars;
  };

  return <div className="star-rating">{renderStars()}</div>;
};

StarRating.propTypes = {
  rating: PropTypes.number.isRequired,
  size: PropTypes.number,
};

export default StarRating;
