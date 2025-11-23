import Calendar from 'react-calendar';
import { isSameDay, isBefore, isAfter, differenceInCalendarDays } from 'date-fns';
import './DateOptions.css';

export default function DateOptions({ startDate, setStartDate, endDate, setEndDate }) {
  const handleDateClick = (date) => {
    // 아무 날짜도 선택 안했거나, 이미 날짜 범위 선택 했다면,
    if (!startDate || (startDate && endDate)) {
      // 시작 날짜로 설정
      setStartDate(date);
      setEndDate(null);
    }
    // 선택한 날짜가 시작일부터 이전이면,
    else if (isBefore(date, startDate)) {
      // 시작일로 설정
      setStartDate(date);
      setEndDate(null);
    }
    // endDate 선택
    else {
      const diff = differenceInCalendarDays(date, startDate)
      if (diff <= 6) {
        setEndDate(date);
      } else {
        alert('최대 7일까지 선택 가능합니다.')
      }
    }
  }

  // 조건에 따라 css 적용
  const tileClassName = ({ date }) => {
    // 날짜가 시작일이면,
    if (startDate && isSameDay(date, startDate)) return 'calendar-start'
    // 날자가 끝일이면, 
    if (endDate && isSameDay(date, endDate)) return 'calendar-end'
    // 날짜가 시작일과 끝일 사이에 포함되면,
    if (startDate && endDate && isAfter(date, startDate) && isBefore(date, endDate)) return 'calendar-range'
    // 그 외 날짜
    return null
  }

  return (
    <div className="calendar-container">
      <Calendar
        onClickDay={handleDateClick}
        tileClassName={tileClassName} // 각 날짜별 클래스 적용 함수
        minDate={new Date()}  // 오늘 이전 날짜는 클릭 불가
        locale="en-US"
        calendarType="gregory"
        formatShortWeekday={(locale, date) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]}
        formatDay={(locale, date) => date.getDate().toString()}
      />
    </div>
  );
}