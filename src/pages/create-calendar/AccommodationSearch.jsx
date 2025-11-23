import { useEffect } from 'react';
import './AccommodationSearch.css';

export default function AccommodationSearch({ inputText, setInputText, accommodationQuery, setAccommodationQuery }) {
  function saveInputText(event) {
    // inputText 상태를 현재 입력한 값으로 업데이트해라.
    setInputText(event.target.value);
    // console.log(inputText);
  }

  function accommodationSearch() {
    setAccommodationQuery(inputText);
    setInputText('');   // update the inputText empty
  }

  useEffect(() => {
    if (!accommodationQuery) return;
    // console.log('검색할 숙소 키워드:', accommodationQuery);
  }, [accommodationQuery]);

  return (
    <div className="accommodation-search">
      <input
        placeholder="숙소 검색"
        size="50"
        onChange={saveInputText}
        value={inputText}
        className="accommodation-search-input"
      />
      <button
        onClick={accommodationSearch}
        className="accommodation-search-button"
      >
        <img className="search-icon" src="icons/search-icon.svg"></img>
      </button>
    </div>
  );
}