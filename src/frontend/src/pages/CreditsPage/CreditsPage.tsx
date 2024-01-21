/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Grid, Typography } from '@mui/material'; // some imports from libraries
import { NERButton } from '../../components/NERButton';
import { useState } from 'react';
import PageBlock from '../../layouts/PageBlock'; // ...and from other files
import PageLayout from '../../components/PageLayout';

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
    { name: 'Zack Roth', color: '#4a6741', sx: { px: 1, backgroundColor: '#E8D8CC', borderRadius: 2 } },
    { name: 'Megan Liu', color: '#3d609e' },
    { name: 'Peyton McKee', color: '#6a3941' },
    { name: 'Tucker Gwertzman', color: '#25e6e2' },
    { name: 'Donny Le', color: '#03fcf4' },
    { name: 'Ryan Howe', color: '#3cce20' },
    { name: 'Ethan Szeto', color: '#404040' },
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
    { name: 'Martin Hema', color: '#9125cc' },
    { name: 'Shree Singhal', color: '#ff7ca4' },
    { name: 'Isaac Levine', color: '#6a3941' },
    { name: 'Andrew Tsai', color: '#3281a8' },
    { name: 'Ahnaf Inkiad', color: '#ab38b5' },
    { name: 'Aaryan Jain', color: '#e53774' },
    { name: 'Jameson Ho', color: '#A020F0' },
    { name: 'Yechan Na', color: '#C2B078' },
    { name: 'Liam Kosar', color: '#eb66ff' },
    { name: 'Daniel Yu', color: '#bdc0c7' },
    { name: 'Jake Wu-Chen', color: '#bdc0c7' },
    { name: 'William Seward', color: '#e53774' },
    { name: 'Quinn Louie', color: '#3281a8' },
    { name: 'Liu von Engelbrechten', color: '#2969f2' },
    {
      name: 'Zach Norman',
      color: 'transparent',
      sx: {
        background: 'linear-gradient(90deg, rgba(255,0,0,1) 0%, rgba(255,0,243,1) 50%, rgba(164,0,255,1) 100%);',
        '-webkit-background-clip': 'text'
      }
    },
    { name: 'Ethan Mouri', color: '#00bbff' },
    { name: 'Laith Taher', color: '#000080' },
    { name: 'Teera Tesharojanasup', color: '#DC143C', sx: { px: 1, backgroundColor: '#E8D8CC', borderRadius: 10 } },
    { name: 'Griffin Cooper', color: '#02d69a' },
    { name: 'Amani Scarborough', color: '#e34db6' },
    { name: 'Peter Moise', color: '#FF0000' },
    { name: 'Srihari Raman', color: '#FF2400' },
    { name: 'Kaiyang Zheng', color: '#FFFF00' },
    { name: 'Waasif Mahmood', color: '#114a13' },
    { name: 'Matthew Wang', color: '#c657f2' },
    { name: 'Sharon Yang', color: '#ed8a5f' },
    { name: 'Jonah Chang', color: '#9AAB89' },
    { name: 'Ha Nguyen', color: '#ff9812' },
    { name: 'Sathvik Charugundla', color: '#ff0000' },
    { name: 'Samantha Moy', color: '#d287fa' },
    { name: 'Benjamin Zhu', color: '#ccccff' },
    { name: 'Stephanie Xu', color: '#ffcd42' },
    { name: 'Hareg Aderie', color: '#34b46c' },
    { name: 'Motto Sereeyothin', color: '#000000' },
    { name: 'Raymond Tsai', color: '#66cdaa' },
    { name: 'Arinjay Singh', color: '#7bb5dc' },
    { name: 'Aarav Shyamkumar', color: '#FF0000' },
    { name: 'Raghav Mathur', color: '#009933' },
    { name: 'Anika Sharma', color: '#ff0000' },
    { name: 'William (Jack) Turner', color: '#ff5733' },
    {
      name: 'Dao Ho',
      color: 'white',
      sx: {
        background: 'linear-gradient(90deg, rgba(255,0,0,1) 0%, rgba(255,0,243,1) 50%, rgba(164,0,255,1) 100%);',
        px: 1.5,
        borderRadius: 3
      }
    },
    {
      name: 'Kaan Tural',
      color: 'transparent',
      sx: {
        background: 'linear-gradient(90deg, rgba(255,0,0,1) 0%, rgba(0,128,255,1) 100%)',
        '-webkit-background-clip': 'text',
        textShadow: '0 0 5px rgba(255,0,0,1), 0 0 10px rgba(0,128,255,1)'
      }
    },
    { name: 'Kevin Polackal', color: '#800080' },
    { name: 'Sindhu Balamurugan', color: '#c170fa' },
    { name: 'Lily Shiomitsu', color: '#008080' },
    { name: 'Kevin Yang', color: '#0000FF' },
    { name: 'Jack Mitchell', color: '808000' },
    { name: 'Zoey Guo', color: '#E34949' },
    { name: 'Qihong Wu', color: '#87CEEB' },
    { name: 'Jessica Zhao', color: '#6495ED' },
    { name: 'Neel Raut', color: '#023665' },
    { name: 'Qihong Wu', color: '#87CEEB' },
    { name: 'Megan Lai', color: '#52B2BF' },
    { name: 'Eric Sun', color: '#FCCAED' },
    { name: 'Yash Jayaprakash', color: '#66b2b2' },
    { name: 'Maggie Chua', color: '#E6E6FA' },
    { name: 'Bradford Derby', color: '#577DD5' },
    { name: 'Makarios Mansour', color: '#DC143C' },
    { name: 'Lauren Phan', color: '#F3A7C0' },
    { name: 'Vidyuth Ramkumar', color: '#800000' },
    { name: 'Jake Hensley', color: '#FFA500' },
    { name: 'Emma Shum', color: '#d4878f' },
    { name: 'Matthew Egg', color: '#7E1B2F' },
    {
      name: 'Wyatt Bracy',
      color: '#080808',
      sx: {
        textShadow: '0 0 2px rgba(0,0,0), 0 0 20px rgba(220,220,220,1)'
      }
    },
    { name: 'Vincent Demaisip', color: '#ebb135' },
    { name: 'Daniel Ma', color: '#ffb4e8' },
    { name: 'Yulan Wang', color: '#D4E6F1' },
    { name: 'Aarush Garg', color: '#40E0D0' },
    { name: 'Waverly Hassman', color: '#CBC3E3' },
    { name: 'Akul Aggarwal', color: '#cc34eb' },
    { name: 'Rebecca Lee', color: '#87c2fa' },
    { name: 'Jake Langlois', color: '#588BAE' },
    { name: 'Caio DaSilva', color: '#290ED2' },
    { name: 'Aahil Nishad', color: '#5E9E82' },
    { name: 'Anya Dasgupta', color: '#e37fc0' },
    { name: 'Ben Marler', color: '#a300a3' },
    { name: 'Alan Eng', color: '#0B66E4' },
    { name: 'Alexander Schinkmann-Bonias', color: '#d3d3d3' },
    { name: 'Aditya Boddepalli', color: '#00FFFF' },
    { name: 'Jack Dreifus', color: '#014421' },
    { name: 'Vinay Pillai', color: '#42458e' }
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
    <PageLayout title="Credits">
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
        <NERButton variant="contained" onClick={() => setDisplaySnark(displaySnark + 1)}>
          {displaySnark < snark.length ? snark[displaySnark] : '>:('}
        </NERButton>
      </div>
    </PageLayout>
  );
};

export default CreditsPage;
