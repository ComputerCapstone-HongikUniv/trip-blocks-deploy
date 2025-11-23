// Logo.jsx
import { Link } from "react-router-dom";

function Logo({ width = 40, height = 40 }) {
  return (
    <Link to="/mypage">
      <img
        src="assets/brand/logo.png"
        alt="logo" width={width} height={height}
      />
    </Link>);
}

export default Logo;