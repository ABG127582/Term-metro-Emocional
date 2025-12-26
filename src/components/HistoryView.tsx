import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter, ZAxis, ReferenceLine, ComposedChart, Legend, Area } from 'recharts';
import { Heart, BarChart3, TrendingUp, Download, Eye, EyeOff, X, Compass, FileText, List, Calendar, Printer, Activity, Moon, BookOpen, Check, Trash2 } from 'lucide-react';
import { Assessment } from '../types';
import { emotionalScales, emotionColors } from '../constants';

interface HistoryViewProps {
  assessments: Assessment[];
  theme: 'light' | 'dark';
  onClearHistory: () => void;
  onExportData: () => void;
  onAnonymize: () => void;
  onDeleteAssessment: (id: number) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ assessments, theme, onClearHistory, onExportData, onAnonymize, onDeleteAssessment }) => {
  const textClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const textSecondary = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';
  const borderClass = theme === 'dark' ? 'border-slate-700/50' : 'border-slate-200/50';
  const bgCard = theme === 'dark' ? 'bg-slate-800/50' : 'bg-white/50';

  const [showPrivacyOptions, setShowPrivacyOptions] = useState(false);
  const [subView, setSubView] = useState<'charts' | 'list'>('charts');
  const [showReport, setShowReport] = useState(false);

  // Processamento de dados
  const emotionCounts = useMemo(() => {
    const map = new Map<string, { emotion: string; name: string; count: number }>();
    for (const a of assessments) {
      const emotion = emotionalScales[a.emotion];
      if (!emotion) continue;
      const key = a.emotion;
      const current = map.get(key) || { emotion: key, name: emotion.name, count: 0 };
      map.set(key, { ...current, count: current.count + 1 });
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [assessments]);

  const sortedAssessments = useMemo(() => {
    return [...assessments].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [assessments]);

  // Dados para "Weekly Pulse" (últimos 7 dias)
  const weeklyConsistency = useMemo(() => {
    const days = [];
    const today = new Date();
    // Gera os últimos 7 dias
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        // Usar pt-BR para garantir que o formato bata com o filtro abaixo
        const dateStr = d.toLocaleDateString('pt-BR');
        // Conta registros neste dia
        const count = assessments.filter(a => new Date(a.timestamp).toLocaleDateString('pt-BR') === dateStr).length;
        days.push({
            label: d.toLocaleDateString('pt-BR', { weekday: 'narrow' }),
            date: dateStr,
            count,
            hasData: count > 0
        });
    }
    return days;
  }, [assessments]);

  const getTrendData = useMemo(() => {
    // Ordena do mais antigo para o mais novo para o gráfico
    const sorted = [...assessments].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    return sorted.slice(-30).map((a) => { // Aumentado para 30 pontos para ver mais histórico
      const date = new Date(a.timestamp);
      return {
        fullDate: date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        dateLabel: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        nivel: a.level,
        sleep: a.sleepHours,
        emocao: emotionalScales[a.emotion]?.name || 'Desconhecida'
      };
    });
  }, [assessments]);

  const getCircumplexData = useMemo(() => {
    return assessments.map(a => ({
      x: a.customValence,
      y: a.customArousal,
      z: 1,
      name: emotionalScales[a.emotion]?.name,
      fill: emotionColors[a.emotion]?.main || '#8884d8'
    }));
  }, [assessments]);

  const chartBg = theme === 'dark' ? '#1e293b' : '#f8fafc';
  const chartText = theme === 'dark' ? '#e2e8f0' : '#1e293b';

  // Componente de Relatório Clínico (Visualização para Impressão)
  if (showReport) {
    return (
      <div className="absolute inset-0 z-50 bg-white min-h-screen">
        <div className="p-8 text-slate-900 max-w-4xl mx-auto">
          <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 print-force-black">Relatório Clínico Emocional</h1>
              <p className="text-slate-600 mt-1">Gerado em: {new Date().toLocaleString('pt-BR')}</p>
              <p className="text-slate-500 text-sm mt-1">ID do Paciente: _________________________</p>
            </div>
            <div className="flex gap-2 no-print">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
              >
                <Printer className="w-4 h-4" /> Imprimir / Salvar PDF
              </button>
              <button
                onClick={() => setShowReport(false)}
                className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg flex items-center gap-2 hover:bg-slate-300"
              >
                <X className="w-4 h-4" /> Fechar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h3 className="font-bold text-lg mb-2 border-b pb-2 print-force-black">Resumo Geral</h3>
              <p>Total de Registros: <strong>{assessments.length}</strong></p>
              <p>Período: <strong>{new Date(sortedAssessments[sortedAssessments.length - 1]?.timestamp || Date.now()).toLocaleDateString()}</strong> até <strong>{new Date(sortedAssessments[0]?.timestamp || Date.now()).toLocaleDateString()}</strong></p>
              <p>Emoção Predominante: <strong>{emotionCounts[0]?.name || '-'}</strong></p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
               <h3 className="font-bold text-lg mb-2 border-b pb-2 print-force-black">Distribuição</h3>
               <ul className="space-y-1">
                 {emotionCounts.map(e => (
                   <li key={e.emotion} className="flex justify-between text-sm">
                     <span>{e.name}</span>
                     <span className="font-mono font-bold">{e.count}x</span>
                   </li>
                 ))}
               </ul>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-xl mb-4 bg-slate-100 p-2 print-force-black">Diário & Log Clínico</h3>
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300">
                  <th className="p-2 w-28">Data/Hora</th>
                  <th className="p-2 w-32">Estado</th>
                  <th className="p-2 w-32">Métricas</th>
                  <th className="p-2">Contexto & Notas</th>
                </tr>
              </thead>
              <tbody>
                {sortedAssessments.map((a, idx) => (
                  <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 page-break-inside-avoid">
                    <td className="p-2 align-top font-mono text-xs text-slate-600">
                      {new Date(a.timestamp).toLocaleDateString('pt-BR')}
                      <br />
                      {new Date(a.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-2 align-top">
                      <span className="font-bold text-black">{emotionalScales[a.emotion]?.name}</span>
                      <br />
                      <span className="text-xs">Nível {a.level}</span>
                    </td>
                    <td className="p-2 align-top text-xs space-y-1">
                       <div>Val: {a.customValence.toFixed(1)}</div>
                       <div>Ativ: {a.customArousal.toFixed(1)}</div>
                       <div className="font-semibold text-blue-700">Sono: {a.sleepHours}h</div>
                    </td>
                    <td className="p-2 align-top space-y-1">
                      {a.notes && (
                        <div className="bg-yellow-50 p-2 rounded border border-yellow-100 mb-2 italic text-slate-800">
                          "{a.notes}"
                        </div>
                      )}
                      {a.trigger && <div className="text-xs">⚡ <strong>Gatilho:</strong> {a.trigger}</div>}
                      {a.bodySensations && a.bodySensations.length > 0 && (
                        <div className="text-xs text-purple-700">🩺 <strong>Corpo:</strong> {a.bodySensations.join(', ')}</div>
                      )}
                      {a.copingStrategies && a.copingStrategies.length > 0 && (
                        <div className="text-xs text-green-700">🛡️ <strong>Estratégia:</strong> {a.copingStrategies.join(', ')}</div>
                      )}
                      <div className="text-xs text-slate-500">
                        📍 {a.location} • {a.company.join(', ')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="inline-block mb-4 p-6 rounded-full" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
          <Heart className="w-12 h-12 text-red-400" aria-hidden="true" />
        </div>
        <p className={`${textClass} text-xl font-bold mb-2`}>Nenhuma emoção registrada</p>
        <p className={textSecondary}>Comece registrando para ver o histórico clínico.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controles de Visualização */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className={`flex p-1 rounded-lg border ${borderClass} ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
          <button
            onClick={() => setSubView('charts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              subView === 'charts'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400'
                : `${textSecondary} hover:text-blue-500`
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Gráficos & Ciência
          </button>
          <button
            onClick={() => setSubView('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              subView === 'list'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-700 dark:text-blue-400'
                : `${textSecondary} hover:text-blue-500`
            }`}
          >
            <List className="w-4 h-4" />
            Diário Detalhado
          </button>
        </div>

        <button
          onClick={() => setShowReport(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all text-sm font-medium shadow-lg hover:shadow-indigo-500/30"
        >
          <FileText className="w-4 h-4" />
          Gerar Relatório Clínico
        </button>
      </div>

      {subView === 'charts' ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4`}>
            {/* Cartão de Resumo e Frequência */}
            <div className={`rounded-xl p-6 backdrop-blur-md border-2 ${bgCard} ${borderClass}`}>
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                <h3 className={`text-lg font-bold ${textClass}`}>Frequência</h3>
              </div>
              <div className="space-y-3">
                {emotionCounts.slice(0, 4).map((item, idx) => (
                  <div key={item.emotion} className="flex items-center gap-2">
                    <div className="w-24 text-sm font-medium opacity-80">{item.name}</div>
                    <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(item.count / assessments.length) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs font-mono opacity-60 w-8 text-right">{item.count}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cartão de Consistência e Total */}
            <div className={`rounded-xl p-6 backdrop-blur-md border-2 ${bgCard} ${borderClass} flex flex-col justify-between`}>
               <div>
                 <p className={`text-sm font-semibold uppercase ${textSecondary} mb-2`}>Total de Registros</p>
                 <div className="flex items-baseline gap-2">
                   <p className={`text-5xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent`}>
                     {assessments.length}
                   </p>
                   <p className={`text-xs ${textSecondary}`}>registros</p>
                 </div>
               </div>

               <div className="mt-4">
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary} mb-2`}>Últimos 7 dias (Consistência)</p>
                  <div className="flex justify-between items-end">
                    {weeklyConsistency.map((day, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                                    day.hasData
                                    ? 'bg-green-500 text-white border-green-600 shadow-sm scale-110'
                                    : `bg-transparent ${theme === 'dark' ? 'border-slate-700 text-slate-600' : 'border-slate-200 text-slate-300'}`
                                }`}
                                title={`${day.count} registros em ${day.date}`}
                            >
                                {day.hasData ? <Check className="w-4 h-4" /> : day.label[0]}
                            </div>
                            <span className="text-[9px] opacity-50 uppercase">{day.label}</span>
                        </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>

          {/* Gráfico Composto: Emoção x Sono (Nova Funcionalidade Principal) */}
          <div className={`rounded-2xl p-8 backdrop-blur-md border-2 ${bgCard} ${borderClass}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Moon className={`w-6 h-6 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} aria-hidden="true" />
                <h3 className={`text-xl font-bold ${textClass}`}>Correlação: Emoção & Sono</h3>
              </div>
            </div>
            <p className={`text-sm ${textSecondary} mb-6`}>
              Analise como a quantidade de sono (barras azuis) influencia a intensidade emocional (linha roxa).
            </p>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={getTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#475569' : '#cbd5e1'} vertical={false} />
                <XAxis
                  dataKey="dateLabel"
                  tick={{ fill: chartText, fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  stroke="#8b5cf6"
                  tick={{ fill: chartText, fontSize: 11 }}
                  label={{ value: 'Intensidade Emoção (1-7)', angle: -90, position: 'insideLeft', fill: '#8b5cf6', fontSize: 11 }}
                  domain={[0, 8]}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#3b82f6"
                  tick={{ fill: chartText, fontSize: 11 }}
                  label={{ value: 'Horas de Sono', angle: 90, position: 'insideRight', fill: '#3b82f6', fontSize: 11 }}
                  domain={[0, 14]}
                />
                <Tooltip
                  labelFormatter={(label, payload) => payload[0]?.payload.fullDate || label}
                  contentStyle={{ backgroundColor: chartBg, border: 'none', borderRadius: '12px', color: chartText }}
                />
                <Legend />
                <Bar yAxisId="right" dataKey="sleep" name="Horas de Sono" barSize={20} fill="#3b82f6" opacity={0.3} radius={[4, 4, 0, 0]} />
                <Line yAxisId="left" type="monotone" dataKey="nivel" name="Nível de Emoção" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Modelo Circumplexo de Russell */}
          <div className={`rounded-2xl p-8 backdrop-blur-md border-2 ${bgCard} ${borderClass}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Compass className={`w-6 h-6 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} aria-hidden="true" />
                <h3 className={`text-xl font-bold ${textClass}`}>Modelo Circumplexo (Russell)</h3>
              </div>
            </div>
            <p className={`text-sm ${textSecondary} mb-6`}>
              Correlação entre Valência (Prazer) e Arousal (Energia).
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#475569' : '#cbd5e1'} />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Valência"
                  domain={[0, 10]}
                  tick={{ fill: chartText }}
                  label={{ value: 'Desprazer <---> Prazer', position: 'bottom', fill: chartText, fontSize: 12 }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Arousal"
                  domain={[0, 10]}
                  tick={{ fill: chartText }}
                  label={{ value: 'Baixa <---> Alta Energia', angle: -90, position: 'left', fill: chartText, fontSize: 12 }}
                />
                <ZAxis type="number" dataKey="z" range={[60, 200]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: chartBg, border: 'none', borderRadius: '12px', color: chartText }}
                  formatter={(value, name) => [value, name === 'x' ? 'Valência' : 'Energia']}
                />
                <ReferenceLine x={5} stroke={chartText} strokeOpacity={0.3} />
                <ReferenceLine y={5} stroke={chartText} strokeOpacity={0.3} />
                <Scatter name="Emoções" data={getCircumplexData} fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Lista Detalhada (Log) */}
          {sortedAssessments.map((assessment) => {
            const emotion = emotionalScales[assessment.emotion];
            const color = emotionColors[assessment.emotion];
            return (
              <div
                key={assessment.id || assessment.timestamp}
                className={`rounded-xl p-4 border-l-4 ${bgCard} ${borderClass} hover:translate-x-1 transition-transform group relative`}
                style={{ borderLeftColor: color.main }}
              >
                 <button
                   onClick={() => assessment.id && onDeleteAssessment(assessment.id)}
                   className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                   title="Excluir este registro"
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3 pr-10">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 rounded bg-slate-100 dark:bg-slate-700 text-xs font-mono font-bold">
                      {new Date(assessment.timestamp).toLocaleDateString()}
                      <span className="mx-1 text-slate-400">|</span>
                      {new Date(assessment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center gap-2">
                      <emotion.icon className="w-5 h-5" style={{ color: color.main }} />
                      <span className={`font-bold ${textClass}`}>{emotion.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200 dark:bg-slate-700">Nv. {assessment.level}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 text-xs">
                     <span className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                       Valência: {assessment.customValence}
                     </span>
                     <span className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                       Arousal: {assessment.customArousal}
                     </span>
                  </div>
                </div>

                {assessment.notes && (
                  <div className={`mb-3 p-3 rounded-lg text-sm italic border-l-2 border-yellow-400 ${theme === 'dark' ? 'bg-yellow-900/20 text-slate-300' : 'bg-yellow-50 text-slate-700'}`}>
                    <div className="flex items-center gap-2 mb-1 not-italic font-semibold text-xs opacity-70">
                      <BookOpen className="w-3 h-3" />
                      Nota de Diário
                    </div>
                    "{assessment.notes}"
                  </div>
                )}

                <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 text-sm ${textSecondary}`}>
                  <div className="space-y-2">
                    {assessment.trigger && (
                      <p className="flex items-start gap-2">
                        <span className="mt-0.5">⚡</span>
                        <span><strong>Gatilho:</strong> {assessment.trigger}</span>
                      </p>
                    )}
                    <p className="flex items-start gap-2">
                      <span className="mt-0.5">📍</span>
                      <span>{assessment.location} {assessment.company.length > 0 && `com ${assessment.company.join(', ')}`}</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    {assessment.bodySensations && assessment.bodySensations.length > 0 && (
                      <p className="flex items-start gap-2">
                        <Activity className="w-4 h-4 text-pink-500 mt-0.5" />
                        <span><strong>Corpo:</strong> {assessment.bodySensations.join(', ')}</span>
                      </p>
                    )}
                    <p className="flex items-start gap-2">
                        <span className="mt-0.5">😴</span>
                        <span><strong>Sono:</strong> {assessment.sleepHours}h</span>
                    </p>
                    {assessment.copingStrategies && assessment.copingStrategies.length > 0 && (
                      <p className="flex items-start gap-2">
                        <span className="mt-0.5">🛡️</span>
                        <span><strong>Estratégias:</strong> {assessment.copingStrategies.join(', ')}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer de Ações */}
      <div className={`rounded-xl p-6 backdrop-blur-md border-2 ${bgCard} ${borderClass} mt-8`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className={`text-sm font-semibold uppercase ${textSecondary}`}>Dados & Privacidade</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowPrivacyOptions(!showPrivacyOptions)}
              className="flex items-center gap-2 px-4 py-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all text-sm"
            >
              {showPrivacyOptions ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              Opções
            </button>
            <button
              onClick={onExportData}
              className="flex items-center gap-2 px-4 py-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all text-sm"
            >
              <Download className="w-4 h-4" />
              JSON
            </button>
          </div>
        </div>

        {showPrivacyOptions && (
          <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className="flex gap-3">
               <button
                onClick={onAnonymize}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all text-sm font-medium"
              >
                Anonimizar para Pesquisa
              </button>
              <button
                onClick={onClearHistory}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all text-sm font-medium"
              >
                Apagar Tudo
              </button>
            </div>
            <p className={`text-xs ${textSecondary} mt-3`}>
              Os dados ficam salvos apenas no navegador deste dispositivo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
