export interface Solution {
  id: string;
  title: string;
  description: string;
  rank: string;
  partyId: string; // Cambiado de enum fijo a string genérico
  // Agregar userId para verificaciones de permisos
  userId: string;
  expanded?: boolean;
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
  stats?: {
    likes: number;
    dislikes: number;
    shares: number;
    comments: number;
  };
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  solutionId: string;
  parentId: string | null;
  replies: Comment[];
  status: string;
  updatedAt: string;
  userAvatar: string | null;
  userId: string;
  userName: string;
}

export interface CreateCommentDto {
  content: string;
  solutionId: string;
  parentId?: string;
  userName?: string;
  userAvatar?: string;
}
