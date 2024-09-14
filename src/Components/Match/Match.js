import React, { useState, useEffect, useRef } from "react";
import { Button } from "primereact/button";
import { Avatar } from "primereact/avatar";
import "./Match.css";

function Match(props) {
  const showBoxScore = () => {
    props.showBoxScore(props.id);
  };
  return (
    <div className="lg:mx-8 match" onClick={showBoxScore}>
      <div className="teams">
        <div className="away">
          <div className="team-info">
            <div className="team-logo">
              <Avatar image={props.away.logo} size="large" shape="circle" style={{ position: "relative", top: "50%", transform: "translate(0%, -50%" }} />
            </div>
            <div className="team-name">
              <div style={{ position: "relative", top: "50%", transform: "translate(0%, -50%" }}>{props.away.name}</div>
            </div>
          </div>
          <div><div className="score">
            <div>{props.away.score}</div>
            
          </div></div>
        </div>
        <div className="home">
          <div className="team-info">
            <div className="team-logo">
              <Avatar image={props.home.logo} size="large" shape="circle" style={{ position: "relative", top: "50%", transform: "translate(0%, -50%" }} />
            </div>
            <div className="team-name">
              <div style={{ position: "relative", top: "50%", transform: "translate(0%, -50%" }}>{props.home.name}</div>
            </div>
          </div>
          <div><div className="score">
            <div>{props.home.score}</div>
            
          </div></div>
        </div>
      </div>
      <div className="hidden sm:block tools">
        <div className="box-score">
          <Button label="Box Score" text raised onClick={showBoxScore} />
        </div>
      </div>
    </div>
  );
}

export default Match;
