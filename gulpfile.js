var gulp         = require('gulp'),
		sass         = require('gulp-sass'),
		browserSync  = require('browser-sync'),
		concat       = require('gulp-concat'),
		uglify       = require('gulp-uglify'),
		cssnano      = require('gulp-cssnano'),
		rename       = require('gulp-rename'),
		del          = require('del'),
		imagemin     = require('gulp-imagemin'),
		pngquant     = require('imagemin-pngquant'),
		cache        = require('gulp-cache'),
		autoprefixer = require('gulp-autoprefixer'),
		pug          = require('gulp-pug'),
		sprite       = require('gulp.spritesmith'),
    plumber      = require('gulp-plumber'),
    notify       = require('gulp-notify');


// ## Development

// start browserSync
gulp.task('browser-sync', function() {
	browserSync({
		port: 9000,
		server: {
			baseDir: 'app',
			directory: true
		},
		notify: false
	});
});

// compile pug > save to app
gulp.task('pug', function () {
	return gulp.src('app/assets/pug/*.pug')
        .pipe(plumber({
            errorHandler: notify.onError(function (err) {
                return {
                    title: "Template",
                    message: err.message
                };
            })
        }))
        .pipe(pug({pretty: true}))
        .pipe(gulp.dest('app'))
        //.pipe(browserSync.reload({stream: true}))
});

// compile sass > autoprefix > save to app
gulp.task('sass', function(){
	return gulp.src([
		'app/assets/sass/base/*.scss',
		'app/assets/sass/helpers/*.scss',
		'app/assets/sass/components/*.scss'
	])
        .pipe(plumber({
            errorHandler: notify.onError(function (err) {
                return {
                    title: "Styles",
                    message: err.message
                };
            })
        }))
		.pipe(concat('all.scss'))
		.pipe(sass({pretty: true}))
		.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
		.pipe(rename("style.css"))
		.pipe(gulp.dest('app'))
		//.pipe(browserSync.reload({stream: true}))
});

// compile js > save to app
gulp.task('js', function() {
	return gulp.src([
	    'app/js/*.js'
  ])
  .pipe(plumber(plumber({
    errorHandler: notify.onError(function (err) {
      return {
        title: "Scripts",
        message: err.message
      };
    })
  })))
	.pipe(concat('script.js'))
	.pipe(gulp.dest('app'));
});

// generate sprites
/*
gulp.task('sprite', function () {
	var spriteData = gulp.src('app/assets/img/*.png')
	.pipe(sprite({
		imgName: 'sprite.png',
		cssName: 'sprite.scss',
		imgPath: '../sprite/sprite.png'
	}));
	return spriteData.pipe(gulp.dest('app/sprite/'));
});
*/


// ## Building

// clean dist
gulp.task('clean', function() {
	return del.sync('dist');
});

// minify css > save to dist
gulp.task('build-css', function() {
	return gulp.src('app/style.css')
		.pipe(cssnano())
		.pipe(gulp.dest('dist'));
});

// minify js > save to dist
gulp.task('build-js', function() {
	return gulp.src([
	    'app/script.js'
  ])
  .pipe(plumber(plumber({
    errorHandler: notify.onError(function (err) {
      return {
        title: "Scripts",
        message: err.message
      };
    })
  })))
	.pipe(uglify())
	.pipe(rename({suffix: '.min'}))
	.pipe(gulp.dest('dist'));
});

// optimize images > save to dist
gulp.task('optimize-img', function() {
	return gulp.src('app/assets/img/*')
		.pipe(cache(imagemin({
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		})))
		.pipe(gulp.dest('dist/img'));
});

// placeholders > save to dist
gulp.task('copy-placeholder', function() {
	return gulp.src('app/assets/img/placeholder/*')
		.pipe(gulp.dest('dist/img'));
});


// ## Tasks

// Watch Task
gulp.task('watch', ['browser-sync','pug','sass','js'] , function() {
	gulp.watch('app/assets/pug/**/*.pug', ['pug']);
	gulp.watch('app/assets/sass/**/*.scss', ['sass']);
	gulp.watch('app/assets/js/**/*.js', ['js']);
	gulp.watch([
    'app/*.html',
    'app/*.js',
    'app/*.css'
  ]).on('change', browserSync.reload);
});

// Build Task
gulp.task('build', ['clean','build-css','build-js','optimize-img','copy-placeholder'], function() {

	var copy = gulp.src('app/*.html')
	.pipe(gulp.dest('dist'))

	// var buildSprite = gulp.src('app/sprite/**/*')
	// .pipe(gulp.dest('dist/sprite'));

});


// ## Settings

// clean cache
gulp.task('clear', function (callback) {
	return cache.clearAll();
})

// default task
gulp.task('default', ['watch']);
