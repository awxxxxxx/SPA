/**
 * @author: waterbear
 */

var gulp = require('gulp'),
    less = require('gulp-less'),
    connect = require('gulp-connect'),
    jslint = require('gulp-jslint');

gulp.task('style',function() {
    return gulp.src('./src/css/*.less')
        .pipe(less())
        .pipe(gulp.dest('./public/css'))
        .pipe(connect.reload());
})

gulp.task('script', function() {
    return gulp.src('./public/js/**/*.js')
        .pipe(connect.reload());
})

gulp.task('html', function() {
    return gulp.src('./public/*.html')
        .pipe(connect.reload());
})

gulp.task('connect', function() {
    connect.server({
        root:[__dirname],
        livereload: true
    })
})

gulp.task('watch', function() {
    gulp.watch('./public/js/**/*.js', ['script']);
    gulp.watch('./src/css/*.less', ['style']);
    gulp.watch('./public/*.html', ['html']);
})

gulp.task('default', ['style','connect','watch']);
