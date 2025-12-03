import pdf from 'pdf-parse-new';

export interface RuleData {
  ruleCode: string;
  ruleContent: string;
  parentRuleCode?: string;
  pageNumber: string;
}

export interface RuleString {
  ruleCode: string;
  ruleContent: string;
}

export const parseRulesFromPdf = async (buffer: Buffer, parserType: 'FSAE' | 'FHE') => {
  const options = {
    // max page number to parse, 0 = all pages
    max: 0,
    // errors: 0, warnings: 1, infos: 5
    verbosityLevel: 0 as const
  };
  const pdfData = await pdf(buffer, options);
  return parserType === 'FSAE' ? parseFSAERules(pdfData.text) : parseFHERules(pdfData.text);
};

const saveToDatabase = async (parsedRules: RuleData[]) => {
  // Placeholder for saving to database
}


const extractSubRules = (ruleCode: string, content: string, pageNumber: string): RuleData[] => {
  const subRules: RuleData[] = [];

  // Pattern for lettered bullets like "a. Some text" or "b. Some text"
  const letterPattern = /\s+([a-z])\.\s+/g;
  const matches = [...content.matchAll(letterPattern)];

  if (matches.length === 0) {
    // No sub-rules found
    return [];
  }

  // Extract the main rule content (everything before the first lettered item)
  const firstMatchIndex = matches[0].index!;
  const mainContent = content.substring(0, firstMatchIndex).trim();

  // Add the main rule
  subRules.push({
    ruleCode,
    ruleContent: mainContent,
    parentRuleCode: findParentRuleCode(ruleCode),
    pageNumber
  });

  // Extract the lettered sub-rules
  for (let i = 0; i < matches.length; i++) {
    const letter = matches[i][1];
    const startIndex = matches[i].index! + matches[i][0].length;

    // Find where this sub-rule ends (either at next letter or end of rule content)
    const endIndex = i < matches.length - 1 ? matches[i + 1].index! : content.length;

    const subRuleContent = content.substring(startIndex, endIndex).trim();
    const subRuleCode = `${ruleCode}.${letter}`;

    subRules.push({
      ruleCode: subRuleCode,
      ruleContent: subRuleContent,
      parentRuleCode: ruleCode,
      pageNumber
    });
  }
  return subRules;
};

const findParentRuleCode = (ruleCode: string): string | undefined => {
  const parts = ruleCode.split('.');
  if (parts.length <= 1) {
    return undefined;
  }
  return parts.slice(0, -1).join('.');
};

/**
 * Looks for page indicators like "Page 5 of 143"
 * @param line current rule line being observed
 * @returns the page number if found, otherwise null
 */
const extractPageNumber = (line: string): string | null => {
  const pagePattern = /Page\s+(\d+)\s+of\s+\d+/i;
  const match = line.match(pagePattern);
  return match ? match[1] : null;
};

/**************** FSAE ****************/

const parseFSAERules = (text: string) => {
  const rules: RuleData[] = [];
  const lines = text.split('\n');
  const seenRuleCodes = new Map<string, number>();

  let currentRule: { code: string; text: string; pageNumber: string } | null = null;
  let currentPageNumber = '1';

  const saveCurrentRule = () => {
    if (currentRule) {
      // Check if the rule has lettered sub-items
      const subRules = extractSubRules(currentRule.code, currentRule.text, currentRule.pageNumber);

      if (subRules.length > 0) {
        // Fixes unique ruleCode issue
        for (const subRule of subRules) {
          rules.push(handleDuplicateCodesFSAE(subRule, seenRuleCodes));
        }
      } else {
        // No sub-rules, just add the main rule
        const rule: RuleData = {
          ruleCode: currentRule.code,
          ruleContent: currentRule.text.trim(),
          parentRuleCode: findParentRuleCode(currentRule.code),
          pageNumber: currentRule.pageNumber
        };
        rules.push(handleDuplicateCodesFSAE(rule, seenRuleCodes));
      }
    }
  };
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Update page number if found
    const pageMatch = extractPageNumber(trimmedLine);
    if (pageMatch) {
      currentPageNumber = pageMatch;
      continue;
    }

    // skip table of contents
    if (isTocFSAE(trimmedLine)) {
      continue;
    }

    // Check if this line starts a new rule
    const rule = parseRuleNumberFSAE(trimmedLine);
    if (rule) {
      saveCurrentRule();

      currentRule = {
        code: rule.ruleCode,
        text: rule.ruleContent,
        pageNumber: currentPageNumber
      };
    } else if (currentRule) {
      // Append to existing rule
      currentRule.text += ' ' + trimmedLine;
    }
  }
  saveCurrentRule();
  return rules;
};

