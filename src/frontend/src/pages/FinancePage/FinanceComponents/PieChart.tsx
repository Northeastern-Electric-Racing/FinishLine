import React, { useState } from 'react';
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer, Label, Cell } from 'recharts';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUp from '@mui/icons-material/ArrowDropUp';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Box } from '@mui/system';
import { Button, List, ListItem, Typography } from '@mui/material';

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

  const [sectionStates, setSectionStates] = useState([
    { title: 'Pending Leadership', color: '#562016', expanded: false },
    { title: 'Pending Finance', color: '#8e3c2d', expanded: false },
    { title: 'Submitted to SABO', color: '#dd514c', expanded: false },
    { title: 'Reimbursed', color: '#797a7a', expanded: false },
    { title: 'Available', color: '#afafaf', expanded: false }
  ]);

  const MIN_PERCENTAGE = 0.05;

  const data = [
    { name: 'Pending Leadership', value: pendingLeadership },
    { name: 'Pending Finance', value: pendingFinance },
    { name: 'Submitted to SABO', value: submittedToSABO },
    { name: 'Reimbursed', value: reimbursed },
    { name: 'Available', value: available }
  ];

  const totalValue = data.reduce((sum, entry) => sum + entry.value, 0);

  // Check if all data values are zero
  const isDataEmpty = data.every((item) => item.value === 0);

  let adjustedData = data;
  if (!isDataEmpty && totalValue > 0) {
    // Ensure minimum value for visible segments
    const minValue = Math.max(totalValue * MIN_PERCENTAGE, 1);

    // Adjust values to meet minimum threshold
    adjustedData = data.map((entry) => ({
      ...entry,
      value: entry.value > 0 && entry.value < minValue ? minValue : entry.value
    }));

    // Calculate total after adjustments
    const adjustedTotal = adjustedData.reduce((sum, entry) => sum + entry.value, 0);

    // Scale down if total exceeds original
    if (adjustedTotal > totalValue) {
      const scaleFactor = totalValue / adjustedTotal;
      adjustedData = adjustedData.map((entry) => ({
        ...entry,
        value: entry.value * scaleFactor
      }));
    }

    // Ensure no negative values
    adjustedData = adjustedData.map((entry) => ({
      ...entry,
      value: Math.max(entry.value, 0)
    }));
  }

  const sectionColorMap = new Map([
    ['Pending Leadership', '#562016'],
    ['Pending Finance', '#8e3c2d'],
    ['Submitted to SABO', '#dd514c'],
    ['Reimbursed', '#797a7a'],
    ['Available', '#afafaf']
  ]);

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '192px',
    padding: '8px 16px',
    mb: 3,
    fontSize: '18px',
    color: 'white',
    backgroundColor: '#dd514c',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    textTransform: 'none'
  };

  const legendContainerStyle = {
    position: 'absolute' as const,
    right: '0px',
    top: '-155px',
    display: 'flex',
    flexDirection: 'column' as const,
    width: '192px'
  };

  const legendListStyle = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    maxHeight: isLegendOpen ? '500px' : '0',
    overflow: 'hidden',
    transition: 'max-height 0.3s ease-in-out',
    width: '100%'
  };

  const toggleItemExpand = (index: number) => {
    setSectionStates((prev) => prev.map((item, i) => (i === index ? { ...item, expanded: !item.expanded } : item)));
  };

  const CustomLegend = () => {
    return (
      <Box sx={legendContainerStyle}>
        <Button sx={buttonStyle} onClick={() => setIsLegendOpen((prev) => !prev)}>
          <Typography fontSize="18px"> Total Balance </Typography>
          {isLegendOpen ? <ArrowDropDownIcon /> : <ArrowDropUp />}
        </Button>
        {isLegendOpen && (
          <List sx={legendListStyle}>
            {sectionStates.map((section, index) => (
              <Box key={`item-${index}`}>
                <ListItem
                  sx={{
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
                  <Typography
                    sx={{
                      display: 'inline-block',
                      width: '18px',
                      height: '18px',
                      backgroundColor: section.color,
                      marginRight: '2px'
                    }}
                  />
                  {section.expanded ? (
                    <ArrowDropDownIcon sx={{ fontSize: 16, marginRight: 0.5, marginLeft: 0.4 }} />
                  ) : (
                    <PlayArrowIcon sx={{ fontSize: 11, marginRight: 0.5, marginLeft: 0.4 }} />
                  )}
                  <Typography sx={{ fontSize: '16px' }}>{section.title}</Typography>
                </ListItem>
                {section.expanded && (
                  <Box
                    sx={{
                      marginLeft: '60px',
                      marginBottom: '5px',
                      marginTop: '-8px',
                      color: 'white',
                      fontSize: '16px'
                    }}
                  >
                    {data[index].value < 0
                      ? `($${Math.abs(data[index].value).toLocaleString()})`
                      : `$${data[index].value.toLocaleString()}`}
                  </Box>
                )}
              </Box>
            ))}
          </List>
        )}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        background: 'transparent',
        display: 'flex',
        gap: '20px',
        padding: '10px',
        minWidth: '600px',
        flexWrap: 'wrap',
        maxWidth: '900px'
      }}
    >
      {isDataEmpty ? (
        <Box sx={{ width: '300px', minWidth: '200px' }}>
          <Typography variant="h6" color="textSecondary" align="left" sx={{ flex: '1', marginTop: '20px' }}>
            No data available
          </Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="50%" height={400} style={{ background: 'transparent' }}>
          <PieChart
            margin={{ top: -30, right: 0, bottom: 60, left: 0 }}
            style={{ background: 'transparent', minWidth: '450px', flex: '1' }}
          >
            <Pie
              data={adjustedData}
              dataKey="value"
              nameKey="name"
              cx="45%"
              cy="50%"
              innerRadius={80}
              outerRadius={110}
              strokeWidth={0}
            >
              {adjustedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={sectionColorMap.get(entry.name) || '#afafaf'} stroke="none" />
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
              formatter={(_value: number, name: string) => {
                const originalValue = data.find((item) => item.name === name)?.value || 0;
                return [`$${originalValue.toLocaleString()}`, name];
              }}
            />
            <Legend
              content={<CustomLegend />}
              layout="vertical"
              align="right"
              verticalAlign="middle"
              wrapperStyle={{
                paddingRight: '30px',
                paddingBottom: '0px',
                minWidth: '200px',
                maxWidth: '300px',
                flex: '1'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
};

export default FinancePieChart;
