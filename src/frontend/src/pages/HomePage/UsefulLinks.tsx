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
    underline="hover">
      <ShoppingCart sx={{fontSize:18}}></ShoppingCart>
      Purchasing Guidelines
    </Link>,
    <Link href="https://docs.google.com/document/d/1HvLnVNzZTftgoAXppIEp-gTmUBQGt-V6n97prziWWrs/edit" underline="hover">
      <CurrencyExchange sx={{fontSize:18}}></CurrencyExchange>
      Reimbursement Guidelines
    </Link>,
    <Link href="https://forms.gle/6ztRoa1iL7p1KHwP6" underline="hover">
      <AttachMoney sx={{fontSize:18}}></AttachMoney>
      Procurement Form
    </Link>,
    <Link href="https://docs.google.com/spreadsheets/d/1kqpnw8jZDx2GO5NFUtqefRXqT1XX46iMx5ZI4euPJgY/edit" underline="hover">
      <Receipt sx={{fontSize:18}}></Receipt>
      McMaster Order Sheet
    </Link>,
    <Link href="https://docs.google.com/document/d/1w0B6upZRY28MlbVA4hyU3X_NRNP0cagmLWqjHn6B8OA/edit" underline="hover">
      <Description sx={{fontSize:18}}></Description>
      Project Update Log
    </Link>,
    <Link href="https://docs.google.com/document/d/1Y8IXCvYjXP3RBj6h4-xLCHXVLW5R6pi3-4i5SYMKtZY/edit" underline="hover">
      <FormatListNumbered sx={{fontSize:18}}></FormatListNumbered>
      Part Numbering Guidelines
    </Link>,
    <Link href="https://docs.google.com/document/d/1OD1d1VaIEHCwiFCuU7wfwAPu-UA--0_QzbyJjBsexwg/edit" underline="hover">
      <Settings sx={{fontSize:18}}></Settings>
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
