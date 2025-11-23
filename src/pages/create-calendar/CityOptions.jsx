
import { useState } from "react";
import "./CityOptions.css";

export default function CityOptions({ cities, setCity }) {
  const [selectedId, setSelectedId] = useState("seoul");

  return (
    <div className="option-group">

      {cities.map((option) => {
        const isSelected = selectedId === option.id;

        return (
          <label
            key={option.id}
            className={`option-card ${isSelected ? "option-card-selected" : ""}`}
          >
            {/* 진짜 라디오 (시각적으로 숨김) */}
            <input
              type="radio"
              name="display"
              value={option.id}
              checked={isSelected}
              onChange={() => {
                setSelectedId(option.id);
                setCity(option.id);
              }}
              className="option-radio"
            />

            <span className="option-label">{option.label}</span>

          </label>
        );
      })}
    </div>
  );
}