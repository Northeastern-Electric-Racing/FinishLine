import React from 'react';
import { Box } from '@mui/material';
import { useGetAllIndexCodes, useSpendingByIndexCode } from '../../../hooks/finance.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { centsToDollar } from '../../../utils/pipes';
import NERModal from '../../../components/NERModal';
import DetailDisplay from '../../../components/DetailDisplay';

interface TotalAmountSpentModalProps {
  open: boolean;
  onHide: () => void;
}

const TotalAmountSpentModal: React.FC<TotalAmountSpentModalProps> = ({ open, onHide }) => {
  const {
    data: indexCodes,
    isLoading: indexCodesIsLoading,
    isError: indexCodesIsError,
    error: indexCodesError
  } = useGetAllIndexCodes();
  // totalled by the server, leaving out denied requests
  const {
    data: spending,
    isLoading: spendingIsLoading,
    isError: spendingIsError,
    error: spendingError
  } = useSpendingByIndexCode();

  if (indexCodesIsError) {
    return <ErrorPage error={indexCodesError} />;
  }
  if (spendingIsError) {
    return <ErrorPage error={spendingError} />;
  }

  if (!indexCodes || indexCodesIsLoading || !spending || spendingIsLoading) {
    return <LoadingIndicator />;
  }

  const indexCodeSpendingMap = indexCodes.reduce(
    (acc, indexCode) => {
      const totalCents = spending.find((entry) => entry.indexCodeId === indexCode.indexCodeId)?.totalSpent ?? 0;

      acc.push({
        name: indexCode.name,
        code: indexCode.code,
        amount: centsToDollar(totalCents)
      });

      return acc;
    },
    [] as { name: string; code: string; amount: string }[]
  );

  return (
    <NERModal open={open} title="Total Amount Spent" onHide={onHide} hideFormButtons showCloseButton>
      <Box display="flex" flexDirection="column" gap={2}>
        {indexCodeSpendingMap.map((entry) => (
          <DetailDisplay key={entry.name} label={`${entry.name} (${entry.code})`} content={`$${entry.amount}`} />
        ))}
      </Box>
    </NERModal>
  );
};

export default TotalAmountSpentModal;
