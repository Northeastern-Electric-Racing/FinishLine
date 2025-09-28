import { User_Settings, Organization } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library/build/src/auth/oauth2client';
import {
  Role,
  ThemeName,
  rankUserRole,
  User,
  RoleEnum,
  isHead,
  UserSecureSettings,
  UserScheduleSettings,
  AuthenticatedUser,
  AvailabilityCreateArgs,
  ProjectGantt,
  UserWithScheduleSettings
} from 'shared';
import prisma from '../prisma/prisma';
import { AccessDeniedException, HttpException, NotFoundException } from '../utils/errors.utils';
import { generateAccessToken } from '../utils/auth.utils';
import { projectGanttTransformer } from '../transformers/projects.transformer';
import { getProjectGanttQueryArgs } from '../prisma-query-args/projects.query-args';
import userSecureSettingsTransformer from '../transformers/user-secure-settings.transformer';
import userScheduleSettingsTransformer from '../transformers/user-schedule-settings.transformer';
import { userTransformer, userWithScheduleSettingsTransformer } from '../transformers/user.transformer';
import { getUserRole, updateUserAvailability } from '../utils/users.utils';
import { getUserQueryArgs, getUserScheduleSettingsQueryArgs } from '../prisma-query-args/user.query-args';
import { getAuthUserQueryArgs } from '../prisma-query-args/auth-user.query-args';
import authenticatedUserTransformer from '../transformers/auth-user.transformer';
import { getTaskQueryArgs } from '../prisma-query-args/tasks.query-args';
import taskTransformer from '../transformers/tasks.transformer';
import { validateUserIsPartOfFinanceTeamOrHead } from '../utils/reimbursement-requests.utils';

export default class UsersService {
  /**
   * Gets all of the users from the database
   * @returns a list of all the users
   */
  static async getAllUsers(): Promise<User[]> {
    const users = await prisma.user.findMany({
      select: {
        roles: true,
        userId: true,
        firstName: true,
        lastName: true,
        email: true
      }
    });

    users.sort((a, b) => a.firstName.localeCompare(b.firstName));

    return users.map(userTransformer);
  }

  /**
   * Gets all of the users in the current organization
   * @param organization the organization to get the users from
   * @returns a list of all the users in the current organization
   */
  static async getAllOrgUsers(organization: Organization): Promise<User[]> {
    const users = await prisma.user.findMany({
      where: { organizations: { some: { organizationId: organization.organizationId } } },
      ...getUserQueryArgs(organization.organizationId)
    });

    users.sort((a, b) => a.firstName.localeCompare(b.firstName));

    return users.map(userTransformer);
  }

  static async getCurrentUser(user: User): Promise<AuthenticatedUser> {
    const userWithOrgs = await prisma.user.findUnique({ where: { userId: user.userId }, include: { organizations: true } });

    if (!userWithOrgs) {
      throw new NotFoundException('User', user.userId);
    }

    const [organization] = userWithOrgs.organizations;

    if (!organization) throw new HttpException(500, 'User is not apart of any organizations');

    const currentUser = await prisma.user.findUnique({
      where: { userId: user.userId },
      ...getAuthUserQueryArgs(organization.organizationId)
    });

    if (!currentUser) {
      throw new NotFoundException('User', user.userId);
    }

    return authenticatedUserTransformer(currentUser);
  }

  /**
   * Gets the user with the specified id
   * @param userId the id of the user that's returned
   * @param organizationId the id of the organization the current user is in
   * @returns the user with the specified id
   * @throws if the given user doesn't exist
   */
  static async getSingleUser(userId: string, organization: Organization): Promise<User> {
    const requestedUser = await prisma.user.findUnique({
      where: { userId, organizations: { some: { organizationId: organization.organizationId } } },
      ...getUserQueryArgs(organization.organizationId)
    });

    if (!requestedUser) throw new NotFoundException('User', userId);

    return userTransformer(requestedUser);
  }

  /**
   * Gets the user settings for a specified user
   * @param userId the id of the user who's settings are requested
   * @returns the user settings object
   * @throws if the given user doesn't exist, or the given user's settings don't exist
   */
  static async getUserSettings(userId: string): Promise<User_Settings> {
    const requestedUser = await prisma.user.findUnique({ where: { userId } });

    if (!requestedUser) throw new NotFoundException('User', userId);
    const settings = await prisma.user_Settings.upsert({
      where: { userId },
      update: {},
      create: { userId }
    });

    return settings;
  }

  /**
   * Gets the user secure settings for the current usr
   * @param user the id of the user who's secure settings are requested
   * @returns the user's secure settings object
   */
  static async getCurrentUserSecureSettings(user: User): Promise<UserSecureSettings> {
    const secureSettings = await prisma.user_Secure_Settings.findUnique({
      where: { userId: user.userId }
    });
    if (!secureSettings) throw new HttpException(404, 'User Secure Settings Not Found');

    return userSecureSettingsTransformer(secureSettings);
  }

