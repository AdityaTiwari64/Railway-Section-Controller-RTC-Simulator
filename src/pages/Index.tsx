"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Search,
  Bell,
  User,
  Activity,
  BarChart3,
  Radio,
  Gauge,
  Timer,
  Target
} from "lucide-react";

// Modern color palette
const COLORS = {
  background: "#f8f9fa",
  cardBackground: "#ffffff",
  primaryAccent: "#c3f632",
  darkAccent: "#292929",
  lightGray: "#f6f6f6",
  textPrimary: "#1a1a1a",
  textSecondary: "#6b7280",
  textMuted: "#9ca3af",
  border: "#e5e7eb",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  onTimeTrain: "#10b981",
  minorDelayTrain: "#f59e0b",
  significantDelayTrain: "#ef4444",
  freightTrain: "#8b5cf6",
  passengerTrain: "#3b82f6",
  signalGreen: "#10b981",
  signalYellow: "#f59e0b",
  signalRed: "#ef4444",
  signalOff: "#6b7280"
};

// Enhanced train data structure
interface Train {
  id: string;
  name: string;
  type: 'passenger' | 'freight' | 'express';
  status: 'on-time' | 'minor-delay' | 'significant-delay' | 'approaching' | 'departing' | 'in-transit' | 'stopped';
  platform?: number;
  speed: number;
  destination: string;
  eta: Date;
  passengers?: number;
  capacity?: number;
  currentSection?: string;
  nextSection?: string;
  progress: number; // 0-100% through current section
  priority: 'low' | 'normal' | 'high' | 'emergency';
  fuelLevel?: number;
  maintenanceStatus: 'good' | 'warning' | 'critical';
}

interface Station {
  id: string;
  name: string;
  platforms: number;
  occupiedPlatforms: number;
  trains: Train[];
  congestionLevel: 'low' | 'medium' | 'high';
  weatherCondition: 'clear' | 'rain' | 'snow' | 'fog';
  temperature: number;
  windSpeed: number;
  trackConditions: 'good' | 'wet' | 'icy' | 'maintenance';
}

interface Signal {
  id: string;
  name: string;
  status: 'green' | 'yellow' | 'red';
  trainId: string;
  position: 'before' | 'after';
  section: string;
  automatic: boolean;
}

interface SimulationEvent {
  id: string;
  time: Date;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'emergency';
  station?: string;
  trainId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  autoResolve?: boolean;
  resolved?: boolean;
}

interface TrackSection {
  id: string;
  name: string;
  fromStation: string;
  toStation: string;
  length: number; // in km
  maxSpeed: number;
  currentTrains: string[];
  capacity: number;
  status: 'operational' | 'maintenance' | 'blocked' | 'reduced-speed';
  weatherImpact: number; // 0-1 multiplier for speed
  blockStatus: 'clear' | 'occupied' | 'reserved' | 'blocked';
  lastMaintenance: Date;
  nextMaintenance: Date;
  trackCondition: 'excellent' | 'good' | 'fair' | 'poor';
  speedRestriction: number; // km/h
}

interface Route {
  id: string;
  name: string;
  sections: string[];
  totalDistance: number;
  estimatedTime: number;
  priority: 'low' | 'normal' | 'high' | 'emergency';
  conflicts: string[];
}

interface Timetable {
  id: string;
  trainId: string;
  departureTime: Date;
  arrivalTime: Date;
  route: string;
  status: 'scheduled' | 'on-time' | 'delayed' | 'cancelled';
  delay: number; // minutes
}

// Initial simulation data
const initialStations: Station[] = [
  {
    id: "central",
    name: "Central Station",
    platforms: 6,
    occupiedPlatforms: 3,
    congestionLevel: 'medium',
    weatherCondition: 'clear',
    temperature: 22,
    windSpeed: 8,
    trackConditions: 'good',
    trains: [
      { id: "EXP001", name: "Express 001", type: "express", status: "on-time", platform: 1, speed: 120, destination: "North Terminal", eta: new Date(Date.now() + 300000), passengers: 180, capacity: 200, currentSection: "Central-North", progress: 75, priority: 'normal', fuelLevel: 85, maintenanceStatus: 'good' },
      { id: "LOC456", name: "Local 456", type: "passenger", status: "minor-delay", platform: 3, speed: 80, destination: "South Junction", eta: new Date(Date.now() + 600000), passengers: 95, capacity: 150, currentSection: "Central-South", progress: 45, priority: 'normal', fuelLevel: 92, maintenanceStatus: 'good' },
      { id: "FRT789", name: "Freight 789", type: "freight", status: "on-time", platform: 6, speed: 60, destination: "Industrial Zone", eta: new Date(Date.now() + 900000), currentSection: "Central-Industrial", progress: 20, priority: 'low', fuelLevel: 78, maintenanceStatus: 'warning' }
    ]
  },
  {
    id: "north",
    name: "North Terminal",
    platforms: 4,
    occupiedPlatforms: 2,
    congestionLevel: 'low',
    weatherCondition: 'rain',
    temperature: 18,
    windSpeed: 15,
    trackConditions: 'wet',
    trains: [
      { id: "EXP002", name: "Express 002", type: "express", status: "approaching", speed: 110, destination: "Central Station", eta: new Date(Date.now() + 240000), passengers: 165, capacity: 200, currentSection: "North-Central", progress: 90, priority: 'high', fuelLevel: 88, maintenanceStatus: 'good' },
      { id: "REG012", name: "Regional 012", type: "passenger", status: "significant-delay", platform: 2, speed: 0, destination: "South Terminal", eta: new Date(Date.now() + 1200000), passengers: 120, capacity: 180, currentSection: "North-South", progress: 0, priority: 'normal', fuelLevel: 95, maintenanceStatus: 'critical' }
    ]
  },
  {
    id: "south",
    name: "South Terminal",
    platforms: 8,
    occupiedPlatforms: 4,
    congestionLevel: 'high',
    weatherCondition: 'fog',
    temperature: 15,
    windSpeed: 5,
    trackConditions: 'good',
    trains: [
      { id: "EXP345", name: "Express 345", type: "express", status: "departing", platform: 2, speed: 95, destination: "Central Station", eta: new Date(Date.now() + 420000), passengers: 190, capacity: 200, currentSection: "South-Central", progress: 10, priority: 'normal', fuelLevel: 82, maintenanceStatus: 'good' },
      { id: "LOC678", name: "Local 678", type: "passenger", status: "on-time", platform: 5, speed: 75, destination: "North Terminal", eta: new Date(Date.now() + 780000), passengers: 85, capacity: 150, currentSection: "South-North", progress: 60, priority: 'normal', fuelLevel: 90, maintenanceStatus: 'good' },
      { id: "EXP901", name: "Express 901", type: "express", status: "on-time", platform: 7, speed: 115, destination: "Industrial Zone", eta: new Date(Date.now() + 360000), passengers: 175, capacity: 200, currentSection: "South-Industrial", progress: 30, priority: 'high', fuelLevel: 76, maintenanceStatus: 'good' },
      { id: "FRT234", name: "Freight 234", type: "freight", status: "minor-delay", platform: 8, speed: 45, destination: "Port Terminal", eta: new Date(Date.now() + 1500000), currentSection: "South-Port", progress: 85, priority: 'low', fuelLevel: 65, maintenanceStatus: 'warning' }
    ]
  }
];

const initialSignals: Signal[] = [
  { id: "SIG001", name: "Central Approach A", status: "green", trainId: "EXP001", position: "before", section: "Central-North", automatic: true },
  { id: "SIG002", name: "Central Departure B", status: "yellow", trainId: "LOC456", position: "after", section: "Central-South", automatic: true },
  { id: "SIG003", name: "North Junction", status: "red", trainId: "EXP002", position: "before", section: "North-Central", automatic: false },
  { id: "SIG004", name: "South Approach", status: "green", trainId: "EXP345", position: "after", section: "South-Central", automatic: true }
];

