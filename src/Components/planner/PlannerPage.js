import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // AuthContext를 가져옵니다.
import '../../assets/css/PlannerPage.css';
import Planner from './Planner';
import axios from 'axios';
import StarRating from '../common/StarRating';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { TbCircleNumber1Filled, TbCircleNumber2Filled, TbCircleNumber3Filled, TbCircleNumber4Filled, TbCircleNumber5Filled, TbCircleNumber6Filled, TbCircleNumber7Filled, TbCircleNumber8Filled, TbCircleNumber9Filled } from 'react-icons/tb';
import axiosInstance from '../../utils/axiosInstance';

const PlannerPage = () => {
  const location = useLocation();
  const { auth, tokens } = useAuth();  
  const [map, setMap] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [routeInfo, setRouteInfo] = useState([]);
  const [title, setTitle] = useState(''); 
  const [content, setContent] = useState('');
  const [placeDetails, setPlaceDetails] = useState({});
  const [containers, setContainers] = useState([]);
  const infoWindow = useMemo(() => new window.google.maps.InfoWindow(), []);

  const hotels = useMemo(() => location.state?.hotels || [], [location.state]);


  // 지도 및 DirectionsService, DirectionsRenderer 인스턴스 생성
  useEffect(() => {
    // 중심 좌표 계산
    const center = {
      lat: hotels.length > 0
        ? hotels.reduce((sum, hotel) => sum + hotel.lat, 0) / hotels.length
        : 37.5,
      lng: hotels.length > 0
        ? hotels.reduce((sum, hotel) => sum + hotel.lng, 0) / hotels.length
        : 127.0,
    };
    if (!window.google) return;

    const container = document.createElement('div');
    container.id = 'map';
    const mapContainer = document.getElementById('map-container');

    if (mapContainer) {
      mapContainer.appendChild(container);
    }

    const mapInstance = new window.google.maps.Map(container, {
      center: center,
      zoom: 10,
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
  }, [hotels]); // 빈 의존성 배열로 인해 컴포넌트가 마운트될 때만 실행

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
        } else{
          icon = 'https://img.icons8.com/?size=100&id=s8WkcTNjgu5O&format=png&color=000000'; // 기본
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

        const createInfoWindowContent = (hotel, details = {}) => {
          const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            hotel.title + ' ' + hotel.address
          )}`;

          const getRatingStars = (rating) => {
            if (!rating) return '';
            const fullStars = Math.floor(rating);
            const hasHalfStar = rating % 1 >= 0.5;
            const stars = '⭐'.repeat(fullStars) + (hasHalfStar ? '½' : '');
            return stars;
          };
        
          return `
            <div class="info-window">
              ${hotel.image ? `
                <div class="info-window__image-container">
                  <img class="info-window__image" src="${hotel.image}" alt="${hotel.title}"/>
                </div>
              ` : ''}
              
              <div class="info-window__content">
                <h3 class="info-window__title">${hotel.title}</h3>
                
                ${hotel.rating ? `
                  <div class="info-window__rating">
                    <div class="info-window__rating">
                    ${getRatingStars(hotel.rating)} (${hotel.rating})
                </div>
                  </div>
                ` : ''}
                
                <p class="info-window__address">${hotel.address}</p>
                
                ${hotel.phone_number ? `
                  <p class="info-window__phone">
                    📞 ${hotel.phone_number}
                  </p>
                ` : ''}
                
                <div class="info-window__buttons">
                  ${details?.website ? `
                    <a href="${details.website}" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       class="info-window__button info-window__button--website">
                      웹사이트
                    </a>
                  ` : ''}
                  
                  <a href="${googleMapsUrl}" 
                     target="_blank" 
                     rel="noopener noreferrer" 
                     class="info-window__button info-window__button--directions">
                    google
                  </a>
                </div>
              </div>
            </div>
          `;
        };
        
        // 마커 클릭 이벤트 리스너
        marker.addListener('click', async () => {
          try {
            let details = placeDetails[hotel.id];
            if (!details) {
              details = await fetchPlaceDetails(hotel.id);
            }
            const infoWindowContent = createInfoWindowContent(hotel, details);
            infoWindow.setContent(infoWindowContent);
            infoWindow.open(map, marker);
          } catch (error) {
            console.error('Error fetching place details:', error);
            // 에러가 발생해도 기본 정보는 표시
            const infoWindowContent = createInfoWindowContent(hotel, {});
            infoWindow.setContent(infoWindowContent);
            infoWindow.open(map, marker);
          }
        });

        return marker;
      }));

      map.markers = markers;

      // restaurant 유형의 장소만 필터링하여 경로 그리기
      const restaurantHotels = hotels.filter(hotel => 
        (hotel.types.includes('restaurant') && !hotel.types.includes('lodging')) || hotel.types.includes('tourist_attraction')
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
  const handleTogglePopup = async (hotel) => {
    setSelectedHotel(hotel);
    setShowPopup(prev => !prev);
  
    try {
      let details = placeDetails[hotel.id];
      if (!details) {
        details = await fetchPlaceDetails(hotel.id);
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
    }
  };

  // 팝업창 닫기
  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedHotel(null);
  };

  const handleClickOutsidePopup = (event) => {
    if (event.target.className === 'popup') {
      handleClosePopup(); // 팝업 닫기 함수 호출
    }
  };

  const fetchPlaceDetails = async (placeId) => {
    if (placeDetails[placeId]) {
      return placeDetails[placeId];
    }

    const service = new window.google.maps.places.PlacesService(map);
    return new Promise((resolve, reject) => {
      service.getDetails({ placeId }, (result, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setPlaceDetails(prev => ({
            ...prev,
            [placeId]: result
          }));
          resolve(result);
        } else {
          reject('장소 상세 정보 가져오기 실패');
        }
      });
    });
  };

  useEffect(() => {
    const lodgingPlaces = hotels.filter(place => place.types.includes('lodging'));
    const nonLodgingPlaces = hotels.filter(place => !place.types.includes('lodging'));

    const newContainers = lodgingPlaces.map((lodging, index) => ({
      id: `container-${index}`,
      lodging,
      places: index === 0 ? nonLodgingPlaces : []
    }));

    setContainers(newContainers);
  }, [hotels]);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceContainer = containers.find(c => c.id === source.droppableId);
      const destContainer = containers.find(c => c.id === destination.droppableId);
      const sourcePlaces = [...sourceContainer.places];
      const destPlaces = [...destContainer.places];
      const [removed] = sourcePlaces.splice(source.index, 1);
      destPlaces.splice(destination.index, 0, removed);

      setContainers(containers.map(container => {
        if (container.id === source.droppableId) {
          return { ...container, places: sourcePlaces };
        }
        if (container.id === destination.droppableId) {
          return { ...container, places: destPlaces };
        }
        return container;
      }));
    } else {
      const container = containers.find(c => c.id === source.droppableId);
      const copiedPlaces = [...container.places];
      const [removed] = copiedPlaces.splice(source.index, 1);
      copiedPlaces.splice(destination.index, 0, removed);

      setContainers(containers.map(c => 
        c.id === source.droppableId ? { ...c, places: copiedPlaces } : c
      ));
    }
  };

   const renderUnifiedContainers = () => (
    <DragDropContext onDragEnd={onDragEnd}>
      {containers.map((container, containerIndex) => (
        <Droppable key={container.id} droppableId={container.id}>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="place-container"
            >
              <div className="place-title">
                <p>{`${containerIndex + 1}일차`}</p>
              </div>
              <Planner
                title={container.lodging.title}
                address={container.lodging.address}
                image={container.lodging.image}
                onClick={() => handleTogglePopup(container.lodging)}
              />
              {container.places.map((place, index) => (
                <Draggable key={place.id} draggableId={place.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="non-lodging-place"
                    >
                      <span className="icon-number">
                        {getIconComponent(index + 1)} {/* 인덱스 + 1로 아이콘 생성 */}
                      </span>
                      <Planner
                        title={place.title}
                        address={place.address}
                        image={place.image}
                        onClick={() => handleTogglePopup(place)}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      ))}
    </DragDropContext>
  );

  const saveTravelPlan = async (event) => {
    event.preventDefault(); 

    const userId = localStorage.getItem('userId');
  
    if (!auth || !tokens.accessToken) {
      alert("로그인 상태가 아닙니다.");
      return;
    }

    const travelPlanData = {
      title, 
      content, 
      createdAt: new Date().toISOString(),
      travelBasket: {
        basketItems: hotels.map((hotel) => ({
          title: hotel.title,
          address: hotel.address,
          rating: hotel.rating || 0,
          lat: hotel.lat,
          lng: hotel.lng,
        })),
      },
    };

    try {
      const response = await axiosInstance.post(
        `/user/${userId}/travel-plans`,
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
      console.error('Error creating travel plan:', error);
      alert('여행 계획 저장에 실패했습니다.');
    }
  };

  const getIconComponent = (number) => {
    switch (number) {
      case 1:
        return <TbCircleNumber1Filled />;
      case 2:
        return <TbCircleNumber2Filled />;
      case 3:
        return <TbCircleNumber3Filled />;
      case 4:
        return <TbCircleNumber4Filled />;
      case 5:
        return <TbCircleNumber5Filled />;
      case 6:
        return <TbCircleNumber6Filled />;
      case 7:
        return <TbCircleNumber7Filled />;
      case 8:
        return <TbCircleNumber8Filled />;
      case 9:
        return <TbCircleNumber9Filled />;
      default:
        return null; // 해당하는 아이콘이 없을 경우 null 반환
    }
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
              <div className="place-container-wrapper">
                {renderUnifiedContainers()}
              </div>
            </div>
            {auth ? (
              <button onClick={saveTravelPlan} className="save-button">여행 계획 저장</button>
            ) : (
              <p>로그인 후에 여행 계획을 저장할 수 있습니다.</p>
            )}
          </>
        ) : (
          <p>호텔 데이터가 없습니다.</p>
        )}
      </div>

      {/* 팝업창 표시 */}
      {showPopup && (
        <div className="popup" onClick={handleClickOutsidePopup}>
          <div className="popup-content">
            {selectedHotel?.image && (
              <img 
                src={selectedHotel.image} 
                alt={selectedHotel.title || '호텔 이미지'} 
                className="popup-image"
              />
            )}
            {selectedHotel && placeDetails[selectedHotel.id] && (
              <>
                <h3>{placeDetails[selectedHotel.id].name || selectedHotel.title}</h3>
                <p>{placeDetails[selectedHotel.id].formatted_address || selectedHotel.address}</p>
                <StarRating rating={placeDetails[selectedHotel.id].rating} />
                {placeDetails[selectedHotel.id].website && (
                  <a 
                    href={placeDetails[selectedHotel.id].website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="website-link"
                  >
                    홈페이지 바로가기
                  </a>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlannerPage;