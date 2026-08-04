import pdf from 'pdf-parse-new';

export interface ParsedRule {
  ruleCode: string;
  ruleContent: string;
  parentRuleCode?: string;
}

const defaultPageRender = pdf.DEFAULT_OPTIONS.pagerender!;

/**
 * Skip text extraction for pages before firstRulePage.
 * Useful for skipping TOC and other beginning content.
 *
 * @param firstRulePage page number to start parsing rules from (1-indexed)
 */
const makePageRenderer = (firstRulePage?: number) => {
  if (!firstRulePage || firstRulePage <= 1) return defaultPageRender;
  return (pageData: { pageNumber: number }) => {
    if (pageData.pageNumber < firstRulePage) return '';
    return defaultPageRender(pageData);
  };
};

export const parseRulesFromPdf = async (
  buffer: Buffer,
  parserType: 'FSAE' | 'FHE',
  firstRulePage?: number
): Promise<ParsedRule[]> => {
  const options = {
    // max page number to parse, 0 = all pages
    max: 0,
    // errors: 0, warnings: 1, infos: 5
    verbosityLevel: 0 as const,
    pagerender: makePageRenderer(firstRulePage)
  };
  const pdfData = await pdf(buffer, options);

  if (parserType === 'FSAE') {
    return parseFSAERules(pdfData.text);
  }
  if (parserType === 'FHE') {
    return parseFHERules(pdfData.text);
  }
  throw new Error(`Invalid parser type: ${parserType}. Must be 'FSAE' or 'FHE'`);
};

/**
 * Checks whether a line is nothing but a page number (e.g. "7" or "Page 7 of 143")
 * the only content ever automatically excluded; safe to skip without risking dropping anything real
 * @param line line to check
 */
const isPageNumberLine = (line: string): boolean => /^\d+$/.test(line) || /^Page\s+\d+\s+of\s+\d+$/i.test(line);

/**
 * Extracts lettered sub-rules from rule content (a, b, c, etc.)
 * "EV.5.2 Main text a. Sub-rule" becomes:
 * - EV.5.2 Main text
 * - EV.5.2.a Sub-rule
 * If no subrules exist, returns the original rule
 * @param ruleCode parent rule code
 * @param content rule content to extract from
 * @returns array of parsed rules including main rule and any subrules
 */
const extractSubRules = (ruleCode: string, content: string): ParsedRule[] => {
  const letterPattern = /\s+([a-z])\.\s+/g;
  const matches = [...content.matchAll(letterPattern)];

  if (matches.length === 0) {
    // no subrules found, return original rule
    return [
      {
        ruleCode,
        ruleContent: content.trim(),
        parentRuleCode: findParentRuleCode(ruleCode)
      }
    ];
  }
  const subRules: ParsedRule[] = [];

  // Extract the main rule content (everything before the first lettered item)
  const firstMatchIndex = matches[0].index!;
  const mainContent = content.substring(0, firstMatchIndex).trim();

  // add main rule
  subRules.push({
    ruleCode,
    ruleContent: mainContent,
    parentRuleCode: findParentRuleCode(ruleCode)
  });

  // Extract lettered sub-rules
  for (let i = 0; i < matches.length; i++) {
    const [, letter] = matches[i];
    const startIndex = matches[i].index! + matches[i][0].length;

    // Find where this sub-rule ends (either at next letter or end of rule content)
    const endIndex = i < matches.length - 1 ? matches[i + 1].index! : content.length;
    const subRuleContent = content.substring(startIndex, endIndex).trim();
    const subRuleCode = `${ruleCode}.${letter}`;

    subRules.push({
      ruleCode: subRuleCode,
      ruleContent: subRuleContent,
      parentRuleCode: ruleCode
    });
  }
  return subRules;
};

/**
 * Determines parent rule code by removing last value.
 * Top level rules return undefined.
 * EV.5.2.2 -> EV.5.2
 * GR -> undefined
 * @param ruleCode rule code to find a parent for
 * @returns Parent rule code, or undefined if top level
 */
const findParentRuleCode = (ruleCode: string): string | undefined => {
  const parts = ruleCode.split('.');
  if (parts.length <= 1) {
    return undefined;
  }
  return parts.slice(0, -1).join('.');
};

/**
 * Updates rules with duplicate rule codes by appending .duplicate suffix
 * and updates parent references to maintain parent-child relationships
 * @param rules array of parsed rules
 * @returns array of rules without duplicate rule codes and updated parent references
 */
const handleDuplicateCodes = (rules: ParsedRule[]): ParsedRule[] => {
  const seenRuleCodes = new Map<string, number>();
  const codeMapping = new Map<string, string>(); // Maps original code to new code for duplicates

  // First pass: rename duplicates and track the mapping
  const renamedRules = rules.map((rule) => {
    const originalCode = rule.ruleCode;

    if (seenRuleCodes.has(originalCode)) {
      // duplicate found
      const count = seenRuleCodes.get(originalCode)!;
      seenRuleCodes.set(originalCode, count + 1);
      const suffix = count === 1 ? '.duplicate' : `.duplicate${count}`;
      const newCode = `${originalCode}${suffix}`;

      // Track that this code was renamed
      codeMapping.set(originalCode, newCode);

      return {
        ...rule,
        ruleCode: newCode
      };
    }
    seenRuleCodes.set(originalCode, 1);
    return rule;
  });

  // Second pass: update parent references for rules whose parent was renamed
  return renamedRules.map((rule) => {
    if (rule.parentRuleCode && codeMapping.has(rule.parentRuleCode)) {
      return {
        ...rule,
        parentRuleCode: codeMapping.get(rule.parentRuleCode)
      };
    }
    return rule;
  });
};

/**************** FSAE ****************/

const parseFSAERules = (text: string): ParsedRule[] => {
  const rules: ParsedRule[] = [];
  const lines = text.split('\n');

  let currentRule: { code: string; text: string } | null = null;
  let unparsedText = '';
  let unparsedCount = 0;

  const saveCurrentRule = () => {
    if (!currentRule) return;
    const parsedRules = extractSubRules(currentRule.code, currentRule.text);
    rules.push(...parsedRules);
  };

  // Text encountered with no rule open yet would otherwise disappear (e.g. before the first
  // recognized rule) - keep it as its own top-level rule under an abstract code instead of dropping it.
  const saveUnparsed = () => {
    if (!unparsedText.trim()) return;
    unparsedCount += 1;
    rules.push({
      ruleCode: `UNPARSED.${unparsedCount}`,
      ruleContent: unparsedText.trim(),
      parentRuleCode: undefined
    });
    unparsedText = '';
  };

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Skip bare page numbers - the only content ever automatically excluded
    if (isPageNumberLine(trimmedLine)) continue;

    // Check if this line starts a new rule
    const rule = parseRuleNumberFSAE(trimmedLine);
    if (rule) {
      saveCurrentRule();
      saveUnparsed();
      currentRule = {
        code: rule.ruleCode,
        text: rule.ruleContent
      };
    } else if (currentRule) {
      currentRule.text += ' ' + trimmedLine; // else append to existing rule
    } else {
      unparsedText += (unparsedText ? ' ' : '') + trimmedLine;
    }
  }
  saveCurrentRule();
  saveUnparsed();

  const fixedRules = fixOrphanedRulesFSAE(rules);
  return handleDuplicateCodes(fixedRules);
};

/**
 * Determines if this line starts a new rule, if so extracts code and content of the rule
 * Matches rule pattern (e.g. GR.1.1 some text) or section pattern (e.g. GR - TEXT)
 * @param line single line in the extracted text from the ruleset pdf
 * @returns rule code and content, or null if this line does not start a new rule
 */
