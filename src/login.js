import tpl from './login.eft'
import style from './style.css'
import { version } from '../package.json'

const Login = class extends tpl {
	constructor(state) {
		super({$data: {style}})
		this.$update(state)
	}
}

const getLogin = enter => new Login({
	$data: {
		address: localStorage.getItem('site'),
		version
	},
	$methods: {enter}
})

export default getLogin
