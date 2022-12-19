/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 *
 */

import {
  ShoppingCart,
  Settings,
  FormatListNumbered,
  Receipt,
  Description,
  CurrencyExchange,
  AttachMoney
} from '@mui/icons-material';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import PageBlock from '../../layouts/PageBlock';

const UsefulLinks: React.FC = () => {
  const links = [
    <Link href="https://docs.google.com/document/d/1M5Ldy9L1BifBo18tdKpv3CH-frRneyEK26hUXbtMg7Q/edit" 
    underline="hover" fontSize={19}>
      <ShoppingCart sx={{fontSize:17, color:'white'}}></ShoppingCart>
      Purchasing Guidelines
    </Link>,
    <Link href="https://docs.google.com/document/d/1HvLnVNzZTftgoAXppIEp-gTmUBQGt-V6n97prziWWrs/edit" underline="hover" fontSize={19}>
      <CurrencyExchange sx={{fontSize:17, color:'white'}}></CurrencyExchange>
      Reimbursement Guidelines
    </Link>,
    <Link href="https://forms.gle/6ztRoa1iL7p1KHwP6" underline="hover" fontSize={19}>
      <AttachMoney sx={{fontSize:17, color:'white'}}></AttachMoney>
      Procurement Form
    </Link>,
    <Link href="https://docs.google.com/spreadsheets/d/1kqpnw8jZDx2GO5NFUtqefRXqT1XX46iMx5ZI4euPJgY/edit" underline="hover" fontSize={19}>
      <Receipt sx={{fontSize:17, color:'white'}}></Receipt>
      McMaster Order Sheet
    </Link>,
    <Link href="https://docs.google.com/document/d/1w0B6upZRY28MlbVA4hyU3X_NRNP0cagmLWqjHn6B8OA/edit" underline="hover" fontSize={19}>
      <Description sx={{fontSize:17, color:'white'}}></Description>
      Project Update Log
    </Link>,
    <Link href="https://nerdocs.atlassian.net/wiki/spaces/NER/pages/4554841/Hardware+Guidelines" underline="hover" fontSize={19}>
      <Settings sx={{fontSize:17, color:'white'}}></Settings>
      Hardware Guidelines
    </Link>
  ];

  return (
    <PageBlock title={'Useful Links'}>
      <Box display="flex" flexWrap="wrap" flexDirection="row" sx={{ p: 0 }}>
        {links.map((ele) => (
          <Box padding={1}>{ele}</Box>
        ))}
      </Box>
    </PageBlock>
  );
};

export default UsefulLinks;
