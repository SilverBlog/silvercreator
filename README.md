# [SilverCreator](https://c.silverblog.org)
The management tool for SilverBlog

## Usage

Please make sure your server response with a header `Access-Control-Allow-Origin` set to `https://c.silverblog.org, https://silvercreator.netlify.com`, and make sure `OPTIONS` request from these sites could be accepted as well. Enter your site address in the page, enter and enjoy!

**Note:** Password is required when you are trying to modify the content such as submitting new posts or deleting a post. The password will be remembered in this session, once you close the page or open it in a new page you should enter it again.

## Run a test
```
$ git clone https://github.com/ClassicOldSong/ef.js.org.git
$ cd SilverCreator
$ npm install
$ npm run dev
```
Then you can test it out in the opening browser window.

## Build from source
```
$ git clone https://github.com/ClassicOldSong/ef.js.org.git
$ cd SilverCreator
$ npm install
$ npm run build
```
Then you can get the fresh-built result at the `dist` folder.

**Note:** All debugging messages are disabled in the production version

## License
[MIT](http://cos.mit-license.org/)