  /**
   * Get the given user's favorite projects for the current organization.
   * @param userId the user to get the projects for
   * @param organizationId the id of the organization the user is in
   * @returns the user's favorite projects
   */
  static async getUsersFavoriteProjects(userId: string, organization: Organization): Promise<ProjectGantt[]> {
    const requestedUser = await prisma.user.findUnique({ where: { userId } });
    if (!requestedUser) throw new NotFoundException('User', userId);

    const projects = await prisma.project.findMany({
      where: {
        favoritedBy: {
          some: {
            userId
          }
        },
        wbsElement: {
          organizationId: organization.organizationId
        }
      },
      ...getProjectGanttQueryArgs(organization.organizationId)
    });

    return projects.map(projectGanttTransformer);
  }

  /**
   * Edits a user's settings in the database
   * @param user the user who's settings are being updated
   * @param defaultTheme the defaultTheme of the user - a setting
   * @param slackId the user's slackId - a setting
   * @returns the updated settings
   * @throws if the user does not exist
   */
  static async updateUserSettings(user: User, defaultTheme: ThemeName, slackId: string): Promise<User_Settings> {
    const { userId } = user;

    const updatedSettings = await prisma.user_Settings.upsert({
      where: { userId },
      update: { defaultTheme, slackId },
      create: { userId, defaultTheme, slackId }
    });

    return updatedSettings;
  }

  /**
   * Logs a user in on production
   * @param idToken the idToken of the user logging in
   * @param header additional information used to register a login
   * @returns the user that has been signed in, and an access token
   * @throws if the auth server response payload is invalid
   */
  static async logUserIn(idToken: string, header: string): Promise<{ user: AuthenticatedUser; token: string }> {
    const client = new OAuth2Client(process.env.REACT_APP_GOOGLE_AUTH_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.REACT_APP_GOOGLE_AUTH_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload) throw new Error('Auth server response payload invalid');
    const { sub: userId } = payload; // google user id
    // check if user is already in the database via Google ID
    let user = await prisma.user.findUnique({
      where: { googleAuthId: userId },
      include: {
        organizations: true,
        userSettings: true
      }
    });

    if (!payload['email']) {
      throw new HttpException(400, 'Email was not Found on Google Account');
    }

    // if not in database, create user in database
    if (!user) {
      const emailId = payload['email']!.includes('@husky.neu.edu') ? payload['email']!.split('@')[0] : null;
      const organization = await prisma.organization.findFirst();

      const firstName = payload['given_name'] ?? payload['email']!.split('@')[0]; // Defaults to id of email
      const lastName = payload['family_name'] ?? ''; // Defaults to no last name

      const nonHuskyEmail = payload['email']!.includes('@husky.neu.edu')
        ? payload['email'].replace(/@husky\.neu\.edu/i, '@northeastern.edu')
        : payload['email'];

      const createdUser = await prisma.user.create({
        data: {
          firstName,
          lastName,
          googleAuthId: userId,
          email: nonHuskyEmail,
          emailId,
          userSettings: { create: {} }
        },
        include: {
          organizations: true,
          userSettings: true
        }
      });
      user = createdUser;

      if (organization) {
        await prisma.organization.update({
          where: { organizationId: organization.organizationId },
          data: {
            users: {
              connect: {
                userId: createdUser.userId
              }
            }
          }
        });
        await prisma.role.create({
          data: {
            userId: createdUser.userId,
            organizationId: organization!.organizationId,
            roleType: RoleEnum.GUEST
          }
        });
      }
    }

    // register a login
    await prisma.session.create({
      data: {
        userId: user.userId,
        deviceInfo: header
      }
    });

    const token = generateAccessToken({ userId: user.userId, firstName: user.firstName, lastName: user.lastName });

    if (user.organizations.length > 0) {
      const [defaultOrganization] = user.organizations;
      const authenticatedUser = await prisma.user.findUnique({
        where: { userId: user.userId },
        ...getAuthUserQueryArgs(defaultOrganization.organizationId)
      });

      if (!authenticatedUser) throw new NotFoundException('User', userId);

      return { user: authenticatedUserTransformer(authenticatedUser), token };
    }

    return {
      user: authenticatedUserTransformer({
        ...user,
        organizations: [],
        roles: [],
        onboardingTeamTypes: [],
        onboardedTeamTypes: [],
        teamsAsHead: [],
        teamsAsLead: [],
        teamsAsMember: []
      }),
      token
    };
  }

