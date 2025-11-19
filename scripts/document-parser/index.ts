import { FSAEParser } from './parsers/FSAEParser';
import { FHEParser } from './parsers/FHEParser';
import { ParserType, RuleParser } from './RuleParser';

// For manual testing of parsers
// Run 'npm start FHE FHE.pdf' or 'npm start FSAE FSAE.pdf'
async function main() {
  const type = (process.argv[2]?.toUpperCase() as ParserType) || ParserType.FSAE;
  const pdfFileName = process.argv[3];
  // these are values from prisma:studio so not a permanent fix
  const userId = process.argv[4] || 'f9f1f920-82c2-45ff-98f3-b30f759330fc';
  const carId = process.argv[5] || 'a24e6261-0ca1-47a8-9f49-5e1db76713bd';
  const organizationId = process.argv[6] || 'ecf53ed9-d91d-42d2-8b7c-811a3cf10021';

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
    await parser.saveToDatabase(result.rules, type, userId, carId, organizationId, pdfFileName);

    console.log(`${type} parsing completed`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await RuleParser.disconnect();
  }
}

main();
