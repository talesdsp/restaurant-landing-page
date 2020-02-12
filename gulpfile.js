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
var babel = require("gulp-babel");

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

gulp.task("copy", function() {
  return gulp.src("app/*.+(xml|json|ico)").pipe(gulp.dest("dist"));
});

// Parse and compress js
gulp.task("js", function() {
  return gulp
    .src("app/js/**/*.js")
    .pipe(babel())
    .pipe(uglify())
    .pipe(gulp.dest("dist/js"));
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
  gulp.watch("app/js/**/*.js", gulp.parallel("js"));
  gulp.watch("app/*.+(xml|json|ico)", gulp.parallel("copy"));
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
      .src("app/images/*.+(png|jpg|jpeg|gif|svg)")
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

gulp.task("icons", function() {
  return gulp
    .src("app/icons/*.png")
    .pipe(cache(imagemin([imagemin.optipng({optimizationLevel: 5})])))
    .pipe(gulp.dest("dist/icons"));
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
  return del(["dist/**/*", "!dist/icons", "!dist/icons/**/*", "!dist/images", "!dist/images/**/*"]);
});

// Build Sequences
// ---------------

gulp.task(
  "default",
  gulp.parallel([
    gulp.series(["js", "sass", "images", "icons", "copy", "useref", "watch"]),
    gulp.series(["browserSync"])
  ])
  // runSequence('sass', 'images', 'useref', 'browserSync', 'watch')
);

gulp.task("build", function(callback) {
  runSequence("clean:dist", "sass", "js", "useref", "images", "copy", "icons", callback);
});
