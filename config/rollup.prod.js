// Import base config
import base from './rollup.base'

const { input, name, plugins, proPath, bundle, external, globals } = base

const config = {
	input,
	output: {
		name,
		file: `${proPath}/${bundle}.js`,
		format: 'iife'
	},
	plugins,
	external,
	globals
}

export default config
