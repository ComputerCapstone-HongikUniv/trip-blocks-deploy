import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

import './EditProfile.css';

// 백엔드 도메인
const BACKEND_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// 프론트 배포 base 경로 (예: "/trip-blocks-deploy/")
const FRONT_BASE_URL = import.meta.env.BASE_URL;

function resolveImageUrl(path) {
  // 1) 값이 없으면 기본 프로필 이미지
  if (!path) return `${FRONT_BASE_URL}images/profiles/profile1.png`;

  // 2) 백엔드에서 잘못 온 경우 (".png.png") 방어
  if (path.endsWith('.png.png')) {
    path = path.replace(/\.png\.png$/, '.png');
  }

  // 3) 업로드된 이미지: 절대 URL 또는 백엔드 상대경로
  if (path.startsWith('http')) {
    return path;
  }

  if (path.startsWith('/uploads')) {
    return `${BACKEND_BASE_URL}${path}`;
  }

  // 4) 그 외는 public 정적 리소스(/images/profiles/...) 기준
  //    "/images/..." → "<BASE_URL>images/..."
  return `${FRONT_BASE_URL}${path.replace(/^\//, '')}`;
}

export default function EditProfile() {
  const [nickName, setNickName] = useState('');

  // 기본 프로필 이미지 (배포 base 포함)
  const [profileImage, setProfileImage] = useState(
    `${FRONT_BASE_URL}images/profiles/profile1.png`
  );

  const navigate = useNavigate();

  // 기본 이미지 중 어떤 걸 선택했는지
  // "/images/profiles/profile1.png" 처럼 전체 경로를 저장
  const [selectedProfileImage, setSelectedProfileImage] = useState(null);

  // 업로드한 실제 파일
  const [uploadedFile, setUploadedFile] = useState(null);

  const fileInputRef = useRef(null);

  // 유저 프로필 불러오기
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get('/api/user-profile');
        setNickName(res.data.nickName);

        if (res.data.userProfileImage) {
          const imgPath = res.data.userProfileImage; // 서버 경로
          setProfileImage(resolveImageUrl(imgPath));
          setSelectedProfileImage(imgPath);
          setUploadedFile(null);
        }
      } catch (err) {
        console.error('프로필 정보 로드 실패:', err);
      }
    };
    fetchProfile();
  }, []);

  // 기존 프로필 이미지 버튼 클릭 시
  const handleSelectDefaultProfile = (fileName) => {
    const fullPath = `/images/profiles/${fileName}`;

    // 화면에 보여줄 건 base까지 붙인 URL
    setProfileImage(resolveImageUrl(fullPath));
    // 서버로 보낼 값은 "/images/profiles/profile1.png" 그대로
    setSelectedProfileImage(fullPath);
    setUploadedFile(null);
  };

  // 플러스 버튼 눌렀을 때 숨겨진 파일 input 열기
  const handleClickPlus = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 파일 선택 후 처리
  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setProfileImage(previewUrl);

    setUploadedFile(file);         // 서버로 보낼 파일
    setSelectedProfileImage(null); // 기본 이미지 선택 해제
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append('nickName', nickName);

      if (uploadedFile) {
        // 업로드한 파일 보냄
        formData.append('uploadedProfileImage', uploadedFile);
      } else if (selectedProfileImage) {
        // "/images/profiles/profile1.png" 같은 전체 경로 보냄
        formData.append('selectedProfileImage', selectedProfileImage);
      }

      const res = await axiosInstance.put('/api/user-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.userProfileImage) {
        setProfileImage(resolveImageUrl(res.data.userProfileImage));
      }
      navigate('/mypage');
    } catch (err) {
      console.error('프로필 저장 실패:', err);
      alert('프로필 저장에 실패했습니다.');
    }
  };

  return (
    <div className="edit-profile-wrapper">
      <div className="profile-edit-container">
        <h1 className="profile-edit-title">프로필 수정</h1>
        <img className="current-profile-img" src={profileImage} alt="current profile" />
      </div>

      <div className="profile-select-wrapper">
        <h3 className="profile-select-title">프로필 선택</h3>
        <div className="profile-select-btn-container">
          <button
            type="button"
            className="profile-select-btn"
            onClick={() => handleSelectDefaultProfile('profile1.png')}
          >
            <img
              className="profile-select-img"
              src={`${FRONT_BASE_URL}images/profiles/profile1.png`}
              alt="profile1"
            />
          </button>
          <button
            type="button"
            className="profile-select-btn"
            onClick={() => handleSelectDefaultProfile('profile2.png')}
          >
            <img
              className="profile-select-img"
              src={`${FRONT_BASE_URL}images/profiles/profile2.png`}
              alt="profile2"
            />
          </button>
          <button
            type="button"
            className="profile-select-btn"
            onClick={() => handleSelectDefaultProfile('profile3.png')}
          >
            <img
              className="profile-select-img"
              src={`${FRONT_BASE_URL}images/profiles/profile3.png`}
              alt="profile3"
            />
          </button>
          <button
            type="button"
            className="profile-select-btn"
            onClick={() => handleSelectDefaultProfile('profile4.png')}
          >
            <img
              className="profile-select-img"
              src={`${FRONT_BASE_URL}images/profiles/profile4.png`}
              alt="profile4"
            />
          </button>

          {/* 플러스 버튼: 파일 업로드 */}
          <button
            type="button"
            className="profile-plus-btn"
            onClick={handleClickPlus}
          >
            <img
              className="profile-plus-img"
              src={`${FRONT_BASE_URL}icons/plus-icon-gray.png`}
              alt="upload"
            />
          </button>

          {/* 실제 파일 input (숨김) */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>
      </div>

      <div className="nickname-container">
        <h3>이름 변경</h3>
        <input
          placeholder="이름"
          className="nickname-input"
          value={nickName}
          onChange={(e) => setNickName(e.target.value)}
        />
      </div>

      <div className="submit-profile-btn-container">
        <button className="button-secondary" type="button">
          <Link to="/mypage">
            취소
          </Link>
        </button>
        <button
          type="button"
          className="button-primary"
          onClick={handleSave}
        >
          저장
        </button>
      </div>

      <button className="goto-delete-account-btn">
        <Link to="/delete-account">
          회원 탈퇴
        </Link>
      </button>
    </div>
  );
}