import { Faker } from '@faker-js/faker';
import { Material_Status, Prisma } from '@prisma/client';
import { randomElementWithBlacklist } from '../utils/common.factory.js';

const MATERIAL_KEYWORDS_BY_TYPE: Record<
  string,
  {
    adjectives: string[];
    nouns: string[];
    suffixes: string[];
  }
> = {
  Component: {
    adjectives: [
      'SMD',
      'Through-Hole',
      'High-Power',
      'Low-Profile',
      'Automotive',
      'Precision',
      'High-Speed',
      'Low-Noise',
      'Ultra-Low',
      'High-Voltage',
      'Low-Dropout',
      'Isolated',
      'Dual-Channel',
      'Single-Channel',
      'Programmable',
      'Fixed',
      'Adjustable',
      'Integrated'
    ],
    nouns: [
      'Resistor',
      'Capacitor',
      'MOSFET',
      'Diode',
      'Connector',
      'Sensor',
      'Inductor',
      'Op-Amp',
      'Microcontroller',
      'Transceiver',
      'Regulator',
      'Oscillator',
      'Fuse',
      'LED',
      'Relay',
      'Transformer',
      'Optocoupler',
      'Hall Effect Sensor',
      'Thermistor',
      'Encoder',
      'DAC',
      'ADC',
      'Gate Driver',
      'Current Sensor',
      'Pressure Sensor',
      'IMU',
      'EEPROM',
      'Ferrite Bead',
      'TVS Diode',
      'Schottky Diode',
      'Power Module',
      'Filter',
      'Amplifier'
    ],
    suffixes: ['IC', 'Module', 'Package', 'Array', 'Network', 'Bridge']
  },
  Stock: {
    adjectives: [
      '6061',
      '4130',
      '7075',
      'Stainless',
      'Carbon',
      'Fiberglass',
      'PETG',
      'Delrin',
      '304',
      '316',
      '1018',
      '4340',
      'T6',
      'T651',
      'Annealed',
      'Hardened',
      'Tempered',
      'Woven',
      'Uni-Directional',
      'Bidirectional',
      'Pre-Preg',
      'Dry',
      'Nomex',
      'Aramid'
    ],
    nouns: [
      'Plate',
      'Sheet',
      'Tube',
      'Rod',
      'Bar',
      'Block',
      'Strip',
      'Angle',
      'Channel',
      'Extrusion',
      'Billet',
      'Blank',
      'Foil',
      'Wire',
      'Mesh',
      'Fabric',
      'Honeycomb',
      'Foam Core',
      'Prepreg',
      'Tow',
      'Filament',
      'Round Stock',
      'Square Stock',
      'Hex Stock',
      'I-Beam',
      'C-Channel',
      'T-Slot',
      'Structural Tube',
      'DOM Tube',
      'Seamless Tube'
    ],
    suffixes: ['Stock', 'Blank', 'Billet', 'Section', 'Profile', 'Length']
  },
  Tools: {
    adjectives: [
      'Heavy-Duty',
      'Fine-Grit',
      'High-Temp',
      'Two-Part',
      'Quick-Set',
      'Structural',
      'Flexible',
      'Rigid',
      'Conductive',
      'Non-Conductive',
      'Waterproof',
      'Heat-Resistant',
      'UV-Resistant',
      'Chemical-Resistant',
      'Anti-Static',
      'High-Strength',
      'Low-VOC'
    ],
    nouns: [
      'Epoxy',
      'Tape',
      'Adhesive',
      'Sealant',
      'Primer',
      'Sandpaper',
      'Disc',
      'Brush',
      'Gloves',
      'Bag',
      'Film',
      'Scissors',
      'Mixing Cup',
      'Applicator',
      'Release Agent',
      'Peel Ply',
      'Breather Cloth',
      'Vacuum Bag',
      'Spray Gun',
      'Heat Gun',
      'Soldering Iron',
      'Wire Stripper',
      'Crimping Tool',
      'Multimeter',
      'Torque Wrench',
      'Drill Bit',
      'Tap',
      'Die',
      'Reamer',
      'Countersink',
      'Deburring Tool'
    ],
    suffixes: ['Kit', 'Pack', 'Set', 'Bundle', 'Supply', 'Consumable']
  },
  Nut: {
    adjectives: [
      'Stainless',
      'Nylon',
      'Aluminum',
      'Black Oxide',
      'Metric',
      'Imperial',
      'Grade 2',
      'Grade 5',
      'Grade 8',
      'A2-70',
      'A4-80',
      'Zinc-Plated',
      'Cadmium-Plated',
      'Hot-Dip Galvanized',
      'Self-Locking',
      'Prevailing Torque'
    ],
    nouns: [
      'Locknut',
      'Hex Nut',
      'Cap Nut',
      'Flange Nut',
      'Jam Nut',
      'Acorn Nut',
      'Insert',
      'Coupling Nut',
      'Weld Nut',
      'T-Nut',
      'Wing Nut',
      'Barrel Nut',
      'Rivet Nut',
      'Press Nut',
      'Cage Nut',
      'Square Nut',
      'Kep Nut',
      'Slotted Nut',
      'Castle Nut'
    ],
    suffixes: ['Pack', 'Set', 'Bag', 'Assortment']
  },
  Bolts: {
    adjectives: [
      'Stainless',
      'Black Oxide',
      'Alloy',
      'Nylon',
      'Titanium',
      'Metric',
      'Imperial',
      'Grade 2',
      'Grade 5',
      'Grade 8',
      'A2-70',
      'A4-80',
      'Zinc-Plated',
      'Low-Profile',
      'Ultra-Low',
      'Flanged',
      'Knurled',
      'Vented',
      'Captive',
      'Self-Tapping'
    ],
    nouns: [
      'SHCS',
      'Flat Head Screw',
      'Shoulder Bolt',
      'Button Head',
      'Set Screw',
      'Standoff',
      'Rivet',
      'Pin',
      'Dowel',
      'Stud',
      'Threaded Rod',
      'Eye Bolt',
      'U-Bolt',
      'J-Bolt',
      'Carriage Bolt',
      'Hex Bolt',
      'Lag Bolt',
      'Machine Screw',
      'Wood Screw',
      'Self-Drilling Screw',
      'Thumb Screw',
      'Captive Screw',
      'Jack Screw'
    ],
    suffixes: ['Pack', 'Set', 'Bundle', 'Bag', 'Assortment', 'Box']
  }
};

