'use client';
import { CardPoint } from '@/app/lib/definitions';
import { fetchLastNWeeksCardPerformance } from '@/app/lib/performance';
import {
  defaultModernScoringOptions,
  defaultStandardScoringOptions,
} from '@/app/lib/utils';
import { ThemeProvider, createTheme } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

export default function CardPerformanceChart({ cardId }: { cardId: number }) {
  const [cardData, setCardData] = useState<CardPoint[]>([]);
  const [cardDataLoading, setCardDataLoading] = useState(true);
  const [weeks, setWeeks] = useState(10);
  const [format, setFormat] = useState('modern'); // Assuming 'modern' is the default format

  let scoringOption = defaultModernScoringOptions;
  if (format === 'standard') {
    scoringOption = defaultStandardScoringOptions;
  }

  useEffect(() => {
    setCardDataLoading(true);
    const fetchData = async () => {
      const result = await fetchLastNWeeksCardPerformance(
        cardId,
        weeks,
        scoringOption,
      );

      setCardData(result);
      setCardDataLoading(false);
    };
    fetchData().catch((error) =>
      console.error('Failed to fetch card data:', error),
    );
  }, [cardId, weeks, scoringOption]); // Fetch data when cardId, weeks, or format changes

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

  return (
    <ThemeProvider theme={darkTheme}>
      {/* offer selection of 5 weeks, 10 weeks, 20 weeks */}
      <div className="flex justify-center space-x-4">
        <label className="text-gray-50">
          <input
            type="radio"
            name="format"
            value="modern"
            checked={format === 'modern'}
            onChange={() => setFormat('modern')}
            disabled={cardDataLoading}
            className="mr-2"
          />
          Modern
        </label>
        <label className="text-gray-50">
          <input
            type="radio"
            name="format"
            value="standard"
            checked={format === 'standard'}
            onChange={() => setFormat('standard')}
            disabled={cardDataLoading}
            className="mr-2"
          />
          Standard
        </label>
      </div>
      <div className="flex justify-center space-x-4">
        <label className="text-gray-50">
          <input
            type="radio"
            name="weeks"
            value="5"
            checked={weeks === 5}
            onChange={() => setWeeks(5)}
            disabled={cardDataLoading}
            className="mr-2"
          />
          5 weeks
        </label>
        <label className="text-gray-50">
          <input
            type="radio"
            name="weeks"
            value="10"
            checked={weeks === 10}
            onChange={() => setWeeks(10)}
            disabled={cardDataLoading}
            className="mr-2"
          />
          10 weeks
        </label>
        <label className="text-gray-50">
          <input
            type="radio"
            name="weeks"
            value="20"
            checked={weeks === 20}
            onChange={() => setWeeks(20)}
            disabled={cardDataLoading}
            className="mr-2"
          />
          20 weeks
        </label>
      </div>{' '}
      <div className="-mx-4 block w-full rounded-md text-gray-50">
        <div ref={containerRef} className="">
          {hasMounted && cardData?.length > 0 ? (
            <LineChart
              xAxis={[
                { data: cardData.map((point) => point.week), label: 'Week' },
              ]}
              series={[
                {
                  data: cardData.map((point) => point.total_points),
                  label: 'Total Points',
                },
              ]}
              {...getSettings(cardData, containerWidth)}
            />
          ) : (
            <p>No data available for this card</p>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}

function getSettings(cardPoints: CardPoint[], containerWidth: number) {
  const maxLabelLength = Math.max(
    ...cardPoints.map((cardPoint) => cardPoint.total_points.toString().length),
  );
  const marginPerChar = 7; // Adjust this value based on your font size
  return {
    margin: {
      left: maxLabelLength * marginPerChar, // Calculate margin based on max label length
    },
    width: containerWidth,
    height: 400,
  };
}
