import { useState, useEffect, useRef } from 'react';
import './Categories.css';
import './SortDropdown.css';

export default function Categories({
  category,
  setCategory,
  sortType,
  setSortType,
  recomOrSearchOrSave
}) {
  const [sortSelectOpen, setSortSelectOpen] = useState(false);
  const wrapperRef = useRef(null);

  // 메뉴 열기/닫기
  const toggleMenu = () => setSortSelectOpen(prev => !prev);

  // 카테고리 클릭 (같은 버튼은 토글)
  const handleCategoryClick = (id) => {
    setCategory(prev => (prev === id ? null : id));
  };

  // 정렬 버튼 클릭 (같은 버튼 다시 누르면 해제)
  const handleSortClick = (type) => {
    // setSortType(prev => (prev === type ? null : type));
    setSortType(type);
    setSortSelectOpen(false);
  };

  // 바깥 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setSortSelectOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="place-category-container">
      <h4>
        {recomOrSearchOrSave === "recommend"
          ? "추천 장소"
          : recomOrSearchOrSave === "search"
            ? "검색 결과"
            : ""}
      </h4>

      <div className="categories">
        {/* 카테고리 버튼 */}
        <button
          className={`category ${category === "attraction" ? "category--active" : ""}`}
          onClick={() => handleCategoryClick("attraction")}
        >명소</button>

        <button
          className={`category ${category === "restaurant" ? "category--active" : ""}`}
          onClick={() => handleCategoryClick("restaurant")}
        >음식점</button>

        <button
          className={`category ${category === "cafe" ? "category--active" : ""}`}
          onClick={() => handleCategoryClick("cafe")}
        >카페</button>

        {/* 정렬 드롭다운 */}
        <div className="sort-btn-wrapper" ref={wrapperRef}>
          {/* 선택된 정렬이 없을 때 */}
          {!sortType && (
            <button className="sort-btn" onClick={toggleMenu}>
              <img className="sort-btn-img" src="/icons/sort-icon.png" />
            </button>
          )}

          {/* 선택된 정렬이 있을 때 */}
          {sortType && (
            <div className="sort-selected" onClick={toggleMenu}>
              <span className="sort-selected-label">
                {sortType === "rating" ? "평점순" : "리뷰순"}
              </span>
              <button
                className="sort-clear-btn"
                onClick={(e) => {
                  e.stopPropagation();        // 부모 클릭 막기
                  setSortType(null);         // 정렬 해제
                  setSortSelectOpen(false);  // 메뉴 닫기
                }}
              >
                ×
              </button>
            </div>
          )}

          {/* 드롭다운 */}
          {sortSelectOpen && (
            <div className="sort-menu-panel">
              <button
                className={`sort-menu-item ${sortType === "rating" ? "sort-menu-item--active" : ""}`}
                onClick={() => handleSortClick("rating")}
              >
                평점순
              </button>
              <button
                className={`sort-menu-item ${sortType === "review" ? "sort-menu-item--active" : ""}`}
                onClick={() => handleSortClick("review")}
              >
                리뷰순
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}