import { vi } from 'vitest';
import {
  ParsedRule,
  isPageNumberLine,
  stripPageNumberPhrase,
  normalizeContent,
  findParentRuleCode,
  handleDuplicateCodes,
  extractSubRules,
  parseRuleNumberFSAE,
  fixOrphanedRulesFSAE,
  parseFSAERules,
  parseRuleNumberFHE,
  fixOrphanedRulesFHE,
  parseFHERules,
  makePageRenderer,
  parseRulesFromPdf
} from '../../src/utils/parse.utils.js';

describe('Parse Utils Tests', () => {
  describe('isPageNumberLine', () => {
    it('matches a bare page number', () => {
      expect(isPageNumberLine('7')).toBe(true);
      expect(isPageNumberLine('143')).toBe(true);
    });

    it('does not match a real rule line', () => {
      expect(isPageNumberLine('T.1.1 Some requirement text')).toBe(false);
    });

    it('does not match a line that merely contains a number', () => {
      expect(isPageNumberLine('See page 7 for details')).toBe(false);
    });
  });

  describe('stripPageNumberPhrase', () => {
    it('removes "Page X of Y" when it is the whole line', () => {
      expect(stripPageNumberPhrase('Page 7 of 143')).toBe('');
    });

    it('matches case-insensitively', () => {
      expect(stripPageNumberPhrase('page 7 of 143')).toBe('');
    });

    it('removes "Page X of Y" embedded in a longer line, keeping the real content on both sides', () => {
      const line =
        'Violations on Intent The violation of the intent of a rule will be considered a violation of the rule itself Formula SAE® Rules 2026 © 2025 SAE International Page 8 of 145 Version 1.0 10 Sept 2025';
      expect(stripPageNumberPhrase(line)).toBe(
        'Violations on Intent The violation of the intent of a rule will be considered a violation of the rule itself Formula SAE® Rules 2026 © 2025 SAE International Version 1.0 10 Sept 2025'
      );
    });

    it('leaves a line unchanged when it does not contain the phrase', () => {
      expect(stripPageNumberPhrase('GR.1.1 Cars must have a roll bar.')).toBe('GR.1.1 Cars must have a roll bar.');
    });
  });

  describe('normalizeContent', () => {
    it('collapses embedded newlines and repeated whitespace into single spaces', () => {
      expect(normalizeContent('Main text\na. Sub-rule\n\nb.   Another')).toBe('Main text a. Sub-rule b. Another');
    });

    it('trims leading and trailing whitespace', () => {
      expect(normalizeContent('  \n  padded content  \n ')).toBe('padded content');
    });
  });

  describe('findParentRuleCode', () => {
    it('strips the last segment for a nested code', () => {
      expect(findParentRuleCode('EV.5.2.2')).toBe('EV.5.2');
    });

    it('returns undefined for a top-level code', () => {
      expect(findParentRuleCode('GR')).toBeUndefined();
    });
  });

  describe('handleDuplicateCodes', () => {
    it('leaves rules with unique codes unchanged', () => {
      const input: ParsedRule[] = [
        { ruleCode: 'GR.1', ruleContent: 'First' },
        { ruleCode: 'GR.2', ruleContent: 'Second' }
      ];
      expect(handleDuplicateCodes(input)).toEqual(input);
    });

    it('suffixes a duplicate code and remaps children pointing at the original code', () => {
      const input: ParsedRule[] = [
        { ruleCode: 'GR.1', ruleContent: 'First occurrence' },
        { ruleCode: 'GR.1', ruleContent: 'Second occurrence (duplicate)' },
        { ruleCode: 'GR.1.a', ruleContent: 'Child', parentRuleCode: 'GR.1' }
      ];
      const result = handleDuplicateCodes(input);
      expect(result[0].ruleCode).toBe('GR.1');
      expect(result[1].ruleCode).toBe('GR.1.duplicate');
      expect(result[2].parentRuleCode).toBe('GR.1.duplicate');
    });

    it('suffixes a third occurrence with an incrementing number', () => {
      const input: ParsedRule[] = [
        { ruleCode: 'GR.1', ruleContent: 'First' },
        { ruleCode: 'GR.1', ruleContent: 'Second' },
        { ruleCode: 'GR.1', ruleContent: 'Third' }
      ];
      const result = handleDuplicateCodes(input);
      expect(result.map((r) => r.ruleCode)).toEqual(['GR.1', 'GR.1.duplicate', 'GR.1.duplicate2']);
    });
  });

  describe('extractSubRules', () => {
    it('returns the original rule unsplit when there are no lettered items', () => {
      const result = extractSubRules('T.1', 'Just some plain rule text.');
      expect(result).toEqual([{ ruleCode: 'T.1', ruleContent: 'Just some plain rule text.', parentRuleCode: 'T' }]);
    });

    it('splits lettered sub-rules that each start their own line', () => {
      const content = 'Main text\na. First sub-rule\nb. Second sub-rule';
      const result = extractSubRules('EV.5.2', content);
      expect(result).toEqual([
        { ruleCode: 'EV.5.2', ruleContent: 'Main text', parentRuleCode: 'EV.5' },
        { ruleCode: 'EV.5.2.a', ruleContent: 'First sub-rule', parentRuleCode: 'EV.5.2' },
        { ruleCode: 'EV.5.2.b', ruleContent: 'Second sub-rule', parentRuleCode: 'EV.5.2' }
      ]);
    });

    it('splits a lettered item that immediately follows a list-introducing colon on the same line', () => {
      const content = 'Requirements: a. First item\nb. Second item';
      const result = extractSubRules('T.1', content);
      expect(result.map((r) => [r.ruleCode, r.ruleContent])).toEqual([
        ['T.1', 'Requirements:'],
        ['T.1.a', 'First item'],
        ['T.1.b', 'Second item']
      ]);
    });

    it('splits a lettered item starting at the very beginning of the content, with no intro text', () => {
      const content = 'a. First item\nb. Second item';
      const result = extractSubRules('T.1', content);
      expect(result.map((r) => [r.ruleCode, r.ruleContent])).toEqual([
        ['T.1', ''],
        ['T.1.a', 'First item'],
        ['T.1.b', 'Second item']
      ]);
    });

    it('does not split on a cross-reference like "p. 10" mid-sentence', () => {
      const content = 'See p. 10 for the full diagram.';
      const result = extractSubRules('T.1', content);
      expect(result).toEqual([{ ruleCode: 'T.1', ruleContent: content, parentRuleCode: 'T' }]);
    });

    it('does not split on an abbreviation like "fig. b." mid-sentence', () => {
      const content = 'Refer to fig. b. above for clarification.';
      const result = extractSubRules('T.1', content);
      expect(result).toEqual([{ ruleCode: 'T.1', ruleContent: content, parentRuleCode: 'T' }]);
    });

    it('splits lettered sub-rules for the "(a)" format', () => {
      const content = 'Main text\n(a) First sub-rule\n(b) Second sub-rule';
      const result = extractSubRules('EV.5.2', content);
      expect(result).toEqual([
        { ruleCode: 'EV.5.2', ruleContent: 'Main text', parentRuleCode: 'EV.5' },
        { ruleCode: 'EV.5.2.a', ruleContent: 'First sub-rule', parentRuleCode: 'EV.5.2' },
        { ruleCode: 'EV.5.2.b', ruleContent: 'Second sub-rule', parentRuleCode: 'EV.5.2' }
      ]);
    });

    it('splits lettered sub-rules "(a)" item after colon', () => {
      const content = 'Requirements: (a) First item\n(b) Second item';
      const result = extractSubRules('T.1', content);
      expect(result.map((r) => [r.ruleCode, r.ruleContent])).toEqual([
        ['T.1', 'Requirements:'],
        ['T.1.a', 'First item'],
        ['T.1.b', 'Second item']
      ]);
    });

    it('splits lettered sub-rules for "a)" format', () => {
      const content = 'Main text\na) First sub-rule\nb) Second sub-rule';
      const result = extractSubRules('EV.5.2', content);
      expect(result).toEqual([
        { ruleCode: 'EV.5.2', ruleContent: 'Main text', parentRuleCode: 'EV.5' },
        { ruleCode: 'EV.5.2.a', ruleContent: 'First sub-rule', parentRuleCode: 'EV.5.2' },
        { ruleCode: 'EV.5.2.b', ruleContent: 'Second sub-rule', parentRuleCode: 'EV.5.2' }
      ]);
    });

    it('splits inline subrules "a) ... OR b) ..." even though the markers are not at a line start or after a colon', () => {
      const content = 'then either: a) First option OR b) Second option';
      const result = extractSubRules('EV.6.4', content);
      expect(result.map((r) => [r.ruleCode, r.ruleContent])).toEqual([
        ['EV.6.4', 'then either:'],
        ['EV.6.4.a', 'First option OR'],
        ['EV.6.4.b', 'Second option']
      ]);
    });

    it('does not split on a bare-paren marker embedded mid-word, like "cab)"', () => {
      const content = 'The cab) is not a valid marker.';
      const result = extractSubRules('T.1', content);
      expect(result).toEqual([{ ruleCode: 'T.1', ruleContent: content, parentRuleCode: 'T' }]);
    });

    it('parses the real FHE EV fuse-protection rule with inline "either: a) ... OR b) ..." and a trailing Note', () => {
      const content =
        "then either: a) Each cell must be protected with a fuse or fusible link with a current rating less than or equal to 50% of the calculated short-circuit current (Isc) of the cell or capacitor, where Isc = Vnom / IR(Ω). (The nominal cell voltage divided by its dc internal resistance).. The fuse or fusible link must be rated for the full tractive system voltage, unless the special conditions in EV2.6.5 (Fuse Voltage Ratings) are met. OR b) Manufacturer’s documentation must be provided that certifies that it is acceptable to use this number of single cells in parallel without fusing. This certification must be included in the ESF. (Commercially assembled packs or modules installed per manufacturer's instructions may be exempt from this requirement upon application to the rules committee.) Note: if option (a) is used, fuse j in Figure 27 may be omitted if all conductors carrying the entire pack current are adequately sized for the sum of the parallel fuse current ratings (i.e. for n fuses in parallel, each with current rating i, the conductors must be sized for a total current i total = n·i) Figure 29 - Example nP3S Configuration";
      const result = extractSubRules('EV2.6.4', content);
      expect(result.map((r) => r.ruleCode)).toEqual(['EV2.6.4', 'EV2.6.4.a', 'EV2.6.4.b']);
      expect(result[0].ruleContent).toBe('then either:');
      expect(result[1].ruleContent).toMatch(/^Each cell must be protected with a fuse/);
      expect(result[1].ruleContent).toMatch(/EV2\.6\.5 \(Fuse Voltage Ratings\) are met\. OR$/);
      expect(result[2].ruleContent).toMatch(/^Manufacturer’s documentation must be provided/);
      expect(result[2].ruleContent).toMatch(/Figure 29 - Example nP3S Configuration$/);
    });
  });

  // FSAE Testing
  describe('parseRuleNumberFSAE', () => {
    it('matches a rule code followed by inline content', () => {
      expect(parseRuleNumberFSAE('GR.1.1 Cars must have a roll bar.')).toEqual({
        ruleCode: 'GR.1.1',
        ruleContent: 'Cars must have a roll bar.'
      });
    });

    it('matches a section header', () => {
      expect(parseRuleNumberFSAE('GR - GENERAL REGULATIONS')).toEqual({
        ruleCode: 'GR',
        ruleContent: 'GENERAL REGULATIONS'
      });
    });

    it('matches a bare rule code with no inline content, returning empty content', () => {
      expect(parseRuleNumberFSAE('GR.1.1')).toEqual({ ruleCode: 'GR.1.1', ruleContent: '' });
    });

    it('collapses runs of 5+ dots down to exactly 5', () => {
      const result = parseRuleNumberFSAE('GR.1.1 See table.......... 12');
      expect(result?.ruleContent).toBe('See table..... 12');
    });

    it('returns null for a line that does not look like a rule', () => {
      expect(parseRuleNumberFSAE('This is just ordinary prose.')).toBeNull();
    });
  });

  describe('fixOrphanedRulesFSAE', () => {
    it('leaves a rule unchanged when its parent exists', () => {
      const input: ParsedRule[] = [
        { ruleCode: 'GR.1', ruleContent: 'Parent' },
        { ruleCode: 'GR.1.1', ruleContent: 'Child', parentRuleCode: 'GR.1' }
      ];
      expect(fixOrphanedRulesFSAE(input)).toEqual(input);
    });

    it('walks up to the nearest existing ancestor when the direct parent is missing', () => {
      const input: ParsedRule[] = [
        { ruleCode: 'D', ruleContent: 'Top level' },
        { ruleCode: 'D.8.1.2', ruleContent: 'Deep child', parentRuleCode: 'D.8.1' }
      ];
      const result = fixOrphanedRulesFSAE(input);
      expect(result[1].parentRuleCode).toBe('D');
    });

    it('becomes top-level when no ancestor exists at all', () => {
      const input: ParsedRule[] = [{ ruleCode: 'D.8.1.2', ruleContent: 'Orphan', parentRuleCode: 'D.8.1' }];
      const result = fixOrphanedRulesFSAE(input);
      expect(result[0].parentRuleCode).toBeUndefined();
    });
  });

  describe('parseRuleNumberFHE', () => {
    it('matches a digit-prefixed rule code', () => {
      expect(parseRuleNumberFHE('1T3.17.1 Battery enclosures must be sealed.')).toEqual({
        ruleCode: '1T3.17.1',
        ruleContent: 'Battery enclosures must be sealed.'
      });
    });

    it('matches a plain letter+digit rule code with no leading digit', () => {
      expect(parseRuleNumberFHE('EV5.6 Accumulator systems must address stack arrangement.')).toEqual({
        ruleCode: 'EV5.6',
        ruleContent: 'Accumulator systems must address stack arrangement.'
      });
    });

    it('matches a PART header and strips the "PART" keyword from the code', () => {
      expect(parseRuleNumberFHE('PART A1 - ADMINISTRATIVE REGULATIONS')).toEqual({
        ruleCode: 'A1',
        ruleContent: 'ADMINISTRATIVE REGULATIONS'
      });
    });

    it('matches an ARTICLE header and strips the "ARTICLE" keyword from the code', () => {
      expect(parseRuleNumberFHE('ARTICLE A11 FORMULA HYBRID + ELECTRIC OVERVIEW')).toEqual({
        ruleCode: 'A11',
        ruleContent: 'FORMULA HYBRID + ELECTRIC OVERVIEW'
      });
    });

    it('matches a bare rule code with no inline content, returning empty content', () => {
      expect(parseRuleNumberFHE('EV5.6')).toEqual({ ruleCode: 'EV5.6', ruleContent: '' });
      expect(parseRuleNumberFHE('1T3.17.1')).toEqual({ ruleCode: '1T3.17.1', ruleContent: '' });
    });

    it('returns null for a line that does not look like a rule', () => {
      expect(parseRuleNumberFHE('This is just ordinary prose.')).toBeNull();
    });
  });

  describe('fixOrphanedRulesFHE', () => {
    it('leaves a rule unchanged when its parent exists', () => {
      const input: ParsedRule[] = [
        { ruleCode: '1T3', ruleContent: 'Parent' },
        { ruleCode: '1T3.17', ruleContent: 'Child', parentRuleCode: '1T3' }
      ];
      expect(fixOrphanedRulesFHE(input)).toEqual(input);
    });

    it('falls back to the article-format parent (1A11 -> A11) when the digit-prefixed parent is missing', () => {
      const input: ParsedRule[] = [
        { ruleCode: 'A11', ruleContent: 'Article A11 overview' },
        { ruleCode: '1A11.1', ruleContent: 'Sub-rule', parentRuleCode: '1A11' }
      ];
      const result = fixOrphanedRulesFHE(input);
      expect(result[1].parentRuleCode).toBe('A11');
    });

    it('strips a leading digit from an intermediate ancestor found while walking up the hierarchy', () => {
      const input: ParsedRule[] = [
        { ruleCode: 'A5', ruleContent: 'Article A5 overview' },
        { ruleCode: '1A5.1.2', ruleContent: 'Deep sub-rule', parentRuleCode: '1A5.1' }
      ];
      const result = fixOrphanedRulesFHE(input);
      expect(result[1].parentRuleCode).toBe('A5');
    });

    it('becomes top-level when no ancestor exists at all', () => {
      const input: ParsedRule[] = [{ ruleCode: '1A5.1', ruleContent: 'Orphan', parentRuleCode: '1A5' }];
      const result = fixOrphanedRulesFHE(input);
      expect(result[0].parentRuleCode).toBeUndefined();
    });
  });

  describe('parseFSAERules', () => {
    it('parses multiple top-level and nested rules from multi-line text', () => {
      const text = ['T - TECHNICAL ASPECTS', 'T.1 COCKPIT', 'T.1.1 Cockpit Opening'].join('\n');
      const result = parseFSAERules(text);
      expect(result.map((r) => [r.ruleCode, r.ruleContent])).toEqual([
        ['T', 'TECHNICAL ASPECTS'],
        ['T.1', 'COCKPIT'],
        ['T.1.1', 'Cockpit Opening']
      ]);
    });

    it('opens a new rule from a bare code line instead of merging it into the previous rule', () => {
      const text = ['GR.1.1 First rule content.', 'GR.1.2', 'Body text starting on the next line.'].join('\n');
      const result = parseFSAERules(text);
      expect(result.map((r) => [r.ruleCode, r.ruleContent])).toEqual([
        ['GR.1.1', 'First rule content.'],
        ['GR.1.2', 'Body text starting on the next line.']
      ]);
    });

    it('captures text before the first recognized rule as an UNPARSED rule instead of dropping it', () => {
      const text = ['Cover page filler text.', 'More preamble.', 'GR.1.1 The real first rule.'].join('\n');
      const result = parseFSAERules(text);
      expect(result[0]).toEqual({
        ruleCode: 'UNPARSED.1',
        ruleContent: 'Cover page filler text. More preamble.',
        parentRuleCode: undefined
      });
      expect(result[1].ruleCode).toBe('GR.1.1');
    });

    it('skips bare page number lines without dropping surrounding content', () => {
      const text = ['GR.1.1 First rule.', '7', 'Page 7 of 143', 'GR.1.2 Second rule.'].join('\n');
      const result = parseFSAERules(text);
      expect(result.map((r) => r.ruleCode)).toEqual(['GR.1.1', 'GR.1.2']);
    });
  });

  describe('parseFHERules', () => {
    it('recognizes a plain letter+digit code (EV5.6) as its own rule instead of merging into the enclosing ARTICLE', () => {
      const text = [
        'ARTICLE EV1 POUCH TYPE LITHIUM-ION CELLS',
        'Important Note: Designing an accumulator system utilizing pouch cells is a substantial undertaking.',
        'EV5.6 Accumulator systems using pouch cells must address stack arrangement.',
        'EV5.7 Teams must provide details of the design in their ESF1 and ESF2 submissions.'
      ].join('\n');
      const result = parseFHERules(text);
      expect(result.map((r) => r.ruleCode)).toEqual(['EV1', 'EV5.6', 'EV5.7']);
      expect(result[1].ruleContent).toBe('Accumulator systems using pouch cells must address stack arrangement.');
      expect(result[2].ruleContent).toBe('Teams must provide details of the design in their ESF1 and ESF2 submissions.');
    });

    it('opens a new rule from a bare code line instead of merging it into the previous rule', () => {
      const text = ['1T3.17.1 First rule content.', '1T3.17.2', 'Body text starting on the next line.'].join('\n');
      const result = parseFHERules(text);
      expect(result.map((r) => [r.ruleCode, r.ruleContent])).toEqual([
        ['1T3.17.1', 'First rule content.'],
        ['1T3.17.2', 'Body text starting on the next line.']
      ]);
    });

    it('captures text before the first recognized rule as an UNPARSED rule instead of dropping it', () => {
      const text = ['2026 Formula Hybrid + Electric Rules', 'Table of contents filler.', '1T3.1 The real first rule.'].join(
        '\n'
      );
      const result = parseFHERules(text);
      expect(result[0]).toEqual({
        ruleCode: 'UNPARSED.1',
        ruleContent: '2026 Formula Hybrid + Electric Rules Table of contents filler.',
        parentRuleCode: undefined
      });
      expect(result[1].ruleCode).toBe('1T3.1');
    });
  });
});

