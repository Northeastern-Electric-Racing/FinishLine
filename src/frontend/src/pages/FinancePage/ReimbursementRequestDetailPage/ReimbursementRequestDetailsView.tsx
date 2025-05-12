/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { accountCodePipe, datePipe, dateUndefinedPipe, displayEnum } from '../../../utils/pipes';
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

import { Typography, useTheme, Link, IconButton, Grid } from '@mui/material';
import { Box } from '@mui/system';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { ReimbursementRequest, isAdmin, isHead } from 'shared';
import ActionsMenu, { ButtonInfo } from '../../../components/ActionsMenu';
import NERModal from '../../../components/NERModal';
import PageLayout from '../../../components/PageLayout';
import {
  useDeleteReimbursementRequest,
  useDenyReimbursementRequest,
  useLeadershipApproveReimbursementRequest,
  useMarkPendingFinance,
  useMarkReimbursementRequestAsReimbursed,
  useRequestReimbursementRequestChanges
} from '../../../hooks/finance.hooks';
import { useToast } from '../../../hooks/toasts.hooks';
import { useCurrentUser } from '../../../hooks/users.hooks';
import { centsToDollar, codeAndRefundSourceName, fullNamePipe, undefinedPipe } from '../../../utils/pipes';
import {
  imageDownloadUrl,
  imageFileUrl,
  isReimbursementRequestAdvisorApproved,
  isReimbursementRequestReimbursed,
  isReimbursementRequestSaboSubmitted,
  isReimbursementRequestDenied,
  isReimbursementRequestLeadershipApproved,
  isReimbursementRequestPendingFinance,
  getUniqueWbsElementsWithProductsFromReimbursementRequest
} from '../../../utils/reimbursement-request.utils';
import { routes } from '../../../utils/routes';
import AddSABONumberModal from './AddSABONumberModal';
import ReimbursementProductsView from './ReimbursementProductsView';
import SubmitToSaboModal from './SubmitToSaboModal';
import DownloadIcon from '@mui/icons-material/Download';
import CheckList from '../../../components/CheckList';
import MarkDeliveredModal from './MarkDeliveredModal';
import ReimbursementRequestTimeline from '../FinanceComponents/ReimbursementRequestTimeline';
import VerticalDetailDisplay from '../../../components/VerticalDetailDisplay';
import ReimbursementRequestStatusPill from '../../../components/ReimbursementRequestStatusPill';

interface ReimbursementRequestDetailsViewProps {
  reimbursementRequest: ReimbursementRequest;
}

