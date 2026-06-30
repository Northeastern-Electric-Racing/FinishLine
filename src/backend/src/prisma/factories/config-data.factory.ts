import { Prisma } from '@prisma/client';
import { connectOrganization, connectUser } from '../utils/common.factory.js';

const SEED_CREATED_AT = new Date('2024-01-01T00:00:00.000Z');

export const teamTypeCreateInputs = (organizationId: string): Prisma.Team_TypeCreateInput[] => [
  {
    name: 'Mechanical',
    iconName: 'Construction',
    description: 'This is the mechanical team',
    organization: connectOrganization(organizationId)
  },
  {
    name: 'Software',
    iconName: 'Code',
    description: 'This is the software team',
    organization: connectOrganization(organizationId)
  },
  {
    name: 'Electrical',
    iconName: 'ElectricBolt',
    description: 'This is the electrical team',
    organization: connectOrganization(organizationId)
  },
  {
    name: 'Business',
    iconName: 'AttachMoney',
    description: 'This is the business team',
    organization: connectOrganization(organizationId)
  }
];

export const linkTypeCreateInputs = (creatorId: string, organizationId: string): Prisma.Link_TypeCreateInput[] => [
  {
    name: 'Google Drive',
    iconName: 'add_to_drive',
    required: false,
    isOnGuestHomePage: false,
    creator: connectUser(creatorId),
    organization: connectOrganization(organizationId)
  },
  {
    name: 'Confluence',
    iconName: 'article',
    required: false,
    isOnGuestHomePage: false,
    creator: connectUser(creatorId),
    organization: connectOrganization(organizationId)
  },
  {
    name: 'Github',
    iconName: 'code',
    required: false,
    isOnGuestHomePage: false,
    creator: connectUser(creatorId),
    organization: connectOrganization(organizationId)
  },
  {
    name: 'Altium',
    iconName: 'electric_bolt',
    required: false,
    isOnGuestHomePage: false,
    creator: connectUser(creatorId),
    organization: connectOrganization(organizationId)
  },
  {
    name: 'Application',
    iconName: 'ballot',
    required: false,
    isOnGuestHomePage: false,
    creator: connectUser(creatorId),
    organization: connectOrganization(organizationId)
  },
  {
    name: 'Sign Ups',
    iconName: 'ballot',
    required: false,
    isOnGuestHomePage: false,
    creator: connectUser(creatorId),
    organization: connectOrganization(organizationId)
  },
  {
    name: 'facebook',
    iconName: 'facebook',
    required: false,
    isOnGuestHomePage: true,
    creator: connectUser(creatorId),
    organization: connectOrganization(organizationId)
  },
  {
    name: 'Instagram',
    iconName: 'Instagram',
    required: false,
    isOnGuestHomePage: true,
    creator: connectUser(creatorId),
    organization: connectOrganization(organizationId)
  }
];

export const descriptionBulletTypeCreateInputs = (
  userCreatedId: string,
  organizationId: string
): Prisma.Description_Bullet_TypeCreateInput[] => [
  {
    name: 'Description',
    projectRequired: true,
    workPackageRequired: true,
    userCreated: connectUser(userCreatedId),
    organization: connectOrganization(organizationId)
  },
  {
    name: 'Expected Activities',
    projectRequired: false,
    workPackageRequired: true,
    userCreated: connectUser(userCreatedId),
    organization: connectOrganization(organizationId)
  },
  {
    name: 'Deliverables',
    projectRequired: false,
    workPackageRequired: true,
    userCreated: connectUser(userCreatedId),
    organization: connectOrganization(organizationId)
  }
];

export const materialTypeCreateInputs = (userCreatedId: string, organizationId: string): Prisma.Material_TypeCreateInput[] =>
  ['Resistor', 'Aluminum', 'Steel', 'Carbon Fiber', 'Fastener', 'Electronics', 'Sensor'].map((name) => ({
    name,
    dateCreated: SEED_CREATED_AT,
    userCreated: connectUser(userCreatedId),
    organization: connectOrganization(organizationId)
  }));

