/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import React, { useState } from 'react';
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import { Dashboard } from 'shared';
import NERFormModal from '../../components/NERFormModal';
import NERDeleteModal from '../../components/NERDeleteModal';
import { useToast } from '../../hooks/toasts.hooks';
import { datePipe } from '../../utils/pipes';
import { useDeleteDashboard, useEditDashboard } from '../../hooks/dashboards.hooks';

interface DashboardCardProps {
  dashboard: Dashboard;
  /** The relative path (pathname + query string) the "save" action stores into this dashboard. */
  currentLink: string;
  /** Whether this dashboard's saved view matches the current view. */
  selected: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ dashboard, currentLink, selected }) => {
  const history = useHistory();
  const toast = useToast();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { mutateAsync: editMutateAsync } = useEditDashboard(dashboard.dashboardId);
  const { mutateAsync: deleteMutateAsync } = useDeleteDashboard(dashboard.dashboardId);

  const { handleSubmit: handleSaveSubmit, reset: resetSaveForm } = useForm({ mode: 'onChange' });

  const onSave = async () => {
    try {
      await editMutateAsync({ link: currentLink });
      setShowSaveModal(false);
    } catch (error: unknown) {
      if (error instanceof Error) toast.error(error.message);
    }
  };

  const onDelete = async () => {
    try {
      await deleteMutateAsync();
      setShowDeleteModal(false);
    } catch (error: unknown) {
      if (error instanceof Error) toast.error(error.message);
    }
  };

  return (
    <>
      <Box
        onClick={() => history.push(dashboard.link)}
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          minWidth: 200,
          px: 1.5,
          py: 0.75,
          cursor: 'pointer',
          borderRadius: 2,
          border: selected ? '3px solid' : '1px solid',
          borderColor: selected ? 'common.white' : 'error.main',
          transform: selected ? 'scale(1.04)' : 'none',
          transition: 'transform 0.15s ease, border-color 0.15s ease, border-width 0.15s ease'
        }}
      >
        {selected && (
          <Tooltip title="Clear dashboard">
            <IconButton
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                // navigate to the page with no filters, deselecting this dashboard
                history.push(currentLink.split('?')[0]);
              }}
              sx={{
                position: 'absolute',
                top: -8,
                right: -8,
                zIndex: 1,
                padding: '1px',
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'common.white',
                color: 'common.white',
                '&:hover': { backgroundColor: 'background.paper' }
              }}
            >
              <CloseIcon sx={{ fontSize: 13 }} />
            </IconButton>
          </Tooltip>
        )}
        <Box sx={{ overflow: 'hidden' }}>
          <Typography variant="body2" fontWeight="bold" noWrap>
            {dashboard.name}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            {datePipe(dashboard.dateCreated)}
          </Typography>
        </Box>
        <Stack direction="row">
          <Tooltip title="Save current filters">
            <IconButton
              size="small"
              sx={{ color: 'inherit' }}
              onClick={(event) => {
                event.stopPropagation();
                setShowSaveModal(true);
              }}
            >
              <SaveIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete dashboard">
            <IconButton
              size="small"
              sx={{ color: 'inherit' }}
              onClick={(event) => {
                event.stopPropagation();
                setShowDeleteModal(true);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      <NERFormModal
        open={showSaveModal}
        onHide={() => setShowSaveModal(false)}
        title={`Save filters to "${dashboard.name}"`}
        reset={resetSaveForm}
        handleUseFormSubmit={handleSaveSubmit}
        onFormSubmit={onSave}
        formId="save-dashboard-form"
        submitText="Save"
        showCloseButton
      >
        <Typography>
          Overwrite the saved filters of <b>{dashboard.name}</b> with your current view?
        </Typography>
      </NERFormModal>

      <NERDeleteModal
        open={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        dataType="Dashboard"
        onFormSubmit={onDelete}
      />
    </>
  );
};

export default DashboardCard;
