import { FastifyInstance } from 'fastify';
import { parse } from 'csv-parse/sync';
import { normalizeAndValidateRow, calculateRow } from '../services/calculationService';

const store = new Map<string, { results: any[]; createdAt: string }>();

export async function calculateRoutes(fastify: FastifyInstance) {
  fastify.post('/calculate', async (request, reply) => {
    let csvText = '';
    if ((request.headers['content-type'] || '').startsWith('multipart/') || (request as any).isMultipart && (request as any).isMultipart()) {
      const file = await (request as any).file();
      if (!file) return reply.status(400).send({ error: 'Missing file' });
      const buffer = await file.toBuffer();
      csvText = buffer.toString('utf8');
    } else {
      const body = (request.body as any);
      if (body && typeof body.csv === 'string') {
        csvText = body.csv;
      } else if (typeof body === 'string' && body.trim().includes(',')) {
        csvText = body;
      } else {
        return reply.status(400).send({ error: 'Provide CSV as multipart file (field "file") or as JSON { csv } or raw text/csv body' });
      }
    }

    let records: any[];
    try {
      records = parse(csvText, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch (err) {
      request.log.error(err);
      return reply.status(400).send({ error: 'CSV parse error', details: String(err) });
    }

    const results = [];
    try {
      for (const raw of records) {
        const normalized = normalizeAndValidateRow(raw);
        const r = calculateRow(normalized);
        results.push(r);
      }
    } catch (err) {
      return reply.status(400).send({ error: 'Validation/Calculation error', details: String(err) });
    }

    const id = require('uuid').v4();
    store.set(id, { results, createdAt: new Date().toISOString() });
    return reply.code(201).send({ id, rows: results.length, createdAt: store.get(id)!.createdAt });
  });

  fastify.get('/calculations/:id', async (request, reply) => {
    const id = (request.params as any).id;
    if (!store.has(id)) return reply.status(404).send({ error: 'Not found' });
    const item = store.get(id)!;
    return reply.send({ id, createdAt: item.createdAt, results: item.results });
  });
}
