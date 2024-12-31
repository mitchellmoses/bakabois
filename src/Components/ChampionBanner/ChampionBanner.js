import React, { useEffect, useState } from 'react';
import './ChampionBanner.css';
import { FaCrown, FaTrophy, FaStar, FaFire } from 'react-icons/fa';
import axios from 'axios';

const ChampionBanner = () => {
  const [teamLogo, setTeamLogo] = useState('');

  useEffect(() => {
    // Fetch Kent's (The Beast) team logo from ESPN API
    const fetchTeamLogo = async () => {
      try {
        const response = await axios.get(
          'https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/1446375?view=mTeam'
        );
        
        // Find The Beast's team
        const kentTeam = response.data.teams.find(team => 
          team.name.toUpperCase().includes('THE BEAST')
        );
        if (kentTeam && kentTeam.logo) {
          setTeamLogo(kentTeam.logo);
        }
      } catch (error) {
        console.error('Error fetching team logo:', error);
        // Fallback to a default logo if the fetch fails
        setTeamLogo('https://g.espncdn.com/lm-static/ffl/images/default_logos/1.svg');
      }
    };

    fetchTeamLogo();
  }, []);

  return (
    <div className="champion-banner-2024">
      <div className="champion-banner-background-2024">
        <div className="floating-elements-2024">
          <FaStar className="floating-star star1" />
          <FaStar className="floating-star star2" />
          <FaStar className="floating-star star3" />
          <FaTrophy className="floating-trophy trophy1" />
          <FaTrophy className="floating-trophy trophy2" />
        </div>
        
        <div className="champion-content-2024">
          <div className="crown-section-2024">
            <FaCrown className="crown-icon" />
          </div>
          
          <div className="champion-main-2024">
            <div className="champion-image-container-2024">
              <img 
                src={teamLogo || 'https://g.espncdn.com/lm-static/ffl/images/default_logos/1.svg'} 
                alt="Champion Kent" 
                className="champion-image" 
              />
              <div className="champion-aura"></div>
            </div>
            
            <div className="champion-info-2024">
              <div className="champion-title-2024">
                <FaFire className="fire-icon" />
                <h1>BAKABOWL XI CHAMPION</h1>
                <FaFire className="fire-icon" />
              </div>
              <h2 className="champion-name-2024">Kent "The Beast"</h2>
              <div className="champion-stats-2024">
                <div className="stat-2024">
                  <span className="stat-value-2024">156.92</span>
                  <span className="stat-label-2024">Championship Points</span>
                </div>
                <div className="stat-2024">
                  <span className="stat-value-2024">10-3</span>
                  <span className="stat-label-2024">Regular Season</span>
                </div>
                <div className="stat-2024">
                  <span className="stat-value-2024">1,723.54</span>
                  <span className="stat-label-2024">Total Points</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="champion-ribbon"></div>
      <div className="championship-year">2024</div>
      <div className="crown-particles">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              '--x': `${Math.random() * 100 - 50}px`,
              '--y': `${Math.random() * 100 - 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ChampionBanner; 