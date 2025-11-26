import { useState, useEffect } from 'react';
import axiosInstance from '../../../../api/axiosInstance';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');
import TimeSetting from '../TimeSetting';
import { splitDateTime, joinDateTime } from '../../../../utils/formatDate';
import { getPhotoUrl } from '../../../../api/googleMapApi.js';
import { getTransportationInfo } from '../../../../utils/transportations.js';
import EventModalTitle from '../EventModalTitle';
import Warning from './Warning';
import GEventModalBottom from './GEventModalBottom';
import { getCategoryKor } from '../../../../utils/category.js';
import DeleteClose from '../DeleteClose';

export default function GEventModal({
  closeModal,
  calendarId,
  eventId,   //
  eventDetails,
  getHexColor,
  headerInfo,
  onEventUpdated
}) {
  const photoUrl = getPhotoUrl(eventDetails.photoReference);
  const [inputTitle, setInputTitle] = useState(eventDetails.eventName);
  const [blockColor, setBlockColor] = useState(eventDetails.blockColor);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [showOpeningHoursWarning, setShowOpeningHoursWarning] = useState(eventDetails.showOpeningHoursWarning);
  const [showPreviousWarning, setShowPreviousWarning] = useState(eventDetails.showPreviousWarning);
  const [showNextWarning, setShowNextWarning] = useState(eventDetails.showNextWarning);
  const [previousTransportation, setPreviousTransportation] = useState(
    eventDetails.previousTransportation
  );
  const [nextTransportation, setNextTransportation] = useState(
    eventDetails.nextTransportation
  );
  const [inputMemo, setInputMemo] = useState(eventDetails.comment || "");

  useEffect(() => {       // 날짜와 시간 분리
    const s = splitDateTime(eventDetails.startTime);
    const e = splitDateTime(eventDetails.endTime);
    setStartDate(s.date); // "2025-12-05"
    setStartTime(s.time); // "19:30"
    setEndDate(e.date);   // "2025-12-05"
    setEndTime(e.time);   // "21:00"
  }, [eventDetails.startTime, eventDetails.endTime]);

  const openingHoursForEventDay = (() => {
    const list = eventDetails.formattedOpeningHours;
    if (!Array.isArray(list) || list.length === 0) return null;

    // dayjs().day() => 0: Sunday ~ 6: Saturday
    const weekday = dayjs(eventDetails.startTime).day();
    const indexMap = [6, 0, 1, 2, 3, 4, 5]; // Sun→6, Mon→0, Tue→1, ... Sat→5
    const idx = indexMap[weekday];

    return list[idx] || null; // "Monday: 9:00 AM – 11:00 PM"
  })();

  // 구글 일정 UPDATE API 호출
  async function handleUpdateGEvent(patch = {}) {
    try {
      // 현재 입력된 날짜/시간을 ISO 문자열로 합치기
      const newStartTime = joinDateTime(startDate, startTime);
      const newEndTime = joinDateTime(endDate, endTime);

      const body = {
        eventName: inputTitle,
        startTime: newStartTime,
        endTime: newEndTime,
        comment: inputMemo,
        blockColor,
        showOpeningHoursWarning,
        showPreviousWarning,
        previousTransportation,
        showNextWarning,
        nextTransportation,
        ...patch
      };
      const url = `/api/calendars/${calendarId}/events/google-event/${eventId ?? eventDetails.eventId}`;
      const response = await axiosInstance.put(url, body);
      const updatedEvent = response.data;
      console.log(body);
      // 상위 캘린더 events 상태도 갱신
      if (onEventUpdated) {
        onEventUpdated(updatedEvent);
      }
    } catch (err) {
      console.error('Google 이벤트 수정 실패:', err);
      console.log('서버에서 온 응답:', err.response?.data);
    }
  }

  return (
    <div className="g-event-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <DeleteClose
        calendarId={calendarId}
        eventId={eventId}
        closeModal={closeModal}
        onEventUpdated={onEventUpdated}
      />

      {photoUrl ? (
        <img className="g-event-modal-img"
          src={photoUrl}
          alt={eventDetails.placeName}></img>
      ) : (
        <div className="g-event-modal-img placeholder">
          이미지 없음
        </div>
      )}

      <div className="g-event-modal-info">
        <EventModalTitle
          eventDetails={eventDetails}
          inputTitle={inputTitle}
          setInputTitle={setInputTitle}
          handleUpdateEvent={handleUpdateGEvent}
        />

        <div className="color-category">
          <button
            className="color"
            style={{
              backgroundColor: getHexColor(blockColor),
            }}
          // onClick={() => setBlockColor(다음색)}  // 나중에 컬러피커 붙일 수 있음
          ></button>
          <p className="category">{getCategoryKor(eventDetails.category)}</p>
        </div>
        <div className="rating-comment">
          <p className="rating">★ {eventDetails.rating}</p>
          <p className="comment">리뷰 {eventDetails.commentNum?.toLocaleString()}</p>
        </div>

        <TimeSetting
          headerInfo={headerInfo}
          startDate={startDate} setStartDate={setStartDate}
          startTime={startTime} setStartTime={setStartTime}
          endDate={endDate} setEndDate={setEndDate}
          endTime={endTime} setEndTime={setEndTime}
          handleUpdateEvent={handleUpdateGEvent}
        />

        <Warning
          headerInfo={headerInfo}
          eventDetails={eventDetails}
          showOpeningHoursWarning={showOpeningHoursWarning}
          setShowOpeningHoursWarning={setShowOpeningHoursWarning}
          previousTransportation={previousTransportation}
          setPreviousTransportation={setPreviousTransportation}
          showPreviousWarning={showPreviousWarning}
          setShowPreviousWarning={setShowPreviousWarning}
          nextTransportation={nextTransportation}
          setNextTransportation={setNextTransportation}
          showNextWarning={showNextWarning}
          setShowNextWarning={setShowNextWarning}
          handleUpdateEvent={handleUpdateGEvent}
        />

        <GEventModalBottom
          eventDetails={eventDetails}
          inputMemo={inputMemo}
          setInputMemo={setInputMemo}
          openingHoursForEventDay={openingHoursForEventDay}
          handleUpdateEvent={handleUpdateGEvent}
        />
      </div>
    </div>
  );
}