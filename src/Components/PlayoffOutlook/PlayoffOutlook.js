import React, { useState, useEffect, useRef } from "react";
import { Card } from "primereact/card";
import axios from "axios";
import "./PlayoffOutlook.css";
import { Toast } from 'primereact/toast';
import { FaTrophy, FaToilet } from 'react-icons/fa';
import Confetti from 'react-confetti';

const validateImageUrl = (url) => {
  if (!url) return 'https://g.espncdn.com/lm-static/ffl/images/ffl-shield-shield.svg';
  
  // Check if URL ends with an image extension
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.svg'];
  const hasImageExtension = imageExtensions.some(ext => 
    url.toLowerCase().endsWith(ext)
  );
  
  return hasImageExtension ? url : 'https://g.espncdn.com/lm-static/ffl/images/ffl-shield-shield.svg';
};

const calculateShitBowlChances = (teams) => {
  // Check if teams is undefined or empty
  if (!teams || !Array.isArray(teams) || teams.length === 0) {
    return [];
  }

  // Filter out any undefined teams and ensure required properties exist
  const validTeams = teams.filter(team => 
    team && 
    typeof team.wins === 'number' && 
    typeof team.losses === 'number' && 
    typeof team.pointsFor === 'number'
  );

  if (validTeams.length === 0) {
    return [];
  }

  // Sort teams by wins (ascending) and then by points for (ascending)
  const sortedTeams = [...validTeams].sort((a, b) => {
    if (a.wins === b.wins) {
      return a.pointsFor - b.pointsFor;
    }
    return a.wins - b.wins;
  });

  // Get actual last place team
  const lastPlace = sortedTeams[0];
  const gamesRemaining = lastPlace ? 13 - (lastPlace.wins + lastPlace.losses) : 0;

  return sortedTeams.map((team, index) => {
    if (!team) return null;

    let shitBowlChance = 0;
    const gamesBack = team.wins - lastPlace.wins;
    const isLastPlace = index === 0;

    // Calculate toilet bowl chances
    if (isLastPlace) {
      shitBowlChance = 0.90;
    } else if (index === 1) {
      shitBowlChance = gamesBack <= 1 ? 0.60 : 0.40;
    } else if (index === 2) {
      shitBowlChance = gamesBack <= 2 ? 0.30 : 0.15;
    } else if (index === 3 && team.wins <= lastPlace.wins + 2) {
      shitBowlChance = 0.10;
    }

    // Adjust chances based on remaining games
    if (gamesRemaining <= 3) {
      if (isLastPlace) {
        shitBowlChance = 0.95;
      } else if (gamesBack > 1) {
        shitBowlChance = 0;
      }
    }

    return {
      ...team,
      shitBowlChance,
      gamesBack,
      gamesRemaining,
      isLastPlace,
      currentRank: index + 1
    };
  }).filter(team => team && team.shitBowlChance > 0);
};

