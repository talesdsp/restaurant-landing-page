var gulp = require("gulp");
var sass = require("gulp-sass");
var browserSync = require("browser-sync");
var useref = require("gulp-useref");
var uglify = require("gulp-uglify");
var gulpIf = require("gulp-if");
var autoprefixer = require("gulp-autoprefixer");
var cssnano = require("gulp-cssnano");
var imagemin = require("gulp-imagemin");
var cache = require("gulp-cache");
var del = require("del");
var runSequence = require("gulp4-run-sequence");

// Basic Gulp task syntax
gulp.task("hello", function() {
  console.log("Hello Zell!");
});

// Development Tasks
// -----------------

// Start browserSync server
gulp.task("browserSync", function() {
  browserSync.init({
    notify: false,
    open: false,
    injectChanges: false,
    server: {
      baseDir: "dist"
    }
  });
});

gulp.task("sass", function() {
  return gulp
    .src("app/scss/**/*.scss") // Gets all files ending with .scss in app/scss and children dirs
    .pipe(sass({outputStyle: "compressed"}).on("error", sass.logError)) // Passes it through a gulp-sass, log errors to console
    .pipe(autoprefixer({cascade: false}))
    .pipe(gulp.dest("dist/css")) // Outputs it in the css folder
    .pipe(
      browserSync.reload({
        // Reloading with Browser Sync
        stream: true
      })
    );
});

// Watchers
gulp.task("watch", function() {
  gulp.watch("app/scss/**/*.scss", gulp.parallel("sass"));
  gulp.watch("app/*.html", gulp.parallel("useref"));
  gulp.watch(["dist/*.html", "dist/js/**/*.js"]).on("change", browserSync.reload);
});

// Optimization Tasks
// ------------------

// Optimizing CSS and JavaScript
gulp.task("useref", function() {
  return gulp
    .src("app/*.html")
    .pipe(useref())
    .pipe(gulpIf("*.js", uglify()))
    .pipe(gulpIf("*.css", cssnano()))
    .pipe(gulp.dest("dist"))
    .pipe(browserSync.stream());
});

// Optimizing Images
gulp.task("images", function() {
  return (
    gulp
      .src("app/images/**/*.+(png|jpg|jpeg|gif|svg)")
      // Caching images that ran through imagemin
      .pipe(
        cache(
          imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 90, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
              plugins: [{removeViewBox: true}, {cleanupIDs: false}]
            })
          ])
        )
      )
      .pipe(gulp.dest("dist/images"))
  );
});

// Copying fonts
gulp.task("fonts", function() {
  return gulp.src("app/fonts/**/*").pipe(gulp.dest("dist/fonts"));
});

// Cleaning
gulp.task("clean", function() {
  return del("dist").then(function(cb) {
    return cache.clearAll(cb);
  });
});

gulp.task("clean:dist", function() {
  return del(["dist/**/*", "!dist/images", "!dist/images/**/*"]);
});

// Build Sequences
// ---------------

gulp.task(
  "default",
  gulp.parallel([gulp.series(["sass", "images", "useref", "watch"]), gulp.series(["browserSync"])])
  // runSequence('sass', 'images', 'useref', 'browserSync', 'watch')
);

gulp.task("build", function(callback) {
  runSequence("clean:dist", "sass", ["useref", "images", "fonts"], callback);
});
