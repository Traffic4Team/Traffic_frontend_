import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, isBefore, isAfter } from 'date-fns';  
import { useDateContext } from '../../context/DateContext'; 
import '../../assets/css/DateRangePicker.css'; 

const DateRangePicker = ({ onDateRangeSelect }) => {
  const { selectedStartDate, selectedEndDate, setSelectedStartDate, setSelectedEndDate } = useDateContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const startCurrentMonth = startOfMonth(currentDate);
  const endCurrentMonth = endOfMonth(currentDate);
  const startOfFirstWeek = startOfWeek(startCurrentMonth, { weekStartsOn: 0 });
  const endOfLastWeek = endOfWeek(endCurrentMonth, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: startOfFirstWeek, end: endOfLastWeek });

  const handleDateClick = (date) => {
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      setSelectedStartDate(date);
      setSelectedEndDate(null);
    } else if (selectedStartDate && !selectedEndDate) {
      if (isBefore(date, selectedStartDate)) {
        setSelectedStartDate(date);
        setSelectedEndDate(null);
      } else {
        setSelectedEndDate(date);
        if (onDateRangeSelect) onDateRangeSelect([selectedStartDate, date]); // 배열로 날짜 전달
      }
    }
  };

  const isDateInRange = (date) => {
    if (!selectedStartDate || !selectedEndDate) return false;
    return (
      (isAfter(date, selectedStartDate) && isBefore(date, selectedEndDate)) || 
      date.toDateString() === selectedEndDate.toDateString()
    );
  };

  const isDateSelected = (date) => {
    return (
      (selectedStartDate && !selectedEndDate && format(date, 'yyyy-MM-dd') === format(selectedStartDate, 'yyyy-MM-dd')) ||
      (selectedStartDate && selectedEndDate && isDateInRange(date)) ||
      (selectedStartDate && selectedEndDate && format(date, 'yyyy-MM-dd') === format(selectedEndDate, 'yyyy-MM-dd'))
    );
  };

  const getFormattedRange = () => {
    const formatDate = (date) => {
        const month = format(date, 'M'); // 월을 가져옵니다.
        const day = format(date, 'd'); // 일을 가져옵니다.
        
        const formattedMonth = month < 10 ? `0${month}` : month; // 월 포맷팅
        const formattedDay = day < 10 ? `0${day}` : day; // 일 포맷팅
        
        return `${formattedMonth}.${formattedDay}`; // mm.dd 형식으로 반환
    };

    if (selectedStartDate && selectedEndDate) {
        return `${format(selectedStartDate, 'yyyy')}.${format(selectedStartDate, 'M')}.${format(selectedStartDate, 'd')} ~ ${formatDate(selectedEndDate)}`;
    }
      return `${format(currentDate, 'yyyy')}.${currentDate.getMonth() + 1 < 10 ? '0' : ''}${currentDate.getMonth() + 1}.${currentDate.getDate() < 10 ? '0' : ''}${currentDate.getDate()}`; // 현재 날짜 포맷팅
  };  

  const handleApplyDates = () => {
    console.log('handleApplyDates called');
    console.log('Selected Start Date:', selectedStartDate);
    console.log('Selected End Date:', selectedEndDate);
  
    if (selectedStartDate && selectedEndDate && onDateRangeSelect) {
      onDateRangeSelect([selectedStartDate, selectedEndDate]); // 배열로 날짜 전달
    }
  };

  return (
    <div className="date-picker">
      <div className="input">
        <div className="result"><span>{getFormattedRange()}</span></div>
        <button className="calendar-toggle-button" onClick={() => setIsCalendarOpen(!isCalendarOpen)}>
          <i className="fa fa-calendar"></i> {isCalendarOpen ? '닫기' : '열기'}
        </button>
      </div>

      {isCalendarOpen && (
        <div className="calendar">
          <div className="calendar-header">
            <button className="header-button" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>&lt;</button>
            <h2 className="calendar-title">{getFormattedRange()}</h2>
            <button className="header-button" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>&gt;</button>
          </div>

          <div className="calendar-grid">
            {days.map((day) => (
              <div
                key={day}
                className={`day ${isDateSelected(day) ? 'selected' : ''} ${isDateInRange(day) ? 'in-range' : ''}`}
                onClick={() => handleDateClick(day)}
              >
                {format(day, 'd')}
              </div>
            ))}
          </div>

          <button className="apply-button" onClick={handleApplyDates}>적용</button>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
