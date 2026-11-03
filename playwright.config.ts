import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://localhost:4331';

export default defineConfig({
	testDir: 'tests/e2e',
	fullyParallel: true,
	reporter: 'list',
	use: { baseURL },
	webServer: {
		command: 'pnpm build && pnpm preview --port 4331 --ignore-lock',
		url: baseURL,
		reuseExistingServer: false,
		timeout: 120_000,
	},
	projects: [
		{
			name: 'escritorio',
			use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
		},
		{
			name: 'movil',
			use: {
				...devices['Desktop Chrome'],
				viewport: { width: 390, height: 844 },
				isMobile: true,
				hasTouch: true,
			},
		},
	],
});
