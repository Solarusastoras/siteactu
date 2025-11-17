import './App.scss';
import Home from './Page/Home';
import Weather from './Page/Weather';
import Footer from './Common/Footer';


function App() {
  return (
    
    <div className="App">
     
      <Weather />
      <Home />
      <Footer />
    </div>
  );
}

export default App;
