import prisma from '../src/prisma/prisma';
import {
  batman,
  batmanSettings,
  flash,
  superman,
  batmanSecureSettings,
  sharedBatman,
  theVisitor,
  batmanWithScheduleSettings,
  batmanScheduleSettings
} from './test-data/users.test-data';
import { Role } from '@prisma/client';
import UsersService from '../src/services/users.services';
import { AccessDeniedException, HttpException, NotFoundException } from '../src/utils/errors.utils';
import userTransformer from '../src/transformers/user.transformer';

describe('Users', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('User Test Data properties', () => {
    test('shared Batman matches prisma Batman', () => {
      expect(userTransformer(batman)).toEqual(sharedBatman);
    });
  });

  test('getAllUsers', async () => {
    vi.spyOn(prisma.user, 'findMany').mockResolvedValue([superman, batman]);

    const res = await UsersService.getAllUsers();

    const { googleAuthId: g1, ...restOfBatman } = batman;
    const { googleAuthId: g2, ...restOfSuperman } = superman;

    expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    // note that batman was sorted to the front because his first name is before supermans alphabetically
    // and also that we don't return the google auth id for security reasons
    expect(res).toStrictEqual([restOfBatman, restOfSuperman]);
  });

  test('getSingleUser', async () => {
    vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(batman);

    const res = await UsersService.getSingleUser(1);

    const { googleAuthId, ...restOfBatman } = batman;

    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    // we don't return the google auth id for security reasons
    expect(res).toStrictEqual(restOfBatman);
  });

  describe('updateUserRole', () => {
    test('cannot update user to higher role', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(theVisitor);
      await expect(() => UsersService.updateUserRole(1, superman, 'APP_ADMIN')).rejects.toThrow(
        new AccessDeniedException('Cannot promote user to a higher role than yourself')
      );
    });

    test('cannot demote user of same role', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(flash);
      await expect(() => UsersService.updateUserRole(superman.userId, flash, 'GUEST')).rejects.toThrow(
        new AccessDeniedException('Cannot change the role of a user with an equal or higher role than you')
      );
    });

    test('updateUserRole success', async () => {
      const newSuperman = { ...superman, role: Role.MEMBER };
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(superman);
      vi.spyOn(prisma.user, 'update').mockResolvedValueOnce(newSuperman);

      const res = await UsersService.updateUserRole(2, batman, 'MEMBER');

      const { googleAuthId, ...restOfSuperman } = newSuperman;
      expect(res).toStrictEqual(restOfSuperman);
      expect(prisma.user.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('getUserSettings', () => {
    test('getUserSettings for undefined request user', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      await expect(() => UsersService.getUserSettings(420)).rejects.toThrow(new NotFoundException('User', 420));
    });

    test('getUserSettings runs', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(batman);
      vi.spyOn(prisma.user_Settings, 'upsert').mockResolvedValue(batmanSettings);
      const res = await UsersService.getUserSettings(1);

      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.user_Settings.upsert).toHaveBeenCalledTimes(1);
      expect(res).toStrictEqual(batmanSettings);
    });
  });

  describe('updateUserSettings', () => {
    test('updateUserSettings works', async () => {
      vi.spyOn(prisma.user_Settings, 'upsert').mockResolvedValue(batmanSettings);
      const res = await UsersService.updateUserSettings(batman, 'DARK', 'Slack');

      expect(res.userId).toStrictEqual(1);
      expect(res.defaultTheme).toStrictEqual('DARK');
      expect(res.slackId).toStrictEqual('slack');
    });

    test('setUserSecureSettings works', async () => {
      vi.spyOn(prisma.user_Secure_Settings, 'findFirst').mockResolvedValue(null);
      vi.spyOn(prisma.user_Secure_Settings, 'upsert').mockResolvedValue(batmanSecureSettings);
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

    test('setting same phone number does not work', async () => {
      vi.spyOn(prisma.user_Secure_Settings, 'findFirst').mockResolvedValue(batmanSecureSettings);
      await expect(() =>
        UsersService.setUserSecureSettings(
          batman,
          batmanSecureSettings.nuid,
          batmanSecureSettings.street,
          batmanSecureSettings.city,
          batmanSecureSettings.state,
          batmanSecureSettings.zipcode,
          batmanSecureSettings.phoneNumber
        )
      ).rejects.toThrow(new HttpException(400, 'Phone number already in use'));
    });
  });

  describe('getUserScheduleSettings', () => {
    test('getUserScheduleSettings for user with no settings', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(batman);
      vi.spyOn(prisma.schedule_Settings, 'findUnique').mockResolvedValue(null);
      await expect(() => UsersService.getUserScheduleSetting(batman.userId)).rejects.toThrow(
        new HttpException(404, 'User Schedule Settings Not Found')
      );
    });

    test('getUserScheduleSettings works successfully', async () => {
      vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(batmanWithScheduleSettings);
      vi.spyOn(prisma.schedule_Settings, 'findUnique').mockResolvedValue(batmanScheduleSettings);
      const res = await UsersService.getUserScheduleSetting(batmanWithScheduleSettings.userId);

      expect(prisma.schedule_Settings.findUnique).toHaveBeenCalledTimes(1);
      //expect(res).toStrictEqual(batmanScheduleSettings);
    });
  });
});
