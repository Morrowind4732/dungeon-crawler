# Dungeon Crawler — Isometric Patch 28

Open `index.html` in a modern desktop or mobile browser. No server, package installation, or external assets are required.

## Patch 28 — Overworld gathering skills

- Added dedicated full-screen Gathering Mode that hides combat controls and prevents accidental gameplay inputs.
- Fishing spots now appear as animated circular ripples in Riverwood. Fishing uses a moving timing meter and optional Tug input while passive fishing continues automatically.
- Stonebreak Canyon rolls a fresh RNG ore-node population each time it is entered, ranging from completely empty to rare rich formations.
- Overworld trees can now be chopped. Felled trees become visible stumps and regrow after approximately 30 seconds, including while the player is in another zone.
- Mining and Woodcutting use optional precision targets that appear across the available play area. Accurate hits speed depletion and therefore increase XP and materials earned per minute.
- Gathering always progresses passively. Missed or ignored skill checks never reduce rewards or halt the activity.
- Added persistent Mining, Fishing, and Woodcutting XP progression using the existing character skill save data.
- Added visible resource depletion, skill XP, session loot, completion summaries, and a large bottom-right Cancel button.
- Increased all contextual interaction detection distances by 25%.

## Patch 27 — Next-generation dungeon rooms

Patch 27 rebuilds dungeon-room generation as a layered system. Each persistent room receives a geometry archetype, an optional environmental modifier, interactive hazards, tactical obstacles, and—where appropriate—a room objective. The generated layout is saved with the floor and remains stable when revisiting that room.

### Larger combat arenas

- Standard rooms increased to **1900 × 1700** world units.
- Large special rooms use **2200 × 1900** world units.
- Boss arenas increased to **3000 × 2800** world units.
- Enemy placement, doors, player entry, camera framing, minimap scaling, and safe-spawn checks adapt to the new dimensions.

### Room archetypes

The generator now contains **38 room archetypes**, including:

- Bottomless chasms with narrow bridges and island routes.
- Lava islands, flooded currents, poison bogs, ice floors, and sinking sand.
- Pillar mazes, broken courtyards, four-platform arenas, and spiral ruins.
- Spike galleries, rotating blade clocks, flame traps, rolling hazards, and collapsing floors.
- Capture-rune rooms, portal sieges, survival rooms, mirror battles, and moving safe zones.
- Darkness chambers, living-dungeon rooms, clockwork foundries, treasure vaults, frozen-brazier rooms, gravity chambers, time fractures, echo chambers, and rotating arenas.
- Themed spider nests, bat roosts, skeleton crypts, demon furnaces, statue galleries, healing altars, silence chambers, repulsion chambers, and wind chambers.

### Environmental modifiers

Rooms can also receive one of **14 modifiers** such as Burning, Flooded, Frozen, Poisoned, Darkened, Haunted, Infested, Unstable Magic, Healing Pulse, Projectile Storm, Crumbling, Exhausting, or Arcane Wind. Archetypes and modifiers combine, allowing the same room geometry to play differently on separate floors.

### Tactical hazards and objectives

- Pits, lava, fire, poison, deep water, currents, ice, and quicksand affect both the player and enemies where appropriate.
- Floor spikes, flame jets, rotating blades, boulders, collapsing tiles, gravity wells, and repulsion fields use visible, timed behavior rather than unavoidable damage.
- Capture rooms require claiming runes while enemies contest them.
- Portal and nest rooms continue producing reinforcements until their seals are closed.
- Survival rooms escalate through timed waves before the remaining enemies can be finished.
- Treasure vaults reward greed but become more dangerous with every additional chest opened.
- Mirror rooms create an enemy echo based on the current adventurer.
- Moving-safe-zone rooms force the fight to travel across the arena.

### Elemental interactions

- Ice magic freezes water into temporary crossings.
- Water magic cools lava and burning ground into temporary safe stone.
- Fire clears webs, poison growth, corruption, and ice.
- Earth magic can create temporary stone footing over dangerous terrain.
- Wind and unstable-magic rooms alter projectile behavior.
- Silence crystals can be captured to restore spellcasting inside silence chambers.

### Readability and persistence

