import React, { useEffect, useState } from 'react';
import { PartPreview } from 'shared';
import { grey } from '@mui/material/colors';
import { Card, CardContent, Typography, Box, Chip, Link } from '@mui/material';
import { useGetImageUrl } from '../../../../../hooks/onboarding.hook';
import { Link as RouterLink } from 'react-router-dom';
import DownloadButton from '../../../../../components/DownloadButton';
import { formatPartStatus, getStatusColor } from '../../../../../utils/part.utils';
import { Document, Page, pdfjs } from 'react-pdf';
import { useDownloadFile } from '../../../../../hooks/part-review.hooks';

interface PartPreviewCardProps {
  partPreview: PartPreview;
  projectName: string;
  redirectUrl: string;
}

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

export function PartPreviewCard({ partPreview, projectName, redirectUrl }: PartPreviewCardProps) {
  const { commonName, index, previewImageId, status, assignees, reviewRequests } = partPreview;
  const { data: previewUrl } = useGetImageUrl(previewImageId ?? null);
  const { data: pdf } = useDownloadFile(previewImageId ?? '');
  const [pdfLoadError, setPdfLoadError] = useState(false);

  useEffect(() => {
    return () => {
      // Clean up worker when component unmounts
      if (pdfjs.GlobalWorkerOptions.workerPort) {
        pdfjs.GlobalWorkerOptions.workerPort.terminate();
      }
    };
  }, []);

  return (
    <Link component={RouterLink} to={redirectUrl} sx={{ textDecoration: 'none', color: 'inherit' }}>
      <Card
        sx={{
          maxWidth: '30vw',
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
          {previewImageId && (previewUrl || pdf?.type === 'application/pdf') ? (
            <Box
              sx={{
                height: '15vw',
                border: '0.5px solid rgb(193, 193, 193)',
                bgcolor: grey[600],
                overflow: 'hidden'
              }}
            >
              {pdf && !pdfLoadError ? (
                <Document
                  file={pdf}
                  onLoadError={() => {
                    setPdfLoadError(true);
                  }}
                >
                  <Page
                    pageNumber={1}
                    width={300}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    onLoadSuccess={() => {
                      setPdfLoadError(false);
                    }}
                  />
                </Document>
              ) : (
                <Box
                  component="img"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                  alt={`${commonName} Preview`}
                  src={previewUrl}
                />
              )}
            </Box>
          ) : (
            <Box
              sx={{
                height: '15vw',
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
              label={formatPartStatus(status)}
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
