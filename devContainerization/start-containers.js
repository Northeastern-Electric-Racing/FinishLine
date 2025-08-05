const { exec, spawn } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);
const COMPOSE_FILE = 'docker-compose.dev.yml';

async function getContainerStatus() {
  try {
    //get all containers from the compose file (running and stopped)
    const { stdout } = await execAsync(`docker compose -f ${COMPOSE_FILE} ps -a -q`);
    const containerIds = stdout
      .trim()
      .split('\n')
      .filter((id) => id);

    if (containerIds.length === 0) {
      return { status: 'not_created', running: 0, total: 0 };
    }

    //check which ones are running
    const runningCheck = await execAsync(`echo "${containerIds.join('\n')}" | xargs docker inspect -f '{{.State.Running}}'`);
    const runningStatuses = runningCheck.stdout.trim().split('\n');
    const runningCount = runningStatuses.filter((status) => status === 'true').length;

    return {
      status: runningCount === 3 ? 'all_running' : 'some_stopped',
      running: runningCount,
      total: containerIds.length
    };
  } catch (error) {
    return { status: 'not_created', running: 0, total: 0 };
  }
}

function runCommand(command, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn('sh', ['-c', command], {
      stdio: 'inherit',
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed with code ${code}`));
    });

    child.on('error', reject);
  });
}

async function waitForBackendReady() {
  console.log('Waiting for backend container to be ready...');
  let attempts = 0;
  const maxAttempts = 30; //wait up to 30 seconds

  while (attempts < maxAttempts) {
    try {
      await execAsync(`docker compose -f ${COMPOSE_FILE} exec -T backend echo "ready"`);
      console.log('Backend container is ready.');
      return;
    } catch (error) {
      attempts++;
      console.log(`Waiting for backend... (${attempts}/${maxAttempts})`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw new Error('Backend container failed to become ready within 30 seconds');
}

async function runMigrations() {
  console.log('Running database migrations and seed...');
  try {
    await runCommand(
      `docker compose -f ${COMPOSE_FILE} exec -T backend sh -c "cd /src/backend && npx prisma migrate reset --force"`
    );
    console.log('Database migrations and seeding completed successfully.');
  } catch (error) {
    console.error('Failed to run migrations:', error.message);
    throw error;
  }
}

async function main() {
  console.log('Checking container status...');

  const containerStatus = await getContainerStatus();

  switch (containerStatus.status) {
    case 'all_running':
      console.log('All 3 containers are running. Following logs...');
      await runCommand(`docker compose -f ${COMPOSE_FILE} logs --follow`);
      break;

    case 'some_stopped':
      console.log(
        `Found ${containerStatus.running}/${containerStatus.total} containers running. Starting all containers...`
      );
      await runCommand(`docker compose -f ${COMPOSE_FILE} up -d`);
      console.log('Containers started. Following logs...');
      await runCommand(`docker compose -f ${COMPOSE_FILE} logs --follow`);
      break;

    case 'not_created':
      console.log('Containers not found. Building and starting...');
      await runCommand(`docker compose -f ${COMPOSE_FILE} up --build -d`);
      console.log('Containers built and started. Waiting for backend...');
      await waitForBackendReady();
      console.log('Running migrations...');
      await runMigrations();
      console.log('Setup complete. Following logs...');
      await runCommand(`docker compose -f ${COMPOSE_FILE} logs --follow`);
      break;

    default:
      console.error('Unexpected container state. Please delete existing finishline containers.');
      break;
  }
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
