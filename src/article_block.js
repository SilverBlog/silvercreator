import tpl from './article_block.eft'
import style from './style.css'
import getKey from './get_key.js'
import { popAlert, hideAlert } from './alert.js'
import { getPosts } from './loader.js'
import edit from './editor.js'
import axios from 'axios'
import hmac from 'crypto-js/hmac-sha512'
import gState from './state.js'

const editPost = ({state: {$data}}) => {
	if (gState.fetching) return popAlert('Please wait...')
	const uuid = $data.uuid
	const saved = localStorage.getItem(`smde_${$data.name}`)
	if (saved) {
		return edit({
			type: 'post',
			uuid,
			data: $data,
			saved
		})
	}
	gState.fetching = true
	axios.post(`${localStorage.getItem('site')}/control/v2/get/content/post`, {
		'post_uuid': uuid
	})
	.then(resp => resp.data)
	.then((data) => {
		hideAlert()
		gState.fetching = false
		edit({
			type: 'post',
			uuid,
			data
		})
	})
	.catch((err) => {
		gState.fetching = false
		popAlert(err.message)
	})
}

const deletePost = ({state}) => {
	if (gState.fetching) return popAlert('Please wait...')
	const data = state.$data
	popAlert('Are you sure to delete?', () => {
		const del = (key) => {
			const now = new Date().getTime()
			const sign = `${hmac(`${data.uuid}${data.title}${data.name}`, `${key}${now}`)}`
			gState.fetching = true
			axios.post(`${localStorage.getItem('site')}/control/v2/delete`, {
				"post_uuid": data.uuid,
				sign,
				"send_time": now
			})
			.then(resp => resp.data)
			.then((data) => {
				gState.fetching = false
				if (data.status) return getPosts(() => popAlert('Post deleted.'))
				popAlert('Wrong password, please try again.', () => getKey(del))
			})
			.catch((err) => {
				gState.fetching = false
				popAlert(err.message)
			})
		}
		const key = sessionStorage.getItem('siteKey')
		if (!key) return getKey(del)
		del(key)
	})
}

const open = ({value}) => {
	window.open(`${localStorage.getItem('site')}/post/${value}`)
}

const articleBlock = class extends tpl {
	constructor(data) {
		super({
			$data: {style},
			$methods: {editPost, deletePost, open}
		})
		this.$update({$data: data})
	}
}

export default articleBlock