const ASSEMBLY_ADJECTIVES = [
  'Main',
  'Front',
  'Rear',
  'Upper',
  'Lower',
  'Inner',
  'Outer',
  'Primary',
  'Secondary',
  'Left',
  'Right',
  'Center',
  'Dual',
  'Side',
  'Forward',
  'Aft',
  'Inboard',
  'Outboard',
  'Top',
  'Bottom',
  'Mid',
  'Fore',
  'Aft',
  'Lateral',
  'Longitudinal',
  'Transverse',
  'Radial',
  'Axial',
  'Structural',
  'Functional',
  'Mechanical',
  'Electrical'
];

const ASSEMBLY_NOUNS = [
  'Bracket',
  'Mount',
  'Housing',
  'Plate',
  'Frame',
  'Rail',
  'Hub',
  'Shaft',
  'Rocker',
  'Knuckle',
  'Collar',
  'Clamp',
  'Linkage',
  'Arm',
  'PCB',
  'Board',
  'Module',
  'Driver',
  'Controller',
  'Sensor',
  'Harness',
  'Bellcrank',
  'Upright',
  'Clevis',
  'Yoke',
  'Flange',
  'Boss',
  'Gusset',
  'Bulkhead',
  'Rib',
  'Spar',
  'Skin',
  'Panel',
  'Cover',
  'Guard',
  'Shield',
  'Cage',
  'Cradle',
  'Saddle',
  'Sleeve',
  'Spacer',
  'Shim',
  'Washer Stack',
  'Bearing Block',
  'Pillow Block',
  'Tie Rod',
  'Push Rod',
  'Pull Rod'
];

const ASSEMBLY_SUFFIXES = [
  'Assembly',
  'Subassembly',
  'Structure',
  'System',
  'Unit',
  'Group',
  'Stack',
  'Cluster',
  'Package',
  'Block',
  'Array'
];

const DEFAULT_KEYWORDS = {
  adjectives: [
    'Custom',
    'Standard',
    'Heavy-Duty',
    'Precision',
    'Modified',
    'Fabricated',
    'Machined',
    'Welded',
    'Bonded',
    'Assembled'
  ],
  nouns: ['Part', 'Component', 'Hardware', 'Fastener', 'Element', 'Piece', 'Item', 'Unit', 'Section', 'Feature'],
  suffixes: ['Kit', 'Set', 'Pack', 'Assembly', 'Group']
};

const AssemblyNames: string[] = [];
const MaterialNames: string[] = [];

export const generateProjectBOMCount = (faker: Faker): number => {
  const bucket = faker.number.int({ min: 1, max: 100 });

  if (bucket <= 15) return 0;
  if (bucket <= 80) return faker.number.int({ min: 1, max: 30 });
  if (bucket <= 95) return faker.number.int({ min: 31, max: 80 });
  return faker.number.int({ min: 81, max: 200 });
};

