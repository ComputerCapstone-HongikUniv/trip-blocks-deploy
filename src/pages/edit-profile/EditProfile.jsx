import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

import './EditProfile.css';

export default function EditProfile() {
  const [nickName, setNickName] = useState('');
  const [profileImage, setProfileImage] = useState('/images/profiles/profile1.png');
  const BACKEND_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  const navigate = useNavigate();

  // 기본 이미지 중 어떤 걸 선택했는지(파일명만)
  const [selectedProfileImage, setSelectedProfileImage] = useState(null); // e.g. "profile1.png"

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
          const imgPath = res.data.userProfileImage;   // 서버에 저장된 경로 그대로
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

    setProfileImage(fullPath);             // 화면에 보여줄 이미지
    setSelectedProfileImage(fullPath);    // 서버에 보낼 값 (전체 경로)
    setUploadedFile(null);                // 업로드 파일 사용 안 함
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

  function resolveImageUrl(path) {
    if (!path) return '/images/profiles/profile1.png';

    if (path.endsWith('.png.png')) {
      path = path.replace(/\.png\.png$/, '.png');
    }
    // 백엔드가 업로드 이미지는 절대 URL로 보내줌
    if (path.startsWith('http')) return path;


    // 나머지는 public 정적 리소스 경로 (/images/profiles/...)
    return path;
  }

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append('nickName', nickName);

      if (uploadedFile) {
        // 🔹 명세: uploadedProfileImage
        formData.append('uploadedProfileImage', uploadedFile);
      } else if (selectedProfileImage) {
        // 🔹 명세: selectedProfileImage (이제는 "파일명"이 아니라 "전체 경로")
        formData.append('selectedProfileImage', selectedProfileImage);
      }
      // 둘 다 없으면 nickName만 전송

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
            <img className="profile-select-img" src="/images/profiles/profile1.png" alt="profile1" />
          </button>
          <button
            type="button"
            className="profile-select-btn"
            onClick={() => handleSelectDefaultProfile('profile2.png')}
          >
            <img className="profile-select-img" src="/images/profiles/profile2.png" alt="profile2" />
          </button>
          <button
            type="button"
            className="profile-select-btn"
            onClick={() => handleSelectDefaultProfile('profile3.png')}
          >
            <img className="profile-select-img" src="/images/profiles/profile3.png" alt="profile3" />
          </button>
          <button
            type="button"
            className="profile-select-btn"
            onClick={() => handleSelectDefaultProfile('profile4.png')}
          >
            <img className="profile-select-img" src="/images/profiles/profile4.png" alt="profile4" />
          </button>

          {/* 플러스 버튼: 파일 업로드 */}
          <button
            type="button"
            className="profile-plus-btn"
            onClick={handleClickPlus}
          >
            <img
              className="profile-plus-img"
              src="/icons/plus-icon-gray.png"
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

      <button className='goto-delete-account-btn'>
        <Link to="/delete-account">
          회원 탈퇴
        </Link>
      </button>

    </div>
  );
}