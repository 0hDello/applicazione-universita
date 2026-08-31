import React, { useState } from 'react';
import {
  BarChart3,
  Calendar as CalendarIcon,
  Clock,
  BookOpen,
  CheckCircle2,
  Flame,
  ChevronDown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const StatisticheView: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'Settimana' | 'Mese' | 'Semestre'>('Mese');

  // Recharts Data Sets
  const weeklyStudyData: any[] = [];
  const trendData: any[] = [];
  const subjectStudyData: any[] = [];
  const goalData: any[] = [];

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Title Header & Time Filter */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Statistiche</h2>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Analizza le tue abitudini di studio e monitora i tuoi progressi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(['Settimana', 'Mese', 'Semestre'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  timeRange === range
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
            <span>1 – 31 Maggio 2026</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* TOP KPI CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Ore di studio */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5">
              0%
            </span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block">Ore di studio</span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
              0h 0m
            </h3>
            <span className="text-[9px] text-slate-400 font-medium">--</span>
          </div>
        </div>

        {/* KPI 2: Lezioni seguite */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5">
              0%
            </span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block">Lezioni seguite</span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
              0
            </h3>
            <span className="text-[9px] text-slate-400 font-medium">--</span>
          </div>
        </div>

        {/* KPI 3: Appunti sistemati */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5">
              0%
            </span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block">Appunti sistemati</span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
              0
            </h3>
            <span className="text-[9px] text-slate-400 font-medium">--</span>
          </div>
        </div>

        {/* KPI 4: Ripetizioni completate */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5">
              0%
            </span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block">Ripetizioni completate</span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
              0
            </h3>
            <span className="text-[9px] text-slate-400 font-medium">--</span>
          </div>
        </div>

        {/* KPI 5: Streak di studio */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5">
              -
            </span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block">Streak di studio</span>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
              0 giorni
            </h3>
            <span className="text-[9px] text-slate-400 font-medium">streak attuale</span>
          </div>
        </div>
      </div>

      {/* MAIN CHARTS SECTION: Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Ore di studio settimanali BarChart */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Ore di studio settimanali
              </h4>
              <p className="text-xs text-slate-400">Totale: 0h 0m</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyStudyData}>
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} ore`, 'Studio']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="hours" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Andamento nel tempo LineChart */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Andamento nel tempo
              </h4>
              <p className="text-xs text-slate-400">Ore di studio vs Lezioni seguite</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1 text-blue-600">
                <span className="w-2 h-2 rounded-full bg-blue-600" /> Ore di studio
              </span>
              <span className="flex items-center gap-1 text-purple-600">
                <span className="w-2 h-2 rounded-full bg-purple-600" /> Lezioni seguite
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Line type="monotone" dataKey="ore" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="lezioni" stroke="#a855f7" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CHARTS ROW 2: Donut charts & Ripetizioni */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart: Ore di studio per materia */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-4">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Ore di studio per materia</h4>

          <div className="flex items-center gap-4">
            <div className="w-36 h-36 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectStudyData}
                    innerRadius={42}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {subjectStudyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white leading-none">
                  0h 0m
                </span>
                <span className="text-[9px] text-slate-400">Totale</span>
              </div>
            </div>

            <div className="flex flex-col gap-1 text-[11px] flex-1">
              {subjectStudyData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600 dark:text-slate-300 truncate">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white ml-2">{item.percentage}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Donut Chart: Completamento obiettivi */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-4">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Completamento obiettivi</h4>

          <div className="flex items-center gap-4">
            <div className="w-36 h-36 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={goalData} innerRadius={42} outerRadius={60} paddingAngle={2} dataKey="value">
                    {goalData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-lg font-extrabold text-emerald-600 leading-none">0%</span>
                <span className="text-[9px] text-slate-400">Completati</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Completati:</span>
                <span className="font-extrabold text-emerald-600">0</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-600 dark:text-slate-300 font-medium">In corso:</span>
                <span className="font-extrabold text-blue-600">0</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Non iniziati:</span>
                <span className="font-extrabold text-slate-400">0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress list: Ripetizioni completate per materia */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Ripetizioni completate</h4>
            <span className="text-xs font-bold text-slate-400">Totale: 0</span>
          </div>

          <div className="flex flex-col gap-3 text-xs text-slate-500">
            Nessun dato disponibile.
          </div>
        </div>
      </div>

      {/* Streak Tracker Calendar Widget */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center font-extrabold text-lg">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Streak di studio</h4>
            <span className="text-xs font-bold text-slate-400">0 giorni consecutivi</span>
          </div>
        </div>

        <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 text-center text-xs">
          {[13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26].map((day) => (
            <div
              key={day}
              className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 flex flex-col items-center gap-1"
            >
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{day}</span>
              <div className="w-4 h-4 rounded-full border-2 border-slate-200 dark:border-slate-700" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
