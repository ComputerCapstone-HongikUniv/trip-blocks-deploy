import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from '../../api/axiosInstance.js';
import html2canvas from 'html2canvas';
import { CITY_CONFIG } from '../../utils/cityConfig.js';
import CalendarHeader from '../../components/Header/CalendarHeader';
import CalendarSideBar from './sidebar/CalendarSideBar.jsx';
import WeeklyCalendar from './calendar-mode/WeeklyCalendar.jsx';
import Map from './map-mode/Map.jsx';
import './Calendar.css';

export default function Calendar() {
  const navigate = useNavigate();
  const { calendarId } = useParams();
  const [headerInfo, setHeaderInfo] = useState([]);
  const [mode, setMode] = useState("calendar");
  const [sideOpen, setSideOpen] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const prevSideOpenRef = useRef(true);
  const [recomOrSearchOrSave, setRecomOrSearchOrSave] = useState("recommend");
  const [placeQuery, setPlaceQuery] = useState('');
  const [category, setCategory] = useState(null);
  const [recommendedPlaces, setRecommendedPlaces] = useState([]);
  const [bookmarkedPlaces, setBookmarkedPlaces] = useState([]);
  const [searchedPlaces, setSearchedPlaces] = useState([]);
  const [sortType, setSortType] = useState(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState(null);
  const [city, setCity] = useState(null);
  const [center, setCenter] = useState();
  const [mapCenter, setMapCenter] = useState(center);
  const [events, setEvents] = useState([]);
  const [mapEvents, setMapEvents] = useState([]);
  const [makeGEventMode, setMakeGEventMode] = useState(false);
  const [selectedPlaceForGEvent, setSelectedPlaceForGEvent] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const captureRef = useRef(null);

  const doCapture = async () => {
    if (!captureRef.current) {
      console.warn("캡쳐할 캘린더 DOM을 찾지 못했습니다.");
      return;
    }

    const element = captureRef.current;

    // 1) 원본 화면 캡쳐
    const srcCanvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
    });

    // 2) 원하는 출력 크기 + 여백
    const TARGET_WIDTH = 3840;
    const TARGET_HEIGHT = 2160;
    const PADDING = 50;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = TARGET_WIDTH + PADDING * 2;
    exportCanvas.height = TARGET_HEIGHT + PADDING * 2;
    const ctx = exportCanvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    const ratio = Math.min(
      TARGET_WIDTH / srcCanvas.width,
      TARGET_HEIGHT / srcCanvas.height
    );

    const drawWidth = srcCanvas.width * ratio;
    const drawHeight = srcCanvas.height * ratio;

    const offsetX = (TARGET_WIDTH - drawWidth) / 2 + PADDING;
    const offsetY = (TARGET_HEIGHT - drawHeight) / 2 + PADDING;

    ctx.drawImage(
      srcCanvas,
      0, 0, srcCanvas.width, srcCanvas.height,
      offsetX, offsetY, drawWidth, drawHeight
    );

    const dataUrl = exportCanvas.toDataURL('image/jpeg', 0.9);
    const link = document.createElement('a');
    const name = headerInfo?.calendarName || 'calendar';
    link.href = dataUrl;
    link.download = `${name}.jpg`;
    link.click();
  };

  // ✅ 공유(이미지 export) 핸들러
  const handleShareCalendar = () => {
    if (mode !== "calendar") {
      alert("캘린더 모드에서만 공유 이미지를 만들 수 있어요.");
      return;
    }

    // 현재 사이드 상태 저장
    prevSideOpenRef.current = sideOpen;

    // export 모드 ON + 사이드바 닫기
    setIsExporting(true);
    setSideOpen(false);
  };

  const handleCalendarReadyForExport = async () => {
    // sideOpen 변경 때문에 호출될 수 있으니, export 중이 아닐 때는 무시
    if (!isExporting) return;

    try {
      await doCapture();
    } catch (err) {
      console.error("캘린더 이미지를 export하는 중 오류:", err);
      alert("이미지를 생성하는 중 문제가 발생했어요.");
    } finally {
      // export 끝나면 상태 복원
      setIsExporting(false);
      setSideOpen(prevSideOpenRef.current);
    }
  };

  // 캘린더 모드 일정 리스트 불러오기
  useEffect(() => {
    const fetchEvents = async () => {
      const response = await axiosInstance.get(`/api/calendars/${calendarId}/calendar-mode/events`);
      setEvents(response.data);
    };
    fetchEvents();
  }, [calendarId]);

  // 캘린더 모드 경고 리스트 불러오기
  const fetchWarnings = useCallback(async () => {
    try {
      const response = await axiosInstance.get(
        `/api/calendars/${calendarId}/calendar-mode/warning`
      );
      setWarnings(response.data);
    } catch (err) {
      console.error("캘린더 모드 경고 리스트 불러오기 실패:", err);
    }
  }, [calendarId]);

  useEffect(() => {
    fetchWarnings();
  }, [fetchWarnings]);


  // 지도 모드 일정 리스트 불러오기
  useEffect(() => {
    const fetchMapEvents = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/calendars/${calendarId}/map-mode/events`
        );
        setMapEvents(response.data);   // [{ eventId, placeId, startTime, endTime, latitude, longitude }, ...]
      } catch (err) {
        console.error("지도 모드 일정 불러오기 실패:", err);
      }
    };
    fetchMapEvents();
  }, [calendarId]);

  // 캘린더 헤더 정보 불러오기, city 
  useEffect(() => {
    const fetchHeaderInfo = async () => {
      const response = await axiosInstance.get(`/api/calendars/${calendarId}/calendar-header`);
      setHeaderInfo(response.data);
      setCity(response.data.city);
    };
    fetchHeaderInfo();
  }, [calendarId]);

  // 캘린더 도시 중심 좌표 
  useEffect(() => {
    if (!city) return;
    const selectedCity = CITY_CONFIG.find(c => c.id === city);
    if (selectedCity) {
      setCenter(selectedCity.center);
      setMapCenter(selectedCity.center);
    }
  }, [city]);

  // 추천 장소 리스트 불러오기 (함수로 분리)
  // 추천 장소 리스트 불러오기 (함수로 분리)
  const fetchRecommendedPlaces = async () => {
    const baseCenter = mapCenter || center; // 지도 중심 좌표 우선 사용
    if (!baseCenter) return;

    const { lat, lng } = baseCenter;

    try {
      const response = await axiosInstance.get(
        `/api/calendars/${calendarId}/places/recommended-places?latitude=${lat}&logtitude=${lng}`
      );
      setRecommendedPlaces(response.data);
    } catch (err) {
      console.error("추천 장소 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    fetchRecommendedPlaces();
  }, [calendarId, bookmarkedPlaces]);

  // 북마크 리스트 불러오기 함수로 분리
  const fetchBookmarkedPlaces = async () => {
    const response = await axiosInstance.get(
      `/api/calendars/${calendarId}/places/bookmarked-places`
    );
    setBookmarkedPlaces(response.data);
  };
  useEffect(() => {
    fetchBookmarkedPlaces();
  }, [calendarId]);

  // 검색 결과 불러오기 (함수로 분리)
  const fetchSearchedPlaces = async () => {
    const baseCenter = mapCenter || center;
    if (!baseCenter) return;
    if (!placeQuery.trim()) {
      setSearchedPlaces([]);
      return;
    }
    const { lat, lng } = baseCenter;
    console.log("검색 중심 좌표:", lat, lng);
    const response = await axiosInstance.get(
      `/api/calendars/${calendarId}/places?query=${placeQuery}&latitude=${lat}&longitude=${lng}`
    );
    setSearchedPlaces(response.data);
  };
  useEffect(() => {
    fetchSearchedPlaces();
  }, [placeQuery, calendarId, bookmarkedPlaces]);

  /* 여기서 basePlaces / filteredPlaces / sortedPlaces 한 번에 계산 */
  const basePlaces =
    recomOrSearchOrSave === "recommend"
      ? recommendedPlaces
      : recomOrSearchOrSave === "search"
        ? searchedPlaces
        : bookmarkedPlaces;

  const filteredPlaces = category
    ? basePlaces.filter((place) => place.category === category)
    : basePlaces;

  const sortedPlaces = [...filteredPlaces].sort((a, b) => {
    if (sortType === "rating") return b.rating - a.rating;
    if (sortType === "review") return b.commentNum - a.commentNum;
    return 0;
  });

  const forceSearch = () => {
    fetchSearchedPlaces();  // placeQuery가 같아도 강제 호출됨
  };

  return (
    <div className="calender-container">
      {/* 상단 헤더 */}
      <CalendarHeader
        calendarId={calendarId}
        headerInfo={headerInfo}
        mode={mode}
        setMode={setMode}
        setSideOpen={setSideOpen}
        onShareCalendar={handleShareCalendar}
      />

      <div className={`calender-contents ${sideOpen ? "calender-contents--shifted" : ""}`}>
        <CalendarSideBar
          sideOpen={sideOpen}
          recomOrSearchOrSave={recomOrSearchOrSave}
          setRecomOrSearchOrSave={setRecomOrSearchOrSave}
          placeQuery={placeQuery}
          setPlaceQuery={setPlaceQuery}
          category={category}
          setCategory={setCategory}
          recommendedPlaces={recommendedPlaces}
          searchedPlaces={searchedPlaces}
          bookmarkedPlaces={bookmarkedPlaces}
          places={sortedPlaces}
          fetchBookmarkedPlaces={fetchBookmarkedPlaces}
          sortType={sortType}
          setSortType={setSortType}
          calendarId={calendarId}
          setMakeGEventMode={setMakeGEventMode}
          setSelectedPlaceForGEvent={setSelectedPlaceForGEvent}
          onSearchRequest={forceSearch}
        />

        {/* 캘린더 / 지도 뷰 */}
        <div className="weekly-calender-map-view">
          {mode === "calendar" && (
            <WeeklyCalendar
              calendarId={calendarId}
              headerInfo={headerInfo}
              events={events} setEvents={setEvents}
              sideOpen={sideOpen}
              makeGEventMode={makeGEventMode}
              setMakeGEventMode={setMakeGEventMode}
              selectedPlaceForGEvent={selectedPlaceForGEvent}
              setSelectedPlaceForGEvent={setSelectedPlaceForGEvent}
              warnings={warnings}
              refreshWarnings={fetchWarnings}
              captureRef={captureRef}
              onReadyForExport={handleCalendarReadyForExport}
              isExporting={isExporting}
              selectedPlaceId={selectedPlaceId}
              setSelectedPlaceId={setSelectedPlaceId}
            />
          )}

          {mode === "map" && (
            <Map
              calendarId={calendarId}
              headerInfo={headerInfo}
              city={city}
              center={center}
              mapCenter={mapCenter}
              setMapCenter={setMapCenter}
              mode={mode}
              recomOrSearchOrSave={recomOrSearchOrSave}
              places={filteredPlaces}
              events={events}
              mapEvents={mapEvents}
            />
          )}
        </div>

        <button
          className="detail-rout-btn"
          onClick={() =>
            navigate(`/calendar/${calendarId}/route`, {
              state: { headerInfo },   // ✅ 여기!
            })
          }
        >
          상세 경로 보기
        </button>
      </div>
    </div>
  );
}