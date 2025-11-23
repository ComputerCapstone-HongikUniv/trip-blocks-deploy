// Calendar/CalendarSidebar/PlaceList/PlaceCard.jsx
import { useState, useEffect } from 'react';
import axiosInstance from '../../../api/axiosInstance.js';
import { getPhotoUrl } from '../../../api/googleMapApi.js';
import { getCategoryKor } from '../../../utils/category';
import './PlaceCard.css';
import './PlaceDetail.css';

export default function PlaceCard({
  place,
  calendarId,
  fetchBookmarkedPlaces,
  setMakeGEventMode,
  setSelectedPlaceForGEvent
}) {
  const [isPlaceCardOpen, setIsPlaceCardOpen] = useState(false); // 이 카드만 열려 있는지
  const [detail, setDetail] = useState(null);  // 이 카드의 상세 정보
  const [loading, setLoading] = useState(false); // 상세 정보 로딩 중인지
  const [error, setError] = useState(null);      // 에러 메시지
  const [bookmarked, setBookmarked] = useState(place.bookmarked);
  const photoUrl = getPhotoUrl(place.photoReference);

  // place.bookmarked가 바뀌면 로컬 상태도 동기화 (리스트 리로드 시 안전)
  useEffect(() => {
    setBookmarked(place.bookmarked);
  }, [place.bookmarked]);

  async function handleCardOpen() {
    // 열려고 하는 순간, 아직 상세 데이터를 안 받았다면 fetch
    if (!isPlaceCardOpen && !detail) {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get(`/api/calendars/${calendarId}/places?placeId=${place.placeId}`);
        setDetail(response.data);
      } catch (err) {
        setError('장소 정보를 불러오지 못했어요.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    // 열려 있으면 닫고, 닫혀 있으면 연다
    setIsPlaceCardOpen((prev) => !prev);
  }

  // 토글 북마크
  const toggleBookmark = async () => {
    try {
      if (!bookmarked) {
        // ✅ 북마크 추가 (POST + body에 placeId)
        await axiosInstance.post(
          `/api/calendars/${calendarId}/places`,
          {
            placeId: place.placeId
          }
        );
      } else {
        // ❓ 북마크 해제 부분은 명세 안 바뀌었다고 가정
        // 기존처럼 쿼리 파라미터 / 혹은 백엔드 명세에 맞게만 유지하면 돼
        await axiosInstance.delete(
          `/api/calendars/${calendarId}/places?placeId=${place.placeId}`
        );
      }

      // 서버 기준 상태 다시 동기화
      fetchBookmarkedPlaces();
    } catch (err) {
      console.error('북마크 토글 실패:', err);
      // alert('북마크를 변경하는 데 실패했어요.');
    }
  };

  // 하트 / 플러스 버튼 눌렀을 때 카드 토글이 안 되도록
  function handleBookmarkClick(e) {
    e.stopPropagation();
    toggleBookmark();
  }

  // detail 이 있으면 그걸 우선 사용, 없으면 기본 place 정보 사용
  const display = detail || place;

  async function handleMakeEventClick(e) {
    e.stopPropagation();
    try {
      const response = await axiosInstance.get(
        `/api/calendars/${calendarId}/places?placeId=${place.placeId}`
      );
      setSelectedPlaceForGEvent(response.data);
      setMakeGEventMode(true);
    } catch (err) {
      console.error('장소 상세 정보 불러오기 실패(이벤트 만들기):', err);
    }
  }

  async function handleDragStart(e) {
    // 이 드래그가 "장소 드래그"라는 걸 표시
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ placeId: place.placeId })
    );
    e.dataTransfer.setData('text/plain', place.placeId);

    try {
      // 드래그 시작 시 미리 상세정보를 받아서 Calendar 쪽 상태에 심어 둔다
      const response = await axiosInstance.get(
        `/api/calendars/${calendarId}/places?placeId=${place.placeId}`
      );
      setSelectedPlaceForGEvent(response.data);   // ✅ 선택된 장소만 세팅
      console.log('dragStart place detail:', response.data);

      // ❌ 여기서는 makeGEventMode 켜지 말기
      // setMakeGEventMode(true);  <- 이 줄은 삭제!
    } catch (err) {
      console.error('드래그 시작 시 장소 상세 정보 불러오기 실패:', err);
    }
  }


  function handleDragEnd() {
    // 드래그가 끝났으면 어디에 드롭했든 모드/선택 장소 초기화
    setMakeGEventMode(false);
    setSelectedPlaceForGEvent(null);
  }

  return (
    <>
      {!isPlaceCardOpen ? (
        // 기본 카드 모드
        <div className="place-card-closed"
          draggable="true"
          onClick={handleCardOpen}
          onDragStart={handleDragStart}
        // onDragEnd={handleDragEnd}
        >
          {photoUrl ? (
            <img
              className="place-card-img"
              src={photoUrl}
              alt={display.placeName}
            />
          ) : (
            <div className="place-card-img placeholder">
              이미지 없음
            </div>
          )}

          <div className="place-card-info">
            <div className="place-card-upper-container">
              <div className="place-card-name-container">
                <h4 className="place-card-name">{display.placeName}</h4>
                <div className="place-card-category">
                  {getCategoryKor(display.category)}
                </div>
              </div>
            </div>

            <div className="place-card-bottom-container">
              <div className="place-card-rating-comment-container">
                <div className="place-card-rating">★ {display.rating}</div>
                <div className="place-card-comment">
                  리뷰 {display.commentNum?.toLocaleString() ?? 0}
                </div>
              </div>

              <div className="bookmark-make-event-container">
                <button className="bookmark-btn" onClick={handleBookmarkClick}>
                  <img
                    src={
                      bookmarked
                        ? '/icons/heart-filled.svg'
                        : '/icons/heart-outline.svg'
                    }
                    alt="bookmark"
                    className="bookmark-icon-img"
                  />
                </button>
                <button
                  className="make-event-btn"
                  onClick={handleMakeEventClick}
                >
                  <img
                    className="plus-btn-img"
                    src="/icons/plus-icon-gray.png"
                    alt="plus"
                  />
                </button>
                <button onClick={handleCardOpen}>
                  <img className="place-detail-open-img" src="/icons/down-arrow.png" alt="장소 상세 정보 닫기" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="place-detail-container">
          {photoUrl ? (
            <img
              className="place-detail-img"
              src={photoUrl}
              alt={display.placeName}
            />
          ) : (
            <div className="place-detail-img placeholder">
              이미지 없음
            </div>
          )}

          <div className="place-detail-info">
            <div className="place-detail-upper-container">
              <div className="place-detail-name-container">
                <h4 className="place-detail-name">{display.placeName}</h4>
                <p className="place-detail-category">
                  {getCategoryKor(display.category)}
                </p>
              </div>
            </div>

            {loading && <div className="place-detail-loading">불러오는 중...</div>}
            {error && <div className="place-detail-error">{error}</div>}

            {!loading && !error && (
              <>
                <div className="place-detail-rating-review">
                  <span className="place-detail-rating">
                    ★ {display.rating}</span>
                  <span className="place-detail-rating">
                    리뷰 {display.commentNum?.toLocaleString() ?? 0}</span>
                </div>

                <div className="place-detail-bottom">
                  <div className="place-detail-row">
                    <img className="place-detail-icon-img" src='/icons/location-icon.svg' />
                    <span>{display.address}</span>
                  </div>

                  <div className="place-detail-row">
                    <img className="place-detail-icon-img" src="/icons/clock-icon.svg" />
                    <div className="place-detail-opening-hours">
                      {display.formattedOpeningHours.map((line, index) => (
                        <div key={index}>{line}</div>
                      ))}
                    </div>
                  </div>

                  <div className="place-detail-row">
                    <img className="place-detail-icon-img-phone" src='/icons/phone-icon.svg' />
                    <span>{display.phoneNumber}</span>
                  </div>
                </div>



                <div className="detail-bookmark-make-event-container">
                  <button className="bookmark-btn" onClick={handleBookmarkClick}>
                    <img
                      src={
                        bookmarked
                          ? '/icons/heart-filled.svg'
                          : '/icons/heart-outline.svg'
                      }
                      alt="bookmark"
                      className="bookmark-icon-img"
                    />
                  </button>
                  <button className="make-event-btn"
                    onClick={handleMakeEventClick}
                  >
                    <img
                      className="plus-btn-img"
                      src="/icons/plus-icon-gray.png"
                      alt="plus"
                    />
                  </button>
                  <button onClick={handleCardOpen}>
                    <img className="place-detail-close-img" src="/icons/down-arrow.png" alt="장소 상세 정보 닫기" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )

      }
    </>
  );
}
