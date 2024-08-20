var gulp = require('gulp');
var sass = require('gulp-sass')(require('sass'));
var connect = require('gulp-connect');
var watch = require('gulp-watch');
var imagemin = import('gulp-imagemin');

 
gulp.task('styles', function(){
  return gulp.src('Assets/sass/style.scss')
  .pipe(sass().on('error',sass.logError))
  .pipe(autoprefixer())
  .pipe(gulp.dest('Assets/dist/css'))
  .pipe(connect.reload());
});

gulp.task('connect', function(){
  connect.server({
    livereload: true,
  });
});

gulp.task('sass', function() { 
  return gulp.src('Assets/sass/**/*.scss')
       .pipe(sass().on('error',sass.logError))
       .pipe(gulp.dest('Assets/dist/css'));
       
  });
 
   gulp.task('imagemin', function() { 
    return gulp.src('images/*')
         .pipe(imagemin())
         .pipe(gulp.dest('Assets/dist/css'));
         
    }); 

gulp.task('copy-css', function(){
  return gulp.src('Assets/sass/*.css')
  .pipe(sass().on('error',sass.logError))
  .pipe(gulp.dest('Assets/dist/css/*.css'))
  
});

gulp.task('watch', function(){
  return gulp.watch('Assets/sass/**/*.scss',gulp.series('sass'));
  return gulp.watch('sass/**/*.css',gulp.series('copy-css'));
   return gulp.watch('Assets/sass/**/*.scss', gulp.series('styles'));
 return gulp.watch('images/*', gulp.series(imagemin));
   
 
 });



gulp.task('default', gulp.series('sass','watch','copy-css',  'connect', 'styles', 'imagemin'  )); 
