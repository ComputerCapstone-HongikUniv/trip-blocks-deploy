import Logo from "../../assets/brand/logo.png"; // 사용자가 만든 로고 컴포넌트

function BrandLogo({
  logoSize = 40,       // 로고 크기
  fontSize = 40,       // 브랜드명 폰트 크기
  fontWeight = "bold", // 폰트 굵기
  brandName = "Trip Blocks", // 브랜드명
  gapRatio = 0.4,      // 로고 크기에 비례한 간격 비율 (20% 기본)
  color = "#000"       // 브랜드명 색상
}) {
  // 로고 크기에 비례한 gap 계산
  const gap = logoSize * gapRatio;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: `${gap}px` }}>
      {/* 로고 */}
      <div style={{ width: logoSize, height: logoSize }}>
        <img
          src={Logo}
          alt="Trip Blocks logo"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain"
          }}
        />
      </div>

      {/* 브랜드명 */}
      <span style={{ fontSize: fontSize, fontWeight: fontWeight, color: color }}>
        {brandName}
      </span>
    </div>
  );
}

export default BrandLogo;