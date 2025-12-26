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

  const data = useMemo(() => {
    const points = [];
    const totalMinutes = 240;
    const timeStep = 5;
    const intensityMultiplier = intensityLevel / 7;

    for (let t = 0; t <= totalMinutes; t += timeStep) {
      const point: any = { time: t };
      for (let i = 0; i < neuroInfo.hormones.length; i++) {
        const hormone = neuroInfo.hormones[i];
        let value = 0;

        if (t <= hormone.decayProfile.peakTime) {
            value = (t / Math.max(1, hormone.decayProfile.peakTime)) * 100 * intensityMultiplier;
        } else {
            const peakValue = 100 * intensityMultiplier;
            const timeSincePeak = t - hormone.decayProfile.peakTime;
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
      const hours = Math.floor(label / 60);
      const mins = label % 60;
      const timeLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

      return (
        <div className={`p-2 rounded border shadow-lg backdrop-blur-md ${theme === 'dark' ? 'bg-slate-800/95 border-slate-700' : 'bg-white/95 border-slate-200'}`}>
          <p className={`text-[10px] font-bold mb-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
             T + {timeLabel}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-[10px] font-medium" style={{ color: entry.color }}>
               <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color}} />
               {entry.name}: {entry.value}%
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatXAxis = (tickItem: number) => {
    if (tickItem === 0) return '0';
    if (tickItem % 60 === 0) return `${tickItem / 60}h`;
    return `${tickItem}m`;
  };

  return (
    <div className={`h-full flex flex-col p-3 rounded-xl border animate-fade-in ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700/50' : 'bg-slate-100/50 border-slate-200/50'}`}>
      <div className="flex items-center gap-2 mb-2">
        <Brain className={`w-4 h-4 flex-shrink-0 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
        <div className="flex-1 leading-tight">
            <h4 className={`text-xs font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                Neuroquímica (Simulada)
            </h4>
            <span className="text-[10px] opacity-70 block truncate">{neuroInfo.description}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 whitespace-nowrap">
            <Clock className="w-3 h-3" />
            {neuroInfo.recoveryEstimate}
        </div>
      </div>

      <div className="flex-1 w-full min-h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} opacity={0.3} />
            <XAxis
                dataKey="time"
                tick={{ fill: textClass, fontSize: 9 }}
                axisLine={{ stroke: gridColor }}
                tickLine={false}
                tickFormatter={formatXAxis}
                ticks={[0, 60, 120, 180, 240]}
                height={20}
            />
            <YAxis
                domain={[0, 100]}
                tick={{ fill: textClass, fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                width={30}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: gridColor, strokeWidth: 1 }} />
            <Legend
                verticalAlign="top"
                height={20}
                iconType="circle"
                iconSize={6}
                wrapperStyle={{ fontSize: '10px', opacity: 0.8, top: -5 }}
            />
            <ReferenceLine x={0} stroke={gridColor} />
            {neuroInfo.hormones.map((hormone) => (
              <Line
                key={hormone.name}
                type="monotone"
                dataKey={hormone.name}
                stroke={hormone.color}
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default NeuroGraph;
