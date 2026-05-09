export interface CrimeData {
  id: string;
  case_number: string;
  date: string;
  block: string;
  iucr: string;
  primary_type: string;
  description: string;
  location_description: string;
  arrest: boolean;
  domestic: boolean;
  beat: string;
  district: string;
  ward: string;
  community_area: string;
  fbi_code: string;
  latitude: string;
  longitude: string;
  year: string;
  updated_on: string;
}

export interface StatsData {
  type: string;
  count: number;
}

export interface DayStats {
  date: string;
  count: number;
}
