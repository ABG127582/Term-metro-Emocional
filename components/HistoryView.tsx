import React, { useMemo, useState } from 'react';
import { TrendingUp, Eye, EyeOff, Download, X, BarChart3, Brain, CalendarDays, CloudRain, Sun, CloudLightning, Cloud, AlertTriangle, Filter, Stethoscope, ClipboardList, Target, ShieldAlert, Activity, Moon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter, Cell } from 'recharts';
import { Assessment, Theme, EmotionKey, ClinicalReport } from '../types';
import { EMOTIONAL_SCALES, EMOTION_COLORS } from '../constants';
import { aiService } from '../services/aiService';

interface HistoryViewProps {
  assessments: Assessment[];
  theme: Theme;
  onClearHistory: () => void;
  onExportData: () => void;
  onAnonymize: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({
  assessments,
  theme,
  onClearHistory,
  onExportData,
  onAnonymize
}) => {
  const textClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const textSecondary = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';
  const cardBgClass = theme === 'dark' ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/60 border-slate-200/60';
  const chartGridColor = theme === 'dark' ? '#334155' : '#e2e8f0';
  const chartTextColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  
  const [showPrivacyOptions, setShowPrivacyOptions] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);
  const [filterEmotion, setFilterEmotion] = useState<EmotionKey | 'all'>('all');
  const [filterDays, setFilterDays] = useState<number>(30); 
  const [clinicalReport, setClinicalReport] = useState<ClinicalReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const filteredAssessments = useMemo(() => {
      let filtered = [...assessments];
      if (filterEmotion !== 'all') {
          filtered = filtered.filter(a => a.emotion === filterEmotion);
      }
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - filterDays);
      if (filterDays < 365) {
         filtered = filtered.filter(a => new Date(a.timestamp) >= cutoffDate);
      }
      return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [assessments, filterEmotion, filterDays]);


