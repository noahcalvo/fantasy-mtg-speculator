'use client';
import { CardPerformances, CardPoint } from '@/app/lib/definitions';
import { BarChart } from '@mui/x-charts/BarChart';
import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { RevenueChartSkeleton } from '../skeletons';
import {
  capitalize,
  defaultModernScoringOptions,
  defaultStandardScoringOptions,
  getCurrentWeek,
} from '@/app/lib/utils';
import { EPOCH } from '@/app/consts';
import {
  Paper,
  ThemeProvider,
  colors,
  createTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  SelectChangeEvent,
} from '@mui/material';
import { routeToCardPageById } from '@/app/lib/routing';
import { fetchTopCards } from '@/app/lib/performance';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useDebouncedCallback } from 'use-debounce';
import { toZonedTime, format } from 'date-fns-tz';
import { fetchRecentSets } from '@/app/lib/sets';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function getSettings(cardPoints: CardPoint[], containerWidth: number) {
  const maxLabelLength = Math.max(
    ...cardPoints.map((item) => item.name.length),
  );
  const marginPerChar = 7; // Adjust this value based on your font size
  return {
    xAxis: [
      {
        label: 'Card Points',
      },
    ],
    margin: {
      left: maxLabelLength * marginPerChar, // Calculate margin based on max label length
    },
    width: containerWidth,
    height: 400,
  };
}

const valueFormatter = (value: number | null) => `${value}pts`;

