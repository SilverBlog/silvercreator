import tpl from './editor.eft'
import style from './style.css'
import { getPosts, getPages, contents } from './loader.js'
import body from './body.js'
import getKey from './get_key.js'
import { popAlert } from './alert.js'
import SimpleMDE from 'simplemde'
import { inform, exec } from 'ef-core'
import md5 from 'blueimp-md5'
import axios from 'axios'

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

const savePost = ({state, state: {$data: {title, name, type}}, value}) => {
	if (!title) return popAlert('Title must not be empty!')
	let postURL = `${localStorage.getItem('site')}/control/`
	if (value === -1) postURL += 'new'
	else postURL += `edit_${type}`
	const save = (key) => {
		const content = state.mde.value()

		if (gState.fetching) return popAlert('Please wait...')
		gState.fetching = true
		axios.post(postURL, {
			'post_id': parseInt(value, 10),
			title,
			name,
			content,
			encode: md5(`${title}${key}`)
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
					if (value === -1) return popAlert('Post added successfully')
					popAlert('Post updated successfully.')
				})
				getPosts()
				return getPages(() => popAlert('Page updated successfully.'))
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
