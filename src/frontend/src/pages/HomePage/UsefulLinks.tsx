/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 *
 */

import { useTheme } from '@mui/material';
import { ShoppingCart, Settings, Receipt, Description, CurrencyExchange, AttachMoney } from '@mui/icons-material';
import Link from '@mui/material/Link';
import { Grid } from '@mui/material';
import PageBlock from '../../layouts/PageBlock';

const UsefulLinks: React.FC = () => {
  const theme = useTheme();
  const links = [
    <>
      <ShoppingCart sx={{ fontSize: 17, color: theme.palette.text.primary }} />
      <Link
        href="https://docs.google.com/document/d/1M5Ldy9L1BifBo18tdKpv3CH-frRneyEK26hUXbtMg7Q/edit"
        underline="hover"
        fontSize={19}
        sx={{ pl: 1 }}
      >
        Purchasing Guidelines
      </Link>
    </>,
    <>
      <CurrencyExchange sx={{ fontSize: 17, color: theme.palette.text.primary }} />
      <Link
        href="https://docs.google.com/document/d/1HvLnVNzZTftgoAXppIEp-gTmUBQGt-V6n97prziWWrs/edit"
        underline="hover"
        fontSize={19}
        sx={{ pl: 1 }}
      >
        Reimbursement Guidelines
      </Link>
    </>,
    <>
      <AttachMoney sx={{ fontSize: 17, color: theme.palette.text.primary }} />
      <Link href="https://forms.gle/6ztRoa1iL7p1KHwP6" underline="hover" fontSize={19} sx={{ pl: 1 }}>
        Procurement Form
      </Link>
    </>,
    <>
      <Receipt sx={{ fontSize: 17, color: theme.palette.text.primary }} />
      <Link
        href="https://docs.google.com/spreadsheets/d/1kqpnw8jZDx2GO5NFUtqefRXqT1XX46iMx5ZI4euPJgY/edit"
        underline="hover"
        fontSize={19}
        sx={{ pl: 1 }}
      >
        McMaster Order Sheet
      </Link>
    </>,
    <>
      <Description sx={{ fontSize: 17, color: theme.palette.text.primary }} />
      <Link
        href="https://docs.google.com/document/d/1w0B6upZRY28MlbVA4hyU3X_NRNP0cagmLWqjHn6B8OA/edit"
        underline="hover"
        fontSize={19}
        sx={{ pl: 1 }}
      >
        Project Update Log
      </Link>
    </>,
    <>
      <Settings sx={{ fontSize: 17, color: theme.palette.text.primary }} />
      <Link
        href="https://nerdocs.atlassian.net/wiki/spaces/NER/pages/4554841/Hardware+Guidelines"
        underline="hover"
        fontSize={19}
        sx={{ pl: 1 }}
      >
        Hardware Guidelines
      </Link>
    </>
  ];

  return (
    <PageBlock title={'Useful Links'}>
      <Grid container spacing={2}>
        {links.map((ele) => (
          <Grid item xs={6} md={3}>
            {ele}
          </Grid>
        ))}
      </Grid>
    </PageBlock>
  );
};

export default UsefulLinks;
