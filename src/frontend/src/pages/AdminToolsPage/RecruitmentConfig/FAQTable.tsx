import { TableRow, TableCell, Box, Table as MuiTable, TableHead, TableBody, Typography, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { CreateFAQPayload } from '../../../hooks/recruitment.hooks';

interface FAQsTableProps {
  faqs: CreateFAQPayload[];
}

const FAQsTable: React.FC<FAQsTableProps> = ({ faqs }) => {
  const FAQsRows = faqs.map((faq, index) => (
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
    </Box>
  );
};

export default FAQsTable;
