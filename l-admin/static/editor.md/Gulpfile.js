// 压缩 css 和 js
let gulp = require('gulp'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    jshint = require('gulp-jshint'),
    notify = require('gulp-notify');

let fs = require('fs');

/**
 * 获取某个文件夹下面的所有文件
 * @param path
 * @param a 文件名含有字符串
 * @param b 文件名不含有字符串
 * @param
 */
function readFileList(path, a, b) {
    let files = fs.readdirSync(path);
    let filesList = [];
    
    files.forEach(function (item) {
        if(item.indexOf(a) !== -1 && item.indexOf(b) === -1) {
            filesList.push(path + item);
        }
    });
    
    return filesList;
}

gulp.task('css', function() {
    return gulp.src(readFileList('./css/', '.css', '.min.css'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(minifycss())
        .pipe(gulp.dest('css'))
        .pipe(notify({message:'css task finished'}));
});

gulp.task('css-themes', function() {
    return gulp.src(readFileList('./css/google_code_prettify_themes/', '.css', '.min.css'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(minifycss())
        .pipe(gulp.dest('css/google_code_prettify_themes'))
        .pipe(notify({message:'css-themes task finished'}));
});

gulp.task('js', function () {
    return gulp.src('./editormd.js')
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())
        .pipe(gulp.dest('./'))
        .pipe(notify({message:'js task finished'}));
});

gulp.task('default',function() {
    gulp.start('css', 'css-themes', 'js');
});
