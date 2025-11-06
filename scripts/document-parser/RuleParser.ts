import * as fs from 'fs';
import pdf from 'pdf-parse-new';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface RuleData {
  ruleCode: string;
  ruleContent: string;
  parentRuleCode?: string;
  pageNumber: string;
}

export interface Rule {
  ruleCode: string;
  ruleContent: string;
}

interface ParsedOutput {
  rules: RuleData[];
  totalRules: number;
  generatedAt: string;
}

// FHE only
interface imgData {
  label: string;
  description: string;
  pageNumber: string;
}

interface ParsedImgOutput {
  imgInfo: imgData[];
  generatedAt: string;
}

export enum ParserType {
  FHE = 'FHE',
  FSAE = 'FSAE'
}

export abstract class RuleParser {
  protected abstract extractRules(text: string): RuleData[];
  protected abstract extractToc(text: string): RuleData[];
  protected abstract hasImgInfo: boolean;

  async parsePdf(path: string): Promise<{ rules: RuleData[]; tocEntries: RuleData[]; imgInfo?: imgData[]; text: string }> {
    let options = {
      // max page number to parse, 0 = all pages
      max: 0,
      // errors: 0, warnings: 1, infos: 5
      verbosityLevel: 0 as const
    };

    const filePath = 'ruleDocs/' + path;
    console.log(`Reading ${filePath}`);

    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdf(dataBuffer, options);

    console.log(`PDF Stats: ${pdfData.numpages} pages, ${pdfData.text.length} characters`);

    const rules = this.extractRules(pdfData.text);
    const tocEntries = this.extractToc(pdfData.text);

    if (this.hasImgInfo) {
      const imgInfo = this.extractImageInfo(pdfData.text);
      return { rules, tocEntries, imgInfo, text: pdfData.text };
    }
    return { rules, tocEntries, text: pdfData.text };
  }

  /**
   * Extracts the list of figures and tables from FHE document text
   * Note: Only works for FHE due to specific formatting
   * @param text full text of the FHE document
   * @returns array of imgData objects containing label, description, and page number
   */
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
            pageNumber
          });
          if (secondMatch) {
            imgInfo.push({
              label: `${secondMatch[2].charAt(0).toUpperCase() + secondMatch[2].slice(1).toLowerCase()} ${secondMatch[3]}`,
              description: secondMatch[4].trim(),
              pageNumber
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

  /**
   * Extracts bulleted child rules (a, b, c, etc.) from a rule's content
   * and adds them as separate rules
   * @param ruleCode The parent rule code (e.g., "EV.5.2.2")
   * @param content The full rule content
   * @param pageNumber The page number
   * @returns Array of RuleData including the main rule and new subrules
   */
  protected extractSubRules(ruleCode: string, content: string, pageNumber: string): RuleData[] {
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
      pageNumber: pageNumber
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
        pageNumber: pageNumber
      });
    }
    return subRules;
  }

  /**
   * Looks for page indicators like "Page 5 of 143"
   * @param line current rule line being observed
   * @returns the page number if found, otherwise null
   */
  protected extractPageNumber(line: string): string | null {
    const pagePattern = /Page\s+(\d+)\s+of\s+\d+/i;
    const match = line.match(pagePattern);
    return match ? match[1] : null;
  }

  /**
   * Gets parent rule code by removing the last code segment
   * E.g., "EV.5.2.2" -> "EV.5.2"
   * @param ruleCode rule code to find parent for
   * @returns string of parent rule code or undefined if none
   */
  protected findParentRuleCode(ruleCode: string): string | undefined {
    const parts = ruleCode.split('.');
    if (parts.length <= 1) {
      return undefined;
    }
    return parts.slice(0, -1).join('.');
  }

  async saveToJSON(
    rules: RuleData[],
    outputPath: string,
    tocEntries?: RuleData[],
    tocPath?: string,
    imgInfo?: imgData[],
    imgInfoPath?: string
  ): Promise<void> {
    const output: ParsedOutput = {
      rules: rules,
      totalRules: rules.length,
      generatedAt: new Date().toISOString()
    };

    if (tocEntries && tocPath) {
      const tocOutput: ParsedOutput = {
        rules: tocEntries,
        totalRules: tocEntries.length,
        generatedAt: new Date().toISOString()
      };
      fs.writeFileSync(tocPath, JSON.stringify(tocOutput, null, 2), 'utf-8');
      console.log(`Saved ${tocEntries.length} TOC entries to ${tocPath}`);
    }

    if (imgInfo && imgInfoPath) {
      const imgOutput: ParsedImgOutput = {
        imgInfo: imgInfo,
        generatedAt: new Date().toISOString()
      };
      fs.writeFileSync(imgInfoPath, JSON.stringify(imgOutput, null, 2), 'utf-8');
      console.log(`Saved image info to ${imgInfoPath}`);
    }
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
    console.log(`Saved ${rules.length} rules to ${outputPath}`);
  }

  async saveToTxt(text: string, txtOutputFile: string): Promise<void> {
    // "./txtVersions/FHE.txt" or "./txtVersions/FSAE.txt"
    fs.writeFileSync(txtOutputFile, text, 'utf-8');
    console.log(`Saved text version to ${txtOutputFile}`);
  }

  /**
   * Adds parsed rules into the database
   * @param rules Array of parsed rules
   * @param parserType Type of parser (FSAE or FHE)
   * @param userId The user ID creating these rules
   * @param carId The car ID this ruleset applies to
   * @param pdfFileName The original filename
   */
  async saveToDatabase(
    rules: RuleData[],
    parserType: ParserType,
    userId: string,
    carId: string,
    pdfFileName: string
  ): Promise<void> {
    try {
      // create new ruleset type
      const rulesetType = await prisma.ruleset_Type.create({
        data: {
          name: parserType,
          createdByUserId: userId
        }
      });
      // create new ruleset
      const revisionName = `Revision ${new Date().toISOString()}`;
      const ruleset = await prisma.ruleset.create({
        data: {
          fileId: pdfFileName,
          name: revisionName,
          active: true,
          rulesetTypeId: rulesetType.rulesetTypeId,
          carId: carId,
          createdByUserId: userId
        }
      });
      console.log(`Created ruleset: ${revisionName} (${ruleset.rulesetId})`);
      // insert all rules
      const ruleMap = new Map<string, string>(); // ruleCode : ruleId
      for (const rule of rules) {
        const createdRule = await prisma.rule.create({
          data: {
            ruleCode: rule.ruleCode,
            ruleContent: rule.ruleContent,
            imageFileIds: [],
            rulesetId: ruleset.rulesetId,
            createdByUserId: userId
          }
        });
        ruleMap.set(rule.ruleCode, createdRule.ruleId);
      }
      // update parent relationships
      for (const rule of rules) {
        if (rule.parentRuleCode) {
          const parentId = ruleMap.get(rule.parentRuleCode);
          const ruleId = ruleMap.get(rule.ruleCode);

          if (parentId && ruleId) {
            await prisma.rule.update({
              where: { ruleId: ruleId },
              data: { parentRuleId: parentId }
            });
          }
        }
      }
      console.log(`Successfully inserted ${rules.length} rules`);
    } catch (error) {
      console.error('Error inserting rules into database:', error);
      throw error;
    }
  }

  static async disconnect(): Promise<void> {
    await prisma.$disconnect();
  }
}
