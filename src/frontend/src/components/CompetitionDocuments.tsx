/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
// import Button from '@mui/material/Button';
import { CompetitionDocumentsSummary } from 'shared';

interface CompetitionDocumentsSummaryProps {
  competitionDocumentsSummary: CompetitionDocumentsSummary;
}

interface StatBlockProps {
  value: string;
  label: string;
}

const StatBlock: React.FC<StatBlockProps> = ({ value, label }) => (
  <Box textAlign="center">
    <Typography variant="h5" fontWeight="bold">
      {value}
    </Typography>
    <Typography variant="body2" fontWeight="bold">
      {label}
    </Typography>
  </Box>
);

const CompetitionDocumentsSummarySection: React.FC<CompetitionDocumentsSummaryProps> = ({
  competitionDocumentsSummary
}) => {
  const submittedOnTime = competitionDocumentsSummary.submittedOnTimeCount ?? 0;
  const firstSubmissionRejected = competitionDocumentsSummary.firstSubmissionRejectedCount ?? 0;

  return (
    <Card sx={{ borderRadius: 5, backgroundColor: '#1e1e1e', color: 'white', p: 2, width: 500 }}>
      <CardContent>
        <Typography variant="h4" fontWeight="bold" textAlign="center" mb={3}>
          Competition Documents
        </Typography>

        <Box display="flex" justifyContent="center" gap={6} mb={3}>
          <StatBlock value={`${submittedOnTime}`} label="Submitted On Time" />
          <StatBlock value={`${firstSubmissionRejected}`} label="First Submission Rejected" />
        </Box>

        {/* <Box display="flex" justifyContent="center">
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#ef4345',
              borderRadius: 5,
              textTransform: 'none',
              fontWeight: 'bold',
              '&:hover': { backgroundColor: '#d63a3c' }
            }}
          >
            View More
          </Button>
        </Box> */}
      </CardContent>
    </Card>
  );
};

export default CompetitionDocumentsSummarySection;