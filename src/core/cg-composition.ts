// @jasonyu0100
// A CG is a shot, not a lineup. The brief names the choices a cinematographer makes before anyone is drawn:
// where the camera stands, who sits on which third, what lies in each depth plane, where every eye and hand points,
// what lights the frame and where the text rail may fall. The kit compiles it into prompt text so no CG can be
// requested with an unconsidered composition.

export type ShotScale = 'wide' | 'full' | 'medium' | 'medium-close' | 'close';
export type CameraHeight = 'low' | 'eye' | 'high' | 'overhead';
export type CameraAngle = 'frontal' | 'three-quarter' | 'profile' | 'over-shoulder' | 'from-behind';
export type Third = 'left' | 'centre' | 'right';
export type Facing = 'toward-camera' | 'away-from-camera' | 'screen-left' | 'screen-right' | 'into-depth';
export type NegativeSpace = 'lower-quarter' | 'upper-third' | 'left-third' | 'right-third';

export type Placement = Readonly<{
  subject: string;
  third: Third;
  /** Which plane the subject occupies; the nearest plane may be cut by the frame edge. */
  plane: 'fore' | 'mid' | 'far';
  facing: Facing;
  /** Where the subject's gaze or gesture sends the viewer's eye. */
  vector?: string;
}>;

export type CgComposition = Readonly<{
  scale: ShotScale;
  camera: Readonly<{ height: CameraHeight; angle: CameraAngle }>;
  placements: readonly Placement[];
  /** Fore / mid / far content that gives the frame depth; the mid plane holds the action. */
  planes: Readonly<{ fore: string; mid: string; far: string }>;
  /** One motivated key light and where it comes from; fill and rim are implied. */
  light: Readonly<{ key: string; from: string; mood: string }>;
  /** A frame element that guides the eye toward the subject (road, railing, shadow, gesture). */
  leadingLine: string;
  /** Where quiet space is kept for the dialogue rail; nothing readable is placed there. */
  negativeSpace: NegativeSpace;
}>;

const SCALE: Record<ShotScale, string> = {
  wide: 'wide shot, figures small against the setting',
  full: 'full shot, figures head to toe',
  medium: 'medium shot, figures from the waist',
  'medium-close': 'medium close-up, figures from the chest',
  close: 'close-up on faces and hands',
};

const HEIGHT: Record<CameraHeight, string> = {
  low: 'camera low, looking slightly up',
  eye: 'camera at eye level',
  high: 'camera high, looking down',
  overhead: 'camera directly overhead',
};

const ANGLE: Record<CameraAngle, string> = {
  frontal: 'frontal',
  'three-quarter': 'three-quarter angle',
  profile: 'in profile',
  'over-shoulder': 'over the shoulder of the nearest figure',
  'from-behind': 'from behind the nearest figure',
};

const FACING: Record<Facing, string> = {
  'toward-camera': 'facing the camera',
  'away-from-camera': 'back to the camera',
  'screen-left': 'facing screen-left',
  'screen-right': 'facing screen-right',
  'into-depth': 'turned into the depth of the scene',
};

const NEGATIVE: Record<NegativeSpace, string> = {
  'lower-quarter': 'the lower quarter of the frame',
  'upper-third': 'the upper third of the frame',
  'left-third': 'the left third of the frame',
  'right-third': 'the right third of the frame',
};

/** The brief must place at least one subject, keep placements asymmetric and never put a subject in the reserved space. */
export function validateComposition(brief: CgComposition): string[] {
  const errors: string[] = [];
  if (brief.placements.length === 0) errors.push('composition places no subject');
  const thirds = new Set(brief.placements.map((placement) => placement.third));
  if (brief.placements.length > 1 && thirds.size === 1) errors.push('every subject sits on the same third; stagger them');
  if (brief.placements.length > 1 && brief.placements.every((placement) => placement.plane === brief.placements[0]!.plane)) {
    errors.push('every subject sits in the same depth plane; put one nearer the camera');
  }
  if (brief.placements.length > 1 && brief.placements.every((placement) => placement.facing === 'toward-camera')) {
    errors.push('every subject faces the camera; turn at least one into the scene');
  }
  const reserved: Record<NegativeSpace, Third | undefined> = { 'left-third': 'left', 'right-third': 'right', 'lower-quarter': undefined, 'upper-third': undefined };
  const collision = reserved[brief.negativeSpace];
  if (collision && brief.placements.some((placement) => placement.third === collision)) {
    errors.push(`a subject sits in the ${brief.negativeSpace} reserved for negative space`);
  }
  return errors;
}

/** Compile the brief to prompt text; throws when the brief fails validation. */
export function composePrompt(brief: CgComposition): string {
  const errors = validateComposition(brief);
  if (errors.length) throw new Error(`Invalid CG composition: ${errors.join('; ')}`);
  const placements = brief.placements.map((placement) => {
    const vector = placement.vector ? `, ${placement.vector}` : '';
    return `${placement.subject} on the ${placement.third} third in the ${placement.plane}ground, ${FACING[placement.facing]}${vector}`;
  });
  return [
    `Composition: ${SCALE[brief.scale]}, ${HEIGHT[brief.camera.height]}, ${ANGLE[brief.camera.angle]}.`,
    `Placement: ${placements.join('; ')}.`,
    `Depth: foreground ${brief.planes.fore}; midground ${brief.planes.mid}; background ${brief.planes.far}.`,
    `Light: ${brief.light.key} from ${brief.light.from}, ${brief.light.mood}.`,
    `Leading line: ${brief.leadingLine}.`,
    `Keep ${NEGATIVE[brief.negativeSpace]} quiet with nothing readable placed there.`,
    'Asymmetric framing on the rule of thirds; no centred symmetric lineup, no flat wall behind the figures, no eye-level group shot.',
  ].join(' ');
}
