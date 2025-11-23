/* eslint-disable */
import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance.js";

const BACKEND_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// 이미지 경로 자동 변환 함수
function resolveCoverUrl(path) {
  // 1️⃣ 값이 없으면 → 기본 커버 이미지 (프론트 public)
  if (!path) return `${import.meta.env.BASE_URL}images/covers/cover1.jpg`;

  // 2️⃣ 외부 URL이면 그대로 사용
  if (path.startsWith("http")) return path;

  // 3️⃣ 백엔드에서 제공한 업로드 이미지라면
  if (path.startsWith("/uploads")) {
    return `${BACKEND_BASE_URL}${path}`;
  }

  // 4️⃣ 프론트 public 폴더에 있는 이미지라면
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}

function CoverImage() {
  const [coverUrl, setCoverUrl] = useState("images/covers/cover1.jpg"); // 기본 배경

  useEffect(() => {
    const fetchCover = async () => {
      try {
        const res = await axiosInstance.get("/api/cover-image");
        const imagePath = res.data?.coverImage;

        if (imagePath) {
          setCoverUrl(resolveCoverUrl(imagePath));
        }
      } catch (err) {
        console.error("커버 이미지를 불러오는 중 오류:", err);
      }
    };

    fetchCover();
  }, []);

  return (
    <div
      className="cover-image-bg"
      style={{
        position: "fixed",
        inset: 0,
        backgroundImage: `url(${coverUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        zIndex: -10,
      }}
      aria-label="cover image"
    />
  );
}

export default CoverImage;