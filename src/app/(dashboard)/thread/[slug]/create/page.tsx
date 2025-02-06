"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "../../../../../components/ui/table";
import { fetchThreadPosts } from "@/features/thread/actions/fetch-thread-posts";

export default function Page({ params }) {
  console.log("Params:", params);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]); // `posts`로 변수명 변경

  const { slug } = params;
  console.log("Slug:", slug);

  useEffect(() => {
    if (!slug) {
      setError("Invalid thread user ID");
      setLoading(false);
      return;
    }

    fetchThreadPosts({ thread_user_id: slug })
      .then((data) => {
        console.log("Fetched data:", data);
        setPosts(data || []);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <main className="min-h-screen w-full flex flex-col items-center p-4">
      <h1 className="text-xl font-bold mb-4">스레드 게시글 작성페이지</h1>
      <div className="w-full overflow-x-auto"></div>
    </main>
  );
}
