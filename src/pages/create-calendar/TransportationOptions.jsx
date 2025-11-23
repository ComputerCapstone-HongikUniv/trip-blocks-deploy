import './TransportationOptions.css';

export default function TransportationOptions({ transportation, setTransportation }) {
  const transportations = [
    { id: "transit", label: "🚊 대중교통" },
    { id: "driving", label: "🚘 자동차" },
    { id: "walking", label: "🚶🏻‍♂️ 도보" },
    { id: "bicycling", label: "🚴‍♀️ 자전거" }
  ];

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
            <span className="travel-label">{transOption.label}</span>
          </label>
        );
      })}
    </div>
  );
}