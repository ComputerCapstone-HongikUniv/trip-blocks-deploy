import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import './ProfileBtn.css';

export default function ProfileBtn({ border }) {
  const [nickName, setNickName] = useState('');
  const [profileImg, setProfileImg] = useState('/images/profiles/profile1.png'); // 기본값

  const BACKEND_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

  function resolveImageUrl(path) {
    if (!path) return '/images/profiles/profile1.png';

    // 이미 http로 시작하면 그대로 사용
    if (path.startsWith('http')) return path;

    if (path.endsWith('.png.png')) {
      path = path.replace(/\.png\.png$/, '.png');
    }


    // 업로드된 프로필 이미지인 경우 → 백엔드 도메인 붙이기
    if (path.startsWith('/uploads')) {
      return `${BACKEND_BASE_URL}${path}`;
    }

    // 기본 이미지(/images/profiles/...) 는 프론트 public에 있으니까 그대로
    return path;
  }

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