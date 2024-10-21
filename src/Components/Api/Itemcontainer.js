import React from 'react';
import '../../assets/css/Itemcontainer.css';
import StarRating from '../common/StarRating';

function Itemcontainer({ title, image, onClick, rating, address, websiteUrl }) {

    return (
        <div className="container" onClick={onClick}> 
            <div className="image-container">
                <img
                    alt="img"
                    aria-hidden="true"
                    src={image}
                />
            </div>
            <div className="text-container">
                <div className="title" title={title}>
                    <h4>{title}</h4>
                </div>
                <div className="location">
                    <StarRating rating={rating} size={14} />
                    <h4>주소: {address}</h4>
                    {websiteUrl && (
                        <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
                        웹사이트 방문하기
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Itemcontainer;