export const manufacturerCreateInputs = (userCreatedId: string, organizationId: string): Prisma.ManufacturerCreateInput[] =>
  ['Digikey', 'McMaster-Carr', 'Mouser', 'SendCutSend', 'Misumi', 'Amazon Business'].map((name) => ({
    name,
    dateCreated: SEED_CREATED_AT,
    userCreated: connectUser(userCreatedId),
    organization: connectOrganization(organizationId)
  }));

export const unitCreateInputs = (userCreatedId: string, organizationId: string): Prisma.UnitCreateInput[] =>
  ['each', 'ft', 'in', 'lb', 'oz', 'kg', 'm', 'mm', 'pack', 'sheet'].map((name) => ({
    name,
    userCreated: connectUser(userCreatedId),
    organization: connectOrganization(organizationId)
  }));

export const accountCodeCreateInputs = (organizationId: string): Prisma.Account_CodeCreateInput[] => [
  {
    name: 'Subscriptions',
    code: 73201,
    allowed: true,
    amount: 5000,
    organization: connectOrganization(organizationId)
  },
  {
    name: 'Travel-Auto/Van Rental',
    code: 73026,
    allowed: true,
    amount: 12000,
    organization: connectOrganization(organizationId)
  },
  {
    name: 'Travel-Misc',
    code: 73030,
    allowed: true,
    amount: 8000,
    organization: connectOrganization(organizationId)
  },
  {
    name: 'Competition-Registration',
    code: 74310,
    allowed: true,
    amount: 15000,
    organization: connectOrganization(organizationId)
  },
  {
    name: 'Food',
    code: 74320,
    allowed: true,
    amount: 3000,
    organization: connectOrganization(organizationId)
  },
  {
    name: 'General Supplies/Tools',
    code: 73313,
    allowed: true,
    amount: 10000,
    organization: connectOrganization(organizationId)
  }
];

type AccountCodeMap = Record<string, string>;

export const indexCodeCreateInputs = (
  userCreatedId: string,
  organizationId: string,
  accountCodeIdsByName: AccountCodeMap
): Prisma.Index_CodeCreateInput[] => [
  {
    name: 'CASH',
    code: '830667',
    userCreated: connectUser(userCreatedId),
    organization: connectOrganization(organizationId),
    accountCodes: {
      connect: [
        { accountCodeId: accountCodeIdsByName.Subscriptions },
        { accountCodeId: accountCodeIdsByName['Travel-Misc'] },
        { accountCodeId: accountCodeIdsByName.Food },
        { accountCodeId: accountCodeIdsByName['General Supplies/Tools'] }
      ]
    }
  },
  {
    name: 'BUDGET',
    code: '800462',
    userCreated: connectUser(userCreatedId),
    organization: connectOrganization(organizationId),
    accountCodes: {
      connect: [
        { accountCodeId: accountCodeIdsByName.Subscriptions },
        { accountCodeId: accountCodeIdsByName['Travel-Auto/Van Rental'] },
        { accountCodeId: accountCodeIdsByName['Travel-Misc'] },
        { accountCodeId: accountCodeIdsByName['Competition-Registration'] },
        { accountCodeId: accountCodeIdsByName.Food },
        { accountCodeId: accountCodeIdsByName['General Supplies/Tools'] }
      ]
    }
  }
];

