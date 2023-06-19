import { createRequire } from 'node:module'
import gulp from 'gulp'
import browserSync from 'browser-sync'
import { deleteAsync } from 'del'
import * as dartSass from 'sass'
import gulpSass from 'gulp-sass'
import through2 from 'through2';
import { EventEmitter, } from 'node:events';

browserSync.create()

const { src, dest, task, series, parallel, watch, build } = gulp
const gulpEslintConfig = {
  // Load a specific ESLint config.
  overrideConfigFile: 'eslint-custom-config.js',
  useEslintrc: false,
}
const sass = gulpSass(dartSass)
const gulpLoadPlugins = createRequire(import.meta.url)('gulp-load-plugins')
const $ = gulpLoadPlugins({ lazy: true })
const gulpImage = async () => await import('gulp-image')

const reload = browserSync.reload

const devBuild = (process.env.NODE_ENV || 'development').trim().toLowerCase()
  === 'development'
const prodBuild = process.env.NODE_ENV === 'production'
const source = 'src/'
const destination = devBuild ? 'app/' : 'dist/'
const css = {
  in: {
    css: [`${source}styles/**/*.css`],
    scss: [`${source}styles/*.+(scss|sass)`, `!${source}styles/scss/**/*.+(scss|sass)`],
    less: [`${source}styles/*.less`, `!${source}styles/less/**/*.less`]
  },
  sassOpts: {
    outputStyle: devBuild ? 'normal' : 'compressed',
    imagePath: '../images',
    precision: 3,
    errLogToConsole: true,
    sourceMap: true,
  },
}
const fonts = {
  in: `${source}fonts/**/*`,
  out: `${destination}fonts/`,
}
const html = {
  in: [`${source}*.html`],
  watch: [`${source}*.html`, `${source}_partials/**/*.html`],
  out: destination,
}
const images = {
  in: `${source}images/**`,
  out: `${destination}assets/images`,
}

// Clean tasks
task('clean', (cb) => {
  deleteAsync([`${destination}*`])
  cb()
})

// manage images
task('images', async () => {
  // const imageFilter2 = $.filter(['**/*.+(jpg|png|tiff|webp)'], {
  //   restore: true,
  // })
  return (
    src(images.in, { allowEmpty: true })
      .pipe(
        $.size({
          title: 'images in ',
        }),
      )
      .pipe($.newer(images.out))
      .pipe($.plumber())
      .pipe(
        (await gulpImage()).default({
          jpegRecompress: ['--strip', '--quality', 'medium', '--min', 40, '--max', 80],
          mozjpeg: ['-quality', 60, '-optimize', '-progressive'],
          // guetzli: ['--quality', 85],
          quiet: true,
        }),
      )
      .pipe(
        $.size({
          title: 'images out ',
        }),
      )
      .pipe(dest(images.out))
  )
})

// copy fonts
task('fonts', () => {
  return src(fonts.in, { allowEmpty: true })
    .pipe($.newer(`${destination}fonts/`))
    .pipe(dest(`${destination}fonts/`))
})

// build HTML files
task('html', () => {
  let page = src(html.in, { allowEmpty: true })
    // .pipe($.newer(html.out))
    .pipe($.preprocess({ context: html.context }))
  /* .pipe($.replace(/.\jpg|\.png|\.tiff/g, '.webp')) */
  if (prodBuild) {
    page = page
      .pipe($.size({ title: 'HTML in' }))
      .pipe($.htmlclean())
      .pipe($.size({ title: 'HTML out' }))
  }
  return page.pipe(dest(html.out))
})

// load fonts, compile sass, less
function processStyles(source, sourceType) {
  return src(source, { allowEmpty: true })
    .pipe($.if(sourceType === 'css', $.rename((path) => {
      path.extname = '.scss'
    }),))
    .pipe($.plumber())
    .on('unpipe', () => {
      $.displaylog.logger(`Compiling ${sourceType} files...`)
    })
    .pipe($.if(devBuild, $.sourcemaps.init()))
    .pipe($.if(sourceType === 'css' || sourceType === 'scss', sass({ includePaths: ['node_modules'] }).on('error', sass.logError)))
    .pipe($.if(sourceType === 'less', $.less().on('error', console.log.bind(console))))
    .pipe($.autoprefixer('last 4 version'))
    .pipe($.if(prodBuild, $.cssnano()))
    .pipe($.if(prodBuild, $.stripCssComments({ preserve: false })))
    .pipe($.if(devBuild, $.sourcemaps.write('./maps')))
    // .pipe(through2.obj(function (file, _, cb) {
    //   console.log(`Compiling ${sourceType} files completed...`)
    //   cb(null, file);
    // }))
    .pipe(dest(`${destination}css`))
    .pipe(browserSync.stream({ match: '**/*.css' }))
    .on('finish', () => {
      $.displaylog.logger(`Compiling ${sourceType} files completed.`)
    })
}

// rename css to scss and compile
task('styles:css', series('fonts', () => {
  return processStyles(css.in.css, 'css');
}));

// compile scss
task('styles:scss', series('fonts', () => {
  return processStyles(css.in.scss, 'scss');
}));

// compile less
task('styles:less', series('fonts', () => {
  return processStyles(css.in.less, 'less');
}));

// run all styles tasks
task('styles', parallel('styles:css', 'styles:scss', 'styles:less'));

// copy lib files and compile custom javasctip files
task('js', () => {
  src(`${source}js/lib/**/*.js`, { allowEmpty: true })
    .pipe(dest(`${destination}js/lib`))

  let jsCompile = src(`${source}js/script.js`, { allowEmpty: true })

    .pipe(
      $.babel({
        presets: ['@babel/env'],
      }),
    )
    .pipe($.if(devBuild, $.sourcemaps.init()))

  if (prodBuild) {
    jsCompile = jsCompile
      .pipe($.size({ title: 'JS assets in' }))
      .pipe(
        $.uglify().on('error', (err) => {
          logger.error(err.toString())
        }),
      )
      .pipe($.rename({ suffix: '.min' }))
      .pipe($.size({ title: 'JS assets out' }))
  }
  return jsCompile
    .pipe($.if(devBuild, $.sourcemaps.write('./maps')))
    .pipe(dest(`${destination}js`))
    .pipe(browserSync.reload({ stream: true, once: true }))
})

// live server with browserSync
task('browser-sync', () => {
  browserSync.init(null, {
    server: {
      baseDir: 'app',
      https: true,
    },
    open: false,
    notify: true,
  })
})

// Watch task to update changes
task(
  'watch',
  parallel('browser-sync', () => {
    // watch(['src/styles/**/*.scss', 'src/styles/**/*.less', 'src/styles/**/*.css'])
    watch(['src/styles/**/*.(css)'])
      .on('change', series('styles:css'))
    watch(['src/styles/**/*.(scss|sass)'])
      .on('change', series('styles:scss'))
    watch(['src/styles/**/*.(less)'])
      .on('change', series('styles:less'))
    watch('src/js/*.js').on('change', series('js', reload))
    watch(html.watch).on('change', series('html', reload))
  }),
)

// production build task
task('build', parallel('html', 'images', 'styles', 'js'))

// dev task
task(
  'default',
  parallel('html', 'images', 'styles', 'js', series('watch')),
)
