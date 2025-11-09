import './App.scss';
import AllSports from './Page/Sports/AllSports';
import Weather from './Page/Weather';
import Culture from './Page/Culture';

function App() {
  return (
    <div className="App">
      <AllSports />
      <Weather />
      <Culture />
    </div>
  );
}

export default App;
