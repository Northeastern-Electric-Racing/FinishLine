import React from 'react';
import { Box } from '@mui/material';
import { ReimbursementRequest } from 'shared';
import { useGetAllIndexCodes } from '../../../hooks/finance.hooks';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { isReimbursementRequestDenied } from '../../../utils/reimbursement-request.utils';
import { centsToDollar } from '../../../utils/pipes';
import NERModal from '../../../components/NERModal';
import DetailDisplay from '../../../components/DetailDisplay';

interface TotalAmountSpentModalProps {
  open: boolean;
  onHide: () => void;
  allReimbursementRequests: ReimbursementRequest[];
}

const TotalAmountSpentModal: React.FC<TotalAmountSpentModalProps> = ({ open, onHide, allReimbursementRequests }) => {
  const {
    data: indexCodes,
    isLoading: indexCodesIsLoading,
    isError: indexCodesIsError,
    error: indexCodesError
  } = useGetAllIndexCodes();

  if (indexCodesIsError) {
    return <ErrorPage error={indexCodesError} />;
  }

  if (!indexCodes || indexCodesIsLoading) {
    return <LoadingIndicator />;
  }

  const unDeniedReimbursementRequests = allReimbursementRequests.filter((request) => !isReimbursementRequestDenied(request));

  const indexCodeSpendingMap = indexCodes.reduce(
    (acc, indexCode) => {
      const totalCents = unDeniedReimbursementRequests
        .filter((request) => request.indexCode.indexCodeId === indexCode.indexCodeId)
        .reduce((sum, request) => sum + request.totalCost, 0);

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
