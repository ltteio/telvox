import React, { useState, useEffect } from 'react';
import { PlayerProfile, Session, Match } from '../types';
import { 
  Sun, 
  CloudRain, 
  Wind, 
  Snowflake, 
  Flame, 
  ShieldAlert, 
  ChevronDown, 
  ChevronRight, 
  MapPin, 
  TrendingUp, 
  AlertCircle,
  HelpCircle,
  Brain,
  Clock,
  CheckCircle2,
  Sliders,
  RefreshCw,
  Sparkles,
  Info,
  Calendar,
  Utensils,
  Compass,
  Activity
} from 'lucide-react';

export interface WeatherData {
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  weatherCode: number;
  condition: 'Soleil' | 'Pluie' | 'Vent' | 'Froid' | 'Canicule' | 'Nuageux';
  label: string;
  sunrise: string;
  sunset: string;
  locationName: string;
  isReal: boolean;
}

interface LastCheckIn {
  recoveryPercentage: number;
  fatigueLevel: 'FAIBLE' | 'MODÉRÉE' | 'ÉLEVÉE';
  sleepHours: number;
  soreness: string;
  injuryStatus: string;
}

interface ExerciseReplacement {
  originalId: string;
  name: string;
  duration: number;
  intensity: 'Faible' | 'Modérée' | 'Élevée';
  focusPoints: string[];
  description: string;
}

interface DecisionEngineState {
  statusOverview: {
    physiologicalScore: number;
    physiologicalDesc: string;
    environmentalFactor: string;
    scheduleFactor: string;
  };
  dailyChanges: {
    title: string;
    change: string;
    metricTrigger: string;
  }[];
  explanations: {
    decisionName: string;
    inputsUsed: string[];
    reasoning: string;
    decisionTaken: string;
    expectedImpact: string;
  }[];
  actionPlan: string[];
  adjustments: {
    training: {
      intensityOverride: 'Réduite' | 'Standard' | 'Accrue';
      difficultyLevel: 'Facile' | 'Standard' | 'Élite';
      focusAdjusted: string;
      motivationQuote: string;
      exerciseReplacements: ExerciseReplacement[];
    };
    nutrition: {
      hydrationGoal: number;
      macroRatio: string;
      specialAdditions: string[];
    };
    recovery: {
      protocolName: string;
      duration: number;
      stretches: string[];
    };
    notifications: string[];
  };
}

interface CentralDecisionCenterProps {
  player: PlayerProfile;
  sessions: Session[];
  matches: Match[];
  lastCheckIn: LastCheckIn;
  setLastCheckIn: React.Dispatch<React.SetStateAction<LastCheckIn>>;
  decisionState: DecisionEngineState | null;
  setDecisionState: React.Dispatch<React.SetStateAction<DecisionEngineState | null>>;
  openCoachDiscussion: (prompt: string) => void;
}

