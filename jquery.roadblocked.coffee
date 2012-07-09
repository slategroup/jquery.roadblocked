    ###
    jQuery.Roadblocked (0.1)
    Rapidly implement device-targeted, landing interstitials for mobile + tablet visitors to your site.
    Source: http://github.com/bsheldon/jquery.roadblocked by @ojogringo
    Built from coffee-plate: http://github.com/pthrasher/coffee-plate by @philipthrasher
    Requires: jquery, jquery-cookie
    ###

    (($) ->
      
      $.roadblocked = (el, options) ->
        @el = el
        @$el =  $ el
        @$el.data "roadblocked", @
        
        @init = =>
          @options = $.extend {}, options
          # First, test to see if browser cookies enabled
          jQuery.cookie('probe','landed')
          cookiesEnabled = true if jQuery.cookie('probe')?

          if cookiesEnabled
            #console.log(@options);
            for own campaign, data of @options
              if jQuery.cookie("#{campaign}") != 'done'
                detectedDevice = scanDevice data.options.devices
                #console.log(campaign);
                #console.log(data);
                for trigger in data.triggers
                  #console.log trigger
                  #console.log "#{trigger.device?} #{trigger.device} #{detectedDevice}"
                  if trigger.device? and trigger.device == detectedDevice
                    #console.log "#{trigger.device} passed trigger check"
                    @activate(campaign, data, trigger)
                    return @
                  else if trigger.condition? and trigger.condition()
                    @activate(campaign, data, trigger)
                    return @

          return @

        @activate = (campaign, data, interstitial) =>
          dismiss = buildDismissUI(data.options)
          content = @setContent(data.options, interstitial)
          link = interstitial['link']
          if not data.options.autoPlacement? or data.options.autoPlacement is yes
              @placeInterstitial(data.options, dismiss, content, link, 'macintosh')
          if interstitial.execute?
            interstitial.execute.call(@$el[0], interstitial)
          setBody(on)
          setCookie(data.options.lifetime, campaign, data.options.path)

        # Check current user's device and return with match
        scanDevice = (devices) =>
          present = ''
          featured_list = devices
          #for d of devices
          #  featured_list.push(d)
          device_agent = navigator.userAgent.toLowerCase()
          for device in featured_list
            do (device) ->
              if device_agent.indexOf(device) > -1 
                if device == 'android'
                  # verify this is an android phone, not tablet
                  if device_agent.indexOf('mobile') > -1
                    present = device
                else
                  present = device
          return present
         
        # Append interstitial element to target
        @placeInterstitial = (options, dismiss, content, link, device) =>
            blackout = $('<div\>', { id: 'roadblocked-blackout' })
            if not options.blackout? or options.blackout is yes
                blackout.css
                    'background-color' : options.blackoutColor
                    'opacity' : options.blackoutOpacity
                    '-moz-opacity' : options.blackoutOpacity
                    'filter' : 'alpha(opacity=' + (options.blackoutOpacity * 100) + ')'
                    'width' : '100%'
                    'height' : '100%'
                    'top' : '0'
                    'left' : '0'
                    'position' : 'fixed'
                    'z-index' : '100'
                    'margin' : '0'
                    'display' : 'block'

            container = $('<div\>', { id: 'roadblocked-container', class: device })
            container.html('')
            container.css
                'top' : '0'
                'left' : '0'
                'height' : '100%'
                'width' : '100%'
                'position' : 'fixed'
                'z-index' : '101'
                'margin' : '0'
                'display' : 'block'

            if link?
                container.css('cursor','pointer')
             
            $('body').prepend(blackout)
            $('body').prepend(container)
            if dismiss?
                $('#roadblocked-container').prepend(dismiss)
                if options.dismissPlacement == 'top'
                    $('#dismiss-bar').after(content)
                else if options.dismissPlacement == 'bottom'
                    $('#dismiss-bar').before(content)
                else
                    $('#roadblocked-container').append(content)
            else
                $('#roadblocked-container').append(content)

            # set tap regions to links
            $('#dismiss-bar').click(->
                $('#roadblocked-container, #roadblocked-blackout').fadeOut('fast')
                killBody()
            )
            $('#inter-content').click(->
                if link?
                  window.location = "#{link}"
                  $('#roadblocked-container, #roadblocked-blackout').fadeOut('fast')
                  killBody()
            )
             
        # Build dismiss bar
        buildDismissUI = (options) =>
          dismissLabel = options.dismissLabel
          # if message is text, build standard label
          if typeof dismissLabel == 'string'
            height =  (parseFloat(options.dismissLabelHeight)/100) * $(window).height()
            self = $('<div\>', { id: 'dismiss-bar' })
            self.css
              'height' : height
              'width' : '90%'
              'margin' : '0 auto'
              'text-align' : "#{options.dismissLabelAlign}"
              'background-image' : "url('#{options.imgPath}/#{options.dismissLabel}')"
              'background-position' : "#{options.dismissLabelAlign}"
              'background-repeat' : 'no-repeat'
            
            if not options.scale? or options.scale is yes
                self.css('background-size', 'contain')
            return self 
          # if jQuery object place it as dismiss UI
          else if typeof dismissLabel == 'object'
            dismissLabel.attr('id','dismiss-bar')
            dismissLabel.show()
            return dismissLabel
         
        
        # Set interstitial content   
        @setContent = (options, interstitial) =>
          if interstitial['img']?
            self = $('<div\>', { id: 'inter-content' })
            # if dismiss label is image, use height config value to calculate diff
            if typeof options.dismissLabel == 'string'
              height = (100 - parseFloat options.dismissLabelHeight).toString() + '%'
            else
              height = '100%'
            self.css
              'height' : height
              'width' : '100%'
              'background-position' : 'top'
              'background-repeat' : 'no-repeat'

            if not options.scale? or options.scale is yes
              self.css('background-size', 'contain')

            #console.log self.css
            #console.log interstitial
            if interstitial['img']?
              self.css('background-image',"url('#{options.imgPath}/#{interstitial['img']}')")
            #console.log self.css

            return self 
          else if interstitial['selector']?
            interstitial['selector'].attr('id','inter-content')
            interstitial['selector'].show()
            return interstitial['selector']
          
        setBody = (state, device) =>
          if state == on then $('body').css('position','fixed')
          
        killBody = =>  
          $('body').css('position','static')
          
        setCookie = (lifetime, campaign, path_dir) ->
          jQuery.cookie("#{campaign}", 'done', { expires: lifetime, path: path_dir })
          
        # Method to check whether device is retna display
        @isRetna = =>
          window.devicePixelRatio > 1 ? true : false
          
        @init()
          
      $.roadblocked.defaults =
        imgPath : 'images' # defaults to local images dir for plugin
        retnaPath : 'images/retna' # retna versions of files in subfolder retna
        overlayBackgroundColor : 'transparent'
        dismissLabelHeight : '7.5%' # sets relative percentage of screen
        dismissLabelAlign : 'center'  # left, center, right (defaults right)
        dismissPlacement : 'top' # top or bottom (default top)
        lifetime : 0 # run once per X period in days, 0 to run every visit
        path : '/' # cookie path, defaults to full domain
        campaignName : 'jqueryRoadblocked'

      $.fn.roadblocked = (options) ->
        $.each @, (i, el) ->
          $el = ($ el)
          # Only instantiate if not previously done.
          unless $el.data 'roadblocked'
            $el.data 'roadblocked', new $.roadblocked el, options
      undefined
            
    )(jQuery)
