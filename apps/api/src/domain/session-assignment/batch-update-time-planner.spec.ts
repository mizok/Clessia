import { describe, expect, it } from 'vitest';

import { planBatchUpdateTime } from './batch-update-time-planner';

describe('planBatchUpdateTime', () => {
  it('should detect class conflicts within the same batch plan', () => {
    const result = planBatchUpdateTime({
      newStartTime: '10:00:00',
      newEndTime: '12:00:00',
      targetSessions: [
        {
          id: 'session-1',
          classId: 'class-1',
          teacherId: null,
          sessionDate: '2026-03-23',
          status: 'scheduled',
        },
        {
          id: 'session-2',
          classId: 'class-1',
          teacherId: null,
          sessionDate: '2026-03-23',
          status: 'scheduled',
        },
      ],
      existingClassPeers: [],
      existingTeacherPeers: [],
    });

    expect(result.processableIds).toEqual(['session-1']);
    expect(result.conflicts).toEqual([
      expect.objectContaining({
        sessionId: 'session-2',
        reason: 'class_conflict',
        conflictingSessionId: 'session-1',
      }),
    ]);
  });

  it('should detect teacher conflicts within the same batch plan', () => {
    const result = planBatchUpdateTime({
      newStartTime: '10:00:00',
      newEndTime: '12:00:00',
      targetSessions: [
        {
          id: 'session-1',
          classId: 'class-1',
          teacherId: 'teacher-1',
          sessionDate: '2026-03-23',
          status: 'scheduled',
        },
        {
          id: 'session-2',
          classId: 'class-2',
          teacherId: 'teacher-1',
          sessionDate: '2026-03-23',
          status: 'scheduled',
        },
      ],
      existingClassPeers: [],
      existingTeacherPeers: [],
    });

    expect(result.processableIds).toEqual(['session-1']);
    expect(result.conflicts).toEqual([
      expect.objectContaining({
        sessionId: 'session-2',
        reason: 'teacher_conflict',
        conflictingSessionId: 'session-1',
      }),
    ]);
  });
});
