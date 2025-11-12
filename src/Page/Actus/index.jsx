import ActuFrance from "./France";
import ActuMonde from "./Monde";
import "./actus.scss";


function Actus() {
  return (
    <div className="actus-container">
      <div className="actus-grid">
        <div className="actus-column">
          <ActuFrance />
        </div>
        <div className="actus-column">
          <ActuMonde />
        </div>
      </div>
    </div>
  );
}
export default Actus;