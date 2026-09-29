import React, { useState } from 'react';
import { useTelemetry } from './hooks/useTelemetry';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { HomePage } from './pages/HomePage';
import { OceanographyPage } from './pages/OceanographyPage';
import { AtmosphericPage } from './pages/AtmosphericPage';
import { BatteryPage } from './pages/BatteryPage';
import { FleetHealthPage } from './pages/FleetHealthPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SimulationPage } from './pages/SimulationPage';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('home');

  const {
    fleet,
    obstacles,
    events,
    isConnected,
    selectedBoatId,
    setSelectedBoatId,
    selectedBoat,
    fleetSummary
  } = useTelemetry();

  return (
    <div className="min-h-screen bg-aurora-dark text-slate-100 flex overflow-hidden font-sans">
      {/* AquaSentinel-inspired Compact Left Vertical Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Top Command Bar */}
        <TopBar isConnected={isConnected} fleetSummary={fleetSummary} />

        {/* Dynamic Main Page Views */}
        <main className="flex-1">
          {activeTab === 'home' && (
            <HomePage
              fleet={fleet}
              obstacles={obstacles}
              selectedBoatId={selectedBoatId}
              onSelectBoat={setSelectedBoatId}
              selectedBoat={selectedBoat}
              fleetSummary={fleetSummary}
            />
          )}
          {activeTab === 'oceanography' && (
            <OceanographyPage
              fleet={fleet}
              selectedBoatId={selectedBoatId}
              onSelectBoat={setSelectedBoatId}
            />
          )}
          {activeTab === 'atmospheric' && (
            <AtmosphericPage
              fleet={fleet}
              selectedBoatId={selectedBoatId}
              onSelectBoat={setSelectedBoatId}
            />
          )}
          {activeTab === 'battery' && (
            <BatteryPage
              fleet={fleet}
              selectedBoatId={selectedBoatId}
              onSelectBoat={setSelectedBoatId}
            />
          )}
          {activeTab === 'fleet_health' && <FleetHealthPage />}
          {activeTab === 'analytics' && <AnalyticsPage fleet={fleet} />}
          {activeTab === 'simulation' && (
            <SimulationPage
              fleet={fleet}
              selectedBoatId={selectedBoatId}
              onSelectBoat={setSelectedBoatId}
            />
          )}
        </main>
      </div>
    </div>
  );
}
