module.exports = function(grunt) {
  grunt.initConfig({
    coffee: {
      compile: {
        files: {
          './main.js': ['./*.coffee']
        }
      }
    },
    watch: {
      coffee: {
        files: ['./*.coffee'],  
        tasks: ['coffee'],
        options: {
          livereload: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-coffee');

  grunt.registerTask('default', ['coffee','watch']);
};