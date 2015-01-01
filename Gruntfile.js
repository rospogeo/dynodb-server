'use strict';

var paths = {
  js: ['*.js', 'test/**/*.js', '!test/coverage/**']
};

module.exports = function(grunt) {

  if (process.env.NODE_ENV !== 'production') {
    require('time-grunt')(grunt);
  }

  // Project Configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    watch: {
      js: {
        files: paths.js,
        tasks: ['jshint'],
        options: {
          livereload: true
        }
      }
    },
    jshint: {
      all: {
        src: paths.js,
        options: {
          jshintrc: true
        }
      }
    },
    nodemon: {
      dev: {
        script: 'index.js',
        options: {
          args: [],
          ignore: ['node_modules/**'],
          ext: 'js',
          //nodeArgs: ['--debug'],
          delayTime: 1,
          cwd: __dirname
        }
      }
    },
    concurrent: {
      tasks: ['nodemon', 'watch'],
      options: {
        logConcurrentOutput: true
      }
    },
    env: {
      test: {
        NODE_ENV: 'test'
      }
    }
  });

  //Load NPM tasks
  require('load-grunt-tasks')(grunt);

  /**
   * Default Task
   */
  //grunt.mean.push('clean', -9999);
  grunt.mean.push('concurrent', 9999);
  if (process.env.NODE_ENV === 'production') {
    grunt.mean.push('uglify', 200);
  } else {
    grunt.mean.push('jshint', -200);
  }

  //Default task.
  grunt.registerTask('default', ['mean']);

};