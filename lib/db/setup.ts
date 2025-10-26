import { exec } from "node:child_process";
import { promises as fs } from "node:fs";
import { promisify } from "node:util";
import readline from "node:readline";
import crypto from "node:crypto";
import path from "node:path";
import os from "node:os";

const execAsync = promisify(exec);

function question(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

// STRIPE CLI CHECK COMMENTED OUT - TO BE ENABLED LATER
/*
async function checkStripeCLI() {
  console.log(
    'Step 1: Checking if Stripe CLI is installed and authenticated...'
  );
  try {
    await execAsync('stripe --version');
    console.log('Stripe CLI is installed.');

    // Check if Stripe CLI is authenticated
    try {
      await execAsync('stripe config --list');
      console.log('Stripe CLI is authenticated.');
    } catch (error) {
      console.log(
        'Stripe CLI is not authenticated or the authentication has expired.'
      );
      console.log('Please run: stripe login');
      const answer = await question(
        'Have you completed the authentication? (y/n): '
      );
      if (answer.toLowerCase() !== 'y') {
        console.log(
          'Please authenticate with Stripe CLI and run this script again.'
        );
        process.exit(1);
      }

      // Verify authentication after user confirms login
      try {
        await execAsync('stripe config --list');
        console.log('Stripe CLI authentication confirmed.');
      } catch (error) {
        console.error(
          'Failed to verify Stripe CLI authentication. Please try again.'
        );
        process.exit(1);
      }
    }
  } catch (error) {
    console.error(
      'Stripe CLI is not installed. Please install it and try again.'
    );
    console.log('To install Stripe CLI, follow these steps:');
    console.log('1. Visit: https://docs.stripe.com/stripe-cli');
    console.log(
      '2. Download and install the Stripe CLI for your operating system'
    );
    console.log('3. After installation, run: stripe login');
    console.log(
      'After installation and authentication, please run this setup script again.'
    );
    process.exit(1);
  }
}
*/

async function getPostgresURL(): Promise<string> {
  console.log("Step 1: Setting up Postgres");
  const dbChoice = await question(
    "Choose your database option:\n" +
      "  L - Local Postgres with Docker (development)\n" +
      "  N - Neon Database (recommended for production)\n" +
      "  V - Vercel Postgres\n" +
      "  R - Other remote Postgres\n" +
      "Enter your choice (L/N/V/R): "
  );

  if (dbChoice.toLowerCase() === "l") {
    console.log("Setting up local Postgres instance with Docker...");
    await setupLocalPostgres();
    return "postgres://postgres:postgres@localhost:54322/postgres";
  } else if (dbChoice.toLowerCase() === "n") {
    console.log("\n📝 Setting up Neon Database:");
    console.log("1. Go to: https://console.neon.tech/app/projects");
    console.log("2. Create a new project");
    console.log("3. Copy the connection string from the dashboard");
    return await question("Enter your Neon POSTGRES_URL: ");
  } else if (dbChoice.toLowerCase() === "v") {
    console.log("\n📝 Setting up Vercel Postgres:");
    console.log("1. Go to: https://vercel.com/dashboard");
    console.log("2. Go to Storage → Create Database → Postgres");
    console.log("3. Copy the POSTGRES_URL from the .env.local tab");
    return await question("Enter your Vercel POSTGRES_URL: ");
  } else {
    console.log("\n📝 Using custom remote Postgres database");
    return await question("Enter your POSTGRES_URL: ");
  }
}

async function setupLocalPostgres() {
  console.log("Checking if Docker is installed...");
  try {
    await execAsync("docker --version");
    console.log("Docker is installed.");
  } catch (error) {
    console.error(
      "Docker is not installed. Please install Docker and try again."
    );
    console.log(
      "To install Docker, visit: https://docs.docker.com/get-docker/"
    );
    process.exit(1);
  }

  console.log("Creating docker-compose.yml file...");
  const dockerComposeContent = `
services:
  postgres:
    image: postgres:16.4-alpine
    container_name: next_saas_starter_postgres
    environment:
      POSTGRES_DB: postgres
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "54322:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
`;

  await fs.writeFile(
    path.join(process.cwd(), "docker-compose.yml"),
    dockerComposeContent
  );
  console.log("docker-compose.yml file created.");

  console.log("Starting Docker container with `docker compose up -d`...");
  try {
    await execAsync("docker compose up -d");
    console.log("Docker container started successfully.");
  } catch (error) {
    console.error(
      "Failed to start Docker container. Please check your Docker installation and try again."
    );
    process.exit(1);
  }
}

// STRIPE FUNCTIONS COMMENTED OUT - TO BE ENABLED LATER
/*
async function getStripeSecretKey(): Promise<string> {
  console.log('Step 3: Getting Stripe Secret Key');
  console.log(
    'You can find your Stripe Secret Key at: https://dashboard.stripe.com/test/apikeys'
  );
  return await question('Enter your Stripe Secret Key: ');
}

async function createStripeWebhook(): Promise<string> {
  console.log('Step 4: Creating Stripe webhook...');
  try {
    const { stdout } = await execAsync('stripe listen --print-secret');
    const match = stdout.match(/whsec_[a-zA-Z0-9]+/);
    if (!match) {
      throw new Error('Failed to extract Stripe webhook secret');
    }
    console.log('Stripe webhook created.');
    return match[0];
  } catch (error) {
    console.error(
      'Failed to create Stripe webhook. Check your Stripe CLI installation and permissions.'
    );
    if (os.platform() === 'win32') {
      console.log(
        'Note: On Windows, you may need to run this script as an administrator.'
      );
    }
    throw error;
  }
}
*/

function generateAuthSecret(): string {
  console.log("Step 2: Generating AUTH_SECRET...");
  return crypto.randomBytes(32).toString("hex");
}

async function writeEnvFile(envVars: Record<string, string>) {
  console.log("Step 3: Writing environment variables to .env");
  const envContent = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  await fs.writeFile(path.join(process.cwd(), ".env"), envContent);
  console.log(".env file created with the necessary variables.");
  console.log("\n✅ Setup completed! Your environment is ready.");
  console.log("\nNext steps:");
  console.log("1. Run: pnpm db:migrate");
  console.log("2. Run: pnpm db:seed");
  console.log("3. Run: pnpm dev");
}

async function main() {
  console.log("🚀 Setting up your SaaS project...\n");

  // await checkStripeCLI(); // Commented out - Stripe disabled

  const POSTGRES_URL = await getPostgresURL();
  const BASE_URL = "http://localhost:3000";
  const AUTH_SECRET = generateAuthSecret();

  const envVars: Record<string, string> = {
    POSTGRES_URL,
    BASE_URL,
    AUTH_SECRET,
  };

  // Stripe environment variables (commented out)
  // STRIPE_SECRET_KEY: 'sk_test_...',
  // STRIPE_WEBHOOK_SECRET: 'whsec_...',

  await writeEnvFile(envVars);
}

main().catch(console.error);
