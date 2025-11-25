// src/pages/calendar/map-mode/maps.js

// 날짜별 색 팔레트 (최대 7일)
export const DAY_COLORS = [
  "#F97316", // orange
  "#22C55E", // green
  "#0EA5E9", // sky
  "#A855F7", // purple
  "#EC4899", // pink
  "#EAB308", // amber
  "#6366F1", // indigo
];

// startTime: "2025-12-05T19:30" 이런 형식이라고 가정
export const getDateKey = (startTime) => {
  if (!startTime) return null;
  // "2025-12-05T19:30" -> "2025-12-05"
  return String(startTime).slice(0, 10);
};

// mapEvents를 날짜별로 묶고, 날짜/시간 정렬 + 번호, 색 부여
export const buildEventMetaList = (mapEvents = []) => {
  if (!mapEvents || mapEvents.length === 0) return [];

  const byDate = new globalThis.Map();

  mapEvents.forEach((ev) => {
    const dateKey = getDateKey(ev.startTime);
    if (!dateKey) return;

    if (!byDate.has(dateKey)) {
      byDate.set(dateKey, []);
    }
    byDate.get(dateKey).push(ev);
  });

  // 날짜 오름차순 정렬
  const sortedDateKeys = Array.from(byDate.keys()).sort();

  // 날짜 → 색 매핑
  const dateColorMap = new globalThis.Map();
  sortedDateKeys.forEach((key, idx) => {
    const color = DAY_COLORS[idx % DAY_COLORS.length];
    dateColorMap.set(key, color);
  });

  // 최종 리스트: 각 이벤트에 dateKey, order, color 붙이기
  const result = [];

  sortedDateKeys.forEach((dateKey) => {
    const list = byDate.get(dateKey);

    // 같은 날짜 안에서 startTime 기준 오름차순
    list.sort((a, b) =>
      String(a.startTime || "").localeCompare(String(b.startTime || ""))
    );

    list.forEach((ev, index) => {
      result.push({
        ...ev,
        dateKey,
        order: index + 1, // 1, 2, 3...
        color: dateColorMap.get(dateKey),
      });
    });
  });

  return result;
};

/* ========= 마커 DOM 생성 함수들 ========== */

// 분홍 하트 원형 마커 (북마크 장소)
export const createHeartMarkerContent = () => {
  const div = document.createElement("div");
  div.style.width = "28px";
  div.style.height = "28px";
  div.style.borderRadius = "50%";
  div.style.backgroundColor = "#f472b6";
  div.style.display = "flex";
  div.style.alignItems = "center";
  div.style.justifyContent = "center";
  div.style.color = "white";
  div.style.fontSize = "20px";
  div.style.fontWeight = "bold";
  div.style.boxShadow = "0 0 6px rgba(0,0,0,0.35)";
  div.style.transform = "translate(-50%, 0)";
  div.textContent = "♥";
  return div;
};

// 검정 별 원형 마커 (추천 장소 기본)
export const createStarMarkerContent = () => {
  const div = document.createElement("div");
  div.style.width = "28px";
  div.style.height = "28px";
  div.style.borderRadius = "50%";
  div.style.backgroundColor = "#444444";
  div.style.display = "flex";
  div.style.alignItems = "center";
  div.style.justifyContent = "center";
  div.style.color = "white";
  div.style.fontSize = "16px";
  div.style.fontWeight = "bold";
  div.style.boxShadow = "0 0 6px rgba(0,0,0,0.35)";
  div.style.transform = "translate(-50%, 0)";
  div.textContent = "★";
  return div;
};

// 일정용 마커: 색 있는 둥근 사각형 + 흰색 숫자
export const createEventRectMarkerContent = (order, bgColor) => {
  const div = document.createElement("div");
  div.style.minWidth = "16px";
  div.style.padding = "4px 6px";
  div.style.borderRadius = "8px";
  div.style.backgroundColor = bgColor;
  div.style.color = "#ffffff";
  div.style.display = "flex";
  div.style.alignItems = "center";
  div.style.justifyContent = "center";
  div.style.fontSize = "14px";
  div.style.fontWeight = "bold";
  div.style.boxShadow = "0 0 6px rgba(0,0,0,0.35)";
  div.textContent = String(order);
  return div;
};

/* ========= 마커 + 점선 그리기 공통 함수 ========== */

