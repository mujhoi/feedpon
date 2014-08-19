var gulp = require('gulp');
var plugins = require('gulp-load-plugins')({camelize: true});
var argv = require('minimist')(process.argv.slice(2));
var isWatching = false;

gulp.task('bower', function(done) {
  var bower = require('bower');

  bower.commands.install().on('end', function() {
    done();
  });
});

gulp.task('copy:images', ['bower'], function() {
  return gulp.src(['bower_components/framework7/dist/img/*'])
    .pipe(gulp.dest('app/cordova/www/img'));
});

gulp.task('copy:fonts', ['bower'], function() {
  return gulp.src(['bower_components/ionicons/fonts/*'])
    .pipe(gulp.dest('app/cordova/www/fonts'));
});

gulp.task('copy:js', ['typescript'], function() {
  return gulp.src(['build/modules/feedpon/ui/workers/*'])
    .pipe(gulp.dest('app/cordova/www/js'));
});

gulp.task('copy:templates', function() {
  return gulp.src(['src/templates/*'])
    .pipe(gulp.dest('build/modules/feedpon/templates'));
});

gulp.task('jade', function() {
  return gulp.src('src/jade/*.jade')
    .pipe(isWatching ? plugins.plumber() : plugins.util.noop())
    .pipe(plugins.jade({pretty: !argv.production}))
    .pipe(gulp.dest('app/cordova/www'));
});

gulp.task('less', ['bower'], function() {
  return gulp.src('src/less/index.less')
    .pipe(isWatching ? plugins.plumber() : plugins.util.noop())
    .pipe(plugins.less({
      compress: argv.production
    }))
    .pipe(gulp.dest('app/cordova/www/css/'));
});

gulp.task('typescript', ['bower'], function() {
  return gulp.src('src/ts/**/*.ts')
    .pipe(isWatching ? plugins.plumber() : plugins.util.noop())
    .pipe(plugins.tsc({
      module: 'amd',
      noImplicitAny: true,
      target: 'ES5'
    }))
    .pipe(gulp.dest('build/modules/'))
});

gulp.task('js:zepto', ['bower'], function() {
  return gulp.src([
      'bower_components/zeptojs/src/zepto.js',
      'bower_components/zeptojs/src/event.js',
      'bower_components/zeptojs/src/callbacks.js',
      'bower_components/zeptojs/src/deferred.js',
      'bower_components/zeptojs/src/ajax.js'
    ])
    .pipe(isWatching ? plugins.plumber() : plugins.util.noop())
    .pipe(plugins.concat('zepto.js'))
    .pipe(gulp.dest('build/modules/'));
});

gulp.task('requirejs', ['typescript', 'js:zepto', 'copy:templates'], function() {
  var requirejs = require('requirejs');

  requirejs.optimize({
    name: 'almond',
    baseUrl: 'build/modules/',
    out: 'app/cordova/www/js/index.js',
    optimize: argv.production ? 'uglify' : 'none',
    paths: {
      'almond': '../../bower_components/almond/almond',
      'backbone-events-standalone': '../../bower_components/backbone-events-standalone/backbone-events-standalone',
      'framework7': '../../bower_components/framework7/dist/js/framework7',
      'hgn': '../../bower_components/requirejs-hogan/hgn',
      'hogan': '../../bower_components/hogan/web/builds/3.0.2/hogan-3.0.2.amd',
      'jquery': 'zepto',
      'linqjs': '../../bower_components/linqjs/linq',
      'text': '../../bower_components/requirejs-text/text'
    },
    include: ['feedpon/bootstrap'],
    stubModules: ['hgn', 'text'],
    insertRequire: ['feedpon/bootstrap'],
    shim: {
      'framework7': {
        deps: ['jquery'],
        exports: 'Framework7'
      },
      'jquery': {
        exports: '$'
      }
    }
  });
});

gulp.task('connect', function() {
  plugins.connect.server({
    root: 'app/cordova/www/'
  });
});

gulp.task('watch', function() {
  isWatching = true;

  gulp.watch('src/jade/**/*.jade', ['jade']);
  gulp.watch('src/less/**/*.less', ['less']);
  gulp.watch(['src/ts/**/*.ts', 'src/templates/**/*'], ['requirejs', 'copy:js']);
});

gulp.task('clean', function() {
  return gulp.src(['bower_components', 'build', 'app/cordova/www'])
    .pipe(plugins.clean());
});

gulp.task('default', ['jade', 'less', 'requirejs', 'copy:images', 'copy:fonts', 'copy:js']);
