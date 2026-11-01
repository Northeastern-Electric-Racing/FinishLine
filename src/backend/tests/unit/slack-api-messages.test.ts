import { Organization, User } from '@prisma/client';
import { Mock, vi } from 'vitest';
import SlackServices from '../../src/services/slack.services.js';
import { AccessDeniedException, HttpException, NotFoundException } from '../../src/utils/errors.utils.js';
import { batmanAppAdmin, member, supermanAdmin } from '../test-data/users.test-data.js';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils.js';
import prisma from '../../src/prisma/prisma.js';
import { getChannelInfo, getWorkspaceId, postMessageToChannel } from '../../src/integrations/slack.js';

vi.mock('../../src/integrations/slack.js', () => ({
  getChannelInfo: vi.fn(),
  getChannelName: vi.fn(),
  getUserName: vi.fn(),
  getWorkspaceId: vi.fn(),
  postMessageToChannel: vi.fn()
}));

const WORKSPACE_ID = 'T0WORKSPACE';
const CHANNEL_ID = 'C0123456789';

describe('Slack API Messages', () => {
  let organization: Organization;
  let admin: User;

  beforeEach(async () => {
    vi.clearAllMocks();
    organization = await createTestOrganization();
    organization = await prisma.organization.update({
      where: { organizationId: organization.organizationId },
      data: { slackWorkspaceId: WORKSPACE_ID }
    });
    admin = await createTestUser(supermanAdmin, organization.organizationId);

    (getWorkspaceId as Mock).mockResolvedValue(WORKSPACE_ID);
    (getChannelInfo as Mock).mockResolvedValue({ name: 'general', isArchived: false, isMember: true });
    (postMessageToChannel as Mock).mockResolvedValue({ channelId: CHANNEL_ID, ts: '123.456' });
  });

  afterEach(async () => {
    await resetUsers();
  });

  it('sends the message and reports where it went', async () => {
    const result = await SlackServices.sendMessageToChannel(admin.userId, organization, CHANNEL_ID, 'hello team');

    expect(postMessageToChannel).toHaveBeenCalledWith(CHANNEL_ID, 'hello team');
    expect(result).toEqual({ channelId: CHANNEL_ID, channelName: 'general', ts: '123.456' });
  });

  it('allows app admins', async () => {
    const appAdmin = await createTestUser(batmanAppAdmin, organization.organizationId);

    await SlackServices.sendMessageToChannel(appAdmin.userId, organization, CHANNEL_ID, 'hi');

    expect(postMessageToChannel).toHaveBeenCalled();
  });

  it('escapes slack control characters so mentions and links are not rendered', async () => {
    await SlackServices.sendMessageToChannel(admin.userId, organization, CHANNEL_ID, '<!channel> a & b <https://x.com|x>');

    expect(postMessageToChannel).toHaveBeenCalledWith(CHANNEL_ID, '&lt;!channel&gt; a &amp; b &lt;https://x.com|x&gt;');
  });

  it('rejects non admins', async () => {
    const regularMember = await createTestUser(member, organization.organizationId);

    await expect(
      SlackServices.sendMessageToChannel(regularMember.userId, organization, CHANNEL_ID, 'hi')
    ).rejects.toBeInstanceOf(AccessDeniedException);
    expect(postMessageToChannel).not.toHaveBeenCalled();
  });

  it("rejects organizations not linked to the bot's workspace", async () => {
    (getWorkspaceId as Mock).mockResolvedValue('T0OTHER');

    await expect(SlackServices.sendMessageToChannel(admin.userId, organization, CHANNEL_ID, 'hi')).rejects.toBeInstanceOf(
      AccessDeniedException
    );
    expect(postMessageToChannel).not.toHaveBeenCalled();
  });

  it('rejects organizations with no slack workspace', async () => {
    const unlinked = await prisma.organization.update({
      where: { organizationId: organization.organizationId },
      data: { slackWorkspaceId: null }
    });

    await expect(SlackServices.sendMessageToChannel(admin.userId, unlinked, CHANNEL_ID, 'hi')).rejects.toBeInstanceOf(
      AccessDeniedException
    );
  });

  it('reports a channel that does not exist', async () => {
    (getChannelInfo as Mock).mockResolvedValue(undefined);

    await expect(SlackServices.sendMessageToChannel(admin.userId, organization, CHANNEL_ID, 'hi')).rejects.toEqual(
      new NotFoundException('Slack Channel', CHANNEL_ID)
    );
    expect(postMessageToChannel).not.toHaveBeenCalled();
  });

  it('reports an archived channel', async () => {
    (getChannelInfo as Mock).mockResolvedValue({ name: 'old', isArchived: true, isMember: true });

    await expect(SlackServices.sendMessageToChannel(admin.userId, organization, CHANNEL_ID, 'hi')).rejects.toEqual(
      new HttpException(400, 'Slack channel #old is archived')
    );
  });

  it('reports a channel the bot is not in', async () => {
    (getChannelInfo as Mock).mockResolvedValue({ name: 'secret', isArchived: false, isMember: false });

    await expect(SlackServices.sendMessageToChannel(admin.userId, organization, CHANNEL_ID, 'hi')).rejects.toEqual(
      new HttpException(
        400,
        'The FinishLine bot is not a member of #secret, add it to the channel before sending messages there'
      )
    );
    expect(postMessageToChannel).not.toHaveBeenCalled();
  });
});
