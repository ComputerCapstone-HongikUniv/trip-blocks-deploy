import { useState, useEffect, useRef } from "react";
import Categories from './Categories';
import PlaceList from "./PlaceList";
import './CalendarSideBar.css';

export default function CalendarSideBar({
  sideOpen,
  recomOrSearchOrSave,
  setRecomOrSearchOrSave,
  placeQuery,
  setPlaceQuery,
  category,
  setCategory,
  places,
  fetchBookmarkedPlaces,
  sortType,
  setSortType,
  calendarId,
  setMakeGEventMode,
  setSelectedPlaceForGEvent,
  onSearchRequest
}) {
  const [inputText, setInputText] = useState('');   // 입력된 값
  const prevModeRef = useRef(recomOrSearchOrSave);
  useEffect(() => {
    prevModeRef.current = recomOrSearchOrSave;
  }, [recomOrSearchOrSave]);

  function saveInputText(event) {
    const value = event.target.value;
    setInputText(event.target.value); // 상태를 현재 입력된 값으로 업데이트.
    // 사용자가 입력창을 완전히 지웠을 때
    if (value.trim() === "") {
      setRecomOrSearchOrSave("recommend");
    }
  }

  function placeSearch() {         // 실제 검색 실행
    if (!inputText.trim()) return; // 빈 문자열 방지
    setPlaceQuery(inputText);     // 입력된 값으로 검색어 설정
    setRecomOrSearchOrSave("search");
    // 🔥 여기에서 직접 검색 실행 요청
    onSearchRequest();
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      placeSearch();
    }
  }

  useEffect(() => {
    if (!placeQuery) return;
    // console.log('장소 검색 쿼리:', placeQuery);
  }, [placeQuery]);

  return (
    <div className={`calender-sidebar ${sideOpen
      ? "calender-sidebar--open" : ""}`}>
      <div className="calender-sidebar-inner">

        {/* 상단 탭 */}
        <div className="search-save-options">
          <button
            className={`search-save-btn 
              ${(recomOrSearchOrSave === "recommend" || recomOrSearchOrSave === "search")
                ? "search-btn--active"
                : ""
              }`}
            onClick={() => setRecomOrSearchOrSave("recommend")}
          >
            검색
          </button>
          <button
            className={`search-save-btn
              ${recomOrSearchOrSave === "save" ?
                "save-btn--active" : ""
              }`}
            onClick={() => setRecomOrSearchOrSave("save")}
          >
            저장
          </button>
        </div>

        {/* 검색 탭에서만 나타남 */}
        {(recomOrSearchOrSave === "recommend" || recomOrSearchOrSave === "search") && (
          <>
            <div className="place-search-input-container">
              <img className="place-search-icon" src="/icons/search-icon.svg" />
              <input
                placeholder="장소 검색"
                size={38}
                onChange={saveInputText}
                onKeyDown={handleKeyDown}
                value={inputText}
                className="place-search-input"
              />
            </div>
          </>
        )}

        <Categories
          category={category}
          setCategory={setCategory}
          sortType={sortType}
          setSortType={setSortType}
          recomOrSearchOrSave={recomOrSearchOrSave}
        />
        <PlaceList
          places={places}
          calendarId={calendarId}
          fetchBookmarkedPlaces={fetchBookmarkedPlaces}
          setMakeGEventMode={setMakeGEventMode}
          setSelectedPlaceForGEvent={setSelectedPlaceForGEvent}
        />

      </div>
    </div>
  );
}