const vendorConfigs = [
  ['Tesla', true, 'Requires quote before purchase', 'orders@tesla.com', 'teslaSeed!', 'EV25'],
  ['Amazon', true, 'Common quick-purchase vendor', 'business@amazon.com', 'amazonSeed!', 'AMZN10'],
  ['Google', false, 'Software and cloud-related purchases', 'billing@google.com', 'googleSeed!', 'CLOUD10'],
  ['Microsoft', false, 'Software licensing vendor', 'billing@microsoft.com', 'microsoftSeed!', 'MSFT10'],
  ['Apple', true, 'Hardware purchases', 'business@apple.com', 'appleSeed!', 'APPLE10'],
  ['Costco', true, 'Bulk team supplies', 'business@costco.com', 'costcoSeed!', 'BULK10'],
  ['Walmart', true, 'General supplies', 'business@walmart.com', 'walmartSeed!', 'SAVE10'],
  ['Target', true, 'General supplies', 'business@target.com', 'targetSeed!', 'TARGET10'],
  ['eBay', false, 'Used or replacement parts', 'support@ebay.com', 'ebaySeed!', 'BID10'],
  ['Netflix', false, 'Subscription test vendor', 'billing@netflix.com', 'netflixSeed!', 'STREAM10'],
  ['Spotify', false, 'Subscription test vendor', 'billing@spotify.com', 'spotifySeed!', 'MUSIC10'],
  ['Adobe', false, 'Design software vendor', 'billing@adobe.com', 'adobeSeed!', 'DESIGN10'],
  ['Dell', true, 'Computer hardware vendor', 'sales@dell.com', 'dellSeed!', 'DELL10'],
  ['HP', true, 'Computer hardware vendor', 'sales@hp.com', 'hpSeed!', 'HP10'],
  ['Facebook', false, 'Advertising or social platform vendor', 'billing@facebook.com', 'facebookSeed!', 'META10'],
  ['LinkedIn', false, 'Recruiting or outreach vendor', 'billing@linkedin.com', 'linkedinSeed!', 'NETWORK25'],
  ['Zoom', true, 'Asks for contact before upgrades', 'sales@zoom.us', 'z00mM33t!', 'VIDEO5'],
  ['Slack', false, 'Needs project reference ID', 'help@slack.com', 'sl@ckwork!', 'COLLAB10'],
  ['Stripe', false, 'Bank info needed for setup', 'payments@stripe.com', 'fintech123!', 'PAYSAFE'],
  ['Square', true, 'Tax info must be updated yearly', 'vendor@square.com', 'squ@reRoot!', 'CASHAPP'],
  ['Notion', false, 'Requires shared workspace invite', 'support@notion.so', 'not3sApp!', 'PLAN50'],
  ['GitHub', true, 'Open source licenses required', 'billing@github.com', 'ghRepos!', 'DEV25'],
  ['Trello', false, 'Needs card for each request', 'boards@trello.com', 'tr3ll0Board!', 'TASK15']
] as const;

export const vendorCreateInputs = (addedByUserId: string, organizationId: string): Prisma.VendorCreateInput[] =>
  vendorConfigs.map(([name, taxExempt, notes, username, password, discountCode]) => ({
    name,
    taxExempt,
    notes,
    username,
    password,
    discountCode,
    addedBy: connectUser(addedByUserId),
    organization: connectOrganization(organizationId),
    twoFactorContacts: {
      connect: [{ userId: addedByUserId }]
    }
  }));

type OtherReasonConfig = {
  name: string;
  budget: number;
  indexCodeName: 'CASH' | 'BUDGET';
  accountCodeNames: string[];
};

export const otherReimbursementReasonConfigs: OtherReasonConfig[] = [
  {
    name: 'CONSUMABLES',
    budget: 500,
    indexCodeName: 'CASH',
    accountCodeNames: ['Food', 'General Supplies/Tools']
  },
  {
    name: 'TOOLS_AND_EQUIPMENT',
    budget: 10000,
    indexCodeName: 'BUDGET',
    accountCodeNames: ['General Supplies/Tools', 'Travel-Misc']
  },
  {
    name: 'COMPETITION',
    budget: 1500,
    indexCodeName: 'BUDGET',
    accountCodeNames: ['Competition-Registration', 'Travel-Auto/Van Rental', 'Travel-Misc', 'Food']
  },
  {
    name: 'GENERAL_STOCK',
    budget: 8000,
    indexCodeName: 'CASH',
    accountCodeNames: ['General Supplies/Tools']
  },
  {
    name: 'SUBSCRIPTIONS_AND_MEMBERSHIP',
    budget: 5000,
    indexCodeName: 'CASH',
    accountCodeNames: ['Subscriptions']
  }
];

