import { Organization, User } from '@prisma/client';
import { createSlackMessageEvent, createTestOrganization, createTestUser, resetUsers } from '../test-utils';
import {
  batmanAppAdmin,
  batmanSettings,
  supermanAdmin,
  supermanSettings,
  wonderwomanGuest,
  wonderwomanSettings
} from '../test-data/users.test-data';
import * as apiFunctions from '../../src/integrations/slack';
import AnnouncementService from '../../src/services/announcement.service';
import slackServices from '../../src/services/slack.services';
import { vi } from 'vitest';
import { HttpException } from '../../src/utils/errors.utils';

vi.mock('../../src/integrations/slack', async (importOriginal) => {
  return {
    ...(await importOriginal<typeof import('../../src/integrations/slack')>()),
    getUserName: vi.fn(),
    getChannelName: vi.fn(),
    getUsersInChannel: vi.fn()
  };
});

describe('Slack message tests', () => {
  let orgId: string;
  let organization: Organization;
  let batman: User;
  let superman: User;
  let wonderwoman: User;

  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
    batman = await createTestUser(batmanAppAdmin, orgId, batmanSettings);
    superman = await createTestUser(supermanAdmin, orgId, supermanSettings);
    wonderwoman = await createTestUser(wonderwomanGuest, orgId, wonderwomanSettings);
  });

  afterEach(async () => {
    await resetUsers();
    vi.clearAllMocks();
  });

  it('adds message to everyone with @everyone', async () => {
    vi.mocked(apiFunctions.getUserName).mockReturnValue(Promise.resolve('Slack User Name'));
    vi.mocked(apiFunctions.getChannelName).mockReturnValue(Promise.resolve('Slack Channel Name'));

    const spy = vi.spyOn(AnnouncementService, 'createAnnouncement');

    const announcement = await slackServices.processMessageSent(
      createSlackMessageEvent('channel id', '1000000000000', 'user name', 'id_1', [
        { type: 'text', text: 'test with ' },
        { type: 'broadcast', range: 'everyone' },
        { type: 'text', text: ' broadcast (@everyone)' }
      ]),
      orgId
    );

    console.log(announcement);

    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith(
      'test with @everyone broadcast (@everyone)',
      [organization.userCreatedId, batman.userId, superman.userId, wonderwoman.userId],
      new Date(1000000000000),
      'Slack User Name',
      'id_1',
      'Slack Channel Name',
      orgId
    );

    expect(announcement?.text).toBe('test with @everyone broadcast (@everyone)');
    expect(announcement?.dateCreated.toDateString()).toBe(new Date(1000000000000).toDateString());
    expect(announcement?.senderName).toBe('Slack User Name');
    expect(announcement?.slackChannelName).toBe('Slack Channel Name');
    expect(announcement?.slackEventId).toBe('id_1');
    expect(announcement?.usersReceived).toHaveLength(4);
  });

  it('Adds message to people in channel with @channel and @mention (w/o duplicates)', async () => {
    vi.mocked(apiFunctions.getUserName).mockReturnValue(Promise.resolve('Slack User Name'));
    vi.mocked(apiFunctions.getChannelName).mockReturnValue(Promise.resolve('Slack Channel Name'));
    vi.mocked(apiFunctions.getUsersInChannel).mockReturnValue(Promise.resolve(['slack', 'slackWW']));

    const spy = vi.spyOn(AnnouncementService, 'createAnnouncement');

    const announcement = await slackServices.processMessageSent(
      createSlackMessageEvent('channel id', '1000000000000', 'user name', 'id_1', [
        { type: 'text', text: 'test with ' },
        { type: 'broadcast', range: 'channel' },
        { type: 'text', text: ' broadcast (@channel)' },
        { type: 'user', user_id: 'slackWW' },
        { type: 'user', user_id: 'slackSM' }
      ]),
      orgId
    );

    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith(
      'test with @channel broadcast (@channel)@Slack User Name@Slack User Name',
      [batman.userId, wonderwoman.userId, superman.userId],
      new Date(1000000000000),
      'Slack User Name',
      'id_1',
      'Slack Channel Name',
      orgId
    );

    expect(announcement?.text).toBe('test with @channel broadcast (@channel)@Slack User Name@Slack User Name');
    expect(announcement?.dateCreated.toDateString()).toBe(new Date(1000000000000).toDateString());
    expect(announcement?.senderName).toBe('Slack User Name');
    expect(announcement?.slackChannelName).toBe('Slack Channel Name');
    expect(announcement?.slackEventId).toBe('id_1');
    expect(announcement?.usersReceived).toHaveLength(3);
  });

  it('Sends the announcement to a single person with a mention', async () => {
    vi.mocked(apiFunctions.getUserName).mockReturnValue(Promise.resolve('Slack User Name'));
    vi.mocked(apiFunctions.getChannelName).mockReturnValue(Promise.resolve('Slack Channel Name'));

    const spy = vi.spyOn(AnnouncementService, 'createAnnouncement');

    const announcement = await slackServices.processMessageSent(
      createSlackMessageEvent('channel id', '1000000000000', 'user name', 'id_1', [
        { type: 'text', text: 'test with ' },
        { type: 'user', user_id: 'slackWW' },
        { type: 'text', text: ' broadcast (@wonderwoman)' }
      ]),
      orgId
    );

    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith(
      'test with @Slack User Name broadcast (@wonderwoman)',
      [wonderwoman.userId],
      new Date(1000000000000),
      'Slack User Name',
      'id_1',
      'Slack Channel Name',
      orgId
    );

    expect(announcement?.text).toBe('test with @Slack User Name broadcast (@wonderwoman)');
    expect(announcement?.dateCreated.toDateString()).toBe(new Date(1000000000000).toDateString());
    expect(announcement?.senderName).toBe('Slack User Name');
    expect(announcement?.slackChannelName).toBe('Slack Channel Name');
    expect(announcement?.slackEventId).toBe('id_1');
    expect(announcement?.usersReceived).toHaveLength(1);
  });

  it('Correctly processes other types of blocks', async () => {
    vi.mocked(apiFunctions.getUserName).mockReturnValue(Promise.resolve('Slack User Name'));
    vi.mocked(apiFunctions.getChannelName).mockReturnValue(Promise.resolve('Slack Channel Name'));

    const spy = vi.spyOn(AnnouncementService, 'createAnnouncement');

    const announcement = await slackServices.processMessageSent(
      createSlackMessageEvent('channel id', '1000000000000', 'user name', 'id_1', [
        { type: 'text', text: 'test with: ' },
        { type: 'link', url: 'http://www.example.com', text: 'link' },
        { type: 'text', text: 'Italics', style: { italic: true } },
        { type: 'text', text: ' and a unicode emoji: ' },
        {
          type: 'emoji',
          name: 'stuck_out_tongue_closed_eyes',
          unicode: '1f61d'
        },
        { type: 'text', text: ' and a slack emoji: ' },
        {
          type: 'emoji',
          name: 'birthday-parrot'
        },
        { type: 'user', user_id: 'slackWW' }
      ]),
      orgId
    );

    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith(
      'test with: link:(http://www.example.com)Italics and a unicode emoji: 😝 and a slack emoji: emoji:birthday-parrot@Slack User Name',
      [wonderwoman.userId],
      new Date(1000000000000),
      'Slack User Name',
      'id_1',
      'Slack Channel Name',
      orgId
    );

    expect(announcement?.text).toBe(
      'test with: link:(http://www.example.com)Italics and a unicode emoji: 😝 and a slack emoji: emoji:birthday-parrot@Slack User Name'
    );
    expect(announcement?.dateCreated.toDateString()).toBe(new Date(1000000000000).toDateString());
    expect(announcement?.senderName).toBe('Slack User Name');
    expect(announcement?.slackChannelName).toBe('Slack Channel Name');
    expect(announcement?.slackEventId).toBe('id_1');
    expect(announcement?.usersReceived).toHaveLength(1);
  });

  it('Deals with errors from slack API', async () => {
    vi.mocked(apiFunctions.getUserName).mockImplementation(() => {
      throw new HttpException(500, 'sample error');
    });
    vi.mocked(apiFunctions.getChannelName).mockImplementation(() => {
      throw new HttpException(500, 'sample error');
    });

    const spy = vi.spyOn(AnnouncementService, 'createAnnouncement');

    const announcement = await slackServices.processMessageSent(
      createSlackMessageEvent('channel id', '1000000000000', 'slackWW', 'id_1', [
        { type: 'user', user_id: 'slackWW' },
        { type: 'text', text: ' prisma user and non-prisma user ' },
        { type: 'user', user_id: 'non-prisma-slack-id' }
      ]),
      orgId
    );

    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith(
      '@Unknown_User:slackWW prisma user and non-prisma user @Unknown_User:non-prisma-slack-id',
      [wonderwoman.userId],
      new Date(1000000000000),
      'Wonder Woman',
      'id_1',
      'Unknown_Channel:channel id',
      orgId
    );

    expect(announcement?.text).toBe(
      '@Unknown_User:slackWW prisma user and non-prisma user @Unknown_User:non-prisma-slack-id'
    );
    expect(announcement?.dateCreated.toDateString()).toBe(new Date(1000000000000).toDateString());
    expect(announcement?.senderName).toBe('Wonder Woman');
    expect(announcement?.slackChannelName).toBe('Unknown_Channel:channel id');
    expect(announcement?.slackEventId).toBe('id_1');
    expect(announcement?.usersReceived).toHaveLength(1);
  });

  it("Doesn't create an announcement if no one is mentioned", async () => {
    vi.mocked(apiFunctions.getUserName).mockReturnValue(Promise.resolve('Slack User Name'));
    vi.mocked(apiFunctions.getChannelName).mockReturnValue(Promise.resolve('Slack Channel Name'));

    const spy = vi.spyOn(AnnouncementService, 'createAnnouncement');

    const announcement = await slackServices.processMessageSent(
      createSlackMessageEvent('channel id', '1000000000000', 'user name', 'id_1', [
        { type: 'text', text: 'just a text message' }
      ]),
      orgId
    );

    expect(spy).toBeCalledTimes(0);

    expect(announcement).toBeUndefined();
  });

  it('Does nothing if an announcement with the same slack id has already been created', async () => {
    vi.mocked(apiFunctions.getUserName).mockReturnValue(Promise.resolve('Slack User Name'));
    vi.mocked(apiFunctions.getChannelName).mockReturnValue(Promise.resolve('Slack Channel Name'));

    const createSpy = vi.spyOn(AnnouncementService, 'createAnnouncement');

    await slackServices.processMessageSent(
      createSlackMessageEvent('channel id', '1000000000000', 'user name', 'id_1', [{ type: 'user', user_id: 'slackWW' }]),
      orgId
    );
    expect(createSpy).toBeCalledWith(
      '@Slack User Name',
      [wonderwoman.userId],
      new Date(1000000000000),
      'Slack User Name',
      'id_1',
      'Slack Channel Name',
      orgId
    );

    const announcement2 = await slackServices.processMessageSent(
      createSlackMessageEvent('channel id', '1000000000000', 'user name', 'id_1', [
        { type: 'user', user_id: 'slackWW' },
        { type: 'text', text: ' added text' }
      ]),
      orgId
    );
    expect(announcement2).toBeUndefined();
  });

  it('Updates an edit made to a message', async () => {
    vi.mocked(apiFunctions.getUserName).mockReturnValue(Promise.resolve('Slack User Name'));
    vi.mocked(apiFunctions.getChannelName).mockReturnValue(Promise.resolve('Slack Channel Name'));

    const createSpy = vi.spyOn(AnnouncementService, 'createAnnouncement');
    const updateSpy = vi.spyOn(AnnouncementService, 'updateAnnouncement');

    await slackServices.processMessageSent(
      createSlackMessageEvent('channel id', '1000000000000', 'user name', 'id_1', [{ type: 'user', user_id: 'slackWW' }]),
      orgId
    );
    expect(createSpy).toBeCalledWith(
      '@Slack User Name',
      [wonderwoman.userId],
      new Date(1000000000000),
      'Slack User Name',
      'id_1',
      'Slack Channel Name',
      orgId
    );

    const announcement2 = await slackServices.processMessageSent(
      {
        type: 'message',
        subtype: 'message_changed',
        channel: 'channel id',
        event_ts: '1000000000000',
        channel_type: 'channel',
        message: createSlackMessageEvent('channel id', '1000000000000', 'user name', 'id_1', [
          { type: 'user', user_id: 'slackWW' },
          { type: 'text', text: ' added text' }
        ]),
        previous_message: createSlackMessageEvent('channel id', '1000000000000', 'user name', 'id_1', [
          { type: 'user', user_id: 'slackWW' }
        ])
      },
      orgId
    );

    expect(updateSpy).toBeCalledWith(
      '@Slack User Name added text',
      [wonderwoman.userId],
      new Date(1000000000000),
      'Slack User Name',
      'id_1',
      'Slack Channel Name',
      orgId
    );

    expect(announcement2?.text).toBe('@Slack User Name added text');
    expect(announcement2?.dateCreated.toDateString()).toBe(new Date(1000000000000).toDateString());
    expect(announcement2?.senderName).toBe('Slack User Name');
    expect(announcement2?.slackChannelName).toBe('Slack Channel Name');
    expect(announcement2?.slackEventId).toBe('id_1');
    expect(announcement2?.usersReceived).toHaveLength(1);

    expect(createSpy).toBeCalledTimes(1);
    expect(updateSpy).toBeCalledTimes(1);
  });

  it('Creates a new announcement if the announcement to update is not found', async () => {
    vi.mocked(apiFunctions.getUserName).mockReturnValue(Promise.resolve('Slack User Name'));
    vi.mocked(apiFunctions.getChannelName).mockReturnValue(Promise.resolve('Slack Channel Name'));

    const createSpy = vi.spyOn(AnnouncementService, 'createAnnouncement');
    const updateSpy = vi.spyOn(AnnouncementService, 'updateAnnouncement');

    const announcement2 = await slackServices.processMessageSent(
      {
        type: 'message',
        subtype: 'message_changed',
        channel: 'channel id',
        event_ts: '1000000000000',
        channel_type: 'channel',
        message: createSlackMessageEvent('channel id', '1000000000000', 'user name', 'id_1', [
          { type: 'user', user_id: 'slackWW' },
          { type: 'text', text: ' added text' }
        ]),
        previous_message: createSlackMessageEvent('channel id', '1000000000000', 'user name', 'id_1', [
          { type: 'user', user_id: 'slackWW' }
        ])
      },
      orgId
    );

    expect(updateSpy).toBeCalledWith(
      '@Slack User Name added text',
      [wonderwoman.userId],
      new Date(1000000000000),
      'Slack User Name',
      'id_1',
      'Slack Channel Name',
      orgId
    );

    expect(createSpy).toBeCalledWith(
      '@Slack User Name added text',
      [wonderwoman.userId],
      new Date(1000000000000),
      'Slack User Name',
      'id_1',
      'Slack Channel Name',
      orgId
    );

    expect(announcement2?.text).toBe('@Slack User Name added text');
    expect(announcement2?.dateCreated.toDateString()).toBe(new Date(1000000000000).toDateString());
    expect(announcement2?.senderName).toBe('Slack User Name');
    expect(announcement2?.slackChannelName).toBe('Slack Channel Name');
    expect(announcement2?.slackEventId).toBe('id_1');
    expect(announcement2?.usersReceived).toHaveLength(1);

    expect(createSpy).toBeCalledTimes(1);
    expect(updateSpy).toBeCalledTimes(1);
  });

  it('Creates and deletes and announcement', async () => {
    vi.mocked(apiFunctions.getUserName).mockReturnValue(Promise.resolve('Slack User Name'));
    vi.mocked(apiFunctions.getChannelName).mockReturnValue(Promise.resolve('Slack Channel Name'));

    const createSpy = vi.spyOn(AnnouncementService, 'createAnnouncement');
    const deleteSpy = vi.spyOn(AnnouncementService, 'deleteAnnouncement');

    await slackServices.processMessageSent(
      createSlackMessageEvent('channel id', '1000000000000', 'user name', 'id_1', [{ type: 'user', user_id: 'slackWW' }]),
      orgId
    );
    expect(createSpy).toBeCalledWith(
      '@Slack User Name',
      [wonderwoman.userId],
      new Date(1000000000000),
      'Slack User Name',
      'id_1',
      'Slack Channel Name',
      orgId
    );

    await slackServices.processMessageSent(
      {
        type: 'message',
        subtype: 'message_deleted',
        channel: 'channel id',
        event_ts: '1000000000000',
        channel_type: 'channel',
        previous_message: createSlackMessageEvent('channel id', '1000000000000', 'user name', 'id_1', [
          { type: 'user', user_id: 'slackWW' }
        ])
      },
      orgId
    );
    expect(createSpy).toBeCalledTimes(1);
    expect(deleteSpy).toBeCalledTimes(1);
    expect(deleteSpy).toBeCalledWith('id_1', orgId);
  });

  it('Does nothing if recieves other message subtype', async () => {
    vi.mocked(apiFunctions.getUserName).mockReturnValue(Promise.resolve('Slack User Name'));
    vi.mocked(apiFunctions.getChannelName).mockReturnValue(Promise.resolve('Slack Channel Name'));

    const createSpy = vi.spyOn(AnnouncementService, 'createAnnouncement');

    const announcement = await slackServices.processMessageSent(
      {
        type: 'message',
        subtype: 'other-nonprocessed-subtype',
        channel: 'channel id',
        event_ts: '1000000000000',
        channel_type: 'channel',
        bogus_data: 'other data'
      },
      orgId
    );
    expect(createSpy).toBeCalledTimes(0);
    expect(announcement).toBeUndefined();
  });
});
