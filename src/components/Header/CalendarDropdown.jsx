// src/components/MenuButton.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import kebabIcon from "/icons/kebab-menu.svg";
import "./MypageDropdown.css";

export default function CalendarDropdown({ calendarId, onShare }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  const toggleMenu = () => setOpen(prev => !prev);

  // 바깥 클릭하면 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="menu-wrapper" ref={wrapperRef}>
      <button className="menu-icon-btn" onClick={toggleMenu}>
        <img className="menu-icon-img" src={kebabIcon} />
      </button>

      {open && (
        <div className="menu-panel">
          <button className="menu-item"
            onClick={() =>
              navigate(`/calendar/${calendarId}/setting`)
            }>
            설정
          </button>

          <button
            className="menu-item"
            onClick={() => {
              if (onShare) onShare();   // ✅ 공유 실행
              setOpen(false);           // 메뉴 닫기
            }}
          >
            공유
          </button>
        </div>
      )}
    </div>
  );
}