/* eslint-disable */
import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance.js";

const BACKEND_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function resolveCoverUrl(path) {
  if (!path) return "/images/covers/cover1.jpg";

  // 이미 절대 URL이면 그대로 사용
  if (path.startsWith("http")) return path;

  // 업로드된 커버 이미지인 경우 → 백엔드 도메인 붙이기
  if (path.startsWith("/uploads")) {
    return `${BACKEND_BASE_URL}${path}`;
  }

  // 기본 커버(/images/covers/cover1.jpg 같은 것)는 프론트 public이라 그대로
  return path;
}

function CoverImage() {
  const [coverUrl, setCoverUrl] = useState("/images/covers/cover1.jpg"); // 기본 배경

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