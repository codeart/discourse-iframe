Discourse.Markdown.whiteListTag("span", "class", "iframe-embed");
Discourse.Markdown.whiteListTag("span", "data-url", "*");
Discourse.Markdown.whiteListTag("span", "data-width", "*");
Discourse.Markdown.whiteListTag("span", "data-height", "*");
Discourse.Markdown.whiteListTag("span", "data-placement", "*");

Discourse.Dialect.replaceBlock({
  start: /(\[iframe[^\]]*\])([\s\S]*)/igm,
  stop: /(\[\/iframe\])/igm,
  emitter: function(contents, matches) {
    var attrs = {
      'class': 'iframe-embed',
      'data-url': contents.join()
    };

    var opts = matches[1].replace(/(?:^\[iframe\s*)|(?:\]$)/ig, '').split(' ');

    for (var i=0; i < opts.length; i++) {
      if (!opts[i].length) continue;

      var split = opts[i].split("=");
      attrs["data-" + split[0]] = split[1].replace(/\"/ig, '');
    }

    return ['span', attrs];
  }
});