export const otherReimbursementReasonCreateInput = (
  userCreatedId: string,
  indexCodeId: string,
  accountCodeIds: string[],
  name: string,
  budget: number
): Prisma.Reimbursement_Product_Other_ReasonCreateInput => ({
  name,
  budget,
  userCreated: connectUser(userCreatedId),
  indexCode: {
    connect: { indexCodeId }
  },
  accountCodes: {
    connect: accountCodeIds.map((accountCodeId) => ({ accountCodeId }))
  }
});

export const calendarCreateInputs = (userCreatedId: string, organizationId: string): Prisma.CalendarCreateInput[] => [
  {
    name: 'Design Reviews',
    description: 'Tracks all design review events and deadlines.',
    colorHexCode: '#4caf50',
    userCreated: connectUser(userCreatedId),
    organization: connectOrganization(organizationId)
  },
  {
    name: 'Organization',
    description: 'Tracks all organization-wide events and meetings.',
    colorHexCode: '#f44336',
    userCreated: connectUser(userCreatedId),
    organization: connectOrganization(organizationId)
  },
  {
    name: 'Manufacturing',
    description: 'Tracks all manufacturing and bay time events.',
    colorHexCode: '#ff9800',
    userCreated: connectUser(userCreatedId),
    organization: connectOrganization(organizationId)
  },
  {
    name: 'Miscellaneous',
    description: 'Tracks miscellaneous events.',
    colorHexCode: '#2196f3',
    userCreated: connectUser(userCreatedId),
    organization: connectOrganization(organizationId)
  },
  {
    name: 'New Member Events',
    description: 'Tracks all new member onboarding events.',
    colorHexCode: '#5c6bc0',
    userCreated: connectUser(userCreatedId),
    organization: connectOrganization(organizationId)
  },
  {
    name: 'FHE Comp',
    description: 'Tracks all FHE competition events.',
    colorHexCode: '#9c27b0',
    userCreated: connectUser(userCreatedId),
    organization: connectOrganization(organizationId)
  },
  {
    name: 'FSAE Comp',
    description: 'Tracks all FSAE competition events.',
    colorHexCode: '#9c27b0',
    userCreated: connectUser(userCreatedId),
    organization: connectOrganization(organizationId)
  }
];

type EventTypeConfig = {
  name: string;
  calendarNames: string[];
  requiredMembers: boolean;
  optionalMembers: boolean;
  teams: boolean;
  teamType: boolean;
  location: boolean;
  zoomLink: boolean;
  shop: boolean;
  machinery: boolean;
  workPackage: boolean;
  questionDocument: boolean;
  documents: boolean;
  description: boolean;
  onlyHeadsOrAboveForEventCreation: boolean;
  requiresConfirmation: boolean;
  sendSlackNotifications: boolean;
};

