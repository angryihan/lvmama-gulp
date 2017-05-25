let gulp = require('gulp');
let sass = require('gulp-sass');
let browserSync = require("browser-sync").create();
let through = require('through2');
const CDN_PREFIX = 'http://pic.lvmama.com/min/index.php?f=';
const CONCAT_CONST = {
    'js': {
        concatReg: /<!--js-concat-->([\s\S]*?)<!--js-concat-end-->/g,
        pathReg: /src=["'](.*?)["']/g,
        resultStart: '<script src="',
        resultEnd: '"></script>',
        typeAlias: 'js'
    },
    'css': {
        concatReg: /<!--css-concat-->([\s\S]*?)<!--css-concat-end-->/g,
        pathReg: /href=["'](.*?)["']/g,
        resultStart: '<link rel="stylesheet" href="',
        resultEnd: '">',
        typeAlias: 'styles'
    }
}

const PATH_CONFIG = {
    'pageSvnPath': 'E:/wamp/www/pages',
    'picSvnPath': 'D:/SVN/develop',
    'projectPath': '/lvmama-gulp'
}

gulp.task('default', function () {
    browserSync.init({
        server: {
            baseDir: "./",
            directory: true
        }
    });
    gulp.watch('sass/**/*.scss', ['sass']);
    gulp.watch(["*.html", "js/**/*.js"]).on("change", browserSync.reload);
});

gulp.task('sass', function () {
    return gulp.src('sass/**/*.scss')
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(gulp.dest('css'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('html2dest', function () {
    gulp.src('*.html')
        .pipe(through.obj(function (file, encoding, callback) {
            this.push(buildHtml(file));
            callback();
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('toPages', function () {
    gulp.src('dist/*.html')
        .pipe(gulp.dest(PATH_CONFIG.pageSvnPath + PATH_CONFIG.projectPath));
});

gulp.task('toPic', function () {
    gulp.src('js/**/*.js')
        .pipe(gulp.dest(PATH_CONFIG.picSvnPath + '/js' + PATH_CONFIG.projectPath));
    gulp.src('css/**/*.css')
        .pipe(gulp.dest(PATH_CONFIG.picSvnPath + '/styles' + PATH_CONFIG.projectPath));
});

function buildHtml(file) {
    file.contents = new Buffer(concat(concat(String(file.contents), 'css'), 'js'));
    return file;
}

function concat(string, type) {
    let picPath = 'pic.lvmama.com';
    return string.replace(CONCAT_CONST[type].concatReg, function (match, matchContent) {
        let relativePaths = [];
        let regGroup;
        while (regGroup = CONCAT_CONST[type].pathReg.exec(matchContent)) {
            let lastIndexOfPic = regGroup[1].lastIndexOf(picPath);
            let lastIndexOfLocal = regGroup[1].lastIndexOf(type + '/');
            if (lastIndexOfPic != -1) {
                relativePaths.push(regGroup[1].substring(lastIndexOfPic + picPath.length));
            } else {
                relativePaths.push('/' + CONCAT_CONST[type].typeAlias + PATH_CONFIG.projectPath + regGroup[1].substring(lastIndexOfLocal + type.length));
            }
        }
        return CONCAT_CONST[type].resultStart + CDN_PREFIX + relativePaths.join(',') + CONCAT_CONST[type].resultEnd;
    });
}