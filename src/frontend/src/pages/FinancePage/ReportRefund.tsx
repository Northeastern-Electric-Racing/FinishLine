/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import ReportRefundView from './ReportRefundView';
import { useHistory } from 'react-router-dom';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { useToast } from '../../hooks/toasts.hooks';

interface ReportRefundProps {
  modalShow: boolean;
  handleClose: () => void;
}

export interface ReportRefundInputs {
  newAccountCreditAmount: number;
}

const ReportRefund: React.FC<ReportRefundProps> = ({ modalShow, handleClose }: ReportRefundProps) => {
  const history = useHistory();
  const toast = useToast();
  const { isLoading, isError, error, mutateAsync } = useReportRefund();

  const handleConfirm = async ({ newAccountCreditAmount }: ReportRefundInputs) => {
    handleClose();
    await mutateAsync(newAccountCreditAmount).catch((error) => {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    });
    history.goBack();
    toast.success(`New Account Credit Amount #${newAccountCreditAmount} Reported Successfully`);
  };

  if (isLoading) return <LoadingIndicator />;

  if (isError) return <ErrorPage message={error?.message} />;

  return <ReportRefundView modalShow={modalShow} onHide={handleClose} onSubmit={handleConfirm} />;
};

export default ReportRefund;
