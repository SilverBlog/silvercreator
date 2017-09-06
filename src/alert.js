import tpl from './alert.eft'
import Box from './alert_box.eft'
import style from './style.css'
import {onNextRender} from 'ef-core'

const alertContainer = new Box()

const alertBox = new tpl({$data: {style}})

const hideAlert = () => {
	alertBox.$data.shown = ''
	setTimeout(() => alertBox.$umount(), 300)
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
	alertBox.$data.shown = ''
	alertBox.$data.info = info
	alertBox.$methods.next = next
	alertBox.$methods.cb = cb
	onNextRender(showAlert)
	alertContainer.contents.push(alertBox)
}

export { popAlert, hideAlert, alertContainer }
