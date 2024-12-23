// Add after the section-title-container and before Headlines
<div className="championship-score-banner">
  <div className="championship-score-header">
    <FaTrophy className="championship-trophy" />
    <h2>CHAMPIONSHIP MATCHUP</h2>
    <FaTrophy className="championship-trophy" />
  </div>
  <div className="championship-teams">
    <div className="championship-team">
      <img src={gay?.logo} alt="" className="team-logo-champ" />
      <span className="team-name-champ">{gay?.name || 'Loading...'}</span>
      <span className="team-score-champ">{(gay?.score || 0).toFixed(2)}</span>
    </div>
    <div className="championship-vs">VS</div>
    <div className="championship-team">
      <img src={theBeast?.logo} alt="" className="team-logo-champ" />
      <span className="team-name-champ">{theBeast?.name || 'Loading...'}</span>
      <span className="team-score-champ">{(theBeast?.score || 0).toFixed(2)}</span>
    </div>
  </div>
</div>

<Headlines /> 