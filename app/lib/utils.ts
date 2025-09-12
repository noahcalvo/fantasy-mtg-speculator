import { EPOCH } from '../consts';
import { CardPoint, ScoringOption } from './definitions';

export const formatCurrency = (amount: number) => {
  return (amount / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
};

export const formatDateToLocal = (
  dateStr: string,
  locale: string = 'en-US',
) => {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  const formatter = new Intl.DateTimeFormat(locale, options);
  return formatter.format(date);
};

export const generateYAxis = (cardPoints: CardPoint[]) => {
  // Calculate what labels we need to display on the y-axis
  // based on highest record and in 1000s
  const yAxisLabels = [];
  const highestRecord = Math.max(
    ...cardPoints.map((cardName) => cardName.total_points),
  );
  const topLabel = Math.ceil(highestRecord / 10) * 10;

  for (let i = topLabel; i >= 0; i -= 10) {
    yAxisLabels.push(i);
  }

  return { yAxisLabels, topLabel };
};

export const generatePagination = (currentPage: number, totalPages: number) => {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipsis.
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages.
  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages - 1, totalPages];
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages.
  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages];
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page.
  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ];
};

export function getCurrentWeek() {
  const startDate = new Date(EPOCH);
  const today = new Date();

  const timeDiff = Math.abs(today.getTime() - startDate.getTime());
  const diffWeeks = Math.ceil(timeDiff / (1000 * 60 * 60 * 24 * 7));
  const weekNo = diffWeeks - 1;
  return weekNo;
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const defaultModernScoringOptions: ScoringOption[] = [
  {
    scoring_id: -1,
    format: 'modern',
    tournament_type: 'Challenge Top 8',
    is_per_copy: true,
    points: 0.5,
    league_id: -1,
  },
  {
    scoring_id: -1,
    format: 'modern',
    tournament_type: 'Challenge Champion',
    is_per_copy: false,
    points: 5.0,
    league_id: -1,
  },
  {
    scoring_id: -1,
    format: 'modern',
    tournament_type: 'League 5-0',
    is_per_copy: true,
    points: 0.25,
    league_id: -1,
  },
];

export const defaultStandardScoringOptions: ScoringOption[] = [
  {
    scoring_id: -1,
    format: 'standard',
    tournament_type: 'Challenge Top 8',
    is_per_copy: true,
    points: 0.5,
    league_id: -1,
  },
  {
    scoring_id: -1,
    format: 'standard',
    tournament_type: 'Challenge Champion',
    is_per_copy: false,
    points: 5.0,
    league_id: -1,
  },
  {
    scoring_id: -1,
    format: 'standard',
    tournament_type: 'League 5-0',
    is_per_copy: true,
    points: 0.25,
    league_id: -1,
  },
];

export function getAllWeeks() {
  const weeks = [];
  for (let i = 0; i <= getCurrentWeek(); i++) {
    weeks.push(i);
  }
  return weeks;
}

// constants.ts
export const formatOptions = ['Standard', 'Modern'];
export const tournamentTypeOptions = [
  'Challenge Champion',
  'Challenge Top 8',
  'League 5-0',
];

export function validatePoints(points: number | ''): string | null {
  if (points === '' || isNaN(Number(points))) return 'Points must be a number.';
  if (Number(points) < 0) return 'Points must be positive.';
  const decimalPlaces = points.toString().split('.')[1]?.length || 0;
  if (decimalPlaces > 2) return 'Points can only have two decimal places.';
  return null;
}

export function createPickDeadline(pick_time_in_seconds: number): string {
  const now = new Date();
  const deadlineTime = new Date(now.getTime() + (pick_time_in_seconds * 1000));
  return deadlineTime.toISOString();
}
