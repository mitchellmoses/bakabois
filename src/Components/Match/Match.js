import React from "react";
import "./Match.css";
import { FaTrophy, FaFire, FaCrown } from 'react-icons/fa';

function Match(props) {
  const handleClick = () => {
    if (props.leagueId && props.id && props.showBoxScore) {
      console.log('Opening box score for:', { leagueId: props.leagueId, matchId: props.id });
      props.showBoxScore(props.leagueId, props.id);
    }
  };

  // Compare scores to determine winner/loser
  const homeScore = parseFloat(props.home.score);
  const awayScore = parseFloat(props.away.score);
  const homeIsWinning = homeScore > awayScore;
  const awayIsWinning = awayScore > homeScore;

  // Determine if this is a winners bracket playoff match
  const isWinnersBracket = props.matchupType && 
    ['Championship', 'Semifinal', 'Quarterfinal'].includes(props.matchupType);

  return (
    <div className={`match-container ${props.matchupType ? 'playoff-match' : ''} ${isWinnersBracket ? 'winners-bracket' : ''}`}>
      {props.matchupType && (
        <div className={`playoff-type ${isWinnersBracket ? 'winners' : 'consolation'}`}>
          {isWinnersBracket && <FaTrophy className="playoff-icon" />}
          {props.matchupType}
          {isWinnersBracket && <FaTrophy className="playoff-icon" />}
        </div>
      )}
      
      <div className="match-card" onClick={handleClick}>
        <div className="match-content">
          <div className="team-column">
            <div className="team-info">
              {isWinnersBracket && homeIsWinning && <FaCrown className="winner-crown" />}
              <img src={props.home.logo} alt="" className="team-logo" />
              <span className="team-name">
                {props.home.name}
                {isWinnersBracket && props.home.seed && 
                  <span className="seed-number">#{props.home.seed}</span>
                }
              </span>
            </div>
            <div className="team-info">
              {isWinnersBracket && awayIsWinning && <FaCrown className="winner-crown" />}
              <img src={props.away.logo} alt="" className="team-logo" />
              <span className="team-name">
                {props.away.name}
                {isWinnersBracket && props.away.seed && 
                  <span className="seed-number">#{props.away.seed}</span>
                }
              </span>
            </div>
          </div>
          <div className="score-column">
            <span className={`score ${props.projected ? 'projected-score' : 'live-score'} 
              ${homeIsWinning ? 'winning' : homeScore < awayScore ? 'losing' : ''} 
              ${isWinnersBracket ? 'playoff-score' : ''}`}>
              {props.home.score}
              {isWinnersBracket && homeIsWinning && <FaFire className="score-fire" />}
            </span>
            <span className={`score ${props.projected ? 'projected-score' : 'live-score'} 
              ${awayIsWinning ? 'winning' : awayScore < homeScore ? 'losing' : ''} 
              ${isWinnersBracket ? 'playoff-score' : ''}`}>
              {props.away.score}
              {isWinnersBracket && awayIsWinning && <FaFire className="score-fire" />}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Match;
