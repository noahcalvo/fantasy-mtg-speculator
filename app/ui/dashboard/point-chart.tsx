'use client';
import { CardPerformances, CardPoint } from '@/app/lib/definitions';
import { BarChart } from '@mui/x-charts/BarChart';
import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { RevenueChartSkeleton } from '../skeletons';
import {
  capitalize,
  defaultModernScoringOptions,
  defaultStandardScoringOptions,
  getCurrentWeek,
} from '@/app/lib/utils';
import { EPOCH } from '@/app/consts';
import { Paper, ThemeProvider, colors, createTheme } from '@mui/material';
import { routeToCardPageById } from '@/app/lib/routing';
import { fetchTopCards } from '@/app/lib/performance';

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

export default function PointChart() {
  const searchParams = useSearchParams();
  const weekParam = searchParams.get('week');
  const week = weekParam === '0' ? 0 : Number(weekParam) || getCurrentWeek();
  const set = searchParams.get('set') || '';
  const format = searchParams.get('format')?.toLowerCase() || 'modern';
  const [cardData, setCardData] = useState<CardPoint[]>([]);
  const [cardDataLoading, setCardDataLoading] = useState(true);

  let scoringOpt = defaultModernScoringOptions;
  if (format == 'standard') {
    scoringOpt = defaultStandardScoringOptions;
  }

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

    const formattedEndDate = `${epochDate.getMonth() + 1}/${epochDate.getDate()}/${epochDate.getFullYear()}`;

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
