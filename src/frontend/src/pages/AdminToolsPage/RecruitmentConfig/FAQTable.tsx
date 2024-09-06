import React, { useState } from 'react';
import { TableRow, TableCell, Box, Table as MuiTable, TableHead, TableBody, Typography, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { FrequentlyAskedQuestion } from 'shared/src/types/frequently-asked-questions-types';
import { NERButton } from '../../../components/NERButton';
import { useAllFaqs, useDeleteFAQ } from '../../../hooks/recruitment.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useHistoryState } from '../../../hooks/misc.hooks';
import ErrorPage from '../../ErrorPage';
import CreateFaqFormModal from './CreateFaqFormModal';
import EditFaqFormModal from './EditFaqFormModal';
import NERDeleteModal from '../../../components/NERDeleteModal';
import { useToast } from '../../../hooks/toasts.hooks';

const FAQsTable = () => {
  const [createModalShow, setCreateModalShow] = useHistoryState<boolean>('', false);
  const [faqEditing, setFaqEditing] = useHistoryState<FrequentlyAskedQuestion | undefined>('', undefined);
  const [faqToDelete, setFaqToDelete] = useState<FrequentlyAskedQuestion | undefined>(undefined);
  const { mutateAsync: deleteFaq } = useDeleteFAQ();
  const toast = useToast();

  const { isLoading: faqsIsLoading, isError: faqsIsError, error: faqsError, data: faqs } = useAllFaqs();
  const handleDelete = (id: string) => {
    setFaqToDelete(undefined);
    try {
      deleteFaq(id);
      toast.success('Faq deleted successfully');
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 3000);
      }
    }
  };

  if (!faqs || faqsIsLoading) return <LoadingIndicator />;
  if (faqsIsError) return <ErrorPage message={faqsError.message} />;

  const FAQsRows = faqs.map((faq: FrequentlyAskedQuestion, index: number) => (
    <TableRow key={faq.faqId}>
      <TableCell
        align="left"
        sx={{
          borderRight: '1px solid',
          borderBottom: index === faqs.length - 1 ? 'none' : '1px solid',
          alignItems: 'center'
        }}
      >
        <Typography>{faq.question}</Typography>
      </TableCell>
      <TableCell
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: index === faqs.length - 1 ? 'none' : '1px solid',
          minHeight: '50px'
        }}
      >
        <Typography sx={{ maxWidth: 300 }}>{faq.answer}</Typography>
        <Box sx={{ display: 'flex' }}>
          <Button sx={{ p: 0.5, color: 'white' }} onClick={() => setFaqEditing(faq)}>
            <EditIcon />
          </Button>
          <Button
            sx={{ p: 0.5, color: 'white' }}
            onClick={() => {
              setFaqToDelete(faq);
            }}
          >
            <DeleteIcon />
          </Button>
        </Box>
      </TableCell>
    </TableRow>
  ));

  return (
    <Box>
      <CreateFaqFormModal open={createModalShow} handleClose={() => setCreateModalShow(false)} />
      {faqEditing && <EditFaqFormModal open={!!faqEditing} handleClose={() => setFaqEditing(undefined)} faq={faqEditing} />}

      <MuiTable>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                fontWeight: 'bold',
                fontSize: '1em',
                backgroundColor: '#ef4345',
                color: 'white',
                borderRadius: '10px 0px 0px 0px'
              }}
            >
              Question
            </TableCell>
            <TableCell
              sx={{
                fontWeight: 'bold',
                fontSize: '1em',
                backgroundColor: '#ef4345',
                color: 'white',
                borderRadius: '0px 10px 0px 0px'
              }}
            >
              Answer
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{FAQsRows}</TableBody>
      </MuiTable>
      <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '20px' }}>
        <NERButton
          variant="contained"
          onClick={() => {
            setCreateModalShow(true);
          }}
        >
          Add FAQ
        </NERButton>
      </Box>
      <NERDeleteModal
        open={!!faqToDelete}
        onHide={() => setFaqToDelete(undefined)}
        formId="delete-item-form"
        dataType="FAQ"
        title="Warning"
        onFormSubmit={() => {
          if (faqToDelete) {
            handleDelete(faqToDelete.faqId);
          }
        }}
      />
    </Box>
  );
};

export default FAQsTable;
