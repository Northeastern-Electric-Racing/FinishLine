import { FSAEParser } from './parsers/FSAEParser';
import { FHEParser } from './parsers/FHEParser';
import { ParserType } from './RuleParser';

async function main() {
  const type = (process.argv[2]?.toUpperCase() as ParserType) || ParserType.FSAE;
  const pdfFileName = process.argv[3];

  if (!pdfFileName) {
    console.error('Usage: npm start <FHE|FSAE> <filename.pdf>');
    process.exit(1);
  }

  const parser = type === ParserType.FHE ? new FHEParser() : new FSAEParser();
  const outputPath = `./jsonOutput/${type}_rules.json`;
  const txtPath = `./txtVersions/${type}.txt`;
  const imgPath = type === ParserType.FHE ? `./jsonOutput/${type}_images.json` : undefined;

  try {
    const result = await parser.parsePdf(pdfFileName);
    await parser.saveToJSON(result.rules, outputPath, result.imgInfo, imgPath);
    await parser.saveToTxt(result.text, txtPath);
    console.log(`${type} parsing completed`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();