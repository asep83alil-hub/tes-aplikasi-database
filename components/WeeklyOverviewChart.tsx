import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { WeeklyData, TherapyDefinition } from '../types';

interface WeeklyOverviewChartProps {
  data: WeeklyData[];
  therapyTypes: TherapyDefinition[];
}

const CustomTooltip = ({ active, payload, label, therapyTypes }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 bg-background/80 backdrop-blur-sm border border-surface-light rounded-lg shadow-xl">
        <p className="text-base font-bold text-white">{label}</p>
        {payload.map((pld: any) => {
          const therapy = therapyTypes.find((t: TherapyDefinition) => t.id === pld.dataKey);
          return (
            <div key={pld.dataKey} style={{ color: pld.color }} className="flex justify-between items-center text-sm">
              <span className="mr-4">{therapy ? therapy.name : pld.name}:</span>
              <span className="font-semibold">{pld.value} anak</span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

const WeeklyOverviewChart: React.FC<WeeklyOverviewChartProps> = ({ data, therapyTypes }) => {
  return (
    <div className="bg-surface border border-surface-light rounded-2xl p-6 shadow-lg h-full">
      <h3 className="text-xl font-bold text-white mb-6">Tinjauan Mingguan</h3>
      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 20,
              left: -10,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#2A3149" />
            <XAxis dataKey="day" tick={{ fill: '#8A94AD' }} tickLine={{ stroke: '#8A94AD' }} />
            <YAxis tick={{ fill: '#8A94AD' }} tickLine={{ stroke: '#8A94AD' }} />
            <Tooltip content={<CustomTooltip therapyTypes={therapyTypes} />} cursor={{ fill: 'rgba(158, 119, 243, 0.1)' }}/>
            <Legend wrapperStyle={{ color: '#8A94AD', paddingTop: '20px' }} />
            {therapyTypes.map(therapy => (
                <Bar key={therapy.id} dataKey={therapy.id} stackId="a" fill={therapy.color} name={therapy.name} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklyOverviewChart;
