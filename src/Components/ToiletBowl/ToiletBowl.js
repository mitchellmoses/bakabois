import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ToiletBowl.css';
import { FaToilet, FaCrown, FaSadCry, FaPoop } from 'react-icons/fa';

const calculateCustomProjection = (playerStats, matchupDifficulty = 1) => {
  if (!playerStats || !playerStats.length) return 0;

  // Get last 3 weeks of performance
  const recentStats = playerStats
    .filter(stat => stat.statSourceId === 0 && stat.scoringPeriodId) // Only actual scores, not projections
    .sort((a, b) => b.scoringPeriodId - a.scoringPeriodId)
    .slice(0, 3);

  if (recentStats.length === 0) return 0;

  // Calculate weighted average (more recent games count more)
  const weights = [0.5, 0.3, 0.2]; // 50% last game, 30% second-last, 20% third-last
  let weightedSum = 0;
  let weightUsed = 0;

  recentStats.forEach((stat, index) => {
    if (index < weights.length) {
      weightedSum += (stat.points || 0) * weights[index];
      weightUsed += weights[index];
    }
  });

  // Adjust for available weights if we don't have 3 games
  const baseProjection = weightedSum / weightUsed;

  // Apply matchup difficulty modifier
  const projectedPoints = baseProjection * matchupDifficulty;

  return Math.round(projectedPoints * 10) / 10; // Round to 1 decimal
};

const getMatchupDifficulty = (position, opposingTeam) => {
  // This would ideally be based on opposing team's defense against this position
  // For now, using a simplified version
  const defaultDifficulty = 1;
  
  // You could add logic here to adjust difficulty based on opponent
  // Example: if opponent is strong against RBs, return 0.9 for RBs
  
  return defaultDifficulty;
};

