// src/pages/calendar/map-mode/Map.jsx
import { useState, useRef, useEffect } from "react";
import { GoogleMap } from "@react-google-maps/api";
import { MAP_ID } from "../../../api/googleMapApi.js";
import { drawMarkers } from "../../../utils/map.js";   // 🔹 방금 만든 유틸 함수 import
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
}) {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const polylinesRef = useRef([]);

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
  }, [places, mapEvents, mode, recomOrSearchOrSave, events]);

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
    </div>
  );
}