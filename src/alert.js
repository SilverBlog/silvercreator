import tpl from './alert.eft'
import Container from './alert_container.eft'
import style from './style.css'
import {onNextRender} from 'ef-core'

let alertShowing = false

const alertContainer = new Container()

const alertBox = new tpl({$data: {style}})

const hideAlert = () => {
	alertShowing = false
	alertBox.$data.shown = ''
	setTimeout(() => {
		if (alertShowing) return
		alertBox.$umount()
	}, 300)
}
alertBox.$methods.hide = () => {
	hideAlert()
}

const next = ({state: {$methods}, state}) => {
	if ($methods.cb) $methods.cb()
	$methods.cb = null
	alertBox.$methods.next = null
	hideAlert({state})
}

const showAlert = () => {
	alertShowing = true
	alertBox.$data.shown = style.shown
}

const popAlert = (info, cb) => {
	// alertBox.$data.shown = ''
	alertBox.$data.info = info
	alertBox.$methods.next = next
	alertBox.$methods.cb = cb
	onNextRender(showAlert)
	alertContainer.contents.push(alertBox)
}

export { popAlert, hideAlert, alertContainer }
