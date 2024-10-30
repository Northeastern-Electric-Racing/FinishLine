import { resetUsers } from '../test-utils';

describe('Onboarding Tests', () => {
  afterEach(async () => {
    await resetUsers();
  });
  describe("Get User's Checklists", () => {
    it('User has no teamType, returns all general checklists', async () => {
      // test data
    });

    it('User has a team, returns all general checklists and checklists matching the user team type', async () => {
      // test data
    });

    it('Throws an error if the user does not have any teams', async () => {
      // test data
    });
  });
});
