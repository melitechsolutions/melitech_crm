import { describe, it, expect, vi } from 'vitest';
import { ticketsRouter } from '../tickets';
import { tickets, ticketComments, ticketTasks } from '../../../drizzle/schema-extended';

// stub DB similar to other integration tests
const fakeDb: any = {
  select: () => ({ from: () => ({ where: () => ({ limit: (n: number) => Promise.resolve([]) }) }) }),
  insert: () => ({ values: () => Promise.resolve() }),
  update: () => ({ set: () => ({ where: () => Promise.resolve() }) }),
  delete: () => ({ where: () => Promise.resolve() }),
  logActivity: vi.fn(),
};

// helper to simulate an existing ticket record when update is invoked
function ensureTicketExists() {
  fakeDb.select = () => ({
    from: () => ({
      where: () => ({
        limit: (n: number) => Promise.resolve([{ id: 't1' }]),
      }),
    }),
  });
}

vi.mock('../../db', () => ({
  getDb: vi.fn(async () => fakeDb),
}));

describe('Tickets Router basic checks', () => {
  it('should expose create and comment procedures', () => {
    expect(typeof ticketsRouter.create).toBe('function');
    expect(typeof ticketsRouter.addComment).toBe('function');
    expect(typeof ticketsRouter.update).toBe('function');
    expect(typeof ticketsRouter.list).toBe('function');
  });

  it('create should return id', async () => {
    const caller = ticketsRouter.createCaller({ user: { id: 'u' } } as any);
    const res = await caller.create({ clientId: 'c1', title: 'foo' });
    expect(res).toHaveProperty('id');
  });

  it('update with minimal fields succeeds', async () => {
    ensureTicketExists();
    const caller = ticketsRouter.createCaller({ user: { id: 'u' } } as any);
    const res = await caller.update({ id: 't1', title: 'new' });
    expect(res).toEqual({ success: true });
  });

  it('addComment should return id', async () => {
    const caller = ticketsRouter.createCaller({ user: { id: 'u' } } as any);
    const res = await caller.addComment({ ticketId: 't1', body: 'hello' });
    expect(res).toHaveProperty('id');
  });

  it('createTask should return id', async () => {
    const caller = ticketsRouter.createCaller({ user: { id: 'u' } } as any);
    const res = await caller.createTask({ ticketId: 't1', serviceType: 'repair' });
    expect(res).toHaveProperty('id');
  });

  it('delete should succeed', async () => {
    const caller = ticketsRouter.createCaller({ user: { id: 'u' } } as any);
    const res = await caller.delete('t1');
    expect(res).toEqual({ success: true });
  });

  it('getById returns ticket with comments/tasks', async () => {
    // adjust fakeDb to return sample ticket, comment, task
    fakeDb.select = () => ({
      from: (table: any) => ({
        where: (cond: any) => {
          if (table === tickets) {
            return { limit: (n: number) => Promise.resolve([{ id: 't1', title: 'hi' }]) };
          }
          if (table === ticketComments) {
            return Promise.resolve([{ id: 'c1', ticketId: 't1', body: 'a' }]);
          }
          if (table === ticketTasks) {
            return Promise.resolve([{ id: 'k1', ticketId: 't1', serviceType: 'foo' }]);
          }
          return Promise.resolve([]);
        },
      }),
    });
    const caller = ticketsRouter.createCaller({ user: { id: 'u' } } as any);
    const res = await caller.getById('t1');
    expect(res).toMatchObject({ id: 't1', comments: [{ id: 'c1' }], tasks: [{ id: 'k1' }] });
  });
});
