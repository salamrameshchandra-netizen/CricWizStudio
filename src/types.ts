export interface MatchLog {
  id: string;
  opponent: string;
  date: string;
  runs?: number; // batsman runs or bowler conceded runs
  balls?: number; // batsman balls faced
  fours?: number; // batsman
  sixes?: number; // batsman
  dismissed?: boolean | string; // batsman dismissed (true/false or 'yes'/'no')
  overs?: number; // bowler overs bowled
  runsConceded?: number; // bowler runs conceded
  wickets?: number; // bowler wickets taken
  maidens?: number; // bowler maidens bowled
  dots?: number; // bowler dot balls delivered
}

export interface ShotLocation {
  id: string;
  angle: number; // 0-360 degrees from bowler's perspective (0 straight, 90 off-side point, 180 wicketkeeper, 270 leg-side square leg)
  distance: number; // radial distance ratio (e.g., 0 to 1) out to the boundary
  runs: number; // 0, 1, 2, 3, 4, 6
  shotType: 'Drive' | 'Pull' | 'Cut' | 'Flick' | 'Sweep' | 'Defensive' | 'Slog' | 'Other';
}

export interface DeliveryLocation {
  id: string;
  x: number; // 0-100% (horizontal coordinate on the crease: 30-70 represents stumps)
  y: number; // 0-100% (vertical coordinate landing length: 0 stumps/yorker, 25 full, 60 good, 85 short)
  lengthType: 'Yorker' | 'Full Pitch' | 'Good Length' | 'Short Pitch';
  lineType: 'Outside Off' | 'On the Stumps' | 'Down Leg';
  runsConceded: number;
  isWicket: boolean;
}

export interface Player {
  id: string;
  name: string;
  team: string;
  role: 'batsman' | 'bowler' | 'allrounder';
  style: string; // e.g., "Right-hand Bat", "Right-arm Fast", "Left-arm Orthodox Spin"
  type: 'batsman' | 'bowler'; // dominant discipline to visual heatmaps
  matches: MatchLog[];
  shots: ShotLocation[]; // Wagon Wheel data
  deliveries: DeliveryLocation[]; // Bowler pitch maps
}

export interface ScoutingInsight {
  strengths: string[];
  weaknesses: string[];
  coachAdvice: string;
  radarAnalysis: string;
  summary: string;
}
