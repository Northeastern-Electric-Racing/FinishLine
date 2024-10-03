import { Box } from '@mui/system';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useAllFaqs } from '../../../hooks/recruitment.hooks';
import ErrorPage from '../../ErrorPage';
import Dropdown from './Dropdown';
import React from 'react';

const FAQsSection = () => {
  const { isLoading, isError, error, data: faqs } = useAllFaqs();
  if (isLoading || !faqs) return <LoadingIndicator />;

  if (isError) return <ErrorPage message={error.message} />;

  return (
    <Box sx={{ width: '100%' }}>
      {faqs.map((faq) => (
        <Dropdown title={faq.question} description={faq.answer} />
      ))}
    </Box>
  );
};

export default FAQsSection;
