import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Avatar } from "primereact/avatar";
import axios from "axios";
import "./Leaderboard.css";
import { Dropdown } from "primereact/dropdown";

function Leaderboard(props) {
  const [leagueName, setLeagueName] = useState("");
  const [seasonName, setSeasonName] = useState("");
  const [standing, setStanding] = useState([]);

  useEffect(() => {
    if (!props.leagueType || props.leagueType === "Overall") {
      fetchAll();
    } else if (props.leagueType === "League 1") {
      fetchLeague(1446375);
    } else if (props.leagueType === "League 2") {
      fetchLeague(1869404038);
    }
  }, [props.leagueType]);

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
    try {
      const [league1Response, league2Response] = await Promise.all([
        axios.get(
          "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/1446375?view=mLiveScoring&view=mMatchupScore&view=mRoster&view=mSettings&view=mStandings&view=mStatus&view=mTeam&view=modular&view=mNav"
        ),
        axios.get(
          "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/1869404038?view=mLiveScoring&view=mMatchupScore&view=mRoster&view=mSettings&view=mStandings&view=mStatus&view=mTeam&view=modular&view=mNav"
        )
      ]);

      let _standing = [];
      const league1Data = league1Response.data;
      const league2Data = league2Response.data;

      [league1Data, league2Data].forEach((result, index) => {
        result.teams.forEach((team) => {
          let managerName = "";
          result.members.forEach((member) => {
            if (team.owners?.includes(member.id)) {
              if (managerName) managerName += ", ";
              managerName += `${member.firstName} ${member.lastName}`;
            }
          });
          
          _standing.push({
            rank: team.playoffSeed,
            name: team.name,
            manager: managerName || "None",
            team: `${team.name} (${managerName || "None"})`,
            logo: team.logo,
            pf: team.record.overall.pointsFor,
            pa: parseFloat(team.record.overall.pointsAgainst).toFixed(1),
            pct: team.record.overall.percentage,
            gb: team.record.overall.gamesBack,
            div: `${team.record.division.wins}-${team.record.division.losses}-${team.record.division.ties}`,
            home: `${team.record.home.wins}-${team.record.home.losses}-${team.record.home.ties}`,
            away: `${team.record.away.wins}-${team.record.away.losses}-${team.record.away.ties}`,
            league: index === 0 ? league1Data.settings.name : league2Data.settings.name
          });
        });
      });

      _standing.sort((a, b) => {
        if (a.pct !== b.pct) {
          return b.pct - a.pct;
        }
        return b.pf - a.pf;
      });

      _standing.forEach((team, index) => {
        team.rank = index + 1;
      });

      setLeagueName(`${league1Data.settings.name}, ${league2Data.settings.name}`);
      setSeasonName("Overall Standings");
      setStanding(_standing);
    } catch (error) {
      console.error("Error fetching leagues:", error);
    }
  };

  const teamBodyTemplate = (team) => {
    let url = team["logo"];
    const imageExtensions = [".jpg", ".jpeg", ".gif", ".bmp", ".png", ".svg"];
    const extension = url.substring(url.lastIndexOf(".")).toLowerCase();
    if (imageExtensions.includes(extension) === false)
      url = "https://g.espncdn.com/lm-static/ffl/images/ffl-shield-shield.svg";
    
    return (
      <div className="team-cell">
        <div className="team-compact">
          <div className="team-stack">
            <Avatar image={url} size="large" shape="circle" className="team-avatar" />
            <div className="team-info">
              <span className="team-name" title={`${team["name"]} (${team["manager"]})`}>
                {team["name"]}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const recordTemplate = (rowData, field) => {
    return <span className="record-cell">{rowData[field]}</span>;
  };

  const rankTemplate = (rowData) => {
    return <span className="rank-cell">{rowData.rank}</span>;
  };

  const pointsTemplate = (rowData, field) => {
    return <span className="points-cell">{parseFloat(rowData[field]).toFixed(1)}</span>;
  };

  return (
    <div className="leaderboard-wrapper">
      <div className="section-title-container">
        <div className="section-title-background"></div>
        <h1 className="section-title">{leagueName}</h1>
        {seasonName && <p className="section-subtitle">{seasonName}</p>}
      </div>

      <div className="filters-container">
        <div className="filter-group">
          <label>League</label>
          <Dropdown
            value={props.leagueType}
            options={[
              { label: 'Overall', value: 'Overall' },
              { label: 'League 1', value: 'League 1' },
              { label: 'League 2', value: 'League 2' }
            ]}
            onChange={(e) => props.onLeagueChange?.(e.value)}
            className="league-dropdown"
            placeholder="Select League"
          />
        </div>
      </div>

      <DataTable
        value={standing}
        className="modern-table"
        showGridlines
        sortMode="multiple"
        removableSort
        sortField="rank"
        sortOrder={1}
        tableStyle={{ minWidth: "50rem" }}
        selectionMode="single"
        stripedRows
      >
        <Column field="rank" header="Rank" sortable body={rankTemplate} className="rank-column" />
        <Column body={teamBodyTemplate} header="Team" className="team-column" />
        <Column field="pf" header="PF" sortable body={(row) => pointsTemplate(row, 'pf')} className="points-column" />
        <Column field="pa" header="PA" sortable body={(row) => pointsTemplate(row, 'pa')} className="points-column" />
        <Column field="pct" header="PCT" sortable className="pct-column" />
        <Column field="gb" header="GB" sortable className="gb-column" />
        <Column field="div" header="DIV" body={(row) => recordTemplate(row, 'div')} className="record-column" />
        <Column field="home" header="HOME" body={(row) => recordTemplate(row, 'home')} className="record-column" />
        <Column field="away" header="AWAY" body={(row) => recordTemplate(row, 'away')} className="record-column" />
      </DataTable>
    </div>
  );
}

export default Leaderboard;
