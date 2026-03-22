import React from 'react';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  return (
    <div className="dashboard-page">
      <h1>GTO Idiot</h1>
      <Link to="/play">Start Game</Link>
      <Link to="/history">History</Link>
      <Link to="/report">Report</Link>
      <Link to="/settings">Settings</Link>
    </div>
  );
};

export default DashboardPage;
