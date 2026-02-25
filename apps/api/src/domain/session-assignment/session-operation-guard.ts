import type { SessionAssignmentStatus } from './session-assignment.types';

export class SessionUnassignedError extends Error {
  readonly code = 'SESSION_UNASSIGNED';

  constructor() {
    super('課堂尚未指派老師，無法執行此操作');
    this.name = 'SessionUnassignedError';
  }
}

export interface SessionOperationState {
  readonly assignmentStatus: SessionAssignmentStatus;
  readonly status: 'scheduled' | 'completed' | 'cancelled';
}

export function assertSessionOperable(session: SessionOperationState): void {
  if (session.assignmentStatus === 'unassigned') {
    throw new SessionUnassignedError();
  }
}
