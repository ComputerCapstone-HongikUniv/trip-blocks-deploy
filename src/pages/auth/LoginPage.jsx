import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance.js';
import BrandLogo from "../../components/Brand/BrandLogo.jsx";
import './LoginPage.css';

function LoginPage() {
  // 사용자 입력값 상태 관리
  const [loginId, setLoginId] = useState('');          // 아이디 입력값
  const [password, setPassword] = useState('');      // 비밀번호 입력값

  // 에러 메시지와 입력창 강조 상태
  const [errorMessage, setErrorMessage] = useState('');
  const [highlight, setHighlight] = useState({ id: false, pw: false });

  // 페이지 이동을 위한 네비게이션 훅
  const navigate = useNavigate();

  // 로그인 버튼 클릭 시 실행되는 함수
  const onSubmitHandler = async (e) => {
    e.preventDefault(); // 폼 제출 시 페이지 새로고침 방지

    // 아이디/비밀번호 입력값이 비었는지 확인
    const idEmpty = loginId.trim() === '';
    const pwEmpty = password.trim() === '';

    // 입력값이 비었을 경우 에러 메시지 표시 및 강조
    if (idEmpty || pwEmpty) {
      setErrorMessage(
        idEmpty && pwEmpty
          ? '아이디와 비밀번호를 입력하세요'
          : idEmpty
            ? '아이디를 입력하세요'
            : '비밀번호를 입력하세요'
      );
      setHighlight({ id: idEmpty, pw: pwEmpty });
      return; // 서버 요청 중단
    }

    try {
      // 서버에 로그인 요청
      const res = await axiosInstance.post('/api/signin', { loginId, password });

      // 로그인 성공 시: 토큰 로컬스토리지에 저장
      localStorage.setItem('token', res.data.token);

      // 로그인 성공 후 마이페이지로 이동
      navigate('/mypage');
    } catch (error) {
      // 서버에서 응답이 온 경우 (예: 401, 500 등)
      if (error.response) {
        const status = error.response.status;

        if (status === 401) {
          setErrorMessage(error.response.data.message || '로그인 실패2');
        } else if (status === 500) {
          setErrorMessage(
            error.response.data.message || '로그인에 에러가 발생하였습니다.'
          );
        } else {
          setErrorMessage(error.response.data.message || '로그인 실패1');
        }

        // 실패 시 입력창 강조 표시
        setHighlight({ id: true, pw: true });
      }
      // 서버에 아예 연결되지 않은 경우 (네트워크 오류 등)
      else {
        setErrorMessage('서버에 연결할 수 없습니다.');
      }
    }
  };

  // 렌더링 부분 (UI)
  return (
    <div className="login-wrapper">
      <div className="login-container">
        {/* 상단 브랜드 로고 */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <BrandLogo logoSize={36} fontSize={36} fontWeight="700" />
        </div>

        {/* 로그인 폼 */}
        <form className="login-form" onSubmit={onSubmitHandler}>
          {/* 아이디 입력창 */}
          <input
            type="text"
            placeholder="아이디"
            value={loginId}
            onChange={(e) => {
              setLoginId(e.target.value);
              setHighlight((prev) => ({ ...prev, id: false })); // 입력 시 강조 해제
            }}
            className={highlight.id ? 'highlight-input' : ''} // 오류 시 강조
          />

          {/* 비밀번호 입력창 */}
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setHighlight((prev) => ({ ...prev, pw: false })); // 입력 시 강조 해제
            }}
            className={highlight.pw ? 'highlight-input' : ''}
          />

          {/* 오류 메시지 출력 */}
          {errorMessage && <div className="error-message">{errorMessage}</div>}

          {/* 로그인 버튼 */}
          <button type="submit" className="button-primary">로그인</button>
        </form>

        {/* 회원가입 링크 */}
        <div className="login-register-container">
          <div className="login-register">
            <div>회원이 아니신가요?</div>
            <Link to="/signup">회원가입</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;