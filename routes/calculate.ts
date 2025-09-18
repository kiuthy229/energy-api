import { FastifyInstance } from 'fastify';
import { requestSchema } from '../models/schemas';
import { v4 as uuidv4 } from 'uuid';
import { normalizeAndValidateRow, calculateRow } from '../services/calculationService';

const store = new Map<string, { results: any[]; createdAt: string }>();

export async function calculateRoutes(fastify: FastifyInstance) {
  fastify.post('/calculate', async (req, reply) => {
    let parsed;
    try {
      parsed = requestSchema.parse(req.body);
    } catch (err) {
      return reply.status(400).send({
        error: 'Validation failed',
        details: (err as any).errors,
      });
    }

    const results = [];
    try {
      for (const raw of parsed.rows) {
        // ✅ Normalize + validate row
        const normalized = normalizeAndValidateRow(raw);
        // ✅ Calculate costs
        const result = calculateRow(normalized);
        results.push(result);
      }
    } catch (err) {
      return reply.status(400).send({
        error: 'Row validation/calculation failed',
        details: String(err),
      });
    }

    const id = uuidv4();
    store.set(id, { createdAt: new Date().toISOString(), results });

    return { id, rows: results.length, createdAt: store.get(id)?.createdAt };
  });

  fastify.get('/calculations/:id', async (request, reply) => {
    const id = (request.params as any).id;
    if (!store.has(id)) return reply.status(404).send({ error: 'Not found' });
    const item = store.get(id)!;
    return reply.send({ id, createdAt: item.createdAt, results: item.results });
  });
}