// mocks pdf-parse-new, used to test parsing logic without real PDF files
vi.mock('pdf-parse-new', () => {
  // loop over pages 1..N, call options.pagerender for each one and join with '\n\n'.
  const fn: any = async (_buffer: Buffer, options: any) => {
    const pages = (globalThis as any).__testPages as string[];
    let text = '';
    for (let i = 1; i <= pages.length; i++) {
      text += `\n\n${await options.pagerender({ pageNumber: i })}`;
    }
    return { text, numpages: pages.length, numrender: pages.length, info: null, metadata: null };
  };
  // mimics the library's default per-page text extractor
  fn.DEFAULT_OPTIONS = {
    pagerender: async (pageData: any) => {
      const pages = (globalThis as any).__testPages as string[];
      return pages[pageData.pageNumber - 1] ?? '';
    }
  };
  return { default: fn };
});

describe('Parsing pdf Tests', () => {
  describe('makePageRenderer', () => {
    beforeEach(() => {
      (globalThis as any).__testPages = ['page one text', 'page two text', 'page three text'];
    });

    it('delegates to the default renderer for every page when firstRulePage is not given', async () => {
      expect(await makePageRenderer(undefined)({ pageNumber: 1 })).toBe('page one text');
      expect(await makePageRenderer(undefined)({ pageNumber: 3 })).toBe('page three text');
    });

    it('returns empty text for pages before firstRulePage and delegates from firstRulePage onward', async () => {
      expect(await makePageRenderer(3)({ pageNumber: 1 })).toBe('');
      expect(await makePageRenderer(3)({ pageNumber: 2 })).toBe('');
      expect(await makePageRenderer(3)({ pageNumber: 3 })).toBe('page three text');
    });
  });

  describe('parseRulesFromPdf', () => {
    it('dispatches to the FSAE parser for parserType "FSAE"', async () => {
      (globalThis as any).__testPages = ['GR.1.1 Cars must have a roll bar.'];
      const result = await parseRulesFromPdf(Buffer.from(''), 'FSAE');
      expect(result).toEqual([{ ruleCode: 'GR.1.1', ruleContent: 'Cars must have a roll bar.', parentRuleCode: undefined }]);
    });

    it('dispatches to the FHE parser for parserType "FHE"', async () => {
      (globalThis as any).__testPages = ['EV5.6 Accumulator systems must address stack arrangement.'];
      const result = await parseRulesFromPdf(Buffer.from(''), 'FHE');
      expect(result).toEqual([
        { ruleCode: 'EV5.6', ruleContent: 'Accumulator systems must address stack arrangement.', parentRuleCode: undefined }
      ]);
    });

    it('throws for an unrecognized parser type', async () => {
      (globalThis as any).__testPages = ['GR.1.1 Cars must have a roll bar.'];
      await expect(parseRulesFromPdf(Buffer.from(''), 'INVALID' as unknown as 'FSAE')).rejects.toThrow(
        "Invalid parser type: INVALID. Must be 'FSAE' or 'FHE'"
      );
    });

    it('skips pages before firstRulePage entirely', async () => {
      (globalThis as any).__testPages = ['TABLE OF CONTENTS\nGR.1.1 ..... 5', 'GR.1.1 Cars must have a roll bar.'];
      const result = await parseRulesFromPdf(Buffer.from(''), 'FSAE', 2);
      expect(result).toEqual([{ ruleCode: 'GR.1.1', ruleContent: 'Cars must have a roll bar.', parentRuleCode: undefined }]);
    });

    it('real 2026 FSAE rules with subrules', async () => {
      (globalThis as any).__testPages = [
        '2026 FSAE Rules\nTABLE OF CONTENTS',
        [
          'PS.3.2 Penalty Detail',
          'PS.3.2.1 Late Submissions get a point penalty as shown in Table PS-2, subject to official discretion',
          'PS.3.2.2 Additional penalties will apply if Not Submitted, subject to official discretion',
          'PS.3.2.3 Penalties up to and including Removal of Team Entry may apply based on document reviews,',
          'subject to official discretion',
          'PS.3.3 Removal of Team Entry',
          'PS.3.3.1 The organizer may remove the team entry when a:'
        ].join('\n'),
        [
          'a. Grounds for Removal document is Not Submitted in 24 hours or less after the deadline.',
          'Removals will occur after each Document Submission deadline',
          'b. Team does not respond to Reviewer requests or organizer communications',
          'PS.3.3.2 When a team entry will be removed:',
          'a. The team will be notified prior to cancelling registration',
          'b. No refund of entry fees will be given'
        ].join('\n')
      ];
      const result = await parseRulesFromPdf(Buffer.from(''), 'FSAE', 2);
      expect(result.map((r) => [r.ruleCode, r.ruleContent])).toEqual([
        ['PS.3.2', 'Penalty Detail'],
        ['PS.3.2.1', 'Late Submissions get a point penalty as shown in Table PS-2, subject to official discretion'],
        ['PS.3.2.2', 'Additional penalties will apply if Not Submitted, subject to official discretion'],
        [
          'PS.3.2.3',
          'Penalties up to and including Removal of Team Entry may apply based on document reviews, subject to official discretion'
        ],
        ['PS.3.3', 'Removal of Team Entry'],
        ['PS.3.3.1', 'The organizer may remove the team entry when a:'],
        [
          'PS.3.3.1.a',
          'Grounds for Removal document is Not Submitted in 24 hours or less after the deadline. Removals will occur after each Document Submission deadline'
        ],
        ['PS.3.3.1.b', 'Team does not respond to Reviewer requests or organizer communications'],
        ['PS.3.3.2', 'When a team entry will be removed:'],
        ['PS.3.3.2.a', 'The team will be notified prior to cancelling registration'],
        ['PS.3.3.2.b', 'No refund of entry fees will be given']
      ]);
    });

    it('real 2026 FHE rules with a page boundary', async () => {
      (globalThis as any).__testPages = [
        '2026 Formula Hybrid + Electric Rules\nTABLE OF CONTENTS',
        [
          'A2.3.2 Teams planning to enter a vehicle in the HIP category will initially register as a Hybrid. To',
          'change to the HIP category, the team must submit a request to the organizers in writing before',
          'the start of the design event.',
          'Note: The advantages of entering as an HIP are:',
          '(a) Receive a full technical inspection of the vehicle and electrical drive systems.',
          '(b) Participate in all the competition events. (Provided tech inspection is passed).',
          '(c) Receive feedback from the design judges.',
          'Note: Teams can maximize the benefits of an HIP entry by including the full-hybrid',
          'designs in their document submissions and design event presentations, as well as',
          'including the full multi-year program in their Project Management materials.',
          '(d) When the vehicle is completed and entered as a hybrid, in a subsequent competition, it is',
          'considered an all-new vehicle, and not a second-year entry.',
          '2026 Formula Hybrid + Electric Rules – Rev. 1 3 September 11, 2025'
        ].join('\n'),
        [
          'A2.4 Static Events Only (SEO)',
          'A2.4.1 SEO is a category that may only be declared after arrival at the competition. All teams must',
          'initially register as either Hybrid/HIP or Electric.',
          'A2.4.2 A team may declare themselves as SEO and participate in the design2 and other static events',
          'even if the vehicle is in an unfinished state.',
          '(a) An SEO vehicle may not participate in any of the dynamic events.',
          '(b) An SEO vehicle may continue the technical inspection process, but will be given a lower',
          'priority than the non-SEO teams.',
          'A2.4.3 An SEO declaration must be submitted in writing to the organizers before the scheduled start of',
          'the design events.'
        ].join('\n')
      ];
      const result = await parseRulesFromPdf(Buffer.from(''), 'FHE', 2);
      expect(result.map((r) => [r.ruleCode, r.ruleContent])).toEqual([
        [
          'A2.3.2',
          'Teams planning to enter a vehicle in the HIP category will initially register as a Hybrid. To change to the HIP category, the team must submit a request to the organizers in writing before the start of the design event. Note: The advantages of entering as an HIP are:'
        ],
        ['A2.3.2.a', 'Receive a full technical inspection of the vehicle and electrical drive systems.'],
        ['A2.3.2.b', 'Participate in all the competition events. (Provided tech inspection is passed).'],
        [
          'A2.3.2.c',
          'Receive feedback from the design judges. Note: Teams can maximize the benefits of an HIP entry by including the full-hybrid designs in their document submissions and design event presentations, as well as including the full multi-year program in their Project Management materials.'
        ],
        [
          'A2.3.2.d',
          'When the vehicle is completed and entered as a hybrid, in a subsequent competition, it is considered an all-new vehicle, and not a second-year entry. 2026 Formula Hybrid + Electric Rules – Rev. 1 3 September 11, 2025'
        ],
        ['A2.4', 'Static Events Only (SEO)'],
        [
          'A2.4.1',
          'SEO is a category that may only be declared after arrival at the competition. All teams must initially register as either Hybrid/HIP or Electric.'
        ],
        [
          'A2.4.2',
          'A team may declare themselves as SEO and participate in the design2 and other static events even if the vehicle is in an unfinished state.'
        ],
        ['A2.4.2.a', 'An SEO vehicle may not participate in any of the dynamic events.'],
        [
          'A2.4.2.b',
          'An SEO vehicle may continue the technical inspection process, but will be given a lower priority than the non-SEO teams.'
        ],
        [
          'A2.4.3',
          'An SEO declaration must be submitted in writing to the organizers before the scheduled start of the design events.'
        ]
      ]);
    });
  });
});