export const drawMarkers = ({
  map,
  recomOrSearchOrSave,
  places,
  mapEvents,
  markersRef,
  polylinesRef,
  showPlaces = true,
  showEvents = true,
}) => {
  if (!map) return;

  const AdvancedMarkerElement =
    window.google?.maps?.marker?.AdvancedMarkerElement;
  if (!AdvancedMarkerElement || !window.google?.maps?.Polyline) {
    console.warn("AdvancedMarkerElement or Polyline is not available.");
    return;
  }

  // 🔹 기존 마커 제거
  markersRef.current.forEach(
    (marker) => marker.setMap?.(null) || (marker.map = null)
  );
  markersRef.current = [];

  // 🔹 기존 점선(polyline) 제거
  polylinesRef.current.forEach((poly) => poly.setMap(null));
  polylinesRef.current = [];

  // 모드별 플래그
  const isSearchMode = recomOrSearchOrSave === "search";
  const isRecommendMode = recomOrSearchOrSave === "recommend";
  // 나머지 값은 전부 '저장(북마크)' 탭으로 취급
  const isBookmarkedMode = !isSearchMode && !isRecommendMode;

  const PLACE_Z = isSearchMode ? 20 : 10;
  const EVENT_Z = isSearchMode ? 10 : 20;
  const LINE_Z = EVENT_Z - 1; // 점선은 일정 마커 바로 아래 레이어

  /* ----- 1) 장소 마커 그리기 ----- */
  if (showPlaces) {                        // ✅ 토글 플래그 반영
    places.forEach((place) => {
      let content = null;

      if (isSearchMode) {
        // search 모드: 기본 마커 (content = null)
        content = null;
      } else if (isBookmarkedMode) {
        // bookmarked 모드: 전부 하트 마커
        content = createHeartMarkerContent();
      } else if (isRecommendMode) {
        // recommend 모드: 북마크면 하트, 아니면 별
        content = place.bookmarked
          ? createHeartMarkerContent()
          : createStarMarkerContent();
      }

      const marker = new AdvancedMarkerElement({
        map,
        position: { lat: place.latitude, lng: place.longitude },
        title: place.placeName,
        ...(content && { content }),
        zIndex: PLACE_Z,
      });

      marker.addListener("click", () => {
        alert(`장소: ${place.placeName}`);
      });

      markersRef.current.push(marker);
    });
  }

  /* ----- 2) 일정 마커 + 3) 점선 그리기 ----- */

  let eventMetaList = [];
  if (showEvents) {                        // ✅ 일정 토글 플래그 반영
    eventMetaList = buildEventMetaList(mapEvents);

    // 2) 일정 마커
    eventMetaList.forEach((ev) => {
      if (ev.latitude == null || ev.longitude == null) return;

      const content = createEventRectMarkerContent(ev.order, ev.color);

      const marker = new AdvancedMarkerElement({
        map,
        position: { lat: ev.latitude, lng: ev.longitude },
        title: ev.eventName || ev.placeName || "",
        content,
        zIndex: EVENT_Z,
      });

      marker.addListener("click", () => {
        console.log("이벤트 클릭:", ev.eventId, ev.startTime);
      });

      markersRef.current.push(marker);
    });

    // 3) 날짜별 일정들을 점선으로 연결하기
    const dateGroups = new window.Map();

    // eventMetaList는 이미 날짜/시간 순서로 정렬돼 있음
    eventMetaList.forEach((ev) => {
      if (!ev.dateKey) return;
      if (ev.latitude == null || ev.longitude == null) return;

      if (!dateGroups.has(ev.dateKey)) {
        dateGroups.set(ev.dateKey, []);
      }
      dateGroups.get(ev.dateKey).push(ev);
    });

    dateGroups.forEach((eventsOfDay) => {
      if (eventsOfDay.length < 2) return; // 한 개면 연결할 게 없음

      const color = eventsOfDay[0].color;
      const path = eventsOfDay.map((ev) => ({
        lat: ev.latitude,
        lng: ev.longitude,
      }));

      // "짧은 선분" 하나의 모양 정의 (대시 길이 조절 가능)
      const lineSymbol = {
        path: "M 0,-1 0,1",
        strokeOpacity: 1,
        strokeColor: color, // 날짜 색과 맞추기
        scale: 3,
      };

      // 점선 Polyline 생성 (lineSymbol 반복으로 점선 효과)
      const polyline = new window.google.maps.Polyline({
        map,
        path,
        strokeColor: color,
        strokeOpacity: 0.3,
        strokeWeight: 2,
        zIndex: LINE_Z,
        icons: [
          {
            icon: lineSymbol,
            offset: "0",
            repeat: "18px",
          },
        ],
      });

      polylinesRef.current.push(polyline);
    });

    console.log("마커 + 점선 갱신 완료:", {
      placeCount: places.length,
      eventCount: eventMetaList.length,
      lineGroups: dateGroups.size,
    });
  } else {
    // 이벤트 숨김일 때도 로그 정도는 남겨도 됨
    console.log("마커 갱신 완료(이벤트/점선 숨김):", {
      placeCount: places.length,
      eventCount: 0,
      lineGroups: 0,
    });
  }
};