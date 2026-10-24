const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const cleanText = (value, limit, fallback = '') => {
  if (typeof value !== 'string') return fallback;
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').slice(0, limit);
};
const cleanArray = (value, limit, map = x => x) => Array.isArray(value) ? value.slice(0, limit).map(map).filter(x => x !== undefined) : [];
const safeUrl = value => {
  if (typeof value !== 'string' || value.length > 2048) return '';
  try { return new URL(value).protocol === 'https:' ? value : ''; } catch { return ''; }
};
const safeMediaId = value => typeof value === 'string' && /^[\w-]{1,100}$/.test(value) ? value : '';
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function cleanThread(items, depth = 0) {
  if (depth > 4) return [];
  return cleanArray(items, 200, item => {
    if (!isRecord(item)) return undefined;
    return {
      id: cleanText(item.id, 100), owner: cleanText(item.owner, 100),
      name: cleanText(item.name, 80), text: cleanText(item.text, 1000),
      replies: cleanThread(item.replies, depth + 1),
    };
  });
}

function cleanPost(item) {
  if (!isRecord(item)) return undefined;
  return {
    id: cleanText(item.id, 100), owner: cleanText(item.owner, 100),
    text: cleanText(item.text, 280), type: cleanText(item.type, 20, 'post'),
    time: cleanText(item.time, 80), likes: Number.isFinite(item.likes) ? Math.max(0, Math.min(1e9, Math.floor(item.likes))) : 0,
    likedBy: cleanText(item.likedBy, 80), comments: cleanThread(item.comments),
    tag: cleanText(item.tag, 80), art: cleanText(item.art, 240),
    mediaId: safeMediaId(item.mediaId), mediaType: item.mediaType === 'video' ? 'video' : 'image',
    mediaSrc: safeUrl(item.mediaSrc), mediaAlt: cleanText(item.mediaAlt, 200),
    audioUrl: safeUrl(item.audioUrl), audioTitle: cleanText(item.audioTitle, 120),
    audioCredit: cleanText(item.audioCredit, 120), audioLicense: cleanText(item.audioLicense, 120),
    worldSeed: item.worldSeed === true,
  };
}

