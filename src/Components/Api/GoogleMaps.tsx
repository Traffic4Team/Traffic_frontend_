import React, { useState, useEffect, useCallback, useMemo  } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../assets/css/GoogleMaps.css';
import Itemcontainer from './Itemcontainer';
import DateRangePicker from '../DateRangePicker/DateRangePicker';

function GoogleMaps() {
  const [googleMap, setGoogleMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [list1, setList1] = useState([]);
  const [list2, setList2] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [selectedType, setSelectedType] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [daysCount, setDaysCount] = useState(0);
  const [destination, setDestination] = useState('');
  const [placeDetails, setPlaceDetails] = useState(null);
  

  const navigate = useNavigate();
  const location = useLocation();
  const infoWindow = useMemo(() => new window.google.maps.InfoWindow(), []);

  const placeTypes = [
    { value: 'lodging', label: '호텔' },
    { value: 'restaurant', label: '레스토랑' },
    { value: 'tourist_attraction', label: '관광 명소' }
  ];

  const markerIcons = useMemo(() => ({
    lodging: 'https://img.icons8.com/?size=100&id=bc9PfkZ8cbJC&format=png&color=000000',
    restaurant: 'https://img.icons8.com/?size=100&id=lq7Ugy76e18x&format=png&color=000000',
    tourist_attraction: 'https://img.icons8.com/?size=100&id=s8WkcTNjgu5O&format=png&color=000000',
    default: 'https://img.icons8.com/?size=100&id=s8WkcTNjgu5O&format=png&color=000000',
  }), []);
  

  const fetchPlaces = useCallback((searchTerm) => {
    if (!googleMap) return;
  
    setLoading(true);
    const service = new window.google.maps.places.PlacesService(googleMap);
    const mapCenter = googleMap.getCenter();
  
    const request = {
      query: searchTerm,
      fields: ['name', 'formatted_address', 'geometry', 'place_id', 'photos', 'types', 'price_level', 'international_phone_number', 'rating'],
      locationBias: new window.google.maps.Circle({
        center: mapCenter.toJSON(),
        radius: 5000,
      }),
      language: 'kr',
    };
  
    service.textSearch(request, (results, status, pagination) => {
      setLoading(false);
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        const placeData = results.map(place => ({
          id: place.place_id,
          title: place.name,
          address: place.formatted_address,
          image: place.photos && place.photos[0] ? place.photos[0].getUrl() : null,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          phone_number: place.international_phone_number,
          rating: place.rating,
          url: place.url,
          types: place.types,
        }));
        
        console.log(placeData);
        setHotels(placeData);
        initializeList1(placeData);

        if (placeData.length > 0) {
          const avgLat = placeData.reduce((sum, place) => sum + place.lat, 0) / placeData.length;
          const avgLng = placeData.reduce((sum, place) => sum + place.lng, 0) / placeData.length;
          googleMap.setCenter({ lat: avgLat, lng: avgLng });
          googleMap.setZoom(12);
        }
  
        if (pagination && pagination.hasNextPage) {
          setPagination(() => pagination);
        } else {
          setPagination(null);
        }
      } else {
        setError('장소를 가져오는 중 오류가 발생했습니다. 나중에 다시 시도해 주세요.');
      }
    });
  }, [googleMap]);


  useEffect(() => {
    if (!window.google) return;

    const container = document.createElement("div");
    container.id = "map";
    const mapContainer = document.getElementById("map-container");

    if (mapContainer) {
      mapContainer.appendChild(container);
    }

    const mapInstance = new window.google.maps.Map(container, {
      center: { lat: 37.5, lng: 127.0 },
      zoom: 12,
      mapId: "92cb7201b7d43b21",
      disableDefaultUI: true,
      clickableIcons: false,
      minZoom: 10,
      maxZoom: 18,
      gestureHandling: "greedy",
    });

    setGoogleMap(mapInstance);

    return () => {
      if (mapContainer && container.parentNode) {
        mapContainer.removeChild(container);
      }
    };
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const destinationParam = queryParams.get('destination');
    const categoryParam = queryParams.get('category');
    
    if (destinationParam) {
      setDestination(destinationParam);
      const searchQuery = categoryParam ? `${destinationParam} ${categoryParam}` : destinationParam;
      setSearchTerm(searchQuery);
      fetchPlaces(searchQuery);
    }
  }, [location.search, googleMap, selectedType, fetchPlaces]); 

  useEffect(() => {
    if (!googleMap) return;
    if (searchTerm && selectedType) { // selectedType이 설정된 경우에만 검색 실행
      fetchPlaces(searchTerm);
    }
  }, [googleMap, searchTerm, selectedType]);

  useEffect(() => {
    if (!googleMap) return;
  
    // Remove existing markers
    markers.forEach(marker => marker.setMap(null));
  
    // Add new markers for list2
    const newMarkers = list2.map(place => {
      const position = { lat: place.lat, lng: place.lng };
      const category = place.types.find(type => markerIcons[type]) || 'default';
      const icon = {
        url: category ? markerIcons[category] : 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
        scaledSize: new window.google.maps.Size(40, 40),
      };
  
      const marker = new window.google.maps.Marker({
        position,
        map: googleMap,
        title: place.title,
        icon,
      });
  
      const createInfoWindowContent = (place, details) => {
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          place.title + ' ' + place.address
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
            ${place.image ? `
              <div class="info-window__image-container">
                <img class="info-window__image" src="${place.image}" alt="${place.title}"/>
              </div>
            ` : ''}
            
            <div class="info-window__content">
              <h3 class="info-window__title">${place.title}</h3>
              
              ${place.rating ? `
                <div class="info-window__rating">
                  ${getRatingStars(place.rating)} (${place.rating})
                </div>
              ` : ''}
              
              <p class="info-window__address">${place.address}</p>
              
              ${place.phone_number ? `
                <p class="info-window__phone">
                  📞 ${place.phone_number}
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
                  google 지도에서 보기
                </a>
              </div>
            </div>
          </div>
        `;
      };
      
      // 마커 클릭 이벤트 리스너
      marker.addListener('click', () => {
        const details = placeDetails[place.id] || {};
        const infoWindowContent = createInfoWindowContent(place, details);
        infoWindow.setContent(infoWindowContent);
        infoWindow.open(googleMap, marker);
      });
  
      return marker;
    }).filter(marker => marker !== null);
  
    setMarkers(newMarkers);
  }, [list2, googleMap, markerIcons]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchClick = () => {
    if (!searchTerm.trim()) {
      alert("검색어를 입력해주세요."); // Alert for empty search term
      return;
    }
    handleCustomSearch(searchTerm);
    setSearchTriggered(true);
  };
  
  const handleCustomSearch = (customTerm) => {
      setSearchTerm(customTerm); // 원하는 값으로 searchTerm 업데이트

      // 검색을 실행하는 fetchPlaces 함수를 호출
      fetchPlaces(customTerm); // 업데이트된 값으로 검색 실행
  };

  const fetchMoreResults = () => {
    if (pagination && pagination.hasNextPage) {
      setLoading(true);
      pagination.nextPage();
    }
  };

  const initializeList1 = (data) => {
    if (data.length > 0) {
      const half = Math.ceil(data.length / 2);
      setList1(data.slice(0, half));
    }
  };

  const handleItemClick = async (item, listName) => {
    if (listName === 'list1') {
      setList1(prev => prev.filter(i => i !== item));
      setList2(prev => [...new Set([...prev, item])]);
    } else {
      setList2(prev => prev.filter(i => i !== item));
      setList1(prev => [...new Set([...prev, item])]);
    }
  };

  const handleViewPlannerPage = () => {
    navigate('/PlannerPage', { state: { hotels: list2 } });
  };

  const handleTypeChange = (event) => {
    const selectedCategory = event.target.value; // 선택된 카테고리
    const newSearchTerm = `${searchTerm.split(' ')[0]} ${selectedCategory}`; // 현재 검색어에 카테고리 추가
    setSearchTerm(newSearchTerm); // 검색어 업데이트
    fetchPlaces(newSearchTerm); // 검색 실행
  };

  const handleApplyDateRange = () => {
    if (startDate && endDate) {
      const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24) + 1);
      setDaysCount(totalDays);
      const selectedHotels = hotels.slice(0, totalDays);
      setList2(prevList2 => 
        prevList2.filter(hotel => !selectedHotels.includes(hotel)).concat(selectedHotels)
      );
    }
  };

  useEffect(() => {
    if (location.state) {
      const { startDate, endDate, daysCount } = location.state;
      if (startDate && endDate) {
        setStartDate(startDate);
        setEndDate(endDate);
        if (daysCount) {
          setDaysCount(daysCount);
        } else {
          const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24) + 1);
          setDaysCount(totalDays);
        }
      }
    }
  }, [location.state]);

  const fetchRecommendedPlaces = useCallback(async () => {
    try {
      const response = await fetch('API_ENDPOINT_FOR_RECOMMENDATIONS');
      const data = await response.json();
      const recommendedPlace = data.recommendation;

      setSearchTerm(recommendedPlace);
      fetchPlaces(recommendedPlace);
    } catch (error) {
      console.error('추천 여행지 가져오기 오류:', error);
    }
  }, [fetchPlaces]);

  useEffect(() => {
    fetchRecommendedPlaces();
  }, [fetchRecommendedPlaces]);

  useEffect(() => {
    const fetchPlaceDetails = (id) => {
      if (!googleMap) return;
  
      const service = new window.google.maps.places.PlacesService(googleMap);
  
      service.getDetails({ placeId: id }, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setPlaceDetails(prevDetails => ({
            ...prevDetails,
            [id]: {
              website: place.website || '',
              url: place.url || '',
            },
          }));
        } else {
          console.error(`Failed to fetch details for ID: ${id}`);
        }
      });
    };
  
    // 각 호텔의 ID로 세부 정보 불러오기
    hotels.forEach((hotel) => {
      fetchPlaceDetails(hotel.id);
    });
  }, [hotels, googleMap]);



  return (
    <div id="container">
      <div id="movebox">
        <div id="search">
          <h3 id="movebox-title">{destination ? `${destination}` : '여행 계획을 선택하세요'}</h3>
          <DateRangePicker onDateRangeSelect={({ startDate, endDate }) => {
            setStartDate(startDate);
            setEndDate(endDate);
            handleApplyDateRange();
          }} />
          <select onChange={handleTypeChange} value={selectedType}>
            <option value="" disabled>카테고리를 선택하세요</option>
            {placeTypes.map((type) => (
              <option key={type.label} value={type.label}>
                {type.label}
              </option>
            ))}
          </select>

          <form className="search-container">
            <input
              type="text"
              id="search-bar"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder={`${selectedType === 'lodging' ? '호텔' : selectedType === 'tourist_attraction' ? '관광 명소' : '레스토랑'}을 검색하세요...`}
            />
            <a href="#" onClick={handleSearchClick}>
              <img className="search-icon" src="http://www.endlessicons.com/wp-content/uploads/2012/12/search-icon.png" alt="search icon" />
            </a>
          </form>
        
        </div>
        {loading && <p>로딩 중...</p>}
        {error && <p>{error}</p>}
        <div className="list-container">
          <div className="list-header">
            <h2>장소 선택</h2>
            <div className="list">
              {list1.map((item, index) => (
                <Itemcontainer
                  image={item.image}
                  key={index}
                  title={item.title}
                  onClick={() => handleItemClick(item, 'list1')}
                  rating={item.rating}
                  address={item.address}
                />
              ))}
            </div>
          </div>
          <div className="list-header">
            <h2>선택된 장소</h2>
            <div className="list">
              {list2.map((item, index) => (
                <Itemcontainer
                  image={item.image}
                  key={index}
                  title={item.title}
                  onClick={() => handleItemClick(item, 'list2')}
                  rating={item.rating}
                  address={item.address}
                />
              ))}
            </div>
            </div>
        </div>
        {pagination && (
          <button
            id="more-results-button"
            onClick={fetchMoreResults}
            disabled={loading}
          >
            + 더보기
          </button>
        )}
        <button
          id="view-planner-page-button"
          onClick={handleViewPlannerPage}
        >
          Planner 페이지 보기
        </button>
      </div>
      <div id="map-container">
        <div id="map"></div>
      </div>
    </div>
  );
}

export default GoogleMaps;
