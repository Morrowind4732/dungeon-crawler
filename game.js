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
  const manaFill = $('manaFill');
  const manaText = $('manaText');
  const locationText = $('locationText');
  const roomText = $('roomText');
  const toastEl = $('toast');
  const promptEl = $('prompt');
  const interactionLayer = $('interactionLayer');
  const gatheringMode = $('gatheringMode');
  const gatheringIcon = $('gatheringIcon');
  const gatheringSkillLabel = $('gatheringSkillLabel');
  const gatheringResourceLabel = $('gatheringResourceLabel');
  const gatheringXpText = $('gatheringXpText');
  const gatheringXpFill = $('gatheringXpFill');
  const gatheringActionLabel = $('gatheringActionLabel');
  const gatheringPercentLabel = $('gatheringPercentLabel');
  const gatheringResourceFill = $('gatheringResourceFill');
  const gatheringPlayfield = $('gatheringPlayfield');
  const precisionTarget = $('precisionTarget');
  const fishingChallenge = $('fishingChallenge');
  const fishingMarker = $('fishingMarker');
  const fishingTugBtn = $('fishingTugBtn');
  const gatheringFeedback = $('gatheringFeedback');
  const gatheringLootText = $('gatheringLootText');
  const gatheringSessionXp = $('gatheringSessionXp');
  const gatheringCancelBtn = $('gatheringCancelBtn');
  const touchControls = $('touchControls');
  const joystickZone = $('joystickZone');
  const joystickBase = $('joystickBase');
  const joystickKnob = $('joystickKnob');
  const joystickLabel = $('joystickLabel');
  const secondaryJoystickBase = $('secondaryJoystickBase');
  const secondaryJoystickKnob = $('secondaryJoystickKnob');
  const secondaryJoystickLabel = $('secondaryJoystickLabel');
  const attackBtn = $('attackBtn');
  const bagBtn = $('bagBtn');
  const autoBtn = $('autoBtn');
  const potionBtn = $('potionBtn');
  const abilityBtn = $('abilityBtn');
  const spellTray = $('spellTray');
  const potionTray = $('potionTray');
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
  const SAVE_VERSION = 14;
  const SAVE_PREFIX = 'dungeonCampPrototype_slot_';
  const SLOT_COUNT = 3;
  const DODGE = { maxStamina: 100, combatCost: 25, duration: 0.23, speed: 1120, minSwipe: 42, outsideMargin: 7, maxGestureMs: 330, doubleFlickMs: 650, aimFlickTriggerRatio: 0.40, aimFlickResetRatio: 0.22, regenPerSecond: 24, regenDelay: 0.65, chargeBonusDamage: 0.85, chargeKnockbackMult: 1.6 };
  const PLAYER_SPEED_MULTIPLIER = 2;
  const ENEMY_SPEED_MULTIPLIER = 2;
  const PLAYER_KNOCKBACK_MULTIPLIER = 2;
  const ARCANE_BARRIER_RADIUS = 175;
  const ENEMY_TELEGRAPH_BONUS = 0.25;
  const INTERACTION_RANGE_MULTIPLIER = 1.25;
  const TREE_REGROW_MS = 30000;
  const GATHERING_LEVEL_CAP = 50;
  const GATHERING_DEFS = {
    mining: { icon:'⛏', action:'Mining', passiveInterval:1.72, passivePower:8, goodPower:14, perfectPower:22, targetDuration:1.34 },
    woodcutting: { icon:'🪓', action:'Woodcutting', passiveInterval:1.82, passivePower:7, goodPower:13, perfectPower:21, targetDuration:1.42 },
    fishing: { icon:'🎣', action:'Fishing', passiveInterval:2.05, passivePower:9, goodPower:16, perfectPower:25, markerSpeed:.72 },
  };
  const ORE_TYPES = [
    { id:'copper_ore', name:'Copper Ore', nodeName:'Copper Deposit', color:'#b87345', dark:'#69412f', minLevel:1, weight:46, durability:92, yield:[2,4], xp:30 },
    { id:'iron_ore', name:'Iron Ore', nodeName:'Iron Deposit', color:'#8b9299', dark:'#4c535a', minLevel:1, weight:39, durability:108, yield:[2,5], xp:38 },
    { id:'coal_chunk', name:'Coal', nodeName:'Coal Seam', color:'#3d3a39', dark:'#171616', minLevel:6, weight:18, durability:118, yield:[3,6], xp:45 },
    { id:'silver_ore', name:'Silver Ore', nodeName:'Silver Vein', color:'#c7d0d5', dark:'#727b82', minLevel:14, weight:9, durability:136, yield:[2,4], xp:58 },
  ];

  const ROOM_ARCHETYPES = [
    'open_arena','chasm_bridge','narrow_bridge','lava_islands','flooded_current','poison_bog','ice_floor','sand_sink',
    'pillar_maze','broken_courtyard','four_platforms','spiral_ruin','spike_gallery','blade_clock','collapsing_floor',
    'capture_runes','portal_siege','moving_safe_zone','darkness_chamber','living_dungeon','clockwork_foundry','treasure_vault',
    'frozen_braziers','echo_chamber','rotating_room','time_fracture','gravity_chamber',
    'spider_nest','bat_roost','skeleton_crypt','demon_furnace','statue_gallery','mirror_room','survival_room','healing_altar',
    'silence_chamber','repulsion_chamber','wind_chamber'
  ];
  const ROOM_MODIFIERS = ['none','burning','flooded','frozen','poisoned','darkened','haunted','infested','unstable_magic','healing_pulse','projectile_storm','crumbling','exhausting','arcane_wind','overrun'];
  const SAFE_ROOM_ARCHETYPES = ['open_arena','pillar_maze','broken_courtyard','flooded_current','ice_floor','frozen_braziers'];
  const ROOM_SCALE = { normalW: 1900, normalH: 1700, largeW: 2200, largeH: 1900, bossW: 3000, bossH: 2800 };
  const ENV_DAMAGE_TICK = 0.48;

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


  const SPELLS = {
    fireball: { name: 'Fireball Volley', icon: '🔥', element: 'fire', tier: 'Low', mana: 22, price: 0, description: 'Channel a stream of aimed fireballs for 2.2 seconds. Each hit burns.' },
    frostShards: { name: 'Frost Shards', icon: '❄', element: 'ice', tier: 'Low', mana: 24, price: 180, description: 'Launch three high-damage icy shards that slow enemies.' },
    stoneBurst: { name: 'Stone Burst', icon: '◆', element: 'earth', tier: 'Low', mana: 30, price: 240, description: 'Blast nearby enemies outward with a ring of stone.' },
    mendingWisps: { name: 'Mending Wisps', icon: '✦', element: 'life', tier: 'Low', mana: 68, price: 420, description: 'Expensive, slow healing that restores a small amount over 10 seconds.' },
    rejuvenation: { name: 'Rejuvenation', icon: '✧', element: 'life', tier: 'Medium', mana: 82, price: 1100, description: 'Restore a moderate amount of health over six seconds.' },
    flameWave: { name: 'Flame Wave', icon: '♨', element: 'fire', tier: 'Medium', mana: 45, price: 680, description: 'Scorch a wide cone and leave burning ground behind.' },
    iceNova: { name: 'Ice Nova', icon: '✣', element: 'ice', tier: 'Medium', mana: 50, price: 760, description: 'Freeze and damage every nearby enemy.' },
    tidalSurge: { name: 'Tidal Surge', icon: '≈', element: 'water', tier: 'Medium', mana: 46, price: 720, description: 'Fire a broad surge that batters enemies backward.' },
    arcaneBarrier: { name: 'Arcane Barrier', icon: '⬡', element: 'arcane', tier: 'Medium', mana: 58, price: 900, description: 'Create a five-second ward that destroys projectiles and repels enemies according to their level.' },
    meteor: { name: 'Meteor', icon: '☄', element: 'fire', tier: 'High', mana: 82, price: 1900, description: 'Call down a devastating delayed impact that ignites the floor.' },
    glacialPrison: { name: 'Glacial Prison', icon: '◇', element: 'ice', tier: 'High', mana: 78, price: 2050, description: 'Lock nearby enemies in supernatural cold for several seconds.' },
    earthquake: { name: 'Earthquake', icon: '✹', element: 'earth', tier: 'High', mana: 76, price: 2200, description: 'Release repeated ground shocks around you.' },
    silenceField: { name: 'Silence Field', icon: 'Ø', element: 'arcane', tier: 'High', mana: 72, price: 2400, description: 'Erase hostile projectiles and prevent enemies from firing for six seconds.' },
    greaterRestoration: { name: 'Greater Restoration', icon: '✺', element: 'life', tier: 'High', mana: 96, price: 2800, description: 'Rapidly restore a large portion of health over three seconds.' },
  };
  const SPELL_ORDER = ['fireball','frostShards','stoneBurst','mendingWisps','flameWave','iceNova','tidalSurge','rejuvenation','arcaneBarrier','meteor','glacialPrison','earthquake','silenceField','greaterRestoration'];
  const SPELL_SWAP_COOLDOWN_MS = 15000;
  const ULTIMATE_COOLDOWN_MS = 35000;
  const TAP_CAST = { maxTapMs: 230, maxTravel: 18, sequenceGapMs: 320, doubleResolveMs: 335 };
  const AUTO_CAST_REPEAT_SECONDS = {
    fireball: .16, frostShards: .48, stoneBurst: .7, mendingWisps: 10, rejuvenation: 6,
    flameWave: .82, iceNova: .9, tidalSurge: .62, arcaneBarrier: 5, meteor: 1.35,
    glacialPrison: 7.5, earthquake: .2, silenceField: 6, greaterRestoration: 3,
  };

  const AUTO_EQUIP_STATS = [
    { key: 'damage', label: 'Damage' },
    { key: 'strength', label: 'Strength' },
    { key: 'agility', label: 'Agility' },
    { key: 'reach', label: 'Reach' },
    { key: 'critChance', label: 'Critical Chance' },
    { key: 'critDamage', label: 'Critical Damage' },
    { key: 'defense', label: 'Defense' },
    { key: 'armor', label: 'Armor' },
    { key: 'vitality', label: 'Vitality' },
    { key: 'health', label: 'Maximum Health' },
  ];


  const ASCENSION_PATHS = {
    strength: { name: 'Strength', icon: '⚔', color: '#ef6a54', short: 'STR' },
    agility: { name: 'Agility', icon: '➤', color: '#74d98a', short: 'AGI' },
    magic: { name: 'Magic', icon: '✦', color: '#a88cff', short: 'MAG' },
    vitality: { name: 'Vitality', icon: '♥', color: '#ed6f86', short: 'VIT' },
    stamina: { name: 'Stamina', icon: '◈', color: '#63c9db', short: 'STA' },
    hybrid: { name: 'Crossroad', icon: '✺', color: '#e4bb68', short: 'HYB' },
  };

  // Coordinates form five readable routes around the central hybrid bridge.
  const ASCENSION_NODES = [
    { id:'str_root', path:'strength', x:370, y:330, icon:'⚔', name:'Might', desc:'+6% physical damage.', effect:{ physicalDamage:0.06 } },
    { id:'str_force', path:'strength', x:280, y:280, icon:'✹', name:'Force', desc:'+18% physical knockback.', requires:['str_root'], effect:{ physicalKnockback:0.18 } },
    { id:'str_precision', path:'strength', x:280, y:385, icon:'✦', name:'Keen Edge', desc:'+3.5% physical critical chance.', requires:['str_root'], effect:{ physicalCrit:0.035 } },
    { id:'str_reach', path:'strength', x:190, y:235, icon:'↗', name:'Long Reach', desc:'+10% weapon reach.', requires:['str_force'], effect:{ reach:0.10 } },
    { id:'str_arc', path:'strength', x:185, y:330, icon:'◒', name:'Wide Cleave', desc:'+14° weapon swing arc.', requires:['str_force'], effect:{ arc:14 } },
    { id:'str_crit', path:'strength', x:190, y:430, icon:'✸', name:'Ruinous Blows', desc:'+18% physical critical damage.', requires:['str_precision'], effect:{ critDamage:0.18 } },
    { id:'str_lesser', path:'strength', x:92, y:275, icon:'☠', name:'Reaper', desc:'+12% physical damage to lesser enemies.', requires:['str_reach'], effect:{ lesserPhysicalDamage:0.12 } },
    { id:'str_elite', path:'strength', x:92, y:410, icon:'♛', name:'Giant Killer', desc:'+15% physical damage to alphas and bosses.', requires:['str_crit'], effect:{ elitePhysicalDamage:0.15 } },

    { id:'agi_root', path:'agility', x:385, y:510, icon:'➤', name:'Fleetfoot', desc:'+5% movement speed.', effect:{ moveSpeed:0.05 } },
    { id:'agi_quick1', path:'agility', x:315, y:575, icon:'⚡', name:'Quick Hands', desc:'+8% attack speed.', requires:['agi_root'], effect:{ attackSpeed:0.08 } },
    { id:'agi_move2', path:'agility', x:410, y:610, icon:'➤', name:'Light Step', desc:'+7% movement speed.', requires:['agi_root'], effect:{ moveSpeed:0.07 } },
    { id:'agi_quick2', path:'agility', x:245, y:645, icon:'⚡', name:'Flurry', desc:'+12% attack speed.', requires:['agi_quick1'], effect:{ attackSpeed:0.12 } },
    { id:'agi_finesse', path:'agility', x:320, y:720, icon:'✧', name:'Finesse', desc:'+4% physical critical chance.', requires:['agi_quick2'], effect:{ physicalCrit:0.04 } },
    { id:'agi_dodge', path:'agility', x:430, y:710, icon:'↯', name:'Longstep', desc:'+12% dodge distance.', requires:['agi_move2'], effect:{ dodgeDistance:0.12 } },

    { id:'sta_root', path:'stamina', x:610, y:500, icon:'◈', name:'Deep Breath', desc:'+15 maximum stamina.', effect:{ maxStamina:15 } },
    { id:'sta_pool2', path:'stamina', x:650, y:560, icon:'◈', name:'Great Reserve', desc:'+25 maximum stamina.', requires:['sta_root'], effect:{ maxStamina:25 } },
    { id:'sta_regen1', path:'stamina', x:560, y:592, icon:'↻', name:'Second Wind', desc:'+25% stamina regeneration.', requires:['sta_root'], effect:{ staminaRegen:0.25 } },
    { id:'sta_iframe1', path:'stamina', x:694, y:528, icon:'⬡', name:'Slip Between', desc:'+0.05 seconds of dodge invulnerability.', requires:['sta_pool2'], effect:{ dodgeIframes:0.05 } },
    { id:'sta_cost1', path:'stamina', x:752, y:632, icon:'◇', name:'Efficient Step', desc:'Dodges cost 12% less stamina.', requires:['sta_pool2'], effect:{ dodgeCostReduction:0.12 } },
    { id:'sta_regen2', path:'stamina', x:532, y:716, icon:'↻', name:'Relentless', desc:'+35% stamina regeneration.', requires:['sta_regen1'], effect:{ staminaRegen:0.35 } },
    { id:'sta_iframe2', path:'stamina', x:850, y:575, icon:'⬡', name:'Ghost Step', desc:'+0.07 seconds of dodge invulnerability.', requires:['sta_iframe1'], effect:{ dodgeIframes:0.07 } },
    { id:'sta_cost2', path:'stamina', x:825, y:700, icon:'◇', name:'Endless Motion', desc:'Dodges cost 18% less stamina.', requires:['sta_cost1'], effect:{ dodgeCostReduction:0.18 } },
    { id:'sta_stride', path:'stamina', x:644, y:792, icon:'➤', name:'Marching Heart', desc:'+6% movement speed.', requires:['sta_regen2'], effect:{ moveSpeed:0.06 } },

    { id:'mag_root', path:'magic', x:635, y:330, icon:'✦', name:'Awakened Mind', desc:'+10% maximum mana.', effect:{ maxMana:0.10 } },
    { id:'mag_fire1', path:'magic', x:710, y:226, icon:'🔥', name:'Cinder Lore', desc:'Fire spells cost 5% less mana.', requires:['mag_root'], effect:{ fireCostReduction:0.05 } },
    { id:'mag_fire2', path:'magic', x:808, y:182, icon:'🔥', name:'Flame Lore', desc:'Fire spells cost another 10% less mana.', requires:['mag_fire1'], effect:{ fireCostReduction:0.10 } },
    { id:'mag_fire3', path:'magic', x:916, y:184, icon:'🔥', name:'Inferno Lore', desc:'Fire spells cost another 15% less mana.', requires:['mag_fire2'], effect:{ fireCostReduction:0.15 } },
    { id:'mag_fire4', path:'magic', x:994, y:228, icon:'🔥', name:'Fire Mastery', desc:'Fire spells cost another 20% less mana.', requires:['mag_fire3'], effect:{ fireCostReduction:0.20 } },
    { id:'mag_crit1', path:'magic', x:720, y:335, icon:'✧', name:'Spell Precision', desc:'+5% magic critical chance.', requires:['mag_root'], effect:{ magicCrit:0.05 } },
    { id:'mag_crit2', path:'magic', x:810, y:335, icon:'✧', name:'Perfect Incantation', desc:'+7% magic critical chance.', requires:['mag_crit1'], effect:{ magicCrit:0.07 } },
    { id:'mag_size1', path:'magic', x:666, y:390, icon:'◉', name:'Expanded Weave', desc:'+15% magic projectile size.', requires:['mag_root'], effect:{ projectileSize:0.15 } },
    { id:'mag_size2', path:'magic', x:732, y:360, icon:'◉', name:'Greater Weave', desc:'+20% magic projectile size.', requires:['mag_size1'], effect:{ projectileSize:0.20 } },
    { id:'mag_size3', path:'magic', x:854, y:414, icon:'◉', name:'Colossal Weave', desc:'+30% magic projectile size.', requires:['mag_size2'], effect:{ projectileSize:0.30 } },
    { id:'mag_ward', path:'magic', x:895, y:355, icon:'⬡', name:'Mystic Ward', desc:'Take 15% less magical damage.', requires:['mag_crit2'], effect:{ magicResistance:0.15 } },
    { id:'mag_lesser', path:'magic', x:955, y:415, icon:'☠', name:'Arcane Reaper', desc:'+12% magic damage to lesser enemies.', requires:['mag_size2'], effect:{ lesserMagicDamage:0.12 } },
    { id:'mag_elite', path:'magic', x:972, y:438, icon:'♛', name:'Warden Breaker', desc:'+15% magic damage to alphas and bosses.', requires:['mag_lesser','mag_size3'], effect:{ eliteMagicDamage:0.15 } },
    { id:'mag_economy', path:'magic', x:950, y:330, icon:'∞', name:'Archmage Economy', desc:'All spells cost 50% less mana. Multiplies with school reductions.', requires:['mag_fire4','mag_size3'], effect:{ allCostReduction:0.50 } },

    { id:'vit_root', path:'vitality', x:500, y:255, icon:'♥', name:'Hardy', desc:'+10% maximum health.', effect:{ maxHealth:0.10 } },
    { id:'vit_hp2', path:'vitality', x:340, y:205, icon:'♥', name:'Great Constitution', desc:'+15% maximum health.', requires:['vit_root'], effect:{ maxHealth:0.15 } },
    { id:'vit_dr1', path:'vitality', x:600, y:215, icon:'🛡', name:'Thick Skin', desc:'Take 5% less damage from all sources.', requires:['vit_root'], effect:{ damageReduction:0.05 } },
    { id:'vit_lesser', path:'vitality', x:214, y:132, icon:'⛨', name:'Unshaken', desc:'Take 12% less damage from lesser enemies.', requires:['vit_hp2'], effect:{ lesserReduction:0.12 } },
    { id:'vit_elite', path:'vitality', x:748, y:132, icon:'♛', name:'Warden’s Resolve', desc:'Take 15% less damage from alphas and bosses.', requires:['vit_dr1'], effect:{ eliteReduction:0.15 } },
    { id:'vit_keep1', path:'vitality', x:410, y:166, icon:'✋', name:'Tenacity I', desc:'Keep 1 additional inventory slot on death.', requires:['vit_root'], effect:{ guaranteedKeeps:1 } },
    { id:'vit_keep2', path:'vitality', x:352, y:112, icon:'✋', name:'Tenacity II', desc:'Keep 1 more inventory slot on death.', requires:['vit_keep1'], effect:{ guaranteedKeeps:1 } },
    { id:'vit_keep3', path:'vitality', x:296, y:60, icon:'✋', name:'Tenacity III', desc:'Keep 1 more inventory slot on death.', requires:['vit_keep2'], effect:{ guaranteedKeeps:1 } },
    { id:'vit_keep4', path:'vitality', x:430, y:58, icon:'✋', name:'Tenacity IV', desc:'Keep 1 more inventory slot on death.', requires:['vit_keep3'], effect:{ guaranteedKeeps:1 } },
    { id:'vit_keep5', path:'vitality', x:365, y:14, icon:'✋', name:'Tenacity V', desc:'Keep 1 more inventory slot on death.', requires:['vit_keep4'], effect:{ guaranteedKeeps:1 } },

    { id:'hy_arcane_force', path:'hybrid', hybrid:['strength','magic'], x:522, y:96, icon:'✺', name:'Arcane Force', desc:'+35% knockback from spells.', requires:['str_root','mag_root'], effect:{ magicKnockback:0.35 } },
    { id:'hy_arcane_strike', path:'hybrid', hybrid:['strength','magic'], x:590, y:158, icon:'🔥', name:'Arcane Fire Strike', desc:'Weapon swings project a fire arc beyond the blade, dealing separate fire damage.', requires:['hy_arcane_force','str_arc','mag_fire1'], effect:{ arcaneFireStrike:1 } },
    { id:'hy_battle_tempo', path:'hybrid', hybrid:['strength','agility'], x:198, y:520, icon:'⚔', name:'Battle Tempo', desc:'+16% attack speed.', requires:['str_precision','agi_root'], effect:{ attackSpeed:0.16 } },
    { id:'hy_crushing', path:'hybrid', hybrid:['strength','stamina'], x:380, y:760, icon:'💥', name:'Crushing Momentum', desc:'Dodge attacks deal 35% more damage and 25% more knockback.', requires:['str_force','sta_root'], effect:{ dodgeChargeDamage:0.35, dodgeChargeKnockback:0.25 } },
    { id:'hy_windrunner', path:'hybrid', hybrid:['agility','stamina'], x:510, y:802, icon:'〽', name:'Windrunner', desc:'+8% movement speed and dodges cost 8% less stamina.', requires:['agi_move2','sta_regen1'], effect:{ moveSpeed:0.08, dodgeCostReduction:0.08 } },
    { id:'hy_spellstep', path:'hybrid', hybrid:['magic','stamina'], x:770, y:764, icon:'✦', name:'Spellstep', desc:'+40% mana regeneration.', requires:['mag_root','sta_root'], effect:{ manaRegen:0.40 } },
    { id:'hy_spellguard', path:'hybrid', hybrid:['magic','vitality'], x:850, y:286, icon:'⬡', name:'Spellguard', desc:'Take another 15% less magical damage.', requires:['mag_ward','vit_root'], effect:{ magicResistance:0.15 } },
    { id:'hy_ironresolve', path:'hybrid', hybrid:['strength','vitality'], x:258, y:232, icon:'🛡', name:'Iron Resolve', desc:'+10% physical damage to elites and 5% elite damage resistance.', requires:['str_root','vit_root'], effect:{ elitePhysicalDamage:0.10, eliteReduction:0.05 } },
    { id:'hy_laststand', path:'hybrid', hybrid:['vitality','stamina'], x:806, y:486, icon:'✚', name:'Lasting Breath', desc:'Regenerate 0.8% maximum health per second after avoiding damage.', requires:['vit_dr1','sta_root'], effect:{ healthRegen:0.008 } },
  ];
  const ASCENSION_NODE_MAP = Object.fromEntries(ASCENSION_NODES.map(node => [node.id, node]));
  const ASCENSION_STAGE = { width: 1160, height: 900 };
  const ASCENSION_TOME_CHANCE = { normal: 0.0006, alpha: 0.0025, boss: 0.01 };

  const CAMP_VISITOR_PATH = [
    { x: 120, y: 1160 },
    { x: 260, y: 1085 },
    { x: 420, y: 990 },
    { x: 610, y: 905 },
    { x: 760, y: 845 },
  ];

  const OVERWORLD_ZONES = {
    forestCrossroads: {
      id: 'forestCrossroads',
      name: 'Greenwood Crossroads',
      subtitle: 'A forest clearing where three roads divide.',
      w: 2800, h: 2400,
      floor: '#29482d', grid: 'rgba(188,226,179,.045)',
      spawns: {
        // The camp road leaves the visual left side of camp, so Greenwood now receives the player on its visual right side.
        camp: { x: 2520, y: 1200, facing: { x: -1, y: 0 } },
        riverForest: { x: 260, y: 1200, facing: { x: 1, y: 0 } },
        rockyCanyon: { x: 1400, y: 260, facing: { x: 0, y: 1 } },
        farmPlots: { x: 1400, y: 2140, facing: { x: 0, y: -1 } },
      },
      gates: [
        { id:'riverRoad', x:90, y:1200, signX:245, signY:970, target:'riverForest', entry:'forestCrossroads', label:'River Forest', direction:'Upper-left path' },
        { id:'canyonRoad', x:1400, y:90, signX:1605, signY:255, target:'rockyCanyon', entry:'forestCrossroads', label:'Rocky Canyon', direction:'Upper-right path' },
        { id:'farmRoad', x:1400, y:2340, signX:1180, signY:2160, target:'farmPlots', entry:'forestCrossroads', label:'Farm Plots', direction:'Lower-left path' },
        { id:'campRoad', x:2710, y:1200, signX:2490, signY:1405, target:'camp', entry:'world', label:'Expedition Camp', direction:'Lower-right road' },
      ],
    },
    riverForest: {
      id: 'riverForest',
      name: 'Riverwood',
      subtitle: 'A forested basin divided by a broad flowing river.',
      w: 3000, h: 2400,
      floor: '#315137', grid: 'rgba(188,226,179,.04)',
      spawns: {
        forestCrossroads: { x: 2740, y: 1200, facing: { x: -1, y: 0 } },
      },
      gates: [
        { id:'forestReturn', x:2910, y:1200, signX:2700, signY:985, target:'forestCrossroads', entry:'riverForest', label:'Greenwood Crossroads', direction:'Lower-right path' },
      ],
    },
    rockyCanyon: {
      id: 'rockyCanyon',
      name: 'Stonebreak Canyon',
      subtitle: 'A wide rocky basin where exposed ore formations shift with every visit.',
      w: 3000, h: 2500,
      floor: '#76593f', grid: 'rgba(242,213,169,.045)',
      spawns: {
        forestCrossroads: { x: 1500, y: 2240, facing: { x: 0, y: -1 } },
      },
      gates: [
        { id:'forestReturn', x:1500, y:2410, signX:1265, signY:2205, target:'forestCrossroads', entry:'rockyCanyon', label:'Greenwood Crossroads', direction:'Lower-left trail' },
      ],
    },
    farmPlots: {
      id: 'farmPlots',
      name: 'Oldfield Farms',
      subtitle: 'Open plots reserved for future farming and harvesting.',
      w: 3000, h: 2400,
      floor: '#52653a', grid: 'rgba(230,226,181,.045)',
      spawns: {
        // The farm road leaves Greenwood at the lower-left, so the farm receives the player at the opposite upper-right edge.
        forestCrossroads: { x: 1500, y: 260, facing: { x: 0, y: 1 } },
      },
      gates: [
        { id:'forestReturn', x:1500, y:90, signX:1705, signY:270, target:'forestCrossroads', entry:'farmPlots', label:'Greenwood Crossroads', direction:'Upper-right path' },
      ],
    },
  };

  const GREENWOOD_PATHS = [
    // West / River Forest
    [{x:1400,y:1200},{x:1190,y:1095},{x:980,y:1135},{x:760,y:1260},{x:525,y:1300},{x:300,y:1210},{x:90,y:1200}],
    // North / Rocky Canyon
    [{x:1400,y:1200},{x:1515,y:1005},{x:1470,y:815},{x:1325,y:630},{x:1290,y:420},{x:1400,y:90}],
    // South / Farm Plots
    [{x:1400,y:1200},{x:1260,y:1410},{x:1305,y:1610},{x:1470,y:1785},{x:1510,y:1990},{x:1400,y:2340}],
    // East / Expedition Camp
    [{x:1400,y:1200},{x:1605,y:1305},{x:1815,y:1260},{x:2010,y:1135},{x:2225,y:1100},{x:2470,y:1200},{x:2710,y:1200}],
  ];

  const FARM_ENTRY_PATH = [
    {x:1500,y:90},{x:1415,y:320},{x:1490,y:540},{x:1605,y:760},{x:1500,y:1120},{x:1500,y:1280},
  ];


  const POTION_DEFS = {
    lesser_health_potion: { id:'lesser_health_potion', name:'Lesser Health Potion', category:'health', restore:28, icon:'🧪', description:'Restores 28 health.', basePrice:75 },
    health_potion: { id:'health_potion', name:'Health Potion', category:'health', restore:55, icon:'🧪', description:'Restores 55 health.', basePrice:100 },
    greater_health_potion: { id:'greater_health_potion', name:'Greater Health Potion', category:'health', restore:95, icon:'🧪', description:'Restores 95 health.', basePrice:165 },
    huge_health_potion: { id:'huge_health_potion', name:'Huge Health Potion', category:'health', restore:160, icon:'🧪', description:'Restores 160 health.', basePrice:285 },
    lesser_mana_potion: { id:'lesser_mana_potion', name:'Lesser Mana Potion', category:'mana', restore:24, icon:'🔮', description:'Restores 24 mana.', basePrice:70 },
    mana_potion: { id:'mana_potion', name:'Mana Potion', category:'mana', restore:50, icon:'🔮', description:'Restores 50 mana.', basePrice:98 },
    greater_mana_potion: { id:'greater_mana_potion', name:'Greater Mana Potion', category:'mana', restore:88, icon:'🔮', description:'Restores 88 mana.', basePrice:160 },
    huge_mana_potion: { id:'huge_mana_potion', name:'Huge Mana Potion', category:'mana', restore:150, icon:'🔮', description:'Restores 150 mana.', basePrice:275 },
    lesser_stamina_potion: { id:'lesser_stamina_potion', name:'Lesser Stamina Potion', category:'stamina', restore:22, icon:'⚡', description:'Restores 22 stamina.', basePrice:65 },
    stamina_potion: { id:'stamina_potion', name:'Stamina Potion', category:'stamina', restore:45, icon:'⚡', description:'Restores 45 stamina.', basePrice:92 },
    greater_stamina_potion: { id:'greater_stamina_potion', name:'Greater Stamina Potion', category:'stamina', restore:78, icon:'⚡', description:'Restores 78 stamina.', basePrice:150 },
    huge_stamina_potion: { id:'huge_stamina_potion', name:'Huge Stamina Potion', category:'stamina', restore:132, icon:'⚡', description:'Restores 132 stamina.', basePrice:255 },
  };
  const POTION_ORDER = {
    health: ['lesser_health_potion','health_potion','greater_health_potion','huge_health_potion'],
    mana: ['lesser_mana_potion','mana_potion','greater_mana_potion','huge_mana_potion'],
    stamina: ['lesser_stamina_potion','stamina_potion','greater_stamina_potion','huge_stamina_potion'],
  };
  const POTION_SHORT = { health:'HP', mana:'MP', stamina:'STA' };

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
    spellEffects: [],
    drops: [],
    particles: [],
    roomFeatures: [],
    roomEnvironment: null,
    campNpcs: [],
    currentRoomId: null,
    roomWorld: { w: 1300, h: 1300 },
    camera: { x: 0, y: 0 },
    input: { x: 0, y: 0, aimX: 0, aimY: -1, aimMode: false, keys: new Set(), manualHeld: false, interactQueued: false },
    joystick: {
      first: { pointerId: null, active: false, role: null, originX: 0, originY: 0, vectorX: 0, vectorY: 0, startX: 0, startY: 0, lastX: 0, lastY: 0, startTime: 0, maxDistance: 0, dodgeThreshold: 0, aimFlickArmed: false, aimFlickCounted: false },
      second: { pointerId: null, active: false, role: null, originX: 0, originY: 0, vectorX: 0, vectorY: 0, startX: 0, startY: 0, lastX: 0, lastY: 0, startTime: 0, maxDistance: 0, dodgeThreshold: 0, aimFlickArmed: false, aimFlickCounted: false },
    },
    tapCasting: {
      left: { count: 0, lastTime: 0, timer: null },
      right: { count: 0, lastTime: 0, timer: null },
    },
    spellAutoCast: { activeSlots: [false, false, false, false], delays: [0, 0, 0, 0], channelCursor: 0 },
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
    overworldZone: null,
    overworldResources: [],
    gathering: null,
    worldTransitionCooldown: 0,
    lootMagnetTimer: 0,
    cameraShake: { time: 0, intensity: 0 },
    aimFlick: { time: 0, x: 0, y: 0 },
    spellTraySignature: '',
    potionTraySignature: '',
    visualLoad: { fireHazards:0, projectiles:0, fireQuality:1, projectileQuality:1 },
  };

  let activeRandom = null;
  function seededRandom(seed) {
    let state = (Number(seed) || 1) >>> 0;
    return () => { state += 0x6D2B79F5; let t = state; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function randomUnit() { return activeRandom ? activeRandom() : Math.random(); }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function rand(min, max) { return min + randomUnit() * (max - min); }
  function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
  function choose(arr) { return arr[Math.floor(randomUnit() * arr.length)]; }
  function chance(p) { return randomUnit() < p; }
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
      knownSpells: ['fireball'],
      equippedSpells: ['fireball', null, null, null, null],
      spellSwapAvailableAt: 0,
      ultimateReadyAt: 0,
      ascension: { levelPointsGranted: 1, generalPoints: 1, pathPoints: { strength:0, agility:0, magic:0, vitality:0, stamina:0 }, spentNodes: {}, revision: 1 },
      bagUpgrades: 0,
      skills: {
        mining: { level: 1, xp: 0 }, smithing: { level: 1, xp: 0 },
        fishing: { level: 1, xp: 0 }, woodcutting: { level: 1, xp: 0 },
      },
      equipment: {
        helmet: null, amulet: null, chest: null, leftHand: starterSword, rightHand: null, gloves: null,
        ringLeft: null, ringRight: null, belt: null, legs: null, boots: null,
      },
      inventory: [
        { id: 'health_potion', name: 'Health Potion', type: 'consumable', qty: 2, stackable: true, description: 'Restores 55 health.' },
        { id: 'lesser_mana_potion', name: 'Lesser Mana Potion', type: 'consumable', qty: 1, stackable: true, description: 'Restores 24 mana.' },
        { id: 'lesser_stamina_potion', name: 'Lesser Stamina Potion', type: 'consumable', qty: 1, stackable: true, description: 'Restores 22 stamina.' },
        { id: 'escape_rope', name: 'Escape Rope', type: 'consumable', qty: 1, stackable: true, description: 'Safely leave a dungeon with all inventory.' },
      ],
      potionLoadout: { health: 'health_potion', mana: 'lesser_mana_potion', stamina: 'lesser_stamina_potion' },
      activePotionSlot: 'health',
      inventoryCapacity: 30,
      storage: [],
      storageCapacity: 120,
      currentHealth: 100,
      maxFloorUnlocked: 1,
      floors: {},
      settings: { handedness: 'standard', joystick: 'fixed', controlScale: 1, viewMode: 'isometric' },
      campNpcs: [...generateCampNpcs(), ...generateServiceNpcs()],
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
      Mage: { chestStyle: 'robe', weapon: 'staff', helmet: choose(['hood', 'none']), shield: false },
      Blacksmith: { chestStyle: 'apron', weapon: 'hammer', helmet: choose(['openHelm', 'cap']), shield: false },
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

  function generateServiceNpcs() {
    return [
      {
        id: uid('npc'), name: 'Ilyra', role: 'Mage', serviceType: 'mage',
        x: 555, y: 555, homeX: 555, homeY: 555, wanderRadius: 115,
        vx: 10, vy: -7, wanderTimer: 1.2, facingX: 1, facingY: 0,
        appearance: generateCampNpcAppearance('Mage'), locked: true,
      },
      {
        id: uid('npc'), name: 'Bram', role: 'Blacksmith', serviceType: 'bagSmith',
        x: 1265, y: 590, homeX: 1265, homeY: 590, wanderRadius: 105,
        vx: -8, vy: 6, wanderTimer: 2.1, facingX: -1, facingY: 0,
        appearance: generateCampNpcAppearance('Blacksmith'), locked: true,
      },
    ];
  }

  function ensureCampServices(character) {
    character.campNpcs ||= [];
    let changed = false;
    for (const service of generateServiceNpcs()) {
      if (character.campNpcs.some(npc => npc.serviceType === service.serviceType)) continue;
      character.campNpcs.push(service);
      changed = true;
    }
    return changed;
  }

  function spellSlotsUnlocked(level = game.character?.level || 1) {
    return clamp(1 + Math.floor(Math.max(0, level) / 10), 1, 5);
  }

  function normalizeMagic(character) {
    character.knownSpells = Array.isArray(character.knownSpells) ? character.knownSpells.filter(id => SPELLS[id]) : [];
    if (!character.knownSpells.includes('fireball')) character.knownSpells.unshift('fireball');
    character.equippedSpells = Array.isArray(character.equippedSpells) ? character.equippedSpells.slice(0, 5) : ['fireball'];
    while (character.equippedSpells.length < 5) character.equippedSpells.push(null);
    character.equippedSpells = character.equippedSpells.map(id => character.knownSpells.includes(id) ? id : null);
    if (!character.equippedSpells[0]) character.equippedSpells[0] = 'fireball';
    if (character.equippedSpells[4] && SPELLS[character.equippedSpells[4]]?.tier !== 'High') character.equippedSpells[4] = null;
    character.spellSwapAvailableAt = Number(character.spellSwapAvailableAt) || 0;
    character.ultimateReadyAt = Number(character.ultimateReadyAt) || 0;
    character.bagUpgrades = Number(character.bagUpgrades) || Math.max(0, Math.round(((character.inventoryCapacity || 30) - 30) / 5));
  }

  function normalizePotions(character) {
    character.inventory = Array.isArray(character.inventory) ? character.inventory : [];
    for (const item of character.inventory) {
      if (item.id === 'healing_potion') item.id = 'health_potion';
      const potion = POTION_DEFS[item.id];
      if (!potion) continue;
      item.name = potion.name;
      item.type = 'consumable';
      item.stackable = true;
      item.description = potion.description;
      item.qty = Math.max(1, Number(item.qty) || 1);
    }
    character.potionLoadout ||= {};
    for (const category of Object.keys(POTION_ORDER)) {
      const preferred = character.potionLoadout[category];
      character.potionLoadout[category] = POTION_DEFS[preferred]?.category === category ? preferred : (POTION_ORDER[category].find(id => itemCountInCollection(character.inventory, id) > 0) || POTION_ORDER[category][1] || POTION_ORDER[category][0]);
    }
    if (!['health','mana','stamina'].includes(character.activePotionSlot)) character.activePotionSlot = 'health';
  }

  function normalizeAscension(character) {
    const hadAscension = !!character.ascension;
    const asc = character.ascension ||= {};
    asc.levelPointsGranted = Math.max(0, Math.floor(Number(asc.levelPointsGranted) || 0));
    asc.generalPoints = Math.max(0, Math.floor(Number(asc.generalPoints) || 0));
    asc.pathPoints ||= {};
    for (const path of ['strength','agility','magic','vitality','stamina']) asc.pathPoints[path] = Math.max(0, Math.floor(Number(asc.pathPoints[path]) || 0));
    asc.spentNodes ||= {};
    for (const id of Object.keys(asc.spentNodes)) {
      if (!ASCENSION_NODE_MAP[id]) delete asc.spentNodes[id];
      else asc.spentNodes[id] = clamp(Math.floor(Number(asc.spentNodes[id]) || 0), 0, ASCENSION_NODE_MAP[id].maxRank || 1);
    }
    const currentLevel = Math.max(1, Math.floor(Number(character.level) || 1));
    if (!hadAscension) {
      asc.levelPointsGranted = currentLevel;
      asc.generalPoints += currentLevel;
    } else if (asc.levelPointsGranted < currentLevel) {
      asc.generalPoints += currentLevel - asc.levelPointsGranted;
      asc.levelPointsGranted = currentLevel;
    }
    asc.revision = Math.max(1, Math.floor(Number(asc.revision) || 1));
    return asc;
  }

  function ascensionRank(id) {
    return Math.max(0, Number(game.character?.ascension?.spentNodes?.[id]) || 0);
  }

  function getAscensionBonuses() {
    const c = game.character;
    const empty = {
      physicalDamage:0, physicalKnockback:0, physicalCrit:0, critDamage:0, reach:0, arc:0,
      lesserPhysicalDamage:0, elitePhysicalDamage:0, lesserMagicDamage:0, eliteMagicDamage:0, moveSpeed:0, attackSpeed:0, dodgeDistance:0,
      maxStamina:0, staminaRegen:0, dodgeIframes:0, dodgeCostReduction:0, maxMana:0,
      fireCostReduction:0, allCostReduction:0, magicCrit:0, projectileSize:0, magicResistance:0,
      maxHealth:0, damageReduction:0, lesserReduction:0, eliteReduction:0, guaranteedKeeps:0,
      magicKnockback:0, arcaneFireStrike:0, dodgeChargeDamage:0, dodgeChargeKnockback:0,
      manaRegen:0, healthRegen:0,
    };
    if (!c?.ascension) return empty;
    const revision = c.ascension.revision || 1;
    if (game.ascensionBonusCache?.characterId === c.id && game.ascensionBonusCache.revision === revision) return game.ascensionBonusCache.bonuses;
    const bonuses = { ...empty };
    for (const [id, rawRank] of Object.entries(c.ascension.spentNodes || {})) {
      const node = ASCENSION_NODE_MAP[id];
      const rank = Math.max(0, Number(rawRank) || 0);
      if (!node || rank <= 0) continue;
      for (const [key, value] of Object.entries(node.effect || {})) bonuses[key] = (bonuses[key] || 0) + value * rank;
    }
    bonuses.fireCostReduction = clamp(bonuses.fireCostReduction, 0, .85);
    bonuses.allCostReduction = clamp(bonuses.allCostReduction, 0, .75);
    bonuses.damageReduction = clamp(bonuses.damageReduction, 0, .55);
    bonuses.lesserReduction = clamp(bonuses.lesserReduction, 0, .65);
    bonuses.eliteReduction = clamp(bonuses.eliteReduction, 0, .65);
    bonuses.magicResistance = clamp(bonuses.magicResistance, 0, .70);
    bonuses.dodgeCostReduction = clamp(bonuses.dodgeCostReduction, 0, .65);
    game.ascensionBonusCache = { characterId:c.id, revision, bonuses };
    return bonuses;
  }

  function ascensionRequirementsMet(node) {
    return (node?.requires || []).every(id => ascensionRank(id) >= 1);
  }

  function ascensionAvailableCurrency(node) {
    const asc = game.character?.ascension;
    if (!asc || !node) return { available:0, source:'none' };
    const pathPoints = node.path !== 'hybrid' ? (asc.pathPoints[node.path] || 0) : 0;
    if (pathPoints > 0) return { available:pathPoints, source:node.path };
    return { available:asc.generalPoints || 0, source:'general' };
  }

  function purchaseAscensionNode(nodeId) {
    const node = ASCENSION_NODE_MAP[nodeId];
    const asc = game.character?.ascension;
    if (!node || !asc) return false;
    const rank = ascensionRank(nodeId);
    const maxRank = node.maxRank || 1;
    if (rank >= maxRank) { toast(`${node.name} is already awakened.`); return false; }
    if (!ascensionRequirementsMet(node)) { toast('Follow the connected route first.'); return false; }
    const currency = ascensionAvailableCurrency(node);
    if (currency.available < 1) { toast(node.path === 'hybrid' ? 'A general Ascension Point is required.' : 'No Ascension Points are available.'); return false; }
    const old = game.player ? { maxHealth:game.player.maxHealth, maxMana:game.player.maxMana, maxStamina:game.player.maxStamina } : null;
    if (currency.source === 'general') asc.generalPoints -= 1;
    else asc.pathPoints[currency.source] -= 1;
    asc.spentNodes[nodeId] = rank + 1;
    asc.revision = (asc.revision || 1) + 1;
    game.ascensionBonusCache = null;
    if (game.player) {
      const d = getDerivedStats();
      game.player.maxHealth = d.maxHealth;
      game.player.maxMana = d.maxMana;
      game.player.maxStamina = d.maxStamina;
      if (old) {
        game.player.health = Math.min(d.maxHealth, game.player.health + Math.max(0, d.maxHealth - old.maxHealth));
        game.player.mana = Math.min(d.maxMana, game.player.mana + Math.max(0, d.maxMana - old.maxMana));
        game.player.stamina = Math.min(d.maxStamina, game.player.stamina + Math.max(0, d.maxStamina - old.maxStamina));
      }
    }
    saveGame();
    toast(`${node.name} awakened.`);
    return true;
  }

  function spellManaCost(spellId) {
    const spell = SPELLS[spellId];
    if (!spell) return 0;
    const b = getAscensionBonuses();
    const schoolMultiplier = spell.element === 'fire' ? (1 - b.fireCostReduction) : 1;
    const generalMultiplier = 1 - b.allCostReduction;
    return Math.max(1, Math.round(spell.mana * schoolMultiplier * generalMultiplier));
  }

  function ascensionTomeItem(path) {
    const data = ASCENSION_PATHS[path];
    return {
      id:`ascension_tome_${path}`, name:`Tome of ${data.name}`, type:'consumable', qty:1, stackable:true,
      rarity:'legendary', ascensionPath:path, description:`Consume to gain 1 ${data.name} Ascension Point. It can only awaken nodes on the ${data.name} path.`
    };
  }

  function maybeDropAscensionTome(enemy) {
    const rate = enemy.type === 'boss' ? ASCENSION_TOME_CHANCE.boss : enemy.isAlpha ? ASCENSION_TOME_CHANCE.alpha : ASCENSION_TOME_CHANCE.normal;
    if (!chance(rate)) return false;
    const path = choose(['strength','agility','magic','vitality','stamina']);
    const angle = rand(0, TAU);
    spawnDrop(enemy.x + Math.cos(angle) * 38, enemy.y + Math.sin(angle) * 38, ascensionTomeItem(path));
    game.particles.push({ type:'ring', x:enemy.x, y:enemy.y, r:18, maxR:90, t:0, duration:.85, color:ASCENSION_PATHS[path].color });
    return true;
  }

  function useAscensionTome(index) {
    const item = game.character?.inventory?.[index];
    const path = item?.ascensionPath;
    if (!path || !ASCENSION_PATHS[path]) return;
    normalizeAscension(game.character);
    if ((item.qty || 1) > 1) item.qty -= 1;
    else game.character.inventory.splice(index, 1);
    game.character.ascension.pathPoints[path] += 1;
    game.character.ascension.revision += 1;
    saveGame();
    toast(`${ASCENSION_PATHS[path].name} Ascension Point gained!`, 2200);
    showInventory();
  }

  function ensureCampNpcAppearances(npcs) {
    let changed = false;
    for (const npc of npcs || []) {
      if (!npc.appearance) {
        npc.appearance = generateCampNpcAppearance(npc.role);
        changed = true;
      }
      if (npc.homeX == null || npc.homeY == null) { npc.homeX = npc.x; npc.homeY = npc.y; changed = true; }
      if (npc.wanderRadius == null) { npc.wanderRadius = npc.serviceType ? 110 : 118; changed = true; }
      npc.facingX = Number(npc.facingX) || (npc.vx < 0 ? -1 : 1);
      npc.facingY = Number(npc.facingY) || 0;
    }
    return changed;
  }

  function createQuestCampNpc(slotIndex = 0) {
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
    const target = choose(targets);
    const amount = Math.round(randInt(target.min, target.max) / 5) * 5;
    const role = choose(roles);
    const homeX = 600 + slotIndex * 280 + rand(-80, 80);
    const homeY = 780 + rand(-180, 160);
    return {
      id: uid('npc'),
      name: choose(first),
      role,
      x: homeX,
      y: homeY,
      homeX,
      homeY,
      wanderRadius: 118,
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
  }

  function generateCampNpcs() {
    return Array.from({ length: 3 }, (_, i) => createQuestCampNpc(i));
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
    if (game.player) { game.character.currentHealth = Math.round(game.player.health); game.character.currentMana = Math.round(game.player.mana); }
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

  function normalizeSkillsAndWorld(character) {
    character.skills ||= {};
    for (const skillName of ['mining','smithing','fishing','woodcutting']) {
      const skill = character.skills[skillName] ||= { level:1, xp:0 };
      skill.level = clamp(Math.floor(Number(skill.level) || 1), 1, GATHERING_LEVEL_CAP);
      skill.xp = Math.max(0, Math.floor(Number(skill.xp) || 0));
    }
    character.worldResources ||= {};
    character.worldResources.treeStates ||= {};
    const now = Date.now();
    for (const [id, state] of Object.entries(character.worldResources.treeStates)) {
      state.respawnAt = Math.max(0, Number(state.respawnAt) || 0);
      state.remaining = Math.max(0, Number(state.remaining) || 0);
      state.yieldGranted = Math.max(0, Math.floor(Number(state.yieldGranted) || 0));
      if (state.respawnAt && state.respawnAt <= now) delete character.worldResources.treeStates[id];
    }
  }

  function startWithCharacter(slot, character) {
    game.slot = slot;
    game.character = character;
    game.character.version = SAVE_VERSION;
    game.character.settings ||= { handedness: 'standard', joystick: 'fixed', controlScale: 1, viewMode: 'isometric' };
    game.character.settings.viewMode ||= 'isometric';
    game.character.settings.autoEquipPrimary ||= 'damage';
    game.character.settings.autoEquipSecondary ||= 'strength';
    game.character.settings.autoDropRarities = Array.isArray(game.character.settings.autoDropRarities)
      ? game.character.settings.autoDropRarities.filter(rarity => RARITY_ORDER.includes(rarity))
      : [];
    normalizeEquipment(game.character);
    normalizeSkillsAndWorld(game.character);
    normalizeFloorPersistence(game.character);
    normalizeMagic(game.character);
    normalizePotions(game.character);
    normalizeAscension(game.character);
    game.character.campNpcs ||= generateCampNpcs();
    ensureCampServices(game.character);
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
      mana: Math.max(1, Math.min(derived.maxMana, Number(game.character.currentMana) || derived.maxMana)), maxMana: derived.maxMana,
      facing: { x: 0, y: -1 },
      attackCooldown: 0,
      attack: null,
      invuln: 0,
      abilityCooldown: 0,
      regenTimer: 0,
      stamina: derived.maxStamina,
      maxStamina: derived.maxStamina,
      staminaRegenDelay: 0,
      dodgeCooldown: 0,
      dodge: null,
      burnTimer: 0, burnTick: 0,
      poisonTimer: 0, poisonTick: 0,
      confusionTimer: 0, slowTimer: 0,
      healOverTime: null, barrierTimer: 0, silenceTimer: 0, spellCast: null, timeSinceDamage: 999,
    };
  }

  function getDerivedStats() {
    const c = game.character;
    const asc = getAscensionBonuses();
    const out = {
      strength: c.stats.strength,
      defense: c.stats.defense,
      vitality: c.stats.vitality,
      agility: c.stats.agility,
      damage: 0, armor: 0,
      maxHealth: 75 + c.stats.vitality * 7,
      maxMana: 86 + c.level * 4 + c.stats.vitality * 2,
      maxStamina: DODGE.maxStamina + asc.maxStamina,
      speed: (200 + c.stats.agility * 4) * PLAYER_SPEED_MULTIPLIER * (1 + asc.moveSpeed),
      attackSpeedMult: 1 + (c.abilities.attackSpeed || 0) * 0.06 + asc.attackSpeed,
      knockbackMult: 1 + (c.abilities.knockback || 0) * 0.12 + asc.physicalKnockback,
      critChance: clamp(0.05 + c.stats.agility * 0.0035 + (c.abilities.precision || 0) * 0.025 + asc.physicalCrit, 0.05, 0.75),
      magicCritChance: clamp(0.03 + asc.magicCrit, 0.03, 0.65),
      critDamage: 1.75 + asc.critDamage,
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
    out.maxHealth = Math.round(out.maxHealth * (1 + asc.maxHealth));
    out.maxMana = Math.round(out.maxMana * (1 + asc.maxMana));
    out.maxStamina = Math.round(out.maxStamina);
    out.critChance = clamp(out.critChance, 0.05, 0.75);
    out.magicCritChance = clamp(out.magicCritChance, 0.03, 0.65);
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
      reach: base.reach * (1 + (game.character.abilities.reachBoost || 0) * 0.09 + getAscensionBonuses().reach),
      arc: base.arc + (game.character.abilities.arcBoost || 0) * 9 + getAscensionBonuses().arc,
      cooldown: base.cooldown / derived.attackSpeedMult,
      knockback: base.knockback * derived.knockbackMult,
      weaponType: item.weaponType || 'dagger',
      rarity: item.rarity || 'common',
    };
  }

  function roomArchetypeLabel(archetype) {
    return ({
      open_arena:'Open Hall', chasm_bridge:'Chasm Crossing', narrow_bridge:'The Narrow Way', lava_islands:'Lava Islands',
      flooded_current:'Flooded Gallery', poison_bog:'Poison Bog', ice_floor:'Frozen Gallery', sand_sink:'Sinking Hall',
      pillar_maze:'Pillar Maze', broken_courtyard:'Broken Courtyard', four_platforms:'Four Platforms', spiral_ruin:'Spiral Ruin',
      spike_gallery:'Spike Gallery', blade_clock:'Blade Clock', collapsing_floor:'Cracking Arena', capture_runes:'Rune Capture',
      portal_siege:'Portal Siege', moving_safe_zone:'Wandering Light', darkness_chamber:'Darkness Chamber', living_dungeon:'Living Chamber',
      clockwork_foundry:'Clockwork Foundry', treasure_vault:'Treasure Vault', frozen_braziers:'Frozen Braziers',
      echo_chamber:'Echo Chamber', rotating_room:'Rotating Mechanism', time_fracture:'Time Fracture', gravity_chamber:'Gravity Chamber',
      spider_nest:'Spider Nest', bat_roost:'Bat Roost', skeleton_crypt:'Skeleton Crypt', demon_furnace:'Demon Furnace',
      statue_gallery:'Statue Gallery', mirror_room:'Mirror Hall', survival_room:'Last Stand', healing_altar:'Contested Altar',
      silence_chamber:'Silent Reliquary', repulsion_chamber:'Repulsion Chamber', wind_chamber:'Howling Gallery'
    })[archetype] || formatName(archetype || 'room');
  }

  function chooseRoomArchetype(room, floorNumber = 1) {
    if (room.type === 'start' || room.type === 'rest' || room.type === 'escape') return choose(SAFE_ROOM_ARCHETYPES);
    if (room.type === 'treasure') return chance(.72) ? 'treasure_vault' : choose(['pillar_maze','broken_courtyard','lava_islands']);
    if (room.type === 'gathering') return choose(['flooded_current','poison_bog','frozen_braziers','lava_islands','pillar_maze','open_arena']);
    if (room.type === 'puzzle') return choose(['capture_runes','portal_siege','spiral_ruin','clockwork_foundry','rotating_room']);
    if (room.type === 'boss') return choose(['open_arena','lava_islands','blade_clock','clockwork_foundry','living_dungeon','healing_altar','wind_chamber']);
    const pool = floorNumber <= 2
      ? ['open_arena','pillar_maze','broken_courtyard','flooded_current','spike_gallery','ice_floor','chasm_bridge']
      : ROOM_ARCHETYPES;
    return choose(pool);
  }

  function chooseRoomModifier(room, floorNumber = 1) {
    if (['start','rest','escape'].includes(room.type)) return chance(.18) ? choose(['flooded','frozen','darkened']) : 'none';
    const chanceForModifier = clamp(.24 + floorNumber * .018, .24, .58);
    if (!chance(chanceForModifier)) return 'none';
    const overrunEligible = ['combat','gathering','treasure'].includes(room.type)
      && !['chasm_bridge','narrow_bridge','blade_clock','collapsing_floor','gravity_chamber','moving_safe_zone'].includes(room.archetype)
      && chance(clamp(.055 + floorNumber * .006, .055, .14));
    if (overrunEligible) return 'overrun';
    let pool = ROOM_MODIFIERS.filter(mod => mod !== 'none' && mod !== 'overrun');
    if (room.type === 'boss') pool = pool.filter(mod => !['healing_pulse','crumbling'].includes(mod));
    return choose(pool);
  }

  function ensureRoomGeneration(room, floorNumber = 1) {
    if (!room.archetype) room.archetype = chooseRoomArchetype(room, floorNumber);
    if (!room.modifier) room.modifier = chooseRoomModifier(room, floorNumber);
    if (!room.environmentSeed) room.environmentSeed = Math.floor(Math.random() * 0x7fffffff) + 1;
    room.environmentState ||= { runes:{}, openedVaultChests:0, collapsedTiles:{}, objectiveComplete:false };
    return room;
  }

  function roomDimensions(room) {
    const archetype = room.archetype || 'open_arena';
    if (room.type === 'boss') return { w:ROOM_SCALE.bossW, h:ROOM_SCALE.bossH };
    if (['chasm_bridge','narrow_bridge','four_platforms','spiral_ruin','clockwork_foundry','rotating_room'].includes(archetype)
      || room.modifier === 'overrun') {
      return { w:ROOM_SCALE.largeW, h:ROOM_SCALE.largeH };
    }
    if (['start','rest','escape'].includes(room.type)) return { w:1750, h:1550 };
    return { w:ROOM_SCALE.normalW, h:ROOM_SCALE.normalH };
  }

  function roomSpawnMultiplier(room) {
    return room?.modifier === 'overrun' ? 3 : 1;
  }

  function addRectZone(env, type, x1, y1, x2, y2, options = {}) {
    env.zones.push({ id:uid('zone'), shape:'rect', type, x1, y1, x2, y2, ...options });
  }
  function addCircleZone(env, type, x, y, radius, options = {}) {
    env.zones.push({ id:uid('zone'), shape:'circle', type, x, y, radius, ...options });
  }
  function addCircleObstacle(env, x, y, radius, kind = 'pillar', options = {}) {
    env.obstacles.push({ id:uid('obstacle'), shape:'circle', kind, x, y, radius, ...options });
  }
  function addRectObstacle(env, x1, y1, x2, y2, kind = 'wall', options = {}) {
    env.obstacles.push({ id:uid('obstacle'), shape:'rect', kind, x1, y1, x2, y2, ...options });
  }
  function addSpikeTrap(env, x, y, radius = 68, phase = 0) {
    env.traps.push({ id:uid('trap'), type:'spikes', x, y, radius, period:2.8, activeFor:.75, phase, damage:18, tick:0 });
  }
  function addBladeTrap(env, x, y, length = 330, speed = .95, angle = 0) {
    env.traps.push({ id:uid('trap'), type:'blade', x, y, length, width:23, speed, angle, damage:24, tick:0 });
  }
  function addFlameTrap(env, x, y, radius = 105, phase = 0) {
    env.traps.push({ id:uid('trap'), type:'flamejet', x, y, radius, period:3.4, activeFor:1.15, phase, damage:16, tick:0 });
  }
  function addCollapseTile(env, x1, y1, x2, y2, index) {
    const saved = currentRoom()?.environmentState?.collapsedTiles?.[index];
    env.traps.push({ id:`collapse_${index}`, type:'collapse', shape:'rect', x1,y1,x2,y2,index, state:saved ? 'pit' : 'stable', timer:0, damage:22, tick:0 });
  }
  function addRune(env, x, y, index, kind = 'capture') {
    const saved = Number(currentRoom()?.environmentState?.runes?.[index]) || 0;
    env.runes.push({ id:`rune_${index}`, x,y,radius:105,index,kind,progress:clamp(saved,0,1), captured:saved >= 1, spawnTimer:rand(2.5,5.5) });
  }

  function buildRoomEnvironment(room) {
    const previousRandom = activeRandom;
    activeRandom = seededRandom(room.environmentSeed || 1);
    const { w, h } = game.roomWorld;
    const cx = w / 2, cy = h / 2;
    const env = {
      archetype:room.archetype || 'open_arena', modifier:room.modifier || 'none', title:roomArchetypeLabel(room.archetype),
      zones:[], obstacles:[], traps:[], runes:[], objective:null, objectiveComplete:!!room.environmentState?.objectiveComplete,
      darkness:false, darknessRadius:420, projectileTimer:2.5, magicTimer:3.2, pulseTimer:7.5, safeZone:null,
      roomTime:0, playerTick:0, staminaDrain:0, echoTimer:0, gravity:null, repulsion:null, silenced:false, survivalTimer:0, reinforcementTimer:0,
    };
    const doorLane = 150;
    switch (env.archetype) {
      case 'chasm_bridge':
      case 'narrow_bridge': {
        const halfGap = env.archetype === 'narrow_bridge' ? 75 : 120;
        const band = env.archetype === 'narrow_bridge' ? 330 : 250;
        addRectZone(env,'pit',210,cy-band,cx-halfGap,cy+band,{lethal:true});
        addRectZone(env,'pit',cx+halfGap,cy-band,w-210,cy+band,{lethal:true});
        break;
      }
      case 'lava_islands': {
        [[cx-480,cy-300,270],[cx+450,cy-310,250],[cx-520,cy+360,260],[cx+500,cy+340,285],[cx,cy,180]].forEach(v=>addCircleZone(env,'lava',...v,{damage:24}));
        break;
      }
      case 'flooded_current': {
        addRectZone(env,'water',90,90,w-90,h-90,{slow:.72,currentX:58,currentY:-25});
        addCircleZone(env,'deepWater',cx+310,cy-170,230,{slow:.52,currentX:90,currentY:20});
        break;
      }
      case 'poison_bog': {
        [[cx-430,cy-280,250],[cx+420,cy-260,270],[cx-360,cy+360,300],[cx+390,cy+340,280]].forEach(v=>addCircleZone(env,'poison',...v,{damage:7,slow:.72}));
        break;
      }
      case 'ice_floor': {
        addRectZone(env,'ice',70,70,w-70,h-70,{control:.22});
        for (let i=0;i<5;i++) addCircleObstacle(env,cx+Math.cos(i*TAU/5)*430,cy+Math.sin(i*TAU/5)*310,54,'icePillar');
        break;
      }
      case 'sand_sink': {
        addRectZone(env,'sand',70,70,w-70,h-70,{slow:.82});
        [[cx-390,cy-240,155],[cx+360,cy-190,145],[cx-260,cy+330,170],[cx+350,cy+330,155]].forEach(v=>addCircleZone(env,'quicksand',...v,{damage:5,slow:.38,pull:85}));
        break;
      }
      case 'pillar_maze': {
        const points=[[.27,.27],[.5,.22],[.73,.27],[.34,.5],[.66,.5],[.27,.73],[.5,.78],[.73,.73]];
        points.forEach(([px,py],i)=>addCircleObstacle(env,w*px,h*py,58+(i%2)*10,'pillar'));
        break;
      }
      case 'broken_courtyard': {
        addRectObstacle(env,cx-520,cy-300,cx-150,cy-245,'ruinedWall');
        addRectObstacle(env,cx+120,cy-300,cx+510,cy-245,'ruinedWall');
        addRectObstacle(env,cx-470,cy+220,cx-80,cy+275,'ruinedWall');
        addRectObstacle(env,cx+120,cy+205,cx+500,cy+260,'ruinedWall');
        addRectObstacle(env,cx-40,cy-510,cx+25,cy-150,'ruinedWall');
        break;
      }
      case 'four_platforms': {
        addRectZone(env,'pit',260,230,cx-120,cy-120,{lethal:true});
        addRectZone(env,'pit',cx+120,230,w-260,cy-120,{lethal:true});
        addRectZone(env,'pit',260,cy+120,cx-120,h-230,{lethal:true});
        addRectZone(env,'pit',cx+120,cy+120,w-260,h-230,{lethal:true});
        break;
      }
      case 'spiral_ruin': {
        addRectObstacle(env,cx-600,cy-520,cx+420,cy-465,'ruinedWall');
        addRectObstacle(env,cx+365,cy-465,cx+420,cy+390,'ruinedWall');
        addRectObstacle(env,cx-390,cy+335,cx+420,cy+390,'ruinedWall');
        addRectObstacle(env,cx-390,cy-220,cx-335,cy+390,'ruinedWall');
        addRectObstacle(env,cx-335,cy-220,cx+180,cy-165,'ruinedWall');
        addCircleObstacle(env,cx+120,cy+60,62,'pillar');
        break;
      }
      case 'spike_gallery': {
        let idx=0;
        for (let y=cy-360;y<=cy+360;y+=180) for (let x=cx-540;x<=cx+540;x+=180) addSpikeTrap(env,x,y,65,(idx++%4)*.55);
        break;
      }
      case 'blade_clock': {
        addBladeTrap(env,cx,cy,520,1.0,0); addBladeTrap(env,cx,cy,360,-1.45,Math.PI/2);
        for(let i=0;i<4;i++) addCircleObstacle(env,cx+Math.cos(i*TAU/4)*590,cy+Math.sin(i*TAU/4)*430,55,'gearPillar');
        break;
      }
      case 'collapsing_floor': {
        let idx=0;
        for(let y=cy-380;y<=cy+380;y+=190) for(let x=cx-570;x<=cx+570;x+=190) {
          if (Math.abs(x-cx)<110 || Math.abs(y-cy)<110) continue;
          addCollapseTile(env,x-78,y-78,x+78,y+78,idx++);
        }
        break;
      }
      case 'capture_runes': {
        addRune(env,cx-430,cy+220,0,'capture'); addRune(env,cx+430,cy+220,1,'capture'); addRune(env,cx,cy-330,2,'capture');
        env.objective='capture'; break;
      }
      case 'portal_siege': {
        addRune(env,cx-480,cy-250,0,'portal'); addRune(env,cx+480,cy-250,1,'portal'); addRune(env,cx,cy+360,2,'portal');
        env.objective='seal'; break;
      }
      case 'moving_safe_zone': {
        env.darkness=true; env.darknessRadius=420; env.safeZone={x:cx,y:cy,radius:260,angle:0,speed:.33}; env.objective='surviveLight';
        break;
      }
      case 'darkness_chamber': {
        env.darkness=true; env.darknessRadius=460;
        for(let i=0;i<7;i++) addCircleObstacle(env,cx+Math.cos(i*1.7)*rand(260,620),cy+Math.sin(i*1.7)*rand(230,520),52,'pillar');
        break;
      }
      case 'living_dungeon': {
        for(let i=0;i<8;i++){const a=i*TAU/8; addFlameTrap(env,cx+Math.cos(a)*rand(330,650),cy+Math.sin(a)*rand(280,520),90,i*.38);}
        addCircleZone(env,'corruption',cx,cy,175,{damage:8,slow:.78});
        break;
      }
      case 'clockwork_foundry': {
        addBladeTrap(env,cx-330,cy,320,1.35,0); addBladeTrap(env,cx+330,cy,320,-1.15,Math.PI);
        for(let i=0;i<6;i++) addSpikeTrap(env,cx-500+i*200,cy+350,60,i*.32);
        env.traps.push({id:uid('trap'),type:'boulder',x:220,y:cy-340,radius:46,vx:410,vy:0,damage:28,tick:0});
        break;
      }
      case 'treasure_vault': {
        addRectObstacle(env,cx-500,cy-300,cx-250,cy-245,'vaultWall');
        addRectObstacle(env,cx+250,cy-300,cx+500,cy-245,'vaultWall');
        env.objective='greed'; break;
      }
      case 'frozen_braziers': {
        addRectZone(env,'ice',70,70,w-70,h-70,{control:.25});
        [[cx-430,cy],[cx+430,cy],[cx,cy-340],[cx,cy+340]].forEach(([x,y])=>addCircleZone(env,'warmth',x,y,155));
        break;
      }
      case 'echo_chamber': {
        env.echoTimer=3.5;
        for(let i=0;i<6;i++) addCircleObstacle(env,cx+Math.cos(i*TAU/6)*470,cy+Math.sin(i*TAU/6)*360,48,'crystal');
        break;
      }
      case 'rotating_room': {
        addBladeTrap(env,cx,cy,560,.72,0);
        addCircleObstacle(env,cx,cy,76,'gearPillar');
        for(let i=0;i<4;i++) addCircleObstacle(env,cx+Math.cos(i*TAU/4)*520,cy+Math.sin(i*TAU/4)*400,64,'gearPillar');
        break;
      }
      case 'time_fracture': {
        addCircleZone(env,'timeSlow',cx-360,cy-180,270,{slow:.48}); addCircleZone(env,'timeHaste',cx+360,cy+190,260,{speed:1.28});
        addCircleZone(env,'timeSlow',cx+420,cy-300,170,{slow:.58}); break;
      }
      case 'gravity_chamber': {
        env.gravity={x:cx,y:cy,pull:150}; addCircleZone(env,'gravityCore',cx,cy,170,{damage:7});
        for(let i=0;i<6;i++) addCircleObstacle(env,cx+Math.cos(i*TAU/6)*520,cy+Math.sin(i*TAU/6)*390,48,'crystal'); break;
      }
      case 'spider_nest': {
        [[cx-430,cy-260,210],[cx+420,cy-250,210],[cx-330,cy+320,230],[cx+350,cy+330,220]].forEach(v=>addCircleZone(env,'web',...v,{slow:.48}));
        addRune(env,cx-470,cy,0,'nest');addRune(env,cx+470,cy,1,'nest');env.objective='seal';break;
      }
      case 'bat_roost': {
        env.darkness=true;env.darknessRadius=420;for(let i=0;i<8;i++)addCircleObstacle(env,cx+Math.cos(i*TAU/8)*rand(360,650),cy+Math.sin(i*TAU/8)*rand(280,520),42,'pillar');break;
      }
      case 'skeleton_crypt': {
        for(let i=0;i<10;i++){const x=cx-600+(i%5)*300,y=cy-330+Math.floor(i/5)*660;addRectObstacle(env,x-65,y-28,x+65,y+28,'coffin');}
        addRune(env,cx,cy-360,0,'crypt');addRune(env,cx,cy+360,1,'crypt');env.objective='seal';break;
      }
      case 'demon_furnace': {
        addRectZone(env,'lava',cx-100,180,cx+100,h-180,{damage:25});
        for(let i=0;i<6;i++)addFlameTrap(env,cx+(i%2?320:-320),260+i*220,95,i*.4);break;
      }
      case 'statue_gallery': {
        for(let row=0;row<2;row++)for(let i=0;i<6;i++)addCircleObstacle(env,280+i*270,cy+(row?330:-330),58,'statue');break;
      }
      case 'mirror_room': {
        addRectObstacle(env,cx-25,220,cx+25,h-220,'mirrorWall');env.objective='mirror';break;
      }
      case 'survival_room': {
        env.objective='survive';env.survivalTimer=22;env.reinforcementTimer=1;break;
      }
      case 'healing_altar': {
        addCircleZone(env,'healing',cx,cy,210);addCircleObstacle(env,cx,cy,52,'crystal');break;
      }
      case 'silence_chamber': {
        env.silenced=true;addRune(env,cx-420,cy+220,0,'silence');addRune(env,cx+420,cy+220,1,'silence');addRune(env,cx,cy-330,2,'silence');env.objective='capture';break;
      }
      case 'repulsion_chamber': {
        env.repulsion={x:cx,y:cy,radius:410,push:270};addCircleObstacle(env,cx,cy,70,'crystal');break;
      }
      case 'wind_chamber': {
        addRectZone(env,'wind',80,80,w-80,h-80,{currentX:85,currentY:-20});break;
      }
      default: {
        if (chance(.55)) for(let i=0;i<randInt(3,7);i++) addCircleObstacle(env,rand(280,w-280),rand(250,h-250),rand(42,70),'pillar');
      }
    }

    // Layer a room modifier over the geometry so templates can play differently between runs.
    switch (env.modifier) {
      case 'burning': for(let i=0;i<4;i++) addCircleZone(env,'fire',rand(260,w-260),rand(230,h-230),rand(110,180),{damage:9}); break;
      case 'flooded': addRectZone(env,'water',90,90,w-90,h-90,{slow:.78,currentX:35,currentY:15}); break;
      case 'frozen': for(let i=0;i<4;i++) addCircleZone(env,'ice',rand(260,w-260),rand(230,h-230),rand(170,270),{control:.25}); break;
      case 'poisoned': for(let i=0;i<4;i++) addCircleZone(env,'poison',rand(260,w-260),rand(230,h-230),rand(120,190),{damage:6,slow:.75}); break;
      case 'darkened': env.darkness=true; env.darknessRadius=Math.max(env.darknessRadius,380); break;
      case 'unstable_magic': env.magicTimer=1.8; break;
      case 'healing_pulse': env.pulseTimer=5.5; break;
      case 'projectile_storm': env.projectileTimer=1.2; break;
      case 'crumbling': {
        let start=env.traps.filter(t=>t.type==='collapse').length;
        for(let i=0;i<7;i++){const x=rand(260,w-260),y=rand(230,h-230);addCollapseTile(env,x-70,y-70,x+70,y+70,start+i);} break;
      }
      case 'exhausting': env.staminaDrain=2.5; break;
      case 'arcane_wind': break;
      case 'overrun': env.spawnMultiplier = 3; env.rewardMultiplier = 1.35; break;
    }
    if (room.type === 'boss') {
      env.zones = env.zones.filter(zone => zone.type !== 'pit');
      env.traps = env.traps.filter(trap => trap.type !== 'collapse');
      if (room.archetype === 'four_platforms' || room.archetype === 'collapsing_floor') {
        for (let i = 0; i < 6; i++) addSpikeTrap(env, rand(320, w - 320), rand(280, h - 280), 70, i * .42);
      }
      room.environmentState ||= { runes:{}, openedVaultChests:0, collapsedTiles:{}, objectiveComplete:false };
      room.environmentState.collapsedTiles = {};
    }
    activeRandom = previousRandom;
    return env;
  }

  function pointInEnvironmentShape(x,y,shape,padding=0) {
    if (shape.shape === 'circle') return dist(x,y,shape.x,shape.y) <= (shape.radius || 0) + padding;
    return x >= shape.x1-padding && x <= shape.x2+padding && y >= shape.y1-padding && y <= shape.y2+padding;
  }

  function environmentZonesAt(x,y,radius=0) {
    let matches=(game.roomEnvironment?.zones||[]).filter(zone=>pointInEnvironmentShape(x,y,zone,radius));
    if(matches.some(zone=>zone.type==='safeStone')) matches=matches.filter(zone=>!['lava','fire','pit'].includes(zone.type));
    if(matches.some(zone=>zone.type==='iceBridge')) matches=matches.filter(zone=>!['water','deepWater'].includes(zone.type));
    return matches;
  }

  function environmentMovementMultiplierAt(x,y,isEnemy=false) {
    let mult=1;
    for(const zone of environmentZonesAt(x,y,0)) {
      if (zone.type==='water' || zone.type==='deepWater' || zone.type==='sand' || zone.type==='poison' || zone.type==='quicksand' || zone.type==='corruption' || zone.type==='timeSlow') mult*=zone.slow || 1;
      if (zone.type==='web') mult*=.55;
      if (zone.type==='timeHaste') mult*=zone.speed||1.2;
    }
    return clamp(mult,.28,1.35);
  }

  function environmentIceAt(x,y) { return environmentZonesAt(x,y,0).some(zone=>zone.type==='ice'||zone.type==='iceBridge'); }

  function pointIsUnsafeEnvironment(x,y,radius=0) {
    const env=game.roomEnvironment;
    if(!env) return false;
    if(env.zones.some(zone=>['pit','lava'].includes(zone.type)&&pointInEnvironmentShape(x,y,zone,radius))) return true;
    return env.obstacles.some(ob=>!ob.nonBlocking&&pointInEnvironmentShape(x,y,ob,radius));
  }

  function findSafeEnvironmentPoint(x,y,radius=30) {
    if(!pointIsUnsafeEnvironment(x,y,radius)) return {x,y};
    for(let ring=1;ring<=12;ring++) for(let i=0;i<16;i++) {
      const a=i*TAU/16; const px=clamp(x+Math.cos(a)*ring*65,90,game.roomWorld.w-90); const py=clamp(y+Math.sin(a)*ring*65,90,game.roomWorld.h-90);
      if(!pointIsUnsafeEnvironment(px,py,radius)) return {x:px,y:py};
    }
    return {x:game.roomWorld.w/2,y:game.roomWorld.h/2};
  }

  function resolveCircleObstacle(entity,obstacle) {
    const dx=entity.x-obstacle.x,dy=entity.y-obstacle.y; const d=Math.hypot(dx,dy); const min=(entity.radius||20)+obstacle.radius;
    if(d>=min||d<.001) return;
    const n=d>.001?{x:dx/d,y:dy/d}:{x:1,y:0}; entity.x=obstacle.x+n.x*min; entity.y=obstacle.y+n.y*min;
    const into=(entity.vx||0)*n.x+(entity.vy||0)*n.y; if(into<0){entity.vx-=into*n.x;entity.vy-=into*n.y;}
  }
  function resolveRectObstacle(entity,obstacle) {
    const r=entity.radius||20; const nearestX=clamp(entity.x,obstacle.x1,obstacle.x2); const nearestY=clamp(entity.y,obstacle.y1,obstacle.y2);
    const dx=entity.x-nearestX,dy=entity.y-nearestY; if(dx*dx+dy*dy>=r*r) return;
    const left=Math.abs(entity.x-(obstacle.x1-r)),right=Math.abs(entity.x-(obstacle.x2+r)),top=Math.abs(entity.y-(obstacle.y1-r)),bottom=Math.abs(entity.y-(obstacle.y2+r));
    const m=Math.min(left,right,top,bottom); if(m===left){entity.x=obstacle.x1-r;entity.vx=Math.min(0,entity.vx||0);}else if(m===right){entity.x=obstacle.x2+r;entity.vx=Math.max(0,entity.vx||0);}else if(m===top){entity.y=obstacle.y1-r;entity.vy=Math.min(0,entity.vy||0);}else{entity.y=obstacle.y2+r;entity.vy=Math.max(0,entity.vy||0);}
  }
  function resolveEnvironmentObstacles(entity) {
    for(const obstacle of game.roomEnvironment?.obstacles||[]) {
      if(obstacle.nonBlocking) continue;
      if(obstacle.shape==='circle') resolveCircleObstacle(entity,obstacle); else resolveRectObstacle(entity,obstacle);
    }
  }

  function damageEnvironmentEntity(entity,amount,x,y,type='physical') {
    if(entity===game.player) damagePlayer(amount,x,y,{damageType:type,ignoreInvuln:false});
    else environmentalDamageEnemy(entity,amount,type==='fire'?'#ff8a4c':type==='poison'?'#8fe56e':'#e9d7ac','ENV ');
  }

  function entityEnvironmentStep(entity,dt,isPlayer=false) {
    const env=game.roomEnvironment; if(!env||!entity) return;
    entity.environmentTick=Math.max(0,(entity.environmentTick||0)-dt);
    const zones=environmentZonesAt(entity.x,entity.y,entity.radius*.25);
    let safe=true;
    for(const zone of zones) {
      if(zone.type==='pit') {
        safe=false;
        if(isPlayer) {
          const reset=findSafeEnvironmentPoint(entity.lastSafeX??game.roomWorld.w/2,entity.lastSafeY??game.roomWorld.h/2,entity.radius+15);
          damagePlayer(Math.max(18,game.player.maxHealth*.16),zone.x||game.roomWorld.w/2,zone.y||game.roomWorld.h/2,{damageType:'physical',ignoreInvuln:true});
          entity.x=reset.x;entity.y=reset.y;entity.vx=entity.vy=0;entity.dodge=null;toast('You fall into the darkness and claw your way back.',1300);
        } else { environmentalDamageEnemy(entity,Math.max(999,entity.maxHp||999),'#d9c9b2','FALL '); }
        break;
      }
      if(zone.type==='lava'||zone.type==='fire') {
        safe=false;
        if(entity.environmentTick<=0){entity.environmentTick=ENV_DAMAGE_TICK;damageEnvironmentEntity(entity,zone.damage||18,zone.x||entity.x,zone.y||entity.y,'fire');if(isPlayer)applyPlayerStatus('burn',2.4);else applyEnemyStatus(entity,'burn',2.2);}
      } else if(zone.type==='poison'||zone.type==='corruption') {
        if(entity.environmentTick<=0){entity.environmentTick=ENV_DAMAGE_TICK;damageEnvironmentEntity(entity,zone.damage||6,zone.x||entity.x,zone.y||entity.y,'poison');if(isPlayer)applyPlayerStatus('poison',2.2);else applyEnemyStatus(entity,'poison',2);}
      } else if(zone.type==='gravityCore') {
        if(entity.environmentTick<=0){entity.environmentTick=.7;damageEnvironmentEntity(entity,zone.damage||7,zone.x,zone.y,'magic');}
      } else if(zone.type==='quicksand') {
        const n=normalize((zone.x||entity.x)-entity.x,(zone.y||entity.y)-entity.y);entity.x+=n.x*(zone.pull||70)*dt;entity.y+=n.y*(zone.pull||70)*dt;
        if(entity.environmentTick<=0){entity.environmentTick=.9;damageEnvironmentEntity(entity,zone.damage||4,zone.x,zone.y,'physical');}
      }
      if(zone.currentX||zone.currentY){entity.x+=(zone.currentX||0)*dt;entity.y+=(zone.currentY||0)*dt;}
    }
    if(env.archetype==='frozen_braziers'&&!zones.some(zone=>zone.type==='warmth')){if(isPlayer)applyPlayerStatus('slow',.35);else applyEnemyStatus(entity,'slow',.35);}
    if(safe&&!pointIsUnsafeEnvironment(entity.x,entity.y,entity.radius+8)&&isPlayer){entity.lastSafeX=entity.x;entity.lastSafeY=entity.y;}
    resolveEnvironmentObstacles(entity);
    entity.x=clamp(entity.x,entity.radius+34,game.roomWorld.w-entity.radius-34);entity.y=clamp(entity.y,entity.radius+34,game.roomWorld.h-entity.radius-34);
  }

  function trapActive(trap,roomTime) {
    if(trap.type==='spikes'||trap.type==='flamejet'){const t=(roomTime+trap.phase)%trap.period;return t<trap.activeFor;}
    return true;
  }

  function updateRoomObjectives(dt) {
    const env=game.roomEnvironment,room=currentRoom(),p=game.player;if(!env||!room)return;
    if(env.runes.length){
      for(const rune of env.runes){
        if(rune.captured)continue;
        const playerInside=dist(p.x,p.y,rune.x,rune.y)<=rune.radius+p.radius;
        const enemyInside=game.enemies.some(e=>!e.dead&&dist(e.x,e.y,rune.x,rune.y)<=rune.radius+e.radius);
        const rate=['portal','nest','crypt'].includes(rune.kind)?.18:.24;
        if(playerInside&&!enemyInside)rune.progress=clamp(rune.progress+dt*rate,0,1);
        else if(enemyInside)rune.progress=clamp(rune.progress-dt*.12,0,1);
        if(['portal','nest','crypt'].includes(rune.kind)&&!rune.captured){
          rune.spawnTimer-=dt;
          if(rune.spawnTimer<=0){
            rune.spawnTimer=rand(5.5,8);
            const types=rune.kind==='nest'?['spider','slime']:rune.kind==='crypt'?['skeleton','skeleton','shadow']:['skeleton','shadow','imp'];
            spawnEnemy(choose(types),rune.x+rand(-75,75),rune.y+rand(-75,75),{mini:true,hp:Math.max(12,18+currentFloor().floorNumber*3)});
          }
        }
        if(rune.progress>=1){
          rune.captured=true;room.environmentState.runes[rune.index]=1;
          const message=rune.kind==='portal'?'Portal sealed.':rune.kind==='nest'?'Web nest destroyed.':rune.kind==='crypt'?'Crypt seal broken.':rune.kind==='silence'?'Silence crystal broken.':'Rune captured.';
          toast(message,900);
        }
      }
      env.objectiveComplete=env.runes.every(r=>r.captured);room.environmentState.objectiveComplete=env.objectiveComplete;
      if(env.objectiveComplete&&env.silenced)env.silenced=false;
      const noEnemies=!game.enemies.some(e=>!e.dead);
      if(env.objectiveComplete&&room.type==='puzzle'&&!room.cleared&&noEnemies){room.cleared=true;room.puzzleSolved=true;toast(env.objective==='seal'?'All seals are broken. The doors release.':'All runes awakened. The doors release.',1800);}
    }
    if(env.objective==='mirror'){
      env.objectiveComplete=!game.enemies.some(e=>!e.dead&&e.environmentObjective==='mirror');
      room.environmentState.objectiveComplete=env.objectiveComplete;
    }
    if(env.objective==='survive'&&!env.objectiveComplete){
      env.survivalTimer=Math.max(0,env.survivalTimer-dt);
      env.reinforcementTimer-=dt;
      if(env.reinforcementTimer<=0&&env.survivalTimer>0){
        env.reinforcementTimer=rand(3.2,4.8);
        const wave=2+Math.floor(currentFloor().floorNumber/3);
        for(let i=0;i<wave;i++)spawnEnemy(choose(['zombie','skeleton','spider','bat','shadow','imp']));
        toast(`${Math.ceil(env.survivalTimer)} seconds remain.`,800);
      }
      if(env.survivalTimer<=0){env.objectiveComplete=true;room.environmentState.objectiveComplete=true;toast('The last wave has arrived. Finish the survivors!',1800);}
    }
  }

  function updateDungeonEnvironment(dt) {
    const env=game.roomEnvironment;if(!env||game.scene!=='dungeon')return;
    env.roomTime+=dt;
    for(const zone of env.zones)if(zone.time!=null)zone.time-=dt;
    env.zones=env.zones.filter(zone=>zone.time==null||zone.time>0);
    entityEnvironmentStep(game.player,dt,true);
    for(const enemy of game.enemies)if(!enemy.dead)entityEnvironmentStep(enemy,dt,false);
    const livingEntities=[game.player,...game.enemies.filter(enemy=>!enemy.dead)];
    if(env.gravity){
      for(const entity of livingEntities){const d=dist(entity.x,entity.y,env.gravity.x,env.gravity.y);if(d>30){const n=normalize(env.gravity.x-entity.x,env.gravity.y-entity.y);const strength=(1-clamp(d/900,0,1))*env.gravity.pull;entity.x+=n.x*strength*dt;entity.y+=n.y*strength*dt;}}
    }
    if(env.repulsion){
      for(const entity of livingEntities){const d=dist(entity.x,entity.y,env.repulsion.x,env.repulsion.y);if(d<env.repulsion.radius&&d>5){const n=normalize(entity.x-env.repulsion.x,entity.y-env.repulsion.y);const strength=(1-d/env.repulsion.radius)*env.repulsion.push;entity.x+=n.x*strength*dt;entity.y+=n.y*strength*dt;}}
    }
    for(const zone of env.zones.filter(zone=>zone.type==='healing')){
      for(const entity of livingEntities){entity.healingZoneTick=Math.max(0,(entity.healingZoneTick||0)-dt);if(dist(entity.x,entity.y,zone.x,zone.y)<=zone.radius+(entity.radius||20)&&entity.healingZoneTick<=0){entity.healingZoneTick=.75;if(entity===game.player)entity.health=Math.min(entity.maxHealth,entity.health+Math.max(2,entity.maxHealth*.035));else entity.hp=Math.min(entity.maxHp,entity.hp+Math.max(2,entity.maxHp*.035));}}
    }
    for(const trap of env.traps){
      trap.tick=Math.max(0,(trap.tick||0)-dt);
      if(trap.type==='blade')trap.angle+=trap.speed*dt;
      if(trap.type==='boulder'){
        trap.x+=trap.vx*dt;trap.y+=trap.vy*dt;if(trap.x<trap.radius+45||trap.x>game.roomWorld.w-trap.radius-45)trap.vx*=-1;if(trap.y<trap.radius+45||trap.y>game.roomWorld.h-trap.radius-45)trap.vy*=-1;
      }
      if(trap.type==='collapse'){
        if(trap.state==='stable'){
          const triggered=pointInEnvironmentShape(game.player.x,game.player.y,{shape:'rect',x1:trap.x1,y1:trap.y1,x2:trap.x2,y2:trap.y2},game.player.radius)||game.enemies.some(e=>!e.dead&&pointInEnvironmentShape(e.x,e.y,{shape:'rect',x1:trap.x1,y1:trap.y1,x2:trap.x2,y2:trap.y2},e.radius));
          if(triggered){trap.state='warning';trap.timer=.85;}
        }else if(trap.state==='warning'){trap.timer-=dt;if(trap.timer<=0){trap.state='pit';currentRoom().environmentState.collapsedTiles[trap.index]=1;}}
      }
      const active=trapActive(trap,env.roomTime);
      if(!active)continue;
      const hits=[];
      if(trap.type==='spikes'||trap.type==='flamejet'||trap.type==='boulder'){
        const rad=trap.radius||70;if(dist(game.player.x,game.player.y,trap.x,trap.y)<rad+game.player.radius)hits.push(game.player);
        for(const e of game.enemies)if(!e.dead&&dist(e.x,e.y,trap.x,trap.y)<rad+e.radius)hits.push(e);
      }else if(trap.type==='blade'){
        const ax=trap.x-Math.cos(trap.angle)*trap.length,ay=trap.y-Math.sin(trap.angle)*trap.length,bx=trap.x+Math.cos(trap.angle)*trap.length,by=trap.y+Math.sin(trap.angle)*trap.length;
        if(pointToSegmentDistance(game.player.x,game.player.y,ax,ay,bx,by)<trap.width+game.player.radius)hits.push(game.player);
        for(const e of game.enemies)if(!e.dead&&pointToSegmentDistance(e.x,e.y,ax,ay,bx,by)<trap.width+e.radius)hits.push(e);
      }else if(trap.type==='collapse'&&trap.state==='pit'){
        if(pointInEnvironmentShape(game.player.x,game.player.y,trap,game.player.radius*.2))hits.push(game.player);
        for(const e of game.enemies)if(!e.dead&&pointInEnvironmentShape(e.x,e.y,trap,e.radius*.2))hits.push(e);
      }
      if(hits.length&&trap.tick<=0){trap.tick=trap.type==='collapse'?.8:.55;for(const entity of hits){if(trap.type==='collapse'){if(entity===game.player){const reset=findSafeEnvironmentPoint(entity.lastSafeX,entity.lastSafeY,entity.radius+12);damagePlayer(trap.damage,trap.x1,trap.y1,{ignoreInvuln:true});entity.x=reset.x;entity.y=reset.y;}else environmentalDamageEnemy(entity,999,'#d9c9b2','FALL ');}else damageEnvironmentEntity(entity,trap.damage,trap.x,trap.y,trap.type==='flamejet'?'fire':'physical');}}
    }
    updateRoomObjectives(dt);
    if(env.safeZone){
      env.safeZone.angle+=env.safeZone.speed*dt;env.safeZone.x=game.roomWorld.w/2+Math.cos(env.safeZone.angle)*game.roomWorld.w*.25;env.safeZone.y=game.roomWorld.h/2+Math.sin(env.safeZone.angle*.83)*game.roomWorld.h*.22;
      if(dist(game.player.x,game.player.y,env.safeZone.x,env.safeZone.y)>env.safeZone.radius&&env.playerTick<=0){env.playerTick=.65;damagePlayer(7,env.safeZone.x,env.safeZone.y,{damageType:'magic'});}env.playerTick=Math.max(0,env.playerTick-dt);
      for(const enemy of game.enemies){if(enemy.dead)continue;enemy.safeZoneTick=Math.max(0,(enemy.safeZoneTick||0)-dt);if(dist(enemy.x,enemy.y,env.safeZone.x,env.safeZone.y)>env.safeZone.radius&&enemy.safeZoneTick<=0){enemy.safeZoneTick=.65;environmentalDamageEnemy(enemy,6,'#9f8bcf','DARK ');}}
    }
    if(env.modifier==='projectile_storm'){env.projectileTimer-=dt;if(env.projectileTimer<=0){env.projectileTimer=rand(1.2,2.1);const side=choose(['N','E','S','W']);let x,y;if(side==='N'){x=rand(100,game.roomWorld.w-100);y=35;}else if(side==='S'){x=rand(100,game.roomWorld.w-100);y=game.roomWorld.h-35;}else if(side==='E'){x=game.roomWorld.w-35;y=rand(100,game.roomWorld.h-100);}else{x=35;y=rand(100,game.roomWorld.h-100);}const n=normalize(game.player.x-x,game.player.y-y);fireProjectile(x,y,n.x*420,n.y*420,9,'#d9b8ff',8,'enemy',{bounces:1,damageType:'magic'});}}
    if(env.modifier==='unstable_magic'){env.magicTimer-=dt;if(env.magicTimer<=0){env.magicTimer=rand(2.8,4.6);createBlastTelegraph(choose(['fire','poison','stomp']),rand(220,game.roomWorld.w-220),rand(220,game.roomWorld.h-220),rand(100,165),.75,15,'environment',{hazardDuration:3});}}
    if(env.modifier==='healing_pulse'){env.pulseTimer-=dt;if(env.pulseTimer<=0){env.pulseTimer=8;game.player.health=Math.min(game.player.maxHealth,game.player.health+game.player.maxHealth*.08);for(const e of game.enemies)if(!e.dead)e.hp=Math.min(e.maxHp,e.hp+e.maxHp*.08);game.particles.push({type:'ring',x:game.roomWorld.w/2,y:game.roomWorld.h/2,r:80,maxR:Math.max(game.roomWorld.w,game.roomWorld.h),t:0,duration:.8,color:'#88d9a1'});}}
    if(env.staminaDrain>0&&isCombatActive())game.player.stamina=Math.max(0,game.player.stamina-env.staminaDrain*dt);
    if(env.echoTimer>0){env.echoTimer-=dt;if(env.echoTimer<=0){env.echoTimer=4.5;const p=game.player;createBlastTelegraph('stomp',p.x-p.facing.x*220,p.y-p.facing.y*220,120,.65,11,'environment',{hazardDuration:0});}}
  }

  function roomObjectiveComplete(room=currentRoom()) {
    const env=game.roomEnvironment;
    if(!env||!env.objective)return true;
    if(env.objective==='greed'||env.objective==='surviveLight')return true;
    return !!env.objectiveComplete;
  }

  function enterCamp(options = {}) {
    if (game.gathering) endGatheringMode('travel', { silent:true });
    stopSpellAutoCast(null, '', { silent: true });
    if (game.player && game.character) {
      game.character.currentHealth = Math.round(game.player.health);
      game.character.currentMana = Math.round(game.player.mana);
    }
    game.scene = 'camp';
    game.overworldZone = null;
    game.enemies = [];
    game.projectiles = [];
    game.areaEffects = [];
    game.spellEffects = [];
    game.drops = [];
    game.roomFeatures = [];
    game.roomEnvironment = null;
    game.roomWorld = { w: 1800, h: 1400 };
    const spawn = options.spawn || { x: 900, y: 1040 };
    game.player = createPlayer(spawn.x, spawn.y);
    game.player.health = Math.max(game.player.health, Math.round(game.player.maxHealth * 0.6));
    game.player.mana = game.player.maxMana;
    if (options.facing) game.player.facing = { ...options.facing };
    game.character.currentHealth = game.player.health;
    game.character.currentMana = game.player.mana;
    game.campNpcs = game.character.campNpcs;
    game.pendingVictory = false;
    game.campEntranceArmed = true;
    game.worldTransitionCooldown = 0.65;
    updateHud();
    saveGame();
    if (!options.silentToast) toast(options.message || 'Welcome back to camp. The dungeon entrance is beyond the fire.');
  }

  function enterOverworld(zoneId, fromZone = 'camp') {
    const zone = OVERWORLD_ZONES[zoneId];
    if (!zone) return;
    if (game.gathering) endGatheringMode('travel', { silent:true });
    stopSpellAutoCast(null, '', { silent: true });
    if (game.player && game.character) {
      game.character.currentHealth = Math.round(game.player.health);
      game.character.currentMana = Math.round(game.player.mana);
    }
    game.scene = 'overworld';
    game.overworldZone = zoneId;
    game.enemies = [];
    game.projectiles = [];
    game.areaEffects = [];
    game.spellEffects = [];
    game.drops = [];
    game.roomFeatures = [];
    game.roomEnvironment = null;
    game.roomWorld = { w: zone.w, h: zone.h };
    const spawn = zone.spawns[fromZone] || Object.values(zone.spawns)[0] || { x: zone.w / 2, y: zone.h / 2 };
    game.player = createPlayer(spawn.x, spawn.y);
    if (spawn.facing) game.player.facing = { ...spawn.facing };
    prepareOverworldResources(zoneId);
    game.worldTransitionCooldown = 0.72;
    updateHud();
    saveGame();
    toast(`${zone.name} · ${zone.subtitle}`, 2800);
  }

  function returnToCampFromWorld() {
    enterCamp({
      spawn: { x: 185, y: 1095 },
      facing: { x: 1, y: -0.45 },
      silentToast: true,
    });
    toast('You follow the forest road back into the expedition camp.');
  }

  function travelWorldGate(gate) {
    if (!gate || game.worldTransitionCooldown > 0) return;
    game.player.vx = game.player.vy = 0;
    if (gate.target === 'camp') returnToCampFromWorld();
    else enterOverworld(gate.target, gate.entry || game.overworldZone);
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
      ensureRoomGeneration(room, floorNumber);
    }
    ensureRoomGeneration(start, floorNumber);
    ensureRoomGeneration(rooms[farthest.id], floorNumber);

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
    game.spellEffects = [];
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
    ensureRoomGeneration(room, floor.floorNumber);
    const boss = room.type === 'boss';
    game.roomWorld = roomDimensions(room);
    game.roomEnvironment = buildRoomEnvironment(room);

    if (!game.player) game.player = createPlayer(game.roomWorld.w / 2, game.roomWorld.h / 2);
    const margin = 125;
    let spawn;
    if (fromDir === 'N') spawn = { x:game.roomWorld.w / 2, y:margin };
    else if (fromDir === 'S') spawn = { x:game.roomWorld.w / 2, y:game.roomWorld.h - margin };
    else if (fromDir === 'E') spawn = { x:game.roomWorld.w - margin, y:game.roomWorld.h / 2 };
    else if (fromDir === 'W') spawn = { x:margin, y:game.roomWorld.h / 2 };
    else spawn = { x:game.roomWorld.w / 2, y:game.roomWorld.h / 2 + (boss ? 850 : 360) };
    spawn = findSafeEnvironmentPoint(spawn.x, spawn.y, game.player.radius + 22);
    game.player.x = spawn.x; game.player.y = spawn.y;
    game.player.lastSafeX = spawn.x; game.player.lastSafeY = spawn.y;
    game.player.vx = game.player.vy = 0;
    game.player.attack = null;
    game.player.dodge = null;
    game.player.spellCast = null;
    game.player.barrierTimer = Math.max(0, game.player.barrierTimer || 0);
    game.input.x = game.input.y = game.input.aimX = game.input.aimY = 0;
    game.input.attackQueued = false;
    game.aimFlick = { time: 0, x: 0, y: 0 };
    resetTapSequence('left');
    resetTapSequence('right');
    clearStick('first');
    clearStick('second');
    syncTouchControlRoles();

    setupRoom(room);
    setupRoomEnvironmentFeatures(room);
    updateHud();
    saveGame();
  }

  function setupRoom(room) {
    const floor = currentFloor();
    const spawnMult = roomSpawnMultiplier(room);
    if (room.type === 'combat' && !room.cleared) {
      const count = clamp(Math.round((5 + Math.floor(floor.floorNumber * 1.15) + randInt(0, 4)) * spawnMult), 6, 64);
      for (let i = 0; i < count; i++) spawnEnemy(choose(['zombie', 'skeleton', 'spider', 'bat', 'slime', 'shadow', 'imp']));
      if (room.modifier === 'overrun') toast('OVERRUN — triple enemy presence!', 2200);
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
        for (let i = 0; i < Math.round((4 + currentFloor().floorNumber) * spawnMult); i++) spawnEnemy(choose(['zombie', 'spider', 'slime', 'shadow']));
      }
    }
    if (room.type === 'puzzle') {
      if (!['capture','seal'].includes(game.roomEnvironment?.objective)) game.roomFeatures.push({ id: uid('feature'), type: 'puzzle', x: game.roomWorld.w / 2, y: game.roomWorld.h / 2, solved: room.puzzleSolved });
      if (room.puzzleSolved || room.environmentState?.objectiveComplete) room.cleared = true;
    }
    if (room.type === 'treasure') {
      if (game.roomEnvironment?.archetype !== 'treasure_vault') game.roomFeatures.push({ id: uid('feature'), type: 'chest', x: game.roomWorld.w / 2, y: game.roomWorld.h / 2, opened: room.chestOpened });
      if (!room.cleared) {
        for (let i = 0; i < Math.round((3 + currentFloor().floorNumber) * spawnMult); i++) spawnEnemy(choose(['skeleton', 'bat', 'slime', 'imp']));
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
    setupArchetypeEnemies(room);
  }

  function setupArchetypeEnemies(room) {
    if (room.cleared || ['start','rest','escape'].includes(room.type)) return;
    const env=game.roomEnvironment; if(!env) return;
    const floor=currentFloor().floorNumber;
    const spawnMult = roomSpawnMultiplier(room);
    const spawnMany=(types,count)=>{for(let i=0;i<Math.round(count * spawnMult);i++)spawnEnemy(choose(types));};
    if(env.modifier==='haunted')spawnMany(['shadow','bat'],2+Math.min(4,Math.floor(floor/2)));
    if(env.modifier==='infested')spawnMany(['spider','slime'],3+Math.min(5,Math.floor(floor/2)));
    if(env.archetype==='bat_roost')spawnMany(['bat','bat','shadow'],4+Math.min(6,floor));
    if(env.archetype==='spider_nest')spawnMany(['spider','spider','slime'],4+Math.min(6,floor));
    if(env.archetype==='skeleton_crypt')spawnMany(['skeleton','skeleton','shadow'],4+Math.min(6,floor));
    if(env.archetype==='statue_gallery')spawnMany(['skeleton','zombie'],3+Math.min(5,floor));
    if(env.archetype==='mirror_room'&&!game.enemies.some(e=>e.environmentObjective==='mirror')){
      const stats=getDerivedStats();
      const echo=spawnEnemy('shadow',game.roomWorld.w/2+260,game.roomWorld.h/2,{alpha:true,name:`Echo of ${game.character.name}`,hp:Math.max(90,stats.maxHealth*.85),damage:Math.max(12,getWeaponProfile().damage*.7),speed:130,xp:70+floor*18});
      echo.environmentObjective='mirror'; echo.color='#9b87c7'; echo.radius*=1.25;
    }
    if(env.archetype==='survival_room')spawnMany(['zombie','skeleton','spider','bat'],5+Math.min(6,floor));
  }

  function setupRoomEnvironmentFeatures(room) {
    const env=game.roomEnvironment;if(!env)return;
    if(env.archetype==='treasure_vault'){
      const cx=game.roomWorld.w/2,cy=game.roomWorld.h/2;
      room.environmentState.vaultChests ||= {};
      const positions=[[cx-320,cy],[cx,cy-170],[cx+320,cy]];
      positions.forEach(([x,y],index)=>game.roomFeatures.push({id:`vault_chest_${index}`,type:'chest',x,y,opened:!!room.environmentState.vaultChests[index],vaultIndex:index}));
    }
    if(env.archetype==='frozen_braziers'){
      for(const zone of env.zones.filter(z=>z.type==='warmth')) game.roomFeatures.push({id:uid('feature'),type:'brazier',x:zone.x,y:zone.y,used:false});
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
      if ((!game.player || dist(candidate.x, candidate.y, game.player.x, game.player.y) >= minimumPlayerDistance) && !pointIsUnsafeEnvironment(candidate.x,candidate.y,type === 'boss' ? 110 : 48)) return candidate;
    }
    const fallbackEdge = entryDir ? DIRS.find(dir => dir.key === entryDir)?.opposite : choose(allEdges);
    const fallback = makeCandidate(fallbackEdge || 'N');
    if (fallback.edge === 'N' || fallback.edge === 'S') fallback.x = game.roomWorld.w / 2;
    else fallback.y = game.roomWorld.h / 2;
    const safe=findSafeEnvironmentPoint(fallback.x,fallback.y,type === 'boss'?110:48);fallback.x=safe.x;fallback.y=safe.y;return fallback;
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
    const safeSpawn=findSafeEnvironmentPoint(sx,sy,(extra.radius||base.radius)*alphaRadius+12);sx=safeSpawn.x;sy=safeSpawn.y;
    const rawHp = (extra.hp || base.hp) * alphaHp;
    const e = {
      id: uid('enemy'), type, name: extra.name || base.name,
      x: sx, y: sy, vx: 0, vy: 0, radius: (extra.radius || base.radius) * alphaRadius,
      maxHp: Math.round(rawHp * scale), hp: Math.round(rawHp * scale),
      speed: (extra.speed || base.speed) * alphaSpeed * ENEMY_SPEED_MULTIPLIER * (1 + (floorLevel - 1) * 0.02),
      damage: Math.round((extra.damage || base.damage) * alphaDamage * (1 + (floorLevel - 1) * 0.13)),
      mass: (extra.mass || base.mass) * (isAlpha ? 1.35 : 1), color: extra.color || base.color,
      xp: Math.round((extra.xp || base.xp) * alphaXp * (1 + floorLevel * 0.08)),
      level: Math.max(1, Number(extra.level) || floorLevel + (isAlpha ? 1 : 0) + (type === 'boss' ? 2 : 0) - (extra.mini ? 1 : 0)),
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

    if (game.gathering) {
      updateGathering(dt);
      updateParticles(dt);
      if (game.cameraShake.time > 0) {
        game.cameraShake.time = Math.max(0, game.cameraShake.time - dt);
        game.cameraShake.intensity *= Math.pow(0.035, dt);
      } else game.cameraShake.intensity = 0;
      return;
    }

    updatePlayer(dt);
    if (game.scene === 'camp') updateCamp(dt);
    else if (game.scene === 'overworld') updateOverworld(dt);
    else { updateDungeon(dt); updateDungeonEnvironment(dt); }
    updateAreaEffects(dt);
    updateSpellEffects(dt);
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
    const asc = getAscensionBonuses();
    const dodgeCost = Math.max(1, Math.round(DODGE.combatCost * (1 - asc.dodgeCostReduction)));
    if (combat && p.stamina < dodgeCost) {
      toast('Not enough stamina to dodge.', 900);
      return false;
    }
    if (combat) {
      p.stamina = Math.max(0, p.stamina - dodgeCost);
      p.staminaRegenDelay = DODGE.regenDelay;
    } else {
      p.stamina = p.maxStamina;
    }
    p.dodge = { x: dir.x, y: dir.y, time: DODGE.duration, duration: DODGE.duration, chargeHitIds: new Set() };
    p.dodgeCooldown = 0.08;
    p.invuln = Math.max(p.invuln, DODGE.duration + 0.06 + asc.dodgeIframes);
    p.facing = { ...dir };
    game.particles.push({ type: 'ring', x: p.x, y: p.y, r: 8, maxR: 42, t: 0, duration: 0.16, color: combat ? '#77cbe8' : '#d6d6d6' });
    return true;
  }

  function updatePlayer(dt) {
    const p = game.player;
    updatePlayerStatusEffects(p, dt);
    const stats = getDerivedStats();
    p.maxHealth = stats.maxHealth;
    p.maxMana = stats.maxMana;
    p.maxStamina = stats.maxStamina;
    p.health = Math.min(p.health, p.maxHealth);
    p.stamina = Math.min(p.stamina, p.maxStamina);
    p.timeSinceDamage = (p.timeSinceDamage || 0) + dt;
    const input = updateInputVector();
    const inputMagnitude = Math.hypot(input.x, input.y);
    p.moveIntent = { x: input.x, y: input.y, magnitude: inputMagnitude };
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
      p.stamina = Math.min(p.maxStamina, p.stamina + DODGE.regenPerSecond * (1 + getAscensionBonuses().staminaRegen) * dt);
    }

    if (p.dodge) {
      const fromX = p.x, fromY = p.y;
      const dodgeSpeed = DODGE.speed * (1 + getAscensionBonuses().dodgeDistance);
      p.x += p.dodge.x * dodgeSpeed * dt;
      p.y += p.dodge.y * dodgeSpeed * dt;
      p.vx = p.dodge.x * dodgeSpeed;
      p.vy = p.dodge.y * dodgeSpeed;
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
      const movementScale = (p.slowTimer > 0 ? 0.58 : 1) * (game.scene === 'dungeon' ? environmentMovementMultiplierAt(p.x,p.y,false) : 1);
      const targetVx = input.x * stats.speed * movementScale;
      const targetVy = input.y * stats.speed * movementScale;
      const icy = game.scene === 'dungeon' && environmentIceAt(p.x,p.y);
      const response = icy ? (inputMagnitude > 0.04 ? 7 : 2.4) : (inputMagnitude > 0.04 ? 34 : 52);
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
    updatePlayerMagic(dt);

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
    const ascensionRegen = getAscensionBonuses().healthRegen;
    if (ascensionRegen > 0 && p.timeSinceDamage >= 4 && p.health > 0) {
      p.health = Math.min(p.maxHealth, p.health + p.maxHealth * ascensionRegen * dt);
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
        weapon.damage * DODGE.chargeBonusDamage * (1 + getAscensionBonuses().dodgeChargeDamage),
        weapon.knockback * DODGE.chargeKnockbackMult * (1 + getAscensionBonuses().dodgeChargeKnockback),
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
      weapon, hitIds: new Set(), fireHitIds: new Set(),
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
      if (getAscensionBonuses().arcaneFireStrike > 0) {
        const fireReach = a.weapon.reach * 1.38;
        const fireThickness = Math.min(.62, a.weapon.bladeWidth + .16);
        for (const enemy of game.enemies) {
          if (enemy.dead || a.fireHitIds.has(enemy.id)) continue;
          const dx = enemy.x - p.x, dy = enemy.y - p.y;
          const d = Math.hypot(dx, dy);
          if (d > fireReach + enemy.radius || d < 12) continue;
          const enemyAngle = Math.atan2(dy, dx);
          if (Math.abs(angleDiff(enemyAngle, a.currentAngle)) <= fireThickness + enemy.radius / Math.max(55, d)) {
            a.fireHitIds.add(enemy.id);
            hitEnemy(enemy, spellDamage(.38), a.weapon.knockback * .16, dx, dy, { damageType:'magic', element:'fire', label:'FLAME', color:'#ff7a39' });
            enemy.burnTimer = Math.max(enemy.burnTimer || 0, 2.4);
            enemy.burnTick = .1;
          }
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
        a.fireHitIds = new Set();
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

  function enemyTier(enemy) {
    return enemy?.type === 'boss' || enemy?.isAlpha ? 'elite' : 'lesser';
  }

  function hitEnemy(enemy, damage, knockback, dx, dy, options = {}) {
    const variance = rand(0.9, 1.1);
    const stats = getDerivedStats();
    const asc = getAscensionBonuses();
    const damageType = options.damageType || 'physical';
    const tier = enemyTier(enemy);
    let multiplier = 1;
    if (damageType === 'physical') {
      multiplier *= 1 + asc.physicalDamage;
      multiplier *= 1 + (tier === 'elite' ? asc.elitePhysicalDamage : asc.lesserPhysicalDamage);
    } else if (damageType === 'magic') {
      multiplier *= 1 + (tier === 'elite' ? asc.eliteMagicDamage : asc.lesserMagicDamage);
    }
    if (options.element && enemy.resistances?.[options.element]) multiplier *= Math.max(.05, 1 - enemy.resistances[options.element]);
    if (options.element && enemy.weaknesses?.[options.element]) multiplier *= 1 + enemy.weaknesses[options.element];
    const critChance = damageType === 'magic' ? stats.magicCritChance : stats.critChance;
    const critical = options.canCrit === false ? false : (options.critical ?? chance(critChance));
    const amount = Math.max(1, Math.round(damage * multiplier * variance * (critical ? stats.critDamage : 1)));
    enemy.hp -= amount;
    enemy.hitFlash = 0.12;
    const n = normalize(dx, dy);
    const magicKnockback = damageType === 'magic' ? (1 + asc.magicKnockback) : 1;
    const appliedKnockback = options.noKnockback ? 0 : Math.max(0, Number(knockback) || 0) * magicKnockback * PLAYER_KNOCKBACK_MULTIPLIER;
    enemy.vx += n.x * appliedKnockback / enemy.mass;
    enemy.vy += n.y * appliedKnockback / enemy.mass;
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
    maybeDropAscensionTome(enemy);
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
      if (chance(0.04)) {
        const pool = enemy.isAlpha ? ['health_potion','lesser_mana_potion','lesser_stamina_potion','greater_health_potion'] : ['lesser_health_potion','health_potion','lesser_mana_potion','lesser_stamina_potion'];
        spawnDrop(enemy.x, enemy.y, potionItem(choose(pool)));
      }
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
    normalizeAscension(c);
    c.xp += amount;
    let leveled = false;
    while (c.xp >= xpNeeded(c.level)) {
      c.xp -= xpNeeded(c.level);
      c.level += 1;
      c.stats.vitality += 1;
      c.ascension.generalPoints += 1;
      c.ascension.levelPointsGranted += 1;
      c.ascension.revision += 1;
      game.ascensionBonusCache = null;
      leveled = true;
    }
    if (leveled) {
      game.player.maxHealth = getDerivedStats().maxHealth;
      game.player.health = Math.min(game.player.maxHealth, game.player.health + 35);
      toast(`Level ${c.level}! Ascension Point gained.`, 2400);
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

  function nearestCampPathJoinIndex(x, y) {
    let best = 0, bestDist = Infinity;
    for (let i = 0; i < CAMP_VISITOR_PATH.length; i += 1) {
      const point = CAMP_VISITOR_PATH[i];
      const d = dist(x, y, point.x, point.y);
      if (d < bestDist) { best = i; bestDist = d; }
    }
    return best;
  }

  function startNpcDeparture(npc) {
    const joinIndex = nearestCampPathJoinIndex(npc.x, npc.y);
    const pathOut = CAMP_VISITOR_PATH.slice(0, joinIndex + 1).reverse();
    npc.routeMode = 'depart';
    npc.routeIndex = 0;
    npc.route = [{ x: npc.x, y: npc.y }, ...pathOut];
    npc.routeSpeed = 78;
    npc.vx = npc.vy = 0;
    npc.departing = true;
  }

  function spawnQuestVisitorFromPath(slotIndex = 0) {
    const npc = createQuestCampNpc(slotIndex);
    const start = CAMP_VISITOR_PATH[0];
    const end = CAMP_VISITOR_PATH[CAMP_VISITOR_PATH.length - 1];
    npc.x = start.x; npc.y = start.y;
    npc.homeX = end.x + rand(-80, 120);
    npc.homeY = end.y + rand(-90, 100);
    npc.routeMode = 'arrive';
    npc.routeIndex = 0;
    npc.route = [...CAMP_VISITOR_PATH.slice(1), { x: npc.homeX, y: npc.homeY }];
    npc.routeSpeed = 82;
    npc.wanderRadius = 118;
    return npc;
  }

  function updateCampNpcRoute(npc, dt) {
    if (!npc.route?.length) return false;
    const target = npc.route[npc.routeIndex] || npc.route[npc.route.length - 1];
    const dx = target.x - npc.x;
    const dy = target.y - npc.y;
    const distance = Math.hypot(dx, dy);
    if (distance <= 8) {
      npc.x = target.x; npc.y = target.y;
      npc.routeIndex += 1;
      if (npc.routeIndex >= npc.route.length) {
        if (npc.routeMode === 'depart') {
          npc.removeFromCamp = true;
          if (npc.pendingReplacementSlot != null) {
            game.campNpcs.push(spawnQuestVisitorFromPath(npc.pendingReplacementSlot));
            game.character.campNpcs = game.campNpcs;
          }
        } else {
          npc.route = null;
          npc.routeIndex = 0;
          npc.routeMode = null;
          npc.departing = false;
        }
      }
      return true;
    }
    const dir = normalize(dx, dy);
    const speed = npc.routeSpeed || 80;
    npc.vx = dir.x * speed; npc.vy = dir.y * speed;
    npc.x += dir.x * speed * dt;
    npc.y += dir.y * speed * dt;
    npc.facingX = dir.x; npc.facingY = dir.y;
    return true;
  }

  function getCampStructureColliders() {
    return [
      { shape:'rect', x1:255, y1:392, x2:612, y2:648 }, // supplies tent footprint
      { shape:'rect', x1:1182, y1:392, x2:1548, y2:654 }, // blacksmith building footprint
      { shape:'rect', x1:636, y1:494, x2:766, y2:592 }, // storage chest footprint
    ];
  }

  function resolveCampStructureCollisions(entity) {
    if (!entity) return;
    for (const collider of getCampStructureColliders()) {
      if (collider.shape === 'circle') resolveCircleObstacle(entity, collider);
      else resolveRectObstacle(entity, collider);
    }
  }

  function updateCamp(dt) {
    const p = game.player;
    game.worldTransitionCooldown = Math.max(0, game.worldTransitionCooldown - dt);
    for (const npc of game.campNpcs) {
      if (updateCampNpcRoute(npc, dt)) continue;
      npc.wanderTimer -= dt;
      if (npc.wanderTimer <= 0) {
        npc.wanderTimer = rand(1.5, 4.5);
        const dir = normalize(rand(-1, 1), rand(-1, 1));
        npc.vx = dir.x * rand(12, 32);
        npc.vy = dir.y * rand(12, 32);
      }
      npc.x += npc.vx * dt;
      npc.y += npc.vy * dt;
      if (npc.homeX != null && npc.homeY != null) {
        const radius = npc.wanderRadius || 110;
        const offset = normalize(npc.x - npc.homeX, npc.y - npc.homeY);
        const homeDistance = dist(npc.x, npc.y, npc.homeX, npc.homeY);
        if (homeDistance > radius) {
          npc.x = npc.homeX + offset.x * radius;
          npc.y = npc.homeY + offset.y * radius;
          npc.vx *= -0.55; npc.vy *= -0.55;
        }
      }
      npc.x = clamp(npc.x, 120, 1540);
      npc.y = clamp(npc.y, 480, 1160);
      resolveCampStructureCollisions(npc);
      if (Math.hypot(npc.vx, npc.vy) > 2) {
        const facing = normalize(npc.vx, npc.vy);
        npc.facingX = facing.x;
        npc.facingY = facing.y;
      }
    }
    if (game.campNpcs.some(npc => npc.removeFromCamp)) {
      game.campNpcs = game.campNpcs.filter(npc => !npc.removeFromCamp);
      game.character.campNpcs = game.campNpcs;
    }
    resolveCampStructureCollisions(p);
    const dFire = dist(p.x, p.y, 900, 800);
    if (dFire < 70) {
      const n = normalize(p.x - 900, p.y - 800);
      p.x = 900 + n.x * 70; p.y = 800 + n.y * 70;
    }

    // The automatic entrance trigger follows the visible recessed cave mouth.
    const ex = (p.x - 760) / 74;
    const ey = (p.y - 326) / 70;
    const insideEntrance = ex * ex + ey * ey <= 1;
    const outsideReset = ((p.x - 760) / 116) ** 2 + ((p.y - 326) / 112) ** 2 > 1;
    if (outsideReset) game.campEntranceArmed = true;
    if (insideEntrance && game.campEntranceArmed && !game.paused) {
      game.campEntranceArmed = false;
      p.vx = p.vy = 0;
      showFloorSelection();
    }

    const roadExit = dist(p.x, p.y, 88, 1190) <= 66;
    if (roadExit && game.worldTransitionCooldown <= 0 && !game.paused) {
      p.vx = p.vy = 0;
      enterOverworld('forestCrossroads', 'camp');
    }
  }

  function updateOverworld(dt) {
    game.worldTransitionCooldown = Math.max(0, game.worldTransitionCooldown - dt);
    const zone = OVERWORLD_ZONES[game.overworldZone];
    if (!zone || !game.player || game.worldTransitionCooldown > 0) return;
    const gate = zone.gates.find(candidate => dist(game.player.x, game.player.y, candidate.x, candidate.y) <= 72);
    if (gate) travelWorldGate(gate);
  }

  function updateDungeon(dt) {
    updateEnemies(dt);
    const room = currentRoom();
    if (!room) return;
    if (!room.cleared && room.type !== 'puzzle' && room.type !== 'escape' && room.type !== 'rest' && room.type !== 'start') {
      const alive = game.enemies.some(e => !e.dead && e.type !== 'boss');
      const bossAlive = game.enemies.some(e => !e.dead && e.type === 'boss');
      if (!alive && !bossAlive && room.type !== 'boss' && roomObjectiveComplete(room)) {
        room.cleared = true;
        toast('Room cleared. The doors unlock.');
      } else if (!alive && !bossAlive && !roomObjectiveComplete(room)) {
        if (!room.objectiveReminderShown) { room.objectiveReminderShown=true; toast('The room is quiet, but its mechanism is still active.',1800); }
      }
    }
    if (room.type === 'gathering' && !game.enemies.some(e => !e.dead) && roomObjectiveComplete(room)) room.cleared = true;
    if (room.type === 'treasure' && !game.enemies.some(e => !e.dead) && roomObjectiveComplete(room)) room.cleared = true;
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
    const telegraphDelay = Math.max(0.05, delay + (sourceId === 'player' ? 0 : ENEMY_TELEGRAPH_BONUS));
    game.areaEffects.push({ id: uid('effect'), type: 'blast', element, x, y, radius, duration: telegraphDelay, time: telegraphDelay, damage, sourceId, hazardDuration: options.hazardDuration || 5.5, statusDuration: options.statusDuration || 3.2 });
  }

  function createVortex(x, y, radius, damage, sourceId = null) {
    const warningBonus = sourceId === 'player' ? 0 : ENEMY_TELEGRAPH_BONUS;
    const warmup = 0.55 + warningBonus;
    const duration = 2.05 + warningBonus;
    game.areaEffects.push({ id: uid('effect'), type: 'vortex', x, y, radius, duration, time: duration, warmup, damage, sourceId, pull: 720 });
  }

  function createConeTelegraph(x, y, angle, range, arc, delay, damage, sourceId = null, confuseDuration = 2.6) {
    const telegraphDelay = Math.max(0.05, delay + (sourceId === 'player' ? 0 : ENEMY_TELEGRAPH_BONUS));
    game.areaEffects.push({ id: uid('effect'), type: 'cone', x, y, angle, range, arc, duration: telegraphDelay, time: telegraphDelay, damage, sourceId, confuseDuration });
  }

  function pointInCone(px, py, effect, extraRadius = 0) {
    const dx = px - effect.x, dy = py - effect.y;
    const d = Math.hypot(dx, dy);
    if (d > effect.range + extraRadius) return false;
    const a = Math.atan2(dy, dx);
    return Math.abs(angleDiff(a, effect.angle)) <= effect.arc / 2 + extraRadius / Math.max(1, d);
  }

  function damageCircle(x, y, radius, damage, sourceId = null, status = null, statusDuration = 0, damageType = 'magic') {
    const p = game.player;
    const sourceEnemy = sourceEnemyFromId(sourceId);
    if (sourceId !== 'player' && p && dist(x, y, p.x, p.y) <= radius + p.radius) {
      damagePlayer(damage, x, y, { sourceEnemy, damageType });
      if (status) applyPlayerStatus(status, statusDuration);
    }
    for (const enemy of game.enemies) {
      if (enemy.dead || enemy.id === sourceId) continue;
      if (dist(x, y, enemy.x, enemy.y) <= radius + enemy.radius) {
        if (sourceId === 'player') {
          const element = status === 'burn' ? 'fire' : status === 'poison' ? 'poison' : null;
          hitEnemy(enemy, damage * .72, 110, enemy.x - x, enemy.y - y, { damageType:'magic', element, color:status === 'burn' ? '#ff8a4c' : '#ead8aa' });
        } else {
          environmentalDamageEnemy(enemy, damage * 0.72, status === 'burn' ? '#ff8a4c' : status === 'poison' ? '#8fe56e' : '#ead8aa', status ? `${status.toUpperCase()} ` : '');
        }
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
          if (effect.sourceId !== 'player' && p && dist(effect.x, effect.y, p.x, p.y) <= effect.radius + p.radius) {
            if (effect.element !== 'web') damagePlayer(effect.damage, effect.x, effect.y, { sourceId:effect.sourceId, damageType:'magic' });
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
              const radialStrength = 1 - clamp(pd / (effect.radius * 1.75), 0, 1);
              const intent = p.moveIntent || { x: 0, y: 0, magnitude: 0 };
              let movementResistance = 1;
              if (p.dodge) {
                movementResistance = 0.06;
              } else if (intent.magnitude > 0.12) {
                const away = normalize(p.x - effect.x, p.y - effect.y);
                const escapeAlignment = intent.x * away.x + intent.y * away.y;
                const corePressure = clamp(1 - pd / Math.max(1, effect.radius), 0, 1);
                if (escapeAlignment > 0.28) movementResistance = 0.18 + corePressure * 0.08;
                else if (escapeAlignment > -0.25) movementResistance = 0.42;
                else movementResistance = 0.86;
              }
              const strength = radialStrength * effect.pull * movementResistance;
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
          if (effect.element === 'web') {
            createGroundHazard('web', effect.x, effect.y, effect.radius, effect.hazardDuration, 0, effect.sourceId);
          } else {
            const status = effect.element === 'fire' ? 'burn' : effect.element === 'poison' ? 'poison' : null;
            damageCircle(effect.x, effect.y, effect.radius, effect.damage, effect.sourceId, status, effect.statusDuration, effect.element === 'stomp' ? 'physical' : 'magic');
            if (effect.element === 'fire' || effect.element === 'poison') createGroundHazard(effect.element, effect.x, effect.y, effect.radius * 0.9, effect.hazardDuration, Math.max(2, effect.damage * 0.18), effect.sourceId);
            addCameraShake(effect.element === 'fire' ? 9 : 7, 0.25);
          }
        } else if (effect.type === 'vortex') {
          damageCircle(effect.x, effect.y, effect.radius, effect.damage, effect.sourceId, null, 0, 'magic');
          addCameraShake(10, 0.3);
        } else if (effect.type === 'cone') {
          if (p && pointInCone(p.x, p.y, effect, p.radius)) {
            damagePlayer(effect.damage, effect.x, effect.y, { sourceId:effect.sourceId, damageType:'magic' });
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
      e.specialState = 'slimeWindup'; e.specialTimer = 0.48 + ENEMY_TELEGRAPH_BONUS; e.specialDuration = 0.48 + ENEMY_TELEGRAPH_BONUS; e.specialTarget = { x: targetX, y: targetY };
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
      createBlastTelegraph('web', targetX, targetY, 118, 0.55, 0, e.id, { hazardDuration: 5.4, statusDuration: 0.55 });
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
      e.specialState = 'chargeWindup'; e.specialTimer = 0.48 + ENEMY_TELEGRAPH_BONUS;
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
            fireProjectile(e.x, e.y, n.x * (e.mini ? 285 : 320), n.y * (e.mini ? 285 : 320), e.damage, '#e7dfc9', e.mini ? 5 : 7, 'enemy', { sourceId:e.id, damageType:'physical' });
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
            if (e.cooldown <= 0 && d < 760) { e.state = 'telegraph'; e.stateTimer = 0.46 + ENEMY_TELEGRAPH_BONUS; }
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
              e.state = 'vanish'; e.stateTimer = 0.34 + ENEMY_TELEGRAPH_BONUS; e.teleportCooldown = rand(3.2, 5.1);
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
              fireProjectile(e.x, e.y, Math.cos(a) * 300, Math.sin(a) * 300, e.damage, '#f08042', 6, 'enemy', { sourceId:e.id, damageType:'magic', element:'fire' });
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
      const environmentScale=environmentMovementMultiplierAt(e.x,e.y,true);
      const maxSpeed = (charging ? 1320 : e.type === 'boss' ? e.speed * (e.bossMode === 'sprint' ? 5.1 : e.bossMode === 'medium' ? 2.9 : 1.35) : burst ? 720 : e.speed * (d > 620 ? 2.7 : 2.35) * slowScale) * environmentScale;
      const vm = Math.hypot(e.vx, e.vy);
      if (vm > maxSpeed) { e.vx = e.vx / vm * maxSpeed; e.vy = e.vy / vm * maxSpeed; }
      e.x = clamp(e.x + e.vx * dt, e.radius + 32, game.roomWorld.w - e.radius - 32);
      e.y = clamp(e.y + e.vy * dt, e.radius + 32, game.roomWorld.h - e.radius - 32);

      if (dist(e.x, e.y, p.x, p.y) < e.radius + p.radius && e.contactCooldown <= 0 && p.barrierTimer <= 0) {
        e.contactCooldown = charging ? 0.95 : 0.72;
        damagePlayer(e.damage * (charging ? 2.15 : 1), e.x, e.y, { sourceEnemy:e, damageType:'physical' });
      }
    }
    game.enemies = game.enemies.filter(e => !e.dead || e.hitFlash > 0);
  }
  function fireProjectile(x, y, vx, vy, damage, color, radius = 7, owner = 'enemy', options = {}) {
    if (owner === 'enemy' && game.player?.silenceTimer > 0) return null;
    if (owner === 'player' && options.sourceSpell) radius *= 1 + getAscensionBonuses().projectileSize;
    const hp = Math.max(1, Number(options.hp) || 1);
    const projectile = {
      id: uid('proj'), x, y, vx, vy, damage, color, radius, owner,
      life: Number(options.life) || (owner === 'enemy' ? 10 : 7), hp, maxHp: hp,
      bounces: options.bounces ?? (owner === 'enemy' ? 6 : 0), bounceGrace: 0,
      status: options.status || null, statusDuration: Number(options.statusDuration) || 0,
      knockback: Number(options.knockback) || 180, pierce: Number(options.pierce) || 0,
      sourceSpell: options.sourceSpell || null, sourceId: options.sourceId || null, damageType: options.damageType || (owner === 'player' ? 'magic' : 'physical'), element: options.element || null,
    };
    game.projectiles.push(projectile);
    return projectile;
  }
  function destroyProjectile(projectile) {
    if (!projectile || projectile.life <= 0) return;
    projectile.hp = 0;
    projectile.life = 0;
    game.particles.push({ type: 'ring', x: projectile.x, y: projectile.y, r: 3, maxR: 25, t: 0, duration: 0.18, color: '#f7e4b4' });
  }

  function interactProjectileWithEnvironment(projectile) {
    const env=game.roomEnvironment;if(!env||projectile.owner!=='player'||projectile.envInteracted)return;
    const element=projectile.element||SPELLS[projectile.sourceSpell]?.element||null;if(!element)return;
    const zones=environmentZonesAt(projectile.x,projectile.y,projectile.radius);
    if(element==='ice'&&zones.some(zone=>['water','deepWater'].includes(zone.type))){
      addCircleZone(env,'iceBridge',projectile.x,projectile.y,145,{time:7});projectile.envInteracted=true;projectile.life=0;game.particles.push({type:'ring',x:projectile.x,y:projectile.y,r:20,maxR:150,t:0,duration:.45,color:'#bceaf1'});return;
    }
    if(element==='water'&&zones.some(zone=>['lava','fire'].includes(zone.type))){
      addCircleZone(env,'safeStone',projectile.x,projectile.y,145,{time:8});projectile.envInteracted=true;projectile.life=0;game.particles.push({type:'ring',x:projectile.x,y:projectile.y,r:25,maxR:155,t:0,duration:.5,color:'#a6aaa3'});return;
    }
    if(element==='fire'&&zones.some(zone=>['poison','corruption','ice','iceBridge'].includes(zone.type))){
      env.zones=env.zones.filter(zone=>!zones.includes(zone)||!['poison','corruption','ice','iceBridge'].includes(zone.type));
      if(zones.some(zone=>['ice','iceBridge'].includes(zone.type)))addCircleZone(env,'water',projectile.x,projectile.y,130,{time:6,slow:.75});
      projectile.envInteracted=true;game.particles.push({type:'ring',x:projectile.x,y:projectile.y,r:20,maxR:130,t:0,duration:.4,color:'#ff9b58'});
    }
  }

  function projectileHitsEnvironmentObstacle(projectile) {
    return (game.roomEnvironment?.obstacles||[]).some(obstacle=>!obstacle.nonBlocking&&pointInEnvironmentShape(projectile.x,projectile.y,obstacle,projectile.radius));
  }

  function updateProjectiles(dt) {
    const p = game.player;
    const wall = 24;
    for (const pr of game.projectiles) {
      pr.life -= dt;
      pr.bounceGrace = Math.max(0, (pr.bounceGrace || 0) - dt);
      pr.x += pr.vx * dt;
      pr.y += pr.vy * dt;
      interactProjectileWithEnvironment(pr);
      if (game.roomEnvironment?.modifier === 'arcane_wind' || game.roomEnvironment?.archetype === 'wind_chamber') {
        const bend = pr.owner === 'player' ? .7 : .25; const vx=pr.vx,vy=pr.vy; pr.vx=vx*Math.cos(bend*dt)-vy*Math.sin(bend*dt); pr.vy=vx*Math.sin(bend*dt)+vy*Math.cos(bend*dt);
      }
      if (pr.life > 0 && projectileHitsEnvironmentObstacle(pr)) { destroyProjectile(pr); continue; }
      if (pr.owner === 'enemy' && dist(pr.x, pr.y, p.x, p.y) < pr.radius + p.radius) {
        pr.life = 0;
        const sourceEnemy = pr.sourceId ? game.enemies.find(enemy => enemy.id === pr.sourceId) : null;
        damagePlayer(pr.damage, pr.x, pr.y, { sourceEnemy, damageType:pr.damageType || 'physical' });
        continue;
      }
      if (pr.owner === 'player') {
        for (const enemy of game.enemies) {
          if (enemy.dead || dist(pr.x, pr.y, enemy.x, enemy.y) >= pr.radius + enemy.radius) continue;
          const n = normalize(pr.vx, pr.vy);
          const element = pr.element || SPELLS[pr.sourceSpell]?.element || null;
          hitEnemy(enemy, pr.damage, pr.knockback, n.x, n.y, { damageType:'magic', element, color: pr.color });
          if (pr.status === 'burn') { enemy.burnTimer = Math.max(enemy.burnTimer || 0, pr.statusDuration || 3); enemy.burnTick = 0.1; }
          if (pr.status === 'slow') enemy.slowTimer = Math.max(enemy.slowTimer || 0, pr.statusDuration || 2.5);
          if ((pr.pierce || 0) > 0) pr.pierce -= 1; else pr.life = 0;
          break;
        }
        if (pr.life <= 0) continue;
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

  function sourceEnemyFromId(sourceId) {
    return sourceId && sourceId !== 'player' ? game.enemies.find(enemy => enemy.id === sourceId) || null : null;
  }

  function damagePlayer(raw, sourceX, sourceY, options = {}) {
    const p = game.player;
    if (p.invuln > 0 && !options.ignoreInvuln) return;
    const derived = getDerivedStats();
    const asc = getAscensionBonuses();
    const sourceEnemy = options.sourceEnemy || sourceEnemyFromId(options.sourceId);
    let multiplier = 1 - asc.damageReduction;
    if (sourceEnemy) multiplier *= 1 - (enemyTier(sourceEnemy) === 'elite' ? asc.eliteReduction : asc.lesserReduction);
    if (options.damageType === 'magic') multiplier *= 1 - asc.magicResistance;
    const damage = Math.max(1, Math.round(raw * Math.max(.08, multiplier) * (100 / (100 + derived.armor * 2.1))));
    p.health -= damage;
    p.timeSinceDamage = 0;
    if (!options.dot) p.invuln = 0.34;
    const n = normalize(p.x - sourceX, p.y - sourceY);
    if (!options.dot) { p.x += n.x * 16; p.y += n.y * 16; }
    game.particles.push({ type: 'text', x: p.x, y: p.y - 30, text: `-${damage}`, t: 0, duration: 0.7, color: '#ff7766' });
    addCameraShake(Math.min(11, 5 + damage * 0.18), 0.24);
    if (p.health <= 0) handleDeath();
  }

  function deathProtectionScore(item) {
    if (!item) return 0;
    if (item.type === 'gear') return 10000 + rarityRank(item.rarity) * 2400 + gearStrength(item) * 12;
    if (item.ascensionPath) return 25000;
    if (item.rarity === 'legendary') return 9000;
    if (item.rarity === 'epic') return 6500;
    if (item.type === 'quest') return 5000;
    if (item.type === 'consumable') return 1800 + (item.qty || 1) * 20;
    return 700 + (item.qty || 1) * 10;
  }

  function guaranteedDeathKeepIndices(count) {
    return new Set(game.character.inventory
      .map((item, index) => ({ index, score:deathProtectionScore(item) }))
      .sort((a,b) => b.score - a.score)
      .slice(0, Math.max(0, count))
      .map(entry => entry.index));
  }

  function handleDeath() {
    if (game.paused) return;
    game.character.deaths += 1;
    const keepCount = Math.min(game.character.inventory.length, getAscensionBonuses().guaranteedKeeps);
    const protectedIndices = guaranteedDeathKeepIndices(keepCount);
    const protectedItems = [...protectedIndices].map(index => game.character.inventory[index]).filter(Boolean);
    const lost = loseInventory(0.7, protectedIndices);
    game.player.health = getDerivedStats().maxHealth;
    game.character.currentHealth = game.player.health;
    enterCamp();
    showModal('Carried Back to Camp', `
      <p>You were found unconscious near the dungeon entrance. Your equipped gear was still on you, but much of your loose inventory was gone.</p>
      ${protectedItems.length ? `<p><strong>Tenacity protected:</strong> ${protectedItems.map(i => escapeHtml(i.name)).join(', ')}</p>` : ''}
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

  function itemCountInCollection(collection, id) {
    return (collection || []).filter(i => i.id === id).reduce((sum, i) => sum + (i.qty || 1), 0);
  }

  function isPotionId(id) { return !!POTION_DEFS[id]; }
  function isPotionItem(item) { return !!item && isPotionId(item.id); }
  function potionCategory(idOrItem) {
    const id = typeof idOrItem === 'string' ? idOrItem : idOrItem?.id;
    return POTION_DEFS[id]?.category || null;
  }
  function potionItem(id, qty = 1) {
    const def = POTION_DEFS[id];
    return { id, name: def.name, type: 'consumable', qty, stackable: true, description: def.description };
  }
  function potionFamilyCount(category) {
    return (POTION_ORDER[category] || []).reduce((sum, id) => sum + itemCount(id), 0);
  }
  function potionPrice(id) {
    const def = POTION_DEFS[id];
    if (!def) return 0;
    return Math.round(def.basePrice * Math.pow(1.08, potionFamilyCount(def.category)));
  }
  function chooseAvailablePotion(category, preferredId) {
    const order = POTION_ORDER[category] || [];
    const index = Math.max(0, order.indexOf(preferredId));
    const priority = [...order.slice(index), ...order.slice(0, index)];
    return priority.find(id => itemCount(id) > 0) || null;
  }
  function assignPotionSlot(category, potionId, quiet = false) {
    if (!(POTION_ORDER[category] || []).includes(potionId)) return false;
    game.character.potionLoadout ||= {};
    game.character.potionLoadout[category] = potionId;
    if (!quiet) toast(`${POTION_SHORT[category]} slot set to ${POTION_DEFS[potionId].name}.`, 1500);
    saveGame();
    return true;
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
    const gained = Math.max(0, Math.floor(Number(amount) || 0));
    if (!skill || gained <= 0 || skill.level >= GATHERING_LEVEL_CAP) return { gained:0, levels:0 };
    skill.xp += gained;
    let levels = 0;
    while (skill.level < GATHERING_LEVEL_CAP && skill.xp >= skillXpNeeded(skill.level)) {
      skill.xp -= skillXpNeeded(skill.level);
      skill.level += 1;
      levels += 1;
    }
    if (skill.level >= GATHERING_LEVEL_CAP) skill.xp = 0;
    if (levels) toast(`${formatName(skillName)} reached level ${skill.level}.`);
    return { gained, levels };
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

  function weightedChoice(entries, weightKey = 'weight') {
    const total = entries.reduce((sum, entry) => sum + Math.max(0, Number(entry[weightKey]) || 0), 0);
    if (total <= 0) return entries[0] || null;
    let roll = Math.random() * total;
    for (const entry of entries) {
      roll -= Math.max(0, Number(entry[weightKey]) || 0);
      if (roll <= 0) return entry;
    }
    return entries[entries.length - 1] || null;
  }

  function treeResourceId(zoneId, tree) {
    return `${zoneId}:tree:${tree.resourceIndex ?? Math.round(tree.x)}:${Math.round(tree.y)}`;
  }

  function getTreeResourceState(zoneId, tree, create = true) {
    if (!game.character) return null;
    normalizeSkillsAndWorld(game.character);
    const id = treeResourceId(zoneId, tree);
    let state = game.character.worldResources.treeStates[id];
    const now = Date.now();
    if (state?.respawnAt && state.respawnAt <= now) {
      delete game.character.worldResources.treeStates[id];
      state = null;
    }
    if (!state && create) {
      state = { remaining:100, yieldGranted:0, respawnAt:0 };
      game.character.worldResources.treeStates[id] = state;
    }
    return state;
  }

  function treeIsStump(zoneId, tree) {
    const state = getTreeResourceState(zoneId, tree, false);
    return !!(state?.respawnAt && state.respawnAt > Date.now());
  }

  function makeTreeResource(zoneId, tree) {
    const state = getTreeResourceState(zoneId, tree, false);
    return {
      id: treeResourceId(zoneId, tree), skill:'woodcutting', name:'Greenwood Tree', icon:'🪓',
      x:tree.x, y:tree.y, visualX:tree.x, visualY:tree.y,
      maxDurability:100, remaining:state?.remaining > 0 ? state.remaining : 100,
      yieldQty:4, yieldGranted:state?.yieldGranted || 0,
      item:{ id:'greenwood_log', name:'Greenwood Log', type:'material', qty:1, stackable:true },
      xpTotal:34, tree, treeZoneId:zoneId, persistentState:state || null, depleted:false,
    };
  }

  function canyonNodeCount() {
    const roll = Math.random();
    if (roll < .19) return 0;
    if (roll < .54) return randInt(1,3);
    if (roll < .84) return randInt(4,6);
    if (roll < .97) return randInt(7,9);
    return randInt(10,12);
  }

  function prepareOverworldResources(zoneId) {
    if (game.worldResourceNoticeTimer) clearTimeout(game.worldResourceNoticeTimer);
    game.worldResourceNoticeTimer = null;
    game.overworldResources = [];
    if (zoneId === 'riverForest') {
      const spots = [
        {x:1075,y:420,visualX:1270,visualY:420}, {x:1930,y:720,visualX:1735,visualY:720},
        {x:1070,y:930,visualX:1265,visualY:930}, {x:1930,y:1510,visualX:1735,visualY:1510},
        {x:1070,y:1850,visualX:1265,visualY:1850}, {x:1930,y:2070,visualX:1735,visualY:2070},
      ];
      const count = randInt(4,6);
      for (let i = 0; i < count; i++) {
        const spot = spots[i];
        const yieldQty = randInt(2,4);
        game.overworldResources.push({
          id:`river_fish_${Date.now()}_${i}`, skill:'fishing', name:'River Fishing Spot', icon:'🎣',
          ...spot, maxDurability:96, remaining:96, yieldQty, yieldGranted:0,
          item:{ id:'river_fish', name:'River Fish', type:'material', qty:1, stackable:true },
          xpTotal:32 + yieldQty * 3, depleted:false,
        });
      }
    } else if (zoneId === 'rockyCanyon') {
      const miningLevel = game.character?.skills?.mining?.level || 1;
      const available = ORE_TYPES.filter(ore => ore.minLevel <= miningLevel);
      const count = canyonNodeCount();
      const placed = [];
      let attempts = 0;
      while (placed.length < count && attempts < 180) {
        attempts += 1;
        const x = rand(1010,1990);
        const y = rand(280,2050);
        if (dist(x,y,1500,2240) < 320 || placed.some(node => dist(x,y,node.x,node.y) < 235)) continue;
        const ore = weightedChoice(available);
        const yieldQty = randInt(ore.yield[0], ore.yield[1]);
        placed.push({
          id:`canyon_ore_${Date.now()}_${placed.length}`, skill:'mining', name:ore.nodeName, icon:'⛏',
          x,y,visualX:x,visualY:y,maxDurability:ore.durability,remaining:ore.durability,
          yieldQty,yieldGranted:0,item:{id:ore.id,name:ore.name,type:'material',qty:1,stackable:true},
          xpTotal:ore.xp + yieldQty * 2, color:ore.color, dark:ore.dark, depleted:false,
        });
      }
      game.overworldResources = placed;
      game.worldResourceNoticeTimer = setTimeout(() => {
        game.worldResourceNoticeTimer = null;
        if (game.scene !== 'overworld' || game.overworldZone !== 'rockyCanyon' || game.overworldResources !== placed) return;
        if (!placed.length) toast('The canyon is quiet today. No ore seams are exposed.', 2600);
        else if (placed.length >= 7) toast(`A rich formation! ${placed.length} ore nodes are exposed.`, 2600);
        else toast(`${placed.length} ore node${placed.length === 1 ? '' : 's'} exposed in the canyon.`, 2300);
      }, 360);
    }
  }

  function canStoreGatheringItem(item) {
    if (!item || !game.character) return false;
    if (item.stackable && game.character.inventory.some(existing => existing.id === item.id && existing.stackable)) return true;
    return game.character.inventory.length < game.character.inventoryCapacity;
  }

  function resourceRemaining(resource) {
    if (resource.persistentState) return Math.max(0, Number(resource.persistentState.remaining) || 0);
    return Math.max(0, Number(resource.remaining) || 0);
  }

  function setResourceRemaining(resource, value) {
    const next = Math.max(0, value);
    resource.remaining = next;
    if (resource.persistentState) resource.persistentState.remaining = next;
  }

  function setResourceYieldGranted(resource, value) {
    resource.yieldGranted = Math.max(0, Math.floor(value));
    if (resource.persistentState) resource.persistentState.yieldGranted = resource.yieldGranted;
  }

  function startGathering(resource) {
    if (!resource || game.scene !== 'overworld' || game.gathering || resource.depleted) return false;
    if (resource.skill === 'woodcutting' && resource.tree && !resource.persistentState) {
      resource.persistentState = getTreeResourceState(resource.treeZoneId || game.overworldZone, resource.tree, true);
      resource.remaining = resource.persistentState.remaining > 0 ? resource.persistentState.remaining : resource.maxDurability;
      resource.yieldGranted = resource.persistentState.yieldGranted || 0;
    }
    if (!canStoreGatheringItem(resource.item)) { toast('Inventory full. Make room before gathering.'); return false; }
    const remaining = resourceRemaining(resource);
    if (remaining <= 0) { toast('This resource is depleted.'); return false; }
    const skill = game.character.skills[resource.skill];
    const def = GATHERING_DEFS[resource.skill];
    game.player.vx = game.player.vy = 0;
    game.input.x = game.input.y = 0;
    game.input.aimMode = false;
    game.input.interactQueued = false;
    const face = normalize((resource.visualX ?? resource.x) - game.player.x, (resource.visualY ?? resource.y) - game.player.y);
    if (Math.hypot(face.x, face.y) > .1) game.player.facing = face;
    game.gathering = {
      resource, skillName:resource.skill, def,
      actionTimer:.36, actionClock:0, actionPulse:0,
      challengeTimer:resource.skill === 'fishing' ? 0 : .62,
      precision:null, fishingPhase:Math.random(), fishingDirection:Math.random() < .5 ? -1 : 1, tugCooldown:0,
      xpRemainder:0, sessionXp:0, sessionLoot:{}, feedbackTimer:0,
      finishing:false, finishTimer:0, status:'Working steadily…',
    };
    document.body.classList.add('gathering-active');
    gatheringMode.classList.remove('hidden','completed','skill-mining','skill-fishing','skill-woodcutting');
    gatheringMode.classList.add(`skill-${resource.skill}`);
    precisionTarget.classList.add('hidden');
    fishingChallenge.classList.toggle('hidden', resource.skill !== 'fishing');
    gatheringIcon.textContent = def.icon;
    gatheringResourceLabel.textContent = resource.name;
    gatheringActionLabel.textContent = resource.skill === 'fishing' ? 'Line cast. Waiting for a bite…' : 'Working steadily…';
    renderGatheringUi(true);
    return true;
  }

  function hideGatheringOverlay() {
    document.body.classList.remove('gathering-active');
    gatheringMode.classList.add('hidden');
    gatheringMode.classList.remove('completed','skill-mining','skill-fishing','skill-woodcutting');
    precisionTarget.classList.add('hidden');
    fishingChallenge.classList.add('hidden');
    gatheringFeedback.classList.add('hidden');
    if (game.running) {
      hud.classList.remove('hidden');
      touchControls.classList.remove('hidden');
    }
  }

  function endGatheringMode(reason = 'cancel', options = {}) {
    const gathering = game.gathering;
    if (!gathering) { hideGatheringOverlay(); return; }
    const summary = Object.entries(gathering.sessionLoot).map(([name, qty]) => `${qty}× ${name}`).join(', ');
    game.gathering = null;
    hideGatheringOverlay();
    saveGame();
    if (options.silent) return;
    if (reason === 'complete') {
      toast(`${gathering.resource.name} depleted${summary ? ` · ${summary}` : ''} · +${gathering.sessionXp} XP`, 3000);
    } else if (reason === 'cancel') {
      toast(summary || gathering.sessionXp ? `Gathering stopped${summary ? ` · ${summary}` : ''}${gathering.sessionXp ? ` · +${gathering.sessionXp} XP` : ''}` : 'Gathering cancelled.', 2200);
    }
  }

  function finishGatheringResource(gathering) {
    if (gathering.finishing) return;
    const resource = gathering.resource;
    setResourceRemaining(resource, 0);
    resource.depleted = true;
    if (resource.skill === 'woodcutting' && resource.persistentState) {
      resource.persistentState.respawnAt = Date.now() + TREE_REGROW_MS;
      resource.persistentState.remaining = 0;
    }
    gathering.finishing = true;
    gathering.finishTimer = .82;
    gathering.status = `${resource.name} depleted`;
    gatheringMode.classList.add('completed');
    precisionTarget.classList.add('hidden');
    fishingChallenge.classList.add('hidden');
    showGatheringFeedback(resource.skill === 'woodcutting' ? 'TREE FELLED' : resource.skill === 'fishing' ? 'CATCH COMPLETE' : 'NODE DEPLETED', 'good', 1.1);
    saveGame();
  }

  function grantGatheringYield(gathering) {
    const resource = gathering.resource;
    const completed = resource.maxDurability - resourceRemaining(resource);
    const shouldHave = resourceRemaining(resource) <= 0
      ? resource.yieldQty
      : Math.min(resource.yieldQty, Math.floor((completed / resource.maxDurability) * resource.yieldQty + 1e-6));
    let granted = resource.yieldGranted || 0;
    while (granted < shouldHave) {
      const item = { ...resource.item, qty:1 };
      if (!addItem(item, true)) {
        gathering.status = 'Inventory full — gathering stopped';
        setTimeout(() => endGatheringMode('cancel'), 0);
        break;
      }
      granted += 1;
      gathering.sessionLoot[item.name] = (gathering.sessionLoot[item.name] || 0) + 1;
    }
    setResourceYieldGranted(resource, granted);
  }

  function applyGatheringProgress(power, source = 'steady') {
    const gathering = game.gathering;
    if (!gathering || gathering.finishing) return;
    const resource = gathering.resource;
    const before = resourceRemaining(resource);
    if (before <= 0) { finishGatheringResource(gathering); return; }
    const applied = Math.min(before, Math.max(0, power));
    setResourceRemaining(resource, before - applied);
    gathering.actionPulse = 1;
    gathering.actionClock = 0;
    gathering.status = source === 'perfect' ? 'Perfect technique!' : source === 'good' ? 'Strong technique' : source === 'miss' ? 'Steady progress continues…' : 'Working steadily…';
    const xpRate = resource.xpTotal / resource.maxDurability;
    gathering.xpRemainder += applied * xpRate;
    const xpWhole = Math.floor(gathering.xpRemainder);
    if (xpWhole > 0) {
      gathering.xpRemainder -= xpWhole;
      const result = gainSkillXp(resource.skill, xpWhole);
      gathering.sessionXp += result.gained;
    }
    if (source === 'perfect') {
      const result = gainSkillXp(resource.skill, 1);
      gathering.sessionXp += result.gained;
    }
    grantGatheringYield(gathering);
    const vx = resource.visualX ?? resource.x, vy = resource.visualY ?? resource.y;
    const particleColor = resource.skill === 'fishing' ? '#86d9e5' : resource.skill === 'woodcutting' ? '#b8d77e' : (resource.color || '#e6c28d');
    game.particles.push({ type:'ring', x:vx, y:vy, r:8, maxR:source === 'perfect' ? 62 : 38, t:0, duration:source === 'perfect' ? .45 : .28, color:particleColor });
    if (resourceRemaining(resource) <= 0) {
      grantGatheringYield(gathering);
      finishGatheringResource(gathering);
    }
    renderGatheringUi(true);
  }

  function spawnPrecisionChallenge() {
    const gathering = game.gathering;
    if (!gathering || gathering.skillName === 'fishing' || gathering.finishing) return;
    const marginX = Math.min(120, window.innerWidth * .16);
    const marginY = Math.min(90, window.innerHeight * .15);
    const width = Math.max(160, gatheringPlayfield.clientWidth || window.innerWidth);
    const height = Math.max(140, gatheringPlayfield.clientHeight || window.innerHeight * .5);
    const x = rand(marginX, Math.max(marginX + 1, width - marginX));
    const y = rand(marginY, Math.max(marginY + 1, height - marginY));
    gathering.precision = { age:0, duration:gathering.def.targetDuration, x, y };
    precisionTarget.style.left = `${x}px`;
    precisionTarget.style.top = `${y}px`;
    precisionTarget.style.setProperty('--ring-scale', '1.95');
    precisionTarget.classList.remove('hidden');
  }

  function resolvePrecisionChallenge() {
    const gathering = game.gathering;
    const precision = gathering?.precision;
    if (!gathering || !precision || gathering.finishing) return;
    const progress = clamp(precision.age / precision.duration, 0, 1);
    gathering.precision = null;
    precisionTarget.classList.add('hidden');
    gathering.challengeTimer = rand(.58, 1.05);
    if (progress >= .69 && progress <= .88) {
      applyGatheringProgress(gathering.def.perfectPower, 'perfect');
      showGatheringFeedback('PERFECT', 'perfect');
    } else if (progress >= .52 && progress <= .96) {
      applyGatheringProgress(gathering.def.goodPower, 'good');
      showGatheringFeedback('GOOD', 'good');
    } else {
      gathering.status = 'Missed — steady gathering continues';
      showGatheringFeedback('MISS', 'miss');
    }
  }

  function resolveFishingTug() {
    const gathering = game.gathering;
    if (!gathering || gathering.skillName !== 'fishing' || gathering.finishing || gathering.tugCooldown > 0) return;
    gathering.tugCooldown = .32;
    const distanceFromCenter = Math.abs(gathering.fishingPhase - .5);
    if (distanceFromCenter <= .065) {
      applyGatheringProgress(gathering.def.perfectPower, 'perfect');
      showGatheringFeedback('PERFECT TUG', 'perfect');
    } else if (distanceFromCenter <= .17) {
      applyGatheringProgress(gathering.def.goodPower, 'good');
      showGatheringFeedback('GOOD TUG', 'good');
    } else if (distanceFromCenter <= .29) {
      applyGatheringProgress(Math.round(gathering.def.goodPower * .55), 'good');
      showGatheringFeedback('LIGHT TUG', 'good');
    } else {
      gathering.status = 'Poor timing — the fish stays on';
      showGatheringFeedback('TOO SOON', 'miss');
    }
  }

  function showGatheringFeedback(text, grade = 'perfect', duration = .62) {
    const gathering = game.gathering;
    if (!gathering) return;
    gathering.feedbackTimer = duration;
    gatheringFeedback.textContent = text;
    gatheringFeedback.classList.remove('hidden','good','miss');
    if (grade === 'good') gatheringFeedback.classList.add('good');
    if (grade === 'miss') gatheringFeedback.classList.add('miss');
  }

  function renderGatheringUi(force = false) {
    const gathering = game.gathering;
    if (!gathering) return;
    const resource = gathering.resource;
    const skill = game.character.skills[gathering.skillName];
    const need = skillXpNeeded(skill.level);
    gatheringSkillLabel.textContent = `${gathering.def.action.toUpperCase()} · LEVEL ${skill.level}`;
    gatheringXpText.textContent = skill.level >= GATHERING_LEVEL_CAP ? 'MAX LEVEL' : `${skill.xp} / ${need}`;
    gatheringXpFill.style.width = `${skill.level >= GATHERING_LEVEL_CAP ? 100 : clamp(skill.xp / need * 100, 0, 100)}%`;
    const remaining = resourceRemaining(resource);
    const percent = clamp(remaining / resource.maxDurability * 100, 0, 100);
    gatheringResourceFill.style.width = `${percent}%`;
    gatheringPercentLabel.textContent = `${Math.ceil(percent)}%`;
    gatheringActionLabel.textContent = gathering.status;
    const loot = Object.entries(gathering.sessionLoot).map(([name, qty]) => `${qty}× ${name}`).join(' · ');
    gatheringLootText.textContent = loot || 'No materials yet';
    gatheringSessionXp.textContent = `+${gathering.sessionXp} XP`;
    if (gathering.skillName === 'fishing') fishingMarker.style.left = `${clamp(gathering.fishingPhase * 100, 0, 100)}%`;
  }

  function updateGathering(dt) {
    const gathering = game.gathering;
    if (!gathering) return;
    game.player.vx = game.player.vy = 0;
    game.player.attack = null;
    gathering.actionClock += dt;
    gathering.actionPulse = Math.max(0, gathering.actionPulse - dt * 2.7);
    gathering.tugCooldown = Math.max(0, gathering.tugCooldown - dt);
    if (gathering.feedbackTimer > 0) {
      gathering.feedbackTimer = Math.max(0, gathering.feedbackTimer - dt);
      if (gathering.feedbackTimer <= 0) gatheringFeedback.classList.add('hidden');
    }
    if (gathering.finishing) {
      gathering.finishTimer -= dt;
      renderGatheringUi();
      if (gathering.finishTimer <= 0) endGatheringMode('complete');
      return;
    }
    const level = game.character.skills[gathering.skillName].level;
    const speedBonus = 1 + Math.min(.32, Math.max(0, level - 1) * .009);
    gathering.actionTimer -= dt;
    if (gathering.actionTimer <= 0) {
      gathering.actionTimer += gathering.def.passiveInterval / speedBonus;
      applyGatheringProgress(gathering.def.passivePower, 'steady');
    }
    if (gathering.skillName === 'fishing') {
      const markerSpeed = gathering.def.markerSpeed / (1 + Math.min(.18, Math.max(0, level - 1) * .004));
      gathering.fishingPhase += gathering.fishingDirection * markerSpeed * dt;
      if (gathering.fishingPhase >= 1) { gathering.fishingPhase = 1; gathering.fishingDirection = -1; }
      if (gathering.fishingPhase <= 0) { gathering.fishingPhase = 0; gathering.fishingDirection = 1; }
    } else if (gathering.precision) {
      gathering.precision.age += dt;
      const progress = clamp(gathering.precision.age / gathering.precision.duration, 0, 1);
      precisionTarget.style.setProperty('--ring-scale', String(1.95 - progress * 1.05));
      if (progress >= 1) {
        gathering.precision = null;
        precisionTarget.classList.add('hidden');
        gathering.challengeTimer = rand(.55, 1.1);
        gathering.status = 'Missed — steady gathering continues';
        showGatheringFeedback('MISS', 'miss');
      }
    } else {
      gathering.challengeTimer -= dt;
      if (gathering.challengeTimer <= 0) spawnPrecisionChallenge();
    }
    renderGatheringUi();
  }

  function nearbyInteractables() {
    const nearby = [];
    const p = game.player;
    if (!p) return nearby;
    if (game.scene === 'camp') {
      for (const obj of campInteractables()) {
        const distance = dist(p.x, p.y, obj.x, obj.y);
        if (distance < obj.range * INTERACTION_RANGE_MULTIPLIER) nearby.push({ ...obj, distance });
      }
      for (const npc of game.campNpcs) {
        const distance = dist(p.x, p.y, npc.x, npc.y);
        if (distance < 90 * INTERACTION_RANGE_MULTIPLIER) nearby.push({ kind: 'npc', npc, label: `Talk to ${npc.name}`, distance });
      }
    } else if (game.scene === 'overworld') {
      for (const gate of overworldInteractables()) {
        let distance = dist(p.x, p.y, gate.x, gate.y);
        if (gate.kind === 'worldResource' && gate.resource?.skill === 'fishing') {
          const rippleX = gate.resource.visualX ?? gate.resource.x;
          const rippleY = gate.resource.visualY ?? gate.resource.y;
          distance = Math.min(distance, dist(p.x, p.y, rippleX, rippleY));
        }
        if (distance < gate.range * INTERACTION_RANGE_MULTIPLIER) nearby.push({ ...gate, distance });
      }
    } else {
      for (const feature of game.roomFeatures) {
        const distance = dist(p.x, p.y, feature.x, feature.y);
        if (distance < 110 * INTERACTION_RANGE_MULTIPLIER) nearby.push({ kind: 'feature', feature, label: featureLabel(feature), distance });
      }
    }
    return nearby.sort((a, b) => a.distance - b.distance);
  }

  function updateInteractionPrompt() {
    const nearby = nearbyInteractables();
    const closest = nearby[0] || null;
    game.currentInteractable = closest;
    game.nearbyInteractables = nearby;
    promptEl.classList.add('hidden');
  }

  function campInteractables() {
    return [
      // Interaction anchors sit on the accessible ground in front of the visible entrances.
      { kind: 'dungeon', x: 760, y: 372, displayX:760, displayY:320, range: 132, label: 'Enter dungeon' },
      { kind: 'supplyShop', x: 430, y: 688, displayX:430, displayY:638, range: 136, label: 'Browse supplies' },
      { kind: 'blacksmith', x: 1434, y: 694, displayX:1434, displayY:640, range: 140, label: 'Visit blacksmith' },
      { kind: 'storage', x: 700, y: 545, range: 105, label: 'Open storage chest' },
      { kind: 'campfire', x: 900, y: 800, range: 110, label: 'Rest at fire' },
      { kind: 'worldPath', x: 105, y: 1175, range: 155, label: 'Follow the forest road' },
    ];
  }

  function overworldInteractables() {
    const zone = OVERWORLD_ZONES[game.overworldZone];
    if (!zone) return [];
    const interactables = zone.gates.map(gate => ({
      kind: 'worldGate',
      x: gate.x,
      y: gate.y,
      range: 160,
      label: `Travel to ${gate.label}`,
      gate,
    }));
    for (const resource of game.overworldResources || []) {
      if (resource.depleted || resourceRemaining(resource) <= 0) continue;
      interactables.push({ kind:'worldResource', x:resource.x, y:resource.y, range:132, label:`Gather ${resource.name}`, resource });
    }
    if (['forestCrossroads','riverForest','farmPlots'].includes(zone.id)) {
      for (const tree of getOverworldObjects(zone.id)) {
        if (tree.kind !== 'tree' || treeIsStump(zone.id, tree)) continue;
        const resource = makeTreeResource(zone.id, tree);
        interactables.push({ kind:'worldResource', x:tree.x, y:tree.y, range:126, label:'Chop Greenwood Tree', resource });
      }
    }
    return interactables;
  }

  function featureLabel(f) {
    if (f.type === 'mining') return f.used ? 'Ore vein depleted' : 'Mine ore';
    if (f.type === 'woodcutting') return f.used ? 'Roots already cut' : 'Cut dungeon roots';
    if (f.type === 'fishing') return f.used ? 'Pool has gone still' : 'Fish underground pool';
    if (f.type === 'smithing') return f.used ? 'Forge cooling' : 'Use smithing station';
    if (f.type === 'puzzle') return f.solved ? 'Mechanism solved' : 'Inspect mechanism';
    if (f.type === 'chest') return f.opened ? 'Empty chest' : 'Open treasure chest';
    if (f.type === 'shrine') return f.used ? 'Faded shrine' : 'Rest at shrine';
    if (f.type === 'brazier') return 'Warm yourself at the brazier';
    if (f.type === 'escape') return 'Take free escape route';
    if (f.type === 'entranceExit') return 'Climb back to camp';
    if (f.type === 'victoryExit') return 'Return safely to camp';
    return 'Interact';
  }

  function interactionIcon(obj) {
    if (obj.kind === 'npc') {
      if (obj.npc?.serviceType === 'mage') return '✦';
      if (obj.npc?.serviceType === 'bagSmith') return '⚒';
      return '◆';
    }
    if (obj.kind === 'dungeon') return '🚪';
    if (obj.kind === 'worldPath' || obj.kind === 'worldGate') return '➤';
    if (obj.kind === 'worldResource') return obj.resource?.icon || '•';
    if (obj.kind === 'supplyShop') return '🎒';
    if (obj.kind === 'blacksmith') return '⚒';
    if (obj.kind === 'storage') return '▣';
    if (obj.kind === 'campfire') return '🔥';
    if (obj.kind === 'feature') {
      return { mining: '⛏', woodcutting: '🪓', fishing: '◉', smithing: '⚒', puzzle: '◇', chest: '▣', shrine: '✦', brazier:'🔥', escape: '↥', entranceExit: '↥', victoryExit: '↥' }[obj.feature?.type] || '•';
    }
    return '•';
  }

  function interactionActionText(obj) {
    if (obj.kind === 'npc') return obj.npc?.serviceType === 'mage' ? 'Magic' : 'Talk';
    if (obj.kind === 'dungeon') return 'Enter';
    if (obj.kind === 'worldPath' || obj.kind === 'worldGate') return 'Travel';
    if (obj.kind === 'worldResource') return obj.resource?.skill === 'fishing' ? 'Fish' : obj.resource?.skill === 'mining' ? 'Mine' : 'Chop';
    if (obj.kind === 'supplyShop') return 'Shop';
    if (obj.kind === 'blacksmith') return 'Forge';
    if (obj.kind === 'storage') return 'Store';
    if (obj.kind === 'campfire') return 'Rest';
    if (obj.kind === 'feature') {
      return { mining: 'Mine', woodcutting: 'Cut', fishing: 'Fish', smithing: 'Forge', puzzle: 'Inspect', chest: 'Open', shrine: 'Rest', brazier:'Warm', escape: 'Leave', entranceExit: 'Exit', victoryExit: 'Return' }[obj.feature?.type] || 'Use';
    }
    return 'Use';
  }

  function interactionCaption(obj) {
    if (obj.kind === 'npc') return obj.npc?.name || 'Traveler';
    if (obj.kind === 'supplyShop') return 'Supplies';
    if (obj.kind === 'blacksmith') return 'Smithy';
    if (obj.kind === 'storage') return 'Storage';
    if (obj.kind === 'dungeon') return 'The Descent';
    if (obj.kind === 'worldPath') return 'Greenwood Road';
    if (obj.kind === 'worldGate') return obj.gate?.label || 'Road';
    if (obj.kind === 'worldResource') return obj.resource?.name || 'Resource';
    if (obj.kind === 'campfire') return 'Campfire';
    if (obj.kind === 'feature') return featureLabel(obj.feature).replace(/^[A-Z][^ ]* /, '');
    return '';
  }

  function interactionPosition(obj) {
    let x = 0, y = 0, z = 0, offset = 80;
    if (obj.kind === 'npc' && obj.npc) {
      x = obj.npc.x; y = obj.npc.y; offset = 106;
    } else if (obj.kind === 'feature' && obj.feature) {
      x = obj.feature.x; y = obj.feature.y; offset = 84;
      if (['entranceExit', 'victoryExit', 'escape', 'chest'].includes(obj.feature.type)) offset = 92;
    } else if (obj.kind === 'worldResource' && obj.resource) {
      x = obj.resource.visualX ?? obj.resource.x; y = obj.resource.visualY ?? obj.resource.y; offset = obj.resource.skill === 'fishing' ? 58 : 96;
    } else {
      x = obj.displayX ?? obj.x; y = obj.displayY ?? obj.y;
      offset = obj.kind === 'dungeon' ? 112 : obj.kind === 'campfire' ? 80 : (obj.kind === 'worldPath' || obj.kind === 'worldGate') ? 104 : 94;
    }
    const point = worldToScreen(x, y, z);
    return { x: point.x, y: point.y - offset };
  }

  function renderContextualInteractionButtons() {
    if (!interactionLayer) return;
    if (!game.running || game.paused || game.gathering || !modalBackdrop.classList.contains('hidden')) {
      interactionLayer.classList.add('hidden');
      interactionLayer.innerHTML = '';
      game.nearbyInteractablesRendered = [];
      return;
    }
    const targets = nearbyInteractables().slice(0, 6);
    game.nearbyInteractablesRendered = targets;
    if (!targets.length) {
      interactionLayer.classList.add('hidden');
      interactionLayer.innerHTML = '';
      return;
    }
    const placed = [];
    const html = targets.map((obj, index) => {
      const pos = interactionPosition(obj);
      let left = clamp(pos.x, 54, window.innerWidth - 54);
      let top = clamp(pos.y, 50, window.innerHeight - 160);
      for (const prior of placed) {
        const dx = Math.abs(prior.left - left);
        const dy = Math.abs(prior.top - top);
        if (dx < 88 && dy < 38) top = prior.top - 40;
      }
      top = clamp(top, 42, window.innerHeight - 160);
      placed.push({ left, top });
      return `<button class="context-interact-btn" data-index="${index}" style="left:${left}px; top:${top}px">
        <span class="context-action">${escapeHtml(interactionActionText(obj))}</span>
        <small>${escapeHtml(interactionCaption(obj))}</small>
      </button>`;
    }).join('');
    interactionLayer.classList.remove('hidden');
    interactionLayer.innerHTML = html;
  }

  function interactWithTarget(obj) {
    if (!obj) return;
    if (obj.kind === 'dungeon') showFloorSelection();
    else if (obj.kind === 'worldPath') {
      if (game.worldTransitionCooldown <= 0) enterOverworld('forestCrossroads', 'camp');
    }
    else if (obj.kind === 'worldGate') travelWorldGate(obj.gate);
    else if (obj.kind === 'worldResource') startGathering(obj.resource);
    else if (obj.kind === 'supplyShop') showSupplyShop();
    else if (obj.kind === 'blacksmith') showBlacksmith();
    else if (obj.kind === 'storage') showStorageChest();
    else if (obj.kind === 'campfire') {
      game.player.health = game.player.maxHealth;
      game.player.mana = game.player.maxMana;
      game.character.currentHealth = game.player.health;
      toast('You rest by the fire and recover fully.');
      saveGame();
    } else if (obj.kind === 'npc') showNpc(obj.npc);
    else if (obj.kind === 'feature') interactFeature(obj.feature);
  }

  function showInteractionPicker(targets) {
    const buttons = targets.map((obj, index) => `
      <button class="panel-btn interaction-choice" data-interaction-index="${index}">
        <span class="interaction-choice-icon">${interactionIcon(obj)}</span>
        <span><strong>${escapeHtml(obj.label)}</strong><small>${Math.round(obj.distance)} away</small></span>
      </button>`).join('');
    showModal('Choose Interaction', `<div class="interaction-choice-grid">${buttons}</div>`);
    modalBody.querySelectorAll('.interaction-choice').forEach(button => button.addEventListener('click', () => {
      const chosen = targets[Number(button.dataset.interactionIndex)];
      hideModal();
      interactWithTarget(chosen);
    }));
  }

  function performInteraction() {
    const targets = nearbyInteractables();
    if (!targets.length) return;
    if (targets.length === 1) { interactWithTarget(targets[0]); return; }
    showInteractionPicker(targets);
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
      feature.opened = true;
      if (feature.vaultIndex != null) {
        room.environmentState.vaultChests ||= {};
        room.environmentState.vaultChests[feature.vaultIndex] = true;
        room.environmentState.openedVaultChests = Object.keys(room.environmentState.vaultChests).length;
      } else room.chestOpened = true;
      const greed = room.environmentState.openedVaultChests || 1;
      const gear = makeGear(null, rollRarity(currentFloor().floorNumber + 2 + greed * 2), currentFloor().floorNumber + Math.max(0,greed-1));
      addItem(gear);
      game.character.coins += randInt(20, 50) + currentFloor().floorNumber * 5 + greed * 18;
      if (feature.vaultIndex != null && greed < 3) {
        room.cleared = false;
        const wave = 2 + greed * 2 + Math.floor(currentFloor().floorNumber * .5);
        for (let i=0;i<wave;i++) spawnEnemy(choose(greed > 1 ? ['shadow','imp','skeleton','spider'] : ['skeleton','bat','slime']));
        if (greed === 2) createBlastTelegraph('fire',feature.x,feature.y,180,.85,18,'environment',{hazardDuration:4.5});
        toast(`Treasure found: ${gear.name}. The vault answers your greed!`,2200);
      } else toast(`Treasure found: ${gear.name}.`);
      saveGame();
    } else if (feature.type === 'brazier') {
      game.player.stamina = game.player.maxStamina;
      game.player.mana = Math.min(game.player.maxMana, game.player.mana + game.player.maxMana * .12);
      game.player.slowTimer = 0;
      toast('Warmth drives the frost from your limbs.');
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
    if (npc.serviceType === 'mage') { showMageShop(); return; }
    if (npc.serviceType === 'bagSmith') { showBagSmith(); return; }
    if (!npc.quest) { toast(`${npc.name} has nothing to offer right now.`); return; }
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
      npc.locked = false;
      npc.quest = null;
      npc.pendingReplacementSlot = Math.max(0, game.campNpcs.filter(n => !n.serviceType).indexOf(npc));
      startNpcDeparture(npc);
      saveGame(); hideModal(); toast(`${npc.name} heads down the camp road with your delivery complete.`, 2400);
    });
  }

  function equippedItemReferenceSet() {
    return new Set(Object.values(game.character?.equipment || {}).filter(Boolean));
  }

  function safeInventoryGearEntries() {
    const equipped = equippedItemReferenceSet();
    return indexedItems(game.character.inventory).filter(({ item }) => item?.type === 'gear' && !equipped.has(item));
  }

  function safeInventoryGearByRarity(rarity) {
    return safeInventoryGearEntries().filter(({ item }) => (item.rarity || 'common') === rarity);
  }

  function showSupplyShop() {
    const potionGoods = [
      ['lesser_health_potion',1], ['health_potion',1], ['greater_health_potion',4], ['huge_health_potion',8],
      ['lesser_mana_potion',1], ['mana_potion',2], ['greater_mana_potion',5], ['huge_mana_potion',9],
      ['lesser_stamina_potion',1], ['stamina_potion',2], ['greater_stamina_potion',5], ['huge_stamina_potion',9],
    ].map(([id, level]) => ({ item: potionItem(id), price: potionPrice(id), level }));
    const goods = [
      ...potionGoods,
      { item: { id: 'escape_rope', name: 'Escape Rope', type: 'consumable', qty: 1, stackable: true, description: 'Safely leave a dungeon with all inventory.' }, price: 95, level: 1 },
      { item: { id: 'survey_charm', name: 'Cartographer’s Charter', type: 'consumable', qty: 1, stackable: true, rarity: 'rare', description: 'Generates a Medium 40-room floor with +15% monster XP.' }, price: 240, level: 3 },
      { item: { id: 'grand_survey_charm', name: 'Grand Cartographer’s Charter', type: 'consumable', qty: 1, stackable: true, rarity: 'epic', description: 'Generates a Large 60-room floor with +35% monster XP.' }, price: 575, level: 6 },
      { item: { id: 'ancient_survey_seal', name: 'Ancient Survey Seal', type: 'consumable', qty: 1, stackable: true, rarity: 'legendary', description: 'Generates a Huge 100-room floor with +65% monster XP.' }, price: 1200, level: 10 },
    ];
    const saleButtons = RARITY_ORDER.map(rarity => {
      const entries = safeInventoryGearByRarity(rarity);
      const total = entries.reduce((sum, { item }) => sum + sellValue(item), 0);
      return `<button class="panel-btn sell-rarity rarity-button-${rarity}" data-rarity="${rarity}" ${entries.length ? '' : 'disabled'}>Sell all ${RARITIES[rarity].name}<br><span class="muted">${entries.length} item${entries.length === 1 ? '' : 's'} · ${total} coins</span></button>`;
    }).join('');
    showModal('Expedition Supplies', `
      <p>You have <strong>${game.character.coins} coins</strong>.</p>
      <div class="shop-sell-first">
        <div class="section-title">Sell inventory equipment by rarity</div>
        <p class="muted">Only unequipped equipment physically carried in your inventory can be sold. Equipped gear, stored items, materials, and consumables are protected.</p>
        <div class="bulk-action-grid">${saleButtons}</div>
        <button id="reviewSales" class="panel-btn wide-action">Review and sell individual equipment</button>
      </div>
      <div class="section-title">Buy expedition supplies</div>
      <p class="muted">Potion prices climb as you carry more of the same family.</p>
      <div class="inventory-grid">${goods.map((g, i) => `
        <div class="item-action-wrap"><div class="item-card rarity-${g.item.rarity || 'common'}"><span class="item-icon">${itemIcon(g.item)}</span><h4>${g.item.name}</h4><p>${g.item.description}</p><p>${g.price} coins · Level ${g.level}</p></div><button class="buy-btn buy-good" data-i="${i}">Buy</button></div>`).join('')}</div>
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
    $('reviewSales')?.addEventListener('click', showSellEquipment);
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

    let firstCarouselRender = true;

    const renderSelector = (scrollMode = 'preserve') => {
      game.character.lastFloorSelected = selectedFloor;
      const root = $('expeditionSelectorRoot');
      if (!root) return;
      const previousStrip = root.querySelector('.floor-chip-strip');
      const previousScrollLeft = previousStrip?.scrollLeft || 0;
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
        renderSelector('floor');
      }));
      root.querySelector('.previous-floor')?.addEventListener('click', () => {
        selectedFloor = Math.max(1, selectedFloor - 1);
        selectedSize = 'Small';
        renderSelector('floor');
      });
      root.querySelector('.next-floor')?.addEventListener('click', () => {
        selectedFloor = Math.min(maximumFloor, selectedFloor + 1);
        selectedSize = 'Small';
        renderSelector('floor');
      });
      root.querySelectorAll('[data-size-choice]').forEach(button => button.addEventListener('click', () => {
        selectedSize = button.dataset.sizeChoice;
        renderSelector('preserve');
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
        renderSelector('preserve');
      });

      requestAnimationFrame(() => {
        const strip = root.querySelector('.floor-chip-strip');
        const selectedChip = strip?.querySelector('.floor-chip.selected');
        if (!strip || !selectedChip) return;
        const targetLeft = Math.max(0, selectedChip.offsetLeft - (strip.clientWidth - selectedChip.offsetWidth) / 2);
        if (firstCarouselRender) {
          strip.scrollLeft = 0;
          requestAnimationFrame(() => strip.scrollTo({ left: targetLeft, behavior: 'smooth' }));
          firstCarouselRender = false;
        } else if (scrollMode === 'floor') {
          strip.scrollLeft = previousScrollLeft;
          requestAnimationFrame(() => strip.scrollTo({ left: targetLeft, behavior: 'smooth' }));
        } else {
          strip.scrollLeft = previousScrollLeft;
        }
      });
    };

    renderSelector('initial');
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
    const category = game.character.activePotionSlot || 'health';
    const preferredId = game.character.potionLoadout?.[category];
    const potionId = chooseAvailablePotion(category, preferredId);
    if (!potionId) { toast(`No ${category} potions ready.`); return; }
    const potion = POTION_DEFS[potionId];
    if (!removeItem(potionId, 1)) { toast(`No ${potion.name}.`); return; }
    let recovered = 0;
    if (category === 'health') {
      const before = game.player.health;
      game.player.health = Math.min(game.player.maxHealth, game.player.health + potion.restore);
      recovered = Math.round(game.player.health - before);
    } else if (category === 'mana') {
      const before = game.player.mana;
      game.player.mana = Math.min(game.player.maxMana, game.player.mana + potion.restore);
      recovered = Math.round(game.player.mana - before);
    } else {
      const before = game.player.stamina;
      game.player.stamina = Math.min(game.player.maxStamina, game.player.stamina + potion.restore);
      recovered = Math.round(game.player.stamina - before);
    }
    if (preferredId !== potionId) game.character.potionLoadout[category] = potionId;
    game.potionTraySignature = '';
    toast(`${potion.name}: +${recovered} ${category}.`);
    saveGame();
  }

  function ascensionUnspentTotal() {
    const asc = game.character?.ascension;
    if (!asc) return 0;
    return (asc.generalPoints || 0) + ['strength','agility','magic','vitality','stamina'].reduce((sum, path) => sum + (asc.pathPoints[path] || 0), 0);
  }

  function ascensionNodeState(node) {
    const purchased = ascensionRank(node.id) >= (node.maxRank || 1);
    if (purchased) return 'awakened';
    if (!ascensionRequirementsMet(node)) return 'locked';
    return ascensionAvailableCurrency(node).available > 0 ? 'available' : 'reachable';
  }

  function ascensionPathLabel(node) {
    if (node.path !== 'hybrid') return ASCENSION_PATHS[node.path].name;
    return (node.hybrid || []).map(path => ASCENSION_PATHS[path].name).join(' + ');
  }

  function ascensionConnectionsHtml() {
    const lines = [];
    for (const node of ASCENSION_NODES) {
      for (const requirementId of node.requires || []) {
        const source = ASCENSION_NODE_MAP[requirementId];
        if (!source) continue;
        const state = ascensionRank(node.id) ? 'awakened' : ascensionRequirementsMet(node) ? 'available' : 'locked';
        lines.push(`<line class="ascension-link ${state}" x1="${source.x}" y1="${source.y}" x2="${node.x}" y2="${node.y}" />`);
      }
    }
    return `<svg class="ascension-links" viewBox="0 0 ${ASCENSION_STAGE.width} ${ASCENSION_STAGE.height}" aria-hidden="true">${lines.join('')}</svg>`;
  }

  function ascensionNodeHtml(node, selectedId) {
    const state = ascensionNodeState(node);
    const path = ASCENSION_PATHS[node.path];
    const selected = node.id === selectedId ? ' selected' : '';
    return `<button class="ascension-node path-${node.path} ${state}${selected}" data-node="${node.id}" style="left:${node.x}px;top:${node.y}px;--node-color:${path.color}" title="${escapeHtml(node.name)}">
      <span class="ascension-node-core">${node.icon}</span>
      <span class="ascension-node-label">${escapeHtml(node.name)}</span>
    </button>`;
  }

  function renderAscensionGrid(selectedId = null, options = {}) {
    normalizeAscension(game.character);
    const asc = game.character.ascension;
    const fallback = ASCENSION_NODES.find(node => ascensionNodeState(node) === 'available') || ASCENSION_NODES[0];
    const selected = ASCENSION_NODE_MAP[selectedId] || fallback;
    const state = ascensionNodeState(selected);
    const currency = ascensionAvailableCurrency(selected);
    const canBuy = state === 'available';
    const pointSource = currency.source === 'general' ? 'Ascension Point' : `${ASCENSION_PATHS[currency.source]?.name || ''} Tome Point`;
    const previousScroll = modalBody.querySelector('.ascension-grid-scroll');
    const savedScroll = options.preserveScroll && previousScroll ? { left: previousScroll.scrollLeft, top: previousScroll.scrollTop } : null;
    const pathChips = ['strength','agility','magic','vitality','stamina'].map(path => {
      const data = ASCENSION_PATHS[path];
      return `<span class="ascension-path-chip" style="--chip:${data.color}"><b>${data.icon}</b>${data.short}<em>${asc.pathPoints[path] || 0}</em></span>`;
    }).join('');
    modal.classList.add('ascension-modal');
    modalTitle.textContent = 'Ascension Grid';
    modalBody.innerHTML = `
      <div class="ascension-topbar">
        <div class="ascension-general"><span>ASCENSION</span><strong>${asc.generalPoints || 0}</strong></div>
        <div class="ascension-path-points">${pathChips}</div>
      </div>
      <div class="ascension-grid-scroll">
        <div class="ascension-grid-stage" style="width:${ASCENSION_STAGE.width}px;height:${ASCENSION_STAGE.height}px">
          <div class="ascension-aura aura-strength"></div><div class="ascension-aura aura-magic"></div><div class="ascension-aura aura-vitality"></div><div class="ascension-aura aura-agility"></div><div class="ascension-aura aura-stamina"></div>
          ${ascensionConnectionsHtml()}
          <div class="ascension-core" style="left:520px;top:360px"><span>✺</span><small>CROSSROADS</small></div>
          ${ASCENSION_NODES.map(node => ascensionNodeHtml(node, selected.id)).join('')}
        </div>
      </div>
      <div class="ascension-detail path-${selected.path}" style="--detail-color:${ASCENSION_PATHS[selected.path].color}">
        <div class="ascension-detail-rune">${selected.icon}</div>
        <div class="ascension-detail-copy"><small>${escapeHtml(ascensionPathLabel(selected))}</small><strong>${escapeHtml(selected.name)}</strong><p>${escapeHtml(selected.desc)}</p></div>
        <div class="ascension-detail-action">
          <span class="ascension-state state-${state}">${state === 'awakened' ? 'AWAKENED' : state === 'locked' ? 'LOCKED' : state === 'reachable' ? 'NO POINTS' : pointSource.toUpperCase()}</span>
          <button id="awakenAscensionNode" class="panel-btn ascension-awaken" ${canBuy ? '' : 'disabled'}>${state === 'awakened' ? 'Owned' : state === 'locked' ? 'Route Locked' : state === 'reachable' ? 'Need Point' : 'Awaken'}</button>
        </div>
      </div>`;
    const gridScroll = modalBody.querySelector('.ascension-grid-scroll');
    modalBody.querySelectorAll('.ascension-node').forEach(button => button.addEventListener('click', () => renderAscensionGrid(button.dataset.node, { preserveScroll: true })));
    $('awakenAscensionNode')?.addEventListener('click', () => {
      if (purchaseAscensionNode(selected.id)) renderAscensionGrid(selected.id, { preserveScroll: true });
    });
    const selectedButton = modalBody.querySelector(`.ascension-node[data-node="${selected.id}"]`);
    if (savedScroll) {
      gridScroll.scrollLeft = savedScroll.left;
      gridScroll.scrollTop = savedScroll.top;
    } else {
      selectedButton?.scrollIntoView?.({ block:'center', inline:'center', behavior:'auto' });
    }
  }

  function showAscensionGrid(selectedId = null) {
    showModal('Ascension Grid', '<div></div>');
    renderAscensionGrid(selectedId);
  }

  function showMainMenu() {
    const dungeonActions = game.scene === 'dungeon' ? `<button id="leaveBtn" class="panel-btn danger">Leave Dungeon</button>` : '';
    showModal('Game Menu', `<div class="menu-grid">
      <button id="inventoryBtn" class="panel-btn">Inventory & Equipment</button>
      <button id="spellsBtn" class="panel-btn">Spellbook & Loadout</button>
      <button id="statsBtn" class="panel-btn">Character & Skills</button>
      <button id="ascensionBtn" class="panel-btn ascension-menu-btn">Ascension Grid <b>${ascensionUnspentTotal()}</b></button>
      <button id="questsBtn" class="panel-btn">Quest Log</button>
      <button id="settingsBtn" class="panel-btn">Settings</button>
      ${dungeonActions}
      <button id="saveBtn" class="panel-btn">Save Game</button>
      <button id="titleBtn" class="panel-btn">Save & Return to Title</button>
    </div>`);
    $('inventoryBtn').addEventListener('click', showInventory);
    $('spellsBtn').addEventListener('click', () => showSpellLoadout(0));
    $('statsBtn').addEventListener('click', showStats);
    $('ascensionBtn').addEventListener('click', () => showAscensionGrid());
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

  function autoEquipStatValue(item, key) {
    if (!item || item.type !== 'gear') return 0;
    const stats = item.stats || {};
    if (key === 'damage') return (stats.damage || 0) + (item.weaponType ? (WEAPONS[item.weaponType]?.damage || 0) : 0);
    if (key === 'reach') return (stats.reach || 0) + (item.weaponType ? (WEAPONS[item.weaponType]?.reach || 0) : 0);
    return Number(stats[key]) || 0;
  }

  function autoEquipItemFitsSlot(item, slot) {
    if (!item || item.type !== 'gear') return false;
    if (slot === 'ringLeft' || slot === 'ringRight') return ['ring', 'ringLeft', 'ringRight'].includes(item.slot);
    return item.slot === slot;
  }

  function compareAutoEquipEntries(a, b, primary, secondary) {
    const primaryDiff = autoEquipStatValue(b.item, primary) - autoEquipStatValue(a.item, primary);
    if (Math.abs(primaryDiff) > 0.000001) return primaryDiff;
    const secondaryDiff = autoEquipStatValue(b.item, secondary) - autoEquipStatValue(a.item, secondary);
    if (Math.abs(secondaryDiff) > 0.000001) return secondaryDiff;
    const powerDiff = gearStrength(b.item) - gearStrength(a.item);
    if (Math.abs(powerDiff) > 0.000001) return powerDiff;
    const rarityDiff = rarityRank(b.item.rarity) - rarityRank(a.item.rarity);
    if (rarityDiff) return rarityDiff;
    return (b.item.level || 0) - (a.item.level || 0);
  }

  function buildAutoEquipPlan(primary, secondary) {
    const c = game.character;
    const entries = [];
    for (const slot of EQUIPMENT_SLOTS) {
      const item = c.equipment[slot];
      if (item?.type === 'gear') entries.push({ item, token: `equipped:${slot}` });
    }
    c.inventory.forEach((item, index) => {
      if (item?.type === 'gear') entries.push({ item, token: `inventory:${index}` });
    });
    const used = new Set();
    const equipment = {};
    for (const slot of EQUIPMENT_SLOTS) {
      const candidates = entries.filter(entry => !used.has(entry.token) && autoEquipItemFitsSlot(entry.item, slot));
      candidates.sort((a, b) => compareAutoEquipEntries(a, b, primary, secondary));
      const best = candidates[0] || null;
      equipment[slot] = best?.item || null;
      if (best) used.add(best.token);
    }
    const nonGear = c.inventory.filter(item => item?.type !== 'gear');
    const remainingGear = entries.filter(entry => !used.has(entry.token)).map(entry => entry.item);
    const changes = EQUIPMENT_SLOTS.flatMap(slot => {
      const before = c.equipment[slot] || null;
      const after = equipment[slot] || null;
      const same = before === after || (before?.id && after?.id && before.id === after.id);
      return same ? [] : [{ slot, before, after }];
    });
    return { equipment, inventory: [...nonGear, ...remainingGear], changes };
  }

  function autoEquipPreviewHtml(plan) {
    if (!plan.changes.length) return '<div class="auto-equip-empty">Your current equipment already matches these priorities.</div>';
    return plan.changes.map(change => `<div class="auto-equip-change"><b>${SLOT_LABELS[change.slot]}</b><span>${change.before ? escapeHtml(change.before.name) : 'Empty'} → <strong>${change.after ? escapeHtml(change.after.name) : 'Empty'}</strong></span></div>`).join('');
  }

  function showAutoEquipMenu() {
    const settings = game.character.settings;
    const optionHtml = selected => AUTO_EQUIP_STATS.map(option => `<option value="${option.key}" ${option.key === selected ? 'selected' : ''}>${option.label}</option>`).join('');
    showModal('Auto Equip', `
      <p class="muted">Choose the most important stat, then the tie-breaker used when two items provide the same primary value.</p>
      <div class="auto-equip-priority-grid">
        <label class="auto-equip-field"><span>Primary</span><select id="autoEquipPrimary">${optionHtml(settings.autoEquipPrimary || 'damage')}</select></label>
        <label class="auto-equip-field"><span>Secondary</span><select id="autoEquipSecondary">${optionHtml(settings.autoEquipSecondary || 'strength')}</select></label>
      </div>
      <div class="section-title">Loadout Preview</div>
      <div id="autoEquipPreview" class="auto-equip-preview"></div>
      <button id="applyAutoEquip" class="panel-btn wide-action">Equip Best Loadout</button>
    `);
    const primaryEl = $('autoEquipPrimary');
    const secondaryEl = $('autoEquipSecondary');
    const previewEl = $('autoEquipPreview');
    const applyBtn = $('applyAutoEquip');
    let plan = null;
    const refresh = () => {
      plan = buildAutoEquipPlan(primaryEl.value, secondaryEl.value);
      previewEl.innerHTML = autoEquipPreviewHtml(plan);
      applyBtn.disabled = plan.changes.length === 0;
    };
    primaryEl.addEventListener('change', refresh);
    secondaryEl.addEventListener('change', refresh);
    applyBtn.addEventListener('click', () => {
      if (!plan?.changes.length) return;
      settings.autoEquipPrimary = primaryEl.value;
      settings.autoEquipSecondary = secondaryEl.value;
      game.character.equipment = plan.equipment;
      game.character.inventory = plan.inventory;
      refreshDerivedHealth();
      saveGame();
      toast(`Auto-equipped ${plan.changes.length} slot${plan.changes.length === 1 ? '' : 's'}.`);
      showInventory();
    });
    refresh();
  }

  function renderPotionLoadoutSummary() {
    const loadout = game.character.potionLoadout || {};
    return `<div class="potion-loadout-grid">${['health','mana','stamina'].map(category => {
      const id = loadout[category];
      const def = POTION_DEFS[id];
      const count = id ? itemCount(id) : 0;
      const active = game.character.activePotionSlot === category;
      return `<div class="potion-loadout-card ${active ? 'active' : ''}">
        <small>${POTION_SHORT[category]} quick slot</small>
        <strong>${def ? `${def.icon} ${escapeHtml(def.name)}` : 'Unassigned'}</strong>
        <p>${count} carried · ${active ? 'Potion button uses this slot' : 'Tap Activate to make this live'}</p>
        <button class="panel-btn" data-slot="${category}">${active ? 'Active' : 'Activate'}<\/button>
      </div>`;
    }).join('')}</div>`;
  }

  function showPotionLoadout() {
    const loadout = game.character.potionLoadout || {};
    showModal('Potion Belt', `
      <p>Choose which potion version each quick slot uses. The Potion button consumes the currently active slot from the HUD.</p>
      <div class="potion-loadout-grid">${['health','mana','stamina'].map(category => {
        const active = game.character.activePotionSlot === category;
        const current = POTION_DEFS[loadout[category]];
        return `<div class="potion-loadout-card ${active ? 'active' : ''}">
          <small>${POTION_SHORT[category]} quick slot</small>
          <strong>${current ? `${current.icon} ${escapeHtml(current.name)}` : 'Unassigned'}</strong>
          <p>${active ? 'Currently used by the Potion button.' : 'Not currently active.'}</p>
          <button class="panel-btn activate-potion-slot" data-slot="${category}">${active ? 'Active' : 'Make Active'}<\/button>
        </div>`;
      }).join('')}</div>
      <div class="potion-assign-grid">${['health','mana','stamina'].map(category => `<div class="potion-assign-card"><div class="section-title">${POTION_SHORT[category]} options</div><div class="potion-choice-list">${POTION_ORDER[category].map(id => { const def = POTION_DEFS[id]; const count = itemCount(id); return `<button class="buy-btn potion-choice-btn assign-potion-choice" data-slot="${category}" data-id="${id}" ${count ? '' : 'disabled'}><span>${def.icon} ${escapeHtml(def.name)}<br><em>${count} carried</em></span><span>${def.restore}<\/span><\/button>`; }).join('')}<\/div><\/div>`).join('')}</div>
    `);
    modalBody.querySelectorAll('.activate-potion-slot').forEach(btn => btn.addEventListener('click', () => { game.character.activePotionSlot = btn.dataset.slot; game.potionTraySignature=''; saveGame(); showPotionLoadout(); }));
    modalBody.querySelectorAll('.assign-potion-choice').forEach(btn => btn.addEventListener('click', () => { assignPotionSlot(btn.dataset.slot, btn.dataset.id, true); showPotionLoadout(); }));
  }

  function autoDropMatchingEntries(rarities) {
    const wanted = new Set(rarities.filter(rarity => RARITY_ORDER.includes(rarity)));
    return safeInventoryGearEntries().filter(({ item }) => wanted.has(item.rarity || 'common'));
  }

  function showAutoDropMenu() {
    const settings = game.character.settings ||= {};
    const selected = new Set(Array.isArray(settings.autoDropRarities) ? settings.autoDropRarities : []);
    const rarityRows = RARITY_ORDER.map(rarity => {
      const count = safeInventoryGearByRarity(rarity).length;
      const checked = selected.has(rarity) ? 'checked' : '';
      return `<label class="auto-drop-option rarity-${rarity}">
        <input type="checkbox" class="auto-drop-rarity" value="${rarity}" ${checked}>
        <span class="auto-drop-check"></span>
        <span><strong>${RARITIES[rarity].name}</strong><small>${count} unequipped item${count === 1 ? '' : 's'} currently carried</small></span>
      </label>`;
    }).join('');
    showModal('Auto-Drop Equipment', `
      <p>Select the equipment rarities you want removed from your carried inventory.</p>
      <p class="muted">Equipped gear, materials, consumables, quest items, tools, and stored items can never be removed here. Your checklist is remembered for the next use.</p>
      <div class="auto-drop-list">${rarityRows}</div>
      <div id="autoDropSummary" class="auto-drop-summary"></div>
      <button id="confirmAutoDrop" class="panel-btn wide-action danger-action">Drop matching equipment</button>
      <button id="backToInventory" class="panel-btn wide-action">Back to inventory</button>
    `);

    const chosenRarities = () => Array.from(modalBody.querySelectorAll('.auto-drop-rarity:checked')).map(input => input.value);
    const refreshSummary = () => {
      const entries = autoDropMatchingEntries(chosenRarities());
      const summary = $('autoDropSummary');
      if (!summary) return;
      summary.innerHTML = entries.length
        ? `<strong>${entries.length}</strong> equipment item${entries.length === 1 ? '' : 's'} will be permanently dropped.`
        : 'No carried equipment currently matches this checklist.';
      $('confirmAutoDrop').disabled = chosenRarities().length === 0;
    };
    modalBody.querySelectorAll('.auto-drop-rarity').forEach(input => input.addEventListener('change', refreshSummary));
    $('backToInventory')?.addEventListener('click', showInventory);
    $('confirmAutoDrop')?.addEventListener('click', () => {
      const rarities = chosenRarities();
      const entries = autoDropMatchingEntries(rarities);
      const includesValuable = rarities.some(rarity => RARITY_ORDER.indexOf(rarity) >= RARITY_ORDER.indexOf('rare'));
      if (entries.length && includesValuable && !confirm(`Permanently drop ${entries.length} matching equipment item${entries.length === 1 ? '' : 's'}? Some are Rare or higher.`)) return;
      settings.autoDropRarities = rarities;
      if (entries.length) {
        const removeSet = new Set(entries.map(entry => entry.item));
        game.character.inventory = game.character.inventory.filter(item => !removeSet.has(item));
      }
      saveGame();
      toast(entries.length ? `Dropped ${entries.length} matching equipment item${entries.length === 1 ? '' : 's'}.` : 'Auto-Drop rarity preferences saved.');
      showInventory();
    });
    refreshSummary();
  }

  function showInventory() {
    const c = game.character;
    const paperSlots = EQUIPMENT_SLOTS.map(equipmentSlotHtml).join('');
    showModal('Inventory & Equipment', `
      <p>${c.inventory.length}/${c.inventoryCapacity} slots · ${c.coins} coins</p>
      <div class="inventory-toolbar">
        <button id="autoEquipBtn" class="panel-btn">Auto Equip</button>
        <button id="autoDropBtn" class="panel-btn">Auto-Drop</button>
        <button id="inventorySpellsBtn" class="panel-btn">Spellbook & Loadout</button>
        <button id="inventoryPotionsBtn" class="panel-btn">Potion Belt</button>
      </div>
      <div class="section-title">Potion Belt</div>
      <p class="muted">Pick one health, one mana, and one stamina potion for quick use. The highlighted slot is the one the Potion button will drink.</p>
      ${renderPotionLoadoutSummary()}
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
    $('autoEquipBtn')?.addEventListener('click', showAutoEquipMenu);
    $('autoDropBtn')?.addEventListener('click', showAutoDropMenu);
    $('inventorySpellsBtn')?.addEventListener('click', () => showSpellLoadout(0));
    $('inventoryPotionsBtn')?.addEventListener('click', showPotionLoadout);
    modalBody.querySelectorAll('.potion-loadout-card button').forEach(btn => btn.addEventListener('click', () => { game.character.activePotionSlot = btn.dataset.slot; game.potionTraySignature=''; saveGame(); showInventory(); }));
    modalBody.querySelectorAll('.equip-item').forEach(btn => btn.addEventListener('click', () => equipInventoryIndex(Number(btn.dataset.i))));
    modalBody.querySelectorAll('.use-tome').forEach(btn => btn.addEventListener('click', () => useAscensionTome(Number(btn.dataset.i))));
    modalBody.querySelectorAll('.set-potion-slot').forEach(btn => btn.addEventListener('click', () => { assignPotionSlot(btn.dataset.slot, btn.dataset.id); showInventory(); }));
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
    const gear = safeInventoryGearEntries().sort((a, b) => compareItems(a.item, b.item));
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
    if (!item || item.type !== 'gear' || equippedItemReferenceSet().has(item)) {
      toast('Equipped gear is protected and cannot be sold.');
      return;
    }
    const value = sellValue(item);
    game.character.inventory.splice(index, 1);
    game.character.coins += value;
    saveGame();
    toast(`Sold ${item.name} for ${value} coins.`);
    showSellEquipment();
  }

  function sellInventoryByRarity(rarity) {
    const entries = safeInventoryGearByRarity(rarity);
    if (!entries.length) { toast(`No ${RARITIES[rarity]?.name || rarity} unequipped equipment to sell.`); return; }
    if (RARITY_ORDER.indexOf(rarity) >= RARITY_ORDER.indexOf('rare') && !confirm(`Sell all ${entries.length} unequipped ${RARITIES[rarity].name} equipment items?`)) return;
    const value = entries.reduce((sum, { item }) => sum + sellValue(item), 0);
    const sellSet = new Set(entries.map(entry => entry.item));
    game.character.inventory = game.character.inventory.filter(item => !sellSet.has(item));
    game.character.coins += value;
    saveGame();
    toast(`Sold ${entries.length} ${RARITIES[rarity].name} item${entries.length === 1 ? '' : 's'} for ${value} coins.`);
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
      <p class="muted">Current: action buttons ${s.handedness === 'reversed' ? 'left' : 'right'}, ${s.joystick || 'fixed'} thumbsticks. One thumb always moves and aims together. Add a second thumb for left MOVE and right AIM.</p>
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
    modal.classList.remove('ascension-modal');
    modalTitle.textContent = title;
    modalBody.innerHTML = html;
    modalBody.scrollTop = 0;
    modal.scrollTop = 0;
    modalClose.style.visibility = closable ? 'visible' : 'hidden';
    modalBackdrop.classList.remove('hidden');
    game.paused = true;
    requestAnimationFrame(() => { modalBody.scrollTop = 0; modal.scrollTop = 0; });
  }
  function hideModal() {
    modal.classList.remove('ascension-modal');
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
    base.classList.remove('move-role', 'aim-role', 'combined-role');
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
    joystickLabel.textContent = 'MOVE + AIM';
    secondaryJoystickLabel.textContent = 'AIM';
    touchControls.classList.remove('twin-stick-active', 'move-stick-active', 'aim-stick-active', 'secondary-stick-active', 'joystick-active');
    setStickRoleVisual('first', 'combined');
    setStickRoleVisual('second', 'aim');
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

  function activeStickSlots() {
    return ['first', 'second'].filter(slot => game.joystick[slot].active);
  }

  function assignTouchControlRoles() {
    const entries = activeStickSlots();
    if (entries.length === 1) {
      // A single thumb always gets the original combined movement-and-aim control,
      // regardless of screen side or whether enemies are present.
      game.joystick[entries[0]].role = 'combined';
      return;
    }
    if (entries.length >= 2) {
      // True twin-stick mode: the leftmost thumb moves and the rightmost thumb aims.
      entries.sort((a, b) => game.joystick[a].startX - game.joystick[b].startX);
      game.joystick[entries[0]].role = 'move';
      game.joystick[entries[entries.length - 1]].role = 'aim';
    }
  }

  function twinStickRoles() {
    const entries = activeStickSlots();
    if (entries.length < 2) return null;
    const move = entries.find(slot => game.joystick[slot].role === 'move') || null;
    const aim = entries.find(slot => game.joystick[slot].role === 'aim') || null;
    return { move, aim };
  }

  function setStickRoleVisual(slot, role) {
    const { base, label } = stickParts(slot);
    base.classList.toggle('move-role', role === 'move');
    base.classList.toggle('aim-role', role === 'aim');
    base.classList.toggle('combined-role', role === 'combined');
    label.textContent = role === 'aim' ? 'AIM' : role === 'move' ? 'MOVE' : 'MOVE + AIM';
  }

  function syncTouchControlRoles() {
    assignTouchControlRoles();
    const first = game.joystick.first;
    const second = game.joystick.second;
    const combinedState = first.active && first.role === 'combined' ? first : second.active && second.role === 'combined' ? second : null;
    const moveState = first.active && first.role === 'move' ? first : second.active && second.role === 'move' ? second : null;
    const aimState = first.active && first.role === 'aim' ? first : second.active && second.role === 'aim' ? second : null;
    const activeCount = Number(first.active) + Number(second.active);
    touchControls.classList.toggle('twin-stick-active', activeCount > 1);
    touchControls.classList.toggle('move-stick-active', !!(combinedState || moveState));
    touchControls.classList.toggle('aim-stick-active', !!aimState);
    touchControls.classList.toggle('secondary-stick-active', second.active);
    touchControls.classList.toggle('joystick-active', activeCount > 0);

    const movementInput = combinedState || moveState;
    const aimingInput = combinedState || aimState;
    game.input.x = movementInput ? movementInput.vectorX : 0;
    game.input.y = movementInput ? movementInput.vectorY : 0;
    game.input.aimX = aimingInput ? aimingInput.vectorX : 0;
    game.input.aimY = aimingInput ? aimingInput.vectorY : 0;
    game.input.aimMode = !!aimingInput;
    setStickRoleVisual('first', first.role || 'combined');
    setStickRoleVisual('second', second.role || 'aim');
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
    if (isStart) state.dodgeThreshold = rect.width * 0.5 + DODGE.outsideMargin;
    const n = normalize(dx, dy);
    const distance = Math.hypot(dx, dy);
    const rawMagnitude = clamp(distance / max, 0, 1);
    // The combined/movement stick intentionally has a broad neutral center so
    // resting or resetting a thumb does not cause character drift. Dedicated
    // twin-stick aim remains precise once the second thumb is down.
    const deadzone = state.role === 'aim' ? 0.08 : 0.38;
    const outputMagnitude = rawMagnitude <= deadzone ? 0 : (rawMagnitude - deadzone) / (1 - deadzone);
    const mag = Math.min(max, distance);
    knob.style.left = `calc(50% + ${n.x * mag}px)`;
    knob.style.top = `calc(50% + ${n.y * mag}px)`;
    state.vectorX = n.x * outputMagnitude;
    state.vectorY = n.y * outputMagnitude;
    syncTouchControlRoles();
  }

  function updateLiveAimFlick(slot, clientX, clientY) {
    const { state, base } = stickParts(slot);
    if (!state.active || state.role !== 'aim') return false;
    const rect = base.getBoundingClientRect();
    const distance = Math.hypot(clientX - state.originX, clientY - state.originY);
    const trigger = rect.width * DODGE.aimFlickTriggerRatio;
    const reset = rect.width * DODGE.aimFlickResetRatio;
    if (distance <= reset) {
      state.aimFlickArmed = false;
      return false;
    }
    if (distance < trigger || state.aimFlickArmed) return false;
    state.aimFlickArmed = true;
    state.aimFlickCounted = true;
    const direction = normalize(clientX - state.originX, clientY - state.originY);
    registerAimFlick(direction);
    return true;
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
    state.dodgeThreshold = 0;
    state.aimFlickArmed = false;
    state.aimFlickCounted = false;
    resetStickVisual(base, knob);
  }

  function registerAimFlick(direction) {
    const now = performance.now();
    const last = game.aimFlick || { time: 0, x: 0, y: 0 };
    const dot = direction.x * last.x + direction.y * last.y;
    if (now - last.time <= DODGE.doubleFlickMs && dot > 0.15) {
      game.aimFlick = { time: 0, x: 0, y: 0 };
      const worldDodge = screenVectorToWorld(direction.x, direction.y);
      attemptDodge(worldDodge.x, worldDodge.y);
      return true;
    }
    game.aimFlick = { time: now, x: direction.x, y: direction.y };
    return false;
  }

  function isOutsideCircleFlick(elapsedMs, travelDistance, dodgeThreshold) {
    return elapsedMs <= DODGE.maxGestureMs
      && travelDistance >= DODGE.minSwipe
      && dodgeThreshold > 0
      && travelDistance >= dodgeThreshold;
  }

  function isStationarySpellTap(elapsedMs, travelDistance) {
    return elapsedMs <= TAP_CAST.maxTapMs && travelDistance <= TAP_CAST.maxTravel;
  }

  function resetTapSequence(side) {
    const sequence = game.tapCasting?.[side];
    if (!sequence) return;
    if (sequence.timer) clearTimeout(sequence.timer);
    sequence.count = 0;
    sequence.lastTime = 0;
    sequence.timer = null;
  }

  function registerSpellTap(side) {
    if (game.scene !== 'dungeon' || game.paused || !game.character || !game.player) return false;
    const sequence = game.tapCasting[side];
    const now = performance.now();
    if (now - sequence.lastTime > TAP_CAST.sequenceGapMs) {
      if (sequence.timer) clearTimeout(sequence.timer);
      sequence.count = 0;
      sequence.timer = null;
    }
    sequence.count += 1;
    sequence.lastTime = now;

    if (sequence.count === 2) {
      if (sequence.timer) clearTimeout(sequence.timer);
      sequence.timer = setTimeout(() => {
        const slotIndex = side === 'left' ? 0 : 1;
        resetTapSequence(side);
        if (game.scene === 'dungeon' && !game.paused) toggleSpellAutoCast(slotIndex, { source: 'gesture' });
      }, TAP_CAST.doubleResolveMs);
      return true;
    }

    if (sequence.count >= 3) {
      if (sequence.timer) clearTimeout(sequence.timer);
      const slotIndex = side === 'left' ? 2 : 3;
      resetTapSequence(side);
      toggleSpellAutoCast(slotIndex, { source: 'gesture' });
      return true;
    }
    return false;
  }

  function bindImmediatePress(element, handler) {
    if (!element) return;
    let lastPointerAt = -Infinity;
    const activate = (event) => {
      if (event?.pointerType === 'mouse' && event.button !== 0) return;
      event?.preventDefault?.();
      event?.stopPropagation?.();
      lastPointerAt = performance.now();
      handler(event);
    };
    if ('PointerEvent' in window) element.addEventListener('pointerdown', activate, { passive: false });
    else element.addEventListener('touchstart', activate, { passive: false });
    element.addEventListener('click', (event) => {
      if (performance.now() - lastPointerAt < 700) { event.preventDefault(); return; }
      handler(event);
    });
  }

  function bindControls() {
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 120));
    window.addEventListener('beforeunload', () => saveGame());

    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      if (game.gathering) {
        if (['escape','c'].includes(key)) endGatheringMode('cancel');
        else if (key === ' ' || key === 'enter') game.gathering.skillName === 'fishing' ? resolveFishingTug() : resolvePrecisionChallenge();
        e.preventDefault();
        return;
      }
      game.input.keys.add(key);
      if (['arrowup','arrowdown','arrowleft','arrowright',' '].includes(key)) e.preventDefault();
      if (e.repeat) return;
      if (key === ' ') requestAttack();
      if (key === 'e') game.input.interactQueued = true;
      if (key === 'q') toggleAutoAttack();
      if (key === 'i') showInventory();
      if (key === 'm') showMap();
      if (/^[1-4]$/.test(key)) toggleSpellAutoCast(Number(key) - 1, { source: 'keyboard' });
      if (key === 'escape' && game.running) modalBackdrop.classList.contains('hidden') ? showMainMenu() : hideModal();
    });
    window.addEventListener('keyup', (e) => game.input.keys.delete(e.key.toLowerCase()));

    const beginJoy = (clientX, clientY, pointerId = 'touch') => {
      if (!game.running || game.paused || game.gathering) return false;
      // The first thumb can begin anywhere and always controls movement + aim.
      // A second thumb activates true twin-stick mode: leftmost MOVE, rightmost AIM.
      const slot = !game.joystick.first.active ? 'first' : !game.joystick.second.active ? 'second' : null;
      if (!slot) return false;
      const state = game.joystick[slot];
      state.pointerId = pointerId;
      state.active = true;
      state.role = 'combined';
      state.vectorX = 0;
      state.vectorY = 0;
      state.startX = clientX;
      state.startY = clientY;
      state.lastX = clientX;
      state.lastY = clientY;
      state.startTime = performance.now();
      state.maxDistance = 0;
      state.dodgeThreshold = 0;
      state.aimFlickArmed = false;
      state.aimFlickCounted = false;
      assignTouchControlRoles();
      setStickFromPointer(slot, clientX, clientY, true);

      // If the first thumb changed from combined to a dedicated twin-stick role,
      // recalculate it using the correct role-specific dead zone immediately.
      const otherSlot = slot === 'first' ? 'second' : 'first';
      const other = game.joystick[otherSlot];
      if (other.active) setStickFromPointer(otherSlot, other.lastX, other.lastY);
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
      updateLiveAimFlick(slot, clientX, clientY);
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
      const qualifiesAsFlick = isOutsideCircleFlick(elapsed, swipeDistance, state.dodgeThreshold);
      const qualifiesAsTap = isStationarySpellTap(elapsed, swipeDistance);
      const releasedRole = state.role;
      const releasedSide = state.startX < window.innerWidth / 2 ? 'left' : 'right';
      const shouldDodge = (releasedRole === 'move' || releasedRole === 'combined') && qualifiesAsFlick;
      const shouldRegisterAimFlick = releasedRole === 'aim' && qualifiesAsFlick && !state.aimFlickCounted;
      const dodgeDir = Math.hypot(state.vectorX, state.vectorY) > 0.25 ? { x: state.vectorX, y: state.vectorY } : normalize(swipeX, swipeY);
      clearStick(slot);
      assignTouchControlRoles();
      const remainingSlot = activeStickSlots()[0] || null;
      if (remainingSlot) {
        const remaining = game.joystick[remainingSlot];
        setStickFromPointer(remainingSlot, remaining.lastX, remaining.lastY);
      } else {
        syncTouchControlRoles();
      }
      if (shouldDodge) {
        resetTapSequence(releasedSide);
        const worldDodge = screenVectorToWorld(dodgeDir.x, dodgeDir.y);
        attemptDodge(worldDodge.x, worldDodge.y);
      } else if (shouldRegisterAimFlick) {
        resetTapSequence(releasedSide);
        registerAimFlick(dodgeDir);
      } else if (qualifiesAsTap) {
        registerSpellTap(releasedSide);
      } else {
        resetTapSequence(releasedSide);
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
    if (interactionLayer) {
      let lastInteractionPointerAt = -Infinity;
      const activateInteraction = (e) => {
        const button = e.target.closest('.context-interact-btn');
        if (!button) return;
        e.preventDefault(); e.stopPropagation();
        lastInteractionPointerAt = performance.now();
        const target = game.nearbyInteractablesRendered?.[Number(button.dataset.index)];
        if (target) interactWithTarget(target);
      };
      if ('PointerEvent' in window) interactionLayer.addEventListener('pointerdown', activateInteraction, { passive:false });
      else interactionLayer.addEventListener('touchstart', activateInteraction, { passive:false });
      interactionLayer.addEventListener('click', (e) => {
        if (performance.now() - lastInteractionPointerAt < 700) { e.preventDefault(); return; }
        activateInteraction(e);
      });
    }
    bindImmediatePress(gatheringCancelBtn, () => endGatheringMode('cancel'));
    bindImmediatePress(precisionTarget, resolvePrecisionChallenge);
    bindImmediatePress(fishingTugBtn, resolveFishingTug);
    bindImmediatePress(bagBtn, showInventory);
    bindImmediatePress(autoBtn, toggleAutoAttack);
    bindImmediatePress(potionBtn, usePotion);
    bindImmediatePress(abilityBtn, useWhirlwind);
    bindImmediatePress(magnetBtn, useLootMagnet);
    bindImmediatePress(menuBtn, showMainMenu);
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

  function spellDamage(multiplier = 1) {
    return (12 + game.character.level * 2.4 + getDerivedStats().strength * 0.55) * multiplier;
  }

  function updatePlayerMagic(dt) {
    const p = game.player;
    p.maxMana = getDerivedStats().maxMana;
    p.mana = Math.min(p.maxMana, p.mana + (game.scene === 'dungeon' ? 6.5 : 18) * (1 + getAscensionBonuses().manaRegen) * dt);
    p.barrierTimer = Math.max(0, (p.barrierTimer || 0) - dt);
    p.silenceTimer = Math.max(0, (p.silenceTimer || 0) - dt);
    if (p.healOverTime) {
      p.healOverTime.time -= dt;
      p.healOverTime.tick -= dt;
      if (p.healOverTime.tick <= 0) {
        p.healOverTime.tick += .5;
        p.health = Math.min(p.maxHealth, p.health + p.healOverTime.amountPerTick);
        game.particles.push({ type: 'text', x: p.x, y: p.y - 34, text: `+${Math.round(p.healOverTime.amountPerTick)}`, t: 0, duration: .55, color: '#8fe8a2' });
      }
      if (p.healOverTime.time <= 0) p.healOverTime = null;
    }
    if (p.barrierTimer > 0) {
      for (const projectile of game.projectiles) {
        if (projectile.owner === 'enemy' && projectile.life > 0 && dist(projectile.x, projectile.y, p.x, p.y) < ARCANE_BARRIER_RADIUS + projectile.radius) destroyProjectile(projectile);
      }
      for (const enemy of game.enemies) {
        if (enemy.dead) continue;
        const d = dist(enemy.x, enemy.y, p.x, p.y);
        const barrierEdge = ARCANE_BARRIER_RADIUS + enemy.radius;
        if (d >= barrierEdge || d <= .1) continue;
        const n = normalize(enemy.x - p.x, enemy.y - p.y);
        const enemyLevel = Math.max(1, Number(enemy.level) || currentFloor()?.floorNumber || 1);
        const levelGap = enemyLevel - game.character.level;
        if (levelGap < 0) {
          const targetDistance = barrierEdge + 14 + Math.min(30, Math.abs(levelGap) * 5);
          enemy.x = clamp(p.x + n.x * targetDistance, enemy.radius + 32, game.roomWorld.w - enemy.radius - 32);
          enemy.y = clamp(p.y + n.y * targetDistance, enemy.radius + 32, game.roomWorld.h - enemy.radius - 32);
          const launch = 900 + Math.min(900, Math.abs(levelGap) * 180);
          enemy.vx += n.x * launch / Math.max(.55, enemy.mass);
          enemy.vy += n.y * launch / Math.max(.55, enemy.mass);
          continue;
        }
        const resistance = levelGap === 0 ? 1 : levelGap === 1 ? .68 : levelGap === 2 ? .4 : levelGap === 3 ? .2 : levelGap === 4 ? .08 : 0;
        if (resistance <= 0) continue;
        const penetration = barrierEdge - d;
        const positionalPush = Math.min(penetration, 520 * resistance * dt);
        enemy.x = clamp(enemy.x + n.x * positionalPush, enemy.radius + 32, game.roomWorld.w - enemy.radius - 32);
        enemy.y = clamp(enemy.y + n.y * positionalPush, enemy.radius + 32, game.roomWorld.h - enemy.radius - 32);
        enemy.vx += n.x * 1450 * resistance * dt / Math.max(.65, enemy.mass);
        enemy.vy += n.y * 1450 * resistance * dt / Math.max(.65, enemy.mass);
      }
    }
    if (p.spellCast) {
      const cast = p.spellCast;
      cast.time -= dt;
      cast.tick -= dt;
      if (cast.id === 'fireball' && cast.tick <= 0) {
        cast.tick += .28;
        const dir = normalize(p.facing.x, p.facing.y);
        fireProjectile(p.x + dir.x * 34, p.y + dir.y * 34, dir.x * 520, dir.y * 520, spellDamage(.62), '#ff7a39', 10, 'player', { status: 'burn', statusDuration: 3.2, knockback: 135, sourceSpell: 'fireball' });
        game.particles.push({ type: 'ring', x: p.x + dir.x * 28, y: p.y + dir.y * 28, r: 2, maxR: 18, t: 0, duration: .13, color: '#ffb45f' });
      } else if (cast.id === 'earthquake' && cast.tick <= 0) {
        cast.tick += .45;
        cast.pulses -= 1;
        const radius = 210 + (5 - cast.pulses) * 34;
        for (const enemy of game.enemies) {
          if (enemy.dead || dist(enemy.x, enemy.y, p.x, p.y) > radius + enemy.radius) continue;
          hitEnemy(enemy, spellDamage(.48), 330, enemy.x - p.x, enemy.y - p.y, { damageType:'magic', element:'earth', color:'#d7b06d' });
          enemy.slowTimer = Math.max(enemy.slowTimer || 0, 1.1);
        }
        game.particles.push({ type: 'ring', x: p.x, y: p.y, r: 20, maxR: radius, t: 0, duration: .32, color: '#d7b06d' });
        addCameraShake(5, .16);
        if (cast.pulses <= 0) cast.time = 0;
      }
      if (cast.time <= 0) p.spellCast = null;
    }
    updateSpellAutoCast(dt);
  }

  function updateSpellEffects(dt) {
    for (const effect of game.spellEffects) {
      effect.time -= dt;
      if (effect.type === 'meteor') {
        effect.pulse = (effect.pulse || 0) + dt;
        if (!effect.triggered && effect.time <= 0) {
          effect.triggered = true;
          createBlastTelegraph('fire', effect.x, effect.y, 205, .05, spellDamage(2.4), 'player', { hazardDuration: 7.5, statusDuration: 4.2 });
          game.spellEffects.push({ type: 'fireBurst', x: effect.x, y: effect.y, radius: 205, time: .36, duration: .36, intensity: 1.22 });
          addCameraShake(12, .42);
        }
      }
    }
    game.spellEffects = game.spellEffects.filter(effect => {
      if (effect.type === 'meteor') return effect.time > -0.25 && !effect.triggered;
      return effect.time > 0;
    });
  }

  function ultimateCooldownRemainingMs() {
    return Math.max(0, (game.character?.ultimateReadyAt || 0) - Date.now());
  }

  function autoCastRepeatDelay(spellId) {
    return AUTO_CAST_REPEAT_SECONDS[spellId] ?? .65;
  }

  function ensureSpellAutoCastState() {
    game.spellAutoCast ||= {};
    game.spellAutoCast.activeSlots = Array.from({ length: 4 }, (_, index) => !!game.spellAutoCast.activeSlots?.[index]);
    game.spellAutoCast.delays = Array.from({ length: 4 }, (_, index) => Math.max(0, Number(game.spellAutoCast.delays?.[index]) || 0));
    game.spellAutoCast.channelCursor = clamp(Math.floor(Number(game.spellAutoCast.channelCursor) || 0), 0, 3);
    return game.spellAutoCast;
  }

  function isSpellAutoCastActive(slotIndex) {
    return !!ensureSpellAutoCastState().activeSlots[slotIndex];
  }

  function stopSpellAutoCast(slotIndex = null, reason = '', options = {}) {
    const state = ensureSpellAutoCastState();
    const slots = slotIndex === null ? [0, 1, 2, 3] : [slotIndex];
    let stopped = false;
    for (const index of slots) {
      if (!state.activeSlots[index]) continue;
      const spellId = game.character?.equippedSpells?.[index];
      const spellName = SPELLS[spellId]?.name || `Spell slot ${index + 1}`;
      if (options.cancelChannel !== false && game.player?.spellCast?.autoSlot === index) game.player.spellCast = null;
      state.activeSlots[index] = false;
      state.delays[index] = 0;
      stopped = true;
      if (!options.silent && slotIndex !== null) {
        if (reason === 'mana') toast(`${spellName} auto-cast stopped — not enough mana.`);
        else if (reason === 'unavailable') toast(`${spellName} auto-cast stopped.`);
        else toast(`${spellName} auto-cast off.`, 900);
      }
    }
    if (stopped) game.spellTraySignature = '';
    return stopped;
  }

  function toggleSpellAutoCast(slotIndex, options = {}) {
    const unlocked = spellSlotsUnlocked();
    if (slotIndex < 0 || slotIndex >= unlocked || slotIndex >= 4) {
      if (slotIndex >= unlocked) toast(`Spell slot ${slotIndex + 1} unlocks at level ${slotIndex * 10}.`);
      return false;
    }
    if (isSpellAutoCastActive(slotIndex)) return stopSpellAutoCast(slotIndex, 'manual');
    const spellId = game.character?.equippedSpells?.[slotIndex];
    if (!spellId) { toast('That spell slot is empty.'); return false; }
    const spell = SPELLS[spellId];
    if (game.scene !== 'dungeon' || !game.player) { toast('Spells are cast inside the dungeon.'); return false; }
    if (game.player.mana < spellManaCost(spellId)) { toast(`Not enough mana for ${spell.name}.`); return false; }
    const state = ensureSpellAutoCastState();
    state.activeSlots[slotIndex] = true;
    state.delays[slotIndex] = 0;
    game.spellTraySignature = '';
    toast(`${spell.name} auto-cast on. Repeat the same command to stop.`, 1200);
    updateSpellAutoCast(0);
    return true;
  }

  function updateSpellAutoCast(dt) {
    const state = ensureSpellAutoCastState();
    if (game.scene !== 'dungeon' || game.paused || !game.player || !game.character) return;
    if (game.roomEnvironment?.silenced) return;
    const unlocked = spellSlotsUnlocked();
    for (let offset = 0; offset < 4; offset++) {
      const slotIndex = (state.channelCursor + offset) % 4;
      if (!state.activeSlots[slotIndex]) continue;
      if (slotIndex >= unlocked) { stopSpellAutoCast(slotIndex, 'unavailable'); continue; }
      const spellId = game.character.equippedSpells?.[slotIndex];
      const spell = SPELLS[spellId];
      if (!spell) { stopSpellAutoCast(slotIndex, 'unavailable'); continue; }
      state.delays[slotIndex] = Math.max(0, state.delays[slotIndex] - dt);
      if (state.delays[slotIndex] > 0) continue;
      const isChannelSpell = spellId === 'fireball' || spellId === 'earthquake';
      if (isChannelSpell && game.player.spellCast) continue;
      if (game.player.mana < spellManaCost(spellId)) { stopSpellAutoCast(slotIndex, 'mana'); continue; }
      const cast = castSpell(spellId, { silent: true, autoSlot: slotIndex });
      if (cast) {
        state.delays[slotIndex] = autoCastRepeatDelay(spellId);
        if (isChannelSpell) state.channelCursor = (slotIndex + 1) % 4;
        game.spellTraySignature = '';
      } else {
        state.delays[slotIndex] = .18;
      }
    }
  }

  function castEquippedSpell(slotIndex, options = {}) {
    const unlocked = spellSlotsUnlocked();
    if (slotIndex < 0 || slotIndex >= unlocked) { toast(`Spell slot ${slotIndex + 1} unlocks at level ${slotIndex * 10}.`); return false; }
    if (slotIndex === 4 && options.source === 'gesture') return false;
    const spellId = game.character.equippedSpells?.[slotIndex];
    if (!spellId) { toast('That spell slot is empty.'); return false; }
    const spell = SPELLS[spellId];
    if (slotIndex === 4) {
      if (spell?.tier !== 'High') { toast('The ultimate slot accepts high-tier magic only.'); return false; }
      const remaining = ultimateCooldownRemainingMs();
      if (remaining > 0) { toast(`Ultimate ready in ${Math.ceil(remaining / 1000)}s.`); return false; }
      const cast = castSpell(spellId, options);
      if (cast) {
        game.character.ultimateReadyAt = Date.now() + ULTIMATE_COOLDOWN_MS;
        game.spellTraySignature = '';
        saveGame();
      }
      return cast;
    }
    return castSpell(spellId, options);
  }

  function castSpell(spellId, options = {}) {
    const spell = SPELLS[spellId];
    const p = game.player;
    if (!spell || !p) return false;
    if (game.scene !== 'dungeon') { toast('Spells are prepared at camp and cast inside the dungeon.'); return false; }
    if (game.roomEnvironment?.silenced) { toast('The reliquary is suppressing magic. Break its silence crystals.'); return false; }
    if (p.mana < spellManaCost(spellId)) { toast(`Not enough mana for ${spell.name}.`); return false; }
    if (p.spellCast && (spellId === 'fireball' || spellId === 'earthquake')) { toast('You are already channeling a spell.'); return false; }
    p.mana -= spellManaCost(spellId);
    const dir = normalize(p.facing.x, p.facing.y);
    const damage = spellDamage();
    if (spellId === 'fireball') {
      p.spellCast = { id: spellId, time: 2.2, tick: 0, autoSlot: Number.isInteger(options.autoSlot) ? options.autoSlot : null };
    } else if (spellId === 'frostShards') {
      const base = Math.atan2(dir.y, dir.x);
      for (const offset of [-.16, 0, .16]) {
        const angle = base + offset;
        fireProjectile(p.x, p.y, Math.cos(angle) * 480, Math.sin(angle) * 480, damage * 1.25, '#9bd9ff', 9, 'player', { status: 'slow', statusDuration: 3.1, knockback: 120, sourceSpell: spellId });
      }
    } else if (spellId === 'stoneBurst') {
      for (const enemy of game.enemies) {
        if (enemy.dead || dist(enemy.x, enemy.y, p.x, p.y) > 245 + enemy.radius) continue;
        hitEnemy(enemy, damage * .85, 720, enemy.x - p.x, enemy.y - p.y, { damageType:'magic', element:'earth', color:'#d4b27a' });
      }
      game.particles.push({ type: 'ring', x: p.x, y: p.y, r: 18, maxR: 250, t: 0, duration: .38, color: '#d4b27a' });
      if (game.roomEnvironment) addCircleZone(game.roomEnvironment,'safeStone',p.x+dir.x*150,p.y+dir.y*150,125,{time:7});
    } else if (spellId === 'mendingWisps') {
      p.healOverTime = { time: 10, tick: .1, amountPerTick: Math.max(.75, p.maxHealth * .0075) };
    } else if (spellId === 'rejuvenation') {
      p.healOverTime = { time: 6, tick: .1, amountPerTick: Math.max(1.2, p.maxHealth * .018) };
    } else if (spellId === 'flameWave') {
      const angle = Math.atan2(dir.y, dir.x);
      const cone = { x: p.x, y: p.y, angle, range: 410, arc: Math.PI * .52 };
      game.spellEffects.push({ type: 'flameWave', x: p.x, y: p.y, angle, range: 405, arc: Math.PI * .56, time: .34, duration: .34 });
      for (const enemy of game.enemies) {
        if (enemy.dead || !pointInCone(enemy.x, enemy.y, cone, enemy.radius)) continue;
        hitEnemy(enemy, damage * 1.05, 320, enemy.x - p.x, enemy.y - p.y, { damageType:'magic', element:'fire', color:'#ff8a4c' });
        enemy.burnTimer = Math.max(enemy.burnTimer || 0, 4.2); enemy.burnTick = .1;
      }
      for (let i = 1; i <= 3; i++) createGroundHazard('fire', p.x + dir.x * i * 105, p.y + dir.y * i * 105, 78, 5.5, Math.max(2, damage * .09), 'player');
      if (game.roomEnvironment) game.roomEnvironment.zones = game.roomEnvironment.zones.filter(zone => {
        if (!['web','poison','ice','iceBridge'].includes(zone.type)) return true;
        const zx=zone.shape==='circle'?zone.x:(zone.x1+zone.x2)/2, zy=zone.shape==='circle'?zone.y:(zone.y1+zone.y2)/2;
        return !pointInCone(zx,zy,cone,zone.radius||40);
      });
    } else if (spellId === 'iceNova') {
      for (const enemy of game.enemies) {
        if (enemy.dead || dist(enemy.x, enemy.y, p.x, p.y) > 330 + enemy.radius) continue;
        hitEnemy(enemy, damage * .8, 190, enemy.x - p.x, enemy.y - p.y, { damageType:'magic', element:'ice', color:'#b9e8ff' });
        enemy.slowTimer = Math.max(enemy.slowTimer || 0, 4.5);
      }
      game.particles.push({ type: 'ring', x: p.x, y: p.y, r: 25, maxR: 340, t: 0, duration: .5, color: '#b9e8ff' });
      if (game.roomEnvironment && environmentZonesAt(p.x,p.y,340).some(zone=>['water','deepWater'].includes(zone.type))) addCircleZone(game.roomEnvironment,'iceBridge',p.x,p.y,330,{time:7});
    } else if (spellId === 'tidalSurge') {
      const base = Math.atan2(dir.y, dir.x);
      for (const offset of [-.09, 0, .09]) {
        const angle = base + offset;
        fireProjectile(p.x, p.y, Math.cos(angle) * 390, Math.sin(angle) * 390, damage * .58, '#63c7df', 19, 'player', { knockback: 720, pierce: 2, sourceSpell: spellId });
      }
    } else if (spellId === 'arcaneBarrier') {
      p.barrierTimer = 5;
      game.particles.push({ type: 'ring', x: p.x, y: p.y, r: 30, maxR: 175, t: 0, duration: .45, color: '#b899ff' });
    } else if (spellId === 'meteor') {
      const tx = clamp(p.x + dir.x * 420, 120, game.roomWorld.w - 120);
      const ty = clamp(p.y + dir.y * 420, 120, game.roomWorld.h - 120);
      game.spellEffects.push({ type: 'meteor', x: tx, y: ty, time: 1.05, duration: 1.05 });
    } else if (spellId === 'glacialPrison') {
      for (const enemy of game.enemies) {
        if (enemy.dead || dist(enemy.x, enemy.y, p.x, p.y) > 520 + enemy.radius) continue;
        hitEnemy(enemy, damage * .72, 80, enemy.x - p.x, enemy.y - p.y, { damageType:'magic', element:'ice', color:'#d6f3ff' });
        enemy.slowTimer = Math.max(enemy.slowTimer || 0, 7.5);
        enemy.vx *= .12; enemy.vy *= .12;
      }
      game.particles.push({ type: 'ring', x: p.x, y: p.y, r: 40, maxR: 525, t: 0, duration: .65, color: '#d6f3ff' });
    } else if (spellId === 'earthquake') {
      p.spellCast = { id: spellId, time: 2.25, tick: 0, pulses: 5, autoSlot: Number.isInteger(options.autoSlot) ? options.autoSlot : null };
    } else if (spellId === 'silenceField') {
      p.silenceTimer = 6;
      for (const projectile of game.projectiles) if (projectile.owner === 'enemy') destroyProjectile(projectile);
      game.particles.push({ type: 'ring', x: p.x, y: p.y, r: 28, maxR: 470, t: 0, duration: .65, color: '#d7b7ff' });
    } else if (spellId === 'greaterRestoration') {
      p.healOverTime = { time: 3, tick: .1, amountPerTick: Math.max(2, p.maxHealth * .04) };
    }
    if (!options.silent) toast(`${spell.name} cast.`, 900);
    return true;
  }

  function spellSwapRemainingMs() {
    return Math.max(0, (game.character.spellSwapAvailableAt || 0) - Date.now());
  }

  function equipSpellToSlot(spellId, slotIndex) {
    if (!game.character.knownSpells.includes(spellId)) return;
    if (slotIndex >= spellSlotsUnlocked()) return;
    if (slotIndex === 4 && SPELLS[spellId]?.tier !== 'High') { toast('The ultimate slot accepts high-tier magic only.'); return; }
    const remaining = spellSwapRemainingMs();
    if (remaining > 0) { toast(`Spell swapping ready in ${(remaining / 1000).toFixed(1)}s.`); return; }
    stopSpellAutoCast(null, '', { silent: true });
    const equipped = game.character.equippedSpells;
    const existing = equipped.indexOf(spellId);
    if (existing === slotIndex) return;
    if (existing >= 0) equipped[existing] = equipped[slotIndex] || null;
    equipped[slotIndex] = spellId;
    if (equipped[4] && SPELLS[equipped[4]]?.tier !== 'High') equipped[4] = null;
    game.character.spellSwapAvailableAt = Date.now() + SPELL_SWAP_COOLDOWN_MS;
    game.spellTraySignature = '';
    saveGame();
    toast(`${SPELLS[spellId].name} equipped to slot ${slotIndex + 1}.`);
    showSpellLoadout(slotIndex);
  }

  function showSpellLoadout(selectedSlot = 0) {
    normalizeMagic(game.character);
    const unlocked = spellSlotsUnlocked();
    selectedSlot = clamp(selectedSlot, 0, unlocked - 1);
    const remaining = spellSwapRemainingMs();
    const slots = Array.from({ length: unlocked }, (_, index) => {
      const id = game.character.equippedSpells[index];
      const spell = SPELLS[id];
      const slotLabel = index === 4 ? 'Ultimate' : `Slot ${index + 1}`;
      return `<button class="loadout-slot ${index === selectedSlot ? 'selected' : ''} ${index === 4 ? 'ultimate-loadout-slot' : ''}" data-slot="${index}"><span>${spell?.icon || '+'}</span><b>${spell?.name || `Empty ${slotLabel}`}</b><small>${slotLabel}</small></button>`;
    }).join('');
    const availableSpells = selectedSlot === 4 ? game.character.knownSpells.filter(id => SPELLS[id]?.tier === 'High') : game.character.knownSpells;
    const cards = availableSpells.map(id => {
      const spell = SPELLS[id];
      const active = game.character.equippedSpells[selectedSlot] === id;
      return `<button class="spellbook-card element-${spell.element} ${active ? 'equipped' : ''}" data-spell="${id}" ${remaining > 0 ? 'disabled' : ''}><span class="spell-rune">${spell.icon}</span><strong>${spell.name}</strong><small>${spell.tier} · ${spellManaCost(id)} MP</small><p>${spell.description}</p></button>`;
    }).join('');
    showModal('Spellbook & Loadout', `
      <div class="spell-loadout-summary"><span><b>${unlocked}</b> spell slot${unlocked === 1 ? '' : 's'}</span><span><b>${game.character.knownSpells.length}</b> learned</span><span>${remaining > 0 ? `<b>${(remaining / 1000).toFixed(1)}s</b> swap lock` : '<b>Ready</b> to swap'}</span></div>
      <div class="spell-loadout-slots">${slots}</div>
      <div class="section-title">Choose a spell for ${selectedSlot === 4 ? 'the Ultimate slot' : `slot ${selectedSlot + 1}`}</div>
      <div class="spellbook-grid">${cards}</div>
      <p class="muted">Slots 1–4 use toggle casting: perform their gesture or tap their button once to keep casting, then repeat it to stop. Auto-casting ends when mana is too low. Slot 5 remains a tap-only ultimate with a 35-second cooldown. Every loadout change starts a 15-second swap lock.</p>
    `);
    modalBody.querySelectorAll('.loadout-slot').forEach(btn => btn.addEventListener('click', () => showSpellLoadout(Number(btn.dataset.slot))));
    modalBody.querySelectorAll('.spellbook-card').forEach(btn => btn.addEventListener('click', () => equipSpellToSlot(btn.dataset.spell, selectedSlot)));
  }

  function showMageShop() {
    normalizeMagic(game.character);
    const unowned = SPELL_ORDER.filter(id => !game.character.knownSpells.includes(id));
    const tiers = ['Low','Medium','High'];
    showModal('Ilyra · Camp Mage', `
      <div class="vendor-banner mage-banner"><span>✦</span><div><strong>Arcane Training</strong><small>${game.character.coins} gold · ${game.character.knownSpells.length}/${SPELL_ORDER.length} spells learned</small></div></div>
      ${tiers.map(tier => {
        const ids = unowned.filter(id => SPELLS[id].tier === tier);
        if (!ids.length) return '';
        return `<div class="section-title">${tier} Magic</div><div class="spell-shop-grid">${ids.map(id => { const spell = SPELLS[id]; return `<div class="spell-shop-card element-${spell.element}"><span class="spell-rune">${spell.icon}</span><strong>${spell.name}</strong><small>${spell.element.toUpperCase()} · ${spellManaCost(id)} MP</small><p>${spell.description}</p><button class="buy-btn buy-spell" data-spell="${id}">${spell.price} gold</button></div>`; }).join('')}</div>`;
      }).join('')}
      ${unowned.length ? '' : '<p class="muted">You have learned every spell Ilyra can teach.</p>'}
      <button id="openLoadoutFromMage" class="panel-btn wide-action">Manage Spell Loadout</button>
    `);
    modalBody.querySelectorAll('.buy-spell').forEach(btn => btn.addEventListener('click', () => {
      const id = btn.dataset.spell;
      const spell = SPELLS[id];
      if (game.character.coins < spell.price) { toast('Not enough gold.'); return; }
      game.character.coins -= spell.price;
      game.character.knownSpells.push(id);
      saveGame(); toast(`${spell.name} learned.`); showMageShop();
    }));
    $('openLoadoutFromMage').addEventListener('click', () => showSpellLoadout(0));
  }

  function bagUpgradePrice() {
    return Math.round(125 * Math.pow(1.65, game.character.bagUpgrades || 0));
  }

  function showBagSmith() {
    const price = bagUpgradePrice();
    showModal('Bram · Pack Smith', `
      <div class="vendor-banner smith-banner"><span>⚒</span><div><strong>Reinforce Your Pack</strong><small>${game.character.inventory.length}/${game.character.inventoryCapacity} slots used · ${game.character.coins} gold</small></div></div>
      <div class="bag-upgrade-display"><div><small>CURRENT CAPACITY</small><strong>${game.character.inventoryCapacity}</strong></div><span>→</span><div><small>AFTER UPGRADE</small><strong>${game.character.inventoryCapacity + 5}</strong></div></div>
      <button id="buyBagUpgrade" class="expedition-primary">ADD 5 SLOTS · ${price} GOLD</button>
      <p class="muted">Each reinforcement is more expensive than the last.</p>
    `);
    $('buyBagUpgrade').addEventListener('click', () => {
      if (game.character.coins < price) { toast('Not enough gold.'); return; }
      game.character.coins -= price;
      game.character.bagUpgrades = (game.character.bagUpgrades || 0) + 1;
      game.character.inventoryCapacity += 5;
      saveGame(); toast('Your pack can carry 5 more items.'); showBagSmith();
    });
  }

  function renderPotionTray() {
    if (!potionTray || !game.character) return;
    const loadout = game.character.potionLoadout || {};
    const signature = `${game.scene}|${game.character.activePotionSlot}|${['health','mana','stamina'].map(category => `${category}:${loadout[category] || ''}:${(loadout[category] ? itemCount(loadout[category]) : 0)}`).join('|')}`;
    if (signature === game.potionTraySignature) return;
    game.potionTraySignature = signature;
    potionTray.innerHTML = ['health','mana','stamina'].map(category => {
      const id = loadout[category];
      const def = POTION_DEFS[id];
      const count = id ? itemCount(id) : 0;
      const active = game.character.activePotionSlot === category;
      return `<button class="potion-slot-btn ${category} ${active ? 'active' : ''} ${def ? '' : 'empty'}" data-slot="${category}" title="${def ? `${def.name} · ${count} carried` : `No ${category} potion assigned`}"><span class="potion-type">${POTION_SHORT[category]}</span><span class="potion-main">${def?.icon || '+'}</span><span class="potion-count">${count}</span></button>`;
    }).join('');
    potionTray.querySelectorAll('.potion-slot-btn').forEach(btn => bindImmediatePress(btn, () => {
      game.character.activePotionSlot = btn.dataset.slot;
      game.potionTraySignature = '';
      saveGame();
      renderPotionTray();
    }));
  }

  function renderSpellTray() {
    if (!spellTray || !game.character) return;
    const unlocked = spellSlotsUnlocked();
    const ultimateSeconds = Math.ceil(ultimateCooldownRemainingMs() / 1000);
    const activeSlots = ensureSpellAutoCastState().activeSlots;
    const signature = `${game.scene}|${unlocked}|${game.character.equippedSpells?.slice(0, unlocked).join(',')}|${Math.floor(game.player?.mana || 0)}|${ultimateSeconds}|${activeSlots.join(',')}`;
    if (signature === game.spellTraySignature) return;
    game.spellTraySignature = signature;
    spellTray.innerHTML = Array.from({ length: unlocked }, (_, index) => {
      const id = game.character.equippedSpells[index];
      const spell = SPELLS[id];
      const isUltimate = index === 4;
      const autoActive = !isUltimate && activeSlots[index];
      const cooldownBlocked = isUltimate && ultimateSeconds > 0;
      const invalidUltimate = isUltimate && spell && spell.tier !== 'High';
      const manaBlocked = !autoActive && game.player.mana < (spell ? spellManaCost(id) : Infinity);
      const disabled = !spell || game.scene !== 'dungeon' || manaBlocked || cooldownBlocked || invalidUltimate;
      const gesture = index === 0 ? 'L×2' : index === 1 ? 'R×2' : index === 2 ? 'L×3' : index === 3 ? 'R×3' : (ultimateSeconds > 0 ? `${ultimateSeconds}s` : 'ULT');
      const shortcut = autoActive ? 'ON' : gesture;
      const title = spell ? `${spell.name} · ${spellManaCost(id)} MP${autoActive ? ' · Auto-casting; repeat command to stop' : isUltimate ? ` · ${ultimateSeconds > 0 ? `${ultimateSeconds}s cooldown` : 'Ultimate ready'}` : ' · Toggle auto-cast'}` : 'Empty spell slot';
      return `<button class="spell-slot-btn element-${spell?.element || 'empty'} ${isUltimate ? 'ultimate-slot' : ''} ${autoActive ? 'auto-casting' : ''} ${cooldownBlocked ? 'cooling-down' : ''}" data-slot="${index}" ${disabled ? 'disabled' : ''} title="${title}"><span>${spell?.icon || '+'}</span><small>${shortcut}</small></button>`;
    }).join('');
    spellTray.querySelectorAll('.spell-slot-btn').forEach(btn => bindImmediatePress(btn, () => {
      const slotIndex = Number(btn.dataset.slot);
      if (slotIndex === 4) castEquippedSpell(slotIndex, { source: 'button' });
      else toggleSpellAutoCast(slotIndex, { source: 'button' });
    }));
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
    manaFill.style.width = `${clamp(p.mana / p.maxMana * 100, 0, 100)}%`;
    manaText.textContent = `${Math.floor(p.mana)}/${Math.round(p.maxMana)}`;
    staminaFill.classList.toggle('free', !isCombatActive());
    if (game.scene === 'camp') {
      locationText.textContent = 'Expedition Camp';
      roomText.textContent = `${game.character.coins} coins`;
    } else if (game.scene === 'overworld') {
      const zone = OVERWORLD_ZONES[game.overworldZone];
      locationText.textContent = zone?.name || 'Wilds';
      roomText.textContent = zone?.subtitle || 'Exploration zone';
    } else {
      const floor = currentFloor(); const room = currentRoom();
      locationText.textContent = `Floor ${floor.floorNumber} · ${floor.sizeName} · ${floor.xpMultiplier > 1 ? `+${Math.round((floor.xpMultiplier - 1) * 100)}% XP` : 'normal XP'}`;
      const archetype=roomArchetypeLabel(room.archetype); const modifier=room.modifier&&room.modifier!=='none'?` · ${formatName(room.modifier)}`:''; const objective=game.roomEnvironment?.runes?.length?` · ${game.roomEnvironment.runes.filter(r=>r.captured).length}/${game.roomEnvironment.runes.length} seals`:'';
      roomText.textContent = `${archetype}${modifier}${objective} · ${Object.values(floor.rooms).filter(r => r.discovered).length}/${floor.roomCount}`;
    }
    abilityBtn.textContent = game.player.abilityCooldown > 0 ? game.player.abilityCooldown.toFixed(1) : 'Skill';
    renderSpellTray();
    renderPotionTray();
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


  function sampleWorldCurve(points, stepsPerSegment = 8) {
    if (!points || points.length < 2) return points ? points.slice() : [];
    const sampled = [];
    const get = (index) => points[clamp(index, 0, points.length - 1)];
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
      for (let step = 0; step < stepsPerSegment; step++) {
        const t = step / stepsPerSegment;
        const t2 = t * t, t3 = t2 * t;
        sampled.push({
          x: .5 * ((2*p1.x) + (-p0.x+p2.x)*t + (2*p0.x-5*p1.x+4*p2.x-p3.x)*t2 + (-p0.x+3*p1.x-3*p2.x+p3.x)*t3),
          y: .5 * ((2*p1.y) + (-p0.y+p2.y)*t + (2*p0.y-5*p1.y+4*p2.y-p3.y)*t2 + (-p0.y+3*p1.y-3*p2.y+p3.y)*t3),
        });
      }
    }
    sampled.push({ ...points[points.length - 1] });
    return sampled;
  }

  function distanceToWorldPath(x, y, points) {
    let closest = Infinity;
    for (let i = 1; i < points.length; i++) {
      closest = Math.min(closest, pointToSegmentDistance(x, y, points[i-1].x, points[i-1].y, points[i].x, points[i].y));
    }
    return closest;
  }

  function drawWorldPath(points, width = 180, base = '#806848', highlight = 'rgba(176,145,91,.15)', z = 0) {
    const curve = sampleWorldCurve(points, 10);
    const projected = curve.map(point => worldToScreen(point.x, point.y, z));
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = base;
    ctx.lineWidth = width;
    ctx.beginPath();
    projected.forEach((point,index)=>index?ctx.lineTo(point.x,point.y):ctx.moveTo(point.x,point.y));
    ctx.stroke();
    ctx.strokeStyle = highlight;
    ctx.lineWidth = width * .62;
    ctx.beginPath();
    projected.forEach((point,index)=>index?ctx.lineTo(point.x,point.y):ctx.moveTo(point.x,point.y));
    ctx.stroke();
    ctx.restore();
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
    const tile = game.scene === 'dungeon' ? 100 : 140;
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
  function drawGatheringTool(feet, gathering) {
    const resource = gathering.resource;
    const targetWorld = normalize((resource.visualX ?? resource.x) - game.player.x, (resource.visualY ?? resource.y) - game.player.y);
    const facing = screenFacingVector(targetWorld);
    const hand = { x:feet.x + facing.x*8 + 12, y:feet.y - 50 + facing.y*4 };
    const pulse = gathering.actionPulse > 0 ? Math.sin((1-gathering.actionPulse)*Math.PI) : Math.sin(gathering.actionClock*3.5)*.12;
    ctx.save();
    ctx.lineCap='round';ctx.lineJoin='round';
    if (gathering.skillName === 'fishing') {
      const rodTip = { x:hand.x + facing.x*78, y:hand.y + facing.y*35 - 34 };
      ctx.strokeStyle='#6b4728';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(hand.x,hand.y);ctx.quadraticCurveTo(hand.x+facing.x*42,hand.y-28,rodTip.x,rodTip.y);ctx.stroke();
      const target = worldToScreen(resource.visualX ?? resource.x, resource.visualY ?? resource.y, 3);
      ctx.strokeStyle='rgba(226,241,237,.78)';ctx.lineWidth=1.7;ctx.beginPath();ctx.moveTo(rodTip.x,rodTip.y);ctx.quadraticCurveTo((rodTip.x+target.x)/2,target.y-35,target.x,target.y);ctx.stroke();
      ctx.fillStyle='#d65d45';ctx.beginPath();ctx.arc(target.x,target.y,4.5,0,TAU);ctx.fill();
    } else {
      const baseAngle = Math.atan2(facing.y,facing.x);
      const swing = -1.05 + pulse*1.9;
      const angle = baseAngle + swing;
      const length = gathering.skillName === 'mining' ? 70 : 76;
      const tip = {x:hand.x+Math.cos(angle)*length,y:hand.y+Math.sin(angle)*length};
      ctx.strokeStyle='#704a2b';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(hand.x,hand.y);ctx.lineTo(tip.x,tip.y);ctx.stroke();
      ctx.strokeStyle=gathering.skillName === 'mining' ? '#aeb8bf' : '#a7b0aa';ctx.lineWidth=12;ctx.beginPath();
      const side={x:-Math.sin(angle),y:Math.cos(angle)};
      ctx.moveTo(tip.x-side.x*15,tip.y-side.y*15);ctx.lineTo(tip.x+side.x*15,tip.y+side.y*15);ctx.stroke();
      if (gathering.skillName === 'woodcutting') {
        ctx.strokeStyle='#d7dedd';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(tip.x-side.x*16,tip.y-side.y*16);ctx.lineTo(tip.x+side.x*16,tip.y+side.y*16);ctx.stroke();
      }
    }
    ctx.restore();
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
      if (game.gathering) { drawGatheringTool(feet, game.gathering); return; }
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

    // Arcane Fire Strike projects a separate flame crescent beyond the physical blade.
    if (getAscensionBonuses().arcaneFireStrike > 0) {
      const flameInner = outerReach * .78;
      const flameOuter = outerReach * 1.38;
      const flameWidth = Math.min(.64, halfWidth + .18);
      const flameGradient = ctx.createRadialGradient(
        projected(flameInner, angle).x, projected(flameInner, angle).y, 2,
        projected(flameOuter, angle).x, projected(flameOuter, angle).y, Math.max(28, flameOuter * .18)
      );
      flameGradient.addColorStop(0, 'rgba(255,215,92,.10)');
      flameGradient.addColorStop(.55, 'rgba(255,105,32,.56)');
      flameGradient.addColorStop(1, 'rgba(164,28,16,.14)');
      ctx.globalAlpha = (behind ? .42 : .82) * (.35 + life * .65);
      ctx.fillStyle = flameGradient;
      ctx.strokeStyle = 'rgba(255,139,52,.9)';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        const theta = angle - flameWidth + flameWidth * 2 * i / segments;
        const point = projected(flameOuter, theta, 38);
        if (i === 0) ctx.moveTo(point.x, point.y); else ctx.lineTo(point.x, point.y);
      }
      for (let i = segments; i >= 0; i--) {
        const theta = angle - flameWidth + flameWidth * 2 * i / segments;
        const waviness = 1 + Math.sin(i * 2.1 + progress * 14) * .035;
        const point = projected(flameInner * waviness, theta, 36);
        ctx.lineTo(point.x, point.y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
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
  function drawIsoSpellEffects() {
    const now = performance.now();
    for (const effect of game.spellEffects) {
      if (effect.type === 'meteor') {
        const progress = 1 - clamp(effect.time / effect.duration, 0, 1);
        const pulse = 1 + Math.sin(now / 85) * .06;
        drawIsoGroundEllipse(effect.x, effect.y, 205 * pulse, 205 * pulse, 'rgba(255,70,35,.10)', 'rgba(255,145,55,.86)', 6);
        const point = worldToScreen(effect.x, effect.y, 92 + (1 - progress) * 290);
        const trailTop = { x: point.x - 58, y: point.y - 118 };
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const trail = ctx.createLinearGradient(trailTop.x, trailTop.y, point.x, point.y);
        trail.addColorStop(0, 'rgba(187,37,16,0)');
        trail.addColorStop(.28, 'rgba(255,116,36,.18)');
        trail.addColorStop(1, 'rgba(255,226,136,.82)');
        ctx.strokeStyle = trail;
        ctx.lineWidth = 18 + progress * 6;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(trailTop.x, trailTop.y); ctx.lineTo(point.x, point.y); ctx.stroke();
        ctx.restore();
        drawFlameSpriteScreen(point.x, point.y + 4, 18 + progress * 10, 44 + progress * 18, { phase: effect.x * .015 + effect.y * .009, alpha: .92, sway: 2.2 });
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = '#fff0af'; ctx.shadowColor = '#ff7738'; ctx.shadowBlur = 24;
        ctx.beginPath(); ctx.arc(point.x, point.y, 7 + progress * 8, 0, TAU); ctx.fill();
        ctx.restore();
      } else if (effect.type === 'flameWave') {
        const progress = 1 - clamp(effect.time / effect.duration, 0, 1);
        const fade = 1 - progress;
        const points = [{ x: effect.x, y: effect.y }];
        for (let i = 0; i <= 14; i++) {
          const a = effect.angle - effect.arc / 2 + effect.arc * (i / 14);
          points.push({ x: effect.x + Math.cos(a) * effect.range, y: effect.y + Math.sin(a) * effect.range });
        }
        const projected = points.map(point => worldToScreen(point.x, point.y, 4));
        ctx.save();
        ctx.globalAlpha = fade * .78;
        ctx.fillStyle = 'rgba(255,112,46,.20)';
        ctx.strokeStyle = 'rgba(255,175,90,.72)';
        ctx.lineWidth = 4;
        ctx.beginPath(); projected.forEach((point, i) => i ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.restore();
        for (let i = 0; i < 7; i++) {
          const lane = .28 + i * .11;
          const a = effect.angle - effect.arc * .42 + effect.arc * .84 * (i / 6);
          const px = effect.x + Math.cos(a) * effect.range * lane;
          const py = effect.y + Math.sin(a) * effect.range * lane;
          const flame = worldToScreen(px, py, 12);
          drawFlameSpriteScreen(flame.x, flame.y, 10 + i % 3 * 3, 24 + i % 2 * 8, { phase: i * .77 + effect.angle, alpha: .58 * fade });
        }
      } else if (effect.type === 'fireBurst') {
        const progress = 1 - clamp(effect.time / effect.duration, 0, 1);
        const alpha = 1 - progress;
        drawIsoGroundEllipse(effect.x, effect.y, effect.radius * (0.42 + progress * .72), effect.radius * (0.38 + progress * .65), `rgba(255,118,46,${(.16 * alpha).toFixed(3)})`, `rgba(255,183,91,${(.58 * alpha).toFixed(3)})`, 4);
        const count = 8;
        for (let i = 0; i < count; i++) {
          const a = i * TAU / count;
          const r = effect.radius * (.16 + progress * .44);
          const flame = worldToScreen(effect.x + Math.cos(a) * r, effect.y + Math.sin(a) * r, 16 + progress * 12);
          drawFlameSpriteScreen(flame.x, flame.y + 2, 10 + (i % 3) * 2, 26 + (i % 2) * 10, { phase: i * .63 + progress * 4, alpha: .7 * alpha });
        }
        drawAnimatedFirePatch(effect.x, effect.y, effect.radius * .62, { intensity: 1.04 });
      }
    }
    const p = game.player;
    if (!p) return;
    if (p.barrierTimer > 0) {
      const pulse = 1 + Math.sin(performance.now() / 120) * .035;
      drawIsoGroundEllipse(p.x, p.y, ARCANE_BARRIER_RADIUS * pulse, ARCANE_BARRIER_RADIUS * pulse, 'rgba(154,120,255,.055)', 'rgba(190,160,255,.72)', 5, 12);
    }
    if (p.silenceTimer > 0) drawIsoGroundEllipse(p.x, p.y, 470, 470, 'rgba(129,83,170,.025)', 'rgba(214,181,255,.25)', 3);
  }

  function drawProjectedPolygon(points, fill, stroke = null, lineWidth = 2, alpha = 1) {
    const projected=points.map(point=>worldToScreen(point.x,point.y,point.z||0));
    ctx.save();ctx.globalAlpha=alpha;ctx.beginPath();projected.forEach((point,index)=>index?ctx.lineTo(point.x,point.y):ctx.moveTo(point.x,point.y));ctx.closePath();
    if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lineWidth;ctx.stroke();}ctx.restore();
  }

  function drawWorldLine3D(a, b, color = '#201713', width = 3) {
    const pa = worldToScreen(a.x, a.y, a.z || 0);
    const pb = worldToScreen(b.x, b.y, b.z || 0);
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(Math.round(pa.x), Math.round(pa.y));
    ctx.lineTo(Math.round(pb.x), Math.round(pb.y));
    ctx.stroke();
    ctx.restore();
  }

  function drawCurrentRipples(zone) {
    const flowX = Number(zone.currentX) || 0;
    const flowY = Number(zone.currentY) || 0;
    if (!flowX && !flowY) return;
    const dir = normalize(flowX, flowY);
    if (!dir.x && !dir.y) return;
    const perp = { x: -dir.y, y: dir.x };
    const along = zone.shape === 'circle' ? Math.max(44, zone.radius * .28) : 86;
    const acrossStep = zone.shape === 'circle' ? Math.max(24, zone.radius * .26) : 74;
    const depth = 6;
    const drift = (performance.now() / 24) % acrossStep;
    ctx.save();
    ctx.strokeStyle = 'rgba(221,241,247,.28)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    const drawMark = (cx, cy) => {
      const a = worldToScreen(cx - dir.x * along, cy - dir.y * along, depth);
      const b = worldToScreen(cx + dir.x * along, cy + dir.y * along, depth);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      const tip = worldToScreen(cx + dir.x * (along + 8), cy + dir.y * (along + 8), depth);
      const left = worldToScreen(cx + dir.x * (along - 8) + perp.x * 8, cy + dir.y * (along - 8) + perp.y * 8, depth);
      const right = worldToScreen(cx + dir.x * (along - 8) - perp.x * 8, cy + dir.y * (along - 8) - perp.y * 8, depth);
      ctx.beginPath();
      ctx.moveTo(left.x, left.y);
      ctx.lineTo(tip.x, tip.y);
      ctx.lineTo(right.x, right.y);
      ctx.stroke();
    };
    if (zone.shape === 'rect') {
      for (let offset = -3; offset <= 3; offset++) {
        const cx = (zone.x1 + zone.x2) / 2 + perp.x * (offset * acrossStep + drift - acrossStep * .5);
        const cy = (zone.y1 + zone.y2) / 2 + perp.y * (offset * acrossStep + drift - acrossStep * .5);
        if (cx < zone.x1 + 24 || cx > zone.x2 - 24 || cy < zone.y1 + 24 || cy > zone.y2 - 24) continue;
        drawMark(cx, cy);
      }
    } else {
      for (let offset = -2; offset <= 2; offset++) {
        const cx = zone.x + perp.x * (offset * acrossStep + drift * .5 - acrossStep * .25);
        const cy = zone.y + perp.y * (offset * acrossStep + drift * .5 - acrossStep * .25);
        if (dist(cx, cy, zone.x, zone.y) > zone.radius * .72) continue;
        drawMark(cx, cy);
      }
    }
    ctx.restore();
  }

  function drawDungeonEnvironmentGround() {
    const env=game.roomEnvironment;if(!env)return;
    for(const zone of env.zones){
      if(zone.type==='warmth'){
        drawIsoGroundEllipse(zone.x,zone.y,zone.radius,zone.radius,'rgba(236,158,68,.07)','rgba(240,177,83,.22)',2);continue;
      }
      const palette={
        pit:['#050607','#343238'],lava:['rgba(192,54,22,.70)','#ff7a32'],fire:['rgba(180,55,25,.42)','#f18a43'],
        water:['rgba(41,92,112,.46)','#5e9eb4'],deepWater:['rgba(24,61,84,.68)','#4d829d'],poison:['rgba(58,104,48,.48)','#79c45e'],
        corruption:['rgba(46,24,58,.58)','#9b63ad'],ice:['rgba(112,171,190,.24)','#b8e6ef'],iceBridge:['rgba(137,201,218,.58)','#d4f2f7'],sand:['rgba(132,105,62,.38)','#b99a62'],
        quicksand:['rgba(100,72,37,.65)','#c29d5f'],safeStone:['rgba(91,89,82,.9)','#c3bca8'],
        web:['rgba(205,219,224,.16)','#d8e6e9'],timeSlow:['rgba(89,76,155,.28)','#9d91d9'],timeHaste:['rgba(194,154,74,.25)','#ead080'],
        gravityCore:['rgba(25,12,38,.66)','#9876cc'],healing:['rgba(70,139,84,.18)','#8cdda1'],wind:['rgba(130,190,208,.08)','#a9d9e4']
      }[zone.type]||['rgba(255,255,255,.06)','rgba(255,255,255,.15)'];
      if(zone.shape==='circle'){
        drawIsoGroundEllipse(zone.x,zone.y,zone.radius,zone.radius,palette[0],palette[1],zone.type==='pit'?7:3);
        if(zone.type==='lava'||zone.type==='fire'){
          drawAnimatedFirePatch(zone.x, zone.y, zone.radius * .92, { intensity: zone.type === 'lava' ? 1.18 : .96 });
        }
        if(zone.currentX||zone.currentY) drawCurrentRipples(zone);
      }else{
        drawProjectedPolygon([{x:zone.x1,y:zone.y1},{x:zone.x2,y:zone.y1},{x:zone.x2,y:zone.y2},{x:zone.x1,y:zone.y2}],palette[0],palette[1],zone.type==='pit'?7:3);
        if(zone.currentX||zone.currentY) drawCurrentRipples(zone);
      }
    }
  }

  function drawEnvironmentObstacle(obstacle) {
    if(obstacle.nonBlocking&&obstacle.kind!=='brazier')return;
    if(obstacle.shape==='rect'){
      const points=[{x:obstacle.x1,y:obstacle.y1},{x:obstacle.x2,y:obstacle.y1},{x:obstacle.x2,y:obstacle.y2},{x:obstacle.x1,y:obstacle.y2}];
      drawProjectedPolygon(points,obstacle.kind==='vaultWall'?'#65543e':'#4d4944','#827a70',3);
      const top=points.map(p=>({...p,z:42}));drawProjectedPolygon(top,obstacle.kind==='vaultWall'?'#806a4d':'#625d56','#91887e',2);
      return;
    }
    const p=worldToScreen(obstacle.x,obstacle.y,0);drawIsoShadow(obstacle.x,obstacle.y,obstacle.radius+12,13,.34);ctx.save();
    if(obstacle.kind==='brazier'){
      ctx.fillStyle='#625143';ctx.fillRect(p.x-22,p.y-30,44,28);
      ctx.fillStyle='#45352b';ctx.fillRect(p.x-18,p.y-36,36,8);
      drawAnimatedFireClusterWorld(obstacle.x, obstacle.y - 4, { flames: 4, scale: .74, spreadX: 10, spreadY: 6, glowRadius: 48, baseZ: 8, alpha: .88 });
    }else if(obstacle.kind==='crystal'||obstacle.kind==='icePillar'){
      ctx.fillStyle=obstacle.kind==='crystal'?'#765f9e':'#8ac0ce';ctx.strokeStyle='#c4d9df';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(p.x,p.y-112);ctx.lineTo(p.x+obstacle.radius*.62,p.y-18);ctx.lineTo(p.x,p.y);ctx.lineTo(p.x-obstacle.radius*.62,p.y-18);ctx.closePath();ctx.fill();ctx.stroke();
    }else if(obstacle.kind==='gearPillar'){
      ctx.fillStyle='#514c45';ctx.beginPath();ctx.arc(p.x,p.y-48,obstacle.radius*.7,0,TAU);ctx.fill();ctx.strokeStyle='#9a8d77';ctx.lineWidth=6;ctx.stroke();ctx.fillStyle='#242323';ctx.beginPath();ctx.arc(p.x,p.y-48,obstacle.radius*.25,0,TAU);ctx.fill();
    }else{
      ctx.fillStyle='#56514c';ctx.strokeStyle='#777069';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(p.x-obstacle.radius*.62,p.y);ctx.lineTo(p.x-obstacle.radius*.5,p.y-96);ctx.lineTo(p.x+obstacle.radius*.38,p.y-112);ctx.lineTo(p.x+obstacle.radius*.65,p.y);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(p.x-obstacle.radius*.32,p.y-91,obstacle.radius*.35,70);
    }
    ctx.restore();
  }

  function drawEnvironmentTrap(trap) {
    const env=game.roomEnvironment;const active=trapActive(trap,env?.roomTime||0);ctx.save();
    if(trap.type==='spikes'){
      drawIsoGroundEllipse(trap.x,trap.y,trap.radius,trap.radius,active?'rgba(132,35,35,.28)':'rgba(82,80,76,.18)',active?'#c9574d':'#77736b',2);
      const p=worldToScreen(trap.x,trap.y,0);ctx.fillStyle=active?'#d0cbc0':'#625e59';for(let i=0;i<7;i++){const a=i*TAU/7,rx=Math.cos(a)*trap.radius*.45,ry=Math.sin(a)*trap.radius*.18;ctx.beginPath();ctx.moveTo(p.x+rx-4,p.y+ry);ctx.lineTo(p.x+rx,p.y+ry-(active?28:8));ctx.lineTo(p.x+rx+4,p.y+ry);ctx.fill();}
    }else if(trap.type==='flamejet'){
      drawIsoGroundEllipse(trap.x,trap.y,trap.radius,trap.radius,active?'rgba(200,68,25,.26)':'rgba(72,64,55,.18)',active?'#f0783d':'#6e675d',3);
      if(active) drawAnimatedFireClusterWorld(trap.x, trap.y, { flames: 4, scale: 1.06, spreadX: 10, spreadY: 8, glowRadius: 54, baseZ: 16, alpha: .95 });
    }else if(trap.type==='blade'){
      const a={x:trap.x-Math.cos(trap.angle)*trap.length,y:trap.y-Math.sin(trap.angle)*trap.length};const b={x:trap.x+Math.cos(trap.angle)*trap.length,y:trap.y+Math.sin(trap.angle)*trap.length};const pa=worldToScreen(a.x,a.y,24),pb=worldToScreen(b.x,b.y,24),pc=worldToScreen(trap.x,trap.y,26);ctx.strokeStyle='#b2aaa0';ctx.lineWidth=15;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(pa.x,pa.y);ctx.lineTo(pb.x,pb.y);ctx.stroke();ctx.fillStyle='#4a4540';ctx.beginPath();ctx.arc(pc.x,pc.y,23,0,TAU);ctx.fill();ctx.strokeStyle='#d4c8b4';ctx.lineWidth=4;ctx.stroke();
    }else if(trap.type==='boulder'){
      const p=worldToScreen(trap.x,trap.y,trap.radius*.45);drawIsoShadow(trap.x,trap.y,trap.radius,13,.3);ctx.fillStyle='#69645d';ctx.strokeStyle='#918980';ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,trap.radius*.65,0,TAU);ctx.fill();ctx.stroke();
    }else if(trap.type==='collapse'){
      const color=trap.state==='pit'?'#050607':trap.state==='warning'?'rgba(150,82,48,.48)':'rgba(84,79,72,.16)';const stroke=trap.state==='pit'?'#353238':trap.state==='warning'?'#e29154':'#6d6962';drawProjectedPolygon([{x:trap.x1,y:trap.y1},{x:trap.x2,y:trap.y1},{x:trap.x2,y:trap.y2},{x:trap.x1,y:trap.y2}],color,stroke,trap.state==='warning'?5:2);
    }
    ctx.restore();
  }

  function drawEnvironmentRune(rune) {
    const color=rune.kind==='portal'?'#9b69da':'#ddb85d';const pulse=1+Math.sin(performance.now()/200+rune.index)*.04;drawIsoGroundEllipse(rune.x,rune.y,rune.radius*pulse,rune.radius*pulse,rune.captured?`${color}2a`:`${color}10`,rune.captured?'#aee7b2':color,4);
    const p=worldToScreen(rune.x,rune.y,10);ctx.save();ctx.strokeStyle=rune.captured?'#b8efbd':color;ctx.lineWidth=6;ctx.beginPath();ctx.arc(p.x,p.y,31,-Math.PI/2,-Math.PI/2+TAU*rune.progress);ctx.stroke();ctx.fillStyle=rune.captured?'#b8efbd':'#f0d99e';ctx.font='bold 18px sans-serif';ctx.textAlign='center';ctx.fillText(rune.kind==='portal'?'◇':'✦',p.x,p.y+6);ctx.restore();
  }

  function drawDungeonDarkness() {
    const env=game.roomEnvironment;if(!env?.darkness)return;const source=env.safeZone||game.player;if(!source)return;
    const p=worldToScreen(source.x,source.y,0);
    const radius=Math.max(220,(source.radius||env.darknessRadius||420)*.96);
    ctx.save();
    const halo=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,radius*.9);
    halo.addColorStop(0,'rgba(252,246,214,.24)');
    halo.addColorStop(.34,'rgba(244,233,183,.10)');
    halo.addColorStop(1,'rgba(244,233,183,0)');
    ctx.fillStyle=halo;
    ctx.beginPath();
    ctx.arc(p.x,p.y,radius*.92,0,TAU);
    ctx.fill();
    const gradient=ctx.createRadialGradient(p.x,p.y,radius*.42,p.x,p.y,radius*1.62);
    gradient.addColorStop(0,'rgba(0,0,0,0)');
    gradient.addColorStop(.45,'rgba(0,0,0,.04)');
    gradient.addColorStop(.68,'rgba(0,0,0,.30)');
    gradient.addColorStop(1,'rgba(0,0,0,.88)');
    ctx.fillStyle=gradient;ctx.fillRect(0,0,window.innerWidth,window.innerHeight);
    ctx.restore();
  }

  function drawIsoAreaEffects() {
    const now = performance.now();
    for (const effect of game.areaEffects) {
      const progress = clamp(1 - effect.time / Math.max(0.001, effect.duration), 0, 1);
      if (effect.type === 'blast') {
        const color = effect.element === 'fire' ? '#ff7047' : effect.element === 'poison' ? '#73d65f' : effect.element === 'web' ? '#c7d8df' : '#e3c36f';
        const pulse = 0.88 + Math.sin(now / 85) * 0.07;
        drawIsoGroundEllipse(effect.x, effect.y, effect.radius * pulse, effect.radius * pulse, `${color}22`, color, 5);
        drawIsoGroundEllipse(effect.x, effect.y, effect.radius * progress, effect.radius * progress, `${color}16`, color, 2);
      } else if (effect.type === 'hazard') {
        const color = effect.element === 'fire' ? '#f06c39' : effect.element === 'poison' ? '#69b956' : '#c7d8df';
        drawIsoGroundEllipse(effect.x, effect.y, effect.radius, effect.radius, `${color}38`, `${color}aa`, 3);
        const center = worldToScreen(effect.x, effect.y, effect.element === 'fire' ? 10 : 2);
        ctx.save(); ctx.globalAlpha = 0.6;
        if (effect.element === 'fire') {
          ctx.restore();
          drawAnimatedFirePatch(effect.x, effect.y, effect.radius * .96, { intensity: 1.02 });
          continue;
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
    const screenPoint = worldToScreen(p.x, p.y, 20);
    if (!screenPointVisible(screenPoint, 100)) return;
    const spellElement = SPELLS[p.sourceSpell]?.element || null;
    const element = p.element || spellElement || null;
    if (element === 'fire' || p.sourceSpell === 'fireball' || p.sourceSpell === 'meteor') {
      drawFireProjectile(p);
      return;
    }
    if (element === 'ice') {
      drawIceProjectile(p);
      return;
    }
    if (element === 'water' || p.sourceSpell === 'tidalSurge') {
      drawWaterProjectile(p);
      return;
    }
    if (p.damageType === 'physical') {
      drawPhysicalProjectile(p);
      return;
    }
    if (p.damageType === 'magic' || spellElement === 'arcane') {
      drawArcaneProjectile(p);
      return;
    }
    drawDefaultProjectile(p);
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
    } else if (f.type === 'brazier') {
      ctx.fillStyle='#665447'; ctx.fillRect(p.x-26,p.y-28,52,28); ctx.strokeStyle='#9a846f'; ctx.lineWidth=3; ctx.strokeRect(p.x-26,p.y-28,52,28);
      ctx.fillStyle='#f28a3f'; ctx.beginPath(); ctx.moveTo(p.x,p.y-88); ctx.quadraticCurveTo(p.x+30,p.y-45,p.x,p.y-18); ctx.quadraticCurveTo(p.x-26,p.y-48,p.x,p.y-88); ctx.fill();
      ctx.fillStyle='#ffd36b'; ctx.beginPath(); ctx.moveTo(p.x,p.y-67); ctx.quadraticCurveTo(p.x+15,p.y-42,p.x,p.y-25); ctx.quadraticCurveTo(p.x-12,p.y-43,p.x,p.y-67); ctx.fill();
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
    if (npc.serviceType) {
      ctx.fillStyle = npc.serviceType === 'mage' ? '#c7a8ff' : '#e4b66d';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText(npc.role.toUpperCase(), p.x, feetY - 126);
    }
    if (npc.locked && !npc.serviceType) { ctx.fillStyle = '#f4d45e'; ctx.font = 'bold 18px sans-serif'; ctx.fillText('!', p.x, feetY - 131); }
    if (npc.departing) { ctx.fillStyle = '#cfe4b0'; ctx.font = 'bold 9px sans-serif'; ctx.fillText('LEAVING CAMP', p.x, feetY - 141); }
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

  function drawNextGenIsoTent(obj) {
    const x = obj.x, y = obj.y;
    const cloth = obj.color || '#8f5d3f';
    const clothDark = '#4b2d28';
    const clothShade = '#6a3e31';
    const canvasLight = '#ceb082';
    const canvasMid = '#b18e67';
    const canvasDark = '#836245';
    const wood = '#5c3a24';
    const woodDark = '#2c1b14';
    const woodLight = '#a26d3b';
    const metal = '#716b63';
    const gold = '#c99b4a';
    const outline = '#201713';

    // Bigger footprint and headroom so the tent reads as a walk-in pavilion,
    // while still using the exact game projection and draw-order rules.
    const frontY = 136;
    const backY = -122;
    const eaveHalf = 176;
    const ridgeHalf = 118;
    const eaveZ = 82;
    const ridgeZ = 186;
    const poleCapZ = 98;

    const point = (dx, dy, z = 0) => ({ x: x + dx, y: y + dy, z });
    const wPoint = (wx, wy, z = 0) => ({ x: wx, y: wy, z });
    const foot = {
      backL: point(-156, backY), backR: point(156, backY),
      frontR: point(156, frontY), frontL: point(-156, frontY),
      ridgeL: point(-ridgeHalf, 0, ridgeZ), ridgeR: point(ridgeHalf, 0, ridgeZ),
      backEL: point(-eaveHalf, backY, eaveZ), backER: point(eaveHalf, backY, eaveZ),
      frontER: point(eaveHalf, frontY, eaveZ), frontEL: point(-eaveHalf, frontY, eaveZ),
    };

    const roofPoint = (side, u, v) => {
      const targetY = side === 'front' ? frontY : backY;
      const halfWidth = lerp(ridgeHalf, eaveHalf, v);
      return point(u * halfWidth, lerp(0, targetY, v), lerp(ridgeZ, eaveZ, v));
    };

    const poly = (points, fill, stroke = outline, width = 3) => drawProjectedPolygon(points, fill, stroke, width);
    const line3 = (a, b, color = outline, width = 3) => {
      const pa = worldToScreen(a.x, a.y, a.z || 0);
      const pb = worldToScreen(b.x, b.y, b.z || 0);
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(Math.round(pa.x), Math.round(pa.y));
      ctx.lineTo(Math.round(pb.x), Math.round(pb.y));
      ctx.stroke();
      ctx.restore();
    };

    const postSegment = (px, py, z0, z1, r = 8, cap = true) => {
      const base = worldToScreen(px, py, z0);
      const top = worldToScreen(px, py, z1);
      ctx.save();
      ctx.lineCap = 'butt';
      ctx.strokeStyle = outline;
      ctx.lineWidth = r + 5;
      ctx.beginPath();
      ctx.moveTo(base.x, base.y);
      ctx.lineTo(top.x, top.y);
      ctx.stroke();
      ctx.strokeStyle = wood;
      ctx.lineWidth = r;
      ctx.beginPath();
      ctx.moveTo(base.x, base.y);
      ctx.lineTo(top.x, top.y);
      ctx.stroke();
      ctx.strokeStyle = woodLight;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(base.x - 2, base.y);
      ctx.lineTo(top.x - 2, top.y);
      ctx.stroke();
      if (cap) {
        ctx.fillStyle = metal;
        ctx.fillRect(Math.round(top.x - r * .65), Math.round(top.y - 3), Math.round(r * 1.3), 6);
      }
      ctx.restore();
    };

    const lantern = (px, py, z = 60) => {
      const p = worldToScreen(px, py, z);
      ctx.save();
      ctx.shadowColor = '#ffb33c';
      ctx.shadowBlur = 14;
      ctx.fillStyle = 'rgba(255,167,52,.24)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 21, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = outline;
      ctx.fillRect(p.x - 7, p.y - 13, 14, 22);
      ctx.fillStyle = '#ffcf68';
      ctx.fillRect(p.x - 4, p.y - 9, 8, 14);
      ctx.fillStyle = '#fff1aa';
      ctx.fillRect(p.x - 2, p.y - 7, 3, 9);
      ctx.strokeStyle = gold;
      ctx.lineWidth = 2;
      ctx.strokeRect(p.x - 7, p.y - 13, 14, 22);
      ctx.beginPath();
      ctx.arc(p.x, p.y - 14, 7, Math.PI, 0);
      ctx.stroke();
      ctx.restore();
    };

    const crate = (px, py, z = 0, w = 26, d = 18, h = 24) => {
      const frontL = wPoint(px - w, py + d, z);
      const frontR = wPoint(px + w, py + d, z);
      const backR = wPoint(px + w, py - d, z);
      const backL = wPoint(px - w, py - d, z);
      const frontLt = wPoint(px - w, py + d, z + h);
      const frontRt = wPoint(px + w, py + d, z + h);
      const backRt = wPoint(px + w, py - d, z + h);
      const backLt = wPoint(px - w, py - d, z + h);
      poly([backLt, backRt, frontRt, frontLt], '#9a6c40', outline, 3);
      poly([frontL, frontR, frontRt, frontLt], '#7b5130', outline, 3);
      poly([frontR, backR, backRt, frontRt], '#654127', outline, 3);
      line3(backLt, frontRt, '#c99556', 2);
      line3(backRt, frontLt, '#c99556', 2);
      line3(frontL, frontR, '#b47a42', 2);
      line3(frontLt, frontRt, '#d8aa66', 2);
      line3(frontR, backR, '#80512d', 2);
    };

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    drawIsoShadow(x, y + 8, 192, 60, .42);
    drawIsoGroundEllipse(x + 6, y + 18, 208, 146, 'rgba(66,45,30,.23)', 'rgba(202,157,87,.15)', 2);

    // Footprint / porch.
    poly([point(-188, 118, 3), point(182, 118, 3), point(182, 160, 3), point(-188, 160, 3)], '#765236', outline, 3);
    for (let i = -5; i <= 5; i++) line3(point(i * 34, 121, 5), point(i * 34, 157, 5), i % 2 ? '#98704a' : '#4e3424', 2);
    poly([point(-88, 70, 4), point(84, 70, 4), point(84, 126, 4), point(-88, 126, 4)], '#71372f', '#c68554', 3);
    for (let i = 0; i < 6; i++) line3(point(-72 + i * 30, 78, 6), point(-72 + i * 30, 116, 6), 'rgba(231,171,94,.35)', 2);

    // Rear ropes stay behind everything structural.
    line3(point(eaveHalf, backY, 84), point(228, -166, 0), '#5d412c', 3);

    // Back and side wall planes.
    poly([foot.backL, foot.backR, foot.backER, foot.backEL], canvasDark, outline, 4);
    poly([foot.backL, foot.frontL, foot.frontEL, foot.backEL], canvasMid, outline, 4);
    poly([foot.backR, foot.frontR, foot.frontER, foot.backER], '#96704f', outline, 4);

    // Fill the visible right-side roof/gable canvas so there is no uncanny open gap.
    poly([foot.ridgeR, foot.frontER, foot.backER], '#8e6b4b', outline, 4);

    // Entrance interior first, then framing and curtains in front.
    const doorHalf = 40;
    const doorTopLeft = point(-22, frontY + 1, 96);
    const doorTopRight = point(22, frontY + 1, 96);
    poly([point(-doorHalf, frontY + 1, 7), point(doorHalf, frontY + 1, 7), doorTopRight, doorTopLeft], '#161210', '#090807', 3);
    poly([foot.frontL, point(-doorHalf - 18, frontY, 0), point(-doorHalf - 18, frontY, eaveZ), foot.frontEL], '#9d7b59', outline, 4);
    poly([point(doorHalf + 18, frontY, 0), foot.frontR, foot.frontER, point(doorHalf + 18, frontY, eaveZ)], '#886548', outline, 4);

    // Rear fascia must remain visually behind the roof planes.
    poly([point(-eaveHalf, backY, 70), point(eaveHalf, backY, 70), point(eaveHalf, backY, 54), point(-eaveHalf, backY, 54)], clothDark, outline, 3);

    // Roof planes, shared ridge.
    poly([foot.ridgeL, foot.backEL, foot.backER, foot.ridgeR], canvasMid, outline, 4);
    poly([foot.ridgeL, foot.ridgeR, foot.frontER, foot.frontEL], canvasLight, outline, 4);

    // Front-side decorative roof ribs and seams.
    for (const u of [-.76, -.44, -.12, .22, .56, .82]) {
      line3(roofPoint('front', u, .02), roofPoint('front', u, .98), u === .22 ? '#61452f' : 'rgba(89,58,37,.74)', u === .22 ? 4 : 2);
    }
    for (const u of [-.56, -.12, .30, .68]) {
      line3(roofPoint('front', u, .28), roofPoint('front', u, .86), 'rgba(237,204,145,.30)', 2);
    }
    for (const u of [-.64, -.18, .28, .74]) {
      line3(roofPoint('back', u, .06), roofPoint('back', u, .94), 'rgba(78,49,34,.46)', 2);
    }

    // Stitched repair patch.
    poly([
      roofPoint('front', .12, .28), roofPoint('front', .42, .34),
      roofPoint('front', .38, .57), roofPoint('front', .08, .51),
    ], '#b28c61', '#6e5037', 2);
    const patchWorld = roofPoint('front', .24, .42);
    const patch = worldToScreen(patchWorld.x, patchWorld.y, patchWorld.z);
    ctx.fillStyle = 'rgba(255,224,164,.22)';
    for (let i = 0; i < 5; i++) ctx.fillRect(Math.round(patch.x + i * 4), Math.round(patch.y + (i % 2) * 3), 3, 3);

    // Front fascia. The readable shop sign is drawn later on top so curtains do not eat the text.
    poly([point(-eaveHalf, frontY, 70), point(eaveHalf, frontY, 70), point(eaveHalf, frontY, 50), point(-eaveHalf, frontY, 50)], cloth, outline, 3);

    // Rear supports: only the one that would plausibly peek above the roof remains visible.
    // The far rear-left support is fully occluded by the roof from this camera angle and is omitted.
    postSegment(x + eaveHalf, y + backY, eaveZ, poleCapZ, 8, true);
    postSegment(x - ridgeHalf, y, ridgeZ, 202, 9, true);

    // Tied-back front curtains create a real walk-in entrance.
    poly([point(-doorHalf - 2, frontY + 1, eaveZ), point(-6, frontY + 1, 54), point(-28, frontY + 1, 8)], clothShade, outline, 3);
    poly([point(doorHalf + 2, frontY + 1, eaveZ), point(28, frontY + 1, 8), point(6, frontY + 1, 54)], clothDark, outline, 3);
    line3(point(-34, frontY + 2, 32), point(-16, frontY + 2, 30), gold, 3);
    line3(point(34, frontY + 2, 32), point(16, frontY + 2, 30), gold, 3);

    // Front posts and guy ropes.
    postSegment(x - eaveHalf, y + frontY, 0, 96, 9, true);
    postSegment(x + eaveHalf, y + frontY, 0, 96, 9, true);
    line3(point(-eaveHalf, frontY, 78), point(-230, 188, 0), '#7b5636', 3);
    line3(point(eaveHalf, frontY, 78), point(230, 188, 0), '#7b5636', 3);

    // Lanterns.
    lantern(x - 108, y + 129, 63);
    lantern(x + 122, y + 128, 57);

    // Clear front signboard drawn over the entrance dressing so the label always reads.
    line3(point(-58, frontY, 74), point(-48, 126, 62), '#c8a15f', 2);
    line3(point(58, frontY, 74), point(48, 126, 62), '#c8a15f', 2);
    poly([point(-66, 122, 64), point(66, 122, 64), point(58, 122, 44), point(-58, 122, 44)], '#6d4630', outline, 3);
    const sign = worldToScreen(x, y + 122, 54);
    ctx.save();
    ctx.fillStyle = '#f3dfad';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(obj.label || 'SUPPLIES', Math.round(sign.x), Math.round(sign.y));
    ctx.fillStyle = gold;
    for (let i = -2; i <= 2; i++) ctx.fillRect(Math.round(sign.x + i * 12 - 2), Math.round(sign.y + 10 + (i % 2)), 4, 3);
    ctx.restore();

    // Side cargo / roll.
    crate(x + 194, y + 111, 5, 24, 16, 24);
    crate(x + 160, y + 153, 5, 20, 14, 20);
    // Wrapped supply bundle: a proper 2.5D object instead of a flat sign-like rectangle.
    poly([
      wPoint(x - 226, y + 132, 44), wPoint(x - 170, y + 132, 44),
      wPoint(x - 160, y + 102, 44), wPoint(x - 216, y + 102, 44)
    ], '#5d7b5a', outline, 3);
    poly([
      wPoint(x - 226, y + 132, 18), wPoint(x - 170, y + 132, 18),
      wPoint(x - 170, y + 132, 44), wPoint(x - 226, y + 132, 44)
    ], '#476348', outline, 3);
    poly([
      wPoint(x - 170, y + 132, 18), wPoint(x - 160, y + 102, 18),
      wPoint(x - 160, y + 102, 44), wPoint(x - 170, y + 132, 44)
    ], '#39503a', outline, 3);
    line3(wPoint(x - 205, y + 132, 20), wPoint(x - 197, y + 102, 46), '#c8a15f', 3);
    line3(wPoint(x - 187, y + 132, 20), wPoint(x - 179, y + 102, 46), '#c8a15f', 3);
    line3(wPoint(x - 226, y + 117, 45), wPoint(x - 170, y + 117, 45), 'rgba(255,240,190,.16)', 2);

    // Flag mast from ridge only.
    postSegment(x + ridgeHalf, y, ridgeZ, 226, 6, true);
    poly([point(ridgeHalf, 0, 218), point(170, 8, 206), point(132, 5, 194)], cloth, '#2c1717', 2);

    ctx.restore();
  }

  function drawNextGenSmithy(obj) {
    const x = obj.x, y = obj.y;
    const outline = '#201713';
    const stone = '#72665b';
    const stoneDark = '#4f463f';
    const plaster = '#9b8368';
    const timber = '#5b3b28';
    const timberDark = '#2f1e17';
    const timberLight = '#9f6d42';
    const roof = '#6d4b3b';
    const roofDark = '#3c2620';
    const roofLight = '#8d624c';
    const ember = '#d97339';
    const emberBright = '#f3bf68';
    const metal = '#767d85';
    const gold = '#d0a15b';

    const frontY = 136;
    const backY = -112;
    const eaveHalf = 170;
    const ridgeHalf = 104;
    const eaveZ = 96;
    const ridgeZ = 178;

    const point = (dx, dy, z = 0) => ({ x: x + dx, y: y + dy, z });
    const poly = (points, fill, stroke = outline, width = 3) => drawProjectedPolygon(points, fill, stroke, width);
    const line3 = (a, b, color = outline, width = 3) => drawWorldLine3D(a, b, color, width);
    const roofPoint = (side, u, v) => {
      const targetY = side === 'front' ? frontY : backY;
      const halfWidth = lerp(ridgeHalf, eaveHalf, v);
      return point(u * halfWidth, lerp(0, targetY, v), lerp(ridgeZ, eaveZ, v));
    };
    const foot = {
      backL: point(-154, backY), backR: point(154, backY),
      frontL: point(-154, frontY), frontR: point(154, frontY),
      backEL: point(-eaveHalf, backY, eaveZ), backER: point(eaveHalf, backY, eaveZ),
      frontEL: point(-eaveHalf, frontY, eaveZ), frontER: point(eaveHalf, frontY, eaveZ),
      ridgeL: point(-ridgeHalf, 0, ridgeZ), ridgeR: point(ridgeHalf, 0, ridgeZ),
    };

    const post = (px, py, z0, z1, r = 8) => {
      line3({x:px,y:py,z:z0}, {x:px,y:py,z:z1}, outline, r + 5);
      line3({x:px,y:py,z:z0}, {x:px,y:py,z:z1}, timber, r);
      line3({x:px-1.5,y:py,z:z0+1}, {x:px-1.5,y:py,z:z1-1}, timberLight, 2);
      const top = worldToScreen(px, py, z1);
      ctx.fillStyle = '#756b61';
      ctx.fillRect(Math.round(top.x - r * .65), Math.round(top.y - 3), Math.round(r * 1.3), 6);
    };

    const barrel = (px, py, z = 0) => {
      const p0 = worldToScreen(px, py, z);
      ctx.save();
      ctx.fillStyle = '#6e492f';
      ctx.strokeStyle = outline;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(p0.x, p0.y - 24, 18, 9, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillRect(p0.x - 18, p0.y - 24, 36, 28);
      ctx.strokeRect(p0.x - 18, p0.y - 24, 36, 28);
      ctx.beginPath();
      ctx.ellipse(p0.x, p0.y + 4, 18, 9, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#b89054';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p0.x - 18, p0.y - 16); ctx.lineTo(p0.x + 18, p0.y - 16);
      ctx.moveTo(p0.x - 18, p0.y - 4); ctx.lineTo(p0.x + 18, p0.y - 4);
      ctx.stroke();
      ctx.restore();
    };

    const anvil = (px, py, z = 0) => {
      const p0 = worldToScreen(px, py, z);
      ctx.save();
      ctx.fillStyle = '#3f454b';
      ctx.strokeStyle = '#9ca4ab';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(p0.x - 24, p0.y - 20);
      ctx.lineTo(p0.x + 18, p0.y - 20);
      ctx.lineTo(p0.x + 28, p0.y - 14);
      ctx.lineTo(p0.x + 8, p0.y - 8);
      ctx.lineTo(p0.x - 26, p0.y - 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#62432d';
      ctx.fillRect(p0.x - 8, p0.y - 8, 16, 18);
      ctx.restore();
    };

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    drawIsoShadow(x, y + 12, 196, 62, .42);
    drawIsoGroundEllipse(x + 8, y + 18, 220, 152, 'rgba(61,45,34,.18)', 'rgba(194,160,110,.13)', 2);
    poly([point(-168, backY, 0), point(168, backY, 0), point(168, frontY, 0), point(-168, frontY, 0)], stoneDark, null, 0);
    poly([foot.backL, foot.frontL, foot.frontEL, foot.backEL], plaster, outline, 4);
    poly([foot.backR, foot.frontR, foot.frontER, foot.backER], '#876d56', outline, 4);
    poly([foot.backL, foot.backR, foot.backER, foot.backEL], stone, outline, 4);
    post(x - 136, y + frontY, 0, 108, 9);
    post(x + 136, y + frontY, 0, 108, 9);
    post(x - 136, y + backY, 0, 110, 8);
    post(x + 136, y + backY, 0, 110, 8);
    line3(point(-136, frontY, 90), point(136, frontY, 90), timberDark, 6);
    line3(point(-136, backY, 90), point(136, backY, 90), timberDark, 6);
    line3(point(-136, frontY, 52), point(-136, backY, 52), timberDark, 5);
    line3(point(136, frontY, 52), point(136, backY, 52), timberDark, 5);
    poly([foot.ridgeL, foot.backEL, foot.backER, foot.ridgeR], roofDark, outline, 4);
    poly([foot.ridgeL, foot.ridgeR, foot.frontER, foot.frontEL], roof, outline, 4);
    poly([foot.ridgeR, foot.frontER, foot.backER], '#6a4a3b', outline, 4);
    for (const u of [-.82,-.5,-.18,.16,.5,.84]) line3(roofPoint('front', u, .06), roofPoint('front', u, .97), u===.16 ? '#4f3128' : 'rgba(72,45,37,.70)', u===.16 ? 4 : 2);
    for (const u of [-.70,-.30,.12,.54]) line3(roofPoint('back', u, .08), roofPoint('back', u, .94), 'rgba(115,82,65,.42)', 2);
    line3(point(-ridgeHalf,0,ridgeZ), point(ridgeHalf,0,ridgeZ), roofLight, 3);
    poly([point(-92, -56, 96), point(-48, -56, 96), point(-48, -18, 96), point(-92, -18, 96)], '#5d5a59', outline, 3);
    poly([point(-92, -56, 96), point(-48, -56, 96), point(-48, -56, 166), point(-92, -56, 166)], '#76706b', outline, 3);
    poly([point(-48, -56, 96), point(-48, -18, 96), point(-48, -18, 166), point(-48, -56, 166)], '#5f5954', outline, 3);
    const smokeBase = worldToScreen(x - 70, y - 56, 170);
    ctx.fillStyle = 'rgba(180,180,180,.18)';
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(smokeBase.x + i * 8, smokeBase.y - 18 - i * 11, 10 + i * 4, 0, TAU); ctx.fill(); }
    const forgeLeft = point(-104, frontY + 1, 0), forgeRight = point(-18, frontY + 1, 0), forgeTopR = point(-18, frontY + 1, 86), forgeTopL = point(-104, frontY + 1, 86);
    poly([forgeLeft, forgeRight, forgeTopR, forgeTopL], '#17110e', '#090807', 3);
    const glow = worldToScreen(x - 60, y + frontY + 2, 18);
    ctx.fillStyle = 'rgba(255,165,63,.35)'; ctx.beginPath(); ctx.arc(glow.x, glow.y - 12, 24, 0, TAU); ctx.fill();
    ctx.fillStyle = ember; ctx.beginPath(); ctx.arc(glow.x, glow.y - 9, 13, 0, TAU); ctx.fill();
    ctx.fillStyle = emberBright; ctx.beginPath(); ctx.arc(glow.x, glow.y - 9, 6.5, 0, TAU); ctx.fill();
    const doorLeft = point(36, frontY + 1, 0), doorRight = point(92, frontY + 1, 0), doorTopR = point(92, frontY + 1, 90), doorTopL = point(36, frontY + 1, 90);
    poly([doorLeft, doorRight, doorTopR, doorTopL], '#191411', '#090807', 3);
    poly([foot.frontL, point(-110, frontY, 0), point(-110, frontY, eaveZ), foot.frontEL], '#9a7d63', outline, 4);
    poly([point(-12, frontY, 0), point(30, frontY, 0), point(30, frontY, eaveZ), point(-12, frontY, eaveZ)], '#8f735b', outline, 4);
    poly([point(98, frontY, 0), foot.frontR, foot.frontER, point(98, frontY, eaveZ)], '#7f6550', outline, 4);
    poly([point(-132, 64, 102), point(-18, 64, 102), point(-8, 126, 68), point(-142, 126, 68)], '#715241', outline, 3);
    line3(point(-126, 120, 64), point(-126, 64, 92), '#53382a', 4);
    line3(point(-24, 120, 64), point(-24, 64, 92), '#53382a', 4);
    poly([point(2, 120, 70), point(124, 120, 70), point(116, 120, 46), point(10, 120, 46)], '#5f3d2b', outline, 3);
    line3(point(18, frontY, 82), point(26, 124, 68), gold, 2);
    line3(point(104, frontY, 82), point(98, 124, 68), gold, 2);
    const sign = worldToScreen(x + 62, y + 120, 58);
    ctx.save();
    ctx.fillStyle = '#f1deaf';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(obj.label || 'BLACKSMITH', Math.round(sign.x), Math.round(sign.y));
    ctx.restore();
    anvil(x + 176, y + 112, 0);
    barrel(x + 204, y + 156, 0);
    barrel(x - 182, y + 142, 0);
    poly([point(168, 138, 0), point(198, 138, 0), point(198, 176, 0), point(168, 176, 0)], '#3d3027', null, 0);
    const tongs = worldToScreen(x + 182, y + 156, 10);
    ctx.strokeStyle = metal; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(tongs.x - 9, tongs.y - 8); ctx.lineTo(tongs.x + 6, tongs.y + 4); ctx.moveTo(tongs.x - 9, tongs.y + 4); ctx.lineTo(tongs.x + 6, tongs.y - 8); ctx.stroke();
    post(x + ridgeHalf, y, ridgeZ, 220, 6);
    poly([point(ridgeHalf, 0, 212), point(162, 10, 200), point(124, 8, 188)], '#7f4a3b', '#2c1717', 2);
    ctx.restore();
  }

  function drawNextGenCaveEntrance(obj) {
    const x = obj.x, y = obj.y;
    const outline = '#191513';
    const rock = '#66615a';
    const rockMid = '#534f49';
    const rockDark = '#363532';
    const rockLight = '#837c74';
    const beam = '#61412e';
    const beamDark = '#2f1e16';
    const brass = '#c99a56';

    const point = (dx, dy, z = 0) => ({ x: x + dx, y: y + dy, z });
    const poly = (points, fill, stroke = outline, width = 3, alpha = 1) => drawProjectedPolygon(points, fill, stroke, width, alpha);
    const line3 = (a, b, color = outline, width = 3) => drawWorldLine3D(a, b, color, width);

    const lantern = (px, py, z = 0) => {
      const p = worldToScreen(px, py, z);
      ctx.save();
      ctx.shadowColor = '#ffb34a';
      ctx.shadowBlur = 14;
      ctx.fillStyle = 'rgba(255,177,74,.22)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 20, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#1d1612';
      ctx.fillRect(p.x - 7, p.y - 13, 14, 22);
      ctx.fillStyle = '#ffcf6f';
      ctx.fillRect(p.x - 4, p.y - 9, 8, 14);
      ctx.strokeStyle = brass;
      ctx.lineWidth = 2;
      ctx.strokeRect(p.x - 7, p.y - 13, 14, 22);
      ctx.beginPath();
      ctx.arc(p.x, p.y - 14, 7, Math.PI, 0);
      ctx.stroke();
      ctx.restore();
    };

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    // Ground approach and base shadow.
    drawIsoShadow(x - 6, y + 26, 190, 50, .36);
    drawIsoGroundEllipse(x - 8, y + 54, 176, 76, 'rgba(42,34,27,.36)', 'rgba(195,164,112,.08)', 2);

    // Broad cliff face so the cave feels embedded in a mountain wall.
    poly([point(-236, -26, 0), point(208, -26, 0), point(186, 138, 0), point(-214, 138, 0)], rockMid, outline, 4);
    poly([point(-214, -98, 74), point(162, -98, 74), point(208, -26, 0), point(-236, -26, 0)], rockLight, outline, 3);
    poly([point(-252, -40, 0), point(-208, -102, 74), point(-184, 146, 0), point(-254, 128, 0)], rockDark, outline, 4);
    poly([point(220, -36, 0), point(178, -104, 72), point(154, 146, 0), point(228, 122, 0)], rockDark, outline, 4);
    poly([point(-166, -116, 96), point(10, -134, 110), point(176, -112, 84), point(128, -72, 66), point(-146, -76, 66)], rock, outline, 4);

    // Outer cave opening on the front face.
    const oBL = point(-96, 92, 0), oBR = point(96, 92, 0), oTR = point(78, 10, 106), oTL = point(-78, 10, 106);
    // Inner recessed tunnel opening.
    const iBL = point(-58, 34, 8), iBR = point(58, 34, 8), iTR = point(46, -34, 82), iTL = point(-46, -34, 82);

    // Stone frame around the mouth.
    poly([point(-146, 116, 0), oBL, oTL, point(-156, 22, 96)], '#5c5852', outline, 4);
    poly([oBR, point(146, 116, 0), point(158, 18, 96), oTR], '#55514c', outline, 4);
    poly([point(-116, 18, 116), point(116, 18, 116), point(96, -10, 126), point(-96, -10, 126)], '#716b63', outline, 4);

    // Recessed reveal faces that create actual 2.5D depth.
    poly([oBL, oTL, iTL, iBL], '#3b3936', outline, 3);
    poly([oBR, oTR, iTR, iBR], '#343330', outline, 3);
    poly([oTL, oTR, iTR, iTL], '#4f4b45', outline, 3);
    poly([oBL, oBR, iBR, iBL], '#41372f', outline, 3);

    // Threshold stones and angled descent path.
    poly([point(-110, 98, 0), point(110, 98, 0), point(92, 144, 0), point(-92, 144, 0)], '#5c4a3d', '#2a211d', 3);
    for (let i = 0; i < 6; i++) {
      const yFront = 66 - i * 14;
      const yBack = 54 - i * 14;
      const wFront = 62 - i * 7;
      const wBack = 54 - i * 7;
      const zFront = -i * 5;
      const zBack = -(i + 1) * 5;
      poly([
        point(-wFront, yFront, zFront), point(wFront, yFront, zFront),
        point(wBack, yBack, zBack), point(-wBack, yBack, zBack)
      ], i < 2 ? '#85796c' : i < 4 ? '#6d645b' : '#544e48', '#302b29', 2);
    }

    // Interior darkness pushed to the back opening, not a flat blob on the front plane.
    const c = worldToScreen(x, y - 4, 14);
    const ltop = worldToScreen(iTL.x, iTL.y, iTL.z), rtop = worldToScreen(iTR.x, iTR.y, iTR.z);
    const lbot = worldToScreen(iBL.x, iBL.y, iBL.z), rbot = worldToScreen(iBR.x, iBR.y, iBR.z);
    ctx.save();
    ctx.fillStyle = '#060708';
    ctx.beginPath();
    ctx.moveTo(lbot.x, lbot.y + 4);
    ctx.quadraticCurveTo(lbot.x - 2, c.y - 4, ltop.x + 2, ltop.y + 4);
    ctx.quadraticCurveTo(c.x, c.y - 48, rtop.x - 2, rtop.y + 4);
    ctx.quadraticCurveTo(rbot.x + 2, c.y - 4, rbot.x - 4, rbot.y + 4);
    ctx.quadraticCurveTo(c.x, c.y + 26, lbot.x, lbot.y + 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Warm spill from the tunnel mouth.
    const glow = worldToScreen(x, y + 18, 6);
    ctx.fillStyle = 'rgba(255,205,120,.12)';
    ctx.beginPath();
    ctx.ellipse(glow.x, glow.y + 16, 62, 24, 0, 0, TAU);
    ctx.fill();

    // Timber braces mounted in perspective.
    poly([point(-122, 26, 0), point(-106, 26, 0), point(-106, 102, 98), point(-122, 102, 98)], beam, beamDark, 3);
    poly([point(106, 26, 0), point(122, 26, 0), point(122, 102, 98), point(106, 102, 98)], beam, beamDark, 3);
    poly([point(-134, 82, 94), point(134, 82, 94), point(124, 98, 106), point(-124, 98, 106)], beam, beamDark, 3);
    line3(point(-118, 50, 0), point(-22, 96, 96), '#6b4a31', 3);
    line3(point(118, 50, 0), point(22, 96, 96), '#6b4a31', 3);

    // Lanterns and plaque.
    lantern(x - 136, y + 58, 86);
    lantern(x + 136, y + 58, 86);
    poly([point(-86, -60, 52), point(86, -60, 52), point(72, -42, 42), point(-72, -42, 42)], '#4d3b2e', '#221713', 3);
    const sign = worldToScreen(x, y - 52, 48);
    ctx.save();
    ctx.fillStyle = '#e3cb92';
    ctx.font = 'bold 13px Georgia';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('THE DESCENT', Math.round(sign.x), Math.round(sign.y));
    ctx.restore();

    // Rock cuts/highlights.
    line3(point(-176, -22, 8), point(-126, -82, 56), 'rgba(151,145,136,.42)', 2);
    line3(point(168, -18, 8), point(120, -78, 54), 'rgba(151,145,136,.36)', 2);
    line3(point(-186, 96, 4), point(-124, 42, 20), 'rgba(44,39,36,.48)', 2);
    line3(point(166, 92, 4), point(118, 36, 18), 'rgba(44,39,36,.44)', 2);
    line3(point(-84, 114, 2), point(84, 114, 2), 'rgba(30,24,21,.35)', 2);

    ctx.restore();
  }


  function drawFlameSpriteScreen(x, y, width, height, options = {}) {
    const now = performance.now() / 1000;
    const phase = options.phase || 0;
    const speed = options.speed || 7.8;
    const sway = (options.sway || 0) + Math.sin(now * speed + phase) * width * 0.16;
    const flicker = 0.94 + Math.sin(now * speed * .62 + phase * 1.3) * 0.08;
    const alpha = options.alpha ?? 1;
    const outer = options.outer || '#d94c24';
    const mid = options.mid || '#ff8f3e';
    const core = options.core || '#ffe27c';
    const tipX = x + sway + (options.lean || 0) * width * .18;
    const tipY = y - height * flicker;
    const drawTongue = (tw, th, color, localAlpha = 1, yOffset = 0, xOffset = 0) => {
      ctx.globalAlpha = alpha * localAlpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x + xOffset, y + yOffset);
      ctx.bezierCurveTo(
        x + xOffset + tw,
        y + yOffset - th * .15,
        x + xOffset + tw * .82 + sway,
        y + yOffset - th * .72,
        tipX + xOffset * .18,
        tipY + yOffset
      );
      ctx.bezierCurveTo(
        x + xOffset - tw * .82 + sway,
        y + yOffset - th * .72,
        x + xOffset - tw,
        y + yOffset - th * .15,
        x + xOffset,
        y + yOffset
      );
      ctx.closePath();
      ctx.fill();
    };
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const glow = ctx.createRadialGradient(x, y - height * .34, width * .12, x, y - height * .34, width * 2.2);
    glow.addColorStop(0, 'rgba(255,238,164,.30)');
    glow.addColorStop(.35, 'rgba(255,165,74,.18)');
    glow.addColorStop(1, 'rgba(255,120,40,0)');
    ctx.globalAlpha = alpha * .7;
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.ellipse(x, y - height * .34, width * 1.45, height * .96, 0, 0, TAU);
    ctx.fill();
    drawTongue(width, height, outer, .84);
    drawTongue(width * .72, height * .74, mid, .95, -1);
    drawTongue(width * .40, height * .48, core, 1, 1);
    ctx.restore();
  }

  function drawScreenEmbers(x, y, width, height, count = 6, seed = 0, alpha = .8) {
    const now = performance.now() / 1000;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < count; i++) {
      const phase = seed + i * 1.37;
      const rise = ((now * 26 + phase * 23) % (height + 18));
      const px = x + Math.sin(now * 1.9 + phase) * width * .55 + (i - (count - 1) / 2) * width * .14;
      const py = y - 10 - rise;
      const size = 1.6 + (i % 3) * .7;
      ctx.globalAlpha = alpha * (1 - rise / (height + 18));
      ctx.fillStyle = i % 2 ? '#ffd47a' : '#ff9f49';
      ctx.beginPath();
      ctx.arc(px, py, size, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawAnimatedFireClusterWorld(x, y, options = {}) {
    const flames = options.flames || 4;
    const baseZ = options.baseZ || 0;
    const scale = options.scale || 1;
    const spreadX = options.spreadX || 16;
    const spreadY = options.spreadY || 7;
    const glowRadius = options.glowRadius || 70;
    const glowPoint = worldToScreen(x, y, baseZ + 4);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const groundGlow = ctx.createRadialGradient(glowPoint.x, glowPoint.y - 4, 6, glowPoint.x, glowPoint.y - 4, glowRadius * scale);
    groundGlow.addColorStop(0, 'rgba(255,236,168,.28)');
    groundGlow.addColorStop(.5, 'rgba(255,148,56,.16)');
    groundGlow.addColorStop(1, 'rgba(255,120,40,0)');
    ctx.fillStyle = groundGlow;
    ctx.beginPath();
    ctx.ellipse(glowPoint.x, glowPoint.y - 6, glowRadius * .72 * scale, glowRadius * .36 * scale, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
    for (let i = 0; i < flames; i++) {
      const offsetX = (i - (flames - 1) / 2) * spreadX + Math.sin(performance.now() / 430 + i * 1.8) * spreadX * .08;
      const offsetY = Math.abs(i - (flames - 1) / 2) * spreadY * .22;
      const point = worldToScreen(x + offsetX, y + offsetY, baseZ + 8 + (i % 2) * 2);
      const width = (12 + (i % 3) * 3.6) * scale * (1 + Math.sin(performance.now() / 220 + i * 2.4) * .03);
      const height = (26 + (i % 4) * 7) * scale * (1 + Math.sin(performance.now() / 260 + i * 1.7) * .05);
      drawFlameSpriteScreen(point.x, point.y + 1, width, height, { phase: i * 1.14, alpha: options.alpha ?? .96, speed: 7 + i * .25, sway: Math.sin(performance.now() / 500 + i) * 1.5 });
    }
    drawScreenEmbers(glowPoint.x, glowPoint.y - 4, 22 * scale, 52 * scale, Math.max(4, flames + 1), x * .013 + y * .017, .72);
  }

  function firePatchQuality() {
    return clamp(Number(game.visualLoad?.fireQuality) || 1, .35, 1);
  }

  function projectileVisualQuality() {
    return clamp(Number(game.visualLoad?.projectileQuality) || 1, .35, 1);
  }

  function screenPointVisible(point, margin = 110) {
    return point.x >= -margin && point.y >= -margin && point.x <= window.innerWidth + margin && point.y <= window.innerHeight + margin;
  }

  function drawBatchedFireFlames(flames, quality = 1) {
    if (!flames.length) return;
    const now = performance.now() / 1000;
    const buildLayer = (widthScale, heightScale, yOffset = 0) => {
      ctx.beginPath();
      for (const flame of flames) {
        const width = flame.width * widthScale;
        const height = flame.height * heightScale;
        const sway = Math.sin(now * flame.speed + flame.phase) * width * .16 + flame.sway;
        const flicker = .94 + Math.sin(now * flame.speed * .62 + flame.phase * 1.3) * .08;
        const tipX = flame.x + sway;
        const tipY = flame.y + yOffset - height * flicker;
        const baseY = flame.y + yOffset;
        ctx.moveTo(flame.x, baseY);
        ctx.bezierCurveTo(flame.x + width, baseY - height * .15, flame.x + width * .82 + sway, baseY - height * .72, tipX, tipY);
        ctx.bezierCurveTo(flame.x - width * .82 + sway, baseY - height * .72, flame.x - width, baseY - height * .15, flame.x, baseY);
        ctx.closePath();
      }
    };
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    buildLayer(1, 1);
    ctx.globalAlpha = .72 + quality * .10;
    ctx.fillStyle = '#d94c24';
    ctx.fill();
    buildLayer(.72, .74, -1);
    ctx.globalAlpha = .78 + quality * .12;
    ctx.fillStyle = '#ff8f3e';
    ctx.fill();
    buildLayer(.40, .48, 1);
    ctx.globalAlpha = .88 + quality * .10;
    ctx.fillStyle = '#ffe27c';
    ctx.fill();
    ctx.restore();
  }

  function drawAnimatedFirePatch(x, y, radius, options = {}) {
    const intensity = options.intensity || 1;
    const quality = options.quality ?? firePatchQuality();
    const center = worldToScreen(x, y, 2);
    if (!screenPointVisible(center, radius * 1.35 + 90)) return;
    drawIsoGroundEllipse(x, y, radius, radius * .92, 'rgba(255,96,40,.20)', 'rgba(255,160,82,.26)', 2);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const fieldGlow = ctx.createRadialGradient(center.x, center.y - 6, radius * .08, center.x, center.y - 6, radius * 1.46);
    fieldGlow.addColorStop(0, 'rgba(255,218,126,.10)');
    fieldGlow.addColorStop(.42, 'rgba(255,134,52,.11)');
    fieldGlow.addColorStop(1, 'rgba(255,120,40,0)');
    ctx.fillStyle = fieldGlow;
    ctx.beginPath();
    ctx.ellipse(center.x, center.y - 6, radius * .995, radius * .585, 0, 0, TAU);
    ctx.fill();
    ctx.restore();

    const seedBase = x * .017 + y * .013 + radius * .11;
    const rand = (n) => {
      const v = Math.sin(seedBase + n * 12.9898) * 43758.5453123;
      return v - Math.floor(v);
    };

    const points = [];
    const pushPoint = (dx, dy, s, alpha) => points.push({ dx, dy, s, alpha });

    // Keep only a few center flames. The rest of the density should live across the entire circle.
    pushPoint(0, 0, .96, .88);
    pushPoint(-radius * .09, radius * .04, .88, .82);
    pushPoint(radius * .11, -radius * .05, .84, .80);

    const addRing = (ring, count, sizeBase, alphaBase, jitter = .10) => {
      for (let i = 0; i < count; i++) {
        const angle = TAU * (i / count) + (rand(i + ring * 100) - .5) * .34;
        const radial = radius * ring * (1 - jitter + rand(i + ring * 200) * jitter * 2);
        const dx = Math.cos(angle) * radial;
        const dy = Math.sin(angle) * radial * .88;
        const size = sizeBase * (.86 + rand(i + ring * 300) * .28);
        const alpha = alphaBase * (.92 + rand(i + ring * 400) * .14);
        pushPoint(dx, dy, size, alpha);
      }
    };

    // Explicitly populate the whole footprint from inner to far edge.
    addRing(.22, clamp(Math.round(radius * .035 * intensity) + 6, 8, 12), .68, .70, .14);
    addRing(.38, clamp(Math.round(radius * .050 * intensity) + 8, 10, 16), .62, .66, .12);
    addRing(.54, clamp(Math.round(radius * .062 * intensity) + 10, 12, 20), .58, .62, .10);
    addRing(.70, clamp(Math.round(radius * .078 * intensity) + 12, 16, 26), .54, .58, .09);
    addRing(.84, clamp(Math.round(radius * .090 * intensity) + 16, 18, 32), .50, .56, .08);
    addRing(.95, clamp(Math.round(radius * .100 * intensity) + 18, 20, 38), .46, .54, .06);

    // Sector fill ensures there are no large dead wedges between ring flames.
    const sectors = 18;
    const sectorLayers = [ .30, .48, .66, .82, .94 ];
    for (let s = 0; s < sectors; s++) {
      const baseAngle = TAU * s / sectors;
      for (let j = 0; j < sectorLayers.length; j++) {
        const ring = sectorLayers[j];
        const angle = baseAngle + (rand(1600 + s * 13 + j * 29) - .5) * .22;
        const radial = radius * ring * (.95 + rand(1800 + s * 13 + j * 29) * .08);
        const dx = Math.cos(angle) * radial;
        const dy = Math.sin(angle) * radial * .88;
        const size = (.42 + (1 - ring) * .30) * (.88 + rand(2000 + s * 13 + j * 29) * .24);
        const alpha = .48 + (1 - ring) * .14 + rand(2200 + s * 13 + j * 29) * .05;
        pushPoint(dx, dy, size, alpha);
      }
    }

    // Light scatter across the whole ellipse for organic breakup, but without re-centering the composition.
    const scatterCount = clamp(Math.round(radius * .08 * intensity) + 10, 14, 24);
    for (let i = 0; i < scatterCount; i++) {
      const a = TAU * rand(i + 2701);
      const r = radius * (0.15 + rand(i + 2907) * 0.82);
      const dx = Math.cos(a) * r;
      const dy = Math.sin(a) * r * .88;
      const norm = Math.min(1, r / Math.max(1, radius));
      const size = (.34 + (1 - norm) * .28) * (.90 + rand(i + 3201) * .22);
      const alpha = .42 + rand(i + 3301) * .08;
      pushPoint(dx, dy, size, alpha);
    }

    const stride = quality >= .90 ? 1 : quality >= .70 ? 2 : quality >= .52 ? 3 : 4;
    const flames = [];
    for (let i = 0; i < points.length; i++) {
      // Preserve the full-radius layout while lowering duplicate detail only under heavy stacking.
      if (i >= 3 && i % stride !== 0) continue;
      const f = points[i];
      const point = worldToScreen(x + f.dx, y + f.dy, 8 + i % 3 * 2);
      if (!screenPointVisible(point, 45)) continue;
      const width = radius * .082 * f.s * intensity;
      const height = radius * .18 * f.s * intensity;
      flames.push({
        x:point.x, y:point.y + 2, width, height,
        phase:i * 1.03 + x * .004 + y * .003,
        speed:6.4 + (i % 6) * .22,
        sway:Math.sin(performance.now() / 390 + i * 1.17) * width * .08,
      });
    }
    drawBatchedFireFlames(flames, quality);

    if (quality >= .72) {
      const emberCount = quality >= .9 ? clamp(Math.round(radius * .08) + 6, 8, 16) : 6;
      drawScreenEmbers(center.x, center.y - 2, radius * 1.02, radius * .78, emberCount, radius * .11 + x * .003, .48);
    }
  }


  function drawStylizedTrail(tail, point, width, colors = {}) {
    const quality = projectileVisualQuality();
    if (quality < .42) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    if (quality >= .72) {
      const trail = ctx.createLinearGradient(tail.x, tail.y, point.x, point.y);
      trail.addColorStop(0, colors.tailStart || 'rgba(255,255,255,0)');
      trail.addColorStop(.36, colors.tailMid || 'rgba(255,255,255,.18)');
      trail.addColorStop(1, colors.tailEnd || 'rgba(255,255,255,.82)');
      ctx.strokeStyle = trail;
    } else ctx.strokeStyle = colors.tailMid || 'rgba(255,255,255,.22)';
    ctx.globalAlpha = quality >= .72 ? 1 : .72;
    ctx.lineWidth = width * (quality >= .72 ? 1 : .78);
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(tail.x, tail.y); ctx.lineTo(point.x, point.y); ctx.stroke();
    ctx.restore();
  }

  function drawArcaneProjectile(projectile) {
    drawIsoShadow(projectile.x, projectile.y, projectile.radius * 1.22, projectile.radius * .42, .22);
    const dir = normalize(projectile.vx || .001, projectile.vy || .001);
    const point = worldToScreen(projectile.x, projectile.y, 20);
    const tail = worldToScreen(projectile.x - dir.x * (28 + projectile.radius * 1.3), projectile.y - dir.y * (28 + projectile.radius * 1.3), 18);
    drawStylizedTrail(tail, point, Math.max(3, projectile.radius * .72), {
      tailStart: 'rgba(120,84,205,0)',
      tailMid: 'rgba(165,128,255,.22)',
      tailEnd: 'rgba(229,214,255,.88)',
    });
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(point.x, point.y);
    ctx.rotate(performance.now() / 280 + projectile.x * .002);
    ctx.fillStyle = 'rgba(186,145,255,.92)';
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(0, -projectile.radius * 1.28);
      ctx.lineTo(projectile.radius * .48, 0);
      ctx.lineTo(0, projectile.radius * .32);
      ctx.lineTo(-projectile.radius * .48, 0);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = '#fff4bf';
    ctx.beginPath(); ctx.arc(0, 0, Math.max(2, projectile.radius * .34), 0, TAU); ctx.fill();
    ctx.restore();
  }

  function drawIceProjectile(projectile) {
    drawIsoShadow(projectile.x, projectile.y, projectile.radius * 1.22, projectile.radius * .38, .2);
    const dir = normalize(projectile.vx || .001, projectile.vy || .001);
    const point = worldToScreen(projectile.x, projectile.y, 20);
    const tail = worldToScreen(projectile.x - dir.x * (30 + projectile.radius * 1.7), projectile.y - dir.y * (30 + projectile.radius * 1.7), 18);
    drawStylizedTrail(tail, point, Math.max(3, projectile.radius * .6), {
      tailStart: 'rgba(126,207,255,0)',
      tailMid: 'rgba(173,233,255,.16)',
      tailEnd: 'rgba(227,248,255,.76)',
    });
    const perp = { x: -dir.y, y: dir.x };
    const px = point.x, py = point.y;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = '#aeeaff';
    ctx.strokeStyle = '#ebfbff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px + dir.x * projectile.radius * 1.55, py + dir.y * projectile.radius * 1.55);
    ctx.lineTo(px + perp.x * projectile.radius * .72, py + perp.y * projectile.radius * .72);
    ctx.lineTo(px - dir.x * projectile.radius * 1.1, py - dir.y * projectile.radius * 1.1);
    ctx.lineTo(px - perp.x * projectile.radius * .72, py - perp.y * projectile.radius * .72);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = 'rgba(235,251,255,.82)';
    ctx.beginPath(); ctx.moveTo(px - dir.x * projectile.radius, py - dir.y * projectile.radius); ctx.lineTo(px + dir.x * projectile.radius, py + dir.y * projectile.radius); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px - perp.x * projectile.radius * .62, py - perp.y * projectile.radius * .62); ctx.lineTo(px + perp.x * projectile.radius * .62, py + perp.y * projectile.radius * .62); ctx.stroke();
    ctx.restore();
  }

  function drawWaterProjectile(projectile) {
    drawIsoShadow(projectile.x, projectile.y, projectile.radius * 1.32, projectile.radius * .44, .2);
    const dir = normalize(projectile.vx || .001, projectile.vy || .001);
    const point = worldToScreen(projectile.x, projectile.y, 18);
    const tail = worldToScreen(projectile.x - dir.x * (34 + projectile.radius * 1.8), projectile.y - dir.y * (34 + projectile.radius * 1.8), 16);
    drawStylizedTrail(tail, point, Math.max(4, projectile.radius * .78), {
      tailStart: 'rgba(69,143,188,0)',
      tailMid: 'rgba(112,208,233,.20)',
      tailEnd: 'rgba(223,248,255,.80)',
    });
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.translate(point.x, point.y);
    ctx.rotate(Math.atan2(dir.y, dir.x));
    ctx.fillStyle = '#63cfe6';
    ctx.beginPath();
    ctx.moveTo(projectile.radius * 1.2, 0);
    ctx.bezierCurveTo(projectile.radius * .5, -projectile.radius * .9, -projectile.radius * .6, -projectile.radius * .65, -projectile.radius * .95, 0);
    ctx.bezierCurveTo(-projectile.radius * .6, projectile.radius * .65, projectile.radius * .5, projectile.radius * .9, projectile.radius * 1.2, 0);
    ctx.fill();
    ctx.fillStyle = 'rgba(230,250,255,.92)';
    ctx.beginPath(); ctx.arc(projectile.radius * .15, -projectile.radius * .12, Math.max(2, projectile.radius * .22), 0, TAU); ctx.fill();
    ctx.restore();
  }

  function drawPhysicalProjectile(projectile) {
    drawIsoShadow(projectile.x, projectile.y, projectile.radius * 1.18, projectile.radius * .34, .18);
    const dir = normalize(projectile.vx || .001, projectile.vy || .001);
    const perp = { x: -dir.y, y: dir.x };
    const point = worldToScreen(projectile.x, projectile.y, 18);
    const tail = worldToScreen(projectile.x - dir.x * (26 + projectile.radius * 1.2), projectile.y - dir.y * (26 + projectile.radius * 1.2), 18);
    ctx.save();
    ctx.strokeStyle = 'rgba(234,225,209,.28)';
    ctx.lineWidth = Math.max(2, projectile.radius * .34);
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(tail.x, tail.y); ctx.lineTo(point.x, point.y); ctx.stroke();
    ctx.fillStyle = '#e7dfc9';
    ctx.strokeStyle = '#8e7f67';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(point.x + dir.x * projectile.radius * 1.45, point.y + dir.y * projectile.radius * 1.45);
    ctx.lineTo(point.x + perp.x * projectile.radius * .36, point.y + perp.y * projectile.radius * .36);
    ctx.lineTo(point.x - dir.x * projectile.radius * 1.1, point.y - dir.y * projectile.radius * 1.1);
    ctx.lineTo(point.x - perp.x * projectile.radius * .36, point.y - perp.y * projectile.radius * .36);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  function drawDefaultProjectile(projectile) {
    drawIsoShadow(projectile.x, projectile.y, projectile.radius*1.15, projectile.radius*.35, .2);
    const point = worldToScreen(projectile.x, projectile.y, 20);
    ctx.save();
    ctx.fillStyle = projectile.color;
    ctx.shadowColor = projectile.color;
    ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(point.x, point.y, projectile.radius, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.45)';
    ctx.beginPath(); ctx.arc(point.x - projectile.radius * .25, point.y - projectile.radius * .25, projectile.radius * .32, 0, TAU); ctx.fill();
    ctx.restore();
  }

  function drawFireProjectile(projectile) {
    const quality = projectileVisualQuality();
    const dir = normalize(projectile.vx || .001, projectile.vy || .001);
    const perp = { x: -dir.y, y: dir.x };
    const point = worldToScreen(projectile.x, projectile.y, 20);
    if (!screenPointVisible(point, 85)) return;
    if (quality >= .62) drawIsoShadow(projectile.x, projectile.y, projectile.radius * 1.28, projectile.radius * .42, .22);
    const tail = worldToScreen(projectile.x - dir.x * (32 + projectile.radius * 1.5), projectile.y - dir.y * (32 + projectile.radius * 1.5), 17);
    const left = { x: tail.x + perp.x * projectile.radius * .9, y: tail.y + perp.y * projectile.radius * .55 };
    const right = { x: tail.x - perp.x * projectile.radius * .9, y: tail.y - perp.y * projectile.radius * .55 };
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    if (quality >= .70) {
      const trail = ctx.createLinearGradient(tail.x, tail.y, point.x, point.y);
      trail.addColorStop(0, 'rgba(188,44,18,0)');
      trail.addColorStop(.32, 'rgba(255,115,36,.18)');
      trail.addColorStop(1, 'rgba(255,233,154,.80)');
      ctx.fillStyle = trail;
    } else ctx.fillStyle = 'rgba(255,122,42,.30)';
    ctx.beginPath();
    ctx.moveTo(left.x, left.y);
    ctx.quadraticCurveTo((left.x + point.x) / 2, (left.y + point.y) / 2 - projectile.radius * .85, point.x, point.y);
    ctx.quadraticCurveTo((right.x + point.x) / 2, (right.y + point.y) / 2 + projectile.radius * .85, right.x, right.y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,166,74,.34)';
    ctx.lineWidth = Math.max(2, projectile.radius * .6);
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(tail.x, tail.y); ctx.lineTo(point.x, point.y); ctx.stroke();
    ctx.restore();
    drawFlameSpriteScreen(point.x, point.y + projectile.radius * .45, projectile.radius * (quality >= .6 ? 1.05 : .86), projectile.radius * (quality >= .6 ? 2.65 : 2.12), { phase: projectile.x * .015 + projectile.y * .021, alpha: .94, sway: perp.x * 1.1 });
    if (quality >= .72) drawFlameSpriteScreen(point.x - perp.x * projectile.radius * .18, point.y + projectile.radius * .45, projectile.radius * .62, projectile.radius * 1.75, { phase: projectile.x * .012 + 1.1, alpha: .72 });
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = '#fff1b4';
    if (quality >= .7) { ctx.shadowColor = '#ff8f3a'; ctx.shadowBlur = 16; }
    ctx.beginPath(); ctx.arc(point.x, point.y, Math.max(2.5, projectile.radius * .34), 0, TAU); ctx.fill();
    ctx.restore();
  }

  function drawCampObject(obj) {
    const p = worldToScreen(obj.x,obj.y,0);
    if (obj.kind === 'tree') {
      drawIsoShadow(obj.x,obj.y,30,10,.28); ctx.strokeStyle='#4a3526'; ctx.lineWidth=10; ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x,p.y-52); ctx.stroke();
      ctx.fillStyle='#264228'; ctx.beginPath(); ctx.arc(p.x,p.y-72,obj.size,0,TAU); ctx.fill(); ctx.fillStyle='#355a38'; ctx.beginPath(); ctx.arc(p.x-12,p.y-80,obj.size*.65,0,TAU); ctx.fill(); ctx.fillStyle='rgba(120,170,116,.35)'; ctx.beginPath(); ctx.arc(p.x+8,p.y-88,obj.size*.36,0,TAU); ctx.fill();
    } else if (obj.kind === 'rock') {
      drawIsoShadow(obj.x,obj.y,obj.size+6,9,.24);
      ctx.fillStyle='#5a5650';
      ctx.beginPath(); ctx.moveTo(p.x-obj.size,p.y-8); ctx.lineTo(p.x-obj.size*.55,p.y-obj.size*.65); ctx.lineTo(p.x+obj.size*.35,p.y-obj.size*.72); ctx.lineTo(p.x+obj.size,p.y-6); ctx.lineTo(p.x+obj.size*.42,p.y+obj.size*.18); ctx.lineTo(p.x-obj.size*.5,p.y+obj.size*.08); ctx.closePath(); ctx.fill();
      ctx.strokeStyle='rgba(0,0,0,.3)'; ctx.lineWidth=2; ctx.stroke();
    } else if (obj.kind === 'tent') {
      if (obj.artPrototype === 'smithy') drawNextGenSmithy(obj);
      else if (obj.artPrototype) drawNextGenIsoTent(obj);
      else {
        drawIsoShadow(obj.x,obj.y,76,21,.32); ctx.fillStyle=obj.color; ctx.beginPath(); ctx.moveTo(p.x-72,p.y); ctx.lineTo(p.x,p.y-115); ctx.lineTo(p.x+72,p.y); ctx.closePath(); ctx.fill();
        ctx.fillStyle='rgba(0,0,0,.38)'; ctx.beginPath(); ctx.moveTo(p.x-20,p.y); ctx.lineTo(p.x,p.y-48); ctx.lineTo(p.x+20,p.y); ctx.closePath(); ctx.fill();
        ctx.fillStyle='#ead9b8'; ctx.font='bold 12px sans-serif'; ctx.textAlign='center'; ctx.fillText(obj.label,p.x,p.y+19);
      }
    } else if (obj.kind === 'storage') {
      drawIsoShadow(obj.x,obj.y,56,16,.34);
      const baseL = {x: obj.x - 56, y: obj.y + 28, z: 0};
      const baseR = {x: obj.x + 56, y: obj.y + 28, z: 0};
      const backR = {x: obj.x + 48, y: obj.y - 22, z: 0};
      const backL = {x: obj.x - 48, y: obj.y - 22, z: 0};
      const topL = {x: obj.x - 56, y: obj.y + 28, z: 34};
      const topR = {x: obj.x + 56, y: obj.y + 28, z: 34};
      const topBackR = {x: obj.x + 48, y: obj.y - 22, z: 34};
      const topBackL = {x: obj.x - 48, y: obj.y - 22, z: 34};
      const lidPeakL = {x: obj.x - 42, y: obj.y + 4, z: 56};
      const lidPeakR = {x: obj.x + 42, y: obj.y + 4, z: 56};
      drawProjectedPolygon([topBackL, topBackR, topR, topL], '#9a6b36', '#2a1b12', 3);
      drawProjectedPolygon([baseL, baseR, topR, topL], '#7b4e25', '#2a1b12', 3);
      drawProjectedPolygon([baseR, backR, topBackR, topR], '#633d1c', '#2a1b12', 3);
      drawProjectedPolygon([topBackL, topBackR, lidPeakR, lidPeakL], '#b68443', '#2a1b12', 3);
      drawProjectedPolygon([topL, topR, lidPeakR, lidPeakL], '#c99652', '#2a1b12', 3);
      drawWorldLine3D(baseL, topL, '#d1a15d', 2);
      drawWorldLine3D(baseR, topR, '#d1a15d', 2);
      drawWorldLine3D(topBackL, topBackR, '#e5bb75', 2);
      drawWorldLine3D(topL, topR, '#e2b56a', 2);
      const latch = worldToScreen(obj.x, obj.y + 16, 24);
      ctx.fillStyle='#ddb55e';
      ctx.fillRect(Math.round(latch.x-7), Math.round(latch.y-8), 14, 14);
      ctx.fillStyle='#6b481f';
      ctx.fillRect(Math.round(latch.x-2), Math.round(latch.y-3), 4, 6);
      ctx.fillStyle='#ead9b8'; ctx.font='bold 11px sans-serif'; ctx.textAlign='center'; ctx.fillText('STORAGE',p.x,p.y+18);
    } else if (obj.kind === 'fire') {
      drawIsoGroundEllipse(obj.x,obj.y,66,58,'#3b3026','rgba(255,171,88,.10)',2);
      const logColor = '#6b4a31';
      const logDark = '#3a271a';
      const logA1 = worldToScreen(obj.x - 22, obj.y + 12, 2);
      const logA2 = worldToScreen(obj.x + 24, obj.y - 14, 2);
      const logB1 = worldToScreen(obj.x - 24, obj.y - 10, 2);
      const logB2 = worldToScreen(obj.x + 20, obj.y + 16, 2);
      ctx.save();
      ctx.strokeStyle = logColor; ctx.lineWidth = 10; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(logA1.x, logA1.y); ctx.lineTo(logA2.x, logA2.y); ctx.moveTo(logB1.x, logB1.y); ctx.lineTo(logB2.x, logB2.y); ctx.stroke();
      ctx.strokeStyle = logDark; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(logA1.x, logA1.y); ctx.lineTo(logA2.x, logA2.y); ctx.moveTo(logB1.x, logB1.y); ctx.lineTo(logB2.x, logB2.y); ctx.stroke();
      ctx.restore();
      drawAnimatedFireClusterWorld(obj.x, obj.y - 2, { flames: 5, scale: 1.02, spreadX: 12, spreadY: 8, glowRadius: 76 });
    } else if (obj.kind === 'entrance') {
      drawNextGenCaveEntrance(obj);
    } else if (obj.kind === 'roadGate') {
      drawWorldRoadSign(obj.x, obj.y, obj.label || 'ROAD', { compact:true });
    } else if (obj.kind === 'npc') {
      drawIsoCampNpc(obj.npc, p);
    }
  }


  function drawWorldRoadSign(x, y, label, options = {}) {
    const compact = !!options.compact;
    drawIsoShadow(x, y, compact ? 60 : 76, compact ? 14 : 18, .25);
    const left = worldToScreen(x - (compact ? 34 : 48), y, 0);
    const right = worldToScreen(x + (compact ? 34 : 48), y, 0);
    ctx.save();
    ctx.strokeStyle = '#594128';
    ctx.lineWidth = compact ? 7 : 9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(left.x, left.y);
    ctx.lineTo(left.x, left.y - (compact ? 62 : 82));
    ctx.moveTo(right.x, right.y);
    ctx.lineTo(right.x, right.y - (compact ? 62 : 82));
    ctx.stroke();
    const center = worldToScreen(x, y, compact ? 52 : 70);
    const width = compact ? 112 : 162;
    const height = compact ? 28 : 36;
    ctx.fillStyle = '#84613a';
    ctx.strokeStyle = '#39291c';
    ctx.lineWidth = 3;
    ctx.fillRect(center.x - width / 2, center.y - height / 2, width, height);
    ctx.strokeRect(center.x - width / 2, center.y - height / 2, width, height);
    ctx.fillStyle = '#efe0b9';
    ctx.font = `bold ${compact ? 10 : 12}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(label).toUpperCase(), center.x, center.y + 1, width - 10);
    ctx.restore();
  }

  function drawOverworldGate(gate) {
    drawIsoGroundEllipse(gate.x, gate.y, 96, 72, 'rgba(209,183,125,.10)', 'rgba(236,218,166,.22)', 2);
    drawWorldRoadSign(gate.signX ?? gate.x, gate.signY ?? gate.y, gate.label);
  }

  const OVERWORLD_OBJECT_CACHE = new Map();
  function getOverworldObjects(zoneId) {
    if (OVERWORLD_OBJECT_CACHE.has(zoneId)) return OVERWORLD_OBJECT_CACHE.get(zoneId);
    const zone = OVERWORLD_ZONES[zoneId];
    const objects = [];
    if (!zone) return objects;

    if (zoneId === 'forestCrossroads') {
      const roadCurves = GREENWOOD_PATHS.map(path => sampleWorldCurve(path, 7));
      for (let i = 0; i < 132; i += 1) {
        const x = 90 + ((i * 397) % (zone.w - 180));
        const y = 90 + ((i * 613) % (zone.h - 180));
        const onRoad = roadCurves.some(path => distanceToWorldPath(x, y, path) < 205);
        const nearCenter = dist(x, y, zone.w / 2, zone.h / 2) < 410;
        const nearGate = zone.gates.some(gate => dist(x,y,gate.x,gate.y)<220 || dist(x,y,gate.signX,gate.signY)<130);
        if (onRoad || nearCenter || nearGate) continue;
        objects.push({ kind:'tree', resourceIndex:i, x, y, size:25+(i%5)*6, depth:x+y });
        if (i % 7 === 0) objects.push({ kind:'bush', x:x+48, y:y-26, size:18+(i%3)*5, depth:x+y+22 });
      }
      for (let i = 0; i < 18; i += 1) {
        const a = i / 18 * TAU + .12;
        const r = 455 + (i % 4) * 54;
        const x = zone.w / 2 + Math.cos(a) * r;
        const y = zone.h / 2 + Math.sin(a) * r;
        if (roadCurves.some(path => distanceToWorldPath(x,y,path)<120)) continue;
        objects.push({ kind:'rock', x, y, size:16+(i%4)*5, depth:x+y });
      }
    } else if (zoneId === 'riverForest') {
      for (let i = 0; i < 128; i += 1) {
        const x = 90 + ((i * 431) % (zone.w - 180));
        const y = 80 + ((i * 587) % (zone.h - 160));
        if (x > 1050 && x < 1950) continue;
        if (Math.abs(y - zone.h / 2) < 205 && x > 880) continue;
        if (dist(x,y,2910,1200)<230 || dist(x,y,2700,985)<140) continue;
        objects.push({ kind:'tree', resourceIndex:i, x, y, size:24+(i%5)*6, depth:x+y });
      }
      // Smooth water-worn stones stay on the banks, never on the wooden bridge.
      for (let i = 0; i < 28; i += 1) {
        const side = i % 2 ? -1 : 1;
        const x = zone.w / 2 + side * (365 + (i % 5) * 27);
        const y = 135 + ((i * 271) % (zone.h - 270));
        const onBridge = x > 960 && x < 2040 && y > 1015 && y < 1385;
        if (onBridge) continue;
        objects.push({ kind:'riverRock', x, y, size:17+(i%4)*6, depth:x+y });
      }
      // A handful of jagged stones break up the smooth river-rock silhouette on the grass and dirt banks.
      for (const [i, rock] of [
        {x:820,y:430,size:24},{x:930,y:760,size:19},{x:770,y:1610,size:27},{x:980,y:1960,size:20},
        {x:2160,y:390,size:26},{x:2050,y:720,size:18},{x:2235,y:1600,size:24},{x:2070,y:2020,size:21},
        {x:560,y:1240,size:18},{x:2420,y:1390,size:22}
      ].entries()) objects.push({kind:'rock',...rock,depth:rock.x+rock.y+i*.01});
    } else if (zoneId === 'rockyCanyon') {
      for (let i = 0; i < 54; i += 1) {
        const side = i % 2 ? 1 : -1;
        const x = zone.w / 2 + side * (660 + (i % 7) * 88);
        const y = 120 + ((i * 317) % (zone.h - 240));
        objects.push({ kind:'canyonPillar', x, y, size:42+(i%5)*11, height:105+(i%4)*38, depth:x+y });
      }
      // Surround the basin with a broken ring of tall canyon formations. The southern gate corridor remains open.
      let edgeIndex = 0;
      const addEdgePillar = (x,y) => {
        if (y > zone.h - 250 && Math.abs(x - 1500) < 330) return;
        const size = 48 + (edgeIndex % 5) * 9;
        const height = 145 + (edgeIndex % 4) * 34;
        objects.push({kind:'canyonPillar',x,y,size,height,edge:true,depth:x+y});
        edgeIndex += 1;
      };
      for (let x=120;x<=zone.w-120;x+=175) { addEdgePillar(x,105+(edgeIndex%2)*35); addEdgePillar(x,zone.h-105-(edgeIndex%3)*28); }
      for (let y=260;y<=zone.h-260;y+=175) { addEdgePillar(105+(edgeIndex%2)*35,y); addEdgePillar(zone.w-105-(edgeIndex%3)*28,y); }
      for (let i = 0; i < 44; i += 1) {
        const x = 160 + ((i * 479) % (zone.w - 320));
        const y = 150 + ((i * 349) % (zone.h - 300));
        if (Math.abs(x - zone.w / 2) < 420) continue;
        if (y > zone.h-260 && Math.abs(x-1500)<360) continue;
        objects.push({ kind:'rock', x, y, size:18+(i%5)*7, depth:x+y });
      }
    } else if (zoneId === 'farmPlots') {
      const farmCurve = sampleWorldCurve(FARM_ENTRY_PATH, 8);
      for (let i = 0; i < 42; i += 1) {
        const x = 80 + ((i * 521) % (zone.w - 160));
        const y = 80 + ((i * 373) % (zone.h - 160));
        const insideFields = x > 480 && x < 2520 && y > 340 && y < 2050;
        if (insideFields || distanceToWorldPath(x,y,farmCurve)<185 || dist(x,y,1500,90)<210) continue;
        objects.push({ kind:'tree', resourceIndex:i, x, y, size:22+(i%4)*6, depth:x+y });
      }
      for (const bale of [
        {x:660,y:520},{x:940,y:1850},{x:2140,y:520},{x:2440,y:1770},{x:1820,y:380}
      ]) objects.push({kind:'hayBale',...bale,depth:bale.x+bale.y});
      for (let row = 0; row < 5; row += 1) {
        objects.push({kind:'fence',x1:470,y1:410+row*390,x2:2550,y2:410+row*390,depth:2960+row*390});
      }
    }

    OVERWORLD_OBJECT_CACHE.set(zoneId, objects);
    return objects;
  }


  function drawOverworldObject(obj) {
    if (obj.kind === 'tree') {
      if (treeIsStump(game.overworldZone, obj)) {
        const p = worldToScreen(obj.x,obj.y,0);
        drawIsoShadow(obj.x,obj.y,24,8,.24);
        ctx.fillStyle='#59402b';
        ctx.beginPath(); ctx.ellipse(p.x,p.y-7,20,10,0,0,TAU); ctx.fill();
        ctx.strokeStyle='#2e2117'; ctx.lineWidth=3; ctx.stroke();
        ctx.fillStyle='#9b764a'; ctx.beginPath(); ctx.ellipse(p.x,p.y-12,15,6,0,0,TAU); ctx.fill();
        ctx.strokeStyle='rgba(55,38,23,.7)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(p.x,p.y-12,7,0,TAU); ctx.stroke();
      } else drawCampObject(obj);
      return;
    }
    if (obj.kind === 'rock') {
      drawCampObject(obj);
      return;
    }
    const p = worldToScreen(obj.x || 0, obj.y || 0, 0);
    if (obj.kind === 'bush') {
      drawIsoShadow(obj.x,obj.y,obj.size+6,8,.22);
      ctx.fillStyle='#284a2c';
      ctx.beginPath(); ctx.arc(p.x-8,p.y-15,obj.size*.72,0,TAU); ctx.fill();
      ctx.fillStyle='#3d6b3f';
      ctx.beginPath(); ctx.arc(p.x+8,p.y-20,obj.size,0,TAU); ctx.fill();
    } else if (obj.kind === 'riverRock') {
      drawIsoShadow(obj.x,obj.y,obj.size+8,8,.20);
      ctx.fillStyle='#747b72';
      ctx.beginPath();
      ctx.ellipse(p.x,p.y-5,obj.size,obj.size*.52,-.12,0,TAU);
      ctx.fill();
      ctx.strokeStyle='rgba(235,245,239,.18)'; ctx.lineWidth=2; ctx.stroke();
    } else if (obj.kind === 'canyonPillar') {
      drawIsoShadow(obj.x,obj.y,obj.size+16,18,.30);
      const base = worldToScreen(obj.x,obj.y,0);
      const top = worldToScreen(obj.x,obj.y,obj.height);
      ctx.fillStyle='#67503f';
      ctx.beginPath();
      ctx.moveTo(base.x-obj.size,base.y);
      ctx.lineTo(base.x+obj.size*.85,base.y);
      ctx.lineTo(top.x+obj.size*.55,top.y);
      ctx.lineTo(top.x-obj.size*.62,top.y);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle='#8f6b4d';
      ctx.beginPath();
      ctx.ellipse(top.x,top.y,obj.size*.64,obj.size*.30,0,0,TAU);
      ctx.fill();
      ctx.strokeStyle='rgba(255,226,181,.12)'; ctx.lineWidth=2; ctx.stroke();
    } else if (obj.kind === 'hayBale') {
      drawIsoShadow(obj.x,obj.y,48,13,.24);
      ctx.fillStyle='#bc9a45';
      ctx.beginPath(); ctx.ellipse(p.x,p.y-18,42,24,-.14,0,TAU); ctx.fill();
      ctx.strokeStyle='#6f582b'; ctx.lineWidth=4;
      ctx.beginPath(); ctx.ellipse(p.x,p.y-18,42,24,-.14,0,TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(p.x-7,p.y-41); ctx.lineTo(p.x-7,p.y+4); ctx.stroke();
    } else if (obj.kind === 'fence') {
      const a = worldToScreen(obj.x1,obj.y1,0);
      const b = worldToScreen(obj.x2,obj.y2,0);
      ctx.strokeStyle='#755534'; ctx.lineWidth=5; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(a.x,a.y-24); ctx.lineTo(b.x,b.y-24); ctx.stroke();
      ctx.lineWidth=3;
      ctx.beginPath(); ctx.moveTo(a.x,a.y-8); ctx.lineTo(b.x,b.y-8); ctx.stroke();
      for (let t=0;t<=1;t+=.1) {
        const x=lerp(obj.x1,obj.x2,t), y=lerp(obj.y1,obj.y2,t);
        const base=worldToScreen(x,y,0), top=worldToScreen(x,y,48);
        ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(base.x,base.y); ctx.lineTo(top.x,top.y); ctx.stroke();
      }
    }
  }

  function drawOverworldResource(resource) {
    if (!resource || resource.depleted || resourceRemaining(resource) <= 0) return;
    const x = resource.visualX ?? resource.x;
    const y = resource.visualY ?? resource.y;
    const p = worldToScreen(x,y,0);
    const gathering = game.gathering?.resource === resource;
    if (resource.skill === 'fishing') {
      const time = performance.now() / 1000;
      ctx.save();
      for (let i=0;i<3;i++) {
        const phase = (time * .6 + i / 3) % 1;
        const radius = 16 + phase * 62;
        ctx.globalAlpha = (1 - phase) * .72;
        ctx.strokeStyle = i === 0 ? '#b5edf1' : '#77c8d3';
        ctx.lineWidth = 3.2 - phase * 1.6;
        ctx.beginPath(); ctx.ellipse(p.x,p.y-4,radius,radius*.38,0,0,TAU); ctx.stroke();
      }
      ctx.globalAlpha = .75;
      ctx.fillStyle='#d7eef0';
      for (let i=0;i<3;i++) {
        const a=time*1.7+i*2.1;
        ctx.beginPath();ctx.arc(p.x+Math.cos(a)*24,p.y-5+Math.sin(a)*7,2.2,0,TAU);ctx.fill();
      }
      ctx.restore();
    } else if (resource.skill === 'mining') {
      const hit = gathering ? game.gathering.actionPulse : 0;
      drawIsoShadow(x,y,48,14,.32);
      ctx.save();
      ctx.translate(0, hit ? Math.sin(hit*Math.PI)*2 : 0);
      ctx.fillStyle=resource.dark || '#4f5358';
      ctx.beginPath(); ctx.moveTo(p.x-47,p.y); ctx.lineTo(p.x-29,p.y-57); ctx.lineTo(p.x+4,p.y-72); ctx.lineTo(p.x+43,p.y-33); ctx.lineTo(p.x+52,p.y+2); ctx.closePath(); ctx.fill();
      ctx.fillStyle=resource.color || '#92989e';
      ctx.beginPath(); ctx.moveTo(p.x-31,p.y-9); ctx.lineTo(p.x-15,p.y-50); ctx.lineTo(p.x+4,p.y-61); ctx.lineTo(p.x+31,p.y-31); ctx.lineTo(p.x+41,p.y-4); ctx.closePath(); ctx.fill();
      ctx.strokeStyle='rgba(255,246,220,.34)';ctx.lineWidth=3;
      ctx.beginPath();ctx.moveTo(p.x-14,p.y-45);ctx.lineTo(p.x+4,p.y-29);ctx.lineTo(p.x-2,p.y-5);ctx.moveTo(p.x+5,p.y-29);ctx.lineTo(p.x+25,p.y-42);ctx.stroke();
      ctx.restore();
    }
  }

  function drawForestCrossroadsGround(zone) {
    drawIsoGroundEllipse(zone.w/2,zone.h/2,610,540,'#3a5b36','rgba(207,231,186,.08)',2);
    for (const path of GREENWOOD_PATHS) drawWorldPath(path, 178, '#806848', 'rgba(187,151,92,.16)', 1);
    drawIsoGroundEllipse(zone.w/2,zone.h/2,350,300,'rgba(115,94,63,.72)','rgba(213,184,125,.10)',2);
  }

  function drawRiverGround(zone) {
    const riverPolygon = [{x:1160,y:0},{x:1840,y:0},{x:1770,y:2400},{x:1230,y:2400}];
    fillWorldPolygon(riverPolygon, '#285b70', 'rgba(177,223,229,.20)', 2);
    fillWorldPolygon([{x:1260,y:0},{x:1735,y:0},{x:1685,y:2400},{x:1305,y:2400}], 'rgba(74,151,169,.32)');

    // Clip the moving current marks to the actual river polygon so they never spill into the black world edge.
    ctx.save();
    pathWorldPoints(riverPolygon, 2);
    ctx.closePath();
    ctx.clip();
    const flow = (performance.now() * .12) % 230;
    for (let y = -230 + flow; y < zone.h + 230; y += 230) {
      strokeWorldLine(1320,y,1660,y+90,'rgba(211,239,240,.22)',5,2);
      strokeWorldLine(1450,y+75,1760,y+145,'rgba(211,239,240,.13)',3,2);
    }
    ctx.restore();

    fillWorldPolygon([{x:1010,y:1070},{x:1990,y:1070},{x:1990,y:1330},{x:1010,y:1330}], '#765b3d', '#473421', 3, 8);
    for (let x=1060;x<1980;x+=95) strokeWorldLine(x,1080,x,1320,'rgba(234,205,151,.18)',4,10);
    drawWorldPath([{x:0,y:1210},{x:410,y:1170},{x:760,y:1225},{x:1015,y:1200}], 150, '#776346', 'rgba(183,153,98,.12)', 1);
    drawWorldPath([{x:1985,y:1200},{x:2240,y:1170},{x:2580,y:1240},{x:3000,y:1200}], 150, '#776346', 'rgba(183,153,98,.12)', 1);
  }

  function drawCanyonGround(zone) {
    fillWorldPolygon([{x:0,y:0},{x:760,y:0},{x:1050,y:2500},{x:0,y:2500}], '#4d3c34');
    fillWorldPolygon([{x:2240,y:0},{x:3000,y:0},{x:3000,y:2500},{x:1950,y:2500}], '#4b3931');
    fillWorldPolygon([{x:930,y:0},{x:2070,y:0},{x:1900,y:2500},{x:1100,y:2500}], '#987452');
    fillWorldPolygon([{x:1230,y:0},{x:1770,y:0},{x:1700,y:2500},{x:1300,y:2500}], 'rgba(225,185,125,.10)');
    // Darker perimeter shelves make the basin feel sunk between surrounding canyon walls.
    fillWorldPolygon([{x:0,y:0},{x:3000,y:0},{x:2810,y:230},{x:190,y:230}], 'rgba(55,36,30,.38)');
    fillWorldPolygon([{x:0,y:0},{x:230,y:190},{x:230,y:2310},{x:0,y:2500}], 'rgba(55,36,30,.34)');
    fillWorldPolygon([{x:3000,y:0},{x:2770,y:190},{x:2770,y:2310},{x:3000,y:2500}], 'rgba(55,36,30,.34)');
    fillWorldPolygon([{x:0,y:2500},{x:1180,y:2500},{x:1260,y:2290},{x:210,y:2250}], 'rgba(55,36,30,.32)');
    fillWorldPolygon([{x:1820,y:2500},{x:3000,y:2500},{x:2790,y:2250},{x:1740,y:2290}], 'rgba(55,36,30,.32)');
    for (let y=220;y<zone.h;y+=340) {
      strokeWorldLine(1020,y,1260,y+80,'rgba(243,211,166,.09)',7);
      strokeWorldLine(1980,y,1740,y+80,'rgba(32,23,20,.18)',8);
    }
  }

  function drawFarmGround(zone) {
    fillWorldPolygon([{x:0,y:1040},{x:3000,y:1040},{x:3000,y:1360},{x:0,y:1360}], '#83704b');
    drawWorldPath(FARM_ENTRY_PATH, 150, '#83704b', 'rgba(196,166,104,.14)', 1);
    const fields = [
      {x1:520,y1:430,x2:1350,y2:930,color:'#725439'},
      {x1:1650,y1:430,x2:2480,y2:930,color:'#6e5136'},
      {x1:520,y1:1470,x2:1350,y2:2020,color:'#76583a'},
      {x1:1650,y1:1470,x2:2480,y2:2020,color:'#735337'},
    ];
    for (const field of fields) {
      fillWorldPolygon([{x:field.x1,y:field.y1},{x:field.x2,y:field.y1},{x:field.x2,y:field.y2},{x:field.x1,y:field.y2}],field.color,'rgba(238,219,169,.12)',2);
      for (let y=field.y1+55;y<field.y2;y+=62) {
        strokeWorldLine(field.x1+35,y,field.x2-35,y,'rgba(210,177,95,.34)',8,2);
        strokeWorldLine(field.x1+35,y+10,field.x2-35,y+10,'rgba(89,113,55,.45)',4,4);
      }
    }
    drawIsoGroundEllipse(1500,1200,430,250,'#617344','rgba(230,218,168,.10)',2);
  }


  function renderOverworldIso() {
    const zone = OVERWORLD_ZONES[game.overworldZone];
    if (!zone) return;
    drawIsoFloor(zone.floor, zone.grid);
    if (zone.id === 'forestCrossroads') drawForestCrossroadsGround(zone);
    else if (zone.id === 'riverForest') drawRiverGround(zone);
    else if (zone.id === 'rockyCanyon') drawCanyonGround(zone);
    else if (zone.id === 'farmPlots') drawFarmGround(zone);

    const drawables = getOverworldObjects(zone.id).slice();
    for (const resource of game.overworldResources || []) {
      if (!resource.depleted && resourceRemaining(resource) > 0) drawables.push({kind:'resource',resource,depth:(resource.visualX ?? resource.x)+(resource.visualY ?? resource.y)});
    }
    for (const gate of zone.gates) drawables.push({kind:'gate',gate,depth:Math.max(gate.x+gate.y,(gate.signX??gate.x)+(gate.signY??gate.y))});
    drawables.push({kind:'player',depth:game.player.x+game.player.y});
    drawables.sort((a,b)=>a.depth-b.depth);
    for (const item of drawables) {
      if (item.kind === 'player') drawIsoPlayer();
      else if (item.kind === 'gate') drawOverworldGate(item.gate);
      else if (item.kind === 'resource') drawOverworldResource(item.resource);
      else drawOverworldObject(item);
    }
    drawIsoParticles();
  }

  function renderCampIso() {
    drawIsoFloor('#31462c','rgba(190,220,173,.05)');
    fillWorldPolygon([{x:0,y:0},{x:game.roomWorld.w,y:0},{x:game.roomWorld.w,y:340},{x:0,y:340}],'#272824');
    fillWorldPolygon([{x:0,y:0},{x:240,y:0},{x:120,y:410},{x:0,y:480}],'#2b2d29');
    fillWorldPolygon([{x:game.roomWorld.w-220,y:0},{x:game.roomWorld.w,y:0},{x:game.roomWorld.w,y:520},{x:game.roomWorld.w-90,y:430}],'#2c2d2a');

    for (const [x, y, rx, ry, color] of [
      [62, 1218, 150, 105, '#675139'],
      [120, 1155, 165, 110, '#6a543b'],
      [185, 1085, 170, 118, '#6d573d'],
      [322, 1020, 155, 102, '#725b3e'],
      [486, 955, 165, 98, '#745e40'],
      [650, 898, 178, 95, '#796244'],
      [802, 845, 180, 90, '#7f6848'],
      [960, 805, 205, 110, '#765f42'],
    ]) drawIsoGroundEllipse(x, y, rx, ry, color, 'rgba(210,184,130,.09)', 1.5);

    drawIsoGroundEllipse(900,770,650,500,'#67523e','rgba(208,181,128,.18)',2);
    drawIsoGroundEllipse(1040,690,310,210,null,'rgba(255,226,164,.055)',2);

    const objects=[];
    const treeCandidates = 62;
    for(let i=0;i<treeCandidates;i++){
      let x=(i*157)%game.roomWorld.w, y=360+((i*233)%990);
      const edgeBias = i % 5;
      if (edgeBias === 0) x = 100 + (i * 91) % 290;
      else if (edgeBias === 1) x = game.roomWorld.w - 120 - ((i * 77) % 260);
      else if (edgeBias === 2) y = 360 + ((i * 157) % 200);
      if(dist(x,y,900,770)<620) continue;
      if(pointToSegmentDistance(x,y,65,1225,960,805)<135) continue;
      objects.push({kind:'tree',x,y,size:20+(i%4)*7,depth:x+y});
    }
    for (const rock of [
      { x: 260, y: 945, size: 26 }, { x: 305, y: 905, size: 18 }, { x: 1180, y: 930, size: 22 },
      { x: 1245, y: 860, size: 19 }, { x: 1440, y: 645, size: 24 }, { x: 170, y: 690, size: 17 }
    ]) objects.push({ kind:'rock', depth: rock.x + rock.y, ...rock });
    objects.push({kind:'entrance',x:760,y:235,depth:995});
    objects.push({kind:'roadGate',x:225,y:1035,label:'GREENWOOD',depth:1260});
    objects.push({kind:'tent',x:430,y:500,color:'#8b5b3e',label:'SUPPLIES',depth:930,artPrototype:true});
    objects.push({kind:'tent',x:1370,y:500,color:'#6a4136',label:'BLACKSMITH',depth:1870,artPrototype:'smithy'});
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
    const fireHazards = game.areaEffects.reduce((count, effect) => count + (effect.type === 'hazard' && effect.element === 'fire' ? 1 : 0), 0);
    const environmentalFire = (game.roomEnvironment?.zones || []).reduce((count, zone) => count + (zone.type === 'fire' || zone.type === 'lava' ? 1 : 0), 0);
    const transientFire = game.spellEffects.reduce((count, effect) => count + (['flameWave','fireBurst','meteor'].includes(effect.type) ? 1 : 0), 0);
    const totalFire = fireHazards + environmentalFire + transientFire;
    const projectileCount = game.projectiles.length;
    game.visualLoad = {
      fireHazards:totalFire,
      projectiles:projectileCount,
      fireQuality:totalFire <= 3 ? 1 : totalFire <= 6 ? .82 : totalFire <= 10 ? .66 : totalFire <= 16 ? .52 : .40,
      projectileQuality:projectileCount <= 12 ? 1 : projectileCount <= 24 ? .78 : projectileCount <= 40 ? .58 : .42,
    };
    drawIsoFloor(boss?'#28171d':'#272526',boss?'rgba(217,74,82,.10)':'rgba(207,190,157,.07)');
    drawDungeonEnvironmentGround();
    if(boss){drawIsoGroundEllipse(game.roomWorld.w/2,game.roomWorld.h/2,620,620,null,'rgba(210,76,65,.28)',7);drawIsoGroundEllipse(game.roomWorld.w/2,game.roomWorld.h/2,1020,1020,null,'rgba(210,76,65,.18)',7);}
    drawIsoAreaEffects();
    drawIsoSpellEffects();
    drawIsoWall('N',!room.cleared,false); drawIsoWall('W',!room.cleared,false);
    const drawables=[];
    for(const obstacle of game.roomEnvironment?.obstacles||[]) drawables.push({kind:'environmentObstacle',ref:obstacle,depth:(obstacle.y||obstacle.y2||0)+(obstacle.x||obstacle.x2||0)});
    for(const trap of game.roomEnvironment?.traps||[]) drawables.push({kind:'environmentTrap',ref:trap,depth:(trap.y||trap.y2||0)+(trap.x||trap.x2||0)-20});
    for(const rune of game.roomEnvironment?.runes||[]) drawables.push({kind:'environmentRune',ref:rune,depth:rune.x+rune.y-15});
    for(const f of game.roomFeatures) drawables.push({kind:'feature',ref:f,depth:f.x+f.y});
    for(const d of game.drops) drawables.push({kind:'drop',ref:d,depth:d.x+d.y+4});
    for(const e of game.enemies) if(!e.dead) drawables.push({kind:'enemy',ref:e,depth:e.x+e.y});
    for(const p of game.projectiles) drawables.push({kind:'projectile',ref:p,depth:p.x+p.y+8});
    drawables.push({kind:'player',ref:game.player,depth:game.player.x+game.player.y});
    drawables.sort((a,b)=>a.depth-b.depth);
    for(const item of drawables){
      if(item.kind==='environmentObstacle') drawEnvironmentObstacle(item.ref);
      else if(item.kind==='environmentTrap') drawEnvironmentTrap(item.ref);
      else if(item.kind==='environmentRune') drawEnvironmentRune(item.ref);
      else if(item.kind==='feature') drawIsoFeature(item.ref);
      else if(item.kind==='drop') drawIsoDrop(item.ref);
      else if(item.kind==='enemy') drawIsoEnemy(item.ref);
      else if(item.kind==='projectile') drawIsoProjectile(item.ref);
      else drawIsoPlayer();
    }
    drawIsoWall('E',!room.cleared,true); drawIsoWall('S',!room.cleared,true);
    drawIsoParticles();
    drawDungeonDarkness();
  }

  function render() {
    const w = window.innerWidth, h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);
    if (!game.player) return;
    if (game.scene !== 'dungeon') game.visualLoad = { fireHazards:0, projectiles:0, fireQuality:1, projectileQuality:1 };
    updateIsoCamera();
    if (game.scene === 'camp') renderCampIso();
    else if (game.scene === 'overworld') renderOverworldIso();
    else renderDungeonIso();
    if (game.scene === 'dungeon') renderRoomMinimap();
    else if (game.scene === 'overworld') renderOverworldMinimap();
    else game.minimapBounds = null;
    renderContextualInteractionButtons();
  }

  function renderOverworldMinimap() {
    const zone = OVERWORLD_ZONES[game.overworldZone];
    if (!zone || !game.player) { game.minimapBounds = null; return; }
    const portrait = window.innerHeight >= window.innerWidth;
    const width = portrait ? Math.min(150, window.innerWidth * .39) : 182;
    const height = portrait ? 142 : 158;
    const x = window.innerWidth - width - 12;
    const y = 78;
    game.minimapBounds = { x, y, w:width, h:height, overworld:true };
    const headerH = 23;
    const pad = 10;
    const innerW = width - pad * 2;
    const innerH = height - headerH - pad * 2;
    const totalIsoW = (zone.w + zone.h) * ISO.x;
    const totalIsoH = (zone.w + zone.h) * ISO.y;
    const miniScale = Math.min(innerW / totalIsoW, innerH / totalIsoH);
    const diamondH = totalIsoH * miniScale;
    const centerX = x + width / 2;
    const topY = y + headerH + pad + (innerH - diamondH) / 2;
    const miniPoint = (wx, wy) => ({
      x: centerX + (wx - wy) * ISO.x * miniScale,
      y: topY + (wx + wy) * ISO.y * miniScale,
    });

    ctx.save();
    ctx.fillStyle = 'rgba(10,12,11,.86)';
    ctx.strokeStyle = 'rgba(238,226,202,.44)';
    ctx.lineWidth = 2;
    const r = 12;
    ctx.beginPath();
    ctx.moveTo(x+r,y);ctx.lineTo(x+width-r,y);ctx.quadraticCurveTo(x+width,y,x+width,y+r);
    ctx.lineTo(x+width,y+height-r);ctx.quadraticCurveTo(x+width,y+height,x+width-r,y+height);
    ctx.lineTo(x+r,y+height);ctx.quadraticCurveTo(x,y+height,x,y+height-r);
    ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.84)';
    ctx.font='bold 9px sans-serif';ctx.textAlign='left';ctx.textBaseline='alphabetic';
    ctx.fillText(zone.name.toUpperCase(),x+9,y+15,width-18);

    const corners=[miniPoint(0,0),miniPoint(zone.w,0),miniPoint(zone.w,zone.h),miniPoint(0,zone.h)];
    ctx.fillStyle = zone.id==='rockyCanyon'?'rgba(118,83,57,.94)':zone.id==='riverForest'?'rgba(43,77,51,.95)':zone.id==='farmPlots'?'rgba(74,91,51,.95)':'rgba(40,72,44,.95)';
    ctx.strokeStyle='rgba(198,205,178,.55)';ctx.lineWidth=1.5;
    ctx.beginPath();corners.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fill();ctx.stroke();

    const drawMiniPolyline=(points,color,widthPx)=>{
      const curve=sampleWorldCurve(points,6).map(p=>miniPoint(p.x,p.y));
      ctx.save();ctx.strokeStyle=color;ctx.lineWidth=widthPx;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();curve.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();ctx.restore();
    };
    if(zone.id==='forestCrossroads') {
      for(const path of GREENWOOD_PATHS) drawMiniPolyline(path,'rgba(190,154,99,.82)',5.5);
      const clearing=miniPoint(zone.w/2,zone.h/2);ctx.fillStyle='rgba(156,133,89,.72)';ctx.beginPath();ctx.ellipse(clearing.x,clearing.y,12,7,0,0,TAU);ctx.fill();
    } else if(zone.id==='riverForest') {
      const river=[miniPoint(1160,0),miniPoint(1840,0),miniPoint(1770,2400),miniPoint(1230,2400)];
      ctx.fillStyle='rgba(62,137,164,.90)';ctx.beginPath();river.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fill();
      const bridge=[miniPoint(1010,1070),miniPoint(1990,1070),miniPoint(1990,1330),miniPoint(1010,1330)];
      ctx.fillStyle='rgba(150,111,69,.92)';ctx.beginPath();bridge.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fill();
      drawMiniPolyline([{x:1985,y:1200},{x:2240,y:1170},{x:2580,y:1240},{x:3000,y:1200}],'rgba(190,154,99,.82)',5);
    } else if(zone.id==='rockyCanyon') {
      const corridor=[miniPoint(930,0),miniPoint(2070,0),miniPoint(1900,2500),miniPoint(1100,2500)];
      ctx.fillStyle='rgba(174,126,79,.80)';ctx.beginPath();corridor.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fill();
      ctx.fillStyle='rgba(70,48,39,.82)';
      for(const object of getOverworldObjects(zone.id)) if(object.kind==='canyonPillar'&&object.edge){const p=miniPoint(object.x,object.y);ctx.beginPath();ctx.arc(p.x,p.y,1.35,0,TAU);ctx.fill();}
    } else if(zone.id==='farmPlots') {
      drawMiniPolyline(FARM_ENTRY_PATH,'rgba(190,154,99,.82)',5);
      for(const field of [{x1:520,y1:430,x2:1350,y2:930},{x1:1650,y1:430,x2:2480,y2:930},{x1:520,y1:1470,x2:1350,y2:2020},{x1:1650,y1:1470,x2:2480,y2:2020}]){
        const pts=[miniPoint(field.x1,field.y1),miniPoint(field.x2,field.y1),miniPoint(field.x2,field.y2),miniPoint(field.x1,field.y2)];
        ctx.fillStyle='rgba(126,89,55,.78)';ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fill();
      }
    }

    const shortLabel=(label)=>label==='Expedition Camp'?'Camp':label==='Greenwood Crossroads'?'Crossroads':label==='River Forest'?'River':label==='Rocky Canyon'?'Canyon':label==='Farm Plots'?'Farms':label;
    for(const gate of zone.gates){
      const gp=miniPoint(gate.x,gate.y);
      ctx.fillStyle='#f2c965';ctx.strokeStyle='#2d2111';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(gp.x,gp.y,3.6,0,TAU);ctx.fill();ctx.stroke();
      const label=shortLabel(gate.label);ctx.font='bold 7px sans-serif';ctx.textAlign=gp.x<centerX?'left':'right';ctx.textBaseline=gp.y<y+height/2?'top':'bottom';ctx.fillStyle='#f4e8c8';
      const lx=clamp(gp.x+(gp.x<centerX?5:-5),x+5,x+width-5);const ly=clamp(gp.y+(gp.y<y+height/2?4:-4),y+headerH+2,y+height-4);
      ctx.fillText(label,lx,ly,58);
    }

    const pp=miniPoint(game.player.x,game.player.y);
    const fp=miniPoint(game.player.x+game.player.facing.x*120,game.player.y+game.player.facing.y*120);
    ctx.fillStyle='#f6d76f';ctx.strokeStyle='#17130c';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(pp.x,pp.y,4,0,TAU);ctx.fill();ctx.stroke();
    ctx.strokeStyle='#fff1bd';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(pp.x,pp.y);ctx.lineTo(fp.x,fp.y);ctx.stroke();
    ctx.restore();
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

    // Environment geometry is visible on the minimap so hazards and walkways can be planned around.
    for (const zone of game.roomEnvironment?.zones || []) {
      if (!['pit','lava','water','deepWater','poison','ice','quicksand','corruption'].includes(zone.type)) continue;
      ctx.save();
      ctx.globalAlpha = .58;
      ctx.fillStyle = ({ pit:'#08090b', lava:'#c34f2d', water:'#386f86', deepWater:'#244f68', poison:'#4d853f', ice:'#7fb4c3', quicksand:'#8d6b3d', corruption:'#6d3e78' })[zone.type] || '#777';
      if (zone.shape === 'circle') {
        const cp = miniPoint(zone.x, zone.y);
        ctx.beginPath(); ctx.ellipse(cp.x, cp.y, Math.max(2, zone.radius * ISO.x * miniScale), Math.max(1.5, zone.radius * ISO.y * miniScale), 0, 0, TAU); ctx.fill();
      } else {
        const points=[miniPoint(zone.x1,zone.y1),miniPoint(zone.x2,zone.y1),miniPoint(zone.x2,zone.y2),miniPoint(zone.x1,zone.y2)];
        ctx.beginPath(); points.forEach((pt,i)=>i?ctx.lineTo(pt.x,pt.y):ctx.moveTo(pt.x,pt.y)); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }
    for (const obstacle of game.roomEnvironment?.obstacles || []) {
      if (obstacle.nonBlocking) continue;
      ctx.save(); ctx.fillStyle='rgba(210,202,188,.62)';
      if (obstacle.shape==='circle') { const op=miniPoint(obstacle.x,obstacle.y); ctx.beginPath(); ctx.arc(op.x,op.y,Math.max(1.8,obstacle.radius*ISO.x*miniScale),0,TAU); ctx.fill(); }
      else { const pts=[miniPoint(obstacle.x1,obstacle.y1),miniPoint(obstacle.x2,obstacle.y1),miniPoint(obstacle.x2,obstacle.y2),miniPoint(obstacle.x1,obstacle.y2)]; ctx.beginPath();pts.forEach((pt,i)=>i?ctx.lineTo(pt.x,pt.y):ctx.moveTo(pt.x,pt.y));ctx.closePath();ctx.fill(); }
      ctx.restore();
    }
    for (const rune of game.roomEnvironment?.runes || []) { const rp=miniPoint(rune.x,rune.y);ctx.fillStyle=rune.captured?'#9fe1a3':'#dfbc63';ctx.beginPath();ctx.arc(rp.x,rp.y,3.4,0,TAU);ctx.fill(); }

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
    ctx.fillStyle = '#4d4a46'; ctx.beginPath(); ctx.moveTo(470,330); ctx.lineTo(520,170); ctx.lineTo(620,96); ctx.lineTo(790,74); ctx.lineTo(930,96); ctx.lineTo(1020,170); ctx.lineTo(1070,330); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#343330'; ctx.beginPath(); ctx.moveTo(590,330); ctx.lineTo(628,224); ctx.quadraticCurveTo(694,152,760,146); ctx.quadraticCurveTo(826,152,892,224); ctx.lineTo(930,330); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#4c3a2d'; ctx.fillRect(662,118,196,22);
    ctx.fillStyle = '#d7bf85'; ctx.font = '18px Georgia'; ctx.textAlign = 'center'; ctx.fillText('THE DESCENT', 760, 135);
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
    if (item.ascensionPath && ASCENSION_PATHS[item.ascensionPath]) return ASCENSION_PATHS[item.ascensionPath].icon;
    if (item.type === 'gear') {
      if (item.slot === 'leftHand' || item.slot === 'rightHand') {
        return ({ dagger: '🗡️', sword: '⚔️', greatsword: '🗡️', spear: '🔱', hammer: '🔨' })[item.weaponType] || '⚔️';
      }
      if (item.slot === 'helmet') return '🪖';
      return ({ chest: '🛡️', legs: '👖', gloves: '🧤', boots: '🥾', ring: '💍', ringLeft: '💍', ringRight: '💍', amulet: '📿', belt: '🧷' })[item.slot] || '🛡️';
    }
    const byId = {
      lesser_health_potion: '🧪', health_potion: '🧪', greater_health_potion: '🧪', huge_health_potion: '🧪',
      lesser_mana_potion: '🔮', mana_potion: '🔮', greater_mana_potion: '🔮', huge_mana_potion: '🔮',
      lesser_stamina_potion: '⚡', stamina_potion: '⚡', greater_stamina_potion: '⚡', huge_stamina_potion: '⚡',
      healing_potion: '🧪', escape_rope: '🪢', survey_charm: '🧭', grand_survey_charm: '🗺️', ancient_survey_seal: '🔶',
      old_bone: '🦴', slime_gel: '🟢', spider_silk: '🕸️', bat_wing: '🦇', zombie_tooth: '🦷',
      shadow_essence: '🌑', cinder_ember: '🔥', iron_ore: '⛏️', copper_ore:'🟠', coal_chunk:'⬛', silver_ore:'◻️', greenwood_log:'🪵', river_fish:'🐟', dungeon_wood: '🪵', cave_fish: '🐟',
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
    if (action === 'equip' && item.ascensionPath) buttons.push(`<button class="buy-btn use-tome" data-i="${index}">Study ${ASCENSION_PATHS[item.ascensionPath]?.name || ''} Tome</button>`);
    if (action === 'equip' && isPotionItem(item)) buttons.push(`<button class="buy-btn set-potion-slot" data-slot="${potionCategory(item)}" data-id="${item.id}">Set ${POTION_SHORT[potionCategory(item)]} slot</button>`);
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

  window.__DungeonCampDebug = { game, DODGE, ISO, PLAYER_SPEED_MULTIPLIER, ENEMY_SPEED_MULTIPLIER, PLAYER_KNOCKBACK_MULTIPLIER, ARCANE_BARRIER_RADIUS, ASCENSION_PATHS, ASCENSION_NODES, normalizeAscension, ascensionRank, getAscensionBonuses, purchaseAscensionNode, showAscensionGrid, spellManaCost, ascensionTomeItem, useAscensionTome, gainXp, guaranteedDeathKeepIndices, maybeDropAscensionTome, createCharacter, normalizeEquipment, generateFloor, enterDungeon, enterRoom, enterCamp, enterOverworld, returnToCampFromWorld, travelWorldGate, OVERWORLD_ZONES, prepareOverworldResources, startGathering, endGatheringMode, applyGatheringProgress, resolvePrecisionChallenge, resolveFishingTug, getOverworldObjects, INTERACTION_RANGE_MULTIPLIER, TREE_REGROW_MS, currentFloor, currentRoom, requestAttack, fireProjectile, attemptDodge, isCombatActive, hasNearbyHostileProjectile, isAutoAttackThreatActive, handleBossDeath, updateDodgeChargeStrike, pointToSegmentDistance, screenVectorToWorld, twinStickRoles, doorWasTraversed, showMap, showStorageChest, useLootMagnet, dropInventoryIndex, addCameraShake, hitEnemy, getDerivedStats, depositInventoryIndex, withdrawStorageIndex, depositAllMaterialsAndQuestItems, showInventory, equipInventoryIndex, showSupplyShop, showSellEquipment, sellInventoryByRarity, showAutoDropMenu, safeInventoryGearEntries, gearStrength, renderCollectionGroups, spawnEnemy, enemySpawnPosition, updateEnemies, registerAimFlick, updateLiveAimFlick, isOutsideCircleFlick, isStationarySpellTap, registerSpellTap, resetTapSequence, ultimateCooldownRemainingMs, startWithCharacter, showFloorSelection, generateCampNpcAppearance, ensureCampNpcAppearances, ensureCampServices, normalizeMagic, spellSlotsUnlocked, castSpell, castEquippedSpell, toggleSpellAutoCast, stopSpellAutoCast, updateSpellAutoCast, isSpellAutoCastActive, showMageShop, showBagSmith, showSpellLoadout, showPotionLoadout, nearbyInteractables, performInteraction, interactWithTarget, updatePlayerMagic, buildAutoEquipPlan, autoEquipStatValue, createBlastTelegraph, createConeTelegraph, createVortex, updateAreaEffects, hideModal, update, render, saveGame };
  resizeCanvas();
  bindControls();
  renderSaveSlots();

  const startupParams = new URLSearchParams(location.search);
  if (startupParams.has('tentPreview')) {
    const previewCharacter = createCharacter('Art Preview');
    previewCharacter.campNpcs = [];
    startWithCharacter(0, previewCharacter);
    game.player.x = 430;
    game.player.y = 780;
    game.character.campNpcs = [];
    game.campNpcs = [];
  }

  if (startupParams.has('test')) {
    window.__dungeonTest = {
      game,
      DODGE,
      ASCENSION_PATHS,
      ASCENSION_NODES,
      normalizeAscension,
      ascensionRank,
      getAscensionBonuses,
      purchaseAscensionNode,
      showAscensionGrid,
      spellManaCost,
      ascensionTomeItem,
      useAscensionTome,
      gainXp,
      guaranteedDeathKeepIndices,
      maybeDropAscensionTome,
      pointToSegmentDistance,
      updateDodgeChargeStrike,
      showMap,
      enterDungeon,
      enterOverworld,
      returnToCampFromWorld,
      travelWorldGate,
      OVERWORLD_ZONES,
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
      showAutoDropMenu,
      safeInventoryGearEntries,
      gearStrength,
      renderCollectionGroups,
      spawnEnemy,
      enemySpawnPosition,
      updateEnemies,
      buildAutoEquipPlan,
      autoEquipStatValue,
      createBlastTelegraph,
      createConeTelegraph,
      createVortex,
      updateAreaEffects,
    };
  }

})();
