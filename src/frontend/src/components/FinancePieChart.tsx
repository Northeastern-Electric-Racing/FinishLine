import React from 'react';
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer, Label, Cell } from 'recharts';

interface FinancePieChartProps {
  totalBalance: number;
  pendingLeadership: number;
  pendingFinance: number;
  submittedToSABO: number;
  reimbursed: number;
  available: number;
}

const FinancePieChart: React.FC<FinancePieChartProps> = ({
  totalBalance,
  pendingLeadership,
  pendingFinance,
  submittedToSABO,
  reimbursed,
  available
}) => {
  const data = [
    { name: 'Pending Leadership', value: pendingLeadership },
    { name: 'Pending Finance', value: pendingFinance },
    { name: 'Submitted to SABO', value: submittedToSABO },
    { name: 'Reimbursed', value: reimbursed },
    { name: 'Available', value: available }
  ];

  const sectionColors = ['#FF9999', '#FF6666', '#FF3333', '#FF0000', '#CC0000', '#990000', '#660000'];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={80}
          outerRadius={120}
          label={(entry) => `$${entry.value.toFixed(2)}`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={sectionColors[index % sectionColors.length]} />
          ))}
          <Label
            value={`$${totalBalance.toFixed(2)}`}
            position="center"
            fill="#fff"
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              textAnchor: 'middle',
              dominantBaseline: 'middle'
            }}
          />
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#333',
            color: '#fff',
            border: 'none'
          }}
          itemStyle={{
            color: '#fff'
          }}
        />
        <Legend
          verticalAlign="top"
          height={36}
          iconSize={16}
          wrapperStyle={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#fff'
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default FinancePieChart;
