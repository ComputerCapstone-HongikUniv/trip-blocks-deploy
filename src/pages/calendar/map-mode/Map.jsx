// src/pages/calendar/map-mode/Map.jsx
import { useState, useRef, useEffect } from "react";
import { GoogleMap } from "@react-google-maps/api";
import { MAP_ID } from "../../../api/googleMapApi.js";
import { drawMarkers } from "../../../utils/map.js";
import "./Map.css";

export default function Map({
  calendarId,
  headerInfo,
  city,
  center,
  mapCenter,
  setMapCenter,
  mode,
  recomOrSearchOrSave,
  places = [],
  events,
  mapEvents = [],
  onReSearch,
}) {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const polylinesRef = useRef([]);
  const [recommendedPlaces, setRecommendedPlaces] = useState(true);
  const [eventPlaces, setEventPlaces] = useState(true);

  // 추천/검색 모드에 따라 places 마커 표시 여부 결정
  const showPlacesOnMap =
    recomOrSearchOrSave === "recommend"
      ? recommendedPlaces          // 🔹 추천 모드 → 토글에 따라
      : recomOrSearchOrSave === "search"
        ? true                     // 🔹 검색 모드 → 항상 표시
        : recommendedPlaces;       // 🔹 기타 모드(예: save)는 일단 토글 따라가게

  /* ========= 라이프사이클 ========== */

  const handleMapLoad = (map) => {
    mapRef.current = map;
    drawMarkers({
      map,
      recomOrSearchOrSave,
      places,
      mapEvents,
      markersRef,
      polylinesRef,
      showPlaces: showPlacesOnMap,  // ✅ 이번 렌더에서 places를 그릴지
      showEvents: eventPlaces,      // ✅ 일정 마커를 그릴지
    });
  };

  const handleCenterChanged = () => {
    const map = mapRef.current;
    if (!map) return;
    const newCenter = map.getCenter();
    if (!newCenter) return;
    const { lat, lng } = newCenter.toJSON();
    setMapCenter({ lat, lng });
  };

  useEffect(() => {
    if (mode === "map" && mapRef.current) {
      drawMarkers({
        map: mapRef.current,
        recomOrSearchOrSave,
        places,
        mapEvents,
        markersRef,
        polylinesRef,
        showPlaces: showPlacesOnMap,  // ✅ 이번 렌더에서 places를 그릴지
        showEvents: eventPlaces,      // ✅ 일정 마커를 그릴지
      });
    }

    return () => {
      markersRef.current.forEach(
        (m) => m.setMap?.(null) || (m.map = null)
      );
      markersRef.current = [];

      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [places, mapEvents, mode, recomOrSearchOrSave, events,
    showPlacesOnMap,  // ✅ 토글 바뀌어도 다시 그리도록
    eventPlaces,      // ✅
  ]);

  // 지도 중심 좌표가 바뀔 때마다 로그 찍거나 다른 작업 가능
  useEffect(() => {
    if (!mapCenter) return;
    console.log("현재 지도 중심:", mapCenter.lat, mapCenter.lng);
  }, [mapCenter]);

  if (!center) {
    return <div className="main-map-wrapper">지도를 불러오는 중...</div>;
  }

  return (
    <div className="main-map-wrapper">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={center}
        zoom={12}
        options={{ mapId: MAP_ID }}
        onLoad={handleMapLoad}
        onCenterChanged={handleCenterChanged}
      />
      <button className="search-again-btn"
        onClick={() => {
          if (onReSearch) onReSearch();
        }}
      >
        이 지역 재검색
      </button>

      <div className="places-toggle">

        {recomOrSearchOrSave === "recommend" && (
          <div className="recommend-places-toggle">
            <span>추천 장소</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={recommendedPlaces}
                onChange={(e) => setRecommendedPlaces(e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
          </div>
        )}

        <div className="event-places-toggle">
          <span>일정</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={eventPlaces}
              onChange={(e) => setEventPlaces(e.target.checked)}
            />
            <span className="slider round"></span>
          </label>
        </div>
      </div>
    </div>
  );
}