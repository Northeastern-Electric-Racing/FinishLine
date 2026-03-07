import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './src/prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL!
  }
});
