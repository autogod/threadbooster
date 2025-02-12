"use server";

/**
 * 액세스 토큰을 이용해서 Threads 사용자의 포스트를 생성하는 함수
 * @param accessToken - Threads access token
 * @param text - 게시글 내용
 * @returns boolean - 성공 여부 반환
 * @throws Error
 */
export async function createThreadPost(
  accessToken: string | null,
  text: string // ✅ 동적으로 입력받은 텍스트 추가
): Promise<boolean> {
  // Threads API를 호출해 포스트 데이터 생성
  console.log(`https://graph.threads.net/v1.0/8844056592383419/threads?media_type=text&text=${text}&access_token=${accessToken}`)
  let response = await fetch(
    `https://graph.threads.net/v1.0/8844056592383419/threads?media_type=text&text=${text}&access_token=${accessToken}`,
    { method: "POST" }
  );
  const data = await response.json();

  console.log("Thread API Response:", data);

  if (!data.id) {
    console.error("Error: Container ID is missing.");
    throw new Error("Failed to create thread: Container ID is missing.");
  }

  const  container_id  = data.id;
  console.log("Container ID:", container_id);

  // Threads 게시 요청
  response = await fetch(
    `https://graph.threads.net/v1.0/8844056592383419/threads_publish?creation_id=${container_id}&access_token=${accessToken}`,
    { method: "POST" }
  );

  if (!response.ok) {
    console.error("Failed to publish thread. Status:", response.status);
    throw new Error(`Failed to publish thread: ${response.statusText}`);
  }

  return true; // 성공 시 true 반환
}