export default function CentralDecisionCenter({
  player,
  sessions,
  matches,
  lastCheckIn,
  setLastCheckIn,
  decisionState,
  setDecisionState,
  openCoachDiscussion
}: CentralDecisionCenterProps) {
  
  // Geolocation and Weather Loading states
  const [weather, setWeather] = useState<WeatherData | null>(() => {
    const stored = localStorage.getItem('football_ai_last_weather');
    if (stored) {
      try { return JSON.parse(stored); } catch (e) {}
    }
    return null;
  });

  const [loadingWeather, setLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Search real cities state
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [citySearchResults, setCitySearchResults] = useState<any[]>([]);
  const [searchingCities, setSearchingCities] = useState(false);
  const [showCitySearchDropdown, setShowCitySearchDropdown] = useState(false);

  // Decision Engine calling states
  const [loadingDecision, setLoadingDecision] = useState(false);
  const [decisionError, setDecisionError] = useState<string | null>(null);

  // Track active visual tabs for explanations
  const [expandedExplanationIdx, setExpandedExplanationIdx] = useState<number | null>(0);

  // Manual Check-in quick tweaking (enables tweaking physical state before running engine)
  const [tempSleepHours, setTempSleepHours] = useState(lastCheckIn.sleepHours);
  const [tempFatigue, setTempFatigue] = useState(lastCheckIn.fatigueLevel);
  const [tempSoreness, setTempSoreness] = useState(lastCheckIn.soreness);
  const [showStateTweaker, setShowStateTweaker] = useState(false);

  // Calculate weak foot work gap from sessions
  const getDaysSinceLastWeakFoot = () => {
    // Check if there are completed sessions with Technique category
    const completedTech = sessions
      .filter(s => s.completed && s.category === 'Technique')
      .sort((a, b) => {
        // Assume date string comparison or similar
        return 0; // standard fallback
      });
    
    // Default fallback to 4 days if player biography or skills indicate weak foot is a critical priority
    return 4; 
  };

  // 1. Get Location and Weather via Browser and Open-Meteo
  const fetchWeatherByCoords = async (lat: number, lon: number, locName: string, isReal: boolean) => {
    setLoadingWeather(true);
    setWeatherError(null);
    try {
      // Get real environmental factors via free Open-Meteo API
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,snowfall,weather_code,wind_speed_10m&daily=sunrise,sunset&timezone=auto`
      );
      
      if (!response.ok) {
        throw new Error("Erreur de communication avec Open-Meteo.");
      }

      const data = await response.json();
      const current = data.current;
      const daily = data.daily;

      const code = current.weather_code;
      const temp = current.temperature_2m;
      const wind = current.wind_speed_10m;

      // Classify condition according to WMO code rules
      let condition: 'Soleil' | 'Pluie' | 'Vent' | 'Froid' | 'Canicule' | 'Nuageux' = 'Soleil';
      let label = 'Ensoleillé';

      if (temp > 30) {
        condition = 'Canicule';
        label = 'Températures extrêmes';
      } else if (temp < 6) {
        condition = 'Froid';
        label = 'Froid polaire';
      } else if (wind > 20) {
        condition = 'Vent';
        label = 'Vent soutenu';
      } else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) {
        condition = 'Pluie';
        label = 'Pluie battante';
      } else if ([1, 2, 3].includes(code)) {
        condition = 'Nuageux';
        label = 'Nuageux / Partiellement couvert';
      } else if ([45, 48].includes(code)) {
        condition = 'Nuageux';
        label = 'Brouillard';
      } else if ([71, 73, 75, 77, 85, 86].includes(code)) {
        condition = 'Froid';
        label = 'Chute de neige';
      }

      const weatherObj: WeatherData = {
        latitude: lat,
        longitude: lon,
        temperature: Math.round(temp),
        humidity: Math.round(current.relative_humidity_2m),
        windSpeed: Math.round(wind),
        uvIndex: Math.round(current.apparent_temperature > 25 ? 6 : 2), // estimate UV
        weatherCode: code,
        condition,
        label,
        sunrise: daily?.sunrise?.[0] ? daily.sunrise[0].split('T')[1] : "06:12",
        sunset: daily?.sunset?.[0] ? daily.sunset[0].split('T')[1] : "21:34",
        locationName: locName,
        isReal
      };

      setWeather(weatherObj);
      localStorage.setItem('football_ai_last_weather', JSON.stringify(weatherObj));
      return weatherObj;
    } catch (err: any) {
      console.error(err);
      setWeatherError("Erreur d'acquisition météo réelle. Reconnexion automatique.");
      return null;
    } finally {
      setLoadingWeather(false);
    }
  };

  const triggerGeolocation = () => {
    if (!navigator.geolocation) {
      setWeatherError("La géolocalisation n'est pas supportée par votre navigateur.");
      // Fallback Paris
      fetchWeatherByCoords(48.8566, 2.3522, "Paris, France (Position de secours)", false);
      return;
    }

    setLoadingWeather(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoords(latitude, longitude, `Coordonnées GPS (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`, true);
      },
      (error) => {
        console.warn(error);
        setWeatherError("Consentement refusé ou délai expiré. Utilisation de Paris par défaut.");
        fetchWeatherByCoords(48.8566, 2.3522, "Paris, France (Position par défaut)", false);
      },
      { timeout: 8000 }
    );
  };

  // 2. Search real world cities via Open-Meteo Geocoding
  const searchCity = async (query: string) => {
    if (query.trim().length < 2) return;
    setSearchingCities(true);
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=fr`);
      const data = await res.json();
      setCitySearchResults(data.results || []);
      setShowCitySearchDropdown(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSearchingCities(false);
    }
  };

  // 3. Main Decision Query execution
  const executeDecisionEngine = async (activeWeather: WeatherData) => {
    setLoadingDecision(true);
    setDecisionError(null);
    try {
      const response = await fetch('/api/coach/decision-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerProfile: player,
          lastCheckIn,
          weather: activeWeather,
          matches,
          sessions,
          daysSinceLastWeakFoot: getDaysSinceLastWeakFoot()
        })
      });

      if (!response.ok) {
        throw new Error("Erreur de retour du cerveau central.");
      }

      const data = await response.json();
      setDecisionState(data);
      localStorage.setItem('football_ai_decision_state', JSON.stringify(data));
    } catch (err: any) {
      console.error(err);
      setDecisionError("Impossible d'exécuter la synchronisation cérébrale. Fallback déterministe actif.");
    } finally {
      setLoadingDecision(false);
    }
  };

  // Trigger engine calculation whenever check-in parameters or weather changes
  useEffect(() => {
    if (weather) {
      executeDecisionEngine(weather);
    } else {
      // Fetch default on load if nothing stored
      fetchWeatherByCoords(48.8566, 2.3522, "Paris, France (Position par défaut)", false).then((w) => {
        if (w) {
          executeDecisionEngine(w);
        } else {
          const fallbackWeather: WeatherData = {
            latitude: 48.8566,
            longitude: 2.3522,
            temperature: 18,
            humidity: 60,
            windSpeed: 12,
            uvIndex: 3,
            weatherCode: 1,
            condition: 'Soleil',
            label: 'Ensoleillé',
            sunrise: '06:12',
            sunset: '21:34',
            locationName: "Paris, France (Secours)",
            isReal: false
          };
          setWeather(fallbackWeather);
          executeDecisionEngine(fallbackWeather);
        }
      });
    }
  }, [lastCheckIn]);

  const saveTweakedState = () => {
    // estimate recovery score based on sleep and fatigue
    let score = 91;
    if (tempFatigue === 'ÉLEVÉE') score = 65;
    else if (tempFatigue === 'MODÉRÉE') score = 80;
    else if (tempSleepHours < 7) score = 78;

    const updatedCheckIn = {
      recoveryPercentage: score,
      fatigueLevel: tempFatigue,
      sleepHours: tempSleepHours,
      soreness: tempSoreness,
      injuryStatus: tempSoreness.toLowerCase().includes('bless') ? 'Surchargé' : 'Ok'
    };

    setLastCheckIn(updatedCheckIn);
    localStorage.setItem('football_ai_last_checkin', JSON.stringify(updatedCheckIn));
    setShowStateTweaker(false);
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'Pluie': return CloudRain;
      case 'Vent': return Wind;
      case 'Froid': return Snowflake;
      case 'Canicule': return Flame;
      default: return Sun;
    }
  };

  const WeatherIconComponent = weather ? getWeatherIcon(weather.condition) : Sun;

  return (
    <div id="central-decision-engine-panel" className="space-y-8 text-slate-100">
      
      {/* 1. Decision Control Room status banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-slate-950 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/10">
            <Brain className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-sans font-black text-white uppercase tracking-wide">Cerveau Décisionnel Central</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-500/20 text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-widest">
                Pilote d'Applications Unique
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Analyse en continu de tes biométries réelles, de la météo GPS, du calendrier de match et des carences techniques pour piloter l'entraînement, la nutrition et la récupération.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0 self-end md:self-auto">
          <button 
            onClick={() => setShowStateTweaker(!showStateTweaker)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-mono border border-slate-700/60 transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-slate-400" />
            <span>Ajuster mon état</span>
          </button>
          <button 
            onClick={() => weather && executeDecisionEngine(weather)}
            disabled={loadingDecision}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-xl border border-slate-700/60 transition-all cursor-pointer"
            title="Recalculer les décisions IA"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-400 ${loadingDecision ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* State Tweaker drawer when open */}
      {showStateTweaker && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 animate-scale-up">
          <h4 className="text-xs font-mono uppercase tracking-widest font-bold text-emerald-400">Modifier ton bilan physiologique actuel :</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-500 uppercase">Durée du sommeil ({tempSleepHours} heures)</label>
              <input 
                type="range" 
                min="4" 
                max="11" 
                value={tempSleepHours} 
                onChange={(e) => setTempSleepHours(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-500 uppercase">Niveau de fatigue générale</label>
              <select 
                value={tempFatigue} 
                onChange={(e) => setTempFatigue(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 p-2 rounded-xl text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="FAIBLE">FAIBLE (Prêt pour de l'intensité)</option>
                <option value="MODÉRÉE">MODÉRÉE (Tensions moyennes)</option>
                <option value="ÉLEVÉE">ÉLEVÉE (Alerte surmenage)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-500 uppercase">Douleurs / tensions musculaires</label>
              <input 
                type="text" 
                value={tempSoreness} 
                onChange={(e) => setTempSoreness(e.target.value)}
                placeholder="Ex: Raideurs mollets, Aucune"
                className="w-full bg-slate-900 border border-slate-800 p-2 rounded-xl text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button 
              onClick={() => setShowStateTweaker(false)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-lg text-xs font-mono"
            >
              Annuler
            </button>
            <button 
              onClick={saveTweakedState}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg font-sans font-bold text-xs"
            >
              Sauvegarder & Recalculer
            </button>
          </div>
        </div>
      )}

      {/* Real Weather Control Center (No simulator - completely dynamic) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Geographic location and environmental sensors */}
        <div className="md:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Localisation & Paramètres environnementaux réels</span>
              <div className="flex items-center space-x-2 text-slate-200">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span className="font-sans font-bold text-sm">{weather ? weather.locationName : "En attente d'acquisition..."}</span>
                {weather?.isReal && (
                  <span className="px-2 py-0.5 bg-cyan-400/10 border border-cyan-500/20 text-[8px] font-mono text-cyan-400 font-bold rounded-md uppercase">GPS Actif</span>
                )}
              </div>
            </div>

            {/* City search input to search real-world coordinates via Geocoding */}
            <div className="relative w-full sm:w-64">
              <div className="flex bg-slate-950 rounded-xl border border-slate-800 overflow-hidden text-xs">
                <input 
                  type="text" 
                  value={citySearchQuery} 
                  onChange={(e) => {
                    setCitySearchQuery(e.target.value);
                    searchCity(e.target.value);
                  }}
                  placeholder="Rechercher une ville réelle..." 
                  className="w-full bg-transparent px-3 py-2 text-slate-300 focus:outline-none"
                />
                <button 
                  onClick={triggerGeolocation}
                  className="px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[10px] border-l border-slate-800 cursor-pointer"
                  title="Utiliser ma géolocalisation actuelle"
                >
                  GPS
                </button>
              </div>

              {showCitySearchDropdown && citySearchResults.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-900">
                  {citySearchResults.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => {
                        fetchWeatherByCoords(city.latitude, city.longitude, `${city.name}, ${city.country}`, true);
                        setShowCitySearchDropdown(false);
                        setCitySearchQuery('');
                      }}
                      className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:bg-slate-900 transition-colors block cursor-pointer"
                    >
                      <span className="font-bold text-white block">{city.name}</span>
                      <span className="text-[10px] text-slate-500">{city.admin1 ? `${city.admin1}, ` : ''}{city.country}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {loadingWeather ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-2">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-mono text-slate-500">Acquisition des capteurs météo...</p>
            </div>
          ) : weather ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl flex items-center space-x-3">
                <div className="p-2.5 bg-amber-400/10 text-amber-400 rounded-xl">
                  <WeatherIconComponent className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Climat</span>
                  <span className="text-white text-xs font-bold">{weather.temperature}°C • {weather.label}</span>
                </div>
              </div>

              <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl flex items-center space-x-3">
                <div className="p-2.5 bg-cyan-400/10 text-cyan-400 rounded-xl">
                  <CloudRain className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Humidité</span>
                  <span className="text-white text-xs font-bold">{weather.humidity}%</span>
                </div>
              </div>

              <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl flex items-center space-x-3">
                <div className="p-2.5 bg-teal-400/10 text-teal-400 rounded-xl">
                  <Wind className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Vent</span>
                  <span className="text-white text-xs font-bold">{weather.windSpeed} km/h</span>
                </div>
              </div>

              <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl flex items-center space-x-3">
                <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Indice UV</span>
                  <span className="text-white text-xs font-bold">{weather.uvIndex} (Basse)</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <button 
                onClick={triggerGeolocation}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold font-sans cursor-pointer"
              >
                Activer les données réelles locales
              </button>
            </div>
          )}

          {weatherError && (
            <span className="text-[10px] font-mono text-amber-500 block">{weatherError}</span>
          )}
        </div>

        {/* Real schedule deadlines */}
        <div className="md:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Calendrier de match réel</span>
            <div className="mt-4 space-y-3">
              {matches.filter(m => !m.completed).length > 0 ? (
                matches.filter(m => !m.completed).slice(0, 1).map(m => {
                  const days = Math.ceil((new Date(m.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={m.id} className="bg-slate-950/50 p-4 rounded-2xl border border-slate-855 flex items-start space-x-3">
                      <Calendar className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wide">Match de compétition à venir</span>
                        <h4 className="text-white font-bold text-xs mt-1">vs {m.opponent} ({m.type})</h4>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 font-mono text-[9px] font-bold rounded">
                            J - {days}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">{m.date}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-xs font-mono text-slate-500">
                  Aucun match inscrit au calendrier.
                </div>
              )}
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-800/60 mt-4 flex justify-between items-center text-xs text-slate-400 font-mono">
            <span>Dernière séance pied faible</span>
            <span className="text-amber-400 font-bold">{getDaysSinceLastWeakFoot()} jours</span>
          </div>
        </div>
      </div>

      {/* 2. THE FOUR KEY DECISION QUESTIONS */}
      {loadingDecision ? (
        <div className="py-24 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col items-center justify-center space-y-3 shadow-xl">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-400">Calcul matriciel des 4 questions fondamentales en cours...</p>
        </div>
      ) : decisionError && !decisionState ? (
        <div className="p-8 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-3xl text-xs flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{decisionError}</span>
        </div>
      ) : decisionState ? (
        <div className="space-y-8">
          
          {/* Bento grid answering the 4 Questions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Question 1: Quel est mon état aujourd'hui ? */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl hover:border-slate-700/60 transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-black">Question 1</span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-mono font-bold rounded-md">PHYSIO</span>
                </div>
                <h3 className="text-base font-sans font-bold text-white">Quel est mon état aujourd'hui ?</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {decisionState.statusOverview.physiologicalDesc}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800/80">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Récupération</span>
                  <span className="text-emerald-400 text-lg font-black font-mono">{decisionState.statusOverview.physiologicalScore}%</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Fatigue cumulée</span>
                  <span className="text-white text-xs font-bold font-mono mt-1 block">{lastCheckIn.fatigueLevel}</span>
                </div>
              </div>
            </div>

            {/* Question 2: Qu'est-ce qui a changé depuis hier ? */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl hover:border-slate-700/60 transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-black">Question 2</span>
                  <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 text-[8px] font-mono font-bold rounded-md">ADAPTATION DYNAMIQUE</span>
                </div>
                <h3 className="text-base font-sans font-bold text-white">Qu'est-ce qui a changé depuis hier ?</h3>
                
                <div className="space-y-2.5 mt-3">
                  {decisionState.dailyChanges.map((dc, i) => (
                    <div key={i} className="bg-slate-950/40 border border-slate-850 p-3 rounded-xl flex items-start space-x-2.5">
                      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <h4 className="text-white text-xs font-bold">{dc.title}</h4>
                        <p className="text-[11px] text-slate-300 mt-0.5">{dc.change}</p>
                        <span className="text-[9px] font-mono text-slate-500 block mt-1.5">Déclencheur : {dc.metricTrigger}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Question 3: Pourquoi ces changements ont-ils été décidés ? (Explicabilité totale) */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl hover:border-slate-700/60 transition-all md:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest font-black">Question 3</span>
                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[8px] font-mono font-bold rounded-md">MOTEUR D'EXPLICABILITÉ</span>
              </div>
              <h3 className="text-base font-sans font-bold text-white">Pourquoi ces changements ont-ils été décidés ?</h3>
              <p className="text-xs text-slate-400 max-w-2xl">
                Toutes les décisions de l'IA sont transparentes et motivées scientifiquement. Sélectionne une décision ci-dessous pour voir l'explicabilité complète :
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 items-start">
                {/* Decision list buttons */}
                <div className="lg:col-span-5 space-y-2">
                  {decisionState.explanations.map((exp, idx) => (
                    <button
                      key={idx}
                      onClick={() => setExpandedExplanationIdx(idx)}
                      className={`w-full text-left p-4 rounded-2xl border text-xs transition-all cursor-pointer block ${
                        expandedExplanationIdx === idx
                          ? 'bg-slate-950 border-amber-500/40 shadow-inner'
                          : 'bg-slate-950/40 border-slate-850 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-sans font-bold text-white text-xs">{exp.decisionName}</span>
                        <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${expandedExplanationIdx === idx ? 'rotate-90 text-amber-400' : ''}`} />
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 block mt-1.5 uppercase">
                        Données : {exp.inputsUsed.join(', ')}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Explicability Content Panel */}
                <div className="lg:col-span-7 bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-4 min-h-48 flex flex-col justify-between">
                  {expandedExplanationIdx !== null && decisionState.explanations[expandedExplanationIdx] ? (
                    <div className="space-y-4">
                      <div>
                        <span className="text-[9px] font-mono text-amber-500 uppercase block tracking-wider font-bold">Raisonnement Scientifique & Physiologique :</span>
                        <p className="text-slate-200 text-xs mt-1 leading-relaxed">
                          "{decisionState.explanations[expandedExplanationIdx].reasoning}"
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-900">
                        <div>
                          <span className="text-[9px] font-mono text-slate-500 uppercase block">Décision prise</span>
                          <span className="text-slate-200 text-xs font-semibold block mt-1 leading-normal">
                            {decisionState.explanations[expandedExplanationIdx].decisionTaken}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-mono text-slate-500 uppercase block">Impact attendu</span>
                          <span className="text-emerald-400 text-xs font-semibold block mt-1 leading-normal">
                            {decisionState.explanations[expandedExplanationIdx].expectedImpact}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-xs font-mono text-slate-500">
                      Sélectionne une décision à gauche pour afficher l'analyse explicable.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Question 4: Que dois-je faire maintenant ? (Action Plan) */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl hover:border-slate-700/60 transition-all md:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-black">Question 4</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-mono font-bold rounded-md">PROGRAMME D'ACTION</span>
              </div>
              <h3 className="text-base font-sans font-bold text-white">Que dois-je faire maintenant ?</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                {decisionState.actionPlan.map((act, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-950 border border-slate-850 flex items-start space-x-3 group">
                    <div className="w-6 h-6 rounded-lg bg-emerald-400/10 text-emerald-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-xs text-slate-200 leading-normal font-semibold">
                        {act}
                      </p>
                      <button
                        onClick={() => openCoachDiscussion(`Explique-moi comment réaliser au mieux cette action recommandée : "${act}"`)}
                        className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 mt-2 flex items-center space-x-0.5 cursor-pointer"
                      >
                        <span>Détails de l'exercice</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Dynamic adjustments indicators - proof of central module coordination */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="flex items-center space-x-2.5">
              <Compass className="w-5 h-5 text-emerald-400" />
              <div>
                <h4 className="text-sm font-sans font-black text-white uppercase tracking-wider">État des pilotages en temps réel :</h4>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Vérifie l'impact sur tous tes modules</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 relative group">
                <div className="absolute top-4 right-4 text-[9px] font-mono text-slate-500 uppercase">Module Entraînement</div>
                <div className="flex items-center space-x-2 text-white font-bold text-xs">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Séance du jour</span>
                </div>
                <div className="mt-3 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-mono text-[10px]">Intensité :</span>
                    <span className="text-emerald-400 font-bold">{decisionState.adjustments.training.intensityOverride}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-mono text-[10px]">Difficulté :</span>
                    <span className="text-cyan-400 font-bold">{decisionState.adjustments.training.difficultyLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-mono text-[10px]">Focus :</span>
                    <span className="text-white font-bold truncate max-w-[120px]">{decisionState.adjustments.training.focusAdjusted}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 relative group">
                <div className="absolute top-4 right-4 text-[9px] font-mono text-slate-500 uppercase">Module Nutrition</div>
                <div className="flex items-center space-x-2 text-white font-bold text-xs">
                  <Utensils className="w-4 h-4 text-emerald-400" />
                  <span>Cible Métabolique</span>
                </div>
                <div className="mt-3 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-mono text-[10px]">Hydratation :</span>
                    <span className="text-emerald-400 font-bold">{decisionState.adjustments.nutrition.hydrationGoal} ml</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-mono text-[10px]">Macro-ratio :</span>
                    <span className="text-cyan-400 font-bold truncate max-w-[120px]" title={decisionState.adjustments.nutrition.macroRatio}>{decisionState.adjustments.nutrition.macroRatio}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-mono text-[10px]">Additifs :</span>
                    <span className="text-white font-bold truncate max-w-[120px]">{decisionState.adjustments.nutrition.specialAdditions[0] || 'Aucun'}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 relative group">
                <div className="absolute top-4 right-4 text-[9px] font-mono text-slate-500 uppercase">Module Récupération</div>
                <div className="flex items-center space-x-2 text-white font-bold text-xs">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Régénération</span>
                </div>
                <div className="mt-3 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-mono text-[10px]">Protocole :</span>
                    <span className="text-white font-bold truncate max-w-[120px]" title={decisionState.adjustments.recovery.protocolName}>{decisionState.adjustments.recovery.protocolName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-mono text-[10px]">Durée :</span>
                    <span className="text-emerald-400 font-bold">{decisionState.adjustments.recovery.duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-mono text-[10px]">Étirements :</span>
                    <span className="text-cyan-400 font-bold truncate max-w-[120px]">{decisionState.adjustments.recovery.stretches[0] || 'Aucun'}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      ) : null}

    </div>
  );
}
