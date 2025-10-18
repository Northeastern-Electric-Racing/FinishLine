/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { accountCodePipe, displayEnum } from '../../../utils/pipes';
import { Assignment, ChangeCircle, Edit, Pending } from '@mui/icons-material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SpeedIcon from '@mui/icons-material/Speed';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import StoreIcon from '@mui/icons-material/Store';
import SellIcon from '@mui/icons-material/Sell';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';

import { Typography, useTheme, Link, IconButton } from '@mui/material';
import { Box } from '@mui/system';
import React, { useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { ReimbursementRequest, isAdmin, isHead } from 'shared';
import ActionsMenu, { ButtonInfo } from '../../../components/ActionsMenu';
import NERModal from '../../../components/NERModal';
import PageLayout from '../../../components/PageLayout';
import {
  useDeleteReimbursementRequest,
  useDenyReimbursementRequest,
  useEditReimbursementRequest,
  useLeadershipApproveReimbursementRequest,
  useMarkPendingFinance,
  useMarkReimbursementRequestAsReimbursed,
  useRequestReimbursementRequestChanges,
  useUploadManyReceipts
} from '../../../hooks/finance.hooks';
import { useToast } from '../../../hooks/toasts.hooks';
import { useCurrentUser } from '../../../hooks/users.hooks';
import { centsToDollar, fullNamePipe, undefinedPipe } from '../../../utils/pipes';
import {
  imageDownloadUrl,
  imageFileUrl,
  isReimbursementRequestAdvisorApproved,
  isReimbursementRequestReimbursed,
  isReimbursementRequestSaboSubmitted,
  isReimbursementRequestPendingSaboSubmission,
  isReimbursementRequestDenied,
  isReimbursementRequestLeadershipApproved,
  isReimbursementRequestPendingFinance,
  getUniqueWbsElementsWithProductsFromReimbursementRequest,
  getCurrentReimbursementStatus
} from '../../../utils/reimbursement-request.utils';
import { routes } from '../../../utils/routes';
import AddSABONumberModal from './AddSABONumberModal';
import ReimbursementProductsView from './ReimbursementProductsView';
import SubmitToSaboModal from './SubmitToSaboModal';
import MarkSubmittedToSaboModal from './MarkSubmittedToSaboModal';
import DownloadIcon from '@mui/icons-material/Download';
import CheckList from '../../../components/CheckList';
import MarkDeliveredModal from './MarkDeliveredModal';
import ReimbursementRequestTimeline from '../FinanceComponents/ReimbursementRequestTimeline';
import ReimbursementRequestStatusPill from '../../../components/ReimbursementRequestStatusPill';
import SidePage from '../FinanceComponents/SidePagePopup';
import EditReimbursementRequestPage from '../EditReimbursementRequest/EditReimbursementRequest';
import { ReimbursementRequestDataSubmission } from '../ReimbursementRequestForm/ReimbursementRequestForm';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useGetFinanceDelegates } from '../../../hooks/organizations.hooks';
import ErrorPage from '../../ErrorPage';

interface ReimbursementRequestDetailsViewProps {
  reimbursementRequest: ReimbursementRequest;
  onCloseSidePage: () => void;
  onCloseEditPage: () => void;
}

