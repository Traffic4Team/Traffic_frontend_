import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ErrorMessage from '../common/ErrorMessage/ErrorMessage';
import  '../../assets/css/user.css';
import '@fortawesome/fontawesome-free/css/all.css';
import { AuthContext } from '../../context/AuthContext';
import UserButton from './userbutton';
import axiosInstance from '../../utils/axiosInstance';

function User() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [travelPlans, setTravelPlans] = useState([]);
  const [travelPlan, setTravelPlan] = useState(null);
  const [editableUserInfo, setEditableUserInfo] = useState(null);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);
  const [travelPlanId, setTravelPlanId] = useState(null);
  const [loading, setLoading] = useState(false);
  const { clearAuth } = useContext(AuthContext);
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    const loadGoogleMapsApi = () => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.addEventListener('load', initMap);
      document.body.appendChild(script);
    };

    loadGoogleMapsApi();

    return () => {
      const script = document.querySelector('script[src^="https://maps.googleapis.com/maps/api/js"]');
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const initMap = () => {
    if (!mapRef.current) return;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: { lat: 37.5, lng: 127.0 },
      zoom: 10,
    });

    setMap(mapInstance);
  };

  useEffect(() => {
    if (userId) {
      fetchUserInfo();
    }
  }, [userId]);

  const fetchUserInfo = async () => {
    if (!userId) return;

    try {
      const response = await axiosInstance.get(`/user/${userId}`);
      if (response.status === 200) {
        setUserInfo(response.data.data);
        setEditableUserInfo(response.data.data);

        const travelPlansResponse = await axiosInstance.get(`/user/${userId}/travel-plans`);
        setTravelPlans(travelPlansResponse.data.data);
      } else {
        setError('유저 정보 조회 실패');
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      setError('유저 정보 조회 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    if (map && travelPlan?.travelBasket?.basketItems) {
      displayMarkers(travelPlan.travelBasket.basketItems);
    }
  }, [map, travelPlan]);

  const fetchTravelPlan = async (userId, travelPlanId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(`/user/${userId}/travel-plans/${travelPlanId}`);
      console.log('여행 계획 조회 성공:', response.data);
      setTravelPlan(response.data.data);
      
      // 지도에 마커 표시
      if (map && response.data.data.travelBasket.basketItems) {
        displayMarkers(response.data.data.travelBasket.basketItems);
      }
    } catch (error) {
      console.error('여행 계획 조회 중 오류 발생:', error);
      setError('여행 계획 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const displayMarkers = (basketItems) => {
    if (!map || !basketItems.length) return;

    const bounds = new window.google.maps.LatLngBounds();
    const markers = [];

    basketItems.forEach((item) => {
      if (item.lat && item.lng) {
        const position = new window.google.maps.LatLng(item.lat, item.lng);
        const marker = new window.google.maps.Marker({
          map: map,
          position: position,
          title: item.title,
        });

        bounds.extend(position);
        markers.push(marker);

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div>
              <h3>${item.title}</h3>
              <p>${item.address}</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      }
    });

    // 모든 마커의 중앙값 계산
    if (markers.length > 0) {
      map.fitBounds(bounds);
      map.setCenter(bounds.getCenter());
    }
  };

  const handleTravelPlanClick = (planId) => {
    setTravelPlanId(planId);
  };

  const handleDeleteTravelPlan = async (planId, title) => {
    const isConfirmed = window.confirm(`정말로 "${title}" 여행 계획을 삭제하시겠습니까?`);

    if (!isConfirmed) return;

    setLoading(true);
    try {
      const response = await axiosInstance.delete(`/user/${userId}/travel-plans/${planId}`);
      if (response.status === 200) {
        setTravelPlans(travelPlans.filter(plan => plan.id !== planId));
        setTravelPlan(null);
        console.log('여행 계획 삭제 성공:', response.data);
      }
    } catch (error) {
      console.error('여행 계획 삭제 중 오류 발생:', error);
      setError('여행 계획 삭제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setEditableUserInfo((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleLogout = () => {
    const userName = userInfo ? userInfo.name : '사용자';
    
    localStorage.removeItem("bbs_access_token");
    localStorage.removeItem("id");
    clearAuth(); 
    alert(`${userName}님, 성공적으로 로그아웃 됐습니다 🔒`);
    navigate("/login");
  };

  return (
    <div className="main-container">
      {error && (
        <>
          <ErrorMessage message={error} />
          <button className="logout-button" onClick={handleLogout}>로그아웃</button>
        </>
      )}
      {loading && <p className="loading">로딩 중...</p>}
      {userInfo ? (
        <div>
          <h2 className="header">유저 정보</h2>
          <div className="user-info">
            <label>
              이메일:
              <input type="text" name="email" value={editableUserInfo?.email || ''} disabled />
            </label>
            <label>
              이름:
              <input type="text" name="name" value={editableUserInfo?.name || ''} onChange={handleInputChange} />
            </label>
            <label>
              ID:
              <input type="text" name="id" value={editableUserInfo?.id || ''} disabled />
            </label>
          </div>

          <button className="logout-button" onClick={handleLogout}>
            로그아웃
          </button>

          <h2 className="header">여행 계획 목록</h2>
          <ul className="travel-plan-list">
            {travelPlans.length ? (
              travelPlans.map((plan) => (
                <li key={plan.id} className="travel-plan-item">
                  <UserButton
                    title={plan.title}
                    content={plan.content}
                    onClick={() => handleTravelPlanClick(plan.id)}
                  />
                  <span
                    className="delete-button"
                    onClick={() => handleDeleteTravelPlan(plan.id, plan.title)}
                    aria-label="Delete Travel Plan"
                  >
                    <i className="fas fa-times"></i>
                  </span>
                  <span> ({new Date(plan.createdAt).toLocaleDateString()})</span>
                </li>
              ))
            ) : (
              <p>여행 계획이 없습니다.</p>
            )}
          </ul>

          <h2 className="header">여행 계획 세부 정보</h2>
      {travelPlan ? (
        <div>
          <h3>{travelPlan.title}</h3>
          <p>{travelPlan.content}</p>
          <p>생성일: {new Date(travelPlan.createdAt).toLocaleDateString()}</p>
          <div ref={mapRef} className="map-container"></div>
          <h4>여행 바스켓</h4>
          <ul>
            {travelPlan.travelBasket?.basketItems.length ? (
              travelPlan.travelBasket.basketItems.map((item) => (
                <li key={item.id} className="basket-item">
                  <h5 className="basket-item-title">{item.title}</h5>
                  <p>{item.address}</p>
                  <p>Rating: {item.rating}</p>
                  <p>위도: {item.lat}, 경도: {item.lng}</p>
                </li>
              ))
            ) : (
              <p>여행 바스켓에 아이템이 없습니다.</p>
            )}
          </ul>
        </div>
        ) : (
          <p>여행 계획을 선택해주세요.</p>
        )}
          </div>
        ) : (
          <p>유저 정보를 불러오는 중입니다...</p>
        )}
    </div>
  );
}

export default User;