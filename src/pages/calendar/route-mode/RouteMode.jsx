// src/pages/calendar/route-mode/RouteMode.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo, useRef } from "react";
import dayjs from "dayjs";
import axiosInstance from "../../../api/axiosInstance.js";
import { ALL_CITY_CONFIG } from "../../../utils/cityConfig.js";
import { formatKoreanDate } from "../../../utils/formatDate.js";
import { DAY_COLORS } from "../../../utils/map.js";
import { getTransportationInfo } from "../../../utils/transportations.js";
import DetailRoutesMap from "./DetailRoutesMap.jsx";
import "./DetailRoutesMap.css";

const TRAVEL_MODE_MAP = {
  walking: "WALKING",
  bicycling: "BICYCLING",
  transit: "TRANSIT",
  driving: "DRIVING",
};

// 공통: startTime → "YYYY-MM-DD"
const getDateKey = (startTime) => {
  if (!startTime) return null;
  return String(startTime).slice(0, 10);
};

// startDate ~ endDate 사이의 날짜 리스트 생성
const buildDateRange = (start, end) => {
  const result = [];
  let current = new Date(start);
  const last = new Date(end);

  while (current <= last) {
    const year = current.getFullYear();
    const month = current.getMonth() + 1;
    const date = current.getDate();

    const dayIndex = current.getDay(); // 0~6
    const dayNames = [
      "일요일",
      "월요일",
      "화요일",
      "수요일",
      "목요일",
      "금요일",
      "토요일",
    ];

    const key = `${year}-${String(month).padStart(2, "0")}-${String(
      date
    ).padStart(2, "0")}`;

    result.push({
      key, // "YYYY-MM-DD"
      month,
      date,
      dayName: dayNames[dayIndex],
    });

    current.setDate(current.getDate() + 1);
  }
  return result;
};

const getEventKey = (ev) => ev.id ?? ev.eventId;

