import React, { useState, useEffect } from "react";
import Match from "../Match/Match";
import { Dropdown } from "primereact/dropdown";
import axios from "axios";
import "./Scoreboard.css";

function Scoreboard(props) {
  const [leagueName, setLeagueName] = useState("");
  const [matchupPeriod, setMatchupPeriod] = useState(props.matchupPeriodId || "NFL WEEK 1");
  const [matchupBody, setMatchupBody] = useState([]);
  const [projected, setProjected] = useState(-1);
  const [currentLeagueType, setCurrentLeagueType] = useState("overall");
  const [weekOptions] = useState(Array.from({length: 17}, (_, i) => ({
    label: `NFL WEEK ${i + 1}`,
    value: `NFL WEEK ${i + 1}`
  })));

  useEffect(() => {
    if (!props.leagueType) {
      props.onLeagueChange?.("overall");
    }
  }, []);

  useEffect(() => {
    setCurrentLeagueType(props.leagueType);
  }, [props.leagueType]);

  useEffect(() => {
    setMatchupPeriod(props.matchupPeriodId);
  }, [props.matchupPeriodId]);

  useEffect(() => {
    let cur = parseInt(matchupPeriod.substring(9));
    let live = parseInt(props.liveMatchup.substring(9));
    if (projected === -1) setProjected(cur > live ? 1 : 0);

    const fetchMatchups = async () => {
      try {
        let responses;
        console.log("Fetching for league type:", props.leagueType);
        
        if (props.leagueType === "overall") {
          responses = await Promise.all([
            axios.get(getLeagueUrl(1446375, matchupPeriod.substring(9))),
            axios.get(getLeagueUrl(1869404038, matchupPeriod.substring(9)))
          ]);
        } else {
          const leagueID = props.leagueType === "league1" ? 1446375 : 1869404038;
          responses = [await axios.get(getLeagueUrl(leagueID, matchupPeriod.substring(9)))];
        }

        let allMatchups = [];
        responses.forEach((response, index) => {
          const result = response.data;
          const teams = createTeamsMap(result.teams);
          const leagueName = result.settings.name;
          
          if (index === 0) {
            setLeagueName(leagueName);
          } else {
            setLeagueName(prev => `${prev}, ${leagueName}`);
          }

          const leagueMatchups = processMatchups(result, teams, result.id);
          allMatchups = [...allMatchups, ...leagueMatchups];
        });

        setMatchupBody(allMatchups);
      } catch (error) {
        console.error("Error fetching matchups:", error);
      }
    };

    fetchMatchups();
  }, [matchupPeriod, props.leagueType, projected, props.liveMatchup]);

  const getLeagueUrl = (leagueId, scoringPeriod) => {
    return `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/${leagueId}?scoringPeriodId=${scoringPeriod}&view=modular&view=mNav&view=mMatchupScore&view=mScoreboard&view=mSettings&view=mTopPerformers&view=mTeam`;
  };

  const createTeamsMap = (teams) => {
    const teamsMap = {};
    teams.forEach((team) => {
      teamsMap[team.id.toString()] = {
        name: team.name,
        logo: getLogoUrl(team.logo),
      };
    });
    return teamsMap;
  };

  const getLogoUrl = (url) => {
    const imageExtensions = [".jpg", ".jpeg", ".gif", ".bmp", ".png", ".svg"];
    const extension = url.substring(url.lastIndexOf(".")).toLowerCase();
    return imageExtensions.includes(extension) ? url : "https://g.espncdn.com/lm-static/ffl/images/ffl-shield-shield.svg";
  };

  const processMatchups = (result, teams, leagueId) => {
    return result.schedule
      .filter(match => match.matchupPeriodId.toString() === matchupPeriod.substring(9))
      .map(match => {
        const home_team = teams[match.home.teamId.toString()];
        const away_team = teams[match.away.teamId.toString()];
        
        if (match.home.pointsByScoringPeriod === undefined) {
          setProjected(1);
        }

        return (
          <Match
            key={`${leagueId}-${match.id}`}
            home={{
              name: home_team.name,
              logo: home_team.logo,
              score: parseFloat(match.home.pointsByScoringPeriod?.[match.matchupPeriodId] || match.home.adjustment || 0).toFixed(1),
            }}
            away={{
              name: away_team.name,
              logo: away_team.logo,
              score: parseFloat(match.away.pointsByScoringPeriod?.[match.matchupPeriodId] || match.away.adjustment || 0).toFixed(1),
            }}
            id={match.id}
            leagueId={leagueId}
            showBoxScore={props.showBoxScore}
            projected={projected}
          />
        );
      });
  };

  const handleLeagueChange = (value) => {
    setCurrentLeagueType(value);
    if (props.onLeagueChange) {
      props.onLeagueChange(value);
    }
  };

  const handleWeekChange = (value) => {
    setMatchupPeriod(value);
  };

  return (
    <div className="scoreboard-wrapper">
      <div className="section-title-container">
        <div className="section-title-background"></div>
        <h1 className="section-title">{leagueName}</h1>
        <p className="section-subtitle">Week {matchupPeriod.substring(9)} Matchups</p>
      </div>

      <div className="filters-container">
        <div className="filter-group">
          <label>League</label>
          <Dropdown
            value={props.leagueType}
            options={[
              { label: 'Overall', value: 'overall' },
              { label: 'League 1', value: 'league1' },
              { label: 'League 2', value: 'league2' }
            ]}
            onChange={(e) => {
              console.log("Selected scoreboard league:", e.value);
              props.onLeagueChange?.(e.value);
            }}
            className="league-dropdown"
            placeholder="Select League"
          />
        </div>
        <div className="filter-group">
          <label>Week</label>
          <Dropdown
            value={matchupPeriod}
            options={weekOptions}
            onChange={(e) => handleWeekChange(e.value)}
            className="week-dropdown"
            placeholder="Select Week"
          />
        </div>
      </div>

      <div className="matchups-container">
        {matchupBody}
      </div>
    </div>
  );
}

export default Scoreboard;