const parseRuleNumberFSAE = (line: string): ParsedRule | null => {
  // Match rule patterns like "GR.1.1" followed by text
  const rulePattern = /^([A-Z]{1,4}(?:\.[\d]+)+)\s+(.+)$/;
  // Match section patterns like "GR - GENERAL REGULATIONS or PS - PRE-COMPETITION SUBMISSIONS"
  const sectionPattern = /^([A-Z]{1,4})\s*-\s*(.+)$/;
  // Match a rule code alone on its own line, with body text starting on the next line
  const bareCodePattern = /^([A-Z]{1,4}(?:\.[\d]+)+)$/;

  const match = line.match(rulePattern) || line.match(sectionPattern);
  if (match) {
    const cleanContent = match[2].replace(/\.{5,}/g, '.....');
    return {
      ruleCode: match[1],
      ruleContent: cleanContent
    };
  }

  const bareMatch = line.match(bareCodePattern);
  if (bareMatch) {
    return {
      ruleCode: bareMatch[1],
      ruleContent: ''
    };
  }

  return null;
};

/**
 * Updates rules to point to nearest existing parent if their assigned parent doesn't exist.
 * D.8.1.2 -> checks for D.8.1, if missing goes to D.8, then D
 * @param rules array of parsed rules
 * @returns rules with corrected parent references
 */
const fixOrphanedRulesFSAE = (rules: ParsedRule[]): ParsedRule[] => {
  const existingCodes = new Set(rules.map((r) => r.ruleCode));

  return rules.map((rule) => {
    // skip if no parent or parent exists
    if (!rule.parentRuleCode || existingCodes.has(rule.parentRuleCode)) {
      return rule; // Top-level rule
    }

    // Set parent doesn't exist, walk up the hierarchy
    const parts = rule.ruleCode.split('.');
    for (let i = parts.length - 2; i > 0; i--) {
      const ancestorCode = parts.slice(0, i).join('.');
      if (existingCodes.has(ancestorCode)) {
        return { ...rule, parentRuleCode: ancestorCode };
      }
    }

    // No ancestor exists, becomes top-level
    return { ...rule, parentRuleCode: undefined };
  });
};

/**************** FHE *****************/

const parseFHERules = (text: string): ParsedRule[] => {
  const rules: ParsedRule[] = [];
  const lines = text.split('\n');
  let currentRule: { code: string; text: string } | null = null;
  let unparsedText = '';
  let unparsedCount = 0;

  const saveCurrentRule = () => {
    if (!currentRule) return;
    const parsedRules = extractSubRules(currentRule.code, currentRule.text);
    rules.push(...parsedRules);
  };

  // Text encountered with no rule open yet would otherwise disappear (e.g. before the first
  // recognized rule) - keep it as its own top-level rule under an abstract code instead of dropping it.
  const saveUnparsed = () => {
    if (!unparsedText.trim()) return;
    unparsedCount += 1;
    rules.push({
      ruleCode: `UNPARSED.${unparsedCount}`,
      ruleContent: unparsedText.trim(),
      parentRuleCode: undefined
    });
    unparsedText = '';
  };

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Skip bare page numbers - the only content ever automatically excluded
    if (isPageNumberLine(trimmedLine)) continue;

    // Check if this line starts a new rule
    const rule = parseRuleNumberFHE(trimmedLine);
    if (rule) {
      saveCurrentRule();
      saveUnparsed();
      currentRule = {
        code: rule.ruleCode,
        text: rule.ruleContent
      };
    } else if (currentRule) {
      // Append to existing rule
      currentRule.text += ' ' + trimmedLine;
    } else {
      unparsedText += (unparsedText ? ' ' : '') + trimmedLine;
    }
  }
  saveCurrentRule();
  saveUnparsed();

  const fixedRules = fixOrphanedRulesFHE(rules);
  return handleDuplicateCodes(fixedRules);
};

/**
 * Determines if this line starts a new rule, if so extracts code and content of the rule
 * Matches three patterns: rule ("1T3.17.1 Text"), part ("PART A1 - Text"), and article ("ARTICLE A1 Text")
 * @param line single line in the extracted text from the ruleset pdf
 * @returns rule code and content, or null if this line does not start a new rule
 */
