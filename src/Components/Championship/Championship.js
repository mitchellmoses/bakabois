import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Championship.css';
import { FaTrophy, FaCrown, FaBolt, FaFire, FaSync, FaFootballBall, FaClock } from 'react-icons/fa';
import { GiTrophy, GiTrophyCup } from 'react-icons/gi';

const calculateTeamScore = (roster) => {
  if (!roster) return 0;
  
  // Only sum up starters (not bench)
  const starters = roster.filter(player => player.position !== 20 && player.position !== 21);
  
  // Sum up actual points for each starter
  return starters.reduce((total, player) => {
    const points = parseFloat(player.points) || 0;
    return total + points;
  }, 0);
}; 

const getPositionName = (positionId) => {
  const positions = {
    0: 'QB',
    2: 'RB',
    4: 'WR',
    6: 'TE',
    16: 'D/ST',
    17: 'K',
    20: 'Bench',
    21: 'IR',
    23: 'FLEX'
  };
  return positions[positionId] || 'Unknown';
};

const getPositionOrder = (positionId) => {
  const order = {
    0: 1,   // QB
    2: 2,   // RB
    4: 3,   // WR
    6: 4,   // TE
    23: 5,  // FLEX
    16: 6,  // D/ST
    17: 7,  // K
    20: 8,  // Bench
    21: 9   // IR
  };
  return order[positionId] || 99;
};

const isWinning = (team1Score, team2Score) => {
  if (!team1Score || !team2Score) return false;
  return parseFloat(team1Score) > parseFloat(team2Score);
};

const ScoreDifference = ({ team1Score, team2Score }) => {
  const diff = Math.abs(team1Score - team2Score).toFixed(2);
  return (
    <div className="score-difference">
      <span className="difference-label">Margin:</span>
      <span className="difference-value">{diff}</span>
    </div>
  );
};

const GameCountdown = () => {
  const [timeLeft, setTimeLeft] = useState('');
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      const gameTime = new Date('2023-12-25T12:00:00'); // Christmas Day 12:00 PM EST
      const now = new Date();
      const difference = gameTime - now;
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        
        let timeString = '';
        if (days > 0) timeString += `${days}d `;
        return `${timeString}${hours}h ${minutes}m ${seconds}s`;
      }

      // Check if games have started but not finished (assuming 4 hours duration)
      const gamesEndTime = new Date('2023-12-25T16:00:00'); // 4 hours after start
      if (now < gamesEndTime) {
        return '🏈 Championship Games In Progress! 🏈';
      }

      // Games are finished
      return '🏆 Championship Games Complete 🏆';
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="game-countdown">
      <FaClock className="countdown-icon" />
      <div className="countdown-text">
        <span className="countdown-label">CHRISTMAS DAY CHAMPIONSHIP</span>
        <span className="countdown-time">{timeLeft}</span>
      </div>
    </div>
  );
};

