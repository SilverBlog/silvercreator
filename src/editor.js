import tpl from './editor.eft'
import style from './style.css'
import { getPosts, contents } from './loader.js'
import body from './body.js'
import getKey from './get_key.js'
import { popAlert } from './alert.js'
import SimpleMDE from 'simplemde'
import { inform, exec } from 'ef-core'
import axios from 'axios'
import hmac from 'crypto-js/hmac-sha512'
import sha512 from 'crypto-js/sha512'

import gState from './state.js'

const editor = new tpl({
	$data: {style},
	$methods: {
		cancel({state}) {
			popAlert('Are you sure to leave?', () => {
				body.contents = contents
				state.mde.toTextArea()
				state.mde = null
				state.$data.content = ''
			})
		}
	}
})

const savePost = ({state, state: {$data: {title, name, type}}, uuid}) => {
	// 發布：hmac.sha512(key:password + send_time,message:title + name + sha512(content))
	// 編輯：hmac.sha512(key:password + send_time,message:uuid + title + name + sha512(content))
	if (!title) return popAlert('Title must not be empty!')
	let postURL = `${localStorage.getItem('site')}/control/v2/`
	if (uuid) {
		postURL += `edit/${type}`
	} else {
		postURL += 'new'
	}
	const save = (key) => {
		const now = new Date().getTime()
		const content = state.mde.value()
		const sign = `${hmac(`${uuid || ""}${title}${name}${sha512(content)}`, `${key}${now}`)}`

		if (gState.fetching) return popAlert('Please wait...')
		gState.fetching = true
		axios.post(postURL, {
			'post_uuid': uuid,
			title,
			name,
			content,
			sign,
			"send_time": now
		})
		.then(resp => resp.data)
		.then((data) => {
			gState.fetching = false
			if (data.status) {
				body.contents = contents
				state.mde.value('')
				state.mde.toTextArea()
				state.mde = null
				if (type === 'post') return getPosts(() => {
					if (uuid === null) return popAlert('Post added successfully')
					popAlert('Post updated successfully.')
				})
				getPosts()
				return getPosts(() => popAlert('Page updated successfully.'))
			}
			popAlert('Wrong password, please try again.', () => getKey(save))
		})
		.catch((err) => {
			gState.fetching = false
			popAlert(err.message)
		})
	}
	const key = sessionStorage.getItem('siteKey')
	if (!key) return getKey(save)
	save(key)
}

editor.$methods.save = savePost

const edit = ({type, index, data, saved, newPost}) => {
	const editorConfig = {
		element: editor.$refs.editor,
		spellChecker: false,
		autosave: {
			enabled: true,
			uniqueId: data.name
		}
	}

	inform()
	editor.$data = data
	editor.$data.type = type
	editor.$data.index = index
	if (editor.mde) {
		editor.mde.toTextArea()
		editor.mde = null
	}
	exec()

	if (newPost) editorConfig.autosave.uniqueId = '__$$auto_save_for_new_post$$__'
	if (saved) editor.$data.content = saved

	editor.mde = new SimpleMDE(editorConfig)
	inform()
	body.contents = [editor]
	if (saved) popAlert('Auto saved content loaded.')
	exec()
}

export default edit
