import React from "react";
import "./Match.css";

function Match(props) {
  const handleClick = () => {
    if (props.leagueId && props.id) {
      props.showBoxScore(props.leagueId, props.id);
    }
  };

  // Compare scores to determine winner/loser
  const homeScore = parseFloat(props.home.score);
  const awayScore = parseFloat(props.away.score);
  const homeIsWinning = homeScore > awayScore;
  const awayIsWinning = awayScore > homeScore;

  return (
    <div className="match-card" onClick={handleClick}>
      <div className="match-content">
        <div className="team-column">
          <div className="team-info">
            <img src={props.home.logo} alt="" className="team-logo" />
            <span className="team-name">{props.home.name}</span>
          </div>
          <div className="team-info">
            <img src={props.away.logo} alt="" className="team-logo" />
            <span className="team-name">{props.away.name}</span>
          </div>
        </div>
        <div className="score-column">
          <span className={`score ${props.projected ? 'projected-score' : 'live-score'} ${homeIsWinning ? 'winning' : homeScore < awayScore ? 'losing' : ''}`}>
            {props.home.score}
          </span>
          <span className={`score ${props.projected ? 'projected-score' : 'live-score'} ${awayIsWinning ? 'winning' : awayScore < homeScore ? 'losing' : ''}`}>
            {props.away.score}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Match;