const initialTrackSections: TrackSection[] = [
  { 
    id: "Central-North", name: "Central to North", fromStation: "central", toStation: "north", 
    length: 15, maxSpeed: 120, currentTrains: ["EXP001"], capacity: 2, status: 'operational', 
    weatherImpact: 0.9, blockStatus: 'occupied', lastMaintenance: new Date(Date.now() - 86400000 * 7),
    nextMaintenance: new Date(Date.now() + 86400000 * 21), trackCondition: 'good', speedRestriction: 120
  },
  { 
    id: "Central-South", name: "Central to South", fromStation: "central", toStation: "south", 
    length: 20, maxSpeed: 100, currentTrains: ["LOC456"], capacity: 3, status: 'operational', 
    weatherImpact: 0.8, blockStatus: 'occupied', lastMaintenance: new Date(Date.now() - 86400000 * 14),
    nextMaintenance: new Date(Date.now() + 86400000 * 14), trackCondition: 'excellent', speedRestriction: 100
  },
  { 
    id: "North-Central", name: "North to Central", fromStation: "north", toStation: "central", 
    length: 15, maxSpeed: 120, currentTrains: ["EXP002"], capacity: 2, status: 'reduced-speed', 
    weatherImpact: 0.7, blockStatus: 'occupied', lastMaintenance: new Date(Date.now() - 86400000 * 3),
    nextMaintenance: new Date(Date.now() + 86400000 * 25), trackCondition: 'fair', speedRestriction: 80
  },
  { 
    id: "South-Central", name: "South to Central", fromStation: "south", toStation: "central", 
    length: 20, maxSpeed: 100, currentTrains: ["EXP345"], capacity: 3, status: 'operational', 
    weatherImpact: 0.9, blockStatus: 'occupied', lastMaintenance: new Date(Date.now() - 86400000 * 10),
    nextMaintenance: new Date(Date.now() + 86400000 * 18), trackCondition: 'good', speedRestriction: 100
  },
  { 
    id: "Central-Industrial", name: "Central to Industrial", fromStation: "central", toStation: "industrial", 
    length: 25, maxSpeed: 80, currentTrains: ["FRT789"], capacity: 2, status: 'operational', 
    weatherImpact: 0.95, blockStatus: 'occupied', lastMaintenance: new Date(Date.now() - 86400000 * 21),
    nextMaintenance: new Date(Date.now() + 86400000 * 7), trackCondition: 'poor', speedRestriction: 60
  },
  { 
    id: "South-Industrial", name: "South to Industrial", fromStation: "south", toStation: "industrial", 
    length: 30, maxSpeed: 80, currentTrains: ["EXP901"], capacity: 2, status: 'operational', 
    weatherImpact: 0.9, blockStatus: 'occupied', lastMaintenance: new Date(Date.now() - 86400000 * 5),
    nextMaintenance: new Date(Date.now() + 86400000 * 23), trackCondition: 'good', speedRestriction: 80
  },
  { 
    id: "South-Port", name: "South to Port", fromStation: "south", toStation: "port", 
    length: 35, maxSpeed: 60, currentTrains: ["FRT234"], capacity: 1, status: 'operational', 
    weatherImpact: 0.85, blockStatus: 'occupied', lastMaintenance: new Date(Date.now() - 86400000 * 12),
    nextMaintenance: new Date(Date.now() + 86400000 * 16), trackCondition: 'fair', speedRestriction: 60
  },
  { 
    id: "North-South", name: "North to South", fromStation: "north", toStation: "south", 
    length: 40, maxSpeed: 90, currentTrains: ["REG012"], capacity: 2, status: 'maintenance', 
    weatherImpact: 0.6, blockStatus: 'blocked', lastMaintenance: new Date(Date.now() - 86400000 * 1),
    nextMaintenance: new Date(Date.now() + 86400000 * 1), trackCondition: 'poor', speedRestriction: 0
  }
];

const initialRoutes: Route[] = [
  { id: "R001", name: "Express North Route", sections: ["Central-North"], totalDistance: 15, estimatedTime: 12, priority: 'high', conflicts: [] },
  { id: "R002", name: "Express South Route", sections: ["Central-South"], totalDistance: 20, estimatedTime: 15, priority: 'high', conflicts: [] },
  { id: "R003", name: "Freight Industrial Route", sections: ["Central-Industrial"], totalDistance: 25, estimatedTime: 25, priority: 'low', conflicts: [] },
  { id: "R004", name: "Cross Country Route", sections: ["North-Central", "Central-South"], totalDistance: 35, estimatedTime: 28, priority: 'normal', conflicts: [] },
  { id: "R005", name: "Port Connection Route", sections: ["South-Port"], totalDistance: 35, estimatedTime: 35, priority: 'normal', conflicts: [] }
];

const initialTimetable: Timetable[] = [
  { id: "T001", trainId: "EXP001", departureTime: new Date(Date.now() + 300000), arrivalTime: new Date(Date.now() + 900000), route: "R001", status: 'on-time', delay: 0 },
  { id: "T002", trainId: "LOC456", departureTime: new Date(Date.now() + 600000), arrivalTime: new Date(Date.now() + 1200000), route: "R002", status: 'delayed', delay: 5 },
  { id: "T003", trainId: "FRT789", departureTime: new Date(Date.now() + 900000), arrivalTime: new Date(Date.now() + 1800000), route: "R003", status: 'on-time', delay: 0 },
  { id: "T004", trainId: "EXP002", departureTime: new Date(Date.now() + 240000), arrivalTime: new Date(Date.now() + 1200000), route: "R004", status: 'on-time', delay: 0 },
  { id: "T005", trainId: "FRT234", departureTime: new Date(Date.now() + 1500000), arrivalTime: new Date(Date.now() + 3600000), route: "R005", status: 'delayed', delay: 15 }
];

const scenarios = [
  { id: 'normal', name: 'Normal Operations', description: 'Standard traffic flow with clear weather', difficulty: 'Easy' },
  { id: 'rush_hour', name: 'Rush Hour', description: 'High passenger volume and congestion', difficulty: 'Medium' },
  { id: 'maintenance', name: 'Track Maintenance', description: 'Reduced capacity and speed restrictions', difficulty: 'Medium' },
  { id: 'emergency', name: 'Emergency Response', description: 'Priority routing and emergency protocols', difficulty: 'Hard' },
  { id: 'weather', name: 'Severe Weather', description: 'Adverse weather conditions affecting operations', difficulty: 'Hard' },
  { id: 'breakdown', name: 'Equipment Failure', description: 'Train breakdowns and maintenance issues', difficulty: 'Expert' }
];

const achievementDefinitions = [
  { id: 'first_train', name: 'First Steps', description: 'Manage your first train', icon: '🚂', condition: (stats: any) => stats.totalTrainsManaged >= 1 },
  { id: 'signal_master', name: 'Signal Master', description: 'Change 50 signals', icon: '🚦', condition: (stats: any) => stats.totalSignalsChanged >= 50 },
  { id: 'emergency_hero', name: 'Emergency Hero', description: 'Handle 10 emergencies', icon: '🚨', condition: (stats: any) => stats.totalEmergenciesHandled >= 10 },
  { id: 'perfect_run', name: 'Perfect Run', description: 'Achieve 100% punctuality', icon: '⭐', condition: (stats: any) => stats.perfectRuns >= 1 },
  { id: 'speed_demon', name: 'Speed Demon', description: 'Complete a scenario in under 2 minutes', icon: '⚡', condition: (stats: any) => stats.bestTime < 120 },
  { id: 'weather_warrior', name: 'Weather Warrior', description: 'Successfully manage operations in all weather conditions', icon: '🌦️', condition: (stats: any) => stats.weatherMaster },
  { id: 'network_optimizer', name: 'Network Optimizer', description: 'Achieve 95%+ efficiency', icon: '🎯', condition: (stats: any) => stats.bestEfficiency >= 95 },
  { id: 'veteran_controller', name: 'Veteran Controller', description: 'Play for over 1 hour total', icon: '🏆', condition: (stats: any) => stats.totalPlayTime >= 3600 }
];

const tutorialSteps = [
  {
    title: "Welcome to NETRA",
    content: "NETRA (Network Traffic Railway Analytics) helps you manage a railway network. You can control trains, signals, and respond to various scenarios.",
    target: "header"
  },
  {
    title: "Simulation Controls",
    content: "Use the left panel to start/stop simulation, change scenarios, and adjust speed. Try different scenarios to see how they affect operations.",
    target: "controls"
  },
  {
    title: "Network View",
    content: "The Network tab shows all stations and platforms. Click on trains to select them. Weather conditions affect train performance.",
    target: "network"
  },
  {
    title: "Signal Control",
    content: "Monitor and control railway signals. Green = proceed, Yellow = caution, Red = stop. Some signals are automatic.",
    target: "signals"
  },
  {
    title: "Train Management",
    content: "Control individual trains with actions like Hold, Expedite, Emergency, and Service. Monitor fuel levels and maintenance status.",
    target: "trains"
  },
  {
    title: "Track Sections",
    content: "View track conditions, capacity, and weather impact. Track status affects train speeds and routing.",
    target: "tracks"
  },
  {
    title: "Emergency Response",
    content: "Use the Emergency Mode button for priority routing. Weather controls let you simulate different conditions.",
    target: "emergency"
  },
  {
    title: "Performance Analytics",
    content: "Monitor KPIs like punctuality, efficiency, and throughput. Your score reflects how well you manage the network.",
    target: "analytics"
  }
];

