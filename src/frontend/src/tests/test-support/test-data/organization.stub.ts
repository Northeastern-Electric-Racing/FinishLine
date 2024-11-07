/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { exampleAuthenticatedAdminUser } from './authenticated-user.stub';

export const exampleOrganization = {
  name: 'NER',
  userCreatedId: exampleAuthenticatedAdminUser.userId,
  description:
    'Northeastern Electric Racing is a student-run organization at Northeastern University building all-electric formula-style race cars from scratch to compete in Forumla Hybrid + Electric Formula SAE (FSAE).',
  applicationLink: 'https://northeastern.campuslabs.com/engage/submitter/form/start/491315',
  organizationId: '1',
  dateCreated: new Date(),
  userCreated: exampleAuthenticatedAdminUser
};
