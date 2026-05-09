import { CrimeData } from '../types';

const CHICAGO_DATA_ENDPOINT = 'https://data.cityofchicago.org/resource/ijzp-q8t2.json';

export async function fetchRecentCrimes(limit: number = 1000): Promise<CrimeData[]> {
  try {
    const url = `${CHICAGO_DATA_ENDPOINT}?$limit=${limit}&$order=date DESC`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch crime data');
    const data = await response.json();
    return data.map((item: any) => ({
      ...item,
      arrest: item.arrest === 'true' || item.arrest === true,
      domestic: item.domestic === 'true' || item.domestic === true,
    }));
  } catch (error) {
    console.error('Error fetching crimes:', error);
    return [];
  }
}

export function aggregateByPrimaryType(crimes: CrimeData[]): { type: string; count: number }[] {
  const counts: Record<string, number> = {};
  crimes.forEach((crime) => {
    counts[crime.primary_type] = (counts[crime.primary_type] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
}

export function aggregateByDate(crimes: CrimeData[]): { date: string; count: number }[] {
  const counts: Record<string, number> = {};
  crimes.forEach((crime) => {
    const date = new Date(crime.date).toLocaleDateString();
    counts[date] = (counts[date] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
