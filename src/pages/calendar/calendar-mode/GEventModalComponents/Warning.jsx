import { useState, useEffect, useRef } from 'react';
import { getTransportationInfo } from '../../../../utils/transportations.js';
import { CITY_CONFIG } from '../../../../utils/cityConfig.js';
import './Warning.css';

export default function Warning({
  headerInfo,
  eventDetails,
  showOpeningHoursWarning,
  setShowOpeningHoursWarning,
  previousTransportation,
  setPreviousTransportation,
  showPreviousWarning,
  setShowPreviousWarning,
  nextTransportation,
  setNextTransportation,
  showNextWarning,
  setShowNextWarning,
  handleUpdateEvent
}) {
  const [previousTransportPanel, setPreviousTransportPanel] = useState(false);
  const [nextTransportPanel, setNextTransportPanel] = useState(false);
  const city = headerInfo.city;
  const cityConfig = CITY_CONFIG.find((c) => c.id === city);
  const transportations = cityConfig?.transportation ?? [];
  const prevPanelRef = useRef(null);
  const nextPanelRef = useRef(null);

  // 바깥 클릭 시 패널 닫기
  useEffect(() => {
    function handleClickOutside(e) {
      // 이전 패널
      if (
        previousTransportPanel &&
        prevPanelRef.current &&
        !prevPanelRef.current.contains(e.target)
      ) {
        setPreviousTransportPanel(false);
      }

      // 이후 패널
      if (
        nextTransportPanel &&
        nextPanelRef.current &&
        !nextPanelRef.current.contains(e.target)
      ) {
        setNextTransportPanel(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [previousTransportPanel, nextTransportPanel]);

  // 영업시간 경고 토글 상태 전환하고 벡엔드 업데이트 요청
  async function saveShowOpeningHoursWarning() {
    const next = !showOpeningHoursWarning; // 직접 계산
    setShowOpeningHoursWarning(next);
    await handleUpdateEvent({ showOpeningHoursWarning: next });
  }

  // 이전 일정과의 이동수단 선택 패널 열고 닫기
  function togglePreviousTransportPanel() {
    setPreviousTransportPanel(prev => !prev);
    setNextTransportPanel(false);
  }

  // 이전 일정과의 경고 보기 토글
  async function saveShowPreviousWarning() {
    const next = !showPreviousWarning;
    setShowPreviousWarning(next);
    await handleUpdateEvent({ showPreviousWarning: next });
  }

  // 이후 일정과의 이동수단 선택 패널 열고 닫기
  function toggleNextTransportPanel() {
    setNextTransportPanel(prev => !prev);
    setPreviousTransportPanel(false);
  }

  // 이후 일정과의 경고 보기 토글
  async function saveShowNextWarning() {
    const next = !showNextWarning;
    setShowNextWarning(next);
    await handleUpdateEvent({ showNextWarning: next });
  }

  // 이전 일정까지의 이동수단 선택 + 백엔드 업데이트
  async function handleSelectPreviousTransport(transport) {
    setPreviousTransportPanel(false); // 드롭다운 닫기
    if (setPreviousTransportation) {
      setPreviousTransportation(transport.id);
    }
    await handleUpdateEvent({
      previousTransportation: transport.id,
    });
  }

  // 이후 일정까지의 이동수단 선택 + 백엔드 업데이트
  async function handleSelectNextTransport(transport) {
    setNextTransportPanel(false); // 드롭다운 닫기
    if (setNextTransportation) {
      setNextTransportation(transport.id);
    }
    await handleUpdateEvent({
      nextTransportation: transport.id,
    });
  }

  return (
    <div className="warning">
      {/* 영업시간 경고 */}
      {eventDetails.openingHoursWarning && (
        <div className="warning-opening-container">
          <div className="warning-opening">
            <span className={`warning-opening-icon ${showOpeningHoursWarning
              ? "warning-opening-icon--active" : ""}`}>
              !
            </span>
            <span className={`warning-opening-txt ${showOpeningHoursWarning
              ? "warning-opening-txt--active" : ""}`}>
              이 장소는 해당 시간에 운영되지 않습니다
            </span>
          </div>

          <label className="switch">
            <input
              type="checkbox"
              checked={showOpeningHoursWarning}
              onChange={saveShowOpeningHoursWarning}
            />
            <span className="slider round"></span>
          </label>
        </div>
      )}

      <div className="transport-container">
        {/* 이전 일정으로부터의 이동 경고 */}

        {previousTransportation && (
          <div className="transport-from-previous">
            <div className="transport-left-section">
              <button className="transport-select"
                onClick={() => {
                  togglePreviousTransportPanel();
                }}>
                {getTransportationInfo(previousTransportation).emoji}
              </button>
              {/* 드롭다운 */}
              {previousTransportPanel && (
                <div className="select-transport-panel"
                  ref={prevPanelRef}>
                  {transportations.map((transport) => (
                    <button
                      key={transport.id}
                      className="transport-option-button"
                      onClick={() => handleSelectPreviousTransport(transport)}
                    >
                      {transport.emoji}&nbsp;&nbsp;&nbsp;{transport.kor}
                    </button>
                  ))}
                </div>
              )}
              <span
                className={`transport-txt ${showPreviousWarning && eventDetails.isPreviousWarning
                  ? "transport-txt--active"
                  : ""
                  }`}
              >
                이전 일정으로부터&nbsp;
                {getTransportationInfo(previousTransportation).kor}&nbsp;
                {eventDetails.previousFormattedTravelTime ?? 0}&nbsp;
                소요
                {eventDetails.isPreviousWarning && (
                  <span
                    className={`exclamation ${showPreviousWarning ? "exclamation--active" : ""
                      }`}
                  >
                    !
                  </span>
                )}
              </span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={showPreviousWarning}
                onChange={saveShowPreviousWarning}
              />
              <span className="slider round"></span>
            </label>
          </div>
        )}

        {/* 이후 일정까지 이동 경고 */}
        {nextTransportation && (
          <div className="transport-to-next">
            <div className="transport-left-section">
              <button className="transport-select"
                onClick={() => {
                  toggleNextTransportPanel();
                }}
              >
                {getTransportationInfo(nextTransportation).emoji}
              </button>
              {nextTransportPanel && (
                <div className="select-transport-panel"
                  ref={nextPanelRef}>
                  {transportations.map((transport) => (
                    <button
                      key={transport.id}
                      className="transport-option-button"
                      onClick={() => handleSelectNextTransport(transport)}
                    >
                      {transport.emoji}&nbsp;&nbsp;&nbsp;
                      {transport.kor}
                    </button>
                  ))}
                </div>
              )}
              <span
                className={`transport-txt ${showNextWarning && eventDetails.isNextWarning
                  ? "transport-txt--active"
                  : ""
                  }`}
              >
                이후 일정까지&nbsp;
                {getTransportationInfo(nextTransportation).kor}&nbsp;
                {eventDetails.nextFormattedTravelTime ?? 0}&nbsp;
                소요
                {eventDetails.isNextWarning && (
                  <span
                    className={`exclamation ${showNextWarning ? "exclamation--active" : ""
                      }`}
                  >
                    !
                  </span>
                )}
              </span>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={showNextWarning}
                onChange={saveShowNextWarning}
              />
              <span className="slider round"></span>
            </label>
          </div>
        )}
      </div>
    </div >
  );
}