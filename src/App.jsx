import { useState, useEffect } from 'react';
import {
  Droplet, FlaskConical, Thermometer, Waves, Activity, BarChart2, Map,
  MapPin, TrendingDown, TrendingUp, Leaf, Search, Info, Sun, Moon, User, Bell, Download, CloudRain, SunMedium, Cloud, Brain, Clock, Calculator, Plus, LogOut, CheckCircle, Camera, ShieldAlert, DollarSign, Bug, Image as ImageIcon,
  Sprout, ClipboardList, PiggyBank, MessageSquare, TrendingUp as TrendUp, Wheat, Trash2, Send, ChevronRight
} from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { translations } from './translations';

import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, BarChart, Bar, Cell
} from 'recharts';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, useMapEvents } from 'react-leaflet';
import './index.css';

// Generating dummy 7 day history
const makeHistory = (baseM, baseT) => Array.from({ length: 7 }).map((_, i) => ({
  name: `Day ${i + 1}`,
  moisture: baseM + Math.floor(Math.random() * 10 - 5),
  temp: baseT + Math.floor(Math.random() * 6 - 3),
  n: 150 + Math.floor(Math.random() * 20),
  p: 40 + Math.floor(Math.random() * 10),
  k: 60 + Math.floor(Math.random() * 10)
}));

const initialPoints = [
  { id: '1', name: "Polonnaruwa Paddy Fields", datetime: "Tuesday, March 31, 2026 at 8:15 AM", location: "7.9403, 81.0188", time: "08:15 AM", moisture: 82, temp: 28, ph: 6.5, salinity: 0.8, n: 160, p: 45, k: 50, history: makeHistory(82, 28) },
  { id: '2', name: "Nuwara Eliya Vegetable Estates", datetime: "Tuesday, March 31, 2026 at 8:25 AM", location: "6.9497, 80.7828", time: "08:25 AM", moisture: 75, temp: 16, ph: 5.5, salinity: 0.4, n: 140, p: 55, k: 70, history: makeHistory(75, 16) },
  { id: '3', name: "Anuradhapura Dry Zone Farming", datetime: "Tuesday, March 31, 2026 at 8:40 AM", location: "8.3114, 80.4037", time: "08:40 AM", moisture: 42, temp: 33, ph: 7.0, salinity: 1.2, n: 110, p: 30, k: 45, history: makeHistory(42, 33) },
  { id: '4', name: "Jaffna Peninsula Farms", datetime: "Tuesday, March 31, 2026 at 8:50 AM", location: "9.6615, 80.0255", time: "08:50 AM", moisture: 35, temp: 35, ph: 7.8, salinity: 3.2, n: 80, p: 20, k: 40, history: makeHistory(35, 35) },
  { id: '5', name: "Ampara Paddy Fields", datetime: "Tuesday, March 31, 2026 at 9:05 AM", location: "7.2912, 81.6724", time: "09:05 AM", moisture: 80, temp: 29, ph: 6.8, salinity: 0.9, n: 165, p: 40, k: 55, history: makeHistory(80, 29) },
  { id: '6', name: "Badulla Tea Plantations", datetime: "Tuesday, March 31, 2026 at 9:15 AM", location: "6.9926, 81.0550", time: "09:15 AM", moisture: 68, temp: 20, ph: 5.8, salinity: 0.5, n: 130, p: 50, k: 65, history: makeHistory(68, 20) },
  { id: '7', name: "Puttalam Coconut Estates", datetime: "Tuesday, March 31, 2026 at 9:30 AM", location: "8.0360, 79.8283", time: "09:30 AM", moisture: 40, temp: 32, ph: 7.2, salinity: 2.5, n: 100, p: 25, k: 80, history: makeHistory(40, 32) },
  { id: '8', name: "Matale Spice Gardens", datetime: "Tuesday, March 31, 2026 at 9:45 AM", location: "7.4665, 80.6234", time: "09:45 AM", moisture: 65, temp: 26, ph: 6.4, salinity: 0.7, n: 145, p: 40, k: 60, history: makeHistory(65, 26) }
];

const initialCropList = [
  { id: 'c1', name: 'rice', icon: '🌾', req: { m: 70, n: 160, ph: 6.5 } },
  { id: 'c2', name: 'wheat', icon: '🌾', req: { m: 50, n: 140, ph: 6.8 } },
  { id: 'c3', name: 'corn', icon: '🌽', req: { m: 60, n: 150, ph: 6.2 } },
  { id: 'c4', name: 'tomato', icon: '🍅', req: { m: 65, n: 130, ph: 6.0 } },
  { id: 'c5', name: 'potato', icon: '🥔', req: { m: 75, n: 140, ph: 5.5 } },
  { id: 'c6', name: 'soybean', icon: '🍃', req: { m: 55, n: 100, ph: 6.5 } },
  { id: 'c7', name: 'cotton', icon: '☁️', req: { m: 45, n: 120, ph: 7.0 } },
  { id: 'c8', name: 'carrot', icon: '🥕', req: { m: 60, n: 110, ph: 6.0 } },
  { id: 'c9', name: 'onion', icon: '🧅', req: { m: 50, n: 120, ph: 6.5 } },
  { id: 'c10', name: 'lettuce', icon: '🥬', req: { m: 80, n: 140, ph: 6.0 } },
];

const summaryData = {
  moisture: { value: 60.7, unit: '%', min: 35.0, max: 85.0, icon: <Droplet size={18} color="var(--accent-blue)" /> },
  ph: { value: 6.7, unit: '', min: 6.0, max: 7.5, icon: <FlaskConical size={18} color="#8b5cf6" /> },
  temp: { value: 27.5, unit: '°C', min: 21.0, max: 34.0, icon: <Thermometer size={18} color="var(--accent-red)" /> },
  salinity: { value: 1.9, unit: 'dS/m', min: 0.5, max: 3.8, icon: <Waves size={18} color="var(--accent-orange)" /> },
  npk: { n: 150, p: 30, k: 58, unit: 'mg/kg' }
};

const customIcon = new L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div class="map-pin-icon-wrap"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 15 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28]
});

const parseLocation = (loc) => loc.split(',').map(s => parseFloat(s.trim()));