  const emotionCounts = useMemo(() => {
    const map = new Map<string, { emotion: string; name: string; count: number; fill: string }>();
    for (const a of filteredAssessments) {
      if (!EMOTIONAL_SCALES[a.emotion]) continue;
      const key = a.emotion;
      const current = map.get(key) || { 
          emotion: key, 
          name: EMOTIONAL_SCALES[key].name, 
          count: 0, 
          fill: EMOTION_COLORS[key].chart 
      };
      map.set(key, { ...current, count: current.count + 1 });
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [filteredAssessments]);
  
  const emotionalWeather = useMemo(() => {
      if (filteredAssessments.length === 0) return null;
      
      const recentLogs = filteredAssessments.slice(0, 10);
      const avgValence = recentLogs.reduce((acc, curr) => {
         const scale = EMOTIONAL_SCALES[curr.emotion];
         const levelVal = scale.levels.find(l => l.level === curr.level)?.valence || 5;
         return acc + levelVal;
      }, 0) / recentLogs.length;

      const avgArousal = recentLogs.reduce((acc, curr) => {
         const scale = EMOTIONAL_SCALES[curr.emotion];
         const levelAr = scale.levels.find(l => l.level === curr.level)?.arousal || 5;
         return acc + levelAr;
      }, 0) / recentLogs.length;
      
      if (avgValence > 6) return { icon: Sun, label: "Estável/Positivo", color: "text-amber-400", desc: "Indicadores de bem-estar presentes." };
      if (avgValence < 4 && avgArousal > 6) return { icon: CloudLightning, label: "Turbulento", color: "text-purple-500", desc: "Alta reatividade emocional detectada." };
      if (avgValence < 4) return { icon: CloudRain, label: "Baixa Energia", color: "text-blue-400", desc: "Sinais de melancolia ou exaustão." };
      return { icon: Cloud, label: "Variável", color: "text-slate-400", desc: "Flutuações naturais de humor." };
  }, [filteredAssessments]);

  const getTrendData = useMemo(() => {
    const chronological = [...filteredAssessments].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    return chronological.map((a, i) => ({
      idx: i + 1,
      date: new Date(a.timestamp).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit'}),
      nivel: a.level,
      emocao: EMOTIONAL_SCALES[a.emotion]?.name || '?',
      color: EMOTION_COLORS[a.emotion]?.chart || '#ccc'
    }));
  }, [filteredAssessments]);

  const sleepCorrelationData = useMemo(() => {
      return filteredAssessments.map(a => ({
          sleep: a.sleepHours,
          intensity: a.level,
          emotion: EMOTIONAL_SCALES[a.emotion]?.name,
          color: EMOTION_COLORS[a.emotion]?.main,
          timestamp: a.timestamp
      }));
  }, [filteredAssessments]);

  const calendarData = useMemo(() => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const days = [];
    const startDayOfWeek = startOfMonth.getDay();

    for (let i = 0; i < startDayOfWeek; i++) {
        days.push({ day: 0, date: null, data: null });
    }

    for (let d = 1; d <= endOfMonth.getDate(); d++) {
        const dateStr = new Date(today.getFullYear(), today.getMonth(), d).toLocaleDateString();
        const dailyLogs = filteredAssessments.filter(a => new Date(a.timestamp).toLocaleDateString() === dateStr);
        const topLog = dailyLogs.sort((a, b) => b.level - a.level || new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

        days.push({
            day: d,
            date: dateStr,
            data: topLog ? { emotion: topLog.emotion, level: topLog.level } : null
        });
    }
    return days;
  }, [filteredAssessments]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-xl border shadow-xl backdrop-blur-md ${theme === 'dark' ? 'bg-slate-800/90 border-slate-700' : 'bg-white/90 border-slate-200'}`}>
          <p className={`text-xs font-bold ${textSecondary} mb-1`}>{label || payload[0].payload.date || 'Detalhes'}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color || entry.payload.color || textClass }} className="text-sm font-semibold">
              {entry.name === 'nivel' ? 'Intensidade' : entry.name}: {entry.value}
              {entry.payload.emocao && ` (${entry.payload.emocao})`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleGenerateClinicalReport = async () => {
      setIsAnalyzing(true);
      setAnalysisError(null);

      try {
          const report = await aiService.generateClinicalReport(filteredAssessments, filterDays);
          setClinicalReport(report);
      } catch (e: any) {
          console.error(e);
          setAnalysisError(e.message || "Erro ao conectar com o Analista IA. Tente novamente.");
      } finally {
          setIsAnalyzing(false);
      }
  };

  if (assessments.length === 0) {
    return (
      <div className={`text-center py-20 rounded-3xl border-2 border-dashed ${theme === 'dark' ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-slate-50/50'} animate-fade-in`}>
        <div className="inline-flex mb-6 p-6 rounded-full bg-slate-100 dark:bg-slate-800 shadow-inner">
          <ClipboardList className={`w-12 h-12 ${textSecondary} opacity-50`} aria-hidden="true" />
        </div>
        <h3 className={`${textClass} text-xl font-bold mb-2`}>Diário Vazio</h3>
        <p className={`${textSecondary} max-w-md mx-auto`}>
            O histórico clínico está aguardando o primeiro registro. Vá para a aba "Escalas" para iniciar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* FILTERS BAR */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-100/50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center px-3 text-xs font-bold uppercase text-slate-500 gap-2">
            <Filter className="w-4 h-4" /> Filtros
        </div>
        <select value={filterEmotion} onChange={(e) => setFilterEmotion(e.target.value as any)} className={`px-3 py-2 rounded-lg text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none ${textClass}`}>
            <option value="all">Tudo</option>
            {Object.entries(EMOTIONAL_SCALES).map(([key, val]) => (<option key={key} value={key}>{val.name}</option>))}
        </select>
        <select value={filterDays} onChange={(e) => setFilterDays(Number(e.target.value))} className={`px-3 py-2 rounded-lg text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none ${textClass}`}>
            <option value={7}>7 dias</option>
            <option value={30}>30 dias</option>
            <option value={90}>3 meses</option>
            <option value={365}>Tudo</option>
        </select>
        <div className="ml-auto px-3 text-xs font-medium opacity-60">N={filteredAssessments.length}</div>
      </div>

      {/* AI ANALYST */}
      <div className={`rounded-3xl p-1 border-2 border-dashed ${theme === 'dark' ? 'border-slate-700' : 'border-indigo-200'}`}>
          {!clinicalReport ? (
              <div className="flex flex-col gap-4">
                  <button onClick={handleGenerateClinicalReport} disabled={isAnalyzing} className={`w-full py-10 flex flex-col items-center justify-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-[22px] group`}>
                      <div className={`p-5 rounded-full transition-transform group-hover:scale-110 shadow-lg ${isAnalyzing ? 'bg-slate-200 animate-pulse' : 'bg-indigo-600 text-white'}`}>
                          {isAnalyzing ? <Activity className="w-10 h-10 text-slate-400" /> : <Stethoscope className="w-10 h-10" />}
                      </div>
                      <div className="text-center">
                        <h3 className={`text-lg font-bold ${isAnalyzing ? textSecondary : 'text-indigo-600 dark:text-indigo-400'}`}>
                            {isAnalyzing ? 'Analisando...' : 'Gerar Relatório Clínico (IA)'}
                        </h3>
                        <p className={`text-sm ${textSecondary} mt-1 max-w-md mx-auto`}>
                            Identifica padrões TCC e sugere intervenções.
                        </p>
                      </div>
                  </button>
                  {analysisError && (
                      <div className="mx-6 mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm text-center font-medium">
                          <AlertTriangle className="w-4 h-4 inline mr-2" />
                          {analysisError}
                      </div>
                  )}
              </div>
          ) : (
              <div className={`p-6 md:p-8 rounded-[22px] ${cardBgClass} relative overflow-hidden animate-fade-in`}>
                  <div className="flex justify-between items-start mb-6 gap-4">
                      <div className="flex items-center gap-4">
                          <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
                             <Stethoscope className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className={`text-xl font-bold ${textClass}`}>Relatório Clínico</h3>
                            <p className={`text-xs font-bold uppercase tracking-wider text-indigo-500`}>Gerado por IA</p>
                          </div>
                      </div>
                      <button onClick={() => setClinicalReport(null)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"><X className="w-5 h-5 opacity-50" /></button>
                  </div>
                  
                  <div className="mb-8 p-3 rounded-lg border bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/30 flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700 dark:text-amber-400">
                          <strong>Aviso:</strong> IA pode cometer erros. Não substitui um médico.
                      </p>
                  </div>
                  
                  <div className="grid lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2 space-y-6">
                          <div className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/50 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
                              <h4 className={`text-sm font-bold uppercase mb-3 ${textSecondary}`}>Parecer Geral</h4>
                              <p className={`text-base leading-relaxed ${textClass} font-medium text-justify`}>{clinicalReport.summary}</p>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4">
                              <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/50 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
                                  <h4 className="text-xs font-bold uppercase mb-4 text-amber-500">Padrões</h4>
                                  <ul className="space-y-2">{clinicalReport.dominant_patterns.map((pat, i) => (<li key={i} className={`text-sm font-medium flex gap-2 ${textClass}`}><span className="text-amber-500">•</span> {pat}</li>))}</ul>
                              </div>
                              <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-900/50 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
                                  <h4 className="text-xs font-bold uppercase mb-4 text-red-500">Atenção</h4>
                                  <ul className="space-y-2">{clinicalReport.risk_factors.map((risk, i) => (<li key={i} className={`text-sm font-medium flex gap-2 ${textClass}`}><span className="text-red-500">•</span> {risk}</li>))}</ul>
                              </div>
                          </div>
                      </div>

                      <div className="space-y-6">
                          <div className={`p-6 rounded-2xl text-center border ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                              <h4 className={`text-xs font-bold uppercase mb-2 ${textSecondary}`}>Estabilidade</h4>
                              <p className={`text-4xl font-black ${textClass}`}>{clinicalReport.emotional_stability_score}</p>
                          </div>
                          <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-emerald-900/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
                               <h4 className="text-xs font-bold uppercase mb-3 text-emerald-600 dark:text-emerald-400 flex items-center gap-2"><Target className="w-4 h-4" /> Metas</h4>
                               <ul className="space-y-3">{clinicalReport.weekly_goals.map((goal, i) => (<li key={i} className="flex items-start gap-3"><div className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500 flex-shrink-0" /><span className={`text-sm font-medium ${textClass}`}>{goal}</span></li>))}</ul>
                          </div>
                      </div>
                  </div>
              </div>
          )}
      </div>

      <div className={`rounded-3xl p-6 md:p-8 border backdrop-blur-md ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700' : 'bg-white/40 border-blue-100'}`}>
          <div className="flex items-center gap-6">
              {emotionalWeather && <div className="p-4 rounded-2xl bg-white/10 shadow-inner"><emotionalWeather.icon className={`w-12 h-12 ${emotionalWeather.color}`} /></div>}
              <div>
                  <h2 className={`text-sm font-bold uppercase tracking-widest opacity-60 mb-1 ${textClass}`}>Clima Emocional</h2>
                  <p className={`text-2xl md:text-3xl font-black ${textClass}`}>{emotionalWeather?.label || "Sem dados"}</p>
                  <p className={`text-sm font-medium ${textSecondary}`}>{emotionalWeather?.desc}</p>
              </div>
          </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className={`rounded-3xl p-6 md:p-8 backdrop-blur-md border ${cardBgClass} overflow-hidden`}>
            <div className="flex items-center gap-3 mb-6"><BarChart3 className="w-6 h-6 text-blue-500" /><h3 className={`text-xl font-bold ${textClass}`}>Distribuição</h3></div>
            <div className="h-[300px] w-full overflow-x-auto">
              <div className="min-w-[600px] h-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={emotionCounts}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} opacity={0.5} />
                    <XAxis dataKey="name" tick={{ fill: chartTextColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: chartTextColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>{emotionCounts.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}</Bar>
                    </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
        </div>

        <div className={`rounded-3xl p-6 md:p-8 backdrop-blur-md border ${cardBgClass} overflow-hidden`}>
            <div className="flex items-center gap-3 mb-6"><Moon className="w-6 h-6 text-indigo-500" /><h3 className={`text-xl font-bold ${textClass}`}>Sono x Emoção</h3></div>
            <div className="h-[300px] w-full overflow-x-auto">
              <div className="min-w-[600px] h-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} opacity={0.5} />
                        <XAxis type="number" dataKey="sleep" name="Sono" domain={[0, 12]} unit="h" tick={{ fill: chartTextColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis type="number" dataKey="intensity" name="Nível" domain={[0, 8]} tick={{ fill: chartTextColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (<div className={`p-2 rounded bg-white text-black text-xs font-bold border shadow`}>{data.emotion} (Nv {data.intensity})<br/>{data.sleep}h sono</div>);
                            }
                            return null;
                        }} />
                        <Scatter data={sleepCorrelationData} fill="#8884d8">{sleepCorrelationData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
        </div>
      </div>

      <div className={`rounded-3xl p-6 md:p-8 backdrop-blur-md border ${cardBgClass} overflow-hidden`}>
          <div className="flex items-center gap-3 mb-6"><TrendingUp className="w-6 h-6 text-green-500" /><h3 className={`text-xl font-bold ${textClass}`}>Tendência</h3></div>
          <div className="h-[300px] w-full overflow-x-auto">
            <div className="min-w-[600px] h-full">
              <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} opacity={0.5} />
                  <XAxis dataKey="date" tick={{ fill: chartTextColor, fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis domain={[1, 7]} tick={{ fill: chartTextColor, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="nivel" strokeWidth={3} stroke={theme === 'dark' ? '#818cf8' : '#6366f1'} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
      </div>

        <div className={`rounded-3xl p-6 md:p-8 backdrop-blur-md border ${cardBgClass}`}>
             <div className="flex items-center gap-3 mb-6"><CalendarDays className="w-6 h-6 text-indigo-500" /><h3 className={`text-xl font-bold ${textClass}`}>Calendário</h3></div>
            <div className="grid grid-cols-7 gap-2 text-center mb-2">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (<span key={i} className={`text-xs font-bold ${textSecondary}`}>{day}</span>))}
            </div>
            <div className="grid grid-cols-7 gap-2">
                {calendarData.map((d, i) => {
                    if (d.day === 0) return <div key={i} className="aspect-square"></div>;
                    const hasData = !!d.data;
                    const emotionColor = hasData ? EMOTION_COLORS[d.data!.emotion] : null;
                    return (
                        <div key={i} className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium relative group ${!hasData ? (theme === 'dark' ? 'bg-slate-800/50 text-slate-600' : 'bg-slate-100 text-slate-400') : 'text-white shadow-md'}`} style={{ backgroundColor: emotionColor ? emotionColor.main : undefined }}>
                            {d.day}
                        </div>
                    );
                })}
            </div>
        </div>

      <div className={`rounded-3xl p-6 md:p-8 backdrop-blur-md border ${cardBgClass}`}>
         <div className="flex items-center gap-3 mb-6"><ClipboardList className="w-6 h-6 text-amber-500" /><h3 className={`text-xl font-bold ${textClass}`}>Logs</h3></div>
        <div className="space-y-4">
            {filteredAssessments.map((log) => {
                const emotionScale = EMOTIONAL_SCALES[log.emotion];
                const emotionColor = EMOTION_COLORS[log.emotion];
                const isExpanded = expandedLogId === log.id;
                return (
                    <div key={log.id} className={`rounded-2xl border transition-all ${theme === 'dark' ? 'bg-slate-900/40 border-slate-700' : 'bg-white/50 border-slate-200'}`}>
                        <div className="p-4 cursor-pointer flex items-center justify-between" onClick={() => setExpandedLogId(isExpanded ? null : log.id)}>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm text-white font-bold" style={{ background: emotionColor.main }}>{log.level}</div>
                                <div>
                                    <h4 className={`font-bold ${textClass}`}>{emotionScale?.name}</h4>
                                    <div className={`text-xs ${textSecondary}`}>{new Date(log.timestamp).toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                        {isExpanded && (
                            <div className={`px-4 pb-4 pt-2 border-t space-y-4 ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                                <div className="p-3 rounded-xl bg-slate-100/10"><p className={`text-sm ${textClass}`}>{log.notes}</p></div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
      </div>
      
      <div className={`rounded-3xl p-6 md:p-8 backdrop-blur-md border ${cardBgClass}`}>
        <div className="flex flex-wrap gap-3">
            <button onClick={() => setShowPrivacyOptions(!showPrivacyOptions)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium ${theme === 'dark' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-700'}`}><Eye className="w-4 h-4" /> Privacidade</button>
            <button onClick={onExportData} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium"><Download className="w-4 h-4" /> Backup JSON</button>
            <button onClick={onClearHistory} className="flex items-center gap-2 px-4 py-2.5 bg-red-100 text-red-700 rounded-xl font-medium"><X className="w-4 h-4" /> Reset</button>
        </div>
      </div>
    </div>
  );
};

export default HistoryView;