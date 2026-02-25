import type {
  BatchAssignConflict,
  BatchAssignPlanInput,
  BatchAssignPlanOutput,
} from './session-assignment.types';

function toMinutes(value: string): number {
  const [h = '0', m = '0'] = value.split(':');
  return Number(h) * 60 + Number(m);
}

function isOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  return toMinutes(startA) < toMinutes(endB) && toMinutes(startB) < toMinutes(endA);
}

export function planBatchAssign(input: BatchAssignPlanInput): BatchAssignPlanOutput {
  const updatedIds: string[] = [];
  const conflicts: BatchAssignConflict[] = [];
  let skippedNotEligible = 0;

  const conflictSessionIds = new Set<string>();

  for (const session of input.targetSessions) {
    const eligible =
      session.status === 'scheduled' &&
      (session.assignmentStatus === 'unassigned' || input.includeAssigned);
    if (!eligible) {
      skippedNotEligible += 1;
      continue;
    }

    if (input.mode === 'force') {
      updatedIds.push(session.id);
      continue;
    }

    const sessionConflicts = input.teacherBusySlots.filter(
      (busy) =>
        busy.sessionDate === session.sessionDate &&
        busy.sessionId !== session.id &&
        isOverlap(session.startTime, session.endTime, busy.startTime, busy.endTime),
    );

    if (sessionConflicts.length > 0) {
      conflictSessionIds.add(session.id);
      for (const conflict of sessionConflicts) {
        conflicts.push({
          sessionId: session.id,
          sessionDate: session.sessionDate,
          startTime: session.startTime,
          endTime: session.endTime,
          conflictWithSessionId: conflict.sessionId,
        });
      }
      continue;
    }

    updatedIds.push(session.id);
  }

  if (input.mode === 'strict' && conflicts.length > 0) {
    return {
      updatedIds: [],
      skippedConflicts: conflictSessionIds.size,
      skippedNotEligible,
      conflicts,
    };
  }

  return {
    updatedIds,
    skippedConflicts: conflictSessionIds.size,
    skippedNotEligible,
    conflicts,
  };
}
