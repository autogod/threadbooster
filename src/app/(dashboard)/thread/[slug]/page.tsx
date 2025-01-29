<<<<<<< HEAD
// /thread/:slug

// - 스레드 계정 리스트업
=======
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

>>>>>>> 0.1.0-jg
export default function Page() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const response = await fetch(
          "https://graph.threads.net/v1.0/me/threads?fields=id,permalink,owner,username,text,timestamp,shortcode,thumbnail_url,children,is_quote_post&access_token=THAAQFWBJ1Y0BBYlhtR0VQTzJRb3BYWXpKcVFJbWtKcGdleWtOVk9kS3RLZAGowdmZANcG5FTEhGeUItTXR0YlV0ZAUFFaGltWTJQdlpGdW9HTWtQNm9TVndjS2VCTzJ4Q0N5eWc3R2VaR1g0Nkp1YnQ4VHVTdkdTeWpadWhtRnV1bnlEajVvS0kyS2o4bFp3UlkZD"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch threads");
        }
        const data = await response.json();
        setThreads(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchThreads();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <main className="min-h-screen w-full flex flex-col items-center p-4">
      <h1 className="text-xl font-bold mb-4">스레드 계정 리스트업</h1>
      <div className="w-full  overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60%]">Text</TableHead>
              <TableHead className="w-[10%]">Timestamp</TableHead>
              <TableHead className="w-[10%]">Thumbnail</TableHead>
              <TableHead className="w-[10%]">Link</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {threads.map((thread) => (
              <TableRow key={thread.id}>
                <TableCell className="w-[60%]">{thread.text}</TableCell>
                <TableCell className="w-[10%]">
                  {new Date(thread.timestamp).toISOString().split("T")[0]}
                </TableCell>
                <TableCell className="w-[10%]">
                  {thread.thumbnail_url && (
                    <img
                      src={thread.thumbnail_url}
                      alt="Thumbnail"
                      className="w-16 h-16"
                    />
                  )}
                </TableCell>
                <TableCell className="w-[10%]">
                  <a
                    href={thread.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500"
                  >
                    View
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
