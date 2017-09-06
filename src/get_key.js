import tpl from './get_key.eft'
import style from './style.css'
import {alertContainer} from './alert.js'
import {onNextRender} from 'ef-core'
import md5 from 'blueimp-md5'

const keyBox = new tpl({$data: {style}})

const hideKeyBox = () => {
	keyBox.$data.shown = ''
	setTimeout(() => keyBox.$umount(), 300)
}
keyBox.$methods.hide = hideKeyBox

const next = ({state, value}) => {
	if (!value) {
		state.$data.placeholder = 'Please enter your pass phrase'
		return
	}
	const hash = md5(value)
	sessionStorage.setItem('siteKey', hash)
	state.$methods.cb(hash)
	state.$methods.cb = null
	keyBox.$methods.next = null
	hideKeyBox({state})
}

const showKeyBox = () => {
	keyBox.$data.shown = style.shown
}

const getKey = (cb) => {
	keyBox.$methods.next = next
	keyBox.$methods.cb = cb
	keyBox.$data.key = ''
	onNextRender(showKeyBox)
	alertContainer.contents.push(keyBox)
}

export default getKey
