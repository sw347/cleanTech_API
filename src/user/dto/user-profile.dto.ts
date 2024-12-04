import { tags } from "typia";

export class UserProfileDto {
  id: number;
  name: string;
  profileUrl: string & tags.Format<'url'>;
  createdAt: number;
}