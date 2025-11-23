import { useState, useEffect, useRef } from 'react';
import Memo from '../Memo';
import './GEventModalBottom.css';

export default function GEventModalBottom({
  eventDetails,
  openingHoursForEventDay,
  inputMemo,
  setInputMemo,
  handleUpdateEvent
}) {
  const [isOpeningHoursOpen, setIsOpeningHoursOpen] = useState(false);  // 영업시간 정보 열어보기
  // 입력된 값

  return (
    <div>
      <Memo
        eventDetails={eventDetails}
        inputMemo={inputMemo}
        setInputMemo={setInputMemo}
        handleUpdateEvent={handleUpdateEvent}
      />

      <div className="address-container">
        <img className="g-modal-icon-img" src='/icons/location-icon.svg' />
        <span>{eventDetails.address}</span>
      </div>
      <div className="open-hour-container" onClick={() => setIsOpeningHoursOpen(prev => !prev)}>
        <img className="g-modal-icon-img" src="/icons/clock-icon.svg" />

        <span>
          {openingHoursForEventDay
            ? openingHoursForEventDay  // 예: "Monday: 9:00 AM – 11:00 PM"
            : "영업시간 정보가 없습니다"}
        </span>

        <img
          className={`g-modal-icon-img down-arrow ${isOpeningHoursOpen ? "down-arrow--open" : ""}`}
          src="/icons/down-arrow.png"
          alt="영업시간 더보기"
        />
      </div>

      {isOpeningHoursOpen && Array.isArray(eventDetails.formattedOpeningHours) && (
        <ul className="open-hours-list">
          {eventDetails.formattedOpeningHours.map((line) => {
            const [day, ...rest] = line.split(":");
            const hours = rest.join(":").trim(); // " 9:00 AM – 11:00 PM" → "9:00 AM – 11:00 PM"

            return (
              <li key={day} className="open-hours-item">
                <span className="open-hours-day">{day}</span>
                <span className="open-hours-time">{hours}</span>
              </li>
            );
          })}
        </ul>
      )}
      <div className="phone-number-container">
        <img className="g-modal-icon-img" src='/icons/phone-icon.svg' />
        <span className="phone-number">
          {eventDetails.phoneNumber}
          <button className="copy-btn">
            <img className="copy-img" src='/icons/copy-icon.svg' />
          </button>
        </span>

      </div>
    </div>
  );
}