// @jasonyu0100
// Voice cast for privet-drive-boy-who-lived-v1. MiniMax system voices, offsets chosen per identity.
import type { VoiceCast } from '../../core/voice-cast';

export const boyWhoLivedCast: VoiceCast = {
  narrator: { voiceId: 'English_CaptivatingStoryteller', speed: 0.96, pitch: 0, emotion: 'auto', note: 'Wry storybook narrator; amused at the Dursleys, hushed at the doorstep.' },
  actors: {
    vernon: { voiceId: 'English_MatureBoss', speed: 1.06, pitch: -2, emotion: 'auto', note: 'Blustering, impatient; speaks slightly too fast to sound in control.' },
    dumbledore: { voiceId: 'English_Steadymentor', speed: 0.9, pitch: -1, emotion: 'calm', note: 'Unhurried, light, kind; never raises his voice.' },
    mcgonagall: { voiceId: 'English_AssertiveQueen', speed: 1.0, pitch: 0, emotion: 'auto', note: 'Clipped and precise; grief kept under a stern surface.' },
    hagrid: { voiceId: 'English_ManWithDeepVoice', speed: 0.9, pitch: -4, emotion: 'sad', note: 'Huge, warm, breaking with sobs.' },
  },
  deliveries: {
    'dumbledore-confirms': { emotion: 'sad' },
    'hagrid-weeps': { speed: 0.84 },
    ending: { speed: 0.88, emotion: 'calm' },
  },
};
