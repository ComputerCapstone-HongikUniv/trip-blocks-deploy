import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';

import './EditCover.css';

export default function EditCover() {
  const [coverImage, setCoverImage] = useState('/images/covers/cover1.jpg');
  const BACKEND_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  const navigate = useNavigate();

  // 기본 이미지 중 어떤 걸 선택했는지(파일명만, 예: "cover1.jpg")
  const [selectedCoverImage, setSelectedCoverImage] = useState(null);

  // 업로드한 실제 파일
  const [uploadedFile, setUploadedFile] = useState(null);

  const fileInputRef = useRef(null);

  function resolveImageUrl(path) {
    if (!path) return '/images/covers/cover1.jpg';
    if (path.startsWith('http')) return path;
    return path;   // 기본 커버(/images/covers/...)는 그대로 사용
  }

  // 커버 이미지 불러오기
  useEffect(() => {
    const fetchCover = async () => {
      try {
        const res = await axiosInstance.get('/api/cover-image');

        if (res.data.coverImage) {
          const imgPath = res.data.coverImage;
          setCoverImage(resolveImageUrl(imgPath));

          // 기본 커버인지, 업로드된 건지 구분 (선택사항)
          if (imgPath.startsWith('/images/covers/')) {
            // 🔽 여기를 파일명 대신 전체 경로로 저장
            // const fileName = imgPath.split('/').pop(); // "cover1.jpg"
            // setSelectedCoverImage(fileName);
            setSelectedCoverImage(imgPath);
            setUploadedFile(null);
          } else {
            // 업로드된 이미지라면
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

    setCoverImage(fullPath);           // 화면에 보여줄 이미지
    setSelectedCoverImage(fullPath);   // 서버에 보낼 값 (전체 경로)
    setUploadedFile(null);             // 업로드 파일 사용 안 함
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
        // 🔹 이제는 "cover1.jpg"가 아니라 "/images/covers/cover1.jpg"를 보냄
        formData.append('selectedCoverImage', selectedCoverImage);
      }
      // 둘 다 없으면 비어있는 FormData 전송

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
            <img className="cover-select-img" src="/images/covers/cover1.jpg" alt="cover1" />
          </button>
          <button
            type="button"
            className="cover-select-btn"
            onClick={() => handleSelectDefaultCover('cover2.jpg')}
          >
            <img className="cover-select-img" src="/images/covers/cover2.jpg" alt="cover2" />
          </button>
          <button
            type="button"
            className="cover-select-btn"
            onClick={() => handleSelectDefaultCover('cover3.jpg')}
          >
            <img className="cover-select-img" src="/images/covers/cover3.jpg" alt="cover3" />
          </button>
          <button
            type="button"
            className="cover-select-btn"
            onClick={() => handleSelectDefaultCover('cover4.jpg')}
          >
            <img className="cover-select-img" src="/images/covers/cover4.jpg" alt="cover4" />
          </button>

          {/* 플러스 버튼: 파일 업로드 */}
          <button
            type="button"
            className="cover-plus-btn"
            onClick={handleClickPlus}
          >
            <img
              className="cover-plus-img"
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

      <div className="submit-cover-btn-container">
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
    </div>
  );
}