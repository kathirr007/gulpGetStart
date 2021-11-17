# gulpGetStart

A Getting start Gulp Workflow boiler-plate for Front end Dev to automate your workflow

Please check the site built using this workflow **[here](https://gulp-get-start.vercel.app/)** or **[here](https://gulp-getstart.herokuapp.com/)**

## Usage

- Run `npm install`.
- Run `gulp` or `npm run dev` for development.
- Run `gulp build` or `npm run build` for production build.

### Scaffolding

- Clone this repository
- Change the remote url
- Run `npm install`
- Update npm dependencies with `npm install npm-check -g` and then `npm-check -u`

## What is this repository for?

### Automations added

- **Updating a file whenever it is changed** so you don’t have to run a command to update it.
- **Refreshing the browser automatically** when needed so you don’t have to alt-tab and hit the refresh button manually.
- **Compile SCSS/SASS/LESS/CSS files** when needed without reloading the page for style changes.
- **Auto-prefixer for newer css styles** prefix for ***['last 4 version']*** when needed without reloading the page for style changes.
- **Stream the compiled css** when needed without reloading the page for style changes.
- **Optimizing your CSS, JavaScript, images** and running every optimization you need to make sure your website is wicked fast.

### Development Phase

There are three objectives for the development phase. They are:

- gulp tasks: `clean`, `images`, `fonts`, `styles`, `html`, `watch`, `browserSync`.
- `default` task that chains everything created into a single task.
- `build` task that builds project for production.

### Optimization Phase

- `strip-css-comments` and `cssnano` for CSS.
- `uglify` for JS.

## Useful resources

- **[Gulp.js: Web Project Workflows](https://www.linkedin.com/learning/gulp-js-web-project-workflows)** by **[Ray Villaloboss](https://github.com/planetoftheweb)**
- Getting Started with Gulp.js by **[Aleksandar Olić](https://github.com/aleksandar-olic)**

## Thanks

Based on the video tutorial course **Gulp.js: Web Project Workflows** by **[Ray Villaloboss](https://github.com/planetoftheweb)**
