'use client';
import { CardPoint } from '@/app/lib/definitions';
import { fetchLastFiveWeeksCardPerformance } from '@/app/lib/performance';
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

  useEffect(() => {
    setCardDataLoading(true);
    const fetchData = async () => {
      const result = await fetchLastFiveWeeksCardPerformance(cardId);

      setCardData(result);
      setCardDataLoading(false);
    };
    fetchData().catch((error) =>
      console.error('Failed to fetch card data:', error),
    );
  }, [cardId]);

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
      <div className="-mx-4 block w-full rounded-md text-white">
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
