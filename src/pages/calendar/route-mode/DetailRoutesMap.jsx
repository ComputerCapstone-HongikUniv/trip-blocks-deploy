// src/pages/calendar/route-mode/DetailRoutesMap.jsx
import { useEffect, useRef } from "react";
import { GoogleMap } from "@react-google-maps/api";
import { MAP_ID } from "../../../api/googleMapApi.js";
import {
  buildEventMetaList,
  createEventRectMarkerContent,
} from "../../../utils/map.js";
import RouteLegDirections from "./RouteLegDirections.jsx";
import "./DetailRoutesMap.css";

// 공통: startTime → "YYYY-MM-DD"
const getDateKey = (startTime) => {
  if (!startTime) return null;
  return String(startTime).slice(0, 10);
};

// 상세 경로 지도에 일정 번호 마커 찍기
function drawEventMarkersOnDetailRoutesMap(map, eventsForMarkers, markersRef, dateColorMap) {
  if (!map) return;

  // 1) 기존 마커 모두 제거
  markersRef.current.forEach(
    (m) => m.setMap?.(null) || (m.map = null)
  );
  markersRef.current = [];

  // 2) 그릴 이벤트가 없으면 여기서 끝
  if (!eventsForMarkers || eventsForMarkers.length === 0) return;

  const AdvancedMarkerElement =
    window.google?.maps?.marker?.AdvancedMarkerElement;
  if (!AdvancedMarkerElement) {
    console.warn("AdvancedMarkerElement is not available.");
    return;
  }

  // 3) 기존 메타 생성
  const eventMetaList = buildEventMetaList(eventsForMarkers);

  // 🔹 4) 날짜 기준으로 color 덮어쓰기
  if (dateColorMap) {
    eventMetaList.forEach((ev) => {
      const dateKey = ev.startTime
        ? String(ev.startTime).slice(0, 10)
        : null;
      const color = dateKey ? dateColorMap.get(dateKey) : null;
      if (color) {
        ev.color = color;   // 여기서 강제로 날짜 색으로 통일
      }
    });
  }

  // 5) AdvancedMarkerElement 생성
  eventMetaList.forEach((ev) => {
    if (ev.latitude == null || ev.longitude == null) return;

    const content = createEventRectMarkerContent(ev.order, ev.color);

    const marker = new AdvancedMarkerElement({
      map,
      position: { lat: ev.latitude, lng: ev.longitude },
      title: ev.eventName || ev.placeName || "",
      content,
      zIndex: 30,
    });

    marker.addListener("click", () => {
      console.log("상세경로 이벤트 클릭:", ev.id || ev.eventId, ev.startTime);
    });

    markersRef.current.push(marker);
  });
}

export default function DetailRoutesMap({
  center,
  events,
  selectedDateKey,
  routeLegs,
  dateColorMap
}) {
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const handleMapLoad = (map) => {
    mapRef.current = map;
  };

  // 🔹 상세 경로 지도에 일정 번호 마커 찍기 (선택된 날짜만 / 전체)
  useEffect(() => {
    if (!mapRef.current) return;
    if (!events || !events.length) return;

    const eventsForMarkers =
      selectedDateKey == null
        ? events
        : events.filter((ev) => getDateKey(ev.startTime) === selectedDateKey);

    drawEventMarkersOnDetailRoutesMap(
      mapRef.current,
      eventsForMarkers,
      markersRef,
      dateColorMap
    );
  }, [events, selectedDateKey, dateColorMap]);

  if (!center) {
    return <div className="route-map-loading">지도를 불러오는 중...</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "100%" }}
      center={center}
      zoom={12}
      options={{ mapId: MAP_ID }}
      onLoad={handleMapLoad}
    >
      {routeLegs.map((leg) => (
        <RouteLegDirections
          key={leg.id}
          origin={leg.origin}
          destination={leg.destination}
          travelMode={leg.travelMode}
          color={leg.color}
          borderColor={leg.color} // pill 테두리 색 = 날짜 색
          departureTime={leg.departureTime}
        />
      ))}
    </GoogleMap>
  );
}