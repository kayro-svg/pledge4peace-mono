// Political party types
export interface PoliticalParty {
  id: string;
  name: string;
  subtitle: string;
  logo: string;
  description: string;
  antiPeace: number;
  proPeace: number;
}

// Peace agreement types
export interface Solution {
  id: string;
  title: string;
  description: string;
  rank: string;
  expanded?: boolean;
  details?: {
    intro: string;
    guidelines: Array<{
      title: string;
      description: string;
    }>;
  };
}

export interface PartySolutions {
  id: string;
  name: string;
  partyNumber: number;
  logo: string;
  solutions: Solution[];
}
