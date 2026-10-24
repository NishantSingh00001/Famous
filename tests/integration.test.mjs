import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
test('production build contains every runtime module referenced by the app shell', async () => {
  const [html, app, core, css] = await Promise.all(['index.html', 'app.js', 'game-core.mjs', 'style.css'].map(name => readFile(join(dist, name), 'utf8')));
  assert.match(html, /<script type="module" src="app\.js"><\/script>/);
  assert.match(app, /from ['"]\.\/game-core\.mjs['"]/);
  assert.match(core, /export function sanitizeSave/);
  assert.ok(css.length > 1000);
});

test('production bundle rejects dangerous or oversized imported data at its entry point', async () => {
  const [app, core] = await Promise.all(['app.js', 'game-core.mjs'].map(name => readFile(join(dist, name), 'utf8')));
  assert.match(app, /file\.size>2\*1024\*1024/);
  assert.match(app, /sanitizeSave\(parsed,fresh\(\)\)/);
  assert.match(core, /export function normalizeAccounts/);
  assert.match(core, /export function persistJSON/);
  assert.match(app, /Progress could not be saved on this device/);
});

test('visible notification, conversation, and board-filter controls have event routes', async () => {
  const app = await readFile(join(dist, 'app.js'), 'utf8');
  assert.match(app, /data-notifications/);
  assert.match(app, /if\(d\.notifications\)\{showNotifications\(\);return\}/);
  assert.match(app, /data-conversation-more/);
  assert.match(app, /if\(d\.conversationMore\)\{showConversationOptions\(\);return\}/);
  assert.match(app, /data-comment-sort/);
  assert.match(app, /if\(d\.commentSort\)\{commentSort=/);
  assert.match(app, /if\(d\.boardFilter\)\{boardFilter=d\.boardFilter;render\(\);return\}/);
});

test('media exploration falls back on 401 and NPC profile tabs have interactive routes', async () => {
  const [app, core, css] = await Promise.all(['app.js', 'game-core.mjs', 'style.css'].map(name => readFile(join(dist, name), 'utf8')));
  assert.match(core, /export async function fetchMediaResults/);
  assert.match(core, /if \(kind === 'video'\) return searchCommons\(\)/);
  assert.match(app, /fetchMediaResults\(fetch,query/);
  assert.match(app, /data-npc-profile-tab=/);
  assert.match(app, /addEventListener\('click',e=>\{const tab=e\.target\.closest\('\[data-npc-profile-tab\]'\)/);
  assert.match(css, /\.npc-profile-grid\{display:grid/);
});

test('For You story rail, feed NPC profiles, and story-task DMs are wired in the app bundle', async () => {
  const [app, css] = await Promise.all(['app.js', 'style.css'].map(name => readFile(join(dist, name), 'utf8')));
  assert.match(app, /class="feed-story-rail"/);
  assert.match(css, /\.feed-story-rail/);
  assert.match(app, /class="post-identity" data-npc-open="\$\{owner\.id\}"/);
  assert.match(app, /if\(d\.npcOpen\)\{showNPCProfile\(d\.npcOpen\);return\}/);
  assert.match(app, /buildNpcStoryTask\(contact,story/);
  assert.match(app, /data-task-choice="\$\{task\.id\}\|/);
  assert.match(app, /resolveNPCStoryTask\(taskId,choice\)/);
  assert.match(app, /Object\.defineProperty\(npc,'photo'/);
  assert.match(app, /uniqueNpcName\(n,npcFirst,npcLast,npcMiddle\)/);
  assert.match(app, /function ensureStoryNPCs\(storyId\)/);
  assert.match(app, /const NPC_ROSTER_SIZE=100000/);
});

test('story viewer supports tap navigation, swipe dismissal, pause, replies, and profile visits', async () => {
  const app = await readFile(join(dist, 'app.js'), 'utf8');
  assert.match(app, /frame\.addEventListener\('click',e=>\{if\(storyTouchMoved\)/);
  assert.match(app, /dy>80&&Math\.abs\(dy\)>Math\.abs\(dx\)/);
  assert.match(app, /frame\.addEventListener\('pointerdown',pauseStoryTimer\)/);
  assert.match(app, /data-story-reply="\$\{c\.id\}"/);
  assert.match(app, /data-npc-open="'\+esc\(c\.id\)/);
});

test('NPC portraits come from the unique offline portrait generator across the cast', async () => {
  const [app, core] = await Promise.all(['app.js', 'game-core.mjs'].map(name => readFile(join(dist, name), 'utf8')));
  assert.match(app, /function npcPortrait\(index\)\{return buildNpcPortraitDataUrl\(index\)\}/);
  assert.match(app, /Object\.defineProperty\(npc,'photo'/);
  assert.match(app, /npc\.photo=npcPortrait\(10000\+i\)/);
  assert.match(core, /export function buildNpcPortraitDataUrl\(index\)/);
  assert.match(core, /data:image\/svg\+xml,/);
});

test('NPC discovery, starter board, and generated replies stay inside the active story', async () => {
  const [app, core] = await Promise.all(['app.js', 'game-core.mjs'].map(name => readFile(join(dist, name), 'utf8')));
  assert.match(app, /function storyNPCs\(\)\{const id=Number\(state\.story\?\.id\);return ensureStoryNPCs\(id\)\}/);
  assert.match(app, /function renderDiscover\(\)\{[^]*directory=storyNPCs\(\)/);
  assert.doesNotMatch(app, /<option>All stories<\/option>/);
  assert.match(app, /function starterBoards\(\)\{const people=storyNPCs\(\)/);
  assert.match(app, /function scheduleBoardAudience\(boardId\)\{setTimeout\(\(\)=>\{[^]*const people=storyNPCs\(\)/);
  assert.match(core, /export function filterCastForStory\(cast, storyId\)/);
});

test('story setup reveals a typewriter prologue and ten story-local follower choices before identity creation', async () => {
  const [app, css] = await Promise.all(['app.js', 'style.css'].map(name => readFile(join(dist, name), 'utf8')));
  assert.match(app, /function showStoryPrologue\(\)/);
  assert.match(app, /setInterval\(tick,115\)/);
  assert.match(app, /function showFirstFollowerPicker\(\)/);
  assert.match(app, /selectFirstFollowerCandidates\(ensureStoryNPCs\(story\.id\),story\.id,10\)/);
  assert.match(app, /data-select-follower=/);
  assert.match(app, /function showPlayerIdentityForm\(\)/);
  assert.match(css, /\.typewriter-copy/);
  assert.match(css, /\.follower-grid/);
});

test('Practice Live is launched from the active story and only schedules comments from that cast', async () => {
  const [app, css] = await Promise.all(['app.js', 'style.css'].map(name => readFile(join(dist, name), 'utf8')));
  assert.match(app, /data-action="go-live"/);
  assert.match(app, /function startLive\(\)[^{]*\{[^]*const people=storyNPCs\(\)/);
  assert.match(app, /function renderLive\(\)/);
  assert.match(app, /Practice Live · only your story cast can see this/);
  assert.match(app, /function endLive\(\)/);
  assert.match(app, /data-action="live-comment"/);
  assert.match(css, /\.live-screen/);
});

test('Capacitor Android and iOS asset copies include the current modular web app', async () => {
  for (const platformPath of ['../android/app/src/main/assets/public', '../ios/App/App/public']) {
    const platform = join(new URL(platformPath, import.meta.url).pathname);
    const [html, app, core] = await Promise.all(['index.html', 'app.js', 'game-core.mjs'].map(name => readFile(join(platform, name), 'utf8')));
    assert.match(html, /type="module" src="app\.js"/);
    assert.match(app, /if\(d\.notifications\)\{showNotifications\(\);return\}/);
    assert.match(core, /export function sortBoardItems/);
  }
});
