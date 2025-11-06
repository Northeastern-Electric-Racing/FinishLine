import { RuleParser, RuleData, Rule } from '../RuleParser';

export class FSAEParser extends RuleParser {
  protected hasImgInfo = false;

  protected extractRules(text: string): RuleData[] {
    const rules: RuleData[] = [];
    const lines = text.split('\n');
    const seenRuleCodes = new Map<string, number>();

    let currentRule: { code: string; text: string; pageNumber: string } | null = null;
    let currentPageNumber = '1';

    const saveCurrentRule = () => {
      if (currentRule) {
        // Check if the rule has lettered sub-items
        const subRules = this.extractSubRules(currentRule.code, currentRule.text, currentRule.pageNumber);

        if (subRules.length > 0) {
          // Fixes unique ruleCode issue
          for (const subRule of subRules) {
            rules.push(this.handleDuplicateCodes(subRule, seenRuleCodes));
          }
        } else {
          // No sub-rules, just add the main rule
          const rule: RuleData = {
            ruleCode: currentRule.code,
            ruleContent: currentRule.text.trim(),
            parentRuleCode: this.findParentRuleCode(currentRule.code),
            pageNumber: currentRule.pageNumber
          };
          rules.push(this.handleDuplicateCodes(rule, seenRuleCodes));
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

      // skip table of contents
      if (this.isTocEntry(trimmedLine)) {
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

  /**
   * Adds .dup suffix to duplicate rule codes
   */
  private handleDuplicateCodes(rule: RuleData, seenRuleCodes: Map<string, number>): RuleData {
    const originalCode = rule.ruleCode;
    const count = seenRuleCodes.get(originalCode) || 0;
    seenRuleCodes.set(originalCode, count + 1);

    if (count > 0) {
      const suffix = count === 1 ? '.dup' : `.dup${count}`;
      console.log(`Duplicate rule found: ${originalCode} -> ${originalCode}${suffix}`);
      return {
        ...rule,
        ruleCode: `${originalCode}${suffix}`
      };
    }
    return rule;
  }

  protected extractToc(text: string): RuleData[] {
    const tocEntries: RuleData[] = [];
    const lines = text.split('\n');
    let currentPageNumber = '1';

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // Update page number if found
      const pageMatch = this.extractPageNumber(trimmedLine);
      if (pageMatch) {
        currentPageNumber = pageMatch;
        continue;
      }

      if (this.isTocEntry(trimmedLine)) {
        const rule = this.parseRuleNumber(trimmedLine);
        if (rule) {
          // removing excessive dots
          const cleanContent = this.cleanTocDots(rule.ruleContent);
          tocEntries.push({
            ruleCode: rule.ruleCode,
            ruleContent: cleanContent,
            parentRuleCode: this.findParentRuleCode(rule.ruleCode),
            pageNumber: currentPageNumber
          });
        }
      }
    }

    return tocEntries;
  }

  /**
   * Checks if a line is a table of contents entry
   * Ex: "GR.1 Formula SAE Competition Objective ... 5"
   */
  private isTocEntry(line: string): boolean {
    // multiple dots and a number at the end
    return /\.{4,}\s+\d+\s*$/.test(line);
  }

  // clean excessive dots from table of contents rules
  private cleanTocDots(content: string): string {
    return content.replace(/\.{3,}/g, '...');
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
