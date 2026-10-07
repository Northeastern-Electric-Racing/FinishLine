import { Box, Typography } from '@mui/material';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useNewMemberFaqs } from '../../../hooks/recruitment.hooks';
import ErrorPage from '../../ErrorPage';
import Dropdown from './Dropdown';
import React from 'react';

const NewMemberFAQsSection = () => {
  const { isLoading, isError, error, data: faqs } = useNewMemberFaqs();

  if (isError) return <ErrorPage message={error.message} />;

  if (isLoading || !faqs) return <LoadingIndicator />;

  if (faqs.length === 0) {
    return (
      <Box sx={{ width: '100%' }}>
        <Typography sx={{ color: 'text.secondary' }}>No FAQs yet — check back soon.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {faqs.map((faq) => (
        <Dropdown key={faq.faqId} title={faq.question} description={faq.answer} />
      ))}
    </Box>
  );
};

export default NewMemberFAQsSection;
