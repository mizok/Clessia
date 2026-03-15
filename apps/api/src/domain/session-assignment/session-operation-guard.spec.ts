import { describe, expect, it } from 'vitest';
import {
  assertSessionOperable,
  SessionUnassignedError,
  SessionCancelledError,
} from './session-operation-guard';

describe('assertSessionOperable', () => {
  it('unassigned 課堂應拋 SessionUnassignedError', () => {
    expect(() =>
      assertSessionOperable({ assignmentStatus: 'unassigned', status: 'scheduled' }),
    ).toThrow(SessionUnassignedError);
  });

  it('assigned 課堂應可操作', () => {
    expect(() =>
      assertSessionOperable({ assignmentStatus: 'assigned', status: 'scheduled' }),
    ).not.toThrow();
  });

  it('cancelled + unassigned 課堂應拋 SessionCancelledError 而非 SessionUnassignedError', () => {
    expect(() =>
      assertSessionOperable({ assignmentStatus: 'unassigned', status: 'cancelled' }),
    ).toThrow(SessionCancelledError);
  });
});
