import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // AuthContext를 가져옵니다.
import '../../assets/css/PlannerPage.css';
import Planner from './Planner';
import axios from 'axios';

const PlannerPage = () => {
  const location = useLocation();
  const hotels = location.state?.hotels || [];
  const { auth, tokens } = useAuth();  
  const [map, setMap] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [routeInfo, setRouteInfo] = useState([]);
  const [title, setTitle] = useState(''); 
  const [content, setContent] = useState('');
  

  // 중심 좌표 계산
  const center = {
    lat: hotels.length > 0
      ? hotels.reduce((sum, hotel) => sum + hotel.lat, 0) / hotels.length
      : 37.5,
    lng: hotels.length > 0
      ? hotels.reduce((sum, hotel) => sum + hotel.lng, 0) / hotels.length
      : 127.0,
  };

  // 지도 및 DirectionsService, DirectionsRenderer 인스턴스 생성
  useEffect(() => {
    if (!window.google) return;

    const container = document.createElement('div');
    container.id = 'map';
    const mapContainer = document.getElementById('map-container');

    if (mapContainer) {
      mapContainer.appendChild(container);
    }

    const mapInstance = new window.google.maps.Map(container, {
      center: center,
      zoom: 11,
      mapId: '92cb7201b7d43b21',
      disableDefaultUI: true,
      clickableIcons: false,
      minZoom: 10,
      maxZoom: 18,
      gestureHandling: 'greedy',
    });

    const directionsServiceInstance = new window.google.maps.DirectionsService();
    const directionsRendererInstance = new window.google.maps.DirectionsRenderer({
      map: mapInstance,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#0000FF',
        strokeOpacity: 0.7,
        strokeWeight: 5,
      },
    });

    setMap(mapInstance);
    setDirectionsService(directionsServiceInstance);
    setDirectionsRenderer(directionsRendererInstance);

    return () => {
      if (mapContainer && container.parentNode) {
        mapContainer.removeChild(container);
      }
    };
  }, []); // 빈 의존성 배열로 인해 컴포넌트가 마운트될 때만 실행

  // 마커 업데이트
  useEffect(() => {
    if (!map || hotels.length === 0) return;

    if (map.markers) {
      map.markers.forEach(marker => marker.setMap(null));
    }

    const updateMarkers = async () => {
      const markers = await Promise.all(hotels.map(async (hotel, index) => {
        const position = { lat: hotel.lat, lng: hotel.lng };

        let icon;
        if (hotel.types.includes('lodging')) {
          icon = 'https://img.icons8.com/?size=100&id=bc9PfkZ8cbJC&format=png&color=000000'; // 숙소 아이콘
        } else if(hotel.types.includes('restaurant')) { 
          icon = 'https://img.icons8.com/?size=100&id=lq7Ugy76e18x&format=png&color=000000'; // 레스토랑 아이콘
        } else if(hotel.types.includes('tourist_attraction')) { 
          icon = 'https://img.icons8.com/?size=100&id=s8WkcTNjgu5O&format=png&color=000000'; // 관광지 아이콘
        }

        const marker = new window.google.maps.Marker({
          position,
          map: map,
          title: hotel.title,
          icon: {
            url: icon, 
            scaledSize: new window.google.maps.Size(32, 32), // 아이콘 크기를 원하는 크기로 조절 (width, height)
          },
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div>
              <h3>${hotel.title}</h3>
              <p>${hotel.address}</p>
            </div>
          `,
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        return marker;
      }));

      map.markers = markers;

      // restaurant 유형의 장소만 필터링하여 경로 그리기
      const restaurantHotels = hotels.filter(hotel =>
        hotel.types.includes('restaurant') && !hotel.types.includes('lodging') || hotel.types.includes('tourist_attraction')
      );

      if (restaurantHotels.length > 1 && directionsService && directionsRenderer) {
        const waypoints = restaurantHotels.slice(1, -1).map(hotel => ({
          location: new window.google.maps.LatLng(hotel.lat, hotel.lng),
          stopover: true,
        }));

        const request = {
          origin: new window.google.maps.LatLng(restaurantHotels[0].lat, restaurantHotels[0].lng),
          destination: new window.google.maps.LatLng(restaurantHotels[restaurantHotels.length - 1].lat, restaurantHotels[restaurantHotels.length - 1].lng),
          waypoints: waypoints,
          optimizeWaypoints: true,
          travelMode: 'DRIVING',
        };

        directionsService.route(request, (result, status) => {
          if (status === 'OK') {
            directionsRenderer.setDirections(result);

            const routeLegs = result.routes[0].legs;
            const newRouteInfo = routeLegs.map((leg, index) => ({
              start: leg.start_address,
              end: leg.end_address,
              distance: leg.distance.text,
              duration: leg.duration.text,
            }));

            setRouteInfo(newRouteInfo);
          } else {
            console.error('Directions request failed due to ' + status);
          }
        });
      }
    };

    updateMarkers();
  }, [map, hotels, directionsService, directionsRenderer]); // map, hotels, directionsService, directionsRenderer가 변경될 때만 실행

  // 팝업창 열기/닫기
  const handleTogglePopup = (hotel) => {
    setSelectedHotel(hotel);
    setShowPopup(prev => !prev); // 토글 기능
  };

  // 팝업창 닫기
  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedHotel(null);
  };

  useEffect(() => {
    if (selectedHotel) {
      console.log(selectedHotel);
    }
  }, [selectedHotel]);

  const renderHotelContainers = () => {
    // 조건에 맞는 호텔만 필터링합니다.
    const filteredHotels = hotels.filter(hotel => hotel.types.includes('lodging'));

    // 필터링된 호텔 컨테이너를 생성합니다.
    const hotelContainers = filteredHotels.map((hotel, index) => (
      <div key={index} className="hotel-container">
        <div className="hotel-title">
          <p>{index + 1}일차 숙소</p>
        </div>
        <Planner
          title={hotel.title}
          address={hotel.address}
          image={hotel.image}
          onClick={() => handleTogglePopup(hotel)} // 팝업을 열기 위한 함수 호출
        />
      </div>
    ));

    return hotelContainers;
  };


  const saveTravelPlan = async (event) => {
    event.preventDefault(); 

    const userId = localStorage.getItem('userId');
  
    if (!auth || !tokens.accessToken) {
      alert("로그인 상태가 아닙니다.");
      return;
    }
  
    const travelPlanData = {
      title, // Using user-input title
      content, // Using user-input content
      createdAt: new Date().toISOString(),
      travelBasket: {
        basketItems: hotels.map((hotel) => ({
          title: hotel.title,
          address: hotel.address,
          rating: hotel.rating || 0,
          imageUrl: hotel.imageUrl,
        })),
      },
    };
  
    try {
      const response = await axios.post(
        `http://ec2-43-203-192-225.ap-northeast-2.compute.amazonaws.com:8080/user/${userId}/travel-plans`,
        travelPlanData, // 전송할 데이터를 JSON 객체로 전송
        {
          headers: {
            'Authorization': `Bearer ${tokens.accessToken}`,
            'Content-Type': 'application/json', // 명시적으로 JSON 데이터 전송
          },
        }
      );
      console.log('Travel plan created successfully:', response.data);
    } catch (error) {
      console.error('Travel plan creation failed:', error);
      alert("여행 계획 생성 중 오류가 발생했습니다.");
    }
  };
  

  // 나머지 호텔 컨테이너 렌더링
  const renderRestaurantContainers = () => {
    // 레스토랑 타입의 호텔을 필터링합니다.
    const restaurantHotels = hotels.filter(hotel => 
      hotel.types.includes('restaurant') && !hotel.types.includes('lodging') || hotel.types.includes('tourist_attraction')
    );

    console.log("Filtered Restaurant Hotels:", restaurantHotels); // 필터링된 레스토랑 데이터 확인

    // 레스토랑 호텔 컨테이너를 생성합니다.
    return restaurantHotels.map((hotel, index) => {
      const distanceInfo = routeInfo[index]
        ? (
          <div className="route-info-between">
            <p>거리: {routeInfo[index].distance}</p>
            <p>소요 시간: {routeInfo[index].duration}</p>
          </div>
        )
        : null;

      return (
        <React.Fragment key={index}>
          <div className="restaurant-container">
            <div className="restaurant-title">
              <p>{hotel.title}</p>
            </div>
            <Planner
              title={hotel.title}
              address={hotel.address}
              image={hotel.image}
              onClick={() => handleTogglePopup(hotel)} // 팝업을 열기 위한 함수 호출
            />
          </div>
          {distanceInfo}
        </React.Fragment>
      );
    });
  };


  return (
    <div id="planner-page">
      <div id="map-container"></div>
      <div className="planner-page-container">
        {hotels.length > 0 ? (
          <>
           <div>
              <label>Title:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Content:</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
            <div className="section-wrapper">
            {/* 호텔 섹션 */}
            <div className="hotel-section">
              <h2>숙소</h2>
              <div className="hotel-container-wrapper">
                {renderHotelContainers()} {/* 호텔 컨테이너 렌더링 */}
              </div>
            </div>

            {/* 레스토랑 섹션 */}
            <div className="restaurant-section">
              <h2>레스토랑</h2>
              <div className="restaurant-container-wrapper">
                {renderRestaurantContainers()} {/* 레스토랑 컨테이너 렌더링 */}
              </div>
            </div>
          </div>
            {auth ? (
              <>
                <button onClick={saveTravelPlan} className="save-button">여행 계획 저장</button>
              </>
            ) : (
              <p>로그인 후에 여행 계획을 저장할 수 있습니다.</p>
            )}
          </>
        ) : (
          <p>호텔 데이터가 없습니다.</p>
        )}
      </div>

      {/* 팝업창 표시 */}
      {showPopup && selectedHotel && (
        <div className="popup">
          <div className="popup-content">
            <button className="close" onClick={handleClosePopup}>&times;</button>
            <h2>{selectedHotel.title}</h2>
            <img src={selectedHotel.image} alt={selectedHotel.title} />
            <p>{selectedHotel.address}</p>
            <p>전화번호: {selectedHotel.phone_number}</p>
            <p>평점: {selectedHotel.rating}</p>
            <p>홈페이지: <a href={selectedHotel.url} target="_blank" rel="noopener noreferrer">{selectedHotel.url}</a></p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlannerPage;