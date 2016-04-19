'use strict';

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var nodemon = require('gulp-nodemon');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var cache = require('gulp-cached');
var eslint = require('gulp-eslint');
var less = require('gulp-less');
var path = require('path');
var source = require('vinyl-source-stream'); // Used to stream bundle for further handling etc.
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');

var FILES = [
  './*.js',
  './**/*.js',
  '!node_modules/**',
  '!public/**',
  '!./db_loader.js'
];

// LINTING TASK
gulp.task('lint', function () {
  gulp.src(FILES)
        .pipe(cache('jshint'))
        .on('error', function(err) {
          console.error('JSX ERROR in ' + err.fileName);
          console.error(err.message);
          // this.end();
        })
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));

  gulp.task('eslint', function () {
    return gulp.src(FILES)
      .pipe(eslint({}))
      .pipe(eslint.format());
  });
});

// COMPILE LESS TASK
gulp.task('less', function() {
  return gulp.src('public/stylesheets/less/*.less')
    .pipe(less({
      paths: [path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(gulp.dest('public/stylesheets'));
});



var b = watchify(browserify( {debug: true} ));
b.on('update', bundle); // on any dep update, runs the bundler
b.on('log', gutil.log); // output build logs to terminal

function bundle() {
  return b.bundle()
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        .pipe(uglify())
        .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('public/javascripts'));
}

gulp.task('browserify', bundle); // so you can run `gulp js` to build the file

gulp.task('watch', ['browserify'], function() {
  nodemon({
    script: 'bin/www',
    ext: 'jade js less',
    watch: ['app.js', 'routes', 'database', 'bin', 'public/stylesheets/less/*.less',
            'middlewares'],
    env: {'NODE_ENV': 'development'},
    tasks: function (changedFiles) {
      var tasks = ['less', 'lint'];
      changedFiles.forEach(function(file) {
        // If file is from the client directory, then browserify
        if (file.lastIndexOf('client/', 0) === 0 && tasks.indexOf('browserify') < 0) {
          tasks.push('browserify');
        }
      });
      return tasks;
    }
  });
});

gulp.task('default', ['lint', 'less', 'watch']);
