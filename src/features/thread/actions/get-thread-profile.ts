"use server";

/**
 * Threads Profile 응답 타입
 */
export type ThreadsProfile = {
  id: string;
  username: string;
  name: string;
  threads_profile_picture_url?: string;
  threads_biography?: string;
  // 필요한 다른 필드가 있다면 추가하세요
};

/**
 * 액세스 토큰을 이용해서 Threads 사용자 프로필을 가져오는 함수
 * @param accessToken - Threads access token
 * @returns ThreadsProfile - 사용자 프로필 정보
 * @throws Error
 */
export async function getThreadProfile(
  accessToken: string,
): Promise<ThreadsProfile> {
  // 요청할 필드 목록
  const fields = [
    "id",
    "username",
    "name",
    "threads_profile_picture_url",
    "threads_biography",
  ].join(",");

  // Threads API를 호출해 사용자 프로필 정보 가져오기
  const response = await fetch(
    `https://graph.threads.net/v1.0/me?fields=${fields}&access_token=${accessToken}`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    console.error(
      "Failed to fetch Threads user profile. Status:",
      response.status,
    );
    throw new Error("Failed to fetch Threads user profile");
  }

  const data = await response.json();
  return data as ThreadsProfile;
}
