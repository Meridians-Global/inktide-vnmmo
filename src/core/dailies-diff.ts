// @jasonyu0100
export type DailiesFrameDigest = Readonly<{
  frameId: string;
  momentId: string;
  file: string;
  sha256: string;
  textSha256: string;
}>;

export type DailiesReceiptDigest = Readonly<{
  experienceId: string;
  experienceSha256: string;
  frames: readonly DailiesFrameDigest[];
}>;

export type DailiesFrameChange = Readonly<{
  frameId: string;
  momentId: string;
  status: 'added' | 'removed' | 'changed' | 'unchanged';
  textChanged: boolean;
  before: DailiesFrameDigest | null;
  after: DailiesFrameDigest | null;
}>;

export type DailiesDiff = Readonly<{
  experienceId: string;
  experienceChanged: boolean;
  before: string | null;
  after: string;
  frames: readonly DailiesFrameChange[];
  counts: Readonly<{ added: number; removed: number; changed: number; unchanged: number }>;
}>;

export function diffDailies(before: DailiesReceiptDigest | null, after: DailiesReceiptDigest): DailiesDiff {
  const beforeFrames = new Map((before?.frames ?? []).map((frame) => [frame.frameId, frame]));
  const afterFrames = new Map(after.frames.map((frame) => [frame.frameId, frame]));
  const frames: DailiesFrameChange[] = [];

  for (const frame of after.frames) {
    const prior = beforeFrames.get(frame.frameId) ?? null;
    const status = !prior ? 'added' : prior.sha256 === frame.sha256 ? 'unchanged' : 'changed';
    frames.push({ frameId: frame.frameId, momentId: frame.momentId, status, textChanged: Boolean(prior) && prior!.textSha256 !== frame.textSha256, before: prior, after: frame });
  }
  for (const frame of before?.frames ?? []) {
    if (afterFrames.has(frame.frameId)) continue;
    frames.push({ frameId: frame.frameId, momentId: frame.momentId, status: 'removed', textChanged: false, before: frame, after: null });
  }

  const counts = { added: 0, removed: 0, changed: 0, unchanged: 0 };
  for (const frame of frames) counts[frame.status] += 1;
  return {
    experienceId: after.experienceId,
    experienceChanged: before?.experienceSha256 !== after.experienceSha256,
    before: before?.experienceSha256 ?? null,
    after: after.experienceSha256,
    frames,
    counts,
  };
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));
}

/**
 * Render a self-contained before/after contact sheet. Image paths are resolved
 * relative to the sheet's own location by the caller; a null before-path means the
 * baseline is known only by its pinned hash (no bytes on disk).
 */
export function renderDailiesContactSheet(
  diff: DailiesDiff,
  paths: Readonly<{ before: (frame: DailiesFrameDigest) => string | null; after: (frame: DailiesFrameDigest) => string }>,
  options: Readonly<{ title?: string; showUnchanged?: boolean }> = {},
): string {
  const visible = diff.frames.filter((frame) => options.showUnchanged || frame.status !== 'unchanged');
  const rows = visible.map((frame) => {
    const beforePath = frame.before ? paths.before(frame.before) : null;
    const before = !frame.before
      ? '<span class="empty">—</span>'
      : beforePath
        ? `<img src="${escapeHtml(beforePath)}" alt="before ${escapeHtml(frame.frameId)}" loading="lazy">`
        : `<span class="empty">pinned ${escapeHtml(frame.before.sha256.slice(0, 12))} · no bytes on disk</span>`;
    const after = frame.after ? `<img src="${escapeHtml(paths.after(frame.after))}" alt="after ${escapeHtml(frame.frameId)}" loading="lazy">` : '<span class="empty">—</span>';
    return `<section class="frame ${frame.status}" id="${escapeHtml(frame.frameId)}">
  <h2><code>${escapeHtml(frame.frameId)}</code> <span class="status">${frame.status}${frame.textChanged ? ' · text' : ''}</span></h2>
  <div class="pair"><figure>${before}<figcaption>before</figcaption></figure><figure>${after}<figcaption>after</figcaption></figure></div>
</section>`;
  }).join('\n');
  const summary = `${diff.counts.changed} changed · ${diff.counts.added} added · ${diff.counts.removed} removed · ${diff.counts.unchanged} unchanged`;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(options.title ?? `${diff.experienceId} dailies diff`)}</title>
<style>
body{margin:0;padding:24px;background:#111;color:#ddd;font:14px/1.4 system-ui,sans-serif}
h1{font-size:18px;margin:0 0 4px}p.meta{margin:0 0 24px;color:#999}
.frame{margin:0 0 28px;padding:12px;border:1px solid #2a2a2a;border-radius:6px}
.frame.changed{border-color:#c9a227}.frame.added{border-color:#3d9a5f}.frame.removed{border-color:#b04a4a}
h2{font-size:14px;margin:0 0 8px}.status{color:#999;font-weight:400}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:12px}figure{margin:0}img{width:100%;aspect-ratio:16/9;object-fit:cover;background:#000;border-radius:3px}
figcaption{color:#777;font-size:12px;margin-top:4px}.empty{display:grid;place-items:center;aspect-ratio:16/9;background:#181818;color:#555}
</style></head><body>
<h1>${escapeHtml(diff.experienceId)}</h1>
<p class="meta">${summary}${diff.before ? ` · ${diff.before.slice(0, 12)} → ${diff.after.slice(0, 12)}` : ` · first capture ${diff.after.slice(0, 12)}`}</p>
${rows || '<p class="meta">No frame changed.</p>'}
</body></html>
`;
}
