---
description: How to create and integrate a new tower into the game
---

# Tower Authoring Workflow

Follow this process to add a new tower to Habitroid.

## 1. Generate Visuals
Run the generation script to create 5 random tower visual drafts:
```bash
npx tsx scripts/generate_tower_options.ts
```
- Examples will be saved to `tower_drafts/`.
- Open them in a browser or SVG viewer to select the best one.

## 2. Create Tower Directory
- Choose a unique ID (e.g., `c21`, `u21`, `r21`).
- Create a new directory: `src/data/towers/<ID>/`.
- Move your selected SVG to `src/data/towers/<ID>/image.svg`.

## 3. Create Definition
Create `src/data/towers/<ID>/definition.ts`. Use this template:

```typescript
import type { CardDefinition } from '../../cardDefinitions';

const image = new URL('./image.svg', import.meta.url).href;

export const CARD: CardDefinition & { visualPath: string } = {
    id: '<ID>',
    name: 'New Tower Name',
    // ... copy other properties from a similar tower ...
    visualPath: image
};
```
> **Important:** Must use `new URL(..., import.meta.url).href` for the image path to work in both Node.js scripts and the Vite app.

## 4. Register the Tower
To update the index file automatically, run:
```bash
npx tsx scripts/fix_towers_index.ts
```
Alternatively, manually edit `src/data/towers/index.ts` to export your new tower and add it to `ALL_TOWERS`.

## 5. Check Balance
Run the balance checker to see how your new tower compares to existing ones:
```bash
npx tsx scripts/check_tower_balance.ts
```
- Adjust `damage`, `fireRate`, `range`, or `cost` to align with desired efficiency scores.

## 6. Verify in Game
- Run `npm run dev`.
- Add the card to your deck or use the "Deck" screen to preview it.
