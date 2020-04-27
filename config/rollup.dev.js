// Import plugins
import copy from 'rollup-plugin-copy-glob'
// Import base config
import base from './rollup.base'
// Import dev plugins
import liveServer from 'rollup-plugin-live-server'

const {input, name, format, copyOptions, plugins, devPath, bundle, external, globals} = base

plugins.push(liveServer({
	root: './dev',
	open: true,
	file: 'index.html',
	ignore: '**/*.map'
}))

console.log(format)

const config = {
	input,
	external,
	output: {
		name,
		format,
		file: `${devPath}/${bundle}.js`,
		sourcemap: true,
		globals
	},
	plugins: [
		copy(...copyOptions, {verbose: true, watch: true}),
		...plugins
	],
	watch: {
		include: ['src/**']
	}
}

export default config
