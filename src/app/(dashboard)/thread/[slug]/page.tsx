"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "../../../../components/ui/table";
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
      <h1 className="text-xl font-bold mb-4">스레드 게시글 리스트</h1>
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Content</TableHead>
              <TableHead className="w-[15%]">Created At</TableHead>
              <TableHead className="w-[10%]">Status</TableHead>
              <TableHead className="w-[10%]">Likes</TableHead>
              <TableHead className="w-[15%]">Memo</TableHead>
              <TableHead className="w-[10%]">Parent Post ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No posts found.
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="w-[40%]">
                    {post.content || "No content"}
                  </TableCell>
                  <TableCell className="w-[15%]">
                    {new Date(post.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="w-[10%]">{post.status}</TableCell>
                  <TableCell className="w-[10%]">{post.likes || 0}</TableCell>
                  <TableCell className="w-[15%]">
                    {post.memo || "N/A"}
                  </TableCell>
                  <TableCell className="w-[10%]">
                    {post.parent_post_id ? post.parent_post_id : "None"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
