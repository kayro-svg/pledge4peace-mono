export interface Solution {
  id: string;
  title: string;
  description: string;
  rank: string;
  partyId: string;
  details?: {
    intro: string;
    guidelines: {
      title: string;
      description: string;
    }[];
  };
  likes: number;
  comments: number;
  userInteraction?: {
    liked: boolean;
    commented: boolean;
  };
}

export interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
  solutionId: string;
}

export interface CreateCommentDto {
  content: string;
  solutionId: string;
}