const parseRuleNumberFHE = (line: string): ParsedRule | null => {
  // Match FHE rule patterns like "1T3.17.1" followed by text
  const rulePattern = /^(\d+[A-Z]+\d+(?:\.\d+)*)\s+(.+)$/;
  // Match FHE rule codes with no leading digit, like "EV5.6" (e.g. Electric Vehicle sections)
  const plainLetterPattern = /^([A-Z]{1,4}\d+(?:\.\d+)*)\s+(.+)$/;
  // Match a rule code alone on its own line, with body text starting on the next line
  const bareCodePattern = /^(\d+[A-Z]+\d+(?:\.\d+)*|[A-Z]{1,4}\d+(?:\.\d+)*)$/;

  // "PART A1 - ADMINISTRATIVE REGULATIONS" removes "PART" and captures "A1" as rule code, rest as content
  const partMatch = line.match(/^PART\s+([A-Z0-9]+)\s+-\s+(.+)$/);
  if (partMatch) {
    return {
      ruleCode: partMatch[1], // "A1", not "PART A1"
      ruleContent: partMatch[2]
    };
  }

  // "ARTICLE A1 FORMULA HYBRID + ELECTRIC OVERVIEW"
  // Captures "A1" as rule code, removes "ARTICLE" and adds rest as content
  const articleMatch = line.match(/^ARTICLE\s+([A-Z]+\d+)\s+(.+)$/);
  if (articleMatch) {
    return {
      ruleCode: articleMatch[1], // "A11", not "ARTICLE A11"
      ruleContent: articleMatch[2]
    };
  }

  const match = line.match(rulePattern) || line.match(plainLetterPattern);
  if (match) {
    return {
      ruleCode: match[1],
      ruleContent: match[2]
    };
  }

  const bareMatch = line.match(bareCodePattern);
  if (bareMatch) {
    return {
      ruleCode: bareMatch[1],
      ruleContent: ''
    };
  }

  return null;
};

/**
 * Updates rules to point to nearest existing parent if their assigned parent doesn't exist.
 * D.8.1.2 -> checks for D.8.1, if missing goes to D.8, then D
 * Also for FHE formatting 1A11.1 -> checks for 1A11, if missing tries A11 (article format)
 * @param rules array of parsed rules
 * @returns rules with corrected parent references
 */
const fixOrphanedRulesFHE = (rules: ParsedRule[]): ParsedRule[] => {
  const existingCodes = new Set(rules.map((r) => r.ruleCode));

  return rules.map((rule) => {
    // skip if no parent or parent exists
    if (!rule.parentRuleCode || existingCodes.has(rule.parentRuleCode)) {
      return rule;
    }

    // Set parent doesn't exist, walk up the hierarchy
    const parts = rule.ruleCode.split('.');
    for (let i = parts.length - 2; i > 0; i--) {
      const ancestorCode = parts.slice(0, i).join('.');

      if (existingCodes.has(ancestorCode)) {
        return { ...rule, parentRuleCode: ancestorCode };
      }

      // Also check stripped version (1A5 -> A5)
      if (/^\d+[A-Z]+/.test(ancestorCode)) {
        const strippedAncestor = ancestorCode.replace(/^\d+/, '');
        if (existingCodes.has(strippedAncestor)) {
          return { ...rule, parentRuleCode: strippedAncestor };
        }
      }
    }

    // Special case: if parent is like "1A11" and doesn't exist, try "A11" (article format)
    // This handles rules like "1A11.1" whose parent "1A11" doesn't exist but should be "A11"
    if (rule.parentRuleCode && /^\d+[A-Z]+\d+$/.test(rule.parentRuleCode)) {
      const withoutLeadingDigit = rule.parentRuleCode.substring(1); // "1A11" -> "A11"
      if (existingCodes.has(withoutLeadingDigit)) {
        return { ...rule, parentRuleCode: withoutLeadingDigit };
      }
    }

    return { ...rule, parentRuleCode: undefined };
  });
};
