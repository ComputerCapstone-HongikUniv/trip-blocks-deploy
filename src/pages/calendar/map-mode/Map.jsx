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
  onPlaceMarkerClick,
}) {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const polylinesRef = useRef([]);
  const [recommendedPlaces, setRecommendedPlaces] = useState(true);
  const [eventPlaces, setEventPlaces] = useState(true);
  // 🔹 자동 줌/중심 맞추기 허용 여부
  const [shouldAutoFit, setShouldAutoFit] = useState(true);

  // 추천/검색 모드에 따라 places 마커 표시 여부 결정
  const showPlacesOnMap =
    recomOrSearchOrSave === "recommend"
      ? recommendedPlaces          // 🔹 추천 모드 → 토글에 따라
      : recomOrSearchOrSave === "search"
        ? true                     // 🔹 검색 모드 → 항상 표시
        : recommendedPlaces;       // 🔹 기타 모드(예: save)는 일단 토글 따라가게

  // 🔹 모든 places가 화면 안에 보이도록 중심/줌 자동 조정
  const fitMapToPlaces = () => {
    const map = mapRef.current;
    if (!map) return;
    if (!showPlacesOnMap) return;
    if (!shouldAutoFit) return;

    const validPlaces = (places || []).filter(
      (p) => p.latitude != null && p.longitude != null
    );
    if (validPlaces.length === 0) return;

    // 1️⃣ 마커가 1개만 있을 때
    if (validPlaces.length === 1) {
      const place = validPlaces[0];
      map.setCenter({ lat: place.latitude, lng: place.longitude });

      // 적당한 줌 (너무 확대되지 않도록 제한)
      const targetZoom = 11;     // 원하는 기본 줌
      const MAX_ZOOM = 14;       // 절대 확대 제한
      map.setZoom(Math.min(targetZoom, MAX_ZOOM));

      return; // 여기서 종료 (fitBounds 안 씀)
    }

    // 2️⃣ 마커가 2개 이상 → 기존 fitBounds 방식
    const bounds = new window.google.maps.LatLngBounds();
    validPlaces.forEach((p) => {
      bounds.extend({ lat: p.latitude, lng: p.longitude });
    });
    map.fitBounds(bounds, 200);

    // 3️⃣ fitBounds 후 과도 확대 방지 (zoom 값 제한)
    window.google.maps.event.addListenerOnce(map, "idle", () => {
      const currentZoom = map.getZoom();
      if (currentZoom > 16) {
        map.setZoom(16);   // 최대 줌 제한
      }
    });
  };

  // 지도 로드 시 mapRef에 저장
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
      onPlaceMarkerClick,
    });
    // ✅ 초기 로드 시 현재 places 기준으로 화면 맞추기
    fitMapToPlaces();
  };

  // 🔹 mapCenter 값이 바뀔 때 해당 위치로 지도 이동
  // useEffect(() => {
  //   const map = mapRef.current;
  //   if (!map) return;
  //   if (!mapCenter) return;

  //   map.panTo(mapCenter);
  // }, [mapCenter]);

  // 🔹 centerChanged → mapCenter 저장 + autoFit 끄기
  const handleCenterChanged = () => {
    const map = mapRef.current;
    if (!map) return;
    const newCenter = map.getCenter();
    if (!newCenter) return;

    const next = newCenter.toJSON();

    setMapCenter((prev) => {
      if (
        prev &&
        Math.abs(prev.lat - next.lat) < 1e-7 &&
        Math.abs(prev.lng - next.lng) < 1e-7
      ) {
        return prev;
      }
      return next;
    });

    setShouldAutoFit(false);
  };

  useEffect(() => {
    if (mode !== "map" || !mapRef.current) return;

    drawMarkers({
      map: mapRef.current,
      recomOrSearchOrSave,
      places,
      mapEvents,
      markersRef,
      polylinesRef,
      showPlaces: showPlacesOnMap,
      showEvents: eventPlaces,
      onPlaceMarkerClick,
    });

    return () => {
      markersRef.current.forEach(
        (m) => m.setMap?.(null) || (m.map = null)
      );
      markersRef.current = [];

      polylinesRef.current.forEach((p) => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [
    places,
    mapEvents,
    mode,
    recomOrSearchOrSave,
    events,
    showPlacesOnMap,
    eventPlaces,
    onPlaceMarkerClick,
  ]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (mode !== "map") return;

    fitMapToPlaces();   // 안에서 shouldAutoFit 체크함
  }, [places, recomOrSearchOrSave]);

  // 지도 중심 좌표가 바뀔 때마다 로그 찍거나 다른 작업 가능
  useEffect(() => {
    if (!mapCenter) return;
    console.log("현재 지도 중심:", mapCenter.lat, mapCenter.lng);
  }, [mapCenter]);

  // 🔹 places 목록이 바뀌면 "이번 한 번은" 자동 맞추기 허용
  useEffect(() => {
    if (places && places.length > 0) {
      setShouldAutoFit(true);
    }
  }, [places]);

  if (!center) {
    return <div className="main-map-wrapper">지도를 불러오는 중...</div>;
  }

  return (
    <div className="main-map-wrapper">
      <GoogleMap

        mapContainerStyle={{ width: "100%", height: "100%" }}

        defaultCenter={center}
        defaultZoom={12}
        options={{ mapId: MAP_ID }}
        onLoad={handleMapLoad}
        onCenterChanged={handleCenterChanged}
        onZoomChanged={() => setShouldAutoFit(false)}
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