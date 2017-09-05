// Import style
import style from './style.css'
// Import core functions
import { inform, exec } from 'ef-core'
inform()
// Import modules
import { Page, Header, TextLogo, Footer, Drawer,
	DrawerSection, DrawerItem } from 'neonclear'
import RightBtns from './new_btns.eft'
import body from './body.js'
import articleBlock from './article_block.js'
import getLogin from './login.js'
import edit from './editor.js'
import popAlert from './alert.js'

import toColor from './utils/string_to_color.js'
import axios from 'axios'

let site = localStorage.getItem('site')
let key = sessionStorage.getItem('siteKey')

let fetching = false

const title = new TextLogo('Silver')
const header = new Header({
	$data: {style: {classes: style.header}},
	left: [title],
	right: new RightBtns({
		$data: {style},
		$methods: {
			newPost() {
				const saved = localStorage.getItem('smde___$$autosave_for_new_post$$__')
				const editorConfig = {
					type: 'post',
					index: -1,
					data: {
						title: '',
						name: '',
						content: ''
					},
					useAutoSave: true,
					newPost: true
				}
				if (!saved) editorConfig.useAutoSave = false
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

const getPosts = () => {
	axios.post(`${site}/control/get_post_list`)
	.then(resp => resp.data)
	.then((data) => {
		// console.log(data)
		inform()
		page.contents.empty()
		for (let i in data) {
			const color = toColor(data[i].title)
			data[i].color = color
			data[i].index = i
			page.contents.push(new articleBlock(data[i]))
		}
		exec()
	})
	.catch((err) => {
		popAlert(err.message)
	})
}

const editPage = (data, index) => {
	const saved = localStorage.getItem(`smde_${data.name}`)
	if (saved) {
		return edit({
			type: 'menu',
			index,
			data,
			useAutoSave: true
		})
	}
	axios.post(`${site}/control/get_menu_content`, {
		'post_id': parseInt(index, 10)
	})
	.then(resp => resp.data)
	.then(data => edit({
		type: 'menu',
		index,
		data,
		useAutoSave: false
	}))
	.catch((err) => {
		popAlert(err.message)
	})
}

const getPages = () => {
	axios.post(`${site}/control/get_menu_list`)
	.then(resp => resp.data)
	.then((data) => {
		// console.log(data)
		inform()
		pagesSection.items.empty()
		for (let i in data) {
			pagesSection.items.push(new DrawerItem({
				$data: data[i],
				$methods: {
					click() {
						editPage(data[i], i)
					}
				}
			}))
		}
		exec()
	})
	.catch((err) => {
		popAlert(err.message)
	})
}

let login = null

const enter = ({value}) => {
	if (fetching) return
	site = value
	localStorage.setItem('site', value)
	fetching = true
	axios.post(`${site}/control/system_info`)
	.then(resp => resp.data)
	.then((data) => {
		fetching = false
		drawer.$data.title = data.author_name
		body.contents = contents
		getPosts()
		getPages()
	})
	.catch((err) => {
		fetching = false
		if (!login) login = getLogin(enter)
		body.contents = [login]
		popAlert(err.message)
	})
}

if (site && key) enter({value: site})
else {
	login = getLogin(enter)
	body.contents.push(login)
}

body.$mount({target: document.body, option: 'replace'})

window.addEventListener('load', exec, false)

export { getPosts, getPages, page, header, footer, drawer, contents }
