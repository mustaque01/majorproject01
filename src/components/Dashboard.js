import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import StatsOverview from './StatsOverview';
import ProgressChart from './ProgressChart';
import CurrentFocus from './CurrentFocus';
import RecentResources from './RecentResources';
import CreateNewPath from './CreateNewPath';

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        
        <main className="p-6">
          <StatsOverview />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ProgressChart />
            <CurrentFocus />
            <RecentResources />
            <CreateNewPath />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
