/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { UserSettings } from 'shared';

export const exampleUserSettingsLight: UserSettings = {
  id: 'abc123',
  defaultTheme: 'LIGHT',
  slackId: 'sdfsdvsd',
  address: '1234 Main St',
  phone: '123-456-7890',
  nuid: '123456789'
};

export const exampleUserSettingsDark: UserSettings = {
  id: 'def456',
  defaultTheme: 'DARK',
  slackId: 'lalalal',
  address: '4321 Main St',
  phone: '098-765-4321',
  nuid: '987654321'
};

export const exampleAllUserSettings: UserSettings[] = [exampleUserSettingsLight, exampleUserSettingsDark];
