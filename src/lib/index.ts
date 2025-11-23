/**
 * @package svelte-table-views
 * @description Save and restore table view configurations with localStorage persistence
 * @author Jason (Shotley Builder)
 * @license MIT
 */

// Components
export { default as SaveViewModal } from './components/SaveViewModal.svelte'
export { default as ViewSelector } from './components/ViewSelector.svelte'

// Stores
export {
	savedViews,
	recentViews,
	activeViewId,
	activeViewModified,
	activeView,
	viewActions
} from './stores/saved-views.js'

// Types
export type {
	FilterCondition,
	SortConfig,
	TableConfig,
	SavedView,
	SavedViewInput
} from './types/index.js'
