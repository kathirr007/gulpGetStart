var gulp = require('gulp'),
    sourcemaps = require('gulp-sourcemaps'),
    $ = require('gulp-load-plugins')({ lazy: true }),
    browserSync = require('browser-sync').create(),
    reload = browserSync.reload,
    del = require('del'),
    package = require('./package.json');


var banner = [
  '/*!\n' +
  ' * <%= package.name %>\n' +
  ' * <%= package.title %>\n' +
  ' * <%= package.url %>\n' +
  ' * @author <%= package.author %>\n' +
  ' * @version <%= package.version %>\n' +
  ' * Copyright ' + new Date().getFullYear() + '. <%= package.license %> licensed.\n' +
  ' */',
  '\n'
].join('');

var   devBuild = ((process.env.NODE_ENV || 'development').trim().toLowerCase() !== 'production'),
  source = 'src/',
  dest = devBuild ? 'app/' : 'dist/',
  html = {
    in : [source + '*.html'],
    watch : [source + '*.html', source + '_partials/**/*.html'],
    out : dest
  };

// Clean tasks
gulp.task('clean', function() {
  del([
    dest + '*'
  ]);
});
// build HTML files
gulp.task('html', function() {
  var page = gulp.src(html.in)
             // .pipe($.newer(html.out))
             .pipe($.preprocess({ context: html.context }))
             /*.pipe($.replace(/.\jpg|\.png|\.tiff/g, '.webp'))*/;
  if (!devBuild) {
      page = page
      .pipe($.size({ title: 'HTML in' }))
      .pipe($.htmlclean())
      .pipe($.size({ title: 'HTML out' }));
  }
  return page
     .pipe(gulp.dest(html.out));
});

gulp.task('css', function () {
    return gulp.src('src/scss/style.scss')
    .pipe($.sourcemaps.init())
    .pipe($.sass())
    .pipe($.autoprefixer('last 4 version'))
    .pipe(gulp.dest(dest + 'assets/css'))
    .pipe($.cssnano())
    .pipe($.rename({ suffix: '.min' }))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(dest + 'assets/css'))
    // .pipe(browserSync.reload({stream:true, once: true}));
    .pipe(browserSync.stream({match: '**/*.css'}));
});

gulp.task('js',function(){
  gulp.src('src/js/scripts.js')
    .pipe($.sourcemaps.init())
    .pipe($.jshint('.jshintrc'))
    .pipe($.jshint.reporter('default'))
    .pipe(gulp.dest(dest + 'assets/js'))
    .pipe($.uglify())
    .on('error', function (err) { $.gutil.log($.gutil.colors.red('[Error]'), err.toString()); })
    .pipe($.rename({ suffix: '.min' }))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(dest + 'assets/js'))
    .pipe(browserSync.reload({stream:true, once: true}));
});

gulp.task('browser-sync', function() {
    browserSync.init(null, {
        server: {
            baseDir: "app"
        },
        open : false
    });
    $.watch([dest + '**/*.css'], $.batch(function (events, done) {
      gulp.start(browserSync.stream(), done);
    }));
});
gulp.task('watch', function () {
    gulp.watch("src/scss/**/*.scss", ['css']);
    gulp.watch("src/js/*.js", ['js']);
    gulp.watch(html.watch, ['html', reload]);
});

gulp.task('default', ['html', 'css', 'js', 'browser-sync', 'watch']);
