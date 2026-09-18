// @jasonyu0100
import type { VoiceCast } from '../../core/voice-cast';
import { boyWhoLivedCast } from './boy-who-lived';
import { moonScarCast } from './moon-scar';
import { spiderMemoryCast } from './spider-memory';

export const casts: Readonly<Record<string, VoiceCast>> = {
  'spider-memory-between-us-v1': spiderMemoryCast,
  'moon-scar-reading-v1': moonScarCast,
  'privet-drive-boy-who-lived-v1': boyWhoLivedCast,
};
