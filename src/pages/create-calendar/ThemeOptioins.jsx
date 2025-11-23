import './ThemeOptioins.css';

export default function ThemeOptioins({ theme, setTheme }) {
  const baseUrl = import.meta.env.BASE_URL || '/';

  const themes = [
    { id: 1, label: "Mono", image: `${baseUrl}images/themes/theme1.png`, info: "모든 일정이 단색으로 생성됩니다." },
    { id: 2, label: "By Source", image: `${baseUrl}images/themes/theme1.png`, info: "장소를 검색하여 추가한 일정과 내가 직접 추가한 일정으로 구분됩니다." },
    { id: 3, label: "Category", image: `${baseUrl}images/themes/theme3.png`, info: "명소,  음식점, 카페, 직접 추가한 일정 등이 모두 구분됩니다." },
  ];

  const selectedTheme = themes.find((t) => t.id === theme);

  return (
    <div className="theme-option-container">
      <div className="theme-option-group">
        {themes.map((themeOption) => {
          const isSelected = theme === themeOption.id; // ✅ theme 기준으로 판단

          return (
            <label
              key={themeOption.id}
              className={`theme-card ${isSelected ? "theme-card-selected" : ""}`}
            >
              <input
                type="radio"
                name="theme"                    // ✅ name 분리 
                value={themeOption.id}
                checked={isSelected}
                onChange={() => {
                  setTheme(themeOption.id);     // ✅ theme만 변경
                }}
                className="theme-option-radio"
              />

              {/* ✅ 실제로 보일 텍스트 */}
              <span className="theme-label">{themeOption.label}</span>
            </label>
          );
        })}
      </div>
      {/* 선택된 테마의 미리보기 이미지 */}
      <div className="theme-preview">
        <img
          src={themes.find((t) => t.id === theme)?.image}
          alt={`선택된 테마 ${theme}`}
          className="theme-preview-image"
        />
        <p className="theme-info">{selectedTheme?.info}</p>
      </div>

    </div>
  );
}