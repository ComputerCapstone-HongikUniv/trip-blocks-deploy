import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import "./MyCalendars.css";

export function MyCalendars({ calendars }) {
  const navigate = useNavigate();

  // 실제 렌더링에 사용할 캘린더 목록 (삭제 후 갱신용)
  const [calendarList, setCalendarList] = useState(calendars || []);
  // 어떤 카드의 삭제 버튼이 열려 있는지 (menu open 상태)
  const [openDeleteId, setOpenDeleteId] = useState(null);

  // 부모에서 calendars가 바뀌면 내부 state도 맞춰주기
  useEffect(() => {
    setCalendarList(calendars || []);
  }, [calendars]);

  // 삭제 버튼이 열린 상태에서 외부 클릭 시 닫기
  useEffect(() => {
    if (!openDeleteId) return; // 삭제 버튼이 열려 있을 때만 감지

    const handleClickOutside = (e) => {
      // 삭제 버튼 또는 메뉴 버튼 내부 클릭이면 유지
      if (
        e.target.closest(".calendar-delete-btn") ||
        e.target.closest(".menu-icon-btn")
      ) {
        return;
      }

      // 그 외 클릭 → 삭제 버튼 닫기
      setOpenDeleteId(null);
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [openDeleteId]);


  // 메뉴(케밥) 버튼 클릭 → 해당 카드의 삭제 버튼 토글
  const handleMenuClick = (e, calendarId) => {
    e.stopPropagation(); // 카드 클릭으로 페이지 이동되는 것 막기

    setOpenDeleteId((prev) =>
      prev === calendarId ? null : calendarId
    );
  };

  // 삭제 버튼 클릭 → API 호출 + UI에서 제거
  const handleDeleteClick = async (e, calendarId) => {
    e.stopPropagation(); // 카드 클릭 방지

    try {
      await axiosInstance.delete(`/api/calendars/${calendarId}`);

      // 삭제 성공 시 화면에서 해당 카드 제거
      setCalendarList((prev) =>
        prev.filter((c) => c.calendarId !== calendarId)
      );

      // 열려 있던 삭제 버튼도 닫기
      setOpenDeleteId(null);
    } catch (error) {
      console.error("캘린더 삭제 실패:", error);
      alert("캘린더를 삭제하지 못했어요. 잠시 후 다시 시도해 주세요.");
    }
  };

  return (
    <div className="calendar-card-container">
      {calendarList.map((calendar) => (
        <div
          key={calendar.calendarId}
          className="calendar-card"
          onClick={() => navigate(`/calendar/${calendar.calendarId}`)}
        >
          <div className="calendar-card-up-section">
            <h3 className="calendar-card-title">
              {calendar.calendarName}
            </h3>

            {/* 케밥 메뉴 + 삭제 버튼 래퍼 */}
            <div className="calendar-delete-btn-wrapper">
              <button
                type="button"
                className="menu-icon-btn"
                onClick={(e) => handleMenuClick(e, calendar.calendarId)}
              >
                <img
                  className="menu-icon-img"
                  src="icons/kebab-menu.svg"
                  alt="메뉴"
                />
              </button>

              {/* 이 카드가 열려 있을 때만 삭제 버튼 표시 */}
              {openDeleteId === calendar.calendarId && (
                <button
                  type="button"
                  className="calendar-delete-btn"
                  onClick={(e) => handleDeleteClick(e, calendar.calendarId)}
                >
                  삭제
                </button>
              )}
            </div>
          </div>

          <p className="calendar-card-date">
            {calendar.startDate} ~ {calendar.endDate}
          </p>
        </div>
      ))}
    </div>
  );
}