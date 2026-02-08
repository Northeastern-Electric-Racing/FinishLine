import { execSync } from 'child_process';
import readline from 'readline';

function promptUser(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log('🚀 Database Migration Script\n');

  try {
    const targetUrl = 'postgresql://postgres:docker@localhost:5432/nerpm';

    console.log(`📍 Target database: ${targetUrl.replace(/\/\/[^@]*@/, '//***:***@')}`);

    const sourceUrl = new URL(await promptUser('\nSource database URL (READ-ONLY - will not be modified): '));
    sourceUrl.search = '';

    console.log(`\n📋 Migration Summary:`);
    console.log(`• Source (READ-ONLY): ${sourceUrl.href.replace(/\/\/[^@]*@/, '//***:***@')}`);
    console.log(`• Target (WILL BE OVERWRITTEN): ${targetUrl.replace(/\/\/[^@]*@/, '//***:***@')}`);

    const confirm = await promptUser('\n⚠️  This will COMPLETELY OVERWRITE the target database. Continue? (y/n): ');

    if (confirm.toLowerCase() !== 'y') {
      console.log('❌ Cancelled');
      return;
    }

    console.log('\n🗑️  Clearing target database...');

    // First, clear the target database completely
    const clearCommand = `psql "${targetUrl}" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"`;
    console.log(targetUrl);

    try {
      execSync(clearCommand, { stdio: 'inherit' });
      console.log('✅ Target database cleared');
    } catch (error) {
      console.log('⚠️  Warning: Could not clear database, continuing anyway...');
    }

    console.log('\n📦 Dumping and restoring database...');

    const dumpCommand = `pg_dump "${sourceUrl}" --no-acl --no-owner --clean --if-exists | psql "${targetUrl}"`;

    execSync(dumpCommand, { stdio: 'inherit' });

    console.log('✅ Migration complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