const Index = () => {
  // Core simulation state
  const [simulationMode, setSimulationMode] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState([1]);
  const [simulationTime, setSimulationTime] = useState(new Date());
  const [scenario, setScenario] = useState('normal');
  const [score, setScore] = useState(100);
  const [userActions, setUserActions] = useState(0);
  
  // Data state
  const [stations, setStations] = useState<Station[]>(initialStations);
  const [signals, setSignals] = useState<Signal[]>(initialSignals);
  const [trackSections, setTrackSections] = useState<TrackSection[]>(initialTrackSections);
  const [routes, setRoutes] = useState<Route[]>(initialRoutes);
  const [timetable, setTimetable] = useState<Timetable[]>(initialTimetable);
  const [events, setEvents] = useState<SimulationEvent[]>([]);
  const [selectedTrain, setSelectedTrain] = useState<string | null>(null);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [weatherCondition, setWeatherCondition] = useState<'clear' | 'rain' | 'snow' | 'fog'>('clear');
  const [conflictResolution, setConflictResolution] = useState<{[key: string]: string}>({});
  
  // UI state
  const [activeTab, setActiveTab] = useState("network");
  const [showTrainDetails, setShowTrainDetails] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [gameMode, setGameMode] = useState<'freeplay' | 'challenge' | 'time_trial'>('freeplay');
  const [challengeTime, setChallengeTime] = useState(300); // 5 minutes
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [gameStats, setGameStats] = useState({
    totalTrainsManaged: 0,
    totalSignalsChanged: 0,
    totalEmergenciesHandled: 0,
    bestScore: 0,
    totalPlayTime: 0,
    perfectRuns: 0
  });

  // KPIs
  const [kpis, setKpis] = useState({
    punctuality: 94,
    averageDelay: 2.3,
    activeTrains: 12,
    throughput: 85,
    efficiency: 92
  });

  // Enhanced simulation engine
  useEffect(() => {
    if (!simulationMode) return;

    const interval = setInterval(() => {
      const speed = simulationSpeed[0];
      
      // Advance simulation time
      setSimulationTime(prev => new Date(prev.getTime() + (30000 * speed)));
      
      // Update weather conditions
      if (Math.random() < 0.1) {
        const weathers: Array<'clear' | 'rain' | 'snow' | 'fog'> = ['clear', 'rain', 'snow', 'fog'];
        const newWeather = weathers[Math.floor(Math.random() * weathers.length)];
        setWeatherCondition(newWeather);
        
        setEvents(prev => [{
          id: Date.now().toString(),
          time: new Date(),
          message: `Weather changed to ${newWeather}`,
          type: 'info',
          severity: 'low',
          autoResolve: true
        }, ...prev]);
      }
      
      // Update track sections with weather impact
      setTrackSections(prev => prev.map(section => {
        let weatherImpact = 1;
        switch (weatherCondition) {
          case 'rain': weatherImpact = 0.8; break;
          case 'snow': weatherImpact = 0.6; break;
          case 'fog': weatherImpact = 0.7; break;
          default: weatherImpact = 1;
        }
        
        return { ...section, weatherImpact };
      }));
      
      // Update trains with enhanced movement simulation
      setStations(prev => prev.map(station => ({
        ...station,
        weatherCondition,
        temperature: weatherCondition === 'snow' ? Math.max(-5, station.temperature - 5) : 
                    weatherCondition === 'rain' ? Math.max(10, station.temperature - 2) : station.temperature,
        trackConditions: weatherCondition === 'rain' ? 'wet' : 
                        weatherCondition === 'snow' ? 'icy' : 'good',
        trains: station.trains.map(train => {
          let newStatus = train.status;
          let newSpeed = train.speed;
          let newProgress = train.progress;
          let newFuelLevel = train.fuelLevel || 100;
          let newMaintenanceStatus = train.maintenanceStatus;
          
          // Weather effects on speed
          const weatherMultiplier = trackSections.find(s => s.id === train.currentSection)?.weatherImpact || 1;
          newSpeed = Math.max(20, newSpeed * weatherMultiplier);
          
          // Scenario-based effects
          const random = Math.random();
          if (scenario === 'rush_hour') {
            if (random < 0.15) newStatus = 'minor-delay';
            if (train.type === 'passenger' && train.passengers) {
              train.passengers = Math.min(train.capacity || 200, train.passengers + Math.floor(random * 20));
            }
          } else if (scenario === 'maintenance') {
            if (random < 0.2) newSpeed = Math.max(30, train.speed - 20);
            if (random < 0.1) newStatus = 'significant-delay';
          } else if (scenario === 'emergency') {
            if (train.type === 'express' && random < 0.3) {
              newStatus = 'on-time';
              newSpeed = Math.min(140, train.speed + 10);
              train.priority = 'high';
            }
          } else if (scenario === 'weather') {
            if (weatherCondition !== 'clear' && random < 0.3) {
              newStatus = 'minor-delay';
              newSpeed = Math.max(30, newSpeed * 0.7);
            }
          } else if (scenario === 'breakdown') {
            if (random < 0.05) {
              newMaintenanceStatus = 'critical';
              newStatus = 'stopped';
              newSpeed = 0;
            } else if (random < 0.1) {
              newMaintenanceStatus = 'warning';
            }
          }
          
          // Train movement simulation
          if (train.status !== 'stopped' && train.currentSection) {
            const section = trackSections.find(s => s.id === train.currentSection);
            if (section) {
              const speedKmh = newSpeed;
              const progressIncrement = (speedKmh / section.length) * 0.5; // 0.5% per update
              newProgress = Math.min(100, train.progress + progressIncrement);
              
              // Move to next section when progress reaches 100%
              if (newProgress >= 100) {
                newProgress = 0;
                // Simple routing logic - would be more complex in real system
                if (train.destination === 'North Terminal' && train.currentSection?.includes('Central')) {
                  train.currentSection = 'Central-North';
                } else if (train.destination === 'South Terminal' && train.currentSection?.includes('Central')) {
                  train.currentSection = 'Central-South';
                }
              }
            }
          }
          
          // Fuel consumption
          newFuelLevel = Math.max(0, newFuelLevel - (newSpeed / 1000));
          
          // Natural status changes
          if (random < 0.05) {
            const statuses: Train['status'][] = ['on-time', 'minor-delay', 'approaching', 'departing', 'in-transit'];
            newStatus = statuses[Math.floor(Math.random() * statuses.length)];
          }
          
          return { 
            ...train, 
            status: newStatus, 
            speed: newSpeed, 
            progress: newProgress,
            fuelLevel: newFuelLevel,
            maintenanceStatus: newMaintenanceStatus
          };
        })
      })));

      // Update signals automatically
      setSignals(prev => prev.map(signal => {
        if (signal.automatic && Math.random() < 0.3) {
          const statuses: Signal['status'][] = ['green', 'yellow', 'red'];
          const currentIndex = statuses.indexOf(signal.status);
          const nextIndex = (currentIndex + 1) % statuses.length;
          return { ...signal, status: statuses[nextIndex] };
        }
        return signal;
      }));

      // Generate enhanced events
      if (Math.random() < 0.4) {
        const eventMessages = [
          'Train approaching platform',
          'Signal change detected',
          'Platform clearance completed',
          'Passenger boarding in progress',
          'Departure sequence initiated',
          'Speed restriction lifted',
          'Track maintenance scheduled',
          'Weather alert: Reduced visibility',
          'Emergency brake test completed',
          'Fuel level low warning',
          'Maintenance check required',
          'Priority train approaching'
        ];
        
        const eventTypes: Array<'info' | 'warning' | 'error' | 'success' | 'emergency'> = ['info', 'warning', 'error', 'success', 'emergency'];
        const severities: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];
        
        const newEvent: SimulationEvent = {
          id: Date.now().toString(),
          time: new Date(),
          message: eventMessages[Math.floor(Math.random() * eventMessages.length)],
          type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
          severity: severities[Math.floor(Math.random() * severities.length)],
          trainId: Math.random() < 0.5 ? `EXP${Math.floor(Math.random() * 999).toString().padStart(3, '0')}` : undefined,
          autoResolve: Math.random() < 0.7
        };
        
        setEvents(prev => [newEvent, ...prev.slice(0, 19)]);
      }

      // Update KPIs with more realistic calculations
      const allTrains = stations.flatMap(s => s.trains);
      const onTimeTrains = allTrains.filter(t => t.status === 'on-time').length;
      const totalTrains = allTrains.length;
      const punctualityRate = totalTrains > 0 ? (onTimeTrains / totalTrains) * 100 : 100;
      
      setKpis(prev => ({
        punctuality: Math.max(75, Math.min(99, punctualityRate + (Math.random() - 0.5) * 2)),
        averageDelay: Math.max(0.5, Math.min(8, prev.averageDelay + (Math.random() - 0.5) * 0.8)),
        activeTrains: Math.max(8, Math.min(20, allTrains.length + Math.floor((Math.random() - 0.5) * 2))),
        throughput: Math.max(60, Math.min(95, prev.throughput + (Math.random() - 0.5) * 4)),
        efficiency: Math.max(70, Math.min(98, prev.efficiency + (Math.random() - 0.5) * 2))
      }));

      // Update score based on performance
      setScore(prev => {
        const punctualityBonus = punctualityRate > 90 ? 5 : punctualityRate > 80 ? 2 : -5;
        const actionPenalty = userActions > 20 ? -2 : 0;
        const emergencyPenalty = emergencyMode ? -10 : 0;
        const newScore = Math.max(0, Math.min(100, prev + punctualityBonus + actionPenalty + emergencyPenalty + (Math.random() - 0.5) * 2));
        
        // Update game stats
        setGameStats(prev => ({
          ...prev,
          bestScore: Math.max(prev.bestScore, newScore),
          totalPlayTime: prev.totalPlayTime + 1,
          perfectRuns: punctualityRate === 100 ? prev.perfectRuns + 1 : prev.perfectRuns
        }));
        
        return newScore;
      });

      // Check achievements
      checkAchievements();

    }, 2000 / simulationSpeed[0]);

    return () => clearInterval(interval);
  }, [simulationMode, simulationSpeed, scenario, weatherCondition, trackSections, stations, userActions, emergencyMode]);

  // Event handlers
  const handleStartSimulation = () => {
    setSimulationMode(true);
    setEvents([{
      id: Date.now().toString(),
      time: new Date(),
      message: `Simulation started - ${scenarios.find(s => s.id === scenario)?.name}`,
      type: 'success',
      severity: 'medium',
      autoResolve: true
    }]);
  };

  const handleStopSimulation = () => {
    setSimulationMode(false);
    setEvents(prev => [{
      id: Date.now().toString(),
      time: new Date(),
      message: 'Simulation stopped',
      type: 'info',
      severity: 'low',
      autoResolve: true
    }, ...prev]);
  };

  const handleSignalToggle = (signalId: string) => {
    setSignals(prev => prev.map(signal => {
      if (signal.id === signalId) {
        const statuses: Signal['status'][] = ['green', 'yellow', 'red'];
        const currentIndex = statuses.indexOf(signal.status);
        const nextIndex = (currentIndex + 1) % statuses.length;
        
        setUserActions(prev => prev + 1);
        setGameStats(prev => ({ ...prev, totalSignalsChanged: prev.totalSignalsChanged + 1 }));
        setEvents(prev => [{
          id: Date.now().toString(),
          time: new Date(),
          message: `Signal ${signal.name} changed to ${statuses[nextIndex]}`,
          type: 'info',
          severity: 'low',
          autoResolve: true
        } as SimulationEvent, ...prev]);
        
        return { ...signal, status: statuses[nextIndex] };
      }
      return signal;
    }));
  };

  const handleTrainAction = (trainId: string, action: 'hold' | 'expedite' | 'reroute' | 'emergency' | 'maintenance') => {
    setUserActions(prev => prev + 1);
    setEvents(prev => [{
      id: Date.now().toString(),
      time: new Date(),
      message: `Train ${trainId} - ${action} command issued`,
      type: action === 'emergency' ? 'emergency' : 'success',
      severity: action === 'emergency' ? 'critical' : 'medium',
      trainId
    }, ...prev]);
    
    // Apply action effects
    setStations(prev => prev.map(station => ({
      ...station,
      trains: station.trains.map(train => {
        if (train.id === trainId) {
          switch (action) {
            case 'hold':
              return { ...train, status: 'minor-delay', speed: 0 };
            case 'expedite':
              return { ...train, status: 'on-time', speed: Math.min(140, train.speed + 20), priority: 'high' };
            case 'reroute':
              return { ...train, status: 'approaching' };
            case 'emergency':
              setEmergencyMode(true);
              return { ...train, status: 'on-time', speed: Math.min(160, train.speed + 30), priority: 'emergency' };
            case 'maintenance':
              return { ...train, status: 'stopped', speed: 0, maintenanceStatus: 'good', fuelLevel: 100 };
            default:
              return train;
          }
        }
        return train;
      })
    })));
  };

  const handleEmergencyResponse = () => {
    setEmergencyMode(!emergencyMode);
    if (!emergencyMode) {
      setGameStats(prev => ({ ...prev, totalEmergenciesHandled: prev.totalEmergenciesHandled + 1 }));
    }
    setEvents(prev => [{
      id: Date.now().toString(),
      time: new Date(),
      message: emergencyMode ? 'Emergency mode deactivated' : 'EMERGENCY MODE ACTIVATED - Priority routing enabled',
      type: 'emergency',
      severity: 'critical',
      autoResolve: false
    } as SimulationEvent, ...prev]);
  };

  const handleWeatherChange = (newWeather: 'clear' | 'rain' | 'snow' | 'fog') => {
    setWeatherCondition(newWeather);
    setEvents(prev => [{
      id: Date.now().toString(),
      time: new Date(),
      message: `Weather manually changed to ${newWeather}`,
      type: 'info',
      severity: 'low',
      autoResolve: true
    } as SimulationEvent, ...prev]);
  };

  const handleTutorialNext = () => {
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(tutorialStep + 1);
    } else {
      setShowTutorial(false);
      setTutorialStep(0);
    }
  };

  const handleTutorialPrev = () => {
    if (tutorialStep > 0) {
      setTutorialStep(tutorialStep - 1);
    }
  };

  const handleTutorialStart = () => {
    setShowTutorial(true);
    setTutorialStep(0);
  };

  const checkAchievements = () => {
    const newAchievements = achievementDefinitions.filter(achievementDef => 
      !unlockedAchievements.includes(achievementDef.id) && achievementDef.condition(gameStats)
    );
    
    if (newAchievements.length > 0) {
      setUnlockedAchievements(prev => [...prev, ...newAchievements.map(a => a.id)]);
      setEvents(prev => [{
        id: Date.now().toString(),
        time: new Date(),
        message: `🏆 Achievement Unlocked: ${newAchievements[0].name}`,
        type: 'success',
        severity: 'high',
        autoResolve: true
      } as SimulationEvent, ...prev]);
    }
  };

  const handleGameModeChange = (mode: 'freeplay' | 'challenge' | 'time_trial') => {
    setGameMode(mode);
    if (mode === 'time_trial') {
      setChallengeTime(300); // 5 minutes
    }
    setEvents(prev => [{
      id: Date.now().toString(),
      time: new Date(),
      message: `Game mode changed to ${mode.replace('_', ' ')}`,
      type: 'info',
      severity: 'low',
      autoResolve: true
    } as SimulationEvent, ...prev]);
  };

  const handleQuickAction = (action: string) => {
    setUserActions(prev => prev + 1);
    setGameStats(prev => ({ ...prev, totalTrainsManaged: prev.totalTrainsManaged + 1 }));
    
    // Apply quick action effects
    switch (action) {
      case 'clear_all_delays':
        setStations(prev => prev.map(station => ({
          ...station,
          trains: station.trains.map(train => ({ ...train, status: 'on-time' as const }))
        })));
        setTimetable(prev => prev.map(entry => ({ ...entry, status: 'on-time' as const, delay: 0 })));
        break;
      case 'optimize_routes':
        setStations(prev => prev.map(station => ({
          ...station,
          trains: station.trains.map(train => ({ ...train, speed: Math.min(140, train.speed + 20) }))
        })));
        break;
      case 'emergency_clear':
        setEmergencyMode(false);
        setStations(prev => prev.map(station => ({
          ...station,
          trains: station.trains.map(train => ({ ...train, priority: 'normal' as const }))
        })));
        break;
      case 'resolve_conflicts':
        setConflictResolution({});
        setEvents(prev => [{
          id: Date.now().toString(),
          time: new Date(),
          message: 'Route conflicts resolved automatically',
          type: 'success',
          severity: 'medium',
          autoResolve: true
        } as SimulationEvent, ...prev]);
        break;
      case 'schedule_maintenance':
        setTrackSections(prev => prev.map(section => ({
          ...section,
          status: section.trackCondition === 'poor' ? 'maintenance' as const : section.status,
          nextMaintenance: new Date(Date.now() + 86400000 * 7)
        })));
        break;
    }
    
    setEvents(prev => [{
      id: Date.now().toString(),
      time: new Date(),
      message: `Quick action: ${action.replace('_', ' ')} executed`,
      type: 'success',
      severity: 'medium',
      autoResolve: true
    } as SimulationEvent, ...prev]);
  };

  const handleRoutePlanning = (trainId: string, newRoute: string) => {
    setUserActions(prev => prev + 1);
    setStations(prev => prev.map(station => ({
      ...station,
      trains: station.trains.map(train => {
        if (train.id === trainId) {
          const route = routes.find(r => r.id === newRoute);
          return { ...train, currentSection: route?.sections[0], destination: route?.name || train.destination };
        }
        return train;
      })
    })));
    
    setEvents(prev => [{
      id: Date.now().toString(),
      time: new Date(),
      message: `Route planned for train ${trainId}: ${routes.find(r => r.id === newRoute)?.name}`,
      type: 'info',
      severity: 'medium',
      trainId,
      autoResolve: true
    } as SimulationEvent, ...prev]);
  };

  const handleBlockControl = (sectionId: string, action: 'reserve' | 'clear' | 'block') => {
    setUserActions(prev => prev + 1);
    setTrackSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        let newBlockStatus: 'clear' | 'occupied' | 'reserved' | 'blocked' = section.blockStatus;
        let newStatus: 'operational' | 'maintenance' | 'blocked' | 'reduced-speed' = section.status;
        
        switch (action) {
          case 'reserve':
            newBlockStatus = 'reserved';
            break;
          case 'clear':
            newBlockStatus = 'clear';
            newStatus = 'operational';
            break;
          case 'block':
            newBlockStatus = 'blocked';
            newStatus = 'blocked';
            break;
        }
        
        return { ...section, blockStatus: newBlockStatus, status: newStatus };
      }
      return section;
    }));
    
    setEvents(prev => [{
      id: Date.now().toString(),
      time: new Date(),
      message: `Section ${sectionId} ${action}ed by traffic controller`,
      type: 'info',
      severity: 'medium',
      autoResolve: true
    } as SimulationEvent, ...prev]);
  };

  const handleSpeedRestriction = (sectionId: string, newSpeed: number) => {
    setUserActions(prev => prev + 1);
    setTrackSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        return { ...section, speedRestriction: newSpeed };
      }
      return section;
    }));
    
    setEvents(prev => [{
      id: Date.now().toString(),
      time: new Date(),
      message: `Speed restriction set on ${sectionId}: ${newSpeed} km/h`,
      type: 'warning',
      severity: 'medium',
      autoResolve: true
    } as SimulationEvent, ...prev]);
  };

  const getTrainColor = (status: string, type: string) => {
    if (status === "on-time") return COLORS.onTimeTrain;
    if (status === "minor-delay") return COLORS.minorDelayTrain;
    if (status === "significant-delay") return COLORS.significantDelayTrain;
    if (status === "approaching") return COLORS.passengerTrain;
    if (status === "departing") return COLORS.primaryAccent;
    return type === "freight" ? COLORS.freightTrain : COLORS.passengerTrain;
  };

  const getSignalColor = (status: string) => {
    switch (status) {
      case "green": return COLORS.signalGreen;
      case "yellow": return COLORS.signalYellow;
      case "red": return COLORS.signalRed;
      default: return COLORS.signalOff;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background, color: COLORS.textPrimary }}>
      {/* Header */}
      <header className="bg-white border-b px-6 py-4" style={{ borderColor: COLORS.border }}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: COLORS.darkAccent }}>
                <Train className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">NETRA</h1>
                <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                  {simulationMode ? `Running - ${formatTime(simulationTime)}` : 'Ready to simulate'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Button
                onClick={handleTutorialStart}
                variant="outline"
                size="sm"
                className="rounded-lg"
                style={{ borderColor: COLORS.primaryAccent, color: COLORS.darkAccent }}
              >
                <User className="h-4 w-4 mr-1" />
                Tutorial
              </Button>
              
              <Button
                onClick={() => setShowAchievements(true)}
                variant="outline"
                size="sm"
                className="rounded-lg"
                style={{ borderColor: COLORS.warning, color: COLORS.warning }}
              >
                <BarChart3 className="h-4 w-4 mr-1" />
                Achievements ({unlockedAchievements.length})
              </Button>
              
              <Button
                onClick={() => setShowSettings(true)}
                variant="outline"
                size="sm"
                className="rounded-lg"
                style={{ borderColor: COLORS.textSecondary, color: COLORS.textSecondary }}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold" style={{ color: COLORS.textPrimary }}>{kpis.punctuality}%</div>
                <div className="text-xs" style={{ color: COLORS.textSecondary }}>Punctuality</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold" style={{ color: COLORS.textPrimary }}>{kpis.efficiency}%</div>
                <div className="text-xs" style={{ color: COLORS.textSecondary }}>Efficiency</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold" style={{ color: COLORS.textPrimary }}>{userActions}</div>
                <div className="text-xs" style={{ color: COLORS.textSecondary }}>Actions</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold" style={{ color: score > 80 ? COLORS.success : score > 60 ? COLORS.warning : COLORS.error }}>{score}</div>
                <div className="text-xs" style={{ color: COLORS.textSecondary }}>Score</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Left Panel - Control Center */}
        <div className="w-80 bg-white border-r p-6" style={{ borderColor: COLORS.border }}>
          <div className="space-y-6">
            {/* Game Mode Selection */}
            <Card className="border rounded-xl p-4" style={{ backgroundColor: COLORS.cardBackground, borderColor: COLORS.border }}>
              <h3 className="font-semibold mb-4">Game Mode</h3>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  size="sm"
                  variant={gameMode === 'freeplay' ? 'default' : 'outline'}
                  onClick={() => handleGameModeChange('freeplay')}
                  className="text-xs"
                >
                  Freeplay
                </Button>
                <Button
                  size="sm"
                  variant={gameMode === 'challenge' ? 'default' : 'outline'}
                  onClick={() => handleGameModeChange('challenge')}
                  className="text-xs"
                >
                  Challenge
                </Button>
                <Button
                  size="sm"
                  variant={gameMode === 'time_trial' ? 'default' : 'outline'}
                  onClick={() => handleGameModeChange('time_trial')}
                  className="text-xs"
                >
                  Time Trial
                </Button>
              </div>
            </Card>

            {/* Simulation Controls */}
            <Card className="border rounded-xl p-4" style={{ backgroundColor: COLORS.cardBackground, borderColor: COLORS.border }}>
              <h3 className="font-semibold mb-4">Simulation Control</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Scenario</label>
                  <Select value={scenario} onValueChange={setScenario} disabled={simulationMode}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {scenarios.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          <div>
                            <div className="font-medium">{s.name}</div>
                            <div className="text-xs text-gray-500">{s.description}</div>
                            <div className="text-xs font-semibold" style={{ color: s.difficulty === 'Easy' ? COLORS.success : s.difficulty === 'Medium' ? COLORS.warning : s.difficulty === 'Hard' ? COLORS.error : COLORS.textMuted }}>
                              {s.difficulty}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Speed: {simulationSpeed[0]}x</label>
                  <Slider
                    value={simulationSpeed}
                    onValueChange={setSimulationSpeed}
                    max={5}
                    min={0.5}
                    step={0.5}
                    disabled={!simulationMode}
                    className="w-full"
                  />
                </div>
                
                <Button 
                  onClick={simulationMode ? handleStopSimulation : handleStartSimulation}
                  className="w-full rounded-lg"
                  style={simulationMode ? 
                    { backgroundColor: COLORS.error, color: 'white' } : 
                    { backgroundColor: COLORS.primaryAccent, color: COLORS.darkAccent }
                  }
                >
                  {simulationMode ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  {simulationMode ? "Stop Simulation" : "Start Simulation"}
                </Button>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="border rounded-xl p-4" style={{ backgroundColor: COLORS.cardBackground, borderColor: COLORS.border }}>
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickAction('clear_all_delays')}
                  className="w-full justify-start"
                  style={{ borderColor: COLORS.success, color: COLORS.success }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Clear All Delays
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickAction('optimize_routes')}
                  className="w-full justify-start"
                  style={{ borderColor: COLORS.primaryAccent, color: COLORS.darkAccent }}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Optimize Routes
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickAction('emergency_clear')}
                  className="w-full justify-start"
                  style={{ borderColor: COLORS.error, color: COLORS.error }}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Clear Emergency
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickAction('resolve_conflicts')}
                  className="w-full justify-start"
                  style={{ borderColor: COLORS.warning, color: COLORS.warning }}
                >
                  <Target className="h-4 w-4 mr-2" />
                  Resolve Conflicts
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickAction('schedule_maintenance')}
                  className="w-full justify-start"
                  style={{ borderColor: COLORS.textMuted, color: COLORS.textMuted }}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Schedule Maintenance
                </Button>
              </div>
            </Card>

            {/* Live Events */}
            <Card className="border rounded-xl p-4" style={{ backgroundColor: COLORS.cardBackground, borderColor: COLORS.border }}>
              <h3 className="font-semibold mb-4">Live Events</h3>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {events.map(event => (
                    <div key={event.id} className="p-2 rounded-lg text-xs" style={{ backgroundColor: COLORS.lightGray }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{formatTime(event.time)}</span>
                        <div className="flex gap-1">
                          <Badge 
                            className="text-xs px-2 py-0"
                            style={{ 
                              backgroundColor: event.type === 'error' ? COLORS.error : 
                                             event.type === 'warning' ? COLORS.warning :
                                             event.type === 'success' ? COLORS.success :
                                             event.type === 'emergency' ? COLORS.error : COLORS.textSecondary,
                              color: 'white'
                            }}
                          >
                            {event.type}
                          </Badge>
                          <Badge 
                            className="text-xs px-1 py-0"
                            style={{ 
                              backgroundColor: event.severity === 'critical' ? COLORS.error :
                                             event.severity === 'high' ? COLORS.warning :
                                             event.severity === 'medium' ? COLORS.primaryAccent : COLORS.textMuted,
                              color: event.severity === 'low' ? COLORS.darkAccent : 'white'
                            }}
                          >
                            {event.severity}
                          </Badge>
                        </div>
                      </div>
                      <p style={{ color: COLORS.textSecondary }}>{event.message}</p>
                      {event.trainId && (
                        <p className="text-xs mt-1" style={{ color: COLORS.textMuted }}>Train: {event.trainId}</p>
                      )}
                      {event.autoResolve && (
                        <p className="text-xs mt-1" style={{ color: COLORS.textMuted }}>Auto-resolving...</p>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>

        {/* Center Panel - Main View */}
        <div className="flex-1 p-6">
          <div className="h-full bg-white rounded-2xl relative overflow-hidden shadow-sm" style={{ backgroundColor: COLORS.cardBackground, border: `1px solid ${COLORS.border}` }}>
            {/* Tab Navigation */}
            <div className="absolute top-6 left-6 z-10">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-4xl">
                <TabsList className="grid w-full grid-cols-7 bg-gray-100 rounded-lg p-1">
                  <TabsTrigger value="network" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs">Network</TabsTrigger>
                  <TabsTrigger value="signals" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs">Signals</TabsTrigger>
                  <TabsTrigger value="trains" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs">Trains</TabsTrigger>
                  <TabsTrigger value="tracks" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs">Tracks</TabsTrigger>
                  <TabsTrigger value="routes" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs">Routes</TabsTrigger>
                  <TabsTrigger value="timetable" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs">Timetable</TabsTrigger>
                  <TabsTrigger value="analytics" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs">Analytics</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Emergency and Weather Controls */}
            <div className="absolute top-6 right-6 z-10 flex gap-3">
              <Button
                onClick={handleEmergencyResponse}
                className={`rounded-lg ${emergencyMode ? 'animate-pulse' : ''}`}
                style={emergencyMode ? 
                  { backgroundColor: COLORS.error, color: 'white' } : 
                  { backgroundColor: COLORS.warning, color: 'white' }
                }
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                {emergencyMode ? 'EMERGENCY ACTIVE' : 'Emergency Mode'}
              </Button>
              
              <Select value={weatherCondition} onValueChange={handleWeatherChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clear">☀️ Clear</SelectItem>
                  <SelectItem value="rain">🌧️ Rain</SelectItem>
                  <SelectItem value="snow">❄️ Snow</SelectItem>
                  <SelectItem value="fog">🌫️ Fog</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Content */}
            <div className="h-full flex items-center justify-center p-12 pt-20">
              {activeTab === "network" && (
                <div className="w-full max-w-4xl">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-semibold mb-2">Railway Network</h3>
                    <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                      Real-time train positions and station status
                    </p>
                  </div>
                  
                  <div className="space-y-12">
                    {stations.map((station, index) => (
                      <div key={station.id} className="relative">
                        {index < stations.length - 1 && (
                          <div 
                            className="absolute left-1/2 transform -translate-x-1/2 w-1 h-16 top-full"
                            style={{ backgroundColor: COLORS.border }}
                          />
                        )}
                        
                        <div className="text-center mb-6">
                          <div className="flex items-center justify-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold">{station.name}</h4>
                            <Badge 
                              className="rounded-full px-3 py-1"
                              style={{ 
                                backgroundColor: station.congestionLevel === 'high' ? COLORS.error :
                                               station.congestionLevel === 'medium' ? COLORS.warning : COLORS.success,
                                color: 'white'
                              }}
                            >
                              {station.congestionLevel}
                            </Badge>
                            <Badge 
                              className="rounded-full px-2 py-1"
                              style={{ 
                                backgroundColor: station.weatherCondition === 'clear' ? COLORS.success :
                                               station.weatherCondition === 'rain' ? COLORS.passengerTrain :
                                               station.weatherCondition === 'snow' ? COLORS.textMuted : COLORS.warning,
                                color: 'white'
                              }}
                            >
                              {station.weatherCondition === 'clear' ? '☀️' :
                               station.weatherCondition === 'rain' ? '🌧️' :
                               station.weatherCondition === 'snow' ? '❄️' : '🌫️'}
                            </Badge>
                          </div>
                          <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                            {station.occupiedPlatforms}/{station.platforms} platforms • {station.trains.length} trains • {station.temperature}°C
                          </p>
                          <p className="text-xs" style={{ color: COLORS.textMuted }}>
                            Track: {station.trackConditions} • Wind: {station.windSpeed} km/h
                          </p>
                        </div>
                        
                        <div className="flex gap-4 justify-center flex-wrap">
                          {Array.from({ length: station.platforms }).map((_, platformIndex) => {
                            const platformNumber = platformIndex + 1;
                            const platformTrain = station.trains.find(t => t.platform === platformNumber);
                            
                            return (
                              <div key={platformNumber} className="relative group">
                                <div 
                                  className="w-20 h-12 border-2 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-all duration-200"
                                  style={{ 
                                    borderColor: platformTrain ? getTrainColor(platformTrain.status, platformTrain.type) : COLORS.border,
                                    backgroundColor: platformTrain ? `${getTrainColor(platformTrain.status, platformTrain.type)}15` : COLORS.cardBackground,
                                  }}
                                  onClick={() => platformTrain && setSelectedTrain(platformTrain.id)}
                                >
                                  {platformTrain ? (
                                    <>
                                      <span className="text-xs font-bold" style={{ color: getTrainColor(platformTrain.status, platformTrain.type) }}>
                                        {platformTrain.id}
                                      </span>
                                      <span className="text-xs" style={{ color: COLORS.textMuted }}>
                                        {platformTrain.speed}km/h
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-sm" style={{ color: COLORS.textMuted }}>P{platformNumber}</span>
                                  )}
                                </div>
                                
                                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
                                  <span className="text-xs" style={{ color: COLORS.textMuted }}>
                                    Platform {platformNumber}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "signals" && (
                <div className="w-full max-w-4xl">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-semibold mb-2">Signal Control</h3>
                    <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                      Monitor and control railway signals
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    {signals.map(signal => (
                      <Card key={signal.id} className="p-6 rounded-xl border hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-semibold">{signal.name}</h4>
                            <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                              {signal.section} • Train {signal.trainId}
                            </p>
                          </div>
                          <div 
                            className="w-8 h-8 rounded-full cursor-pointer border-2 shadow-sm hover:scale-110 transition-transform flex items-center justify-center"
                            style={{ 
                              backgroundColor: getSignalColor(signal.status),
                              borderColor: COLORS.border
                            }}
                            onClick={() => !signal.automatic && handleSignalToggle(signal.id)}
                          >
                            {signal.automatic && <Radio className="h-3 w-3 text-white" />}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Badge 
                            className="rounded-full px-3 py-1"
                            style={{ 
                              backgroundColor: `${getSignalColor(signal.status)}20`,
                              color: getSignalColor(signal.status),
                              border: `1px solid ${getSignalColor(signal.status)}40`
                            }}
                          >
                            {signal.status.toUpperCase()}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <span className="text-xs" style={{ color: COLORS.textMuted }}>
                              {signal.automatic ? 'AUTO' : 'MANUAL'}
                            </span>
                            {!signal.automatic && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="rounded-lg h-7"
                                onClick={() => handleSignalToggle(signal.id)}
                              >
                                Toggle
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "trains" && (
                <div className="w-full max-w-6xl">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-semibold mb-2">Train Management</h3>
                    <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                      Monitor and control individual trains
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {stations.flatMap(station => station.trains).map(train => (
                      <Card key={train.id} className="p-6 rounded-xl border hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: getTrainColor(train.status, train.type) }}
                            />
                            <div>
                              <h4 className="font-semibold">{train.name}</h4>
                              <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                                {train.type} • {train.destination} • {train.speed}km/h
                              </p>
                              <p className="text-xs" style={{ color: COLORS.textMuted }}>
                                Section: {train.currentSection} • Progress: {Math.round(train.progress)}%
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            {train.passengers && (
                              <div className="text-center">
                                <div className="text-sm font-semibold">{train.passengers}/{train.capacity}</div>
                                <div className="text-xs" style={{ color: COLORS.textSecondary }}>Passengers</div>
                              </div>
                            )}
                            
                            <div className="text-center">
                              <div className="text-sm font-semibold">{train.fuelLevel}%</div>
                              <div className="text-xs" style={{ color: COLORS.textSecondary }}>Fuel</div>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-sm font-semibold">{formatTime(train.eta)}</div>
                              <div className="text-xs" style={{ color: COLORS.textSecondary }}>ETA</div>
                            </div>
                            
                            <Badge 
                              className="rounded-full px-3 py-1"
                              style={{ 
                                backgroundColor: `${getTrainColor(train.status, train.type)}20`,
                                color: getTrainColor(train.status, train.type),
                                border: `1px solid ${getTrainColor(train.status, train.type)}40`
                              }}
                            >
                              {train.status.replace('-', ' ').toUpperCase()}
                            </Badge>
                            
                            <Badge 
                              className="rounded-full px-2 py-1"
                              style={{ 
                                backgroundColor: train.priority === 'emergency' ? COLORS.error :
                                               train.priority === 'high' ? COLORS.warning :
                                               train.priority === 'normal' ? COLORS.success : COLORS.textMuted,
                                color: 'white'
                              }}
                            >
                              {train.priority.toUpperCase()}
                            </Badge>
                            
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="rounded-lg"
                                  onClick={() => handleTrainAction(train.id, 'hold')}
                                >
                                  Hold
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="rounded-lg"
                                  onClick={() => handleTrainAction(train.id, 'expedite')}
                                >
                                  Expedite
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="rounded-lg"
                                  onClick={() => handleTrainAction(train.id, 'emergency')}
                                  style={{ borderColor: COLORS.error, color: COLORS.error }}
                                >
                                  Emergency
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="rounded-lg"
                                  onClick={() => handleTrainAction(train.id, 'maintenance')}
                                >
                                  Service
                                </Button>
                              </div>
                              
                              <div className="flex gap-2">
                                <Select onValueChange={(value) => handleRoutePlanning(train.id, value)}>
                                  <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Change Route" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {routes.map(route => (
                                      <SelectItem key={route.id} value={route.id}>
                                        {route.name} ({route.estimatedTime}min)
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="rounded-lg"
                                  onClick={() => handleTrainAction(train.id, 'reroute')}
                                  style={{ borderColor: COLORS.textMuted, color: COLORS.textMuted }}
                                >
                                  Auto Reroute
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "tracks" && (
                <div className="w-full max-w-6xl">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-semibold mb-2">Track Sections & Block Control</h3>
                    <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                      Monitor track conditions, block status, and maintenance schedules
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    {trackSections.map(section => (
                      <Card key={section.id} className="p-6 rounded-xl border hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-semibold">{section.name}</h4>
                            <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                              {section.fromStation} → {section.toStation} • {section.length}km
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge 
                              className="rounded-full px-3 py-1"
                              style={{ 
                                backgroundColor: section.status === 'operational' ? COLORS.success :
                                               section.status === 'maintenance' ? COLORS.warning :
                                               section.status === 'blocked' ? COLORS.error : COLORS.textMuted,
                                color: 'white'
                              }}
                            >
                              {section.status.toUpperCase()}
                            </Badge>
                            <Badge 
                              className="rounded-full px-2 py-1"
                              style={{ 
                                backgroundColor: section.blockStatus === 'clear' ? COLORS.success :
                                               section.blockStatus === 'occupied' ? COLORS.error :
                                               section.blockStatus === 'blocked' ? COLORS.error : COLORS.warning,
                                color: 'white'
                              }}
                            >
                              {section.blockStatus.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-3 mb-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm" style={{ color: COLORS.textSecondary }}>Speed Limit:</span>
                            <span className="text-sm font-semibold">{section.speedRestriction} km/h</span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm" style={{ color: COLORS.textSecondary }}>Track Condition:</span>
                            <Badge 
                              className="text-xs"
                              style={{ 
                                backgroundColor: section.trackCondition === 'excellent' ? COLORS.success :
                                               section.trackCondition === 'good' ? COLORS.primaryAccent :
                                               section.trackCondition === 'fair' ? COLORS.warning : COLORS.error,
                                color: section.trackCondition === 'excellent' ? 'white' : COLORS.darkAccent
                              }}
                            >
                              {section.trackCondition.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm" style={{ color: COLORS.textSecondary }}>Capacity:</span>
                            <span className="text-sm font-semibold">{section.currentTrains.length}/{section.capacity}</span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm" style={{ color: COLORS.textSecondary }}>Next Maintenance:</span>
                            <span className="text-sm font-semibold">{formatTime(section.nextMaintenance)}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleBlockControl(section.id, 'reserve')}
                              className="flex-1"
                              style={{ borderColor: COLORS.warning, color: COLORS.warning }}
                            >
                              Reserve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleBlockControl(section.id, 'clear')}
                              className="flex-1"
                              style={{ borderColor: COLORS.success, color: COLORS.success }}
                            >
                              Clear
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleBlockControl(section.id, 'block')}
                              className="flex-1"
                              style={{ borderColor: COLORS.error, color: COLORS.error }}
                            >
                              Block
                            </Button>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSpeedRestriction(section.id, Math.max(20, section.speedRestriction - 20))}
                              className="flex-1"
                              style={{ borderColor: COLORS.textMuted, color: COLORS.textMuted }}
                            >
                              Speed ↓
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSpeedRestriction(section.id, Math.min(140, section.speedRestriction + 20))}
                              className="flex-1"
                              style={{ borderColor: COLORS.primaryAccent, color: COLORS.darkAccent }}
                            >
                              Speed ↑
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "routes" && (
                <div className="w-full max-w-6xl">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-semibold mb-2">Route Planning & Management</h3>
                    <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                      Plan and manage train routes with conflict detection
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6">
                    {routes.map(route => (
                      <Card key={route.id} className="p-6 rounded-xl border hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-semibold">{route.name}</h4>
                            <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                              {route.sections.join(' → ')} • {route.totalDistance}km • {route.estimatedTime}min
                            </p>
                          </div>
                          <Badge 
                            className="rounded-full px-3 py-1"
                            style={{ 
                              backgroundColor: route.priority === 'emergency' ? COLORS.error :
                                             route.priority === 'high' ? COLORS.warning :
                                             route.priority === 'normal' ? COLORS.primaryAccent : COLORS.textMuted,
                              color: route.priority === 'low' ? COLORS.darkAccent : 'white'
                            }}
                          >
                            {route.priority.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm" style={{ color: COLORS.textSecondary }}>Sections:</span>
                            <div className="flex gap-1">
                              {route.sections.map(sectionId => (
                                <Badge key={sectionId} className="text-xs px-2 py-0">
                                  {sectionId}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm" style={{ color: COLORS.textSecondary }}>Conflicts:</span>
                            <span className="text-sm font-semibold" style={{ color: route.conflicts.length > 0 ? COLORS.error : COLORS.success }}>
                              {route.conflicts.length > 0 ? `${route.conflicts.length} conflicts` : 'No conflicts'}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm" style={{ color: COLORS.textSecondary }}>Estimated Time:</span>
                            <span className="text-sm font-semibold">{route.estimatedTime} minutes</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "timetable" && (
                <div className="w-full max-w-6xl">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-semibold mb-2">Timetable & Schedule Management</h3>
                    <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                      Monitor train schedules and manage delays
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    {timetable.map(entry => (
                      <Card key={entry.id} className="p-6 rounded-xl border hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ 
                                backgroundColor: entry.status === 'on-time' ? COLORS.success :
                                               entry.status === 'delayed' ? COLORS.warning :
                                               entry.status === 'cancelled' ? COLORS.error : COLORS.textMuted
                              }}
                            />
                            <div>
                              <h4 className="font-semibold">{entry.trainId}</h4>
                              <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                                Route: {entry.route} • Delay: {entry.delay}min
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <div className="text-sm font-semibold">{formatTime(entry.departureTime)}</div>
                              <div className="text-xs" style={{ color: COLORS.textSecondary }}>Departure</div>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-sm font-semibold">{formatTime(entry.arrivalTime)}</div>
                              <div className="text-xs" style={{ color: COLORS.textSecondary }}>Arrival</div>
                            </div>
                            
                            <Badge 
                              className="rounded-full px-3 py-1"
                              style={{ 
                                backgroundColor: entry.status === 'on-time' ? COLORS.success :
                                               entry.status === 'delayed' ? COLORS.warning :
                                               entry.status === 'cancelled' ? COLORS.error : COLORS.textMuted,
                                color: 'white'
                              }}
                            >
                              {entry.status.toUpperCase()}
                            </Badge>
                            
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="rounded-lg"
                                onClick={() => {
                                  setTimetable(prev => prev.map(t => 
                                    t.id === entry.id ? { ...t, status: 'on-time' as const, delay: 0 } : t
                                  ));
                                }}
                              >
                                Clear Delay
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="rounded-lg"
                                onClick={() => {
                                  setTimetable(prev => prev.map(t => 
                                    t.id === entry.id ? { ...t, status: 'cancelled' as const } : t
                                  ));
                                }}
                                style={{ borderColor: COLORS.error, color: COLORS.error }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "analytics" && (
                <div className="w-full max-w-6xl">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-semibold mb-2">Performance Analytics</h3>
                    <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                      Real-time network performance metrics and trends
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <Card className="p-6 rounded-xl border">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${COLORS.success}20` }}>
                          <Target className="h-5 w-5" style={{ color: COLORS.success }} />
                        </div>
                        <div>
                          <h4 className="font-semibold">Punctuality Rate</h4>
                          <p className="text-2xl font-bold" style={{ color: COLORS.success }}>{kpis.punctuality}%</p>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${kpis.punctuality}%`,
                            backgroundColor: COLORS.success
                          }}
                        />
                      </div>
                    </Card>
                    
                    <Card className="p-6 rounded-xl border">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${COLORS.primaryAccent}20` }}>
                          <Gauge className="h-5 w-5" style={{ color: COLORS.darkAccent }} />
                        </div>
                        <div>
                          <h4 className="font-semibold">Network Efficiency</h4>
                          <p className="text-2xl font-bold" style={{ color: COLORS.darkAccent }}>{kpis.efficiency}%</p>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${kpis.efficiency}%`,
                            backgroundColor: COLORS.primaryAccent
                          }}
                        />
                      </div>
                    </Card>
                    
                    <Card className="p-6 rounded-xl border">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${COLORS.warning}20` }}>
                          <Timer className="h-5 w-5" style={{ color: COLORS.warning }} />
                        </div>
                        <div>
                          <h4 className="font-semibold">Average Delay</h4>
                          <p className="text-2xl font-bold" style={{ color: COLORS.warning }}>{kpis.averageDelay}m</p>
                        </div>
                      </div>
                      <div className="text-sm" style={{ color: COLORS.textSecondary }}>
                        Target: &lt; 3 minutes
                      </div>
                    </Card>
                    
                    <Card className="p-6 rounded-xl border">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${COLORS.passengerTrain}20` }}>
                          <Activity className="h-5 w-5" style={{ color: COLORS.passengerTrain }} />
                        </div>
                        <div>
                          <h4 className="font-semibold">Throughput</h4>
                          <p className="text-2xl font-bold" style={{ color: COLORS.passengerTrain }}>{kpis.throughput}%</p>
                        </div>
                      </div>
                      <div className="text-sm" style={{ color: COLORS.textSecondary }}>
                        Trains per hour vs capacity
                      </div>
                    </Card>
                  </div>

                  {/* Enhanced Analytics Charts */}
                  <div className="grid grid-cols-1 gap-6">
                    <Card className="p-6 rounded-xl border">
                      <h4 className="font-semibold mb-4">Network Status Overview</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 rounded-lg" style={{ backgroundColor: COLORS.lightGray }}>
                          <div className="text-2xl font-bold" style={{ color: COLORS.success }}>{stations.flatMap(s => s.trains).length}</div>
                          <div className="text-sm" style={{ color: COLORS.textSecondary }}>Active Trains</div>
                        </div>
                        <div className="text-center p-4 rounded-lg" style={{ backgroundColor: COLORS.lightGray }}>
                          <div className="text-2xl font-bold" style={{ color: COLORS.passengerTrain }}>{trackSections.filter(s => s.status === 'operational').length}</div>
                          <div className="text-sm" style={{ color: COLORS.textSecondary }}>Operational Tracks</div>
                        </div>
                        <div className="text-center p-4 rounded-lg" style={{ backgroundColor: COLORS.lightGray }}>
                          <div className="text-2xl font-bold" style={{ color: COLORS.warning }}>{signals.filter(s => s.status === 'red').length}</div>
                          <div className="text-sm" style={{ color: COLORS.textSecondary }}>Red Signals</div>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6 rounded-xl border">
                      <h4 className="font-semibold mb-4">Weather Impact Analysis</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm" style={{ color: COLORS.textSecondary }}>Current Weather:</span>
                          <Badge 
                            className="px-3 py-1"
                            style={{ 
                              backgroundColor: weatherCondition === 'clear' ? COLORS.success :
                                             weatherCondition === 'rain' ? COLORS.passengerTrain :
                                             weatherCondition === 'snow' ? COLORS.textMuted : COLORS.warning,
                              color: 'white'
                            }}
                          >
                            {weatherCondition.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm" style={{ color: COLORS.textSecondary }}>Average Speed Impact:</span>
                          <span className="text-sm font-semibold">
                            {Math.round((1 - trackSections.reduce((acc, s) => acc + s.weatherImpact, 0) / trackSections.length) * 100)}% reduction
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm" style={{ color: COLORS.textSecondary }}>Affected Sections:</span>
                          <span className="text-sm font-semibold">
                            {trackSections.filter(s => s.weatherImpact < 1).length}/{trackSections.length}
                          </span>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-6 rounded-xl border">
                      <h4 className="font-semibold mb-4">Train Status Distribution</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {['on-time', 'minor-delay', 'significant-delay', 'approaching', 'departing', 'stopped'].map(status => {
                          const count = stations.flatMap(s => s.trains).filter(t => t.status === status).length;
                          const total = stations.flatMap(s => s.trains).length;
                          const percentage = total > 0 ? (count / total) * 100 : 0;
                          
                          return (
                            <div key={status} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: COLORS.lightGray }}>
                              <span className="text-sm capitalize" style={{ color: COLORS.textSecondary }}>
                                {status.replace('-', ' ')}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold">{count}</span>
                                <div className="w-16 h-2 bg-gray-200 rounded-full">
                                  <div 
                                    className="h-2 rounded-full"
                                    style={{ 
                                      width: `${percentage}%`,
                                      backgroundColor: getTrainColor(status, 'passenger')
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  </div>
                </div>
              )}
            </div>

            {/* Simulation Status Banner */}
            {simulationMode && (
              <div className="absolute bottom-6 left-6 px-4 py-2 rounded-lg shadow-lg animate-pulse" style={{ backgroundColor: COLORS.primaryAccent, color: COLORS.darkAccent }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.darkAccent }}></div>
                  <span className="font-medium text-sm">SIMULATION ACTIVE - {simulationSpeed[0]}x SPEED</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl mx-4 shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.textPrimary }}>
                {tutorialSteps[tutorialStep].title}
              </h2>
              <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                Step {tutorialStep + 1} of {tutorialSteps.length}
              </p>
            </div>
            
            <div className="mb-8">
              <p className="text-lg leading-relaxed" style={{ color: COLORS.textPrimary }}>
                {tutorialSteps[tutorialStep].content}
              </p>
            </div>
            
            <div className="flex justify-between items-center">
              <Button
                onClick={handleTutorialPrev}
                disabled={tutorialStep === 0}
                variant="outline"
                className="rounded-lg"
              >
                Previous
              </Button>
              
              <div className="flex gap-2">
                {tutorialSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === tutorialStep ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              <Button
                onClick={handleTutorialNext}
                className="rounded-lg"
                style={{ backgroundColor: COLORS.primaryAccent, color: COLORS.darkAccent }}
              >
                {tutorialStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Achievements Modal */}
      {showAchievements && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-4xl mx-4 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold" style={{ color: COLORS.textPrimary }}>
                🏆 Achievements
              </h2>
              <Button
                onClick={() => setShowAchievements(false)}
                variant="outline"
                size="sm"
                className="rounded-lg"
              >
                ✕
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {achievementDefinitions.map(achievementDef => {
                const isUnlocked = unlockedAchievements.includes(achievementDef.id);
                return (
                  <Card key={achievementDef.id} className={`p-4 rounded-xl border ${isUnlocked ? 'opacity-100' : 'opacity-50'}`}>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{achievementDef.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold" style={{ color: COLORS.textPrimary }}>
                          {achievementDef.name}
                        </h3>
                        <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                          {achievementDef.description}
                        </p>
                        <div className="mt-2">
                          <Badge 
                            className="text-xs"
                            style={{ 
                              backgroundColor: isUnlocked ? COLORS.success : COLORS.textMuted,
                              color: 'white'
                            }}
                          >
                            {isUnlocked ? 'Unlocked' : 'Locked'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold" style={{ color: COLORS.textPrimary }}>
                ⚙️ Settings
              </h2>
              <Button
                onClick={() => setShowSettings(false)}
                variant="outline"
                size="sm"
                className="rounded-lg"
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4" style={{ color: COLORS.textPrimary }}>Game Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.lightGray }}>
                    <div className="text-sm" style={{ color: COLORS.textSecondary }}>Trains Managed</div>
                    <div className="text-lg font-bold" style={{ color: COLORS.textPrimary }}>{gameStats.totalTrainsManaged}</div>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.lightGray }}>
                    <div className="text-sm" style={{ color: COLORS.textSecondary }}>Signals Changed</div>
                    <div className="text-lg font-bold" style={{ color: COLORS.textPrimary }}>{gameStats.totalSignalsChanged}</div>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.lightGray }}>
                    <div className="text-sm" style={{ color: COLORS.textSecondary }}>Emergencies Handled</div>
                    <div className="text-lg font-bold" style={{ color: COLORS.textPrimary }}>{gameStats.totalEmergenciesHandled}</div>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: COLORS.lightGray }}>
                    <div className="text-sm" style={{ color: COLORS.textSecondary }}>Best Score</div>
                    <div className="text-lg font-bold" style={{ color: COLORS.textPrimary }}>{gameStats.bestScore}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4" style={{ color: COLORS.textPrimary }}>Game Preferences</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span style={{ color: COLORS.textSecondary }}>Auto-save progress</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: COLORS.textSecondary }}>Sound effects</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: COLORS.textSecondary }}>Visual effects</span>
                    <input type="checkbox" defaultChecked className="rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;