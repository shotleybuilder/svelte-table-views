# svelte-table-views

**Save and restore table view configurations with localStorage persistence for Svelte applications**

A lightweight, framework-agnostic Svelte package that lets users save, manage, and restore table configurations (filters, sorting, column order, visibility) as named "views". Perfect for data-heavy applications where users need to switch between different table configurations quickly.

[![npm version](https://img.shields.io/npm/v/svelte-table-views.svg)](https://www.npmjs.com/package/svelte-table-views)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🎯 **Complete Table State Management** - Save filters, sort, columns, column order, widths, and more
- 💾 **localStorage Persistence** - Views persist across sessions automatically
- 🔍 **Search & Filter** - Find views quickly with live search
- ⌨️ **Keyboard Navigation** - Arrow keys, Enter, Escape support
- ✏️ **Inline Rename** - Rename views with explicit save/cancel buttons
- 📊 **Usage Tracking** - Track how often views are used
- 🕒 **Recent Views** - Quick access to last 7 days, top 5 views
- 🔄 **Duplicate Views** - Copy existing views with one click
- ↔️ **Update vs Save New** - Smart split button when view is modified
- ✅ **Column Validation** - Gracefully handles missing columns
- 🎨 **Tailwind CSS Styled** - Beautiful, accessible UI out of the box
- 🚀 **Zero Dependencies** - Only peer dependency is Svelte
- 📦 **TypeScript Support** - Full type definitions included

## Installation

```bash
npm install svelte-table-views
```

## Quick Start

### 1. Import Components and Stores

```svelte
<script lang="ts">
  import { ViewSelector, SaveViewModal, viewActions, activeViewId, activeViewModified } from 'svelte-table-views'
  import type { TableConfig, SavedView } from 'svelte-table-views'

  let showSaveModal = false
  let capturedConfig: TableConfig | null = null

  // Your table state
  let filters = []
  let sort = null
  let columns = ['id', 'name', 'email']
  let columnOrder = ['id', 'name', 'email']
</script>
```

### 2. Add View Controls to Your Table

```svelte
<div class="flex items-center justify-between gap-4 mb-4">
  <!-- View Selector Dropdown -->
  <ViewSelector on:viewSelected={handleViewSelected} />

  <!-- Save/Update Button -->
  {#if $activeViewId && $activeViewModified}
    <!-- Split button when view is modified -->
    <div class="inline-flex">
      <button on:click={handleUpdateView}>Update View</button>
      <button on:click={openSaveModal}>Save New</button>
    </div>
  {:else}
    <button on:click={openSaveModal}>Save View</button>
  {/if}
</div>

<!-- Your Table Component -->
<YourTable {filters} {sort} {columns} {columnOrder} />

<!-- Save View Modal -->
{#if showSaveModal && capturedConfig}
  <SaveViewModal
    bind:open={showSaveModal}
    config={capturedConfig}
    on:save={handleViewSaved}
  />
{/if}
```

### 3. Implement Handlers

```typescript
function openSaveModal() {
  capturedConfig = {
    filters,
    sort,
    columns,
    columnOrder,
    columnWidths: {},
    pageSize: 25
  }
  showSaveModal = true
}

async function handleViewSelected(event: CustomEvent<{ view: SavedView }>) {
  const view = event.detail.view

  // Apply saved config to your table
  filters = view.config.filters
  sort = view.config.sort
  columns = view.config.columns
  columnOrder = view.config.columnOrder
}

async function handleUpdateView() {
  if ($activeViewId) {
    await viewActions.update($activeViewId, {
      config: {
        filters,
        sort,
        columns,
        columnOrder,
        columnWidths: {},
        pageSize: 25
      }
    })
  }
}

function handleViewSaved(event: CustomEvent<{ id: string; name: string }>) {
  console.log('View saved:', event.detail.name)
}
```

## API Reference

### Components

#### `<ViewSelector>`

Dropdown component for selecting, searching, renaming, and deleting saved views.

**Props:**
- None (controlled via stores)

**Events:**
- `viewSelected: CustomEvent<{ view: SavedView }>` - Fired when user selects a view
- `deleteView: CustomEvent<{ id: string }>` - Fired when user deletes a view

**Features:**
- Search views by name (live filtering)
- Recent views section (last 7 days, top 5)
- All views section (alphabetically sorted)
- Inline rename with save/cancel buttons
- Duplicate view
- Delete with confirmation
- Keyboard navigation (Arrow keys, Enter, Escape)

#### `<SaveViewModal>`

Modal component for saving new table views.

**Props:**
- `open: boolean` - Controls modal visibility (use `bind:open`)
- `config: TableConfig` - Table configuration to save
- `originalQuery?: string` - Optional: original NL query that generated this config

**Events:**
- `save: CustomEvent<{ id: string; name: string }>` - Fired when view is saved

**Features:**
- Name input (required, max 100 chars)
- Description input (optional, max 500 chars)
- Duplicate name detection
- Storage limit enforcement (50 views)
- Preview of what's being saved
- Keyboard shortcuts (Esc to cancel, Ctrl+Enter to save)

### Stores

#### `savedViews`

Writable store containing all saved views.

```typescript
import { savedViews } from 'svelte-table-views'

$savedViews // SavedView[]
```

#### `recentViews`

Derived store containing recent views (last 7 days, top 5, sorted by lastUsed).

```typescript
import { recentViews } from 'svelte-table-views'

$recentViews // SavedView[]
```

#### `activeViewId`

Writable store tracking the currently active view ID.

```typescript
import { activeViewId } from 'svelte-table-views'

$activeViewId // string | null
```

#### `activeViewModified`

Writable store tracking whether the active view has been modified.

```typescript
import { activeViewModified } from 'svelte-table-views'

$activeViewModified // boolean
```

#### `activeView`

Derived store containing the full active view object.

```typescript
import { activeView } from 'svelte-table-views'

$activeView // SavedView | null
```

### View Actions

#### `viewActions.save(input: SavedViewInput): Promise<SavedView>`

Save a new view.

```typescript
const newView = await viewActions.save({
  name: 'High Priority Items',
  description: 'Items with priority > 5',
  config: {
    filters: [{ columnId: 'priority', operator: 'greaterThan', value: 5 }],
    sort: { columnId: 'createdAt', direction: 'desc' },
    columns: ['id', 'name', 'priority'],
    columnOrder: ['priority', 'name', 'id'],
    columnWidths: {},
    pageSize: 25
  }
})
```

#### `viewActions.load(id: string): Promise<SavedView | undefined>`

Load an existing view. Updates usage statistics and sets as active.

```typescript
const view = await viewActions.load('view-id-123')
```

#### `viewActions.update(id: string, updates: Partial<SavedView>): Promise<void>`

Update an existing view.

```typescript
await viewActions.update('view-id-123', {
  config: updatedConfig,
  description: 'Updated description'
})
```

#### `viewActions.delete(id: string): Promise<void>`

Delete a view.

```typescript
await viewActions.delete('view-id-123')
```

#### `viewActions.rename(id: string, newName: string): Promise<void>`

Rename a view.

```typescript
await viewActions.rename('view-id-123', 'New View Name')
```

#### `viewActions.markModified(): void`

Mark the active view as modified (shows split button).

```typescript
viewActions.markModified()
```

#### `viewActions.clearActive(): void`

Clear the active view.

```typescript
viewActions.clearActive()
```

#### `viewActions.nameExists(name: string, excludeId?: string): Promise<boolean>`

Check if a view name already exists.

```typescript
const exists = await viewActions.nameExists('My View')
```

#### `viewActions.getStorageStats(): Promise<{ count: number; limit: number; percentFull: number }>`

Get storage usage statistics.

```typescript
const stats = await viewActions.getStorageStats()
console.log(`${stats.count}/${stats.limit} views (${stats.percentFull}% full)`)
```

## TypeScript Types

### `TableConfig`

```typescript
interface TableConfig {
  filters: FilterCondition[]
  sort: SortConfig | null
  columns: string[]
  columnOrder: string[]
  columnWidths: Record<string, number>
  pageSize: number
  grouping?: string[]
}
```

### `FilterCondition`

```typescript
interface FilterCondition {
  columnId: string
  operator: string
  value: any
}
```

### `SortConfig`

```typescript
interface SortConfig {
  columnId: string
  direction: 'asc' | 'desc'
}
```

### `SavedView`

```typescript
interface SavedView {
  // Identity
  id: string
  name: string
  description?: string

  // Configuration
  config: TableConfig

  // Optional: original NL query for reference
  originalQuery?: string

  // Metadata
  createdAt: number
  updatedAt: number
  usageCount: number
  lastUsed: number
}
```

### `SavedViewInput`

```typescript
type SavedViewInput = Omit<SavedView, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'lastUsed'>
```

## Advanced Usage

### Column Validation

The package automatically validates columns when loading a view:

```typescript
function handleViewSelected(event: CustomEvent<{ view: SavedView }>) {
  const view = event.detail.view
  const availableColumns = ['id', 'name', 'email', 'created_at']

  // Filter out missing columns
  const validColumns = view.config.columns.filter(col =>
    availableColumns.includes(col)
  )

  // Warn user if columns are missing
  const missingColumns = view.config.columns.filter(col =>
    !availableColumns.includes(col)
  )

  if (missingColumns.length > 0) {
    alert(`Some columns no longer exist: ${missingColumns.join(', ')}`)
  }

  // Apply valid config
  columns = validColumns
  // ... rest of config
}
```

### Custom Storage Key

The default localStorage key is `'svelte_table_views_saved_views'`. To customize it, fork the package and modify `src/lib/stores/saved-views.ts`:

```typescript
const STORAGE_KEY = 'my_app_saved_views'
```

### Storage Limit

The default limit is 50 views. To change it, modify the `getStorageStats` function:

```typescript
async getStorageStats() {
  const views = get(savedViews)
  const count = views.length
  const limit = 100 // Change this

  return { count, limit, percentFull: Math.round((count / limit) * 100) }
}
```

## Styling

The package uses Tailwind CSS classes. If you're not using Tailwind, you have two options:

### Option 1: Install Tailwind CSS

```bash
npm install -D tailwindcss
npx tailwindcss init
```

### Option 2: Override with Custom CSS

Target the component classes in your global CSS:

```css
/* Override ViewSelector styles */
.view-selector button {
  /* Your styles */
}

/* Override SaveViewModal styles */
.save-view-modal {
  /* Your styles */
}
```

## Browser Compatibility

- Modern browsers with `crypto.randomUUID()` support
- localStorage support required
- No IE11 support

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting PRs.

## License

MIT © Jason (Shotley Builder)

## Related Projects

- [@shotleybuilder/svelte-table-kit](https://github.com/shotleybuilder/svelte-table-kit) - Headless TanStack Table wrapper for Svelte
- [TanStack Table](https://tanstack.com/table) - Headless table library

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## Support

- 🐛 [Report a Bug](https://github.com/shotleybuilder/svelte-table-views/issues)
- 💡 [Request a Feature](https://github.com/shotleybuilder/svelte-table-views/issues)
- 📖 [Read the Docs](https://github.com/shotleybuilder/svelte-table-views#readme)
