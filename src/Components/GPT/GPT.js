import React, { useState } from 'react';
import axios from 'axios';
import DateRangePicker from '../DateRangePicker/DateRangePicker.js';
import '../../assets/css/GPT.css';
import { useNavigate } from 'react-router-dom'; 

const GPT = () => {
  const questions = [
    { name: 'companions', question: '동반자는 누구인가요? (예: 가족, 친구, 연인):' },
    { name: 'departureCity', question: '출발 도시는 어디인가요? (예: 서울):' },
    { name: 'transportation', question: '어떤 이동 수단을 사용할 예정인가요? (예: 자동차, 기차):' },
    { name: 'style', question: '어떤 여행 스타일을 선호하시나요? (예: 휴양, 관광):' },
  ];

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    companions: '',
    departureCity: '',
    transportation: '',
    style: '',
  });
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [showCalendar, setShowCalendar] = useState(true);
  const navigate = useNavigate();

  const handleDateChange = (value) => {
    if (Array.isArray(value) && value.length === 2) {
      const [start, end] = value;
      setFormData({
        ...formData,
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      });
      setChatHistory([
        ...chatHistory,
        { type: 'question', text: '출발일과 도착일을 선택해주세요:' },
        { type: 'answer', text: `출발일: ${start.toLocaleDateString()} 도착일: ${end.toLocaleDateString()}` },
      ]);
      setShowCalendar(false);
      setStep(1);
    } else {
      console.error('Invalid date range selected:', value);
    }
  };

  const handleInputChange = (e) => {
    if (e.key === 'Enter' && e.target.value.trim() !== '') {
      const answer = e.target.value.trim();
      const currentQuestion = questions[step - 1];

      if (currentQuestion) {
        setChatHistory([
          ...chatHistory,
          { type: 'question', text: currentQuestion.question },
          { type: 'answer', text: answer },
        ]);

        setFormData({ ...formData, [currentQuestion.name]: answer });
        setStep(prevStep => prevStep + 1);
        e.target.value = '';

        if (step === questions.length) {
          handleSubmit();
        }
      }
    }
  };

  const handleSubmit = async () => {
    if (step === questions.length) {
      setLoading(true);
      setError(null);
  
      try {
        const res = await axios.post('/travelplan/gpt/domestic', formData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        const { recommendations } = res.data.data;
        setRecommendations(recommendations);

        setChatHistory((prevHistory) => [
          ...prevHistory,
          { type: 'question', text: '추천 여행지를 생성 중입니다...' },
          { type: 'answer', text: `추천 여행지: ${recommendations.map((rec) => rec.city).join(', ')}` },
        ]);
      } catch (error) {
        setError('추천 여행지를 가져오는 중 오류가 발생했습니다.');
        setChatHistory((prevHistory) => [
          ...prevHistory,
          { type: 'question', text: '추천 여행지를 생성 중입니다...' },
          { type: 'answer', text: '오류가 발생했습니다. 다시 시도해주세요.' },
        ]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewMaps = (city) => {
    setSelectedDestination(city); // 선택한 도시를 설정합니다.
    const calculatedDaysCount = Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24)) + 1;
    navigate(`/GoogleMaps?destination=${encodeURIComponent(city)}`, {
      state: {
        startDate: formData.startDate,
        endDate: formData.endDate,
        daysCount: calculatedDaysCount,
      },
    });
  };

  return (
    <div className="gpt-container">
      <h2 className="gpt-title">원하는 여행지의 정보를 입력하세요</h2>
      <div className="gpt-chat-history">
        {chatHistory.map((chat, index) => (
          <div
            key={index}
            className={`gpt-chat ${chat.type === 'question' ? 'gpt-chat-question' : 'gpt-chat-answer'}`}
          >
            {chat.text}
          </div>
        ))}
      </div>
      {showCalendar && step === 0 && (
        <div>
          <p>출발일과 도착일을 선택해주세요:</p>
          <DateRangePicker
            onDateRangeSelect={handleDateChange}
            placeholder="날짜 범위를 선택하세요"
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
      )}
      {step > 0 && step <= questions.length && !showCalendar && (
        <div>
          <p>{questions[step - 1].question}</p>
          <input
            type="text"
            onKeyDown={handleInputChange}
            placeholder="여기에 입력 후 Enter 키를 누르세요"
            className="gpt-input"
            disabled={loading}
          />
        </div>
      )}
      {recommendations.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>추천 여행지 목록</h3>
          <ul className="recommendation-list">
            {recommendations.map((rec, index) => (
              <li key={index} className="recommendation-item">
                <div className="place-info">
                  <h4 className="place-info-title">{rec.city}</h4>
                  <p>{rec.reason}</p>
                  <button onClick={() => handleViewMaps(rec.city)}>선택하기</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {error && <p className="gpt-error">{error}</p>}
    </div>
  );
};

export default GPT;
