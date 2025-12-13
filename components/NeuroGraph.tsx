import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { EmotionKey, Theme } from '../types';
import { NEURO_DATA } from '../constants';
import { Clock, Brain } from 'lucide-react';

interface NeuroGraphProps {
  emotionKey: EmotionKey;
  intensityLevel: number;
  theme: Theme;
}

const NeuroGraph: React.FC<NeuroGraphProps> = ({ emotionKey, intensityLevel, theme }) => {
  const textClass = theme === 'dark' ? 'text-slate-200' : 'text-slate-700';
  const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';
  const neuroInfo = NEURO_DATA[emotionKey];

  // Generate simulated time-series data based on decay profiles
  // Extended to 240 minutes (4 hours) per user request
  const data = useMemo(() => {
    const points = [];
    const totalMinutes = 240; 
    const timeStep = 5; // every 5 minutes
    const intensityMultiplier = intensityLevel / 7;

    for (let t = 0; t <= totalMinutes; t += timeStep) {
      const point: any = { time: t };
      
      // Optimization: Loop through hormones once per time step
      for (let i = 0; i < neuroInfo.hormones.length; i++) {
        const hormone = neuroInfo.hormones[i];
        let value = 0;

        if (t <= hormone.decayProfile.peakTime) {
            // Simple linear rise for simulation
            value = (t / Math.max(1, hormone.decayProfile.peakTime)) * 100 * intensityMultiplier;
        } else {
            // Exponential decay: V(t) = Peak * e^(-rate * (t - peakTime))
            const peakValue = 100 * intensityMultiplier;
            const timeSincePeak = t - hormone.decayProfile.peakTime;
            // Pre-calculate rate divider if strictly necessary, but simple math is fine here
            value = peakValue * Math.exp(-hormone.decayProfile.decayRate * (timeSincePeak / 10)); 
        }
        point[hormone.name] = Math.max(0, Number(value.toFixed(1)));
      }
      points.push(point);
    }
    return points;
  }, [neuroInfo, intensityLevel]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Helper to format time in tooltip
      const hours = Math.floor(label / 60);
      const mins = label % 60;
      const timeLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;

      return (
        <div className={`p-3 rounded-lg border shadow-lg backdrop-blur-md ${theme === 'dark' ? 'bg-slate-800/95 border-slate-700' : 'bg-white/95 border-slate-200'}`}>
          <p className={`text-xs font-bold mb-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
             T + {timeLabel}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-xs font-medium" style={{ color: entry.color }}>
               <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color}} />
               {entry.name}: {entry.value}% acima do basal
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom tick formatter for X Axis to show Hours clearly
  const formatXAxis = (tickItem: number) => {
    if (tickItem === 0) return '0';
    if (tickItem % 60 === 0) return `${tickItem / 60}h`;
    return `${tickItem}m`;
  };

  return (
    <div className={`mt-6 p-4 md:p-6 rounded-2xl border animate-fade-in ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-100/50 border-slate-200/50'}`}>
      <div className="flex items-start gap-3 mb-4">
        <Brain className={`w-6 h-6 flex-shrink-0 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
        <div>
            <h4 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                Recuperação Neuroquímica (Simulação)
            </h4>
            <p className={`text-sm ${textClass} mt-1`}>{neuroInfo.description}</p>
        </div>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} opacity={0.5} />
            <XAxis 
                dataKey="time" 
                tick={{ fill: textClass, fontSize: 10 }} 
                axisLine={{ stroke: gridColor }} 
                tickLine={false}
                tickFormatter={formatXAxis}
                ticks={[0, 30, 60, 90, 120, 150, 180, 210, 240]} // Explicit ticks for readability
                label={{ value: 'Duração (Horas/Minutos)', position: 'bottom', offset: 0, fill: textClass, fontSize: 12, opacity: 0.7 }}
            />
            <YAxis 
                domain={[0, 100]} 
                tick={{ fill: textClass, fontSize: 10 }} 
                axisLine={false} 
                tickLine={false}
                label={{ value: 'Intensidade (%)', angle: -90, position: 'insideLeft', fill: textClass, fontSize: 12, opacity: 0.7 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: gridColor, strokeWidth: 1 }} />
            <Legend 
                verticalAlign="top" 
                height={36} 
                iconType="circle" 
                wrapperStyle={{ fontSize: '12px', opacity: 0.8 }}
            />
            
            <ReferenceLine x={0} stroke={gridColor} label={{ value: "Gatilho", fill: textClass, fontSize: 10, position: 'insideTopRight' }} />
            
            {/* Hour markers lines */}
            <ReferenceLine x={60} stroke={gridColor} strokeDasharray="3 3" label={{ value: "1h", fill: textClass, fontSize: 10, position: 'insideTop', opacity: 0.5 }} />
            <ReferenceLine x={120} stroke={gridColor} strokeDasharray="3 3" label={{ value: "2h", fill: textClass, fontSize: 10, position: 'insideTop', opacity: 0.5 }} />
            <ReferenceLine x={180} stroke={gridColor} strokeDasharray="3 3" label={{ value: "3h", fill: textClass, fontSize: 10, position: 'insideTop', opacity: 0.5 }} />
            <ReferenceLine x={240} stroke={gridColor} strokeDasharray="3 3" label={{ value: "4h", fill: textClass, fontSize: 10, position: 'insideTop', opacity: 0.5 }} />

            {neuroInfo.hormones.map((hormone) => (
              <Line 
                key={hormone.name}
                type="monotone"
                dataKey={hormone.name}
                stroke={hormone.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 w-fit">
        <Clock className="w-4 h-4" />
        Estimativa de Retorno ao Basal: {neuroInfo.recoveryEstimate}
      </div>
      
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {neuroInfo.hormones.map(h => (
            <div key={h.name} className="flex items-center gap-2 text-xs p-2 rounded border" style={{ borderColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)' }}>
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: h.color }} />
                <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>
                    <b>{h.name}:</b> {h.description}
                </span>
            </div>
        ))}
      </div>
    </div>
  );
};

export default NeuroGraph;