function MapClickHandler() {
  const [clickedPos, setClickedPos] = useState(null);
  useMapEvents({
    click(e) {
      setClickedPos(e.latlng);
    },
  });

  return clickedPos === null ? null : (
    <Popup position={clickedPos} onClose={() => setClickedPos(null)}>
      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Custom Location</div>
      <div style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>{clickedPos.lat.toFixed(5)}, {clickedPos.lng.toFixed(5)}</div>
      <button
        onClick={(e) => {
          const locStr = `${clickedPos.lat.toFixed(5)}, ${clickedPos.lng.toFixed(5)}`;
          navigator.clipboard.writeText(locStr);
          const btn = e.currentTarget;
          const old = btn.innerHTML;
          btn.innerHTML = '✅ Copied!';
          btn.style.background = '#22c55e';
          setTimeout(() => {
            btn.innerHTML = old;
            btn.style.background = 'var(--accent-blue)';
          }, 2000);
        }}
        style={{
          background: 'var(--accent-blue)', color: 'white', border: 'none',
          padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem',
          display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'center', transition: 'background 0.3s'
        }}
      >
        📋 Copy GPS
      </button>
    </Popup>
  );
}


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [registeredUsers, setRegisteredUsers] = useState([{ username: 'madhubhashana', password: '1234' }]);
  const [lang, setLang] = useState('en');
  const [testPoints, setTestPoints] = useState(initialPoints);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPointId, setSelectedPointId] = useState(initialPoints[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDark, setIsDark] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [isHistoryMode, setIsHistoryMode] = useState(false);
  const [landSize, setLandSize] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  // Form input states
  const [loginUser, setLoginUser] = useState('madhubhashana');
  const [loginPass, setLoginPass] = useState('1234');
  const [regUser, setRegUser] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regPassConfirm, setRegPassConfirm] = useState('');

  const [crops, setCrops] = useState(initialCropList);
  const [showAddCropModal, setShowAddCropModal] = useState(false);
  const [newCropName, setNewCropName] = useState('');
  const [newCropIcon, setNewCropIcon] = useState('');
  const [reqM, setReqM] = useState(60);
  const [reqN, setReqN] = useState(120);
  const [reqPH, setReqPH] = useState(6.0);

  // Enterprise Features State
  const [marketPrice, setMarketPrice] = useState(200);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weatherData, setWeatherData] = useState(null);
  const [locationName, setLocationName] = useState('');

  // Phase 3 - Farm Tools State
  const [farmTasks, setFarmTasks] = useState(() => JSON.parse(localStorage.getItem('farmTasks') || '[]'));
  const [newTask, setNewTask] = useState('');
  const [newTaskFarm, setNewTaskFarm] = useState('');
  const [harvestLogs, setHarvestLogs] = useState(() => JSON.parse(localStorage.getItem('harvestLogs') || '[]'));
  const [newHarvestDate, setNewHarvestDate] = useState('');
  const [newHarvestKg, setNewHarvestKg] = useState('');
  const [newHarvestPrice, setNewHarvestPrice] = useState('');
  const [cropCalendars, setCropCalendars] = useState(() => JSON.parse(localStorage.getItem('cropCalendars') || '{}'));
  const [expenseCosts, setExpenseCosts] = useState({ fertilizer: 0, seeds: 0, labour: 0, water: 0 });
  const [chatMessages, setChatMessages] = useState([{ role: 'model', text: translations[lang].chatGreeting }]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [geminiModel, setGeminiModel] = useState(() => {
    const saved = localStorage.getItem('gemini_model');
    if (!saved || saved === 'gemini-2.0-flash' || saved === 'gemini-1.5-flash') return 'gemini-2.5-flash';
    return saved;
  });

  const t = translations[lang];

  useEffect(() => {
    setChatMessages(prev => {
      if (prev.length === 1 && prev[0].role === 'model') {
        return [{ role: 'model', text: t.chatGreeting }];
      }
      return prev;
    });
  }, [lang, t.chatGreeting]);

  const [showFloatChat, setShowFloatChat] = useState(false);
  const [marketPrices, setMarketPrices] = useState(() => {
    const saved = localStorage.getItem('customMarketPrices');
    return saved ? JSON.parse(saved) : null;
  });
  const [isMarketLoading, setIsMarketLoading] = useState(false);
  const [marketLastUpdated, setMarketLastUpdated] = useState(null);
  const [editingMarketIdx, setEditingMarketIdx] = useState(null);
  const [editingMarketValue, setEditingMarketValue] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const point = testPoints.find(p => p.id === selectedPointId);
    if (!point || !point.location) return;
    const [lat, lng] = parseLocation(point.location);

    async function fetchWeather() {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`);
        const data = await res.json();
        setWeatherData(data.current_weather);

        const locRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`);
        const locData = await locRes.json();
        const city = locData.address?.city || locData.address?.town || locData.address?.county || locData.address?.state || '';
        setLocationName(city);
      } catch (err) {
        console.error(err);
        setLocationName('');
      }
    }
    fetchWeather();
  }, [selectedPointId]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      setTestPoints(prevPoints => prevPoints.map(pt => ({
        ...pt,
        moisture: Math.max(0, Math.min(100, +(pt.moisture + (Math.random() * 0.4 - 0.2)).toFixed(1))),
        temp: Math.max(0, Math.min(50, +(pt.temp + (Math.random() * 0.2 - 0.1)).toFixed(1))),
        ph: Math.max(0, Math.min(14, +(pt.ph + (Math.random() * 0.04 - 0.02)).toFixed(2))),
        salinity: Math.max(0, +(pt.salinity + (Math.random() * 0.04 - 0.02)).toFixed(2))
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const submitNewCrop = () => {
    if (!newCropName.trim()) return;
    const addedCrop = {
      id: "c" + Date.now(),
      name: newCropName,
      icon: newCropIcon || '🌱',
      req: { m: Number(reqM), n: Number(reqN), ph: Number(reqPH) }
    };
    setCrops([...crops, addedCrop]);
    setShowAddCropModal(false);
    setNewCropName('');
    setNewCropIcon('');
    setSearchQuery('');
  };

  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  const handleLogin = () => {
    setAuthError('');
    setAuthSuccess('');
    const foundUser = registeredUsers.find(u => u.username === loginUser && u.password === loginPass);
    if (foundUser) {
      setIsAuthenticated(true);
    } else {
      setAuthError('Invalid username or password! / වැරදි පරිශීලක නාමයක් හෝ මුරපදයක්!');
    }
  };

  const handleRegister = () => {
    setAuthError('');
    setAuthSuccess('');
    if (!regUser || !regPass) {
      setAuthError('Please fill all fields! / කරුණාකර සියලු තොරතුරු ඇතුලත් කරන්න!');
      return;
    }
    if (regPass !== regPassConfirm) {
      setAuthError('Passwords do not match! / මුරපද ගැලපෙන්නේ නැත!');
      return;
    }
    if (registeredUsers.some(u => u.username === regUser)) {
      setAuthError('Username already exists! / මෙම පරිශීලක නාමය දැනටමත් ඇත!');
      return;
    }

    setRegisteredUsers([...registeredUsers, { username: regUser, password: regPass }]);
    setAuthSuccess('Registration successful! Please login. / ලියාපදිංචිය සාර්ථකයි! කරුණාකර ඇතුල්වන්න.');
    setAuthMode('login');
    setLoginUser(regUser);
    setLoginPass('');
    setRegUser('');
    setRegPass('');
    setRegPassConfirm('');
  };

  // Weather state
  const [weather, setWeather] = useState(null);

  // Alerts
  const [showAlerts, setShowAlerts] = useState(false);
  const alertsList = testPoints.filter(p => p.moisture < 40).map(p => ({
    id: p.id, msg: `Low Moisture (${p.moisture}%) in ${p.name}`
  }));

  const selectedPoint = testPoints.find(p => p.id === selectedPointId) || testPoints[0];

  useEffect(() => {
    const fetchWeather = async () => {
      const [lat, lng] = parseLocation(selectedPoint.location);
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`);
        const data = await res.json();
        setWeather(data.current_weather);
      } catch (e) {
        setWeather(null);
      }
    };
    fetchWeather();
  }, [selectedPoint.location]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const submitNewFarm = () => {
    if (!newFarmName.trim()) return;
    const baseM = 60 + Math.floor(Math.random() * 20);
    const baseT = 25 + Math.floor(Math.random() * 7);
    const newPoint = {
      id: Date.now().toString(),
      name: newFarmName,
      datetime: new Date().toLocaleString(),
      location: `${7.8731 + (Math.random() * 2 - 1)}, ${80.7718 + (Math.random() * 1 - 0.5)}`, // Random coordinates in SL
      time: new Date().toLocaleTimeString(),
      moisture: baseM,
      temp: baseT,
      ph: (5.5 + Math.random() * 2).toFixed(1),
      salinity: (1.0 + Math.random() * 2).toFixed(1),
      n: 120 + Math.floor(Math.random() * 60),
      p: 30 + Math.floor(Math.random() * 30),
      k: 40 + Math.floor(Math.random() * 40),
      history: makeHistory(baseM, baseT)
    };
    setTestPoints([...testPoints, newPoint]);
    setSelectedPointId(newPoint.id);
    setShowAddModal(false);
    setNewFarmName('');
    setActiveTab('map');
  };

  const calcFertilizer = () => {
    let cropN = selectedCrop ? selectedCrop.req.n : 160;
    let cropP = selectedCrop ? Math.round(selectedCrop.req.n * 0.3) : 50;
    let cropK = selectedCrop ? Math.round(selectedCrop.req.n * 0.5) : 80;

    let defN = Math.max(0, cropN - selectedPoint.n) * 2;
    let defP = Math.max(0, cropP - selectedPoint.p) * 2;
    let defK = Math.max(0, cropK - selectedPoint.k) * 2;

    const hA = landSize * 0.4047;
    const urea = Math.round((defN / 0.46) * hA);
    const tsp = Math.round((defP / 0.46) * hA);
    const mop = Math.round((defK / 0.60) * hA);

    return { urea, tsp, mop };
  };
  const fertData = calcFertilizer();

  const calcYield = () => {
    // Predictive harvest target kg/Hectare (Rice standard)
    const base = 4000;
    const moistureBonus = (selectedPoint.moisture - 50) * 15;
    const npkBonus = (selectedPoint.n + selectedPoint.p + selectedPoint.k - 200) * 5;
    return Math.max(1000, Math.round(base + moistureBonus + npkBonus));
  };

  const calculateSuitability = (crop, point) => {
    let score = 100;
    const advice = [];
    const mDiff = point.moisture - crop.req.m;
    if (Math.abs(mDiff) > 10) { score -= 20; advice.push(mDiff < 0 ? 'increaseMoisture' : 'decreaseMoisture'); }
    const nDiff = point.n - crop.req.n;
    if (Math.abs(nDiff) > 20) { score -= 15; if (nDiff < 0) advice.push('increaseNitrogen'); }
    if (Math.abs(point.ph - crop.req.ph) > 0.5) { score -= 10; advice.push('adjustPH'); }
    return { score: Math.max(score, 0), advice };
  };

  // Phase 3 Helper Functions
  const calcSoilHealthScore = (point) => {
    let score = 0;
    score += Math.min(30, Math.round((point.moisture / 100) * 30));
    const phScore = point.ph >= 6.0 && point.ph <= 7.5 ? 20 : point.ph >= 5.5 && point.ph <= 8.0 ? 10 : 5;
    score += phScore;
    const salinityScore = point.salinity < 1.5 ? 20 : point.salinity < 3.0 ? 10 : 0;
    score += salinityScore;
    score += Math.min(15, Math.round((point.n / 200) * 15));
    score += Math.min(10, Math.round((point.p / 80) * 10));
    score += Math.min(5, Math.round((point.k / 100) * 5));
    return Math.min(100, score);
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    const task = { id: Date.now(), text: newTask, farm: selectedPoint.name, done: false, date: new Date().toLocaleDateString() };
    const updated = [...farmTasks, task];
    setFarmTasks(updated);
    localStorage.setItem('farmTasks', JSON.stringify(updated));
    setNewTask('');
  };

  const toggleTask = (id) => {
    const updated = farmTasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
    setFarmTasks(updated);
    localStorage.setItem('farmTasks', JSON.stringify(updated));
  };

  const deleteTask = (id) => {
    const updated = farmTasks.filter(t => t.id !== id);
    setFarmTasks(updated);
    localStorage.setItem('farmTasks', JSON.stringify(updated));
  };

  const addHarvestLog = () => {
    if (!newHarvestKg || !newHarvestDate) return;
    const log = { id: Date.now(), date: newHarvestDate, kg: Number(newHarvestKg), price: Number(newHarvestPrice), farm: selectedPoint.name, earnings: Math.round(Number(newHarvestKg) * Number(newHarvestPrice)) };
    const updated = [...harvestLogs, log];
    setHarvestLogs(updated);
    localStorage.setItem('harvestLogs', JSON.stringify(updated));
    setNewHarvestDate(''); setNewHarvestKg(''); setNewHarvestPrice('');
  };

  const deleteHarvestLog = (id) => {
    const updated = harvestLogs.filter(h => h.id !== id);
    setHarvestLogs(updated);
    localStorage.setItem('harvestLogs', JSON.stringify(updated));
  };

  const saveCropCalendar = (farmId, plantDate) => {
    const updated = { ...cropCalendars, [farmId]: plantDate };
    setCropCalendars(updated);
    localStorage.setItem('cropCalendars', JSON.stringify(updated));
  };

  const getCropStage = (plantDate) => {
    if (!plantDate) return null;
    const days = Math.floor((new Date() - new Date(plantDate)) / (1000 * 60 * 60 * 24));
    if (days < 0) return { stage: 'Planned', color: '#94a3b8', days };
    if (days < 14) return { stage: '🌱 Seedling', color: '#22c55e', days };
    if (days < 45) return { stage: '🌿 Growing', color: '#16a34a', days };
    if (days < 90) return { stage: '🌾 Maturing', color: '#f59e0b', days };
    return { stage: '🌟 Harvest Ready!', color: '#ef4444', days };
  };

  const callGemini = async (apiKey, modelName, prompt, imageParts = []) => {
    const apiVersions = ['v1beta', 'v1'];
    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-flash-latest',
      'gemini-pro-latest',
      modelName
    ];
    const uniqueModels = [...new Set(modelsToTry.filter(Boolean))];

    let lastError = null;
    for (const version of apiVersions) {
      const genAI = new GoogleGenerativeAI(apiKey, version ? { apiVersion: version } : undefined);
      for (const modelId of uniqueModels) {
        try {
          const model = genAI.getGenerativeModel({ model: modelId });
          const result = await model.generateContent([prompt, ...imageParts]);
          return result.response.text();
        } catch (err) {
          lastError = err;
          const msg = err.message || '';
          console.warn(`[${version}] Model ${modelId} failed: ${msg}`);
          if (msg.includes('503') || msg.includes('429') || msg.includes('quota') || msg.includes('404') || msg.includes('RESOURCE_EXHAUSTED')) {
            continue;
          }
          throw err;
        }
      }
    }
    throw lastError;
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gemini_api_key');
      if (!apiKey) { setChatMessages(prev => [...prev, { role: 'model', text: '⚠️ Please set your Gemini API key to use AI Chat.' }]); setIsChatLoading(false); return; }

      const langNames = { en: 'English', si: 'Sinhala', ta: 'Tamil' };
      const context = `You are an expert agricultural advisor for Sri Lankan farmers. Current farm: ${selectedPoint.name}. Soil: Moisture=${selectedPoint.moisture}%, pH=${selectedPoint.ph}, Temp=${selectedPoint.temp}°C, Salinity=${selectedPoint.salinity} dS/m, N=${selectedPoint.n}, P=${selectedPoint.p}, K=${selectedPoint.k} mg/kg. Crop: ${selectedCrop ? selectedCrop.name : 'None'}. You must always answer entirely in the ${langNames[lang] || 'Sinhala'} language concisely in 2-4 sentences.`;
      const responseText = await callGemini(apiKey, geminiModel, `${context}\n\nUser: ${userMsg}`);
      setChatMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (err) {
      const msg = err.message || '';
      const friendly = msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')
        ? '⚠️ API Quota exceeded (Free tier: 1500 req/day). Please wait a moment and try again, or upgrade your Gemini API plan at ai.google.dev.'
        : msg.includes('API_KEY') || msg.includes('401')
          ? '🔑 Invalid API Key. Please check your VITE_GEMINI_API_KEY in the .env file.'
          : '❌ Error: ' + msg.trim();
      setChatMessages(prev => [...prev, { role: 'model', text: friendly }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const fetchMarketPrices = async () => {
    setIsMarketLoading(true);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gemini_api_key');
      if (!apiKey) { alert('Please set your Gemini API key first.'); setIsMarketLoading(false); return; }

      const prompt = `You are a Sri Lanka agricultural market data expert. Provide realistic approximate wholesale prices (Rs.) for these commodities at Colombo Manning Market / Peliyagoda Economic Centre, Sri Lanka, as of today ${new Date().toLocaleDateString('en-LK')}.\n\nReply ONLY with a valid JSON array, no markdown:\n[{"name":"Rice (Nadu)","price":0,"unit":"kg","trend":"stable"},{"name":"Big Onion","price":0,"unit":"kg","trend":"stable"},{"name":"Tomato","price":0,"unit":"kg","trend":"stable"},{"name":"Carrot","price":0,"unit":"kg","trend":"stable"},{"name":"Potato","price":0,"unit":"kg","trend":"stable"},{"name":"Green Chili","price":0,"unit":"kg","trend":"stable"},{"name":"Coconut","price":0,"unit":"piece","trend":"stable"},{"name":"Manioc","price":0,"unit":"kg","trend":"stable"},{"name":"Bitter Gourd","price":0,"unit":"kg","trend":"stable"},{"name":"Leeks","price":0,"unit":"kg","trend":"stable"},{"name":"Cabbage","price":0,"unit":"kg","trend":"stable"},{"name":"Banana (Ambul)","price":0,"unit":"kg","trend":"stable"}]\n\nFill in realistic current prices. Use "up", "down", or "stable" for trend.`;
      const responseText = await callGemini(apiKey, geminiModel, prompt);
      const text = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();
      const parsed = JSON.parse(text);
      setMarketPrices(parsed);
      localStorage.setItem('customMarketPrices', JSON.stringify(parsed));
      setMarketLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      alert('Failed to fetch market prices: ' + err.message);
    } finally {
      setIsMarketLoading(false);
    }
  };

  const saveMarketPriceEdit = (idx) => {
    if (!marketPrices) return;
    const updated = marketPrices.map((item, i) =>
      i === idx ? { ...item, price: Number(editingMarketValue) || item.price } : item
    );
    setMarketPrices(updated);
    localStorage.setItem('customMarketPrices', JSON.stringify(updated));
    setEditingMarketIdx(null);
    setEditingMarketValue('');
  };

  const setMarketTrend = (idx, trend) => {
    if (!marketPrices) return;
    const updated = marketPrices.map((item, i) => i === idx ? { ...item, trend } : item);
    setMarketPrices(updated);
    localStorage.setItem('customMarketPrices', JSON.stringify(updated));
  };

  const addMarketItem = () => {
    const name = prompt('Enter commodity name:');
    if (!name) return;
    const price = Number(prompt('Enter price (Rs.):') || 0);
    const unit = prompt('Enter unit (kg / piece / bundle):') || 'kg';
    const updated = [...(marketPrices || []), { name, price, unit, trend: 'stable' }];
    setMarketPrices(updated);
    localStorage.setItem('customMarketPrices', JSON.stringify(updated));
  };

  const deleteMarketItem = (idx) => {
    const updated = marketPrices.filter((_, i) => i !== idx);
    setMarketPrices(updated);
    localStorage.setItem('customMarketPrices', JSON.stringify(updated));
  };

  if (!isAuthenticated) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <Leaf size={64} color="var(--accent-green)" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>{t.loginTitle || "Smart Soil Dashboard"}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{t.loginSubtitle || "Enterprise Agriculture Analysis"}</p>

          {authError && <div style={{ color: 'white', background: 'var(--accent-red)', padding: '0.5rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.85rem' }}>{authError}</div>}
          {authSuccess && <div style={{ color: 'white', background: 'var(--accent-green)', padding: '0.5rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.85rem' }}>{authSuccess}</div>}

          {authMode === 'login' ? (
            <>
              <input type="text" placeholder={t.username || "Username"} value={loginUser} onChange={(e) => setLoginUser(e.target.value)} />
              <input type="password" placeholder={t.password || "Password"} value={loginPass} onChange={(e) => setLoginPass(e.target.value)} />
              <button onClick={handleLogin}>{t.signIn || "Sign In"}</button>
              <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                New User? <span style={{ color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => { setAuthMode('register'); setAuthError(''); setAuthSuccess(''); }}>Create an account</span>
              </div>
            </>
          ) : (
            <>
              <input type="text" placeholder={t.username || "Username"} value={regUser} onChange={(e) => setRegUser(e.target.value)} />
              <input type="password" placeholder={t.password || "Password"} value={regPass} onChange={(e) => setRegPass(e.target.value)} />
              <input type="password" placeholder={"Confirm Password"} value={regPassConfirm} onChange={(e) => setRegPassConfirm(e.target.value)} />
              <button onClick={handleRegister}>Register (ලියාපදිංචි වන්න)</button>
              <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Already have an account? <span style={{ color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccess(''); }}>Login here</span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);
    setIsAnalyzing(true);
    setAiResult(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gemini_api_key');
        if (!apiKey) {
          setAiResult({
            name: "API Key Required",
            remedy: "Please enter your Google Gemini API Key in the settings below to enable AI leaf analysis."
          });
          setIsAnalyzing(false);
          return;
        }

        const base64data = reader.result.split(',')[1];
        const prompt = 'You are an expert plant pathologist. Analyze this leaf. If it is healthy, say it\'s healthy. If there is a disease or pest, identify it. The disease name and the remedy MUST be written in the Sinhala language. Reply ONLY with a strict JSON object: { "name": "Disease/Pest Name in Sinhala", "remedy": "A short 1-sentence agricultural remedy in Sinhala." }. No markdown, pure JSON.';
        const imageParts = [{ inlineData: { data: base64data, mimeType: file.type } }];

        const responseText = await callGemini(apiKey, geminiModel, prompt, imageParts);

        try {
          const cleanJson = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();
          const parsed = JSON.parse(cleanJson);
          setAiResult({ name: parsed.name, remedy: parsed.remedy });
        } catch (err) {
          setAiResult({ name: "Analysis Result Format Error", remedy: responseText });
        }
      } catch (err) {
        console.error(err);
        setAiResult({ name: "AI Connection Error", remedy: err.message || "Could not reach Gemini AI." });
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Farm Name,Coordinates,Last Update,Moisture(%),pH,Temp(C),Salinity(dS/m),Nitrogen(mg/kg),Phosphorus(mg/kg),Potassium(mg/kg),Suitability Score\n";
    testPoints.forEach(row => {
      let scoreStr = "N/A";
      if (selectedCrop) {
        let info = calculateSuitability(selectedCrop, row);
        scoreStr = info.score + "%";
      }
      let rowArray = [
        row.id,
        row.name,
        `"${row.location}"`,
        `"${row.datetime}"`,
        row.moisture,
        row.ph,
        row.temp,
        row.salinity,
        row.n,
        row.p,
        row.k,
        scoreStr
      ];
      csvContent += rowArray.join(",") + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "smart_soil_data_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chartData = [
    { subject: 'Moisture', A: selectedPoint.moisture, fullMark: 100 },
    { subject: 'pH', A: selectedPoint.ph * 10, fullMark: 100 },
    { subject: 'Temp', A: selectedPoint.temp, fullMark: 50 },
    { subject: 'Nitrogen', A: selectedPoint.n / 3, fullMark: 100 },
    { subject: 'Phosphorus', A: selectedPoint.p, fullMark: 100 },
    { subject: 'Potassium', A: selectedPoint.k, fullMark: 100 },
  ];

  return (
    <div className="app-container">
      <div className="report-header-print" style={{ marginBottom: '2rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ margin: '0 0 0.5rem 0', color: '#16a34a' }}>{t.officialReport || "Smart Soil Dashboard - Official Diagnostics Report"}</h1>
            <div style={{ color: '#64748b', fontSize: '1.1rem' }}>{t.reportDate || "Report Date:"} {new Date().toLocaleString('en-US')}</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '1rem', color: '#334155', lineHeight: '1.5' }}>
            <div><strong>Farm Area:</strong> {selectedPoint.name}</div>
            <div><strong>GPS Location:</strong> {selectedPoint.location}</div>
            <div><strong>System ID:</strong> #{selectedPoint.id.slice(-6)}</div>
          </div>
        </div>
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
          <div><strong>Crop Analyzed:</strong> <span style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>{selectedCrop ? t[selectedCrop.name] || selectedCrop.name : 'Generic Baseline Assessment'}</span></div>
          <div><strong>Land Size Assessed:</strong> {landSize} Acres ({(landSize * 0.4047).toFixed(2)} Hectares)</div>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ margin: '0 0 1rem 0' }}>{t.addFarm || "Add New Farm"}</h2>
            <p style={{ color: 'var(--text-secondary)' }}>{t.clickOnMap || "Provide a name for your new location to auto-generate coordinates & satellite insights."}</p>
            <input type="text" placeholder={t.farmName || "Farm Name"} value={newFarmName} onChange={(e) => setNewFarmName(e.target.value)} autoFocus />
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowAddModal(false)}>{t.cancel || "Cancel"}</button>
              <button className="btn-primary" onClick={submitNewFarm}>{t.saveFarm || "Save Location"}</button>
            </div>
          </div>
        </div>
      )}

      {showAddCropModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ margin: '0 0 1rem 0' }}>{t.addCrop || "Add Custom Crop"}</h2>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input type="text" placeholder={t.cropName || "Crop Name"} value={newCropName} onChange={(e) => setNewCropName(e.target.value)} style={{ flex: 1 }} autoFocus />
              <input type="text" placeholder={t.cropIcon || "Icon (Emoji)"} value={newCropIcon} onChange={(e) => setNewCropIcon(e.target.value)} style={{ width: '120px' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t.idealMoisture || "Target Moisture (%)"}:</label>
              <input type="number" value={reqM} onChange={(e) => setReqM(e.target.value)} />

              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t.idealNitrogen || "Target Nitrogen (mg/kg)"}:</label>
              <input type="number" value={reqN} onChange={(e) => setReqN(e.target.value)} />

              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t.idealPH || "Target pH"}:</label>
              <input type="number" step="0.1" value={reqPH} onChange={(e) => setReqPH(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowAddCropModal(false)}>{t.cancel || "Cancel"}</button>
              <button className="btn-primary" onClick={submitNewCrop}>{t.saveCrop || "Save Crop"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="header" style={{ marginBottom: '1.5rem' }}>
        <div className="logo-section">
          <div className="logo-box"><Leaf size={28} /></div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ margin: 0 }}>{t.appTitle}</h1>
              <span className="live-badge print-hide"><div className="pulse-dot"></div> {t.liveStream || "LIVE"}</span>
            </div>
            <div className="header-subtitle">{t.appSubtitle}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>

          <div style={{ position: 'relative' }}>
            <button className="alert-btn" onClick={() => setShowAlerts(!showAlerts)}>
              <Bell size={18} /> <span className="print-hide">{t.alerts}</span>
              {alertsList.length > 0 && <div className="alert-badge">{alertsList.length}</div>}
            </button>
            {showAlerts && (
              <div className="alert-dropdown">
                <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', justifyContent: 'space-between' }}>
                  {t.alerts} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }} onClick={() => setShowAlerts(false)}>✖</span>
                </h4>
                {alertsList.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>{t.noAlerts}</p> :
                  alertsList.map((a, i) => (
                    <div key={i} style={{ padding: '0.5rem', background: 'var(--accent-red)', color: 'white', borderRadius: 4, marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                      <b>{t.criticalAlert}:</b> {a.msg}
                    </div>
                  ))
                }
              </div>
            )}
          </div>

          <button className="lang-toggle print-hide" onClick={toggleTheme}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <select
            className="lang-toggle print-hide"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            style={{ cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <option value="en">English</option>
            <option value="si">සිංහල</option>
            <option value="ta">தமிழ்</option>
          </select>
          <button className="lang-toggle print-hide" onClick={() => setIsAuthenticated(false)} style={{ border: 'none', color: 'var(--accent-red)' }}>
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Top Stats */}
      <div className="top-stats-container print-hide">
        <h2 className="top-stats-title">{t.fieldWideStats}</h2>
        <div className="main-stats-grid">
          <Card title={t.avgMoisture} value={summaryData.moisture.value} unit={summaryData.moisture.unit} icon={summaryData.moisture.icon} min={summaryData.moisture.min} max={summaryData.moisture.max} t={t} />
          <Card title={t.avgPH} value={summaryData.ph.value} unit={summaryData.ph.unit} icon={summaryData.ph.icon} min={summaryData.ph.min} max={summaryData.ph.max} t={t} />
          <Card title={t.avgTemp} value={summaryData.temp.value} unit={summaryData.temp.unit} icon={summaryData.temp.icon} min={summaryData.temp.min} max={summaryData.temp.max} t={t} />
          <Card title={t.avgSalinity} value={summaryData.salinity.value} unit={summaryData.salinity.unit} icon={summaryData.salinity.icon} min={summaryData.salinity.min} max={summaryData.salinity.max} t={t} />
        </div>
        <div className="sub-stats-grid">
          <SmallCard title={t.avgNitrogen} value={summaryData.npk.n} unit={summaryData.npk.unit} />
          <SmallCard title={t.avgPhosphorus} value={summaryData.npk.p} unit={summaryData.npk.unit} />
          <SmallCard title={t.avgPotassium} value={summaryData.npk.k} unit={summaryData.npk.unit} />
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><Activity size={18} /> {t.overview}</button>
        <button className={`tab-btn ${activeTab === 'crop' ? 'active' : ''}`} onClick={() => setActiveTab('crop')}><Leaf size={18} /> {t.cropAnalysis}</button>
        <button className={`tab-btn ${activeTab === 'charts' ? 'active' : ''}`} onClick={() => setActiveTab('charts')}><BarChart2 size={18} /> {t.dataCharts}</button>
        <button className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}><Map size={18} /> {t.fieldMap}</button>
        <button className={`tab-btn ${activeTab === 'pest' ? 'active' : ''}`} onClick={() => setActiveTab('pest')}><Bug size={18} /> {t.pestTab || "Pest AI"}</button>
        <button className={`tab-btn ${activeTab === 'tools' ? 'active' : ''}`} onClick={() => setActiveTab('tools')}><ClipboardList size={18} /> Farm Tools</button>
      </div>

      {/* Split View */}
      <div className="bottom-split">
        {/* Left Sidebar */}
        <div className="sidebar">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="points-header" style={{ margin: 0 }}>{t.testPoints}</h3>
            <button className="lang-toggle" style={{ padding: '0.4rem', display: 'flex' }} onClick={() => setShowAddModal(true)}>
              <Plus size={16} />
            </button>
          </div>

          <div className="points-list">
            {testPoints.map(p => (
              <div key={p.id} className={`point-card ${selectedPointId === p.id ? 'active' : ''}`} onClick={() => { setSelectedPointId(p.id); setSelectedCrop(null); }}>
                <div className="point-header-row">
                  <div>
                    <h4 className="point-title">{p.name}</h4>
                  </div>
                  <div className="point-location"><MapPin size={12} /></div>
                </div>

                <div className="point-mini-stats">
                  <div className="mi-stat"><div className="mi-icon-box" style={{ color: 'var(--accent-blue)' }}><Droplet size={12} /></div> {p.moisture}%</div>
                  <div className="mi-stat"><div className="mi-icon-box" style={{ color: 'var(--accent-orange)' }}><Thermometer size={12} /></div> {p.temp}°C</div>
                  <div className="mi-stat"><div className="mi-icon-box" style={{ color: 'var(--accent-purple)' }}><FlaskConical size={12} /></div> {p.ph}</div>
                  <div className="mi-stat"><div className="mi-icon-box" style={{ color: 'var(--accent-orange)' }}><Waves size={12} /></div> {p.salinity}</div>
                </div>
                <div className="npk-mini-row">
                  <span>N <span className="np-val">{p.n}</span></span>
                  <span>P <span className="np-val">{p.p}</span></span>
                  <span>K <span className="np-val">{p.k}</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="main-content">

          {activeTab === 'overview' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 className="panel-title">{selectedPoint.name}</h3>
                  <p className="panel-subtitle">
                    {t.liveStream || "Live Data Stream:"} • {currentTime.toLocaleString(lang === 'si' ? 'si-LK' : lang === 'ta' ? 'ta-LK' : 'en-US', { dateStyle: 'full', timeStyle: 'medium' })}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="lang-toggle print-hide" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent-green)', color: 'white' }} onClick={exportToCSV}>
                    <Download size={16} /> {t.exportCsv || "Export CSV"}
                  </button>
                  <button className="lang-toggle print-hide" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', color: 'var(--text-primary)' }} onClick={() => window.print()}>
                    <Download size={16} /> {t.downloadReport || "Download"}
                  </button>
                </div>
              </div>

              {/* Soil Health Score */}
              {(() => {
                const score = calcSoilHealthScore(selectedPoint);
                const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
                const label = score >= 75 ? 'Excellent' : score >= 50 ? 'Moderate' : 'Poor';
                return (
                  <div className="chart-container-box print-hide" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1rem' }}>
                    <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
                      <svg width="80" height="80" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r="34" fill="none" stroke="var(--border-color)" strokeWidth="8" />
                        <circle cx="40" cy="40" r="34" fill="none" stroke={color} strokeWidth="8"
                          strokeDasharray={`${(score / 100) * 213.6} 213.6`}
                          strokeLinecap="round" transform="rotate(-90 40 40)" style={{ transition: 'stroke-dasharray 0.8s ease' }} />
                        <text x="40" y="44" textAnchor="middle" fontSize="16" fontWeight="bold" fill={color}>{score}</text>
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Soil Health Score</div>
                      <div style={{ color, fontWeight: 600, fontSize: '1.2rem' }}>{label}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Based on Moisture, pH, Salinity, NPK</div>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.8rem' }}>
                      <div>💧 Moisture: <b>{Math.min(30, Math.round((selectedPoint.moisture / 100) * 30))}/30</b></div>
                      <div>🧪 pH: <b>{selectedPoint.ph >= 6.0 && selectedPoint.ph <= 7.5 ? 20 : 10}/20</b></div>
                      <div>🌊 Salinity: <b>{selectedPoint.salinity < 1.5 ? 20 : selectedPoint.salinity < 3.0 ? 10 : 0}/20</b></div>
                      <div>🌱 NPK: <b>{Math.min(30, Math.round((selectedPoint.n / 200) * 15) + Math.round((selectedPoint.p / 80) * 10) + Math.round((selectedPoint.k / 100) * 5))}/30</b></div>
                    </div>
                  </div>
                );
              })()}

              {/* Yield & Profit Card */}
              <div className="yield-card print-hide" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: 500 }}><CheckCircle size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />{t.predictedYield || "Predicted Yield Target"}</h3>
                    <div style={{ opacity: 0.9, fontSize: '0.9rem' }}>{t.basedOnCur || "Based on current soil health"}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="yield-val" style={{ fontSize: '1.8rem' }}>{calcYield()}</span> <span style={{ fontSize: '0.9rem' }}>{t.kgPerHectare || "kg/Hectare"}</span>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <DollarSign size={16} color="var(--accent-green)" />
                    <label style={{ fontSize: '0.9rem' }}>{t.marketPrice || "Market Price (per kg)"}:</label>
                    <input type="number" value={marketPrice} onChange={(e) => setMarketPrice(Number(e.target.value) || 0)} style={{ width: '80px', padding: '0.3rem', fontSize: '0.9rem' }} /> Rs.
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontSize: '0.9rem' }}>{t.estimatedProfit || "Estimated Gross Profit"}:</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-green)' }}>
                      Rs. {Math.round(calcYield() * (landSize * 0.4047) * marketPrice).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Weather Card */}
              {weatherData && (
                <div className="weather-card print-hide">
                  <div>
                    <h3>{t.weatherForecast || "Live Weather"}</h3>
                    <div style={{ opacity: 0.8, fontSize: '0.85rem' }}>{locationName || selectedPoint.location}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="weather-temp">{weatherData.temperature}°C</div>
                    {weatherData.weathercode < 3 ? <SunMedium size={48} /> : weatherData.weathercode < 60 ? <Cloud size={48} /> : <CloudRain size={48} />}
                  </div>
                </div>
              )}

              {/* Smart Irrigation Panel */}
              <div className="smart-panel print-hide">
                <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={18} /> {t.smartIrrigation || "Smart Irrigation"}</h3>
                <div className="pump-switch">
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{t.pumpStatus || "Pump Status"}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.autoMode || "Auto"}</div>
                  </div>
                  <div>
                    {selectedPoint.moisture < 45 ? (
                      <div style={{ padding: '6px 12px', background: 'rgba(59,130,246,0.2)', color: 'var(--accent-blue)', borderRadius: '20px', fontWeight: 'bold', border: '1px solid var(--accent-blue)', animation: 'pulse 2s infinite' }}>{t.pumpOn || "PUMPING WATER"}</div>
                    ) : (
                      <div style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)', borderRadius: '20px', fontWeight: 'bold' }}>{t.pumpOff || "STANDBY"}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="overview-grid">
                <div className="ov-card">
                  <div className="ov-label">{t.soilMoisture}</div>
                  <div className="ov-value ov-val-blue">{selectedPoint.moisture}%</div>
                </div>
                <div className="ov-card">
                  <div className="ov-label">{t.phLevel}</div>
                  <div className="ov-value ov-val-purple">{selectedPoint.ph}</div>
                </div>
                <div className="ov-card">
                  <div className="ov-label">{t.temp}</div>
                  <div className="ov-value ov-val-orange">{selectedPoint.temp}°C</div>
                </div>
                <div className="ov-card">
                  <div className="ov-label">{t.elecCond || "Salinity (EC)"}</div>
                  <div className="ov-value ov-val-gray">{selectedPoint.salinity} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>dS/m</span></div>
                </div>
              </div>

              <div className="overview-grid">
                <div className="ov-card">
                  <div className="ov-label">{t.nitrogen}</div>
                  <div className="ov-value ov-val-green">{selectedPoint.n} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>mg/kg</span></div>
                </div>
                <div className="ov-card">
                  <div className="ov-label">{t.phosphorus}</div>
                  <div className="ov-value ov-val-purple">{selectedPoint.p} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>mg/kg</span></div>
                </div>
                <div className="ov-card">
                  <div className="ov-label">{t.potassium}</div>
                  <div className="ov-value ov-val-orange">{selectedPoint.k} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>mg/kg</span></div>
                </div>
              </div>

              {/* Fertilizer Calculator */}
              <div className="calc-panel print-hide">
                <div className="calc-header">
                  <Calculator size={18} /> {t.fertilizerCalc || "Fertilizer Calculator"}
                </div>
                <div className="calc-input-row">
                  <label>{t.landSize || "Land Size (Acres)"}:</label>
                  <input type="number" min="0.5" step="0.5" value={landSize} onChange={(e) => setLandSize(Number(e.target.value) || 0)} />
                </div>
                <div className="calc-results">
                  <div className="calc-res-box">
                    <div className="ov-label">{t.ureaNeeded || "Urea"}</div>
                    <div className="calc-res-val ov-val-green">{fertData.urea}</div>
                    <div className="card-unit">{t.kg || "kg"}</div>
                  </div>
                  <div className="calc-res-box">
                    <div className="ov-label">{t.tspNeeded || "TSP"}</div>
                    <div className="calc-res-val ov-val-purple">{fertData.tsp}</div>
                    <div className="card-unit">{t.kg || "kg"}</div>
                  </div>
                  <div className="calc-res-box">
                    <div className="ov-label">{t.mopNeeded || "MOP"}</div>
                    <div className="calc-res-val ov-val-orange">{fertData.mop}</div>
                    <div className="card-unit">{t.kg || "kg"}</div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === 'crop' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="panel-title">{t.selectIntendedCrop}</h3>
                <button className="btn-primary" onClick={() => setShowAddCropModal(true)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Plus size={16} /> {t.addCrop || "Add Custom Crop"}
                </button>
              </div>
              <div className="search-box">
                <Search size={16} />
                <input type="text" placeholder={t.searchCrops} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>

              <div className="crop-grid">
                {crops.filter(c => (t[c.name] || c.name).toLowerCase().includes(searchQuery.toLowerCase())).map(crop => (
                  <div key={crop.id} className="crop-card" onClick={() => setSelectedCrop(crop)} style={selectedCrop?.id === crop.id ? { background: 'var(--accent-green-light)', borderColor: 'var(--accent-green)' } : {}}>
                    <span className="crop-icon">{crop.icon}</span>
                    <span className="crop-name">{t[crop.name] || crop.name}</span>
                  </div>
                ))}
              </div>

              {!selectedCrop ? (
                <div className="empty-state">
                  <Leaf size={48} />
                  <h3>{t.selectCropToAnalyze}</h3>
                  <p>{t.getPersonalizedRecs}</p>
                </div>
              ) : (() => {
                const suit = calculateSuitability(selectedCrop, selectedPoint);
                return (
                  <div>
                    <h3 style={{ margin: '0 0 1rem 0' }}>{t.matchScore}: {t[selectedCrop.name] || selectedCrop.name}</h3>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: suit.score > 70 ? 'var(--accent-green)' : 'var(--accent-orange)' }}>{suit.score}%</div>
                    <div className="match-score-bar-bg">
                      <div className="match-score-bar-fill" style={{ width: `${suit.score}%`, background: suit.score > 70 ? 'var(--accent-green)' : 'var(--accent-orange)' }}></div>
                    </div>

                    <div className="ai-advice-box">
                      <h4><Brain size={18} /> {t.aiAdvice}</h4>
                      {suit.advice.length === 0 ? (
                        <p style={{ margin: 0 }}>{t.perfectMatch}</p>
                      ) : (
                        <>
                          <p style={{ marginTop: 0 }}>{t.needsImprovement}</p>
                          <ul>
                            {suit.advice.map((adv, idx) => <li key={idx}>{t[adv] || adv}</li>)}
                          </ul>
                        </>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {activeTab === 'charts' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 className="panel-title" style={{ margin: 0 }}>{selectedPoint.name}</h3>
                <button className="lang-toggle" onClick={() => setIsHistoryMode(!isHistoryMode)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} /> {isHistoryMode ? t.allLocations : t.history7D}
                </button>
              </div>

              {isHistoryMode ? (
                <>
                  <div className="chart-container-box">
                    <div className="chart-box-title">{t.history7D} - {t.moisture} & {t.temp}</div>
                    <div style={{ height: 250 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={selectedPoint.history}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <RechartsTooltip />
                          <Legend />
                          <Line yAxisId="left" type="monotone" dataKey="moisture" name={t.moisture + " (%)"} stroke="var(--accent-blue)" strokeWidth={2} />
                          <Line yAxisId="right" type="monotone" dataKey="temp" name={t.temp + " (°C)"} stroke="var(--accent-orange)" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="chart-container-box" style={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                    <ResponsiveContainer width={400} height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar name="Status" dataKey="A" stroke="var(--accent-green)" fill="var(--accent-green)" fillOpacity={0.6} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="chart-container-box">
                    <div className="chart-box-title">{t.moistureAndTemp} ({t.allLocations})</div>
                    <div style={{ height: 200 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={testPoints}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <RechartsTooltip />
                          <Legend />
                          <Line yAxisId="left" type="monotone" dataKey="moisture" name={t.moisture + " (%)"} stroke="var(--accent-blue)" strokeWidth={2} />
                          <Line yAxisId="right" type="monotone" dataKey="temp" name={t.temp + " (°C)"} stroke="var(--accent-orange)" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="chart-container-box" style={{ marginBottom: 0 }}>
                    <div className="chart-box-title">{t.npkComparison}</div>
                    <div style={{ height: 200 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={testPoints}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Bar dataKey="n" name="N" fill="var(--accent-green)" />
                          <Bar dataKey="p" name="P" fill="var(--accent-purple)" />
                          <Bar dataKey="k" name="K" fill="var(--accent-orange)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'map' && (
            <div>
              <h3 className="panel-title">{t.fieldMapView}</h3>

              <div className="map-container">
                <MapContainer center={[7.8731, 80.7718]} zoom={7} style={{ height: '100%', width: '100%', borderRadius: 'inherit', zIndex: 1 }}>
                  <LayersControl position="topright">
                    <LayersControl.BaseLayer checked name={t.streetView || "Street Map"}>
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap'
                      />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name={t.satelliteView || "Satellite Map"}>
                      <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        attribution='&copy; Esri'
                      />
                    </LayersControl.BaseLayer>
                  </LayersControl>

                  <LocationButton t={t} />
                  <MapAutoPan selectedPoint={selectedPoint} />
                  <MapClickHandler />
                  {testPoints.map(p => (
                    <Marker key={p.id} position={parseLocation(p.location)} icon={customIcon}>
                      <Popup>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                        <div style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>{p.time}</div>
                        <button
                          onClick={(e) => {
                            navigator.clipboard.writeText(p.location);
                            const btn = e.currentTarget;
                            const old = btn.innerHTML;
                            btn.innerHTML = '✅ Copied!';
                            btn.style.background = '#22c55e';
                            setTimeout(() => {
                              btn.innerHTML = old;
                              btn.style.background = 'var(--accent-blue)';
                            }, 2000);
                          }}
                          style={{
                            background: 'var(--accent-blue)', color: 'white', border: 'none',
                            padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem',
                            display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'center', transition: 'background 0.3s'
                          }}
                        >
                          📋 Copy GPS ({p.location})
                        </button>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
              <p className="map-caption print-hide">{t.clickOnMarkers}</p>
            </div>
          )}

          {activeTab === 'pest' && (
            <div>
              <h3 className="panel-title">{t.pestTab || "Pest & Disease AI"}</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{t.pestTip || "Upload a clear photo of the leaf."}</p>

              {!uploadedImage ? (
                <div className="pest-upload-zone print-hide">
                  <label style={{ cursor: 'pointer', display: 'block', width: '100%', height: '100%' }}>
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                    <Camera size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.5, color: 'var(--text-primary)' }} />
                    <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: 500 }}>{t.dropImageHere || "Drag & Drop or Click to Upload"}</h3>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>JPG, PNG (Max 5MB)</div>
                  </label>
                </div>
              ) : isAnalyzing ? (
                <div className="empty-state print-hide" style={{ padding: '4rem 1rem' }}>
                  <div className="pulse-dot" style={{ width: 24, height: 24, margin: '0 auto 1.5rem auto' }}></div>
                  <h3>{t.analyzingData || "AI Neural Network Analyzing..."}</h3>
                  <p>Processing visual patterns and spectral signatures...</p>
                </div>
              ) : (
                aiResult && (
                  <div style={{ animation: 'fadeIn 0.5s ease' }}>
                    <div className="pest-upload-zone print-hide" style={{ padding: '1.5rem', marginBottom: '1.5rem', borderStyle: 'solid', borderColor: 'var(--accent-green)', background: "transparent", cursor: 'default' }}>
                      <img src={uploadedImage} alt="Scanned Leaf" style={{ width: '240px', height: '200px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1.5rem', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} />
                      <h4 style={{ margin: 0, color: 'var(--accent-green)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle size={20} /> {t.scanComplete || "Analysis Complete"}
                      </h4>
                    </div>

                    <div className="chart-container-box">
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: 8 }}>
                          <ShieldAlert size={32} color="var(--accent-red)" />
                        </div>
                        <div>
                          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>{t.diseaseDetected || "Detected: "} <span style={{ color: 'var(--accent-orange)' }}>{aiResult.name}</span></h3>
                          <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            <strong>{t.aiRemedy || "Remedy: "}</strong> {aiResult.remedy}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button className="btn-secondary print-hide" onClick={() => { setUploadedImage(null); setAiResult(null); }}>Scan Another Leaf</button>
                  </div>
                )
              )}

            </div>
          )}

          {/* ===== FARM TOOLS TAB ===== */}
          {activeTab === 'tools' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 className="panel-title">🛠️ Farm Tools & Management</h3>

              {/* ---- Crop Calendar ---- */}
              <div className="chart-container-box">
                <div className="chart-box-title"><Sprout size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Crop Calendar</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Planting date for: <b>{selectedPoint.name}</b></div>
                    <input type="date" value={cropCalendars[selectedPoint.id] || ''} onChange={(e) => saveCropCalendar(selectedPoint.id, e.target.value)}
                      style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--surface-color)', color: 'var(--text-primary)', width: '100%' }} />
                  </div>
                  {cropCalendars[selectedPoint.id] && (() => {
                    const info = getCropStage(cropCalendars[selectedPoint.id]);
                    return (
                      <div style={{ textAlign: 'center', padding: '0.75rem 1.25rem', background: info.color + '22', borderRadius: '10px', border: `1px solid ${info.color}`, minWidth: '140px' }}>
                        <div style={{ fontWeight: 700, color: info.color, fontSize: '1rem' }}>{info.stage}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{info.days >= 0 ? `Day ${info.days}` : 'Upcoming'}</div>
                      </div>
                    );
                  })()}
                </div>
                {/* All farms quick view */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: '0.5rem' }}>
                  {testPoints.map(p => {
                    const stage = cropCalendars[p.id] ? getCropStage(cropCalendars[p.id]) : null;
                    return (
                      <div key={p.id} onClick={() => setSelectedPointId(p.id)} style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', background: 'var(--surface-color)', border: `1px solid ${stage ? stage.color : 'var(--border-color)'}`, cursor: 'pointer', fontSize: '0.8rem' }}>
                        <div style={{ fontWeight: 600, marginBottom: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                        <div style={{ color: stage ? stage.color : 'var(--text-secondary)' }}>{stage ? stage.stage : '— No date set'}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ---- Task Manager ---- */}
              <div className="chart-container-box">
                <div className="chart-box-title"><ClipboardList size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Task Manager</div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <input value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()}
                    placeholder={`New task for ${selectedPoint.name}...`}
                    style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--surface-color)', color: 'var(--text-primary)' }} />
                  <button className="btn-primary" onClick={addTask} style={{ padding: '0.5rem 1rem' }}>Add</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '220px', overflowY: 'auto' }}>
                  {farmTasks.length === 0 && <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>No tasks yet. Add one above!</div>}
                  {farmTasks.map(task => (
                    <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: '8px', background: task.done ? 'var(--surface-color)' : 'var(--bg-color)', border: '1px solid var(--border-color)', opacity: task.done ? 0.6 : 1 }}>
                      <input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ textDecoration: task.done ? 'line-through' : 'none', fontSize: '0.9rem' }}>{task.text}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{task.farm} • {task.date}</div>
                      </div>
                      <button onClick={() => deleteTask(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-red)', padding: 0 }}><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ---- Expense Tracker + ROI ---- */}
              <div className="chart-container-box">
                <div className="chart-box-title"><PiggyBank size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Expense Tracker & Net Profit</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                  {['fertilizer', 'seeds', 'labour', 'water'].map(key => (
                    <div key={key}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'capitalize' }}>{key} Cost (Rs.)</div>
                      <input type="number" min="0" value={expenseCosts[key]} onChange={e => setExpenseCosts(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--surface-color)', color: 'var(--text-primary)' }} />
                    </div>
                  ))}
                </div>
                {(() => {
                  const totalExp = Object.values(expenseCosts).reduce((a, b) => a + b, 0);
                  const grossRev = Math.round(calcYield() * (landSize * 0.4047) * marketPrice);
                  const netProfit = grossRev - totalExp;
                  const profitColor = netProfit >= 0 ? '#22c55e' : '#ef4444';
                  const roi = totalExp > 0 ? ((netProfit / totalExp) * 100).toFixed(1) : 0;

                  const roiChartData = [
                    { name: 'Fertilizer', amount: expenseCosts.fertilizer, fill: '#f87171' },
                    { name: 'Seeds', amount: expenseCosts.seeds, fill: '#fb923c' },
                    { name: 'Labour', amount: expenseCosts.labour, fill: '#facc15' },
                    { name: 'Water', amount: expenseCosts.water, fill: '#60a5fa' },
                    { name: 'Gross Revenue', amount: grossRev, fill: '#4ade80' },
                    { name: 'Net Profit', amount: Math.max(0, netProfit), fill: '#22c55e' },
                  ];

                  return (
                    <>
                      <div className="roi-summary-grid">
                        <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', textAlign: 'center' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Expenses</div>
                          <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#ef4444' }}>Rs. {totalExp.toLocaleString()}</div>
                        </div>
                        <div style={{ padding: '0.75rem', background: 'rgba(34,197,94,0.1)', borderRadius: '8px', textAlign: 'center' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Gross Revenue</div>
                          <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#22c55e' }}>Rs. {grossRev.toLocaleString()}</div>
                        </div>
                        <div style={{ padding: '0.75rem', background: `rgba(${netProfit >= 0 ? '34,197,94' : '239,68,68'},0.15)`, borderRadius: '8px', textAlign: 'center', border: `2px solid ${profitColor}` }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Net Profit</div>
                          <div style={{ fontWeight: 700, fontSize: '1.3rem', color: profitColor }}>Rs. {Math.abs(netProfit).toLocaleString()} {netProfit < 0 ? '(Loss)' : ''}</div>
                        </div>
                      </div>

                      {/* ROI Bar Chart */}
                      <div style={{ background: 'var(--surface-color)', borderRadius: '10px', padding: '1rem', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>📊 ROI Breakdown Chart</div>
                          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
                            <span>ROI: <b style={{ color: Number(roi) >= 0 ? '#22c55e' : '#ef4444' }}>{roi}%</b></span>
                            <span style={{ color: 'var(--text-secondary)' }}>Based on predicted yield × market price</span>
                          </div>
                        </div>
                        <div style={{ height: 200 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={roiChartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} />
                              <YAxis tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} tickFormatter={v => `Rs.${(v / 1000).toFixed(0)}k`} />
                              <RechartsTooltip formatter={(v) => [`Rs. ${v.toLocaleString()}`, 'Amount']} />
                              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                                {roiChartData.map((entry, index) => (
                                  <Cell key={index} fill={entry.fill} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        {/* Cost breakdown mini bars */}
                        <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {['fertilizer', 'seeds', 'labour', 'water'].map((key, i) => {
                            const colors = ['#f87171', '#fb923c', '#facc15', '#60a5fa'];
                            const pct = totalExp > 0 ? Math.round((expenseCosts[key] / totalExp) * 100) : 0;
                            return (
                              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem' }}>
                                <div style={{ width: '70px', textTransform: 'capitalize', color: 'var(--text-secondary)', flexShrink: 0 }}>{key}</div>
                                <div style={{ flex: 1, height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                                  <div style={{ width: `${pct}%`, height: '100%', background: colors[i], borderRadius: '4px', transition: 'width 0.6s ease' }} />
                                </div>
                                <div style={{ width: '35px', textAlign: 'right', fontWeight: 600 }}>{pct}%</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* ---- Harvest Tracker ---- */}
              <div className="chart-container-box">
                <div className="chart-box-title"><Wheat size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />Harvest Tracker</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'flex-end' }}>
                  <div><div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Date</div><input type="date" value={newHarvestDate} onChange={e => setNewHarvestDate(e.target.value)} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--surface-color)', color: 'var(--text-primary)' }} /></div>
                  <div><div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Amount (kg)</div><input type="number" placeholder="e.g. 500" value={newHarvestKg} onChange={e => setNewHarvestKg(e.target.value)} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--surface-color)', color: 'var(--text-primary)', width: '100px' }} /></div>
                  <div><div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Price/kg (Rs.)</div><input type="number" placeholder="e.g. 150" value={newHarvestPrice} onChange={e => setNewHarvestPrice(e.target.value)} style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--surface-color)', color: 'var(--text-primary)', width: '100px' }} /></div>
                  <button className="btn-primary" onClick={addHarvestLog} style={{ padding: '0.5rem 1rem' }}>Log Harvest</button>
                </div>
                {harvestLogs.length === 0 ? <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem', fontSize: '0.9rem' }}>No harvests logged yet.</div> : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead><tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                        <th style={{ padding: '0.5rem' }}>Date</th><th style={{ padding: '0.5rem' }}>Farm</th><th style={{ padding: '0.5rem' }}>Kg</th><th style={{ padding: '0.5rem' }}>Price</th><th style={{ padding: '0.5rem', color: '#22c55e' }}>Earnings</th><th></th>
                      </tr></thead>
                      <tbody>{harvestLogs.map(h => (
                        <tr key={h.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.5rem' }}>{h.date}</td>
                          <td style={{ padding: '0.5rem', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.farm}</td>
                          <td style={{ padding: '0.5rem' }}>{h.kg} kg</td>
                          <td style={{ padding: '0.5rem' }}>Rs.{h.price}</td>
                          <td style={{ padding: '0.5rem', fontWeight: 700, color: '#22c55e' }}>Rs. {h.earnings.toLocaleString()}</td>
                          <td><button onClick={() => deleteHarvestLog(h.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-red)', padding: '0.25rem' }}><Trash2 size={14} /></button></td>
                        </tr>
                      ))}</tbody>
                      <tfoot><tr style={{ borderTop: '2px solid var(--border-color)', fontWeight: 700 }}>
                        <td colSpan="4" style={{ padding: '0.5rem', textAlign: 'right' }}>Total Earnings:</td>
                        <td style={{ padding: '0.5rem', color: '#22c55e' }}>Rs. {harvestLogs.reduce((a, h) => a + h.earnings, 0).toLocaleString()}</td>
                        <td></td>
                      </tr></tfoot>
                    </table>
                  </div>
                )}
              </div>

              {/* ---- AI Crop Advisor Chat ---- */}
              <div className="chart-container-box" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div className="chart-box-title" style={{ margin: 0 }}><MessageSquare size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />AI Crop Advisor Chat</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>🤖 AI Model</span>
                    <select
                      value={geminiModel}
                      onChange={(e) => {
                        setGeminiModel(e.target.value);
                        localStorage.setItem('gemini_model', e.target.value);
                      }}
                      style={{
                        background: 'var(--surface-color)', color: 'var(--text-primary)', border: '1px solid var(--border-color)',
                        borderRadius: '4px', fontSize: '0.75rem', padding: '2px 6px', cursor: 'pointer', outline: 'none'
                      }}
                    >
                      <option value="gemini-2.5-flash">2.5 Flash</option>
                      <option value="gemini-2.0-flash">2.0 Flash</option>
                      <option value="gemini-1.5-flash">1.5 Flash</option>
                      <option value="gemini-1.5-flash-8b">1.5 Flash 8B</option>
                    </select>
                  </div>
                </div>
                <div style={{ flex: 1, height: '550px', maxHeight: '800px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-color)' }}>
                  {chatMessages.map((msg, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '80%', padding: '0.6rem 1rem', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: msg.role === 'user' ? 'var(--accent-green)' : 'var(--surface-color)',
                        color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                        fontSize: '0.875rem', lineHeight: 1.5, border: '1px solid var(--border-color)'
                      }}>{msg.text}</div>
                    </div>
                  ))}
                  {isChatLoading && <div style={{ display: 'flex', justifyContent: 'flex-start' }}><div style={{ padding: '0.6rem 1rem', borderRadius: '16px 16px 16px 4px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>🤔 Thinking...</div></div>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
                    placeholder="Ask about soil, crops, or farming tips..."
                    style={{ flex: 1, padding: '0.6rem 1rem', borderRadius: '20px', border: '1px solid var(--border-color)', background: 'var(--surface-color)', color: 'var(--text-primary)', fontSize: '0.875rem' }} />
                  <button onClick={sendChatMessage} disabled={isChatLoading} className="btn-primary" style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Send size={16} /></button>
                </div>
              </div>

              {/* ---- Colombo Market Price Board ---- */}
              <div className="chart-container-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div className="chart-box-title" style={{ margin: 0 }}>
                    🛒 Colombo Market Price Board
                    <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>(AI-estimated · Approx.)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {marketLastUpdated && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Updated: {marketLastUpdated.toLocaleTimeString()}
                      </span>
                    )}
                    <button onClick={fetchMarketPrices} disabled={isMarketLoading} className="btn-primary"
                      style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      {isMarketLoading ? '⏳ Fetching...' : '🔄 Fetch Prices'}
                    </button>
                  </div>
                </div>

                {!marketPrices && !isMarketLoading && (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛒</div>
                    <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>No price data loaded</div>
                    <div style={{ fontSize: '0.85rem' }}>Click "Fetch Prices" to get AI-estimated Colombo market prices</div>
                  </div>
                )}

                {isMarketLoading && (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</div>
                    <div>Fetching prices from Gemini AI...</div>
                  </div>
                )}

                {marketPrices && !isMarketLoading && (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                      <thead>
                        <tr style={{ background: 'var(--surface-color)', borderBottom: '2px solid var(--border-color)' }}>
                          <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', fontWeight: 600 }}>Commodity</th>
                          <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center', fontWeight: 600 }}>Unit</th>
                          <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right', fontWeight: 600 }}>Price (Rs.) ✏️</th>
                          <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center', fontWeight: 600 }}>Trend</th>
                          <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center', fontWeight: 600 }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {marketPrices.map((item, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-color)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <td style={{ padding: '0.55rem 0.75rem', fontWeight: 500 }}>{item.name}</td>
                            <td style={{ padding: '0.55rem 0.75rem', textAlign: 'center', color: 'var(--text-secondary)' }}>/{item.unit}</td>
                            <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right' }}>
                              {editingMarketIdx === i ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                                  <input
                                    type="number" autoFocus
                                    value={editingMarketValue}
                                    onChange={e => setEditingMarketValue(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') saveMarketPriceEdit(i); if (e.key === 'Escape') setEditingMarketIdx(null); }}
                                    style={{ width: '90px', padding: '0.25rem 0.4rem', borderRadius: '4px', border: '2px solid var(--accent-green)', background: 'var(--bg-color)', color: 'var(--text-primary)', textAlign: 'right', fontSize: '0.88rem' }}
                                  />
                                  <button onClick={() => saveMarketPriceEdit(i)} style={{ background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}>✓</button>
                                  <button onClick={() => setEditingMarketIdx(null)} style={{ background: 'var(--border-color)', color: 'var(--text-primary)', border: 'none', borderRadius: '4px', padding: '0.2rem 0.5rem', cursor: 'pointer', fontSize: '0.8rem' }}>✗</button>
                                </div>
                              ) : (
                                <span
                                  onClick={() => { setEditingMarketIdx(i); setEditingMarketValue(item.price); }}
                                  style={{
                                    fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
                                    color: item.trend === 'up' ? '#22c55e' : item.trend === 'down' ? '#ef4444' : 'var(--text-primary)',
                                    borderBottom: '1px dashed var(--border-color)', paddingBottom: '1px'
                                  }}
                                  title="Click to edit price">
                                  {item.price.toLocaleString()}
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '0.55rem 0.75rem', textAlign: 'center' }}>
                              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.2rem' }}>
                                {['up', 'stable', 'down'].map(t => (
                                  <button key={t} onClick={() => setMarketTrend(i, t)}
                                    style={{
                                      border: 'none', borderRadius: '4px', padding: '0.15rem 0.3rem', cursor: 'pointer', fontSize: '0.9rem',
                                      background: item.trend === t ? (t === 'up' ? '#22c55e' : t === 'down' ? '#ef4444' : '#64748b') : 'var(--surface-color)',
                                      opacity: item.trend === t ? 1 : 0.4, transition: 'all 0.2s'
                                    }}>
                                    {t === 'up' ? '📈' : t === 'down' ? '📉' : '➡️'}
                                  </button>
                                ))}
                              </div>
                            </td>
                            <td style={{ padding: '0.55rem 0.75rem', textAlign: 'center' }}>
                              <button onClick={() => deleteMarketItem(i)} title="Delete row"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-red)', padding: '0.2rem' }}>
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <button onClick={addMarketItem} className="btn-secondary"
                        style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Plus size={13} /> Add Commodity
                      </button>
                      <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(245,158,11,0.1)', borderRadius: '6px', border: '1px solid rgba(245,158,11,0.3)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        ⚠️ AI-estimated prices. Official:{' '}
                        <a href="http://www.harti.gov.lk" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)' }}>harti.gov.lk</a>
                        {' · '}Click any price to edit
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>

      {/* ===== FLOATING AI CHAT WIDGET ===== */}
      <div className="chat-widget-container">
        {/* Chat Panel */}
        {showFloatChat && (
          <div className="chat-widget-panel">
            {/* Header */}
            <div style={{
              padding: '0.75rem 1rem', background: 'var(--accent-green)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', fontWeight: 600 }}>
                <span style={{ fontSize: '1.1rem' }}>🌱</span> AI Crop Advisor
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <select
                  value={geminiModel}
                  onChange={(e) => {
                    setGeminiModel(e.target.value);
                    localStorage.setItem('gemini_model', e.target.value);
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none',
                    borderRadius: '4px', fontSize: '0.7rem', padding: '2px 4px', cursor: 'pointer', outline: 'none'
                  }}
                >
                  <option value="gemini-2.5-flash" style={{ color: 'black' }}>2.5 Flash</option>
                  <option value="gemini-2.0-flash" style={{ color: 'black' }}>2.0 Flash</option>
                  <option value="gemini-1.5-flash" style={{ color: 'black' }}>1.5 Flash</option>
                  <option value="gemini-1.5-flash-8b" style={{ color: 'black' }}>1.5 Flash 8B</option>
                </select>
                <button onClick={() => setShowFloatChat(false)}
                  style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>
            </div>
            {/* Farm context badge */}
            <div style={{ padding: '0.4rem 1rem', background: 'var(--surface-color)', fontSize: '0.72rem', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
              📍 {selectedPoint.name} · pH {selectedPoint.ph} · {selectedPoint.moisture}% moisture
            </div>
            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {chatMessages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '85%', padding: '0.5rem 0.75rem', fontSize: '0.82rem', lineHeight: 1.5,
                    borderRadius: msg.role === 'user' ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
                    background: msg.role === 'user' ? 'var(--accent-green)' : 'var(--surface-color)',
                    color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                    border: '1px solid var(--border-color)'
                  }}>{msg.text}</div>
                </div>
              ))}
              {isChatLoading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ padding: '0.5rem 0.75rem', borderRadius: '14px 14px 14px 3px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'inline-flex', gap: '3px' }}>
                      <span style={{ animation: 'bounce 1s infinite 0s', display: 'inline-block' }}>●</span>
                      <span style={{ animation: 'bounce 1s infinite 0.2s', display: 'inline-block' }}>●</span>
                      <span style={{ animation: 'bounce 1s infinite 0.4s', display: 'inline-block' }}>●</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
            {/* Input */}
            <div style={{ padding: '0.6rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.4rem' }}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
                placeholder="Ask about your farm..."
                style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '20px', border: '1px solid var(--border-color)', background: 'var(--surface-color)', color: 'var(--text-primary)', fontSize: '0.82rem', outline: 'none' }} />
              <button onClick={sendChatMessage} disabled={isChatLoading}
                style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-green)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: isChatLoading ? 0.6 : 1 }}>
                <Send size={14} color="white" />
              </button>
            </div>
          </div>
        )}
        {/* FAB Button */}
        <button onClick={() => setShowFloatChat(prev => !prev)}
          style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: showFloatChat ? 'var(--accent-red)' : 'var(--accent-green)',
            border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.3s ease', transform: showFloatChat ? 'rotate(45deg)' : 'rotate(0deg)'
          }} title={showFloatChat ? 'Close Chat' : 'AI Crop Advisor'}>
          {showFloatChat ? <span style={{ fontSize: '1.3rem', color: 'white' }}>✕</span> : <MessageSquare size={24} color="white" />}
        </button>
      </div>
    </div>
  );
}

function MapAutoPan({ selectedPoint }) {
  const map = useMap();
  useEffect(() => {
    if (selectedPoint) {
      const loc = parseLocation(selectedPoint.location);
      map.flyTo(loc, 11, { animate: true, duration: 1.5 });
    }
  }, [selectedPoint, map]);
  return null;
}

function LocationButton({ t }) {
  const map = useMap();
  const [position, setPosition] = useState(null);

  const locateUser = (e) => {
    e.preventDefault();
    map.locate().on("locationfound", function (e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, 14);
    }).on("locationerror", function (e) {
      alert("Could not access your location. Please check browser permissions: " + e.message);
    });
  };

  const userIcon = new L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div class="map-pin-icon-wrap" style="background: var(--accent-red)"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  });

  return (
    <>
      <button
        className="lang-toggle print-hide"
        style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000, display: 'flex', alignItems: 'center', gap: '8px', border: '2px solid rgba(0,0,0,0.2)' }}
        onClick={locateUser}
      >
        <MapPin size={16} /> {t.myLocation}
      </button>
      {position === null ? null : (
        <Marker position={position} icon={userIcon}>
          <Popup>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.youAreHere}</div>
          </Popup>
        </Marker>
      )}
    </>
  );
}

// Subcomponents
function Card({ title, value, unit, icon, min, max, t }) {
  return (
    <div className="stat-card">
      <div className="card-title-row">
        <span>{title}</span>
        {icon}
      </div>
      <div className="card-value">
        {value} <span className="card-unit">{unit}</span>
      </div>
      <div className="card-footer print-hide">
        <span className="val-min"><TrendingDown size={14} /> {t.min}: {min}{unit && unit.includes('C') ? '°C' : unit.includes('%') ? '%' : ''}</span>
        <span className="val-max"><TrendingUp size={14} /> {t.max}: {max}{unit && unit.includes('C') ? '°C' : unit.includes('%') ? '%' : ''}</span>
      </div>
    </div>
  );
}

function SmallCard({ title, value, unit }) {
  return (
    <div className="stat-card">
      <div className="card-title-row"><span>{title}</span></div>
      <div className="card-value">{value} <span className="card-unit">{unit}</span></div>
    </div>
  );
}

export default App;

