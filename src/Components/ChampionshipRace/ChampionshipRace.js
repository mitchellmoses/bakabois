import React, { useState, useEffect } from 'react';
import './ChampionshipRace.css';
import { FaCrown, FaTrophy, FaFire, FaBolt, FaChartLine } from 'react-icons/fa';
import { ProgressBar } from 'primereact/progressbar';
import { useNavigate } from 'react-router-dom';

const calculateChampionshipOdds = (team) => {
  // Weight factors (total should = 1)
  const WEIGHTS = {
    record: 0.25,
    pointsFor: 0.15,
    recentForm: 0.20,
    h2hWins: 0.10,
    recentPoints: 0.30
  };

  // Calculate record score (max 100)
  const recordScore = ((team.record.wins / (team.record.wins + team.record.losses)) * 100);

  // Calculate season-long points score (normalize around 1800 points being average)
  const pointsScore = ((team.pointsFor - 1800) / 200) * 100 + 50;

  // Recent form is already on a 0-100 scale
  const formScore = team.recentForm;

  // H2H score based on wins against playoff teams
  const h2hScore = team.h2hWins ? team.h2hWins * 25 : 50;

  // Calculate recent points score (last 3 weeks)
  // Assuming higher recent scoring indicates better championship chances
  const recentPointsScore = ((team.pointsFor / 13) * 3 > 450) ? 100 : 
                           ((team.pointsFor / 13) * 3 - 300) / 1.5;

  // Calculate weighted score
  const totalScore = (
    recordScore * WEIGHTS.record +
    pointsScore * WEIGHTS.pointsFor +
    formScore * WEIGHTS.recentForm +
    h2hScore * WEIGHTS.h2hWins +
    recentPointsScore * WEIGHTS.recentPoints
  );

  const finalScore = Math.round(totalScore / 4);
  
  console.log(`Odds calculation for ${team.name}:`, {
    recordScore,
    pointsScore,
    formScore,
    h2hScore,
    recentPointsScore,
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
        const awayTeamId = game.away.teamId;
        const homeTeamId = game.home.teamId;
        return awayTeamId === team.teamId || homeTeamId === team.teamId;
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

const PLAYOFF_TEAMS = {
  gay: {
    owner: "Gay",
    name: "Gay",
    leagueId: "1869404038",
    teamId: "1",
    color: "#1e3c72",
    gradient: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
    record: { wins: 10, losses: 4 },
    pointsFor: 1850.5,
    recentForm: 85,
    h2hWins: 2,
    keyPlayers: [
      { name: "Christian McCaffrey", points: 28.5 },
      { name: "Deebo Samuel", points: 24.2 },
      { name: "Brock Purdy", points: 21.8 }
    ]
  },
  drakesmydad: {
    owner: "Drake",
    name: "Drakes my Dad",
    leagueId: "1869404038",
    teamId: "2",
    color: "#2E7D32",
    gradient: "linear-gradient(135deg, #2E7D32 0%, #388E3C 100%)",
    record: { wins: 9, losses: 5 },
    pointsFor: 1820.3,
    recentForm: 80,
    h2hWins: 1,
    keyPlayers: [
      { name: "Tyreek Hill", points: 26.4 },
      { name: "Travis Etienne", points: 19.8 },
      { name: "Trevor Lawrence", points: 18.5 }
    ]
  },
  thebeast: {
    owner: "Kent Baldy",
    name: "The Beast",
    leagueId: "1869404038",
    teamId: "3",
    color: "#6A1B9A",
    gradient: "linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%)",
    record: { wins: 8, losses: 6 },
    pointsFor: 1780.8,
    recentForm: 75,
    h2hWins: 1,
    keyPlayers: [
      { name: "Lamar Jackson", points: 25.6 },
      { name: "Stefon Diggs", points: 20.3 },
      { name: "Breece Hall", points: 18.9 }
    ]
  },
  stanford: {
    owner: "Kyle Stanford",
    name: "Stanford",
    leagueId: "1869404038",
    teamId: "4",
    color: "#C62828",
    gradient: "linear-gradient(135deg, #C62828 0%, #E53935 100%)",
    record: { wins: 11, losses: 3 },
    pointsFor: 1890.2,
    recentForm: 90,
    h2hWins: 3,
    keyPlayers: [
      { name: "CeeDee Lamb", points: 27.1 },
      { name: "Dak Prescott", points: 23.4 },
      { name: "Raheem Mostert", points: 19.7 }
    ]
  }
};

function ChampionshipRace() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState(PLAYOFF_TEAMS);

  useEffect(() => {
    // Simple initialization without API calls
    const initializeTeams = () => {
      setLoading(true);
      try {
        const updatedTeams = { ...teams };
        
        // Calculate odds for each team
        Object.keys(updatedTeams).forEach(teamKey => {
          const team = updatedTeams[teamKey];
          team.championshipOdds = calculateChampionshipOdds(team);
        });

        // Normalize odds to ensure they sum to 100
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
            <FaFire className="stat-icon" />
            <span className="stat-label">Recent Form</span>
            <ProgressBar 
              value={stats.recentForm || 0} 
              className="form-bar"
              showValue={false}
            />
          </div>

          <div className="key-players">
            <h3>Key Players</h3>
            <div className="players-list">
              {stats.keyPlayers.map((player, index) => (
                <div key={index} className="player-item">
                  <span className="player-name">{player.name}</span>
                  <span className="player-points">{player.points.toFixed(1)} pts</span>
                </div>
              ))}
            </div>
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