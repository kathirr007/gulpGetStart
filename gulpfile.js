let gulp = require('gulp'),
  sourcemaps = require('gulp-sourcemaps'),
  $ = require('gulp-load-plugins')({ lazy: true }),
  browserSync = require('browser-sync').create(),
  reload = browserSync.reload,
  del = require('del'),
  package = require('./package.json')

let banner = [
  '/*!\n' +
    ' * <%= package.name %>\n' +
    ' * <%= package.title %>\n' +
    ' * <%= package.url %>\n' +
    ' * @author <%= package.author %>\n' +
    ' * @version <%= package.version %>\n' +
    ' * Copyright ' +
    new Date().getFullYear() +
    '. <%= package.license %> licensed.\n' +
    ' */',
  '\n'
].join('')

let devBuild =
    (process.env.NODE_ENV || 'development').trim().toLowerCase() !==
    'production',
  source = 'src/',
  dest = devBuild ? 'app/' : 'dist/',
  images = {
    in: source + 'images/**',
    out: dest + 'assets/images'
  },
  html = {
    in: [source + '*.html'],
    watch: [source + '*.html', source + '_partials/**/*.html'],
    out: dest
  },
  css = {
    in: [source + 'styles/*.+(css|scss|sass)'],
    sassOpts: {
      outputStyle: devBuild ? 'normal' : 'compressed',
      imagePath: '../images',
      precision: 3,
      errLogToConsole: true,
      sourceMap: true
    }
  }

// Clean tasks
gulp.task('clean', function (cb) {
  del([dest + '*'])
  cb()
})

// manage images
gulp.task('images', () => {
  let imageFilter2 = $.filter(['**/*.+(jpg|png|tiff|webp)'], {
    restore: true
  })
  return (
    gulp
      .src(images.in)
      .pipe(
        $.size({
          title: 'images in '
        })
      )
      .pipe($.newer(images.out))
      .pipe($.plumber())
      .pipe(
        $.image({
          jpegRecompress: [
            '--strip',
            '--quality',
            'medium',
            '--min',
            50,
            '--max',
            80
          ],
          mozjpeg: ['-quality', 60, '-optimize', '-progressive'],
          // guetzli: ['--quality', 85],
          quiet: true
        })
      )
      // .pipe($.imagemin())
      .pipe(
        $.size({
          title: 'images out '
        })
      )
      .pipe(gulp.dest(images.out))
  )
})

// build HTML files
gulp.task('html', function () {
  let page = gulp
    .src(html.in)
    // .pipe($.newer(html.out))
    .pipe($.preprocess({ context: html.context }))
  /*.pipe($.replace(/.\jpg|\.png|\.tiff/g, '.webp'))*/
  if (!devBuild) {
    page = page
      .pipe($.size({ title: 'HTML in' }))
      .pipe($.htmlclean())
      .pipe($.size({ title: 'HTML out' }))
  }
  return page.pipe(gulp.dest(html.out))
})

gulp.task('sass', function () {
  let cssFilter = $.filter(['**/*.+(css)'], {
    restore: true
  })
  return (
    gulp
      .src(css.in)
      .pipe(cssFilter)
      .pipe(
        $.rename(function (path) {
          path.extname = '.scss'
        })
      )
      .pipe(cssFilter.restore)
      .pipe($.if(devBuild, $.sourcemaps.init()))
      .pipe($.sass().on('error', $.sass.logError))
      .pipe($.autoprefixer('last 4 version'))
      .pipe($.if(!devBuild, $.cssnano()))
      .pipe($.if(!devBuild, $.stripCssComments({ preserve: false })))
      .pipe($.if(!devBuild, $.rename({ suffix: '.min' })))
      .pipe($.if(devBuild, $.sourcemaps.write('./maps')))
      .pipe(gulp.dest(dest + 'css'))
      // .pipe(browserSync.reload({stream:true, once: true}));
      .pipe(browserSync.stream({ match: '**/*.css' }))
  )
})

gulp.task('js', function () {
  gulp.src(`${source}js/lib/**/*.js`).pipe(gulp.dest(`${dest}js/lib`))

  let jsCompile = gulp
    .src(`${source}js/script.js`)
    .pipe(
      $.babel({
        presets: ['@babel/env']
      })
    )
    .pipe($.if(devBuild, $.sourcemaps.init()))

  if (!devBuild) {
    jsCompile = jsCompile
      .pipe($.size({ title: 'JS assets in' }))
      .pipe(
        $.uglify().on('error', function (err) {
          $.gutil.log($.gutil.colors.red('[Error]'), err.toString())
        })
      )
      .pipe($.rename({ suffix: '.min' }))
      .pipe($.size({ title: 'JS assets out' }))
  }
  return jsCompile
    .pipe($.if(devBuild, $.sourcemaps.write('./maps')))
    .pipe(gulp.dest(dest + 'js'))
    .pipe(browserSync.reload({ stream: true, once: true }))
})

gulp.task('browser-sync', function () {
  browserSync.init(null, {
    server: {
      baseDir: 'app'
    },
    open: false,
    notify: true
  })
})
gulp.task(
  'watch',
  gulp.parallel('browser-sync', () => {
    gulp
      .watch(['src/styles/**/*.scss', 'src/styles/**/*.css'])
      .on('change', gulp.series('sass'))
    gulp.watch('src/js/*.js').on('change', gulp.series('js', reload))
    gulp.watch(html.watch).on('change', gulp.series('html', reload))
  })
)

gulp.task('build', gulp.parallel('html', 'images', 'sass', 'js'))
gulp.task(
  'default',
  gulp.parallel('html', 'images', 'sass', 'js', gulp.series('watch'))
)
