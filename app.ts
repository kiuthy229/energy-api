// app.ts
import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import { env } from './config/env';
import { calculateRoutes } from './routes/calculate';
import { healthRoutes } from './routes/health';

const fastify = Fastify({ logger: true });

async function buildServer() {
  await fastify.register(multipart);
  await calculateRoutes(fastify);
  await healthRoutes(fastify);

  await fastify.listen({ port: env.PORT, host: '0.0.0.0' });
  fastify.log.info(`listening on ${env.PORT}`);
}

buildServer().catch((err) => {
  console.error(err);
  process.exit(1);
});
