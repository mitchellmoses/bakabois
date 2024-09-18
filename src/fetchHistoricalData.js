const axios = require('axios');
const fs = require('fs');

const LEAGUE_A_ID = 1446375; // Replace with your League A ID
const LEAGUE_B_ID = 1869404038; // Replace with your League B ID
const LEAGUE_A_START_YEAR = 2013; // Replace with League A's start year
const LEAGUE_B_START_YEAR = 2021; // Replace with League B's start year
const END_YEAR = 2024; // Replace with the current year

async function fetchLeagueData(leagueId, year) {
  const url = `https://fantasy.espn.com/apis/v3/games/ffl/leagueHistory/${leagueId}?seasonId=${year}&view=mMatchup&view=mScoreboard`;
  try {
    const response = await axios.get(url);
    return response.data[0];
  } catch (error) {
    console.error(`Error fetching data for league ${leagueId} in ${year}:`, error.message);
    return null;
  }
}

function getWinnerAndScore(leagueData) {
  if (!leagueData || !leagueData.schedule) return { winner: 'N/A', score: 0 };

  const finalMatchup = leagueData.schedule.find(match => match.matchupPeriodId === leagueData.finalMatchupPeriodId);
  if (!finalMatchup) return { winner: 'N/A', score: 0 };

  const winner = finalMatchup.home.totalPoints > finalMatchup.away.totalPoints ? finalMatchup.home : finalMatchup.away;
  return {
    winner: leagueData.teams.find(team => team.id === winner.teamId)?.name || 'Unknown',
    score: winner.totalPoints.toFixed(2)
  };
}

async function fetchAllHistoricalData() {
  const historicalData = [];

  for (let year = Math.min(LEAGUE_A_START_YEAR, LEAGUE_B_START_YEAR); year <= END_YEAR; year++) {
    console.log(`Fetching data for ${year}...`);
    
    let leagueAResult = { winner: 'N/A', score: 0 };
    let leagueBResult = { winner: 'N/A', score: 0 };

    if (year >= LEAGUE_A_START_YEAR) {
      const leagueAData = await fetchLeagueData(LEAGUE_A_ID, year);
      if (leagueAData) {
        leagueAResult = getWinnerAndScore(leagueAData);
      }
    }

    if (year >= LEAGUE_B_START_YEAR) {
      const leagueBData = await fetchLeagueData(LEAGUE_B_ID, year);
      if (leagueBData) {
        leagueBResult = getWinnerAndScore(leagueBData);
      }
    }

    historicalData.push({
      year,
      leagueAWinner: leagueAResult.winner,
      leagueAScore: leagueAResult.score,
      leagueBWinner: leagueBResult.winner,
      leagueBScore: leagueBResult.score
    });
  }

  return historicalData;
}

fetchAllHistoricalData().then(data => {
  fs.writeFileSync('src/data/historicalData.json', JSON.stringify(data, null, 2));
  console.log('Historical data has been saved to src/data/historicalData.json');
}).catch(error => {
  console.error('Error fetching historical data:', error);
});
