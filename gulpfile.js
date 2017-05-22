let gulp = require('gulp');
let sass = require('gulp-sass');
let browserSync = require("browser-sync").create();
let config = {
    'pageSvnPath': 'E:/wamp/www/pages/lvmama-gulp',
    'jsSvnPath': 'D:/SVN/develop/js/lvmama-gulp',
    'cssSvnPath': 'D:/SVN/develop/styles/lvmama-gulp'
}


gulp.task('default', function () {
    browserSync.init({
        server: '.',
        port: 12345
    });
    gulp.watch('sass/**/*.scss', ['sass']);
    gulp.watch(["*.html","js/*.js"]).on("change", browserSync.reload);
});

gulp.task('sass', function () {
    return gulp.src('sass/**/*.scss')
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(gulp.dest('css'))
        .pipe(browserSync.reload({stream:true}));
});

gulp.task('buildHtml', function () {
    // todo
    gulp.src('*.html')
        .pipe(gulp.dest('dest'));
});

gulp.task('toPages', function () {
    gulp.src('dest/*.html')
        .pipe(gulp.dest(config.pageSvnPath));
});

gulp.task('toPic', function () {
    gulp.src('js/*.js')
        .pipe(gulp.dest(config.jsSvnPath));
    gulp.src('css/*.css')
        .pipe(gulp.dest(config.cssSvnPath));
});