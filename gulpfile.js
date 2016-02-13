'use strict';

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var nodemon = require('gulp-nodemon');
var source = require('vinyl-source-stream'); // Used to stream bundle for further handling etc.
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var cache = require('gulp-cached');

gulp.task('lint', function () {
  gulp.src(['./*.js', './**/*.js', '!node_modules/**', '!public/**',
        '!./db_loader.js'])
        .pipe(cache('jshint'))
        .on('error', function(err) {
          console.error('JSX ERROR in ' + err.fileName);
          console.error(err.message);
          // this.end();
        })
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
        // .pipe(jshint.reporter('fail'));
});

var customOpts = {
//  entries: './client/app.jsx',
  debug: true,
  // defining transforms here will avoid crashing your stream
};
var b = watchify(browserify(customOpts));
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
    .pipe(gulp.dest('./public/javascripts/'));
}

gulp.task('browserify', bundle); // so you can run `gulp js` to build the file

gulp.task('watch', ['browserify'], function() {
  nodemon({
    script: 'bin/www',
    ext: 'jade js less',
    watch: ['app.js', 'routes', 'database', 'bin'],
    env: {'NODE_ENV': 'development'},
    tasks: function (changedFiles) {
      var tasks = ['lint'];
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

gulp.task('default', ['lint', 'watch']);
