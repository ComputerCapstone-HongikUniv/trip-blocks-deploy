
import { useState } from "react";
import "./CityOptions.css";

export default function CityOptions({ ALL_CITY_CONFIG, city, setCity }) {

  return (
    <div className="city-option-group">

      {ALL_CITY_CONFIG.map((cityOption) => {
        const isSelected = city === cityOption.id;

        return (
          <label
            key={cityOption.id}
            className={`option-card ${isSelected ? "option-card-selected" : ""}`}
          >
            {/* 진짜 라디오 (시각적으로 숨김) */}
            <input
              type="radio"
              name="display"
              value={cityOption.id}
              checked={isSelected}
              onChange={() => {
                setCity(cityOption.id);
              }}
              className="option-radio"
            />

            <span className="option-label">{cityOption.kor}</span>

          </label>
        );
      })}
    </div>
  );
}