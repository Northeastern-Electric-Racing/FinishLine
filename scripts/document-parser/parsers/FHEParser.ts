import { RuleParser, RuleData, Rule } from '../RuleParser';

export class FHEParser extends RuleParser {
  protected hasImgInfo = true;

  protected extractRules(text: string): RuleData[] {
    const rules: RuleData[] = [];
    const lines = text.split('\n');

    let inRulesSection = false;
    let currentRule: { code: string; text: string; pageNumber: string } | null = null;
    let currentPageNumber = '0';

    const saveCurrentRule = () => {
      if (currentRule) {
        // Check if the rule has lettered sub-items
        const subRules = this.extractSubRules(currentRule.code, currentRule.text, currentRule.pageNumber);

        if (subRules.length > 0) {
          // Add the main rule and all sub-rules
          rules.push(...subRules);
        } else {
          // No sub-rules, just add the main rule
          rules.push({
            ruleCode: currentRule.code,
            ruleContent: currentRule.text.trim(),
            parentRuleCode: this.findParentRuleCode(currentRule.code),
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
        const pageMatch = this.extractPageNumber(trimmedLine);
        if (pageMatch) {
          currentPageNumber = pageMatch;
          continue;
        }

        // Check if this line starts a new rule
        const rule = this.parseRuleNumber(trimmedLine);
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
  }

  private parseRuleNumber(line: string): Rule | null {
    // Match FHE rule patterns like "1T3.17.1" followed by text
    const rulePattern = /^(\d+[A-Z]+\d+(?:\.\d+)*)\s+(.+)$/;

    // "PART A1 - ADMINISTRATIVE REGULATIONS"
    const partPattern = /^(PART\s+[A-Z0-9]+)\s+-\s+(.+)$/;

    // "ARTICLE A1 FORMULA HYBRID + ELECTRIC OVERVIEW"
    const articlePattern = /^(ARTICLE\s+[A-Z]+\d+)\s+(.+)$/;

    let match = line.match(rulePattern) || line.match(partPattern) || line.match(articlePattern);
    if (match) {
      return {
        ruleCode: match[1],
        ruleContent: match[2]
      };
    }

    return null;
  }
}