export function sanitizeSave(input, blank) {
  if (!isRecord(input) || !isRecord(input.profile) || !isRecord(input.stats)) return null;
  const base = JSON.parse(JSON.stringify(blank));
  const name = cleanText(input.profile.name, 24).trim();
  if (!name) return null;
  const number = (key, fallback, max = 100) => Number.isFinite(input.stats[key]) ? Math.max(0, Math.min(max, input.stats[key])) : fallback;
  const state = {
    ...base,
    started: input.started === true,
    profile: {
      name,
      handle: cleanText(input.profile.handle, 21, '@you'),
      bio: cleanText(input.profile.bio, 70),
      initial: name[0].toUpperCase(),
    },
    stats: {
      fame: number('fame', 0), aura: number('aura', 0), trust: number('trust', 0),
      stress: number('stress', 0), wealth: number('wealth', 40, 1e9),
    },
    posts: cleanArray(input.posts, 600, cleanPost),
    boards: cleanArray(input.boards, 300, item => isRecord(item) ? {
      id: cleanText(item.id, 100), owner: cleanText(item.owner, 100), title: cleanText(item.title, 65),
      text: cleanText(item.text, 1000), topic: cleanText(item.topic, 60), likes: Number.isFinite(item.likes) ? Math.max(0, item.likes) : 0,
      replies: cleanThread(item.replies), mediaId: safeMediaId(item.mediaId), mediaType: item.mediaType === 'video' ? 'video' : 'image',
    } : undefined),
    friends: cleanArray(input.friends, 10000, x => cleanText(x, 100)).filter(Boolean),
    enemies: cleanArray(input.enemies, 10000, x => cleanText(x, 100)).filter(Boolean),
    completed: cleanArray(input.completed, 100, x => cleanText(x, 80)).filter(Boolean),
    liked: cleanArray(input.liked, 10000, x => cleanText(x, 100)).filter(Boolean),
    saved: cleanArray(input.saved, 10000, x => cleanText(x, 100)).filter(Boolean),
    storyReactions: cleanArray(input.storyReactions, 10000, x => cleanText(x, 100)).filter(Boolean),
    notifications: cleanArray(input.notifications, 300, x => cleanText(x, 240)).filter(Boolean),
    log: cleanArray(input.log, 500, item => isRecord(item) ? {
      type: cleanText(item.type, 30), text: cleanText(item.text, 120),
      day: Number.isInteger(item.day) ? Math.max(1, Math.min(1e6, item.day)) : 1,
    } : undefined),
    unlocks: cleanArray(input.unlocks, 100, x => cleanText(x, 80)).filter(Boolean),
    reelVotes: isRecord(input.reelVotes) ? Object.fromEntries(Object.entries(input.reelVotes).slice(0, 100).map(([k, v]) => [cleanText(k, 80), cleanText(v, 40)])) : {},
    actions: isRecord(input.actions) ? Object.fromEntries(Object.entries(input.actions).slice(0, 50).map(([k, v]) => [cleanText(k, 40), Number.isFinite(v) ? Math.max(0, Math.min(1e6, v)) : 0])) : {},
    messages: isRecord(input.messages) ? Object.fromEntries(Object.entries(input.messages).slice(0, 500).map(([id, list]) => [cleanText(id, 100), cleanArray(list, 200, m => isRecord(m) ? { from: m.from === 'you' ? 'you' : 'them', text: cleanText(m.text, 1000) } : undefined)])) : {},
    npcTasks: cleanArray(input.npcTasks, 300, task => isRecord(task) ? {
      id: cleanText(task.id, 120), npcId: cleanText(task.npcId, 100), kind: task.kind === 'help' ? 'help' : 'risk',
      title: cleanText(task.title, 100), message: cleanText(task.message, 1000), action: cleanText(task.action, 240),
      status: ['pending', 'accepted', 'skipped', 'responded', 'ignored'].includes(task.status) ? task.status : 'pending',
      storyTitle: cleanText(task.storyTitle, 100),
    } : undefined),
    chapter: Number.isInteger(input.chapter) ? Math.max(1, Math.min(100, input.chapter)) : 1,
    day: Number.isInteger(input.day) ? Math.max(1, Math.min(1e6, input.day)) : 1,
    worldSequence: Number.isInteger(input.worldSequence) ? Math.max(0, Math.min(1e9, input.worldSequence)) : 0,
    worldLastTick: Number.isFinite(input.worldLastTick) ? Math.max(0, input.worldLastTick) : 0,
    createdAt: Number.isFinite(input.createdAt) ? Math.max(0, input.createdAt) : Date.now(),
    seenStory: input.seenStory === true,
    sound: input.sound === true,
    worldStories: cleanArray(input.worldStories, 80, x => isRecord(x) ? {
      id: cleanText(x.id, 100), owner: cleanText(x.owner, 100), text: cleanText(x.text, 280),
      mediaSrc: safeUrl(x.mediaSrc), mediaAlt: cleanText(x.mediaAlt, 200),
      createdAt: Number.isFinite(x.createdAt) ? x.createdAt : 0, expiresAt: Number.isFinite(x.expiresAt) ? x.expiresAt : 0,
    } : undefined),
  };
  if (isRecord(input.story) && Number.isInteger(input.story.id) && input.story.id >= 0 && input.story.id < 1060) {
    state.story = { id: input.story.id, title: cleanText(input.story.title, 100), category: cleanText(input.story.category, 40), summary: cleanText(input.story.summary, 200) };
  }
  return state;
}

export function normalizeAccounts(input, blank) {
  if (!isRecord(input) || !Array.isArray(input.accounts)) return { currentId: null, accounts: [] };
  const accounts = [];
  const seen = new Set();
  for (const account of input.accounts) {
    if (!isRecord(account) || typeof account.id !== 'string' || !account.id || seen.has(account.id)) continue;
    const save = sanitizeSave(account.save, blank);
    if (!save) continue;
    const id = cleanText(account.id, 120);
    if (!id) continue;
    seen.add(id);
    accounts.push({ id, name: cleanText(account.name, 28, 'Player').trim() || 'Player', save });
  }
  const currentId = accounts.some(account => account.id === input.currentId) ? input.currentId : accounts[0]?.id || null;
  return { currentId, accounts };
}

