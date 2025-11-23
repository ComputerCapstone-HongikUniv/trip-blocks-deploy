// src/pages/calendar/route-mode/components/RouteLegDirections.jsx
import { useState, useRef, useCallback, useEffect } from "react";
import {
  DirectionsService,
  DirectionsRenderer,
  OverlayView,
} from "@react-google-maps/api";

// 이동수단별 이모지
const MODE_EMOJI = {
  DRIVING: "🚗",
  WALKING: "🚶‍♂️",
  TRANSIT: "🚊",
  BICYCLING: "🚲",
};

// "20 mins" → "20분", "1 hour 10 mins" → "1시간 10분" 으로 변환
function toKoreanDuration(text = "") {
  let t = text;
  t = t.replace("hours", "시간").replace("hour", "시간");
  t = t.replace("mins", "분").replace("min", "분");
  return t;
}

// 지도 위에 띄울 Pill UI
const Pill = ({ text, borderColor }) => (
  <div
    style={{
      transform: "translate(-50%, -12px)",
      display: "inline-flex",
      alignItems: "center",
      whiteSpace: "nowrap",
      background: "#ffffff",
      color: "#111827",
      padding: "6px 12px",
      borderRadius: 9999,
      fontSize: 14,
      fontWeight: 700,
      letterSpacing: "0.2px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
      border: `2px solid ${borderColor ?? "rgba(0,0,0,0.2)"}`,
      pointerEvents: "none",
      userSelect: "none",
    }}
  >
    {text}
  </div>
);

/**
 * 두 이벤트 사이 1개 구간(leg)에 대한 Directions + 경로 라벨(Pill) 표시
 *
 * props:
 *  - origin: { lat, lng }
 *  - destination: { lat, lng }
 *  - travelMode: 'WALKING' | 'DRIVING' | 'TRANSIT' | ...
 *  - color: 폴리라인 색 (날짜별 색)
 *  - borderColor: 중간 Pill 테두리 색
 */
export default function RouteLegDirections({
  origin,
  destination,
  travelMode,
  color,
  borderColor,
  departureTime
}) {
  const [directions, setDirections] = useState(null);
  const [labelPos, setLabelPos] = useState(null);
  const [labelText, setLabelText] = useState("");
  const countRef = useRef(0);

  // 🔹 이동수단 / 출발·도착 좌표 / departureTime 바뀔 때마다 리셋
  useEffect(() => {
    setDirections(null);
    setLabelPos(null);
    setLabelText("");
    countRef.current = 0;
  }, [origin, destination, travelMode, departureTime]);

  const directionsCallback = useCallback(
    (result, status) => {
      console.log("[RouteLegDirections callback]", status, result);

      if (status === "OK" && result && countRef.current === 0) {
        countRef.current += 1;
        setDirections(result);

        const route = result.routes?.[0];
        const leg = route?.legs?.[0];

        if (leg) {
          const dur = leg.duration?.text || ""; // ex) "20 mins"
          const durKo = toKoreanDuration(dur); // ex) "20분"

          const mode = travelMode || "DRIVING";
          const emoji = MODE_EMOJI[mode] || "•";

          setLabelText(`${emoji} ${durKo || dur}`);

          // 중간 위치(overview_path 기준)
          const path = route.overview_path;
          if (path && path.length > 0) {
            const mid = path[Math.floor(path.length / 2)];
            setLabelPos({ lat: mid.lat(), lng: mid.lng() });
          } else if (leg.start_location && leg.end_location) {
            const a = leg.start_location;
            const b = leg.end_location;
            setLabelPos({
              lat: (a.lat() + b.lat()) / 2,
              lng: (a.lng() + b.lng()) / 2,
            });
          }
        }
      }
    },
    [travelMode]
  );

  if (!origin || !destination) return null;

  // 🔹 DirectionsService 옵션 만들기
  const mode = travelMode || "DRIVING";
  const serviceOptions = {
    origin,
    destination,
    travelMode: mode,
  };

  // TRANSIT일 때만 departureTime 적용
  if (mode === "TRANSIT" && departureTime) {
    serviceOptions.transitOptions = {
      departureTime: new Date(departureTime), // ISO 문자열 → Date 객체
    };
  }

  const rendererOptions = {
    polylineOptions: {
      strokeColor: color || "#F97316",
      strokeOpacity: 0.9,
      strokeWeight: 5,
    },
    suppressMarkers: true,
  };

  return (
    <>
      <DirectionsService
        options={serviceOptions}
        callback={directionsCallback}
      />

      {directions && (
        <>
          <DirectionsRenderer directions={directions} options={rendererOptions} />

          {labelPos && labelText && (
            <OverlayView
              position={labelPos}
              mapPaneName={OverlayView.FLOAT_PANE}
            >
              <Pill text={labelText} borderColor={borderColor} />
            </OverlayView>
          )}
        </>
      )}
    </>
  );
}