import prisma from '../src/prisma/prisma';
import { batman, batmanSettings, flash, superman, batmanSecureSettings } from './test-data/users.test-data';
import { Role } from '@prisma/client';
import UsersService from '../src/services/users.services';
import { AccessDeniedException, NotFoundException } from '../src/utils/errors.utils';

describe('Users', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getAllUsers', async () => {
    jest.spyOn(prisma.user, 'findMany').mockResolvedValue([superman, batman]);

    const res = await UsersService.getAllUsers();

    const { googleAuthId: g1, ...restOfBatman } = batman;
    const { googleAuthId: g2, ...restOfSuperman } = superman;

    expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    // note that batman was sorted to the front because his first name is before supermans alphabetically
    // and also that we don't return the google auth id for security reasons
    expect(res).toStrictEqual([restOfBatman, restOfSuperman]);
  });

  test('getSingleUser', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(batman);

    const res = await UsersService.getSingleUser(1);

    const { googleAuthId, ...restOfBatman } = batman;

    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    // we don't return the google auth id for security reasons
    expect(res).toStrictEqual(restOfBatman);
  });

  describe('updateUserRole', () => {
    test('cannot update user to higher role', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(batman);
      await expect(() => UsersService.updateUserRole(1, superman, 'APP_ADMIN')).rejects.toThrow(
        new AccessDeniedException('Cannot promote user to a higher role than yourself')
      );
    });

    test('cannot demote user of same role', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(flash);
      await expect(() => UsersService.updateUserRole(superman.userId, flash, 'GUEST')).rejects.toThrow(
        new AccessDeniedException('Cannot change the role of a user with an equal or higher role than you')
      );
    });

    test('updateUserRole success', async () => {
      const newSuperman = { ...superman, role: Role.MEMBER };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(superman);
      jest.spyOn(prisma.user, 'update').mockResolvedValueOnce(newSuperman);

      const res = await UsersService.updateUserRole(2, batman, 'MEMBER');

      const { googleAuthId, ...restOfSuperman } = newSuperman;
      expect(res).toStrictEqual(restOfSuperman);
      expect(prisma.user.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUserSettings', () => {
    test('getUserSettings for undefined request user', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      await expect(() => UsersService.getUserSettings(420)).rejects.toThrow(new NotFoundException('User', 420));
    });

    test('getUserSettings runs', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(batman);
      jest.spyOn(prisma.user_Settings, 'upsert').mockResolvedValue(batmanSettings);
      const res = await UsersService.getUserSettings(1);

      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.user_Settings.upsert).toHaveBeenCalledTimes(1);
      expect(res).toStrictEqual(batmanSettings);
    });
  });

  describe('updateUserSettings', () => {
    test('updateUserSettings works', async () => {
      jest.spyOn(prisma.user_Settings, 'upsert').mockResolvedValue(batmanSettings);
      const res = await UsersService.updateUserSettings(batman, 'DARK', 'Slack');

      expect(res.userId).toStrictEqual(1);
      expect(res.defaultTheme).toStrictEqual('DARK');
      expect(res.slackId).toStrictEqual('slack');
    });

    test('setUserSecureSettings works', async () => {
      jest.spyOn(prisma.user_Secure_Settings, 'upsert').mockResolvedValue(batmanSecureSettings);
      const res = await UsersService.setUserSecureSettings(
        batman,
        'nuid',
        'street',
        'city',
        'state',
        'zipcode',
        '019-932-1234'
      );

      expect(res).toBe(batmanSecureSettings.userSecureSettingsId);
    });
  });
});
