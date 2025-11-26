
import { useState } from "react";
import "./CityOptions.css";

export default function CityOptions({ ALL_CITY_CONFIG, setCity }) {
  const [selectedId, setSelectedId] = useState("seoul");

  return (
    <div className="city-option-group">

      {ALL_CITY_CONFIG.map((city) => {
        const isSelected = selectedId === city.id;

        return (
          <label
            key={city.id}
            className={`option-card ${isSelected ? "option-card-selected" : ""}`}
          >
            {/* 진짜 라디오 (시각적으로 숨김) */}
            <input
              type="radio"
              name="display"
              value={city.id}
              checked={isSelected}
              onChange={() => {
                setSelectedId(city.id);
                setCity(city.id);
              }}
              className="option-radio"
            />

            <span className="option-label">{city.kor}</span>

          </label>
        );
      })}
    </div>
  );
}