export default function RouteMode() {
  const navigate = useNavigate();
  const { calendarId } = useParams();

  const [selectedDateKey, setSelectedDateKey] = useState(null); // null = 전체 일정
  const [isDayDropdownOpen, setIsDayDropdownOpen] = useState(true);

  const [headerInfo, setHeaderInfo] = useState(null);
  const [dayList, setDayList] = useState([]);
  const [cityCenter, setCityCenter] = useState(null);
  const [events, setEvents] = useState([]);

  const [nextTransportPanel, setNextTransportPanel] = useState(false);
  const [targetEventIdForTransport, setTargetEventIdForTransport] =
    useState(null);
  const nextPanelRef = useRef(null);

  // headerInfo fetch
  useEffect(() => {
    if (headerInfo) return;
    const fetchHeaderInfo = async () => {
      const response = await axiosInstance.get(
        `/api/calendars/${calendarId}/calendar-header`
      );
      setHeaderInfo(response.data);
    };
    fetchHeaderInfo();
  }, [calendarId, headerInfo]);

  const city = headerInfo?.city ?? null;
  const cityConfig = ALL_CITY_CONFIG.find((c) => c.id === city);
  const transportations = cityConfig?.transportation ?? [];

  // dayList + 날짜별 색 할당
  useEffect(() => {
    if (!headerInfo) return;
    const dates = buildDateRange(headerInfo.startDate, headerInfo.endDate);

    const coloredList = dates.map((d, idx) => ({
      ...d,
      color: DAY_COLORS[idx % DAY_COLORS.length],
    }));


    setDayList(coloredList);
  }, [headerInfo]);

  // 도시 중심 좌표 설정
  useEffect(() => {
    if (!headerInfo) return;
    const selectedCity = ALL_CITY_CONFIG.find((c) => c.id === headerInfo.city);
    if (selectedCity) {
      setCityCenter(selectedCity.center);
    }
  }, [headerInfo]);

  // 상세 경로용 일정 리스트 조회
  useEffect(() => {
    const fetchEvents = async () => {
      const response = await axiosInstance.get(
        `/api/calendars/${calendarId}/route-detail`
      );
      console.log("route-detail events:", response.data);
      setEvents(response.data || []);
    };
    fetchEvents();
  }, [calendarId]);

  // 날짜별 색상을 빠르게 찾기 위한 Map
  const dateColorMap = useMemo(() => {
    const map = new Map();
    dayList.forEach((d) => {
      map.set(d.key, d.color);
    });
    return map;
  }, [dayList]);

  // events → 날짜별 정렬 + 구간(route legs) 만들기
  const routeLegs = useMemo(() => {
    if (!events || events.length === 0) return [];

    const eventsByDate = new Map();
    events.forEach((event) => {
      const dateKey = getDateKey(event.startTime);
      if (!dateKey) return;
      if (event.latitude == null || event.longitude == null) return;

      if (!eventsByDate.has(dateKey)) {
        eventsByDate.set(dateKey, []);
      }
      eventsByDate.get(dateKey).push(event);
    });

    const legs = [];
    let legSeq = 0;

    Array.from(eventsByDate.keys())
      .sort()
      .forEach((dateKey) => {
        const eventsOfOneDay = eventsByDate.get(dateKey);
        eventsOfOneDay.sort((a, b) =>
          String(a.startTime || "").localeCompare(String(b.startTime || ""))
        );

        const color = dateColorMap.get(dateKey) || "#F97316";

        for (let i = 0; i < eventsOfOneDay.length - 1; i++) {
          const departure = eventsOfOneDay[i];
          const arrival = eventsOfOneDay[i + 1];

          const travelMode =
            TRAVEL_MODE_MAP[departure.nextTransportation] || "TRANSIT";

          // 이전 일정의 끝나는 시간 (없으면 시작 시간 fallback)
          const departureTimeForTransit =
            departure.endTime || departure.startTime || null;


          legSeq += 1;

          legs.push({
            id: `leg-${dateKey}-${legSeq}`,
            dateKey,
            color,
            travelMode,
            origin: {
              lat: departure.latitude,
              lng: departure.longitude,
            },
            destination: {
              lat: arrival.latitude,
              lng: arrival.longitude,
            },
            // 🔹 나중에 DirectionsService에서 쓸 departureTime
            departureTime: departureTimeForTransit,
          });
        }
      });

    console.log("routeLegs:", legs);
    return legs;
  }, [events, dateColorMap]);

  // 현재 선택된 날짜 객체
  const selectedDay = useMemo(
    () => dayList.find((d) => d.key === selectedDateKey) || null,
    [dayList, selectedDateKey]
  );

  // 선택된 날짜의 일정 목록
  const eventsOfSelectedDay = useMemo(() => {
    if (!selectedDateKey) return [];
    return events
      .filter((ev) => getDateKey(ev.startTime) === selectedDateKey)
      .sort((a, b) =>
        String(a.startTime || "").localeCompare(String(b.startTime || ""))
      );
  }, [events, selectedDateKey]);

  // 선택된 날짜의 구간(legs)
  const legsOfSelectedDay = useMemo(() => {
    if (!selectedDateKey) return [];
    return routeLegs.filter((leg) => leg.dateKey === selectedDateKey);
  }, [routeLegs, selectedDateKey]);

  // 지도에 실제로 렌더할 legs (전체 / 특정 날짜)
  const visibleLegs =
    selectedDateKey == null
      ? routeLegs
      : routeLegs.filter((leg) => leg.dateKey === selectedDateKey);

  // 몇 일차인지 (1, 2, 3...)
  const dayIndex = useMemo(() => {
    if (!selectedDateKey) return null;
    const idx = dayList.findIndex((d) => d.key === selectedDateKey);
    return idx >= 0 ? idx + 1 : null;
  }, [dayList, selectedDateKey]);

  // 이동수단 선택 패널 열고 닫기
  function toggleNextTransportPanel(eventKey) {
    // 같은 이벤트 다시 클릭하면 닫기
    setNextTransportPanel((prev) =>
      prev && targetEventIdForTransport === eventKey ? false : true
    );
    setTargetEventIdForTransport(eventKey);
  }

  // 이후 일정까지의 이동수단 선택 + 백엔드 UPDATE
  async function handleSelectNextTransport(eventKey, transport, warningId) {
    setNextTransportPanel(false);

    // warningId가 없으면 API 호출 불가능하니까 그냥 프론트만 업데이트
    if (!warningId) {
      console.warn("warningId가 없어서 백엔드 UPDATE는 생략합니다.", {
        eventKey,
        transport,
      });

      setEvents((prev) =>
        prev.map((ev) =>
          getEventKey(ev) === eventKey
            ? { ...ev, nextTransportation: transport.id }
            : ev
        )
      );
      return;
    }

    // 1) 프론트 상태 먼저 업데이트 (낙관적 업데이트)
    setEvents((prev) =>
      prev.map((ev) =>
        getEventKey(ev) === eventKey
          ? { ...ev, nextTransportation: transport.id }
          : ev
      )
    );

    try {
      // 2) 백엔드 UPDATE 호출
      await axiosInstance.put(
        `/api/calendars/${calendarId}/route-detail/events/${warningId}`,
        {
          transportation: transport.id, // e.g. "walking" / "driving" / "transit" / "bicycling"
        }
      );

      // 3) (선택) 서버 기준 최신 데이터로 다시 맞추고 싶으면 재조회
      const refreshed = await axiosInstance.get(
        `/api/calendars/${calendarId}/route-detail`
      );
      setEvents(refreshed.data || []);
    } catch (error) {
      console.error("이동수단 UPDATE 실패:", error);

      // 실패했을 때 롤백하고 싶으면 이 부분에서 다시 재조회하거나,
      // 이전 상태를 저장해 두고 복원하는 로직을 넣어도 된다.
      const refreshed = await axiosInstance.get(
        `/api/calendars/${calendarId}/route-detail`
      );
      setEvents(refreshed.data || []);
    }
  }
  if (!headerInfo) {
    return <div>상세 경로 정보를 불러오는 중...</div>;
  }

  return (
    <div className="route-view-container">
      <div className="route-info">
        <div className="route-title-wrapper">
          <h2 className="route-title">{headerInfo.calendarName}</h2>
          <p className="route-date">
            {formatKoreanDate(headerInfo.startDate)} -{" "}
            {formatKoreanDate(headerInfo.endDate)}
          </p>
        </div>

        <div
          className={`detail-route-container ${selectedDay ? "detail-route-container--active" : ""
            }`}
        >
          {/* 날짜 선택 영역 */}
          <div
            className={`routes-select ${selectedDay ? "routes-select--active" : ""
              }`}
          >
            <div
              className={`selected-routes ${selectedDay ? "selected-routes--active" : ""
                }`}
            >
              {selectedDay
                ? `${selectedDay.month}.${selectedDay.date}. ${selectedDay.dayName}`
                : "전체 일정 경로"}

              {selectedDay && (
                <button
                  type="button"
                  className={`day-dropdown-toggle ${selectedDay ? "day-dropdown-toggle--active" : ""
                    }`}
                  onClick={() => setIsDayDropdownOpen((prev) => !prev)}
                >
                  <span
                    className={`day-dropdown-arrow ${isDayDropdownOpen ? "open" : ""
                      }`}
                  >
                    ▾
                  </span>
                </button>
              )}
            </div>

            {/* 🔹 드롭다운 영역 */}
            <div className="all-routes-wrapper">
              <div className="all-routes">
                {isDayDropdownOpen && (
                  <div className="day-dropdown-list">
                    {/* 전체 일정 보기 버튼 */}
                    {selectedDay && (
                      <button
                        type="button"
                        className={`day-btn ${selectedDateKey == null ? "active" : ""
                          }`}
                        onClick={() => setSelectedDateKey(null)}
                      >
                        <div className="day-date">전체 경로 보기</div>
                      </button>
                    )}

                    {dayList.map((d) => (
                      <button
                        key={d.key}
                        type="button"
                        className={`day-btn ${selectedDateKey === d.key ? "active" : ""
                          }`}
                        onClick={() => {
                          setSelectedDateKey(d.key);
                          setIsDayDropdownOpen(false);
                        }}
                      >
                        <div
                          className="day-color"
                          style={{ backgroundColor: d.color }}
                        ></div>
                        <div className="day-date">
                          {d.month}.{d.date}. {d.dayName}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 🔹 선택된 날짜의 일정 + 이동경로 리스트 */}
          {selectedDay && (
            <>
              {dayIndex && (
                <div className="date-count">{dayIndex}일차</div>
              )}

              {eventsOfSelectedDay.map((ev, index) => {
                const isLast =
                  index === eventsOfSelectedDay.length - 1;
                const leg = isLast ? null : legsOfSelectedDay[index];

                const startLabel = ev.startTime
                  ? dayjs(ev.startTime).format("HH:mm")
                  : "";
                const endLabel = ev.endTime
                  ? dayjs(ev.endTime).format("HH:mm")
                  : "";

                const transportInfo = getTransportationInfo(
                  ev.nextTransportation
                );

                return (
                  <div
                    key={getEventKey(ev) || `${selectedDateKey}-${index}`}
                    className="events-route"
                  >
                    {/* 일정 정보 */}
                    <div className="event-info">
                      <div className="event-num">{index + 1}</div>
                      <div className="event-title-container">
                        <div className="event-title">
                          {ev.eventName || ev.placeName || "이름 없는 일정"}
                        </div>
                        <div className="event-time">
                          {startLabel && endLabel
                            ? `${startLabel} ~ ${endLabel}`
                            : ""}
                        </div>
                      </div>
                    </div>

                    {/* 마지막 일정은 다음 일정이 없으니 이동 경로 없음 */}
                    {!isLast && (
                      <div className="event-route-info-container">
                        <div className="event-route-line" />

                        <div className="event-route-info-txt">
                          {/* ex: 🚶 도보 / 실제 소요 시간은 나중에 leg.duration에서 가져올 수 있음 */}
                          {transportInfo.emoji} &nbsp;
                          {transportInfo.kor || "이동수단 미설정"}&nbsp;
                          {ev.nextFormattedTravelTime}&nbsp;
                          소요

                          <div className="select-transport-panel-wrapper">
                            <button
                              className="transport-select-btn"
                              onClick={() => {
                                toggleNextTransportPanel(getEventKey(ev));
                              }}
                            >
                              <img
                                className="transport-select-icon-img"
                                src="icons/down-arrow.png"
                                alt="이동수단 선택"
                              />
                            </button>

                            {nextTransportPanel &&
                              targetEventIdForTransport === getEventKey(ev) && (
                                <div
                                  className="select-transport-panel"
                                  ref={nextPanelRef}
                                >
                                  {transportations.map((transport) => (
                                    <button
                                      key={transport.id}
                                      className="transport-option-button"
                                      onClick={() =>
                                        handleSelectNextTransport(
                                          getEventKey(ev),
                                          transport,
                                          ev.nextWarningId
                                        )
                                      }
                                    >
                                      {transport.emoji}
                                      &nbsp;&nbsp;&nbsp;
                                      {transport.kor}
                                    </button>
                                  ))}
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* 🔹 지도 영역 */}
      <div className="route-map-wrapper">
        <DetailRoutesMap
          center={cityCenter}
          events={events}
          selectedDateKey={selectedDateKey}
          routeLegs={visibleLegs}
          dateColorMap={dateColorMap}
        />
      </div>

      <button
        className="back-to-calendar-btn"
        onClick={() => navigate(`/calendar/${calendarId}`)}
      >
        일정 생성 모드로 돌아가기
      </button>
    </div>
  );
}