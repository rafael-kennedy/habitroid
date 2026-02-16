# Save State Migration Scheme

Ref: [Dexie.js Versioning](https://dexie.org/docs/Tutorial/Design#database-versioning)

Habitroid uses `Dexie.js` (a wrapper around IndexedDB) for data persistence. As the application evolves, the database schema will change. We use Dexie's built-in versioning system to handle these changes gracefully without losing user data.

## How to Modify the Database Schema

1.  **Locate the Database Definition**: Open `src/services/db.ts` and find the `HabitroidDB` class.
2.  **Define a New Version**: Chain a new `.version(n)` call after the existing ones. Increment logic is handled by Dexie.
3.  **Specify Stores**: Define the schema for the new version. You only need to specify stores that are created or modified.

```typescript
// Example: Adding a new 'quests' table in version 3
this.version(3).stores({
    quests: 'id, title, reward'
});
```

## How to Migrate Data (Data Transformation)

If a schema change requires modifying *existing* data (e.g., renaming a field, adding a field with a calculated default value), use the `.upgrade()` method.

```typescript
// Example: Renaming 'cost' to 'price' in 'items' table
this.version(4).stores({
    items: 'id, name, price' // 'cost' is removed from index, 'price' added
}).upgrade(async tx => {
    await tx.table('items').toCollection().modify(item => {
        item.price = item.cost;
        delete item.cost;
    });
});
```

**Important Notes:**
- **Keep History**: Do NOT modify or delete previous `.version()` definitions. Dexie needs the history to know how to upgrade users from any previous version to the current one.
- **Non-Destructive**: Always ensure migrations are non-destructive to unrelated data.
- **Testing**: Add a test case in `src/services/db.migration.test.ts` to verify your migration logic.

## Runtime Initialization Checks

The `initializeDB()` function in `src/services/db.ts` runs on app startup. Use this for:
- Seeding initial data for new users.
- "Soft migrations" or runtime checks for data that doesn't strictly require a schema version bump (e.g., ensuring a new settings field exists with a default value if it's missing).

## Verification

Run the migration tests to ensure data integrity is maintained:

```bash
npm test src/services/db.migration.test.ts
```

## Browser Automation & State Injection

For browser automation and testing, you can programmatically inject application state. The `HabitroidState` object is exposed on the global `window` object.

### JSON Structure

The state JSON structure matches the `StateFile` interface in `src/services/stateFile.ts`:

```json
{
  "version": 1,
  "exportedAt": "2023-10-27T10:00:00.000Z",
  "data": {
    "habits": [],
    "foodEntries": [],
    "cards": [],
    "decks": [],
    "transactions": [],
    "gameResults": [],
    "settings": { ... }
  }
}
```

### Usage

**Export State:**

```javascript
const jsonString = await window.HabitroidState.exportState();
console.log(jsonString);
```

**Import State:**

```javascript
const stateJson = `{ ... }`; // Your JSON string
await window.HabitroidState.importState(stateJson);
// The app does NOT automatically reload after programmatic import.
// You must reload the page to see changes.
window.location.reload();
```
