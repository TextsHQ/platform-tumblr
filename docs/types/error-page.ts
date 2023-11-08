export interface ErrorImage {
  postUrl: string;
  imageUrl: string;
  blogName: string;
  avatarUrl: string;
  blogUrl: string;
}

export interface ErrorPageState {
  status: number;
  image: ErrorImage;
}
