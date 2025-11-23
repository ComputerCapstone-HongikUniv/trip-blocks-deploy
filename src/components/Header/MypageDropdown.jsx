// src/components/MenuButton.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance.js";   // ★ 경로는 프로젝트 구조에 맞게 조정
import "./MypageDropdown.css";

export default function MypageDropdown() {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  const toggleMenu = () => setOpen(prev => !prev);

  // 바깥 클릭하면 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ⭐ 로그아웃 처리
  const handleLogout = async () => {
    try {
      // 백엔드에 로그아웃 요청 (필수는 아니지만, API 맞춰서 호출)
      await axiosInstance.get("/api/signout");

      // 클라이언트에서 토큰 및 유저 정보 제거
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("nickName");

      // 드롭다운 닫기
      setOpen(false);

      // 메인 페이지로 이동
      navigate("/");
    } catch (error) {
      console.error("로그아웃 실패:", error);
      // 그래도 로컬 토큰은 지우고 보낼지 여부는 선택
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("nickName");
      navigate("/");
    }
  };

  return (
    <div className="menu-wrapper" ref={wrapperRef}>
      <button
        className="menu-icon-btn"
        onClick={toggleMenu}
      >
        <img className="menu-icon-img" src="icons/kebab-menu.svg" alt="메뉴" />
      </button>

      {open && (
        <div className="menu-panel">
          <button className="menu-item">
            <Link to="/edit-cover">
              커버사진 변경
            </Link>
          </button>
          <button className="menu-item">내 프로필</button>
          <button
            className="menu-item"
            onClick={handleLogout}
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}