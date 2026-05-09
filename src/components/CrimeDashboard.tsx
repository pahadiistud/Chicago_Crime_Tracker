import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, AlertTriangle, Map as MapIcon, 
  BarChart3, RefreshCw, Filter, Search,
  Calendar, Info, ArrowUpRight
} from 'lucide-react';
import { CrimeData, StatsData, DayStats } from '../types';
import { fetchRecentCrimes, aggregateByPrimaryType, aggregateByDate } from '../services/crimeService';
import CrimeMap from './CrimeMap';
import CrimeStats from './CrimeStats';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export default function CrimeDashboard() {
  const [crimes, setCrimes] = useState<CrimeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'map'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const loadData = async () => {
    setLoading(true);
    const data = await fetchRecentCrimes(1500);
    setCrimes(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredCrimes = crimes.filter(crime => {
    const matchesSearch = crime.primary_type.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          crime.block.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || crime.primary_type === selectedType;
    return matchesSearch && matchesType;
  });

  const typeStats = aggregateByPrimaryType(crimes);
  const dateStats = aggregateByDate(crimes);
  
  const totalArrests = crimes.filter(c => c.arrest).length;
  const arrestRate = crimes.length > 0 ? ((totalArrests / crimes.length) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
      {/* Sidebar / Navigation */}
      <nav className="fixed left-0 top-0 h-full w-20 bg-[#141414] flex flex-col items-center py-8 z-50">
        <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mb-12 shadow-lg shadow-red-900/20">
          <Shield className="text-white w-6 h-6" />
        </div>
        
        <div className="flex flex-col gap-6">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200",
              activeTab === 'dashboard' ? "bg-white/10 text-white" : "text-gray-500 hover:text-white"
            )}
            title="Dashboard"
          >
            <BarChart3 className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveTab('map')}
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200",
              activeTab === 'map' ? "bg-white/10 text-white" : "text-gray-500 hover:text-white"
            )}
            title="View Map"
          >
            <MapIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-auto">
          <button 
            onClick={loadData}
            disabled={loading}
            className="w-12 h-12 text-gray-500 hover:text-white flex items-center justify-center disabled:opacity-50"
          >
            <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="ml-20 p-8 max-w-[1600px] mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-red-600 uppercase tracking-[0.2em] mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              Live Incident Monitor
            </div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900 leading-none">
              Chicago <span className="text-red-600 italic lg:not-italic">Crime</span> Tracker
            </h1>
            <p className="text-gray-500 mt-3 font-medium flex items-center gap-1.5 antialiased">
              <Calendar className="w-4 h-4" />
              Monitoring {crimes.length} incidents in the last 7 days
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search type or location..."
                className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all w-64 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 shadow-sm appearance-none cursor-pointer"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">All Types</option>
              {typeStats.slice(0, 15).map(stat => (
                <option key={stat.type} value={stat.type}>{stat.type}</option>
              ))}
            </select>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Incidents', value: crimes.length, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Primary Arrests', value: totalArrests, icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Arrest Percent', value: `${arrestRate}%`, icon: Info, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Most Common', value: typeStats[0]?.type || 'N/A', icon: Filter, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map((stat, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={stat.label}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between"
            >
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{stat.label}</p>
                <h3 className={cn("text-2xl font-black", stat.color)}>{stat.value}</h3>
              </div>
              <div className={cn("p-2.5 rounded-xl", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Dynamic Content */}
        <div className="space-y-10">
          {activeTab === 'dashboard' ? (
            <>
              <CrimeStats typeStats={typeStats} dateStats={dateStats} />
              
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-12">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="text-lg font-black tracking-tight text-gray-900 uppercase">Recent Activity Log</h2>
                  <div className="text-[10px] uppercase font-black text-gray-400">Total Entries: {filteredCrimes.length}</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 tracking-widest border-b">Case Number</th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 tracking-widest border-b">Type</th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 tracking-widest border-b">Block</th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 tracking-widest border-b">Date</th>
                        <th className="px-6 py-4 text-[11px] font-black uppercase text-gray-400 tracking-widest border-b">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      <AnimatePresence mode='popLayout'>
                        {filteredCrimes.slice(0, 50).map((crime, idx) => (
                          <motion.tr 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            key={crime.id} 
                            className="group hover:bg-gray-50/80 transition-colors cursor-default"
                          >
                            <td className="px-6 py-4">
                              <span className="font-mono text-xs font-medium text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded">
                                {crime.case_number}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className={cn("w-1.5 h-1.5 rounded-full", getCategoryColor(crime.primary_type))}></div>
                                <span className="text-sm font-semibold text-gray-800">{crime.primary_type}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-600">{crime.block}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-500">
                                {format(new Date(crime.date), 'MMM d, h:mm a')}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                {crime.arrest && (
                                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase rounded border border-emerald-100 italic">Arrest</span>
                                )}
                                {crime.domestic && (
                                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase rounded border border-indigo-100 italic">Domestic</span>
                                )}
                                {!crime.arrest && !crime.domestic && (
                                  <span className="px-2 py-0.5 bg-gray-50 text-gray-400 text-[10px] font-black uppercase rounded border border-gray-100 opacity-50">Pending</span>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                  {filteredCrimes.length === 0 && !loading && (
                    <div className="p-20 text-center text-gray-400 font-mono text-sm">
                      No matching records found
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="h-[750px] relative">
              <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur p-4 rounded-xl shadow-xl border border-gray-200 max-w-xs">
                <h3 className="font-black text-sm uppercase mb-3 flex items-center gap-2">
                  <MapIcon className="w-4 h-4 text-red-600" />
                  Live Map View
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-red-600"></div>
                    <span className="text-gray-600 font-medium tracking-tight">Homicide / Violent</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-gray-600 font-medium tracking-tight">Assault / Robbery</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-gray-600 font-medium tracking-tight">Theft / Burglary</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-gray-600 font-medium tracking-tight">Other Incidents</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-normal">
                    Showing {filteredCrimes.length} of {crimes.length} incidents recorded recently
                  </p>
                </div>
              </div>
              <CrimeMap crimes={filteredCrimes} />
            </div>
          )}
        </div>
      </main>
      
      {/* Footer Info */}
      <footer className="ml-20 p-8 border-t border-gray-200 bg-white">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
              <Shield className="text-white w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-gray-900 tracking-tighter">DATA SOURCE: CHICAGO DATA PORTAL</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Public Safety Records System</p>
            </div>
          </div>
          <div className="flex gap-4">
            <a 
              href="https://data.cityofchicago.org/Public-Safety/Crimes-2001-to-Present/ijzp-q8t2/data_preview" 
              target="_blank" 
              rel="noopener"
              className="text-xs font-black uppercase text-gray-500 hover:text-red-600 flex items-center gap-1 transition-colors"
            >
              Raw Dataset <ArrowUpRight className="w-3 h-3" />
            </a>
            <div className="text-xs font-black uppercase text-gray-300">|</div>
            <p className="text-xs font-black uppercase text-gray-400">Â© 2024 CHI-CRIM-TRK-V1.0</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function getCategoryColor(type: string): string {
  const t = type.toLowerCase();
  if (t.includes('homicide')) return 'bg-red-600';
  if (t.includes('robbery') || t.includes('assault')) return 'bg-orange-500';
  if (t.includes('theft') || t.includes('burglary')) return 'bg-yellow-500';
  if (t.includes('narcotics')) return 'bg-violet-500';
  return 'bg-blue-500';
}
