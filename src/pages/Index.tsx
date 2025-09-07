"use client";

import React, { useState } from 'react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Train, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Play, 
  Pause,
  Settings,
  ZoomIn,
  ZoomOut,
  Maximize,
  Info,
  Radio,
  Activity,
  BarChart3,
  RefreshCw
} from "lucide-react";

// Color palette constants
const COLORS = {
  background: "#1A1A2E",
  primaryAccent: "#E94560",
  secondaryAccent: "#00C9A7",
  textHighContrast: "#F0F0F0",
  textMediumContrast: "#B0B0C0",
  borderAndSeparator: "#3B3B5C",
  alertCritical: "#FF6B6B",
  alertHigh: "#FFD166",
  alertMedium: "#4ECDC4",
  onTimeTrain: "#00C9A7",
  minorDelayTrain: "#FFD166",
  significantDelayTrain: "#FF6B6B",
  freightTrain: "#8A4F7D",
  passengerTrain: "#6A5ACD",
  signalGreen: "#00C9A7",
  signalYellow: "#FFD166",
  signalRed: "#FF6B6B",
  signalOff: "#3B3B5C"
};

// Mock data
const stations = [
  {
    id: "city-station",
    name: "Central Station",
    platforms: 6,
    occupiedPlatforms: 3,
    trains: [
      { id: "T123", name: "Express 123", type: "passenger", status: "on-time", platform: 2 },
      { id: "T456", name: "Local 456", type: "passenger", status: "minor-delay", platform: 4 },
      { id: "F789", name: "Freight 789", type: "freight", status: "on-time", platform: 6 }
    ]
  },
  {
    id: "north-station",
    name: "North Junction",
    platforms: 4,
    occupiedPlatforms: 2,
    trains: [
      { id: "T789", name: "Express 789", type: "passenger", status: "on-time", platform: 1 },
      { id: "T012", name: "Regional 012", type: "passenger", status: "significant-delay", platform: 3 }
    ]
  },
  {
    id: "south-station",
    name: "South Terminal",
    platforms: 8,
    occupiedPlatforms: 5,
    trains: [
      { id: "T345", name: "Express 345", type: "passenger", status: "on-time", platform: 2 },
      { id: "T678", name: "Local 678", type: "passenger", status: "minor-delay", platform: 5 },
      { id: "T901", name: "Express 901", type: "passenger", status: "on-time", platform: 7 },
      { id: "F234", name: "Freight 234", type: "freight", status: "on-time", platform: 8 }
    ]
  }
];

const aiRecommendations = [
  {
    id: "rec1",
    title: "ALLOCATE PLATFORM: Assign Train 67890 to Platform 3, Central Station",
    reasoning: "Prevents conflict with inbound express and frees up Platform 1",
    priority: "HIGH",
    station: "Central Station"
  },
  {
    id: "rec2",
    title: "SIGNAL ADJUSTMENT: Update signals for North Junction approach",
    reasoning: "Optimize flow for 3 inbound trains within next 15 minutes",
    priority: "MEDIUM",
    station: "North Junction"
  },
  {
    id: "rec3",
    title: "DELAY MANAGEMENT: Hold Train 456 for 5 minutes to prevent platform conflict",
    reasoning: "South Terminal Platform 4 will be occupied by Train 901 in 8 minutes",
    priority: "CRITICAL",
    station: "South Terminal"
  }
];

const kpis = {
  punctuality: 94,
  averageDelay: 2.3,
  activeTrains: 12,
  congestedStations: 1,
  platformUtilization: 67
};

// Signal data for automated signaling system
const signals = [
  {
    id: "S001",
    name: "Signal A1",
    status: "green",
    trainId: "T123",
    position: "before",
    section: "Central-North"
  },
  {
    id: "S002", 
    name: "Signal A2",
    status: "red",
    trainId: "T456",
    position: "after",
    section: "Central-North"
  },
  {
    id: "S003",
    name: "Signal B1", 
    status: "yellow",
    trainId: "T789",
    position: "before",
    section: "North-South"
  },
  {
    id: "S004",
    name: "Signal B2",
    status: "green", 
    trainId: "T012",
    position: "after",
    section: "North-South"
  }
];

