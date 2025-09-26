import * as fs from 'fs';
import pdf from 'pdf-parse';

interface RuleData {
  ruleCode: string;
  ruleContent: string;
  parentRuleCode?: string;
  pageNumber: string;
  isFromTOC?: boolean;
}

interface RuleMatch {
  code: string;
  text: string;
}

interface ParsedOutput {
  rules: RuleData[];
  totalRules: number;
  totalTOCRules: number;
  generatedAt: string;
}

class FSAERuleParser {
  async parsePdf(path: string): Promise<{ rules: RuleData[] }> {
    const filePath = "ruleDocs/" + path;
    console.log(`Reading PDF: ${filePath}`);
    
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdf(dataBuffer);
    
    console.log(`PDF Stats: ${pdfData.numpages} pages, ${pdfData.text.length} characters`);
    
    const rules = this.extractRules(pdfData.text);
    const tocRules = rules.filter(r => r.isFromTOC);
    console.log(`Found ${rules.length} total rules (${tocRules.length} from TOC, ${rules.length - tocRules.length} with full content)`);
    
    return { rules };
  }

  private extractRules(text: string): RuleData[] {
    const rules: RuleData[] = [];
    const lines = text.split('\n');
    
    console.log(`Scanning ${lines.length} lines for rules and TOC entries...`);

    let currentRule: { code: string; text: string; pageNumber: string; isFromTOC: boolean } | null = null;
    let currentPageNumber = '1';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) continue;

      // Check for page number indicators
      const pageMatch = this.extractPageNumber(line);
      if (pageMatch) {
        currentPageNumber = pageMatch;
        continue;
      }

      // Check if this is a TOC entry first
      const tocEntry = this.parseTOCEntry(line);
      if (tocEntry) {
        // Add TOC entry as a rule with the isFromTOC flag
        rules.push({
          ruleCode: tocEntry.ruleCode,
          ruleContent: tocEntry.title,
          parentRuleCode: this.findParentRuleCode(tocEntry.ruleCode),
          pageNumber: tocEntry.pageNumber,
          isFromTOC: true
        });
        continue;
      }

      // Otherwise, process as regular rule
      const ruleMatch = this.parseRuleNumber(line);
      
      if (ruleMatch) {
        // Save previous rule if it exists
        if (currentRule) {
          rules.push({
            ruleCode: currentRule.code,
            ruleContent: currentRule.text.trim(),
            parentRuleCode: this.findParentRuleCode(currentRule.code),
            pageNumber: currentRule.pageNumber,
            isFromTOC: currentRule.isFromTOC
          });
        }
        
        // Start new rule
        currentRule = {
          code: ruleMatch.code,
          text: ruleMatch.text,
          pageNumber: currentPageNumber,
          isFromTOC: false
        };
      } else if (currentRule) {
        // Continue adding content to current rule
        if (this.isRuleContent(line)) {
          currentRule.text += ' ' + line;
        }
      }
    }
    
    // Don't forget the last rule
    if (currentRule) {
      rules.push({
        ruleCode: currentRule.code,
        ruleContent: currentRule.text.trim(),
        parentRuleCode: this.findParentRuleCode(currentRule.code),
        pageNumber: currentRule.pageNumber,
        isFromTOC: currentRule.isFromTOC
      });
    }
    
    return rules;
  }

  private parseRuleNumber(line: string): RuleMatch | null {
    // Match rule patterns like "GR.1.1" followed by text
    const rulePattern = /^([A-Z]{1,4}(?:\.[\d]+)+)\s+(.+)$/;
    // Match section patterns like "GR - GENERAL REGULATIONS"  
    const sectionPattern = /^([A-Z]{1,4})\s*-\s*([A-Z][A-Z\s]+)$/;
    
    let match = line.match(rulePattern) || line.match(sectionPattern);
    
    if (match) {
      return {
        code: match[1],
        text: match[2]
      };
    }
    
    return null;
  }

  private parseTOCEntry(line: string): { ruleCode: string; title: string; pageNumber: string } | null {
    // Match pattern like: "EV.1     Definitions .......... 90"
    const tocPattern = /^([A-Z]{1,4}(?:\.[\d]+)*)\s+(.+?)\.{3,}.*?(\d+)\s*$/;
    const match = line.match(tocPattern);
    
    if (match) {
      const ruleCode = match[1];
      const title = match[2].trim();
      const pageNumber = match[3];
      
      return {
        ruleCode,
        title,
        pageNumber
      };
    }
    
    return null;
  }

  private extractPageNumber(line: string): string | null {
    // Look for page indicators like "Page 5 of 143"
    const pagePattern = /Page\s+(\d+)\s+of\s+\d+/i;
    const match = line.match(pagePattern);
    
    if (match) {
      return match[1];
    }
    
    return null;
  }

  private findParentRuleCode(ruleCode: string): string | undefined {
    const parts = ruleCode.split('.');
    if (parts.length <= 1) {
      return undefined;
    }
    
    const parentParts = parts.slice(0, -1);
    return parentParts.join('.');
  }

  private isRuleContent(line: string): boolean {
    if (line.includes("Formula SAE® Rules 2025")) return false;
    if (line.includes("Page") && line.includes("of")) return false;
    if (line.includes("© 2024 SAE International")) return false;
    if (/^\d+$/.test(line)) return false;
    if (line.includes("Version 1.0")) return false;
    if (/^\d{2} [A-Z][a-z]{2} \d{4}$/.test(line)) return false;
    return true;
  }

  private cleanRuleContent(content: string): string {
    return content
      .replace(/\s+/g, ' ')
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
      .trim();
  }

  async saveToJSON(rules: RuleData[], outputPath: string = './fsae_rules.json'): Promise<void> {
    console.log(`Saving rules to ${outputPath}...`);
    
    const cleanRules = rules.map(rule => ({
      ...rule,
      ruleContent: this.cleanRuleContent(rule.ruleContent)
    }));
    
    const tocRules = cleanRules.filter(r => r.isFromTOC);
    
    const output: ParsedOutput = {
      rules: cleanRules,
      totalRules: cleanRules.length,
      totalTOCRules: tocRules.length,
      generatedAt: new Date().toISOString()
    };

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
    console.log(`Saved ${cleanRules.length} rules (${tocRules.length} from TOC) to ${outputPath}`);
  }
}

async function main(): Promise<void> {
  const filePath = process.argv[2];
  const outputFile = process.argv[3] || './fsae_rules.json';
  
  if (!filePath) {
    console.log('Usage: ts-node FSAEparser.ts <pdf-file-path> [output-file]');
    console.log('Example: ts-node FSAEparser.ts FSAE_Rules_2025.pdf');
    console.log('Default output: ./fsae_rules.json');
    process.exit(1);
  }

  const parser = new FSAERuleParser();
  
  try {
    const { rules } = await parser.parsePdf(filePath);
    await parser.saveToJSON(rules, outputFile);
    
    console.log(`\nProcessing complete!`);
    console.log(`Total rules: ${rules.length}`);
    console.log(`Output file: ${outputFile}`);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { FSAERuleParser };