function ToiletBowl() {
  const [matchupData, setMatchupData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const fetchToiletBowlData = async () => {
    try {
      // Get current scoring period first
      const currentPeriodResponse = await axios.get(
        "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/1446375?view=mSettings"
      );
      
      const scoringPeriodId = currentPeriodResponse.data?.scoringPeriodId || 15;
      
      // Add mProjectedScore view to get team projections
      const [league1Response, league2Response] = await Promise.all([
        axios.get(`https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/1446375?view=mMatchup&view=mMatchupScore&view=mRoster&view=mTeam&view=mProjectedScore&scoringPeriodId=${scoringPeriodId}`),
        axios.get(`https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/1869404038?view=mMatchup&view=mMatchupScore&view=mRoster&view=mTeam&view=mProjectedScore&scoringPeriodId=${scoringPeriodId}`)
      ]);

      // Find the teams and their matchups
      const brettystar7 = league1Response.data.teams.find(team => 
        team.name?.toLowerCase().includes('brettystar'));
      const chorizoChan = league2Response.data.teams.find(team => 
        team.name?.toLowerCase().includes('chorizo'));

      // Get current week's matchups
      const brettystar7Matchup = league1Response.data.schedule.find(match => 
        (match.away?.teamId === brettystar7?.id || match.home?.teamId === brettystar7?.id) &&
        match.matchupPeriodId === scoringPeriodId
      );
      
      const chorizoChanMatchup = league2Response.data.schedule.find(match => 
        (match.away?.teamId === chorizoChan?.id || match.home?.teamId === chorizoChan?.id) &&
        match.matchupPeriodId === scoringPeriodId
      );

      // Get current and projected scores
      const brettystar7Score = brettystar7Matchup ? 
        (brettystar7Matchup.home.teamId === brettystar7.id ? 
          brettystar7Matchup.home.totalPoints : brettystar7Matchup.away.totalPoints) : 0;
      
      const brettystar7Projected = brettystar7Matchup ?
        (brettystar7Matchup.home.teamId === brettystar7.id ?
          brettystar7Matchup.home.totalProjectedPoints : brettystar7Matchup.away.totalProjectedPoints) : 0;

      const chorizoChanScore = chorizoChanMatchup ?
        (chorizoChanMatchup.home.teamId === chorizoChan.id ? 
          chorizoChanMatchup.home.totalPoints : chorizoChanMatchup.away.totalPoints) : 0;

      const chorizoChanProjected = chorizoChanMatchup ?
        (chorizoChanMatchup.home.teamId === chorizoChan.id ?
          chorizoChanMatchup.home.totalProjectedPoints : chorizoChanMatchup.away.totalProjectedPoints) : 0;

      // Get rosters with player details including projections
      const getRosterWithDetails = (team, matchup) => {
        if (!team?.roster?.entries) return [];

        return team.roster.entries.map(entry => {
          const playerName = entry.playerPoolEntry?.player?.fullName || 'Unknown Player';
          const playerStats = entry.playerPoolEntry?.player?.stats || [];
          const matchupDifficulty = getMatchupDifficulty(entry.lineupSlotId, matchup?.away?.teamId);

          // Get actual points for current week
          const currentWeekStats = matchup?.home.rosterForCurrentScoringPeriod.entries
            .find(e => e.playerId === entry.playerId);
          
          const actualPoints = currentWeekStats?.playerPoolEntry?.appliedStatTotal || 0;

          // Calculate custom projection
          const customProjection = calculateCustomProjection(playerStats, matchupDifficulty);
          
          // Get ESPN's projection for comparison
          const espnProjection = currentWeekStats?.playerPoolEntry?.player?.stats?.find(
            s => s.scoringPeriodId === scoringPeriodId && s.statSourceId === 1
          )?.projectedPoints || 0;

          return {
            playerId: entry.playerId,
            playerName: playerName,
            position: entry.lineupSlotId,
            points: actualPoints,
            projectedPoints: customProjection,
            espnProjection: espnProjection, // Keep ESPN's projection for comparison
            status: entry.playerPoolEntry?.player?.injuryStatus || 'ACTIVE'
          };
        });
      };

      if (brettystar7 && chorizoChan) {
        const matchupData = {
          team1: {
            name: brettystar7.name,
            logo: brettystar7.logo,
            score: brettystar7Score,
            projectedScore: brettystar7Projected,
            roster: getRosterWithDetails(brettystar7, brettystar7Matchup)
          },
          team2: {
            name: chorizoChan.name,
            logo: chorizoChan.logo,
            score: chorizoChanScore,
            projectedScore: chorizoChanProjected,
            roster: getRosterWithDetails(chorizoChan, chorizoChanMatchup)
          }
        };
        setMatchupData(matchupData);
      }

      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching toilet bowl data:', error);
      setLoading(false);
    }
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

  const renderRoster = (roster) => {
    const sortedRoster = [...roster].sort((a, b) => {
      const orderA = getPositionOrder(a.position);
      const orderB = getPositionOrder(b.position);
      return orderA - orderB;
    });

    const starters = sortedRoster.filter(player => player.position !== 20 && player.position !== 21);
    const bench = sortedRoster.filter(player => player.position === 20 || player.position === 21);

    const renderPlayerRow = (player, isBench = false) => (
      <div className={`player-row ${isBench ? 'bench' : ''}`}>
        <div className="position">{getPositionName(player.position)}</div>
        <div className="player-name">{player.playerName || 'Unknown'}</div>
        <div className="player-score">
          {(player.points || 0).toFixed(1)}
        </div>
        <div className="player-projected">
          {(player.projectedPoints || 0).toFixed(1)}
          <span className="espn-projection">
            ({(player.espnProjection || 0).toFixed(1)})
          </span>
        </div>
      </div>
    );

    return (
      <>
        {starters.map((player, index) => renderPlayerRow(player, false))}
        
        {bench.length > 0 && (
          <>
            <div className="bench-divider">Bench</div>
            {bench.map((player, index) => renderPlayerRow(player, true))}
          </>
        )}
      </>
    );
  };

  useEffect(() => {
    fetchToiletBowlData();
    const interval = setInterval(fetchToiletBowlData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="toilet-bowl-loading">Loading Toilet Bowl...</div>;
  }

  const getWinningTeam = () => {
    if (!matchupData) return null;
    return matchupData.team1.score > matchupData.team2.score ? matchupData.team1 : matchupData.team2;
  };

  const getLosingTeam = () => {
    if (!matchupData) return null;
    return matchupData.team1.score <= matchupData.team2.score ? matchupData.team1 : matchupData.team2;
  };

  return (
    <div className="toilet-bowl-container">
      <h1 className="toilet-bowl-title">
        <FaToilet className="toilet-icon" />
        The Toilet Bowl
        <FaToilet className="toilet-icon" />
      </h1>

      <div className="matchup-container">
        <div className={`team-panel ${getWinningTeam() === matchupData?.team1 ? 'winning' : ''}`}>
          <div className="team-header">
            <img src={matchupData?.team1?.logo} alt="" className="team-logo" />
            <div className="team-info">
              <div className="team-name">{matchupData?.team1?.name || 'Loading...'}</div>
              <div className="team-score">
                {matchupData?.team1?.score?.toFixed(2) || '0.00'}
                <span className="projected-score">
                  (Proj: {matchupData?.team1?.projectedScore?.toFixed(2) || '0.00'})
                </span>
              </div>
            </div>
          </div>
          <div className="roster-list">
            {matchupData?.team1?.roster && renderRoster(matchupData.team1.roster)}
          </div>
        </div>

        <div className="vs-divider">VS</div>

        <div className={`team-panel ${getWinningTeam() === matchupData?.team2 ? 'winning' : ''}`}>
          <div className="team-header">
            <img src={matchupData?.team2?.logo} alt="" className="team-logo" />
            <div className="team-info">
              <div className="team-name">{matchupData?.team2?.name || 'Loading...'}</div>
              <div className="team-score">
                {matchupData?.team2?.score?.toFixed(2) || '0.00'}
                <span className="projected-score">
                  (Proj: {matchupData?.team2?.projectedScore?.toFixed(2) || '0.00'})
                </span>
              </div>
            </div>
          </div>
          <div className="roster-list">
            {matchupData?.team2?.roster && renderRoster(matchupData.team2.roster)}
          </div>
        </div>
      </div>

      <div className="last-updated">
        Last updated: {lastUpdated.toLocaleTimeString()}
      </div>
    </div>
  );
}

export default ToiletBowl; 