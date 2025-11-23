import { useState } from 'react';
import editIcon from '/icons/edit-icon.png';
import './EventModalTitle.css';

export default function EventModalTitle({
  eventDetails,
  inputTitle, setInputTitle,
  handleUpdateEvent
}) {
  const [titleEditMode, setTitleEditMode] = useState(false);

  async function saveTitle() {
    await handleUpdateEvent();  // ✅ 통합 저장 로직 쓰기
    setTitleEditMode(false);
  }

  function saveInputTitle(event) {
    // inputTitle 상태를 현재 입력한 값으로 업데이트해라.
    setInputTitle(event.target.value);
  }

  return (
    <div className="title-container">
      <input
        type="text"
        className="title"
        placeholder={eventDetails.placeName || eventDetails.eventName || "제목 없음"}
        value={inputTitle}
        onChange={saveInputTitle}
        readOnly={!titleEditMode}
      />
      {!titleEditMode && (
        <button className="edit-title-btn"
          onClick={() => {
            setTitleEditMode(true);
          }}>
          <img className="g-modal-icon-img"
            src={editIcon} />
        </button >)}
      {titleEditMode && (
        <button onClick={() => {
          saveTitle();
        }}>
          저장
        </button>
      )}
    </div>
  );
}