import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CommissionerBowl.css';
import { FaCrown, FaTrophy, FaBolt, FaFire, FaSync } from 'react-icons/fa';
import { GiTrophy } from 'react-icons/gi';

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

function CommissionerBowl() {
  const [matchupData, setMatchupData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const fetchCommissionerBowlData = async () => {
    try {
      const scoringPeriodId = 15; // Playoff Round 2
      
      // Get both leagues' data
      const [league1Response, league2Response] = await Promise.all([
        axios.get(`https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/1446375?view=mMatchup&view=mMatchupScore&view=mRoster&view=mTeam&view=mProjectedScore&scoringPeriodId=${scoringPeriodId}`),
        axios.get(`https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/1869404038?view=mMatchup&view=mMatchupScore&view=mRoster&view=mTeam&view=mProjectedScore&scoringPeriodId=${scoringPeriodId}`)
      ]);

      // Log all team names to debug
      console.log('League 1 teams:', league1Response.data.teams.map(t => t.name));
      console.log('League 2 teams:', league2Response.data.teams.map(t => t.name));

      // Find b00fy and john's teams with exact team IDs
      const b00fy = league2Response.data.teams.find(team => team.id === 1); // Replace with actual team ID
      const john = league1Response.data.teams.find(team => team.id === 1);  // Replace with actual team ID

      console.log('Found teams:', { b00fy, john });

      // Get their current matchups
      const b00fyMatchup = b00fy && league2Response.data.schedule.find(match => 
        (match.away?.teamId === b00fy.id || match.home?.teamId === b00fy.id) &&
        match.matchupPeriodId === scoringPeriodId
      );
      
      const johnMatchup = john && league1Response.data.schedule.find(match => 
        (match.away?.teamId === john.id || match.home?.teamId === john.id) &&
        match.matchupPeriodId === scoringPeriodId
      );

      console.log('Found matchups:', { b00fyMatchup, johnMatchup }); // Debug log

      const getRosterWithDetails = (team, matchup) => {
        if (!team?.roster?.entries) return [];

        return team.roster.entries.map(entry => {
          const playerName = entry.playerPoolEntry?.player?.fullName || 'Unknown Player';
          const currentWeekStats = matchup?.home.rosterForCurrentScoringPeriod.entries
            .find(e => e.playerId === entry.playerId);
          
          const actualPoints = currentWeekStats?.playerPoolEntry?.appliedStatTotal || 0;

          return {
            playerId: entry.playerId,
            playerName: playerName,
            position: entry.lineupSlotId,
            points: actualPoints,
            status: entry.playerPoolEntry?.player?.injuryStatus || 'ACTIVE'
          };
        });
      };

      if (b00fy && john) {
        const team1Roster = getRosterWithDetails(john, johnMatchup);
        const team2Roster = getRosterWithDetails(b00fy, b00fyMatchup);
        
        const matchupData = {
          team1: {
            name: john.name,
            logo: john.logo,
            score: calculateTeamScore(team1Roster),
            roster: team1Roster
          },
          team2: {
            name: b00fy.name,
            logo: b00fy.logo,
            score: calculateTeamScore(team2Roster),
            roster: team2Roster
          }
        };
        setMatchupData(matchupData);
      }

      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching commissioner bowl data:', error);
      setLoading(false);
    }
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
      <div 
        key={`${player.playerId}-${player.position}`} 
        className={`player-row ${isBench ? 'bench' : ''}`}
      >
        <div className="position">{getPositionName(player.position)}</div>
        <div className="player-name">{player.playerName || 'Unknown'}</div>
        <div className="player-score">
          {(player.points || 0).toFixed(1)}
        </div>
      </div>
    );

    return (
      <>
        {starters.map((player) => renderPlayerRow(player, false))}
        
        {bench.length > 0 && (
          <>
            <div className="bench-divider" key="bench-divider">Bench</div>
            {bench.map((player) => renderPlayerRow(player, true))}
          </>
        )}
      </>
    );
  };

  useEffect(() => {
    fetchCommissionerBowlData();
    const interval = setInterval(fetchCommissionerBowlData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="commissioner-loading">
        <FaTrophy className="loading-trophy" />
        <div className="loading-text">Loading Commissioner Bowl...</div>
      </div>
    );
  }

  const getWinningTeam = () => {
    if (!matchupData) return null;
    return matchupData.team1.score > matchupData.team2.score ? matchupData.team1 : matchupData.team2;
  };

  return (
    <div className="commissioner-bowl-container">
      <h1 className="commissioner-bowl-title">
        <FaCrown className="crown-icon" />
        The Commissioner Bowl
        <FaCrown className="crown-icon" />
      </h1>
      <div className="commissioner-subtitle">
        The Cope Bowl
      </div>

      <div className="matchup-container">
        <div className="team-panel">
          <div className="team-header">
            <img src={matchupData?.team1?.logo} alt="" className="team-logo" />
            <div className="team-info">
              <div className="team-name">
                {matchupData?.team1?.name || 'Loading...'}
              </div>
              <div className="team-score">
                {matchupData?.team1?.score?.toFixed(2) || '0.00'}
              </div>
            </div>
          </div>
          <div className="roster-list">
            {matchupData?.team1?.roster && renderRoster(matchupData.team1.roster)}
          </div>
        </div>

        <div className="vs-divider">VS</div>

        <div className="team-panel">
          <div className="team-header">
            <img src={matchupData?.team2?.logo} alt="" className="team-logo" />
            <div className="team-info">
              <div className="team-name">
                {matchupData?.team2?.name || 'Loading...'}
              </div>
              <div className="team-score">
                {matchupData?.team2?.score?.toFixed(2) || '0.00'}
              </div>
            </div>
          </div>
          <div className="roster-list">
            {matchupData?.team2?.roster && renderRoster(matchupData.team2.roster)}
          </div>
        </div>
      </div>

      <div className="last-updated">
        <FaSync className="update-icon" />
        Last updated: {lastUpdated.toLocaleTimeString()}
      </div>
    </div>
  );
}

export default CommissionerBowl; 