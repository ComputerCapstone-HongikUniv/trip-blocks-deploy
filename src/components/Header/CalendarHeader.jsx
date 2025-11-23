import { Link } from 'react-router-dom';
import Logo from "../../assets/brand/logo.png";
import { formatKoreanDate } from '../../utils/formatDate.js';
import ProfileBtn from '../Header/ProfileBtn';
import CalendarDropdown from '../Header/CalendarDropdown.jsx';
import './CalendarHeader.css';

export default function CalendarHeader({
  calendarId, headerInfo,
  mode, setMode, setSideOpen,
  onShareCalendar
}) {
  const formattedStart = formatKoreanDate(headerInfo.startDate);
  const formattedEnd = formatKoreanDate(headerInfo.endDate);

  return (
    <header className="calender-header">
      <div className="left-section">
        <button className="sidebar-btn"
          onClick={() => {
            setSideOpen(prev => !prev);
          }}
        >
          <img className="sidebar-img" src="/icons/sidebar-icon.png" />
        </button>

        <Link to="/mypage" className="calendar-logo-container">
          <img
            src={Logo}
            alt="Trip Blocks logo"
            style={{
              width: "20px",
              height: "20px",
              objectFit: "contain"
            }}
          />
        </Link>


        <h2 className="calender-title">{headerInfo.calendarName}</h2>
        <p className="calender-date">{formattedStart} - {formattedEnd}</p>
      </div>

      <div className="right-section">
        <div className="view-toggle">
          <button
            type="button"
            className={`view-toggle__btn 
              ${mode === "calendar" ?
                "view-toggle__btn--active" : ""
              }`}
            onClick={() => setMode("calendar")}
          >
            캘린더
          </button>

          <button
            type="button"
            className={`view-toggle__btn 
              ${mode === "map" ?
                "view-toggle__btn--active" : ""
              }`}
            onClick={() => setMode("map")}
          >
            지도
          </button>
        </div>
        <ProfileBtn border="has-border" />
        <CalendarDropdown
          calendarId={calendarId}
          onShare={onShareCalendar}
        />
      </div>
    </header>
  );
}