import { TableRow, TableCell, Box, Table as MuiTable, TableHead, TableBody, Typography, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useHistoryState } from '../../../hooks/misc.hooks';
import { FrequentlyAskedQuestion } from 'shared/src/types/frequently-asked-questions-types';
import { exampleAppAdminUser } from '../../../tests/test-support/test-data/users.stub';
import { NERButton } from '../../../components/NERButton';

const FAQsTable = () => {
  // const [createModalShow, setCreateModalShow] = useHistoryState<boolean>('', false);
  // const [faqEditing, setFaqEditing] = useHistoryState<FrequentlyAskedQuestion | undefined>('', undefined);
  // const { isLoading: faqsIsLoading, isError: faqsIsError, error: faqsError, data: faqs } = useAllFAQs();

  // placeholder until endpoints are completed
  const faqs: FrequentlyAskedQuestion[] = [
    {
      faqId: '1',
      userCreated: exampleAppAdminUser,
      dateCreated: new Date(),
      question: 'Test quesiton 1?',
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

  // if (!faqs || faqsIsLoading) return <LoadingIndicator />;
  // if (faqsIsError) return <ErrorPage message={faqsError.message} />;

  const FAQsRows = faqs.map((faq: FrequentlyAskedQuestion, index: number) => (
    <TableRow>
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
          <Button sx={{ p: 0.5, color: 'white' }}>
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
            // setCreateModalShow(true);
          }}
        >
          Add FAQ
        </NERButton>
      </Box>
    </Box>
  );
};

export default FAQsTable;
