(function() {

  /*
  jQuery.Roadblocked (0.1)
  Rapidly implement device-targeted, landing interstitials for mobile + tablet visitors to your site.
  Source: http://github.com/bsheldon/jquery.roadblocked by @ojogringo
  Built from coffee-plate: http://github.com/pthrasher/coffee-plate by @philipthrasher
  Requires: jquery, jquery-cookie
  */

  var __hasProp = Object.prototype.hasOwnProperty;

  (function($) {
    $.roadblocked = function(el, options) {
      var buildDismissUI, killBody, scanDevice, setBody, setCookie;
      var _this = this;
      this.el = el;
      this.$el = $(el);
      this.$el.data("roadblocked", this);
      this.init = function() {
        var campaign, cookiesEnabled, data, detectedDevice, trigger, _i, _len, _ref, _ref2;
        _this.options = $.extend({}, options);
        jQuery.cookie('probe', 'landed');
        if (jQuery.cookie('probe') != null) cookiesEnabled = true;
        if (cookiesEnabled) {
          console.log(_this.options);
          _ref = _this.options;
          for (campaign in _ref) {
            if (!__hasProp.call(_ref, campaign)) continue;
            data = _ref[campaign];
            if (jQuery.cookie("" + campaign) !== 'done') {
              detectedDevice = scanDevice(data.options.devices);
              console.log(campaign);
              console.log(data);
              _ref2 = data.triggers;
              for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
                trigger = _ref2[_i];
                console.log(trigger);
                console.log("" + (trigger.device != null) + " " + trigger.device + " " + detectedDevice);
                if ((trigger.device != null) && trigger.device === detectedDevice) {
                  console.log("" + trigger.device + " passed trigger check");
                  _this.activate(campaign, data, trigger);
                  return _this;
                } else if ((trigger.condition != null) && trigger.condition()) {
                  _this.activate(campaign, data, trigger);
                  return _this;
                }
              }
            }
          }
        }
        return _this;
      };
      this.activate = function(campaign, data, interstitial) {
        var content, dismiss, link;
        dismiss = buildDismissUI(data.options);
        content = _this.setContent(data.options, interstitial);
        link = interstitial['link'];
        _this.placeInterstitial(data.options, dismiss, content, link, 'macintosh');
        setBody(true);
        return setCookie(data.options.lifetime, campaign, data.options.path);
      };
      scanDevice = function(devices) {
        var device, device_agent, featured_list, present, _fn, _i, _len;
        present = '';
        featured_list = devices;
        device_agent = navigator.userAgent.toLowerCase();
        _fn = function(device) {
          if (device_agent.indexOf(device) > -1) {
            if (device === 'android') {
              if (device_agent.indexOf('mobile') > -1) return present = device;
            } else {
              return present = device;
            }
          }
        };
        for (_i = 0, _len = featured_list.length; _i < _len; _i++) {
          device = featured_list[_i];
          _fn(device);
        }
        return present;
      };
      this.placeInterstitial = function(options, dismiss, content, link, device) {
        var blackout, container;
        blackout = $('<div\>', {
          id: 'roadblocked-blackout'
        });
        blackout.css({
          'background-color': options.blackoutColor,
          'opacity': options.blackoutOpacity,
          '-moz-opacity': options.blackoutOpacity,
          'filter': 'alpha(opacity=' + (options.blackoutOpacity * 100) + ')',
          'width': '100%',
          'height': '100%',
          'top': '0',
          'left': '0',
          'position': 'fixed',
          'z-index': '100',
          'margin': '0',
          'display': 'block'
        });
        container = $('<div\>', {
          id: 'roadblocked-container',
          "class": device
        });
        container.html('');
        container.css({
          'top': '0',
          'left': '0',
          'height': '100%',
          'width': '100%',
          'position': 'fixed',
          'z-index': '101',
          'margin': '0',
          'display': 'block',
          'cursor': 'pointer'
        });
        $('body').prepend(blackout);
        $('body').prepend(container);
        $('#roadblocked-container').prepend(dismiss);
        if (options.dismissPlacement === 'top') {
          $('#dismiss-bar').after(content);
        } else if (options.dismissPlacement === 'bottom') {
          $('#dismiss-bar').before(content);
        } else {
          $('#dismiss-bar').after(content);
        }
        $('#dismiss-bar').click(function() {
          $('#roadblocked-container, #roadblocked-blackout').fadeOut('fast');
          return killBody();
        });
        return $('#inter-content').click(function() {
          if (link != null) {
            window.location = "" + link;
            $('#roadblocked-container, #roadblocked-blackout').fadeOut('fast');
            return killBody();
          }
        });
      };
      buildDismissUI = function(options) {
        var dismissLabel, height, self;
        dismissLabel = options.dismissLabel;
        if (typeof dismissLabel === 'string') {
          height = (parseFloat(options.dismissLabelHeight) / 100) * $(window).height();
          self = $('<div\>', {
            id: 'dismiss-bar'
          });
          self.css({
            'height': height,
            'width': '90%',
            'margin': '0 auto',
            'text-align': "" + options.dismissLabelAlign,
            'background-image': "url('" + options.imgPath + "/" + options.dismissLabel + "')",
            'background-position': "" + options.dismissLabelAlign,
            'background-repeat': 'no-repeat',
            'background-size': 'contain'
          });
          return self;
        } else if (typeof dismissLabel === 'object') {
          dismissLabel.attr('id', 'dismiss-bar');
          dismissLabel.show();
          return dismissLabel;
        }
      };
      this.setContent = function(options, interstitial) {
        var height, self;
        if (interstitial['img'] != null) {
          self = $('<div\>', {
            id: 'inter-content'
          });
          if (typeof options.dismissLabel === 'string') {
            height = (100 - parseFloat(options.dismissLabelHeight)).toString() + '%';
          } else {
            height = '100%';
          }
          self.css({
            'height': height,
            'width': '100%',
            'background-image': "url('" + options.imgPath + "/" + interstitial['img'] + "')",
            'background-position': 'top',
            'background-repeat': 'no-repeat',
            'background-size': 'contain'
          });
          return self;
        } else if (interstitial['selector'] != null) {
          interstitial['selector'].attr('id', 'inter-content');
          interstitial['selector'].show();
          return interstitial['selector'];
        }
      };
      setBody = function(state, device) {
        if (state === true) return $('body').css('position', 'fixed');
      };
      killBody = function() {
        return $('body').css('position', 'static');
      };
      setCookie = function(lifetime, campaign, path_dir) {
        return jQuery.cookie("" + campaign, 'done', {
          expires: lifetime,
          path: path_dir
        });
      };
      this.isRetna = function() {
        var _ref;
        return (_ref = window.devicePixelRatio > 1) != null ? _ref : {
          "true": false
        };
      };
      return this.init();
    };
    $.roadblocked.defaults = {
      imgPath: 'images',
      retnaPath: 'images/retna',
      overlayBackgroundColor: 'transparent',
      dismissLabelHeight: '7.5%',
      dismissLabelAlign: 'center',
      dismissPlacement: 'top',
      lifetime: 0,
      path: '/',
      campaignName: 'jqueryRoadblocked'
    };
    $.fn.roadblocked = function(options) {
      return $.each(this, function(i, el) {
        var $el;
        $el = $(el);
        if (!$el.data('roadblocked')) {
          return $el.data('roadblocked', new $.roadblocked(el, options));
        }
      });
    };
    return;
  })(jQuery);

}).call(this);
