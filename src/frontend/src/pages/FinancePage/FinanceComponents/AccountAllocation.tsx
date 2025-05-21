import React, { useState } from 'react';
import { Box } from '@mui/system';
import { Button, Typography } from '@mui/material';
import { AccountCode } from 'shared';

interface AccountAllocationProps {
  accounts: AccountCode[];
}

const containerStyle = {
  backgroundColor: '#1c2526',
  borderRadius: '8px',
  padding: '16px',
  width: '100%',
  maxWidth: '400px',
  color: 'white'
};

const availableTextStyle = {
  backgroundColor: '#2a3435',
  padding: '12px',
  borderRadius: '6px',
  fontSize: '18px',
  fontWeight: 'bold',
  marginBottom: '16px',
  color: '#dd514c',
  textAlign: 'center' as const
};

const accountListStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '8px',
  marginBottom: '16px'
};

const accountItemStyle = {
  backgroundColor: '#2a3435',
  borderRadius: '4px',
  padding: '8px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const buttonStyle = {
  padding: '8px 16px',
  borderRadius: '4px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px',
  margin: '0 4px'
};

const AccountAllocation: React.FC<AccountAllocationProps> = ({ accounts }) => {
  const [availableToAllocate] = useState(0);
  const [accountAmounts] = useState<number[]>(accounts.map(() => 14000));

  return (
    <Box sx={containerStyle}>
      <Box sx={availableTextStyle}>
        Available to Allocate <br />${availableToAllocate.toLocaleString()}
      </Box>
      <Typography variant="subtitle1" sx={{ fontSize: '14px', marginBottom: '8px' }}>
        Account Code
      </Typography>
      <Box sx={accountListStyle}>
        {accounts.map((account, index) => (
          <Box key={`account-${index}`} sx={accountItemStyle}>
            <Typography sx={{ fontSize: '14px' }}>{account.code}</Typography>
            <Typography sx={{ fontSize: '14px' }}>${accountAmounts[index].toLocaleString()}</Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button sx={{ ...buttonStyle, backgroundColor: '#5e6768', color: 'white' }}>Cancel</Button>
        <Button sx={{ ...buttonStyle, backgroundColor: '#dd514c', color: 'white' }}>Create Change Request</Button>
      </Box>
    </Box>
  );
};

export default AccountAllocation;
