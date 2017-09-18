// Import base config
import base from './rollup.base'
// Import dev plugins
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'

const { input, name, plugins, devPath, bundle, external, globals } = base

// Add browser-sync plugin
plugins.push(serve({
	open: true,
	contentBase: 'test'
}),
livereload({
	watch: 'test'
}))

const config = {
	input,
	output: {
		name,
		file: `${devPath}/${bundle}.js`,
		format: 'iife',
		sourcemap: true,
	},
	plugins,
	external,
	globals,
	watch: {
		chokidar: true
	}
}

export default config