export const splitBOMCount = (faker: Faker, total: number, wbsElementCount: number): number[] => {
  if (total === 0) return Array(wbsElementCount).fill(0);
  if (wbsElementCount === 1) return [total];

  const weights = Array.from({ length: wbsElementCount }, () => faker.number.float({ min: 0.5, max: 1.5 }));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  const counts = weights.map((w) => Math.round((total * w) / totalWeight));

  const diff = total - counts.reduce((sum, c) => sum + c, 0);
  const largestIndex = counts.reduce((maxIdx, c, i) => (c > counts[maxIdx] ? i : maxIdx), 0);
  counts[largestIndex] += diff;

  return counts.map((c) => Math.max(0, c));
};

export const generateMaterialCount = (faker: Faker): number =>
  faker.helpers.weightedArrayElement([
    { weight: 7, value: 0 },
    { weight: 3, value: 1 },
    { weight: 4, value: 2 },
    { weight: 5, value: 3 },
    { weight: 6, value: 4 },
    { weight: 7, value: 5 },
    { weight: 8, value: 6 },
    { weight: 9, value: 7 },
    { weight: 10, value: 8 },
    { weight: 11, value: 9 },
    { weight: 11, value: 10 },
    { weight: 10, value: 11 },
    { weight: 9, value: 12 },
    { weight: 8, value: 13 },
    { weight: 7, value: 14 },
    { weight: 6, value: 15 },
    { weight: 5, value: 16 },
    { weight: 4, value: 17 },
    { weight: 3, value: 18 },
    { weight: 2, value: 19 },
    { weight: 2, value: 20 },
    { weight: 1, value: 21 },
    { weight: 1, value: 22 },
    { weight: 1, value: 23 },
    { weight: 1, value: 24 },
    { weight: 1, value: 25 },
    { weight: 1, value: 26 },
    { weight: 1, value: 27 },
    { weight: 1, value: 28 },
    { weight: 1, value: 29 },
    { weight: 1, value: 30 }
  ]);

export const generateAssemblyName = (faker: Faker): string => {
  while (true) {
    const parts: string[] = [];

    if (faker.datatype.boolean({ probability: 0.4 })) {
      parts.push(randomElementWithBlacklist(faker, ASSEMBLY_ADJECTIVES, parts));
    }

    parts.push(randomElementWithBlacklist(faker, ASSEMBLY_NOUNS, parts));

    while (faker.datatype.boolean({ probability: 0.4 })) {
      parts.push(randomElementWithBlacklist(faker, ASSEMBLY_NOUNS, parts));
    }

    parts.push(randomElementWithBlacklist(faker, ASSEMBLY_SUFFIXES, parts));

    const finalString = parts.join(' ');
    if (!AssemblyNames.includes(finalString)) {
      AssemblyNames.push(finalString);
      return finalString;
    }
  }
};

export const generateMaterialName = (faker: Faker, materialTypeName: string): string => {
  while (true) {
    const keywords = MATERIAL_KEYWORDS_BY_TYPE[materialTypeName] ?? DEFAULT_KEYWORDS;
    const parts: string[] = [];

    if (faker.datatype.boolean({ probability: 0.5 })) {
      parts.push(randomElementWithBlacklist(faker, keywords.adjectives, parts));
    }

    parts.push(randomElementWithBlacklist(faker, keywords.nouns, parts));

    while (faker.datatype.boolean({ probability: 0.2 })) {
      parts.push(randomElementWithBlacklist(faker, keywords.nouns, parts));
    }

    if (faker.datatype.boolean({ probability: 0.15 })) {
      parts.push(randomElementWithBlacklist(faker, keywords.suffixes, parts));
    }

    const finalString = parts.join(' ');
    if (!MaterialNames.includes(finalString)) {
      MaterialNames.push(finalString);
      return finalString;
    }
  }
};

export const assemblyCreateInput = (
  name: string,
  wbsElementId: string,
  userCreatedId: string
): Prisma.AssemblyCreateInput => ({
  name,
  dateCreated: new Date(),
  userCreated: { connect: { userId: userCreatedId } },
  wbsElement: { connect: { wbsElementId } }
});

export const materialCreateInput = (
  name: string,
  wbsElementId: string,
  userCreatedId: string,
  materialTypeId: string,
  status: Material_Status,
  assemblyId?: string,
  manufacturerId?: string,
  unitId?: string,
  quantity?: number,
  price?: number
): Prisma.MaterialCreateInput => ({
  name,
  dateCreated: new Date(),
  linkUrl: '',
  status,
  userCreated: { connect: { userId: userCreatedId } },
  wbsElement: { connect: { wbsElementId } },
  materialType: { connect: { id: materialTypeId } },
  ...(assemblyId ? { assembly: { connect: { assemblyId } } } : {}),
  ...(manufacturerId ? { manufacturer: { connect: { id: manufacturerId } } } : {}),
  ...(unitId ? { unit: { connect: { id: unitId } } } : {}),
  ...(quantity !== undefined ? { quantity } : {}),
  ...(price !== undefined ? { price, subtotal: price * (quantity ?? 1) } : {})
});
