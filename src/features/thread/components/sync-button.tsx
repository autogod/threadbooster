"use client";

import { Button } from "@/components/ui/button";

export function SyncButton() {
  const THREAD_CLIENT_ID = process.env.NEXT_PUBLIC_THREAD_CLIENT_ID;
  const THREAD_REDIRECTION_URL = `${process.env.NEXT_PUBLIC_SITE_URL}/thread/callback`;
  const oauthURL = `https://threads.net/oauth/authorize?client_id=${THREAD_CLIENT_ID}&redirect_uri=${THREAD_REDIRECTION_URL}&scope=threads_basic&response_type=code`;

  // console.log("SyncButton -> oauthURL", oauthURL);
  const handleThread = () => {
    window.location.href = oauthURL;
  };

  return <Button onClick={handleThread}>스레드 연동</Button>;
}
