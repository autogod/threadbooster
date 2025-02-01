import { TablesInsert, TablesUpdate } from "@/types/database.types";

export type ThreadInsert = TablesInsert<"threads">;
export type ThreadUpdate = TablesUpdate<"threads">;
export type ThreadPostInsert = TablesInsert<"thread_posts">;

export type ThreadPostData = {
  id: string;
  media_product_type: string;
  media_type:
    | "TEXT_POST"
    | "IMAGE"
    | "VIDEO"
    | "CAROUSEL_ALBUM"
    | "AUDIO"
    | "REPOST_FACADE";
  media_url?: string;
  permalink: string;
  owner: { id: string };
  username: string;
  text?: string;
  timestamp: string;
  shortcode: string;
  thumbnail_url?: string;
  children?: any; // 필요에 따라 구체적인 타입으로 변경
  is_quote_post: boolean;
  quoted_post?: string;
  reposted_post?: string;
  alt_text?: string;
  link_attachment_url?: string;
};
