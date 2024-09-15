import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import './TotalPoints.css';

const TotalPoints = () => {
  const [totalPoints, setTotalPoints] = useState({ league1: 0, league2: 0 });
  const [weeklyPoints, setWeeklyPoints] = useState([]);
  const [chartData, setChartData] = useState({});
  const [currentWeek, setCurrentWeek] = useState(1);

  useEffect(() => {
    fetchTotalPoints();
  }, []);

  const fetchTotalPoints = async () => {
    try {
      const league1Data = await fetchLeagueData(1446375);
      const league2Data = await fetchLeagueData(1869404038);

      setCurrentWeek(league1Data.scoringPeriodId);

      const league1Total = calculateTotalPoints(league1Data);
      const league2Total = calculateTotalPoints(league2Data);

      setTotalPoints({ league1: league1Total, league2: league2Total });

      const weeklyData = calculateWeeklyPoints(league1Data, league2Data);
      setWeeklyPoints(weeklyData);

      const chartData = {
        labels: Array(16).fill().map((_, i) => i + 1),
        datasets: [
          {
            label: 'League A',
            data: weeklyData.map(data => parseFloat(data.league1)),
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          },
          {
            label: 'League B',
            data: weeklyData.map(data => parseFloat(data.league2)),
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          }
        ]
      };
      setChartData(chartData);
    } catch (error) {
      console.error("Error fetching total points:", error);
    }
  };

  const fetchLeagueData = async (leagueId) => {
    const response = await axios.get(`https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/${leagueId}?view=mMatchup&view=mScoreboard`);
    return response.data;
  };

  const calculateTotalPoints = (leagueData) => {
    let total = 0;
    const currentWeek = leagueData.scoringPeriodId;
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

  const calculateWeeklyPoints = (league1Data, league2Data) => {
    const weeklyData = [];
    const currentWeek = league1Data.scoringPeriodId;
    
    for (let week = 1; week <= 16; week++) {
      const league1Points = calculateWeekPoints(league1Data, week, currentWeek);
      const league2Points = calculateWeekPoints(league2Data, week, currentWeek);
      weeklyData.push({
        week: week,
        league1: league1Points.toFixed(2),
        league2: league2Points.toFixed(2),
        isCurrent: week === currentWeek
      });
    }
    return weeklyData;
  };

  const calculateWeekPoints = (leagueData, week, currentWeek) => {
    let total = 0;
    leagueData.schedule.forEach(matchup => {
      if (matchup.matchupPeriodId === week) {
        if (week < currentWeek) {
          // For completed weeks
          total += matchup.home.totalPoints;
          if (matchup.away) {
            total += matchup.away.totalPoints;
          }
        } else if (week === currentWeek) {
          // For the current week
          total += matchup.home.pointsByScoringPeriod[currentWeek] || 0;
          if (matchup.away) {
            total += matchup.away.pointsByScoringPeriod[currentWeek] || 0;
          }
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

  return (
    <div className="total-points-container">
      <h2 className="total-points-title">Total Points for 2024 Season</h2>
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
          <Column field="league1" header="League A" body={(rowData) =>
            rowData.isCurrent ? <span className="current-week">{rowData.league1}</span> : rowData.league1
          } />
          <Column field="league2" header="League B" body={(rowData) =>
            rowData.isCurrent ? <span className="current-week">{rowData.league2}</span> : rowData.league2
          } />
        </DataTable>
      </div>
    </div>
  );
};

export default TotalPoints;