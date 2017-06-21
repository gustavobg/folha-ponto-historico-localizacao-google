var gulp        = require('gulp');
var browserSync = require('browser-sync').create();
var reload  = browserSync.reload;

var src = {
    css:  '**/*.css',
    html: '*.html',
    js: '**/*.js'
};

gulp.task('serve', function() {
    browserSync.init({
        server: "./",
        injectChanges: true,
        open: false
    });

    gulp.watch(src.css).on('change', function () {
        browserSync.stream({ match: '**/*.css' });
        browserSync.reload();
    });

});



gulp.task('default', ['serve']);