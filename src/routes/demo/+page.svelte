<script lang="ts">
	import { ViewSelector, SaveViewModal, activeViewId, activeViewModified, viewActions } from '$lib/index.js'
	import type { TableConfig, SavedView } from '$lib/types/index.js'

	// Example enforcement data
	const data = [
		{
			id: 1,
			type: 'Case',
			date: '2024-03-15',
			organization: 'ABC Manufacturing Ltd',
			description: 'Health & Safety violation',
			fine_amount: '£25,000',
			status: 'Closed'
		},
		{
			id: 2,
			type: 'Notice',
			date: '2024-03-10',
			organization: 'XYZ Construction',
			description: 'Improvement notice issued',
			fine_amount: '-',
			status: 'Active'
		},
		{
			id: 3,
			type: 'Case',
			date: '2024-02-28',
			organization: 'Global Logistics Inc',
			description: 'Environmental breach',
			fine_amount: '£50,000',
			status: 'Closed'
		},
		{
			id: 4,
			type: 'Notice',
			date: '2024-02-20',
			organization: 'Tech Solutions Ltd',
			description: 'Prohibition notice',
			fine_amount: '-',
			status: 'Active'
		},
		{
			id: 5,
			type: 'Case',
			date: '2024-01-15',
			organization: 'Food Services Group',
			description: 'Food safety violation',
			fine_amount: '£10,000',
			status: 'Closed'
		}
	]

	// Available columns
	const availableColumns = ['id', 'type', 'date', 'organization', 'description', 'fine_amount', 'status']

	// Table state
	let filters: any[] = []
	let sort: { columnId: string; direction: 'asc' | 'desc' } | null = null
	let columns = [...availableColumns]
	let columnOrder = [...availableColumns]

	// Saved views state
	let showSaveModal = false
	let capturedConfig: TableConfig | null = null

	// Capture current table configuration
	function captureCurrentConfig(): TableConfig {
		return {
			filters,
			sort,
			columns,
			columnOrder,
			columnWidths: {},
			pageSize: 25
		}
	}

	// Open save modal
	function handleSaveView() {
		capturedConfig = captureCurrentConfig()
		showSaveModal = true
	}

	// Update existing view
	async function handleUpdateView() {
		if (!$activeViewId) return

		try {
			const config = captureCurrentConfig()
			await viewActions.update($activeViewId, { config })
			console.log('[Demo] View updated successfully')
		} catch (err) {
			console.error('[Demo] Failed to update view:', err)
			alert('Failed to update view. Please try again.')
		}
	}

	// Load view configuration
	async function handleViewSelected(event: CustomEvent<{ view: SavedView }>) {
		const view = event.detail.view
		console.log('[Demo] Loading view:', view.name)

		// Validate and apply config
		const validColumns = view.config.columns.filter(col => availableColumns.includes(col))
		const validColumnOrder = view.config.columnOrder.filter(col => availableColumns.includes(col))

		filters = view.config.filters
		sort = view.config.sort
		columns = validColumns.length > 0 ? validColumns : [...availableColumns]
		columnOrder = validColumnOrder.length > 0 ? validColumnOrder : [...availableColumns]
	}

	// Handle view saved
	function handleViewSaved(event: CustomEvent<{ id: string; name: string }>) {
		console.log('[Demo] View saved:', event.detail.name)
	}

	// Simulate adding a filter
	function addFilter() {
		filters = [...filters, { columnId: 'status', operator: 'equals', value: 'Active' }]
		viewActions.markModified()
	}

	// Clear filters
	function clearFilters() {
		filters = []
		viewActions.markModified()
	}

	// Add sorting
	function toggleSort(columnId: string) {
		if (sort?.columnId === columnId) {
			sort = sort.direction === 'asc'
				? { columnId, direction: 'desc' }
				: null
		} else {
			sort = { columnId, direction: 'asc' }
		}
		viewActions.markModified()
	}

	// Filter data based on current filters
	$: filteredData = data.filter(row => {
		return filters.every(filter => {
			const value = row[filter.columnId as keyof typeof row]
			if (filter.operator === 'equals') {
				return value === filter.value
			}
			return true
		})
	})

	// Sort data
	$: sortedData = sort
		? [...filteredData].sort((a, b) => {
				const aVal = a[sort.columnId as keyof typeof a]
				const bVal = b[sort.columnId as keyof typeof b]
				const modifier = sort.direction === 'asc' ? 1 : -1
				return aVal < bVal ? -modifier : aVal > bVal ? modifier : 0
		  })
		: filteredData
</script>

<svelte:head>
	<title>Saved Views Demo - svelte-table-views</title>
</svelte:head>

