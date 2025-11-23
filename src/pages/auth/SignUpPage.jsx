/* eslint-disable */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axiosInstance from '../../api/axiosInstance.js';
import BrandLogo from "../../components/Brand/BrandLogo.jsx";
import './SignUpPage.css';

function SignUpPage() {
  // 페이지 이동용 훅 (회원가입 성공 시 이동)
  const navigate = useNavigate();

  // 사용자 입력 상태 관리
  const [nickName, setnickName] = useState('');       // 별명
  const [loginId, setLoginId] = useState('');           // 아이디
  const [password, setPassword] = useState('');       // 비밀번호
  const [confirmPassword, setConfirmPassword] = useState(''); // 비밀번호 확인

  // 오류 메시지 및 입력 강조 상태
  const [errorMessages, setErrorMessages] = useState([]);  // 오류 문구 리스트
  const [highlight, setHighlight] = useState({             // 잘못된 입력칸 강조
    nickName: false,
    loginId: false,
    password: false,
    confirmPassword: false,
  });

  // 아이디 중복확인 관련 상태
  const [idCheckMessage, setIdCheckMessage] = useState('');  // 중복확인 결과 문구
  const [idCheckStatus, setIdCheckStatus] = useState('');    // 결과 스타일 (success / error)
  const [isIdChecked, setIsIdChecked] = useState(false);     // 중복확인 완료 여부
  const [isIdAvailable, setIsIdAvailable] = useState(false); // 사용 가능한지 여부

  // 비밀번호 표시 토글 상태
  const [showPassword, setShowPassword] = useState(false);

  // 아이디 입력 감지 (입력 시작했는지 여부)
  const [isIdDirty, setIsIdDirty] = useState(false);

  // 아이디 유효성 정규식 (4~10자, 영문/숫자/특수문자)
  const validIdPattern = /^[A-Za-z0-9!@#$%^&*()_+=-]{4,10}$/;
  const validPwPattern = /^.{4,16}$/; // 4~16자 아무 문자
  const validnickNamePattern = /^.{1,16}$/;

  const isValidIdFormat = validIdPattern.test(loginId);
  const isValidPwFormat = validPwPattern.test(password);
  const isValidnickNameFormat = validnickNamePattern.test(nickName);

  // 아이디가 변경될 때마다 중복확인 상태 초기화
  useEffect(() => {
    setIsIdChecked(false);
    setIdCheckMessage('');
    setIdCheckStatus('');
    setIsIdAvailable(false);
  }, [loginId]);

  // 입력값 유효성 검증 함수
  const validateInput = () => {
    const newErrors = [];
    const newHighlight = { ...highlight };

    if (!nickName.trim()) {
      newErrors.push('별명을 입력해주세요.');
      newHighlight.nickName = true;
    } else if (!isValidnickNameFormat) {
      newErrors.push('별명은 1~16자 이내로 입력해주세요.');
      newHighlight.nickName = true;
    }

    if (!loginId.trim()) {
      newErrors.push('아이디를 입력해주세요.');
      newHighlight.loginId = true;
    } else if (!isValidIdFormat) {
      newHighlight.loginId = true;
    }

    if (!password.trim()) {
      newErrors.push('비밀번호를 입력해주세요.');
      newHighlight.password = true;
    } else if (!isValidPwFormat) {
      newErrors.push('비밀번호는 4~16자 이내로 입력해주세요.');
      newHighlight.password = true;
    }

    if (!confirmPassword.trim()) {
      newErrors.push('비밀번호 확인을 입력해주세요.');
      newHighlight.confirmPassword = true;
    } else if (password && confirmPassword && password !== confirmPassword) {
      newErrors.push('비밀번호가 일치하지 않습니다.');
      newHighlight.confirmPassword = true;
    }

    setHighlight(newHighlight);
    setErrorMessages(newErrors);
    return newErrors.length === 0;
  };

  // 아이디 중복 확인 (axiosInstance 사용)
  const handleIdCheck = async () => {
    // 아이디 형식이 틀리면 중단
    if (!isValidIdFormat) return;

    try {
      // 백엔드로 GET 요청 (예: /check-id?loginId=abc)
      const response = await axiosInstance.get(`/api/check-id?loginId=${loginId}`);

      // 백엔드 응답에 따라 메시지 표시
      if (response.data.exists) {
        setIdCheckMessage('이미 사용 중인 아이디입니다.');
        setIdCheckStatus('error');
        setIsIdAvailable(false);
      } else {
        setIdCheckMessage('사용 가능한 아이디입니다.');
        setIdCheckStatus('success');
        setIsIdAvailable(true);
      }

      // 중복 확인 완료 표시
      setIsIdChecked(true);
    } catch (error) {
      // 요청 실패 시 에러 처리
      setIdCheckMessage('중복 확인 중 오류가 발생했습니다.');
      setIdCheckStatus('error');
      setIsIdAvailable(false);
      setIsIdChecked(false);
    }
  };

  // 회원가입 버튼 클릭 시 실행
  const handleSubmit = async (e) => {
    e.preventDefault(); // 기본 폼 제출 방지

    // 입력 검증 (모든 항목 확인)
    const isValid = validateInput();
    if (!isValid) return;

    // 아이디 형식 또는 중복확인 미완료 시 경고
    if (!isValidIdFormat || !isIdChecked || !isIdAvailable) {
      setErrorMessages(['아이디 중복확인을 완료하고 사용 가능한 아이디를 입력해주세요.']);
      return;
    }

    try {
      // 서버로 회원가입 요청 (POST)
      const res = await axiosInstance.post('/api/signup', {
        nickName,
        loginId,
        password,
      });

      // 서버가 토큰을 반환한다고 가정
      localStorage.setItem('token', res.data.token);

      // 로그인한 사용자 정보도 저장해둘 수 있음 (선택)
      localStorage.setItem('loginId,', loginId);
      localStorage.setItem('nickName', nickName);

      // 회원가입 성공 시 마이페이지로 이동
      navigate('/signup-success', { state: { nickName } });
    } catch (error) {
      // 서버 오류 처리
      setErrorMessages(['회원가입 중 오류가 발생했습니다.']);
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-container">
        {/* 상단 브랜드 로고 */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <BrandLogo logoSize={36} fontSize={36} fontWeight="700" />
        </div>

        {/* 회원가입 폼 */}
        <form className="register-form" onSubmit={handleSubmit}>
          {/* 별명 입력 필드 */}
          <input
            type="text"
            placeholder="별명 등록"
            value={nickName}
            onChange={(e) => {
              setnickName(e.target.value);
              setHighlight((prev) => ({ ...prev, nickName: false })); // 입력 시 강조 해제
            }}
            className={highlight.nickName ? 'highlight-input' : ''}
          />

          {/* 아이디 입력 + 중복 확인 버튼 */}
          <div className="id-check-row">
            <input
              type="text"
              placeholder="아이디 등록"
              autoComplete="new-id"
              value={loginId}
              onChange={(e) => {
                setLoginId(e.target.value);
                setIsIdDirty(true); // 입력 시작 표시
                setHighlight((prev) => ({ ...prev, loginId: false }));
              }}
              className={highlight.loginId ? 'highlight-input' : ''}
            />
            <button
              type="button"
              className="check-button"
              onClick={handleIdCheck} // 중복 확인 함수 실행
              disabled={!isValidIdFormat} // 형식이 맞을 때만 버튼 활성화
            >
              중복 확인
            </button>
          </div>

          {/* 아이디 형식 안내문 */}
          {isIdDirty && !isValidIdFormat && (
            <span className="guide error">
              아이디는 4~16자의 영문 대/소문자, 숫자, 특수문자를 사용해 주세요.
            </span>
          )}

          {/* 중복확인 결과 안내문 */}
          {idCheckMessage && <span className={`guide ${idCheckStatus}`}>{idCheckMessage}</span>}

          {/* 비밀번호 입력칸 + 눈 모양 버튼 */}
          <div className="password-row">
            <input
              type={showPassword ? 'text' : 'password'} // 보기 토글
              placeholder="비밀번호"
              autoComplete="new-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setHighlight((prev) => ({ ...prev, password: false }));
              }}
              className={highlight.password ? 'highlight-input' : ''}
            />
            <button
              type="button"
              className="eye-button"
              onClick={() => setShowPassword(!showPassword)} // 비밀번호 표시 토글
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>

          {/* 비밀번호 확인 입력칸 */}
          <input
            type="password"
            placeholder="비밀번호 확인"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setHighlight((prev) => ({ ...prev, confirmPassword: false }));
            }}
            className={highlight.confirmPassword ? 'highlight-input' : ''}
          />

          {/* 오류 메시지 출력 */}
          {errorMessages.length > 0 && (
            <ul className="error-message">
              {errorMessages.map((msg, index) => (
                <li key={index}>{msg}</li>
              ))}
            </ul>
          )}

          {/* 가입하기 버튼 */}
          <button type="submit" className="button-primary">
            가입하기
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignUpPage;