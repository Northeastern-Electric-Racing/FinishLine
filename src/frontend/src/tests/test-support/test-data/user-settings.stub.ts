/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { UserSettings } from 'shared';

export const exampleUserSettingsLight: UserSettings = {
  id: 'abc123',
  defaultTheme: 'LIGHT',
  slackId: 'sdfsdvsd',
  userSecureSettingsId: 'abc123',
  nuid: '123456789',
  street: '1234 Main St',
  city: 'Omaha',
  state: 'NE',
  zipcode: '68102',
  phoneNumber: '402-555-5555'
};

export const exampleUserSettingsDark: UserSettings = {
  id: 'def456',
  defaultTheme: 'DARK',
  slackId: 'lalalal',
  userSecureSettingsId: 'abc123',
  nuid: '123456789',
  street: '1234 Main St',
  city: 'Omaha',
  state: 'NE',
  zipcode: '68102',
  phoneNumber: '402-555-5555'
};

export const exampleAllUserSettings: UserSettings[] = [exampleUserSettingsLight, exampleUserSettingsDark];
