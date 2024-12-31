import React from 'react';
import './PastChampions.css';
import { FaCrown, FaTrophy, FaStar, FaAward } from 'react-icons/fa';
import { GiLaurelCrown, GiTrophyCup } from 'react-icons/gi';

const LEAGUE_CHAMPIONS = [
  {
    name: "The Beast",
    owner: "Kent",
    titles: 3,
    years: [2016, 2021, 2024],
    teamId: "3",
    leagueId: "1446375"
  },
  {
    name: "2 for 20",
    titles: 2,
    years: [2020, 2022],
    teamId: "1",
    leagueId: "1446375"
  },
  {
    name: "I'm Going to Corum",
    owner: "Austin",
    titles: 2,
    years: [2014, 2017],
    teamId: "4",
    leagueId: "1446375"
  },
  {
    name: "Chorizo",
    titles: 1,
    years: [2022],
    teamId: "7",
    leagueId: "1446375"
  },
  {
    name: "McBags",
    titles: 1,
    years: [2015],
    teamId: "5",
    leagueId: "1446375"
  },
  {
    name: "Fernando",
    titles: 1,
    years: [2019],
    teamId: "6",
    leagueId: "1446375"
  },
  {
    name: "b00fy",
    titles: 1,
    years: [2018],
    teamId: "1",
    leagueId: "1869404038"
  },
  {
    name: "Savage",
    titles: 1,
    years: [2023],
    teamId: "8",
    leagueId: "1446375"
  }
];

const DIVISION_CHAMPIONS = {
  2024: [
    {
      name: "The Beast",
      owner: "Kent",
      division: "League A"
    },
    {
      name: "Gay",
      owner: "Will",
      division: "League B"
    }
  ],
  2023: [
    {
      name: "Wes",
      division: "League A"
    },
    {
      name: "Savage",
      division: "League B"
    }
  ]
};

function PastChampions() {
  // Sort champions by:
  // 1. Number of titles (descending)
  // 2. Most recent championship year (descending)
  // 3. Name (alphabetically) as tiebreaker
  const sortedChampions = [...LEAGUE_CHAMPIONS].sort((a, b) => {
    // First sort by number of titles
    if (b.titles !== a.titles) {
      return b.titles - a.titles;
    }
    
    // Then sort by most recent championship year
    const mostRecentA = Math.max(...a.years);
    const mostRecentB = Math.max(...b.years);
    if (mostRecentB !== mostRecentA) {
      return mostRecentB - mostRecentA;
    }
    
    // Finally sort alphabetically if everything else is equal
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="past-champions-container">
      <div className="champions-header">
        <div className="trophy-icon-container">
          <GiTrophyCup className="trophy-icon" />
        </div>
        <h1 data-text="Hall of Champions">Hall of Champions</h1>
        <div className="trophy-icon-container">
          <GiTrophyCup className="trophy-icon" />
        </div>
      </div>

      <div className="champions-section">
        <h2>
          <FaCrown className="section-icon" />
          <span>BakaBowl Champions</span>
          <FaCrown className="section-icon" />
        </h2>
        <div className="champions-grid">
          {sortedChampions.map((champion) => {
            // Check if this is the most recent champion
            const isCurrentChamp = Math.max(...champion.years) === Math.max(...sortedChampions.flatMap(c => c.years));
            
            return (
              <div key={champion.name} className={`champion-card ${isCurrentChamp ? 'current-champion' : ''}`}>
                <div className="champion-banner">
                  <GiLaurelCrown className="crown-icon" />
                  <div className="champion-title">
                    <h3>{champion.name}</h3>
                    {champion.owner && <span className="owner-name">({champion.owner})</span>}
                  </div>
                  {isCurrentChamp && (
                    <div className="current-champion-badge">
                      <FaTrophy className="trophy-badge-icon" />
                      <span>Reigning Champ</span>
                    </div>
                  )}
                </div>
                <div className="champion-content">
                  <div className="years-list">
                    {champion.years.sort((a, b) => b - a).map((year) => (
                      <span key={year} className="year-tag">{year}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="division-section">
        <h2>
          <FaStar className="section-icon" />
          <span>League Champions</span>
          <FaStar className="section-icon" />
        </h2>
        {Object.entries(DIVISION_CHAMPIONS)
          .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
          .map(([year, champions]) => (
            <div key={year} className="year-section">
              <h3 className="year-header">{year}</h3>
              <div className="division-grid">
                {champions.map((champion) => (
                  <div key={`${year}-${champion.name}`} className="division-card">
                    <div className="division-banner">
                      <FaAward className="division-icon" />
                      <span className="division-name">{champion.division}</span>
                    </div>
                    <div className="division-content">
                      <h3>{champion.name}</h3>
                      {champion.owner && <p className="owner-name">{champion.owner}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default PastChampions; 