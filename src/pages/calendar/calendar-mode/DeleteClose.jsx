import axiosInstance from '../../../api/axiosInstance';

export default function DeleteClose({
  calendarId, eventId, closeModal, onEventUpdated
}) {
  async function handleDeleteEvent() {
    try {
      await axiosInstance.delete(
        `/api/calendars/${calendarId}/events/${eventId}`
      );

      // 상위에서 events 배열 업데이트할 수 있도록 알려주기
      if (onEventUpdated) {
        onEventUpdated({
          eventId,     // 어떤 이벤트가 지워졌는지
          _deleted: true, // 삭제 플래그
        });
      }

      // 모달 닫기
      closeModal();
    } catch (err) {
      console.error("일정 삭제 실패:", err);
    }
  }

  return (
    <div className="delete-close-btn-container">
      <button className="event-delete-btn"
        onClick={handleDeleteEvent}
      >
        <img className="delete-img" src='/icons/Delete-outline.svg' alt='삭제' />
      </button>
      <button className="event-close-btn"
        onClick={closeModal}>
        <img className="delete-img" src='/icons/Close-light.svg' alt='닫기' />
      </button>
    </div>
  );
}