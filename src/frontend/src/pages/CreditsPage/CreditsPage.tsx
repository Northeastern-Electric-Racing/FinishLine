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
  // each item in the list is a JSON (javascript object notation) object that has the keys
  // 'name' and 'color', and optionally 'sx' if you want to use a special style
  // the type notation tells us that name is a string and color is a string
  // think of JSON like a map with keys and values
  const names: {
    name: string;
    color: string;
    sx?: {};
  }[] = [
    { name: 'Anthony Bernardi', color: '#566bd4' },
    { name: 'Reid Chandler', color: '#e53774' },
    {
      name: 'Ari Saharay',
      color: 'transparent',
      sx: {
        background:
          'linear-gradient(90deg, rgba(255, 0, 0, 1) 0%, rgba(255, 154, 0, 1) 10%, rgba(208, 222,' +
          ' 33, 1) 20%, rgba(79, 220, 74, 1) 30%, rgba(63, 218, 216, 1) 40%, rgba(47, 201, 226,' +
          ' 1) 50%, rgba(28, 127, 238, 1) 60%, rgba(95, 21, 242, 1) 70%, rgba(186, 12, 248, 1)' +
          ' 80%, rgba(251, 7, 217, 1) 90%, rgba(255, 0, 0, 1) 100%)',
        '-webkit-background-clip': 'text'
      }
    },
    { name: 'Kevin Chen', color: '#00A36C' },
    { name: 'Ji-min Kim', color: '#7ae0c1' },
    { name: 'Zack Roth', color: '#60efa3' },
    { name: 'Megan Liu', color: '#3d609e' },
    { name: 'Peyton McKee', color: '#6a3941' },
    { name: 'Ryan Howe', color: '#3cce20' },
    { name: 'Adarsh Jayaram', color: '#ff0000' },
    { name: 'Harish Sundar', color: '#7f00ff' },
    { name: 'Sahil Shah', color: '#288BA8' },
    { name: 'Veda Nandikam', color: '#d3cefc' },
    { name: 'Nezam Jazayeri', color: '#42b3f5' },
    { name: 'Ben Weiss', color: '#8a8f5c' },
    { name: 'Mihir Walvekar', color: '#00A36C' },
    { name: 'Neil Satsangi', color: '#3cce20' },
    { name: 'Gilad Avni-Heller', color: '#d333ff' },
    { name: 'Arnav Rathore', color: '#00FFFF' },
    { name: 'Ethan Moskowitz', color: '#1434A4' },
    { name: 'Roger Huang', color: '#0000ff' },
    { name: 'Hamsini Malli', color: '#A020F0' },
    { name: 'Mokkh Mitsuntisuk', color: '#d4af37' },
    { name: 'Gilad Avni-Heller', color: '#d333ff' },
    { name: 'Edward Ibarra', color: '#c4a484' },
    { name: 'Sean Walker', color: '#fa8072' },
    { name: 'Anastasia Sobolina', color: '#C9A9A6' },
    { name: 'Nick Tarallo', color: '#1d4ee1' },
    { name: 'Ray Kong', color: '#87CEEE' },
    { name: 'Andrew Panos', color: '#4ab5f7' },
    { name: 'Jonathan Chen', color: '#e76869' },
    { name: 'Zach Marino', color: '#c175ff' },
    { name: 'Horace Mai', color: '#5c8f70' },
    { name: 'Jared Ritchie', color: '#f0354e' },
    { name: 'Alan Zhan', color: '#7AD0AC' },
    { name: 'Sutton Spindler', color: '#53A3ff' },
    { name: 'Emma Vonbuelow', color: '#c77ad0' },
    { name: 'Aidan Roche', color: '#20B1AA' },
    { name: 'Carrie Wang', color: '#f9cfc8' },
    { name: 'Kenneth Wan', color: '#00FFFF' },
    { name: 'Madeline Engle', color: '#FF2D76' },
    { name: 'Parth Kabra', color: '#e53774' },
    { name: 'Riley Platz', color: '#2d2fa6' },
    { name: 'Shree Singhal', color: '#ff7ca4' },
    { name: 'Isaac Levine', color: '#6a3941' },
    { name: 'Andrew Tsai', color: '#3281a8' },
    { name: 'Ahnaf Inkiad', color: '#ab38b5' },
    { name: 'Aaryan Jain', color: '#f9cfc8' }
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
              <Typography variant="body1" color={item.color} sx={item.sx}>
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
