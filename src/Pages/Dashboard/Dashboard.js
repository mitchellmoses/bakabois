import React, { useState, useEffect, useRef } from "react";
import Leaderboard from "../../Components/Leaderboard/Leaderboard";
import Scoreboard from "../../Components/Scoreboard/Scoreboard";
import BoxScores from "../../Components/BoxScores/BoxScores";
import { Dropdown } from "primereact/dropdown";
import { TabView, TabPanel } from "primereact/tabview";
import { SplitButton } from "primereact/splitbutton";
import "./Dashboard.css";
import logo from "../../assets/image/logo.png";
import bkImage1 from "../../assets/image/image1.jpeg";
import bkImage2 from "../../assets/image/image2.jpeg";
import axios from "axios";


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
            <div className="">
              <div className="">
                <img src={bkImage1} width="100%" height="100%" />
              </div>
              <div className="">
                <img src={bkImage2} width="100%" height="100%" />
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
        </TabView>
      </div>
    </div>
  );
}

export default Dashboard;
