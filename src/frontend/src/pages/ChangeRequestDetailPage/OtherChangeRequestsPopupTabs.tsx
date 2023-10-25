import React, { useState } from 'react';
import { Box, useTheme, Collapse, Tabs, Tab, Typography } from '@mui/material';
import { ChangeRequest } from 'shared';
import ChangeRequestDetailCard from '../../components/ChangeRequestDetailCard';
import { useAllChangeRequests } from '../../hooks/change-requests.hooks';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';

interface OtherChangeRequestsPopupTabsProps {
  changeRequest: ChangeRequest;
}
const OtherChangeRequestsPopupTabs: React.FC<OtherChangeRequestsPopupTabsProps> = ({
  changeRequest
}: OtherChangeRequestsPopupTabsProps) => {
  const theme = useTheme();
  const [tab, setTab] = useState(0);
  const { data: changeRequests, isError, isLoading, error } = useAllChangeRequests();

  if (isLoading) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} message={error.message} />;

  // the CRs submitted or reviewed by the submitter of this CR
  const crFromSameUser = changeRequests?.filter(
    (cr) =>
      (cr.submitter.userId === changeRequest.submitter.userId || cr.reviewer?.userId === changeRequest.submitter.userId) &&
      cr.crId !== changeRequest.crId
  );

  const displayCRCards = (crList: ChangeRequest[]) => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-start',
        padding: '20px',
        background: theme.palette.background.paper,
        borderTop: 'solid black',
        minWidth: '100vw'
      }}
    >
      {crList.map((cr: ChangeRequest) => (
        <ChangeRequestDetailCard changeRequest={cr}></ChangeRequestDetailCard>
      ))}
    </Box>
  );

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: '0px',
        left: '65px'
      }}
    >
      <Tabs
        value={tab}
        onChange={(e, newValue: number) => setTab(newValue)}
        sx={{
          '.MuiTabs-indicator': {
            background: 'transparent'
          },
          '& button': {
            background: theme.palette.background.paper,
            borderRight: 'solid grey',
            borderTop: 'solid grey',
            color: theme.palette.text.primary,
            textTransform: 'none'
          },
          '& button.Mui-selected': {
            color: theme.palette.text.primary
          }
        }}
      >
        <Tab
          value={1}
          label={
            <Typography sx={{ display: 'flex' }}>
              Other CR's from {changeRequest.submitter.firstName} {changeRequest.submitter.lastName}
              {tab === 1 ? <ExpandMore sx={{ paddingLeft: 0.5 }} /> : <ExpandLess sx={{ paddingLeft: 0.5 }} />}
            </Typography>
          }
          onClick={() => {
            tab === 1 && setTab(0);
          }}
        />
        <Tab
          value={2}
          label={
            <Typography sx={{ display: 'flex' }}>
              Placeholder
              {tab === 2 ? <ExpandMore sx={{ paddingLeft: 0.5 }} /> : <ExpandLess sx={{ paddingLeft: 0.5 }} />}
            </Typography>
          }
          onClick={() => {
            tab === 2 && setTab(0);
          }}
        />
      </Tabs>
      <Collapse in={tab !== 0}>
        {tab === 1 && displayCRCards(crFromSameUser || [])}
        {tab === 2 && displayCRCards(changeRequests || [])}
      </Collapse>
    </Box>
  );
};

export default OtherChangeRequestsPopupTabs;
