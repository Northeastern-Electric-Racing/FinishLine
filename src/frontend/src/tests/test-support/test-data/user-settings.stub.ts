/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { UserSettings } from 'shared';

export const exampleUserSettingsLight: UserSettings = {
  id: 'abc123',
  defaultTheme: 'LIGHT',
  slackId: 'sdfsdvsd'
};

export const exampleUserSettingsDark: UserSettings = {
  id: 'def456',
  defaultTheme: 'DARK',
  slackId: 'lalalal'
};

export const exampleAllUserSettings: UserSettings[] = [exampleUserSettingsLight, exampleUserSettingsDark];
