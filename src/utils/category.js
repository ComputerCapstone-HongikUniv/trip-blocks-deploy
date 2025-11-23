// src/utils/category.js

// 자바스크립트 객체의 키는 항상 string이어서 안해도 되지만 공백, -, / 들어가면 따옴표 처리 해야함.
const CATEGORY_KOR_MAP = {
  "attraction": "명소",
  "restaurant": "음식점",
  "cafe": "카페",
  "lodging": "숙소",
  "other": "명소",
};

export function getCategoryKor(id) {
  return CATEGORY_KOR_MAP[id] ?? "명소";
}