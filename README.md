# Interactive atom template

```
npm install
```

### Running locally
```
npm start
```

Go to <http://localhost:8000>

### Deploying
Fill out `config.json`:
```json
{
    "title": "Title of your interactive",
    "docData": "Any associated external data",
    "path": "year/month/unique-title"
}
```

Then run
```
npm run deploy
```

#### Checking the deploy
You can check the deploy log by running
```
npm run log
```
<b>NOTE:</b> Updates can take up to 30 seconds to show in the logs

#### Embedding into Composer
Run the command below, copy the URL into Composer and click embed.
```
npm run url
```

## Usage guide
We use [SASS](http://sass-lang.com/) for better CSS, [Babel](https://babeljs.io/) for next
generation JavaScript and [Rollup](http://rollupjs.org/) for bundling.

Interactive atoms have three components:
- CSS - `src/css/main.scss`
- HTML - `src/render.js` should generate some HTML (by default returns the contents of `src/templates/main.html`)
- JS - `src/js/main.js`, by default this simply loads `src/js/app.js`

### Loading resources (e.g. assets)
Resources must be loaded with absolute paths, otherwise they won't work when deployed.
Use the template string `<%= path %>` in any CSS, HTML or JS, it will be replaced
with the correct absolute path.

```html
<img src="<%= path %>/assets/image.png" />
```

```css
.test {
    background-image: url('<%= path %>/assets/image.png');
}
```

```js
var url = '<%= path %>/assets/image.png';
```

### Atom size
Interactive atoms are baked into the initial page response so you need to be careful about
how much weight you are adding. While CSS and HTML are unlikely to ever be that large,
you should worry about the size of your JS.

The difference between `src/js/main.js` and `src/js/app.js` is that the former is baked into
the page and the latter is not. <b>Never</b> load large libraries (such as d3) in `src/js/main.js`.
In most cases, the majority of the work should happen in `src/js/app.js` and `src/js/main.js`
should be reserved for simple initialisation.

### Loading JSON
We have a ready-built component for loading JSON files. It uses the Fetch api and includes the necessary polyfills to work on most browsers. It is only designed to be used client-side.

For example:
```
import loadJson from '../components/load-json/'

loadJson("https://interactive.guim.co.uk/...)
      .then((data) => {
	  console.log(data);
      })
```

### Using the ScrollyTeller module
The ScrollyTeller module is written as a class. You can check the scrollyteller-example branch for a full example.

Import it as normal into your project
```
import ScrollyTeller from "./scrollyteller"
```

Instantiate a new instance of it and pass in a config object
```
const scrolly = new ScrollyTeller({
    parent: document.querySelector("#scrolly-1"),
    triggerTop: 1/3, // percentage from the top of the screen that the trigger should fire
    triggerTopMobile: 0.75,
    transparentUntilActive: true
});
```

Add your trigger points:
```
scrolly.addTrigger({num: 1, do: () => {
    console.log("Console log 1");
}});
```

And finally start off the scroll listener:

```
scrolly.watchScroll();
```

You'll also need to comment in the _scrolly.scss code in main.scss, as well as structuring your HTML in the following way:
```
<div id="scrolly-1">
    <div class="scroll-wrapper">
        <div class="scroll-inner">
            <svg id="data-viz">
            </svg>
        </div>
        <div class="scroll-text">
            <div class="scroll-text__inner">
                <div class="scroll-text__div">
                    <p>1</p>
                </div>
            </div>
            <div class="scroll-text__inner">
                <div class="scroll-text__div"> 
                    <p>2</p>
                </div>
            </div>
            <div class="scroll-text__inner">
                <div class="scroll-text__div">
                    <p>3</p>
                </div>
            </div>
        </div>
    </div>
</div>
```
# interactive-coronavirus-tracker-map
