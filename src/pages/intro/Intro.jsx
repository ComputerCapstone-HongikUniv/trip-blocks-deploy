import { useNavigate } from "react-router-dom";
import DummyImage from "../../assets/brand/DummyImage.jsx";
import BrandLogo from "../../components/Brand/BrandLogo.jsx";
import calendarModeImg from "../../assets/examples/calendar-mode.png";
import mapModeImg from "../../assets/examples/map-mode.png";
import detailRouteImg from "../../assets/examples/detail-route.png";
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
            onClick={() => navigate("/signin")}   // 이제 정상 작동
          >
            시작하기
          </button>
        </div>

        <div className="intro-example-images">
          <img className="calendar-mode-img" src={calendarModeImg} alt="캘린더 모드" />

          <div className="text-align-center">
            <h1>장소 검색부터 일정 생성까지, 한 번에
            </h1>
            <span>하나의 화면에서 가고 싶은 장소를 바로 일정으로 생성해 보세요. <br />해당 장소 정보가 반영된 일정이 생성되며, 영업 시간 및 이동 시간 관련 경고가 제공됩니다.</span>
          </div>

          <img className="map-mode-img" src={mapModeImg} alt="지도 모드" />

          <div className="text-align-center">
            <h1>지도모드</h1>
            <span>추천 장소 및 찜한 장소,
              일정에 추가한 장소를
              모두 확인할 수 있습니다.</span>
          </div>

          <img className="detail-route-img" src={detailRouteImg} alt="상세 경로 모드" />

          <div className="text-align-center">
            <h1>상세 경로 모드
            </h1>
            <span>일정 간의 상세한 이동 경로를 확인하고,<br />
              이동수단을 변경해보며 다양한 경로를 탐색할 수 있습니다.</span>
          </div>
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