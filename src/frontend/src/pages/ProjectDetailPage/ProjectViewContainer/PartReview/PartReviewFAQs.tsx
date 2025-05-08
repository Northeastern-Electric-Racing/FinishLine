import { Accordion, AccordionSummary, AccordionDetails, Typography, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAllPartReviewFaqs } from '../../../../hooks/part-review.hooks';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import ErrorPage from '../../../ErrorPage';

const PartReviewFAQs: React.FC = () => {
  const { data: faqs, isLoading, error } = useAllPartReviewFaqs();

  if (isLoading || !faqs) {
    return <LoadingIndicator />;
  }

  if (error) {
    return <ErrorPage message="Error loading part review FAQs." error={error} />;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
        FAQs
      </Typography>
      <Box sx={{ padding: 0 }}>
        {faqs.map((faq) => (
          <Accordion
            key={faq.faqId}
            sx={{
              borderRadius: 2,
              marginBottom: 1,
              boxShadow: 1,
              overflow: 'hidden',
              '&:before': {
                display: 'none'
              },
              backgroundColor: '#333333'
            }}
            disableGutters
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                flexDirection: 'row-reverse',
                '& .MuiAccordionSummary-content': {
                  marginLeft: 1
                }
              }}
            >
              <Typography variant="body1">{faq.question}</Typography>
            </AccordionSummary>

            <AccordionDetails
              sx={{
                paddingLeft: 8,
                paddingBottom: 1.5,
                marginTop: -2
              }}
            >
              <Typography variant="body1">{faq.answer}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
};

export default PartReviewFAQs;
