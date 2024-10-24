import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorMessage from '../../common/ErrorMessage/ErrorMessage';
import  '../../../assets/css/user.css';
import { AuthContext } from '../../../context/AuthContext';
import UserButton from './userbutton';
import axiosInstance from '../../../utils/axiosInstance';
import TravelPlanDetails from './TravelPlanDetails'; 

function User() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [travelPlans, setTravelPlans] = useState([]);
  const [travelPlan, setTravelPlan] = useState(null);
  const [editableUserInfo, setEditableUserInfo] = useState(null);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);
  const [travelPlanId, setTravelPlanId] = useState(null);
  const [loading, setLoading] = useState(true); // Set loading to true initially
  const { clearAuth } = useContext(AuthContext);
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [infoWindow, setInfoWindow] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [basketItemImages, setBasketItemImages] = useState({});

  // Google Maps 스크립트 로드
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (window.google) {
        setIsScriptLoaded(true);
        return;
      }
  
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB83KwdcIllEH5drsBvNExHL8vqEcEg9Fw&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsScriptLoaded(true);
      };
      script.onerror = () => {
        console.error('Google Maps 스크립트 로드 실패');
      };
      document.head.appendChild(script);
    };
  
    loadGoogleMapsScript();
  }, []);
  
  // 지도 초기화
  useEffect(() => {
    if (!isScriptLoaded || !mapRef.current) return;
  
    try {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: 37.5, lng: 127.0 },
        zoom: 10,
      });
  
      const infoWindowInstance = new window.google.maps.InfoWindow();
      setMap(mapInstance);
      setInfoWindow(infoWindowInstance);
  
    } catch (error) {
      console.error('Map initialization error:', error);
    }
  }, [isScriptLoaded]);

  useEffect(() => {
    const storedId = localStorage.getItem("userId");
    if (storedId) {
      setUserId(storedId);
    } else {
      setLoading(false); // ID가 없으면 로딩 상태 해제
      setError('사용자 ID를 찾을 수 없습니다.');
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchUserInfo = async () => {
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
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [userId]);

  const displayMarkers = useCallback((basketItems) => {
    if (!map || !basketItems?.length) {
      console.log('Map or basketItems not available:', { map, basketItemsLength: basketItems?.length });
      return;
    }
  
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]); 
    
    const newMarkers = [];
    const bounds = new window.google.maps.LatLngBounds();
    const placesService = new window.google.maps.places.PlacesService(map);
  
    const MARKER_ICONS = {
      lodging: {
        url: 'https://img.icons8.com/?size=100&id=bc9PfkZ8cbJC&format=png&color=000000',
        scaledSize: new window.google.maps.Size(32, 32)
      },
      restaurant: {
        url: 'https://img.icons8.com/?size=100&id=lq7Ugy76e18x&format=png&color=000000',
        scaledSize: new window.google.maps.Size(32, 32)
      },
      tourist_attraction: {
        url: 'https://img.icons8.com/?size=100&id=s8WkcTNjgu5O&format=png&color=000000',
        scaledSize: new window.google.maps.Size(32, 32)
      },
      default: {
        url: 'https://img.icons8.com/?size=100&id=s8WkcTNjgu5O&format=png&color=000000',
        scaledSize: new window.google.maps.Size(32, 32)
      }
    };
  
    const getMarkerIcon = (types) => {
      if (!types?.length) return MARKER_ICONS.default;
      
      for (const type of types) {
        if (MARKER_ICONS[type]) return MARKER_ICONS[type];
      }
      return MARKER_ICONS.default;
    };
  
    // InfoWindow 컨텐츠 생성 함수를 HTML 문자열로 유지
    const createInfoWindowContent = (item, photoUrl) => {
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        item.title + ' ' + item.address
      )}`;
  
      return `
        <div class="info-window-content" style="max-width: 300px; padding: 10px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${item.title}</h3>
          ${photoUrl ? 
            `<img src="${photoUrl}" style="width: 100%; height: 150px; object-fit: cover; margin: 8px 0; border-radius: 4px;">` 
            : ''}
          <p style="margin: 8px 0; font-size: 14px; color: #666;">${item.address || '주소 정보 없음'}</p>
          ${item.rating ? 
            `<p style="margin: 8px 0; font-size: 14px;">평점: ${item.rating}⭐</p>` 
            : ''}
          <button onclick="window.open('${googleMapsUrl}', '_blank')" 
            style="background-color: #4285f4; color: white; border: none; padding: 8px 16px; 
            border-radius: 4px; cursor: pointer; margin-top: 8px;">
            Google Maps에서 보기
          </button>
        </div>
      `;
    };
  
    basketItems.forEach(async (item) => {
      if (!item.lat || !item.lng) {
        console.log('Invalid coordinates for item:', item);
        return;
      }
  
      const position = {
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lng)
      };
  
      if (isNaN(position.lat) || isNaN(position.lng)) {
        console.log('Invalid coordinate parsing for item:', item);
        return;
      }
  
      const marker = new window.google.maps.Marker({
        position,
        map,
        title: item.title,
        icon: getMarkerIcon(item.types)
      });
  
      try {
        const request = {
          query: item.title,
          locationBias: position,
          fields: ['photos', 'name', 'formatted_address']
        };
  
        placesService.findPlaceFromQuery(request, (results, status) => {
          let photoUrl = '';
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results[0]?.photos) {
            try {
              photoUrl = results[0].photos[0].getUrl({
                maxWidth: 300,
                maxHeight: 200
              });
            } catch (error) {
              console.error('Error generating photo URL:', error);
            }
          }
  
          marker.addListener('click', () => {
            if (infoWindow) {
              infoWindow.setContent(createInfoWindowContent(item, photoUrl));
              infoWindow.open(map, marker);
            }
          });
        });
      } catch (error) {
        console.error('Error in Places API request:', error);
      }
  
      bounds.extend(position);
      newMarkers.push(marker);
    });
  
    setMarkers(newMarkers);
    
    if (newMarkers.length > 0) {
      try {
        map.fitBounds(bounds);
        map.setZoom(Math.min(15, map.getZoom()));
      } catch (error) {
        console.error('Error adjusting map bounds:', error);
      }
    }
  }, [map, infoWindow, markers, setMarkers]);

  const fetchPlaceImage = useCallback(async (item) => {
    if (!window.google || !map) return null;
    
    const placesService = new window.google.maps.places.PlacesService(map);
    
    return new Promise((resolve) => {
      const request = {
        query: item.title,
        locationBias: { lat: parseFloat(item.lat), lng: parseFloat(item.lng) },
        fields: ['photos', 'name']
      };

      placesService.findPlaceFromQuery(request, (results, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          results[0]?.photos
        ) {
          try {
            const photoUrl = results[0].photos[0].getUrl({
              maxWidth: 300,
              maxHeight: 200
            });
            resolve(photoUrl);
          } catch (error) {
            console.error('Error getting photo URL:', error);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    });
  }, [map]);

  useEffect(() => {
    if (!travelPlan?.travelBasket?.basketItems || !map) return;

    const fetchImages = async () => {
      const newImages = {};
      
      for (const item of travelPlan.travelBasket.basketItems) {
        const imageUrl = await fetchPlaceImage(item);
        if (imageUrl) {
          newImages[item.id] = imageUrl;
        }
      }
      
      setBasketItemImages(newImages);
    };

    fetchImages();
  }, [travelPlan, map, fetchPlaceImage]);

  useEffect(() => {
    if (map && travelPlan?.travelBasket?.basketItems) {
      displayMarkers(travelPlan.travelBasket.basketItems);
    }
  }, [map, travelPlan]);

  const fetchTravelPlan = async (userId, travelPlanId) => {
    if (!userId || !travelPlanId) return;
    
    setLoading(true);
    setError('');

    try {
      const response = await axiosInstance.get(`/user/${userId}/travel-plans/${travelPlanId}`);
      setTravelPlan(response.data.data);
      
      if (map && response.data.data.travelBasket?.basketItems) {
        displayMarkers(response.data.data.travelBasket.basketItems);
      }
    } catch (error) {
      console.error('여행 계획 상세 조회 중 오류 발생:', error);
      setError('여행 계획 상세 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // userId가 변경될 때 여행계획 목록 조회
  useEffect(() => {
    if (userId && travelPlanId) {
      fetchTravelPlan(userId, travelPlanId);
    }
  }, [userId, travelPlanId]);

  // travelPlanId가 변경될 때 상세 정보 조회
  useEffect(() => {
    if (userId && travelPlanId) {
      fetchTravelPlan(userId, travelPlanId);
    }
  }, [userId, travelPlanId]);

  // 여행계획 선택 핸들러
  const handleTravelPlanClick = (planId) => {
    setTravelPlanId(planId);
  };

  // 여행계획 삭제 핸들러
  const handleDeleteTravelPlan = async (planId, title) => {
    const isConfirmed = window.confirm(`정말로 "${title}" 여행 계획을 삭제하시겠습니까?`);
    if (!isConfirmed) return;

    setLoading(true);
    setError('');

    try {
      await axiosInstance.delete(`/user/${userId}/travel-plans/${planId}`);
      setTravelPlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));
      
      if (travelPlanId === planId) {
        setTravelPlan(null);
        setTravelPlanId(null);
      }
      
      alert('여행 계획이 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('여행 계획 삭제 중 오류 발생:', error);
      setError('여행 계획 삭제에 실패했습니다.');
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
      {loading ? (
        <p className="loading">유저 정보를 불러오는 중입니다...</p>
      ) : userInfo ? (
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
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24"
                      width="20" 
                      height="20"
                    >
                      <path
                        d="M6 6L18 18M6 18L18 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                  </span>
                  <span> ({new Date(plan.createdAt).toLocaleDateString()})</span>
                </li>
              ))
            ) : (
              <p>여행 계획이 없습니다.</p>
            )}
          </ul>

          <h2 className="header">여행 계획 세부 정보</h2>
            <TravelPlanDetails 
              travelPlan={travelPlan} 
              basketItemImages={basketItemImages}       />
              </div>
            ) : (
              <div>
                <p>유저 정보를 불러오는 중입니다...</p>
              </div>
            )}
            <div ref={mapRef} className="map-container"></div>
    </div>
  );
}

export default User;