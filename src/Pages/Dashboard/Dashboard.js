import React, { useState, useEffect, useRef } from "react";
import Leaderboard from "../../Components/Leaderboard/Leaderboard";
import Scoreboard from "../../Components/Scoreboard/Scoreboard";
import BoxScores from "../../Components/BoxScores/BoxScores";
import { Dropdown } from "primereact/dropdown";
import { TabView, TabPanel } from "primereact/tabview";
import { SplitButton } from "primereact/splitbutton";
import "./Dashboard.css";
import logo from "../../assets/image/logo.png";
import img_o338 from "../../assets/image/IMG_0388.png";
import bkImage2 from "../../assets/image/image2.jpeg";
import axios from "axios";
import loserImage from "../../assets/image/evan.png";
import TotalPoints from "../../Components/TotalPoints/TotalPoints";
import Classics from '../../Components/Classics/Classics';
import img_3690 from "../../assets/image/IMG_3690.jpg";
import PlayoffOutlook from '../../Components/PlayoffOutlook/PlayoffOutlook';
import { FaTrophy, FaToilet } from 'react-icons/fa';
import ToiletBowl from '../../Components/ToiletBowl/ToiletBowl';
import CommissionerBowl from '../../Components/CommissionerBowl/CommissionerBowl';
import Headlines from '../../Components/Headlines/Headlines';
import ChampionshipRace from '../../Components/ChampionshipRace/ChampionshipRace';
import Championship from '../../Components/Championship/Championship';
import { useLocation } from "react-router-dom";
import PastChampions from '../../Components/PastChampions/PastChampions';

