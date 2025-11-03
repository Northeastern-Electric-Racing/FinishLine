import { RuleParser, RuleData, Rule } from '../RuleParser';

export class FSAEParser extends RuleParser {
  protected hasImgInfo = false;

  protected extractRules(text: string): RuleData[] {
    const rules: RuleData[] = [];
    const lines = text.split('\n');

    let currentRule: { code: string; text: string; pageNumber: string } | null = null;
    let currentPageNumber = '1';

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
            ruleContent: this.cleanTocDots(currentRule.text.trim()),
            parentRuleCode: this.findParentRuleCode(currentRule.code),
            pageNumber: currentRule.pageNumber
          });
        }
      }
    };

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

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

    saveCurrentRule();
    return rules;
  }

  // Cleaned extensive dots from table of contents rules
  private cleanTocDots(content: string): string {
    return content.replace(/\.{4,}/g, '...');
  }

  private parseRuleNumber(line: string): Rule | null {
    // Match rule patterns like "GR.1.1" followed by text
    const rulePattern = /^([A-Z]{1,4}(?:\.[\d]+)+)\s+(.+)$/;
    // Match section patterns like "GR - GENERAL REGULATIONS"
    const sectionPattern = /^([A-Z]{1,4})\s*-\s*([A-Z][A-Z\s]+)$/;

    let match = line.match(rulePattern) || line.match(sectionPattern);
    if (match) {
      return {
        ruleCode: match[1],
        ruleContent: match[2]
      };
    }

    return null;
  }
}
