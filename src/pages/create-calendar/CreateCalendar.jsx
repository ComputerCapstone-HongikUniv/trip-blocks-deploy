import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance.js';
import { format } from 'date-fns';
import CityOptions from './CityOptions';
import DateOptions from './DateOptions';
import AccommodationSearch from './AccommodationSearch';
import LodgingMap from './LodgingMap';
import AccommodationOptions from './AccommodationOptions';
import ThemeOptioins from './ThemeOptioins';
import TransportationOptions from './TransportationOptions';
import { ALL_CITY_CONFIG } from '../../utils/cityConfig.js';
import './CreateCalendar.css';

export default function CreateCalendar() {
  const navigate = useNavigate();
  const [city, setCity] = useState("New York");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [theme, setTheme] = useState(1);
  const [calendarName, setCalendarName] = useState("");
  const [inputText, setInputText] = useState('');
  const [accommodationQuery, setAccommodationQuery] = useState('');
  const [transportation, setTransportation] = useState("transit");
  const [places, setPlaces] = useState([]);  // 숙소

  useEffect(() => {
    if (city === "Tokyo") {
      setTransportation("driving");
    } else {
      setTransportation("transit");
    }
  }, [city]);

  const handleCreateCalendar = async () => {
    if (!city || !startDate || !endDate || theme === null || !calendarName.trim()) {
      alert('모든 정보를 입력해주세요.');
      return;
    }

    const newCalendar = {
      city: city,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      theme: theme,
      calendarName: calendarName.trim(),
      defaultTransportation: transportation
    };

    try {
      await axiosInstance.post('/api/calendars', newCalendar);  // 서버에 저장
      navigate('/mypage');
    } catch (error) {
      console.error('캘린더 생성 실패:', error);
      alert('캘린더 생성에 실패했습니다.');
    }

  };

  return (
    <div className="create-calendar-container">
      <div className="location-select-container">
        <h2>여행 장소 선택</h2>
        <CityOptions ALL_CITY_CONFIG={ALL_CITY_CONFIG} city={city} setCity={setCity} />
        <p className='location-select-info'>* 서울은 자동차 관련 이동 정보가 제한됩니다.</p>
        <p>* 도쿄는 대중교통 관련 이동 정보가 제한됩니다.</p>
      </div>

      <div className="date-select-container">
        <h2>여행 날짜 선택</h2>
        <DateOptions startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate} />
      </div>

      {/* <div className="accommodation-select-container">
        <h2 className="">숙소 입력하기</h2>
        <AccommodationSearch inputText={inputText} setInputText={setInputText} accommodationQuery={accommodationQuery} setAccommodationQuery={setAccommodationQuery} />

        <h3>추천 숙소</h3>
        <LodgingMap city={city} setPlaces={setPlaces} query={accommodationQuery} />
        <AccommodationOptions places={places} city={city} cities={cities} />
      </div> */}

      <h2>캘린더 테마 설정</h2>
      <p>캘린더 생성 이후에도 테마 변경이 가능하며, 일정별 색 지정도 가능합니다.</p>
      <ThemeOptioins theme={theme} setTheme={setTheme} />

      <h2>여행 이름 설정</h2>
      <div>
        <input
          type="text"
          className="calendar-name-input"
          placeholder="예: 2025 겨울 여행"
          value={calendarName}
          onChange={(e) => setCalendarName(e.target.value)}
        />
      </div>

      <h2>기본 이동수단 선택</h2>
      <TransportationOptions
        city={city}
        transportation={transportation}
        setTransportation={setTransportation}
      />
      <p className="travel-option-info">* 일정 간 기본 이동 수단으로 지정됩니다. <br />* 또한 일정 수정 및 삭제 시, 일정 간 이동 수단이 현재 선택된 기본 이동 수단으로 재설정됩니다.</p>

      <div className="calendar-button-container">
        <button className="button-secondary" onClick={() => navigate("/mypage")}>취소</button>
        <button className="button-primary" onClick={handleCreateCalendar}>캘린더 생성</button>
      </div>
    </div >
  );
}