import { Prisma } from '@prisma/client';

const SEED_CREATED_AT = new Date('2024-01-01T00:00:00.000Z');

const connectOrganization = (organizationId: string) => ({
  connect: { organizationId }
});

const connectUser = (userId: string) => ({
  connect: { userId }
});

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
    name: 'Confluence',
    iconName: 'description',
    required: true,
    isOnGuestHomePage: false,
    creator: connectUser(creatorId),
    organization: connectOrganization(organizationId)
  },
  {
    name: 'Bill of Materials',
    iconName: 'bar_chart',
    required: true,
    isOnGuestHomePage: false,
    creator: connectUser(creatorId),
    organization: connectOrganization(organizationId)
  },
  {
    name: 'NER Website',
    iconName: 'bar_chart',
    required: true,
    isOnGuestHomePage: false,
    creator: connectUser(creatorId),
    organization: connectOrganization(organizationId)
  },
  {
    name: 'NER Instagram',
    iconName: 'bar_chart',
    required: true,
    isOnGuestHomePage: false,
    creator: connectUser(creatorId),
    organization: connectOrganization(organizationId)
  },
  {
    name: 'Google Drive',
    iconName: 'folder',
    required: true,
    isOnGuestHomePage: false,
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
