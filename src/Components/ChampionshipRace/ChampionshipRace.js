import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ChampionshipRace.css';
import { FaCrown, FaTrophy, FaFire, FaBolt, FaChartLine } from 'react-icons/fa';
import { ProgressBar } from 'primereact/progressbar';
import { Chart } from 'primereact/chart';
import { useNavigate } from 'react-router-dom';

const SEMIFINAL_TEAMS = {
  will: {
    name: "Will's Team",
    owner: "Will",
    leagueId: "1446375",
    teamId: "1",
    color: "#1e3c72",
    gradient: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
  },
  dannie: {
    name: "Dannie's Team",
    owner: "Dannie",
    leagueId: "1446375",
    teamId: "3",
    color: "#2E7D32",
    gradient: "linear-gradient(135deg, #2E7D32 0%, #388E3C 100%)",
  },
  kent: {
    name: "Kent's Team",
    owner: "Kent",
    leagueId: "1446375",
    teamId: "4",
    color: "#C62828",
    gradient: "linear-gradient(135deg, #C62828 0%, #E53935 100%)",
  },
  kyle: {
    name: "Kyle's Team",
    owner: "Kyle",
    leagueId: "1446375",
    teamId: "8",
    color: "#6A1B9A",
    gradient: "linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%)",
  }
};

function ChampionshipRace() {
  const navigate = useNavigate();
  const [teamStats, setTeamStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamStats();
  }, []);

  const handleTeamClick = async (team) => {
    try {
      // Navigate to scoreboard tab
      navigate('/dashboard', { 
        state: { 
          showScoreboard: true,
          leagueId: team.leagueId,
          teamId: team.teamId,
          scoringPeriodId: '16' // Championship week
        } 
      });
    } catch (error) {
      console.error('Error navigating to scoreboard:', error);
    }
  };

  const fetchTeamStats = async () => {
    try {
      setLoading(true);
      // Fetch data for each team
      const promises = Object.values(SEMIFINAL_TEAMS).map(team => 
        axios.get(`https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/${team.leagueId}?view=mMatchup&view=mMatchupScore&view=mTeam&scoringPeriodId=15`)
      );

      const responses = await Promise.all(promises);
      
      // Process team stats
      const stats = {};
      responses.forEach((response, index) => {
        const team = Object.values(SEMIFINAL_TEAMS)[index];
        const teamData = response.data.teams.find(t => t.id === parseInt(team.teamId));
        
        if (teamData) {
          stats[team.owner.toLowerCase()] = {
            ...team,
            record: teamData.record,
            pointsFor: teamData.points,
            streak: teamData.streak,
            recentForm: calculateRecentForm(teamData),
            championshipOdds: calculateChampionshipOdds(teamData),
            keyPlayers: getKeyPlayers(teamData),
          };
        }
      });

      setTeamStats(stats);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching team stats:', error);
      setLoading(false);
    }
  };

  const calculateRecentForm = (teamData) => {
    if (!teamData.record || !teamData.record.overall) return 0;

    // Get the team's record
    const { wins, losses, ties } = teamData.record.overall;
    const totalGames = wins + losses + (ties || 0);
    
    // Calculate win percentage
    const winPercentage = (wins / totalGames) * 100;
    
    return winPercentage;
  };

  const calculateChampionshipOdds = (teamData) => {
    if (!teamData) return 0;

    // Factors for championship odds calculation
    const factors = {
      winPercentage: 0.4,    // 40% weight
      pointsScored: 0.4,    // 40% weight
      recentForm: 0.2,      // 20% weight
    };

    // Calculate win percentage
    const wins = teamData.record?.overall?.wins || 0;
    const losses = teamData.record?.overall?.losses || 0;
    const winPercentage = wins / (wins + losses) * 100;

    // Calculate points scored (normalize to 100-point scale)
    const totalPoints = teamData.points || 0;
    const gamesPlayed = wins + losses;
    const avgPointsPerGame = gamesPlayed > 0 ? totalPoints / gamesPlayed : 0;
    const pointsScore = Math.min(100, (avgPointsPerGame / 100) * 100);

    // Get recent form
    const recentForm = calculateRecentForm(teamData);

    // Calculate weighted average
    const championshipOdds = 
      (winPercentage * factors.winPercentage) +
      (pointsScore * factors.pointsScored) +
      (recentForm * factors.recentForm);

    // Normalize to ensure total odds add up to 100%
    return Math.min(100, Math.max(0, championshipOdds));
  };

  const getKeyPlayers = (teamData) => {
    // Return empty array if no roster data
    if (!teamData || !teamData.roster || !Array.isArray(teamData.roster.entries)) {
      return [];
    }

    // Sort players by projected points and get top 3
    return teamData.roster.entries
      .filter(entry => entry && entry.playerPoolEntry && entry.playerPoolEntry.player)
      .sort((a, b) => {
        const aPoints = a.playerPoolEntry.appliedStatTotal || 0;
        const bPoints = b.playerPoolEntry.appliedStatTotal || 0;
        return bPoints - aPoints;
      })
      .slice(0, 3)
      .map(entry => ({
        name: entry.playerPoolEntry.player.fullName,
        points: entry.playerPoolEntry.appliedStatTotal || 0
      }));
  };

  const renderTeamCard = (team) => {
    if (!teamStats[team]) return null;
    const stats = teamStats[team];

    return (
      <div 
        className="championship-team-card" 
        style={{ background: stats.gradient }}
        onClick={() => handleTeamClick(stats)}
      >
        <div className="team-header">
          <FaCrown className="team-crown" />
          <h2>{stats.name}</h2>
          <span className="owner-name">{stats.owner}</span>
        </div>
        
        <div className="team-stats">
          <div className="stat-item">
            <FaChartLine className="stat-icon" />
            <span className="stat-label">Championship Odds</span>
            <span className="stat-value">{stats.championshipOdds.toFixed(1)}%</span>
          </div>
          
          <div className="stat-item">
            <FaFire className="stat-icon" />
            <span className="stat-label">Recent Form</span>
            <ProgressBar 
              value={stats.recentForm} 
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

  if (loading) {
    return (
      <div className="championship-race-container">
        <div className="championship-header">
          <h1 className="championship-title">Loading Championship Race...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="championship-race-container">
      <div className="championship-header">
        <h1 className="championship-title">Road to the Championship</h1>
        <p className="championship-subtitle">The Final Four Battle for Glory</p>
      </div>

      <div className="teams-grid">
        {Object.keys(SEMIFINAL_TEAMS).map(team => (
          <div key={team}>
            {renderTeamCard(team)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChampionshipRace; 