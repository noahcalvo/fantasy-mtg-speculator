'use client'
import { CardPoint } from '@/app/lib/definitions';
import { BarChart } from '@mui/x-charts/BarChart';
import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { EPOCH } from '@/app/page';

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

export default function PointChart({ cardPoints, week }: { cardPoints: CardPoint[], week: number|null }) {
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
  }, []);
  
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
    <div className='rounded-md block min-w-[450px]'>
    <h1 className="mb-8 text-xl md:text-2xl">
      All Top Performing Cards
    </h1>

    <div ref={containerRef} className=''>
        {hasMounted && cardPoints.length > 0 ? <BarChart
          dataset={cardPoints}
          yAxis={[{ scaleType: 'band', dataKey: 'name' }]}
          series={[{ dataKey: 'total_points', label: chartLabel, valueFormatter }]}
          layout="horizontal"
          {...getSettings(cardPoints, containerWidth)}
        /> : <p>No data available</p>}
      </div>
    </div>
  );
}