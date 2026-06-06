import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import PortfolioPublic from './PortfolioPublic';
import NotFound from './components/pages/NotFound';

function App() {
  return (
    <Router>
      <div className="app-container" style={{ position: 'relative', height: '100vh', overflowY: 'auto' }}>
        <Routes>
          <Route path="/" element={<PortfolioPublic />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
