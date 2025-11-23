import { useState, useEffect, useRef } from 'react';
import memoIcon from '/icons/memo-icon.svg';
import './Memo.css';

export default function Memo({
  inputMemo, setInputMemo, handleUpdateEvent
}) {
  const textareaRef = useRef(null);
  const [memoEditMode, setMemoEditMode] = useState(false);

  function saveInputMemo(event) {  // 현재 입력값
    setInputMemo(event.target.value);
  }

  function saveMemo() {
    setMemoEditMode(false);
    handleUpdateEvent();
  }

  // 텍스트 길이에 따라 textarea 높이 자동 조절
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto"; // 높이 초기화
    textarea.style.height = `${textarea.scrollHeight}px`; // 내용 높이에 맞게 조정
  }, [inputMemo]);

  return (
    <div className="memo-container">
      <img className="g-modal-icon-img" src={memoIcon} />
      <textarea
        ref={textareaRef}
        className={`memo ${memoEditMode ? "memo--active" : ""}`}
        placeholder="메모"
        rows={1}                 // 기본 표시 줄 수
        onClick={() => setMemoEditMode(true)}
        onChange={saveInputMemo}
        onBlur={saveMemo}
        value={inputMemo || ''}
      />
    </div>
  );
}