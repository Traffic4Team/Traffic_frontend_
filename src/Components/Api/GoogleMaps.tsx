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
  const [setSearchTriggered] = useState(false);  const [pagination, setPagination] = useState(null);
  const [selectedType] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [daysCount, setDaysCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  const placeTypes = [
    { value: 'lodging', label: '호텔' },
    { value: 'restaurant', label: '레스토랑' },
    { value: 'tourist_attraction', label: '관광 명소' }
  ];

  const markerIcons = useMemo(() => ({
    lodging: 'https://img.icons8.com/?size=100&id=bc9PfkZ8cbJC&format=png&color=000000',
    restaurant: 'https://img.icons8.com/?size=100&id=lq7Ugy76e18x&format=png&color=000000',
    tourist_attraction: 'https://img.icons8.com/?size=100&id=s8WkcTNjgu5O&format=png&color=000000'
  }), []);
  

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
    const destinationParam = queryParams.get('destination'); // destination 쿼리 파라미터 읽기
    const categoryParam = queryParams.get('category'); // category 쿼리 파라미터 읽기
    
    // destination과 category가 모두 존재할 경우 검색어 설정 및 검색 실행
    if (destinationParam) {
        const searchQuery = categoryParam ? `${destinationParam} ${categoryParam}` : destinationParam;
        setSearchTerm(searchQuery); // 검색어 설정
        fetchPlaces(searchQuery); // 검색 실행
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

    // 기존 마커 제거
    markers.forEach(marker => marker.setMap(null));

    // list2에 있는 항목으로 새로운 마커 생성
    const newMarkers = list2.map(place => {
      const position = { lat: place.lat, lng: place.lng };

      // Find the marker icon based on place types
      const category = place.types.find(type => markerIcons[type]);
      const icon = {
        url: category ? markerIcons[category] : 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png', // Marker icon URL
        scaledSize: new window.google.maps.Size(40, 40), // Adjust marker size
      };

      const marker = new window.google.maps.Marker({
        position,
        map: googleMap,
        title: place.title,
        icon: icon, // Set marker icon
      });

      // InfoWindow to show place details
      const infoContent = `
        <div>
          <h3>${place.title}</h3>
          <p>${place.address}</p>
        </div>
      `;
      const infoWindow = new window.google.maps.InfoWindow({ content: infoContent });
      marker.addListener('click', () => infoWindow.open(googleMap, marker));

      return marker;
    });

    setMarkers(newMarkers);
  }, [list2, googleMap, markerIcons, markers]);

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

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchClick = () => {
    if (searchTerm.trim()) {
      handleCustomSearch(searchTerm); // 기존 검색어 사용
      setSearchTriggered(true);
    }
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

  const handleItemClick = (item, listName) => {
    if (selectedType === 'lodging') {
      if (listName === 'list1') {
        if (list2.length < daysCount - 1) {
          setList1(prevList1 => prevList1.filter(i => i !== item));
          setList2(prevList2 => [...prevList2, item]);
        } else {
          alert(`최대 ${daysCount - 1}개 항목만 추가할 수 있습니다.`);
        }
      } else if (listName === 'list2') {
        setList2(prevList2 => prevList2.filter(i => i !== item));
        setList1(prevList1 => [...prevList1, item]);
      }
    } else {
      if (listName === 'list1') {
        setList1(prevList1 => prevList1.filter(i => i !== item));
        setList2(prevList2 => [...prevList2, item]);
      } else if (listName === 'list2') {
        setList2(prevList2 => prevList2.filter(i => i !== item));
        setList1(prevList1 => [...prevList1, item]);
      }
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



  return (
    <div id="container">
      <div id="movebox">
        <div id="search">
          <DateRangePicker onDateRangeSelect={({ startDate, endDate }) => {
            setStartDate(startDate);
            setEndDate(endDate);
            handleApplyDateRange();
          }} />
          <select onChange={handleTypeChange} value={selectedType}>
            <option value="" disabled>카테고리를 선택하세요</option> {/* 기본 선택 옵션 추가 */}
            {placeTypes.map((type) => (
              <option key={type.label} value={type.label}>
                {type.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            id="search-input"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder={`${selectedType === 'lodging' ? '호텔' : selectedType === 'tourist_attraction' ? '관광 명소' : '레스토랑'}을 검색하세요...`}
          />
          <button
            id="search-button"
            onClick={handleSearchClick}
          >
            검색
          </button>
        </div>
        {loading && <p>로딩 중...</p>}
        {error && <p>{error}</p>}
        <div className="list-container">
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
