let gulp = require('gulp');
let plumber = require('gulp-plumber');
let sass = require('gulp-sass');
let stripCssComments = require('gulp-strip-css-comments');
let autoprefixer = require('gulp-autoprefixer');
let notify = require('gulp-notify');
let cleanCSS = require('gulp-clean-css');
let sourcemaps = require('gulp-sourcemaps');
let rename = require("gulp-rename");
let uglify = require("gulp-uglify");

const stylesWatchFilePath = ['./public/scss/**/*.scss'];
const scriptsWatchFilePath = ['./public/js/**/*.js', '!./public/js/**/*.min.js'];

// 样式处理
gulp.task('styles', function () {
  return gulp.src(stylesWatchFilePath)
    .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(sass())
    .pipe(stripCssComments()) // 去掉css注释
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./public/css/'))
    // .pipe(notify('styles task success'));
});

// 脚本处理
gulp.task('scripts', function () {
  return gulp.src(scriptsWatchFilePath)
    .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./public/js/'))
    // .pipe(notify('scripts task success'));
});

gulp.task('watch', function() {
  gulp.watch(stylesWatchFilePath, ['styles']);
  gulp.watch(scriptsWatchFilePath, ['scripts']);
});

gulp.task('default', ['styles', 'scripts', 'watch']);