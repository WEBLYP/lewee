// import packages
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    sequence = require('gulp-sequence'),
    clean = require('gulp-clean'),
    browserSync = require('browser-sync').create(),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    cleanCSS = require('gulp-clean-css'),
    imageMin = require('gulp-imagemin');

// task of running app
gulp.task('dev', ['sass', 'browser-sync'], function () {
    gulp.watch('app/scss/**/*.scss', ['sass']);
    gulp.watch('app/**/*.html', browserSync.reload);
    gulp.watch('app/js/**/*.js', browserSync.reload);
});

// build dist files
gulp.task('build', sequence('clean', 'sass', 'compress-css', 'compress-js', 'copy-css', 'copy-js' , 'copy-html', 'copy-libs', 'copy-root-files', 'compress-images'));


// clean
gulp.task('clean', function() {
    return gulp.src(['./dist/*'])
        .pipe(clean());
});

// sass to css
gulp.task('sass', function () {
    return gulp.src('./app/scss/**/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('./app/css'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

// browser sync fresh
gulp.task('browser-sync', function () {
    browserSync.init({
       server: {
           baseDir: './app'
       }
    });
});

// copy css
gulp.task('copy-css', function () {
    return gulp.src('./app/css/**/*.css')
        .pipe(gulp.dest('./dist/css'));
});

// copy js
gulp.task('copy-js', function () {
    return gulp.src('./app/js/**/*.js')
        .pipe(gulp.dest('./dist/js'));
});

// clean css
gulp.task('compress-css', function () {
    return gulp.src('./app/css/**/*.css')
        .pipe(cleanCSS())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./dist/css'));
});

// minify js
gulp.task('compress-js', function () {
    return gulp.src('./app/js/**/*.js')
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./dist/js'));
});

// copy images
gulp.task('compress-images', function () {
    return gulp.src('./app/images/**/*.{jpg,png,gif,ico}')
        .pipe(imageMin())
        .pipe(gulp.dest('./dist/images'));
});

// copy html
gulp.task('copy-html', function() {
    return gulp.src('./app/**/*.html')
        .pipe(gulp.dest('./dist'));
});

// copy other libs
gulp.task('copy-libs', function() {
    return gulp.src('./app/libs/**/*')
        .pipe(gulp.dest('./dist/libs'));
});

// copy root files
gulp.task('copy-root-files', function() {
    return gulp.src('./app/*.ico')
        .pipe(gulp.dest('./dist'));
});