import React, { useState } from 'react';
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer, Label, Cell } from 'recharts';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUp from '@mui/icons-material/ArrowDropUp';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

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
  const [isLegendOpen, setIsLegendOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const data = [
    { name: 'Pending Leadership', value: pendingLeadership },
    { name: 'Pending Finance', value: pendingFinance },
    { name: 'Submitted to SABO', value: submittedToSABO },
    { name: 'Reimbursed', value: reimbursed },
    { name: 'Available', value: available }
  ];

  const sectionColors = ['#562016', '#8e3c2d', '#dd514c', '#797a7a', '#afafaf'];

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '192px',
    padding: '8px 16px',
    marginBottom: '24px',
    fontSize: '18px',
    color: 'white',
    backgroundColor: '#dd514c',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease'
  };

  const legendContainerStyle = {
    position: 'absolute' as const,
    right: '0px',
    top: '-155px',
    display: 'flex',
    flexDirection: 'column' as const
  };

  const legendListStyle = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    maxHeight: isLegendOpen ? '500px' : '0',
    overflow: 'hidden',
    transition: 'max-height 0.3s ease-in-out'
  };

  const toggleItemExpand = (index: number) => {
    setExpandedItems((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      }
      return [...prev, index];
    });
  };

  const CustomLegend = (props: any) => {
    const { payload } = props;

    return (
      <div style={legendContainerStyle}>
        <button style={buttonStyle} onClick={() => setIsLegendOpen(!isLegendOpen)}>
          <span>Total Balance</span>
          {isLegendOpen ? <ArrowDropUp /> : <ArrowDropDownIcon />}
        </button>
        <ul style={legendListStyle}>
          {payload.map((entry: any, index: number) => {
            const isExpanded = expandedItems.includes(index);
            return (
              <div key={`item-${index}`}>
                <li
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '16px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleItemExpand(index)}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: '18px',
                      height: '18px',
                      backgroundColor: entry.color,
                      marginRight: '2px'
                    }}
                  />
                  {isExpanded ? (
                    <ArrowDropDownIcon sx={{ fontSize: 16, marginRight: 0.5, marginLeft: 0.4 }} />
                  ) : (
                    <PlayArrowIcon sx={{ fontSize: 11, marginRight: 0.5, marginLeft: 0.4 }} />
                  )}
                  <span>{entry.value}</span>
                </li>
                {isExpanded && (
                  <div
                    style={{
                      marginLeft: '60px',
                      marginBottom: '5px',
                      marginTop: '-8px',
                      color: 'white',
                      fontSize: '16px'
                    }}
                  >
                    ${data[index].value.toLocaleString()}
                  </div>
                )}
              </div>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div style={{ background: 'transparent', padding: '10px' }}>
      <ResponsiveContainer width="100%" height={400} style={{ background: 'transparent' }}>
        <PieChart margin={{ top: -30, right: 0, bottom: 60, left: -140 }} style={{ background: 'transparent' }}>
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
                textAnchor: 'middle'
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
