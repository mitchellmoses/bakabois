import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import { Avatar } from "primereact/avatar";
import axios from "axios";
import "./Boxscore.css";

function Boxscore(props) {
  const [playerList, setPlayerList] = useState([]);

  const headerGroup = (
    <ColumnGroup>
      <Row>
        <Column 
          header="STARTERS" 
          colSpan={2} 
          style={{ 
            borderRight: '1px solid #eee',
            backgroundColor: '#f8f9fa',
            color: '#1e3c72',
            fontWeight: '600'
          }}
        />
        <Column 
          header={`NFL WEEK ${props.matchupPeriodId}`} 
          colSpan={3} 
          style={{ 
            borderRight: '1px solid #eee',
            backgroundColor: '#f8f9fa',
            color: '#1e3c72',
            fontWeight: '600'
          }}
        />
        <Column 
          header="TOTAL" 
          colSpan={1}
          style={{ 
            backgroundColor: '#f8f9fa',
            color: '#1e3c72',
            fontWeight: '600'
          }}
        />
      </Row>
      <Row>
        <Column header="SLOT" colSpan={1} />
        <Column 
          header="PLAYER, TEAM POS" 
          colSpan={1} 
          style={{ borderRight: '1px solid #eee' }}
        />
        <Column header="OPP" colSpan={1} />
        <Column header="STATUS" colSpan={1} />
        <Column 
          header="PROJ" 
          colSpan={1} 
          style={{ borderRight: '1px solid #eee' }}
        />
        <Column header="FPTS" colSpan={1} />
      </Row>
    </ColumnGroup>
  );

  return (
    <div className="boxscore">
      <div className="boxscore-header">
        <div className="boxscore-logo">
          <Avatar image={props.logo} shape="circle" />
        </div>
        <div className="boxscore-title">
          <span>{props.name} Box Score</span>
        </div>
      </div>
      <div className="boxscore-data">
        <DataTable
          value={playerList}
          headerColumnGroup={headerGroup}
          className="modern-table"
          showGridlines
          stripedRows
        >
          {/* Add your columns here */}
        </DataTable>
      </div>
    </div>
  );
}

export default Boxscore;
