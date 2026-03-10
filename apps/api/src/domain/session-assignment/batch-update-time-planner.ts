import { isTimeOverlap, normalizeTime } from './time-utils';

export interface BatchUpdateTimeTargetSession {
  readonly id: string;
  readonly classId: string;
  readonly teacherId: string | null;
  readonly sessionDate: string;
  readonly status: 'scheduled' | 'completed' | 'cancelled';
}

export interface BatchUpdateTimeExistingClassPeer {
  readonly id: string;
  readonly classId: string;
  readonly sessionDate: string;
  readonly startTime: string;
  readonly endTime: string;
}

export interface BatchUpdateTimeExistingTeacherPeer {
  readonly id: string;
  readonly teacherId: string | null;
  readonly sessionDate: string;
  readonly startTime: string;
  readonly endTime: string;
}

export interface BatchUpdateTimeConflict {
  readonly sessionId: string;
  readonly sessionDate: string;
  readonly reason: 'status_not_editable' | 'class_conflict' | 'teacher_conflict';
  readonly detail: string;
  readonly conflictingSessionId?: string;
}

export interface BatchUpdateTimePlanInput {
  readonly newStartTime: string;
  readonly newEndTime: string;
  readonly targetSessions: readonly BatchUpdateTimeTargetSession[];
  readonly existingClassPeers: readonly BatchUpdateTimeExistingClassPeer[];
  readonly existingTeacherPeers: readonly BatchUpdateTimeExistingTeacherPeer[];
}

export interface BatchUpdateTimePlanOutput {
  readonly processableIds: string[];
  readonly conflicts: BatchUpdateTimeConflict[];
}

export function planBatchUpdateTime(input: BatchUpdateTimePlanInput): BatchUpdateTimePlanOutput {
  const conflicts: BatchUpdateTimeConflict[] = [];
  const processableIds: string[] = [];
  const plannedSlots: Array<{
    sessionId: string;
    classId: string;
    teacherId: string | null;
    sessionDate: string;
    startTime: string;
    endTime: string;
  }> = [];
  const newStartTime = normalizeTime(input.newStartTime);
  const newEndTime = normalizeTime(input.newEndTime);

  for (const target of input.targetSessions) {
    if (target.status !== 'scheduled') {
      conflicts.push({
        sessionId: target.id,
        sessionDate: target.sessionDate,
        reason: 'status_not_editable',
        detail: '僅可修改狀態為「scheduled」的課堂',
      });
      continue;
    }

    const classConflictWithExisting = input.existingClassPeers.find(
      (peer) =>
        peer.id !== target.id &&
        peer.classId === target.classId &&
        peer.sessionDate === target.sessionDate &&
        isTimeOverlap(
          newStartTime,
          newEndTime,
          normalizeTime(peer.startTime),
          normalizeTime(peer.endTime),
        ),
    );

    if (classConflictWithExisting) {
      conflicts.push({
        sessionId: target.id,
        sessionDate: target.sessionDate,
        reason: 'class_conflict',
        detail: '同班級於此時段已有課堂',
        conflictingSessionId: classConflictWithExisting.id,
      });
      continue;
    }

    const classConflictWithPlanned = plannedSlots.find(
      (slot) =>
        slot.classId === target.classId &&
        slot.sessionDate === target.sessionDate &&
        isTimeOverlap(newStartTime, newEndTime, slot.startTime, slot.endTime),
    );

    if (classConflictWithPlanned) {
      conflicts.push({
        sessionId: target.id,
        sessionDate: target.sessionDate,
        reason: 'class_conflict',
        detail: '同班級於此時段已有課堂',
        conflictingSessionId: classConflictWithPlanned.sessionId,
      });
      continue;
    }

    if (target.teacherId) {
      const teacherConflictWithExisting = input.existingTeacherPeers.find(
        (peer) =>
          peer.id !== target.id &&
          peer.teacherId === target.teacherId &&
          peer.sessionDate === target.sessionDate &&
          isTimeOverlap(
            newStartTime,
            newEndTime,
            normalizeTime(peer.startTime),
            normalizeTime(peer.endTime),
          ),
      );

      if (teacherConflictWithExisting) {
        conflicts.push({
          sessionId: target.id,
          sessionDate: target.sessionDate,
          reason: 'teacher_conflict',
          detail: '老師於此時段已有其他課堂',
          conflictingSessionId: teacherConflictWithExisting.id,
        });
        continue;
      }

      const teacherConflictWithPlanned = plannedSlots.find(
        (slot) =>
          slot.teacherId === target.teacherId &&
          slot.sessionDate === target.sessionDate &&
          isTimeOverlap(newStartTime, newEndTime, slot.startTime, slot.endTime),
      );

      if (teacherConflictWithPlanned) {
        conflicts.push({
          sessionId: target.id,
          sessionDate: target.sessionDate,
          reason: 'teacher_conflict',
          detail: '老師於此時段已有其他課堂',
          conflictingSessionId: teacherConflictWithPlanned.sessionId,
        });
        continue;
      }
    }

    processableIds.push(target.id);
    plannedSlots.push({
      sessionId: target.id,
      classId: target.classId,
      teacherId: target.teacherId,
      sessionDate: target.sessionDate,
      startTime: newStartTime,
      endTime: newEndTime,
    });
  }

  return {
    processableIds,
    conflicts,
  };
}
