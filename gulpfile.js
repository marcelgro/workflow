var gulp         = require('gulp'),
	sass         = require('gulp-sass'), 
	browserSync  = require('browser-sync'), 
	concat       = require('gulp-concat'), 
	uglify       = require('gulp-uglifyjs'),
	cssnano      = require('gulp-cssnano'), 
	rename       = require('gulp-rename'), 
	del          = require('del'), 
	imagemin     = require('gulp-imagemin'), 
	pngquant     = require('imagemin-pngquant'), 
	cache        = require('gulp-cache'), 
	autoprefixer = require('gulp-autoprefixer'),
	jade         = require('gulp-jade'),
	sprite       = require('gulp.spritesmith'),
    plumber      = require('gulp-plumber'),
    notify       = require('gulp-notify');

// Компиляция sass + autoprefixer
gulp.task('sass', function(){ 
	return gulp.src('app/sass/*.scss')
        .pipe(plumber({
            errorHandler: notify.onError(function (err) {
                return {
                    title: "Styles",
                    message: err.message
                };
            })
        }))
		.pipe(sass({pretty: true})) 
		.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true })) 
		.pipe(gulp.dest('app/css')) 
		.pipe(browserSync.reload({stream: true})) 
});

// Компиляция в jade
gulp.task('jade', function () {
	return gulp.src('app/jade/*.jade')
        .pipe(plumber({
            errorHandler: notify.onError(function (err) {
                return {
                    title: "Template",
                    message: err.message
                };
            })
        }))
        .pipe(jade({pretty: true}))
        .pipe(gulp.dest('app'))
        .pipe(browserSync.reload({stream: true}))
});

// Генерация спрайтов
gulp.task('sprite', function () {
	var spriteData = gulp.src('app/img/*.png')
	.pipe(sprite({
		imgName: 'sprite.png',
		cssName: 'sprite.scss',
		imgPath: '../sprite/sprite.png'
	}));
	return spriteData.pipe(gulp.dest('app/sprite/'));
});

// реализация browser-sync
gulp.task('browser-sync', function() { 
	browserSync({ 
		port: 9000,
		server: { 
			baseDir: 'app' 
		},
		notify: false 
	});
});

// минифицировние js файлов и библиотек
gulp.task('scripts', function() {
	return gulp.src([
	    'app/libs/jquery/jquery-3.1.0.js',
        'app/libs/slick-carousel/slick/slick.min.js'
    ])
        .pipe(plumber(plumber({
            errorHandler: notify.onError(function (err) {
                return {
                    title: "Scripts",
                    message: err.message
                };
            })
        })))
		.pipe(concat('libs.min.js')) 
		.pipe(uglify()) 
		.pipe(gulp.dest('app/js')); 
});

// минифицировние файлов css различных плагинов
gulp.task('css-libs', ['sass'], function() {
	return gulp.src('app/css/libs.css') 
		.pipe(cssnano())
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('app/css')); 
});

// стандартная слежка
gulp.task('watch', ['browser-sync', 'css-libs', 'jade', 'scripts'], function() {
	gulp.watch('app/jade/**/*.jade', ['jade']);
	gulp.watch('app/sass/**/*.scss', ['sass']); 
	gulp.watch([
    'app/*.html',
    'app/js/**/*.js',
    'app/css/**/*.css'
  ]).on('change', browserSync.reload);
});

// очистка директории dist
gulp.task('clean', function() {
	return del.sync('dist');
});

// оптимизация изображений и их кэширование
gulp.task('img', function() {
	return gulp.src('app/img/**/*')
		.pipe(cache(imagemin({
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		})))
		.pipe(gulp.dest('dist/img'));
});


// сборка проекта
gulp.task('build', ['clean', 'img', 'sass', 'jade', 'scripts', 'sprite'], function() {

	var buildCss = gulp.src([ 
		'app/css/main.css',
		'app/css/libs.min.css',
        'app/css/fonts.css'
		])
	.pipe(gulp.dest('dist/css'))

	var buildFonts = gulp.src('app/fonts/**/*') 
	.pipe(gulp.dest('dist/fonts'))

	var buildJs = gulp.src('app/js/**/*') 
	.pipe(gulp.dest('dist/js'))

	var buildHtml = gulp.src('app/*.html') 
	.pipe(gulp.dest('dist'))

	var buildSprite = gulp.src('app/sprite/**/*')
	.pipe(gulp.dest('dist/sprite'));

});

// очистка кэша
gulp.task('clear', function (callback) {
	return cache.clearAll();
})

// задача по умолчанию
gulp.task('default', ['watch']);
