export interface TopicTag {
  tag: string;
  followers: number;
}

export interface BaseTopic {
  name: string;
  tag: string;
  subTopics?: BaseTopic[];
}

export interface ParentTopic extends BaseTopic {
  followers: number;
  images: string[];
  isTag: boolean;
  recentPosts: number;
  subTopics: BaseTopic[];
}

export type TopicOrTag = BaseTopic | TopicTag;
