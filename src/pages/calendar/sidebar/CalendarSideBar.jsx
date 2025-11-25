import { useState, useEffect, useRef } from "react";
import Categories from './Categories';
import PlaceList from "./PlaceList";
import searchIcon from "/icons/search-icon.svg";
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
  onSearchRequest,
  selectedPlaceId,
  setSelectedPlaceId,
  setMode,
  onFocusPlace
}) {
  const [inputText, setInputText] = useState('');   // 입력된 값
  const prevModeRef = useRef(recomOrSearchOrSave);
  useEffect(() => {
    prevModeRef.current = recomOrSearchOrSave;
  }, [recomOrSearchOrSave]);

  useEffect(() => {
    if (placeQuery) {
      setInputText(placeQuery);
    }
  }, [placeQuery]);

  function saveInputText(event) {
    const value = event.target.value;
    setInputText(event.target.value); // 상태를 현재 입력된 값으로 업데이트.
    // 사용자가 입력창을 완전히 지웠을 때
    if (value.trim() === "") {
      setRecomOrSearchOrSave("recommend");
      setSelectedPlaceId(null);   // 검색어 지우면 선택도 해제
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
            onClick={() => {
              setRecomOrSearchOrSave("recommend");
              setSelectedPlaceId(null);   // 🔹 탭 전환 시 선택 해제
            }}
          >
            검색
          </button>
          <button
            className={`search-save-btn
              ${recomOrSearchOrSave === "save" ?
                "save-btn--active" : ""
              }`}
            onClick={() => {
              setRecomOrSearchOrSave("save");
              setSelectedPlaceId(null);   // 🔹 저장 탭으로 갈 때도 선택 초기화
            }}
          >
            저장
          </button>
        </div>

        {/* 검색 탭에서만 나타남 */}
        {(recomOrSearchOrSave === "recommend" || recomOrSearchOrSave === "search") && (
          <>
            <div className="place-search-input-container">
              <img className="place-search-icon"
                src={searchIcon}
                alt="검색 아이콘" />
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
          selectedPlaceId={selectedPlaceId}
          setSelectedPlaceId={setSelectedPlaceId}
          setMode={setMode}
          onFocusPlace={onFocusPlace}
        />

      </div>
    </div>
  );
}
