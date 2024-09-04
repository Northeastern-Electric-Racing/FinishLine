import React, { useState } from 'react';
import { TableRow, TableCell, Box, Table as MuiTable, TableHead, TableBody, Typography, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { FrequentlyAskedQuestion } from 'shared/src/types/frequently-asked-questions-types';
import { exampleAppAdminUser } from '../../../tests/test-support/test-data/users.stub';
import { NERButton } from '../../../components/NERButton';
import { useHistoryState } from '../../../hooks/misc.hooks';
import NERDeleteModal from '../../../components/NERDeleteModal';
import { useDeleteFAQ } from '../../../hooks/recruitment.hooks';
import { useToast } from '../../../hooks/toasts.hooks';

const FAQsTable = () => {
  // State to manage the deletion modal and the selected FAQ
  const [deleteModalShow, setDeleteModalShow] = useHistoryState<boolean>('', false);
  const [faqToDelete, setFaqToDelete] = useState<FrequentlyAskedQuestion | undefined>(undefined);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { mutateAsync: deleteFaq } = useDeleteFAQ();
  const toast = useToast();


  const handleDelete = (id: string) => {
    try {
      deleteFaq(id);
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 3000);
      }
    }
  };

  // Placeholder data until endpoints are completed
  const faqs: FrequentlyAskedQuestion[] = [
    {
      faqId: '1',
      userCreated: exampleAppAdminUser,
      dateCreated: new Date(),
      question: 'Test question 1?',
      answer: '1'
    },
    {
      question: 'Test question 2?',
      answer: '2',
      userCreated: exampleAppAdminUser,
      dateCreated: new Date(),
      faqId: '2'
    }
  ];

  // Map over the FAQs and create rows
  const FAQsRows = faqs.map((faq: FrequentlyAskedQuestion, index: number) => (
    <TableRow key={faq.faqId}>
      <TableCell
        align="left"
        sx={{
          borderRight: '1px solid',
          borderBottom: index === faqs.length - 1 ? 'none' : '1px solid'
        }}
      >
        <Typography>{faq.question}</Typography>
      </TableCell>
      <TableCell
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: index === faqs.length - 1 ? 'none' : '1px solid'
        }}
      >
        <Typography sx={{ maxWidth: 300 }}>{faq.answer}</Typography>
        <Box sx={{ display: 'flex' }}>
          <Button sx={{ p: 0.5, color: 'white' }}>
            <EditIcon />
          </Button>
          <Button
            sx={{ p: 0.5, color: 'white' }}
            onClick={() => {
              setFaqToDelete(faq);
              setDeleteModalShow(true);
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
            // Handle adding a new FAQ
          }}
        >
          Add FAQ
        </NERButton>
      </Box>
      {faqToDelete && (
       <NERDeleteModal
       open={deleteModalShow}
       onHide={() => setFaqToDelete(undefined)}
       formId="delete-item-form"
       title="FAQ"
       onFormSubmit={() => {
        console.log(faqToDelete)
         if (faqToDelete) {
           handleDelete(faqToDelete.faqId);
         }
       }}
     />
     
      )}
    </Box>
  );
};

export default FAQsTable;
