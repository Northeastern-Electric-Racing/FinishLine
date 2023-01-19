/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Grid, Button, Typography } from '@mui/material'; // some imports from libraries
import { useState } from 'react';
import PageTitle from '../../layouts/PageTitle/PageTitle'; // ...and from other files
import PageBlock from '../../layouts/PageBlock';

const CreditsPage: React.FC = () => {
  // This is the list of names that get displayed, add yours here!
  // each item in the list is a JSON (javascript object notation) object that has the keys 'name' and 'color'
  // the type notation tells us that name is a string and color is a string
  // think of JSON like a map with keys and values
  const names: {
    name: string;
    color: string;
  }[] = [
    { name: 'Anthony Bernardi', color: '#566bd4' },
    { name: 'Reid Chandler', color: '#e53774' },
    { name: 'Ari Saharay', color: '#0fbf22' },
    { name: 'Kevin Chen', color: '#00A36C' },
    { name: 'Ji-min Kim', color: '#7ae0c1' },
    { name: 'Zack Roth', color: '#60efa3' },
    { name: 'Megan Liu', color: '#3d609e' },
    { name: 'Peyton McKee', color: '#6a3941' },
    { name: 'Ryan Howe', color: '#3cce20' },
    { name: 'Nezam Jazayeri', color: '#8a8f5c' },
    { name: 'Edward Ibarra', color: '#c4a484' }
  ];

  const snark = ['Add your name!', "Shouldn't you do it yourself?", 'Seriously', 'go', 'do', 'it'];
  const [displaySnark, setDisplaySnark] = useState(0);
  // "displaySnark" is a variable and we're using it as a counter -- 0 is the initial state
  // every time the button is clicked below we will increment it
  // we define it with the "useState" React "hook" designating it as a special variable that re-renders the view when changed.

  // below we build and return what is shown on the page (minus the top bar and side bar)
  // inside a PageBlock component, we map the names list from above into components to display each name.
  // under that is a button that changes its display based on "displaySnark" whenever it is clicked.
  return (
    <div>
      <PageTitle title={'Credits'} previousPages={[]} />
      <PageBlock>
        <Grid container spacing={2}>
          {names.map((item) => (
            <Grid item>
              <Typography variant="body1" color={item.color}>
                {item.name}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </PageBlock>
      <div style={{ justifyContent: 'center', display: 'flex' }}>
        <Button onClick={() => setDisplaySnark(displaySnark + 1)} variant="contained">
          {displaySnark < snark.length ? snark[displaySnark] : '>:('}
        </Button>
      </div>
    </div>
  );
};

export default CreditsPage;
