import React, { useState } from 'react';
import { PieChart as RechartsPieChart, Pie, Tooltip, ResponsiveContainer, Label, Cell } from 'recharts';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUp from '@mui/icons-material/ArrowDropUp';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Box } from '@mui/system';
import { Button, List, ListItem, Typography } from '@mui/material';

interface FinancePieChartProps {
  totalBalance: number;
  pendingApproval: number;
  approved: number;
  addedToSABO: number;
  reimbursed: number;
  available: number;
}

const FinancePieChart: React.FC<FinancePieChartProps> = ({
  totalBalance,
  pendingApproval,
  approved,
  addedToSABO,
  reimbursed,
  available
}) => {
  const [isLegendOpen, setIsLegendOpen] = useState(true);
  const [sectionStates, setSectionStates] = useState([
    { title: 'Pending Approval', color: '#562016', expanded: false },
    { title: 'Approved', color: '#8e3c2d', expanded: false },
    { title: 'Added to SABO', color: '#dd514c', expanded: false },
    { title: 'Reimbursed', color: '#797a7a', expanded: false },
    { title: 'Available', color: '#afafaf', expanded: false }
  ]);

  const MIN_PERCENTAGE = 0.05;

  const data = [
    { name: 'Pending Approval', value: pendingApproval },
    { name: 'Approved', value: approved },
    { name: 'Added to SABO', value: addedToSABO },
    { name: 'Reimbursed', value: reimbursed },
    { name: 'Available', value: available }
  ];

  const totalValue = data.reduce((sum, entry) => sum + Math.max(entry.value, 0), 0);

  // Check if all data values are zero or negative
  const isDataEmpty = data.every((item) => item.value <= 0);

  // Create adjusted data for pie chart (only non-negative values)
  let adjustedData = data.filter((entry) => entry.value > 0);
  if (!isDataEmpty && totalValue > 0) {
    // Ensure minimum value for visible segments
    const minValue = Math.max(totalValue * MIN_PERCENTAGE, 1);

    // Adjust values to meet minimum threshold
    adjustedData = adjustedData.map((entry) => ({
      ...entry,
      value: entry.value < minValue ? minValue : entry.value
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
  }

  const sectionColorMap = new Map([
    ['Pending Approval', '#562016'],
    ['Approved', '#8e3c2d'],
    ['Added to SABO', '#dd514c'],
    ['Reimbursed', '#797a7a'],
    ['Available', '#afafaf']
  ]);

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '200px',
    padding: { xs: '6px 12px', sm: '8px 16px' },
    mb: 2,
    fontSize: { xs: '16px', sm: '18px' },
    color: 'white',
    backgroundColor: '#dd514c',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    textTransform: 'none'
  };

  const legendContainerStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    width: '100%',
    maxWidth: '200px',
    mt: { xs: 1, sm: 2 }
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
          <Typography fontSize={{ xs: '16px', sm: '18px' }}>Total Balance</Typography>
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
                    marginBottom: '12px',
                    color: 'white',
                    fontSize: { xs: '14px', sm: '16px' },
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    padding: { xs: '4px 0', sm: '8px 0' }
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
                  <Typography sx={{ fontSize: { xs: '14px', sm: '16px' } }}>{section.title}</Typography>
                </ListItem>
                {section.expanded && (
                  <Box
                    sx={{
                      marginLeft: '30px',
                      marginBottom: '5px',
                      marginTop: '-8px',
                      color: 'white',
                      fontSize: { xs: '14px', sm: '16px' }
                    }}
                  >
                    {data[index].value < 0
                      ? `-$${Math.abs(data[index].value).toLocaleString()}`
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
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 1, sm: 2 },
        padding: { xs: '5px', sm: '10px' },
        width: '100%',
        alignItems: 'center'
      }}
    >
      {isDataEmpty ? (
        <Box sx={{ width: '100%', maxWidth: '300px' }}>
          <Typography variant="h6" color="textSecondary" align="center" sx={{ marginTop: '20px' }}>
            No data available
          </Typography>
        </Box>
      ) : (
        <>
          <ResponsiveContainer width={250} height={250} style={{ background: 'transparent' }}>
            <RechartsPieChart margin={{ top: 0, right: 0, bottom: 20, left: 0 }} style={{ background: 'transparent' }}>
              <Pie
                data={adjustedData}
                dataKey="value"
                nameKey="name"
                cx="50%"
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
            </RechartsPieChart>
          </ResponsiveContainer>
          <CustomLegend />
        </>
      )}
    </Box>
  );
};

export default FinancePieChart;
