import { ALL_CITY_CONFIG } from '../../utils/cityConfig';
import './TransportationOptions.css';

export default function TransportationOptions({ city, transportation, setTransportation }) {
  const cityConfig = ALL_CITY_CONFIG.find((c) => c.id === city);
  const transportations = cityConfig?.transportation ?? [];

  return (
    <div className="travel-option-group">
      {transportations.map((transOption) => {
        const isSelected = transportation === transOption.id;

        return (
          <label
            key={transOption.id}
            className={`travel-card ${isSelected ? "travel-card-selected" : ""}`}
          >
            <input
              type="radio"
              name="travel"                    // ✅ name 분리 
              value={transOption.id}
              checked={isSelected}
              onChange={() => {
                setTransportation(transOption.id);
              }}
              className="travel-option-radio"
            />

            {/* ✅ 실제로 보일 텍스트 */}
            <span className="travel-label">
              {transOption.emoji}&nbsp;{transOption.kor}
            </span>
          </label>
        );
      })}
    </div>
  );
}