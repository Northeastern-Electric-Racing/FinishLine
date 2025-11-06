import { FSAEParser } from './parsers/FSAEParser';
import { FHEParser } from './parsers/FHEParser';
import { ParserType, RuleParser } from './RuleParser';

async function main() {
  const type = (process.argv[2]?.toUpperCase() as ParserType) || ParserType.FSAE;
  const pdfFileName = process.argv[3];
  const userId = process.argv[4] || 'c8ff9535-8b88-40dd-8e99-ba1b800bb380';
  const carId = process.argv[5] || '3cdd8115-c48b-4775-9c46-136b0d157a72';

  if (!pdfFileName) {
    console.error('Usage: npm start <FHE|FSAE> <filename.pdf>');
    process.exit(1);
  }

  const parser = type === ParserType.FHE ? new FHEParser() : new FSAEParser();
  const outputPath = `./jsonOutput/${type}_rules.json`;
  const txtPath = `./txtVersions/${type}.txt`;
  const tocPath = `./jsonOutput/${type}_toc.json`;
  const imgPath = type === ParserType.FHE ? `./jsonOutput/${type}_images.json` : undefined;

  try {
    const result = await parser.parsePdf(pdfFileName);
    await parser.saveToJSON(result.rules, outputPath, result.tocEntries, tocPath, result.imgInfo, imgPath);
    await parser.saveToTxt(result.text, txtPath);
    await parser.saveToDatabase(result.rules, type, userId, carId, pdfFileName);

    console.log(`${type} parsing completed`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await RuleParser.disconnect();
  }
}

main();
