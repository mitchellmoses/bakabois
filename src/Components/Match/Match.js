import React from "react";
import "./Match.css";

function Match(props) {
  const handleClick = () => {
    console.log("Clicked match:", {
      leagueId: props.leagueId,
      id: props.id
    });
    
    if (props.leagueId && props.id) {
      props.showBoxScore(props.leagueId, props.id);
    }
  };

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
          <span className={`score ${props.projected ? 'projected-score' : 'live-score'}`}>
            {props.home.score}
          </span>
          <span className={`score ${props.projected ? 'projected-score' : 'live-score'}`}>
            {props.away.score}
          </span>
        </div>
      </div>
    </div>
  );
}

export default Match;
