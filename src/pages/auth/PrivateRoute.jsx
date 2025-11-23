// src/components/auth/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');

  // 토큰 없으면 로그인 페이지로 리다이렉트
  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  return children;
}

export default PrivateRoute;