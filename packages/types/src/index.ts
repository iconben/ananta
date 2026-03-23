export interface Practice {
  id: string;
  name: string;
  icon: string;
  unit: string;
  color: string;
}

export interface Campaign {
  id: string;
  name: string;
  practiceId: string;
  goal: number;
  progress: number;
  start: string; // date YYYY-MM-DD
  end: string;   // date YYYY-MM-DD
  done: boolean;
  retreatId?: string; // optional FK to retreats (Phase 3)
}

export interface Record {
  id: string;
  practiceId: string;
  campaignId?: string;
  count: number;
  note?: string;
  recordedAt: string; // datetime
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  dataPublic: boolean;
  inRanking: boolean;
  allowFriendReq: boolean;
  fontScale: number;
}

export interface Retreat {
  id: string;
  name: string;
  desc: string;
  items: { practiceId: string; suggestedGoal: number }[];
  start: string;
  end: string;
  openJoin: boolean;
  autoEnd: boolean;
  creatorName: string;
  participants: number;
  totals: Record<string, number>;
}
