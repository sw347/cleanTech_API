import { tags } from "typia";

type GoogleOauthType = 'google';
export class OauthUserDto {
  provider: GoogleOauthType;
  identifier: string;
  email?: string;
  name: string;
  profileUrl: string & tags.Format<'url'>;
}