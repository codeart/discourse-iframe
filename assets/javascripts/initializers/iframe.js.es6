import { withPluginApi } from 'discourse/lib/plugin-api';

// Generate unique iframe id based on its
// data settings e.g. url, placement and dimensions
function frame_id(data) {
  var hval = 0x811c9dc5,
      string = "";

  for (var attr in data) {
    string += attr + data[attr];
  }

  for (var i = 0; i < string.length; i++) {
    hval ^= string.charCodeAt(i);
    hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
  }

  return (hval >>> 0).toString(16);
}

function build_iframes($post) {
  $post.find(".iframe-embed").each(function() {
    var $target  = $(this),
        data     = $target.data(),
        id       = frame_id(data),
        position = "";

    switch (data.placement) {
      case "right":
        position += "; float: right;";
        break;
      case "left":
        position += "; float: left;";
        break;
    }

    var $iframe = $("<iframe>", {
      "id":          id,
      "src":         data.url,
      "class":       "iframe-embed-frame",
      "style":       "width: " + data.width + "; height: " + data.height + position,
      "frameborder": 0
    });

    $target.replaceWith($iframe);
  });
}

export default {
  name: "apply-iframe",

  initialize: function(container) {
    withPluginApi('0.5', api => { api.decorateCooked(build_iframes); });
  }
};
