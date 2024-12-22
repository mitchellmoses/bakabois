import React, { useState, useEffect } from 'react';
import './ChampionshipRace.css';
import { FaCrown, FaTrophy, FaFire, FaBolt, FaChartLine } from 'react-icons/fa';
import { ProgressBar } from 'primereact/progressbar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const calculateChampionshipOdds = (team) => {
  const WEIGHTS = {
    record: 0.30,             // Regular season record
    pointsFor: 0.30,          // Season-long scoring potential
    marginOfVictory: 0.15,    // Points per game differential
    playoffScoring: 0.25      // How well they're scoring in playoffs
  };

  // Calculate record score including playoff wins
  const totalGames = team.record.wins + team.record.losses;
  const winPct = ((team.record.wins + 2) / (totalGames + 2)) * 100;
  const recordScore = winPct;

  // Points scoring relative to league average
  const pointsScore = ((team.pointsFor - 1500) / 300) * 100;

  // Points per game including playoff games
  const marginScore = ((team.pointsFor / (totalGames + 2)) - 100) * 2;

  // Calculate playoff scoring (average of last two weeks relative to 100 points)
  const avgPlayoffPoints = team.playoffPoints.reduce((sum, pts) => sum + pts, 0) / 2;
  const playoffScore = ((avgPlayoffPoints - 100) / 50) * 100;

  // Calculate weighted score
  const totalScore = (
    recordScore * WEIGHTS.record +
    pointsScore * WEIGHTS.pointsFor +
    marginScore * WEIGHTS.marginOfVictory +
    playoffScore * WEIGHTS.playoffScoring
  );

  const finalScore = Math.round(totalScore / 4);
  
  console.log(`Odds calculation for ${team.name}:`, {
    recordScore,
    pointsScore,
    marginScore,
    playoffScore,
    totalScore,
    finalScore
  });

  return finalScore;
};

const calculateRecentForm = (team, leagueData) => {
  try {
    // Get the team's schedule from league data
    const teamSchedule = leagueData.schedule
      .filter(game => {
        if (!game || !game.away || !game.home) return false;
        const awayTeamId = game.away.teamId;
        const homeTeamId = game.home.teamId;
        // Only include games with actual scores
        const hasScores = (game.away?.totalPoints > 0 || game.home?.totalPoints > 0);
        return hasScores && (awayTeamId === team.teamId || homeTeamId === team.teamId);
      })
      // Sort by matchupPeriodId in descending order to get most recent games
      .sort((a, b) => b.matchupPeriodId - a.matchupPeriodId)
      // Take last 5 games
      .slice(0, 5);

    // Calculate win percentage and scoring performance in last 5 games
    let wins = 0;
    let totalPoints = 0;

    teamSchedule.forEach(game => {
      const isHome = game.home.teamId === team.teamId;
      const teamScore = isHome ? game.home.totalPoints : game.away.totalPoints;
      const opponentScore = isHome ? game.away.totalPoints : game.home.totalPoints;
      
      if (teamScore > opponentScore) wins++;
      totalPoints += teamScore;
    });

    // Calculate form score (50% based on wins, 50% based on scoring)
    const winPercentage = (wins / teamSchedule.length) * 100;
    const avgPoints = totalPoints / teamSchedule.length;
    const pointsScore = ((avgPoints - 100) / 50) * 100; // Normalize around 100 points per game

    const formScore = Math.round((winPercentage * 0.5) + (pointsScore * 0.5));

    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, formScore));
  } catch (error) {
    console.error("Error calculating recent form:", error);
    return 50; // Default to 50 if calculation fails
  }
};

const calculateStreak = (schedule, teamId) => {
  if (!schedule) {
    console.log(`No schedule data for team ${teamId}`);
    return 0;
  }
  
  const recentGames = schedule
    .filter(game => {
      if (!game || !game.away || !game.home) return false;
      // Only include games that have actual scores (completed games)
      const hasScores = (game.away?.totalPoints > 0 || game.home?.totalPoints > 0);
      return hasScores && (
        game.home?.teamId?.toString() === teamId.toString() || 
        game.away?.teamId?.toString() === teamId.toString()
      );
    })
    .sort((a, b) => b.matchupPeriodId - a.matchupPeriodId);

  console.log(`Recent games for team ${teamId}:`, recentGames);

  let streak = 0;
  for (let game of recentGames) {
    const isHome = game.home?.teamId?.toString() === teamId.toString();
    const teamScore = isHome ? game.home?.totalPoints || 0 : game.away?.totalPoints || 0;
    const oppScore = isHome ? game.away?.totalPoints || 0 : game.home?.totalPoints || 0;
    
    console.log(`Game ${game.matchupPeriodId}: ${teamScore} vs ${oppScore}`);
    
    if (teamScore > oppScore) {
      streak++;
    } else {
      break;
    }
  }
  
  console.log(`Final streak for team ${teamId}: ${streak}`);
  return streak;
};

