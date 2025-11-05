/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import {
  Box,
  Button,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography
} from '@mui/material';
import PageTitle from '../../layouts/PageTitle/PageTitle';
import TableCellHuge from './YourEventsComponents/TableCellHuge';
import { useState } from 'react';

interface YourEventsHeadCells {
  id: string;
  label: string;
}

const headCells: readonly YourEventsHeadCells[] = [
  {
    id: 'eventsName',
    label: 'Events Name'
  },
  {
    id: 'date',
    label: 'Date'
  },
  {
    id: 'time',
    label: 'Time'
  },
  {
    id: 'location',
    label: 'Location'
  },
  {
    id: 'approvalBy',
    label: 'Approval By'
  },
  {
    id: 'approvalStatus',
    label: 'Approval Status'
  }
];

const YourEventsPage = () => {
  return (
    <Box sx={{ width: '100%', borderRadius: '8px 8px 0 0' }}>
      <PageTitle title="Your Events" />
      <TableContainer
        sx={{
          maxHeight: 'calc(100vh - 200px)',
          overflow: 'auto',
          borderRadius: '8px',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 86%, rgba(0,0,0,0) 90%)',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 86%, rgba(0,0,0,0) 90%)',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskSize: '100% 100%',
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCellHuge title={headCell.label} />
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(100)].map((_, i) => (
              <TableRow
                key={i}
                sx={{
                  '& .MuiTableCell-root': {
                    borderBottom: 'none'
                  }
                }}
              >
                {headCells.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    sx={{
                      textAlign: { xs: 'center', md: 'center' },
                      py: 1.5,
                    }}
                  >
                    {headCell.label} Data {i + 1}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            <TableRow
              sx={{
                '& .MuiTableCell-root': {
                    borderBottom: 'none'
                  }
              }}
            >
              <TableCell // Padding for the gradient
                    sx={{
                      py: 5,
                    }}
                  >
                    
                  </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default YourEventsPage;
