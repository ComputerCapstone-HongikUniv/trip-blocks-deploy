import { useState, useEffect } from 'react';
import axiosInstance from '../../../../api/axiosInstance';
import TimeSetting from '../TimeSetting';
import { splitDateTime, joinDateTime } from '../../../../utils/formatDate';
import EventModalTitle from '../EventModalTitle';
import Memo from '../Memo';
import DeleteClose from '../DeleteClose';
import './UEventModal.css';

export default function UEventModal({
  closeModal,
  calendarId,
  eventId,
  eventDetails,
  getHexColor, headerInfo,
  onEventUpdated
}) {
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [inputTitle, setInputTitle] = useState(eventDetails.eventName);
  const [inputMemo, setInputMemo] = useState(eventDetails.comment);

  useEffect(() => {
    const s = splitDateTime(eventDetails.startTime);
    const e = splitDateTime(eventDetails.endTime);
    setStartDate(s.date); // "2025-12-05"
    setStartTime(s.time); // "19:30"
    setEndDate(e.date);   // "2025-12-05"
    setEndTime(e.time);   // "21:00"
  }, [eventDetails.startTime, eventDetails.endTime]);

  async function handleUpdateUEvent() {
    try {                     // 현재 입력된 날짜/시간을 하나로 합치기
      const newStartTime = joinDateTime(startDate, startTime);
      const newEndTime = joinDateTime(endDate, endTime);
      const body = {
        eventName: inputTitle,
        startTime: newStartTime,
        endTime: newEndTime,
        comment: inputMemo,
        blockColor: eventDetails.blockColor,
      };
      const url = `/api/calendars/${calendarId}/events/user-event/${eventId}`;
      const response = await axiosInstance.put(url, body);
      const updated = response.data;

      // 상위 캘린더 events 상태도 갱신하고 싶으면 콜백 호출
      if (onEventUpdated) {
        onEventUpdated(updated);
      }
    } catch (err) {
      console.error("유저 일정 수정 실패:", err);
    }
  }

  return (
    <div className="u-event-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <DeleteClose
        calendarId={calendarId}
        eventId={eventId}
        closeModal={closeModal}
        onEventUpdated={onEventUpdated}
      />

      <div className="g-event-modal-info">
        <button className="color"
          style={{
            backgroundColor: getHexColor(eventDetails.blockColor),
          }}
        ></button>
        <EventModalTitle
          eventDetails={eventDetails}
          inputTitle={inputTitle}
          setInputTitle={setInputTitle}
          handleUpdateEvent={handleUpdateUEvent}
        />

        <TimeSetting
          headerInfo={headerInfo}
          startDate={startDate} setStartDate={setStartDate}
          startTime={startTime} setStartTime={setStartTime}
          endDate={endDate} setEndDate={setEndDate}
          endTime={endTime} setEndTime={setEndTime}
          handleUpdateEvent={handleUpdateUEvent}
        />

        <Memo
          eventDetails={eventDetails}
          inputMemo={inputMemo}
          setInputMemo={setInputMemo}
          handleUpdateEvent={handleUpdateUEvent}
        />
      </div>
    </div>
  );
}