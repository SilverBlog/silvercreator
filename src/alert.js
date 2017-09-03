import tpl from './alert.eft'
import style from './style.css'
import body from './body.js'
import {onNextRender} from 'ef-core'

const alertBox = new tpl({$data: {style}})

const hideAlert = ({state}) => {
	state.$data.shown = ''
	setTimeout(() => state.$umount(), 300)
}
alertBox.$methods.hide = hideAlert

const next = ({state: {$methods}, state}) => {
	if ($methods.cb) $methods.cb()
	$methods.cb = null
	alertBox.$methods.next = null
	hideAlert({state})
}

const showAlert = () => {
	alertBox.$data.shown = style.shown
}

const popAlert = (info, cb) => {
	alertBox.$data.info = info
	alertBox.$methods.next = next
	alertBox.$methods.cb = cb
	onNextRender(showAlert)
	body.contents.push(alertBox)
}

export default popAlert