function Championship({ championshipGame }) {
  const [matchupData, setMatchupData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const fetchChampionshipData = async () => {
    try {
      const scoringPeriodId = 17; // Updated to Championship week (Week 17)
      
      // Get both leagues' data
      const [league1Response, league2Response] = await Promise.all([
        axios.get(`https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/1446375?view=mMatchup&view=mMatchupScore&view=mRoster&view=mTeam&view=mProjectedScore&scoringPeriodId=${scoringPeriodId}`),
        axios.get(`https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/1869404038?view=mMatchup&view=mMatchupScore&view=mRoster&view=mTeam&view=mProjectedScore&scoringPeriodId=${scoringPeriodId}`)
      ]);

      // Log all team names to debug
      console.log('League 1 teams:', league1Response.data.teams.map(t => ({ id: t.id, name: t.name })));
      console.log('League 2 teams:', league2Response.data.teams.map(t => ({ id: t.id, name: t.name })));

      // Find Gay from league 2 and The Beast from league 1
      const gay = league2Response.data.teams.find(team => team.id === 7); // Updated to ID 7 in league 2
      const theBeast = league1Response.data.teams.find(team => 
        team.name.toUpperCase().includes('THE BEAST')
      );  // Find THE BEAST by name instead of ID

      console.log('Found teams:', { gay, theBeast });

      // Get their current matchups for week 16
      const gayMatchup = gay && league2Response.data.schedule.find(match => 
        (match.away?.teamId === gay.id || match.home?.teamId === gay.id) &&
        match.matchupPeriodId === scoringPeriodId
      );
      
      const beastMatchup = theBeast && league1Response.data.schedule.find(match => 
        (match.away?.teamId === theBeast.id || match.home?.teamId === theBeast.id) &&
        match.matchupPeriodId === scoringPeriodId
      );

      console.log('Found matchups:', { gayMatchup, beastMatchup }); // Debug log

      const getRosterWithDetails = (team, matchup) => {
        if (!team?.roster?.entries) return [];

        return team.roster.entries.map(entry => {
          const playerName = entry.playerPoolEntry?.player?.fullName || 'Unknown Player';
          
          // Get player's stats from Week 17 only
          const playerStats = entry.playerPoolEntry?.player?.stats || [];
          const week17Stats = playerStats.find(
            stat => stat.scoringPeriodId === 17 && stat.statSourceId === 0 && stat.statSplitTypeId === 1
          );

          // Use the Week 17 stats or default to 0
          const actualPoints = week17Stats?.appliedTotal || 0;

          // Debug log to help track scores
          console.log(`${playerName} Week 17:`, {
            points: actualPoints,
            stats: week17Stats
          });

          return {
            playerId: entry.playerId,
            playerName: playerName,
            position: entry.lineupSlotId,
            points: actualPoints,
            status: entry.playerPoolEntry?.player?.injuryStatus || 'ACTIVE'
          };
        });
      };

      if (gay && theBeast) {
        const team1Roster = getRosterWithDetails(gay, gayMatchup);
        const team2Roster = getRosterWithDetails(theBeast, beastMatchup);
        
        const matchupData = {
          team1: {
            name: gay.name,
            logo: gay.logo,
            score: calculateTeamScore(team1Roster),
            roster: team1Roster
          },
          team2: {
            name: theBeast.name,
            logo: theBeast.logo,
            score: calculateTeamScore(team2Roster),
            roster: team2Roster
          }
        };
        setMatchupData(matchupData);
      }

      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching championship data:', error);
      setLoading(false);
    }
  };

  const renderRoster = (roster) => {
    if (!roster) return null;

    // Special case for Boswell
    const processPlayerPoints = (player) => {
      if (player.playerName.includes('Boswell')) {
        return 4;
      }
      return player.points || 0;
    };

    const sortedRoster = [...roster].sort((a, b) => {
      const orderA = getPositionOrder(a.position);
      const orderB = getPositionOrder(b.position);
      return orderA - orderB;
    });

    return (
      <>
        {sortedRoster.map((player) => (
          <div key={player.playerId} className="player-row">
            <div className="position">{getPositionName(player.position)}</div>
            <div className="player-name">{player.playerName}</div>
            <div className="player-score">
              {processPlayerPoints(player).toFixed(1)}
            </div>
          </div>
        ))}
      </>
    );
  };

  useEffect(() => {
    fetchChampionshipData();
    const interval = setInterval(fetchChampionshipData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="championship-loading">
        <FaTrophy className="loading-trophy" />
        <div className="loading-text">Loading Championship Matchup...</div>
      </div>
    );
  }

  return (
    <div className="championship-container">
      <div className="championship-header">
        <h2>
          <FaTrophy className="trophy-icon" />
          BAKABOWL™ XI
          <FaTrophy className="trophy-icon" />
        </h2>
      </div>

      {/* Teams and Scoring First */}
      <div className="matchup-container">
        <div className={`team-panel ${isWinning(matchupData?.team1?.score, matchupData?.team2?.score) ? 'winning' : ''}`}>
          {isWinning(matchupData?.team1?.score, matchupData?.team2?.score) && 
            <div className="crown-container">
              <FaCrown className="crown-icon" />
            </div>
          }
          <div className="team-header">
            <img src={matchupData?.team1?.logo} alt="" className="team-logo" />
            <div className="team-info">
              <div className="team-name">
                {matchupData?.team1?.name || 'Loading...'}
              </div>
              <div className="score-container">
                <div className="team-score">
                  {matchupData?.team1?.score?.toFixed(2) || '0.00'}
                </div>
                <div className="projected-score">
                  Proj: 123.69
                </div>
              </div>
            </div>
          </div>
          <div className="roster-list">
            {matchupData?.team1?.roster && renderRoster(matchupData.team1.roster)}
          </div>
        </div>

        <div className="vs-divider">
          VS
          <ScoreDifference 
            team1Score={matchupData?.team1?.score} 
            team2Score={matchupData?.team2?.score} 
          />
        </div>

        <div className={`team-panel ${isWinning(matchupData?.team2?.score, matchupData?.team1?.score) ? 'winning' : ''}`}>
          {isWinning(matchupData?.team2?.score, matchupData?.team1?.score) && 
            <div className="crown-container">
              <FaCrown className="crown-icon" />
            </div>
          }
          <div className="team-header">
            <img src={matchupData?.team2?.logo} alt="" className="team-logo" />
            <div className="team-info">
              <div className="team-name">
                {matchupData?.team2?.name || 'Loading...'}
              </div>
              <div className="score-container">
                <div className="team-score">
                  {matchupData?.team2?.score?.toFixed(2) || '0.00'}
                </div>
                <div className="projected-score">
                  Proj: 124.36
                </div>
              </div>
            </div>
          </div>
          <div className="roster-list">
            {matchupData?.team2?.roster && renderRoster(matchupData.team2.roster)}
          </div>
        </div>
      </div>

      {/* Prize Pool and Narrative Second */}
      <div className="prize-pool">
        <GiTrophyCup className="prize-icon" />
        <div className="prize-text">
          <div className="prize-tier">
            <span className="prize-label">CHAMPION</span>
            <span className="prize-amount">$1,100</span>
          </div>
          <div className="prize-tier">
            <span className="prize-label">RUNNER-UP</span>
            <span className="prize-amount-second">$400</span>
          </div>
        </div>
        <div className="championship-narrative">
          <FaCrown className="narrative-icon" />
          Will 2-Time Champion Kent Defend His Crown or Will a Newcomer Rise to Glory?
          <FaCrown className="narrative-icon" />
        </div>
        <GiTrophyCup className="prize-icon" />
      </div>

      {/* Christmas Games Section */}
      <div className="christmas-games">
        {/* Add Christmas games content here */}
      </div>

      <div className="last-updated">
        <FaSync className="update-icon" />
        Last updated: {lastUpdated.toLocaleTimeString()}
      </div>

      <GameCountdown />
    </div>
  );
}

export default Championship; 