- Hazard zones, obstacles, traps, objectives, and progress are represented on the isometric room and minimap.
- The HUD identifies the current room archetype, modifier, and objective progress.
- Safe-entry logic prevents the player or enemies from spawning inside pits, lava, walls, or other invalid terrain.
- Room layouts use deterministic saved seeds, so leaving and returning does not reroll the battlefield.

## Systems carried forward

- Simultaneous movement and second-finger action buttons from Patch 25.
- Reliable movement-stick and aim-stick dodge gestures.
- Potion Belt with health, mana, and stamina quick slots.
- Ascension Grid, rare path tomes, functional hybrid perks, and preserved grid camera position.
- Contextual interactions, smart Auto Equip, magic loadouts, gathering, quests, camp visitors, persistent loot, and the upgraded Expedition Camp.


## Patch 27 highlights

- Increased darkness-room visibility with a much larger, brighter personal light radius and softer darkness falloff.
- Entering a new room now cancels dash/movement momentum, clears active stick input, and prevents carried doorway movement from throwing you into hazards.
- Boss rooms no longer generate bottomless pits or collapsing/falling floor traps.
- Added a rare **Overrun** room modifier that creates triple enemy presence in eligible rooms.
- Added visible flow ripples and directional current markers to water/current rooms so the pull direction is readable.

## Structural cleanup revision

- Rear corner supports are now occluded by the tent body; only their short tips extend above the rear eave.
- Ridge supports no longer draw full shafts through the roof canvas. Only the exposed finial and flag mast remain visible.
- Rear guy ropes and rear trim now render behind the canvas and roof instead of crossing over front-facing surfaces.
- Front supports remain fully visible because they are physically in front of the structure.
- Roof ribs, highlights, and the repair patch now use the same interpolated roof-plane geometry as the canvas itself.
- The entrance is layered as a recessed dark interior with front-facing, tied-back curtains.
- Cache versions were bumped so mobile browsers load the corrected renderer immediately.


## Structural cleanup revision v3

- Scaled the in-engine Supplies tent up substantially so it reads as a walk-in pavilion instead of a crawlspace.
- Enlarged the entrance opening and curtain framing to better match the player scale.
- Fully removed the rear-left support tip that should be completely occluded by the roof from this camera angle.
- Added the missing visible right-side roof/gable canvas so the side no longer appears to have a broken gap.
- Rebalanced the porch, banner, lantern, cargo, and ropes to match the larger structure.


## Refinement revision v4

- Reworked the Supplies sign into a dedicated front signboard so the label no longer gets swallowed by the curtain overlap.
- Rebuilt the cargo crates as proper 2.5D isometric boxes with top/front/side planes instead of flat square icons.
- Slightly rebalanced crate placement to better sit against the larger tent footprint.


## Refinement revision v5

- Replaced the flat green side prop with a dimensional wrapped supply bundle so it no longer reads like a flat sign stuck on the tent.
- Upgraded the camp storage chest into a proper 2.5D chest to match the new tent cargo treatment.


## Hotfix revision v6

- Fixed the storage-chest renderer crash caused by calling the tent-local `line3` helper outside its scope.
- Added a shared 3D world-line renderer and updated the storage chest to use it.
- Bumped browser cache versions so the corrected JavaScript loads immediately.


## Refinement revision v7

- Added camp structure collision hitboxes so the player and wandering NPCs no longer walk on top of the Supplies tent, Blacksmith building, or Storage chest.
- Upgraded the Blacksmith from the old placeholder tent into a matching next-gen smithy building with a forge bay, chimney, signboard, and workshop props.


## Refinement revision v8

- Replaced the basic camp dungeon entrance arch with a larger next-gen cave entrance built into the mountain wall.
- Added rocky buttresses, timber bracing, a darker cave mouth, descending steps, lanterns, and a title plaque so it reads as an actual cave descent rather than a plain arch.
- Updated the fallback camp-world entrance art to better match the upgraded cave style.


## Refinement revision v9

- Rebuilt the dungeon cave entrance with stronger 2.5D isometric depth, including a recessed tunnel mouth with visible side/top reveal planes and a stepped descent path that actually recedes inward.
- Shifted the cave entrance up and left so it no longer hides behind the blacksmith building nearly as much.
- Expanded the mountain wall around the entrance so the cave reads as embedded in rock instead of sitting as a flatter symbol.
