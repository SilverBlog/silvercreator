import tpl from './article_block.eft'
import style from './style.css'
import getKey from './get_key.js'
import { popAlert, hideAlert } from './alert.js'
import { getPosts } from './loader.js'
import edit from './editor.js'
import md5 from 'blueimp-md5'
import axios from 'axios'

import gState from './state.js'

const editPost = ({state: {$data}, value}) => {
	if (gState.fetching) return popAlert('Please wait...')
	const saved = localStorage.getItem(`smde_${$data.name}`)
	if (saved) {
		return edit({
			type: 'post',
			index: value,
			data: $data,
			saved
		})
	}
	gState.fetching = true
	axios.post(`${localStorage.getItem('site')}/control/get_content/post`, {
		'post_id': parseInt(value, 10)
	})
	.then(resp => resp.data)
	.then((data) => {
		hideAlert()
		gState.fetching = false
		edit({
			type: 'post',
			index: value,
			data
		})
	})
	.catch((err) => {
		gState.fetching = false
		popAlert(err.message)
	})
}

const deletePost = ({state, value}) => {
	if (gState.fetching) return popAlert('Please wait...')
	popAlert('Are you sure to delete?', () => {
		const del = (key) => {
			const salt = `${value}${state.$data.title}`
			const encode = md5(`${salt}${key}`)
			gState.fetching = true
			axios.post(`${localStorage.getItem('site')}/control/delete`, {
				"post_id": parseInt(value, 10),
				encode
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
