// helpers/handlebarsHelpers.js

const handlebars = require("handlebars");

handlebars.registerHelper("for", function (from, to, incr, block) {
  let accum = "";
  for (let i = from; i <= to; i += incr) {
    accum += block.fn(i);
  }
  return accum;
});
handlebars.registerHelper("ifeq", function (a, b, options) {
  if (a == b) {
    return options.fn(this);
  }
  return options.inverse(this);
});
// Helper to check if all conditions are true
handlebars.registerHelper("and", function () {
  for (let i = 0; i < arguments.length - 1; i++) {
    if (!arguments[i]) {
      return false;
    }
  }
  return true;
});

// Helper to check if two values are equal
handlebars.registerHelper("eq", function (a, b) {
  return a === b;
});

// Helper to check if two values are not equal
handlebars.registerHelper("ne", function (a, b) {
  return a !== b;
});
handlebars.registerHelper("ifEquals", function (arg1, arg2, options) {
  return arg1 === arg2 ? options.fn(this) : options.inverse(this);
});