  /**
   * Logs a user in on the development version of the app
   * @param userId the user id of the user being logged in
   * @param header additional information used to register a login
   * @returns the user that has been logged in
   * @throws if the user with the specified id doesn't exist in the database
   */
  static async logUserInDev(userId: string, header: string): Promise<AuthenticatedUser> {
    const user = await prisma.user.findUnique({
      where: { userId },
      include: {
        organizations: true,
        userSettings: true
      }
    });

    if (!user) throw new NotFoundException('User', userId);

    // register a login
    await prisma.session.create({
      data: {
        userId: user.userId,
        deviceInfo: header
      }
    });

    if (user.organizations.length > 0) {
      const [defaultOrganization] = user.organizations;
      const authenticatedUser = await prisma.user.findUnique({
        where: { userId },
        ...getAuthUserQueryArgs(defaultOrganization.organizationId)
      });

      if (!authenticatedUser) throw new NotFoundException('User', userId);

      return authenticatedUserTransformer(authenticatedUser);
    }

    return authenticatedUserTransformer({
      ...user,
      organizations: [],
      roles: [],
      onboardingTeamTypes: [],
      onboardedTeamTypes: [],
      teamsAsHead: [],
      teamsAsLead: [],
      teamsAsMember: []
    });
  }

  /**
   * Edits a user's role
   * @param targetUserId the user who's role is being changed
   * @param user the user who is changing the role
   * @param role the role that the user is being updated to
   * @param organizationId the id of the organization the user is in
   * @returns the user whose role has been updated
   * @throws if the targeted user doesn't exist, the user who's changing the role doesn't exist,
   *         a user is trying to change the role of a user with an equal or higher role, or a user is trying to
   *         promote a user to higher role than themself
   */
  static async updateUserRole(targetUserId: string, user: User, role: Role, organization: Organization): Promise<User> {
    const targetUser = await prisma.user.findUnique({
      where: { userId: targetUserId, organizations: { some: { organizationId: organization.organizationId } } },
      ...getUserQueryArgs(organization.organizationId)
    });

    if (!targetUser) throw new NotFoundException('User', targetUserId);

    const userRole = await getUserRole(user.userId, organization.organizationId);
    const targetUserRole = await getUserRole(targetUserId, organization.organizationId);
    const userRankedRole = rankUserRole(userRole);
    const targetUserRankedRole = rankUserRole(targetUserRole);

    const isLeadershipPromotingGuestToMember =
      userRole === RoleEnum.LEADERSHIP && targetUserRole === RoleEnum.GUEST && role === RoleEnum.MEMBER;

    if (!isLeadershipPromotingGuestToMember) {
      if (!isHead(userRole)) {
        throw new AccessDeniedException('Guests, members, and leadership cannot update user roles!');
      }

      if (targetUserRankedRole >= userRankedRole) {
        throw new AccessDeniedException('Cannot change the role of a user with an equal or higher role than you');
      }

      if (userRole === RoleEnum.HEAD && rankUserRole(role) >= userRankedRole) {
        throw new AccessDeniedException('Heads can only promote to leadership or below');
      }

      if (rankUserRole(role) > userRankedRole) {
        throw new AccessDeniedException('Cannot promote user to a higher role than yourself');
      }
    }

    await prisma.role.upsert({
      where: { uniqueRole: { userId: targetUserId, organizationId: organization.organizationId } },
      update: { roleType: role },
      create: { userId: targetUserId, organizationId: organization.organizationId, roleType: role }
    });

    return userTransformer({ ...targetUser, roles: [{ ...targetUser.roles[0], roleType: role }] });
  }

  /**
   * Gets a user's secure settings
   * @param userId the id of user who's secure settings are being returned
   * @param submitter the user who is requesting the user's secure settings
   * @param organizationId the id of the organization the user is in
   */
  static async getUserSecureSetting(
    userId: string,
    submitter: User,
    organization: Organization
  ): Promise<UserSecureSettings> {
    await validateUserIsPartOfFinanceTeamOrHead(submitter, organization.organizationId);
    const secureSettings = await prisma.user_Secure_Settings.findUnique({
      where: { userId },
      include: {
        user: {
          include: {
            organizations: true
          }
        }
      }
    });

    if (!secureSettings) throw new HttpException(404, 'User Secure Settings Not Found');
    const { user } = secureSettings;

    if (!user) throw new NotFoundException('User', userId);
    if (!user.organizations.map((org) => org.organizationId).includes(organization.organizationId))
      throw new AccessDeniedException('This user is not in your organization!');

    return userSecureSettingsTransformer(secureSettings);
  }

