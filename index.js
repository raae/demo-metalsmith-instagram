require('dotenv').config();

var Metalsmith  = require('metalsmith');
var markdown    = require('metalsmith-markdown');
var remote      = require('metalsmith-remote-json-to-files')
var layouts     = require('metalsmith-layouts');
var permalinks  = require('metalsmith-permalinks');
var assets      = require('metalsmith-assets');
var collections = require('metalsmith-collections');

Metalsmith(__dirname)
  .metadata({
    site: {
      title: 'Metalsmith ❤️ Instagram',
      description: "Content from Instagram. Static site by Metalsmith. Demo by Benedicte (@raae)",
      social: {
        twitter: 'https://twitter.com/raae',
        github: 'https://github.com/raae'
      }
    }
  })
  .source('./src')
  .destination('./build')
  .clean(true)
  .use(remote({
    url: 'https://api.instagram.com/v1/users/self/media/recent/?access_token=' + process.env.IG_ACCESS_TOKEN,
    transformOpts: function(json) {
      return json.data.reduce((prev, item) => {
        return Object.assign(prev, {
          ['images/'+ item.id + '.md']: {
            slug: item.id,
            date: new Date(parseInt(item.created_time) * 1000).toISOString(),
            caption: item.caption.text,
            src: item.images,
            contents: ''
          }
        })
    }, {})
    }
  }))
  .use(collections({
    images: {
      pattern: 'images/*',
      sortBy: 'date',
      reverse: true
    }
  }))
  .use(markdown())
  //.use(permalinks())
  .use(layouts({
    engine: 'handlebars'
  }))
  .use(assets({
    source: './assets', // relative to the working directory
    destination: './assets' // relative to the build directory
  }))
  .use(assets({
    source: './redirects', // relative to the working directory
    destination: './' // relative to the build directory
  }))
  .build(function(err, files) {
    if (err) { throw err; }
  });