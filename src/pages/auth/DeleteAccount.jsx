import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import BrandLogo from "../../components/Brand/BrandLogo.jsx";
import './DeleteAccount.css';
import { useState } from "react";

export default function DeleteAccount() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async () => {
    const ok = window.confirm("정말 탈퇴하시겠습니까?\n모든 데이터는 복구가 불가능합니다.");
    if (!ok) return;

    try {
      setLoading(true);

      await axiosInstance.delete("/api/withdraw"); // 🔥 회원 탈퇴 요청

      alert("회원 탈퇴가 완료되었습니다.");
      localStorage.removeItem("token"); // 토큰 제거 (로그인 상태 정리)
      navigate("/"); // 홈으로 이동
    } catch (err) {
      console.error("회원 탈퇴 실패:", err);
      alert("회원 탈퇴에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="delete-account-container">
      <div style={{ display: "flex", justifyContent: "center" }}>
        <BrandLogo logoSize={20} fontSize={20} fontWeight="700" />
      </div>

      <div className="delete-account-text">
        탈퇴 전 확인하세요!
      </div>
      <div className="text-align-center">
        탈퇴하시면 이용 중인 계정이 폐쇄되며,<br />
        모든 데이터는 복구가 불가능합니다.
      </div>

      <div className="delete-account-btn-container">
        <button className="delete-account-btn button-secondary">
          <Link to="/edit-profile">취소</Link>
        </button>

        <button
          className="delete-account-btn button-primary"
          onClick={handleDeleteAccount}
          disabled={loading}   // 로딩 중일 때 중복 클릭 방지
        >
          {loading ? "처리 중..." : "회원 탈퇴"}
        </button>
      </div>
    </div>
  );
}