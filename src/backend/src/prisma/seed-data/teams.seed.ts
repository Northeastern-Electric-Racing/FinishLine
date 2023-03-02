/*
 * This file is part of FinishLine by NER and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Prisma } from '@prisma/client';

const oriolesDescription = `
The Baltimore Orioles are an American professional baseball team based in Baltimore. The Orioles compete in Major League Baseball (MLB) as a member club of the American League (AL) East division. As one of the American League's eight charter teams in 1901, the franchise spent its first year as a major league club in Milwaukee, Wisconsin, as the Milwaukee Brewers before moving to St. Louis, Missouri, to become the St. Louis Browns in 1902. After 52 years in St. Louis, the franchise was purchased in November 1953 by a syndicate of Baltimore business and civic interests led by attorney and civic activist Clarence Miles and Mayor Thomas D'Alesandro Jr. The team's current owner is American trial lawyer Peter Angelos.

The Orioles adopted their team name in honor of the official state bird of Maryland; it had been used previously by several baseball clubs in the city, including another AL charter member franchise also named the "Baltimore Orioles", which moved to New York in 1903 to eventually become the Yankees. Nicknames for the team include the "O's" and the "Birds".
`;

const ravensDescription = `
The Baltimore Ravens are a professional American football team based in Baltimore. The Ravens compete in the National Football League (NFL) as a member club of the American Football Conference (AFC) North division. The team plays its home games at M&T Bank Stadium and is headquartered in Owings Mills, Maryland.[7]

The Ravens played the Super Bowl XLVII against the San Francisco 49ers. Baltimore built a 28–6 lead early in the third quarter before a partial power outage in the Superdome suspended play for 34 minutes (earning the game the added nickname of the Blackout Bowl).[31][32] After play resumed, San Francisco scored 17 unanswered third-quarter points to cut the Ravens' lead, 28–23, and continued to chip away in the fourth quarter. With the Ravens leading late in the game, 34–29, the 49ers advanced to the Baltimore 7-yard line just before the two-minute warning but turned the ball over on downs. The Ravens then took an intentional safety in the waning moments of the game to preserve the victory. Baltimore quarterback Joe Flacco, who completed 22 of 33 passes for 287 yards and three touchdowns, was named Super Bowl MVP.`;

const ravens = (leaderId: number): Prisma.TeamCreateArgs => {
  return {
    data: {
      teamName: 'Ravens',
      slackId: 'asdf',
      description: ravensDescription,
      leaderId
    }
  };
};

const orioles = (leaderId: number): Prisma.TeamCreateArgs => {
  return {
    data: {
      teamName: 'Orioles',
      slackId: 'jkl;',
      description: oriolesDescription,
      leaderId
    }
  };
};

const justiceLeague = (leaderId: number): Prisma.TeamCreateArgs => {
  return {
    data: {
      teamName: 'Justice League',
      slackId: 'dc',
      leaderId
    }
  };
};

const huskies = (leaderId: number): Prisma.TeamCreateArgs => {
  return {
    data: {
      teamName: 'Huskies',
      slackId: 'neu',
      leaderId,
      description:
        '# Welcome!\nThanks for joining our team! Here are some onboarding docs or something idk:\n\n[very important please read](https://crouton.net)'
    }
  };
};

export const dbSeedAllTeams = { ravens, orioles, justiceLeague, huskies };
