export const transportations = [
  { id: "transit", emoji: "🚊", kor: "대중교통", capital: "TRANSIT" },
  { id: "driving", emoji: "🚘", kor: "자동차", capital: "DRIVING" },
  { id: "walking", emoji: "🚶🏻‍♂️", kor: "도보", capital: "WALKING" },
  { id: "bicycling", emoji: "🚴‍♀️", kor: "자전거", capital: "BICYCLING" }
];

export const getTransportationInfo = (mode) => {
  if (!mode) return { emoji: "❓", kor: "이동 정보 없음" };
  return transportations.find((t) => t.id === mode) || { emoji: "❓", kor: "이동 정보 없음" };
};