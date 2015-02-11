// https://www.digitalocean.com/community/tutorials/how-to-setup-task-automation-with-grunt-and-node-js-on-a-vps
module.exports = function(grunt) {

  grunt.initConfig({
    jsDir: 'public/javascripts/',
    jsDistDir: 'dist/javascripts/',    
    cssDir: 'public/stylesheets/',
    cssDistDir: 'dist/stylesheets/',
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      js: {
        options: {
          separator: ';'
        },
        src: ['<%=jsDir%>kanban/*.js'],
        dest: '<%=jsDistDir%><%= pkg.name %>.js'
      },
      css: {
        src: ['<%=cssDir%>**/*.css'],
        dest: '<%=cssDistDir%><%= pkg.name %>.css'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%=grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          '<%=jsDistDir%><%= pkg.name %>.min.js': ['<%= concat.js.dest %>']
        }
      }
    },
    cssmin: {
      add_banner: {
        options: {
          banner: '/*! <%= pkg.name %> <%=grunt.template.today("dd-mm-yyyy") %> */\n'
        },
        files: {
          '<%=cssDistDir%><%= pkg.name %>.min.css': ['<%= concat.css.dest %>']
        }
      }
    },
    watch: {
    files: ['<%=jsDir%>*.js', '<%=cssDir%>*.css'],
    tasks: ['concat', 'uglify', 'cssmin']
    },
  
	jslint: {
      // lint the server code
      server: {
        // files to lint
        src: [
          'app.js',
          'routes/*.js',
          'public/**.js'
          
        ],
        // files to exclude
        exclude: [
          'server/config.js'
        ],
        // lint options
        directives: {
          // node environment
          node: true,
          // browser environment
          browser: false,
          // allow dangling underscores
          nomen: true,
          // allow todo statements
          todo: true,
          // allow unused parameters
          unparam: true,
          // don't require strcit pragma
          sloppy: true,
          // allow whitespace discrepencies
          white: true
        }
      },      
      // lint the client code
      client: {
        src: [
          'public/javascripts/kanban/*.js'
        ],
        directives: {
          // node environment
          node: false,
          // browser environment
          browser: true,
          // allow dangling underscores
          nomen: true,
          // allow todo statements
          todo: true,
          // allow unused parameters
          unparam: true,
          // add predefined libraries
          predef: [
            '$',
            '_',
            'Handlebars',
            'Backbone',
          ],
          white: true
        },
      }
    },
    
    jsdoc : {
        dist : {
            src: ['public/javascripts/kanban/**.js'], 
            dest: 'doc'
        }
    }
 
  
  
  });
  
  
  grunt.loadNpmTasks('grunt-jslint');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('lint', 'Run linting', ['jslint']);
  grunt.registerTask('doc', 'Run jsdoc', ['jsdoc']);


  grunt.registerTask('default', [
    'concat',
    'uglify',
    'cssmin',
    'watch'
  ]);
  
};