const ReimbursementRequestDetailsView: React.FC<ReimbursementRequestDetailsViewProps> = ({ reimbursementRequest }) => {
  const theme = useTheme();
  const totalCostBackgroundColor = theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200];
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
  const isLeadershipApproved = isReimbursementRequestLeadershipApproved(reimbursementRequest);
  const isPendingFinance = isReimbursementRequestPendingFinance(reimbursementRequest);

  const handleDelete = async () => {
    try {
      await deleteReimbursementRequest();
      history.push(routes.FINANCE);
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
            detail:
              'I certify my receipts with expenses greater than $75 include an itemixed description of goods or service purchased.',
            id: '1'
          },
          {
            resolved: false,
            detail: `I certify my receipts include the vendor's name (for ex. Amazon, stop and shop, Target).`,
            id: '2'
          },
          {
            resolved: false,
            detail: `I certify my receipts includes a Transaction Date for each expense.`,
            id: '3'
          },
          {
            resolved: false,
            detail: `I certify my receipts include the amount paid for each expense.`,
            id: '4'
          },
          {
            resolved: false,
            detail: `I certify my receipts include the form of payment for each expense (Cash, check or last four digits of credit card).`,
            id: '5'
          },
          {
            resolved: false,
            detail: `This reimbursement request is "NOT" for a faculty or full-time staff member.`,
            id: '6'
          },
          {
            resolved: false,
            detail: `The reimbursement does not include sales tax unless it is for a prepared meal or hotel.`,
            id: '7'
          }
        ]}
        isDisabled={false}
        checkDescriptionBullets={false}
      />

      <Typography>Are you sure you want to mark this reimbursement request as pending finance?</Typography>
    </NERModal>
  );

  const BasicInformationView = () => {
    return (
      <>
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: '5px' }}>
          <Typography variant="h5">Details</Typography>
          <Typography variant="h5" fontSize={24}>{`${
            reimbursementRequest.dateOfExpense ? datePipe(new Date(reimbursementRequest.dateOfExpense)) : '-'
          }`}</Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item sm={6} xs={12}>
            <VerticalDetailDisplay label="Purchased From" content={reimbursementRequest.vendor.name} />
          </Grid>
          <Grid item sm={6} xs={12}>
            <VerticalDetailDisplay label="SABO Number" content={`${undefinedPipe(reimbursementRequest.saboId)}`} />
          </Grid>
          <Grid item sm={6} xs={12}>
            <VerticalDetailDisplay label="Refund Source" content={codeAndRefundSourceName(reimbursementRequest.indexCode)} />
          </Grid>
          <Grid item sm={6} xs={12}>
            <VerticalDetailDisplay label="Expense Type" content={accountCodePipe(reimbursementRequest.accountCode)} />
          </Grid>
          <Grid item sm={6} xs={12}>
            <VerticalDetailDisplay
              label="Date Item Delivered"
              content={dateUndefinedPipe(reimbursementRequest.dateDelivered)}
            />
          </Grid>
          <Grid
            item
            xs={12}
            container
            mt={2}
            ml={2}
            sx={{ backgroundColor: totalCostBackgroundColor, borderRadius: '10px', boxShadow: 1 }}
          >
            <Grid item xs={6} textAlign={'center'} mt={-2}>
              <Typography fontSize={50}>Total Cost</Typography>
            </Grid>
            <Grid xs={6} mt={-2} sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography fontSize={50}>{`$${centsToDollar(reimbursementRequest.totalCost)}`}</Typography>
            </Grid>
          </Grid>
        </Grid>
        <ReimbursementRequestTimeline
          reimbursementRequestId={reimbursementRequest.reimbursementRequestId}
          reimbursementRequestComments={reimbursementRequest.comments}
        />
      </>
    );
  };

  const ReceiptsView = () => {
    return (
      <Box sx={{ maxHeight: `250px`, overflow: reimbursementRequest.receiptPictures.length > 0 ? 'auto' : 'none' }}>
        <Box sx={{ position: 'sticky', top: 0, background: theme.palette.background.default, pb: 1, zIndex: 1 }}>
          <Typography variant="h5">Receipts</Typography>
        </Box>
        {reimbursementRequest.receiptPictures.map((receipt) => {
          return (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link href={imageFileUrl(receipt.googleFileId)} target="_blank" underline="hover" sx={{ mr: 1, fontSize: 30 }}>
                {receipt.name}
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

  const buttons: ButtonInfo[] = [
    {
      title: 'Edit',
      onClick: () => history.push(`${routes.REIMBURSEMENT_REQUESTS}/${reimbursementRequest.reimbursementRequestId}/edit`),
      icon: <Edit />,
      disabled: !allowEdit && !user.isFinance
    },
    {
      title: 'Delete',
      onClick: () => setShowDeleteModal(true),
      icon: <DeleteIcon />,
      disabled: !allowEdit
    },
    {
      title: 'Mark Delivered',
      onClick: () => setShowMarkDelivered(true),
      icon: <LocalShippingIcon />,
      disabled: !!reimbursementRequest.dateDelivered || user.userId !== reimbursementRequest.recipient.userId
    },
    {
      title: 'Add SABO #',
      onClick: () => setAddSaboNumberModalShow(true),
      icon: <ConfirmationNumberIcon />,
      disabled: !user.isFinance
    },
    {
      title: 'Mark Reimbursed',
      onClick: () => setShowMarkReimbursed(true),
      icon: <AttachMoneyIcon />,
      disabled:
        !user.isFinance ||
        !isReimbursementRequestSaboSubmitted(reimbursementRequest) ||
        isReimbursementRequestReimbursed(reimbursementRequest) ||
        isReimbursementRequestDenied(reimbursementRequest)
    },
    {
      title: isSaboSubmitted ? 'SABO Info' : 'Submit to SABO',
      onClick: () => setShowSubmitToSaboModal(true),
      icon: isSaboSubmitted ? <Assignment /> : <CheckIcon />,
      disabled: !user.isFinance || !isPendingFinance
    },
    {
      title: 'Leadership Approve',
      onClick: () => setShowLeadershipApproveModal(true),
      icon: <CheckIcon />,
      disabled:
        !isHead(user.role) ||
        isReimbursementRequestDenied(reimbursementRequest) ||
        isReimbursementRequestReimbursed(reimbursementRequest) ||
        isLeadershipApproved ||
        isPendingFinance
    },
    {
      title: 'Mark Pending Finance',
      onClick: () => setShowMarkPendingFinanceModal(true),
      icon: <Pending />,
      disabled:
        isPendingFinance ||
        !isLeadershipApproved ||
        (!isAdmin(user.role) && user.userId !== reimbursementRequest.recipient.userId)
    },
    {
      title: 'Request Changes',
      onClick: () => setShowRequestChangesModal(true),
      icon: <ChangeCircle />,
      disabled:
        !user.isFinance ||
        isReimbursementRequestReimbursed(reimbursementRequest) ||
        isReimbursementRequestDenied(reimbursementRequest)
    },
    {
      title: 'Deny',
      onClick: () => setShowDenyModal(true),
      icon: <CloseIcon />,
      disabled:
        (!isAdmin(user.role) && !user.isFinance && user.userId !== reimbursementRequest.recipient.userId) ||
        isReimbursementRequestReimbursed(reimbursementRequest) ||
        isReimbursementRequestDenied(reimbursementRequest)
    }
  ];

  const sortedStatus = reimbursementRequest.reimbursementStatuses.sort((a) => a.dateCreated.getDate());
  const statusTypes = sortedStatus.map((status) => status.type);
  const recentStatus = statusTypes[statusTypes.length - 1];

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'REIMBURSED':
        return '#549d49';
      case 'DENIED':
        return '#dd514c';
      case 'PENDING_FINANCE':
      case 'SABO_SUBMITTED':
      case 'PENDING_LEADERSHIP_APPROVAL':
      case 'LEADERSHIP_APPROVED':
      case 'ADVISOR_APPROVED':
        return '#997b3e';
      default:
        return '#797a7a';
    }
  };

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
          {statusTypes.length > 0 && <ReimbursementRequestStatusPill status={recentStatus} />}
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
        <AddSABONumberModal
          modalShow={addSaboNumberModalShow}
          onHide={() => setAddSaboNumberModalShow(false)}
          reimbursementRequestId={reimbursementRequest.reimbursementRequestId}
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
        <ReimbursementProductsView reimbursementRequest={reimbursementRequest} />
        <Box sx={{ mt: 2 }}>
          <ReceiptsView />
        </Box>
        <Box sx={{ mt: 2 }}>{BasicInformationView}</Box>
      </PageLayout>
    </Box>
  );
};

export default ReimbursementRequestDetailsView;
