import { FetchResponse } from "@textshq/platform-sdk";

export type AnyJSON = Record<string, any>;

export type TumblrFetchResponse<T = AnyJSON> = FetchResponse<string> & {
  json: T;
  error?: Error;
};

export type TumblrHttpResponseBody<T = AnyJSON> = {
  meta: {
    status: number;
    msg: string;
  };
  response: T;
};

export interface TumblrUserInfo {
  userUuid: string;
  name: string;
  email: string;
  blogs: Blog[];
  isEmailVerified: boolean;
}

interface Blog {
  name: string;
  title: string;
  avatar: Avatar[];
  primary: boolean;
  uuid: string;
  url: string;
  followers: number;
}

interface Avatar {
  width: number;
  height: number;
  url: string;
}
