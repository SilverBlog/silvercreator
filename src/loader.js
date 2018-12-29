// Import style
import style from './style.css'
// Import core functions
import { inform, exec, onNextRender } from 'ef-core'
inform()
// Import modules
import { Page, Header, TextLogo, Footer, Drawer,
	DrawerSection, DrawerItem } from 'neonclear'
import RightBtns from './new_btns.eft'
import body from './body.js'
import articleBlock from './article_block.js'
import getLogin from './login.js'
import edit from './editor.js'
import { popAlert, hideAlert } from './alert.js'

import toColor from './utils/string_to_color.js'
import axios from 'axios'
import { silver_api_version as apiVersion } from '../package.json'


import gState from './state.js'

const title = new TextLogo('Silver')
const header = new Header({
	$data: {style: {classes: style.header}},
	left: [title],
	right: new RightBtns({
		$data: {style},
		$methods: {
			newPost() {
				if (gState.fetching) return popAlert('Please wait...')
				const saved = localStorage.getItem('smde___$$auto_save_for_new_post$$__')
				const editorConfig = {
					type: 'post',
					index: -1,
					data: {
						title: '',
						name: '',
						content: ''
					},
					saved,
					newPost: true
				}
				edit(editorConfig)
			}
		}
	})
})
const footer = new Footer('SilverBolg Team')

const page = new Page({$data: {classes: style.page}})

// const articlesSection = new DrawerSection({$data: {title: 'Articles'}})
const pagesSection = new DrawerSection({$data: {title: 'Pages'}})
const drawer = new Drawer({
	contents: [
		// articlesSection,
		pagesSection
	]
})

const contents = [
	page,
	footer,
	header,
	drawer
]

const getPosts = (cb) => {
	axios.post(`${localStorage.getItem('site')}/control/v2/get/list/post`)
	.then(resp => resp.data)
	.then((data) => {
		inform()
		page.contents.empty()
		for (let i in data) {
			const color = toColor(data[i].title)
			data[i].color = color
			data[i].index = i
			page.contents.push(new articleBlock(data[i]))
		}
		exec()
		if (cb) return cb()
	})
	.catch((err) => {
		popAlert(err.message)
	})
}

const editPage = (data, index) => {
	if (gState.fetching) return popAlert('Please wait...')
	const saved = localStorage.getItem(`smde_${data.name}`)
	if (saved) {
		return edit({
			type: 'menu',
			index,
			data,
			saved
		})
	}

	gState.fetching = true
	axios.post(`${localStorage.getItem('site')}/control/get_content/menu`, {
		'post_id': parseInt(index, 10)
	})
	.then(resp => resp.data)
	.then((data) => {
		hideAlert()
		gState.fetching = false
		edit({
			type: 'menu',
			index,
			data
		})
	})
	.catch((err) => {
		gState.fetching = false
		popAlert(err.message)
	})
}

const getPages = (cb) => {
	axios.post(`${localStorage.getItem('site')}/control/v2/get/list/menu`)
	.then(resp => resp.data)
	.then((data) => {
		// console.log(data)
		inform()
		pagesSection.items.empty()
		for (let i in data) {
			const state = {
				$data: data[i],
				$methods: {}
			}
			if (data[i].absolute) state.$methods.click = () => window.open(data[i].absolute)
			else state.$methods.click = () => editPage(data[i], i)
			pagesSection.items.push(new DrawerItem(state))
		}
		exec()
		if (cb) return cb()
	})
	.catch((err) => {
		popAlert(err.message)
	})
}

let login = null

const enter = ({value}) => {
	if (gState.fetching) return popAlert('Please wait...')
	popAlert('Loading...')
	try {
		localStorage.setItem('site', (new URL(value)).origin)
	} catch (e) {
		popAlert('Invalid URL')
		throw e
	}
	getPosts()
	getPages()
	gState.fetching = true
	axios.post(`${localStorage.getItem('site')}/control/system_info`)
	.then(resp => resp.data)
	.then((data) => {
		gState.fetching = false
		inform()
		drawer.$data.title = data.author_name
		body.contents = contents
		onNextRender(hideAlert)
		exec()
		if (data.api_version < apiVersion) popAlert('API outdated.')
	})
	.catch((err) => {
		gState.fetching = false
		if (!login) login = getLogin(enter)
		body.contents = [login]
		popAlert(err.message)
	})
}

if (localStorage.getItem('site') && sessionStorage.getItem('siteKey')) enter({value: localStorage.getItem('site')})
else {
	login = getLogin(enter)
	body.contents = [login]
}

body.$mount({target: document.body, option: 'replace'})

window.addEventListener('load', exec, false)

export { getPosts, page, header, footer, drawer, contents }