const extractTocFSAE = (text: string): RuleData[] => {
  const tocEntries: RuleData[] = [];
  const lines = text.split('\n');
  let currentPageNumber = '1';

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Update page number if found
    const pageMatch = extractPageNumber(trimmedLine);
    if (pageMatch) {
      currentPageNumber = pageMatch;
      continue;
    }

    if (isTocFSAE(trimmedLine)) {
      const rule = parseRuleNumberFSAE(trimmedLine);
      if (rule) {
        // removing excessive dots from table of contents
        const cleanContent = rule.ruleContent.replace(/\.{3,}/g, '...');
        tocEntries.push({
          ruleCode: rule.ruleCode,
          ruleContent: cleanContent,
          parentRuleCode: findParentRuleCode(rule.ruleCode),
          pageNumber: currentPageNumber
        });
      }
    }
  }
  return tocEntries;
};

const handleDuplicateCodesFSAE = (rule: RuleData, seenRuleCodes: Map<string, number>): RuleData => {
  const originalCode = rule.ruleCode;
  const count = seenRuleCodes.get(originalCode) || 0;
  seenRuleCodes.set(originalCode, count + 1);

  if (count > 0) {
    const suffix = count === 1 ? '.duplicate' : `.duplicate${count}`;
    console.log(`Duplicate rule found: ${originalCode} -> ${originalCode}${suffix}`);
    return {
      ...rule,
      ruleCode: `${originalCode}${suffix}`
    };
  }
  return rule;
};

const isTocFSAE = (line: string): Boolean => {
  // multiple dots and a number at the end
  return /\.{4,}\s+\d+\s*$/.test(line);
};

const parseRuleNumberFSAE = (line: string): RuleString | null => {
  // Match rule patterns like "GR.1.1" followed by text
  const rulePattern = /^([A-Z]{1,4}(?:\.[\d]+)+)\s+(.+)$/;
  // Match section patterns like "GR - GENERAL REGULATIONS"
  const sectionPattern = /^([A-Z]{1,4})\s*-\s*([A-Z][A-Z\s]+)$/;

  const match = line.match(rulePattern) || line.match(sectionPattern);
  if (match) {
    return {
      ruleCode: match[1],
      ruleContent: match[2]
    };
  }

  return null;
};

/**************** FHE *****************/

const parseFHERules = (text: string) => {
  const rules: RuleData[] = [];
  const lines = text.split('\n');

  let inRulesSection = false;
  let currentRule: { code: string; text: string; pageNumber: string } | null = null;
  let currentPageNumber = '0';

  const saveCurrentRule = () => {
    if (currentRule) {
      // Check if the rule has lettered sub-items
      const subRules = extractSubRules(currentRule.code, currentRule.text, currentRule.pageNumber);

      if (subRules.length > 0) {
        // Add the main rule and all sub-rules
        rules.push(...subRules);
      } else {
        // No sub-rules, just add the main rule
        rules.push({
          ruleCode: currentRule.code,
          ruleContent: currentRule.text.trim(),
          parentRuleCode: findParentRuleCode(currentRule.code),
          pageNumber: currentRule.pageNumber
        });
      }
    }
  };

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    if (/^Index of Tables/i.test(trimmedLine)) {
      inRulesSection = true;
    }
    // Skip table of contents
    if (inRulesSection) {
      if (/^2025 Formula Hybrid.*Rules/i.test(trimmedLine)) {
        saveCurrentRule();
        currentRule = null;
        continue;
      }

      // Update page number if found
      const pageMatch = extractPageNumber(trimmedLine);
      if (pageMatch) {
        currentPageNumber = pageMatch;
        continue;
      }

      // Check if this line starts a new rule
      const rule = parseRuleNumberFHE(trimmedLine);
      if (rule) {
        saveCurrentRule();

        currentRule = {
          code: rule.ruleCode,
          text: rule.ruleContent,
          pageNumber: currentPageNumber
        };
      } else if (currentRule) {
        // Append to existing rule
        currentRule.text += ' ' + trimmedLine;
      }
    }
  }

  saveCurrentRule();
  return rules;
};

const parseRuleNumberFHE = (line: string): RuleString | null => {
  // Match FHE rule patterns like "1T3.17.1" followed by text
  const rulePattern = /^(\d+[A-Z]+\d+(?:\.\d+)*)\s+(.+)$/;

  // "PART A1 - ADMINISTRATIVE REGULATIONS"
  const partPattern = /^(PART\s+[A-Z0-9]+)\s+-\s+(.+)$/;

  // "ARTICLE A1 FORMULA HYBRID + ELECTRIC OVERVIEW"
  const articlePattern = /^(ARTICLE\s+[A-Z]+\d+)\s+(.+)$/;

  const match = line.match(rulePattern) || line.match(partPattern) || line.match(articlePattern);
  if (match) {
    return {
      ruleCode: match[1],
      ruleContent: match[2]
    };
  }

  return null;
};