const PLAYOFF_TEAMS = {
  gay: {
    owner: "Gay",
    name: "Gay",
    leagueId: "1869404038",
    teamId: "1",
    color: "#1e3c72",
    gradient: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
    record: { wins: 11, losses: 2 },
    pointsFor: 1648,
    playoffPoints: [174.5, 140.0],
    championshipOpponent: "Drake",
    championshipGame: "Semifinal 1"
  },
  drakesmydad: {
    owner: "Drake",
    name: "Drakes my Dad",
    leagueId: "1869404038",
    teamId: "2",
    color: "#2E7D32",
    gradient: "linear-gradient(135deg, #2E7D32 0%, #388E3C 100%)",
    record: { wins: 7, losses: 6 },
    pointsFor: 1458,
    playoffPoints: [172.3, 147.3],
    championshipOpponent: "Gay",
    championshipGame: "Semifinal 1"
  },
  thebeast: {
    owner: "Kent Baldy",
    name: "The Beast",
    leagueId: "1869404038",
    teamId: "3",
    color: "#6A1B9A",
    gradient: "linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%)",
    record: { wins: 7, losses: 6 },
    pointsFor: 1539.8,
    playoffPoints: [168.1, 146.8],
    championshipOpponent: "Stanford",
    championshipGame: "Semifinal 2"
  },
  stanford: {
    owner: "Kyle Stanford",
    name: "Stanford",
    leagueId: "1869404038",
    teamId: "4",
    color: "#C62828",
    gradient: "linear-gradient(135deg, #C62828 0%, #E53935 100%)",
    record: { wins: 8, losses: 5 },
    pointsFor: 1428,
    playoffPoints: [124.3, 114.0],
    championshipOpponent: "Beast",
    championshipGame: "Semifinal 2"
  }
};

function ChampionshipRace() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState(PLAYOFF_TEAMS);

  useEffect(() => {
    const initializeTeams = async () => {
      setLoading(true);
      try {
        const updatedTeams = { ...teams };

        // Calculate championship odds for each team using existing data
        Object.keys(updatedTeams).forEach(teamKey => {
          const team = updatedTeams[teamKey];
          team.championshipOdds = calculateChampionshipOdds(team);
        });

        // Normalize odds
        const totalOdds = Object.values(updatedTeams).reduce((sum, team) => sum + team.championshipOdds, 0);
        Object.keys(updatedTeams).forEach(teamKey => {
          updatedTeams[teamKey].championshipOdds = Math.round((updatedTeams[teamKey].championshipOdds / totalOdds) * 100);
        });

        setTeams(updatedTeams);
      } catch (error) {
        console.error("Error initializing teams:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeTeams();
  }, []);

  const handleTeamClick = (team) => {
    navigate('/dashboard', { 
      state: { 
        showScoreboard: true,
        leagueId: 'overall',
        teamId: team.teamId,
        scoringPeriodId: '16' // Championship week
      } 
    });
  };

  const renderTeamCard = (teamKey) => {
    const stats = teams[teamKey];
    const playoffAvg = (stats.playoffPoints[0] + stats.playoffPoints[1]) / 2;
    
    // Calculate average of all playoff teams
    const allTeamAverages = Object.values(teams).map(team => 
      (team.playoffPoints[0] + team.playoffPoints[1]) / 2
    );
    const overallPlayoffAvg = allTeamAverages.reduce((a, b) => a + b, 0) / allTeamAverages.length;
    
    // Compare this team's avg to overall avg
    const comparedToAvg = playoffAvg - overallPlayoffAvg;

    return (
      <div 
        className="championship-team-card" 
        style={{ background: stats.gradient }}
        onClick={() => handleTeamClick(stats)}
      >
        <div className="team-header">
          <FaCrown className="team-crown" />
          <h2>{stats.name}</h2>
        </div>
        
        <div className="team-stats">
          <div className="stat-item">
            <FaChartLine className="stat-icon" />
            <span className="stat-label">Championship Odds</span>
            <span className="stat-value">{stats.championshipOdds || 0}%</span>
          </div>
          
          <div className="stat-item">
            <FaBolt className="stat-icon" />
            <span className="stat-label">Playoff Scoring</span>
            <div className="playoff-stats">
              <span className="avg">{playoffAvg.toFixed(1)}</span>
              <span className={`trend ${comparedToAvg > 0 ? 'positive' : 'negative'}`}>
                {comparedToAvg > 0 ? '↑' : '↓'} {Math.abs(comparedToAvg).toFixed(1)}
              </span>
            </div>
          </div>
          
          <div className="stat-item matchup-info">
            <FaTrophy className="stat-icon" />
            <span className="stat-label">{stats.championshipGame}</span>
            <span className="vs">vs {stats.championshipOpponent}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="championship-race-container">
      <div className="championship-header">
        <h1 className="championship-title">Road to the Championship</h1>
        <p className="championship-subtitle">The Final Four Battle for Glory</p>
      </div>

      <div className="teams-grid">
        {Object.keys(teams).map(teamKey => (
          <div key={teamKey} className="team-card-wrapper">
            {renderTeamCard(teamKey)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChampionshipRace; 