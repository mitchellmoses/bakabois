import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Avatar } from "primereact/avatar";
import axios from "axios";
import "./BoxScores.css";

function BoxScores(props) {
  const [leagueName, setLeagueName] = useState("");
  const [matchups, setMatchups] = useState([]);
  const [selectedMatchup, setSelectedMatchup] = useState(null);
  const [homeRoster, setHomeRoster] = useState([]);
  const [awayRoster, setAwayRoster] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const gamesPerPage = 3;
  const [h2hRecord, setH2hRecord] = useState("0-0");

  // Helper functions for position handling
  const getPositionName = (positionId) => {
    const positions = {
      1: "QB",
      2: "RB",
      3: "WR",
      4: "TE",
      5: "K",
      16: "D/ST"
    };
    return positions[positionId] || "FLEX";
  };

  const getPositionOrder = (position) => {
    const order = {
      "QB": 1,
      "RB": 2,
      "WR": 3,
      "TE": 4,
      "FLEX": 5,
      "D/ST": 6,
      "K": 7
    };
    return order[position] || 99;
  };

  // Format number helper
  const v = (num) => parseFloat(num).toFixed(1);

  useEffect(() => {
    const initializeBoxScores = async () => {
      await fetchMatchups();
      
      if (props.matchId && props.leagueID && matchups.length > 0) {
        const matchup = matchups.find(m => 
          m.id.toString() === props.matchId.toString() && 
          m.leagueId === props.leagueID
        );
        
        if (matchup) {
          setSelectedMatchup(matchup);
          fetchRosters(matchup);
          
          // Fetch head-to-head record
          const record = await getHeadToHeadRecord(
            matchup.home.team.id,
            matchup.away.team.id,
            matchup.leagueId
          );
          setH2hRecord(record);
        }
      }
    };

    initializeBoxScores();
  }, [props.matchupPeriodId]);

  useEffect(() => {
    if (props.matchId && props.leagueID && matchups.length > 0) {
      console.log("Props changed:", { matchId: props.matchId, leagueID: props.leagueID });
      findMatchupPage(props.matchId, props.leagueID);
    }
  }, [props.matchId, props.leagueID, matchups]);

  const fetchMatchups = async () => {
    try {
      const responses = await Promise.all([
        axios.get(getLeagueUrl(1446375)),
        axios.get(getLeagueUrl(1869404038))
      ]);

      const allMatchups = responses.flatMap((response, index) => {
        const leagueId = index === 0 ? 1446375 : 1869404038;
        return processLeagueMatchups(response.data, leagueId);
      });

      setMatchups(allMatchups);
      
      // If we have a specific matchup to show, select it
      if (props.matchId && props.leagueID) {
        const matchup = allMatchups.find(m => 
          m.id === props.matchId && m.leagueId === props.leagueID
        );
        if (matchup) {
          setSelectedMatchup(matchup);
          fetchRosters(matchup);
          
          // Fetch head-to-head record
          const record = await getHeadToHeadRecord(
            matchup.home.team.id,
            matchup.away.team.id,
            matchup.leagueId
          );
          setH2hRecord(record);
        }
      }
    } catch (error) {
      console.error("Error fetching matchups:", error);
    }
  };

  const getLeagueUrl = (leagueId) => {
    return `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/${leagueId}?scoringPeriodId=${props.matchupPeriodId}&view=mBoxscore&view=mMatchupScore&view=mRoster&view=mSettings&view=mTeam&view=modular&view=mNav`;
  };

  const processLeagueMatchups = (leagueData, leagueId) => {
    if (!leagueData?.teams || !leagueData?.schedule) {
      console.log('Missing required data for league:', leagueId);
      return [];
    }

    const teams = new Map(leagueData.teams.map(team => [team.id, team]));
    
    return leagueData.schedule
      .filter(match => {
        if (!match || !match.matchupPeriodId || !match.home || !match.away) {
          return false;
        }
        return match.matchupPeriodId.toString() === props.matchupPeriodId;
      })
      .map(match => {
        const homeTeam = teams.get(match.home.teamId);
        const awayTeam = teams.get(match.away.teamId);

        if (!homeTeam || !awayTeam) {
          console.log('Missing team data for matchup:', match.id);
          return null;
        }

        return {
          id: match.id,
          leagueId,
          home: {
            team: homeTeam,
            score: match.home.pointsByScoringPeriod?.[match.matchupPeriodId] || 0
          },
          away: {
            team: awayTeam,
            score: match.away.pointsByScoringPeriod?.[match.matchupPeriodId] || 0
          }
        };
      })
      .filter(Boolean);
  };

  const fetchRosters = async (matchup) => {
    try {
      console.log("Fetching rosters for matchup:", matchup); // Debug log
      const response = await axios.get(getLeagueUrl(matchup.leagueId));
      const match = response.data.schedule.find(m => m.id === matchup.id);
      
      if (match) {
        console.log("Found match:", match); // Debug log
        processRosters(match, response.data.teams);
      } else {
        console.log("Match not found"); // Debug log
      }
    } catch (error) {
      console.error("Error fetching rosters:", error);
    }
  };

  const processRosters = (match, teams) => {
    // Process home and away rosters
    const homeTeam = teams.find(t => t.id === match.home.teamId);
    const awayTeam = teams.find(t => t.id === match.away.teamId);

    setHomeRoster(processTeamRoster(match.home.rosterForCurrentScoringPeriod?.entries || [], homeTeam));
    setAwayRoster(processTeamRoster(match.away.rosterForCurrentScoringPeriod?.entries || [], awayTeam));
  };

  const processTeamRoster = (entries, team) => {
    return entries
      .filter(entry => {
        const validSlots = [0, 1, 2, 3, 4, 5, 6, 7, 8, 16, 17, 20, 23];
        return validSlots.includes(entry.lineupSlotId);
      })
      .map(entry => {
        const getDisplayPosition = (slotId, defaultPos) => {
          const slotPositions = {
            0: 'QB',
            2: 'RB',
            4: 'WR',
            6: 'TE',
            16: 'D/ST',
            17: 'K',
            20: 'BENCH',
            23: 'FLEX'
          };
          return slotPositions[slotId] || defaultPos;
        };

        return {
          position: getDisplayPosition(
            entry.lineupSlotId,
            getPositionName(entry.playerPoolEntry.player.defaultPositionId)
          ),
          name: entry.playerPoolEntry.player.fullName,
          actual: entry.playerPoolEntry.appliedStatTotal || 0
        };
      })
      .sort((a, b) => {
        const order = {
          'QB': 1,
          'RB': 2,
          'WR': 3,
          'TE': 4,
          'FLEX': 5,
          'D/ST': 6,
          'K': 7,
          'BENCH': 8
        };
        return (order[a.position] || 99) - (order[b.position] || 99);
      });
  };

  const handleMatchupSelect = async (matchup) => {
    console.log("Selected matchup:", matchup);
    setSelectedMatchup(matchup);
    fetchRosters(matchup);
    
    // Fetch head-to-head record
    const record = await getHeadToHeadRecord(
      matchup.home.team.id,
      matchup.away.team.id,
      matchup.leagueId
    );
    setH2hRecord(record);
  };

  const handlePageChange = (direction) => {
    if (direction === 'next' && (currentPage + 1) * gamesPerPage < matchups.length) {
      setCurrentPage(currentPage + 1);
    } else if (direction === 'prev' && currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Add this function to find the correct page for a matchup
  const findMatchupPage = (matchId, leagueId) => {
    console.log("Finding matchup:", { matchId, leagueId });
    console.log("Available matchups:", matchups);

    const matchIndex = matchups.findIndex(m => 
      m.id.toString() === matchId.toString() && 
      m.leagueId === leagueId
    );

    console.log("Found match index:", matchIndex);

    if (matchIndex !== -1) {
      const page = Math.floor(matchIndex / gamesPerPage);
      console.log("Setting to page:", page);
      setCurrentPage(page);
      
      const selectedMatch = matchups[matchIndex];
      console.log("Selected match:", selectedMatch);
      setSelectedMatchup(selectedMatch);
      fetchRosters(selectedMatch);
    }
  };

  // Add this function to get head-to-head record
  const getHeadToHeadRecord = async (team1Id, team2Id, leagueId) => {
    try {
      const response = await axios.get(getLeagueUrl(leagueId));
      const matches = response.data.schedule.filter(match => 
        (match.home.teamId === team1Id && match.away.teamId === team2Id) ||
        (match.home.teamId === team2Id && match.away.teamId === team1Id)
      );

      let team1Wins = 0;
      let team2Wins = 0;

      matches.forEach(match => {
        const team1IsHome = match.home.teamId === team1Id;
        const team1Score = team1IsHome ? match.home.totalPoints : match.away.totalPoints;
        const team2Score = team1IsHome ? match.away.totalPoints : match.home.totalPoints;

        if (team1Score > team2Score) team1Wins++;
        else if (team2Score > team1Score) team2Wins++;
      });

      return `${team1Wins}-${team2Wins}`;
    } catch (error) {
      console.error("Error fetching head-to-head record:", error);
      return "0-0";
    }
  };

  return (
    <div className="boxscores-wrapper">
      <div className="section-title-container">
        <h1 className="section-title">Box Scores</h1>
        <p className="section-subtitle">Week {props.matchupPeriodId} Matchups</p>
      </div>

      <div className="matchups-section">
        <div className="matchups-grid">
          {matchups
            .slice(currentPage * gamesPerPage, (currentPage + 1) * gamesPerPage)
            .map((match) => (
              <div 
                key={`${match.leagueId}-${match.id}`}
                className={`boxscore-card ${selectedMatchup?.id === match.id && selectedMatchup?.leagueId === match.leagueId ? 'current' : ''}`}
                onClick={() => handleMatchupSelect(match)}
              >
                <div className="boxscore-team-row">
                  <div className="boxscore-team-info">
                    <img src={match.home.team.logo} alt="" className="boxscore-team-logo" />
                    <span className="boxscore-team-name">{match.home.team.name}</span>
                  </div>
                  <div className="boxscore-scores">
                    <span className="boxscore-score actual">{v(match.home.score)}</span>
                  </div>
                </div>
                <div className="boxscore-team-row">
                  <div className="boxscore-team-info">
                    <img src={match.away.team.logo} alt="" className="boxscore-team-logo" />
                    <span className="boxscore-team-name">{match.away.team.name}</span>
                  </div>
                  <div className="boxscore-scores">
                    <span className="boxscore-score actual">{v(match.away.score)}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
        <div className="navigation-buttons">
          <button 
            className={`nav-button ${currentPage === 0 ? 'disabled' : ''}`}
            onClick={() => handlePageChange('prev')}
            disabled={currentPage === 0}
          >
            Previous
          </button>
          <span className="page-indicator">
            {currentPage + 1} of {Math.ceil(matchups.length / gamesPerPage)}
          </span>
          <button 
            className={`nav-button ${(currentPage + 1) * gamesPerPage >= matchups.length ? 'disabled' : ''}`}
            onClick={() => handlePageChange('next')}
            disabled={(currentPage + 1) * gamesPerPage >= matchups.length}
          >
            Next
          </button>
        </div>
      </div>

      {selectedMatchup && (
        <div className="teams-container">
          <div className="team-card">
            <div className="team-header">
              <div className="team-main-info">
                <img src={selectedMatchup.home.team.logo} alt="" className="team-avatar" />
                <div className="team-details">
                  <h3 className="team-name">{selectedMatchup.home.team.name}</h3>
                  <div className="team-record">{selectedMatchup.home.team.record?.overall?.summary || ''}</div>
                </div>
              </div>
              <div className="team-score-display">
                <div className="score-value">{v(selectedMatchup.home.score)}</div>
                <div className="score-label">POINTS</div>
              </div>
            </div>
            <div className="roster-section">
              <div className="roster-header">
                <div className="roster-header-pos">POS</div>
                <div className="roster-header-player">PLAYER</div>
                <div className="roster-header-points">PTS</div>
              </div>
              {homeRoster.map((player, index) => (
                <div key={index} className={`roster-row ${player.position === 'BENCH' ? 'bench-row' : ''}`}>
                  {player.position === 'BENCH' && index > 0 && homeRoster[index - 1].position !== 'BENCH' && (
                    <div className="bench-divider">BENCH</div>
                  )}
                  <div className="roster-pos">{player.position}</div>
                  <div className="roster-player">{player.name}</div>
                  <div className="roster-points">{v(player.actual)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="matchup-vs">VS</div>

          <div className="team-card">
            <div className="team-header">
              <div className="team-main-info">
                <img src={selectedMatchup.away.team.logo} alt="" className="team-avatar" />
                <div className="team-details">
                  <h3 className="team-name">{selectedMatchup.away.team.name}</h3>
                  <div className="team-record">{selectedMatchup.away.team.record?.overall?.summary || ''}</div>
                </div>
              </div>
              <div className="team-score-display">
                <div className="score-value">{v(selectedMatchup.away.score)}</div>
                <div className="score-label">POINTS</div>
              </div>
            </div>
            <div className="roster-section">
              <div className="roster-header">
                <div className="roster-header-pos">POS</div>
                <div className="roster-header-player">PLAYER</div>
                <div className="roster-header-points">PTS</div>
              </div>
              {awayRoster.map((player, index) => (
                <div key={index} className={`roster-row ${player.position === 'BENCH' ? 'bench-row' : ''}`}>
                  {player.position === 'BENCH' && index > 0 && awayRoster[index - 1].position !== 'BENCH' && (
                    <div className="bench-divider">BENCH</div>
                  )}
                  <div className="roster-pos">{player.position}</div>
                  <div className="roster-player">{player.name}</div>
                  <div className="roster-points">{v(player.actual)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BoxScores;
