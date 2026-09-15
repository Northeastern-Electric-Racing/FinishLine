import React, { useMemo, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AccountCode } from 'shared';
import { centsToDollar } from '../../../utils/pipes';
import { createBudgetChangeRequest } from '../../../apis/change-requests.api';
import ReactHookTextField from '../../../components/ReactHookTextField';
import { useCurrentUser } from '../../../hooks/users.hooks';

interface AccountAllocationProps {
  accounts: AccountCode[];
}

const containerStyle = {
  borderRadius: '12px',
  padding: '24px',
  width: '100%',
  maxWidth: '450px',
  textAlign: 'center'
};

const availableTextStyle = {
  backgroundColor: '#000',
  padding: '16px',
  borderRadius: '8px',
  fontSize: '20px',
  fontWeight: 'bold',
  marginBottom: '12px',
  textAlign: 'center'
};

const accountListStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '20px',
  marginBottom: '24px'
};

const inputStyle = {
  input: { color: '#fff', textAlign: 'left' },
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#2a3435',
    borderRadius: '6px',
    '& fieldset': { borderColor: '#444' },
    '&:hover fieldset': { borderColor: '#dd514c' },
    '&.Mui-focused fieldset': { borderColor: '#dd514c' }
  }
};

const buttonStyle = {
  padding: '5px 10px',
  fontSize: '14px',
  margin: '0 6px'
};

const AccountAllocation: React.FC<AccountAllocationProps> = ({ accounts }) => {
  const user = useCurrentUser();

  const [submitError, setSubmitError] = useState<string | null>(null);

  const defaultValues = useMemo(
    () => Object.fromEntries(accounts.map((acc, i) => [`account-${i}`, ((acc.amount ?? 0) / 100.0).toFixed(2)])),
    [accounts]
  );

  const schema = yup
    .object()
    .shape(
      Object.fromEntries(
        accounts.map((_, i) => [
          `account-${i}`,
          yup.string().required('Amount is required').min(0, 'Amount cannot be negative')
        ])
      )
    );

  const { control, handleSubmit, reset, watch } = useForm<{ [key: string]: string }>({
    defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  });

  const watchedValues = watch();
  const totalInitial = accounts.reduce((sum, acc) => sum + (acc.amount ?? 0), 0);
  const totalCurrent = Object.values(watchedValues).reduce((sum, val) => sum + Number(val) * 100, 0);
  const availableToAllocate = totalInitial - totalCurrent;

  const handleReset = () => {
    reset(defaultValues);
  };

  const onSubmit = async (data: { [key: string]: string }) => {
    const submitterId = user.userId;
    for (const [index, account] of accounts.entries()) {
      const originalAmount = (account.amount ?? 0) / 100;
      const currentAmount = Number(data[`account-${index}`]);

      if (!account.accountCodeId || isNaN(currentAmount) || originalAmount === currentAmount) continue;

      try {
        setSubmitError(null);
        await createBudgetChangeRequest(submitterId, Math.round(currentAmount * 100), undefined, account.accountCodeId);
      } catch (error: any) {
        setSubmitError(error.message);
      }
    }
    handleReset();
  };

  const hasChanges = accounts.some((account, index) => {
    const original = (account.amount ?? 0) / 100;
    const current = watchedValues[`account-${index}`];
    return original !== Number(current);
  });

  return (
    <Box sx={containerStyle}>
      <Box sx={availableTextStyle}>
        <Typography variant="h5" sx={{ color: 'white', fontSize: '18px' }}>
          Available to Allocate
        </Typography>
        <Typography sx={{ color: availableToAllocate < 0 ? '#ff0000' : '#dd514c', fontSize: '28px', fontWeight: 'bold' }}>
          ${centsToDollar(availableToAllocate)}
        </Typography>
      </Box>

      <Typography variant="subtitle1" sx={{ fontSize: '16px', marginBottom: '12px', color: '#eee' }}>
        Account Code
      </Typography>
      <Box sx={accountListStyle}>
        {accounts.map((account, index) => (
          <Box key={`account-${index}`} sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle1" sx={{ fontSize: '16px', color: '#eee', textAlign: 'left' }}>
              {`#${account.code}`}
            </Typography>
            <Controller
              name={`account-${index}`}
              control={control}
              render={({ field }) => (
                <Box sx={{ position: 'relative' }}>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '12px',
                      transform: 'translateY(-50%)',
                      color: '#ccc',
                      pointerEvents: 'none',
                      fontSize: '16px',
                      zIndex: 1
                    }}
                  >
                    $
                  </Box>
                  <ReactHookTextField
                    control={control}
                    {...field}
                    type="number"
                    fullWidth
                    placeholder="0.00"
                    sx={{
                      ...inputStyle,
                      '& input': {
                        paddingLeft: '24px' // to make room for the $
                      }
                    }}
                  />
                </Box>
              )}
            />
          </Box>
        ))}
        {submitError && <Typography sx={{ color: '#ff4c4c', mb: 2, textAlign: 'center' }}>{submitError}</Typography>}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          sx={{ ...buttonStyle, backgroundColor: '#5e6768', color: 'white' }}
          onClick={handleReset}
          aria-label="Reset form"
        >
          Cancel
        </Button>
        <Button
          sx={{ ...buttonStyle, backgroundColor: '#dd514c', color: 'white' }}
          onClick={handleSubmit(onSubmit)}
          disabled={availableToAllocate < 0 || !hasChanges}
          aria-label="Submit budget change request"
        >
          Create Change Request
        </Button>
      </Box>
    </Box>
  );
};

export default AccountAllocation;
