import React from 'react';
import { Review_Status, PartPreview } from 'shared';
import { yellow, blue, purple, green, grey } from '@mui/material/colors';
import { Card, CardContent, Typography, Box, Chip, Link } from '@mui/material';
import { useGetImageUrl } from '../../../../../hooks/onboarding.hook';
import { Link as RouterLink } from 'react-router-dom';
import DownloadButton from '../../../../../components/DownloadButton';

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
  projectName: string;
  redirectUrl: string;
}

export function PartPreviewCard({ partPreview, projectName, redirectUrl }: PartPreviewCardProps) {
  const { commonName, index, previewImageId, status, assignees, reviewRequests } = partPreview;
  const { data: previewUrl } = useGetImageUrl(previewImageId ?? null);

  return (
    <Link component={RouterLink} to={redirectUrl} sx={{ textDecoration: 'none', color: 'inherit' }}>
      <Card
        sx={{
          maxWidth: 400,
          border: '0.5px solid rgb(193, 193, 193)',
          borderRadius: '8px',
          bgcolor: grey[800],
          overflow: 'hidden',
          cursor: redirectUrl ? 'pointer' : 'default',
          '&:hover': redirectUrl
            ? {
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                transform: 'translateY(-2px)',
                transition: 'all 0.2s ease-in-out'
              }
            : {}
        }}
      >
        <Box sx={{ px: 2, pt: 2, bgcolor: grey[800] }}>
          {previewImageId && previewUrl ? (
            <Box
              sx={{
                height: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '0.5px solid rgb(193, 193, 193)',
                bgcolor: grey[600]
              }}
            >
              <Box
                component="img"
                sx={{ display: 'block', maxWidth: '200px', mb: 1 }}
                alt={`${commonName} Preview`}
                src={previewUrl}
              />
            </Box>
          ) : (
            <Box
              sx={{
                height: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '0.5px solid rgb(193, 193, 193)',
                bgcolor: grey[600]
              }}
            />
          )}
        </Box>
        <CardContent sx={{ bgcolor: grey[800], color: 'white', px: 2, py: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {`${projectName}_${commonName}_${index.toString().padStart(5, '0')}`}
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
            {previewImageId && (
              <DownloadButton fileId={previewImageId} filename={`${commonName}.png`} stopPropagation={true} />
            )}
          </Box>
        </CardContent>
      </Card>
    </Link>
  );
}