// SetPicker component for set selection
function SetPicker() {
  const [sets, setSets] = useState<string[]>([]);
  useEffect(() => {
    fetchRecentSets().then((result) => {
      setSets(result);
    });
  }, []);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((set) => {
    const params = new URLSearchParams(searchParams);
    if (set) {
      params.set('set', set);
    } else {
      params.delete('set');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="relative flex-1">
      <label htmlFor="setPicker" className="sr-only">
        Set Picker
      </label>
      <select
        id="setPicker"
        className="peer block w-full rounded-md border border-gray-600 bg-gray-900 py-[9px] pl-10 text-sm text-gray-200 outline-2 placeholder:text-gray-500"
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get('set')?.toString()}
      >
        <option value="">All Sets</option>
        {sets.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-300" />
    </div>
  );
}

// WeekPicker component for week selection
function WeekPicker() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const currentWeek = getCurrentWeek();
  const [availableWeeks, setAvailableWeeks] = useState<number[]>([]);

  useEffect(() => {
    // Generate available weeks (from week 0 to currentWeek)
    const weeks = Array.from({ length: currentWeek + 1 }, (_, i) => i);
    setAvailableWeeks(weeks);
  }, [currentWeek]);

  const handleSearch = (week: string) => {
    const params = new URLSearchParams(searchParams);
    if (week) {
      params.set('week', week);
    } else {
      params.delete('week');
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const weekOptions = getWeekStrings(availableWeeks);
  const overwriteablePlaceholder =
    searchParams.get('week')?.toString() ?? `Week ${currentWeek}`;

  return (
    <div className="relative flex-1">
      <label htmlFor="weekPicker" className="sr-only">
        Week Picker
      </label>
      <select
        id="weekPicker"
        className="peer block w-full rounded-md border border-gray-600 bg-gray-900 py-[9px] pl-10 text-sm text-gray-200 outline-2 placeholder:text-gray-500"
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get('week')?.toString() || ''}
      >
        <option value="">{`Week ${currentWeek}`}</option>
        {weekOptions.map((option, index) => (
          <option key={index} value={option.week}>
            {option.label}
          </option>
        ))}
      </select>
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-300" />
    </div>
  );
}

function getWeekStrings(weeks: number[]) {
  const sortedWeeks = weeks.sort((a, b) => b - a);
  return sortedWeeks.map((week) => {
    const date = new Date(EPOCH);
    date.setUTCDate(date.getUTCDate() + week * 7);
    const cstDate = toZonedTime(date, 'America/Chicago');
    const dateString = format(cstDate, 'MM/dd/yyyy', {
      timeZone: 'America/Chicago',
    });
    return { label: `week ${week} - ${dateString}`, week };
  });
}

export default function PointChart() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const weekParam = searchParams.get('week');
  const week = weekParam === '0' ? 0 : Number(weekParam) || getCurrentWeek();
  const set = searchParams.get('set') || '';
  const format = searchParams.get('format')?.toLowerCase() || 'modern';

  const [cardData, setCardData] = useState<CardPoint[]>([]);
  const [cardDataLoading, setCardDataLoading] = useState(true);

  // Use query parameters or defaults for scoring options
  let scoringOpt =
    format === 'standard'
      ? defaultStandardScoringOptions
      : defaultModernScoringOptions;

  // Create URL update handler
  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    return params.toString();
  };

  // Event handlers for form controls
  const handleFormatChange = (event: SelectChangeEvent) => {
    router.push(
      `${pathname}?${createQueryString('format', event.target.value)}`,
    );
  };

  const handleSetChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    router.push(`${pathname}?${createQueryString('set', event.target.value)}`);
  };

  const handleWeekChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const weekValue = event.target.value;
    if (weekValue && !isNaN(Number(weekValue))) {
      router.push(`${pathname}?${createQueryString('week', weekValue)}`);
    }
  };

  useEffect(() => {
    setCardDataLoading(true);
    const fetchData = async () => {
      let result;
      if (typeof week === 'undefined' && set === '') {
        result = await fetchTopCards(scoringOpt, -1, '');
      } else if (typeof week === 'undefined') {
        result = await fetchTopCards(scoringOpt, -1, set);
      } else if (set === '') {
        result = await fetchTopCards(scoringOpt, week, '');
      } else {
        result = await fetchTopCards(scoringOpt, week, set);
      }

      // change each cardName to be only 18 characters
      const topCards = result?.cards;
      topCards?.forEach((card: CardPoint) => {
        if (card.name.length > 18) {
          card.name = card.name.substring(0, 18) + '...';
        }
      });

      setCardData(topCards ?? []);
      setCardDataLoading(false);
    };
    fetchData().catch((error) =>
      console.error('Failed to fetch card data:', error),
    );
  }, [week, set, format, scoringOpt]); // The effect depends on week, set, and format

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [hasMounted, setHasMounted] = useState(false); // New state variable

  useLayoutEffect(() => {
    setHasMounted(true); // Set hasMounted to true when the component mounts
  }, []);

  // for graph size responsiveness
  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.getBoundingClientRect().width);
      }
    }

    handleResize(); // Call the function once to set the initial width

    window.addEventListener('resize', handleResize);

    // Clean up function
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [cardDataLoading]);

  let chartLabel = '';

  if (week === null) {
    chartLabel = 'Points for all time';
  } else {
    // calculate the start and end date of the week we are showing data for
    // add number of weeks to the "Epoch", or when we started collecting data
    const epochDate = new Date(EPOCH);
    epochDate.setDate(epochDate.getDate() + week * 7);

    const formattedStartDate = `${epochDate.getMonth() + 1}/${epochDate.getDate()}/${epochDate.getFullYear()}`;

    // add 6 days to get the end date, or default to today if end date is in the
    epochDate.setDate(epochDate.getDate() + 6);
    const today = new Date();
    if (epochDate > today) {
      epochDate.setDate(today.getDate()); // reset to today's date
    }

    const formattedEndDate = `${epochDate.getMonth() + 1}/${epochDate.getFullYear()}`;

    chartLabel = `Points for ${formattedStartDate} - ${formattedEndDate}`;
  }

  const CustomAxisTooltipContent = (props: { series: any; axisData: any }) => {
    const { series, axisData } = props;
    return (
      <Paper
        sx={{
          padding: 1,
          marginLeft: 3,
          color: series.color,
          borderColor: series.color,
          border: 1,
          textAlign: 'center',
        }}
      >
        <p>{axisData?.y?.value}</p>
        <p>{series[0]?.data[axisData?.y?.index]}pts</p>
      </Paper>
    );
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="block rounded-md text-gray-50">
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <FormControl variant="outlined" size="small" sx={{ flex: 1 }}>
            <InputLabel id="format-select-label">Format</InputLabel>
            <Select
              labelId="format-select-label"
              id="format-select"
              value={format}
              onChange={handleFormatChange}
              label="Format"
            >
              <MenuItem value="modern">Modern</MenuItem>
              <MenuItem value="standard">Standard</MenuItem>
            </Select>
          </FormControl>

          {/* Replace TextField with new SetPicker */}
          <SetPicker />

          {/* Replace TextField with new WeekPicker */}
          <WeekPicker />
        </Box>

        {(cardDataLoading && <RevenueChartSkeleton />) || (
          <div className="text-xl">
            <h1 className="mb-2 text-center text-xl">
              Top Performing Cards{set ? ` from ${set}` : ''} for week {week} in{' '}
              {capitalize(format)}
            </h1>

            <div ref={containerRef} className="">
              {hasMounted && cardData?.length > 0 ? (
                <BarChart
                  dataset={cardData}
                  yAxis={[{ scaleType: 'band', dataKey: 'name' }]}
                  series={[
                    {
                      dataKey: 'total_points',
                      label: chartLabel,
                      valueFormatter,
                      color: colors.grey[100],
                    },
                  ]}
                  layout="horizontal"
                  tooltip={{
                    trigger: 'axis',
                    axisContent: CustomAxisTooltipContent,
                  }}
                  onItemClick={(event, data) => {
                    routeToCardPageById(cardData[data.dataIndex].card_id);
                  }}
                  {...getSettings(cardData, containerWidth)}
                />
              ) : (
                <p>No data available for week {week}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}
