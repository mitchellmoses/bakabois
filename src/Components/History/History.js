import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import historicalData from '../../data/historicalData.json'; // Assume this file exists
import './History.css';

const History = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // In a real app, you might fetch this from a local database or API
    setHistory(historicalData);
  }, []);

  return (
    <div className="history-container">
      <h2>League History</h2>
      <DataTable value={history} className="history-table" stripedRows>
        <Column field="year" header="Year" sortable />
        <Column field="leagueAWinner" header="League A Winner" />
        <Column field="leagueAScore" header="League A Score" />
        <Column field="leagueBWinner" header="League B Winner" />
        <Column field="leagueBScore" header="League B Score" />
      </DataTable>
    </div>
  );
};

export default History;