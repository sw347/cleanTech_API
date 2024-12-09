import { tags } from "typia";

export class UserProfileImageDto {
  name: string;
  profileUrl: string & tags.Format<'url'>;
}