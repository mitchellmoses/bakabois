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
import History from '../../Components/History/History';
import Classics from '../../Components/Classics/Classics';
import img_3690 from "../../assets/image/IMG_3690.jpg";
import PlayoffOutlook from '../../Components/PlayoffOutlook/PlayoffOutlook';

function Dashboard() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [leagueType, setLeagueType] = useState("league1");
  const [leagueID, setLeagueID] = useState(1446375);
  const [leagueTypeScoreboard, setLeagueTypeScoreboard] = useState("League 1");
  const [leagueTypeLeaderboard, setLeagueTypeLeaderboard] =
    useState("League 1");
  const [matchupPeriodId, setMatchupPeriodId] = useState("");
  const [matchups, setMatchups] = useState([]);
  const [matchId, setMatchId] = useState(1);
  const [liveMatchup, setLiveMatchup] = useState("");
  const [value, setValue] = useState(0);
  const [highestScorer, setHighestScorer] = useState(null);
  const [lowestScorer, setLowestScorer] = useState(null);

  const getLiveMatchup = () => {
    axios
      .get("https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/1446375?view=modular&view=mNav&view=mMatchupScore&view=mScoreboard&view=mSettings&view=mTopPerformers&view=mTeam", {})
      .then((response) => {
          let result = response["data"];
          setLiveMatchup("NFL WEEK " + result["scoringPeriodId"]);
          setMatchupPeriodId("NFL WEEK " + result["scoringPeriodId"]);
      }).catch((error) => {
        console.log(error);
      })
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

  const showBoxScore = (_leagueID, _matchId) => {
    setLeagueID(_leagueID);
    setMatchId(_matchId);
    setValue(-1);
    setActiveIndex(3);
  };

  const showBoxScores = (_leagueID, _matchId, _value) => {
    setLeagueID(_leagueID);
    setMatchId(_matchId);
    setValue(_value);
    setValue(_value);
    setActiveIndex(3);
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

  return (
    <div className="min-w-full sm:dashboard">
      <div className="blank"></div>
      <div
        className="logo"
        onClick={(e) => {
          onLogoClick();
        }}
      >
        <img src={logo} alt="" width="80px" height="75px" />
      </div>
      <div className="card">
        <TabView
          activeIndex={activeIndex}
          onTabChange={(e) => setActiveIndex(e.index)}
        >
          <TabPanel header="Home" leftIcon="pi pi-home">
            <div className="home-content">
              <div className="winners-losers-container">
                <div className="highest-scorer">
                  <h1 className="highest-scorer-title">
                    🏆 WEEKLY WINNER 🏆
                  </h1>
                  {highestScorer && (
                    <div className="highest-scorer-content">
                      <img src={highestScorer.logo} alt={highestScorer.name} className="scorer-logo" />
                      <div className="scorer-info">
                        <span className="scorer-name">{highestScorer.name}</span>
                        <span className="scorer-score highest">{highestScorer.score} points</span>
                        <div className="scorer-details">
                          <span className="scorer-league">{highestScorer.leagueName}</span>
                          <span className="scorer-owner">{highestScorer.ownerName}</span>
                          <span className="scorer-week">Week {highestScorer.week}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="lowest-scorer">
                  <h1 className="lowest-scorer-title">
                    🌈 LOSER OF THE WEEK 🌈
                  </h1>
                  {lowestScorer && (
                    <div className="lowest-scorer-content">
                      <img src={lowestScorer.logo} alt={lowestScorer.name} className="scorer-logo" />
                      <div className="scorer-info">
                        <span className="scorer-name">{lowestScorer.name}</span>
                        <span className="scorer-score lowest">{lowestScorer.score} points</span>
                        <div className="scorer-details">
                          <span className="scorer-league">{lowestScorer.leagueName}</span>
                          <span className="scorer-owner">{lowestScorer.ownerName}</span>
                          <span className="scorer-week">Week {lowestScorer.week}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="background-images-container">
                <div className="background-image">
                  <img src={img_o338} alt="Background 1" />
                </div>
                <div className="background-image">
                  <img src={bkImage2} alt="Background 2" />
                </div>
              </div>
            </div>
          </TabPanel>
          <TabPanel header="Leaderboard" leftIcon="pi pi-sitemap">
            <div className="leaderboard-container">
              <div className="leaderboard-header">
                <div className="-logo">
                  <span>Standings</span>
                </div>
              </div>
              <div className="leaderboard-menu">
                <div className="title">League:</div>
                <Dropdown
                  value={leagueTypeLeaderboard}
                  onChange={(e) => setLeagueTypeLeaderboard(e.value)}
                  options={["League 1", "League 2", "Overall"]}
                  placeholder="Select a League"
                  className="w-full"
                />
              </div>
              <Leaderboard leagueType={leagueTypeLeaderboard}></Leaderboard>
            </div>
          </TabPanel>
          <TabPanel header="Playoff Outlook" leftIcon="pi pi-chart-line">
            <PlayoffOutlook />
          </TabPanel>
          <TabPanel header="Scoreboard" leftIcon="pi pi-star-fill">
            <div className="scoreboard-container">
              <div className="scoreboard-header">
                <div className="-logo">
                  <span>Scoreboard</span>
                </div>
              </div>
              <div className="scoreboard-tool">
                <div className="scoreboard-menu">
                  <div className="title">League:</div>
                  <Dropdown
                    value={leagueTypeScoreboard}
                    onChange={(e) => setLeagueTypeScoreboard(e.value)}
                    options={["League 1", "League 2", "Overall"]}
                    placeholder="Select a City"
                    className="w-full"
                  />
                </div>
                <div className="sm:ml-5 matchup-period">
                  <div className="title">Matchups: </div>
                  <Dropdown
                    value={matchupPeriodId}
                    onChange={(e) => setMatchupPeriodId(e.value)}
                    options={matchups}
                    placeholder={matchupPeriodId}
                    className="w-full"
                  />
                </div>
              </div>

              {(leagueTypeScoreboard === "League 1" ||
                leagueTypeScoreboard === "Overall") && (
                  <Scoreboard
                    leagueType="league1"
                    showBoxScore={showBoxScore}
                    matchupPeriodId={matchupPeriodId}
                    liveMatchup={liveMatchup}
                  ></Scoreboard>
                )}
              {(leagueTypeScoreboard === "League 2" ||
                leagueTypeScoreboard === "Overall") && (
                  <Scoreboard
                    leagueType="league2"
                    showBoxScore={showBoxScore}
                    matchupPeriodId={matchupPeriodId}
                    liveMatchup={liveMatchup}
                  ></Scoreboard>
                )}
            </div>
          </TabPanel>
          <TabPanel header="Box Score" leftIcon="pi pi-book">
            <BoxScores
              leagueID={leagueID}
              value={value}
              matchupPeriodId={matchupPeriodId.substring(9)}
              liveMatchup={liveMatchup.substring(9)}
              matchId={matchId.toString()}
              showBoxScore={showBoxScores}
            ></BoxScores>
          </TabPanel>
          <TabPanel header="Total Points" leftIcon="pi pi-chart-bar">
            <TotalPoints />
          </TabPanel>
          <TabPanel header="History" leftIcon="pi pi-calendar">
            <History />
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