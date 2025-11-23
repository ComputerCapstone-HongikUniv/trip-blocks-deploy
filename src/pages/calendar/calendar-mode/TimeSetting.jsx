import { useState } from 'react';
import './TimeSetting.css';

export default function TimeSetting({
  headerInfo,
  startDate, setStartDate,
  startTime, setStartTime,
  endDate, setEndDate,
  endTime, setEndTime,
  handleUpdateEvent
}) {
  const [dateTimeChangeMode, setDateTimeChageMode] = useState(false);

  async function saveTime() {
    await handleUpdateEvent();   // 벡엔드 저장 요청
    setDateTimeChageMode(false);
  }

  return (
    <div className="time-setting">
      <div className="time-row">
        {/* 시작 쪽 */}
        <div className="time-group"
          onClick={() => {
            setDateTimeChageMode(true);
          }}>
          <input
            type="date"
            lang="ko"
            className="time-date-input"
            value={startDate}
            min={headerInfo.startDate}
            max={headerInfo.endDate}
            onChange={(e) => setStartDate(e.target.value)}
            onClick={(e) => {
              if (e.target.showPicker) {
                e.target.showPicker();
              } else {
                e.target.focus();
              }
            }}
          />
          <input
            type="time"
            className="time-time-input"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            onClick={(e) => {
              if (e.target.showPicker) {
                e.target.showPicker();
              } else {
                e.target.focus();
              }
            }}
          />
        </div>

        <span className="time-arrow">→</span>

        {/* 끝나는 쪽 */}
        <div className="time-group"
          onClick={() => {
            setDateTimeChageMode(true);
          }}>
          <input
            type="date"
            lang="ko"
            className="time-date-input"
            value={endDate}
            min={headerInfo.startDate}
            max={headerInfo.endDate}
            onChange={(e) => setEndDate(e.target.value)}
            onClick={(e) => {
              if (e.target.showPicker) {
                e.target.showPicker();
              } else {
                e.target.focus();
              }
            }}
          />
          <input
            type="time"
            className="time-time-input"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            onClick={(e) => {
              if (e.target.showPicker) {
                e.target.showPicker();
              } else {
                e.target.focus();
              }
            }}
          />
        </div>
      </div>

      {dateTimeChangeMode && (
        <div className="date-time-save-container">
          <button
            className="date-time-save-btn"
            onClick={() => {
              saveTime();
            }}
          >
            날짜 및 시간 변경
          </button>
        </div>
      )}

    </div>
  );
}