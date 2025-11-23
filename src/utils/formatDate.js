/**
 * 한국어 형식으로 날짜를 변환합니다.
 * 예: "2025-12-01" → "2025년 12월 1일"
 */
export function formatKoreanDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function splitDateTime(isoString) {
  if (!isoString) return { date: "", time: "" };
  const [datePart, timePart] = isoString.split("T"); // ["2025-12-05", "19:30:00"]
  return {
    date: datePart,
    time: timePart.slice(0, 5) // "19:30"만 사용
  };
}

export function joinDateTime(date, time) {
  if (!date || !time) return "";
  // "2025-12-05" + "19:30" -> "2025-12-05T19:30:00"
  return `${date}T${time}:00`;
}
