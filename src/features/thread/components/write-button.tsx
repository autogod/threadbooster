"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { FaPlus } from "react-icons/fa"; // 아이콘 라이브러리 사용

const WriteButton: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname(); // 현재 경로 가져오기

  const handleWriteClick = () => {
    // 현재 경로를 기준으로 상대 경로로 이동
    router.push(`${pathname}/create`);
  };

  return (
    <button
      className="absolute top-4 right-4 py-3 bg-blue-600 text-white text-lg font-semibold rounded-md hover:bg-blue-700 flex items-center space-x-2 transition"
      onClick={handleWriteClick}
    >
      <FaPlus className="text-xl" /> {/* 아이콘을 추가 */}
      <span>작성하기</span>
    </button>
  );
};

export default WriteButton;
