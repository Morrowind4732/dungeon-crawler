# Dungeon Camp Prototype — Isometric Patch 13

Open `index.html` in a modern mobile browser. No server, package install, or external assets are required.

## Patch 13 highlights

- The full dungeon map now uses the same isometric diamond orientation as the playable rooms
- Full-map doors and routes line up with the room view: N upper-right, E lower-right, S lower-left, and W upper-left
- The current room is highlighted and automatically centered when the full map opens
- Every touch starting on the left half of the screen is permanently assigned to MOVE
- Every touch starting on the right half of the screen is permanently assigned to AIM, even with no movement touch active
- The movement stick has a larger dead zone to prevent tiny thumb drift from walking the player into enemies
- MOVE flick dodge and AIM double-flick dodge both work independently
- Auto-attack remains active while hostile ricocheting projectiles are near the player, even after the last enemy dies

## Features carried forward from Patch 12

- Weapon attacks generate a bright air-slash effect aligned to the active damage zone
- Every floor has a guaranteed free retreat through the original entrance
- Special monster variants are larger, use distinct abilities, and are identified by a subtle gold aura rather than an `ALPHA` label
- Newly generated dungeons default to Small, with purchased Medium, Large, and Huge expeditions awarding increased monster XP
- The Horned Warden uses speed phases, charges, and the special monster abilities
- New characters begin with the Camp-Forged Sword

Keyed doors and key/puzzle-gated backtracking remain reserved for a future patch.
