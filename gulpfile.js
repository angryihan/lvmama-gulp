let gulp = require('gulp');
let sass = require('gulp-sass');
let browserSync = require("browser-sync").create();
let through = require('through2');
const CDN_PREFIX = 'http://pic.lvmama.com/min/index.php?f=';
const PIC_PATH = 'pic.lvmama.com';
const CONCAT_CONST = {
    'js': {
        concatReg: /<!--js-concat-->([\s\S]*?)<!--js-concat-end-->/g,
        pathReg: /src=["'](.*?)["']/g,
        resultPath: '<script src="{{path}}"></script>\n<script src="' + CDN_PREFIX + '/js/v5/ibm/eluminate.js,/js/v5/ibm/coremetrics-initalize.js,/js/common/losc.js"></script>',
        typeAlias: 'js'
    },
    'css': {
        concatReg: /<!--css-concat-->([\s\S]*?)<!--css-concat-end-->/g,
        pathReg: /href=["'](.*?)["']/g,
        resultPath: '<link rel="stylesheet" href="{{path}}">',
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
    gulp.watch(["*.html", "js/**/*.js", "css/**/*.css"]).on("change", browserSync.reload);
});

gulp.task('sass', function () {
    return gulp.src('sass/**/*.scss')
        .pipe(sass({outputStyle: 'compact'}).on('error', sass.logError))
        .pipe(gulp.dest('css'));
});

gulp.task('html2dist', function () {
    gulp.src('*.html')
        .pipe(through.obj(function (file, encoding, callback) {
            this.push(buildHtml(file));
            callback();
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('toPages', ['html2dist'], function () {
    gulp.src('dist/*.html')
        .pipe(gulp.dest(PATH_CONFIG.pageSvnPath + PATH_CONFIG.projectPath));
});

gulp.task('toPic', ['sass'], function () {
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
    return string.replace(CONCAT_CONST[type].concatReg, function (match, matchContent) {
        let relativePaths = [];
        let regGroup;
        while (regGroup = CONCAT_CONST[type].pathReg.exec(matchContent)) {
            let lastIndexOfPic = regGroup[1].lastIndexOf(PIC_PATH);
            let lastIndexOfLocal = regGroup[1].lastIndexOf(type + '/');
            if (lastIndexOfPic != -1) {
                relativePaths.push(regGroup[1].substring(lastIndexOfPic + PIC_PATH.length));
            } else {
                relativePaths.push('/' + CONCAT_CONST[type].typeAlias + PATH_CONFIG.projectPath + regGroup[1].substring(lastIndexOfLocal + type.length));
            }
        }
        return CONCAT_CONST[type].resultPath.replace("{{path}}", CDN_PREFIX + relativePaths.join(','));
    });
}