import React, { useState } from 'react';
import { TableRow, TableCell, Box, Table as MuiTable, TableHead, TableBody, Typography } from '@mui/material';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useGetAllSponsors } from '../../hooks/finance.hooks';
import ErrorPage from '../ErrorPage';
import { NERButton } from '../../components/NERButton';
import Footer from '../../components/Footer';
import { datePipe } from '../../utils/pipes';

const SponsorsTable = () => {
  const { data: sponsors, isLoading: sponsorIsLoading, isError: sponsorIsError, error: sponsorError } = useGetAllSponsors();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 14;

  if (!sponsors || sponsorIsLoading) {
    console.log('loading');
    return <LoadingIndicator />;
  }
  if (sponsorIsError) {
    return <ErrorPage message={sponsorError.message} />;
  }

  const totalPages = Math.ceil(sponsors.length / itemsPerPage);
  const lastSponsorIdx = currentPage * itemsPerPage;
  const firstSponsorIdx = lastSponsorIdx - itemsPerPage;
  const currentSponsors = sponsors.slice(firstSponsorIdx, lastSponsorIdx);

  const sponsorTableRows = currentSponsors.map((sponsor, index) => (
    <TableRow key={sponsor.sponsorId || index}>
      <TableCell
        align="center"
        sx={{
          alignItems: 'center',
          borderBottom: 'none'
        }}
      >
        <Typography sx={{ maxWidth: 300, textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
          {sponsor.name}
        </Typography>
      </TableCell>
      <TableCell
        align="center"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderBottom: 'none',
          minHeight: '50px'
        }}
      >
        <Typography sx={{ fontSize: '1.5rem' }}>{sponsor.activeStatus === true ? 'Active' : 'Inactive'}</Typography>
      </TableCell>
      <TableCell
        align="center"
        sx={{
          alignItems: 'center',
          borderBottom: 'none'
        }}
      >
        <Typography sx={{ maxWidth: 300, textAlign: 'center', fontSize: '1.5rem' }}>{sponsor.vendorContact}</Typography>
      </TableCell>

      <TableCell
        align="center"
        sx={{
          alignItems: 'center',
          borderBottom: 'none'
        }}
      >
        <Typography sx={{ maxWidth: 300, textAlign: 'center', fontSize: '1.5rem' }}>TIER</Typography>
      </TableCell>
      <TableCell
        align="center"
        sx={{
          alignItems: 'center',
          borderBottom: 'none'
        }}
      >
        <Typography sx={{ maxWidth: 300, textAlign: 'center', fontSize: '1.5rem' }}>{`$${sponsor.sponsorValue}`}</Typography>
      </TableCell>
      <TableCell
        align="center"
        sx={{
          alignItems: 'center',
          borderBottom: 'none'
        }}
      >
        <Typography sx={{ maxWidth: 300, textAlign: 'center', fontSize: '1.5rem' }}>{datePipe(sponsor.joinDate)}</Typography>
      </TableCell>
      <TableCell
        align="center"
        sx={{
          alignItems: 'center',
          borderBottom: 'none'
        }}
      >
        <Typography sx={{ maxWidth: 300, textAlign: 'center', fontSize: '1.5rem' }}>{sponsor.discountCode}</Typography>
      </TableCell>
      <TableCell
        align="center"
        sx={{
          alignItems: 'center',
          borderBottom: 'none'
        }}
      >
        <Typography sx={{ maxWidth: 300, textAlign: 'center', fontSize: '1.5rem' }}>
          {sponsor.taxExempt === true ? 'Yes' : 'No'}
        </Typography>
      </TableCell>
      <TableCell
        align="center"
        sx={{
          alignItems: 'center',
          borderBottom: 'none',
          borderLeft: '4px solid white'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <NERButton variant="contained" onClick={() => {}}>
            View Notes
          </NERButton>
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
              align="center"
              sx={{
                fontWeight: 'bold',
                fontSize: '1.5em',
                backgroundColor: '#ef4345',
                color: 'white',
                borderRadius: '10px 0px 0px 0px',
                height: '60px'
              }}
            >
              Sponsor
            </TableCell>
            <TableCell
              align="center"
              sx={{
                fontWeight: 'bold',
                fontSize: '1.5em',
                backgroundColor: '#ef4345',
                color: 'white'
              }}
            >
              Sponsor Status
            </TableCell>
            <TableCell
              align="center"
              sx={{
                fontWeight: 'bold',
                fontSize: '1.5em',
                backgroundColor: '#ef4345',
                color: 'white'
              }}
            >
              Contacts
            </TableCell>
            <TableCell
              align="center"
              sx={{
                fontWeight: 'bold',
                fontSize: '1.5em',
                backgroundColor: '#ef4345',
                color: 'white'
              }}
            >
              Sponsor Tier
            </TableCell>
            <TableCell
              align="center"
              sx={{
                fontWeight: 'bold',
                fontSize: '1.5em',
                backgroundColor: '#ef4345',
                color: 'white'
              }}
            >
              Sponsor Value
            </TableCell>
            <TableCell
              align="center"
              sx={{
                fontWeight: 'bold',
                fontSize: '1.5em',
                backgroundColor: '#ef4345',
                color: 'white'
              }}
            >
              Sponsor Join Date
            </TableCell>
            <TableCell
              align="center"
              sx={{
                fontWeight: 'bold',
                fontSize: '1.5em',
                backgroundColor: '#ef4345',
                color: 'white'
              }}
            >
              Discount
            </TableCell>
            <TableCell
              align="center"
              sx={{
                fontWeight: 'bold',
                fontSize: '1.5em',
                backgroundColor: '#ef4345',
                color: 'white'
              }}
            >
              Tax Exempt
            </TableCell>
            <TableCell
              align="center"
              sx={{
                fontWeight: 'bold',
                fontSize: '1.5em',
                backgroundColor: '#ef4345',
                color: 'white',
                borderRadius: '0px 10px 0px 0px'
              }}
            >
              Notes
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{sponsorTableRows}</TableBody>
        <Footer
          footerButton={
            <NERButton variant="contained" onClick={() => {}}>
              Add Sponsor
            </NERButton>
          }
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </MuiTable>
    </Box>
  );
};

export default SponsorsTable;
