import { useNavigate } from "react-router-dom";
import DummyImage from "../../assets/brand/DummyImage.jsx";
import BrandLogo from "../../components/Brand/BrandLogo.jsx";
import "./Intro.css";

function Intro() {
  const navigate = useNavigate();  // ✅ 여기서 훅으로 가져오기

  return (
    <div>
      <main>
        <div className="welcome">
          {/* 랜딩 페이지용 로고 (크게) */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <BrandLogo logoSize={40} fontSize={40} fontWeight="700" />
          </div>

          <div className="brand-slogan">실수 없는 여행을 위한 여행 일정 계획 서비스를 만나보세요</div>
        </div>

        <div className="start-section">
          <button
            className="start-btn"
            onClick={() => navigate("/signin")}   // ✅ 이제 정상 작동
          >
            시작하기
          </button>
        </div>

        <div className="intro-example-images">
          <img className="calendar-mode-img"
            src="src/assets/examples/calendar-mode.png" alt="캘린더모드" />
          <img className="map-mode-img"
            src="src/assets/examples/map-mode.png" alt="캘린더모드" />
          <img className="detail-route-img"
            src="src/assets/examples/detail-route.png" alt="캘린더모드" />
        </div>

        <div className="saying">
          <p>사람이 여행을 하는 것은 도착하기 위해서가 아니라 여행하기 위해서이다.</p>
          <p>- 괴테 -</p>
        </div>
      </main>

      <footer className="footer">
        <p>© 2025 Trip Blocks. All rights reserved.</p>
        <div className="footer-links">
          <a href="#">이용약관</a>
          <span>|</span>
          <a href="#">개인정보처리방침</a>
          <span>|</span>
          <a href="#">Contact</a>
        </div>
      </footer>
    </div>
  );
}

export default Intro;