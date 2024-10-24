import React from 'react';
import '../../../assets/css/TravelPlanDetails.css';
import StarRating from '../../common/StarRating';

const TravelPlanDetails = ({ travelPlan, basketItemImages, rating }) => {
  if (!travelPlan) {
    return (
      <div className="empty-message">
        <p>여행 계획을 선택해주세요.</p>
      </div>
    );
  }

  return (
    <div className="travel-details-container">
      <div className="travel-details-header">
        <h3 className="travel-details-title">{travelPlan.title}</h3>
        <p className="travel-details-content">{travelPlan.content}</p>
        <p className="travel-details-date">
          생성일: {new Date(travelPlan.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div>
        <h4 className="basket-section-title">여행 바스켓</h4>
        {travelPlan.travelBasket?.basketItems.length ? (
          <div className="basket-grid">
            {travelPlan.travelBasket.basketItems.map((item) => (
              <div key={item.id} className="basket-item-card">
                <div className="basket-item-image">
                  <img
                    src={basketItemImages[item.id] || '/api/placeholder/400/320'}
                    alt={item.title}
                  />
                </div>
                <div className="basket-item-content">
                  <h4 className="basket-item-title" title={item.title}>
                    {item.title}
                  </h4>
                  <StarRating rating={item.rating} size={14} />
                  <p className="basket-item-address" title={item.address}>
                    {item.address}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-message">
            여행 바스켓에 아이템이 없습니다.
          </p>
        )}
      </div>
    </div>
  );
};

export default TravelPlanDetails;