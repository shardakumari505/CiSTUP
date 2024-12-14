import './App.css';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Map from './components/map';
import 'leaflet/dist/leaflet.css';


const routerConfig = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
};

function App() {
  return (
    <div className="App">
      <Router {...routerConfig}>
        <Routes>
          <Route path="/" element={<Map />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
