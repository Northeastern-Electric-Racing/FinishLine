import React from 'react';
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer, Label, Cell } from 'recharts';
import { ChevronRight } from 'lucide-react';

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

  const sectionColors = ['#562016', '#8e3c2d', '#cd5b52', '#797a7a', '#afafaf'];

  const CustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {payload.map((entry: any, index: number) => (
          <li
            key={`item-${index}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '18px',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold'
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: '20px',
                height: '20px',
                backgroundColor: entry.color,
                marginRight: '8px'
              }}
            />
            <ChevronRight size={13} style={{ marginRight: '4px', marginLeft: '-4px', marginBottom: '-2px' }} />
            <span>{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div style={{ background: 'transparent', padding: '10px' }}>
      <ResponsiveContainer width="100%" height={400} style={{ background: 'transparent' }}>
        <PieChart margin={{ top: 0, right: 0, bottom: 40, left: 0 }} style={{ background: 'transparent' }}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="45%"
            cy="50%"
            innerRadius={80}
            outerRadius={110}
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={sectionColors[index % sectionColors.length]} stroke="none" />
            ))}
            <Label
              value={`$${totalBalance}`}
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
              border: 'none',
              borderRadius: '6px'
            }}
            itemStyle={{
              color: '#fff'
            }}
          />
          <Legend
            content={<CustomLegend />}
            layout="vertical"
            align="right"
            verticalAlign="middle"
            wrapperStyle={{
              paddingRight: '30px',
              paddingBottom: '0px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinancePieChart;
