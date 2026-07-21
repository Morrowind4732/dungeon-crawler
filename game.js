(() => {
  'use strict';

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const $ = (id) => document.getElementById(id);

  const hud = $('hud');
  const hpFill = $('hpFill');
  const hpText = $('hpText');
  const xpFill = $('xpFill');
  const xpText = $('xpText');
  const staminaFill = $('staminaFill');
  const staminaText = $('staminaText');
  const locationText = $('locationText');
  const roomText = $('roomText');
  const toastEl = $('toast');
  const promptEl = $('prompt');
  const touchControls = $('touchControls');
  const joystickZone = $('joystickZone');
  const joystickBase = $('joystickBase');
  const joystickKnob = $('joystickKnob');
  const joystickLabel = $('joystickLabel');
  const secondaryJoystickBase = $('secondaryJoystickBase');
  const secondaryJoystickKnob = $('secondaryJoystickKnob');
  const secondaryJoystickLabel = $('secondaryJoystickLabel');
  const attackBtn = $('attackBtn');
  const interactBtn = $('interactBtn');
  const autoBtn = $('autoBtn');
  const potionBtn = $('potionBtn');
  const abilityBtn = $('abilityBtn');
  const magnetBtn = $('magnetBtn');
  const menuBtn = $('menuBtn');
  const modalBackdrop = $('modalBackdrop');
  const modalTitle = $('modalTitle');
  const modalBody = $('modalBody');
  const modalClose = $('modalClose');
  const startScreen = $('startScreen');
  const saveSlotsEl = $('saveSlots');

  const TAU = Math.PI * 2;
  const TICK = 1 / 60;
  const SAVE_VERSION = 6;
  const SAVE_PREFIX = 'dungeonCampPrototype_slot_';
  const SLOT_COUNT = 3;
  const DODGE = { maxStamina: 100, combatCost: 25, duration: 0.23, speed: 1120, minSwipe: 42, maxGestureMs: 330, doubleFlickMs: 460, regenPerSecond: 24, regenDelay: 0.65, chargeBonusDamage: 0.85, chargeKnockbackMult: 1.6 };
  const PLAYER_SPEED_MULTIPLIER = 2;
  const ENEMY_SPEED_MULTIPLIER = 2;

  const DUNGEON_SIZES = {
    Small: { name: 'Small', count: 20, xpMultiplier: 1, itemId: null, label: 'Small · 20 rooms · normal XP' },
    Medium: { name: 'Medium', count: 40, xpMultiplier: 1.15, itemId: 'survey_charm', label: 'Medium · 40 rooms · +15% XP' },
    Large: { name: 'Large', count: 60, xpMultiplier: 1.35, itemId: 'grand_survey_charm', label: 'Large · 60 rooms · +35% XP' },
    Huge: { name: 'Huge', count: 100, xpMultiplier: 1.65, itemId: 'ancient_survey_seal', label: 'Huge · 100 rooms · +65% XP' },
  };
  const ALPHA_BASE_CHANCE = 0.09;


  const DIRS = [
    { key: 'N', dx: 0, dy: -1, opposite: 'S' },
    { key: 'E', dx: 1, dy: 0, opposite: 'W' },
    { key: 'S', dx: 0, dy: 1, opposite: 'N' },
    { key: 'W', dx: -1, dy: 0, opposite: 'E' },
  ];

  const RARITIES = {
    common: { name: 'Common', mult: 1, color: '#a9a9a9', mods: 0 },
    uncommon: { name: 'Uncommon', mult: 1.22, color: '#68bd6a', mods: 1 },
    rare: { name: 'Rare', mult: 1.55, color: '#5599e5', mods: 2 },
    epic: { name: 'Epic', mult: 2.0, color: '#ad6ce2', mods: 3 },
    legendary: { name: 'Legendary', mult: 2.65, color: '#e2a23b', mods: 4 },
  };

  const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  const GEAR_GROUP_ORDER = ['hands', 'helmet', 'amulet', 'chest', 'gloves', 'ring', 'belt', 'legs', 'boots'];
  const ISO = { x: 0.56, y: 0.29, wallHeight: 78, frontWallHeight: 46 };
  const ITEM_GEAR_SLOTS = ['helmet', 'chest', 'legs', 'gloves', 'boots', 'leftHand', 'rightHand', 'ring', 'amulet', 'belt'];
  const EQUIPMENT_SLOTS = ['helmet', 'amulet', 'chest', 'leftHand', 'rightHand', 'gloves', 'ringLeft', 'ringRight', 'belt', 'legs', 'boots'];

  const WEAPONS = {
    dagger: { name: 'Dagger', damage: 7, reach: 86, arc: 46, cooldown: 0.29, duration: 0.14, knockback: 115, bladeWidth: 0.22 },
    sword: { name: 'Sword', damage: 13, reach: 132, arc: 104, cooldown: 0.58, duration: 0.24, knockback: 255, bladeWidth: 0.28 },
    greatsword: { name: 'Greatsword', damage: 24, reach: 162, arc: 132, cooldown: 0.96, duration: 0.34, knockback: 440, bladeWidth: 0.34 },
    spear: { name: 'Spear', damage: 16, reach: 188, arc: 24, cooldown: 0.67, duration: 0.2, knockback: 310, bladeWidth: 0.16 },
    hammer: { name: 'War Hammer', damage: 31, reach: 116, arc: 78, cooldown: 1.12, duration: 0.38, knockback: 620, bladeWidth: 0.38 },
  };

  const SLOT_LABELS = {
    helmet: 'Helmet', amulet: 'Amulet', chest: 'Chest', legs: 'Legs', gloves: 'Gloves', boots: 'Boots', belt: 'Belt',
    leftHand: 'Left Hand', rightHand: 'Right Hand', ring: 'Ring', ringLeft: 'Left Ring', ringRight: 'Right Ring',
  };

  const ENEMY_DATA = {
    zombie: { name: 'Zombie', hp: 34, speed: 74, damage: 9, radius: 23, mass: 1.25, color: '#71855a', xp: 14 },
    skeleton: { name: 'Skeleton', hp: 25, speed: 92, damage: 8, radius: 19, mass: 0.92, color: '#ded6bc', xp: 16 },
    spider: { name: 'Spider', hp: 22, speed: 105, damage: 11, radius: 18, mass: 0.72, color: '#604a55', xp: 17 },
    bat: { name: 'Bat', hp: 15, speed: 145, damage: 7, radius: 15, mass: 0.45, color: '#7c668e', xp: 11 },
    slime: { name: 'Slime', hp: 28, speed: 70, damage: 8, radius: 22, mass: 0.78, color: '#63a672', xp: 13 },
    shadow: { name: 'Shadow Stalker', hp: 31, speed: 132, damage: 13, radius: 20, mass: 0.68, color: '#302b4d', xp: 23 },
    imp: { name: 'Cinder Imp', hp: 23, speed: 138, damage: 9, radius: 17, mass: 0.52, color: '#a94d31', xp: 19 },
    boss: { name: 'The Horned Warden', hp: 950, speed: 54, damage: 18, radius: 72, mass: 8, color: '#70323c', xp: 380 },
  };

  const MATERIALS = {
    zombie: { id: 'zombie_tooth', name: 'Zombie Tooth' },
    skeleton: { id: 'old_bone', name: 'Old Bone' },
    spider: { id: 'spider_silk', name: 'Spider Silk' },
    bat: { id: 'bat_wing', name: 'Bat Wing' },
    slime: { id: 'slime_gel', name: 'Slime Gel' },
    shadow: { id: 'shadow_essence', name: 'Shadow Essence' },
    imp: { id: 'cinder_ember', name: 'Cinder Ember' },
  };

  const game = {
    running: false,
    paused: false,
    slot: null,
    character: null,
    scene: 'camp',
    player: null,
    enemies: [],
    projectiles: [],
    areaEffects: [],
    drops: [],
    particles: [],
    roomFeatures: [],
    campNpcs: [],
    currentRoomId: null,
    roomWorld: { w: 1300, h: 1300 },
    camera: { x: 0, y: 0 },
    input: { x: 0, y: 0, aimX: 0, aimY: -1, aimMode: false, keys: new Set(), manualHeld: false, interactQueued: false },
    joystick: {
      first: { pointerId: null, active: false, role: null, originX: 0, originY: 0, vectorX: 0, vectorY: 0, startX: 0, startY: 0, lastX: 0, lastY: 0, startTime: 0, maxDistance: 0 },
      second: { pointerId: null, active: false, role: null, originX: 0, originY: 0, vectorX: 0, vectorY: 0, startX: 0, startY: 0, lastX: 0, lastY: 0, startTime: 0, maxDistance: 0 },
    },
    autoAttack: true,
    lastTime: 0,
    accumulator: 0,
    saveTimer: 0,
    pendingVictory: false,
    currentInteractable: null,
    roomEntryDir: null,
    minimapBounds: null,
    minimapPointerId: null,
    modalBackdropGuardUntil: 0,
    campEntranceArmed: true,
    lootMagnetTimer: 0,
    cameraShake: { time: 0, intensity: 0 },
    aimFlick: { time: 0, x: 0, y: 0 },
  };

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function rand(min, max) { return min + Math.random() * (max - min); }
  function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
  function choose(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function chance(p) { return Math.random() < p; }
  function dist(ax, ay, bx, by) { return Math.hypot(bx - ax, by - ay); }
  function normalize(x, y) {
    const m = Math.hypot(x, y);
    return m > 0.0001 ? { x: x / m, y: y / m } : { x: 0, y: 0 };
  }
  function screenVectorToWorld(x, y) {
    if (Math.hypot(x, y) < 0.0001) return { x: 0, y: 0 };
    const wx = 0.5 * (x / ISO.x + y / ISO.y);
    const wy = 0.5 * (y / ISO.y - x / ISO.x);
    return normalize(wx, wy);
  }
  function isoProject(x, y, z = 0) {
    return { x: (x - y) * ISO.x, y: (x + y) * ISO.y - z };
  }
  function worldToScreen(x, y, z = 0) {
    const point = isoProject(x, y, z);
    return { x: point.x + game.camera.x, y: point.y + game.camera.y };
  }
  function angleDiff(a, b) {
    let d = (a - b + Math.PI) % TAU - Math.PI;
    if (d < -Math.PI) d += TAU;
    return d;
  }
  function pointToSegmentDistance(px, py, ax, ay, bx, by) {
    const abx = bx - ax, aby = by - ay;
    const lengthSq = abx * abx + aby * aby;
    if (lengthSq <= 0.0001) return Math.hypot(px - ax, py - ay);
    const t = clamp(((px - ax) * abx + (py - ay) * aby) / lengthSq, 0, 1);
    const cx = ax + abx * t, cy = ay + aby * t;
    return Math.hypot(px - cx, py - cy);
  }
  function formatName(s) { return s.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()); }
  function uid(prefix = 'id') { return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`; }
  function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function xpNeeded(level) { return Math.round(78 * Math.pow(level, 1.42)); }
  function skillXpNeeded(level) { return Math.round(42 * Math.pow(level, 1.38)); }

  function createCharacter(name) {
    const starterSword = makeGear('leftHand', 'common', 1, 'sword');
    starterSword.name = 'Camp-Forged Sword';
    starterSword.stats.damage = 3;
    return {
      version: SAVE_VERSION,
      id: uid('hero'),
      name: name || 'Adventurer',
      createdAt: Date.now(),
      lastPlayed: Date.now(),
      level: 1,
      xp: 0,
      coins: 120,
      stats: { strength: 5, defense: 4, vitality: 5, agility: 4 },
      abilities: { doubleStrike: 0, arcBoost: 0, reachBoost: 0, attackSpeed: 0, knockback: 0, regen: 0, whirlwind: 1 },
      skills: {
        mining: { level: 1, xp: 0 }, smithing: { level: 1, xp: 0 },
        fishing: { level: 1, xp: 0 }, woodcutting: { level: 1, xp: 0 },
      },
      equipment: {
        helmet: null, amulet: null, chest: null, leftHand: starterSword, rightHand: null, gloves: null,
        ringLeft: null, ringRight: null, belt: null, legs: null, boots: null,
      },
      inventory: [
        { id: 'healing_potion', name: 'Healing Potion', type: 'consumable', qty: 3, stackable: true, description: 'Restores 45 health.' },
        { id: 'escape_rope', name: 'Escape Rope', type: 'consumable', qty: 1, stackable: true, description: 'Safely leave a dungeon with all inventory.' },
      ],
      inventoryCapacity: 30,
      storage: [],
      storageCapacity: 120,
      currentHealth: 100,
      maxFloorUnlocked: 1,
      floors: {},
      settings: { handedness: 'standard', joystick: 'fixed', controlScale: 1, viewMode: 'isometric' },
      campNpcs: generateCampNpcs(),
      quests: [],
      completedQuests: 0,
      deaths: 0,
      totalBosses: 0,
    };
  }

  function generateCampNpcAppearance(role = 'Traveler') {
    const skin = choose(['#d8ae7d', '#bd895d', '#8f6045', '#e0b98d', '#a66f50']);
    const hair = choose(['#2b2019', '#5d3822', '#8a5a2d', '#b79a68', '#3d3029', '#6b6a66']);
    const cloth = choose(['#7f4d3b', '#48647a', '#5f7042', '#756047', '#684f78', '#39706a', '#86613b']);
    const clothAlt = choose(['#312c29', '#4a382d', '#343a3d', '#40384a', '#2f4436']);
    const metal = choose(['#8f9699', '#a2875e', '#69747b', '#b3aaa0']);
    const roleGear = {
      Alchemist: { chestStyle: 'robe', weapon: 'staff', helmet: 'hood', shield: false },
      Cook: { chestStyle: 'apron', weapon: 'dagger', helmet: 'cap', shield: false },
      Researcher: { chestStyle: 'robe', weapon: 'staff', helmet: choose(['hood', 'none']), shield: false },
      Tinker: { chestStyle: 'leather', weapon: 'hammer', helmet: choose(['cap', 'openHelm']), shield: false },
      Collector: { chestStyle: 'leather', weapon: choose(['spear', 'sword']), helmet: choose(['none', 'hood', 'openHelm']), shield: chance(.45) },
      Historian: { chestStyle: choose(['robe', 'leather']), weapon: choose(['staff', 'sword']), helmet: choose(['none', 'hood']), shield: chance(.25) },
      Traveler: { chestStyle: choose(['leather', 'plate', 'robe']), weapon: choose(['sword', 'spear', 'hammer', 'dagger']), helmet: choose(['none', 'hood', 'openHelm']), shield: chance(.35) },
    };
    const gear = roleGear[role] || roleGear.Traveler;
    return {
      skin, hair, cloth, clothAlt, metal,
      chestStyle: gear.chestStyle,
      weapon: gear.weapon,
      helmet: gear.helmet,
      shield: gear.shield,
      cape: chance(.38),
      capeColor: choose(['#623b35', '#314f62', '#455936', '#5b455f', '#66512d']),
      gloves: chance(.55),
      boots: choose(['#30251f', '#453124', '#282b2d']),
      hairStyle: choose(['short', 'long', 'crest', 'bald']),
    };
  }

  function ensureCampNpcAppearances(npcs) {
    let changed = false;
    for (const npc of npcs || []) {
      if (!npc.appearance) {
        npc.appearance = generateCampNpcAppearance(npc.role);
        changed = true;
      }
      npc.facingX = Number(npc.facingX) || (npc.vx < 0 ? -1 : 1);
      npc.facingY = Number(npc.facingY) || 0;
    }
    return changed;
  }

  function generateCampNpcs() {
    const first = ['Mara', 'Tobin', 'Edda', 'Rusk', 'Pella', 'Corvin', 'Nim', 'Alden', 'Sable', 'Bran'];
    const roles = ['Alchemist', 'Cook', 'Researcher', 'Tinker', 'Collector', 'Historian'];
    const targets = [
      { itemId: 'slime_gel', itemName: 'Slime Gel', min: 35, max: 90 },
      { itemId: 'old_bone', itemName: 'Old Bones', min: 30, max: 80 },
      { itemId: 'spider_silk', itemName: 'Spider Silk', min: 25, max: 65 },
      { itemId: 'bat_wing', itemName: 'Bat Wings', min: 30, max: 75 },
      { itemId: 'zombie_tooth', itemName: 'Zombie Teeth', min: 40, max: 100 },
      { itemId: 'shadow_essence', itemName: 'Shadow Essence', min: 20, max: 55 },
      { itemId: 'cinder_ember', itemName: 'Cinder Embers', min: 25, max: 60 },
    ];
    return Array.from({ length: 3 }, (_, i) => {
      const target = choose(targets);
      const amount = Math.round(randInt(target.min, target.max) / 5) * 5;
      const role = choose(roles);
      return {
        id: uid('npc'),
        name: choose(first),
        role,
        x: 600 + i * 280 + rand(-80, 80),
        y: 780 + rand(-180, 160),
        vx: rand(-12, 12), vy: rand(-12, 12), wanderTimer: rand(1, 4),
        facingX: chance(.5) ? 1 : -1,
        facingY: 0,
        appearance: generateCampNpcAppearance(role),
        locked: false,
        quest: {
          id: uid('quest'), itemId: target.itemId, itemName: target.itemName, amount,
          rewardCoins: amount * 3, rewardXp: Math.round(amount * 1.4),
          reason: choose([
            `I need them for a rather delicate experiment.`,
            `The camp is running short, and I promised I could find some.`,
            `A buyer up the road pays well for clean specimens.`,
            `I am testing a theory that is either brilliant or extremely foolish.`,
          ]),
        },
      };
    });
  }

  const memorySaves = new Map();
  let persistentStorageAvailable = true;
  let storageWarningShown = false;

  function saveKey(slot) { return `${SAVE_PREFIX}${slot}`; }
  function readStoredValue(key) {
    try {
      const value = localStorage.getItem(key);
      if (value != null) memorySaves.set(key, value);
      return value ?? memorySaves.get(key) ?? null;
    } catch (err) {
      persistentStorageAvailable = false;
      console.warn('Persistent browser storage is unavailable; using session memory.', err);
      return memorySaves.get(key) ?? null;
    }
  }
  function writeStoredValue(key, value) {
    memorySaves.set(key, value);
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (err) {
      persistentStorageAvailable = false;
      console.warn('Persistent browser storage is unavailable; using session memory.', err);
      return false;
    }
  }
  function removeStoredValue(key) {
    memorySaves.delete(key);
    try { localStorage.removeItem(key); }
    catch (err) { persistentStorageAvailable = false; console.warn('Could not remove persistent save.', err); }
  }
  function loadSlot(slot) {
    try {
      const raw = readStoredValue(saveKey(slot));
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      console.warn('Could not load save', err);
      return null;
    }
  }
  function saveGame(showMessage = false) {
    if (!game.character || game.slot == null) return;
    game.character.lastPlayed = Date.now();
    if (game.player) game.character.currentHealth = Math.round(game.player.health);
    const persisted = writeStoredValue(saveKey(game.slot), JSON.stringify(game.character));
    if (showMessage) toast(persisted ? 'Game saved.' : 'Saved for this play session only.');
    if (!persisted && !storageWarningShown) {
      storageWarningShown = true;
      setTimeout(() => toast('Your browser blocked permanent storage. The game still works, but this save may only last for this open session.', 5200), 150);
    }
  }
  function deleteSlot(slot) {
    removeStoredValue(saveKey(slot));
    renderSaveSlots();
  }

  function renderSaveSlots() {
    saveSlotsEl.innerHTML = '';
    for (let i = 1; i <= SLOT_COUNT; i++) {
      const data = loadSlot(i);
      const card = document.createElement('div');
      card.className = 'save-slot';
      if (data) {
        card.innerHTML = `
          <div><h3>Slot ${i}: ${escapeHtml(data.name)}</h3><div class="slot-meta"><span>Lv ${data.level}</span><span>Floor ${data.maxFloorUnlocked}</span><span>${data.coins || 0} gold</span></div></div>
          <div class="slot-actions"><button class="panel-btn load-slot">Continue</button><button class="panel-btn danger delete-slot">Delete</button></div>`;
        card.querySelector('.load-slot').addEventListener('click', () => startWithCharacter(i, data));
        card.querySelector('.delete-slot').addEventListener('click', () => {
          if (confirm(`Delete ${data.name}'s save?`)) deleteSlot(i);
        });
      } else {
        card.innerHTML = `
          <div><h3>Slot ${i}: Empty</h3></div>
          <div class="slot-actions"><button class="panel-btn new-slot">New Character</button></div>`;
        card.querySelector('.new-slot').addEventListener('click', () => showCreateCharacter(i));
      }
      saveSlotsEl.appendChild(card);
    }
  }

  function showCreateCharacter(slot) {
    showModal('Create Character', `
      <p class="muted">Each slot has its own character, skills, equipment, quests, and persistent dungeon floors.</p>
      <label for="newCharacterName">Character name</label>
      <input id="newCharacterName" type="text" maxlength="22" value="Adventurer" autocomplete="off" autocapitalize="words" enterkeyhint="done" />
      <div style="height:12px"></div>
      <button id="createCharacterBtn" type="button" class="panel-btn" style="width:100%;text-align:center;font-weight:700">Begin at the campsite</button>
    `, true);
    const input = $('newCharacterName');
    const createButton = $('createCharacterBtn');
    const begin = () => {
      const name = input.value.trim() || 'Adventurer';
      const character = createCharacter(name);
      writeStoredValue(saveKey(slot), JSON.stringify(character));
      hideModal();
      startWithCharacter(slot, character);
    };
    createButton.addEventListener('click', begin);
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') { event.preventDefault(); begin(); }
    });
    if (window.matchMedia?.('(pointer: fine)').matches) setTimeout(() => input.select(), 0);
  }

  function normalizeFloorPersistence(character) {
    character.floors ||= {};
    for (const floor of Object.values(character.floors)) {
      if (!floor?.rooms) continue;
      const sizeData = DUNGEON_SIZES[floor.sizeName] || DUNGEON_SIZES.Small;
      floor.xpMultiplier = Number(floor.xpMultiplier) || sizeData.xpMultiplier;
      for (const room of Object.values(floor.rooms)) {
        room.groundDrops ||= [];
        room.groundDrops = room.groundDrops.filter(drop => drop?.item && !drop.picked).map(drop => ({
          id: drop.id || uid('drop'), x: Number(drop.x) || 100, y: Number(drop.y) || 100,
          item: drop.item, bob: Number(drop.bob) || rand(0, TAU), picked: false,
          pickupDelay: Number(drop.pickupDelay) || 0, magnet: false,
        }));
      }
    }
  }

  function normalizeEquipment(character) {
    character.equipment ||= {};
    const oldRing = character.equipment.ring || null;
    const normalized = {};
    for (const slot of EQUIPMENT_SLOTS) normalized[slot] = character.equipment[slot] || null;
    if (!normalized.ringLeft && oldRing) normalized.ringLeft = oldRing;
    delete character.equipment.ring;
    character.equipment = normalized;
  }

  function startWithCharacter(slot, character) {
    game.slot = slot;
    game.character = character;
    game.character.version = SAVE_VERSION;
    game.character.settings ||= { handedness: 'standard', joystick: 'fixed', controlScale: 1, viewMode: 'isometric' };
    game.character.settings.viewMode ||= 'isometric';
    normalizeEquipment(game.character);
    normalizeFloorPersistence(game.character);
    game.character.campNpcs ||= generateCampNpcs();
    ensureCampNpcAppearances(game.character.campNpcs);
    game.character.quests ||= [];
    game.character.floors ||= {};
    game.character.storage ||= [];
    game.character.storageCapacity ||= 120;
    game.autoAttack = true;
    startScreen.classList.add('hidden');
    hud.classList.remove('hidden');
    touchControls.classList.remove('hidden');
    applyControlSettings();
    enterCamp();
    game.running = true;
    game.lastTime = performance.now();
    requestAnimationFrame(frame);
  }

  function createPlayer(x, y) {
    const derived = getDerivedStats();
    const maxHealth = derived.maxHealth;
    const stored = clamp(game.character.currentHealth || maxHealth, 1, maxHealth);
    return {
      x, y, vx: 0, vy: 0, radius: 22,
      health: stored, maxHealth,
      facing: { x: 0, y: -1 },
      attackCooldown: 0,
      attack: null,
      invuln: 0,
      abilityCooldown: 0,
      regenTimer: 0,
      stamina: DODGE.maxStamina,
      maxStamina: DODGE.maxStamina,
      staminaRegenDelay: 0,
      dodgeCooldown: 0,
      dodge: null,
      burnTimer: 0, burnTick: 0,
      poisonTimer: 0, poisonTick: 0,
      confusionTimer: 0, slowTimer: 0,
    };
  }

  function getDerivedStats() {
    const c = game.character;
    const out = {
      strength: c.stats.strength,
      defense: c.stats.defense,
      vitality: c.stats.vitality,
      agility: c.stats.agility,
      damage: 0, armor: 0, maxHealth: 75 + c.stats.vitality * 7,
      speed: (200 + c.stats.agility * 4) * PLAYER_SPEED_MULTIPLIER,
      attackSpeedMult: 1 + (c.abilities.attackSpeed || 0) * 0.06,
      knockbackMult: 1 + (c.abilities.knockback || 0) * 0.12,
      critChance: clamp(0.05 + c.stats.agility * 0.0035 + (c.abilities.precision || 0) * 0.025, 0.05, 0.5),
      critDamage: 1.75,
    };
    for (const item of Object.values(c.equipment)) {
      if (!item?.stats) continue;
      for (const [key, value] of Object.entries(item.stats)) {
        if (key in out) out[key] += value;
        else if (key === 'health') out.maxHealth += value;
      }
    }
    out.damage += out.strength * 1.2;
    out.armor += out.defense * 0.7;
    out.critChance = clamp(out.critChance, 0.05, 0.65);
    out.critDamage = Math.max(1.5, out.critDamage);
    return out;
  }
  function getEquippedWeapon() {
    const eq = game.character.equipment;
    const left = eq.leftHand?.weaponType ? eq.leftHand : null;
    const right = eq.rightHand?.weaponType ? eq.rightHand : null;
    if (left && right) return gearStrength(right) > gearStrength(left) ? { item: right, hand: 'rightHand' } : { item: left, hand: 'leftHand' };
    if (left) return { item: left, hand: 'leftHand' };
    if (right) return { item: right, hand: 'rightHand' };
    return { item: { name: 'Bare Hands', weaponType: 'dagger', stats: { damage: 0 }, rarity: 'common' }, hand: 'rightHand' };
  }

  function getWeaponItem() {
    return getEquippedWeapon().item;
  }
  function getWeaponProfile() {
    const item = getWeaponItem();
    const base = WEAPONS[item.weaponType] || WEAPONS.dagger;
    const derived = getDerivedStats();
    return {
      ...base,
      name: item.name || base.name,
      damage: base.damage + derived.damage + (item.stats?.damage || 0),
      reach: base.reach * (1 + (game.character.abilities.reachBoost || 0) * 0.09),
      arc: base.arc + (game.character.abilities.arcBoost || 0) * 9,
      cooldown: base.cooldown / derived.attackSpeedMult,
      knockback: base.knockback * derived.knockbackMult,
      weaponType: item.weaponType || 'dagger',
      rarity: item.rarity || 'common',
    };
  }

  function enterCamp() {
    game.scene = 'camp';
    game.enemies = [];
    game.projectiles = [];
    game.areaEffects = [];
    game.drops = [];
    game.roomFeatures = [];
    game.roomWorld = { w: 1800, h: 1400 };
    game.player = createPlayer(900, 1040);
    game.player.health = Math.max(game.player.health, Math.round(game.player.maxHealth * 0.6));
    game.character.currentHealth = game.player.health;
    game.campNpcs = game.character.campNpcs;
    game.pendingVictory = false;
    game.campEntranceArmed = true;
    updateHud();
    saveGame();
    toast('Welcome back to camp. The dungeon entrance is beyond the fire.');
  }

  function floorKey(n) { return `floor_${n}`; }
  function getFloor(n) { return game.character.floors[floorKey(n)] || null; }

  function weightedSize(forceHuge = false, consumeCharm = false) {
    if (forceHuge) return { ...DUNGEON_SIZES.Huge };
    if (consumeCharm) return { ...DUNGEON_SIZES.Medium };
    return { ...DUNGEON_SIZES.Small };
  }

  function dungeonSizeData(name = 'Small') {
    return { ...(DUNGEON_SIZES[name] || DUNGEON_SIZES.Small) };
  }

  function generateFloor(floorNumber, options = {}) {
    const size = options.size || (options.sizeName ? dungeonSizeData(options.sizeName) : weightedSize(options.forceHuge, options.useCharm));
    const rooms = {};
    const byPos = new Map();
    const start = { id: 'r0', gx: 0, gy: 0, neighbors: {}, traversedDoors: { N:false, E:false, S:false, W:false }, type: 'start', discovered: true, cleared: true, looted: false };
    rooms[start.id] = start;
    byPos.set('0,0', start.id);
    let attempts = 0;
    while (Object.keys(rooms).length < size.count && attempts < size.count * 100) {
      attempts++;
      const existing = choose(Object.values(rooms));
      const dir = choose(DIRS);
      const nx = existing.gx + dir.dx;
      const ny = existing.gy + dir.dy;
      const key = `${nx},${ny}`;
      if (byPos.has(key)) continue;
      const id = `r${Object.keys(rooms).length}`;
      const room = { id, gx: nx, gy: ny, neighbors: {}, traversedDoors: { N:false, E:false, S:false, W:false }, type: 'combat', discovered: false, cleared: false, looted: false };
      rooms[id] = room;
      byPos.set(key, id);
      existing.neighbors[dir.key] = id;
      room.neighbors[dir.opposite] = existing.id;
    }

    // Add a limited number of loops so backtracking has route choices.
    for (const room of Object.values(rooms)) {
      for (const dir of DIRS) {
        const otherId = byPos.get(`${room.gx + dir.dx},${room.gy + dir.dy}`);
        if (otherId && !room.neighbors[dir.key] && chance(0.2)) {
          room.neighbors[dir.key] = otherId;
          rooms[otherId].neighbors[dir.opposite] = room.id;
        }
      }
    }

    // BFS to find the most distant room for the boss.
    const queue = [{ id: 'r0', d: 0 }];
    const seen = new Set(['r0']);
    let farthest = queue[0];
    while (queue.length) {
      const node = queue.shift();
      if (node.d > farthest.d) farthest = node;
      for (const next of Object.values(rooms[node.id].neighbors)) {
        if (!seen.has(next)) { seen.add(next); queue.push({ id: next, d: node.d + 1 }); }
      }
    }
    rooms[farthest.id].type = 'boss';
    rooms[farthest.id].bossDefeated = false;

    for (const room of Object.values(rooms)) {
      if (room.id === 'r0' || room.type === 'boss') continue;
      const roll = Math.random();
      if (roll < 0.55) room.type = 'combat';
      else if (roll < 0.68) room.type = 'gathering';
      else if (roll < 0.78) room.type = 'puzzle';
      else if (roll < 0.87) room.type = 'treasure';
      else if (roll < 0.93) room.type = 'rest';
      else room.type = 'combat';
      if (chance(0.026)) room.type = 'escape';
      if (room.type === 'gathering') {
        room.resourceType = choose(['mining', 'woodcutting', 'fishing']);
        room.resourceUsed = false;
        room.hasSmithing = chance(0.3);
        room.smithUsed = false;
      }
      if (room.type === 'puzzle') {
        room.puzzleSkill = choose(['mining', 'woodcutting', 'fishing', 'smithing']);
        room.puzzleLevel = Math.max(1, floorNumber + randInt(-1, 1));
        room.puzzleSolved = false;
      }
      if (room.type === 'treasure') room.chestOpened = false;
      if (room.type === 'rest') room.restUsed = false;
    }

    return {
      floorNumber,
      recommendedLevel: floorNumber,
      sizeName: size.name,
      roomCount: size.count,
      xpMultiplier: size.xpMultiplier || 1,
      rooms,
      startRoomId: 'r0',
      currentRoomId: 'r0',
      completed: false,
      timesCompleted: 0,
      createdAt: Date.now(),
    };
  }

  function enterDungeon(floorNumber, generateOptions = null) {
    let floor = getFloor(floorNumber);
    if (!floor) {
      floor = generateFloor(floorNumber, generateOptions || {});
      game.character.floors[floorKey(floorNumber)] = floor;
    }
    game.scene = 'dungeon';
    game.currentFloorNumber = floorNumber;
    const roomId = floor.currentRoomId || floor.startRoomId;
    enterRoom(roomId, null);
    saveGame();
  }

  function currentFloor() { return getFloor(game.currentFloorNumber); }
  function currentRoom() { return currentFloor()?.rooms[game.currentRoomId]; }

  function enterRoom(roomId, fromDir) {
    const floor = currentFloor();
    const room = floor.rooms[roomId];
    game.currentRoomId = roomId;
    floor.currentRoomId = roomId;
    room.discovered = true;
    game.enemies = [];
    game.projectiles = [];
    game.areaEffects = [];
    room.groundDrops ||= [];
    game.drops = room.groundDrops;
    for (const drop of game.drops) {
      drop.id ||= uid('drop'); drop.bob = Number(drop.bob) || rand(0, TAU);
      drop.picked = false; drop.pickupDelay = Number(drop.pickupDelay) || 0; drop.magnet = false;
    }
    game.particles = [];
    game.roomFeatures = [];
    game.pendingVictory = false;
    game.roomEntryDir = fromDir || null;
    const boss = room.type === 'boss';
    game.roomWorld = boss ? { w: 2600, h: 2600 } : { w: 1300, h: 1300 };

    if (!game.player) game.player = createPlayer(game.roomWorld.w / 2, game.roomWorld.h / 2);
    const margin = 85;
    if (fromDir === 'N') { game.player.x = game.roomWorld.w / 2; game.player.y = margin; }
    else if (fromDir === 'S') { game.player.x = game.roomWorld.w / 2; game.player.y = game.roomWorld.h - margin; }
    else if (fromDir === 'E') { game.player.x = game.roomWorld.w - margin; game.player.y = game.roomWorld.h / 2; }
    else if (fromDir === 'W') { game.player.x = margin; game.player.y = game.roomWorld.h / 2; }
    else { game.player.x = game.roomWorld.w / 2; game.player.y = game.roomWorld.h / 2 + (boss ? 760 : 280); }
    game.player.vx = game.player.vy = 0;
    game.player.attack = null;

    setupRoom(room);
    updateHud();
    saveGame();
  }

  function setupRoom(room) {
    const floor = currentFloor();
    if (room.type === 'combat' && !room.cleared) {
      const count = clamp(5 + Math.floor(floor.floorNumber * 1.15) + randInt(0, 4), 6, 22);
      for (let i = 0; i < count; i++) spawnEnemy(choose(['zombie', 'skeleton', 'spider', 'bat', 'slime', 'shadow', 'imp']));
    }
    if (room.type === 'boss' && !room.bossDefeated) {
      spawnEnemy('boss', game.roomWorld.w / 2, game.roomWorld.h / 2 - 250);
      for (let i = 0; i < 12; i++) spawnEnemy(choose(['zombie', 'skeleton', 'spider', 'bat', 'slime', 'shadow', 'imp']));
    }
    if (room.type === 'boss' && room.bossDefeated) {
      game.roomFeatures.push({ id: uid('feature'), type: 'victoryExit', x: game.roomWorld.w / 2, y: game.roomWorld.h / 2 + 420, used: false });
    }
    if (room.type === 'gathering') {
      const feature = {
        id: uid('feature'), type: room.resourceType, x: game.roomWorld.w / 2, y: game.roomWorld.h / 2 - 40,
        used: room.resourceUsed,
      };
      game.roomFeatures.push(feature);
      if (room.hasSmithing) game.roomFeatures.push({ id: uid('feature'), type: 'smithing', x: game.roomWorld.w / 2 + 220, y: game.roomWorld.h / 2 + 80, used: room.smithUsed });
      if (!room.cleared && chance(0.45)) {
        for (let i = 0; i < 4 + currentFloor().floorNumber; i++) spawnEnemy(choose(['zombie', 'spider', 'slime', 'shadow']));
      }
    }
    if (room.type === 'puzzle') {
      game.roomFeatures.push({ id: uid('feature'), type: 'puzzle', x: game.roomWorld.w / 2, y: game.roomWorld.h / 2, solved: room.puzzleSolved });
      if (room.puzzleSolved) room.cleared = true;
    }
    if (room.type === 'treasure') {
      game.roomFeatures.push({ id: uid('feature'), type: 'chest', x: game.roomWorld.w / 2, y: game.roomWorld.h / 2, opened: room.chestOpened });
      if (!room.cleared) {
        for (let i = 0; i < 3 + currentFloor().floorNumber; i++) spawnEnemy(choose(['skeleton', 'bat', 'slime', 'imp']));
      }
    }
    if (room.type === 'rest') game.roomFeatures.push({ id: uid('feature'), type: 'shrine', x: game.roomWorld.w / 2, y: game.roomWorld.h / 2, used: room.restUsed });
    if (room.type === 'escape') game.roomFeatures.push({ id: uid('feature'), type: 'escape', x: game.roomWorld.w / 2, y: game.roomWorld.h / 2, used: false });
    if (room.type === 'start') {
      room.cleared = true;
      // Every floor has a guaranteed, no-cost retreat point in its starting room.
      game.roomFeatures.push({
        id: uid('feature'), type: 'entranceExit',
        x: game.roomWorld.w / 2, y: game.roomWorld.h / 2 + 110, used: false,
      });
    }
  }

  function enemySpawnPosition(type = 'zombie') {
    const m = type === 'boss' ? 260 : 125;
    const entryDir = game.roomEntryDir;
    const allEdges = ['N', 'E', 'S', 'W'];
    const allowedEdges = entryDir ? allEdges.filter(edge => edge !== entryDir) : allEdges;
    const minimumPlayerDistance = currentRoom()?.type === 'boss' ? 560 : 430;
    const makeCandidate = (edge) => {
      if (edge === 'N') return { x: rand(m, game.roomWorld.w - m), y: m, edge };
      if (edge === 'E') return { x: game.roomWorld.w - m, y: rand(m, game.roomWorld.h - m), edge };
      if (edge === 'S') return { x: rand(m, game.roomWorld.w - m), y: game.roomWorld.h - m, edge };
      return { x: m, y: rand(m, game.roomWorld.h - m), edge };
    };
    for (let attempt = 0; attempt < 28; attempt++) {
      const candidate = makeCandidate(choose(allowedEdges));
      if (!game.player || dist(candidate.x, candidate.y, game.player.x, game.player.y) >= minimumPlayerDistance) return candidate;
    }
    const fallbackEdge = entryDir ? DIRS.find(dir => dir.key === entryDir)?.opposite : choose(allEdges);
    const fallback = makeCandidate(fallbackEdge || 'N');
    if (fallback.edge === 'N' || fallback.edge === 'S') fallback.x = game.roomWorld.w / 2;
    else fallback.y = game.roomWorld.h / 2;
    return fallback;
  }

  function spawnEnemy(type, x = null, y = null, extra = {}) {
    const base = ENEMY_DATA[type];
    const floorLevel = currentFloor()?.floorNumber || 1;
    const alphaChance = clamp(ALPHA_BASE_CHANCE + Math.max(0, floorLevel - 1) * 0.006, ALPHA_BASE_CHANCE, 0.16);
    const isAlpha = type !== 'boss' && !extra.mini && extra.allowAlpha !== false && (extra.alpha === true || (extra.alpha !== false && chance(alphaChance)));
    const alphaHp = isAlpha ? 2.15 : 1;
    const alphaDamage = isAlpha ? 1.32 : 1;
    const alphaSpeed = isAlpha ? 1.08 : 1;
    // Patch 12: alphas are 25% larger than Patch 11, including their gameplay hit radius.
    const alphaRadius = isAlpha ? 1.6 : 1;
    const alphaXp = isAlpha ? 2.5 : 1;
    const scale = type === 'boss' ? 1 + (floorLevel - 1) * 0.33 : 1 + (floorLevel - 1) * 0.19;
    let sx = x, sy = y, spawnEdge = null;
    if (sx == null || sy == null) {
      const spawn = enemySpawnPosition(type);
      sx = spawn.x; sy = spawn.y; spawnEdge = spawn.edge;
    }
    const rawHp = (extra.hp || base.hp) * alphaHp;
    const e = {
      id: uid('enemy'), type, name: extra.name || base.name,
      x: sx, y: sy, vx: 0, vy: 0, radius: (extra.radius || base.radius) * alphaRadius,
      maxHp: Math.round(rawHp * scale), hp: Math.round(rawHp * scale),
      speed: (extra.speed || base.speed) * alphaSpeed * ENEMY_SPEED_MULTIPLIER * (1 + (floorLevel - 1) * 0.02),
      damage: Math.round((extra.damage || base.damage) * alphaDamage * (1 + (floorLevel - 1) * 0.13)),
      mass: (extra.mass || base.mass) * (isAlpha ? 1.35 : 1), color: extra.color || base.color,
      xp: Math.round((extra.xp || base.xp) * alphaXp * (1 + floorLevel * 0.08)),
      cooldown: rand(0.2, 1.4), state: 'idle', stateTimer: 0,
      orbitAngle: rand(0, TAU), contactCooldown: 0.35,
      swarmAngle: rand(0, TAU), swarmTurn: choose([-1, 1]) * rand(0.05, 0.16),
      spawnEdge, dead: false, hitFlash: 0,
      tacticalRole: extra.tacticalRole || choose(['pursuit', 'flankLeft', 'flankRight']),
      roleTimer: rand(2.5, 6), teleportCooldown: rand(1.8, 3.6),
      isAlpha, mini: !!extra.mini, summonerId: extra.summonerId || null,
      abilityCooldown: type === 'skeleton' && isAlpha ? rand(0.3, 0.8) : rand(1.4, 3.2),
      specialState: null, specialTimer: 0, specialTarget: null,
      burnTimer: 0, burnTick: 0, poisonTimer: 0, poisonTick: 0, slowTimer: 0,
      bossMode: type === 'boss' ? 'slow' : null,
      bossModeTimer: type === 'boss' ? rand(2.8, 4.0) : 0,
      chargeCooldown: type === 'boss' ? rand(2.2, 3.2) : 0,
    };
    game.enemies.push(e);
    return e;
  }

  function updateInputVector() {
    let x = game.input.x, y = game.input.y;
    const keys = game.input.keys;
    if (keys.has('arrowleft') || keys.has('a')) x -= 1;
    if (keys.has('arrowright') || keys.has('d')) x += 1;
    if (keys.has('arrowup') || keys.has('w')) y -= 1;
    if (keys.has('arrowdown') || keys.has('s')) y += 1;
    if (game.player?.confusionTimer > 0) { x *= -1; y *= -1; }
    return screenVectorToWorld(x, y);
  }

  function update(dt) {
    if (!game.running || game.paused) return;
    game.saveTimer += dt;
    if (game.saveTimer >= 5) { game.saveTimer = 0; saveGame(); }

    updatePlayer(dt);
    if (game.scene === 'camp') updateCamp(dt);
    else updateDungeon(dt);
    updateAreaEffects(dt);
    updateProjectiles(dt);
    updateDrops(dt);
    updateParticles(dt);
    if (game.cameraShake.time > 0) {
      game.cameraShake.time = Math.max(0, game.cameraShake.time - dt);
      game.cameraShake.intensity *= Math.pow(0.035, dt);
    } else game.cameraShake.intensity = 0;
    updateInteractionPrompt();
    updateHud();
  }

  function isCombatActive() {
    return game.scene === 'dungeon' && game.enemies.some(enemy => !enemy.dead);
  }

  function hasNearbyHostileProjectile() {
    if (game.scene !== 'dungeon' || !game.player) return false;
    const weapon = getWeaponProfile();
    return game.projectiles.some(projectile => {
      if (projectile.owner !== 'enemy' || projectile.life <= 0 || projectile.hp <= 0) return false;
      const projectileSpeed = Math.hypot(projectile.vx || 0, projectile.vy || 0);
      // Start defensive swings early enough for even slower weapons to meet a ricocheting shot.
      const threatRange = clamp(weapon.reach * 1.7 + projectileSpeed * 0.62, 300, 540);
      return dist(projectile.x, projectile.y, game.player.x, game.player.y) <= threatRange + projectile.radius;
    });
  }

  function isAutoAttackThreatActive() {
    return isCombatActive() || hasNearbyHostileProjectile();
  }

  function attemptDodge(x, y) {
    const p = game.player;
    if (!p || p.dodgeCooldown > 0 || game.paused) return false;
    const dir = normalize(x, y);
    if (Math.hypot(dir.x, dir.y) < 0.5) return false;
    const combat = isCombatActive();
    if (combat && p.stamina < DODGE.combatCost) {
      toast('Not enough stamina to dodge.', 900);
      return false;
    }
    if (combat) {
      p.stamina = Math.max(0, p.stamina - DODGE.combatCost);
      p.staminaRegenDelay = DODGE.regenDelay;
    } else {
      p.stamina = p.maxStamina;
    }
    p.dodge = { x: dir.x, y: dir.y, time: DODGE.duration, duration: DODGE.duration, chargeHitIds: new Set() };
    p.dodgeCooldown = 0.08;
    p.invuln = Math.max(p.invuln, DODGE.duration + 0.06);
    p.facing = { ...dir };
    game.particles.push({ type: 'ring', x: p.x, y: p.y, r: 8, maxR: 42, t: 0, duration: 0.16, color: combat ? '#77cbe8' : '#d6d6d6' });
    return true;
  }

  function updatePlayer(dt) {
    const p = game.player;
    updatePlayerStatusEffects(p, dt);
    const stats = getDerivedStats();
    p.maxHealth = stats.maxHealth;
    p.health = Math.min(p.health, p.maxHealth);
    const input = updateInputVector();
    const inputMagnitude = Math.hypot(input.x, input.y);
    const aimSign = p.confusionTimer > 0 ? -1 : 1;
    const aimMagnitude = Math.hypot(game.input.aimX, game.input.aimY);
    if (game.input.aimMode) {
      if (aimMagnitude > 0.04) p.facing = screenVectorToWorld(game.input.aimX * aimSign, game.input.aimY * aimSign);
    } else if (inputMagnitude > 0.04) {
      p.facing = { ...input };
    }
    const combat = isCombatActive();
    p.dodgeCooldown = Math.max(0, p.dodgeCooldown - dt);
    if (!combat) {
      p.stamina = p.maxStamina;
      p.staminaRegenDelay = 0;
    } else if (p.staminaRegenDelay > 0) {
      p.staminaRegenDelay = Math.max(0, p.staminaRegenDelay - dt);
    } else if (!p.dodge) {
      p.stamina = Math.min(p.maxStamina, p.stamina + DODGE.regenPerSecond * dt);
    }

    if (p.dodge) {
      const fromX = p.x, fromY = p.y;
      p.x += p.dodge.x * DODGE.speed * dt;
      p.y += p.dodge.y * DODGE.speed * dt;
      p.vx = p.dodge.x * DODGE.speed;
      p.vy = p.dodge.y * DODGE.speed;
      p.x = clamp(p.x, p.radius + 30, game.roomWorld.w - p.radius - 30);
      p.y = clamp(p.y, p.radius + 30, game.roomWorld.h - p.radius - 30);
      updateDodgeChargeStrike(fromX, fromY, p.x, p.y);
      p.dodge.time -= dt;
      if (p.dodge.time <= 0) {
        p.dodge = null;
        p.vx *= 0.22;
        p.vy *= 0.22;
      }
    } else {
      const movementScale = p.slowTimer > 0 ? 0.58 : 1;
      const targetVx = input.x * stats.speed * movementScale;
      const targetVy = input.y * stats.speed * movementScale;
      const response = inputMagnitude > 0.04 ? 34 : 52;
      p.vx = lerp(p.vx, targetVx, clamp(dt * response, 0, 1));
      p.vy = lerp(p.vy, targetVy, clamp(dt * response, 0, 1));
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    p.x = clamp(p.x, p.radius + 30, game.roomWorld.w - p.radius - 30);
    p.y = clamp(p.y, p.radius + 30, game.roomWorld.h - p.radius - 30);
    p.attackCooldown = Math.max(0, p.attackCooldown - dt);
    p.abilityCooldown = Math.max(0, p.abilityCooldown - dt);
    p.invuln = Math.max(0, p.invuln - dt);

    if (((game.autoAttack && isAutoAttackThreatActive()) || game.input.manualHeld) && p.attackCooldown <= 0 && game.scene === 'dungeon') requestAttack();
    updateAttack(dt);

    const regen = game.character.abilities.regen || 0;
    if (regen > 0) {
      p.regenTimer += dt;
      if (p.regenTimer >= 2.5) {
        p.regenTimer = 0;
        p.health = Math.min(p.maxHealth, p.health + regen * 1.5);
      }
    }

    if (game.input.interactQueued) {
      game.input.interactQueued = false;
      performInteraction();
    }
  }

  function updateDodgeChargeStrike(fromX, fromY, toX, toY) {
    const p = game.player;
    if (!p?.dodge || !p.attack || game.scene !== 'dungeon') return;
    const weapon = p.attack.weapon || getWeaponProfile();
    for (const enemy of game.enemies) {
      if (enemy.dead || p.dodge.chargeHitIds.has(enemy.id)) continue;
      const hitRadius = p.radius + enemy.radius + 10;
      if (pointToSegmentDistance(enemy.x, enemy.y, fromX, fromY, toX, toY) > hitRadius) continue;
      p.dodge.chargeHitIds.add(enemy.id);
      hitEnemy(
        enemy,
        weapon.damage * DODGE.chargeBonusDamage,
        weapon.knockback * DODGE.chargeKnockbackMult,
        p.dodge.x,
        p.dodge.y,
        { label: 'CHARGE', color: '#8fe8ff' }
      );
      game.particles.push({ type: 'ring', x: enemy.x, y: enemy.y, r: 8, maxR: enemy.radius + 30, t: 0, duration: 0.18, color: '#8fe8ff' });
    }
  }

  function requestAttack() {
    const p = game.player;
    if (p.attackCooldown > 0 || p.attack) return;
    const weapon = getWeaponProfile();
    p.attackCooldown = weapon.cooldown;
    p.attack = {
      t: 0, phase: 0, direction: chance(0.5) ? 1 : -1,
      weapon, hitIds: new Set(),
      totalPhases: (game.character.abilities.doubleStrike || 0) > 0 ? 2 : 1,
    };
  }

  function updateAttack(dt) {
    const p = game.player;
    const a = p.attack;
    if (!a) return;
    a.t += dt;
    const progress = clamp(a.t / a.weapon.duration, 0, 1);
    const facingAngle = Math.atan2(p.facing.y, p.facing.x);
    const halfArc = (a.weapon.arc * Math.PI / 180) / 2;
    const phaseDirection = a.phase % 2 === 0 ? a.direction : -a.direction;
    const sweep = phaseDirection > 0 ? lerp(-halfArc, halfArc, progress) : lerp(halfArc, -halfArc, progress);
    a.currentAngle = facingAngle + sweep;
    a.progress = progress;
    a.phaseDirection = phaseDirection;

    if (game.scene === 'dungeon' && progress >= 0.08 && progress <= 0.96) {
      for (const enemy of game.enemies) {
        if (enemy.dead || a.hitIds.has(enemy.id)) continue;
        const dx = enemy.x - p.x, dy = enemy.y - p.y;
        const d = Math.hypot(dx, dy);
        if (d > a.weapon.reach + enemy.radius || d < 10) continue;
        const enemyAngle = Math.atan2(dy, dx);
        const thickness = a.weapon.bladeWidth + enemy.radius / Math.max(50, d);
        if (Math.abs(angleDiff(enemyAngle, a.currentAngle)) <= thickness) {
          a.hitIds.add(enemy.id);
          hitEnemy(enemy, a.weapon.damage, a.weapon.knockback, dx, dy);
        }
      }
      for (const projectile of game.projectiles) {
        if (projectile.owner !== 'enemy' || projectile.life <= 0 || projectile.hp <= 0 || a.hitIds.has(projectile.id)) continue;
        const dx = projectile.x - p.x, dy = projectile.y - p.y;
        const d = Math.hypot(dx, dy);
        if (d > a.weapon.reach + projectile.radius + 10 || d < 8) continue;
        const projectileAngle = Math.atan2(dy, dx);
        const forgivingThickness = a.weapon.bladeWidth + (projectile.radius + 18) / Math.max(45, d);
        if (Math.abs(angleDiff(projectileAngle, a.currentAngle)) <= forgivingThickness) {
          a.hitIds.add(projectile.id);
          destroyProjectile(projectile);
        }
      }
    }

    if (progress >= 1) {
      if (a.phase + 1 < a.totalPhases) {
        a.phase += 1;
        a.t = -0.055;
        a.hitIds = new Set();
      } else {
        p.attack = null;
      }
    }
  }

  function useWhirlwind() {
    const p = game.player;
    if (game.scene !== 'dungeon') { toast('Combat skills are used inside the dungeon.'); return; }
    if (p.abilityCooldown > 0) { toast(`Whirlwind ready in ${p.abilityCooldown.toFixed(1)}s.`); return; }
    p.abilityCooldown = Math.max(5.5, 9 - (game.character.abilities.whirlwind || 1) * 0.5);
    const weapon = getWeaponProfile();
    for (const enemy of game.enemies) {
      if (enemy.dead) continue;
      const dx = enemy.x - p.x, dy = enemy.y - p.y;
      if (Math.hypot(dx, dy) <= weapon.reach * 1.35 + enemy.radius) {
        hitEnemy(enemy, weapon.damage * 0.78, weapon.knockback * 1.35, dx, dy);
      }
    }
    for (const projectile of game.projectiles) {
      if (projectile.owner === 'enemy' && projectile.life > 0 && dist(projectile.x, projectile.y, p.x, p.y) <= weapon.reach * 1.42 + projectile.radius) {
        destroyProjectile(projectile);
      }
    }
    game.particles.push({ type: 'ring', x: p.x, y: p.y, r: 20, maxR: weapon.reach * 1.4, t: 0, duration: 0.35, color: '#e7c47b' });
  }

  function hitEnemy(enemy, damage, knockback, dx, dy, options = {}) {
    const variance = rand(0.9, 1.1);
    const stats = getDerivedStats();
    const critical = options.canCrit === false ? false : (options.critical ?? chance(stats.critChance));
    const amount = Math.max(1, Math.round(damage * variance * (critical ? stats.critDamage : 1)));
    enemy.hp -= amount;
    enemy.hitFlash = 0.12;
    const n = normalize(dx, dy);
    enemy.vx += n.x * knockback / enemy.mass;
    enemy.vy += n.y * knockback / enemy.mass;
    const prefix = [critical ? 'CRIT' : '', options.label || ''].filter(Boolean).join(' ');
    const damageText = prefix ? `${prefix} ${amount}` : `${amount}`;
    game.particles.push({ type: 'text', x: enemy.x, y: enemy.y - enemy.radius, text: damageText, t: 0, duration: prefix ? 0.88 : 0.65, color: critical ? '#fff06a' : (options.color || '#ffe6a7') });
    if (critical) addCameraShake(enemy.type === 'boss' ? 9 : 6, 0.18);
    if (enemy.hp <= 0) killEnemy(enemy);
  }
  function killEnemy(enemy) {
    if (enemy.dead) return;
    enemy.dead = true;
    const sizeBonus = currentFloor()?.xpMultiplier || DUNGEON_SIZES[currentFloor()?.sizeName]?.xpMultiplier || 1;
    gainXp(Math.round(enemy.xp * sizeBonus));
    game.character.coins += enemy.type === 'boss' ? randInt(120, 220) : randInt(1, 5);
    spawnEnemyDrops(enemy);
    if (enemy.type === 'slime' && enemy.radius > 15 && chance(0.45)) {
      for (let i = 0; i < 2; i++) {
        const child = spawnEnemy('slime', enemy.x + rand(-25, 25), enemy.y + rand(-25, 25), { radius: 14, hp: 12, speed: 88, damage: 5, xp: 5, mass: 0.45, color: '#77b985' });
        child.maxHp = child.hp;
      }
    }
    if (enemy.type === 'boss') { addCameraShake(14, 0.45); handleBossDeath(); }
  }

  function spawnEnemyDrops(enemy) {
    if (enemy.type !== 'boss') {
      const mat = MATERIALS[enemy.type];
      if (mat && chance(0.66)) {
        spawnDrop(enemy.x + rand(-12, 12), enemy.y + rand(-12, 12), { ...mat, type: 'material', qty: randInt(1, 2), stackable: true });
      }
      if (chance(0.09)) spawnDrop(enemy.x, enemy.y, makeGear(null, rollRarity(currentFloor().floorNumber), currentFloor().floorNumber));
      if (chance(0.035)) spawnDrop(enemy.x, enemy.y, { id: 'healing_potion', name: 'Healing Potion', type: 'consumable', qty: 1, stackable: true, description: 'Restores 45 health.' });
    } else {
      for (let i = 0; i < 4; i++) spawnDrop(enemy.x + rand(-80, 80), enemy.y + rand(-80, 80), makeGear(null, i === 0 ? 'epic' : rollRarity(currentFloor().floorNumber + 6), currentFloor().floorNumber + 2));
      const surveyRoll = Math.random();
      const surveyItem = surveyRoll < 0.18
        ? { id: 'ancient_survey_seal', name: 'Ancient Survey Seal', type: 'consumable', qty: 1, stackable: true, rarity: 'legendary', description: 'Generates a Huge 100-room floor with +65% monster XP.' }
        : surveyRoll < 0.52
          ? { id: 'grand_survey_charm', name: 'Grand Cartographer’s Charter', type: 'consumable', qty: 1, stackable: true, rarity: 'epic', description: 'Generates a Large 60-room floor with +35% monster XP.' }
          : { id: 'survey_charm', name: 'Cartographer’s Charter', type: 'consumable', qty: 1, stackable: true, rarity: 'rare', description: 'Generates a Medium 40-room floor with +15% monster XP.' };
      spawnDrop(enemy.x + 100, enemy.y, surveyItem);
    }
  }

  function spawnDrop(x, y, item, options = {}) {
    const drop = { id: uid('drop'), x, y, item, bob: rand(0, TAU), picked: false, pickupDelay: options.pickupDelay || 0, magnet: false };
    game.drops.push(drop);
    const room = currentRoom();
    if (game.scene === 'dungeon' && room) room.groundDrops = game.drops;
    return drop;
  }
  function gainXp(amount) {
    const c = game.character;
    c.xp += amount;
    let leveled = false;
    while (c.xp >= xpNeeded(c.level)) {
      c.xp -= xpNeeded(c.level);
      c.level += 1;
      c.stats.vitality += 1;
      leveled = true;
    }
    if (leveled) {
      game.player.maxHealth = getDerivedStats().maxHealth;
      game.player.health = Math.min(game.player.maxHealth, game.player.health + 35);
      showLevelUpChoices();
    }
  }

  function showLevelUpChoices() {
    const choices = shuffle([
      { key: 'strength', title: 'Strength Training', desc: '+2 Strength and stronger physical attacks.', apply: () => game.character.stats.strength += 2 },
      { key: 'defense', title: 'Hardened Guard', desc: '+2 Defense and improved damage reduction.', apply: () => game.character.stats.defense += 2 },
      { key: 'vitality', title: 'Deep Reserves', desc: '+2 Vitality and more maximum health.', apply: () => game.character.stats.vitality += 2 },
      { key: 'agility', title: 'Quick Footwork', desc: '+2 Agility for movement speed.', apply: () => game.character.stats.agility += 2 },
      { key: 'doubleStrike', title: 'Double Strike', desc: 'Each attack immediately swings back in the opposite direction.', apply: () => game.character.abilities.doubleStrike += 1 },
      { key: 'arcBoost', title: 'Sweeping Form', desc: '+9° to melee attack breadth.', apply: () => game.character.abilities.arcBoost += 1 },
      { key: 'reachBoost', title: 'Long Reach', desc: '+9% melee reach.', apply: () => game.character.abilities.reachBoost += 1 },
      { key: 'attackSpeed', title: 'Relentless Rhythm', desc: '+6% attack speed.', apply: () => game.character.abilities.attackSpeed += 1 },
      { key: 'knockback', title: 'Driving Blows', desc: '+12% weapon knockback.', apply: () => game.character.abilities.knockback += 1 },
      { key: 'precision', title: 'Killer Precision', desc: '+2.5% critical-hit chance.', apply: () => game.character.abilities.precision = (game.character.abilities.precision || 0) + 1 },
      { key: 'regen', title: 'Slow Recovery', desc: 'Regenerate health periodically.', apply: () => game.character.abilities.regen += 1 },
      { key: 'whirlwind', title: 'Whirlwind Practice', desc: 'Reduces the active skill cooldown.', apply: () => game.character.abilities.whirlwind += 1 },
    ]).slice(0, 3);
    showModal(`Level ${game.character.level}`, `<p>Choose a permanent improvement for this character.</p><div class="choice-list">${choices.map((c, i) => `<button class="choice-btn level-choice" data-i="${i}"><strong>${c.title}</strong>${c.desc}</button>`).join('')}</div>`, false);
    modalBody.querySelectorAll('.level-choice').forEach(btn => btn.addEventListener('click', () => {
      choices[Number(btn.dataset.i)].apply();
      hideModal();
      saveGame();
      toast(`${choices[Number(btn.dataset.i)].title} learned.`);
    }));
  }

  function updateCamp(dt) {
    const p = game.player;
    for (const npc of game.campNpcs) {
      npc.wanderTimer -= dt;
      if (npc.wanderTimer <= 0) {
        npc.wanderTimer = rand(1.5, 4.5);
        const dir = normalize(rand(-1, 1), rand(-1, 1));
        npc.vx = dir.x * rand(12, 32);
        npc.vy = dir.y * rand(12, 32);
      }
      npc.x = clamp(npc.x + npc.vx * dt, 260, 1540);
      npc.y = clamp(npc.y + npc.vy * dt, 570, 1160);
      if (Math.hypot(npc.vx, npc.vy) > 2) {
        const facing = normalize(npc.vx, npc.vy);
        npc.facingX = facing.x;
        npc.facingY = facing.y;
      }
    }
    const dFire = dist(p.x, p.y, 900, 800);
    if (dFire < 70) {
      const n = normalize(p.x - 900, p.y - 800);
      p.x = 900 + n.x * 70; p.y = 800 + n.y * 70;
    }

    // Intentional overlap trigger: the player's feet must enter deeply under the arch.
    const ex = (p.x - 900) / 74;
    const ey = (p.y - 300) / 66;
    const insideEntrance = ex * ex + ey * ey <= 1;
    const outsideReset = ((p.x - 900) / 112) ** 2 + ((p.y - 300) / 104) ** 2 > 1;
    if (outsideReset) game.campEntranceArmed = true;
    if (insideEntrance && game.campEntranceArmed && !game.paused) {
      game.campEntranceArmed = false;
      p.vx = p.vy = 0;
      showFloorSelection();
    }
  }
  function updateDungeon(dt) {
    updateEnemies(dt);
    const room = currentRoom();
    if (!room) return;
    if (!room.cleared && room.type !== 'puzzle' && room.type !== 'escape' && room.type !== 'rest' && room.type !== 'start') {
      const alive = game.enemies.some(e => !e.dead && e.type !== 'boss');
      const bossAlive = game.enemies.some(e => !e.dead && e.type === 'boss');
      if (!alive && !bossAlive && room.type !== 'boss') {
        room.cleared = true;
        toast('Room cleared. The doors unlock.');
      }
    }
    if (room.type === 'gathering' && !game.enemies.some(e => !e.dead)) room.cleared = true;
    if (room.type === 'treasure' && !game.enemies.some(e => !e.dead)) room.cleared = true;
    if (['escape', 'rest', 'start'].includes(room.type)) room.cleared = true;
    handleDoorTransitions();
  }

  function applyPlayerStatus(type, duration) {
    const p = game.player;
    if (!p) return;
    if (type === 'burn') { p.burnTimer = Math.max(p.burnTimer || 0, duration); p.burnTick = Math.min(p.burnTick || 0, 0.18); }
    if (type === 'poison') { p.poisonTimer = Math.max(p.poisonTimer || 0, duration); p.poisonTick = Math.min(p.poisonTick || 0, 0.22); }
    if (type === 'confusion') {
      const wasConfused = p.confusionTimer > 0;
      p.confusionTimer = Math.max(p.confusionTimer || 0, duration);
      if (!wasConfused) toast('Disoriented! Movement and aim are reversed.', 2200);
    }
    if (type === 'slow') p.slowTimer = Math.max(p.slowTimer || 0, duration);
  }

  function applyEnemyStatus(enemy, type, duration) {
    if (!enemy || enemy.dead) return;
    if (type === 'burn') { enemy.burnTimer = Math.max(enemy.burnTimer || 0, duration); enemy.burnTick = Math.min(enemy.burnTick || 0, 0.18); }
    if (type === 'poison') { enemy.poisonTimer = Math.max(enemy.poisonTimer || 0, duration); enemy.poisonTick = Math.min(enemy.poisonTick || 0, 0.22); }
    if (type === 'slow') enemy.slowTimer = Math.max(enemy.slowTimer || 0, duration);
  }

  function environmentalDamageEnemy(enemy, amount, color, label) {
    if (!enemy || enemy.dead) return;
    const dealt = Math.max(1, Math.round(amount));
    enemy.hp -= dealt;
    enemy.hitFlash = Math.max(enemy.hitFlash || 0, 0.08);
    game.particles.push({ type: 'text', x: enemy.x, y: enemy.y - enemy.radius, text: `${label || ''}${dealt}`, t: 0, duration: 0.58, color });
    if (enemy.hp <= 0) killEnemy(enemy);
  }

  function updatePlayerStatusEffects(p, dt) {
    p.confusionTimer = Math.max(0, (p.confusionTimer || 0) - dt);
    p.slowTimer = Math.max(0, (p.slowTimer || 0) - dt);
    p.burnTimer = Math.max(0, (p.burnTimer || 0) - dt);
    p.poisonTimer = Math.max(0, (p.poisonTimer || 0) - dt);
    if (p.burnTimer > 0) {
      p.burnTick = (p.burnTick || 0) - dt;
      if (p.burnTick <= 0) { p.burnTick = 0.72; damagePlayer(3, p.x - 1, p.y, { ignoreInvuln: true, dot: true }); }
    }
    if (p.poisonTimer > 0) {
      p.poisonTick = (p.poisonTick || 0) - dt;
      if (p.poisonTick <= 0) { p.poisonTick = 0.9; damagePlayer(2, p.x + 1, p.y, { ignoreInvuln: true, dot: true }); }
    }
  }

  function updateEnemyStatusEffects(e, dt) {
    e.slowTimer = Math.max(0, (e.slowTimer || 0) - dt);
    e.burnTimer = Math.max(0, (e.burnTimer || 0) - dt);
    e.poisonTimer = Math.max(0, (e.poisonTimer || 0) - dt);
    if (e.burnTimer > 0) {
      e.burnTick = (e.burnTick || 0) - dt;
      if (e.burnTick <= 0) { e.burnTick = 0.72; environmentalDamageEnemy(e, 3, '#ff8a4c', 'BURN '); }
    }
    if (!e.dead && e.poisonTimer > 0) {
      e.poisonTick = (e.poisonTick || 0) - dt;
      if (e.poisonTick <= 0) { e.poisonTick = 0.9; environmentalDamageEnemy(e, 2, '#8fe56e', 'POISON '); }
    }
  }

  function createGroundHazard(element, x, y, radius, duration, damage, sourceId = null) {
    game.areaEffects.push({ id: uid('effect'), type: 'hazard', element, x, y, radius, duration, time: duration, damage, sourceId, tick: 0.05 });
  }

  function createBlastTelegraph(element, x, y, radius, delay, damage, sourceId = null, options = {}) {
    game.areaEffects.push({ id: uid('effect'), type: 'blast', element, x, y, radius, duration: delay, time: delay, damage, sourceId, hazardDuration: options.hazardDuration || 5.5, statusDuration: options.statusDuration || 3.2 });
  }

  function createVortex(x, y, radius, damage, sourceId = null) {
    game.areaEffects.push({ id: uid('effect'), type: 'vortex', x, y, radius, duration: 2.05, time: 2.05, warmup: 0.55, damage, sourceId, pull: 720 });
  }

  function createConeTelegraph(x, y, angle, range, arc, delay, damage, sourceId = null, confuseDuration = 2.6) {
    game.areaEffects.push({ id: uid('effect'), type: 'cone', x, y, angle, range, arc, duration: delay, time: delay, damage, sourceId, confuseDuration });
  }

  function pointInCone(px, py, effect, extraRadius = 0) {
    const dx = px - effect.x, dy = py - effect.y;
    const d = Math.hypot(dx, dy);
    if (d > effect.range + extraRadius) return false;
    const a = Math.atan2(dy, dx);
    return Math.abs(angleDiff(a, effect.angle)) <= effect.arc / 2 + extraRadius / Math.max(1, d);
  }

  function damageCircle(x, y, radius, damage, sourceId = null, status = null, statusDuration = 0) {
    const p = game.player;
    if (p && dist(x, y, p.x, p.y) <= radius + p.radius) {
      damagePlayer(damage, x, y);
      if (status) applyPlayerStatus(status, statusDuration);
    }
    for (const enemy of game.enemies) {
      if (enemy.dead || enemy.id === sourceId) continue;
      if (dist(x, y, enemy.x, enemy.y) <= radius + enemy.radius) {
        environmentalDamageEnemy(enemy, damage * 0.72, status === 'burn' ? '#ff8a4c' : status === 'poison' ? '#8fe56e' : '#ead8aa', status ? `${status.toUpperCase()} ` : '');
        if (status) applyEnemyStatus(enemy, status, statusDuration);
      }
    }
  }

  function updateAreaEffects(dt) {
    const p = game.player;
    for (const effect of [...game.areaEffects]) {
      effect.time -= dt;
      if (effect.type === 'hazard') {
        effect.tick -= dt;
        if (effect.tick <= 0) {
          effect.tick = 0.48;
          const status = effect.element === 'fire' ? 'burn' : effect.element === 'poison' ? 'poison' : 'slow';
          if (p && dist(effect.x, effect.y, p.x, p.y) <= effect.radius + p.radius) {
            if (effect.element !== 'web') damagePlayer(effect.damage, effect.x, effect.y);
            applyPlayerStatus(status, effect.element === 'web' ? 0.5 : 2.6);
          }
          for (const enemy of game.enemies) {
            if (enemy.dead || enemy.id === effect.sourceId) continue;
            if (dist(effect.x, effect.y, enemy.x, enemy.y) <= effect.radius + enemy.radius) {
              if (effect.element !== 'web') environmentalDamageEnemy(enemy, effect.damage * 0.68, effect.element === 'fire' ? '#ff8a4c' : '#8fe56e', '');
              applyEnemyStatus(enemy, status, effect.element === 'web' ? 0.55 : 2.4);
            }
          }
        }
      } else if (effect.type === 'vortex') {
        const elapsed = effect.duration - effect.time;
        if (elapsed >= effect.warmup && effect.time > 0) {
          if (p) {
            const pd = dist(p.x, p.y, effect.x, effect.y);
            if (pd < effect.radius * 1.75 && pd > 5) {
              const pull = normalize(effect.x - p.x, effect.y - p.y);
              const strength = (1 - clamp(pd / (effect.radius * 1.75), 0, 1)) * effect.pull;
              p.x += pull.x * strength * dt; p.y += pull.y * strength * dt;
            }
          }
          for (const enemy of game.enemies) {
            if (enemy.dead || enemy.id === effect.sourceId) continue;
            const ed = dist(enemy.x, enemy.y, effect.x, effect.y);
            if (ed < effect.radius * 1.6 && ed > 5) {
              const pull = normalize(effect.x - enemy.x, effect.y - enemy.y);
              const strength = (1 - clamp(ed / (effect.radius * 1.6), 0, 1)) * effect.pull * 0.55;
              enemy.vx += pull.x * strength; enemy.vy += pull.y * strength;
            }
          }
        }
      }
      if (effect.time <= 0) {
        if (effect.type === 'blast') {
          const status = effect.element === 'fire' ? 'burn' : effect.element === 'poison' ? 'poison' : null;
          damageCircle(effect.x, effect.y, effect.radius, effect.damage, effect.sourceId, status, effect.statusDuration);
          if (effect.element === 'fire' || effect.element === 'poison') createGroundHazard(effect.element, effect.x, effect.y, effect.radius * 0.9, effect.hazardDuration, Math.max(2, effect.damage * 0.18), effect.sourceId);
          addCameraShake(effect.element === 'fire' ? 9 : 7, 0.25);
        } else if (effect.type === 'vortex') {
          damageCircle(effect.x, effect.y, effect.radius, effect.damage, effect.sourceId, null, 0);
          addCameraShake(10, 0.3);
        } else if (effect.type === 'cone') {
          if (p && pointInCone(p.x, p.y, effect, p.radius)) {
            damagePlayer(effect.damage, effect.x, effect.y);
            applyPlayerStatus('confusion', effect.confuseDuration);
          }
          for (const enemy of game.enemies) {
            if (enemy.dead || enemy.id === effect.sourceId) continue;
            if (pointInCone(enemy.x, enemy.y, effect, enemy.radius)) environmentalDamageEnemy(enemy, effect.damage * 0.6, '#b9dfff', 'SONIC ');
          }
        }
        game.areaEffects.splice(game.areaEffects.indexOf(effect), 1);
      }
    }
  }

  function summonMiniSkeletons(summoner, count = 3) {
    const alive = game.enemies.filter(enemy => !enemy.dead && enemy.summonerId === summoner.id).length;
    const spawnCount = Math.max(0, Math.min(count, 15 - alive));
    for (let i = 0; i < spawnCount; i++) {
      const a = (i / Math.max(1, spawnCount)) * TAU + rand(-0.25, 0.25);
      const minion = spawnEnemy('skeleton', summoner.x + Math.cos(a) * rand(55, 90), summoner.y + Math.sin(a) * rand(55, 90), {
        mini: true, allowAlpha: false, summonerId: summoner.id, name: 'Bone Thrall', radius: 12, hp: 10, speed: 112, damage: 5, xp: 4, mass: 0.38, color: '#cfc7ae'
      });
      minion.maxHp = minion.hp;
      game.particles.push({ type: 'ring', x: minion.x, y: minion.y, r: 4, maxR: 30, t: 0, duration: 0.3, color: '#d9d0bb' });
    }
  }

  function triggerAlphaAbility(e, p, d, n) {
    if (!e.isAlpha || e.abilityCooldown > 0 || e.specialState) return false;
    const targetX = clamp(p.x + p.vx * 0.28, 80, game.roomWorld.w - 80);
    const targetY = clamp(p.y + p.vy * 0.28, 80, game.roomWorld.h - 80);
    if (e.type === 'imp' && d < 950) {
      createBlastTelegraph('fire', targetX, targetY, 118, 0.9, e.damage * 1.35, e.id, { hazardDuration: 6.2, statusDuration: 3.4 });
      e.abilityCooldown = rand(4.4, 6.2);
    } else if (e.type === 'shadow' && d < 950) {
      createVortex(targetX, targetY, 160, e.damage * 1.45, e.id);
      e.abilityCooldown = rand(5.4, 7.1);
    } else if (e.type === 'slime' && d < 880) {
      e.specialState = 'slimeWindup'; e.specialTimer = 0.48; e.specialDuration = 0.48; e.specialTarget = { x: targetX, y: targetY };
      createBlastTelegraph('poison', targetX, targetY, 126, 0.92, e.damage * 1.15, e.id, { hazardDuration: 6.8, statusDuration: 4.0 });
      e.abilityCooldown = rand(4.7, 6.4);
      return true;
    } else if (e.type === 'bat' && d < 720) {
      createConeTelegraph(e.x, e.y, Math.atan2(p.y - e.y, p.x - e.x), 440, Math.PI * 0.38, 0.72, e.damage * 0.8, e.id, 2.7);
      e.abilityCooldown = rand(4.8, 6.5);
    } else if (e.type === 'skeleton') {
      summonMiniSkeletons(e, 3);
      e.abilityCooldown = rand(6.5, 8.2);
    } else if (e.type === 'zombie' && d < 520) {
      createBlastTelegraph('stomp', e.x, e.y, 132, 0.58, e.damage * 1.45, e.id);
      e.abilityCooldown = rand(4.0, 5.8);
    } else if (e.type === 'spider' && d < 820) {
      createGroundHazard('web', targetX, targetY, 118, 5.4, 0, e.id);
      e.abilityCooldown = rand(4.4, 6.0);
    }
    return false;
  }

  function updateBossAI(e, dt, p, n, d, tacticalN) {
    if (e.specialState === 'chargeWindup') {
      e.vx *= 0.8; e.vy *= 0.8;
      e.specialTimer -= dt;
      if (e.specialTimer <= 0) {
        const chargeDir = normalize(e.specialTarget.x - e.x, e.specialTarget.y - e.y);
        e.specialState = 'charge'; e.specialTimer = 0.62;
        e.vx = chargeDir.x * 1220; e.vy = chargeDir.y * 1220;
      }
      return;
    }
    if (e.specialState === 'charge') {
      e.specialTimer -= dt;
      if (e.specialTimer <= 0) {
        e.specialState = null;
        e.bossMode = 'slow'; e.bossModeTimer = rand(2.6, 3.8);
        e.abilityCooldown = Math.max(e.abilityCooldown, 1.0);
      }
      return;
    }

    e.bossModeTimer -= dt;
    e.chargeCooldown -= dt;
    if (e.bossModeTimer <= 0) {
      if (e.bossMode === 'slow') { e.bossMode = 'medium'; e.bossModeTimer = rand(3.2, 4.8); }
      else if (e.bossMode === 'medium') { e.bossMode = 'sprint'; e.bossModeTimer = rand(2.2, 3.2); e.chargeCooldown = Math.min(e.chargeCooldown, 0.45); }
      else { e.bossMode = 'slow'; e.bossModeTimer = rand(2.8, 4.2); }
    }

    const moveFactor = e.bossMode === 'slow' ? 0.42 : e.bossMode === 'medium' ? 1.15 : 2.75;
    const target = e.bossMode === 'medium' ? tacticalN : n;
    e.vx += target.x * e.speed * dt * 3.2 * moveFactor;
    e.vy += target.y * e.speed * dt * 3.2 * moveFactor;

    if (e.bossMode === 'sprint' && e.chargeCooldown <= 0 && d < 1250) {
      e.specialState = 'chargeWindup'; e.specialTimer = 0.48;
      e.specialTarget = { x: p.x + p.vx * 0.2, y: p.y + p.vy * 0.2 };
      e.chargeCooldown = rand(2.0, 2.8);
      return;
    }

    if (e.bossMode !== 'sprint' && e.abilityCooldown <= 0) {
      const pattern = choose(['fire', 'poison', 'vortex', 'scream', 'summon']);
      const tx = clamp(p.x + p.vx * 0.3, 110, game.roomWorld.w - 110);
      const ty = clamp(p.y + p.vy * 0.3, 110, game.roomWorld.h - 110);
      if (pattern === 'fire') createBlastTelegraph('fire', tx, ty, 150, 0.92, e.damage * 1.35, e.id, { hazardDuration: 7.0, statusDuration: 3.8 });
      else if (pattern === 'poison') createBlastTelegraph('poison', tx, ty, 155, 0.82, e.damage * 1.15, e.id, { hazardDuration: 7.4, statusDuration: 4.3 });
      else if (pattern === 'vortex') createVortex(tx, ty, 205, e.damage * 1.55, e.id);
      else if (pattern === 'scream') createConeTelegraph(e.x, e.y, Math.atan2(p.y - e.y, p.x - e.x), 560, Math.PI * 0.42, 0.76, e.damage * 0.7, e.id, 2.4);
      else summonMiniSkeletons(e, 3);
      e.abilityCooldown = e.bossMode === 'slow' ? rand(3.2, 4.4) : rand(2.5, 3.5);
    }
  }

  function updateEnemies(dt) {
    const p = game.player;
    const now = performance.now();
    const forward = normalize(p.facing.x, p.facing.y);
    const left = { x: -forward.y, y: forward.x };
    for (const e of game.enemies) {
      if (e.dead) continue;
      updateEnemyStatusEffects(e, dt);
      if (e.dead) continue;
      e.cooldown -= dt;
      e.stateTimer -= dt;
      e.contactCooldown -= dt;
      e.teleportCooldown -= dt;
      e.roleTimer -= dt;
      e.abilityCooldown -= dt;
      e.hitFlash = Math.max(0, e.hitFlash - dt);
      e.swarmAngle = (e.swarmAngle || 0) + (e.swarmTurn || 0.08) * dt;
      if (e.roleTimer <= 0) {
        e.roleTimer = rand(3, 6.5);
        e.tacticalRole = choose(['pursuit', 'flankLeft', 'flankRight']);
      }
      const dx = p.x - e.x, dy = p.y - e.y;
      const d = Math.max(1, Math.hypot(dx, dy));
      const n = { x: dx / d, y: dy / d };
      const farPressure = d > 760 ? 1.7 : d > 480 ? 1.35 : 1;
      const flankSign = e.tacticalRole === 'flankLeft' ? 1 : e.tacticalRole === 'flankRight' ? -1 : 0;
      const flankDepth = e.type === 'skeleton' || e.type === 'imp' ? 80 : 175;
      const flankWidth = e.type === 'bat' ? 260 : 190;
      const tacticalTarget = flankSign
        ? { x: p.x - forward.x * flankDepth + left.x * flankSign * flankWidth, y: p.y - forward.y * flankDepth + left.y * flankSign * flankWidth }
        : { x: p.x, y: p.y };
      const tacticalN = normalize(tacticalTarget.x - e.x, tacticalTarget.y - e.y);

      if (e.type === 'boss') {
        updateBossAI(e, dt, p, n, d, tacticalN);
      } else {
        let specialBusy = false;
        if (e.specialState === 'slimeWindup') {
          e.specialTimer -= dt;
          e.vx *= 0.58; e.vy *= 0.58;
          specialBusy = true;
          if (e.specialTimer <= 0) {
            e.specialState = 'slimeLeap'; e.specialTimer = 0.44; e.specialDuration = 0.44;
            e.specialStart = { x: e.x, y: e.y };
            e.vx = 0; e.vy = 0;
          }
        } else if (e.specialState === 'slimeLeap') {
          e.specialTimer -= dt;
          const leapProgress = clamp(1 - e.specialTimer / Math.max(0.001, e.specialDuration || 0.44), 0, 1);
          e.x = lerp(e.specialStart.x, e.specialTarget.x, leapProgress);
          e.y = lerp(e.specialStart.y, e.specialTarget.y, leapProgress);
          e.vx = 0; e.vy = 0;
          specialBusy = true;
          if (e.specialTimer <= 0) {
            e.x = clamp(e.specialTarget.x, e.radius + 40, game.roomWorld.w - e.radius - 40);
            e.y = clamp(e.specialTarget.y, e.radius + 40, game.roomWorld.h - e.radius - 40);
            e.specialState = null; e.specialTarget = null; e.specialStart = null;
            addCameraShake(6, 0.2);
          }
        }
        if (!specialBusy) specialBusy = triggerAlphaAbility(e, p, d, n);

        if (!specialBusy && (e.type === 'zombie' || e.type === 'slime')) {
          const surroundRadius = e.type === 'zombie' ? 42 : 68;
          const tx = tacticalTarget.x + Math.cos(e.swarmAngle) * surroundRadius;
          const ty = tacticalTarget.y + Math.sin(e.swarmAngle) * surroundRadius;
          const pursuit = normalize(tx - e.x, ty - e.y);
          e.vx += pursuit.x * e.speed * dt * 6.4 * farPressure;
          e.vy += pursuit.y * e.speed * dt * 6.4 * farPressure;
        } else if (!specialBusy && e.type === 'skeleton') {
          const desired = d > 410 ? 1 : d < 250 ? -1 : 0;
          const approach = desired > 0 && flankSign ? tacticalN : n;
          e.vx += approach.x * e.speed * desired * dt * 5.3 * farPressure;
          e.vy += approach.y * e.speed * desired * dt * 5.3 * farPressure;
          const strafe = Math.sin(now / 620 + e.swarmAngle * 7) + flankSign * 0.65;
          e.vx += -n.y * strafe * e.speed * dt * 1.35;
          e.vy += n.x * strafe * e.speed * dt * 1.35;
          const shotRange = Math.hypot(game.roomWorld.w, game.roomWorld.h) * 0.92;
          if (e.cooldown <= 0 && d < shotRange) {
            e.cooldown = e.mini ? rand(1.4, 1.9) : rand(0.98, 1.34);
            fireProjectile(e.x, e.y, n.x * (e.mini ? 285 : 320), n.y * (e.mini ? 285 : 320), e.damage, '#e7dfc9', e.mini ? 5 : 7, 'enemy');
          }
        } else if (!specialBusy && e.type === 'spider') {
          if (e.state === 'telegraph') {
            e.vx *= 0.88; e.vy *= 0.88;
            if (e.stateTimer <= 0) {
              const leapAim = normalize(p.x - e.x, p.y - e.y);
              e.state = 'leap'; e.stateTimer = 0.34;
              e.vx = leapAim.x * 650; e.vy = leapAim.y * 650;
            }
          } else if (e.state === 'leap') {
            if (e.stateTimer <= 0) { e.state = 'idle'; e.cooldown = rand(1.05, 1.85); }
          } else {
            e.vx += tacticalN.x * e.speed * dt * 4.8 * farPressure;
            e.vy += tacticalN.y * e.speed * dt * 4.8 * farPressure;
            if (e.cooldown <= 0 && d < 760) { e.state = 'telegraph'; e.stateTimer = 0.46; }
          }
        } else if (!specialBusy && e.type === 'bat') {
          e.orbitAngle += dt * (2.0 + flankSign * 0.2);
          const orbitRadius = d > 520 ? 95 : 210;
          const orbitX = tacticalTarget.x + Math.cos(e.orbitAngle) * orbitRadius;
          const orbitY = tacticalTarget.y + Math.sin(e.orbitAngle) * orbitRadius;
          const on = normalize(orbitX - e.x, orbitY - e.y);
          e.vx += on.x * e.speed * dt * 5.1 * farPressure;
          e.vy += on.y * e.speed * dt * 5.1 * farPressure;
          if (e.cooldown <= 0 && d < 620) {
            e.cooldown = rand(1.15, 2.0);
            e.vx += n.x * 410; e.vy += n.y * 410;
          }
        } else if (!specialBusy && e.type === 'shadow') {
          if (e.state === 'vanish') {
            e.vx *= 0.78; e.vy *= 0.78;
            if (e.stateTimer <= 0) {
              const side = choose([-1, 1]);
              const targetX = p.x - forward.x * 155 + left.x * side * rand(45, 120);
              const targetY = p.y - forward.y * 155 + left.y * side * rand(45, 120);
              game.particles.push({ type: 'ring', x: e.x, y: e.y, r: 8, maxR: 42, t: 0, duration: 0.24, color: '#7565b7' });
              e.x = clamp(targetX, e.radius + 36, game.roomWorld.w - e.radius - 36);
              e.y = clamp(targetY, e.radius + 36, game.roomWorld.h - e.radius - 36);
              e.state = 'strike'; e.stateTimer = 0.5;
              const strike = normalize(p.x - e.x, p.y - e.y);
              e.vx = strike.x * 480; e.vy = strike.y * 480;
              game.particles.push({ type: 'ring', x: e.x, y: e.y, r: 5, maxR: 48, t: 0, duration: 0.22, color: '#9b82e5' });
            }
          } else if (e.state === 'strike') {
            if (e.stateTimer <= 0) { e.state = 'idle'; e.cooldown = rand(2.6, 4.3); }
          } else {
            e.vx += tacticalN.x * e.speed * dt * 5.2 * farPressure;
            e.vy += tacticalN.y * e.speed * dt * 5.2 * farPressure;
            if (e.cooldown <= 0 && e.teleportCooldown <= 0 && d > 150) {
              e.state = 'vanish'; e.stateTimer = 0.34; e.teleportCooldown = rand(3.2, 5.1);
            }
          }
        } else if (!specialBusy && e.type === 'imp') {
          const desired = d > 360 ? 1 : d < 245 ? -1 : 0;
          const orbit = flankSign || Math.sin(e.swarmAngle * 4) > 0 ? 1 : -1;
          e.vx += tacticalN.x * e.speed * desired * dt * 4.8 * farPressure;
          e.vy += tacticalN.y * e.speed * desired * dt * 4.8 * farPressure;
          e.vx += -n.y * orbit * e.speed * dt * 1.8;
          e.vy += n.x * orbit * e.speed * dt * 1.8;
          if (e.cooldown <= 0 && d < 900) {
            const a0 = Math.atan2(dy, dx);
            for (let i = -1; i <= 1; i++) {
              const a = a0 + i * 0.15;
              fireProjectile(e.x, e.y, Math.cos(a) * 300, Math.sin(a) * 300, e.damage, '#f08042', 6, 'enemy');
            }
            e.cooldown = rand(1.35, 1.85);
          }
        }
      }

      if (e.type !== 'boss') {
        for (const other of game.enemies) {
          if (other === e || other.dead) continue;
          const odx = e.x - other.x, ody = e.y - other.y;
          const od = Math.hypot(odx, ody);
          const separation = e.radius + other.radius + 22;
          if (od > 0.01 && od < separation) {
            const push = (separation - od) / separation;
            e.vx += (odx / od) * push * 115 * dt;
            e.vy += (ody / od) * push * 115 * dt;
          }
        }
      }

      for (const hazard of game.areaEffects) {
        if (hazard.type !== 'hazard') continue;
        const hd = dist(e.x, e.y, hazard.x, hazard.y);
        const avoidRange = hazard.radius + e.radius + 95;
        if (hd > 1 && hd < avoidRange) {
          const avoid = normalize(e.x - hazard.x, e.y - hazard.y);
          const urgency = 1 - hd / avoidRange;
          e.vx += avoid.x * e.speed * urgency * dt * 3.2;
          e.vy += avoid.y * e.speed * urgency * dt * 3.2;
        }
      }

      const charging = e.type === 'boss' && e.specialState === 'charge';
      const burst = charging || (e.type === 'spider' && e.state === 'leap') || (e.type === 'shadow' && e.state === 'strike');
      const drag = burst ? 0.995 : 0.89;
      e.vx *= Math.pow(drag, dt * 60);
      e.vy *= Math.pow(drag, dt * 60);
      const slowScale = e.slowTimer > 0 ? 0.55 : 1;
      const maxSpeed = charging ? 1320 : e.type === 'boss' ? e.speed * (e.bossMode === 'sprint' ? 5.1 : e.bossMode === 'medium' ? 2.9 : 1.35) : burst ? 720 : e.speed * (d > 620 ? 2.7 : 2.35) * slowScale;
      const vm = Math.hypot(e.vx, e.vy);
      if (vm > maxSpeed) { e.vx = e.vx / vm * maxSpeed; e.vy = e.vy / vm * maxSpeed; }
      e.x = clamp(e.x + e.vx * dt, e.radius + 32, game.roomWorld.w - e.radius - 32);
      e.y = clamp(e.y + e.vy * dt, e.radius + 32, game.roomWorld.h - e.radius - 32);

      if (dist(e.x, e.y, p.x, p.y) < e.radius + p.radius && e.contactCooldown <= 0) {
        e.contactCooldown = charging ? 0.95 : 0.72;
        damagePlayer(e.damage * (charging ? 2.15 : 1), e.x, e.y);
      }
    }
    game.enemies = game.enemies.filter(e => !e.dead || e.hitFlash > 0);
  }
  function fireProjectile(x, y, vx, vy, damage, color, radius = 7, owner = 'enemy') {
    const hp = 1;
    game.projectiles.push({ id: uid('proj'), x, y, vx, vy, damage, color, radius, owner, life: owner === 'enemy' ? 10 : 7, hp, maxHp: hp, bounces: owner === 'enemy' ? 6 : 0, bounceGrace: 0 });
  }
  function destroyProjectile(projectile) {
    if (!projectile || projectile.life <= 0) return;
    projectile.hp = 0;
    projectile.life = 0;
    game.particles.push({ type: 'ring', x: projectile.x, y: projectile.y, r: 3, maxR: 25, t: 0, duration: 0.18, color: '#f7e4b4' });
  }

  function updateProjectiles(dt) {
    const p = game.player;
    const wall = 24;
    for (const pr of game.projectiles) {
      pr.life -= dt;
      pr.bounceGrace = Math.max(0, (pr.bounceGrace || 0) - dt);
      pr.x += pr.vx * dt;
      pr.y += pr.vy * dt;
      if (pr.owner === 'enemy' && dist(pr.x, pr.y, p.x, p.y) < pr.radius + p.radius) {
        pr.life = 0;
        damagePlayer(pr.damage, pr.x, pr.y);
        continue;
      }
      let bounced = false;
      if (pr.x - pr.radius < wall && pr.vx < 0) { pr.x = wall + pr.radius; pr.vx = Math.abs(pr.vx); bounced = true; }
      else if (pr.x + pr.radius > game.roomWorld.w - wall && pr.vx > 0) { pr.x = game.roomWorld.w - wall - pr.radius; pr.vx = -Math.abs(pr.vx); bounced = true; }
      if (pr.y - pr.radius < wall && pr.vy < 0) { pr.y = wall + pr.radius; pr.vy = Math.abs(pr.vy); bounced = true; }
      else if (pr.y + pr.radius > game.roomWorld.h - wall && pr.vy > 0) { pr.y = game.roomWorld.h - wall - pr.radius; pr.vy = -Math.abs(pr.vy); bounced = true; }
      if (bounced && pr.owner === 'enemy' && pr.bounceGrace <= 0) {
        pr.bounces = (pr.bounces ?? 6) - 1;
        pr.bounceGrace = 0.045;
        pr.vx *= 0.97; pr.vy *= 0.97;
        game.particles.push({ type: 'ring', x: pr.x, y: pr.y, r: 2, maxR: 18, t: 0, duration: 0.12, color: pr.color });
        if (pr.bounces < 0) pr.life = 0;
      } else if (bounced && pr.owner !== 'enemy') {
        pr.life = 0;
      }
    }
    game.projectiles = game.projectiles.filter(pj => pj.life > 0);
  }
  function addCameraShake(intensity = 5, duration = 0.2) {
    game.cameraShake.intensity = Math.max(game.cameraShake.intensity || 0, intensity);
    game.cameraShake.time = Math.max(game.cameraShake.time || 0, duration);
  }

  function damagePlayer(raw, sourceX, sourceY, options = {}) {
    const p = game.player;
    if (p.invuln > 0 && !options.ignoreInvuln) return;
    const armor = getDerivedStats().armor;
    const damage = Math.max(1, Math.round(raw * (100 / (100 + armor * 2.1))));
    p.health -= damage;
    if (!options.dot) p.invuln = 0.34;
    const n = normalize(p.x - sourceX, p.y - sourceY);
    if (!options.dot) { p.x += n.x * 16; p.y += n.y * 16; }
    game.particles.push({ type: 'text', x: p.x, y: p.y - 30, text: `-${damage}`, t: 0, duration: 0.7, color: '#ff7766' });
    addCameraShake(Math.min(11, 5 + damage * 0.18), 0.24);
    if (p.health <= 0) handleDeath();
  }

  function handleDeath() {
    if (game.paused) return;
    game.character.deaths += 1;
    const lost = loseInventory(0.7, new Set());
    game.player.health = getDerivedStats().maxHealth;
    game.character.currentHealth = game.player.health;
    enterCamp();
    showModal('Carried Back to Camp', `
      <p>You were found unconscious near the dungeon entrance. Your equipped gear was still on you, but much of your loose inventory was gone.</p>
      <p><strong>Lost:</strong> ${lost.length ? lost.map(i => `${i.qty || 1}× ${escapeHtml(i.name)}`).join(', ') : 'Nothing this time.'}</p>
      <button id="deathClose" class="panel-btn">Recover by the fire</button>
    `, false);
    $('deathClose').addEventListener('click', hideModal);
  }

  function updateDrops(dt) {
    const p = game.player;
    game.lootMagnetTimer = Math.max(0, game.lootMagnetTimer - dt);
    for (const d of game.drops) {
      d.bob = (d.bob || 0) + dt * 3;
      d.pickupDelay = Math.max(0, (d.pickupDelay || 0) - dt);
      if (d.magnet || game.lootMagnetTimer > 0) {
        const n = normalize(p.x - d.x, p.y - d.y);
        const distance = dist(d.x, d.y, p.x, p.y);
        const speed = clamp(500 + distance * 1.5, 500, 1450);
        d.x += n.x * speed * dt;
        d.y += n.y * speed * dt;
      }
      if (d.pickupDelay <= 0 && dist(d.x, d.y, p.x, p.y) < 48) {
        const canStack = d.item.stackable && game.character.inventory.some(i => i.id === d.item.id && i.stackable);
        const hasSpace = canStack || game.character.inventory.length < game.character.inventoryCapacity;
        if (hasSpace && addItem(d.item, true)) {
          d.picked = true;
          toast(`Picked up ${d.item.qty > 1 ? `${d.item.qty}× ` : ''}${d.item.name}.`);
        } else if (d.magnet || game.lootMagnetTimer > 0) {
          d.magnet = false;
          d.pickupDelay = 0.8;
          const away = normalize(d.x - p.x || 1, d.y - p.y);
          d.x = clamp(p.x + away.x * 82, 52, game.roomWorld.w - 52);
          d.y = clamp(p.y + away.y * 82, 52, game.roomWorld.h - 52);
        }
      }
    }
    game.drops = game.drops.filter(d => !d.picked);
    const room = currentRoom();
    if (game.scene === 'dungeon' && room) room.groundDrops = game.drops;
  }
  function updateParticles(dt) {
    for (const p of game.particles) p.t += dt;
    game.particles = game.particles.filter(p => p.t < p.duration);
  }

  function useLootMagnet() {
    if (game.scene !== 'dungeon') { toast('The loot magnet is used inside dungeon rooms.'); return; }
    const available = game.drops.filter(drop => !drop.picked);
    if (!available.length) { toast('There is no loose loot in this room.'); return; }
    for (const drop of available) drop.magnet = true;
    game.lootMagnetTimer = 1.35;
    toast(`Pulling ${available.length} loot drop${available.length === 1 ? '' : 's'}.`);
  }

  function dropInventoryIndex(index) {
    if (game.scene !== 'dungeon') { toast('Items can be dropped while exploring a dungeon.'); return; }
    const item = game.character.inventory[index];
    if (!item) return;
    const p = game.player;
    const side = choose([-1, 1]);
    const perpendicular = { x: -p.facing.y * side, y: p.facing.x * side };
    const direction = normalize(p.facing.x * 0.65 + perpendicular.x * 0.75, p.facing.y * 0.65 + perpendicular.y * 0.75);
    const distanceAway = 155;
    const x = clamp(p.x + direction.x * distanceAway, 72, game.roomWorld.w - 72);
    const y = clamp(p.y + direction.y * distanceAway, 72, game.roomWorld.h - 72);
    game.character.inventory.splice(index, 1);
    spawnDrop(x, y, item, { pickupDelay: 1.35 });
    saveGame();
    toast(`${item.name} dropped a safe distance away.`);
    showInventory();
  }

  function addItemToCollection(collection, capacity, item) {
    if (item.stackable) {
      const existing = collection.find(i => i.id === item.id && i.stackable);
      if (existing) { existing.qty += item.qty || 1; return true; }
    }
    if (collection.length >= capacity) return false;
    collection.push(deepClone(item));
    return true;
  }

  function addItem(item, quiet = false) {
    if (!addItemToCollection(game.character.inventory, game.character.inventoryCapacity, item)) {
      if (!quiet) toast('Inventory full.');
      return false;
    }
    return true;
  }

  function removeItem(id, qty = 1) {
    const inv = game.character.inventory;
    const idx = inv.findIndex(i => i.id === id);
    if (idx < 0) return false;
    const item = inv[idx];
    if ((item.qty || 1) > qty) item.qty -= qty;
    else inv.splice(idx, 1);
    return true;
  }

  function itemCount(id) {
    return game.character.inventory.filter(i => i.id === id).reduce((sum, i) => sum + (i.qty || 1), 0);
  }


  function storedItemCount(id) {
    return (game.character.storage || []).filter(i => i.id === id).reduce((sum, i) => sum + (i.qty || 1), 0);
  }

  function campOwnedItemCount(id) {
    return itemCount(id) + storedItemCount(id);
  }

  function removeItemFromCollection(collection, id, qty = 1) {
    let remaining = qty;
    for (let i = collection.length - 1; i >= 0 && remaining > 0; i--) {
      const item = collection[i];
      if (item.id !== id) continue;
      const amount = item.qty || 1;
      if (amount > remaining) {
        item.qty = amount - remaining;
        remaining = 0;
      } else {
        remaining -= amount;
        collection.splice(i, 1);
      }
    }
    return remaining;
  }

  function removeCampOwnedItem(id, qty = 1) {
    let remaining = removeItemFromCollection(game.character.inventory, id, qty);
    if (remaining > 0) remaining = removeItemFromCollection(game.character.storage || [], id, remaining);
    return remaining === 0;
  }

  function rollRarity(floorLevel = 1) {
    const bonus = Math.min(0.12, floorLevel * 0.004);
    const r = Math.random();
    if (r < 0.008 + bonus * 0.2) return 'legendary';
    if (r < 0.05 + bonus * 0.5) return 'epic';
    if (r < 0.16 + bonus) return 'rare';
    if (r < 0.44 + bonus) return 'uncommon';
    return 'common';
  }

  function makeGear(slot = null, rarity = 'common', level = 1, forcedWeapon = null) {
    slot ||= choose(ITEM_GEAR_SLOTS);
    const rar = RARITIES[rarity];
    const item = {
      id: uid('gear'), type: 'gear', slot, rarity, level,
      name: '', stackable: false, stats: {}, description: '',
    };
    const prefixes = { common: 'Plain', uncommon: 'Sturdy', rare: 'Runed', epic: 'Mythic', legendary: 'Warden’s' };
    if (slot === 'leftHand' || slot === 'rightHand') {
      const weaponType = forcedWeapon || choose(Object.keys(WEAPONS));
      item.weaponType = weaponType;
      item.name = `${prefixes[rarity]} ${WEAPONS[weaponType].name}`;
      item.stats.damage = Math.round((1.5 + level * 0.8) * rar.mult);
    } else {
      item.name = `${prefixes[rarity]} ${SLOT_LABELS[slot]}`;
      item.stats.armor = Math.round((1 + level * 0.5) * rar.mult);
      if (slot === 'chest' || slot === 'legs') item.stats.health = Math.round((4 + level * 1.6) * rar.mult);
    }
    const possible = ['strength', 'defense', 'vitality', 'agility', ...(rar.mods >= 2 ? ['critChance'] : [])];
    for (let i = 0; i < rar.mods; i++) {
      const stat = choose(possible);
      if (stat === 'critChance') item.stats.critChance = (item.stats.critChance || 0) + Number((0.008 + level * 0.0012 * rar.mult).toFixed(3));
      else item.stats[stat] = (item.stats[stat] || 0) + Math.max(1, Math.round((1 + level * 0.16) * rar.mult));
    }
    if (rarity === 'legendary') {
      item.legendaryEffect = choose(['Driving attacks', 'Extended reach', 'Rapid recovery', 'Dungeon fortune']);
      item.description = `Legendary effect: ${item.legendaryEffect}.`;
    }
    return item;
  }

  function gainSkillXp(skillName, amount) {
    const skill = game.character.skills[skillName];
    skill.xp += amount;
    let leveled = false;
    while (skill.xp >= skillXpNeeded(skill.level)) {
      skill.xp -= skillXpNeeded(skill.level);
      skill.level += 1;
      leveled = true;
    }
    if (leveled) toast(`${formatName(skillName)} reached level ${skill.level}.`);
  }

  function handleDoorTransitions() {
    const room = currentRoom();
    if (!room?.cleared) return;
    const p = game.player;
    const w = game.roomWorld.w, h = game.roomWorld.h;
    const doorHalf = 88;
    let dir = null;
    if (p.y <= p.radius + 31 && Math.abs(p.x - w / 2) < doorHalf) dir = 'N';
    else if (p.x >= w - p.radius - 31 && Math.abs(p.y - h / 2) < doorHalf) dir = 'E';
    else if (p.y >= h - p.radius - 31 && Math.abs(p.x - w / 2) < doorHalf) dir = 'S';
    else if (p.x <= p.radius + 31 && Math.abs(p.y - h / 2) < doorHalf) dir = 'W';
    if (dir && room.neighbors[dir]) {
      const opposite = DIRS.find(d => d.key === dir).opposite;
      const nextRoom = currentFloor().rooms[room.neighbors[dir]];
      room.traversedDoors ||= { N:false, E:false, S:false, W:false };
      nextRoom.traversedDoors ||= { N:false, E:false, S:false, W:false };
      room.traversedDoors[dir] = true;
      nextRoom.traversedDoors[opposite] = true;
      enterRoom(room.neighbors[dir], opposite);
    }
  }

  function updateInteractionPrompt() {
    let closest = null;
    const p = game.player;
    if (game.scene === 'camp') {
      const objects = campInteractables();
      for (const obj of objects) {
        const d = dist(p.x, p.y, obj.x, obj.y);
        if (d < obj.range && (!closest || d < closest.distance)) closest = { ...obj, distance: d };
      }
      for (const npc of game.campNpcs) {
        const d = dist(p.x, p.y, npc.x, npc.y);
        if (d < 90 && (!closest || d < closest.distance)) closest = { kind: 'npc', npc, label: `Talk to ${npc.name}`, distance: d };
      }
    } else {
      for (const f of game.roomFeatures) {
        const d = dist(p.x, p.y, f.x, f.y);
        if (d < 110 && (!closest || d < closest.distance)) closest = { kind: 'feature', feature: f, label: featureLabel(f), distance: d };
      }
    }
    game.currentInteractable = closest;
    if (closest) {
      promptEl.textContent = closest.label;
      promptEl.classList.remove('hidden');
      interactBtn.textContent = closest.kind === 'npc' ? 'Talk' : closest.kind === 'feature' ? 'Use' : closest.label.split(' ')[0];
    } else {
      promptEl.classList.add('hidden');
      interactBtn.textContent = 'Use';
    }
  }

  function campInteractables() {
    return [
      { kind: 'dungeon', x: 900, y: 250, range: 120, label: 'Enter dungeon' },
      { kind: 'supplyShop', x: 430, y: 500, range: 130, label: 'Browse supplies' },
      { kind: 'blacksmith', x: 1370, y: 500, range: 130, label: 'Visit blacksmith' },
      { kind: 'storage', x: 700, y: 545, range: 105, label: 'Open storage chest' },
      { kind: 'campfire', x: 900, y: 800, range: 110, label: 'Rest at fire' },
    ];
  }

  function featureLabel(f) {
    if (f.type === 'mining') return f.used ? 'Ore vein depleted' : 'Mine ore';
    if (f.type === 'woodcutting') return f.used ? 'Roots already cut' : 'Cut dungeon roots';
    if (f.type === 'fishing') return f.used ? 'Pool has gone still' : 'Fish underground pool';
    if (f.type === 'smithing') return f.used ? 'Forge cooling' : 'Use smithing station';
    if (f.type === 'puzzle') return f.solved ? 'Mechanism solved' : 'Inspect mechanism';
    if (f.type === 'chest') return f.opened ? 'Empty chest' : 'Open treasure chest';
    if (f.type === 'shrine') return f.used ? 'Faded shrine' : 'Rest at shrine';
    if (f.type === 'escape') return 'Take free escape route';
    if (f.type === 'entranceExit') return 'Climb back to camp';
    if (f.type === 'victoryExit') return 'Return safely to camp';
    return 'Interact';
  }

  function performInteraction() {
    const obj = game.currentInteractable;
    if (!obj) return;
    if (obj.kind === 'dungeon') showFloorSelection();
    else if (obj.kind === 'supplyShop') showSupplyShop();
    else if (obj.kind === 'blacksmith') showBlacksmith();
    else if (obj.kind === 'storage') showStorageChest();
    else if (obj.kind === 'campfire') {
      game.player.health = game.player.maxHealth;
      game.character.currentHealth = game.player.health;
      toast('You rest by the fire and recover fully.');
      saveGame();
    } else if (obj.kind === 'npc') showNpc(obj.npc);
    else if (obj.kind === 'feature') interactFeature(obj.feature);
  }

  function interactFeature(feature) {
    const room = currentRoom();
    if (feature.type === 'mining' || feature.type === 'woodcutting' || feature.type === 'fishing') {
      if (feature.used) { toast('Nothing useful remains here.'); return; }
      feature.used = true;
      room.resourceUsed = true;
      const data = {
        mining: { item: { id: 'iron_ore', name: 'Iron Ore', type: 'material', qty: randInt(3, 7), stackable: true }, xp: 22 },
        woodcutting: { item: { id: 'dungeon_wood', name: 'Dungeon Wood', type: 'material', qty: randInt(3, 7), stackable: true }, xp: 22 },
        fishing: { item: { id: 'cave_fish', name: 'Cave Fish', type: 'material', qty: randInt(2, 5), stackable: true }, xp: 24 },
      }[feature.type];
      addItem(data.item);
      gainSkillXp(feature.type, data.xp + currentFloor().floorNumber * 2);
      toast(`${data.item.qty}× ${data.item.name} gathered.`);
      saveGame();
    } else if (feature.type === 'smithing') {
      if (feature.used) { toast('The forge needs time to cool before another floor run.'); return; }
      if (itemCount('iron_ore') < 3) { toast('Smithing requires 3 Iron Ore.'); return; }
      removeItem('iron_ore', 3);
      feature.used = true; room.smithUsed = true;
      gainSkillXp('smithing', 32 + currentFloor().floorNumber * 3);
      const gear = makeGear(null, rollRarity(currentFloor().floorNumber + 2), currentFloor().floorNumber);
      addItem(gear);
      toast(`You forged ${gear.name}.`);
      saveGame();
    } else if (feature.type === 'puzzle') {
      if (room.puzzleSolved) { toast('The mechanism is already open.'); return; }
      const skill = game.character.skills[room.puzzleSkill];
      if (skill.level >= room.puzzleLevel) {
        room.puzzleSolved = true; room.cleared = true; feature.solved = true;
        gainSkillXp(room.puzzleSkill, 28 + room.puzzleLevel * 4);
        toast(`${formatName(room.puzzleSkill)} solved the level ${room.puzzleLevel} mechanism.`);
      } else {
        toast(`Requires ${formatName(room.puzzleSkill)} ${room.puzzleLevel}. A guardian route has opened instead.`);
        for (let i = 0; i < 4 + currentFloor().floorNumber; i++) spawnEnemy(choose(['skeleton', 'spider', 'slime', 'shadow']));
        room.type = 'combat';
      }
      saveGame();
    } else if (feature.type === 'chest') {
      if (feature.opened) { toast('The chest is empty.'); return; }
      if (!room.cleared) { toast('Defeat the room’s guardians first.'); return; }
      feature.opened = true; room.chestOpened = true;
      const gear = makeGear(null, rollRarity(currentFloor().floorNumber + 3), currentFloor().floorNumber);
      addItem(gear);
      game.character.coins += randInt(20, 50) + currentFloor().floorNumber * 5;
      toast(`Treasure found: ${gear.name}.`);
      saveGame();
    } else if (feature.type === 'shrine') {
      if (feature.used) { toast('The shrine’s light has faded.'); return; }
      feature.used = true; room.restUsed = true;
      game.player.health = Math.min(game.player.maxHealth, game.player.health + game.player.maxHealth * 0.55);
      toast('The shrine restores 55% of your maximum health.');
      saveGame();
    } else if (feature.type === 'escape') {
      safeReturnToCamp('You found a free route back to the surface and kept everything.');
    } else if (feature.type === 'entranceExit') {
      safeReturnToCamp('You backtrack to the dungeon entrance and climb safely to camp with everything you collected.');
    } else if (feature.type === 'victoryExit') {
      safeReturnToCamp('You leave through the boss portal with every item you collected.');
    }
  }

  function showNpc(npc) {
    const accepted = game.character.quests.some(q => q.id === npc.quest.id);
    const count = campOwnedItemCount(npc.quest.itemId);
    const complete = accepted && count >= npc.quest.amount;
    let actions = '';
    if (!accepted) actions = `<button id="acceptQuest" class="panel-btn">Lock in this quest</button>`;
    else if (complete) actions = `<button id="turnInQuest" class="panel-btn">Deliver ${npc.quest.amount} ${escapeHtml(npc.quest.itemName)}</button>`;
    else actions = `<p class="muted">Progress: ${count}/${npc.quest.amount}. ${npc.name} will remain at camp while this quest is active.</p>`;
    showModal(`${npc.name}, ${npc.role}`, `
      <p>“Bring me <strong>${npc.quest.amount} ${escapeHtml(npc.quest.itemName)}</strong>. ${escapeHtml(npc.quest.reason)}”</p>
      <p>Reward: ${npc.quest.rewardCoins} coins and ${npc.quest.rewardXp} character XP.</p>
      ${actions}
    `);
    $('acceptQuest')?.addEventListener('click', () => {
      npc.locked = true;
      game.character.quests.push({ ...npc.quest, npcId: npc.id, npcName: npc.name });
      saveGame(); hideModal(); toast(`${npc.name} will stay at camp until the quest is resolved.`);
    });
    $('turnInQuest')?.addEventListener('click', () => {
      removeCampOwnedItem(npc.quest.itemId, npc.quest.amount);
      game.character.coins += npc.quest.rewardCoins;
      gainXp(npc.quest.rewardXp);
      game.character.completedQuests += 1;
      game.character.quests = game.character.quests.filter(q => q.id !== npc.quest.id);
      const idx = game.character.campNpcs.findIndex(n => n.id === npc.id);
      const replacement = generateCampNpcs()[0];
      replacement.x = npc.x; replacement.y = npc.y;
      game.character.campNpcs.splice(idx, 1, replacement);
      game.campNpcs = game.character.campNpcs;
      saveGame(); hideModal(); toast('Quest completed.');
    });
  }

  function showSupplyShop() {
    const goods = [
      { item: { id: 'healing_potion', name: 'Healing Potion', type: 'consumable', qty: 1, stackable: true, description: 'Restores 45 health.' }, price: 18, level: 1 },
      { item: { id: 'escape_rope', name: 'Escape Rope', type: 'consumable', qty: 1, stackable: true, description: 'Safely leave a dungeon with all inventory.' }, price: 95, level: 1 },
      { item: { id: 'survey_charm', name: 'Cartographer’s Charter', type: 'consumable', qty: 1, stackable: true, rarity: 'rare', description: 'Generates a Medium 40-room floor with +15% monster XP.' }, price: 240, level: 3 },
      { item: { id: 'grand_survey_charm', name: 'Grand Cartographer’s Charter', type: 'consumable', qty: 1, stackable: true, rarity: 'epic', description: 'Generates a Large 60-room floor with +35% monster XP.' }, price: 575, level: 6 },
      { item: { id: 'ancient_survey_seal', name: 'Ancient Survey Seal', type: 'consumable', qty: 1, stackable: true, rarity: 'legendary', description: 'Generates a Huge 100-room floor with +65% monster XP.' }, price: 1200, level: 10 },
    ];
    const saleButtons = RARITY_ORDER.map(rarity => {
      const items = game.character.inventory.filter(item => item.type === 'gear' && (item.rarity || 'common') === rarity);
      const total = items.reduce((sum, item) => sum + sellValue(item), 0);
      return `<button class="panel-btn sell-rarity rarity-button-${rarity}" data-rarity="${rarity}" ${items.length ? '' : 'disabled'}>Sell all ${RARITIES[rarity].name}<br><span class="muted">${items.length} item${items.length === 1 ? '' : 's'} · ${total} coins</span></button>`;
    }).join('');
    showModal('Expedition Supplies', `
      <p>You have <strong>${game.character.coins} coins</strong>.</p>
      <div class="inventory-grid">${goods.map((g, i) => `
        <div class="item-action-wrap"><div class="item-card rarity-${g.item.rarity || 'common'}"><span class="item-icon">${itemIcon(g.item)}</span><h4>${g.item.name}</h4><p>${g.item.description}</p><p>${g.price} coins · Level ${g.level}</p></div><button class="buy-btn buy-good" data-i="${i}">Buy</button></div>`).join('')}</div>
      <div class="section-title">Sell unequipped equipment by rarity</div>
      <p class="muted">Materials, consumables, stored items, and equipped gear are never included.</p>
      <div class="bulk-action-grid">${saleButtons}</div>
      <button id="reviewSales" class="panel-btn wide-action">Review and sell individual equipment</button>
    `);
    modalBody.querySelectorAll('.buy-good').forEach(btn => btn.addEventListener('click', () => {
      const g = goods[Number(btn.dataset.i)];
      if (game.character.level < g.level) { toast(`Requires character level ${g.level}.`); return; }
      if (game.character.coins < g.price) { toast('Not enough coins.'); return; }
      if (!addItem(g.item)) return;
      game.character.coins -= g.price;
      saveGame(); showSupplyShop();
    }));
    modalBody.querySelectorAll('.sell-rarity').forEach(btn => btn.addEventListener('click', () => sellInventoryByRarity(btn.dataset.rarity)));
    $('reviewSales').addEventListener('click', showSellEquipment);
  }

  function showBlacksmith() {
    showModal('Camp Blacksmith', `
      <p>The smith can turn <strong>3 Iron Ore</strong> into a floor-appropriate random equipment item.</p>
      <p>You currently have ${itemCount('iron_ore')} Iron Ore and Smithing level ${game.character.skills.smithing.level}.</p>
      <button id="campSmith" class="panel-btn">Forge equipment</button>
      <div class="section-title">Training weapons</div>
      <div class="menu-grid">
        ${Object.entries(WEAPONS).map(([key, w]) => `<button class="panel-btn buy-weapon" data-weapon="${key}">${w.name}<br><span class="muted">${80 + Object.keys(WEAPONS).indexOf(key) * 35} coins</span></button>`).join('')}
      </div>`);
    $('campSmith').addEventListener('click', () => {
      if (itemCount('iron_ore') < 3) { toast('You need 3 Iron Ore.'); return; }
      removeItem('iron_ore', 3);
      gainSkillXp('smithing', 25);
      const gear = makeGear(null, rollRarity(game.character.maxFloorUnlocked + 1), game.character.maxFloorUnlocked);
      addItem(gear); saveGame(); hideModal(); toast(`Forged ${gear.name}.`);
    });
    modalBody.querySelectorAll('.buy-weapon').forEach(btn => btn.addEventListener('click', () => {
      const key = btn.dataset.weapon;
      const price = 80 + Object.keys(WEAPONS).indexOf(key) * 35;
      if (game.character.coins < price) { toast('Not enough coins.'); return; }
      const gear = makeGear('leftHand', 'common', game.character.level, key);
      if (!addItem(gear)) return;
      game.character.coins -= price; saveGame(); hideModal(); toast(`${gear.name} added to inventory.`);
    }));
  }

  function showFloorSelection(initialFloor = null) {
    const maximumFloor = Math.max(1, game.character.maxFloorUnlocked || 1);
    let selectedFloor = clamp(Number(initialFloor) || Number(game.character.lastFloorSelected) || maximumFloor, 1, maximumFloor);
    let selectedSize = 'Small';

    const surveyCountFor = (size) => size.itemId ? itemCount(size.itemId) : Infinity;
    const sizeBonusLabel = (size) => size.xpMultiplier > 1 ? `+${Math.round((size.xpMultiplier - 1) * 100)}% XP` : 'Normal XP';
    const sizeTokenLabel = (sizeName, count) => {
      if (sizeName === 'Small') return 'FREE';
      if (sizeName === 'Medium') return `CHARM ×${count}`;
      if (sizeName === 'Large') return `CHARTER ×${count}`;
      return `SEAL ×${count}`;
    };

    showModal('Choose Expedition', '<div id="expeditionSelectorRoot"></div>');

    const renderSelector = () => {
      game.character.lastFloorSelected = selectedFloor;
      const root = $('expeditionSelectorRoot');
      if (!root) return;
      const floor = getFloor(selectedFloor);
      const floorTabs = Array.from({ length: maximumFloor }, (_, index) => {
        const number = index + 1;
        const stored = getFloor(number);
        const stateClass = stored?.completed ? 'completed' : stored ? 'active-run' : 'new-floor';
        const marker = stored?.completed ? '✓' : stored ? '•' : '';
        return `<button class="floor-chip ${stateClass} ${number === selectedFloor ? 'selected' : ''}" data-select-floor="${number}" aria-label="Select floor ${number}"><span>${number}</span><small>${marker}</small></button>`;
      }).join('');

      let content = '';
      if (floor) {
        const size = dungeonSizeData(floor.sizeName);
        const discovered = Object.values(floor.rooms).filter(room => room.discovered).length;
        const progress = floor.roomCount ? Math.round(discovered / floor.roomCount * 100) : 0;
        content = `
          <section class="floor-stage-panel existing-floor">
            <div class="floor-door-emblem ${floor.completed ? 'completed' : ''}">
              <span class="floor-door-number">${selectedFloor}</span>
              <span class="floor-door-status">${floor.completed ? 'CLEARED' : 'IN PROGRESS'}</span>
            </div>
            <div class="floor-stage-details">
              <div class="floor-stat-row">
                <span><b>${escapeHtml(floor.sizeName)}</b><small>SIZE</small></span>
                <span><b>${discovered}/${floor.roomCount}</b><small>ROOMS</small></span>
                <span><b>${sizeBonusLabel(size)}</b><small>REWARD</small></span>
                <span><b>Lv ${selectedFloor}</b><small>RECOMMENDED</small></span>
              </div>
              <div class="floor-progress-track"><i style="width:${progress}%"></i></div>
              <button class="expedition-primary enter-floor" data-floor="${selectedFloor}">${floor.completed ? 'ENTER CLEARED FLOOR' : 'RESUME EXPEDITION'}</button>
              <div class="expedition-secondary-actions">
                ${floor.completed ? `<button class="expedition-secondary rerun-floor" data-floor="${selectedFloor}">Rerun Layout</button>` : ''}
                <button class="expedition-secondary danger reset-floor" data-floor="${selectedFloor}">New Layout</button>
              </div>
            </div>
          </section>`;
      } else {
        const cards = Object.entries(DUNGEON_SIZES).map(([name, size], index) => {
          const count = surveyCountFor(size);
          const unavailable = size.itemId && count < 1;
          const diamonds = '◆'.repeat(index + 1);
          return `
            <button class="dungeon-size-card ${selectedSize === name ? 'selected' : ''} ${unavailable ? 'unavailable' : ''}" data-size-choice="${name}" ${unavailable ? 'disabled' : ''}>
              <span class="size-diamonds">${diamonds}</span>
              <strong>${name}</strong>
              <span class="size-room-count">${size.count}<small>ROOMS</small></span>
              <span class="size-xp-bonus">${sizeBonusLabel(size)}</span>
              <span class="size-cost">${sizeTokenLabel(name, Number.isFinite(count) ? count : 0)}</span>
            </button>`;
        }).join('');
        const selected = dungeonSizeData(selectedSize);
        const canBegin = !selected.itemId || surveyCountFor(selected) > 0;
        content = `
          <section class="floor-stage-panel new-expedition">
            <div class="floor-door-emblem unopened">
              <span class="floor-door-number">${selectedFloor}</span>
              <span class="floor-door-status">UNCHARTED</span>
            </div>
            <div class="floor-size-section">
              <div class="dungeon-size-grid">${cards}</div>
              <button class="expedition-primary begin-expedition" data-floor="${selectedFloor}" ${canBegin ? '' : 'disabled'}>BEGIN EXPEDITION</button>
            </div>
          </section>`;
      }

      root.innerHTML = `
        <div class="expedition-menu">
          <div class="floor-carousel">
            <button class="floor-arrow previous-floor" aria-label="Previous floor" ${selectedFloor <= 1 ? 'disabled' : ''}>‹</button>
            <div class="floor-chip-strip">${floorTabs}</div>
            <button class="floor-arrow next-floor" aria-label="Next floor" ${selectedFloor >= maximumFloor ? 'disabled' : ''}>›</button>
          </div>
          ${content}
        </div>`;

      root.querySelectorAll('[data-select-floor]').forEach(button => button.addEventListener('click', () => {
        selectedFloor = Number(button.dataset.selectFloor);
        selectedSize = 'Small';
        renderSelector();
      }));
      root.querySelector('.previous-floor')?.addEventListener('click', () => {
        selectedFloor = Math.max(1, selectedFloor - 1);
        selectedSize = 'Small';
        renderSelector();
      });
      root.querySelector('.next-floor')?.addEventListener('click', () => {
        selectedFloor = Math.min(maximumFloor, selectedFloor + 1);
        selectedSize = 'Small';
        renderSelector();
      });
      root.querySelectorAll('[data-size-choice]').forEach(button => button.addEventListener('click', () => {
        selectedSize = button.dataset.sizeChoice;
        renderSelector();
      }));
      root.querySelector('.enter-floor')?.addEventListener('click', () => {
        hideModal();
        enterDungeon(selectedFloor);
      });
      root.querySelector('.begin-expedition')?.addEventListener('click', () => {
        const size = dungeonSizeData(selectedSize);
        if (size.itemId && itemCount(size.itemId) < 1) { toast('You do not have the required survey item.'); return; }
        if (size.itemId) removeItem(size.itemId, 1);
        hideModal();
        enterDungeon(selectedFloor, { size });
      });
      root.querySelector('.rerun-floor')?.addEventListener('click', () => {
        rerunFloor(selectedFloor);
        hideModal();
        enterDungeon(selectedFloor);
      });
      root.querySelector('.reset-floor')?.addEventListener('click', () => {
        if (!confirm(`Generate an entirely new layout for Floor ${selectedFloor}?`)) return;
        delete game.character.floors[floorKey(selectedFloor)];
        selectedSize = 'Small';
        saveGame();
        renderSelector();
      });

      requestAnimationFrame(() => root.querySelector('.floor-chip.selected')?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }));
    };

    renderSelector();
  }

  function rerunFloor(n) {
    const floor = getFloor(n);
    if (!floor) return;
    for (const room of Object.values(floor.rooms)) {
      room.cleared = room.type === 'start' || room.type === 'escape' || room.type === 'rest';
      room.looted = false;
      if ('resourceUsed' in room) room.resourceUsed = false;
      if ('smithUsed' in room) room.smithUsed = false;
      if ('puzzleSolved' in room) room.puzzleSolved = false;
      if ('chestOpened' in room) room.chestOpened = false;
      if ('restUsed' in room) room.restUsed = false;
      if ('bossDefeated' in room) room.bossDefeated = false;
      room.groundDrops = [];
    }
    floor.currentRoomId = floor.startRoomId;
    floor.completed = false;
    saveGame();
  }

  function handleBossDeath() {
    const room = currentRoom();
    const floor = currentFloor();
    room.bossDefeated = true;
    room.cleared = true;
    floor.completed = true;
    floor.timesCompleted = (floor.timesCompleted || 0) + 1;
    game.character.maxFloorUnlocked = Math.max(game.character.maxFloorUnlocked, floor.floorNumber + 1);
    game.character.totalBosses += 1;
    game.pendingVictory = false;
    if (!game.roomFeatures.some(feature => feature.type === 'victoryExit')) {
      game.roomFeatures.push({ id: uid('feature'), type: 'victoryExit', x: game.roomWorld.w / 2, y: game.roomWorld.h / 2 + 420, used: false });
    }
    saveGame();
    toast(`Floor ${floor.floorNumber} cleared! Collect the boss loot, then use the golden exit portal when ready.`, 4800);
  }

  function safeReturnToCamp(message) {
    const floor = currentFloor();
    if (floor) floor.currentRoomId = game.currentRoomId;
    game.character.currentHealth = game.player.health;
    enterCamp();
    toast(message);
  }

  function showDungeonLeaveMenu() {
    const ropes = itemCount('escape_rope');
    showModal('Leave Dungeon', `
      <div class="choice-list">
        <button id="useRope" class="choice-btn" ${ropes <= 0 ? 'disabled' : ''}><strong>Escape Dungeon</strong>Use an Escape Rope and keep all items. You have ${ropes}.</button>
        <button id="fleeDungeon" class="choice-btn"><strong>Flee Dungeon</strong>Keep equipped gear, secure three inventory slots, and risk losing some unsecured items.</button>
        <button id="stayDungeon" class="choice-btn"><strong>Stay</strong>Continue the expedition, or backtrack to the starting room and climb out through the entrance for free.</button>
      </div>`);
    $('useRope').addEventListener('click', () => {
      if (!removeItem('escape_rope', 1)) return;
      hideModal(); safeReturnToCamp('The Escape Rope carries you safely back with all your items.');
    });
    $('fleeDungeon').addEventListener('click', showFleeSelection);
    $('stayDungeon').addEventListener('click', hideModal);
  }

  function showFleeSelection() {
    const selected = new Set();
    const render = () => {
      modalTitle.textContent = 'Secure Three Inventory Slots';
      modalBody.innerHTML = `
        <p>Your equipped gear is automatically safe. Select up to three inventory slots to protect from loss.</p>
        <div id="secureGrid" class="inventory-grid">${game.character.inventory.map((item, i) => inventoryCardHtml(item, i, selected.has(i))).join('')}</div>
        <div style="height:12px"></div><button id="confirmFlee" class="panel-btn danger">Flee with ${selected.size}/3 slots secured</button>`;
      modalBody.querySelectorAll('.item-card').forEach(card => card.addEventListener('click', () => {
        const i = Number(card.dataset.index);
        if (selected.has(i)) selected.delete(i);
        else if (selected.size < 3) selected.add(i);
        else toast('Only three inventory slots can be secured.');
        render();
      }));
      $('confirmFlee').addEventListener('click', () => {
        const lost = loseInventory(0.45, selected);
        hideModal();
        enterCamp();
        showModal('A Hurried Retreat', `
          <p>You made it back alive. Your equipped gear and secured items remained safe, but in your haste you lost:</p>
          <p><strong>${lost.length ? lost.map(i => `${i.qty || 1}× ${escapeHtml(i.name)}`).join(', ') : 'Nothing—fortune favored you.'}</strong></p>
          <button id="fleeClose" class="panel-btn">Return to camp</button>
        `, false);
        $('fleeClose').addEventListener('click', hideModal);
      });
    };
    render();
  }

  function loseInventory(lossChance, securedIndices) {
    const original = game.character.inventory;
    const kept = [], lost = [];
    original.forEach((item, index) => {
      if (securedIndices.has(index) || !chance(lossChance)) kept.push(item);
      else lost.push(item);
    });
    game.character.inventory = kept;
    saveGame();
    return lost;
  }

  function usePotion() {
    if (!removeItem('healing_potion', 1)) { toast('No healing potions.'); return; }
    const before = game.player.health;
    game.player.health = Math.min(game.player.maxHealth, game.player.health + 45);
    toast(`Recovered ${Math.round(game.player.health - before)} health.`);
    saveGame();
  }

  function showMainMenu() {
    const dungeonActions = game.scene === 'dungeon' ? `<button id="leaveBtn" class="panel-btn danger">Leave Dungeon</button>` : '';
    showModal('Game Menu', `<div class="menu-grid">
      <button id="inventoryBtn" class="panel-btn">Inventory & Equipment</button>
      <button id="statsBtn" class="panel-btn">Character & Skills</button>
      <button id="questsBtn" class="panel-btn">Quest Log</button>
      <button id="settingsBtn" class="panel-btn">Settings</button>
      ${dungeonActions}
      <button id="saveBtn" class="panel-btn">Save Game</button>
      <button id="titleBtn" class="panel-btn">Save & Return to Title</button>
    </div>`);
    $('inventoryBtn').addEventListener('click', showInventory);
    $('statsBtn').addEventListener('click', showStats);
    $('questsBtn').addEventListener('click', showQuests);
    $('settingsBtn').addEventListener('click', showSettings);
    $('leaveBtn')?.addEventListener('click', showDungeonLeaveMenu);
    $('saveBtn').addEventListener('click', () => { saveGame(true); hideModal(); });
    $('titleBtn').addEventListener('click', returnToTitle);
  }

  function showStorageChest() {
    const c = game.character;
    c.storage ||= [];
    c.storageCapacity ||= 120;
    showModal('Camp Storage Chest', `
      <p>Stored items are safe, do not use carried slots, and stored quest materials count when turning in camp quests.</p>
      <div class="storage-summary"><span>Carried <b>${c.inventory.length}/${c.inventoryCapacity}</b></span><span>Stored <b>${c.storage.length}/${c.storageCapacity}</b></span></div>
      <div class="bulk-action-grid storage-bulk-actions">
        <button id="depositMaterials" class="panel-btn">Deposit all materials & quest items<br><span class="muted">Monster drops, ore, wood, fish, and future quest items</span></button>
      </div>
      <div class="storage-columns">
        <section><div class="section-title">Carried inventory</div>${renderCollectionGroups(c.inventory, 'deposit')}</section>
        <section><div class="section-title">Safe storage</div>${renderCollectionGroups(c.storage, 'withdraw')}</section>
      </div>
    `);
    $('depositMaterials').addEventListener('click', depositAllMaterialsAndQuestItems);
    modalBody.querySelectorAll('.deposit-item').forEach(btn => btn.addEventListener('click', () => depositInventoryIndex(Number(btn.dataset.i))));
    modalBody.querySelectorAll('.withdraw-item').forEach(btn => btn.addEventListener('click', () => withdrawStorageIndex(Number(btn.dataset.i))));
  }

  function depositInventoryIndex(index) {
    const c = game.character;
    const item = c.inventory[index];
    if (!item) return;
    if (!addItemToCollection(c.storage, c.storageCapacity, item)) { toast('Storage chest is full.'); return; }
    c.inventory.splice(index, 1);
    saveGame();
    showStorageChest();
  }

  function withdrawStorageIndex(index) {
    const c = game.character;
    const item = c.storage[index];
    if (!item) return;
    if (!addItemToCollection(c.inventory, c.inventoryCapacity, item)) { toast('Inventory full.'); return; }
    c.storage.splice(index, 1);
    saveGame();
    showStorageChest();
  }

  function depositAllMaterialsAndQuestItems() {
    const c = game.character;
    let movedStacks = 0;
    let movedUnits = 0;
    for (let i = c.inventory.length - 1; i >= 0; i--) {
      const item = c.inventory[i];
      if (!isMaterialOrQuestItem(item)) continue;
      if (!addItemToCollection(c.storage, c.storageCapacity, item)) continue;
      movedStacks += 1;
      movedUnits += item.qty || 1;
      c.inventory.splice(i, 1);
    }
    if (!movedStacks) { toast('No materials or quest items could be deposited.'); return; }
    saveGame();
    toast(`Stored ${movedUnits} item${movedUnits === 1 ? '' : 's'} across ${movedStacks} stack${movedStacks === 1 ? '' : 's'}.`);
    showStorageChest();
  }

  function equipmentSlotHtml(slot) {
    const item = game.character.equipment[slot];
    return `<div class="equip-slot paper-slot slot-${slot} rarity-${item?.rarity || 'common'}" data-slot="${slot}">
      <div class="equip-slot-heading"><span class="item-icon small-icon">${itemIcon(item || { type: 'gear', slot })}</span><b>${SLOT_LABELS[slot]}</b></div>
      ${item ? `<strong>${escapeHtml(item.name)}</strong><span class="slot-power">Power ${Math.round(gearStrength(item))}</span><span class="muted slot-stats">${statsText(item.stats)}</span><button class="buy-btn unequip" data-slot="${slot}">Unequip</button>` : '<span class="muted empty-slot">Empty</span>'}
    </div>`;
  }

  function showInventory() {
    const c = game.character;
    const paperSlots = EQUIPMENT_SLOTS.map(equipmentSlotHtml).join('');
    showModal('Inventory & Equipment', `
      <p>${c.inventory.length}/${c.inventoryCapacity} slots · ${c.coins} coins</p>
      <div class="section-title">Equipped</div>
      <div class="paper-doll-shell">
        <div class="paper-doll-silhouette" aria-hidden="true"><span class="sil-head"></span><span class="sil-body"></span><span class="sil-arm left"></span><span class="sil-arm right"></span><span class="sil-leg left"></span><span class="sil-leg right"></span></div>
        <div class="paper-doll-grid">${paperSlots}</div>
      </div>
      <p class="muted paper-doll-note">Rings fill an empty ring slot first. If both ring slots are occupied, equipping another ring replaces the weaker one.</p>
      <div class="section-title">Carried inventory · automatically sorted</div>
      <p class="muted">Equipment is grouped by slot and ordered strongest to weakest. Materials, quest items, and consumables stay in their own sections.</p>
      ${renderCollectionGroups(c.inventory, 'equip')}
    `);
    modalBody.querySelectorAll('.equip-item').forEach(btn => btn.addEventListener('click', () => equipInventoryIndex(Number(btn.dataset.i))));
    modalBody.querySelectorAll('.unequip').forEach(btn => btn.addEventListener('click', () => unequipSlot(btn.dataset.slot)));
    modalBody.querySelectorAll('.drop-item').forEach(btn => btn.addEventListener('click', () => dropInventoryIndex(Number(btn.dataset.i))));
  }

  function inventoryCardHtml(item, index, selected = false) {
    const rarity = item.rarity || 'common';
    const gearLine = item.type === 'gear' ? `${RARITIES[rarity].name} ${SLOT_LABELS[item.slot] || gearGroupLabel(item)} · Power ${Math.round(gearStrength(item))}` : itemCategoryLabel(item);
    return `<div class="item-card rarity-${rarity}${selected ? ' selected' : ''}" data-index="${index}">
      <span class="qty">${item.qty > 1 ? `×${item.qty}` : ''}</span>
      <div class="item-card-title"><span class="item-icon">${itemIcon(item)}</span><h4>${escapeHtml(item.name)}</h4></div>
      <p>${gearLine}</p>
      ${item.stats ? `<p>${statsText(item.stats)}</p>` : ''}${item.description ? `<p>${escapeHtml(item.description)}</p>` : ''}
    </div>`;
  }

  function equipmentDestinationFor(item) {
    if (item.slot !== 'ring') return item.slot;
    const eq = game.character.equipment;
    if (!eq.ringLeft) return 'ringLeft';
    if (!eq.ringRight) return 'ringRight';
    return gearStrength(eq.ringLeft) <= gearStrength(eq.ringRight) ? 'ringLeft' : 'ringRight';
  }

  function equipInventoryIndex(index) {
    const c = game.character;
    const item = c.inventory[index];
    if (!item || item.type !== 'gear') return;
    const slot = equipmentDestinationFor(item);
    if (!EQUIPMENT_SLOTS.includes(slot)) { toast('That item does not have a valid equipment slot.'); return; }
    const old = c.equipment[slot];
    c.equipment[slot] = item;
    if (old) c.inventory[index] = old;
    else c.inventory.splice(index, 1);
    refreshDerivedHealth();
    saveGame();
    toast(old ? `${item.name} equipped in ${SLOT_LABELS[slot]}, replacing ${old.name}.` : `${item.name} equipped in ${SLOT_LABELS[slot]}.`);
    showInventory();
  }

  function unequipSlot(slot) {
    const item = game.character.equipment[slot];
    if (!item) return;
    if (game.character.inventory.length >= game.character.inventoryCapacity) { toast('Inventory full.'); return; }
    game.character.inventory.push(item);
    game.character.equipment[slot] = null;
    refreshDerivedHealth();
    saveGame(); showInventory();
  }

  function refreshDerivedHealth() {
    if (!game.player) return;
    game.player.maxHealth = getDerivedStats().maxHealth;
    game.player.health = Math.min(game.player.health, game.player.maxHealth);
  }

  function showSellEquipment() {
    const gear = indexedItems(game.character.inventory).filter(entry => entry.item.type === 'gear').sort((a, b) => compareItems(a.item, b.item));
    showModal('Sell Equipment', `
      <p>You have <strong>${game.character.coins} coins</strong>. Only unequipped carried equipment appears here.</p>
      <button id="backToShop" class="panel-btn wide-action">Back to supplies</button>
      ${gear.length ? `<div class="section-title">Individual equipment</div><div class="inventory-grid">${gear.map(({ item, index }) => `<div class="item-action-wrap">${inventoryCardHtml(item, index)}<button class="buy-btn sell-item" data-i="${index}">Sell for ${sellValue(item)} coins</button></div>`).join('')}</div>` : '<p class="muted">You have no unequipped equipment to sell.</p>'}
    `);
    $('backToShop').addEventListener('click', showSupplyShop);
    modalBody.querySelectorAll('.sell-item').forEach(btn => btn.addEventListener('click', () => sellInventoryIndex(Number(btn.dataset.i))));
  }

  function sellInventoryIndex(index) {
    const item = game.character.inventory[index];
    if (!item || item.type !== 'gear') return;
    const value = sellValue(item);
    game.character.inventory.splice(index, 1);
    game.character.coins += value;
    saveGame();
    toast(`Sold ${item.name} for ${value} coins.`);
    showSellEquipment();
  }

  function sellInventoryByRarity(rarity) {
    const items = game.character.inventory.filter(item => item.type === 'gear' && (item.rarity || 'common') === rarity);
    if (!items.length) { toast(`No ${RARITIES[rarity]?.name || rarity} equipment to sell.`); return; }
    if (RARITY_ORDER.indexOf(rarity) >= RARITY_ORDER.indexOf('rare') && !confirm(`Sell all ${items.length} unequipped ${RARITIES[rarity].name} equipment items?`)) return;
    const value = items.reduce((sum, item) => sum + sellValue(item), 0);
    game.character.inventory = game.character.inventory.filter(item => !(item.type === 'gear' && (item.rarity || 'common') === rarity));
    game.character.coins += value;
    saveGame();
    toast(`Sold ${items.length} ${RARITIES[rarity].name} item${items.length === 1 ? '' : 's'} for ${value} coins.`);
    showSupplyShop();
  }

  function showStats() {
    const c = game.character;
    const d = getDerivedStats();
    showModal(`${c.name} · Level ${c.level}`, `
      <div class="stat-grid">
        <div class="stat-card"><span>Strength</span><b>${d.strength}</b></div>
        <div class="stat-card"><span>Defense</span><b>${d.defense}</b></div>
        <div class="stat-card"><span>Vitality</span><b>${d.vitality}</b></div>
        <div class="stat-card"><span>Agility</span><b>${d.agility}</b></div>
        <div class="stat-card"><span>Max Health</span><b>${Math.round(d.maxHealth)}</b></div>
        <div class="stat-card"><span>Armor</span><b>${Math.round(d.armor)}</b></div>
        <div class="stat-card"><span>Critical Chance</span><b>${Math.round(d.critChance * 1000) / 10}%</b></div>
        <div class="stat-card"><span>Critical Damage</span><b>${Math.round(d.critDamage * 100)}%</b></div>
      </div>
      <div class="section-title">Use-based skills</div>
      <div class="stat-grid">${Object.entries(c.skills).map(([key, s]) => `<div class="stat-card"><span>${formatName(key)}</span><b>Level ${s.level}</b><small>${s.xp}/${skillXpNeeded(s.level)} XP</small></div>`).join('')}</div>
      <div class="section-title">Combat abilities</div>
      <p>Double Strike ${c.abilities.doubleStrike ? 'Active' : 'Not learned'} · Arc +${c.abilities.arcBoost * 9}° · Reach +${c.abilities.reachBoost * 9}% · Attack speed +${c.abilities.attackSpeed * 6}% · Knockback +${c.abilities.knockback * 12}%</p>
    `);
  }

  function showQuests() {
    const quests = game.character.quests;
    showModal('Quest Log', quests.length ? quests.map(q => `<div class="quest-card"><h3>${escapeHtml(q.npcName)}’s request</h3><p>Bring ${q.amount} ${escapeHtml(q.itemName)}.</p><p>Progress: ${campOwnedItemCount(q.itemId)}/${q.amount} · Reward: ${q.rewardCoins} coins, ${q.rewardXp} XP</p></div>`).join('') : '<p class="muted">No active quests. Speak to wandering visitors around the campsite.</p>');
  }

  function showSettings() {
    const s = game.character.settings;
    showModal('Settings', `
      <div class="section-title">Action button side</div>
      <div class="menu-grid"><button class="panel-btn hand-choice" data-value="standard">Actions right</button><button class="panel-btn hand-choice" data-value="reversed">Actions left</button></div>
      <div class="section-title">Thumbstick</div>
      <div class="menu-grid"><button class="panel-btn stick-choice" data-value="fixed">Visible home position</button><button class="panel-btn stick-choice" data-value="floating">Floating only</button></div>
      <p class="muted">Current: action buttons ${s.handedness === 'reversed' ? 'left' : 'right'}, ${s.joystick || 'fixed'} thumbsticks. Left is always MOVE. Right is MOVE while safe and switches to AIM when enemies or hostile projectiles are active.</p>
    `);
    modalBody.querySelectorAll('.hand-choice').forEach(btn => btn.addEventListener('click', () => {
      s.handedness = btn.dataset.value; applyControlSettings(); saveGame(); showSettings();
    }));
    modalBody.querySelectorAll('.stick-choice').forEach(btn => btn.addEventListener('click', () => {
      s.joystick = btn.dataset.value; applyControlSettings(); saveGame(); showSettings();
    }));
  }

  function doorWasTraversed(room, dirKey) {
    const neighborId = room?.neighbors?.[dirKey];
    if (!neighborId) return false;
    if (room.traversedDoors && Object.prototype.hasOwnProperty.call(room.traversedDoors, dirKey)) {
      return !!room.traversedDoors[dirKey];
    }
    // Older saves did not record individual door passages. Treat a discovered neighbor as previously used.
    return !!currentFloor()?.rooms?.[neighborId]?.discovered;
  }

  function showMap() {
    if (game.scene !== 'dungeon') { toast('The dungeon map is available inside a floor.'); return; }
    const floor = currentFloor();
    const rooms = Object.values(floor.rooms);
    const discoveredRooms = rooms.filter(room => room.discovered);
    const roomById = new Map(rooms.map(room => [room.id, room]));
    const halfW = 32;
    const halfH = 18;
    const stepX = 52;
    const stepY = 31;
    const padding = 70;
    const rawPosition = room => ({ x: (room.gx - room.gy) * stepX, y: (room.gx + room.gy) * stepY });
    const rawPositions = discoveredRooms.map(rawPosition);
    const minRawX = Math.min(...rawPositions.map(point => point.x));
    const maxRawX = Math.max(...rawPositions.map(point => point.x));
    const minRawY = Math.min(...rawPositions.map(point => point.y));
    const maxRawY = Math.max(...rawPositions.map(point => point.y));
    const width = Math.max(340, Math.ceil(maxRawX - minRawX + padding * 2));
    const height = Math.max(300, Math.ceil(maxRawY - minRawY + padding * 2));
    const position = room => {
      const raw = rawPosition(room);
      return { x: raw.x - minRawX + padding, y: raw.y - minRawY + padding };
    };
    const directionVector = {
      N: { x: 1, y: -1 }, E: { x: 1, y: 1 }, S: { x: -1, y: 1 }, W: { x: -1, y: -1 },
    };
    const doorPoint = (center, dirKey) => {
      if (dirKey === 'N') return { x: center.x + halfW / 2, y: center.y - halfH / 2 };
      if (dirKey === 'E') return { x: center.x + halfW / 2, y: center.y + halfH / 2 };
      if (dirKey === 'S') return { x: center.x - halfW / 2, y: center.y + halfH / 2 };
      return { x: center.x - halfW / 2, y: center.y - halfH / 2 };
    };
    const doorLine = (point, dirKey) => {
      const tangent = (dirKey === 'N' || dirKey === 'S') ? { x: 0.86, y: 0.5 } : { x: -0.86, y: 0.5 };
      const length = 8;
      return {
        x1: point.x - tangent.x * length, y1: point.y - tangent.y * length,
        x2: point.x + tangent.x * length, y2: point.y + tangent.y * length,
      };
    };

    const uncheckedEdges = new Set();
    const connections = [];
    const doorMarks = [];
    const roomMarkup = [];

    for (const room of discoveredRooms) {
      const center = position(room);
      let hasUncheckedDoor = false;
      for (const dir of DIRS) {
        const neighborId = room.neighbors[dir.key];
        if (!neighborId) continue;
        const neighbor = roomById.get(neighborId);
        const traversed = doorWasTraversed(room, dir.key) || (neighbor ? doorWasTraversed(neighbor, dir.opposite) : false);
        if (!traversed) {
          hasUncheckedDoor = true;
          uncheckedEdges.add([room.id, neighborId].sort().join('|'));
        }
        const status = traversed ? 'known' : 'unexplored';
        const point = doorPoint(center, dir.key);
        const segment = doorLine(point, dir.key);
        doorMarks.push(`<line class="iso-map-door ${status}" x1="${segment.x1}" y1="${segment.y1}" x2="${segment.x2}" y2="${segment.y2}"></line>`);

        if (neighbor?.discovered) {
          if (String(room.id) < String(neighbor.id)) {
            const neighborPoint = doorPoint(position(neighbor), dir.opposite);
            connections.push(`<line class="iso-map-connection ${status}" x1="${point.x}" y1="${point.y}" x2="${neighborPoint.x}" y2="${neighborPoint.y}"></line>`);
          }
        } else {
          const vector = directionVector[dir.key];
          connections.push(`<line class="iso-map-connection iso-map-stub ${status}" x1="${point.x}" y1="${point.y}" x2="${point.x + vector.x * 19}" y2="${point.y + vector.y * 12}"></line>`);
        }
      }

      const classes = ['iso-map-room'];
      if (room.cleared) classes.push('cleared');
      if (room.id === game.currentRoomId) classes.push('current');
      if (room.type === 'boss') classes.push('boss');
      if (room.type === 'escape') classes.push('escape');
      if (hasUncheckedDoor) classes.push('frontier');
      const mark = room.type === 'start' ? 'S' : room.type === 'boss' ? 'B' : room.type === 'escape' ? 'E' : room.type === 'gathering' ? 'G' : room.type === 'rest' ? 'R' : '';
      const points = `${center.x},${center.y-halfH} ${center.x+halfW},${center.y} ${center.x},${center.y+halfH} ${center.x-halfW},${center.y}`;
      roomMarkup.push(`
        <g class="${classes.join(' ')}" ${room.id === game.currentRoomId ? 'data-current-room="true"' : ''}>
          <title>${escapeHtml(room.type)} room${hasUncheckedDoor ? ' · unchecked door' : ''}</title>
          ${room.id === game.currentRoomId ? `<ellipse class="iso-current-pulse" cx="${center.x}" cy="${center.y}" rx="${halfW+9}" ry="${halfH+7}"></ellipse>` : ''}
          <polygon points="${points}"></polygon>
          ${mark ? `<text x="${center.x}" y="${center.y+4}">${mark}</text>` : ''}
        </g>`);
    }

    showModal(`Floor ${floor.floorNumber} Isometric Map`, `
      <p>${floor.sizeName} floor · ${discoveredRooms.length}/${floor.roomCount} rooms discovered · <strong>${uncheckedEdges.size}</strong> unchecked door${uncheckedEdges.size === 1 ? '' : 's'}.</p>
      <div class="iso-map-compass" aria-label="Isometric door directions"><strong>Door directions:</strong><span>W ↖</span><span>N ↗</span><span>S ↙</span><span>E ↘</span></div>
      <div class="map-legend"><span><i class="legend-door unexplored"></i> Unchecked route</span><span><i class="legend-door known"></i> Traversed route</span><span class="legend-current">Current room</span></div>
      <div class="map-scroll"><div class="iso-map-stage"><svg class="iso-map-svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Isometric dungeon floor map">${connections.join('')}${roomMarkup.join('')}${doorMarks.join('')}</svg></div></div>
      <p class="muted">The diamond directions now match the room view: N is upper-right, E is lower-right, S is lower-left, and W is upper-left. S = dungeon entrance and guaranteed retreat, E = bonus free escape, B = boss, G = gathering, R = rest.</p>
    `);

    requestAnimationFrame(() => {
      const scroll = modalBody.querySelector('.map-scroll');
      const current = modalBody.querySelector('[data-current-room="true"] polygon');
      if (!scroll || !current) return;
      const scrollRect = scroll.getBoundingClientRect();
      const currentRect = current.getBoundingClientRect();
      scroll.scrollLeft += currentRect.left - scrollRect.left - scroll.clientWidth / 2 + currentRect.width / 2;
      scroll.scrollTop += currentRect.top - scrollRect.top - scroll.clientHeight / 2 + currentRect.height / 2;
    });
  }

  function returnToTitle() {
    saveGame();
    hideModal();
    game.running = false;
    game.character = null;
    game.slot = null;
    hud.classList.add('hidden');
    touchControls.classList.add('hidden');
    startScreen.classList.remove('hidden');
    renderSaveSlots();
  }

  function showModal(title, html, closable = true) {
    modalTitle.textContent = title;
    modalBody.innerHTML = html;
    modalClose.style.visibility = closable ? 'visible' : 'hidden';
    modalBackdrop.classList.remove('hidden');
    game.paused = true;
  }
  function hideModal() {
    modalBackdrop.classList.add('hidden');
    game.paused = false;
  }

  function toast(message, duration = 2100) {
    toastEl.textContent = message;
    toastEl.classList.remove('hidden');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toastEl.classList.add('hidden'), duration);
  }

  function applyControlSettings() {
    if (!game.character) return;
    const reversed = game.character.settings.handedness === 'reversed';
    touchControls.classList.toggle('reversed-controls', reversed);
    touchControls.classList.toggle('standard-controls', !reversed);
    touchControls.classList.toggle('floating-controls', game.character.settings.joystick === 'floating');
    if (!game.joystick.first.active && !game.joystick.second.active) resetJoystickVisual();
  }

  function resetStickVisual(base, knob) {
    base.classList.remove('move-role', 'aim-role');
    base.style.left = '';
    base.style.right = '';
    base.style.top = '';
    base.style.bottom = '';
    base.style.transform = '';
    knob.style.left = '50%';
    knob.style.top = '50%';
  }

  function resetJoystickVisual() {
    resetStickVisual(joystickBase, joystickKnob);
    resetStickVisual(secondaryJoystickBase, secondaryJoystickKnob);
    joystickLabel.textContent = 'MOVE';
    secondaryJoystickLabel.textContent = isAutoAttackThreatActive() ? 'AIM' : 'MOVE';
    touchControls.classList.remove('twin-stick-active', 'move-stick-active', 'aim-stick-active', 'secondary-stick-active', 'joystick-active');
    setStickRoleVisual('first', 'move');
    setStickRoleVisual('second', isAutoAttackThreatActive() ? 'aim' : 'move');
  }

  function stickParts(slot) {
    return slot === 'first'
      ? { state: game.joystick.first, base: joystickBase, knob: joystickKnob, label: joystickLabel }
      : { state: game.joystick.second, base: secondaryJoystickBase, knob: secondaryJoystickKnob, label: secondaryJoystickLabel };
  }

  function placeStickAt(base, clientX, clientY) {
    const baseSize = base.offsetWidth || 126;
    const margin = 6;
    const x = clamp(clientX - baseSize / 2, margin, window.innerWidth - baseSize - margin);
    const y = clamp(clientY - baseSize / 2, margin, window.innerHeight - baseSize - margin);
    base.style.left = `${x}px`;
    base.style.right = 'auto';
    base.style.top = `${y}px`;
    base.style.bottom = 'auto';
    base.style.transform = 'none';
  }

  function twinStickRoles() {
    const entries = ['first', 'second'].filter(slot => game.joystick[slot].active);
    if (entries.length < 2) return null;
    const move = entries.find(slot => game.joystick[slot].role === 'move') || null;
    const aim = entries.find(slot => game.joystick[slot].role === 'aim') || null;
    return { move, aim };
  }

  function setStickRoleVisual(slot, role) {
    const { base, label } = stickParts(slot);
    base.classList.toggle('move-role', role === 'move');
    base.classList.toggle('aim-role', role === 'aim');
    label.textContent = role === 'move' ? 'MOVE' : 'AIM';
  }

  function syncTouchControlRoles() {
    const first = game.joystick.first;
    const second = game.joystick.second;
    const moveState = first.active && first.role === 'move' ? first : second.active && second.role === 'move' ? second : null;
    const aimState = first.active && first.role === 'aim' ? first : second.active && second.role === 'aim' ? second : null;
    const activeCount = Number(first.active) + Number(second.active);
    touchControls.classList.toggle('twin-stick-active', activeCount > 1);
    touchControls.classList.toggle('move-stick-active', !!moveState);
    touchControls.classList.toggle('aim-stick-active', !!aimState);
    touchControls.classList.toggle('secondary-stick-active', second.active);
    touchControls.classList.toggle('joystick-active', activeCount > 0);

    game.input.x = moveState ? moveState.vectorX : 0;
    game.input.y = moveState ? moveState.vectorY : 0;
    game.input.aimX = aimState ? aimState.vectorX : 0;
    game.input.aimY = aimState ? aimState.vectorY : 0;
    game.input.aimMode = !!aimState;
    setStickRoleVisual('first', first.role || 'move');
    setStickRoleVisual('second', second.role || (isAutoAttackThreatActive() ? 'aim' : 'move'));
  }

  function setStickFromPointer(slot, clientX, clientY, isStart = false) {
    const { state, base, knob } = stickParts(slot);
    if (isStart) placeStickAt(base, clientX, clientY);
    const rect = base.getBoundingClientRect();
    state.originX = rect.left + rect.width / 2;
    state.originY = rect.top + rect.height / 2;
    const dx = clientX - state.originX;
    const dy = clientY - state.originY;
    const max = Math.max(38, rect.width * 0.43);
    const n = normalize(dx, dy);
    const distance = Math.hypot(dx, dy);
    const rawMagnitude = clamp(distance / max, 0, 1);
    const deadzone = state.role === 'aim' ? 0.08 : 0.24;
    const outputMagnitude = rawMagnitude <= deadzone ? 0 : (rawMagnitude - deadzone) / (1 - deadzone);
    const mag = Math.min(max, distance);
    knob.style.left = `calc(50% + ${n.x * mag}px)`;
    knob.style.top = `calc(50% + ${n.y * mag}px)`;
    state.vectorX = n.x * outputMagnitude;
    state.vectorY = n.y * outputMagnitude;
    syncTouchControlRoles();
  }

  function clearStick(slot) {
    const { state, base, knob } = stickParts(slot);
    state.pointerId = null;
    state.active = false;
    state.role = null;
    state.originX = 0;
    state.originY = 0;
    state.vectorX = 0;
    state.vectorY = 0;
    state.startX = 0;
    state.startY = 0;
    state.lastX = 0;
    state.lastY = 0;
    state.startTime = 0;
    state.maxDistance = 0;
    resetStickVisual(base, knob);
  }

  function registerAimFlick(direction) {
    const now = performance.now();
    const last = game.aimFlick || { time: 0, x: 0, y: 0 };
    const dot = direction.x * last.x + direction.y * last.y;
    if (now - last.time <= DODGE.doubleFlickMs && dot > 0.35) {
      game.aimFlick = { time: 0, x: 0, y: 0 };
      const worldDodge = screenVectorToWorld(direction.x, direction.y);
      attemptDodge(worldDodge.x, worldDodge.y);
      return true;
    }
    game.aimFlick = { time: now, x: direction.x, y: direction.y };
    return false;
  }

  function bindControls() {
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 120));
    window.addEventListener('beforeunload', () => saveGame());

    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      game.input.keys.add(key);
      if (['arrowup','arrowdown','arrowleft','arrowright',' '].includes(key)) e.preventDefault();
      if (e.repeat) return;
      if (key === ' ') requestAttack();
      if (key === 'e') game.input.interactQueued = true;
      if (key === 'q') toggleAutoAttack();
      if (key === 'i') showInventory();
      if (key === 'm') showMap();
      if (key === 'escape' && game.running) modalBackdrop.classList.contains('hidden') ? showMainMenu() : hideModal();
    });
    window.addEventListener('keyup', (e) => game.input.keys.delete(e.key.toLowerCase()));

    const beginJoy = (clientX, clientY, pointerId = 'touch') => {
      if (!game.running || game.paused) return false;
      // Left is always movement. Right becomes aim only while danger is active;
      // in safe areas it remains available as a one-thumb movement stick.
      const slot = clientX < window.innerWidth / 2 ? 'first' : 'second';
      const state = game.joystick[slot];
      if (state.active) return false;
      state.pointerId = pointerId;
      state.active = true;
      state.role = slot === 'first' ? 'move' : (isAutoAttackThreatActive() ? 'aim' : 'move');
      state.vectorX = 0;
      state.vectorY = 0;
      state.startX = clientX;
      state.startY = clientY;
      state.lastX = clientX;
      state.lastY = clientY;
      state.startTime = performance.now();
      state.maxDistance = 0;
      setStickFromPointer(slot, clientX, clientY, true);
      return true;
    };

    const findStickSlot = (pointerId) => {
      if (game.joystick.first.active && game.joystick.first.pointerId === pointerId) return 'first';
      if (game.joystick.second.active && game.joystick.second.pointerId === pointerId) return 'second';
      return null;
    };

    const moveJoy = (clientX, clientY, pointerId = 'touch') => {
      const slot = findStickSlot(pointerId);
      if (!slot) return;
      const state = game.joystick[slot];
      state.lastX = clientX;
      state.lastY = clientY;
      state.maxDistance = Math.max(state.maxDistance, Math.hypot(clientX - state.startX, clientY - state.startY));
      setStickFromPointer(slot, clientX, clientY);
    };

    const endJoy = (pointerId = 'touch', clientX = null, clientY = null) => {
      const slot = findStickSlot(pointerId);
      if (!slot) return;
      const state = game.joystick[slot];
      if (Number.isFinite(clientX) && Number.isFinite(clientY)) {
        state.lastX = clientX;
        state.lastY = clientY;
        state.maxDistance = Math.max(state.maxDistance, Math.hypot(clientX - state.startX, clientY - state.startY));
        setStickFromPointer(slot, clientX, clientY);
      }
      const elapsed = performance.now() - state.startTime;
      const swipeX = state.lastX - state.startX;
      const swipeY = state.lastY - state.startY;
      const swipeDistance = Math.max(state.maxDistance, Math.hypot(swipeX, swipeY));
      const qualifiesAsFlick = elapsed <= DODGE.maxGestureMs && swipeDistance >= DODGE.minSwipe;
      const releasedRole = state.role;
      const shouldDodge = releasedRole === 'move' && qualifiesAsFlick;
      const shouldRegisterAimFlick = releasedRole === 'aim' && qualifiesAsFlick;
      const dodgeDir = Math.hypot(state.vectorX, state.vectorY) > 0.25 ? { x: state.vectorX, y: state.vectorY } : normalize(swipeX, swipeY);
      clearStick(slot);
      syncTouchControlRoles();
      if (shouldDodge) {
        const worldDodge = screenVectorToWorld(dodgeDir.x, dodgeDir.y);
        attemptDodge(worldDodge.x, worldDodge.y);
      } else if (shouldRegisterAimFlick) {
        registerAimFlick(dodgeDir);
      }
      if (!game.joystick.first.active && !game.joystick.second.active) resetJoystickVisual();
    };

    if ('PointerEvent' in window) {
      canvas.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        e.preventDefault();
        const mb = game.minimapBounds;
        if (game.scene === 'dungeon' && mb && e.clientX >= mb.x && e.clientX <= mb.x + mb.w && e.clientY >= mb.y && e.clientY <= mb.y + mb.h) {
          game.minimapPointerId = e.pointerId;
          return;
        }
        if (beginJoy(e.clientX, e.clientY, e.pointerId)) {
          try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
        }
      });
      canvas.addEventListener('pointermove', (e) => {
        if (!findStickSlot(e.pointerId)) return;
        e.preventDefault();
        moveJoy(e.clientX, e.clientY, e.pointerId);
      });
      canvas.addEventListener('pointerup', (e) => {
        if (game.minimapPointerId === e.pointerId) {
          game.minimapPointerId = null;
          e.preventDefault();
          game.modalBackdropGuardUntil = performance.now() + 450;
          showMap();
          return;
        }
        endJoy(e.pointerId, e.clientX, e.clientY);
      });
      canvas.addEventListener('pointercancel', (e) => {
        if (game.minimapPointerId === e.pointerId) game.minimapPointerId = null;
        endJoy(e.pointerId, e.clientX, e.clientY);
      });
    } else {
      canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        for (const touch of Array.from(e.changedTouches)) {
          const mb = game.minimapBounds;
          if (game.scene === 'dungeon' && mb && touch.clientX >= mb.x && touch.clientX <= mb.x + mb.w && touch.clientY >= mb.y && touch.clientY <= mb.y + mb.h) {
            game.minimapPointerId = touch.identifier;
            continue;
          }
          if (!beginJoy(touch.clientX, touch.clientY, touch.identifier)) break;
        }
      }, { passive: false });
      canvas.addEventListener('touchmove', (e) => {
        let handled = false;
        for (const touch of Array.from(e.changedTouches)) {
          if (findStickSlot(touch.identifier)) {
            moveJoy(touch.clientX, touch.clientY, touch.identifier);
            handled = true;
          }
        }
        if (handled) e.preventDefault();
      }, { passive: false });
      canvas.addEventListener('touchend', (e) => {
        for (const touch of Array.from(e.changedTouches)) {
          if (game.minimapPointerId === touch.identifier) {
            game.minimapPointerId = null;
            game.modalBackdropGuardUntil = performance.now() + 450;
            showMap();
          } else endJoy(touch.identifier, touch.clientX, touch.clientY);
        }
        e.preventDefault();
      }, { passive: false });
      canvas.addEventListener('touchcancel', (e) => {
        for (const touch of Array.from(e.changedTouches)) {
          if (game.minimapPointerId === touch.identifier) game.minimapPointerId = null;
          endJoy(touch.identifier, touch.clientX, touch.clientY);
        }
      });
    }

    const beginAttack = (event) => { event?.preventDefault?.(); game.input.manualHeld = true; requestAttack(); };
    const endAttack = () => { game.input.manualHeld = false; };
    if ('PointerEvent' in window) {
      attackBtn.addEventListener('pointerdown', beginAttack);
      attackBtn.addEventListener('pointerup', endAttack);
      attackBtn.addEventListener('pointercancel', endAttack);
      attackBtn.addEventListener('pointerleave', endAttack);
    } else {
      attackBtn.addEventListener('touchstart', beginAttack, { passive: false });
      attackBtn.addEventListener('touchend', endAttack);
      attackBtn.addEventListener('touchcancel', endAttack);
    }
    interactBtn.addEventListener('click', () => game.input.interactQueued = true);
    autoBtn.addEventListener('click', toggleAutoAttack);
    potionBtn.addEventListener('click', usePotion);
    abilityBtn.addEventListener('click', useWhirlwind);
    magnetBtn.addEventListener('click', useLootMagnet);
    menuBtn.addEventListener('click', showMainMenu);
    modalClose.addEventListener('click', (e) => {
      if (performance.now() < game.modalBackdropGuardUntil) { e.preventDefault(); return; }
      hideModal();
    });
    modalBackdrop.addEventListener('pointerdown', (e) => {
      if (performance.now() < game.modalBackdropGuardUntil) { e.preventDefault(); return; }
      if (e.target === modalBackdrop && modalClose.style.visibility !== 'hidden') hideModal();
    });
  }

  function toggleAutoAttack() {
    game.autoAttack = !game.autoAttack;
    autoBtn.classList.toggle('on', game.autoAttack);
    autoBtn.textContent = game.autoAttack ? 'Auto' : 'Manual';
    toast(`Auto-attack ${game.autoAttack ? 'enabled' : 'disabled'}.`);
  }

  function updateHud() {
    if (!game.character || !game.player) return;
    const p = game.player;
    hpFill.style.width = `${clamp(p.health / p.maxHealth * 100, 0, 100)}%`;
    hpText.textContent = `${Math.ceil(p.health)}/${Math.round(p.maxHealth)}`;
    const need = xpNeeded(game.character.level);
    xpFill.style.width = `${clamp(game.character.xp / need * 100, 0, 100)}%`;
    xpText.textContent = `L${game.character.level} ${game.character.xp}/${need}`;
    staminaFill.style.width = `${clamp(p.stamina / p.maxStamina * 100, 0, 100)}%`;
    staminaText.textContent = `${Math.ceil(p.stamina)}/${p.maxStamina}`;
    staminaFill.classList.toggle('free', !isCombatActive());
    if (game.scene === 'camp') {
      locationText.textContent = 'Expedition Camp';
      roomText.textContent = `${game.character.coins} coins`;
    } else {
      const floor = currentFloor(); const room = currentRoom();
      locationText.textContent = `Floor ${floor.floorNumber} · ${floor.sizeName} · ${floor.xpMultiplier > 1 ? `+${Math.round((floor.xpMultiplier - 1) * 100)}% XP` : 'normal XP'}`;
      roomText.textContent = `${formatName(room.type)} room · ${Object.values(floor.rooms).filter(r => r.discovered).length}/${floor.roomCount}`;
    }
    abilityBtn.textContent = game.player.abilityCooldown > 0 ? game.player.abilityCooldown.toFixed(1) : 'Skill';
  }

  function frame(time) {
    if (!game.running) return;
    const elapsed = Math.min(0.1, (time - game.lastTime) / 1000 || 0);
    game.lastTime = time;
    game.accumulator += elapsed;
    while (game.accumulator >= TICK) {
      update(TICK);
      game.accumulator -= TICK;
    }
    render();
    requestAnimationFrame(frame);
  }

  function isoScreenCenter() {
    const portrait = window.innerHeight >= window.innerWidth;
    return { x: window.innerWidth * 0.5, y: window.innerHeight * (portrait ? 0.47 : 0.50) };
  }

  function updateIsoCamera() {
    const center = isoScreenCenter();
    const projectedPlayer = isoProject(game.player.x, game.player.y, 0);
    const shake = game.cameraShake.time > 0 ? game.cameraShake.intensity : 0;
    game.camera.x = center.x - projectedPlayer.x + (shake ? rand(-shake, shake) : 0);
    game.camera.y = center.y - projectedPlayer.y + (shake ? rand(-shake, shake) : 0);
  }
  function pathWorldPoints(points, z = 0) {
    if (!points.length) return;
    const first = worldToScreen(points[0].x, points[0].y, z);
    ctx.beginPath();
    ctx.moveTo(first.x, first.y);
    for (let i = 1; i < points.length; i++) {
      const point = worldToScreen(points[i].x, points[i].y, z);
      ctx.lineTo(point.x, point.y);
    }
  }

  function fillWorldPolygon(points, fill, stroke = null, lineWidth = 1, z = 0) {
    pathWorldPoints(points, z);
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth; ctx.stroke(); }
  }

  function strokeWorldLine(ax, ay, bx, by, color, width = 1, z = 0) {
    const a = worldToScreen(ax, ay, z);
    const b = worldToScreen(bx, by, z);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  function isoEllipsePath(cx, cy, rx, ry, z = 0, segments = 48) {
    ctx.beginPath();
    for (let i = 0; i <= segments; i++) {
      const a = i / segments * TAU;
      const point = worldToScreen(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, z);
      if (i === 0) ctx.moveTo(point.x, point.y); else ctx.lineTo(point.x, point.y);
    }
    ctx.closePath();
  }

  function drawIsoGroundEllipse(cx, cy, rx, ry, fill, stroke = null, lineWidth = 1, z = 0) {
    isoEllipsePath(cx, cy, rx, ry, z);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth; ctx.stroke(); }
  }

  function drawIsoFloor(fill, gridColor) {
    const { w, h } = game.roomWorld;
    fillWorldPolygon([{x:0,y:0},{x:w,y:0},{x:w,y:h},{x:0,y:h}], fill, 'rgba(255,255,255,.08)', 2);
    const tile = game.scene === 'camp' ? 140 : 100;
    ctx.lineWidth = 1;
    for (let x = tile; x < w; x += tile) strokeWorldLine(x, 0, x, h, gridColor, 1);
    for (let y = tile; y < h; y += tile) strokeWorldLine(0, y, w, y, gridColor, 1);
  }

  function wallEndpoints(dir) {
    const { w, h } = game.roomWorld;
    if (dir === 'N') return [{x:0,y:0},{x:w,y:0}];
    if (dir === 'E') return [{x:w,y:0},{x:w,y:h}];
    if (dir === 'S') return [{x:0,y:h},{x:w,y:h}];
    return [{x:0,y:0},{x:0,y:h}];
  }

  function edgePoint(dir, t) {
    const { w, h } = game.roomWorld;
    if (dir === 'N') return { x: w * t, y: 0 };
    if (dir === 'S') return { x: w * t, y: h };
    if (dir === 'W') return { x: 0, y: h * t };
    return { x: w, y: h * t };
  }

  function drawWallQuad(a, b, height, color, alpha = 1) {
    const ga = worldToScreen(a.x, a.y, 0);
    const gb = worldToScreen(b.x, b.y, 0);
    const tb = worldToScreen(b.x, b.y, height);
    const ta = worldToScreen(a.x, a.y, height);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(ga.x, ga.y);
    ctx.lineTo(gb.x, gb.y);
    ctx.lineTo(tb.x, tb.y);
    ctx.lineTo(ta.x, ta.y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(245,228,198,.13)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  function drawIsoWall(dir, locked, front = false) {
    const room = currentRoom();
    const hasDoor = !!room?.neighbors?.[dir];
    const height = front ? ISO.frontWallHeight : ISO.wallHeight;
    const alpha = front ? 0.62 : 1;
    const wallColor = currentRoom()?.type === 'boss' ? '#4a292f' : '#4a4541';
    const doorRatio = 176 / (dir === 'N' || dir === 'S' ? game.roomWorld.w : game.roomWorld.h);
    const d0 = 0.5 - doorRatio / 2;
    const d1 = 0.5 + doorRatio / 2;
    if (!hasDoor) {
      const [a,b] = wallEndpoints(dir);
      drawWallQuad(a,b,height,wallColor,alpha);
      return;
    }
    drawWallQuad(edgePoint(dir,0),edgePoint(dir,d0),height,wallColor,alpha);
    drawWallQuad(edgePoint(dir,d1),edgePoint(dir,1),height,wallColor,alpha);
    const da = edgePoint(dir,d0), db = edgePoint(dir,d1);
    const ga = worldToScreen(da.x,da.y,0), gb = worldToScreen(db.x,db.y,0);
    const ta = worldToScreen(da.x,da.y,height), tb = worldToScreen(db.x,db.y,height);
    ctx.save();
    ctx.globalAlpha = front ? 0.72 : 1;
    ctx.fillStyle = locked ? '#3a1718' : '#090a0a';
    ctx.beginPath(); ctx.moveTo(ga.x,ga.y); ctx.lineTo(gb.x,gb.y); ctx.lineTo(tb.x,tb.y); ctx.lineTo(ta.x,ta.y); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = locked ? '#cf5a4b' : '#8a7454';
    ctx.lineWidth = locked ? 3 : 2;
    ctx.beginPath(); ctx.moveTo(ga.x,ga.y); ctx.lineTo(gb.x,gb.y); ctx.stroke();
    if (locked) {
      for (let i = 1; i < 7; i++) {
        const t = i / 7;
        const x = lerp(ga.x, gb.x, t), y = lerp(ga.y, gb.y, t);
        const tx = lerp(ta.x, tb.x, t), ty = lerp(ta.y, tb.y, t);
        ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(tx,ty); ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawIsoShadow(x, y, rx, ry = rx * 0.38, alpha = 0.34) {
    const p = worldToScreen(x, y, 0);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 2, rx, ry, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function drawActorHealth(entity, feet, bodyHeight) {
    const boss = entity.type === 'boss';
    const width = boss ? 190 : Math.max(38, entity.radius * 2.05);
    const y = feet.y - bodyHeight - (boss ? 34 : 19);
    ctx.fillStyle = 'rgba(0,0,0,.68)';
    ctx.fillRect(feet.x - width / 2, y, width, boss ? 10 : 6);
    ctx.fillStyle = boss ? '#d34b43' : '#91c66f';
    ctx.fillRect(feet.x - width / 2, y, width * clamp(entity.hp / entity.maxHp, 0, 1), boss ? 10 : 6);
    if (boss) {
      ctx.fillStyle = '#f3e6cc';
      ctx.font = 'bold 18px Georgia';
      ctx.textAlign = 'center';
      ctx.fillText(entity.name, feet.x, y - 11);
    }
  }

  function drawWeaponModel(start, tip, weaponType, rarityColor, options = {}) {
    const dx = tip.x - start.x, dy = tip.y - start.y;
    const length = Math.max(28, Math.hypot(dx, dy));
    const angle = Math.atan2(dy, dx);
    const attacking = !!options.attacking;
    ctx.save();
    ctx.globalAlpha = options.alpha ?? 1;
    ctx.translate(start.x, start.y);
    ctx.rotate(angle);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (attacking) { ctx.shadowColor = rarityColor; ctx.shadowBlur = 6; }
    const grip = '#5a3821', dark = '#271d17';
    const steel = weaponType === 'hammer' ? '#92979b' : '#d9dde0';
    const accent = rarityColor || '#d7c18e';
    if (weaponType === 'spear') {
      ctx.strokeStyle = grip; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(length-13,0); ctx.stroke();
      ctx.fillStyle = steel; ctx.strokeStyle = accent; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(length,0); ctx.lineTo(length-18,-7); ctx.lineTo(length-13,0); ctx.lineTo(length-18,7); ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (weaponType === 'hammer') {
      ctx.strokeStyle = grip; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(length-13,0); ctx.stroke();
      ctx.fillStyle = steel; ctx.strokeStyle = accent; ctx.lineWidth = 2; ctx.fillRect(length-24,-14,29,28); ctx.strokeRect(length-24,-14,29,28);
      ctx.fillStyle = dark; ctx.fillRect(5,-4,9,8);
    } else {
      const isDagger = weaponType === 'dagger';
      const isGreat = weaponType === 'greatsword';
      const guardX = isDagger ? 8 : 12;
      const bladeStart = guardX + 5;
      const bladeWidth = isDagger ? 4.5 : isGreat ? 9 : 6.5;
      ctx.strokeStyle = grip; ctx.lineWidth = isGreat ? 7 : 5; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(guardX,0); ctx.stroke();
      ctx.strokeStyle = accent; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(guardX,-8-(isGreat?3:0)); ctx.lineTo(guardX,8+(isGreat?3:0)); ctx.stroke();
      ctx.fillStyle = steel; ctx.strokeStyle = accent; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(bladeStart,-bladeWidth); ctx.lineTo(length-7,-bladeWidth*.58); ctx.lineTo(length,0); ctx.lineTo(length-7,bladeWidth*.58); ctx.lineTo(bladeStart,bladeWidth); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = dark; ctx.beginPath(); ctx.arc(0,0,4.5,0,TAU); ctx.fill();
    }
    ctx.restore();
  }

  function screenFacingVector(worldDirection) {
    const projected = isoProject(worldDirection.x, worldDirection.y, 0);
    return normalize(projected.x, projected.y);
  }

  function weaponPixelLength(type, attacking = false) {
    const base = ({ dagger: 43, sword: 62, greatsword: 78, spear: 86, hammer: 66 })[type] || 58;
    return attacking ? base * 1.12 : base;
  }

  function playerHandAnchor(hand, worldDirection) {
    const feet = worldToScreen(game.player.x, game.player.y, 0);
    const facing = screenFacingVector(worldDirection);
    const characterLeft = { x: facing.y, y: -facing.x };
    const side = hand === 'leftHand' ? characterLeft : { x: -characterLeft.x, y: -characterLeft.y };
    return { x: feet.x + side.x * 15 + facing.x * 2, y: feet.y - 48 + side.y * 11 + facing.y * 2 };
  }

  function fixedWeaponTip(start, worldDirection, weaponType, attacking = false) {
    const direction = screenFacingVector(worldDirection);
    const length = weaponPixelLength(weaponType, attacking);
    return { x: start.x + direction.x * length, y: start.y + direction.y * length };
  }
  function drawIsoPlayer() {
    const p = game.player;
    const feet = worldToScreen(p.x, p.y, 0);
    const chestItem = game.character.equipment.chest;
    const helmetItem = game.character.equipment.helmet;
    const bootsItem = game.character.equipment.boots;
    const chestColor = chestItem ? RARITIES[chestItem.rarity || 'common'].color : '#a56b43';
    const weaponInfo = getEquippedWeapon();
    const facingScreen = screenFacingVector(p.facing);
    const facingAway = facingScreen.y < -0.12;
    const drawStaticWeapon = () => {
      if (facingAway || p.attack) return;
      const hand = playerHandAnchor(weaponInfo.hand, p.facing);
      const tip = fixedWeaponTip(hand, p.facing, weaponInfo.item.weaponType || 'dagger', false);
      drawWeaponModel(hand, tip, weaponInfo.item.weaponType || 'dagger', RARITIES[weaponInfo.item.rarity || 'common'].color);
    };

    drawIsoShadow(p.x, p.y, 25, 9, 0.42);
    ctx.save();
    if (p.invuln > 0 && Math.floor(p.invuln * 30) % 2 === 0) ctx.globalAlpha = 0.42;
    if (p.attack && facingAway) drawIsoAttack(true);
    ctx.fillStyle = bootsItem ? '#41372c' : '#2e2923';
    ctx.fillRect(feet.x - 14, feet.y - 17, 10, 18); ctx.fillRect(feet.x + 4, feet.y - 17, 10, 18);
    ctx.fillStyle = '#5b4431'; ctx.fillRect(feet.x - 12, feet.y - 35, 9, 21); ctx.fillRect(feet.x + 3, feet.y - 35, 9, 21);
    ctx.fillStyle = '#d8ae7d';
    ctx.strokeStyle = '#3a271c'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(feet.x-13,feet.y-57); ctx.lineTo(feet.x-22,feet.y-40); ctx.moveTo(feet.x+13,feet.y-57); ctx.lineTo(feet.x+22,feet.y-40); ctx.stroke();
    ctx.fillStyle = chestColor;
    ctx.beginPath(); ctx.moveTo(feet.x-19,feet.y-66); ctx.lineTo(feet.x+19,feet.y-66); ctx.lineTo(feet.x+15,feet.y-31); ctx.lineTo(feet.x-15,feet.y-31); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#302117'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#d8ae7d'; ctx.beginPath(); ctx.arc(feet.x,feet.y-77,13,0,TAU); ctx.fill();
    if (helmetItem) {
      ctx.fillStyle = RARITIES[helmetItem.rarity || 'common'].color;
      ctx.beginPath(); ctx.moveTo(feet.x-15,feet.y-79); ctx.quadraticCurveTo(feet.x-13,feet.y-98,feet.x,feet.y-100); ctx.quadraticCurveTo(feet.x+13,feet.y-98,feet.x+15,feet.y-79); ctx.lineTo(feet.x+13,feet.y-72); ctx.lineTo(feet.x-13,feet.y-72); ctx.closePath(); ctx.fill();
      ctx.strokeStyle='#33291d';ctx.lineWidth=2;ctx.stroke();
      ctx.beginPath();ctx.moveTo(feet.x-11,feet.y-81);ctx.lineTo(feet.x+11,feet.y-81);ctx.stroke();
    }
    drawStaticWeapon();
    ctx.restore();
    if (p.attack && !facingAway) drawIsoAttack(false);
  }
  function drawIsoSlashIndicator(a, behind = false) {
    if (!a || !game.player) return;
    const p = game.player;
    const progress = clamp(a.progress ?? (a.t / Math.max(0.001, a.weapon.duration)), 0, 1);
    if (progress <= 0.02 || progress >= 1) return;
    const angle = a.currentAngle ?? Math.atan2(p.facing.y, p.facing.x);
    const phaseDirection = a.phaseDirection || 1;
    const outerReach = a.weapon.reach;
    const innerReach = Math.max(p.radius + 9, outerReach * 0.28);
    const halfWidth = clamp(a.weapon.bladeWidth + 0.08, 0.22, 0.46);
    const life = Math.sin(progress * Math.PI);
    const segments = 14;
    const projected = (radius, theta, z = 34) => worldToScreen(
      p.x + Math.cos(theta) * radius,
      p.y + Math.sin(theta) * radius,
      z
    );

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = (behind ? 0.42 : 0.78) * (0.35 + life * 0.65);
    const gradient = ctx.createLinearGradient(
      projected(innerReach, angle).x,
      projected(innerReach, angle).y,
      projected(outerReach, angle).x,
      projected(outerReach, angle).y
    );
    gradient.addColorStop(0, 'rgba(210,235,255,0.02)');
    gradient.addColorStop(0.55, 'rgba(210,235,255,0.20)');
    gradient.addColorStop(1, 'rgba(250,247,226,0.68)');
    ctx.fillStyle = gradient;
    ctx.strokeStyle = 'rgba(235,247,255,.72)';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    for (let i = 0; i <= segments; i++) {
      const theta = angle - halfWidth + (halfWidth * 2 * i / segments);
      const point = projected(outerReach, theta);
      if (i === 0) ctx.moveTo(point.x, point.y); else ctx.lineTo(point.x, point.y);
    }
    for (let i = segments; i >= 0; i--) {
      const theta = angle - halfWidth + (halfWidth * 2 * i / segments);
      const point = projected(innerReach, theta);
      ctx.lineTo(point.x, point.y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // A bright leading edge shows the exact direction currently capable of dealing damage.
    const start = projected(innerReach * 0.82, angle);
    const tip = projected(outerReach + 5, angle);
    ctx.globalAlpha = (behind ? 0.48 : 0.95) * (0.45 + life * 0.55);
    ctx.strokeStyle = 'rgba(255,248,221,.96)';
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(start.x, start.y); ctx.lineTo(tip.x, tip.y); ctx.stroke();

    // Fainter wake lines make the swing direction readable without implying extra hit range.
    for (let i = 1; i <= 3; i++) {
      const wakeAngle = angle - phaseDirection * i * 0.075;
      const wakeStart = projected(innerReach + i * 3, wakeAngle);
      const wakeTip = projected(outerReach - i * 7, wakeAngle);
      ctx.globalAlpha = (behind ? 0.14 : 0.28) * (1 - i / 4) * (0.4 + life * 0.6);
      ctx.lineWidth = Math.max(1.2, 3.8 - i * 0.7);
      ctx.beginPath(); ctx.moveTo(wakeStart.x, wakeStart.y); ctx.lineTo(wakeTip.x, wakeTip.y); ctx.stroke();
    }
    ctx.restore();
  }

  function drawIsoAttack(behind = false) {
    const p = game.player;
    const a = p.attack;
    if (!a) return;
    const angle = a.currentAngle || 0;
    drawIsoSlashIndicator(a, behind);
    const worldDirection = { x: Math.cos(angle), y: Math.sin(angle) };
    const hand = playerHandAnchor(getEquippedWeapon().hand, worldDirection);
    const tip = fixedWeaponTip(hand, worldDirection, a.weapon.weaponType || 'sword', true);
    const accent = RARITIES[a.weapon.rarity || 'common']?.color || '#d7c18e';
    ctx.save();
    ctx.globalAlpha = behind ? 0.65 : 1;
    ctx.strokeStyle = 'rgba(255,236,196,.28)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i < 7; i++) {
      const t = i / 6;
      const arcAngle = angle - 0.18 + t * 0.2;
      const direction = screenFacingVector({ x: Math.cos(arcAngle), y: Math.sin(arcAngle) });
      const length = weaponPixelLength(a.weapon.weaponType || 'sword', true) * 0.96;
      const point = { x: hand.x + direction.x * length, y: hand.y + direction.y * length };
      if (i === 0) ctx.moveTo(point.x,point.y); else ctx.lineTo(point.x,point.y);
    }
    ctx.stroke(); ctx.restore();
    drawWeaponModel(hand, tip, a.weapon.weaponType || 'sword', accent, { attacking: true, alpha: behind ? 0.72 : 1 });
  }
  function drawIsoAreaEffects() {
    const now = performance.now();
    for (const effect of game.areaEffects) {
      const progress = clamp(1 - effect.time / Math.max(0.001, effect.duration), 0, 1);
      if (effect.type === 'blast') {
        const color = effect.element === 'fire' ? '#ff7047' : effect.element === 'poison' ? '#73d65f' : '#e3c36f';
        const pulse = 0.88 + Math.sin(now / 85) * 0.07;
        drawIsoGroundEllipse(effect.x, effect.y, effect.radius * pulse, effect.radius * pulse, `${color}22`, color, 5);
        drawIsoGroundEllipse(effect.x, effect.y, effect.radius * progress, effect.radius * progress, `${color}16`, color, 2);
      } else if (effect.type === 'hazard') {
        const color = effect.element === 'fire' ? '#f06c39' : effect.element === 'poison' ? '#69b956' : '#c7d8df';
        drawIsoGroundEllipse(effect.x, effect.y, effect.radius, effect.radius, `${color}38`, `${color}aa`, 3);
        const center = worldToScreen(effect.x, effect.y, effect.element === 'fire' ? 10 : 2);
        ctx.save(); ctx.globalAlpha = 0.6;
        if (effect.element === 'fire') {
          for (let i = 0; i < 6; i++) {
            const a = now / 420 + i * TAU / 6;
            ctx.fillStyle = i % 2 ? '#ffb347' : '#f06c39';
            ctx.beginPath(); ctx.arc(center.x + Math.cos(a) * effect.radius * 0.22, center.y + Math.sin(a) * effect.radius * 0.08 - 8, 5 + (i % 3), 0, TAU); ctx.fill();
          }
        } else if (effect.element === 'poison') {
          ctx.fillStyle = '#9de87b';
          for (let i = 0; i < 7; i++) { const a = i * TAU / 7; ctx.beginPath(); ctx.arc(center.x + Math.cos(a) * effect.radius * 0.28, center.y + Math.sin(a) * effect.radius * 0.11, 3 + (i % 2), 0, TAU); ctx.fill(); }
        } else {
          ctx.strokeStyle = '#d9edf2'; ctx.lineWidth = 2;
          for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(center.x, center.y); ctx.lineTo(center.x + Math.cos(i * TAU / 5) * 36, center.y + Math.sin(i * TAU / 5) * 16); ctx.stroke(); }
        }
        ctx.restore();
      } else if (effect.type === 'vortex') {
        const elapsed = effect.duration - effect.time;
        const pulling = elapsed >= effect.warmup;
        const shrink = pulling ? clamp(effect.time / (effect.duration - effect.warmup), 0.12, 1) : 1;
        drawIsoGroundEllipse(effect.x, effect.y, effect.radius * (0.9 + Math.sin(now / 120) * 0.06), effect.radius * 0.75, 'rgba(15,8,25,.42)', '#8069c7', 4);
        const point = worldToScreen(effect.x, effect.y, 34);
        ctx.save(); ctx.fillStyle = '#09060f'; ctx.strokeStyle = '#9a7ee6'; ctx.lineWidth = 4; ctx.shadowColor = '#765ac2'; ctx.shadowBlur = 18;
        ctx.beginPath(); ctx.arc(point.x, point.y, 30 * shrink + 8, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore();
      } else if (effect.type === 'cone') {
        const points = [{ x: effect.x, y: effect.y }];
        for (let i = 0; i <= 10; i++) {
          const a = effect.angle - effect.arc / 2 + effect.arc * (i / 10);
          points.push({ x: effect.x + Math.cos(a) * effect.range, y: effect.y + Math.sin(a) * effect.range });
        }
        const projected = points.map(point => worldToScreen(point.x, point.y, 0));
        ctx.save(); ctx.fillStyle = 'rgba(126,190,235,.18)'; ctx.strokeStyle = '#8ec9ef'; ctx.lineWidth = 3;
        ctx.beginPath(); projected.forEach((point, i) => i ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
      }
    }
  }

  function drawIsoEnemy(e) {
    if (e.dead) return;
    const leapProgress = e.specialState === 'slimeLeap' ? clamp(1 - e.specialTimer / Math.max(0.001, e.specialDuration || 0.44), 0, 1) : 0;
    const leapHeight = e.specialState === 'slimeLeap' ? Math.sin(leapProgress * Math.PI) * 120 : 0;
    const feet = worldToScreen(e.x, e.y, leapHeight);
    const flash = e.hitFlash > 0;
    if (e.isAlpha) {
      const pulse = 0.5 + Math.sin(performance.now() / 270 + e.x * 0.01) * 0.5;
      drawIsoGroundEllipse(e.x, e.y, e.radius + 21 + pulse * 5, e.radius + 21 + pulse * 5, 'rgba(224,178,68,.08)', 'rgba(232,190,78,.58)', 3);
      const aura = ctx.createRadialGradient(feet.x, feet.y - 44, 4, feet.x, feet.y - 44, Math.max(64, e.radius * 2.5));
      aura.addColorStop(0, 'rgba(246,205,91,.22)');
      aura.addColorStop(0.48, 'rgba(229,179,63,.10)');
      aura.addColorStop(1, 'rgba(229,179,63,0)');
      ctx.save(); ctx.fillStyle = aura; ctx.beginPath(); ctx.ellipse(feet.x, feet.y - 44, Math.max(40, e.radius * 1.35), Math.max(68, e.radius * 2.25), 0, 0, TAU); ctx.fill(); ctx.restore();
    }
    if (e.type === 'boss' && e.specialState === 'chargeWindup' && e.specialTarget) {
      const a = worldToScreen(e.x,e.y,0), b = worldToScreen(e.specialTarget.x,e.specialTarget.y,0);
      ctx.save(); ctx.strokeStyle='#ff5b4f'; ctx.lineWidth=8; ctx.globalAlpha=.72; ctx.setLineDash([18,12]); ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); ctx.restore();
    }
    if (e.type === 'spider' && e.state === 'telegraph') drawIsoGroundEllipse(e.x,e.y,e.radius+26,e.radius+26,null,'#ef654f',4);
    if (e.type === 'shadow' && e.state === 'vanish') drawIsoGroundEllipse(e.x,e.y,e.radius+20,e.radius+20,null,'#8c74dc',3);
    drawIsoShadow(e.x,e.y,e.type==='boss'?82:e.radius*1.05,e.type==='boss'?25:e.radius*.35,e.type==='shadow'?.22:e.type==='boss'?.48:.34);
    ctx.save();
    if (e.isAlpha) { ctx.translate(feet.x, feet.y); ctx.scale(1.45, 1.45); ctx.translate(-feet.x, -feet.y); }
    ctx.strokeStyle='rgba(18,13,10,.82)'; ctx.lineWidth=3;
    if (e.type === 'spider') {
      const bodyY=feet.y-20; ctx.strokeStyle=flash?'#fff4db':'#352b31';ctx.lineWidth=4;
      for(let i=-1;i<=1;i+=2)for(let j=0;j<4;j++){ctx.beginPath();ctx.moveTo(feet.x+i*7,bodyY+j*3-5);ctx.lineTo(feet.x+i*(22+j*5),feet.y-5+j*4);ctx.stroke();}
      ctx.fillStyle=flash?'#fff4db':e.color;ctx.beginPath();ctx.ellipse(feet.x,bodyY,19,14,0,0,TAU);ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(feet.x,bodyY-13,10,0,TAU);ctx.fill();ctx.stroke();drawActorHealth(e,feet,44);
    } else if (e.type === 'bat') {
      const bodyY=feet.y-35;ctx.fillStyle=flash?'#fff4db':e.color;ctx.beginPath();ctx.moveTo(feet.x,bodyY);ctx.quadraticCurveTo(feet.x-42,bodyY-26,feet.x-48,bodyY+8);ctx.quadraticCurveTo(feet.x-25,bodyY-4,feet.x,bodyY+12);ctx.quadraticCurveTo(feet.x+25,bodyY-4,feet.x+48,bodyY+8);ctx.quadraticCurveTo(feet.x+42,bodyY-26,feet.x,bodyY);ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(feet.x,bodyY,11,0,TAU);ctx.fill();ctx.stroke();drawActorHealth(e,feet,62);
    } else if (e.type === 'slime') {
      ctx.fillStyle=flash?'#fff4db':e.color;ctx.beginPath();ctx.moveTo(feet.x-24,feet.y);ctx.quadraticCurveTo(feet.x-25,feet.y-43,feet.x,feet.y-48);ctx.quadraticCurveTo(feet.x+25,feet.y-43,feet.x+24,feet.y);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#18251a';ctx.beginPath();ctx.arc(feet.x-8,feet.y-28,3,0,TAU);ctx.arc(feet.x+8,feet.y-28,3,0,TAU);ctx.fill();drawActorHealth(e,feet,55);
    } else if (e.type === 'shadow') {
      ctx.globalAlpha = e.state === 'vanish' ? 0.38 : 0.88;
      const y=feet.y-54;ctx.fillStyle=flash?'#fff4db':e.color;ctx.beginPath();ctx.moveTo(feet.x,y-22);ctx.quadraticCurveTo(feet.x-31,y+12,feet.x-26,feet.y);ctx.lineTo(feet.x+26,feet.y);ctx.quadraticCurveTo(feet.x+31,y+12,feet.x,y-22);ctx.fill();ctx.stroke();
      ctx.fillStyle='#0b0910';ctx.beginPath();ctx.arc(feet.x,y-22,13,0,TAU);ctx.fill();ctx.fillStyle='#b69cff';ctx.fillRect(feet.x-8,y-24,5,2);ctx.fillRect(feet.x+3,y-24,5,2);drawActorHealth(e,feet,84);
    } else if (e.type === 'imp') {
      const y=feet.y-45;ctx.fillStyle=flash?'#fff4db':e.color;ctx.beginPath();ctx.moveTo(feet.x-14,y);ctx.lineTo(feet.x+14,y);ctx.lineTo(feet.x+11,feet.y-8);ctx.lineTo(feet.x-11,feet.y-8);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.beginPath();ctx.arc(feet.x,y-10,11,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#d8b06b';ctx.beginPath();ctx.moveTo(feet.x-7,y-19);ctx.lineTo(feet.x-15,y-36);ctx.lineTo(feet.x-1,y-23);ctx.moveTo(feet.x+7,y-19);ctx.lineTo(feet.x+15,y-36);ctx.lineTo(feet.x+1,y-23);ctx.fill();ctx.fillStyle='#ffdf67';ctx.fillRect(feet.x-7,y-12,4,3);ctx.fillRect(feet.x+3,y-12,4,3);drawActorHealth(e,feet,72);
    } else if (e.type === 'boss') {
      const torsoTop=feet.y-166;
      ctx.fillStyle=flash?'#fff4db':'#4a2632';ctx.beginPath();ctx.moveTo(feet.x-58,torsoTop+30);ctx.lineTo(feet.x+58,torsoTop+30);ctx.lineTo(feet.x+48,feet.y-35);ctx.lineTo(feet.x-48,feet.y-35);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle='#7e4450';ctx.beginPath();ctx.ellipse(feet.x-58,torsoTop+45,28,18,-.3,0,TAU);ctx.ellipse(feet.x+58,torsoTop+45,28,18,.3,0,TAU);ctx.fill();ctx.stroke();
      ctx.fillStyle='#26232b';ctx.beginPath();ctx.ellipse(feet.x,torsoTop+5,31,36,0,0,TAU);ctx.fill();ctx.stroke();
      ctx.strokeStyle='#c0a05b';ctx.lineWidth=8;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(feet.x-18,torsoTop-15);ctx.quadraticCurveTo(feet.x-55,torsoTop-50,feet.x-72,torsoTop-20);ctx.moveTo(feet.x+18,torsoTop-15);ctx.quadraticCurveTo(feet.x+55,torsoTop-50,feet.x+72,torsoTop-20);ctx.stroke();
      ctx.strokeStyle='#785b34';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(feet.x-67,torsoTop-22);ctx.lineTo(feet.x-78,torsoTop-37);ctx.moveTo(feet.x+67,torsoTop-22);ctx.lineTo(feet.x+78,torsoTop-37);ctx.stroke();
      ctx.fillStyle='#ff6d55';ctx.fillRect(feet.x-14,torsoTop+1,9,4);ctx.fillRect(feet.x+5,torsoTop+1,9,4);
      ctx.strokeStyle='#33252b';ctx.lineWidth=13;ctx.beginPath();ctx.moveTo(feet.x-25,feet.y-46);ctx.lineTo(feet.x-31,feet.y);ctx.moveTo(feet.x+25,feet.y-46);ctx.lineTo(feet.x+31,feet.y);ctx.stroke();
      drawActorHealth(e,feet,240);
    } else {
      const torsoTop=feet.y-58;ctx.fillStyle=e.type==='skeleton'?'#bdb59f':flash?'#fff4db':e.color;ctx.beginPath();ctx.moveTo(feet.x-17,torsoTop);ctx.lineTo(feet.x+17,torsoTop);ctx.lineTo(feet.x+15,feet.y-17);ctx.lineTo(feet.x-15,feet.y-17);ctx.closePath();ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(feet.x,torsoTop-14,12,0,TAU);ctx.fill();ctx.stroke();ctx.strokeStyle=flash?'#fff4db':e.color;ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(feet.x-8,feet.y-20);ctx.lineTo(feet.x-12,feet.y);ctx.moveTo(feet.x+8,feet.y-20);ctx.lineTo(feet.x+12,feet.y);ctx.stroke();drawActorHealth(e,feet,82);
    }
    ctx.restore();
    if (e.type === 'boss') { ctx.save(); ctx.fillStyle='#f0d3a3'; ctx.font='bold 12px sans-serif'; ctx.textAlign='center'; const mode=e.specialState==='chargeWindup'?'CHARGE INCOMING':e.specialState==='charge'?'CHARGING':e.bossMode==='slow'?'EXPOSED':e.bossMode==='medium'?'HUNTING':'FRENZY'; ctx.fillText(mode, feet.x, feet.y-205); ctx.restore(); }
  }
  function drawIsoProjectile(p) {
    drawIsoShadow(p.x,p.y,p.radius*1.15,p.radius*.35,.2);
    const point = worldToScreen(p.x,p.y,20);
    ctx.save();
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(point.x,point.y,p.radius,0,TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.beginPath(); ctx.arc(point.x-p.radius*.25,point.y-p.radius*.25,p.radius*.32,0,TAU); ctx.fill();
    ctx.restore();
  }

  function drawIsoDrop(d) {
    const feet = worldToScreen(d.x,d.y,0);
    const bob = Math.sin(d.bob) * 5;
    const rarity = d.item.rarity || 'common';
    ctx.save();
    ctx.strokeStyle = RARITIES[rarity]?.color || '#d8d0bb';
    ctx.globalAlpha = .35;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(feet.x,feet.y-4); ctx.lineTo(feet.x,feet.y-44-bob); ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = RARITIES[rarity]?.color || '#d8d0bb';
    ctx.beginPath(); ctx.moveTo(feet.x,feet.y-24-bob); ctx.lineTo(feet.x+11,feet.y-13-bob); ctx.lineTo(feet.x,feet.y-2-bob); ctx.lineTo(feet.x-11,feet.y-13-bob); ctx.closePath(); ctx.fill();
    ctx.font = '16px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(itemIcon(d.item),feet.x,feet.y-31-bob);
    ctx.restore();
  }

  function drawIsoFeature(f) {
    const p = worldToScreen(f.x,f.y,0);
    drawIsoShadow(f.x,f.y,45,14,.28);
    ctx.save();
    if (f.type === 'mining') {
      ctx.fillStyle = f.used ? '#4d4b4a' : '#858c94';
      for (let i=-1;i<=1;i++) { ctx.beginPath(); ctx.moveTo(p.x+i*24,p.y); ctx.lineTo(p.x+i*22-15,p.y-30-Math.abs(i)*7); ctx.lineTo(p.x+i*22+15,p.y-18); ctx.closePath(); ctx.fill(); }
    } else if (f.type === 'woodcutting') {
      ctx.strokeStyle = f.used ? '#4a3b2c' : '#865c35'; ctx.lineWidth = 18; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(p.x-48,p.y-4); ctx.lineTo(p.x+45,p.y-40); ctx.stroke(); ctx.lineCap='butt';
    } else if (f.type === 'fishing') {
      drawIsoGroundEllipse(f.x,f.y,92,58,f.used ? '#263c43' : '#315d6d','#6ba6b7',3);
    } else if (f.type === 'smithing') {
      ctx.fillStyle='#4f4438'; ctx.fillRect(p.x-42,p.y-45,84,45); ctx.fillStyle=f.used?'#552f22':'#e0713e'; ctx.fillRect(p.x-25,p.y-35,50,24);
    } else if (f.type === 'puzzle') {
      drawIsoGroundEllipse(f.x,f.y,72,72,f.solved?'#426b5f':'#64517d','#d7c18e',4);
      ctx.fillStyle='#9b8bb5'; ctx.fillRect(p.x-12,p.y-64,24,62);
    } else if (f.type === 'chest') {
      ctx.fillStyle=f.opened?'#493a29':'#9a6a2c'; ctx.fillRect(p.x-42,p.y-48,84,48); ctx.strokeStyle='#d9aa55'; ctx.lineWidth=4; ctx.strokeRect(p.x-42,p.y-48,84,48);
    } else if (f.type === 'shrine') {
      ctx.fillStyle=f.used?'#525257':'#718ba5'; ctx.beginPath(); ctx.moveTo(p.x,p.y-92); ctx.lineTo(p.x+38,p.y); ctx.lineTo(p.x-38,p.y); ctx.closePath(); ctx.fill();
    } else if (f.type === 'entranceExit') {
      const pulse = 1 + Math.sin(performance.now() / 320) * 0.035;
      drawIsoGroundEllipse(f.x, f.y, 86 * pulse, 62 * pulse, 'rgba(103,174,187,.12)', 'rgba(128,208,220,.72)', 4);
      ctx.fillStyle = '#16191a';
      ctx.beginPath(); ctx.ellipse(p.x, p.y - 26, 57, 40, 0, Math.PI, TAU); ctx.lineTo(p.x + 57, p.y); ctx.lineTo(p.x - 57, p.y); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#77736b'; ctx.lineWidth = 7; ctx.stroke();
      ctx.strokeStyle = '#aaa296'; ctx.lineWidth = 5;
      for (let i = 0; i < 4; i++) {
        const y = p.y - 4 - i * 9;
        ctx.beginPath(); ctx.moveTo(p.x - 38 + i * 6, y); ctx.lineTo(p.x + 38 - i * 6, y); ctx.stroke();
      }
      ctx.fillStyle = '#c9edf0'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('TO CAMP', p.x, p.y - 55);
    } else if (f.type === 'escape' || f.type === 'victoryExit') {
      const victory=f.type==='victoryExit'; const color=victory?'#f4ca64':'#6ed6b5'; const pulse=1+Math.sin(performance.now()/240)*.07;
      ctx.strokeStyle=color; ctx.lineWidth=10; ctx.shadowColor=color; ctx.shadowBlur=18; ctx.beginPath(); ctx.ellipse(p.x,p.y-56,52*pulse,78*pulse,0,0,TAU); ctx.stroke();
      ctx.fillStyle=victory?'rgba(244,202,100,.14)':'rgba(110,214,181,.12)'; ctx.beginPath(); ctx.ellipse(p.x,p.y-56,43,68,0,0,TAU); ctx.fill();
      ctx.shadowBlur=0; ctx.fillStyle='#fff0b5'; ctx.font='bold 16px sans-serif'; ctx.textAlign='center'; ctx.fillText(victory?'EXIT':'ESCAPE',p.x,p.y-52);
    }
    ctx.restore();
  }

  function drawIsoParticles() {
    for (const particle of game.particles) {
      const t = particle.t / particle.duration;
      ctx.save(); ctx.globalAlpha = 1 - t;
      if (particle.type === 'text') {
        const point=worldToScreen(particle.x,particle.y,42);
        ctx.fillStyle=particle.color; ctx.font='bold 18px sans-serif'; ctx.textAlign='center'; ctx.fillText(particle.text,point.x,point.y-t*42);
      } else if (particle.type === 'ring') {
        const radius=lerp(particle.r,particle.maxR,t);
        drawIsoGroundEllipse(particle.x,particle.y,radius,radius,null,particle.color,6);
      }
      ctx.restore();
    }
  }

  function drawIsoCampNpc(npc, p) {
    if (!npc.appearance) npc.appearance = generateCampNpcAppearance(npc.role);
    const a = npc.appearance;
    const facingWorld = normalize(Number(npc.facingX) || 1, Number(npc.facingY) || 0);
    const facing = screenFacingVector(facingWorld);
    const side = { x: facing.y, y: -facing.x };
    const feetY = p.y;
    drawIsoShadow(npc.x, npc.y, 24, 8, .36);
    ctx.save();

    if (a.cape) {
      ctx.fillStyle = a.capeColor;
      ctx.beginPath();
      ctx.moveTo(p.x - 18, feetY - 65);
      ctx.lineTo(p.x + 18, feetY - 65);
      ctx.lineTo(p.x + 23 - facing.x * 8, feetY - 24);
      ctx.lineTo(p.x - 23 - facing.x * 8, feetY - 24);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = a.boots;
    ctx.fillRect(p.x - 14, feetY - 17, 10, 18);
    ctx.fillRect(p.x + 4, feetY - 17, 10, 18);
    ctx.fillStyle = a.clothAlt;
    ctx.fillRect(p.x - 12, feetY - 37, 9, 23);
    ctx.fillRect(p.x + 3, feetY - 37, 9, 23);

    const torsoColor = a.chestStyle === 'plate' ? a.metal : a.cloth;
    ctx.fillStyle = torsoColor;
    ctx.beginPath();
    ctx.moveTo(p.x - 20, feetY - 67);
    ctx.lineTo(p.x + 20, feetY - 67);
    ctx.lineTo(p.x + 16, feetY - 31);
    ctx.lineTo(p.x - 16, feetY - 31);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#302117'; ctx.lineWidth = 3; ctx.stroke();
    if (a.chestStyle === 'robe') {
      ctx.fillStyle = a.cloth;
      ctx.beginPath(); ctx.moveTo(p.x - 17, feetY - 40); ctx.lineTo(p.x + 17, feetY - 40); ctx.lineTo(p.x + 25, feetY - 15); ctx.lineTo(p.x - 25, feetY - 15); ctx.closePath(); ctx.fill();
    } else if (a.chestStyle === 'apron') {
      ctx.fillStyle = '#c8b89b';
      ctx.fillRect(p.x - 12, feetY - 62, 24, 37);
      ctx.strokeStyle = '#675a49'; ctx.lineWidth = 2; ctx.strokeRect(p.x - 12, feetY - 62, 24, 37);
    } else if (a.chestStyle === 'plate') {
      ctx.strokeStyle = 'rgba(255,255,255,.32)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(p.x - 15, feetY - 57); ctx.lineTo(p.x + 15, feetY - 57); ctx.moveTo(p.x, feetY - 65); ctx.lineTo(p.x, feetY - 34); ctx.stroke();
    }

    ctx.strokeStyle = a.gloves ? a.clothAlt : a.skin;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(p.x - 14, feetY - 59); ctx.lineTo(p.x - 24 + side.x * 3, feetY - 40 + side.y * 3);
    ctx.moveTo(p.x + 14, feetY - 59); ctx.lineTo(p.x + 24 - side.x * 3, feetY - 40 - side.y * 3);
    ctx.stroke();
    ctx.fillStyle = '#6d4c2c'; ctx.fillRect(p.x - 17, feetY - 38, 34, 5);

    ctx.fillStyle = a.skin;
    ctx.beginPath(); ctx.arc(p.x, feetY - 78, 13, 0, TAU); ctx.fill();
    if (a.helmet === 'hood') {
      ctx.fillStyle = a.clothAlt;
      ctx.beginPath(); ctx.arc(p.x, feetY - 80, 17, Math.PI, TAU); ctx.lineTo(p.x + 14, feetY - 72); ctx.lineTo(p.x - 14, feetY - 72); ctx.closePath(); ctx.fill();
    } else if (a.helmet === 'cap') {
      ctx.fillStyle = a.cloth;
      ctx.beginPath(); ctx.arc(p.x, feetY - 82, 14, Math.PI, TAU); ctx.fill();
      ctx.fillRect(p.x + 7, feetY - 83, 12, 3);
    } else if (a.helmet === 'openHelm') {
      ctx.fillStyle = a.metal;
      ctx.beginPath(); ctx.moveTo(p.x - 15, feetY - 80); ctx.quadraticCurveTo(p.x - 12, feetY - 99, p.x, feetY - 101); ctx.quadraticCurveTo(p.x + 12, feetY - 99, p.x + 15, feetY - 80); ctx.lineTo(p.x + 12, feetY - 72); ctx.lineTo(p.x - 12, feetY - 72); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#342e28'; ctx.lineWidth = 2; ctx.stroke();
    } else if (a.hairStyle !== 'bald') {
      ctx.fillStyle = a.hair;
      if (a.hairStyle === 'long') ctx.fillRect(p.x - 13, feetY - 87, 26, 18);
      ctx.beginPath(); ctx.arc(p.x, feetY - 83, 13, Math.PI, TAU); ctx.fill();
      if (a.hairStyle === 'crest') ctx.fillRect(p.x - 3, feetY - 101, 6, 12);
    }

    if (a.shield) {
      const shieldX = p.x - side.x * 24 - facing.x * 2;
      const shieldY = feetY - 48 - side.y * 10;
      ctx.fillStyle = a.metal; ctx.strokeStyle = '#4a382a'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(shieldX, shieldY, 14, 19, -.12, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = a.cloth; ctx.beginPath(); ctx.arc(shieldX, shieldY, 5, 0, TAU); ctx.fill();
    }

    const weaponX = p.x + side.x * 20 + facing.x * 3;
    const weaponY = feetY - 46 + side.y * 10;
    const weaponDir = normalize(facing.x + .22, facing.y - .15);
    if (a.weapon === 'staff') {
      ctx.strokeStyle = '#745033'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(weaponX, weaponY + 20); ctx.lineTo(weaponX + weaponDir.x * 62, weaponY + weaponDir.y * 62 - 18); ctx.stroke();
      ctx.fillStyle = '#7fc3b5'; ctx.beginPath(); ctx.arc(weaponX + weaponDir.x * 62, weaponY + weaponDir.y * 62 - 18, 6, 0, TAU); ctx.fill();
    } else {
      const weaponType = ['sword', 'dagger', 'spear', 'hammer'].includes(a.weapon) ? a.weapon : 'sword';
      const tip = { x: weaponX + weaponDir.x * weaponPixelLength(weaponType, false) * .82, y: weaponY + weaponDir.y * weaponPixelLength(weaponType, false) * .82 };
      drawWeaponModel({ x: weaponX, y: weaponY }, tip, weaponType, a.metal, { alpha: .95 });
    }

    ctx.fillStyle = '#eee3cd'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(npc.name, p.x, feetY - 112);
    if (npc.locked) { ctx.fillStyle = '#f4d45e'; ctx.font = 'bold 18px sans-serif'; ctx.fillText('!', p.x, feetY - 131); }
    ctx.restore();
  }

  function drawTopDownCampNpc(npc) {
    if (!npc.appearance) npc.appearance = generateCampNpcAppearance(npc.role);
    const a = npc.appearance;
    const f = normalize(Number(npc.facingX) || 1, Number(npc.facingY) || 0);
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(npc.x, npc.y + 13, 19, 9, 0, 0, TAU); ctx.fill();
    if (a.cape) { ctx.fillStyle = a.capeColor; ctx.beginPath(); ctx.arc(npc.x - f.x * 9, npc.y - f.y * 9, 20, 0, TAU); ctx.fill(); }
    ctx.fillStyle = a.chestStyle === 'plate' ? a.metal : a.cloth; ctx.beginPath(); ctx.arc(npc.x, npc.y, 18, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#33271f'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = a.skin; ctx.beginPath(); ctx.arc(npc.x + f.x * 11, npc.y + f.y * 11, 9, 0, TAU); ctx.fill();
    if (a.helmet !== 'none') { ctx.strokeStyle = a.helmet === 'openHelm' ? a.metal : a.clothAlt; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(npc.x + f.x * 11, npc.y + f.y * 11, 9, 0, TAU); ctx.stroke(); }
    if (a.shield) { ctx.fillStyle = a.metal; ctx.beginPath(); ctx.arc(npc.x - f.y * 19, npc.y + f.x * 19, 8, 0, TAU); ctx.fill(); }
    ctx.strokeStyle = a.weapon === 'staff' ? '#745033' : a.metal; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(npc.x + f.y * 12, npc.y - f.x * 12); ctx.lineTo(npc.x + f.y * 12 + f.x * 30, npc.y - f.x * 12 + f.y * 30); ctx.stroke();
    ctx.fillStyle = '#eee3cd'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(npc.name, npc.x, npc.y - 31);
    if (npc.locked) { ctx.fillStyle = '#e7c85a'; ctx.font = '18px sans-serif'; ctx.fillText('!', npc.x, npc.y - 47); }
    ctx.restore();
  }

  function drawCampObject(obj) {
    const p = worldToScreen(obj.x,obj.y,0);
    if (obj.kind === 'tree') {
      drawIsoShadow(obj.x,obj.y,30,10,.28); ctx.strokeStyle='#4a3526'; ctx.lineWidth=10; ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x,p.y-52); ctx.stroke();
      ctx.fillStyle='#29452d'; ctx.beginPath(); ctx.arc(p.x,p.y-72,obj.size,0,TAU); ctx.fill(); ctx.fillStyle='#355a38'; ctx.beginPath(); ctx.arc(p.x-12,p.y-80,obj.size*.65,0,TAU); ctx.fill();
    } else if (obj.kind === 'tent') {
      drawIsoShadow(obj.x,obj.y,76,21,.32); ctx.fillStyle=obj.color; ctx.beginPath(); ctx.moveTo(p.x-72,p.y); ctx.lineTo(p.x,p.y-115); ctx.lineTo(p.x+72,p.y); ctx.closePath(); ctx.fill();
      ctx.fillStyle='rgba(0,0,0,.38)'; ctx.beginPath(); ctx.moveTo(p.x-20,p.y); ctx.lineTo(p.x,p.y-48); ctx.lineTo(p.x+20,p.y); ctx.closePath(); ctx.fill();
      ctx.fillStyle='#ead9b8'; ctx.font='bold 12px sans-serif'; ctx.textAlign='center'; ctx.fillText(obj.label,p.x,p.y+19);
    } else if (obj.kind === 'storage') {
      drawIsoShadow(obj.x,obj.y,48,13,.34); ctx.fillStyle='#6e4827'; ctx.fillRect(p.x-46,p.y-46,92,46); ctx.strokeStyle='#d0a44e'; ctx.lineWidth=4; ctx.strokeRect(p.x-46,p.y-46,92,46); ctx.fillStyle='#d0a44e'; ctx.fillRect(p.x-7,p.y-25,14,18);
      ctx.fillStyle='#ead9b8'; ctx.font='bold 11px sans-serif'; ctx.textAlign='center'; ctx.fillText('STORAGE',p.x,p.y+17);
    } else if (obj.kind === 'fire') {
      drawIsoGroundEllipse(obj.x,obj.y,64,64,'#3b3026');
      ctx.fillStyle='#e07738'; ctx.beginPath(); ctx.moveTo(p.x,p.y-70); ctx.quadraticCurveTo(p.x+38,p.y-25,p.x,p.y); ctx.quadraticCurveTo(p.x-32,p.y-28,p.x,p.y-70); ctx.fill();
      ctx.fillStyle='#f2c05f'; ctx.beginPath(); ctx.moveTo(p.x,p.y-52); ctx.quadraticCurveTo(p.x+22,p.y-24,p.x,p.y-7); ctx.quadraticCurveTo(p.x-17,p.y-25,p.x,p.y-52); ctx.fill();
    } else if (obj.kind === 'entrance') {
      ctx.fillStyle='#090909'; ctx.beginPath(); ctx.ellipse(p.x,p.y-55,74,82,0,Math.PI,TAU); ctx.lineTo(p.x+74,p.y); ctx.lineTo(p.x-74,p.y); ctx.closePath(); ctx.fill();
      ctx.strokeStyle='#5b5953'; ctx.lineWidth=12; ctx.stroke(); ctx.fillStyle='#d7bf85'; ctx.font='bold 14px Georgia'; ctx.textAlign='center'; ctx.fillText('THE DESCENT',p.x,p.y-150);
    } else if (obj.kind === 'npc') {
      drawIsoCampNpc(obj.npc, p);
    }
  }

  function renderCampIso() {
    drawIsoFloor('#34482f','rgba(185,213,164,.055)');
    fillWorldPolygon([{x:0,y:0},{x:game.roomWorld.w,y:0},{x:game.roomWorld.w,y:330},{x:0,y:330}],'#292a28');
    drawIsoGroundEllipse(900,770,650,500,'#66543e','rgba(198,175,132,.16)',2);
    const objects=[];
    for(let i=0;i<34;i++){
      const x=(i*173)%game.roomWorld.w, y=380+((i*271)%940);
      if(dist(x,y,900,770)<610) continue;
      objects.push({kind:'tree',x,y,size:24+(i%3)*6,depth:x+y});
    }
    objects.push({kind:'entrance',x:900,y:285,depth:1185});
    objects.push({kind:'tent',x:430,y:500,color:'#7c5a39',label:'SUPPLIES',depth:930});
    objects.push({kind:'tent',x:1370,y:500,color:'#6a4136',label:'BLACKSMITH',depth:1870});
    objects.push({kind:'storage',x:700,y:545,depth:1245});
    objects.push({kind:'fire',x:900,y:800,depth:1700});
    for(const npc of game.campNpcs) objects.push({kind:'npc',x:npc.x,y:npc.y,npc,depth:npc.x+npc.y});
    objects.push({kind:'player',x:game.player.x,y:game.player.y,depth:game.player.x+game.player.y});
    objects.sort((a,b)=>a.depth-b.depth);
    for(const obj of objects) obj.kind==='player'?drawIsoPlayer():drawCampObject(obj);
    drawIsoParticles();
  }

  function renderDungeonIso() {
    const room=currentRoom();
    const boss=room.type==='boss';
    drawIsoFloor(boss?'#28171d':'#272526',boss?'rgba(217,74,82,.10)':'rgba(207,190,157,.07)');
    if(boss){drawIsoGroundEllipse(game.roomWorld.w/2,game.roomWorld.h/2,520,520,null,'rgba(210,76,65,.32)',7);drawIsoGroundEllipse(game.roomWorld.w/2,game.roomWorld.h/2,850,850,null,'rgba(210,76,65,.22)',7);}
    drawIsoAreaEffects();
    drawIsoWall('N',!room.cleared,false); drawIsoWall('W',!room.cleared,false);
    const drawables=[];
    for(const f of game.roomFeatures) drawables.push({kind:'feature',ref:f,depth:f.x+f.y});
    for(const d of game.drops) drawables.push({kind:'drop',ref:d,depth:d.x+d.y+4});
    for(const e of game.enemies) if(!e.dead) drawables.push({kind:'enemy',ref:e,depth:e.x+e.y});
    for(const p of game.projectiles) drawables.push({kind:'projectile',ref:p,depth:p.x+p.y+8});
    drawables.push({kind:'player',ref:game.player,depth:game.player.x+game.player.y});
    drawables.sort((a,b)=>a.depth-b.depth);
    for(const item of drawables){
      if(item.kind==='feature') drawIsoFeature(item.ref);
      else if(item.kind==='drop') drawIsoDrop(item.ref);
      else if(item.kind==='enemy') drawIsoEnemy(item.ref);
      else if(item.kind==='projectile') drawIsoProjectile(item.ref);
      else drawIsoPlayer();
    }
    drawIsoWall('E',!room.cleared,true); drawIsoWall('S',!room.cleared,true);
    drawIsoParticles();
  }

  function render() {
    const w = window.innerWidth, h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);
    if (!game.player) return;
    updateIsoCamera();
    if (game.scene === 'camp') renderCampIso(); else renderDungeonIso();
    if (game.scene === 'dungeon') renderRoomMinimap();
  }

  function renderRoomMinimap() {
    const room = currentRoom();
    if (!room || !game.player) { game.minimapBounds = null; return; }
    const portrait = window.innerHeight >= window.innerWidth;
    const size = portrait ? Math.min(142, window.innerWidth * 0.36) : 156;
    const safeTop = 78;
    const x = window.innerWidth - size - 12;
    const y = safeTop;
    game.minimapBounds = { x, y, w: size, h: size };
    const headerH = 20;
    const pad = 10;
    const innerW = size - pad * 2;
    const innerH = size - headerH - pad * 2;
    const totalIsoW = (game.roomWorld.w + game.roomWorld.h) * ISO.x;
    const totalIsoH = (game.roomWorld.w + game.roomWorld.h) * ISO.y;
    const miniScale = Math.min(innerW / totalIsoW, innerH / totalIsoH);
    const diamondW = totalIsoW * miniScale;
    const diamondH = totalIsoH * miniScale;
    const centerX = x + size / 2;
    const topY = y + headerH + pad + (innerH - diamondH) / 2;
    const miniPoint = (wx, wy) => ({
      x: centerX + (wx - wy) * ISO.x * miniScale,
      y: topY + (wx + wy) * ISO.y * miniScale,
    });

    ctx.save();
    ctx.fillStyle = 'rgba(10, 11, 11, 0.82)';
    ctx.strokeStyle = 'rgba(248, 237, 215, 0.42)';
    ctx.lineWidth = 2;
    const radius = 12;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + size - radius, y);
    ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
    ctx.lineTo(x + size, y + size - radius);
    ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
    ctx.lineTo(x + radius, y + size);
    ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    const livingEnemies = game.enemies.filter(e => !e.dead);
    const visibleDrops = game.drops.filter(d => !d.picked);
    const unopenedChests = game.roomFeatures.filter(f => f.type === 'chest' && !f.opened);
    const lootCount = visibleDrops.length + unopenedChests.length;
    ctx.fillStyle = 'rgba(255,255,255,.78)';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`TAP MAP · E ${livingEnemies.length} · L ${lootCount}`, x + 9, y + 13);

    const corners = [miniPoint(0,0), miniPoint(game.roomWorld.w,0), miniPoint(game.roomWorld.w,game.roomWorld.h), miniPoint(0,game.roomWorld.h)];
    ctx.fillStyle = room.type === 'boss' ? 'rgba(88,31,38,.88)' : 'rgba(48,47,47,.94)';
    ctx.strokeStyle = room.type === 'boss' ? '#b95a58' : '#8d8982';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(corners[0].x,corners[0].y);
    for (let i=1;i<corners.length;i++) ctx.lineTo(corners[i].x,corners[i].y);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    const drawDoor = (dir, a, b) => {
      if (!room.neighbors[dir]) return;
      ctx.strokeStyle = doorWasTraversed(room, dir) ? '#66d17b' : '#f3c34f';
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
    };
    const half = 82;
    drawDoor('N', miniPoint(game.roomWorld.w/2-half,0), miniPoint(game.roomWorld.w/2+half,0));
    drawDoor('S', miniPoint(game.roomWorld.w/2-half,game.roomWorld.h), miniPoint(game.roomWorld.w/2+half,game.roomWorld.h));
    drawDoor('W', miniPoint(0,game.roomWorld.h/2-half), miniPoint(0,game.roomWorld.h/2+half));
    drawDoor('E', miniPoint(game.roomWorld.w,game.roomWorld.h/2-half), miniPoint(game.roomWorld.w,game.roomWorld.h/2+half));

    for (const enemy of livingEnemies) {
      const ep = miniPoint(enemy.x, enemy.y);
      ctx.fillStyle = enemy.type === 'boss' ? '#ff6259' : '#e25d54';
      ctx.beginPath(); ctx.arc(ep.x, ep.y, enemy.type === 'boss' ? 4.8 : 2.6, 0, TAU); ctx.fill();
    }
    for (const drop of visibleDrops) {
      const dp = miniPoint(drop.x, drop.y);
      ctx.fillStyle = RARITIES[drop.item.rarity || 'common']?.color || '#f3df8d';
      ctx.beginPath(); ctx.moveTo(dp.x,dp.y-3.2); ctx.lineTo(dp.x+3.2,dp.y); ctx.lineTo(dp.x,dp.y+3.2); ctx.lineTo(dp.x-3.2,dp.y); ctx.closePath(); ctx.fill();
    }
    for (const chest of unopenedChests) {
      const cp = miniPoint(chest.x, chest.y);
      ctx.fillStyle = '#f3c969'; ctx.fillRect(cp.x-3.2,cp.y-3.2,6.4,6.4);
      ctx.strokeStyle = '#5e4318'; ctx.lineWidth = 1; ctx.strokeRect(cp.x-3.2,cp.y-3.2,6.4,6.4);
    }
    for (const exit of game.roomFeatures.filter(feature => feature.type === 'victoryExit')) {
      const ep = miniPoint(exit.x, exit.y);
      ctx.strokeStyle = '#f4ca64'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(ep.x,ep.y,4.5,0,TAU); ctx.stroke();
    }
    for (const entrance of game.roomFeatures.filter(feature => feature.type === 'entranceExit')) {
      const ep = miniPoint(entrance.x, entrance.y);
      ctx.fillStyle = '#8dd9e1';
      ctx.beginPath(); ctx.moveTo(ep.x,ep.y-5); ctx.lineTo(ep.x+4.5,ep.y+4); ctx.lineTo(ep.x-4.5,ep.y+4); ctx.closePath(); ctx.fill();
    }

    const pp = miniPoint(game.player.x, game.player.y);
    const fp = miniPoint(game.player.x + game.player.facing.x * 95, game.player.y + game.player.facing.y * 95);
    ctx.fillStyle = '#f5d579'; ctx.strokeStyle = '#17130c'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(pp.x,pp.y,4.3,0,TAU); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#fff0bd'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(pp.x,pp.y); ctx.lineTo(fp.x,fp.y); ctx.stroke();
    ctx.restore();
  }

  function renderCampWorld() {
    const { w, h } = game.roomWorld;
    ctx.fillStyle = '#3c4b31'; ctx.fillRect(0, 0, w, h);
    // Dirt clearing
    ctx.fillStyle = '#685741'; ctx.beginPath(); ctx.ellipse(900, 770, 650, 500, 0, 0, TAU); ctx.fill();
    // Dungeon cliff and entrance
    ctx.fillStyle = '#292a28'; ctx.fillRect(0, 0, w, 330);
    ctx.fillStyle = '#080909'; ctx.beginPath(); ctx.arc(900, 285, 105, Math.PI, 0); ctx.lineTo(1005, 330); ctx.lineTo(795, 330); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d7bf85'; ctx.font = '18px Georgia'; ctx.textAlign = 'center'; ctx.fillText('THE DESCENT', 900, 175);
    drawTent(430, 500, '#7c5a39', 'SUPPLIES');
    drawTent(1370, 500, '#6a4136', 'BLACKSMITH');
    drawStorageChest(700, 545);
    // Campfire
    ctx.fillStyle = '#3b3026'; ctx.beginPath(); ctx.arc(900, 800, 62, 0, TAU); ctx.fill();
    for (let i = 0; i < 7; i++) { const a = i / 7 * TAU; ctx.fillStyle = '#8b7a61'; ctx.beginPath(); ctx.arc(900 + Math.cos(a)*48, 800 + Math.sin(a)*48, 11, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#e07738'; ctx.beginPath(); ctx.moveTo(900, 742); ctx.quadraticCurveTo(955, 807, 900, 842); ctx.quadraticCurveTo(850, 802, 900, 742); ctx.fill();
    ctx.fillStyle = '#f2c05f'; ctx.beginPath(); ctx.moveTo(900, 764); ctx.quadraticCurveTo(930, 805, 900, 827); ctx.quadraticCurveTo(876, 804, 900, 764); ctx.fill();
    // Scenery
    for (let i = 0; i < 34; i++) {
      const x = (i * 173) % w, y = 380 + ((i * 271) % 940);
      if (dist(x, y, 900, 770) < 610) continue;
      ctx.fillStyle = '#253825'; ctx.beginPath(); ctx.arc(x, y, 35 + (i % 3)*8, 0, TAU); ctx.fill();
    }
    // NPCs
    for (const npc of game.campNpcs) {
      drawTopDownCampNpc(npc);
    }
  }

  function drawStorageChest(x, y) {
    ctx.fillStyle = '#3b2819';
    ctx.fillRect(x - 58, y - 34, 116, 68);
    ctx.fillStyle = '#6e4827';
    ctx.fillRect(x - 52, y - 28, 104, 24);
    ctx.strokeStyle = '#d0a44e';
    ctx.lineWidth = 5;
    ctx.strokeRect(x - 58, y - 34, 116, 68);
    ctx.fillStyle = '#d0a44e';
    ctx.fillRect(x - 9, y - 4, 18, 22);
    ctx.fillStyle = '#ead9b8';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('STORAGE', x, y + 56);
  }

  function drawTent(x, y, color, label) {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(x - 120, y + 75); ctx.lineTo(x, y - 110); ctx.lineTo(x + 120, y + 75); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.34)'; ctx.beginPath(); ctx.moveTo(x - 36, y + 75); ctx.lineTo(x, y - 5); ctx.lineTo(x + 36, y + 75); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ead9b8'; ctx.font = '14px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(label, x, y + 102);
  }

  function renderDungeonWorld() {
    const room = currentRoom();
    const { w, h } = game.roomWorld;
    const boss = room.type === 'boss';
    ctx.fillStyle = boss ? '#23141a' : '#201f20'; ctx.fillRect(0, 0, w, h);
    // tiled floor
    ctx.strokeStyle = boss ? 'rgba(182,66,72,.12)' : 'rgba(198,184,152,.08)'; ctx.lineWidth = 1;
    const tile = 80;
    for (let x = 40; x < w; x += tile) { ctx.beginPath(); ctx.moveTo(x, 30); ctx.lineTo(x, h - 30); ctx.stroke(); }
    for (let y = 40; y < h; y += tile) { ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(w - 30, y); ctx.stroke(); }
    // walls
    ctx.fillStyle = '#3c3836';
    ctx.fillRect(0, 0, w, 38); ctx.fillRect(0, h - 38, w, 38); ctx.fillRect(0, 0, 38, h); ctx.fillRect(w - 38, 0, 38, h);
    const locked = !room.cleared;
    drawDoors(room, locked);
    // boss arena markings
    if (boss) {
      ctx.strokeStyle = 'rgba(210,76,65,.35)'; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.arc(w/2, h/2, 520, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.arc(w/2, h/2, 850, 0, TAU); ctx.stroke();
    }
  }

  function drawDoors(room, locked) {
    const w = game.roomWorld.w, h = game.roomWorld.h;
    const doorW = 176;
    const draw = (dir) => {
      if (!room.neighbors[dir]) return;
      ctx.fillStyle = locked ? '#7a342e' : '#151515';
      if (dir === 'N') ctx.fillRect(w/2-doorW/2, 0, doorW, 45);
      if (dir === 'S') ctx.fillRect(w/2-doorW/2, h-45, doorW, 45);
      if (dir === 'W') ctx.fillRect(0, h/2-doorW/2, 45, doorW);
      if (dir === 'E') ctx.fillRect(w-45, h/2-doorW/2, 45, doorW);
      if (locked) {
        ctx.strokeStyle = '#b55445'; ctx.lineWidth = 5;
        ctx.beginPath();
        if (dir === 'N' || dir === 'S') {
          const y = dir === 'N' ? 22 : h-22;
          for (let x=w/2-doorW/2+15; x<w/2+doorW/2; x+=26) { ctx.moveTo(x,y-20); ctx.lineTo(x,y+20); }
        } else {
          const x = dir === 'W' ? 22 : w-22;
          for (let y=h/2-doorW/2+15; y<h/2+doorW/2; y+=26) { ctx.moveTo(x-20,y); ctx.lineTo(x+20,y); }
        }
        ctx.stroke();
      }
    };
    DIRS.forEach(d => draw(d.key));
  }

  function renderFeatures() {
    for (const f of game.roomFeatures) {
      if (f.type === 'mining') {
        ctx.fillStyle = f.used ? '#4d4b4a' : '#7e858d';
        ctx.beginPath(); ctx.moveTo(f.x-50,f.y+35); ctx.lineTo(f.x-20,f.y-50); ctx.lineTo(f.x+20,f.y-30); ctx.lineTo(f.x+55,f.y+38); ctx.closePath(); ctx.fill();
      } else if (f.type === 'woodcutting') {
        ctx.strokeStyle = f.used ? '#4a3b2c' : '#765131'; ctx.lineWidth = 18;
        ctx.beginPath(); ctx.moveTo(f.x-70,f.y+45); ctx.quadraticCurveTo(f.x-10,f.y-60,f.x+70,f.y+30); ctx.stroke();
      } else if (f.type === 'fishing') {
        ctx.fillStyle = f.used ? '#263c43' : '#315d6d'; ctx.beginPath(); ctx.ellipse(f.x,f.y,92,58,0,0,TAU); ctx.fill();
      } else if (f.type === 'smithing') {
        ctx.fillStyle = '#51463a'; ctx.fillRect(f.x-60,f.y-35,120,70); ctx.fillStyle = f.used ? '#552f22' : '#e0713e'; ctx.fillRect(f.x-33,f.y-18,66,36);
      } else if (f.type === 'puzzle') {
        ctx.fillStyle = f.solved ? '#426b5f' : '#64517d'; ctx.beginPath(); ctx.arc(f.x,f.y,68,0,TAU); ctx.fill();
        ctx.strokeStyle = '#d7c18e'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(f.x,f.y,38,0,TAU); ctx.stroke();
      } else if (f.type === 'chest') {
        ctx.fillStyle = f.opened ? '#493a29' : '#9a6a2c'; ctx.fillRect(f.x-55,f.y-36,110,72); ctx.strokeStyle = '#d9aa55'; ctx.lineWidth = 5; ctx.strokeRect(f.x-55,f.y-36,110,72);
      } else if (f.type === 'shrine') {
        ctx.fillStyle = f.used ? '#525257' : '#718ba5'; ctx.beginPath(); ctx.moveTo(f.x,f.y-82); ctx.lineTo(f.x+55,f.y+55); ctx.lineTo(f.x-55,f.y+55); ctx.closePath(); ctx.fill();
      } else if (f.type === 'entranceExit') {
        const pulse = 1 + Math.sin(performance.now() / 320) * 0.035;
        ctx.fillStyle = 'rgba(103,174,187,.12)'; ctx.beginPath(); ctx.arc(f.x,f.y,82*pulse,0,TAU); ctx.fill();
        ctx.strokeStyle = '#80d0dc'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(f.x,f.y,72*pulse,0,TAU); ctx.stroke();
        ctx.strokeStyle = '#aaa296'; ctx.lineWidth = 6;
        for (let i=0;i<5;i++) { const y=f.y-34+i*15; ctx.beginPath(); ctx.moveTo(f.x-42+i*5,y); ctx.lineTo(f.x+42-i*5,y); ctx.stroke(); }
        ctx.fillStyle = '#c9edf0'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('CAMP', f.x, f.y + 4);
      } else if (f.type === 'escape') {
        ctx.strokeStyle = '#6ed6b5'; ctx.lineWidth = 11; ctx.beginPath(); ctx.arc(f.x,f.y,78,0,TAU); ctx.stroke();
        ctx.strokeStyle = 'rgba(110,214,181,.28)'; ctx.lineWidth = 24; ctx.beginPath(); ctx.arc(f.x,f.y,95,0,TAU); ctx.stroke();
      } else if (f.type === 'victoryExit') {
        const pulse = 1 + Math.sin(performance.now() / 240) * 0.08;
        ctx.strokeStyle = '#f4ca64'; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(f.x,f.y,82 * pulse,0,TAU); ctx.stroke();
        ctx.strokeStyle = 'rgba(244,202,100,.25)'; ctx.lineWidth = 30; ctx.beginPath(); ctx.arc(f.x,f.y,103 * pulse,0,TAU); ctx.stroke();
        ctx.fillStyle = 'rgba(244,202,100,.16)'; ctx.beginPath(); ctx.arc(f.x,f.y,66,0,TAU); ctx.fill();
        ctx.fillStyle = '#fff0b5'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('EXIT', f.x, f.y + 6);
      }
    }
  }

  function renderPlayer() {
    const p = game.player;
    ctx.save();
    if (p.invuln > 0 && Math.floor(p.invuln * 30) % 2 === 0) ctx.globalAlpha = 0.45;
    ctx.fillStyle = '#d7b36b'; ctx.beginPath(); ctx.arc(p.x,p.y,p.radius,0,TAU); ctx.fill();
    ctx.strokeStyle = '#34291c'; ctx.lineWidth = 4; ctx.stroke();
    ctx.strokeStyle = '#f7e4b4'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x+p.facing.x*38,p.y+p.facing.y*38); ctx.stroke();
    ctx.restore();
    if (p.attack) {
      const a = p.attack;
      const angle = a.currentAngle || 0;
      const halfWidth = clamp(a.weapon.bladeWidth + 0.08, 0.22, 0.46);
      const inner = Math.max(p.radius + 9, a.weapon.reach * 0.28);
      const progress = clamp(a.progress ?? 0.5, 0, 1);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.35 + Math.sin(progress * Math.PI) * 0.5;
      ctx.fillStyle = 'rgba(210,235,255,.22)'; ctx.strokeStyle = 'rgba(245,250,255,.82)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(p.x,p.y,a.weapon.reach,angle-halfWidth,angle+halfWidth); ctx.arc(p.x,p.y,inner,angle+halfWidth,angle-halfWidth,true); ctx.closePath(); ctx.fill(); ctx.stroke();
      const x1 = p.x + Math.cos(angle) * inner * 0.82, y1 = p.y + Math.sin(angle) * inner * 0.82;
      const x2 = p.x + Math.cos(angle) * (a.weapon.reach + 5), y2 = p.y + Math.sin(angle) * (a.weapon.reach + 5);
      ctx.strokeStyle = 'rgba(255,248,221,.96)'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      ctx.restore();
    }
  }

  function renderEnemies() {
    for (const e of game.enemies) {
      if (e.dead) continue;
      if (e.type === 'spider' && e.state === 'telegraph') {
        ctx.strokeStyle = '#df5b4a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(e.x,e.y,e.radius+18,0,TAU); ctx.stroke();
      }
      if (e.isAlpha) {
        const glow = ctx.createRadialGradient(e.x,e.y,Math.max(2,e.radius*.2),e.x,e.y,e.radius*1.85);
        glow.addColorStop(0,'rgba(246,205,91,.22)'); glow.addColorStop(1,'rgba(229,179,63,0)');
        ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(e.x,e.y,e.radius*1.85,0,TAU); ctx.fill();
        ctx.strokeStyle='rgba(232,190,78,.58)'; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(e.x,e.y,e.radius+12,0,TAU); ctx.stroke();
      }
      ctx.fillStyle = e.hitFlash > 0 ? '#fff2d4' : e.color;
      ctx.beginPath(); ctx.arc(e.x,e.y,e.radius,0,TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = 3; ctx.stroke();
      if (e.type === 'boss') {
        ctx.fillStyle = '#eee2c8'; ctx.font = 'bold 20px Georgia'; ctx.textAlign = 'center'; ctx.fillText(e.name, e.x, e.y - e.radius - 32);
      }
      const barW = e.type === 'boss' ? 180 : e.radius * 2.1;
      ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(e.x-barW/2,e.y-e.radius-19,barW,7);
      ctx.fillStyle = e.type === 'boss' ? '#d34b43' : '#9dc66b'; ctx.fillRect(e.x-barW/2,e.y-e.radius-19,barW*clamp(e.hp/e.maxHp,0,1),7);
    }
  }

  function renderProjectiles() {
    for (const p of game.projectiles) {
      ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x,p.y,p.radius,0,TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.arc(p.x-p.radius*.25,p.y-p.radius*.25,p.radius*.35,0,TAU); ctx.fill();
    }
  }

  function renderDrops() {
    for (const d of game.drops) {
      const y = d.y + Math.sin(d.bob) * 5;
      const rarity = d.item.rarity || 'common';
      ctx.fillStyle = RARITIES[rarity]?.color || '#d8d0bb';
      ctx.beginPath(); ctx.moveTo(d.x,y-12); ctx.lineTo(d.x+12,y); ctx.lineTo(d.x,y+12); ctx.lineTo(d.x-12,y); ctx.closePath(); ctx.fill();
    }
  }

  function renderParticles() {
    for (const p of game.particles) {
      const t = p.t / p.duration;
      ctx.save(); ctx.globalAlpha = 1 - t;
      if (p.type === 'text') {
        ctx.fillStyle = p.color; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(p.text,p.x,p.y-t*42);
      } else if (p.type === 'ring') {
        ctx.strokeStyle = p.color; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(p.x,p.y,lerp(p.r,p.maxR,t),0,TAU); ctx.stroke();
      }
      ctx.restore();
    }
  }

  function indexedItems(collection) {
    return collection.map((item, index) => ({ item, index }));
  }

  function rarityRank(rarity) {
    return RARITY_ORDER.indexOf(rarity || 'common');
  }

  function gearStrength(item) {
    if (!item || item.type !== 'gear') return 0;
    const stats = item.stats || {};
    const attributes = (stats.strength || 0) + (stats.defense || 0) + (stats.vitality || 0) + (stats.agility || 0);
    return (stats.damage || 0) * 4 + (stats.armor || 0) * 3 + (stats.health || 0) * 0.4 + attributes * 6 + (stats.critChance || 0) * 260 + (stats.critDamage || 0) * 45 + (item.level || 1) * 2 + Math.max(0, rarityRank(item.rarity)) * 8;
  }

  function gearGroupKey(item) {
    if (item?.slot === 'leftHand' || item?.slot === 'rightHand') return 'hands';
    if (item?.slot === 'ringLeft' || item?.slot === 'ringRight') return 'ring';
    return item?.slot || 'hands';
  }

  function gearGroupLabel(item) {
    const key = gearGroupKey(item);
    return key === 'hands' ? 'Weapon / Hand' : (SLOT_LABELS[key] || formatName(key));
  }

  function itemCategory(item) {
    if (item?.type === 'gear') return 'gear';
    if (isMaterialOrQuestItem(item)) return 'materials';
    if (item?.type === 'consumable') return 'consumables';
    return 'other';
  }

  function itemCategoryLabel(item) {
    const category = itemCategory(item);
    if (category === 'materials') return item.type === 'quest' ? 'Quest Item' : 'Material / Quest Resource';
    if (category === 'consumables') return 'Consumable / Utility';
    return formatName(item.type || 'item');
  }

  function isMaterialOrQuestItem(item) {
    return item?.type === 'material' || item?.type === 'quest';
  }

  function itemIcon(item) {
    if (!item) return '·';
    if (item.type === 'gear') {
      if (item.slot === 'leftHand' || item.slot === 'rightHand') {
        return ({ dagger: '🗡️', sword: '⚔️', greatsword: '🗡️', spear: '🔱', hammer: '🔨' })[item.weaponType] || '⚔️';
      }
      if (item.slot === 'helmet') return '🪖';
      return ({ chest: '🛡️', legs: '👖', gloves: '🧤', boots: '🥾', ring: '💍', ringLeft: '💍', ringRight: '💍', amulet: '📿', belt: '🧷' })[item.slot] || '🛡️';
    }
    const byId = {
      healing_potion: '🧪', escape_rope: '🪢', survey_charm: '🧭', grand_survey_charm: '🗺️', ancient_survey_seal: '🔶',
      old_bone: '🦴', slime_gel: '🟢', spider_silk: '🕸️', bat_wing: '🦇', zombie_tooth: '🦷',
      shadow_essence: '🌑', cinder_ember: '🔥', iron_ore: '⛏️', dungeon_wood: '🪵', cave_fish: '🐟',
    };
    if (byId[item.id]) return byId[item.id];
    if (item.type === 'material') return '📦';
    if (item.type === 'quest') return '❗';
    if (item.type === 'consumable') return '🎒';
    return '◆';
  }
  function compareItems(a, b) {
    const categoryOrder = { gear: 0, materials: 1, consumables: 2, other: 3 };
    const ac = itemCategory(a), bc = itemCategory(b);
    if (ac !== bc) return categoryOrder[ac] - categoryOrder[bc];
    if (ac === 'gear') {
      const ag = GEAR_GROUP_ORDER.indexOf(gearGroupKey(a));
      const bg = GEAR_GROUP_ORDER.indexOf(gearGroupKey(b));
      if (ag !== bg) return ag - bg;
      const power = gearStrength(b) - gearStrength(a);
      if (Math.abs(power) > 0.001) return power;
      const rarity = rarityRank(b.rarity) - rarityRank(a.rarity);
      if (rarity) return rarity;
    }
    return String(a.name || '').localeCompare(String(b.name || ''));
  }

  function actionButtonHtml(action, item, index) {
    const buttons = [];
    if (action === 'equip' && item.type === 'gear') buttons.push(`<button class="buy-btn equip-item" data-i="${index}">Equip to ${SLOT_LABELS[item.slot] || gearGroupLabel(item)}</button>`);
    if (action === 'equip' && game.scene === 'dungeon') buttons.push(`<button class="buy-btn danger drop-item" data-i="${index}">Drop</button>`);
    if (action === 'deposit') buttons.push(`<button class="buy-btn deposit-item" data-i="${index}">Store ${item.stackable && (item.qty || 1) > 1 ? 'stack' : 'item'}</button>`);
    if (action === 'withdraw') buttons.push(`<button class="buy-btn withdraw-item" data-i="${index}">Take ${item.stackable && (item.qty || 1) > 1 ? 'stack' : 'item'}</button>`);
    return buttons.length ? `<div class="item-card-actions">${buttons.join('')}</div>` : '';
  }
  function renderEntryGrid(entries, action) {
    if (!entries.length) return '';
    return `<div class="inventory-grid">${entries.map(({ item, index }) => `<div class="item-action-wrap">${inventoryCardHtml(item, index)}${actionButtonHtml(action, item, index)}</div>`).join('')}</div>`;
  }

  function renderCollectionGroups(collection, action = '') {
    const entries = indexedItems(collection);
    if (!entries.length) return '<p class="muted">Nothing here.</p>';
    const pieces = [];
    const gearEntries = entries.filter(entry => entry.item.type === 'gear');
    if (gearEntries.length) {
      pieces.push('<div class="inventory-category-heading">Equipment</div>');
      for (const group of GEAR_GROUP_ORDER) {
        const groupEntries = gearEntries.filter(entry => gearGroupKey(entry.item) === group).sort((a, b) => compareItems(a.item, b.item));
        if (!groupEntries.length) continue;
        const label = group === 'hands' ? 'Weapons & Hands' : (SLOT_LABELS[group] || formatName(group));
        pieces.push(`<div class="inventory-subheading"><span>${label}</span><small>${groupEntries.length}</small></div>${renderEntryGrid(groupEntries, action)}`);
      }
    }
    const categorySpecs = [
      ['materials', 'Materials & Quest Items'],
      ['consumables', 'Consumables & Utility'],
      ['other', 'Other Items'],
    ];
    for (const [category, label] of categorySpecs) {
      const categoryEntries = entries.filter(entry => itemCategory(entry.item) === category).sort((a, b) => compareItems(a.item, b.item));
      if (!categoryEntries.length) continue;
      pieces.push(`<div class="inventory-category-heading">${label}</div>${renderEntryGrid(categoryEntries, action)}`);
    }
    return pieces.join('');
  }

  function sellValue(item) {
    if (!item || item.type !== 'gear') return 0;
    const rarityMultiplier = [1, 1.45, 2.2, 3.5, 5.5][Math.max(0, rarityRank(item.rarity))] || 1;
    return Math.max(4, Math.round((5 + gearStrength(item) * 0.42 + (item.level || 1) * 2) * rarityMultiplier));
  }

  function statsText(stats = {}) {
    return Object.entries(stats).map(([k,v]) => {
      if (k === 'critChance') return `+${Math.round(v * 1000) / 10}% Critical Chance`;
      if (k === 'critDamage') return `+${Math.round(v * 100)}% Critical Damage`;
      return `+${v} ${formatName(k)}`;
    }).join(' · ') || 'No bonuses';
  }
  function shuffle(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; }
    return copy;
  }
  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[c]));
  }

  window.__DungeonCampDebug = { game, DODGE, ISO, PLAYER_SPEED_MULTIPLIER, ENEMY_SPEED_MULTIPLIER, createCharacter, normalizeEquipment, generateFloor, enterDungeon, enterRoom, enterCamp, currentFloor, currentRoom, requestAttack, fireProjectile, attemptDodge, isCombatActive, hasNearbyHostileProjectile, isAutoAttackThreatActive, handleBossDeath, updateDodgeChargeStrike, pointToSegmentDistance, screenVectorToWorld, twinStickRoles, doorWasTraversed, showMap, showStorageChest, useLootMagnet, dropInventoryIndex, addCameraShake, hitEnemy, getDerivedStats, depositInventoryIndex, withdrawStorageIndex, depositAllMaterialsAndQuestItems, showInventory, equipInventoryIndex, showSupplyShop, showSellEquipment, sellInventoryByRarity, gearStrength, renderCollectionGroups, spawnEnemy, enemySpawnPosition, updateEnemies, registerAimFlick, startWithCharacter, showFloorSelection, generateCampNpcAppearance, ensureCampNpcAppearances, hideModal, update, render, saveGame };
  resizeCanvas();
  bindControls();
  renderSaveSlots();

  if (new URLSearchParams(location.search).has('test')) {
    window.__dungeonTest = {
      game,
      DODGE,
      pointToSegmentDistance,
      updateDodgeChargeStrike,
      showMap,
      enterDungeon,
      enterRoom,
      requestAttack,
      attemptDodge,
      currentFloor,
      currentRoom,
      createCharacter,
      startWithCharacter,
      showFloorSelection,
      generateCampNpcAppearance,
      ensureCampNpcAppearances,
      hideModal,
      showStorageChest,
      depositInventoryIndex,
      withdrawStorageIndex,
      depositAllMaterialsAndQuestItems,
      showInventory,
      equipInventoryIndex,
      showSupplyShop,
      showSellEquipment,
      sellInventoryByRarity,
      gearStrength,
      renderCollectionGroups,
      spawnEnemy,
      enemySpawnPosition,
      updateEnemies,
    };
  }

})();
