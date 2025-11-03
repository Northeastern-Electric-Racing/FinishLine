import * as fs from 'fs';
import pdf from 'pdf-parse';

interface RuleData {
  ruleCode: string;
  ruleContent: string;
  parentRuleCode?: string;
  pageNumber: string;
}

interface imgData {
  label: string;
  description: string;
  pageNumber: string;
}

interface Rule {
  ruleCode: string;
  ruleContent: string;
}

interface ParsedOutput {
  rules: RuleData[];
  totalRules: number;
  generatedAt: string;
}

interface ParsedImgOutput {
  imgInfo: imgData[];
  generatedAt: string;
}

class FHERuleParser {
  async parsePdf(path: string): Promise<{ rules: RuleData[]; imgInfo: imgData[], text: string }> {
    const filePath = "ruleDocs/" + path;
    console.log(`Reading ${filePath}`);
    
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdf(dataBuffer);
    
    console.log(`PDF Stats: ${pdfData.numpages} pages, ${pdfData.text.length} characters`);
    
    const rules = this.extractRules(pdfData.text);    
    const imgInfo = this.extractImageInfo(pdfData.text);
    return { rules, imgInfo, text: pdfData.text };
  }

  private extractImageInfo(text: string): imgData[] {
    const imgInfo: imgData[] = [];
    const lines = text.split('\n');
    
    const imgPattern = /^(FIGURE|TABLE)\s+(\d+(?:[A-C])?)\s*[-–—:]?\s*(.+?)?\s*(\d+)\s*$/i;
    let inIndexSection = false;
    let inTablesSection = false;

    for (const line of lines) {
      const trimmedLine = line.trim();

      // start capturing in Index of Figures section
      if (/^Index of Figures/i.test(trimmedLine)) {
        inIndexSection = true;
        continue;
      }

      if (/^Index of Tables/i.test(trimmedLine)) {
        inTablesSection = true;
        continue;
      }

      if (inIndexSection) {
        const match = trimmedLine.match(imgPattern);
        if (match) {
          const label = `${match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase()} ${match[2]}`;
          const description = match[3]?.trim() || '';
          const pageNumber = match[4];

          // check for another figure/table inside description (specific case fix)
          const secondPattern = /^(.+?)\s+(FIGURE|TABLE)\s+(\d+(?:[A-C])?)\s*[-–—:]?\s*(.+)$/i;
          const secondMatch = description.match(secondPattern);
          
          imgInfo.push({
            label,
            description: secondMatch ? secondMatch[1].trim() : description,
            pageNumber,
          });
          if (secondMatch) {
            imgInfo.push({
              label: `${secondMatch[2].charAt(0).toUpperCase() + secondMatch[2].slice(1).toLowerCase()} ${secondMatch[3]}`,
              description: secondMatch[4].trim(),
              pageNumber,
            });
          }
        }
      }
      if (inTablesSection && /^2025 Formula Hybrid/i.test(trimmedLine)) {
        inIndexSection = false;
        break;
      }
    }
    return imgInfo;
  }

  private extractRules(text: string): RuleData[] {
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
            ruleContent: currentRule.text.trim(),
            parentRuleCode: this.findParentRuleCode(currentRule.code),
            pageNumber: currentRule.pageNumber,
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
          pageNumber: currentPageNumber,
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
   * Extracts bulleted child rules (a, b, c, etc.) from a rule's content
   * and adds them as separate rules
   * @param ruleCode The parent rule code (e.g., "EV.5.2.2")
   * @param content The full rule content
   * @param pageNumber The page number
   * @returns Array of RuleData including the main rule and new subrules
   */
  private extractSubRules(ruleCode: string, content: string, pageNumber: string): RuleData[] {
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
      ruleCode: ruleCode,
      ruleContent: mainContent,
      parentRuleCode: this.findParentRuleCode(ruleCode),
      pageNumber: pageNumber,
    });
    
    // Extract the lettered sub-rules
    for (let i = 0; i < matches.length; i++) {
      const letter = matches[i][1];
      const startIndex = matches[i].index! + matches[i][0].length;
      
      // Find where this sub-rule ends (either at next letter or end of rule content)
      const endIndex = i < matches.length - 1 
        ? matches[i + 1].index! 
        : content.length;
      
      const subRuleContent = content.substring(startIndex, endIndex).trim();
      const subRuleCode = `${ruleCode}.${letter}`;
      
      subRules.push({
        ruleCode: subRuleCode,
        ruleContent: subRuleContent,
        parentRuleCode: ruleCode,
        pageNumber: pageNumber,
      });
    }
    return subRules;
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

  

  /**
   * Looks for page indicators like "Page 5 of 143"
   * @param line current rule line being observed
   * @returns the page number if found, otherwise null
   */
  private extractPageNumber(line: string): string | null {
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

  async saveToJSON(rules: RuleData[], imgInfo: imgData[], outputPath: string, imgInfoPath: string): Promise<void> {
    const output: ParsedOutput = {
      rules: rules,
      totalRules: rules.length,
      generatedAt: new Date().toISOString()
    };

    const imgOutput: ParsedImgOutput = {
      imgInfo: imgInfo,
      generatedAt: new Date().toISOString()
    };

    fs.writeFileSync(imgInfoPath, JSON.stringify(imgOutput, null, 2), 'utf-8');
    console.log(`Saved image info to ${imgInfoPath}`);

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
    console.log(`Saved ${rules.length} rules to ${outputPath}`);
  }

  async saveToTxt(text: string): Promise<void> {
    const txtPath = './txtVersions/FHE.txt';
    fs.writeFileSync(txtPath, text, 'utf-8');
    console.log(`Saved text version to ${txtPath}`);
  }
}

async function main(): Promise<void> {
  const filePath = process.argv[2];
  const outputFile = process.argv[3] || './fhe_rules.json';
  // List of figure/table descriptions and page numbers
  const imgListFile = process.argv[4] || './fhe_image_info.json';
  const parser = new FHERuleParser();
  
  try {
    const { rules, imgInfo, text } = await parser.parsePdf(filePath);
    await parser.saveToJSON(rules, imgInfo, outputFile, imgListFile);
    await parser.saveToTxt(text);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { FHERuleParser };