const Handlebars = require('handlebars');

Handlebars.registerHelper('incremented', function(index) {
    index++;
    return index;
});

Handlebars.registerHelper('capitalize', function(str) {
    if (typeof str === 'string') {
        return str.charAt(0).toUpperCase() + str.slice(1);
      }
      return str;
});


Handlebars.registerHelper('isSelected', function(value, queryPart) {
    return value === queryPart ? 'selected' : '';
});  
  

module.exports = Handlebars;