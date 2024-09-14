import React, { useState, useEffect, useRef } from "react";
import Match from "../Match/Match";
import { Avatar } from "primereact/avatar";
import { Dropdown } from "primereact/dropdown";
import axios from "axios";
import "./Scoreboard.css";

function Scoreboard(props) {
  const [leagueName, setLeagueName] = useState("Bakabois");
  const [matchupPeriod, setMatchupPeriod] = useState("NFL WEEK 1");
  const [matchupBody, setMatchupBody] = useState([]);
  const [projected, setProjected] = useState(-1);

  useEffect(() => {
    setMatchupPeriod(props.matchupPeriodId);
  }, [props.matchupPeriodId])

  useEffect(() => {
    let cur = parseInt(props.matchupPeriodId.substring(9));
    let live = parseInt(props.liveMatchup.substring(9));
    console.log("LIVE", live);
    if (projected === -1) setProjected(cur > live ? 1 : 0);
    let leagueID = (props.leagueType === "league1" ? 1446375 : 1869404038);
    let scoringPeriod = props.matchupPeriodId.substring(9);
    console.log(scoringPeriod);

    const logoURL = (url) => {
      const imageExtensions = [".jpg", ".jpeg", ".gif", ".bmp", ".png", ".svg"];
      const extension = url.substring(url.lastIndexOf(".")).toLowerCase();
      if (imageExtensions.includes(extension) === false)
        return "https://g.espncdn.com/lm-static/ffl/images/ffl-shield-shield.svg";
      return url;
    };

    const showBoxScore = (_matchId) => {
      props.showBoxScore(leagueID, _matchId);
    };

    let url =
      "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/" +
      leagueID +
      "?scoringPeriodId=" +
      scoringPeriod +
      "&view=modular&view=mNav&view=mMatchupScore&view=mScoreboard&view=mSettings&view=mTopPerformers&view=mTeam";

    axios
      .get(url, {})
      .then((response) => {
        let result = response["data"];
        console.log(result);
        if (result["settings"]["name"] !== leagueName) {
          setLeagueName(result["settings"]["name"]);
        }
        var teams = {};
        result["teams"].forEach((team) => {
          teams[team["id"].toString()] = {
            name: team["name"],
            logo: logoURL(team["logo"]),
          };
        });
        console.log(teams);
        let _matchupBody = [];
        let projec = 1;
        result["schedule"].forEach((match) => {
          if (
            match["matchupPeriodId"].toString() === matchupPeriod.substring(9)
          ) {
            let home_team = teams[match["home"]["teamId"].toString()];
            let away_team = teams[match["away"]["teamId"].toString()];
            if (match["home"]["pointsByScoringPeriod"] === undefined)
              setProjected(1);
            let match_data = {
              home: {
                name: home_team["name"],
                logo: home_team["logo"],
                score: match["home"]["pointsByScoringPeriod"] === undefined ? match["home"]["adjustment"] : match["home"]["pointsByScoringPeriod"][match["matchupPeriodId"]],
              },
              away: {
                name: away_team["name"],
                logo: away_team["logo"],
                score: match["away"]["pointsByScoringPeriod"] === undefined ? match["away"]["adjustment"] : match["away"]["pointsByScoringPeriod"][match["matchupPeriodId"]],
              },
              id: match["id"],
            };
            match_data.away.score = parseFloat(match_data.away.score).toFixed(1);
            match_data.home.score = parseFloat(match_data.home.score).toFixed(1);
            console.log("safddf", projected);
            _matchupBody.push(
              <Match
                home={match_data["home"]}
                away={match_data["away"]}
                id={match_data["id"]}
                showBoxScore={showBoxScore}
                projected={projected}
              ></Match>
            );
          }
        });
        setMatchupBody(_matchupBody);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [matchupPeriod, props.leagueType, projected]);

  return (
    <div className="scoreboard">
      <div className="xxl match-container">{matchupBody}</div>
    </div>
  );
}

export default Scoreboard;
