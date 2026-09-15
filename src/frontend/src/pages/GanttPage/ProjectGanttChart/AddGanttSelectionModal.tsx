import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  useTheme
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import TaskIcon from '@mui/icons-material/Task';

interface AddGanttSelectionModalProps {
  showModal: boolean;
  handleClose: () => void;
  onWorkPackageSelected: () => void;
  onTaskSelected: () => void;
  projectName: string;
}

const AddGanttSelectionModal: React.FC<AddGanttSelectionModalProps> = ({
  showModal,
  handleClose,
  onWorkPackageSelected,
  onTaskSelected,
  projectName
}) => {
  const theme = useTheme();

  const handleWorkPackageClick = () => {
    onWorkPackageSelected();
    handleClose();
  };

  const handleTaskClick = () => {
    onTaskSelected();
    handleClose();
  };

  return (
    <Dialog
      open={showModal}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          padding: 2
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Typography variant="h5" component="div" fontWeight="bold">
          Add to {projectName}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Choose what you'd like to create
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          {/* Work Package Option */}
          <Card
            sx={{
              flex: 1,
              mt: 1,
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[4],
                borderColor: theme.palette.primary.main,
                '& .MuiCardActionArea-root': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              },
              border: `2px solid ${theme.palette.divider}`,
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <CardActionArea
              onClick={handleWorkPackageClick}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                alignItems: 'stretch'
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 0 }}>
                <WorkIcon
                  sx={{
                    fontSize: 48,
                    color: theme.palette.primary.main,
                    mb: 2
                  }}
                />
                <Typography variant="h6" component="div" fontWeight="bold" gutterBottom>
                  Work Package
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  A collection of related work items with specific deliverables and timeline
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>

          {/* Task Option */}
          <Card
            sx={{
              flex: 1,
              mt: 1,
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[4],
                borderColor: theme.palette.secondary.main,
                '& .MuiCardActionArea-root': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              },
              border: `2px solid ${theme.palette.divider}`,
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <CardActionArea
              onClick={handleTaskClick}
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                alignItems: 'stretch'
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 0 }}>
                <TaskIcon
                  sx={{
                    fontSize: 48,
                    color: theme.palette.secondary.main,
                    mb: 2
                  }}
                />
                <Typography variant="h6" component="div" fontWeight="bold" gutterBottom>
                  Task
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  A single action item assigned to team members with a due date
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Box>

        {/* Cancel Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button variant="outlined" onClick={handleClose} sx={{ minWidth: 120 }}>
            Cancel
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AddGanttSelectionModal;
