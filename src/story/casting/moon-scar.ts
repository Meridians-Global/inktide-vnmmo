// @jasonyu0100
// Voice cast for moon-scar-reading-v1.
import type { VoiceCast } from '../../core/voice-cast';

export const moonScarCast: VoiceCast = {
  narrator: { voiceId: 'English_Insightful_Speaker', speed: 0.93, pitch: -1, emotion: 'neutral', note: 'Measured, ledger-like narration; observes rather than dramatises.' },
  actors: {
    'fang-yuan': { voiceId: 'English_magnetic_voiced_man', speed: 0.94, pitch: -2, emotion: 'calm', note: 'Low, even, patient; every question already priced.' },
    'gu-yue-chun': { voiceId: 'English_Graceful_Lady', speed: 0.98, pitch: 0, emotion: 'auto', note: 'Composed and exact; distance held in the sleeve.' },
  },
};
