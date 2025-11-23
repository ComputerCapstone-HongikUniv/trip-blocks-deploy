import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import './ProfileBtn.css';

const BACKEND_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// 프론트 배포 base 경로 (예: "/trip-blocks-deploy/")
const FRONT_BASE_URL = import.meta.env.BASE_URL;

function resolveImageUrl(path) {
  // 1) 값이 없으면: 기본 프로필 이미지 (public/images/profiles/profile1.png)
  if (!path) return `${FRONT_BASE_URL}images/profiles/profile1.png`;

  // 2) 이미 절대 URL이면 그대로 사용
  if (path.startsWith('http')) return path;

  // 3) 업로드된 프로필 이미지인 경우 → 백엔드 도메인 붙이기
  if (path.startsWith('/uploads')) {
    return `${BACKEND_BASE_URL}${path}`;
  }

  // 4) 나머지는 프론트 public 기준 경로로 처리
  //    예: "/images/profiles/profile2.png" → "<BASE_URL>images/profiles/profile2.png"
  return `${FRONT_BASE_URL}${path.replace(/^\//, '')}`;
}

export default function ProfileBtn({ border }) {
  const [nickName, setNickName] = useState('');
  const [profileImg, setProfileImg] = useState(
    `${FRONT_BASE_URL}images/profiles/profile1.png` // 기본값
  );

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get('/api/user-profile');
        setNickName(res.data.nickName);

        if (res.data.userProfileImage) {
          setProfileImg(resolveImageUrl(res.data.userProfileImage));
        }
      } catch (err) {
        console.error('프로필 불러오기 실패:', err);
      }
    };

    fetchProfile();
  }, []);

  return (
    <Link to="/edit-profile" className={`profile-link-btn ${border}`}>
      <p>{nickName}</p>
      <img className="profile-img" src={profileImg} alt="user profile" />
    </Link>
  );
}