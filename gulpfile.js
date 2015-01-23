'use strict';

// gulp
var gulp = require('gulp');
var cached = require('gulp-cached');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
var del = require('del');

// css
var suitcss = require('gulp-suitcss');

// js
var watchify = require('watchify');
var browserify = require('browserify');
var coffeeify = require('coffeeify');
var reactify = require('reactify');
var sourcemaps = require('gulp-sourcemaps');

// dev/deploy
var http = require('http');
var path = require('path');
var ecstatic = require('ecstatic');
var liveReload = require('gulp-livereload');
var ghPages = require('gulp-gh-pages');

var paths = {
  src: 'src/',
  dist: 'dist/',
  tmp: 'tmp/',
  fonts: 'node_modules/adamrneary-base-css/fonts/*'
};
paths.static = [
  join(paths.src, '**/*'),
  'node_modules/d3/d3.js',
  join('!', paths.src, '**/*.css'),
  join('!', paths.src, '**/*.js'),
  join('!', paths.src, '**/*.coffee')
]
paths.css = join(paths.src, 'css/*.css');
paths.js = join(paths.src, 'js/app.coffee');

var bundleCache = {};
var pkgCache = {};
function join (){
  return Array.prototype.slice.call(arguments).join('');
}

// development
// ============================================================================

gulp.task('dev:clean', function (cb) {
  del(paths.tmp, cb);
});

gulp.task('dev:static', function(){
  return gulp.src(paths.static)
    .pipe(cached('static'))
    .pipe(gulp.dest(paths.tmp))
    .pipe(liveReload())
});

gulp.task('dev:fonts', function(){
  return gulp.src(paths.fonts)
    .pipe(gulp.dest(join(paths.tmp, 'fonts/')))
});

gulp.task('dev:css', function(){
  // Note: We do not include subfolders in the source glob
  return gulp.src(paths.css)
    .pipe(suitcss())
    .pipe(gulp.dest(join(paths.tmp, 'css/')))
    .pipe(liveReload());
});

var appBundler = watchify(
  browserify({
    entries: "./" + paths.js,
    cache: bundleCache,
    packageCache: pkgCache,
    fullPaths: true,
    standalone: 'demo',
    debug: true
  })
);
appBundler.transform(coffeeify);
// appBundler.exclude('jquery');
//
gulp.task('dev:js', function(){
  return appBundler.bundle()
    // browserify -> gulp transfer
    .pipe(gulp.src('app.js'))
    // .pipe(buffer())
    .pipe(cached('app-js'))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(join(paths.tmp, 'js/')))
    .pipe(liveReload());
});

gulp.task("dev", function(callback) {
  return runSequence(
    ['dev:clean'],
    // ['dev:static', 'dev:fonts', 'dev:css', 'dev:js'],
    ['dev:static', 'dev:fonts', 'dev:css'],
    callback
  );
});

gulp.task('server', function(cb){
  var port = parseInt(process.env.PORT) || 9090;
  var rootFolder = path.join(__dirname, paths.tmp);
  var server = http.createServer(ecstatic({root: rootFolder}));
  server.listen(port, cb);
});

gulp.task('watch', function(){
  gulp.watch(paths.css, ['dev:css']);
  // appBundler.on('update', function(){
  //   gulp.start('dev:js');
  // });
  gulp.watch(paths.static, ['dev:static']);
});

gulp.task('default', function(callback) {
  return runSequence(
    ['dev'],
    ['server', 'watch'],
    callback
  );
});

// // dist
// // ============================================================================
//
// gulp.task('dist:css', function(){
//   gulp.src(join(paths.src, 'index.less'))
//     .pipe(cached('dist-css'))
//     .pipe(less())
//     .pipe(rename(join(libName, '.css')))
//     .pipe(gulp.dest(paths.dist))
// });
//
// var distBundler = watchify(
//   browserify(join('./', paths.src, 'index.js'), {
//     cache: bundleCache,
//     packageCache: pkgCache,
//     fullPaths: true,
//     standalone: libName,
//     debug: true
//   })
// );
// distBundler.transform(reactify);
//
// gulp.task('dist:js', function(){
//   var browserifyStream = distBundler.bundle()
//     // browserify -> gulp transfer
//     .pipe(source(join(libName, '.js')))
//     .pipe(buffer())
//     .pipe(cached('dist-js'))
//     .pipe(sourcemaps.init({loadMaps: true}))
//     .pipe(sourcemaps.write('.'))
//     .pipe(gulp.dest(paths.dist));
//
//   var lintStream = gulp.src(paths.js)
//     .pipe(jshint())
//     .pipe(jshint.reporter('jshint-stylish'));
//
//   return merge(browserifyStream, lintStream);
// });
//
// gulp.task('dist', ['dist:css', 'dist:js']);
//
// // deploy
// // ============================================================================
//
// gulp.task('gh-pages', function(){
//   return gulp.src(join(paths.tmp, paths.dist, '**/*'))
//     .pipe(ghPages());
// });
//
// gulp.task('deploy', function(callback) {
//   return runSequence(
//     ['dist', 'demo'],
//     ['gh-pages'],
//     callback
//   );
// });
