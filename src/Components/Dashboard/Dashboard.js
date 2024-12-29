import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrophy } from 'react-icons/fa';

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

      console.log('Raw team data:', { gay, theBeast });

      if (gay && theBeast) {
        const processRoster = (team) => {
          console.log(`Processing roster for ${team.name}:`, team.roster);
          
          if (!team?.roster?.entries) {
            console.log('No roster entries found');
            return [];
          }
          
          const processedRoster = team.roster.entries.map(entry => {
            const playerStats = entry.playerPoolEntry?.player?.stats || [];
            const week17Stats = playerStats.find(
              stat => stat.scoringPeriodId === 17 && stat.statSourceId === 0
            );
            
            console.log('Processing entry:', {
              lineupSlotId: entry.lineupSlotId,
              playerName: entry.playerPoolEntry?.player?.fullName,
              stats: week17Stats
            });
            
            return {
              position: entry.lineupSlotId,
              points: week17Stats?.appliedTotal || 0
            };
          });

          console.log('Processed roster:', processedRoster);
          return processedRoster;
        };

        const championshipData = {
          gay: {
            name: gay.name,
            logo: gay.logo,
            roster: processRoster(gay)
          },
          theBeast: {
            name: theBeast.name,
            logo: theBeast.logo,
            roster: processRoster(theBeast)
          }
        };

        console.log('Setting championship data:', championshipData);
        setChampionshipTeams(championshipData);
      }
    } catch (error) {
      console.error('Error fetching championship scores:', error);
    }
  };

  const calculateStartingScore = (roster) => {
    console.log('Calculating score for roster:', roster);
    
    if (!roster) {
      console.log('No roster provided');
      return 0;
    }
    
    const starters = roster.filter(player => {
      const isStarter = player.position !== 20 && player.position !== 21;
      console.log(`Position ${player.position}: ${isStarter ? 'Starter' : 'Bench'}`);
      return isStarter;
    });
    
    console.log('Filtered starters:', starters);
    
    const total = starters.reduce((total, player) => {
      const points = parseFloat(player.points) || 0;
      console.log(`Adding points: ${points}`);
      return total + points;
    }, 0);
    
    console.log('Final total:', total);
    return total;
  };

  useEffect(() => {
    fetchChampionshipScores();
    const interval = setInterval(fetchChampionshipScores, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="championship-score-banner">
      <div className="championship-score-header">
        <FaTrophy className="championship-trophy" />
        <h2>BAKABOWL™ XI</h2>
        <FaTrophy className="championship-trophy" />
      </div>
      <div className="championship-teams">
        <div className="championship-team">
          <img src={championshipTeams.gay?.logo} alt="" className="team-logo-champ" />
          <span className="team-name-champ">{championshipTeams.gay?.name || 'Loading...'}</span>
          <span className="team-score-champ">
            {(calculateStartingScore(championshipTeams.gay?.roster) || 0).toFixed(2)}
          </span>
        </div>
        <div className="championship-vs">VS</div>
        <div className="championship-team">
          <img src={championshipTeams.theBeast?.logo} alt="" className="team-logo-champ" />
          <span className="team-name-champ">{championshipTeams.theBeast?.name || 'Loading...'}</span>
          <span className="team-score-champ">
            {(calculateStartingScore(championshipTeams.theBeast?.roster) || 0).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 