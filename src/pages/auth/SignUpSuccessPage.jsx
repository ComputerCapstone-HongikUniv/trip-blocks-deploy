import { Link, useLocation } from 'react-router-dom';
import BrandLogo from "../../components/Brand/BrandLogo.jsx";
import './SignUpSuccessPage.css';

function SignUpSuccessPage() {
  const { state } = useLocation();
  const nickName = state?.nickName;

  return (
    <div className="success-container">
      <div style={{ display: "flex", justifyContent: "center" }}>
        <BrandLogo logoSize={20} fontSize={20} fontWeight="700" />
      </div>

      <div className="congratulation-text">🎉 {nickName}님, 환영합니다!</div>
      <div className="text-align-center">
        가입이 완료되었습니다.<br />
        이제 나만의 여행 일정을 만들어 보세요!
      </div>

      {/* 버튼 대신 Link 사용 */}
      <Link to="/signin" className="button-primary to-home-btn">
        로그인하기
      </Link>
    </div>
  );
}

export default SignUpSuccessPage;