function PlayoffOutlook() {
  const [league1Teams, setLeague1Teams] = useState([]);
  const [league2Teams, setLeague2Teams] = useState([]);
  const toast = useRef(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPosition, setConfettiPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Fetch League 1 data (ID: 1446375)
    axios.get(`https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/1446375?view=mLiveScoring&view=mMatchupScore&view=mRoster&view=mSettings&view=mStandings&view=mStatus&view=mTeam&view=modular&view=mNav`)
      .then((response) => {
        const result = response.data;
        const teams = result.teams.map(team => {
          let managerName = "";
          if (result.members && team.owners) {
            result.members.forEach((member) => {
              team.owners.forEach((owner) => {
                if (member.id === owner) {
                  if (managerName) managerName += ", ";
                  managerName += `${member.firstName} ${member.lastName}`;
                }
              });
            });
          }
          
          return {
            id: team.id,
            name: team.name || 'Unknown Team',
            logo: team.logo || 'https://g.espncdn.com/lm-static/ffl/images/ffl-shield-shield.svg',
            playoffSeed: team.playoffSeed || 0,
            wins: team.record?.overall?.wins || 0,
            losses: team.record?.overall?.losses || 0,
            pointsFor: team.record?.overall?.pointsFor || 0,
            manager: managerName || 'None',
            playoffPct: team.currentSimulationResults?.playoffPct || 0,
            projectedRank: team.currentProjectedRank || 0
          };
        })
        .sort((a, b) => b.playoffPct - a.playoffPct);
        
        setLeague1Teams(teams);
      });

    // Fetch League 2 data (ID: 1869404038)
    axios.get(`https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/1869404038?view=mLiveScoring&view=mMatchupScore&view=mRoster&view=mSettings&view=mStandings&view=mStatus&view=mTeam&view=modular&view=mNav`)
      .then((response) => {
        const result = response.data;
        const teams = result.teams.map(team => {
          let managerName = "";
          if (result.members && team.owners) {
            result.members.forEach((member) => {
              team.owners.forEach((owner) => {
                if (member.id === owner) {
                  if (managerName) managerName += ", ";
                  managerName += `${member.firstName} ${member.lastName}`;
                }
              });
            });
          }
          
          return {
            id: team.id,
            name: team.name || 'Unknown Team',
            logo: team.logo || 'https://g.espncdn.com/lm-static/ffl/images/ffl-shield-shield.svg',
            playoffSeed: team.playoffSeed || 0,
            wins: team.record?.overall?.wins || 0,
            losses: team.record?.overall?.losses || 0,
            pointsFor: team.record?.overall?.pointsFor || 0,
            manager: managerName || 'None',
            playoffPct: team.currentSimulationResults?.playoffPct || 0,
            projectedRank: team.currentProjectedRank || 0
          };
        })
        .sort((a, b) => a.projectedRank - b.projectedRank);
        
        setLeague2Teams(teams);
      });
  }, []);

  const handleEliminatedClick = (team) => {
    toast.current.show({
      severity: 'warn',
      summary: '💩 Ewww Stinky!',
      detail: `${team.name} has been eliminated from playoff contention`,
      life: 3000,
      style: { 
        background: '#fafafa',
        border: '2px solid #d32f2f',
      }
    });
  };

  const handleClinchClick = (team, event) => {
    const cardRect = event.currentTarget.getBoundingClientRect();
    setConfettiPosition({
      x: cardRect.left + cardRect.width / 2,
      y: cardRect.top + cardRect.height / 2,
      width: cardRect.width,
      height: cardRect.height
    });
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const calculateH2HRecord = (team, allTeams) => {
    const playoffTeams = allTeams.filter(t => t.playoffPct >= 0.5 && t.id !== team.id);
    // This would need to be calculated from actual matchup data in the API
    return {
      wins: 0,  // Replace with actual calculation
      losses: 0 // Replace with actual calculation
    };
  };

  const getScheduleStrength = (team) => {
    const strengthScore = team.pointsFor / (team.wins + team.losses);
    if (strengthScore > 120) return 'hard';
    if (strengthScore > 100) return 'medium';
    return 'easy';
  };

  const getClinchScenario = (team) => {
    if (team.playoffPct >= 0.99) return null;
    if (team.playoffPct >= 0.75) {
      return "Win next week to clinch";
    }
    return null;
  };

  const renderPlayoffStatus = (leagueTeams, leagueName) => {
    const playoffTeams = leagueTeams.filter(team => team.playoffPct >= 0.005);
    const eliminated = leagueTeams.filter(team => team.playoffPct < 0.005);

    return (
      <div className="playoff-status-section">
        <div className="league-header">
          <div className="league-header-content">
            <h4>
              {leagueName} Playoff Picture
            </h4>
          </div>
          <FaTrophy className="league-header-icon" />
          <div className="league-header-decoration"></div>
        </div>

        <div className="playoff-teams">
          {playoffTeams.map((team) => {
            const h2hRecord = calculateH2HRecord(team, leagueTeams);
            const scheduleStrength = getScheduleStrength(team);
            const clinchScenario = getClinchScenario(team);

            return (
              <Card 
                key={team.id} 
                className={`team-card ${team.playoffPct >= 0.99 ? 'clinched-card' : ''}`}
                onClick={(e) => team.playoffPct >= 0.99 && handleClinchClick(team, e)}
              >
                <div className="team-info">
                  <img src={validateImageUrl(team.logo)} alt="" className="team-logo" />
                  <div className="team-details">
                    <span className="name">{team.name}</span>
                    <span className="record">({team.wins}-{team.losses})</span>
                    <div className="playoff-stats">
                      <span className="seed">#{team.projectedRank}</span>
                      <span 
                        className={`playoff-chance ${team.playoffPct >= 0.99 ? 'clinch-status' : ''}`}
                        style={{
                          background: getPlayoffChanceColor(team.playoffPct),
                          boxShadow: team.playoffPct >= 0.99 ? '0 0 10px rgba(46, 125, 50, 0.5)' : 'none'
                        }}
                      >
                        {team.playoffPct >= 0.99 
                          ? '🏆 CLINCHED' 
                          : `${(team.playoffPct * 100).toFixed(1)}%`}
                      </span>
                    </div>
                  </div>
                  <div className="playoff-probability-meter">
                    <div 
                      className={`probability-fill probability-${
                        team.playoffPct >= 0.75 ? 'high' :
                        team.playoffPct >= 0.50 ? 'medium' : 'low'
                      }`}
                      style={{"--probability-width": `${team.playoffPct * 100}%`}}
                    />
                  </div>
                  <div className="h2h-record">
                    <span className="h2h-record-wins">{h2hRecord.wins}W</span>
                    -
                    <span className="h2h-record-losses">{h2hRecord.losses}L</span>
                    <span>vs playoff teams</span>
                  </div>
                  <div className={`strength-indicator sos-${scheduleStrength}`}>
                    {scheduleStrength.toUpperCase()} SOS
                  </div>
                  {clinchScenario && (
                    <div className="clinch-scenario">
                      {clinchScenario}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {eliminated.length > 0 && (
          <div className="shame-section">
            <div className="section-header">
              <h4>
                <i className="pi pi-times-circle" style={{ color: '#d32f2f' }}></i>
                Eliminated
              </h4>
            </div>
            <div className="shame-teams">
              {eliminated.map(team => (
                <Card 
                  key={team.id} 
                  className="team-card shame-card"
                  onClick={() => handleEliminatedClick(team)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="team-info">
                    <img 
                      src={validateImageUrl(team.logo)} 
                      alt="" 
                      className="team-logo"
                      style={{ filter: 'grayscale(100%)' }}
                    />
                    <div className="team-details">
                      <span className="name" style={{ textDecoration: 'line-through' }}>
                        {team.name}
                      </span>
                      <span className="record">({team.wins}-{team.losses})</span>
                      <div className="playoff-stats">
                        <span className="eliminated-status">ELIMINATED</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const getPlayoffChanceColor = (percentage) => {
    if (percentage >= 0.99) return '#2e7d32';
    if (percentage >= 0.75) return '#1976d2';
    if (percentage >= 0.50) return '#ed6c02';
    if (percentage >= 0.25) return '#f57c00';
    return '#d32f2f';
  };

  const renderShitBowlSection = (league1Teams, league2Teams) => {
    // Sort both leagues by wins/points to get true standings
    const sortedLeague1 = [...league1Teams].sort((a, b) => {
      if (a.wins === b.wins) return a.pointsFor - b.pointsFor;
      return a.wins - b.wins;
    });

    const sortedLeague2 = [...league2Teams].sort((a, b) => {
      if (a.wins === b.wins) return a.pointsFor - b.pointsFor;
      return a.wins - b.wins;
    });

    const lastPlaceLeague1 = sortedLeague1[0];
    const lastPlaceLeague2 = sortedLeague2[0];

    // Calculate contenders for each league
    const league1Contenders = calculateShitBowlChances(league1Teams)
      .filter(team => team?.shitBowlChance > 0)
      .sort((a, b) => (b?.shitBowlChance || 0) - (a?.shitBowlChance || 0));

    const league2Contenders = calculateShitBowlChances(league2Teams)
      .filter(team => team?.shitBowlChance > 0)
      .sort((a, b) => (b?.shitBowlChance || 0) - (a?.shitBowlChance || 0));

    return (
      <div className="shit-bowl-section">
        <div className="section-header">
          <h4>
            <FaToilet className="toilet-icon" />
            The Toilet Bowl Championship
          </h4>
        </div>
        
        <div className="toilet-bowl-container">
          {/* League A Contenders */}
          <div className="toilet-league">
            <h5>League A Contenders</h5>
            <div className="toilet-contenders">
              {league1Contenders.map(team => (
                <Card key={team.id} className="contender-card">
                  <div className="team-info">
                    <img src={validateImageUrl(team.logo)} alt="" className="team-logo" />
                    <div className="contender-info">
                      <div className="contender-header">
                        <span className="name">{team.name}</span>
                        <span className="record">({team.wins}-{team.losses})</span>
                      </div>
                      <div className="toilet-details">
                        <div className="status-indicator">
                          {team.isLastPlace ? (
                            <span className="current-status">Currently in Toilet Bowl</span>
                          ) : (
                            <span className="games-back">
                              {team.gamesBack === 0 ? 'Tied for Last' : 
                               `${team.gamesBack} ${team.gamesBack === 1 ? 'Game' : 'Games'} from Last`}
                            </span>
                          )}
                        </div>
                        <div className="remaining-games">
                          {team.gamesRemaining} {team.gamesRemaining === 1 ? 'Game' : 'Games'} Left
                        </div>
                      </div>
                      <div className="toilet-progress">
                        <div 
                          className="toilet-progress-fill"
                          style={{ width: `${team.shitBowlChance * 100}%` }}
                        >
                          <div className="bubbles">
                            <div className="bubble"></div>
                            <div className="bubble"></div>
                            <div className="bubble"></div>
                          </div>
                        </div>
                        <span className="toilet-percentage">
                          {(team.shitBowlChance * 100).toFixed(1)}% Toilet Bowl Chance
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Current Matchup */}
          <div className="toilet-bowl-matchup">
            <h5>Current Toilet Bowl Matchup</h5>
            <div className="matchup-display">
              <div className="toilet-team">
                <img src={validateImageUrl(lastPlaceLeague1?.logo)} alt="" className="team-logo" />
                <span className="name">{lastPlaceLeague1?.name || 'TBD'}</span>
                <span className="record">
                  ({lastPlaceLeague1?.wins || 0}-{lastPlaceLeague1?.losses || 0})
                </span>
              </div>
              <div className="vs-container">
                <FaToilet className="toilet-icon mega-spin" />
                <span className="vs-text">VS</span>
              </div>
              <div className="toilet-team">
                <img src={validateImageUrl(lastPlaceLeague2?.logo)} alt="" className="team-logo" />
                <span className="name">{lastPlaceLeague2?.name || 'TBD'}</span>
                <span className="record">
                  ({lastPlaceLeague2?.wins || 0}-{lastPlaceLeague2?.losses || 0})
                </span>
              </div>
            </div>
          </div>

          {/* League B Contenders */}
          <div className="toilet-league">
            <h5>League B Contenders</h5>
            <div className="toilet-contenders">
              {league2Contenders.map(team => (
                <Card key={team.id} className="contender-card">
                  <div className="team-info">
                    <img src={validateImageUrl(team.logo)} alt="" className="team-logo" />
                    <div className="contender-info">
                      <div className="contender-header">
                        <span className="name">{team.name}</span>
                        <span className="record">({team.wins}-{team.losses})</span>
                      </div>
                      <div className="toilet-details">
                        <div className="status-indicator">
                          {team.isLastPlace ? (
                            <span className="current-status">Currently in Toilet Bowl</span>
                          ) : (
                            <span className="games-back">
                              {team.gamesBack === 0 ? 'Tied for Last' : 
                               `${team.gamesBack} ${team.gamesBack === 1 ? 'Game' : 'Games'} from Last`}
                            </span>
                          )}
                        </div>
                        <div className="remaining-games">
                          {team.gamesRemaining} {team.gamesRemaining === 1 ? 'Game' : 'Games'} Left
                        </div>
                      </div>
                      <div className="toilet-progress">
                        <div 
                          className="toilet-progress-fill"
                          style={{ width: `${team.shitBowlChance * 100}%` }}
                        >
                          <div className="bubbles">
                            <div className="bubble"></div>
                            <div className="bubble"></div>
                            <div className="bubble"></div>
                          </div>
                        </div>
                        <span className="toilet-percentage">
                          {(team.shitBowlChance * 100).toFixed(1)}% Toilet Bowl Chance
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="playoff-outlook-container">
      <Toast ref={toast} />
      <div className="playoff-content">
        <div className="playoff-title-container">
          <div className="playoff-title-background"></div>
          <div className="playoff-decorations">
            <div className="decoration"></div>
            <div className="decoration"></div>
            <div className="decoration"></div>
            <div className="decoration"></div>
          </div>
          <h1 className="playoff-title">Playoff Picture</h1>
          <div className="trophy-container">
            <div className="trophy-ring"></div>
            <div className="sparkle"></div>
            <div className="sparkle"></div>
            <div className="sparkle"></div>
            <FaTrophy className="trophy-icon" />
          </div>
          <p className="playoff-subtitle">
            The Road to Championship Glory
          </p>
        </div>
        
        {renderPlayoffStatus(league1Teams, 'League A')}
        {renderPlayoffStatus(league2Teams, 'League B')}
        {renderShitBowlSection(league1Teams, league2Teams)}
      </div>
      
      {showConfetti && (
        <Confetti
          numberOfPieces={150}
          recycle={false}
          confettiSource={confettiPosition}
          style={{
            position: 'fixed',
            pointerEvents: 'none',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0
          }}
        />
      )}
    </div>
  );
}

export default PlayoffOutlook; 