const Index = () => {
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [selectedTrain, setSelectedTrain] = useState<string | null>(null);
  const [simulationMode, setSimulationMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeTab, setActiveTab] = useState("map");
  const [signals, setSignals] = useState(signals);

  const getTrainColor = (status: string, type: string) => {
    if (status === "on-time") return COLORS.onTimeTrain;
    if (status === "minor-delay") return COLORS.minorDelayTrain;
    if (status === "significant-delay") return COLORS.significantDelayTrain;
    return type === "freight" ? COLORS.freightTrain : COLORS.passengerTrain;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "CRITICAL": return COLORS.alertCritical;
      case "HIGH": return COLORS.alertHigh;
      case "MEDIUM": return COLORS.alertMedium;
      default: return COLORS.secondaryAccent;
    }
  };

  const getPlatformStatusColor = (status: string) => {
    switch (status) {
      case "occupied": return COLORS.alertCritical;
      case "reserved": return COLORS.alertHigh;
      default: return COLORS.secondaryAccent;
    }
  };

  const getSignalColor = (status: string) => {
    switch (status) {
      case "green": return COLORS.signalGreen;
      case "yellow": return COLORS.signalYellow;
      case "red": return COLORS.signalRed;
      default: return COLORS.signalOff;
    }
  };

  // Button handlers
  const handleStartSimulation = () => {
    setSimulationMode(true);
    // Simulate signal changes during simulation
    setTimeout(() => {
      setSignals(prev => prev.map(signal => 
        signal.status === "green" ? { ...signal, status: "yellow" } : signal
      ));
    }, 2000);
  };

  const handleStopSimulation = () => {
    setSimulationMode(false);
    // Reset signals
    setSignals(prev => prev.map(signal => 
      signal.status === "yellow" ? { ...signal, status: "green" } : signal
    ));
  };

  const handleAcceptRecommendation = (recId: string) => {
    console.log(`Accepted recommendation: ${recId}`);
    // Implement recommendation logic here
  };

  const handleOverrideRecommendation = (recId: string) => {
    console.log(`Overrode recommendation: ${recId}`);
    // Override logic here
  };

  const handleViewStationMap = (stationId: string) => {
    setSelectedStation(stationId);
    setActiveTab("map");
  };

  const handleManagePlatforms = (stationId: string) => {
    setSelectedStation(stationId);
    setActiveTab("platforms");
  };

  const handleTrainClick = (trainId: string) => {
    setSelectedTrain(trainId);
  };

  const handlePlatformClick = (platformNumber: number, stationId: string) => {
    setSelectedStation(stationId);
    setActiveTab("platforms");
  };

  const handleHoldTrain = (trainId: string) => {
    console.log(`Holding train: ${trainId}`);
    // Implement hold train logic
  };

  const handleRerouteTrain = (trainId: string) => {
    console.log(`Rerouting train: ${trainId}`);
    // Implement reroute logic
  };

  const handleReservePlatform = (stationId: string) => {
    console.log(`Reserving platform for station: ${stationId}`);
    // Implement reserve platform logic
  };

  const handleClearPlatform = (stationId: string) => {
    console.log(`Clearing platform for station: ${stationId}`);
    // Implement clear platform logic
  };

  const handleApplyChanges = () => {
    console.log("Applying changes");
    // Implement apply changes logic
  };

  const handleDiscardChanges = () => {
    console.log("Discarding changes");
    // Implement discard changes logic
  };

  const toggleSignal = (signalId: string) => {
    setSignals(prev => prev.map(signal => 
      signal.id === signalId 
        ? { 
            ...signal, 
            status: signal.status === "green" ? "red" : 
                   signal.status === "red" ? "yellow" : "green"
          }
        : signal
    ));
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: COLORS.background, color: COLORS.textHighContrast }}>
      {/* Header with KPIs */}
      <header className="p-4 border-b" style={{ borderColor: COLORS.borderAndSeparator }}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: COLORS.primaryAccent }}>RailOptima</h1>
            <p className="text-sm" style={{ color: COLORS.textMediumContrast }}>AI-Powered Train Traffic Control System</p>
          </div>
          
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: COLORS.secondaryAccent }}>{kpis.punctuality}%</div>
              <div className="text-xs" style={{ color: COLORS.textMediumContrast }}>Punctuality</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: COLORS.secondaryAccent }}>{kpis.averageDelay}m</div>
              <div className="text-xs" style={{ color: COLORS.textMediumContrast }}>Avg Delay</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: COLORS.secondaryAccent }}>{kpis.activeTrains}</div>
              <div className="text-xs" style={{ color: COLORS.textMediumContrast }}>Active Trains</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: kpis.congestedStations > 0 ? COLORS.alertCritical : COLORS.secondaryAccent }}>
                {kpis.congestedStations}/{stations.length}
              </div>
              <div className="text-xs" style={{ color: COLORS.textMediumContrast }}>Congested</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: COLORS.secondaryAccent }}>{kpis.platformUtilization}%</div>
              <div className="text-xs" style={{ color: COLORS.textMediumContrast }}>Platform Use</div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Left Panel - Station Overview */}
        <div className="w-80 border-r p-4" style={{ borderColor: COLORS.borderAndSeparator }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: COLORS.primaryAccent }}>Station Overview</h2>
          <ScrollArea className="h-[calc(100vh-200px)]">
            {stations.map((station) => (
              <Card key={station.id} className="mb-4" style={{ backgroundColor: "#252545", borderColor: COLORS.borderAndSeparator }}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm" style={{ color: COLORS.textHighContrast }}>{station.name}</CardTitle>
                    <Badge variant="outline" style={{ borderColor: getPlatformStatusColor("occupied"), color: getPlatformStatusColor("occupied") }}>
                      {station.occupiedPlatforms}/{station.platforms}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Array.from({ length: station.platforms }).map((_, index) => {
                      const platformNumber = index + 1;
                      const platformTrain = station.trains.find(t => t.platform === platformNumber);
                      const status = platformTrain ? "occupied" : "empty";
                      
                      return (
                        <div key={platformNumber} className="flex items-center justify-between">
                          <span className="text-xs" style={{ color: COLORS.textMediumContrast }}>Platform {platformNumber}</span>
                          <div 
                            className="w-3 h-3 rounded-full cursor-pointer" 
                            style={{ backgroundColor: getPlatformStatusColor(status) }}
                            onClick={() => handlePlatformClick(platformNumber, station.id)}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      style={{ borderColor: COLORS.primaryAccent, color: COLORS.primaryAccent }}
                      onClick={() => handleViewStationMap(station.id)}
                    >
                      View Map
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      style={{ borderColor: COLORS.secondaryAccent, color: COLORS.secondaryAccent }}
                      onClick={() => handleManagePlatforms(station.id)}
                    >
                      Manage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </ScrollArea>
        </div>

        {/* Center Panel - Interactive Map */}
        <div className="flex-1 p-4">
          <div className="h-full bg-gray-900 rounded-lg relative overflow-hidden" style={{ backgroundColor: "#1E1E3F" }}>
            {/* Tab Navigation */}
            <div className="absolute top-4 left-4 z-10">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-48">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="map" style={{ color: COLORS.textHighContrast }}>Map</TabsTrigger>
                  <TabsTrigger value="signals" style={{ color: COLORS.textHighContrast }}>Signals</TabsTrigger>
                  <TabsTrigger value="charts" style={{ color: COLORS.textHighContrast }}>Charts</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Map Controls */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <Button size="sm" variant="outline" style={{ borderColor: COLORS.borderAndSeparator, color: COLORS.textHighContrast }}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" style={{ borderColor: COLORS.borderAndSeparator, color: COLORS.textHighContrast }}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" style={{ borderColor: COLORS.borderAndSeparator, color: COLORS.textHighContrast }}>
                <Maximize className="h-4 w-4" />
              </Button>
            </div>

            {/* Content based on active tab */}
            <div className="h-full flex items-center justify-center p-8">
              {activeTab === "map" && (
                <div className="text-center w-full">
                  <div className="mb-4">
                    <MapPin className="h-16 w-16 mx-auto mb-2" style={{ color: COLORS.primaryAccent }} />
                    <h3 className="text-xl font-bold" style={{ color: COLORS.textHighContrast }}>
                      {selectedStation ? stations.find(s => s.id === selectedStation)?.name : "Section Overview"}
                    </h3>
                  </div>
                  
                  {/* Simplified station visualization */}
                  <div className="space-y-8">
                    {stations.map((station) => (
                      <div key={station.id} className="relative">
                        <div className="text-sm mb-2" style={{ color: COLORS.textMediumContrast }}>{station.name}</div>
                        <div className="flex gap-2 justify-center">
                          {Array.from({ length: Math.min(station.platforms, 6) }).map((_, index) => {
                            const platformNumber = index + 1;
                            const platformTrain = station.trains.find(t => t.platform === platformNumber);
                            
                            return (
                              <div 
                                key={platformNumber}
                                className="w-12 h-8 border rounded flex items-center justify-center text-xs cursor-pointer hover:opacity-80 transition-opacity"
                                style={{ 
                                  borderColor: COLORS.borderAndSeparator,
                                  backgroundColor: platformTrain ? getTrainColor(platformTrain.status, platformTrain.type) : "#2A2A4E"
                                }}
                                onClick={() => handleTrainClick(platformTrain?.id || null)}
                              >
                                {platformTrain ? platformTrain.id.slice(-2) : platformNumber}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Train representations */}
                  <div className="mt-8 flex justify-center gap-4">
                    {stations.flatMap(station => station.trains.slice(0, 2)).map((train) => (
                      <div 
                        key={train.id}
                        className="flex items-center gap-2 px-3 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: getTrainColor(train.status, train.type) }}
                        onClick={() => handleTrainClick(train.id)}
                      >
                        <Train className="h-4 w-4" />
                        <span className="text-xs font-medium">{train.id}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "signals" && (
                <div className="w-full">
                  <h3 className="text-lg font-bold mb-6 text-center" style={{ color: COLORS.primaryAccent }}>Signal Control Panel</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {signals.map((signal) => (
                      <Card key={signal.id} className="p-4" style={{ backgroundColor: "#252545", borderColor: COLORS.borderAndSeparator }}>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-medium" style={{ color: COLORS.textHighContrast }}>{signal.name}</div>
                            <div className="text-xs" style={{ color: COLORS.textMediumContrast }}>
                              {signal.section} • {signal.position} train {signal.trainId}
                            </div>
                          </div>
                          <div 
                            className="w-4 h-4 rounded-full cursor-pointer border-2 border-gray-600"
                            style={{ backgroundColor: getSignalColor(signal.status) }}
                            onClick={() => toggleSignal(signal.id)}
                          />
                        </div>
                        <div className="text-xs" style={{ color: COLORS.textMediumContrast }}>
                          Status: {signal.status.toUpperCase()}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "charts" && (
                <div className="w-full">
                  <h3 className="text-lg font-bold mb-6 text-center" style={{ color: COLORS.primaryAccent }}>Performance Charts</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4" style={{ backgroundColor: "#252545", borderColor: COLORS.borderAndSeparator }}>
                      <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="h-5 w-5" style={{ color: COLORS.secondaryAccent }} />
                        <span className="font-medium" style={{ color: COLORS.textHighContrast }}>Train Delays</span>
                      </div>
                      <div className="h-32 bg-gray-800 rounded flex items-end justify-around p-2">
                        <div className="w-8 bg-blue-500 rounded-t" style={{ height: "60%" }}></div>
                        <div className="w-8 bg-blue-500 rounded-t" style={{ height: "80%" }}></div>
                        <div className="w-8 bg-blue-500 rounded-t" style={{ height: "40%" }}></div>
                        <div className="w-8 bg-blue-500 rounded-t" style={{ height: "70%" }}></div>
                        <div className="w-8 bg-blue-500 rounded-t" style={{ height: "90%" }}></div>
                      </div>
                    </Card>
                    <Card className="p-4" style={{ backgroundColor: "#252545", borderColor: COLORS.borderAndSeparator }}>
                      <div className="flex items-center gap-2 mb-4">
                        <Activity className="h-5 w-5" style={{ color: COLORS.primaryAccent }} />
                        <span className="font-medium" style={{ color: COLORS.textHighContrast }}>Platform Usage</span>
                      </div>
                      <div className="h-32 bg-gray-800 rounded flex items-end justify-around p-2">
                        <div className="w-8 bg-green-500 rounded-t" style={{ height: "70%" }}></div>
                        <div className="w-8 bg-green-500 rounded-t" style={{ height: "85%" }}></div>
                        <div className="w-8 bg-green-500 rounded-t" style={{ height: "60%" }}></div>
                        <div className="w-8 bg-green-500 rounded-t" style={{ height: "90%" }}></div>
                        <div className="w-8 bg-green-500 rounded-t" style={{ height: "75%" }}></div>
                      </div>
                    </Card>
                  </div>
                </div>
              )}
            </div>

            {/* Simulation Mode Banner */}
            {simulationMode && (
              <div className="absolute top-4 left-4 px-4 py-2 rounded" style={{ backgroundColor: COLORS.alertHigh }}>
                <span className="font-bold">SIMULATION ACTIVE</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - AI Recommendations */}
        <div className="w-80 border-l p-4" style={{ borderColor: COLORS.borderAndSeparator }}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold" style={{ color: COLORS.primaryAccent }}>AI Recommendations</h2>
            <Badge variant="outline" style={{ borderColor: COLORS.secondaryAccent, color: COLORS.secondaryAccent }}>
              {aiRecommendations.length} actions
            </Badge>
          </div>
          
          <ScrollArea className="h-[calc(100vh-200px)]">
            {aiRecommendations.map((rec) => (
              <Card key={rec.id} className="mb-4" style={{ backgroundColor: "#252545", borderColor: COLORS.borderAndSeparator }}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xs leading-tight" style={{ color: COLORS.textHighContrast }}>
                        {rec.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="outline" 
                          style={{ 
                            borderColor: getPriorityColor(rec.priority), 
                            color: getPriorityColor(rec.priority),
                            backgroundColor: `${getPriorityColor(rec.priority)}20`
                          }}
                        >
                          {rec.priority}
                        </Badge>
                        <span className="text-xs" style={{ color: COLORS.textMediumContrast }}>
                          {rec.station}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs mb-3" style={{ color: COLORS.textMediumContrast }}>
                    {rec.reasoning}
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      style={{ backgroundColor: COLORS.primaryAccent, color: "#FFFFFF" }}
                      onClick={() => handleAcceptRecommendation(rec.id)}
                    >
                      Accept
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      style={{ borderColor: COLORS.borderAndSeparator, color: COLORS.textMediumContrast }}
                      onClick={() => handleOverrideRecommendation(rec.id)}
                    >
                      Override
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </ScrollArea>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <footer className="p-4 border-t" style={{ borderColor: COLORS.borderAndSeparator }}>
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <Button 
              variant={simulationMode ? "default" : "outline"}
              style={simulationMode ? { backgroundColor: COLORS.alertHigh, color: "#000000" } : { borderColor: COLORS.borderAndSeparator, color: COLORS.textHighContrast }}
              onClick={simulationMode ? handleStopSimulation : handleStartSimulation}
            >
              {simulationMode ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {simulationMode ? "Stop Simulation" : "Start Simulation"}
            </Button>
            
            <Button variant="outline" style={{ borderColor: COLORS.borderAndSeparator, color: COLORS.textHighContrast }}>
              <Settings className="h-4 w-4 mr-2" />
              Scenario Builder
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" style={{ borderColor: COLORS.borderAndSeparator, color: COLORS.textMediumContrast }}
                    onClick={handleApplyChanges}>
              Apply Changes
            </Button>
            <Button variant="outline" style={{ borderColor: COLORS.borderAndSeparator, color: COLORS.textMediumContrast }}
                    onClick={handleDiscardChanges}>
              Discard
            </Button>
          </div>
        </div>
      </footer>

      {/* Platform Control Panel (Overlay) */}
      {selectedStation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-96" style={{ backgroundColor: "#252545" }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold" style={{ color: COLORS.primaryAccent }}>
                Platform Control - {stations.find(s => s.id === selectedStation)?.name}
              </h3>
              <Button variant="outline" size="sm" onClick={() => setSelectedStation(null)}>
                ✕
              </Button>
            </div>
            
            <div className="space-y-3">
              {stations.find(s => s.id === selectedStation)?.trains.map((train) => (
                <div key={train.id} className="p-3 rounded border" style={{ borderColor: COLORS.borderAndSeparator }}>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium" style={{ color: COLORS.textHighContrast }}>{train.name}</div>
                      <div className="text-sm" style={{ color: COLORS.textMediumContrast }}>
                        Platform {train.platform} • {train.type}
                      </div>
                    </div>
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: getTrainColor(train.status, train.type) }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex gap-2">
              <Button style={{ backgroundColor: COLORS.secondaryAccent, color: "#000000" }}
                      onClick={() => handleReservePlatform(selectedStation)}>
                Reserve Platform
              </Button>
              <Button variant="outline" style={{ borderColor: COLORS.borderAndSeparator, color: COLORS.textHighContrast }}
                      onClick={() => handleClearPlatform(selectedStation)}>
                Clear Platform
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Train Details Panel (Overlay) */}
      {selectedTrain && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-96" style={{ backgroundColor: "#252545" }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold" style={{ color: COLORS.primaryAccent }}>
                Train Details
              </h3>
              <Button variant="outline" size="sm" onClick={() => setSelectedTrain(null)}>
                ✕
              </Button>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 rounded border" style={{ borderColor: COLORS.borderAndSeparator }}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium" style={{ color: COLORS.textHighContrast }}>
                      {stations.flatMap(s => s.trains).find(t => t.id === selectedTrain)?.name}
                    </div>
                    <div className="text-sm" style={{ color: COLORS.textMediumContrast }}>
                      ID: {selectedTrain}
                    </div>
                  </div>
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: getTrainColor(
                      stations.flatMap(s => s.trains).find(t => t.id === selectedTrain)?.status || "on-time",
                      stations.flatMap(s => s.trains).find(t => t.id === selectedTrain)?.type || "passenger"
                    )}}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs" style={{ color: COLORS.textMediumContrast }}>Type</div>
                  <div className="text-sm" style={{ color: COLORS.textHighContrast }}>
                    {stations.flatMap(s => s.trains).find(t => t.id === selectedTrain)?.type}
                  </div>
                </div>
                <div>
                  <div className="text-xs" style={{ color: COLORS.textMediumContrast }}>Status</div>
                  <div className="text-sm" style={{ color: COLORS.textHighContrast }}>
                    {stations.flatMap(s => s.trains).find(t => t.id === selectedTrain)?.status}
                  </div>
                </div>
                <div>
                  <div className="text-xs" style={{ color: COLORS.textMediumContrast }}>Platform</div>
                  <div className="text-sm" style={{ color: COLORS.textHighContrast }}>
                    {stations.flatMap(s => s.trains).find(t => t.id === selectedTrain)?.platform}
                  </div>
                </div>
                <div>
                  <div className="text-xs" style={{ color: COLORS.textMediumContrast }}>Speed</div>
                  <div className="text-sm" style={{ color: COLORS.textHighContrast }}>85 km/h</div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <Button style={{ backgroundColor: COLORS.primaryAccent, color: "#FFFFFF" }}
                      onClick={() => handleHoldTrain(selectedTrain)}>
                Hold Train
              </Button>
              <Button variant="outline" style={{ borderColor: COLORS.borderAndSeparator, color: COLORS.textHighContrast }}
                      onClick={() => handleRerouteTrain(selectedTrain)}>
                Reroute
              </Button>
            </div>
          </div>
        </div>
      )}

      <MadeWithDyad />
    </div>
  );
};

export default Index;