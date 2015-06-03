import PostView from "discourse/views/post";

export default {
  name: "apply-iframe",

  initialize: function(container) {
    var default_options = { placement: "right", width: "250px" },
        style = document.createElement("style");

    style.appendChild(document.createTextNode("")); // WebKit hack
    document.head.appendChild(style);

    // Aply some CSS patches to posts container
    // including margins at the sides where we embed frames
    var add_css_rules = function(styles) {
      var css_rule_begin = "#main-outlet .container.posts > .row {",
          css_rule_content = "",
          css_rule_end = "}";

      for (var rule in styles) {
        css_rule_content += rule + ":" + (parseInt(styles[rule].sort()[styles[rule].length - 1], 0) + 15) + "px;";
      }

      style.sheet.insertRule(css_rule_begin + css_rule_content + css_rule_end, 0);
      style.sheet.insertRule("#main-outlet .container.posts {position: relative;}", 1);
    };

    // Remove CSS patches from posts container
    var remove_css_rules = function() {
      while (style.sheet.rules.length) {
        style.sheet.removeRule(0);
      }
    };

    // Generate unique iframe id based on its
    // data settings e.g. url, placement and dimensions
    var frame_id = function(data) {
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
    };

    // Add new frames and remove old/obsolete ones
    var sync_iframes = function(elements) {
      var ids = [],
          $container = $("#main-outlet .container.posts");

      // Calculate ids for all frames in the queue
      elements.forEach(function(data) { ids.push(frame_id(data)) });

      var $frames = $container.find("> iframe.iframe-embed-frame");

      // Remove frames that are missing from the new ids array
      $frames.each(function() {
        if (ids.indexOf(this.id) < 0) $(this).remove();
      });

      // Sometimes we have more that one frame at a side
      var offsets = { left: 0, right: 0, top: 0, bottom: 0 };

      elements.forEach(function(data, index) {
        if (!$("#" + ids[index]).length) {
          var position = "";

          switch (data.placement) {
            case "right":
              position += "right: 0;";
              break;
            case "left":
              position += "left: 0;";
          }

          var $iframe = $("<iframe>", {
            "id": ids[index],
            "class": "iframe-embed-frame",
            "frameborder": 0,
            "src": data.url,
            "style": "position: absolute; top: " + offsets[data.placement] +
              "px; " + position + " width: " + data.width + "; height: " + data.height + ";"
          });

          $container.append($iframe);
        }

        offsets[data.placement] += parseInt(data.height, 0) + 15; // Padding 15px
      });
    };

    PostView.reopen({
      _createIframeEmbeds: function($post) {
        remove_css_rules();

        if (!this.get("post").get("firstPost")) return;

        var $targets = $post.find(".iframe-embed"),
            styles = {},
            elements = [];

        $targets.each(function() {
          var data = $.extend({}, default_options, $(this).data()),
              setting = "margin-" + data['placement'];

          if (!styles.hasOwnProperty(setting)) styles[setting] = [];

          elements.push(data);
          styles[setting].push(data["width"]);
        }).remove();

        add_css_rules(styles);
        sync_iframes(elements);
      }.on("postViewInserted", "postViewUpdated")
    });
  }
};
