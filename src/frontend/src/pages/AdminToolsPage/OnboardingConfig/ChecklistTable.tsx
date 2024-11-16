import { Button, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React from 'react';
import { useAllChecklists } from '../../../hooks/onboarding.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { ChecklistItem } from 'shared';

const ChecklistTable: React.FC = () => {
    const { data: checklists, isLoading, isError, error} = useAllChecklists();

    if (isLoading || !checklists) {
        return <LoadingIndicator />;
    }

    if (isError) {
        return <ErrorPage message={error.message} />;
    }
    
    const renderChecklistItems = (items: ChecklistItem[]) => {
        return items.map((item) => (
          <TableRow key={item.checklistItemId}>
            <TableCell sx={{ border: '2px solid black' }}>
              {item.name}
              {item.parentChecklistItem ? ' (Child)' : ' (Parent)'}
            </TableCell>
            <TableCell sx={{ border: '2px solid black' }}>{item.parentChecklistItem ? '' : item.description}</TableCell>
          </TableRow>
        ));
      };
    
      const renderChecklists = () => {
        return checklists.map((checklist) => (
          <>
            <TableRow key={checklist.checklistId}>
              <TableCell sx={{ border: '2px solid black', fontWeight: 'bold' }}>{checklist.name}</TableCell>
              <TableCell colSpan={2}>
              </TableCell>
            </TableRow>
            {renderChecklistItems(checklist.checklistItems)}
          </>
        ));
      };
    
      return (
        <Box>
          <Typography variant="h5" gutterBottom>
            Checklists
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ border: '2px solid black' }}>Name</TableCell>
                <TableCell sx={{ border: '2px solid black' }}>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{renderChecklists()}</TableBody>
          </Table>
        
          <Box sx={{ display: 'flex', justifyContent: 'right', marginTop: '10px' }}>
            <Button variant="contained" onClick={() => console.log('Add Checklist')}>
              New Checklist
            </Button>
          </Box>
        </Box>
      );
    };

export default ChecklistTable;
