import tpl from './editor.eft'
import style from './style.css'
import { getPosts, getPages, contents } from './loader.js'
import body from './body.js'
import getKey from './get_key.js'
import popAlert from './alert.js'
import SimpleMDE from 'simplemde'
import {inform, exec} from 'ef-core'
import md5 from 'blueimp-md5'
import axios from 'axios'

const exitEditor = () => {
	body.contents = contents
}

const editor = new tpl({
	$data: {style},
	$methods: {
		cancel() {
			popAlert('Are you sure to leave?', exitEditor)
		}
	}
})
const mde = new SimpleMDE({
	element: editor.$refs.editor,
	spellChecker: false
})

const savePost = ({state: {$data: {title, name, type}}, value}) => {
	if (!title) return popAlert('Title must not be empty!')
	let postURL = `${localStorage.getItem('site')}/control/`
	if (value === -1) postURL += 'new'
	else postURL += `edit_${type}`
	const save = (key) => {
		const content = mde.value()
		axios.post(postURL, {
			'post_id': parseInt(value, 10),
			title,
			name,
			content,
			encode: md5(`${title}${key}`)
		})
		.then(resp => resp.data)
		.then((data) => {
			if (data.status) {
				body.contents = contents
				if (type === 'post') return getPosts()
				return getPages()
			}
			getKey(save)
		})
		.catch((err) => {
			popAlert(err.message)
		})
	}
	const key = sessionStorage.getItem('siteKey')
	if (!key) return getKey(save)
	save(key)
}

editor.$methods.save = savePost

const edit = (type, index, data) => {
	inform()
	editor.$data = data
	editor.$data.type = type
	editor.$data.index = index
	body.contents = [editor]
	exec()
	mde.value(data.content)
}

export default edit
