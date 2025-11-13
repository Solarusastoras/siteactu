import React, { useState } from "react";
import "./_recre.scss";
import Echecs from "./Jeux/Echecs";
import CultureQuest from "./Jeux/CultureQuest";
import Biathlon from "./Jeux/Biathlon";

import Yams from "./Jeux/Yams";
import FamilleOr from "./Jeux/FamilleOr";
import Puissance4 from "./Jeux/Puissance4";
import jeuxData from "../../Data/DataJeux/DataListeJeux.json";

const COMPONENTS = {
  echecs: Echecs,
  biathlon: Biathlon,
  puissance4: Puissance4,
  culturequest: CultureQuest,

  yams: Yams,
  FamilleOr: FamilleOr,
};

function Recre() {
  const [activeGame, setActiveGame] = useState("");
  const [hoveredGame, setHoveredGame] = useState("");

  const ActiveGameComponent = activeGame ? COMPONENTS[activeGame] : null;

  return (
    <div className="recre-section">
      <div className="recre-content">
        <h2 className="recre-title">Jeux</h2>

        {!activeGame ? (
          <div className="recre-intro">
            <div className="recre-games-grid">
              {jeuxData.jeux.map((game) => (
                <div
                  key={game.id}
                  className={`recre-game-card ${hoveredGame === game.id ? "hovered" : ""}`}
                  style={{
                    backgroundColor: `${game.color}15`,
                    borderColor: game.color,
                  }}
                  onClick={() => setActiveGame(game.id)}
                  onMouseEnter={() => setHoveredGame(game.id)}
                  onMouseLeave={() => setHoveredGame("")}
                >
                  <div className="recre-game-icon">{game.icon}</div>
                  <h3>{game.nom}</h3>
                  <p className="recre-game-description">{game.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="recre-game-container">
            <button className="recre-back-button" onClick={() => setActiveGame("")}>
             élection des jeux
            </button>
            {ActiveGameComponent && <ActiveGameComponent />}
          </div>
        )}
      </div>
    </div>
  );
}

export default Recre;
