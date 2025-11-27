import { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from "../../../api/axiosInstance";
import ThemeOptioins from "../../create-calendar/ThemeOptioins";
import TransportationOptions from '../../create-calendar/TransportationOptions';
import './SettingCalendar.css';

export default function SettingCalendar() {
  const navigate = useNavigate();
  const { calendarId } = useParams();
  const [city, setCity] = useState("New York");
  const [theme, setTheme] = useState(1);
  const [calendarName, setCalendarName] = useState("");
  const [transportation, setTransportation] = useState("transit");
  const [showAllWarning, setShowAllWarning] = useState(true);

  // 🔹 캘린더 설정 불러오기 (네가 이미 넣어둔 코드)
  useEffect(() => {
    if (!calendarId) return;

    const fetchCalendarSetting = async () => {
      try {
        const res = await axiosInstance.get(
          `/api/calendars/${calendarId}/calendar-setting`
        );

        const {
          calendarName,
          city,
          theme,
          defaultTransportation,
          showAllWarning,
        } = res.data;

        if (calendarName !== undefined) setCalendarName(calendarName);
        if (city !== undefined) setCity(city);
        if (theme !== undefined) setTheme(theme);
        if (defaultTransportation !== undefined) {
          setTransportation(defaultTransportation);
        }
        if (showAllWarning !== undefined) {
          setShowAllWarning(!!showAllWarning);
        }
      } catch (err) {
        console.error("캘린더 설정 불러오기 실패:", err);
      }
    };

    fetchCalendarSetting();
  }, [calendarId]);

  // 🔹 저장 버튼 클릭 시 → PUT /api/calendars/{calendarId}
  const handleSave = async () => {
    if (!calendarId) return;

    try {
      await axiosInstance.put(`/api/calendars/${calendarId}`, {
        calendarName,
        theme, // int
        defaultTransportation: transportation,
        showAllWarning,
      });

      navigate(`/calendar/${calendarId}`);
    } catch (err) {
      console.error("캘린더 설정 저장 실패:", err);
      alert("캘린더 설정 저장에 실패했습니다.");
    }
  };

  return (
    <div className="setting-calendar-wrapper">
      <h1>캘린더 설정</h1>

      <h2>캘린더 테마 설정</h2>
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

      <div className="setting-warning-wrapper">
        <h2 className="setting-warning-title">경고 설정</h2>

        <label className="setting-warning-checkbox">
          <input
            type="checkbox"
            checked={showAllWarning}
            onChange={(e) => setShowAllWarning(e.target.checked)}
          />
          <span className="setting-custom-checkbox">
            현재 캘린더의 전체 일정 대한 영업시간, 이동 경로 관련 경고가 표시됩니다.
          </span>
        </label>
      </div>

      <h2>기본 이동 수단 변경</h2>
      <TransportationOptions
        city={city}
        transportation={transportation}
        setTransportation={setTransportation}
      />

      <div className="setting-button-container">
        <button
          className="button-secondary"
          onClick={() => navigate(`/calendar/${calendarId}`)}
        >
          취소
        </button>
        <button
          className="button-primary"
          onClick={handleSave}   // 🔸 여기 연결
        >
          저장
        </button>
      </div>
    </div>
  );
}