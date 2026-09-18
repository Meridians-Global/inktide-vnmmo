// @jasonyu0100
// Voice cast for spider-memory-between-us-v1.
import type { VoiceCast } from '../../core/voice-cast';

export const spiderMemoryCast: VoiceCast = {
  narrator: { voiceId: 'English_expressive_narrator', speed: 0.94, pitch: -1, emotion: 'calm', note: 'Close, rain-quiet narration; intimate rather than epic.' },
  actors: {
    'peter-parker': { voiceId: 'English_ReservedYoungMan', speed: 0.98, pitch: 0, emotion: 'auto', note: 'Young, careful, holding back; apology without pleading.' },
    mj: { voiceId: 'English_ConfidentWoman', speed: 0.97, pitch: 0, emotion: 'auto', note: 'Steady, guarded, sets terms; sympathy without memory.' },
  },
};
