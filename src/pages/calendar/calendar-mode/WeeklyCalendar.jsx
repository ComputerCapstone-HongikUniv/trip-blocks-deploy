import { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
// import interactionPlugin from '@fullcalendar/interaction';
import axiosInstance from '../../../api/axiosInstance';
import EventModal from './EventModal';
import { getHexColor } from '../../../utils/colorPalette.js';
import { getTransportationInfo } from '../../../utils/transportations.js';
import './WeeklyCalendar.css';

function formatDateKeyLocal(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`; // 예: "2025-11-20"
}

function stripOffset(isoString) {
  if (!isoString) return "";
  // 초까지 19글자: "YYYY-MM-DDTHH:MM:SS"
  return isoString.slice(0, 19);
}

function dateToLocalNoOffset(date) {
  if (!date) return "";
  const y = date.getFullYear();
  const M = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}-${M}-${d}T${h}:${m}:${s}`;
}

export default function WeeklyCalendar({
  calendarId,
  headerInfo,
  events, setEvents,
  sideOpen,
  makeGEventMode,
  setMakeGEventMode,
  selectedPlaceForGEvent,
  setSelectedPlaceForGEvent,
  warnings,
  refreshWarnings,
  captureRef,
  onReadyForExport,
  isExporting,
  selectedPlaceId,
  setSelectedPlaceId
}) {
  const calendarRef = useRef(null);
  const calendarWrapperRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedEventDetail, setSelectedEventDetail] = useState(null);
  const [isEventLoading, setIsEventLoading] = useState(false);
  const [openingHours, setOpeningHours] = useState([]);
  const [weatherByDate, setWeatherByDate] = useState({});
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);
  const city = headerInfo.city;

  useEffect(() => {
    if (!city || !headerInfo?.startDate || !headerInfo?.endDate) {
      console.log('[Weather] city / startDate / endDate 없음', {
        city,
        startDate: headerInfo?.startDate,
        endDate: headerInfo?.endDate,
      });
      return;
    }

    const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
    if (!API_KEY) {
      console.warn('OpenWeatherMap API Key가 설정되어 있지 않습니다.');
      return;
    }

    // 여행 구간의 날짜들을 YYYY-MM-DD 문자열로 모두 뽑아두기
    const start = new Date(headerInfo.startDate); // "2025-11-17"
    const end = new Date(headerInfo.endDate);     // "2025-11-20" 같은 느낌

    const targetSet = new Set();
    const cursor = new Date(start);

    while (cursor <= end) {
      const key = formatDateKeyLocal(cursor); // ⬅️ 로컬 기준 날짜 문자열
      targetSet.add(key);
      cursor.setDate(cursor.getDate() + 1);
    }

    console.log('[Weather] target dates:', Array.from(targetSet));

    const fetchWeatherForRange = async () => {
      try {
        setIsWeatherLoading(true);
        setWeatherError(null);

        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
          city
        )}&units=metric&lang=kr&appid=${API_KEY}`;

        console.log('[Weather] 요청 URL:', url);

        const res = await fetch(url);
        console.log('[Weather] 응답 status:', res.status);

        if (!res.ok) {
          throw new Error(`OpenWeatherMap forecast 요청 실패: ${res.status}`);
        }

        const data = await res.json();
        console.log('[Weather] 전체 forecast data:', data);
        console.log('[Weather] list 길이:', data.list?.length);

        // 날짜별로 3시간 예보를 묶기
        const grouped = {}; // { "YYYY-MM-DD": [item, item, ...] }

        (data.list || []).forEach((item) => {
          const dtTxt = item.dt_txt;               // "2025-11-18 12:00:00"
          const dateKey = dtTxt.slice(0, 10);      // "2025-11-18"

          if (!targetSet.has(dateKey)) return;     // 여행 날짜가 아니면 무시

          if (!grouped[dateKey]) {
            grouped[dateKey] = [];
          }
          grouped[dateKey].push(item);
        });

        console.log('[Weather] grouped keys:', Object.keys(grouped));

        // 각 날짜마다 대표 아이콘/설명 추출 (가능하면 12:00, 아니면 첫 번째)
        const result = {}; // { "YYYY-MM-DD": { icon, description } }

        Object.entries(grouped).forEach(([dateKey, list]) => {
          const repr =
            list.find((it) => it.dt_txt.includes('12:00:00')) || list[0];

          const icon = repr.weather?.[0]?.icon ?? '';
          const description = repr.weather?.[0]?.description ?? '';

          result[dateKey] = { icon, description };
        });

        console.log('[Weather] result (weatherByDate):', result);
        setWeatherByDate(result);
      } catch (err) {
        console.error('날짜 범위 날씨 정보 불러오기 실패:', err);
        setWeatherError('날씨 정보를 불러오지 못했어요.');
        setWeatherByDate({});
      } finally {
        setIsWeatherLoading(false);
      }
    };

    fetchWeatherForRange();
  }, [city, headerInfo?.startDate, headerInfo?.endDate]);

  const getVisibleRange = () => {
    if (!headerInfo?.startDate || !headerInfo?.endDate) return null;
    const start = new Date(headerInfo.startDate);
    const end = new Date(headerInfo.endDate);
    return { start, end };
  };
  const visibleRange = getVisibleRange();


  // 🔹 FullCalendar 이벤트 시간 변경을 백엔드와 동기화하는 공통 함수
  const syncEventTime = async (fcEvent, revertFunc) => {
    // 배경/경고 이벤트는 시간 수정 대상 아님
    if (
      fcEvent.extendedProps?.isBackgroundOverlay ||
      fcEvent.extendedProps?.isWarningEvent
    ) {
      revertFunc && revertFunc();
      return;
    }

    const eventId = fcEvent.id;
    const start = fcEvent.start;
    const end = fcEvent.end;

    if (!start || !end) {
      console.warn('이벤트 시작/끝 시간이 없습니다.', fcEvent);
      revertFunc && revertFunc();
      return;
    }

    const startTime = dateToLocalNoOffset(start);
    const endTime = dateToLocalNoOffset(end);

    try {
      // 🔸 시간 변경 API 호출
      await axiosInstance.put(
        `/api/calendars/${calendarId}/events/${eventId}/time`,
        {
          startTime,
          endTime,
        }
      );

      // 🔸 프론트 state도 업데이트
      setEvents(prev =>
        prev.map(ev =>
          String(ev.eventId) === String(eventId)
            ? { ...ev, startTime, endTime }
            : ev
        )
      );

      // 여기에서 최신 경고 다시 불러오기
      if (typeof refreshWarnings === 'function') {
        refreshWarnings();
      }
    } catch (err) {
      console.error('이벤트 시간 변경 실패:', err);
      // 실패 시 화면상 위치/시간 원래대로 되돌리기
      revertFunc && revertFunc();
    }
  };

  // 🔹 이벤트 아래쪽을 드래그해서 리사이즈했을 때
  const handleEventResize = async (resizeInfo) => {
    const { event, revert } = resizeInfo;
    await syncEventTime(event, revert);
  };

  // 🔹 이벤트 박스를 통째로 드래그해서 다른 시간/날짜로 옮겼을 때
  const handleEventDrop = async (dropInfo) => {
    const { event, revert } = dropInfo;
    await syncEventTime(event, revert);
  };

  const calendarEvents = (events || []).map(ev => ({
    id: ev.eventId,
    title: ev.eventName,
    start: ev.startTime,
    end: ev.endTime,
    backgroundColor: getHexColor(ev.blockColor),
    borderColor: getHexColor(ev.blockColor),
  }));

  const warningEvents = (warnings || [])
    .filter(w => w.isWarning && w.showWarning) // 필요하면 필터
    .map(w => ({
      id: `warning-${w.warningId}`,
      start: w.previousEventEndTime,   // 이전 일정 끝나는 시간
      end: w.nextEventStartTime,       // 다음 일정 시작 시간
      backgroundColor: 'transparent',
      borderColor: '#FACC15',          // 노란색
      classNames: ['warning-event'],
      editable: false,          // 이벤트는 드래그해서 옮기기 불가
      durationEditable: false,    // 이벤트는 리사이즈(위·아래 늘리기) 불가
      extendedProps: {
        isWarningEvent: true,
        transportation: w.transportation,
        previousEventId: w.previousEventId,
        nextEventId: w.nextEventId,
      },
    }));

  const renderEventContent = (arg) => {
    const { event } = arg;

    // 경고 이벤트는 그대로
    if (event.extendedProps.isWarningEvent) {
      return (
        <div className="warning-event-inner">
          <div className="warning-transportation">
            {getTransportationInfo(event.extendedProps.transportation ?? "?").emoji}
          </div>
        </div>
      );
    }

    // ⚙️ 시작/끝 시간 직접 포맷
    const start = event.start;
    const end = event.end;

    let timeLabel = '';
    if (start && end) {
      timeLabel = `${formatTimeAMPM(start)} - ${formatTimeAMPM(end)}`;
    } else if (start) {
      timeLabel = formatTimeAMPM(start);
    }

    return (
      <div className="my-event-inner">
        <div className="my-event-title">{event.title}</div>
        <div className="my-event-time">{timeLabel}</div>
      </div>
    );
  };

  // 클릭 시: 모달 열기 + 해당 이벤트 상세 요청
  const handleEventClick = async (clickInfo) => {
    // 배경 이벤트면 아무 동작도 안 함
    if (clickInfo.event.extendedProps.isBackgroundOverlay) {
      return;
    }
    // ⚠ 경고 이벤트도 모달 안 뜨게 막기
    if (clickInfo.event.extendedProps.isWarningEvent) {
      return;
    }
    const clickedId = clickInfo.event.id; // FullCalendar 이벤트 id
    setSelectedEventId(clickedId);
    setIsModalOpen(true);
    setIsEventLoading(true);
    setSelectedEventDetail(null);

    try {
      const response = await axiosInstance.get(
        `/api/calendars/${calendarId}/events/${clickedId}`
      );
      setSelectedEventDetail(response.data);
    } catch (err) {
      console.error('이벤트 상세 불러오기 실패:', err);
    } finally {
      setIsEventLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEventId(null);
    setSelectedEventDetail(null);
  };

  // 사이드바 열림/닫힘에 따른 캘린더 리사이즈 + export 준비 콜백
  useEffect(() => {
    if (!calendarRef.current) return;

    const timer = setTimeout(() => {
      const api = calendarRef.current.getApi();
      api.updateSize();

      // 🔹 updateSize 후 한 프레임 더 기다렸다가 부모에 "준비됨" 알리기
      if (onReadyForExport) {
        requestAnimationFrame(() => {
          onReadyForExport();
        });
      }
    }, 120); // 너가 쓰던 딜레이 그대로 사용

    return () => clearTimeout(timer);
  }, [sideOpen, onReadyForExport]);

  // makeGEventMode + selectedPlaceForGEvent → openingHours 배경
  useEffect(() => {
    if (
      makeGEventMode &&
      selectedPlaceForGEvent &&
      Array.isArray(selectedPlaceForGEvent.formattedOpeningHours)
    ) {
      setOpeningHours(selectedPlaceForGEvent.formattedOpeningHours);
    } else {
      // 모드가 아니거나 장소가 없으면 배경 제거
      setOpeningHours([]);
    }
  }, [makeGEventMode, selectedPlaceForGEvent]);

  //  캘린더 바깥 클릭 시 모드 종료
  useEffect(() => {
    if (!makeGEventMode) return;

    function handleClickOutside(e) {
      if (!calendarRef.current) return;
      const api = calendarRef.current.getApi();
      const calendarEl = api?.el;
      if (!calendarEl) return;
      // 클릭한 곳이 캘린더 DOM 내부면 유지
      if (calendarEl.contains(e.target)) return;
      // 캘린더 외부 클릭 → 모드/배경/선택 장소 초기화
      setMakeGEventMode(false);
      setSelectedPlaceForGEvent(null);
      setOpeningHours([]);
      setSelectedPlaceId(null);
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [makeGEventMode, setMakeGEventMode, setSelectedPlaceForGEvent]);

  // 🔹 PlaceCard(.place-card-closed)를 FullCalendar 외부 드래그 소스로 등록
  // useEffect(() => {
  //   const container = document.querySelector('.place-list');
  //   if (!container) return;

  //   const draggable = new Draggable(container, {
  //     // 닫힌 카드 상태만 드래그 가능
  //     itemSelector: '.place-card-closed',
  //     // FullCalendar 쪽에 넘어갈 임시 이벤트 데이터
  //     eventData: (el) => {
  //       const titleEl = el.querySelector('.place-card-name');
  //       return {
  //         title: titleEl?.textContent || '새 일정',
  //       };
  //     },
  //   });

  //   return () => {
  //     draggable.destroy();
  //   };
  // }, []);

  // 요일명 → JS Date요일 인덱스 매핑
  const weekdayMap = {
    '일요일': 0,
    '월요일': 1,
    '화요일': 2,
    '수요일': 3,
    '목요일': 4,
    '금요일': 5,
    '토요일': 6,
  };

  // visibleRange 계산 이후에 backgroundEvents 만들기
  if (!visibleRange) return null;

  const viewStart = visibleRange.start;         // 이 주의 시작일
  const baseDate = new Date(viewStart);

  function parseTime(str) {
    if (!str) return null;
    const trimmed = str.trim(); // 예: "오전 8:30", "오후 8", "AM 10:00", "PM 5:30"

    // 오전/오후/AM/PM + 시[:분] 형식 (분은 선택)
    const m = trimmed.match(/^(오전|오후|AM|PM)\s*(\d{1,2})(?::(\d{2}))?$/i);
    if (!m) {
      console.warn('[parseTime] 알 수 없는 형식:', str);
      return null;
    }

    let [, periodRaw, hStr, mStr] = m;
    const period = periodRaw.toUpperCase(); // "오전" / "오후" / "AM" / "PM"
    let hour = parseInt(hStr, 10);
    let minute = mStr != null ? parseInt(mStr, 10) : 0; // 분이 없으면 0분

    // 한글/영문 모두 지원
    if (period === '오전' || period === 'AM') {
      if (hour === 12) hour = 0;
    } else if (period === '오후' || period === 'PM') {
      if (hour !== 12) hour += 12;
    }

    return { hour, minute };
  }

  const backgroundEvents = openingHours
    .map((str, idx) => {
      // "월요일: 오전 8:30 ~ 오후 6:00"
      const match = str.match(/^([^:]+):\s*(.+)$/);
      if (!match) {
        console.warn('[openingHours] 알 수 없는 형식:', str);
        return null;
      }
      const dayPart = match[1].trim();   // "월요일"
      const timePart = match[2].trim();  // "AM 10:30 ~ PM 5:30"

      const dayIndex = weekdayMap[dayPart];
      if (dayIndex === undefined) {
        console.warn('알 수 없는 요일 형식:', str);
        return null;
      }

      const eventStart = new Date(baseDate);
      const diff = (dayIndex + 7 - baseDate.getDay()) % 7;
      eventStart.setDate(baseDate.getDate() + diff);

      // ✅ 1) 24시간 영업 처리 (예: "24시간 영업")
      if (/24\s*시간/.test(timePart)) {
        eventStart.setHours(0, 0, 0, 0);
        const eventEnd = new Date(eventStart);
        eventEnd.setHours(23, 59, 59, 999);

        return {
          id: `bg-${idx}`,
          start: eventStart,
          end: eventEnd,
          display: 'background',
          rendering: 'background',
          backgroundColor: '#FFE4DA',
          borderColor: '#FFE4DA',
          extendedProps: { isBackgroundOverlay: true },
        };
      }

      // ✅ 2) 휴무일 처리 (예: "휴무", "영업하지 않음")
      if (/(휴무|영업\s*없음|영업하지\s*않음)/.test(timePart)) {
        return null;
      }

      // ✅ 3) "오전 8:30 ~ 오후 6:00" 일반 케이스 처리
      const [startStrRaw, endStrRaw] = timePart.split('~');
      const startInfo = parseTime(startStrRaw);
      const endInfo = parseTime(endStrRaw);

      if (!startInfo || !endInfo) {
        console.warn('시간 파싱 실패:', timePart);
        return null;
      }

      eventStart.setHours(startInfo.hour, startInfo.minute, 0, 0);
      const eventEnd = new Date(eventStart);
      eventEnd.setHours(endInfo.hour, endInfo.minute, 0, 0);

      return {
        id: `bg-${idx}`,
        start: eventStart,
        end: eventEnd,
        display: 'background',
        rendering: 'background',
        backgroundColor: '#FFE4DA',
        borderColor: '#FFE4DA',
        extendedProps: { isBackgroundOverlay: true },
      };
    })
    .filter(Boolean);

  /* 드래그로 범위 선택했을 때 일정 생성 */
  const handleSelect = async (selectInfo) => {
    const { startStr, endStr } = selectInfo; // FullCalendar가 준 ISO 문자열
    const startLocal = stripOffset(startStr);
    const endLocal = stripOffset(endStr);

    // 1) Google 이벤트 만드는 모드일 때
    if (makeGEventMode) {
      // 장소 정보가 없다면 그냥 선택 해제하고 종료
      if (!selectedPlaceForGEvent) {
        console.warn('Google 이벤트 모드인데 selectedPlaceForGEvent가 없습니다.');
        selectInfo.view.calendar.unselect();
        return;
      }

      try {
        // 1) Google Event 생성
        const response = await axiosInstance.post(
          `/api/calendars/${calendarId}/events/google-event`,
          {
            placeId: selectedPlaceForGEvent.placeId, // ✅ 선택된 장소의 placeId
            startTime: startLocal,  // 백엔드 LocalDateTime으로 파싱
            endTime: endLocal
          }
        );

        const raw = response.data;

        // 백엔드가 id 또는 eventId 어떤 키를 줄지 모를 때 대비
        const newEvent = {
          ...raw,
          eventId: raw.eventId ?? raw.id,
        };

        // 2) 캘린더 이벤트 리스트에 추가
        setEvents((prev) => [...prev, newEvent]);
        if (typeof refreshWarnings === 'function') {
          refreshWarnings();
        }


        // 3) 바로 모달 띄우기 위한 상태 세팅
        setSelectedEventId(newEvent.eventId);
        setIsModalOpen(true);
        setIsEventLoading(true);
        setSelectedEventDetail(null);

        // 4) 방금 만든 이벤트 상세 정보 다시 요청
        try {
          const detailRes = await axiosInstance.get(
            `/api/calendars/${calendarId}/events/${newEvent.eventId}`
          );
          setSelectedEventDetail(detailRes.data);
        } catch (detailErr) {
          console.error('새 Google 일정 상세 불러오기 실패:', detailErr);
        } finally {
          setIsEventLoading(false);
        }

        // 일정 생성 "성공" 시 모드 해제 + 선택 장소/배경 초기화
        setMakeGEventMode(false);
        setSelectedPlaceForGEvent(null);  // 선택된 장소도 초기화
        setOpeningHours([]);              // 혹시 모를 잔여 배경 제거

      } catch (err) {
        console.error('Google 일정 생성 실패:', err);
      } finally {
        // 선택 영역 해제
        selectInfo.view.calendar.unselect();
      }
      // 여기서 return 해줘야 아래 user-event 로직이 실행되지 않음
      return;
    }

    // ✅ 2) 일반 유저 일정 모드 (기존 로직 유지)
    try {
      const response = await axiosInstance.post(
        `/api/calendars/${calendarId}/events/user-event`,
        {
          eventName: "",
          startTime: startLocal,  // 예: "2025-11-14T10:00:00+09:00"
          endTime: endLocal
        }
      );

      const newEvent = response.data;  // { eventId, eventName, ... }

      setEvents((prev) => [...prev, newEvent]);

      setSelectedEventId(newEvent.eventId);
      setIsModalOpen(true);
      setIsEventLoading(true);
      setSelectedEventDetail(null);

      try {
        const detailRes = await axiosInstance.get(
          `/api/calendars/${calendarId}/events/${newEvent.eventId}`
        );
        setSelectedEventDetail(detailRes.data);
      } catch (detailErr) {
        console.error("새 일정 상세 불러오기 실패:", detailErr);
      } finally {
        setIsEventLoading(false);
      }

    } catch (err) {
      console.error('유저 일정 생성 실패:', err);
    } finally {
      selectInfo.view.calendar.unselect();
    }
  };

  /* 🔹 PlaceCard를 캘린더 위로 드래그했을 때의 처리 */
  const handleCalendarDragEnter = (e) => {
    e.preventDefault();
    // 드래그가 캘린더 영역에 들어오면 일단 모드 on
    setMakeGEventMode(true);
  };

  const handleCalendarDragOver = (e) => {
    // drop 가능하게 만들기
    e.preventDefault();
  };

  const handleCalendarDragLeave = (e) => {
    e.preventDefault();
    const wrapper = calendarWrapperRef.current;
    if (!wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const { clientX, clientY } = e;

    // 드래그 포인터가 wrapper 바깥으로 완전히 나갔을 때만 모드 해제
    const isOutside =
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom;

    if (isOutside) {
      setMakeGEventMode(false);
      setOpeningHours([]);
    }
  };

  // 🔹 PlaceCard를 FullCalendar 위에 드롭했을 때 호출됨
  const handleEventReceive = async (info) => {
    const fcEvent = info.event;

    const start = fcEvent.start;
    if (!start) {
      console.warn('드롭된 이벤트에 start가 없습니다.', info);
      fcEvent.remove();
      return;
    }

    // 항상 1시간짜리 고정
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const startTime = dateToLocalNoOffset(start);
    const endTime = dateToLocalNoOffset(end);

    // FullCalendar가 임시로 만든 이벤트는 제거
    fcEvent.remove();

    if (!selectedPlaceForGEvent?.placeId) {
      console.warn('selectedPlaceForGEvent 또는 placeId가 없습니다. Google 이벤트를 만들 수 없어요.');
      return;
    }

    try {
      const response = await axiosInstance.post(
        `/api/calendars/${calendarId}/events/google-event`,
        {
          placeId: selectedPlaceForGEvent.placeId,
          startTime,
          endTime,
        }
      );

      const raw = response.data;
      const newEvent = {
        ...raw,
        eventId: raw.eventId ?? raw.id,
      };

      setEvents((prev) => [...prev, newEvent]);
      if (typeof refreshWarnings === 'function') {
        refreshWarnings();
      }

      setSelectedEventId(newEvent.eventId);
      setIsModalOpen(true);
      setIsEventLoading(true);
      setSelectedEventDetail(null);

      try {
        const detailRes = await axiosInstance.get(
          `/api/calendars/${calendarId}/events/${newEvent.eventId}`
        );
        setSelectedEventDetail(detailRes.data);
      } catch (detailErr) {
        console.error('드롭으로 만든 일정 상세 불러오기 실패:', detailErr);
      } finally {
        setIsEventLoading(false);
      }
    } catch (err) {
      console.error('드롭 기반 Google 일정 생성 실패:', err);
    } finally {
      // ✅ 드롭 성공/실패와 상관없이, 여기에서만 모드/선택/배경 정리
      setMakeGEventMode(false);
      setSelectedPlaceForGEvent(null);
      setOpeningHours([]);
    }
  };

  function formatTimeAMPM(date) {
    if (!date) return '';

    let hours = date.getHours();      // 0~23
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';

    hours = hours % 12;
    if (hours === 0) hours = 12;      // 0시는 12로 표시

    const mm = String(minutes).padStart(2, '0');

    // 예: 10:25AM, 1:05PM
    return `${hours}:${mm}${ampm}`;
  }

  return (
    <>
      <div
        ref={(el) => {
          calendarWrapperRef.current = el;
          if (captureRef) {
            captureRef.current = el;
          }
        }}
        className={`weekly-calendar-wrapper ${isExporting ? 'weekly-calendar-wrapper--export' : ''}`}
        onDragEnter={handleCalendarDragEnter}
        onDragOver={handleCalendarDragOver}
        onDragLeave={handleCalendarDragLeave}
      >
        <FullCalendar
          ref={calendarRef}
          initialView="tripTimeGrid"
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          events={[...calendarEvents, ...warningEvents, ...backgroundEvents]}
          headerToolbar={false}
          allDaySlot={false}
          locale="en-US"
          slotDuration="01:00:00"
          slotLabelInterval="01:00:00"
          snapDuration="00:10:00"   // 이벤트 생성 시 10분 단위 스냅
          slotLabelFormat={{
            hour: 'numeric',
            minute: undefined,
            hour12: true,
          }}
          slotLabelClassNames={() => ['my-slot-label']}
          scrollTime={isExporting ? '00:00:00' : '09:00:00'}
          height={isExporting ? 'auto' : '100%'}
          expandRows={true}
          eventContent={renderEventContent}
          eventClick={handleEventClick}
          selectable={true}              // 드래그 선택 가능
          selectMirror={true}
          select={handleSelect}          // 선택 완료 시 호출
          selectOverlap={(existingEvent) => {
            // 1) 배경 이벤트에는 항상 겹칠 수 있음
            if (existingEvent.display === 'background') return true;

            // 2) 경고 이벤트(노란 경고 블록)에는 겹쳐서 일정 생성 가능하게
            if (existingEvent.extendedProps?.isWarningEvent) return true;

            // 3) 그 외(실제 일정 이벤트)는 겹치지 못하게 막기
            return false;
          }}
          unselectAuto={false}     // 우리가 직접 unselect
          editable={true}          // (기본 drag/drop 가능 모드)
          droppable={true}          // ✅ 외부 드래그 드롭 허용
          eventReceive={handleEventReceive}   // ✅ 여기서만 
          // 구글 이벤트 생성
          eventResize={handleEventResize}
          eventDrop={handleEventDrop}
          views={{
            tripTimeGrid: {
              type: 'timeGrid',
              visibleRange,
              dayHeaderContent: (arg) => {
                const date = arg.date;

                const weekday = date.toLocaleDateString('en-US', {
                  weekday: 'short',
                });
                const day = date.getDate();
                const label = `${weekday} ${day}`;

                // 헤더 날짜를 "YYYY-MM-DD" 키로 변환
                const ymd = formatDateKeyLocal(date);

                const dayWeather = weatherByDate?.[ymd];
                const showIcon = dayWeather && dayWeather.icon;

                return (
                  <div className="trip-day-header">
                    <span>{label}</span>
                    {showIcon && (
                      <img
                        className="trip-day-header-icon"
                        src={`https://openweathermap.org/img/wn/${dayWeather.icon}.png`}
                        alt={dayWeather.description}
                      />
                    )}
                  </div>
                );
              },
            },
          }}
        />
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <EventModal
            closeModal={closeModal}
            calendarId={calendarId}
            eventId={selectedEventId}
            eventDetails={selectedEventDetail}
            loading={isEventLoading}    // 로딩 상태 넘겨줌
            googleEvent={selectedEventDetail?.googleEvent}
            headerInfo={headerInfo}
            onEventUpdated={(updated) => {
              // 🔹 문자열로 통일해서 비교
              const updatedId = String(updated.eventId);

              // 삭제인 경우
              if (updated._deleted) {
                setEvents(prev =>
                  prev.filter(ev => String(ev.eventId) !== updatedId)
                );
                if (typeof refreshWarnings === 'function') {
                  refreshWarnings();
                }
                return;
              }

              // 일반 업데이트인 경우
              setEvents(prev =>
                prev.map(ev =>
                  String(ev.eventId) === updatedId
                    ? { ...ev, ...updated }
                    : ev
                )
              );
              setSelectedEventDetail(updated);
              if (typeof refreshWarnings === 'function') {
                refreshWarnings();
              }
            }}
          />
        </div>
      )}

    </>
  );
}
