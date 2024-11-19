import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import './TotalPoints.css';
import Classics from '../../Components/Classics/Classics';

const TotalPoints = () => {
  const [totalPoints, setTotalPoints] = useState({ league1: 0, league2: 0 });
  const [weeklyPoints, setWeeklyPoints] = useState([]);
  const [chartData, setChartData] = useState({});
  const [currentWeek, setCurrentWeek] = useState(1);
  const [isMounted, setIsMounted] = useState(false);

  const calculateCurrentWeek = () => {
    const seasonStartDate = new Date('2024-09-03'); // Adjust this to your season start date
    const today = new Date();
    const timeDiff = today - seasonStartDate;
    const daysSinceStart = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const weeksSinceStart = Math.floor(daysSinceStart / 7);
    return Math.min(Math.max(weeksSinceStart + 1, 1), 18); // Ensure it's between 1 and 18
  };

  useEffect(() => {
    const calculateCurrentWeek = () => {
      const seasonStartDate = new Date('2024-09-03'); // Adjust this to your season start date
      const today = new Date();
      const timeDiff = today - seasonStartDate;
      const daysSinceStart = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const weeksSinceStart = Math.floor(daysSinceStart / 7);
      return Math.min(Math.max(weeksSinceStart + 1, 1), 18); // Ensure it's between 1 and 18
    };

    const newWeek = calculateCurrentWeek();
    console.log("Calculated current week:", newWeek);
    setCurrentWeek(newWeek);
    setIsMounted(true);
  }, []); // This effect runs once on mount

  useEffect(() => {
    if (isMounted) {
      console.log("Component mounted, fetching total points");
      fetchTotalPoints();
    }
  }, [isMounted, currentWeek]); // This effect runs when the component is mounted and when currentWeek changes

  const fetchLeagueData = async (leagueId, currentWeek) => {
    const response = await axios.get(`https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/${leagueId}?view=mMatchup&view=mScoreboard&scoringPeriodId=${currentWeek}`);
    return response.data;
  };

  const fetchTotalPoints = useCallback(async () => {
    try {
      console.log("Fetching data for week:", currentWeek);
      const league1Data = await fetchLeagueData(1446375, currentWeek);
      const league2Data = await fetchLeagueData(1869404038, currentWeek);

      console.log("League 1 Data:", league1Data);
      console.log("League 2 Data:", league2Data);

      const weeklyData = calculateWeeklyPoints(league1Data, league2Data, currentWeek);
      console.log("Calculated Weekly Data:", weeklyData);
      setWeeklyPoints(weeklyData);

      // Calculate total points
      const league1Total = weeklyData.reduce((sum, week) => sum + parseFloat(week.league1), 0);
      const league2Total = weeklyData.reduce((sum, week) => sum + parseFloat(week.league2), 0);

      setTotalPoints({ 
        league1: league1Total.toFixed(2), 
        league2: league2Total.toFixed(2) 
      });

      // Update chart data
      const chartData = {
        labels: weeklyData.map(wp => `Week ${wp.week}`),
        datasets: [
          {
            label: 'League A',
            data: weeklyData.map(wp => parseFloat(wp.league1)),
            fill: false,
            borderColor: '#42A5F5',
            tension: 0.4
          },
          {
            label: 'League B',
            data: weeklyData.map(wp => parseFloat(wp.league2)),
            fill: false,
            borderColor: '#FFA726',
            tension: 0.4
          }
        ]
      };
      setChartData(chartData);
    } catch (error) {
      console.error("Error fetching total points:", error);
    }
  }, [currentWeek]);

  const calculateTotalPoints = (leagueData, currentWeek) => {
    let total = 0;
    leagueData.schedule.forEach(matchup => {
      if (matchup.matchupPeriodId < currentWeek) {
        // For completed weeks
        total += matchup.home.totalPoints;
        if (matchup.away) {
          total += matchup.away.totalPoints;
        }
      } else if (matchup.matchupPeriodId === currentWeek) {
        // For the current week
        total += matchup.home.pointsByScoringPeriod[currentWeek] || 0;
        if (matchup.away) {
          total += matchup.away.pointsByScoringPeriod[currentWeek] || 0;
        }
      }
    });
    return total.toFixed(2);
  };

  const calculateWeeklyPoints = (league1Data, league2Data, currentWeek) => {
    const weeklyData = [];
  
    for (let week = 1; week <= currentWeek; week++) {
      const league1Points = calculateWeekPoints(league1Data.schedule, week);
      const league2Points = calculateWeekPoints(league2Data.schedule, week);
      
      weeklyData.push({
        week: week,
        league1: league1Points.toFixed(2),
        league2: league2Points.toFixed(2),
        isCurrent: week === currentWeek
      });
    }
    console.log("Weekly Data:", weeklyData);
    return weeklyData;
  };

  const calculateWeekPoints = (schedule, week) => {
    let total = 0;
    schedule.forEach(matchup => {
      if (matchup.matchupPeriodId === week) {
        if (matchup.away && matchup.away.pointsByScoringPeriod) {
          total += matchup.away.pointsByScoringPeriod[week] || 0;
        }
        if (matchup.home && matchup.home.pointsByScoringPeriod) {
          total += matchup.home.pointsByScoringPeriod[week] || 0;
        }
      }
    });
    return total;
  };

  useEffect(() => {
    if (weeklyPoints.length > 0) {
      const labels = weeklyPoints.map(wp => `Week ${wp.week}`);
      const league1Data = weeklyPoints.map(wp => parseFloat(wp.league1));
      const league2Data = weeklyPoints.map(wp => parseFloat(wp.league2));

      setChartData({
        labels: labels,
        datasets: [
          {
            label: 'League A',
            data: league1Data,
            fill: false,
            borderColor: '#42A5F5',
            tension: 0.4
          },
          {
            label: 'League B',
            data: league2Data,
            fill: false,
            borderColor: '#FFA726',
            tension: 0.4
          }
        ]
      });
    }
  }, [weeklyPoints]);

  const processData = (data) => {
    console.log("Processing data:", data); // Log the data being processed
    // Your data processing logic here
  };

  return (
    <div className="total-points-container">
      <h2 className="total-points-title">Total Points for 2024 Season - Week {currentWeek}</h2>
      {weeklyPoints.length === 0 ? (
        <p>Loading data...</p>
      ) : (
        <>
          <div className="league-totals">
            <Card className="league-total league-a">
              <h3>League A Total</h3>
              <p className="total-score">{totalPoints.league1}</p>
            </Card>
            <Card className="league-total league-b">
              <h3>League B Total</h3>
              <p className="total-score">{totalPoints.league2}</p>
            </Card>
          </div>
          <div className="chart-container">
            <h3>Weekly Points Trend</h3>
            <Chart type="line" data={chartData} />
          </div>
          <div className="table-container">
            <h3>Weekly Points Breakdown</h3>
            <p className="current-week-info">Current Week: {currentWeek}</p>
            <DataTable value={weeklyPoints} className="weekly-points-table" stripedRows>
              <Column field="week" header="Week" body={(rowData) => 
                rowData.isCurrent ? <span className="current-week">{rowData.week} (Current)</span> : rowData.week
              } />
              <Column field="league1" header="League A" />
              <Column field="league2" header="League B" />
            </DataTable>
          </div>
        </>
      )}
    </div>
  );
};

export default TotalPoints;