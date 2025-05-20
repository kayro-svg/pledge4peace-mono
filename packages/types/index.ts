export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Pledge {
  id: string;
  userId: string;
  campaignId: string;
  createdAt: Date;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  goal: number;
}

export interface Vote {
  id: string;
  userId: string;
  campaignId: string;
  createdAt: Date;
}
