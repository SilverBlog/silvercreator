import tpl from './article_block.eft'
import style from './style.css'
import getKey from './get_key.js'
import popAlert from './alert.js'
import { getPosts } from './loader.js'
import edit from './editor.js'
import md5 from 'blueimp-md5'
import axios from 'axios'

const editPost = ({state: {$data}, value}) => {
	const saved = localStorage.getItem(`smde_${$data.name}`)
	if (saved) {
		return edit({
			type: 'post',
			index: value,
			data: $data,
			useAutoSave: true
		})
	}
	axios.post(`${localStorage.getItem('site')}/control/get_post_content`, {
		'post_id': parseInt(value, 10)
	})
	.then(resp => resp.data)
	.then(data => edit({
		type: 'post',
		index: value,
		data,
		useAutoSave: false
	}))
	.catch((err) => {
		popAlert(err.message)
	})
}

const deletePost = ({state, value}) => {
	popAlert('Are you sure to delete?', () => {
		const del = (key) => {
			const salt = `${value}${state.$data.title}`
			const encode = md5(`${salt}${key}`)
			axios.post(`${localStorage.getItem('site')}/control/delete`, {
				"post_id": parseInt(value, 10),
				encode
			})
			.then(resp => resp.data)
			.then((data) => {
				if (data.status) return getPosts(() => popAlert('Deleted successfully.'))
				popAlert('Wrong password, please try again.', () => getKey(del))
			})
			.catch((err) => {
				popAlert(err.message)
			})
		}
		const key = sessionStorage.getItem('siteKey')
		if (!key) return getKey(del)
		del(key)
	})
}

const open = ({value}) => {
	window.open(`${localStorage.getItem('site')}/${value}`)
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