const ReimbursementRequestDetailsView: React.FC<ReimbursementRequestDetailsViewProps> = ({
  reimbursementRequest,
  onCloseSidePage,
  onCloseEditPage
}) => {
  const theme = useTheme();
  const user = useCurrentUser();
  const history = useHistory();
  const [addSaboNumberModalShow, setAddSaboNumberModalShow] = useState<boolean>(false);
  const toast = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDenyModal, setShowDenyModal] = useState(false);
  const [showLeadershipApproveModal, setShowLeadershipApproveModal] = useState(false);
  const [showMarkDelivered, setShowMarkDelivered] = useState(false);
  const [showMarkReimbursed, setShowMarkReimbursed] = useState(false);
  const [showSubmitToSaboModal, setShowSubmitToSaboModal] = useState(false);
  const [showMarkSubmittedToSaboModal, setShowMarkSubmittedToSaboModal] = useState(false);
  const [showMarkPendingFinanceModal, setShowMarkPendingFinanceModal] = useState(false);
  const [showRequestChangesModal, setShowRequestChangesModal] = useState(false);
  const { mutateAsync: deleteReimbursementRequest } = useDeleteReimbursementRequest(
    reimbursementRequest.reimbursementRequestId
  );
  const { mutateAsync: denyReimbursementRequest } = useDenyReimbursementRequest(reimbursementRequest.reimbursementRequestId);
  const { mutateAsync: markReimbursed } = useMarkReimbursementRequestAsReimbursed(
    reimbursementRequest.reimbursementRequestId
  );
  const { mutateAsync: leadershipApproveReimbursementRequest } = useLeadershipApproveReimbursementRequest(
    reimbursementRequest.reimbursementRequestId
  );
  const { mutateAsync: requestReimbursementRequestChanges } = useRequestReimbursementRequestChanges(
    reimbursementRequest.reimbursementRequestId
  );

  const { mutateAsync: markPendingFinance } = useMarkPendingFinance(reimbursementRequest.reimbursementRequestId);

  const isSaboSubmitted = isReimbursementRequestSaboSubmitted(reimbursementRequest);
  const isPendingSaboSubmission = isReimbursementRequestPendingSaboSubmission(reimbursementRequest);
  const isLeadershipApproved = isReimbursementRequestLeadershipApproved(reimbursementRequest);
  const isPendingFinance = isReimbursementRequestPendingFinance(reimbursementRequest);
  const [showEditSidePage, setShowEditSidePage] = useState(false);

  const openSidePage = () => {
    setShowEditSidePage(true);
  };

  const closeSidePage = () => {
    setShowEditSidePage(false);
    onCloseSidePage();
    onCloseEditPage();
  };

  const handleDelete = async () => {
    try {
      await deleteReimbursementRequest();
      closeSidePage();
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 3000);
      }
    }
  };

  const handleDeny = async () => {
    try {
      await denyReimbursementRequest();
      setShowDenyModal(false);
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 3000);
      }
    }
  };

  const handleMarkReimbursed = async () => {
    try {
      await markReimbursed();
      setShowMarkReimbursed(false);
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 3000);
      }
    }
  };

  const handleLeadershipApprove = async () => {
    try {
      await leadershipApproveReimbursementRequest();
      setShowLeadershipApproveModal(false);
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 3000);
      }
    }
  };

  const handleRequestChanges = async () => {
    try {
      await requestReimbursementRequestChanges();
      setShowRequestChangesModal(false);
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 3000);
      }
    }
  };

  const handleMarkPendingFinance = async () => {
    try {
      if (reimbursementRequest.receiptPictures.length === 0) {
        throw new Error('Please upload at least one receipt before marking as pending finance');
      }
      if (!reimbursementRequest.dateOfExpense) {
        throw new Error('Please enter a date of expense before marking as pending finance');
      }
      await markPendingFinance();
      setShowMarkPendingFinanceModal(false);
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 3000);
      }
    }
  };

  const DeleteModal = () => {
    return (
      <NERModal
        open={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        title="Warning!"
        cancelText="No"
        submitText="Yes"
        onSubmit={handleDelete}
      >
        <Typography>Are you sure you want to delete this reimbursement request?</Typography>
      </NERModal>
    );
  };

  const DenyModal = () => {
    return (
      <NERModal
        open={showDenyModal}
        onHide={() => setShowDenyModal(false)}
        title="Warning!"
        cancelText="No"
        submitText="Yes"
        onSubmit={handleDeny}
      >
        <Typography>Are you sure you want to deny this reimbursement request?</Typography>
      </NERModal>
    );
  };

  const LeadershipApproveModal = () => {
    return (
      <NERModal
        open={showLeadershipApproveModal}
        onHide={() => setShowLeadershipApproveModal(false)}
        title="Warning!"
        cancelText="No"
        submitText="Yes"
        onSubmit={handleLeadershipApprove}
      >
        <Typography>Are you sure you want to approve this reimbursement request?</Typography>
      </NERModal>
    );
  };

  const MarkReimbursedModal = () => (
    <NERModal
      open={showMarkReimbursed}
      onHide={() => setShowMarkReimbursed(false)}
      title="Warning!"
      cancelText="No"
      submitText="Yes"
      onSubmit={handleMarkReimbursed}
    >
      <Typography>Are you sure you want to mark this reimbursement request as reimbursed?</Typography>
    </NERModal>
  );

  const RequestChangesModal = () => (
    <NERModal
      open={showRequestChangesModal}
      onHide={() => setShowRequestChangesModal(false)}
      title="Warning!"
      cancelText="No"
      submitText="Yes"
      onSubmit={handleRequestChanges}
    >
      <Typography>Are you sure you want to request changes on this reimbursement request?</Typography>
    </NERModal>
  );

  const ReceiptsView = () => {
    return (
      <Box sx={{ maxHeight: `250px`, overflow: reimbursementRequest.receiptPictures.length > 0 ? 'auto' : 'none' }}>
        <Box sx={{ position: 'sticky', top: 0, background: theme.palette.background.default, pb: 1, zIndex: 1 }}>
          <Typography variant="h5">Receipts</Typography>
        </Box>
        {reimbursementRequest.receiptPictures.map((receipt) => {
          return (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link href={imageFileUrl(receipt.googleFileId)} target="_blank" underline="hover" sx={{ mr: 1, fontSize: 20 }}>
                {receipt.name.length > 20 ? receipt.name.slice(0, 30) + '...' : receipt.name}
              </Link>
              <IconButton href={imageDownloadUrl(receipt.googleFileId)}>
                <DownloadIcon sx={{ fontSize: 30 }} />
              </IconButton>
            </Box>
          );
        })}
      </Box>
    );
  };

  const allowEdit =
    user.userId === reimbursementRequest.recipient.userId &&
    !isReimbursementRequestAdvisorApproved(reimbursementRequest) &&
    !isPendingFinance &&
    !isSaboSubmitted &&
    !isReimbursementRequestReimbursed(reimbursementRequest);

  const { pathname } = useLocation();
  const urlTabInsert = pathname.includes('/all-requests') ? 'all-requests' : 'my-requests';

  // Check if the RR has purchase details (receipts and date of expense)
  const hasPurchaseDetails = reimbursementRequest.receiptPictures.length > 0 && !!reimbursementRequest.dateOfExpense;

  type ButtonInfoWithShow = ButtonInfo & { show?: boolean };

  const allButtons: ButtonInfoWithShow[] = [
    {
      title: 'Edit',
      onClick: () => {
        history.push(`${routes.REIMBURSEMENT_REQUESTS}/${urlTabInsert}/${reimbursementRequest.reimbursementRequestId}/edit`);
        openSidePage();
      },
      icon: <Edit />,
      // Only show Edit if: not leadership approved yet OR already has purchase details
      show: !isLeadershipApproved || hasPurchaseDetails,
      disabled: !allowEdit && !user.isFinance
    },
    {
      title: 'Add Purchase Details',
      onClick: () => {
        history.push(`${routes.REIMBURSEMENT_REQUESTS}/${urlTabInsert}/${reimbursementRequest.reimbursementRequestId}/edit`);
        openSidePage();
      },
      icon: <Edit />,
      // Only show if leadership approved and NO purchase details yet
      show:
        isLeadershipApproved &&
        !hasPurchaseDetails &&
        !isPendingFinance &&
        user.userId === reimbursementRequest.recipient.userId &&
        !isReimbursementRequestReimbursed(reimbursementRequest) &&
        !isReimbursementRequestDenied(reimbursementRequest)
    },
    {
      title: 'Mark Delivered',
      onClick: () => setShowMarkDelivered(true),
      icon: <LocalShippingIcon />,
      // Only show if has purchase details
      show:
        hasPurchaseDetails && !reimbursementRequest.dateDelivered && user.userId === reimbursementRequest.recipient.userId
    },
    {
      title: 'Add SABO #',
      onClick: () => setAddSaboNumberModalShow(true),
      icon: <ConfirmationNumberIcon />,
      show: user.isFinance
    },
    {
      title: 'Mark Reimbursed',
      onClick: () => setShowMarkReimbursed(true),
      icon: <AttachMoneyIcon />,
      show:
        user.isFinance &&
        isReimbursementRequestSaboSubmitted(reimbursementRequest) &&
        !isReimbursementRequestReimbursed(reimbursementRequest) &&
        !isReimbursementRequestDenied(reimbursementRequest)
    },
    {
      title: isPendingSaboSubmission || isSaboSubmitted ? 'SABO Info' : 'Input in SABO',
      onClick: () => setShowSubmitToSaboModal(true),
      icon: isPendingSaboSubmission || isSaboSubmitted ? <Assignment /> : <CheckIcon />,
      show: user.isFinance && isPendingFinance
    },
    {
      title: 'Mark Submitted To SABO',
      onClick: () => setShowMarkSubmittedToSaboModal(true),
      icon: <CheckIcon />,
      show: user.userId === reimbursementRequest.recipient.userId && isPendingSaboSubmission && !isSaboSubmitted
    },
    {
      title: 'Leadership Approve',
      onClick: () => setShowLeadershipApproveModal(true),
      icon: <CheckIcon />,
      show:
        isHead(user.role) &&
        !isReimbursementRequestDenied(reimbursementRequest) &&
        !isReimbursementRequestReimbursed(reimbursementRequest) &&
        !isLeadershipApproved &&
        !isPendingFinance
    },
    {
      title: 'Mark Pending Finance',
      onClick: () => setShowMarkPendingFinanceModal(true),
      icon: <Pending />,
      // Only show if has purchase details
      show:
        hasPurchaseDetails &&
        !isPendingFinance &&
        isLeadershipApproved &&
        (isAdmin(user.role) || user.userId === reimbursementRequest.recipient.userId)
    },
    {
      title: 'Request Changes',
      onClick: () => setShowRequestChangesModal(true),
      icon: <ChangeCircle />,
      show:
        user.isFinance &&
        !isReimbursementRequestReimbursed(reimbursementRequest) &&
        !isReimbursementRequestDenied(reimbursementRequest)
    },
    {
      title: 'Deny',
      onClick: () => setShowDenyModal(true),
      icon: <CloseIcon />,
      show:
        (isAdmin(user.role) || user.isFinance || user.userId === reimbursementRequest.recipient.userId) &&
        !isReimbursementRequestReimbursed(reimbursementRequest) &&
        !isReimbursementRequestDenied(reimbursementRequest)
    },
    {
      title: 'Delete',
      onClick: () => setShowDeleteModal(true),
      icon: <DeleteIcon />,
      show: allowEdit,
      dividerTop: true
    }
  ];

  const buttons: ButtonInfo[] = allButtons.filter((button) => button.show !== false).map(({ show, ...button }) => button);

  const sortedStatus = reimbursementRequest.reimbursementStatuses.sort((a) => a.dateCreated.getDate());
  const statusTypes = sortedStatus.map((status) => status.type);

  const uniqueWbsElementsWithProducts = getUniqueWbsElementsWithProductsFromReimbursementRequest(reimbursementRequest);
  const keys: string[] = [];
  for (const key of uniqueWbsElementsWithProducts.keys()) {
    keys.push(key);
  }

  const detailItems = [
    { label: 'Status', icon: <SpeedIcon fontSize="small" /> },
    { label: 'Created by', icon: <PersonOutlineIcon fontSize="small" /> },
    { label: 'Project/Category', icon: <FolderOpenIcon fontSize="small" /> },
    { label: 'Total Cost', icon: <LocalAtmIcon fontSize="small" /> },
    { label: 'Purchased From', icon: <StoreIcon fontSize="small" /> },
    { label: 'SABO Number', icon: <SellIcon fontSize="small" /> },
    { label: 'Refund Source', icon: <CurrencyExchangeIcon fontSize="small" /> },
    { label: 'Expense Type', icon: <CurrencyExchangeIcon fontSize="small" /> }
  ];

  // grab all unique refund source names
  const refundSourceNames: string[] = Array.from(
    new Set(
      reimbursementRequest.reimbursementProducts.flatMap((product) =>
        product.refundSources.map((rs) => rs.indexCode.code + '-' + rs.indexCode.name)
      )
    )
  );

  const contentItems = [
    {
      content: statusTypes.length > 0 && (
        <Box id="status" display="flex">
          {reimbursementRequest.reimbursementStatuses.length > 0 && (
            <ReimbursementRequestStatusPill
              status={getCurrentReimbursementStatus(reimbursementRequest.reimbursementStatuses).type}
            />
          )}
        </Box>
      )
    },
    { content: fullNamePipe(reimbursementRequest.recipient) },
    {
      content: keys.map((key) => displayEnum(key)).join(', ')
    },
    { content: `$${centsToDollar(reimbursementRequest.totalCost)}` },
    { content: reimbursementRequest.vendor.name },
    { content: `${undefinedPipe(reimbursementRequest.saboId)}` },
    {
      content: refundSourceNames.join(', ')
    },
    { content: accountCodePipe(reimbursementRequest.accountCode) }
  ];

  const { id } = useParams<{ id: string }>();

  const { isLoading: editReimbursementRequestIsLoading, mutateAsync: editReimbursementRequest } =
    useEditReimbursementRequest(id);
  const { isLoading: uploadReceiptsIsLoading, mutateAsync: uploadReceipts } = useUploadManyReceipts();
  const { isLoading, isError, error, data: financeDelegates } = useGetFinanceDelegates();

  if (editReimbursementRequestIsLoading || uploadReceiptsIsLoading || !reimbursementRequest) return <LoadingIndicator />;

  const onSubmit = async (data: ReimbursementRequestDataSubmission): Promise<string> => {
    const filesToKeep = data.receiptFiles.filter((file) => file.googleFileId !== '');

    await editReimbursementRequest({ ...data, receiptPictures: filesToKeep, indexCodeId: data.indexCodeId! });
    await uploadReceipts({
      id: reimbursementRequest.reimbursementRequestId,
      files: data.receiptFiles.filter((receipt) => receipt.googleFileId === '').map((file) => file.file!)
    });

    closeSidePage();
    return reimbursementRequest.reimbursementRequestId;
  };

  const onSubmitToFinance = async (data: ReimbursementRequestDataSubmission): Promise<void> => {
    const filesToKeep = data.receiptFiles.filter((file) => file.googleFileId !== '');

    await editReimbursementRequest({ ...data, receiptPictures: filesToKeep, indexCodeId: data.indexCodeId! });
    await uploadReceipts({
      id: reimbursementRequest.reimbursementRequestId,
      files: data.receiptFiles.filter((receipt) => receipt.googleFileId === '').map((file) => file.file!)
    });

    await markPendingFinance();
    closeSidePage();
  };

  if (isLoading || !financeDelegates) {
    return <LoadingIndicator />;
  }

  if (isError) {
    return <ErrorPage message={error.message} />;
  }

  const MarkPendingFinanceModal = () => (
    <NERModal
      open={showMarkPendingFinanceModal}
      onHide={() => setShowMarkPendingFinanceModal(false)}
      title="Warning!"
      cancelText="No"
      submitText="Yes"
      onSubmit={handleMarkPendingFinance}
    >
      <CheckList
        title="Finance Checklist"
        items={[
          {
            resolved: false,
            detail: `I certify that I have a Concur account${financeDelegates.length > 0 ? ', and have assigned ' + financeDelegates.map(fullNamePipe).join(', ') + ' as delegate(s) to prepare this reimbursement request on my behalf.' : '.'}`,
            id: '1'
          },
          {
            resolved: false,
            detail:
              'I certify my receipts with expenses greater than $75 include an itemixed description of goods or service purchased.',
            id: '2'
          },
          {
            resolved: false,
            detail: `I certify my receipts include the vendor's name (for ex. Amazon, stop and shop, Target).`,
            id: '3'
          },
          {
            resolved: false,
            detail: `I certify my receipts includes a Transaction Date for each expense.`,
            id: '4'
          },
          {
            resolved: false,
            detail: `I certify my receipts include the amount paid for each expense.`,
            id: '5'
          },
          {
            resolved: false,
            detail: `I certify my receipts include the form of payment for each expense (Cash, check or last four digits of credit card).`,
            id: '6'
          },
          {
            resolved: false,
            detail: `This reimbursement request is "NOT" for a faculty or full-time staff member.`,
            id: '7'
          },
          {
            resolved: false,
            detail: `The reimbursement does not include sales tax unless it is for a prepared meal or hotel.`,
            id: '8'
          }
        ]}
        isDisabled={false}
        checkDescriptionBullets={false}
      />

      <Typography>Are you sure you want to mark this reimbursement request as pending finance?</Typography>
    </NERModal>
  );

  return (
    <Box sx={{ ml: 2 }}>
      <PageLayout
        title={`Reimbursement Request #${reimbursementRequest.identifier}`}
        headerRight={
          <Box sx={{ mr: 6 }}>
            <ActionsMenu buttons={buttons} />
          </Box>
        }
      >
        <DeleteModal />
        <DenyModal />
        <MarkDeliveredModal
          modalShow={showMarkDelivered}
          onHide={() => setShowMarkDelivered(false)}
          reimbursementRequest={reimbursementRequest}
        />
        <MarkReimbursedModal />
        <LeadershipApproveModal />
        <MarkPendingFinanceModal />
        <RequestChangesModal />
        <SubmitToSaboModal
          open={showSubmitToSaboModal}
          setOpen={setShowSubmitToSaboModal}
          reimbursementRequest={reimbursementRequest}
        />
        <MarkSubmittedToSaboModal
          open={showMarkSubmittedToSaboModal}
          setOpen={setShowMarkSubmittedToSaboModal}
          reimbursementRequest={reimbursementRequest}
        />
        <AddSABONumberModal
          modalShow={addSaboNumberModalShow}
          onHide={() => setAddSaboNumberModalShow(false)}
          reimbursementRequestId={reimbursementRequest.reimbursementRequestId}
        />
        <SidePage
          showPage={showEditSidePage}
          handleClose={closeSidePage}
          title={''}
          component={
            <EditReimbursementRequestPage
              onExitEditPage={closeSidePage}
              onSubmitEditData={onSubmit}
              onSubmitToFinance={onSubmitToFinance}
            />
          }
        />
        <Box sx={{ display: 'flex', mt: 2 }}>
          <Box>
            {detailItems.map(({ label, icon }) => (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, fontWeight: 'bold' }}>
                <Box sx={{ display: 'flex', mr: 2 }}>{icon}</Box> {label}
              </Box>
            ))}
          </Box>
          <Box sx={{ ml: 16 }}>
            {contentItems.map(({ content }) => (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, fontWeight: 'bold' }}>{content}</Box>
            ))}
          </Box>
        </Box>
        <Box
          sx={{
            borderBottom: '2px solid white',
            mt: 2,
            mb: 2,
            width: 'calc(100% - 40px)'
          }}
        />
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <Box sx={{ mt: -3 }}>
            <ReimbursementRequestTimeline
              reimbursementRequestId={reimbursementRequest.reimbursementRequestId}
              reimbursementRequestComments={reimbursementRequest.comments}
            />
          </Box>
          <Box sx={{ mt: 2, ml: 2, whiteSpace: 'nowrap' }}>
            <ReimbursementProductsView reimbursementRequest={reimbursementRequest} />
            <Box sx={{ mt: 2 }}>
              <ReceiptsView />
            </Box>
          </Box>
        </Box>
      </PageLayout>
    </Box>
  );
};

export default ReimbursementRequestDetailsView;