<div class="container">
	<header>
		<h1>💾 Saved Table Views Demo</h1>
		<p>Save and restore table configurations with localStorage persistence</p>
		<p class="subtitle">
			Powered by Svelte 5 and TanStack Table
		</p>
		<nav class="nav-links">
			<a href="/">← Back to Home</a>
			<a href="https://github.com/shotleybuilder/svelte-table-views" target="_blank">GitHub</a>
			<a href="https://www.npmjs.com/package/svelte-table-views" target="_blank">npm</a>
		</nav>
	</header>

	<main>
		<section>
			<h2>✨ Interactive Demo</h2>
			<p class="description">
				Try saving different table configurations (filter, column sort).
				Your views persist in localStorage and can be quickly restored.
			</p>

			<!-- Unified Toolbar -->
			<div class="toolbar">
				<div class="toolbar-row">
					<!-- View Controls -->
					<ViewSelector on:viewSelected={handleViewSelected} />

					{#if $activeViewId && $activeViewModified}
						<!-- Split Button: Update | Save New -->
						<div class="button-group">
							<button type="button" on:click={handleUpdateView} class="btn btn-primary-left">
								<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
												d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
								</svg>
								Update View
							</button>
							<button type="button" on:click={handleSaveView} class="btn btn-primary-right">
								<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
								</svg>
								Save New
							</button>
						</div>
					{:else}
						<button type="button" on:click={handleSaveView} class="btn btn-primary">
							<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
							</svg>
							Save View
						</button>
					{/if}

					<!-- Divider -->
					<div class="toolbar-divider"></div>

					<!-- Filter Controls -->
					<button
						type="button"
						on:click={addFilter}
						class="btn btn-secondary"
						disabled={filters.length > 0}
					>
						Add Filter (Status = Active)
					</button>
					<button
						type="button"
						on:click={clearFilters}
						class="btn btn-secondary"
						disabled={filters.length === 0}
					>
						Clear Filters
					</button>
				</div>
			</div>

			<!-- Table -->
			<div class="table-wrapper">
				<table class="demo-table">
					<thead>
						<tr>
							{#each columns as col}
								<th on:click={() => toggleSort(col)}>
									<div class="th-content">
										{col}
										{#if sort?.columnId === col}
											<span class="sort-indicator">
												{sort.direction === 'asc' ? '↑' : '↓'}
											</span>
										{/if}
									</div>
								</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each sortedData as row}
							<tr>
								{#each columns as col}
									<td>{row[col]}</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<!-- Current State Debug -->
			<details class="debug-panel">
				<summary>🔍 Current Table State</summary>
				<pre><code>{JSON.stringify({
					filters,
					sort,
					columns,
					columnOrder,
					activeViewId: $activeViewId,
					modified: $activeViewModified
				}, null, 2)}</code></pre>
			</details>
		</section>

		<section>
			<h2>📋 Features</h2>
			<ul class="features">
				<li>✅ Save table configurations with custom names</li>
				<li>✅ Update existing views or save as new</li>
				<li>✅ Search and filter saved views</li>
				<li>✅ Quick access to recent views (last 7 days)</li>
				<li>✅ Rename, duplicate, and delete views</li>
				<li>✅ Keyboard navigation (Arrow keys, Enter, Escape)</li>
				<li>✅ Column validation on load</li>
				<li>✅ localStorage persistence</li>
				<li>✅ TypeScript support</li>
			</ul>
		</section>

		<section>
			<h2>🚀 Getting Started</h2>
			<pre><code>npm install svelte-table-views</code></pre>
			<pre><code>&lt;script lang="ts"&gt;
  import &#123; ViewSelector, SaveViewModal, viewActions &#125; from 'svelte-table-views';

  let showSaveModal = false;
  let capturedConfig = null;
&lt;/script&gt;

&lt;ViewSelector on:viewSelected=&#123;handleViewSelected&#125; /&gt;
&lt;button on:click=&#123;openSaveModal&#125;&gt;Save View&lt;/button&gt;

&#123;#if showSaveModal&#125;
  &lt;SaveViewModal bind:open=&#123;showSaveModal&#125; config=&#123;capturedConfig&#125; /&gt;
&#123;/if&#125;</code></pre>
		</section>
	</main>
</div>

<!-- Save View Modal -->
{#if showSaveModal && capturedConfig}
	<SaveViewModal bind:open={showSaveModal} config={capturedConfig} on:save={handleViewSaved} />
{/if}

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	header {
		text-align: center;
		margin-bottom: 3rem;
	}

	h1 {
		font-size: 2.5rem;
		margin: 0 0 0.5rem 0;
		color: #333;
	}

	header p {
		font-size: 1.2rem;
		color: #666;
		margin: 0;
	}

	.subtitle {
		font-size: 0.9rem !important;
		color: #999 !important;
	}

	.nav-links {
		margin-top: 1rem;
		display: flex;
		gap: 0.5rem;
		justify-content: center;
	}

	.nav-links a {
		display: inline-block;
		padding: 0.5rem 1rem;
		background: #f0f9ff;
		color: #0369a1;
		text-decoration: none;
		border-radius: 0.375rem;
		border: 1px solid #0ea5e9;
		font-weight: 500;
		transition: all 0.2s;
	}

	.nav-links a:hover {
		background: #0ea5e9;
		color: white;
	}

	h2 {
		font-size: 1.5rem;
		margin: 2rem 0 1rem 0;
		color: #444;
	}

	section {
		margin: 2rem 0;
	}

	.description {
		color: #666;
		line-height: 1.6;
	}

	.toolbar {
		margin-bottom: 1rem;
		padding: 1rem;
		background: #f9fafb;
		border-radius: 0.5rem;
	}

	.toolbar-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.toolbar-divider {
		width: 1px;
		height: 2rem;
		background: #d1d5db;
		margin: 0 0.25rem;
	}

	/* Style the ViewSelector to match demo theme and consistent height */
	.toolbar-row :global(.view-selector button) {
		background: white;
		color: #374151;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		font-weight: 500;
		padding: 0.5rem 1rem;
		height: 2.5rem;
		transition: all 0.2s;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.toolbar-row :global(.view-selector button:hover) {
		background: #f9fafb;
		border-color: #9ca3af;
	}

	.toolbar-row :global(.view-selector button.ring-2) {
		border-color: #4f46e5;
		box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
	}

	.button-group {
		display: inline-flex;
		border-radius: 0.375rem;
		overflow: hidden;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		font-weight: 500;
		height: 2.5rem;
		border: none;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-primary {
		background: #4f46e5;
		color: white;
		border-radius: 0.375rem;
	}

	.btn-primary:hover {
		background: #4338ca;
	}

	.btn-primary-left {
		background: #4f46e5;
		color: white;
		border-radius: 0.375rem 0 0 0.375rem;
		border-right: 1px solid #6366f1;
	}

	.btn-primary-left:hover {
		background: #4338ca;
	}

	.btn-primary-right {
		background: #4f46e5;
		color: white;
		border-radius: 0 0.375rem 0.375rem 0;
	}

	.btn-primary-right:hover {
		background: #4338ca;
	}

	.btn-secondary {
		background: white;
		color: #374151;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
	}

	.btn-secondary:hover:not(:disabled) {
		background: #f9fafb;
	}

	.btn-secondary:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.icon {
		width: 1rem;
		height: 1rem;
	}

	.table-wrapper {
		overflow-x: auto;
		border-radius: 0.5rem;
		border: 1px solid #e5e7eb;
		margin-bottom: 1rem;
	}

	.demo-table {
		width: 100%;
		border-collapse: collapse;
		background: white;
	}

	.demo-table thead {
		background: #f9fafb;
		border-bottom: 2px solid #e5e7eb;
	}

	.demo-table th {
		padding: 0.75rem 1rem;
		text-align: left;
		font-weight: 600;
		color: #374151;
		cursor: pointer;
		user-select: none;
	}

	.demo-table th:hover {
		background: #f3f4f6;
	}

	.th-content {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.sort-indicator {
		font-size: 0.875rem;
		color: #4f46e5;
	}

	.demo-table td {
		padding: 0.75rem 1rem;
		border-top: 1px solid #e5e7eb;
		color: #4b5563;
	}

	.demo-table tbody tr:hover {
		background: #f9fafb;
	}

	.debug-panel {
		margin-top: 2rem;
		padding: 1rem;
		background: #f3f4f6;
		border-radius: 0.5rem;
		border: 1px solid #d1d5db;
	}

	.debug-panel summary {
		cursor: pointer;
		font-weight: 600;
		color: #374151;
		user-select: none;
	}

	.debug-panel pre {
		margin-top: 1rem;
		padding: 1rem;
		background: #1f2937;
		color: #e5e7eb;
		border-radius: 0.375rem;
		overflow-x: auto;
	}

	.debug-panel code {
		font-family: 'Monaco', 'Courier New', monospace;
		font-size: 0.875rem;
	}

	.features {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 0.5rem;
	}

	.features li {
		padding: 0.5rem;
		background: #f0fdf4;
		border-radius: 0.375rem;
		color: #166534;
		font-size: 0.9rem;
	}

	pre code {
		display: block;
		padding: 1rem;
		background: #f3f4f6;
		border-radius: 0.375rem;
		overflow-x: auto;
		margin: 0.5rem 0;
		font-family: 'Monaco', 'Courier New', monospace;
		font-size: 0.875rem;
		color: #1f2937;
	}
</style>
