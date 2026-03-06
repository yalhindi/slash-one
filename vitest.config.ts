import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        environment: 'node',
        globals: true,
        clearMocks: true,
        api: {
            port: 3001,
            host: '127.0.0.1'
        }
    },
})