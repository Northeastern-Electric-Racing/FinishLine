import React from 'react';
import { Review_Status, PartPreview } from 'shared';
import { yellow, blue, purple, green, grey } from '@mui/material/colors';
import DownloadIcon from '@mui/icons-material/Download';
import { Card, CardContent, CardMedia, Typography, Button, Box, Chip } from '@mui/material';

// fills status pill with color based on review status
function getStatusColor(status: Review_Status) {
  switch (status) {
    case Review_Status.IN_PROGRESS:
      return yellow[700];
    case Review_Status.READY_FOR_REVIEW:
      return blue[600];
    case Review_Status.IN_REVIEW:
      return purple[600];
    case Review_Status.REVIEWED:
      return green[600];
    case Review_Status.APPROVED:
      return green[800];
    default:
      return grey[600];
  }
}

// converts statuses from ALL CAPS to Title Case
function formatStatus(status: Review_Status): string {
  return status
    .toLowerCase()
    .split('_')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

interface PartPreviewCardProps {
  partPreview: PartPreview;
}

export function PartPreviewCard({ partPreview }: PartPreviewCardProps) {
  const { commonName, previewImageId, status, assignees, reviewRequests } = partPreview;
  return (
    <Card
      sx={{
        maxWidth: 400,
        border: '1px solid white',
        borderRadius: '8px',
        bgcolor: grey[800],
        overflow: 'hidden'
      }}
    >
      <Box sx={{ px: 2, pt: 2, bgcolor: grey[800] }}>
        {previewImageId ? (
          <CardMedia
            component="img"
            height="200"
            image={`/api/files/${previewImageId}`}
            alt="Part Preview"
            sx={{
              border: '1px solid white'
            }}
          />
        ) : (
          <Box
            sx={{
              height: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid white'
            }}
          >
            <Typography variant="body2" sx={{ color: grey[400] }}>
              No Preview Available
            </Typography>
          </Box>
        )}
      </Box>
      <CardContent sx={{ bgcolor: grey[800], color: 'white', px: 2, py: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {commonName}
          </Typography>
          <Chip
            label={formatStatus(status)}
            size="small"
            sx={{
              bgcolor: getStatusColor(status),
              color: 'white',
              borderRadius: '16px',
              fontWeight: 500,
              px: 1,
              py: 0.5
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="body2" sx={{ color: grey[300] }}>
              <strong>Assignees:</strong>{' '}
              {assignees && assignees.length
                ? assignees.map((a) => `${a.firstName} ${a.lastName}`).join(', ')
                : 'None assigned'}
            </Typography>
            <Typography variant="body2" sx={{ color: grey[300] }}>
              <strong>Reviewers:</strong>{' '}
              {reviewRequests && reviewRequests.length
                ? reviewRequests.map((r) => `${r.reviewerRequested.firstName} ${r.reviewerRequested.lastName}`).join(', ')
                : 'No reviewers'}
            </Typography>
          </Box>

          <Button
            size="small"
            startIcon={<DownloadIcon />}
            sx={{
              minWidth: 0,
              width: 32,
              height: 32,
              p: 0,
              borderRadius: '50%',
              bgcolor: grey[900],
              color: 'white',
              '&:hover': {
                bgcolor: grey[800]
              },
              '& .MuiButton-startIcon': {
                margin: 0
              }
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