export const eventTypeConfigs: EventTypeConfig[] = [
  {
    name: 'Manufacturing',
    calendarNames: ['Manufacturing'],
    requiredMembers: true,
    optionalMembers: true,
    teams: true,
    teamType: true,
    location: false,
    zoomLink: false,
    shop: true,
    machinery: true,
    workPackage: true,
    questionDocument: false,
    documents: false,
    description: false,
    onlyHeadsOrAboveForEventCreation: false,
    requiresConfirmation: false,
    sendSlackNotifications: false
  },
  {
    name: 'Educational',
    calendarNames: ['Organization'],
    requiredMembers: false,
    optionalMembers: true,
    teams: true,
    teamType: false,
    location: true,
    zoomLink: true,
    shop: false,
    machinery: false,
    workPackage: false,
    questionDocument: false,
    documents: true,
    description: true,
    onlyHeadsOrAboveForEventCreation: false,
    requiresConfirmation: false,
    sendSlackNotifications: true
  },
  {
    name: 'FSAE',
    calendarNames: ['FSAE Comp'],
    requiredMembers: true,
    optionalMembers: true,
    teams: true,
    teamType: true,
    location: true,
    zoomLink: false,
    shop: false,
    machinery: false,
    workPackage: false,
    questionDocument: false,
    documents: true,
    description: true,
    onlyHeadsOrAboveForEventCreation: true,
    requiresConfirmation: true,
    sendSlackNotifications: true
  },
  {
    name: 'FHE',
    calendarNames: ['FHE Comp'],
    requiredMembers: true,
    optionalMembers: true,
    teams: true,
    teamType: true,
    location: true,
    zoomLink: false,
    shop: false,
    machinery: false,
    workPackage: false,
    questionDocument: false,
    documents: true,
    description: true,
    onlyHeadsOrAboveForEventCreation: true,
    requiresConfirmation: true,
    sendSlackNotifications: true
  },
  {
    name: 'Misc. Event (When2Meet)',
    calendarNames: ['Miscellaneous'],
    requiredMembers: true,
    optionalMembers: true,
    teams: true,
    teamType: false,
    location: false,
    zoomLink: false,
    shop: false,
    machinery: false,
    workPackage: false,
    questionDocument: false,
    documents: false,
    description: true,
    onlyHeadsOrAboveForEventCreation: false,
    requiresConfirmation: true,
    sendSlackNotifications: true
  },
  {
    name: 'Deadline/Heads Up',
    calendarNames: ['Organization'],
    requiredMembers: false,
    optionalMembers: false,
    teams: true,
    teamType: false,
    location: false,
    zoomLink: false,
    shop: false,
    machinery: false,
    workPackage: true,
    questionDocument: false,
    documents: false,
    description: true,
    onlyHeadsOrAboveForEventCreation: false,
    requiresConfirmation: false,
    sendSlackNotifications: true
  },
  {
    name: 'Misc. Event (Standard)',
    calendarNames: ['Miscellaneous'],
    requiredMembers: false,
    optionalMembers: true,
    teams: true,
    teamType: false,
    location: true,
    zoomLink: true,
    shop: false,
    machinery: false,
    workPackage: false,
    questionDocument: false,
    documents: false,
    description: true,
    onlyHeadsOrAboveForEventCreation: false,
    requiresConfirmation: false,
    sendSlackNotifications: true
  }
];

export const eventTypeCreateInput = (
  userCreatedId: string,
  organizationId: string,
  config: EventTypeConfig,
  calendarIdsByName: Record<string, string>
): Prisma.Event_TypeCreateInput => ({
  name: config.name,
  userCreated: connectUser(userCreatedId),
  organization: connectOrganization(organizationId),
  requiredMembers: config.requiredMembers,
  optionalMembers: config.optionalMembers,
  teams: config.teams,
  teamType: config.teamType,
  location: config.location,
  zoomLink: config.zoomLink,
  shop: config.shop,
  machinery: config.machinery,
  workPackage: config.workPackage,
  questionDocument: config.questionDocument,
  documents: config.documents,
  description: config.description,
  onlyHeadsOrAboveForEventCreation: config.onlyHeadsOrAboveForEventCreation,
  requiresConfirmation: config.requiresConfirmation,
  sendSlackNotifications: config.sendSlackNotifications,
  calendars: {
    connect: config.calendarNames.map((name) => {
      const calendarId = calendarIdsByName[name];
      if (!calendarId) {
        throw new Error(`Missing calendar for event type config: ${name}`);
      }
      return { calendarId };
    })
  }
});
