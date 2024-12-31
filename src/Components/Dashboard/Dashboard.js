import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrophy } from 'react-icons/fa';
import ChampionBanner from '../ChampionBanner/ChampionBanner';

const Dashboard = () => {
  const [championshipTeams, setChampionshipTeams] = useState({});

  const fetchChampionshipScores = async () => {
    try {
      const [league1Response, league2Response] = await Promise.all([
        axios.get(
          "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/1446375?view=mMatchup&view=mMatchupScore&view=mRoster&view=mTeam&scoringPeriodId=17"
        ),
        axios.get(
          "https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/2024/segments/0/leagues/1869404038?view=mMatchup&view=mMatchupScore&view=mRoster&view=mTeam&scoringPeriodId=17"
        )
      ]);

      const gay = league2Response.data.teams.find(team => team.id === 7);
      const theBeast = league1Response.data.teams.find(team => 
        team.name.toUpperCase().includes('THE BEAST')
      );

      if (gay && theBeast) {
        setChampionshipTeams({
          gay: {
            name: gay.name,
            score: 118.78
          },
          theBeast: {
            name: theBeast.name,
            score: 120.72
          }
        });
      }
    } catch (error) {
      console.error('Error fetching championship scores:', error);
    }
  };

  useEffect(() => {
    fetchChampionshipScores();
    const interval = setInterval(fetchChampionshipScores, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-container">
      <div className="champion-banner-wrapper">
        <ChampionBanner />
      </div>
      <div className="championship-score-banner">
        <div className="championship-score-header">
          <FaTrophy className="championship-trophy" />
          <h2>BAKABOWL™ XI</h2>
          <FaTrophy className="championship-trophy" />
        </div>
        <div className="championship-teams">
          <div className="championship-team">
            <div className="team-name-champ">gay</div>
            <div className="team-score-champ">
              {championshipTeams.gay?.score || '118.78'}
            </div>
          </div>
          <div className="championship-vs">VS</div>
          <div className="championship-team">
            <div className="team-name-champ">THE BEAST</div>
            <div className="team-score-champ">
              {championshipTeams.theBeast?.score || '120.72'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 