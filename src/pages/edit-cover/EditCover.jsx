import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

import './EditCover.css';

const BACKEND_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// 프론트 배포 base 경로 (예: "/trip-blocks-deploy/")
const FRONT_BASE_URL = import.meta.env.BASE_URL;

export default function EditCover() {
  // 기본 배경: public/images/covers/cover1.jpg
  const [coverImage, setCoverImage] = useState(
    `${FRONT_BASE_URL}images/covers/cover1.jpg`
  );

  const navigate = useNavigate();

  // 기본 이미지 중 어떤 걸 선택했는지(파일 경로 그대로, 예: "/images/covers/cover1.jpg")
  const [selectedCoverImage, setSelectedCoverImage] = useState(null);

  // 업로드한 실제 파일
  const [uploadedFile, setUploadedFile] = useState(null);

  const fileInputRef = useRef(null);

  function resolveImageUrl(path) {
    // 값이 없으면 기본 커버
    if (!path) return `${FRONT_BASE_URL}images/covers/cover1.jpg`;

    // 절대 URL이면 그대로
    if (path.startsWith('http')) return path;

    // 업로드된 이미지인 경우 (백엔드 경로)
    if (path.startsWith('/uploads')) {
      return `${BACKEND_BASE_URL}${path}`;
    }

    // 그 외는 프론트 public 기준 경로 ("/images/..." 등)
    return `${FRONT_BASE_URL}${path.replace(/^\//, '')}`;
  }

  // 커버 이미지 불러오기
  useEffect(() => {
    const fetchCover = async () => {
      try {
        const res = await axiosInstance.get('/api/cover-image');

        if (res.data.coverImage) {
          const imgPath = res.data.coverImage;

          // 화면에 보이는 URL로 변환해서 세팅
          setCoverImage(resolveImageUrl(imgPath));

          // 기본 커버 이미지인 경우
          if (imgPath.startsWith('/images/covers/')) {
            // 서버에는 "/images/covers/cover1.jpg" 이렇게 그대로 보냄
            setSelectedCoverImage(imgPath);
            setUploadedFile(null);
          } else {
            // 업로드된 이미지인 경우
            setSelectedCoverImage(null);
            setUploadedFile(null);
          }
        }
      } catch (err) {
        console.error('커버 정보 로드 실패:', err);
      }
    };
    fetchCover();
  }, []);

  // 기본 커버 이미지 버튼 클릭 시
  const handleSelectDefaultCover = (fileName) => {
    const fullPath = `/images/covers/${fileName}`;

    // 화면에 보이는 건 BASE_URL 붙인 URL
    setCoverImage(resolveImageUrl(fullPath));
    // 서버로 보낼 값은 그대로 "/images/covers/cover1.jpg"
    setSelectedCoverImage(fullPath);
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
    setCoverImage(previewUrl);

    setUploadedFile(file);        // 실제 서버로 보낼 파일
    setSelectedCoverImage(null);  // 기본 이미지 선택 해제
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();

      if (uploadedFile) {
        formData.append('uploadedCoverImage', uploadedFile);
      } else if (selectedCoverImage) {
        // "/images/covers/cover1.jpg" 같은 값 그대로 전송
        formData.append('selectedCoverImage', selectedCoverImage);
      }

      const res = await axiosInstance.put('/api/cover-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.coverImage) {
        setCoverImage(resolveImageUrl(res.data.coverImage));
      }

      navigate('/mypage');
    } catch (err) {
      console.error('커버 저장 실패:', err);
      alert('커버 저장에 실패했습니다.');
    }
  };

  return (
    <div className="edit-cover-wrapper">
      <div className="cover-edit-container">
        <h1 className="cover-edit-title">커버 사진 변경</h1>
        <img className="current-cover-img" src={coverImage} alt="current cover" />
      </div>

      <div className="cover-select-wrapper">
        <h3 className="cover-select-title">커버 선택</h3>
        <div className="cover-select-btn-container">
          <button
            type="button"
            className="cover-select-btn"
            onClick={() => handleSelectDefaultCover('cover1.jpg')}
          >
            <img
              className="cover-select-img"
              src={`${FRONT_BASE_URL}images/covers/cover1.jpg`}
              alt="cover1"
            />
          </button>
          <button
            type="button"
            className="cover-select-btn"
            onClick={() => handleSelectDefaultCover('cover2.jpg')}
          >
            <img
              className="cover-select-img"
              src={`${FRONT_BASE_URL}images/covers/cover2.jpg`}
              alt="cover2"
            />
          </button>
          <button
            type="button"
            className="cover-select-btn"
            onClick={() => handleSelectDefaultCover('cover3.jpg')}
          >
            <img
              className="cover-select-img"
              src={`${FRONT_BASE_URL}images/covers/cover3.jpg`}
              alt="cover3"
            />
          </button>
          <button
            type="button"
            className="cover-select-btn"
            onClick={() => handleSelectDefaultCover('cover4.jpg')}
          >
            <img
              className="cover-select-img"
              src={`${FRONT_BASE_URL}images/covers/cover4.jpg`}
              alt="cover4"
            />
          </button>

          {/* 플러스 버튼: 파일 업로드 */}
          <button
            type="button"
            className="cover-plus-btn"
            onClick={handleClickPlus}
          >
            <img
              className="cover-plus-img"
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

        <p>* 영문 이름의 사진 파일만 업로드가 가능합니다.</p>
      </div>

      <div className="submit-cover-btn-container">
        <button className="button-secondary" type="button"
          onClick={() => {
            navigate('/mypage');
          }}>
          취소
        </button>
        <button
          type="button"
          className="button-primary"
          onClick={handleSave}
        >
          저장
        </button>
      </div>
    </div>
  );
}