function Dashboard() {
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [leagueType, setLeagueType] = useState("league1");
  const [leagueID, setLeagueID] = useState(1446375);
  const [leagueTypeScoreboard, setLeagueTypeScoreboard] = useState("overall");
  const [leagueTypeLeaderboard, setLeagueTypeLeaderboard] = useState("Overall");
  const [matchupPeriodId, setMatchupPeriodId] = useState("NFL WEEK 1");
  const [matchups, setMatchups] = useState([]);
  const [matchId, setMatchId] = useState(1);
  const [liveMatchup, setLiveMatchup] = useState("");
  const [value, setValue] = useState(0);
  const [highestScorer, setHighestScorer] = useState(null);
  const [lowestScorer, setLowestScorer] = useState(null);
  const [highestPlayer, setHighestPlayer] = useState(null);
  const [closestMatchup, setClosestMatchup] = useState(null);
  const [biggestBlowout, setBiggestBlowout] = useState(null);
  const [championshipTeams, setChampionshipTeams] = useState({
    gay: {
      name: "Gay",
      score: 0,
      projected: 132.2
    },
    theBeast: {
      name: "The Beast",
      score: 0,
      projected: 119.2
    }
  });

  const getBoxScoreTabIndex = () => {
    const tabHeaders = [
      "Home", "Championship", "Past Champions", "Championship Race", "Leaderboard", "Scoreboard", 
      "Box Score", "Total Points", "Playoff Outlook", "Toilet Bowl", 
      "Commissioner Bowl", "Classics"
    ];
    return tabHeaders.indexOf("Box Score");
  };

  const getLiveMatchup = () => {
    axios
      .get("https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/1446375?view=modular&view=mNav&view=mMatchupScore&view=mScoreboard&view=mSettings&view=mTopPerformers&view=mTeam", {})
      .then((response) => {
        if (response.data && response.data.scoringPeriodId) {
          const week = `NFL WEEK ${response.data.scoringPeriodId}`;
          setLiveMatchup(week);
          setMatchupPeriodId(week);
        }
      })
      .catch((error) => {
        console.error("Error fetching live matchup:", error);
        setLiveMatchup("NFL WEEK 1");
        setMatchupPeriodId("NFL WEEK 1");
      });
  }

  useEffect(() => {
    if (activeIndex === 2 && matchups.length === 0) {
      for (var i = 1; i <= 13; ++i) {
        matchups.push("NFL WEEK " + i);
      }
    }
    if(activeIndex !== 3)
      getLiveMatchup();
    
  }, [activeIndex]);

  useEffect(() => {
    // Handle navigation from ChampionshipRace
    if (location.state?.showScoreboard) {
      const { leagueId, teamId, scoringPeriodId } = location.state;
      setMatchupPeriodId(`NFL WEEK ${scoringPeriodId}`);
      setLeagueTypeScoreboard(leagueId === '1446375' ? 'league1' : 'league2');
      setActiveIndex(3); // Scoreboard tab index
    }
  }, [location]);

  const tabLeagueTemplate = (options) => {
    const items = [
      {
        label: "League 1",
        icon: "pi pi-prime",
        command: () => {
          setActiveIndex(1);
          setLeagueType("league1");
        },
      },
      {
        label: "League 2",
        icon: "pi pi-reddit",
        command: () => {
          setActiveIndex(1);
          setLeagueType("league2");
        },
      },
      {
        label: "Overall",
        icon: "pi pi-slack",
        command: () => {
          setActiveIndex(1);
          setLeagueType("overall");
        },
      },
    ];

    return (
      <SplitButton
        label="Leaderboard"
        icon="pi pi-sitemap"
        onClick={options.onClick}
        className={`px-2 li${activeIndex}`}
        model={items}
      ></SplitButton>
    );
  };

  const tabScoreboardTemplate = (options) => {
    const items = [
      {
        label: "League 1",
        icon: "pi pi-prime",
        command: () => {
          setActiveIndex(2);
          setLeagueTypeScoreboard("league1");
        },
      },
      {
        label: "League 2",
        icon: "pi pi-reddit",
        command: () => {
          setActiveIndex(2);
          setLeagueTypeScoreboard("league2");
        },
      },
      {
        label: "Overall",
        icon: "pi pi-slack",
        command: () => {
          setActiveIndex(2);
          setLeagueTypeScoreboard("overall");
        },
      },
    ];

    return (
      <SplitButton
        label="Scoreboard"
        icon="pi pi-star-fill"
        onClick={options.onClick}
        className={`px-2 li${activeIndex}`}
        model={items}
      ></SplitButton>
    );
  };

  const onLogoClick = () => {
    setActiveIndex(0);
  };

  const showBoxScore = (leagueId, matchId) => {
    setLeagueID(leagueId);
    setMatchId(matchId);
    setActiveIndex(getBoxScoreTabIndex());
  };

  const showBoxScores = (_leagueID, _matchId, _value) => {
    console.log("Showing box scores with:", { _leagueID, _matchId, _value });
    if (_leagueID && _matchId) {
      setLeagueID(_leagueID);
      setMatchId(_matchId);
      if (_value !== undefined) {
        setValue(_value);
      }
    }
  };

  const fetchHighestScorer = async () => {
    try {
      const league1Id = 1446375;
      const league2Id = 1869404038;
      const [league1Response, league2Response] = await Promise.all([
        axios.get(`https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/${league1Id}?view=modular&view=mNav&view=mMatchupScore&view=mScoreboard&view=mSettings&view=mTopPerformers&view=mTeam`),
        axios.get(`https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/${league2Id}?view=modular&view=mNav&view=mMatchupScore&view=mScoreboard&view=mSettings&view=mTopPerformers&view=mTeam`)
      ]);

      const currentScoringPeriod = league1Response.data.scoringPeriodId;
      const weekToShow = currentScoringPeriod > 1 ? currentScoringPeriod - 1 : 1;

      let highestScore = 0;
      let highestScoringTeam = null;
      let highestScoringLeague = null;

      const getOwnerName = (ownerId, members) => {
        const member = members.find(m => m.id === ownerId);
        return member ? `${member.firstName} ${member.lastName}` : 'Unknown Owner';
      };

      const processLeague = (leagueData, leagueId) => {
        leagueData.schedule.forEach(matchup => {
          if (matchup.matchupPeriodId === weekToShow) {
            const homeScore = matchup.home.totalPoints;
            const awayScore = matchup.away ? matchup.away.totalPoints : 0;

            if (homeScore > highestScore) {
              highestScore = homeScore;
              highestScoringTeam = leagueData.teams.find(team => team.id === matchup.home.teamId);
              highestScoringLeague = leagueData.settings.name || `League ${leagueId}`;
            }

            if (awayScore > highestScore) {
              highestScore = awayScore;
              highestScoringTeam = leagueData.teams.find(team => team.id === matchup.away.teamId);
              highestScoringLeague = leagueData.settings.name || `League ${leagueId}`;
            }
          }
        });
      };

      processLeague(league1Response.data, league1Id);
      processLeague(league2Response.data, league2Id);

      const ownerName = getOwnerName(highestScoringTeam.primaryOwner, 
        highestScoringLeague === league1Response.data.settings.name ? league1Response.data.members : league2Response.data.members);

      setHighestScorer({
        name: highestScoringTeam.name,
        logo: highestScoringTeam.logo,
        score: highestScore.toFixed(1),
        leagueName: highestScoringLeague,
        ownerName: ownerName,
        week: weekToShow
      });
    } catch (error) {
      console.error("Error fetching highest scorer:", error);
      setHighestScorer({
        name: 'Unknown Team',
        logo: '',
        score: '0.0',
        leagueName: 'Unknown League',
        ownerName: 'Unknown Owner',
        week: 0
      });
    }
  };

  const fetchLowestScorer = async () => {
    try {
      const league1Id = 1446375;
      const league2Id = 1869404038;
      const [league1Response, league2Response] = await Promise.all([
        axios.get(`https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/${league1Id}?view=modular&view=mNav&view=mMatchupScore&view=mScoreboard&view=mSettings&view=mTopPerformers&view=mTeam`),
        axios.get(`https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/${league2Id}?view=modular&view=mNav&view=mMatchupScore&view=mScoreboard&view=mSettings&view=mTopPerformers&view=mTeam`)
      ]);

      const currentScoringPeriod = league1Response.data.scoringPeriodId;
      const weekToShow = currentScoringPeriod > 1 ? currentScoringPeriod - 1 : 1;

      let lowestScore = Infinity;
      let lowestScoringTeam = null;
      let lowestScoringLeague = null;

      const getOwnerName = (ownerId, members) => {
        const member = members.find(m => m.id === ownerId);
        return member ? `${member.firstName} ${member.lastName}` : 'Unknown Owner';
      };

      const processLeague = (leagueData, leagueId) => {
        leagueData.schedule.forEach(matchup => {
          if (matchup.matchupPeriodId === weekToShow) {
            const homeScore = matchup.home.totalPoints;
            const awayScore = matchup.away ? matchup.away.totalPoints : Infinity;

            if (homeScore < lowestScore) {
              lowestScore = homeScore;
              lowestScoringTeam = leagueData.teams.find(team => team.id === matchup.home.teamId);
              lowestScoringLeague = leagueData.settings.name || `League ${leagueId}`;
            }

            if (awayScore < lowestScore) {
              lowestScore = awayScore;
              lowestScoringTeam = leagueData.teams.find(team => team.id === matchup.away.teamId);
              lowestScoringLeague = leagueData.settings.name || `League ${leagueId}`;
            }
          }
        });
      };

      processLeague(league1Response.data, league1Id);
      processLeague(league2Response.data, league2Id);

      const ownerName = getOwnerName(lowestScoringTeam.primaryOwner, 
        lowestScoringLeague === league1Response.data.settings.name ? league1Response.data.members : league2Response.data.members);

      setLowestScorer({
        name: lowestScoringTeam.name,
        logo: lowestScoringTeam.logo,
        score: lowestScore.toFixed(1),
        leagueName: lowestScoringLeague,
        ownerName: ownerName,
        week: weekToShow
      });
    } catch (error) {
      console.error("Error fetching lowest scorer:", error);
      setLowestScorer({
        name: 'Unknown Team',
        logo: '',
        score: '0.0',
        leagueName: 'Unknown League',
        ownerName: 'Unknown Owner',
        week: 0
      });
    }
  };

  useEffect(() => {
    fetchHighestScorer();
    fetchLowestScorer();

    const checkAndUpdateScorers = () => {
      const now = new Date();
      if (now.getDay() === 2) { // 0 is Sunday, 1 is Monday, 2 is Tuesday
        fetchHighestScorer();
        fetchLowestScorer();
      }
    };

    const dailyCheck = setInterval(checkAndUpdateScorers, 24 * 60 * 60 * 1000); // Check every 24 hours

    return () => clearInterval(dailyCheck);
  }, []);

  useEffect(() => {
    const fetchWeeklyStats = async () => {
      try {
        if (!matchupPeriodId) return;

        const currentWeek = parseInt(matchupPeriodId.substring(9));
        if (isNaN(currentWeek)) return;
        
        const weekToShow = currentWeek > 1 ? currentWeek - 1 : 1;

        const [league1Response, league2Response] = await Promise.all([
          axios.get(`https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/1446375?view=mMatchup&view=mMatchupScore&view=mTeam&scoringPeriodId=${weekToShow}`),
          axios.get(`https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/1869404038?view=mMatchup&view=mMatchupScore&view=mTeam&scoringPeriodId=${weekToShow}`)
        ]);

        const league1Teams = new Map(league1Response.data.teams.map(team => [team.id, team]));
        const league2Teams = new Map(league2Response.data.teams.map(team => [team.id, team]));

        const allMatchups = [
          ...league1Response.data.schedule.map(match => ({
            ...match,
            isLeague1: true
          })),
          ...league2Response.data.schedule.map(match => ({
            ...match,
            isLeague1: false
          }))
        ].filter(match => match.matchupPeriodId === weekToShow);

        if (allMatchups.some(match => match.home.totalPoints > 0 || (match.away && match.away.totalPoints > 0))) {
          let smallestDiff = Infinity;
          let closestMatch = null;
          let biggestDiff = -Infinity;
          let blowoutMatch = null;

          allMatchups.forEach(match => {
            if (match.home && match.away) {
              const diff = Math.abs(match.home.totalPoints - match.away.totalPoints);
              const teams = match.isLeague1 ? league1Teams : league2Teams;
              
              match.home.team = teams.get(match.home.teamId);
              match.away.team = teams.get(match.away.teamId);
              
              if (diff < smallestDiff && diff > 0) {
                smallestDiff = diff;
                closestMatch = match;
              }
              
              if (diff > biggestDiff) {
                biggestDiff = diff;
                blowoutMatch = match;
              }
            }
          });

          const [league1Rosters, league2Rosters] = await Promise.all([
            axios.get(`https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/1446375?view=mRoster&view=mMatchup&view=mMatchupScore&scoringPeriodId=${weekToShow}`),
            axios.get(`https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/1869404038?view=mRoster&view=mMatchup&view=mMatchupScore&scoringPeriodId=${weekToShow}`)
          ]);

          let highestScore = -Infinity;
          let bestPlayer = null;

          const processRoster = (league, teams) => {
            league.teams.forEach(team => {
              const teamDetails = teams.get(team.id);
              if (team.roster && team.roster.entries) {
                team.roster.entries.forEach(entry => {
                  if (entry.lineupSlotId <= 8) {
                    const playerScore = entry.playerPoolEntry.appliedStatTotal || 0;
                    
                    console.log(`Player: ${entry.playerPoolEntry.player.fullName}, Score: ${playerScore}, Team: ${teamDetails?.name}`);
                    
                    if (playerScore > highestScore) {
                      highestScore = playerScore;
                      bestPlayer = {
                        name: entry.playerPoolEntry.player.fullName,
                        score: playerScore,
                        team: teamDetails?.name || 'Unknown Team',
                        teamLogo: teamDetails?.logo || '',
                        position: entry.playerPoolEntry.player.defaultPositionId
                      };
                    }
                  }
                });
              }
            });
          };

          processRoster(league1Rosters.data, league1Teams);
          processRoster(league2Rosters.data, league2Teams);

          setHighestPlayer(bestPlayer);
          setClosestMatchup(closestMatch);
          setBiggestBlowout(blowoutMatch);
        }
      } catch (error) {
        console.error('Error fetching weekly stats:', error);
        setHighestPlayer(null);
        setClosestMatchup(null);
        setBiggestBlowout(null);
      }
    };

    if (matchupPeriodId) {
      fetchWeeklyStats();
    }
  }, [matchupPeriodId]);

  const fetchChampionshipScores = async () => {
    try {
      // Get both leagues' data since teams are in different leagues
      const [league1Response, league2Response] = await Promise.all([
        axios.get(
          "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/1446375?view=mMatchup&view=mMatchupScore&view=mRoster&view=mTeam&scoringPeriodId=17"
        ),
        axios.get(
          "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/1869404038?view=mMatchup&view=mMatchupScore&view=mRoster&view=mTeam&scoringPeriodId=17"
        )
      ]);

      // Gay is in league 2, Beast is in league 1
      const gay = league2Response.data.teams.find(team => team.id === 7);
      const theBeast = league1Response.data.teams.find(team => 
        team.name.toUpperCase().includes('THE BEAST')
      );

      if (gay && theBeast) {
        // Get Week 17 stats for each player
        const getTeamScore = (team) => {
          return team.roster.entries.reduce((total, entry) => {
            const playerStats = entry.playerPoolEntry?.player?.stats || [];
            const week17Stats = playerStats.find(
              stat => stat.scoringPeriodId === 17 && stat.statSourceId === 0 && stat.statSplitTypeId === 1
            );
            return total + (week17Stats?.appliedTotal || 0);
          }, 0);
        };

        setChampionshipTeams({
          gay: {
            name: gay.name,
            score: getTeamScore(gay),
            projected: 132.2
          },
          theBeast: {
            name: theBeast.name,
            score: getTeamScore(theBeast),
            projected: 119.2
          }
        });
      }
    } catch (error) {
      console.error('Error fetching championship scores:', error);
    }
  };

  useEffect(() => {
    fetchChampionshipScores();
    const scoresInterval = setInterval(fetchChampionshipScores, 30000);
    return () => {
      clearInterval(scoresInterval);
      // Clear any other existing intervals...
    };
  }, []);

  return (
    <div className="dashboard-container">
      <div className="nav-section">
        <div className="logo" onClick={onLogoClick}>
          <img src={logo} alt="" width="80px" height="75px" />
        </div>
        <TabView
          activeIndex={activeIndex}
          onTabChange={(e) => setActiveIndex(e.index)}
          className="modern-tabs"
        >
          <TabPanel header="Home" leftIcon="pi pi-home">
            <div className="content-section">
              <div className="section-title-container">
                <div className="section-title-background"></div>
                <h1 className="section-title">Weekly Highlights</h1>
                <p className="section-subtitle">Top Performers and Notable Moments</p>
              </div>

              <div className="championship-score-banner">
                <div className="championship-score-header">
                  <h2>Championship Game</h2>
                  <FaTrophy className="championship-trophy" />
                </div>
                <div className="championship-teams">
                  <div className="championship-team">
                    <div className="team-name-champ">{championshipTeams.gay.name}</div>
                    <div className="team-score-champ">
                      {championshipTeams.gay.score.toFixed(2)}
                    </div>
                  </div>
                  <div className="championship-vs">VS</div>
                  <div className="championship-team">
                    <div className="team-name-champ">{championshipTeams.theBeast.name}</div>
                    <div className="team-score-champ">
                      {championshipTeams.theBeast.score.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              <Headlines />

              <div className="winners-losers-container">
                <div className="highlight-card winner-card">
                  <div className="card-header">
                    <FaTrophy className="trophy-icon" />
                    <h2>Weekly Champion</h2>
                  </div>
                  {highestScorer ? (
                    <div className="scorer-content">
                      <div className="score-banner">
                        <span className="points">{highestScorer.score || 0}</span>
                        <span className="points-label">POINTS</span>
                      </div>
                      <div className="winner-details">
                        <img 
                          src={highestScorer.logo || 'default-logo-url'} 
                          alt="" 
                          className="scorer-logo pulse-animation" 
                        />
                        <div className="scorer-info">
                          <span className="scorer-name glow-text">{highestScorer.name || 'TBD'}</span>
                          <div className="scorer-details">
                            <span className="scorer-league">{highestScorer.leagueName || 'Unknown League'}</span>
                            <span className="scorer-owner">{highestScorer.ownerName || 'Unknown Owner'}</span>
                            <span className="scorer-week">Week {highestScorer.week || '?'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="confetti-overlay"></div>
                    </div>
                  ) : (
                    <div className="scorer-content">
                      <span>Loading...</span>
                    </div>
                  )}
                </div>

                <div className="highlight-card loser-card">
                  <div className="card-header">
                    <FaToilet className="toilet-icon spinning" />
                    <h2>Weekly Shame</h2>
                  </div>
                  {lowestScorer ? (
                    <div className="scorer-content">
                      <div className="score-banner shame">
                        <span className="points">{lowestScorer.score || 0}</span>
                        <span className="points-label">POINTS</span>
                      </div>
                      <div className="loser-details">
                        <img 
                          src={lowestScorer.logo || 'default-logo-url'} 
                          alt="" 
                          className="scorer-logo shake-animation" 
                        />
                        <div className="scorer-info">
                          <span className="scorer-name shame-text">{lowestScorer.name || 'TBD'}</span>
                          <div className="scorer-details">
                            <span className="scorer-league">{lowestScorer.leagueName || 'Unknown League'}</span>
                            <span className="scorer-owner">{lowestScorer.ownerName || 'Unknown Owner'}</span>
                            <span className="scorer-week">Week {lowestScorer.week || '?'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="toilet-paper-overlay"></div>
                    </div>
                  ) : (
                    <div className="scorer-content">
                      <span>Loading...</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="weekly-stats-grid">
                <div className="stat-card">
                  <h3>Highest Single Player</h3>
                  {highestPlayer ? (
                    <div className="stat-content">
                      <div className="player-info">
                        <img src={highestPlayer.teamLogo || ''} alt="" className="team-logo" />
                        <div className="player-details">
                          <span className="player-name">{highestPlayer.name || 'N/A'}</span>
                          <span className="player-score">{(highestPlayer.score || 0).toFixed(1)} pts</span>
                          <span className="player-team">{highestPlayer.team || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="stat-content">Loading...</div>
                  )}
                </div>

                <div className="stat-card">
                  <h3>Closest Matchup</h3>
                  {closestMatchup && closestMatchup.home && closestMatchup.away ? (
                    <div className="stat-content">
                      <div className="matchup-info">
                        <div className="team-vs-team">
                          <span>{closestMatchup.home.team?.name || 'TBD'}</span>
                          <span className="score">
                            {(closestMatchup.home.totalPoints || 0).toFixed(1)} - {(closestMatchup.away.totalPoints || 0).toFixed(1)}
                          </span>
                          <span>{closestMatchup.away.team?.name || 'TBD'}</span>
                        </div>
                        <span className="difference">
                          Difference: {Math.abs((closestMatchup.home.totalPoints || 0) - (closestMatchup.away.totalPoints || 0)).toFixed(1)} pts
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="stat-content">Loading...</div>
                  )}
                </div>

                <div className="stat-card">
                  <h3>Biggest Blowout</h3>
                  {biggestBlowout && biggestBlowout.home && biggestBlowout.away ? (
                    <div className="stat-content">
                      <div className="matchup-info">
                        <div className="team-vs-team">
                          <span>{biggestBlowout.home.team?.name || 'TBD'}</span>
                          <span className="score">
                            {(biggestBlowout.home.totalPoints || 0).toFixed(1)} - {(biggestBlowout.away.totalPoints || 0).toFixed(1)}
                          </span>
                          <span>{biggestBlowout.away.team?.name || 'TBD'}</span>
                        </div>
                        <span className="difference">
                          Margin: {Math.abs((biggestBlowout.home.totalPoints || 0) - (biggestBlowout.away.totalPoints || 0)).toFixed(1)} pts
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="stat-content">Loading...</div>
                  )}
                </div>
              </div>
            </div>
          </TabPanel>
          <TabPanel header="Championship" leftIcon="pi pi-trophy">
            <Championship />
          </TabPanel>
          <TabPanel header="Past Champions" leftIcon="pi pi-history">
            <PastChampions />
          </TabPanel>
          <TabPanel header="Championship Race" leftIcon="pi pi-flag">
            <ChampionshipRace />
          </TabPanel>
          <TabPanel header="Leaderboard" leftIcon="pi pi-sitemap">
            <Leaderboard 
              leagueType={leagueTypeLeaderboard}
              onLeagueChange={(value) => setLeagueTypeLeaderboard(value)}
            />
          </TabPanel>
          <TabPanel header="Scoreboard" leftIcon="pi pi-star-fill">
            <Scoreboard
              leagueType={leagueTypeScoreboard}
              showBoxScore={showBoxScore}
              matchupPeriodId={matchupPeriodId}
              liveMatchup={liveMatchup}
              onLeagueChange={(value) => {
                console.log("Changing scoreboard league to:", value);
                setLeagueTypeScoreboard(value);
              }}
            />
          </TabPanel>
          <TabPanel header="Box Score" leftIcon="pi pi-book">
            <BoxScores
              leagueID={leagueID}
              value={value}
              matchupPeriodId={matchupPeriodId?.substring(9)}
              liveMatchup={liveMatchup?.substring(9)}
              matchId={matchId?.toString()}
              showBoxScore={showBoxScores}
            />  
          </TabPanel>
          <TabPanel header="Total Points" leftIcon="pi pi-chart-bar">
            <TotalPoints />
          </TabPanel>
          <TabPanel header="Playoff Outlook" leftIcon="pi pi-chart-line">
            <PlayoffOutlook />
          </TabPanel>
          <TabPanel header="Toilet Bowl" leftIcon="pi pi-exclamation-triangle">
            <ToiletBowl />
          </TabPanel>
          <TabPanel header="Commissioner Bowl" leftIcon="pi pi-crown">
            <CommissionerBowl />
          </TabPanel>
          <TabPanel header="Classics" leftIcon="pi pi-history">
            <Classics />
          </TabPanel>
        </TabView>
      </div>
    </div>
  );
}

export default Dashboard;