export function sortBoardItems(items, filter = 'Hot') {
  const copy = Array.isArray(items) ? [...items] : [];
  const score = item => (Number.isFinite(item?.likes) ? item.likes : 0) + (Array.isArray(item?.replies) ? item.replies.length : 0);
  if (filter === 'Questions') return copy.filter(item => item?.topic === 'Questions');
  if (filter === 'New') return copy.reverse();
  if (filter === 'Unpopular') return copy.sort((a, b) => score(a) - score(b));
  return copy.sort((a, b) => score(b) - score(a));
}

export function persistJSON(storage, key, value) {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function chooseVariant(items, index = 0) {
  if (!Array.isArray(items) || items.length === 0) return '';
  const seed = Number.isFinite(index) ? Math.abs(Math.trunc(index)) : 0;
  return items[seed % items.length];
}

export function uniqueNpcName(index, firstNames, lastNames, middleNames = []) {
  if (!Array.isArray(firstNames) || !firstNames.length || !Array.isArray(lastNames) || !lastNames.length) return 'Story Friend';
  const i = Math.max(0, Math.floor(Number(index) || 0));
  const base = `${firstNames[Math.floor(i / lastNames.length) % firstNames.length]} ${lastNames[i % lastNames.length]}`;
  if (!Array.isArray(middleNames) || !middleNames.length) return base;
  return `${firstNames[Math.floor(i / (lastNames.length * middleNames.length)) % firstNames.length]} ${middleNames[Math.floor(i / lastNames.length) % middleNames.length]} ${lastNames[i % lastNames.length]}`;
}

export function buildNpcBio({ storyTitle = 'your story', persona = 'a thoughtful local', goal = 'make a difference', value = 'curiosity', temperament = 'steady', socialStyle = 'a careful listener', voiceStyle = 'direct', } = {}) {
  const clean = value => String(value || '').trim().replace(/[.!?]+$/, '');
  return `In ${clean(storyTitle)}, ${clean(persona)} is trying to ${clean(goal)}. They put ${clean(value)} first, stay ${clean(temperament)}, connect as ${clean(socialStyle)}, and speak in a ${clean(voiceStyle)} way.`;
}

// Original offline portrait art: traits are stable per NPC index, so identity
// remains recognizable in feeds, profiles, stories, and messages without a
// remote image service or a repeated stock-photo pool.
export function buildNpcPortraitDataUrl(index) {
  const id = Math.max(0, Math.floor(Number(index) || 0));
  let seed = (id + 1) >>> 0;
  const next = max => {
    seed = (Math.imul(seed ^ (seed >>> 15), 1 | seed) + 0x6d2b79f5) >>> 0;
    let value = Math.imul(seed ^ (seed >>> 7), 61 | seed) ^ seed;
    value = (value ^ (value >>> 14)) >>> 0;
    return value % max;
  };
  const backdrops = ['#31556b','#68517a','#a45749','#38766e','#9a6c3b','#4c5c9a','#9b536b','#47738a','#716c45','#55546f'];
  const skins = ['#f5d2b6','#e9b995','#d79b70','#b97851','#8e593d','#f0c7a4','#c98e69','#754a37','#e6aa83','#a96d50'];
  const hairs = ['#241b20','#553827','#151719','#9b6842','#d8b979','#703f62','#432c53','#a84d39','#303b3c','#554a40'];
  const clothes = ['#e65c55','#4d83d7','#4b9b83','#c279a5','#d8943e','#46506e','#53a5b1','#7d6cbd','#657e51','#bd596e'];
  const bg = backdrops[next(backdrops.length)], skin = skins[next(skins.length)], hair = hairs[next(hairs.length)], shirt = clothes[next(clothes.length)];
  const hairStyle = next(6), glasses = next(4) === 0, freckles = next(3) === 0, accessory = next(5);
  const hairShapes = [
    '<path d="M30 58Q29 20 64 19Q99 20 98 59L90 49Q80 38 64 39Q46 38 37 51Z"/>',
    '<path d="M27 63Q23 20 63 18Q105 20 101 66L93 87 87 53Q77 39 61 40Q45 39 36 53L34 87Z"/>',
    '<path d="M31 58Q32 22 64 20Q96 22 97 58Q82 42 65 42Q46 42 31 58Z"/><path d="M32 43Q22 65 29 87L39 76 40 48Z"/>',
    '<path d="M28 61Q26 20 64 18Q103 20 100 61L94 52Q88 43 82 42L87 62Q75 48 61 43Q45 43 35 58Z"/>',
    '<path d="M30 57Q27 23 62 19Q100 18 98 57L91 47Q84 39 77 38L80 51Q66 40 54 43L43 52 42 40Q34 47 30 57Z"/>',
    '<path d="M29 60Q25 21 64 18Q101 19 99 61L92 52Q87 44 83 42L86 68Q78 58 74 50L70 66Q60 52 52 48L45 64 39 52Z"/>'
  ][hairStyle];
  const frames = glasses ? '<g fill="none" stroke="#27242a" stroke-width="3"><rect x="42" y="61" width="16" height="11" rx="4"/><rect x="70" y="61" width="16" height="11" rx="4"/><path d="M58 66h12"/></g>' : '';
  const frecklesArt = freckles ? '<g fill="#a96854"><circle cx="48" cy="76" r="1"/><circle cx="53" cy="79" r="1"/><circle cx="77" cy="76" r="1"/><circle cx="72" cy="79" r="1"/></g>' : '';
  const accessoryArt = accessory === 0 ? '<path d="M40 42Q64 28 88 42" fill="none" stroke="#f2c85e" stroke-width="4"/>' : accessory === 1 ? '<circle cx="85" cy="85" r="3" fill="#f4cd66"/>' : accessory === 2 ? '<path d="M43 40l6-8 6 8M75 40l6-8 6 8" fill="none" stroke="#28232b" stroke-width="4"/>' : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" data-npc="${id}"><defs><linearGradient id="g" x2="1" y2="1"><stop stop-color="${bg}"/><stop offset="1" stop-color="#171b26"/></linearGradient></defs><rect width="128" height="128" rx="64" fill="url(#g)"/><circle cx="64" cy="64" r="57" fill="none" stroke="#ffffff" stroke-opacity=".18" stroke-width="2"/><path d="M15 128Q19 94 46 91h36q27 4 31 37" fill="${shirt}"/><path d="M54 83h20v17H54z" fill="${skin}"/><path d="M32 62Q32 38 64 37Q96 38 96 62v14Q94 97 64 99Q35 96 32 76Z" fill="${skin}"/><path d="M29 63Q26 22 63 19Q104 19 99 64L91 52Q82 39 64 40Q44 40 35 55Z" fill="${hair}"/><g fill="${hair}">${hairShapes}</g>${accessoryArt}<ellipse cx="49" cy="67" rx="2.5" ry="3" fill="#28232b"/><ellipse cx="77" cy="67" rx="2.5" ry="3" fill="#28232b"/><path d="M61 69l-3 10h6" fill="none" stroke="#b7775d" stroke-width="2" stroke-linecap="round"/><path d="M55 85Q64 91 73 85" fill="none" stroke="#8c3f4b" stroke-width="2.5" stroke-linecap="round"/>${frames}${frecklesArt}<path d="M53 101l11 10 11-10" fill="none" stroke="#ffffff" stroke-opacity=".7" stroke-width="3"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function buildNpcStoryTask(npc, story, sequence = 0) {
  const role = String(npc?.role || '').toLowerCase();
  const kind = /rival|critic|competitor|antagonist|opponent/.test(role) || Math.abs(Number(npc?.worldIndex) || 0) % 5 === 4 ? 'risk' : 'help';
  const title = String(story?.title || 'your story');
  const goal = String(npc?.goal || 'move the story forward').replace(/[.!?]+$/, '');
  const id = `task-${npc?.id || 'friend'}-${Math.max(0, Math.floor(Number(sequence) || 0))}`;
  const action = kind === 'help'
    ? `Follow up on ${npc?.name || 'their'} lead: ${goal}.`
    : `Check the details before ${npc?.name || 'they'} can turn the situation against you.`;
  const message = kind === 'help'
    ? `Hey, I’m reaching out because of ${title}. ${goal[0]?.toUpperCase() || ''}${goal.slice(1)}. I can help if you act on this soon.`
    : `A heads-up about ${title}: ${goal}. The timing could put your part of the story at risk. I’d check the details before this spreads.`;
  return { id, npcId: String(npc?.id || ''), kind, title: kind === 'help' ? 'A useful lead' : 'A story at risk', message, action, status: 'pending', storyTitle: title };
}

export function filterCastForStory(cast, storyId) {
  const id = Number(storyId);
  if (!Number.isInteger(id) || id < 0 || !Array.isArray(cast)) return [];
  return cast.filter(npc => npc && (Number(npc.storyId) === id || Array.isArray(npc.storyIds) && npc.storyIds.some(world => Number(world) === id)));
}

const extraStoryHooks = [
  ['The borrowed spotlight','An unexpected opportunity puts you beside someone the city already watches.'],['The promise in the margins','A small commitment turns into the decision everyone is waiting for.'],['The open door at midnight','A late message brings your circle together around a fragile idea.'],['The rumor with a receipt','A story spreads before you can confirm who started it.'],['The last honest seat','A high-profile room has space for one more voice, if you earn the trust.'],
  ['The second first impression','A public mistake gives you one chance to show who you are now.'],['The quiet co-sign','Someone influential backs your work, but their reason is not obvious.'],['The night the plan changed','A sudden setback forces your new friends to choose what matters.'],['The unfinished invitation','You are welcomed into a circle with one important rule left unsaid.'],['The signal from home','A familiar person arrives with news that changes the stakes.'],
  ['The almost-collaboration','Two people you care about want the same opportunity for different reasons.'],['The public draft','Your first attempt is seen before you are ready to explain it.'],['The missing hour','A gap in the timeline makes your closest ally look unreliable.'],['The neighborhood vote','People who rarely agree ask you to help make the call.'],['The new name on the list','A newcomer knows more about your world than they should.'],
  ['The favor that travels','A small act of help returns through an unexpected connection.'],['The beautiful compromise','Your group can move forward only if somebody changes their plan.'],['The room after the applause','The best opportunity arrives once everyone else has gone home.'],['The message you almost deleted','A private note carries the one detail your circle needs.'],['The deal with a deadline','Success has a cost, and the people around you disagree about it.'],
  ['The first name in the credits','A friend asks you to share credit when attention finally arrives.'],['The rules of the new circle','You can belong here, but only if you decide what you will protect.'],['The photo from another life','A familiar face appears in a place nobody expected.'],['The shared secret','Two storylines meet through a truth only one person can explain.'],['The morning after going public','Your big moment changes how friends, rivals, and strangers treat you.'],
  ['The voice in the group chat','A quiet member speaks up and changes the direction of the plan.'],['The one detail that does not fit','A tiny inconsistency puts a trusted story in doubt.'],['The kindness with conditions','An offer could solve today’s problem and complicate tomorrow.'],['The handoff','Someone asks you to take responsibility for work they cannot finish.'],['The audience chooses sides','People react before your closest friends have heard your account.'],
  ['The borrowed badge','A symbol of access gets you into a room and under scrutiny.'],['The friend of a friend','A rare visitor links your world to another one without stealing its spotlight.'],['The promise on record','Your words are saved, shared, and remembered differently by different people.'],['The second microphone','A live conversation gives your allies and critics equal time.'],['The story behind the story','A supporting character reveals why this world matters to them.'],
  ['The night shift pact','A handful of people keep the whole operation alive after dark.'],['The honest launch','You can reveal the unfinished truth or present the polished version.'],['The invitation with no plus-one','Your choice of companion says as much as your answer.'],['The city keeps a copy','A choice made here is noticed by someone in a neighboring world.'],['The final open tab','One unanswered message can change what happens next.'],
];
const extraStoryWorlds = ['A borrowed studio','The riverside district','A packed campus hall','The old market block','A rooftop greenhouse','A tiny neighborhood theater','The maker space','A night train platform','The community kitchen','A pop-up gallery','The practice court','A shared apartment','The local radio booth','The city archive','The weekend festival','The back room café','The waterfront stage','The co-op workshop','The late bus route','The new creative hub','The old cinema','The public library','The courtyard garden','The corner record shop','The converted warehouse'];
export function buildStoryCatalog(baseStories, additionalCount = 1000) {
  const base = Array.isArray(baseStories) ? baseStories.map((s, id) => ({...s, id: Number.isInteger(s?.id) ? s.id : id})) : [];
  const seen = new Set(base.map(s => s.title));
  const extra = [];
  for (let i = 0; extra.length < Math.max(0, Math.floor(additionalCount)); i++) {
    const [hook, summary] = extraStoryHooks[i % extraStoryHooks.length];
    const world = extraStoryWorlds[Math.floor(i / extraStoryHooks.length) % extraStoryWorlds.length];
    const cycle = Math.floor(i / (extraStoryHooks.length * extraStoryWorlds.length));
    const title = cycle ? `${hook}: ${world} ${cycle + 1}` : `${hook}: ${world}`;
    if (seen.has(title)) continue;
    seen.add(title);
    const id = base.length + extra.length;
    const category = ['community','film','campus','city','art','music','startup','creator','sports','food'][i % 10];
    extra.push({id,title,category,summary:`${summary} Set in ${world.toLowerCase()}, where relationships and choices shape what happens next.`,genres:[category[0].toUpperCase()+category.slice(1),'Drama'],color:['#ee4b42','#3156d9','#8f45bd','#078b85','#e2a424'][i%5],accent:['#e88736','#6e73df','#e6588b','#60b878','#e6673f'][i%5],difficulty:['Warm-up','Messy','High stakes'][i%3],glyph:['✦','♫','◈','↗','✧'][i%5],prologue:`${title}. ${summary} ${world} is full of people with their own plans. One rare visitor connects this life to another world, but what happens here will belong to this cast. Your first post, your first friendship, and your first public choice will set the tone.`});
  }
  return [...base, ...extra];
}

export function selectFirstFollowerCandidates(cast, storyId, count = 10) {
  const people = filterCastForStory(cast, storyId);
  if (!people.length) return [];
  const arcs = ['Loyal best friend','Affectionate partner','Distant, quietly protective','Creative co-conspirator','Honest mentor','Playful rival','Steady confidant','Ambitious ally','Soft-spoken observer','Unpredictable wildcard'];
  return Array.from({length:Math.min(Math.max(0,Math.floor(count)),people.length)},(_,i)=>{
    const npc = people[(i * 7) % people.length];
    return {...npc, relationshipArc:npc.relationshipArc || arcs[i % arcs.length]};
  });
}

export function buildStoryCoverDataUrl(story = {}) {
  const id = Math.max(0, Math.floor(Number(story.id) || 0));
  const hues = [[237,74,66],[54,92,221],[145,65,184],[8,139,130],[221,150,35],[41,68,101]];
  const [r,g,b] = hues[id % hues.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1200"><defs><linearGradient id="a" x2=".8" y2="1"><stop stop-color="rgb(${r},${g},${b})"/><stop offset="1" stop-color="#10121b"/></linearGradient><radialGradient id="b"><stop stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><rect width="900" height="1200" fill="url(#a)"/><circle cx="${150+(id*137)%700}" cy="${220+(id*79)%700}" r="380" fill="url(#b)"/><path d="M0 930 Q220 ${690+(id%200)} 450 950 T900 860 V1200 H0Z" fill="#090b12" fill-opacity=".5"/><path d="M0 1030 Q280 820 520 1020 T900 940" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="5"/><circle cx="${110+(id*43)%680}" cy="${120+(id*113)%400}" r="${18+(id%40)}" fill="#fff" fill-opacity=".32"/><text x="72" y="1110" fill="#fff" fill-opacity=".8" font-family="sans-serif" font-size="28" letter-spacing="9">FAMOUS · WORLD ${String(id+1).padStart(4,'0')}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function uniqueMediaPool(...groups) {
  return [...new Set(groups.flatMap(group => Array.isArray(group) ? group : []).filter(item => typeof item === 'string' && item.length > 0))];
}

export function buildCommonsSearchUrl(query, { kind = 'image', page = 1, pageSize = 24 } = {}) {
  const url = new URL('https://commons.wikimedia.org/w/api.php');
  const safePageSize = Math.max(1, Math.min(50, Math.trunc(pageSize) || 24));
  url.search = new URLSearchParams({
    action: 'query', generator: 'search', gsrsearch: `${cleanText(query, 160).trim()} filetype:${kind === 'video' ? 'video' : 'bitmap'}`,
    gsrnamespace: '6', gsrlimit: String(safePageSize), gsroffset: String((Math.max(1, Math.trunc(page) || 1) - 1) * safePageSize),
    prop: 'imageinfo', iiprop: 'url|extmetadata', iiurlwidth: '720', format: 'json', origin: '*',
  }).toString();
  return url.toString();
}

const metadataText = value => String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&#039;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
const httpsUrl = value => {
  try { const url = new URL(value); return url.protocol === 'https:' ? url.toString() : ''; } catch { return ''; }
};

export function normalizeCommonsResults(payload) {
  const pages = payload?.query?.pages;
  if (!isRecord(pages)) return [];
  return Object.values(pages).flatMap(page => {
    const info = page?.imageinfo?.[0];
    if (!info) return [];
    const url = httpsUrl(info.url);
    const thumbnail = httpsUrl(info.thumburl) || url;
    if (!url || !thumbnail) return [];
    const metadata = info.extmetadata || {};
    const mime = String(info.mime || '').toLowerCase();
    const mediaType = mime.startsWith('video/') || /\.(webm|mp4|ogv|ogg)(?:$|\?)/i.test(url) ? 'video' : 'image';
    return [{
      title: metadataText(page.title).replace(/^File:/, ''), url, thumbnail, mediaType,
      creator: metadataText(metadata.Artist?.value || metadata.Credit?.value || 'Unknown creator'),
      license: metadataText(metadata.LicenseShortName?.value || 'License details on source page'),
      licenseUrl: httpsUrl(metadata.LicenseUrl?.value),
      attribution: metadataText(metadata.Artist?.value || metadata.Credit?.value || 'Wikimedia Commons creator'),
      foreign_landing_url: httpsUrl(info.descriptionurl) || `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title || '')}`,
    }];
  }).slice(0, 50);
}

export async function fetchMediaResults(fetcher, query, { kind = 'image', page = 1, signal } = {}) {
  const fetchJSON = async url => {
    const response = await fetcher(url, { headers: { Accept: 'application/json' }, signal });
    if (!response?.ok) throw new Error(`Catalog returned ${response?.status ?? 'an error'}.`);
    return response.json();
  };
  const searchCommons = async () => {
    const payload = await fetchJSON(buildCommonsSearchUrl(query, { kind: kind === 'video' ? 'video' : 'image', page }));
    const results = normalizeCommonsResults(payload).filter(item => kind === 'video' ? item.mediaType === 'video' : item.mediaType === 'image');
    return { source: 'Wikimedia Commons', results };
  };
  if (kind === 'video') return searchCommons();
  const endpoint = kind === 'audio' ? 'audio' : 'images';
  const openverseURL = new URL(`https://api.openverse.org/v1/${endpoint}/`);
  openverseURL.searchParams.set('q', query);
  openverseURL.searchParams.set('page_size', '24');
  openverseURL.searchParams.set('page', String(Math.max(1, Math.trunc(page) || 1)));
  openverseURL.searchParams.set('format', 'json');
  try {
    const payload = await fetchJSON(openverseURL.toString());
    const results = Array.isArray(payload?.results) ? payload.results : [];
    if (results.length) return { source: 'Openverse', results: results.map(item => ({ ...item, thumbnail: item.thumbnail || item.url, mediaType: kind === 'audio' ? 'audio' : 'image' })) };
    if (kind === 'audio') throw new Error('No audio results were returned.');
  } catch (error) {
    if (kind === 'audio') throw error;
  }
  return searchCommons();
}
