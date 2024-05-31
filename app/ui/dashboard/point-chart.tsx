'use client'
import { CardPoint } from '@/app/lib/definitions';
import { BarChart } from '@mui/x-charts/BarChart';
import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchTopCards, fetchTopCardsFromSet, fetchTopWeeklyCards, fetchTopWeeklyCardsFromSet } from '@/app/lib/data';
import { RevenueChartSkeleton } from '../skeletons';
import { getCurrentWeek } from '@/app/lib/utils';
import { EPOCH } from '@/app/consts';
import { ThemeProvider, colors, createTheme } from '@mui/material';
import { ClassNames } from '@emotion/react';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function getSettings(cardPoints: CardPoint[], containerWidth: number) {
  const maxLabelLength = Math.max(...cardPoints.map(item => item.name.length));
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
  const searchParams = useSearchParams()
  const weekParam = searchParams.get('week');
  const week = weekParam === "0" ? 0 : Number(weekParam) || getCurrentWeek();
  const set = searchParams.get('set') || "";
  const [cardData, setCardData] = useState<CardPoint[]>([]);
  const [cardDataLoading, setCardDataLoading] = useState(true);

  useEffect(() => {
    setCardDataLoading(true);
    const fetchData = async () => {
      let result;
      if (typeof week === 'undefined' && set === '') {
        result = await fetchTopCards();
      } else if (typeof week === 'undefined') {
        result = await fetchTopCardsFromSet(set);
      } else if (set === '') {
        result = await fetchTopWeeklyCards(week);
      } else {
        result = await fetchTopWeeklyCardsFromSet(week, set);
      }
      setCardData(result);
      setCardDataLoading(false);
    };
    fetchData().catch((error) =>
      console.error('Failed to fetch card data:', error),
    );
  }, [week, set]); // The effect depends on week and set passed in via props

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

  if(week === null) {
    chartLabel = 'Points for all time';
  }
  else {
    // calculate the start and end date of the week we are showing data for
    // add number of weeks to the "Epoch", or when we started collecting data
    const epochDate = new Date(EPOCH);
    epochDate.setDate(epochDate.getDate() + week * 7);
    
    const formattedStartDate = `${epochDate.getMonth() + 1}/${epochDate.getDate()}/${epochDate.getFullYear()}`;
    
    // add 6 days to get the end date, or default to today if end date is in the
    epochDate.setDate(epochDate.getDate() + 6);
    const today = new Date();
    if(epochDate > today) {
      epochDate.setDate(today.getDate()); // reset to today's date
    }
  
    const formattedEndDate = `${epochDate.getMonth() + 1}/${epochDate.getDate()}/${epochDate.getFullYear()}`;
    
    chartLabel = `Points for ${formattedStartDate} - ${formattedEndDate}`
  }
  
  return (
    <ThemeProvider theme={darkTheme}>

    <div className='rounded-md block text-white'>
      {cardDataLoading && <RevenueChartSkeleton/> ||
      <div className="text-xl">
          <h1 className="mb-2 text-xl text-center">
          Top Performing Cards{set ? ` from ${set}` : ''} for week {week}
        </h1>
    
        <div ref={containerRef} className=''>
            {hasMounted && cardData.length > 0 ? <BarChart
              dataset={cardData}
              yAxis={[{ scaleType: 'band', dataKey: 'name' }]}
              series={[{ dataKey: 'total_points', label: chartLabel, valueFormatter, color: colors.grey[100] }]}
              layout="horizontal"
              {...getSettings(cardData, containerWidth)}
            /> : <p>No data available for week {week}</p>}
          </div>
    </div>}
    </div>
    </ThemeProvider>
  );
}