  /**
   * Sets the user's secure settings
   * @param user the user to set the secure settings for
   * @param nuid the users nuid
   * @param street the users street address
   * @param city the users city
   * @param state the users state
   * @param zipcode the users zipcode
   * @returns the id of the user's secure settings
   */
  static async setUserSecureSettings(
    user: User,
    nuid: string,
    street: string,
    city: string,
    state: string,
    zipcode: string,
    phoneNumber: string
  ): Promise<string> {
    const newUserSecureSettings = await prisma.user_Secure_Settings.upsert({
      where: { userId: user.userId },
      update: {
        nuid,
        street,
        city,
        state,
        zipcode,
        phoneNumber
      },
      create: {
        userId: user.userId,
        nuid,
        street,
        city,
        state,
        zipcode,
        phoneNumber
      }
    });

    return newUserSecureSettings.userSecureSettingsId;
  }

  /**
   * Gets a user's schedule settings
   * @param userId the id of the user who's schedule settings are being returned
   * @param submitter the user who's requesting the schedule settings
   * @returns the user's schedule settings
   * @throws if the user doesn't have schedule settings
   */
  static async getUserScheduleSettings(userId: string, submitter: User): Promise<UserScheduleSettings> {
    if (submitter.userId !== userId) throw new AccessDeniedException('You can only access your own schedule settings');
    const scheduleSettings = await prisma.schedule_Settings.findUnique({
      where: { userId },
      ...getUserScheduleSettingsQueryArgs()
    });
    if (!scheduleSettings) throw new HttpException(404, 'User Schedule Settings Not Found');

    return userScheduleSettingsTransformer(scheduleSettings);
  }

  /**
   *
   * @param user the user to set the schedule settings for
   * @param personalGmail the user's personal gmail
   * @param personalZoomLink the user's personal zoom link
   * @param availabilities the user's availibility
   * @returns the id of the user's schedule settings
   */
  static async setUserScheduleSettings(
    user: User,
    personalGmail: string,
    personalZoomLink: string,
    availabilities: AvailabilityCreateArgs[]
  ): Promise<UserScheduleSettings> {
    if (personalGmail !== '') {
      const existingUser = await prisma.schedule_Settings.findFirst({
        where: { personalGmail, userId: { not: user.userId } } // excludes the current user from check
      });

      if (existingUser) {
        throw new HttpException(400, 'Email already in use');
      }
    }

    const newUserScheduleSettings = await prisma.schedule_Settings.upsert({
      where: { userId: user.userId },
      update: {
        personalGmail,
        personalZoomLink
      },
      create: {
        userId: user.userId,
        personalGmail,
        personalZoomLink
      },
      ...getUserScheduleSettingsQueryArgs()
    });

    await updateUserAvailability(availabilities, newUserScheduleSettings, user);

    return userScheduleSettingsTransformer(newUserScheduleSettings);
  }

  /**
   * Get's a user's assigned tasks
   * @param userId the id of the user who's tasks are being returned
   * @param organization the user's organization
   * @returns a list of the user's assigned tasks
   */
  static async getUserTasks(userId: string, organization: Organization) {
    const requestedUser = await prisma.user.findUnique({
      where: { userId },
      include: {
        assignedTasks: { where: { dateDeleted: null }, ...getTaskQueryArgs(organization.organizationId) },
        organizations: true
      }
    });
    if (!requestedUser) throw new NotFoundException('User', userId);
    if (!requestedUser.organizations.map((org) => org.organizationId).includes(organization.organizationId))
      throw new HttpException(400, `User ${userId} is not apart of the current organization`);

    return requestedUser.assignedTasks.map(taskTransformer);
  }

  /**
   * Get all tasks from a list of userIds
   * @param userIds list of users to get the tasks from
   * @param organization the users' organization
   * @returns a list of tasks of the given users
   */
  static async getManyUserTasks(userIds: string[], organization: Organization) {
    const tasksPromises = userIds.map(async (userId) => {
      return UsersService.getUserTasks(userId, organization);
    });

    const resolvedTasks = await Promise.all(tasksPromises);
    return resolvedTasks.flat();
  }

  /**
   * Gets many users with their schedule settings
   * @param userIds list of userIds to get the users and their schedule settings from
   * @param organization the users' organization
   * @returns a list of users with their schedule settings
   */
  static async getManyUsersWithScheduleSettings(
    userIds: string[],
    organization: Organization
  ): Promise<UserWithScheduleSettings[]> {
    const users = await prisma.user.findMany({
      where: {
        userId: { in: userIds },
        organizations: { some: { organizationId: organization.organizationId } }
      },
      include: {
        drScheduleSettings: getUserScheduleSettingsQueryArgs(),
        roles: true,
        organizations: true,
        userSettings: true
      }
    });

    const missingUserIds = userIds.filter((id) => !users.some((user) => user.userId === id));
    if (missingUserIds.length > 0) {
      throw new NotFoundException('User', missingUserIds.join(', '));
    }

    return users.map(userWithScheduleSettingsTransformer);
  }
}
