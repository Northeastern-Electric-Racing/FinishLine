import prisma from '../prisma/prisma';
import { OAuth2Client } from 'google-auth-library';
import {
  authenticatedUserTransformer,
  authUserQueryArgs,
  userTransformer
} from '../utils/users.utils';

export const getAllUsers = async (_req: any, res: any) => {
  const users = await prisma.user.findMany();
  users.sort((a, b) => a.firstName.localeCompare(b.firstName));
  res.status(200).json(users.map(userTransformer));
};

export const getSingleUser = async (req: any, res: any) => {
  const userId: number = parseInt(req.params.userId);
  const requestedUser = await prisma.user.findUnique({ where: { userId } });
  if (!requestedUser) return res.status(404).json({ message: `user #${userId} not found!` });

  res.status(200).json(userTransformer(requestedUser));
};

export const getUserSettings = async (req: any, res: any) => {
  const userId: number = parseInt(req.params.userId);

  const requestedUser = await prisma.user.findUnique({ where: { userId } });

  if (!requestedUser) return res.status(404).json({ message: `user #${userId} not found!` });

  const settings = await prisma.user_Settings.upsert({
    where: { userId },
    update: {},
    create: { userId }
  });

  if (!settings)
    return res.status(404).json({ message: `could not find settings for user #${userId}` });

  return res.status(200).json(settings);
};

export const updateUserSettings = async (req: any, res: any) => {
  const userId: number = parseInt(req.params.userId);
  if (!req.body || !req.body.defaultTheme) {
    return res.status(404).json({ message: 'No settings found to update.' });
  }

  await prisma.user_Settings.upsert({
    where: { userId },
    update: { defaultTheme: req.body.defaultTheme },
    create: { userId, defaultTheme: req.body.defaultTheme }
  });

  return res.status(200).json({ message: `Successfully updated settings for user ${userId}.` });
};

export const logUserIn = async (req: any, res: any) => {
  if (!req.body || !req.body.id_token) return res.status(400).json({ message: 'Invalid Body' });

  // eslint-disable-next-line prefer-destructuring
  const idToken = req.body.id_token;

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
    ...authUserQueryArgs
  });

  // if not in database, create user in database
  if (!user) {
    const emailId = payload['email']!.includes('@husky.neu.edu')
      ? payload['email']!.split('@')[0]
      : null;
    const createdUser = await prisma.user.create({
      data: {
        firstName: payload['given_name']!,
        lastName: payload['family_name']!,
        googleAuthId: userId,
        email: payload['email']!,
        emailId,
        userSettings: { create: {} }
      },
      ...authUserQueryArgs
    });
    user = createdUser;
  }

  // register a login
  await prisma.session.create({
    data: {
      userId: user.userId,
      deviceInfo: req.headers['user-agent']
    }
  });

  return res.status(200).json(authenticatedUserTransformer(user));
};
