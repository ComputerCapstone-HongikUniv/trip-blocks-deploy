import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
dayjs.locale('ko');

import { getHexColor } from '../../../utils/colorPalette.js';
import GEventModal from './GEventModalComponents/GEventModal.jsx';
import UEventModal from './UEventModal/UEventModal.jsx';
import deleteIcon from '/icons/Delete-outline.svg';
import closeIcon from '/icons/Close-light.svg';
import './EventModal.css'

export default function EventModal({
  closeModal,
  calendarId,
  eventId,
  eventDetails,
  loading,
  googleEvent,
  headerInfo, onEventUpdated
}) {


  // 아직 데이터 로딩 중이거나 없는 경우
  if (loading || !eventDetails) {
    return (
      <div className="g-event-modal" onClick={(e) => e.stopPropagation()}>
        <div className="delete-close-btn-container">
          <button>
            <img className="delete-img" src={deleteIcon} alt='삭제' />
          </button>
          <button onClick={closeModal}>
            <img className="delete-img" src={closeIcon} alt='닫기' />
          </button>
        </div>
        <div className="g-event-modal-loading">
          상세 정보를 불러오는 중입니다...
        </div>
      </div>
    );
  }

  return (
    <>
      {googleEvent ? (
        <GEventModal
          closeModal={closeModal}
          calendarId={calendarId}        // ✅ 추가
          eventId={eventId}              // ✅ 추가
          eventDetails={eventDetails}
          getHexColor={getHexColor}
          headerInfo={headerInfo}
          onEventUpdated={onEventUpdated}
        />
      ) : (
        <UEventModal
          closeModal={closeModal}
          calendarId={calendarId}
          eventId={eventId}
          eventDetails={eventDetails}
          getHexColor={getHexColor}
          headerInfo={headerInfo}
          onEventUpdated={onEventUpdated}
        />
      )}
    </>
  );
}