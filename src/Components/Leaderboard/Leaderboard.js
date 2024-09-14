import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Avatar } from "primereact/avatar";
import axios from "axios";
import "./Leaderboard.css";

function Leaderboard(props) {
  useEffect(() => {
    console.log(props.leagueType);
    if (props.leagueType === "League 1") fetchLeague(1446375);
    else if (props.leagueType === "League 2") fetchLeague(1869404038);
    else {
      fetchAll();
    }
  }, [props.leagueType]);
  const [leagueName, setLeagueName] = useState("Bakabois");
  const [seasonName, setSeasonName] = useState("Season Title");
  const [standing, setStanding] = useState([]);

  const fetchLeague = async (leagueID) => {
    axios
      .get(
        "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/" +
          leagueID +
          "?view=mLiveScoring&view=mMatchupScore&view=mRoster&view=mSettings&view=mStandings&view=mStatus&view=mTeam&view=modular&view=mNav",
        {}
      )
      .then((response) => {
        let _standing = [];
        console.log(response);
        let result = response["data"];
        setLeagueName(result["settings"]["name"]);
        setSeasonName(
          result["settings"]["scheduleSettings"]["divisions"][0]["name"]
        );
        result["teams"].forEach((team) => {
          let managerName = "";
          result["members"].forEach((member) => {
            if (team["owners"] !== undefined) {
              team["owners"].forEach((owner) => {
                if (member["id"] === owner) {
                  if (managerName !== "") managerName += ", ";
                  managerName += member["firstName"] + " " + member["lastName"];
                }
              });
            }
          });
          if (managerName === "") managerName = "None";
          let teamName = team["name"] + " (" + managerName + ")";
          _standing.push({
            rank: team["playoffSeed"],
            name: team["name"],
            manager: managerName,
            team: teamName,
            logo: team["logo"],
            pf: team["record"]["overall"]["pointsFor"],
            pa: parseFloat(team["record"]["overall"]["pointsAgainst"]).toFixed(1),
            pct: team["record"]["overall"]["percentage"],
            gb: team["record"]["overall"]["gamesBack"],
            div:
              team["record"]["division"]["wins"] +
              "-" +
              team["record"]["division"]["losses"] +
              "-" +
              team["record"]["division"]["ties"],
            home:
              team["record"]["home"]["wins"] +
              "-" +
              team["record"]["home"]["losses"] +
              "-" +
              team["record"]["home"]["ties"],
            away:
              team["record"]["away"]["wins"] +
              "-" +
              team["record"]["away"]["losses"] +
              "-" +
              team["record"]["away"]["ties"],
          });
        });
        console.log(_standing);
        setStanding(_standing);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const fetchAll = async () => {
    axios
      .get(
        "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/1446375?view=mLiveScoring&view=mMatchupScore&view=mRoster&view=mSettings&view=mStandings&view=mStatus&view=mTeam&view=modular&view=mNav",
        {}
      )
      .then((response) => {
        let _standing = [];
        console.log(response);
        let result = response["data"];
        let _leagueName = result["settings"]["name"];
        result["teams"].forEach((team) => {
          let managerName = "";
          result["members"].forEach((member) => {
            if (team["owners"] !== undefined) {
              team["owners"].forEach((owner) => {
                if (member["id"] === owner) {
                  if (managerName !== "") managerName += ", ";
                  managerName += member["firstName"] + " " + member["lastName"];
                }
              });
            }
          });
          if (managerName === "") managerName = "None";
          let teamName = team["name"] + " (" + managerName + ")";
          _standing.push({
            rank: team["playoffSeed"],
            name: team["name"],
            manager: managerName,
            team: teamName,
            logo: team["logo"],
            pf: team["record"]["overall"]["pointsFor"],
            pa: parseFloat(team["record"]["overall"]["pointsAgainst"]).toFixed(1),
            pct: team["record"]["overall"]["percentage"],
            gb: team["record"]["overall"]["gamesBack"],
            div:
              team["record"]["division"]["wins"] +
              "-" +
              team["record"]["division"]["losses"] +
              "-" +
              team["record"]["division"]["ties"],
            home:
              team["record"]["home"]["wins"] +
              "-" +
              team["record"]["home"]["losses"] +
              "-" +
              team["record"]["home"]["ties"],
            away:
              team["record"]["away"]["wins"] +
              "-" +
              team["record"]["away"]["losses"] +
              "-" +
              team["record"]["away"]["ties"],
          });
        });
        axios
          .get(
            "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/1869404038?view=mLiveScoring&view=mMatchupScore&view=mRoster&view=mSettings&view=mStandings&view=mStatus&view=mTeam&view=modular&view=mNav",
            {}
          )
          .then((response) => {
            console.log(response);
            let result = response["data"];
            setLeagueName(_leagueName + ", " + result["settings"]["name"]);
            setSeasonName("");
            result["teams"].forEach((team) => {
              let managerName = "";
              result["members"].forEach((member) => {
                if (team["owners"] !== undefined) {
                  team["owners"].forEach((owner) => {
                    if (member["id"] === owner) {
                      if (managerName !== "") managerName += ", ";
                      managerName +=
                        member["firstName"] + " " + member["lastName"];
                    }
                  });
                }
              });
              if (managerName === "") managerName = "None";
              let teamName = team["name"] + " (" + managerName + ")";
              _standing.push({
                rank: team["playoffSeed"],
                name: team["name"],
                manager: managerName,
                team: teamName,
                logo: team["logo"],
                pf: team["record"]["overall"]["pointsFor"],
                pa: team["record"]["overall"]["pointsAgainst"],
                pct: team["record"]["overall"]["percentage"],
                gb: team["record"]["overall"]["gamesBack"],
                div:
                  team["record"]["division"]["wins"] +
                  "-" +
                  team["record"]["division"]["losses"] +
                  "-" +
                  team["record"]["division"]["ties"],
                home:
                  team["record"]["home"]["wins"] +
                  "-" +
                  team["record"]["home"]["losses"] +
                  "-" +
                  team["record"]["home"]["ties"],
                away:
                  team["record"]["away"]["wins"] +
                  "-" +
                  team["record"]["away"]["losses"] +
                  "-" +
                  team["record"]["away"]["ties"],
              });
            });
            console.log(_standing);
            setStanding(_standing);
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const teamBodyTemplate = (team) => {
    let url = team["logo"];
    const imageExtensions = [".jpg", ".jpeg", ".gif", ".bmp", ".png", ".svg"];
    const extension = url.substring(url.lastIndexOf(".")).toLowerCase();
    if (imageExtensions.includes(extension) === false)
      url = "https://g.espncdn.com/lm-static/ffl/images/ffl-shield-shield.svg";
    console.log(
      team["name"],
      url,
      extension,
      imageExtensions.includes(extension)
    );
    return (
      <div className="flex align-items-center">
        <Avatar image={url} size="large" shape="circle" />
        <span className="teamName">{team["team"]}</span>
      </div>
    );
  };

  return (
    <div className="leaderboard">
      <div className="hidden sm:flex leaderboard-heading">
        <div className="league-name">
          <span>{leagueName}</span>
        </div>
        <div className="season-title">
          <span>{seasonName}</span>
        </div>
      </div>
      <div className="sm:mt-5 leaderboard-table">
        <DataTable
          value={standing}
          showGridlines
          sortMode="multiple"
          tableStyle={{ minWidth: "50rem" }}
          selectionMode="single"
          stripedRows
        >
          <Column field="rank" header="RK" sortable></Column>
          <Column body={teamBodyTemplate} header="TEAM"></Column>
          <Column field="pf" header="PF" sortable></Column>
          <Column field="pa" header="PA" sortable></Column>
          <Column field="pct" header="PCT" sortable></Column>
          <Column field="gb" header="GB" sortable></Column>
          <Column field="div" header="DIV"></Column>
          <Column field="home" header="HOME"></Column>
          <Column field="away" header="AWAY"></Column>
        </DataTable>
      </div>
    </div>
  );
}

export default Leaderboard;
