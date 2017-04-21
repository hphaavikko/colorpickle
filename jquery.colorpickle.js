/**
 * jQuery Colorpickle plugin
 *
 * @copyright   2016 Hape Haavikko
 * @author      Hape Haavikko <hape.haavikko@fakiirimedia.com>
 * @version     1.0.0
 */
;(function ( $, window, document, undefined ) {
    
    $.colorpickle = function(element, options) {
        
        // Default settings overwritten by options if given
        var defaults = {
            "clickToggle": false,
            "closeOnOk": false,
            "closeOnCancel": false,
            "draggable": false,
            "hex": null,
            "hsl": null,
            "hslSliders": true,
            "modal": false,
            "mode": "hex",
            "onCancel": null,
            "onChange": null,
            "onInit": null,
            "onOk": null,
            "onTop": false, 
            "rgb": [255, 140, 60],
            "rgbSliders": true,
            "showCancel": false,
            "showHex": true,
            "showOk": false,
            "showSLGradient": true,
            "showSwatch": true,
            "textCancel": "Cancel",
            "textOk": "Ok",
            "theme": null,
            "visible": true,
            "width": null
        };
        
        var r;
        var g;
        var b;
        var hex;
        var hsl;
        var h;
        var s;
        var l;
        var v;
        
        var instance = $("div.colorpickle").length + 1;
        var instanceId = "colorpickle" + instance;
        var picking = false;
        
        // References to RGB and HSL slider wrapper divs
        var rWrapper = "#" + instanceId + " .rWrapper";
        var gWrapper = "#" + instanceId + " .gWrapper";
        var bWrapper = "#" + instanceId + " .bWrapper";
        var hWrapper = "#" + instanceId + " .hWrapper";
        var sWrapper = "#" + instanceId + " .sWrapper";
        var lWrapper = "#" + instanceId + " .lWrapper";
        
        // References to RGB and HSL sliders (range type inputs)
        var redSlider = "#" + instanceId + " .r";
        var greenSlider = "#" + instanceId + " .g";
        var blueSlider = "#" + instanceId + " .b";
        var hueSlider = "#" + instanceId + " .h";
        var saturationSlider = "#" + instanceId + " .s";
        var lightnessSlider = "#" + instanceId + " .l";
        
        // References to slider backgrounds (gradients)
        var redSliderBg = "#" + instanceId + " .rWrapper .sliderBg";
        var greenSliderBg = "#" + instanceId + " .gWrapper .sliderBg";
        var blueSliderBg = "#" + instanceId + " .bWrapper .sliderBg";
        var hueSliderBg = "#" + instanceId + " .hWrapper .sliderBg";
        var saturationSliderBg = "#" + instanceId + " .sWrapper .sliderBg";
        var lightnessSliderBg = "#" + instanceId + " .lWrapper .sliderBg";
        
        // References to RGB and HSL value inputs
        var rInput = "#" + instanceId + " .rInput";
        var gInput = "#" + instanceId + " .gInput";
        var bInput = "#" + instanceId + " .bInput";
        var hInput = "#" + instanceId + " .hInput";
        var sInput = "#" + instanceId + " .sInput";
        var lInput = "#" + instanceId + " .lInput";
        
        var colorPickerWrapper = "#"+instanceId+" .colorPickerWrapper";
        var colorPickerBg = "#"+instanceId+" .colorPickerBg";
        var colorPicker = "#"+instanceId+" .colorPicker";
        var colorPickerIndicator = "#"+instanceId+" .colorPickerIndicator";
        var colorPickerIcon = "#" + instanceId + "Icon";
        var swatch = "#"+instanceId+" .swatch";
        
        var plugin = this;
        
        /**
         * This will hold the merged default and user-provided options
         * Properties will be available through this object like:
         * plugin.settings.propertyName from inside the plugin
         */
        plugin.settings = {};
        
        // Reference to the jQuery version of DOM element
        var $element = $(element);
        
        // Reference to the actual DOM element
        var el = element;    
        
        // The constructor method that gets called when the object is created
        plugin.init = function() {
            
            // Merged default and user-provided options (if given)
            plugin.settings = $.extend({}, defaults, options);
            
            // Public properties accessed via element.data('colorpickle').propertyName
            plugin.rgb = null;
            plugin.hsl = null;
            plugin.hex = null;
            
            if ($element.is("div"))
            {
                // Insert colorpicker in the div used to invoke the colorpicker
                $(el).append('<div id="' + instanceId + '" class="colorpickle"></div>');
            }
            else
            {
                // If not a div (input for example) insert colorpicker after the element used to invoke the colorpicker
                if (plugin.settings.modal == true) 
                {
                    // Put modal picker to the end of body
                    $("body").append('<div id="' + instanceId + '" class="colorpickle"></div>');
                } 
                else 
                {
                    $('<div id="' + instanceId + '" class="colorpickle"></div>').insertAfter($element);
                }
                
                $('<button type="button" id="' + instanceId + 'Icon" class="colorPickerIcon">&nbsp;</button>').insertAfter($element);
            }
            
            if (plugin.settings.theme != null)
            {
                $("#" + instanceId).addClass("colorpickle-theme-" + plugin.settings.theme);
            }
            
            if ($element.is("input"))
            {
                $(el).keypress(function () { return false; });
            }
            
            if (plugin.settings.onTop == true)
            {
                $("#"+instanceId).addClass("colorpickleOnTop");
            }
            
            if (plugin.settings.width != null)
            {
                $("#"+instanceId).css("width", plugin.settings.width);
            }
            
            // Drag handle
            if (plugin.settings.draggable == true)
            {
                $("#"+instanceId).append('<div class="dragHandle"></div>');
                
                $("#"+instanceId+" .dragHandle").mousedown(function(e) {
                    
                    var parentOffset = $(this).parent().offset();
                    var relX = e.pageX - parentOffset.left;
                    var relY = e.pageY - parentOffset.top;
                    
                    $("body").mousemove(function(e) {
                        $("#"+instanceId).offset({
                            top: e.pageY - relY,
                            left: e.pageX - relX
                        });
                    });
                    
                    $("body").css("cursor", "move");
                });
                
                $("body").mouseup(function() {
                    $("body").off("mousemove");
                    $("body").css("cursor", "default");
                });
            }
            
            if (plugin.settings.hex != null) 
            {
                hex = plugin.settings.hex;
                var rgbTemp = hexToRgb(plugin.settings.hex);
                plugin.settings.rgb[0] = rgbTemp.r;
                plugin.settings.rgb[1] = rgbTemp.g;
                plugin.settings.rgb[2] = rgbTemp.b;
            }
            
            createSlider('r', 0, 255, plugin.settings.rgb[0]);
            createSlider('g', 0, 255, plugin.settings.rgb[1]);
            createSlider('b', 0, 255, plugin.settings.rgb[2]);
            
            createSlider('h', 0, 360, 50);
            createSlider('s', 0, 100, 50);
            createSlider('l', 0, 100, 50);
            
            if (plugin.settings.hsl != null) 
            {
                $(hueSlider).val(plugin.settings.hsl[0]);
                $(saturationSlider).val(plugin.settings.hsl[1]);
                $(lightnessSlider).val(plugin.settings.hsl[2]);
                setHSL();
            }
            
            $("#"+instanceId).append('<div class="colorPickerWrapper"></div>');
            $(colorPickerWrapper).append('<div class="colorPickerBg"></div>');
            $(colorPickerWrapper).append('<div class="colorPicker"><div class="gradientTp2White"></div><div class="gradientTp2Black"></div></div>');
            $(colorPickerWrapper).append('<div class="colorPickerIndicator"></div>');
            
            $("#"+instanceId).append('<div class="clear"></div>');
            
            $("#"+instanceId).append('<div class="swatchHex"></div>');
            $("#"+instanceId+" .swatchHex").append('<div class="swatch"></div>');
            $("#"+instanceId+" .swatchHex").append('<input type="text" class="hexValue" name="hexValue" maxlength="7" />');
            
            $("#"+instanceId).append('<div class="buttonsWrapper"></div>');
            
            if (plugin.settings.showCancel)
            {
                $("#"+instanceId+" .buttonsWrapper").append('<button type="button" class="cancelBtn">' + plugin.settings.textCancel + '</button>');
            }
            
            if (plugin.settings.showOk)
            {
                $("#"+instanceId+" .buttonsWrapper").append('<button type="button" class="okBtn">' + plugin.settings.textOk + '</button>');
            }
            
            $("#"+instanceId).append('<div class="clear"></div>');
            
            /**
             * Update all color values from RGB values when dragging RGB sliders.
             * Onchange and input events don't work yet on all browsers!
             */
            /*$(redSlider+", "+greenSlider+", "+blueSlider).mousedown(function () {
                $(this).mousemove(function () {
                    setRGB();
                });
            });*/
            $(redSlider+", "+greenSlider+", "+blueSlider).bind("touchstart mousedown", function () {
                $(this).bind("touchmove mousemove", function () {
                    setRGB();
                });
            });
            
            /**
             * Update all color values from HSL values when dragging HSL sliders.
             * Onchange and input events don't work yet on all browsers!
             */
            /*$(hueSlider+", "+saturationSlider+", "+lightnessSlider).mousedown(function () {
                $(this).mousemove(function () {
                    setHSL();
                });
            });*/
            $(hueSlider+", "+saturationSlider+", "+lightnessSlider).bind("touchstart mousedown", function () {
                $(this).bind("touchmove mousemove", function () {
                    setHSL();
                });
            });
            
            /**
             * Unbind mousemove event hanlder from all sliders on mouseup.
             */
            /*$(".slider").mouseup(function () {
                $(this).unbind('mousemove');
            }).mouseout(function () {
                $(this).unbind('mousemove');
            });*/
            $(redSlider+", "+greenSlider+", "+blueSlider).bind("touchend mouseup mouseout", function () {
                $(this).unbind("touchmove mousemove");
                //setRGB();
            });
            
            $(hueSlider+", "+saturationSlider+", "+lightnessSlider).bind("touchend mouseup mouseout", function () {
                $(this).unbind("touchmove mousemove");
                //setHSL();
            });
            
            /**
             * Sets slider positions when rgb values are changed in the input fields
             */
            $('.colorValue').keyup(function() {
                
                var sliderId = $(this).attr("data-sliderId");
                
                // Make sure only numbers are accepted
                if (isNaN(this.value)) {
                    this.value = $("#"+instanceId+" ."+sliderId).val();
                    return false;
                }
                
                $("#"+instanceId+" ."+sliderId).val(this.value);
                
                if (sliderId == 'r' || sliderId == 'g' || sliderId == 'b')
                {
                    setRGB();
                }
                else if (sliderId == 'h' || sliderId == 's' || sliderId == 'l')
                {
                    setHSL();
                }
                
                return true;
            });
            
            /**
             * Set sliders and rgb/hsl values when hex value is changed
             */
            $("#"+instanceId+" .hexValue").keyup(function() {
                if (this.value.charAt(0) != '#') 
                {
                    this.value = '#' + this.value;
                }
                
                if (this.value.length == 7)
                {   
                    if (hexToRgb(this.value))
                    {
                        hex = this.value;
                        var rgb = hexToRgb(this.value);
                        r = rgb.r;
                        g = rgb.g;
                        b = rgb.b;
                        setSliders();
                        setRGB();
                    }
                    else
                    {
                        this.value = hex;
                    }
                }
            });
            
            $(colorPickerWrapper).mousedown(function(e) {
                picking = true;
                pickColor(e, this);
            });
            
            $(colorPickerWrapper).mousemove(function(e) {
                if (picking == true)
                {
                    pickColor(e, this);
                }
            });
            
            $(colorPickerWrapper).bind('mouseup mouseleave', function(e) {
                picking = false;
            });
            
            // Put color value in the input
            $("#"+instanceId+" .okBtn").click(function() {
                
                if (plugin.settings.mode == "rgb")
                {
                    $element.val("rgb("+r+", "+g+", "+b+")");
                }
                else if (plugin.settings.mode == "hex")
                {
                    $element.val("#"+hex);
                }
                else if (plugin.settings.mode == "hsl")
                {
                    $element.val("hsl("+h+", "+s+"%, "+l+"%)");
                }
                
                // Execute custom onOk function if given
                if (plugin.settings.onOk != null)
                {
                    plugin.settings.onOk();
                }
                
                if (plugin.settings.closeOnOk == true)
                {
                    showHide();
                }
                
                $(colorPickerIcon).css("background-color", "#" + hex);
            });
            
            // Cancel
            $("#"+instanceId+" .cancelBtn").click(function() {
                
                // Execute custom onCancel function if given
                if (plugin.settings.onCancel != null)
                {
                    plugin.settings.onCancel();
                }
                
                if (plugin.settings.closeOnCancel == true)
                {
                    showHide();
                }
            });
            
            $(window).scroll(function() {
                if (plugin.settings.modal == true && plugin.settings.draggable == false)
                {
                    center();
                }
            });
            
            /**
             * To keep the color indicator in the right place when resizing.
             */
            $(window).resize(function() {
                setRGB();
                if (plugin.settings.modal == true && plugin.settings.draggable == false)
                {
                    center();
                }
            });
            
            if (plugin.settings.clickToggle == true)
            {
                $element.click(function() {
                    showHide();
                });
                
                $(colorPickerIcon).click(function() {
                    showHide();
                });
            }
            
            // Modal
            if (plugin.settings.modal == true)
            {
                center();
                $("body").append('<div id="'+instanceId+'overlay" class="colorpickleModalOverlay"></div>');
            }
            
            // Hide stuff according to custom settings
            if (plugin.settings.showSwatch == false)
            {
                $(swatch).hide();
            }
            
            if (! plugin.settings.showSLGradient)
            {
                $(colorPickerWrapper).hide();
            }
            
            if (plugin.settings.rgbSliders == false)
            {
                $(rWrapper).hide();
                $(gWrapper).hide();
                $(bWrapper).hide();
            }
            
            if (plugin.settings.hslSliders == false)
            {
                $(hWrapper).hide();
                $(sWrapper).hide();
                $(lWrapper).hide();
            }
            
            if (plugin.settings.showHex == false)
            {
                $("#"+instanceId+" .hexValue").hide();
            }
            
            // Make room for buttons
            if (plugin.settings.showCancel || plugin.settings.showOk) 
            {
                $("#"+instanceId).css("min-height", ($("#"+instanceId).height() + $("#"+instanceId+" .buttonsWrapper").height() - parseInt($("#"+instanceId).css("padding-bottom"))) + "px");
            }
            
            setRGB();
            
            $(colorPickerIcon).css("background-color", "#" + hex);
            
            if (plugin.settings.visible == false)
            {
                $("#"+instanceId).hide();
            }
            
            // Call onInit if set
            if ($.isFunction(plugin.settings.onInit))
            {
                plugin.settings.onInit();
            }
        }
 
        /**
         * Public methods
         * Call from inside: plugin.methodName(arg1, arg2, ... argn)
         * Call from outside: $(selector).colorpickle("methodName", arg1, arg2, ... argn)
         */
        
        /**
         * Set Colorpickle current RGB value from outside
         */
        plugin.setRGB = function(r, g, b) {
            $(redSlider).val(r);
            $(greenSlider).val(g);
            $(blueSlider).val(b);
            setRGB();
        };
        
        /**
         * Set Colorpickle current HSL value from outside
         */
        plugin.setHSL = function(h, s, l) {
            $(hueSlider).val(h);
            $(saturationSlider).val(s);
            $(lightnessSlider).val(l);
            setHSL();
        };
        
        /**
         * Set Colorpickle current RGB hex value from outside
         */
        plugin.setHex = function(hex) {
            var rgb = hexToRgb(hex);
            $(redSlider).val(rgb.r);
            $(greenSlider).val(rgb.g);
            $(blueSlider).val(rgb.b);
            setRGB();
        };
        
        /**
         * Private methods
         * Call from inside only: methodName(arg1, arg2, ... argn)
         */
        
        /**
         * Creates a range input to control a color component
         * r = Red, g = Green, b = Blue
         * h = Hue, s = Saturation, l = Lightness
         * 
         * @param   color   string
         * @param   min     int
         * @param   max     int
         * @param   value   int
         * 
         * @return void
         */
        var createSlider = function(color, min, max, value)
        {   
            var wrapperName = color + "Wrapper";
            var unit = '';
            
            if (color == 'h')
            {
                unit = ' &deg;';
            }
            else if (color == 's' ||color == 'l')
            {
                unit = ' %';
            }
            
            $("#" + instanceId).append('<div class="sliderWrapper ' + wrapperName + '"></div>');
            $("#" + instanceId + " ." + wrapperName).append('<label>' + color.toUpperCase() + ' ' + unit + '</label>');
            $("#" + instanceId + " ." + wrapperName).append('<div class="sliderBg"></div>');
            $("#" + instanceId + " ." + wrapperName).append('<div class="sliderDiv"><input type="range" class="slider ' + color + '" min="' + min + '" max="' + max + '" step="1" value="' + value + '" /></div>');
            $("#" + instanceId + " ." + wrapperName).append('<input type="text" data-sliderId="' + color + '" class="' + color + 'Input sliderValue colorValue" value="0" />');
        };
        
        var setRGB = function()
        {
            r = parseInt($(redSlider).val());
            g = parseInt($(greenSlider).val());
            b = parseInt($(blueSlider).val());
            
            hsl = rgbToHsl(r, g, b);
            h = Math.round(hsl[0]*360);
            s = Math.round(hsl[1]*100);
            l = Math.round(hsl[2]*100);
            
            setHex();
            setSliders();
            setFields();
            setSliderBackgrounds();
            setIndicator();
        };
        
        var setHSL = function()
        {
            h = parseInt($(hueSlider).val());
            s = parseInt($(saturationSlider).val());
            l = parseInt($(lightnessSlider).val());
            
            var rgb = hslToRgb(h/360, s/100, l/100);
            r = Math.round(rgb[0]);
            g = Math.round(rgb[1]);
            b = Math.round(rgb[2]);
            
            setHex();
            setSliders();
            setFields();
            setSliderBackgrounds();
            setIndicator();
        };
        
        /**
         * Sets hex value and updates swatch color.
         * Also the public color properties are updated here.
         *
         * @return  void
         */
        var setHex = function()
        {            
            hex = rgbToHex(r, g, b);
            $(swatch).css("background-color", "#" + hex);
            
            var pickerRGB = hslToRgb(h/360, 1, 0.5);
            var pickerR = Math.round(pickerRGB[0]);
            var pickerG = Math.round(pickerRGB[1]);
            var pickerB = Math.round(pickerRGB[2]);
            
            var pickerHex = rgbToHex(pickerR, pickerG, pickerB);
            
            $(colorPickerBg).css("background-color", "#" + pickerHex);
            
            // Execute custom onChange function if given and the color has changed
            if (plugin.settings.onChange != null && plugin.rgb != null && plugin.hex != '#' + hex)
            {
                plugin.settings.onChange();
            }
            
            // Set public color properties
            plugin.rgb = 'rgb(' + r + ',' + g + ',' + b + ')';
            plugin.hsl = 'hsl(' + h + ',' + s + ',' + l + ')';
            plugin.hex = '#' + hex;
        };
        
        /**
         * Converts a RGB color value to hex.
         * 
         * @param   r   int
         * @param   g   int
         * @param   b   int
         *
         * @return  string
         */
        var rgbToHex = function(r, g, b)
        {
            var hex = [
                r.toString(16),
                g.toString(16),
                b.toString(16)
            ];
            $.each(hex, function(nr, val) {
                if (val.length === 1) {
                    hex[ nr ] = "0" + val;
                }
            });
            
            return hex.join("");
        };
        
        /**
         * Converts a hex color value to RGB.
         */
        var hexToRgb = function(hex)
        {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : false;
        };
        
        /**
        * Converts an HSL color value to RGB.
        * Conversion formula adapted from http://en.wikipedia.org/wiki/HSL_color_space.
        * Assumes h, s, and l are contained in the set [0, 1] and
        * returns r, g, and b in the set [0, 255].
        *
        * @param   Number  h       The hue
        * @param   Number  s       The saturation
        * @param   Number  l       The lightness
        * @return  Array           The RGB representation
        */
        var hslToRgb = function(h, s, l){
           var r, g, b;
            
           if(s == 0){
               r = g = b = l; // achromatic
           }else{
               function hue2rgb(p, q, t){
                   if(t < 0) t += 1;
                   if(t > 1) t -= 1;
                   if(t < 1/6) return p + (q - p) * 6 * t;
                   if(t < 1/2) return q;
                   if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                   return p;
               }
                
               var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
               var p = 2 * l - q;
               r = hue2rgb(p, q, h + 1/3);
               g = hue2rgb(p, q, h);
               b = hue2rgb(p, q, h - 1/3);
           }
            
           return [r * 255, g * 255, b * 255];
        };
        
        /**
        * Converts an RGB color value to HSL.
        * Conversion formula adapted from http://en.wikipedia.org/wiki/HSL_color_space.
        * Assumes r, g, and b are contained in the set [0, 255] and
        * returns h, s, and l in the set [0, 1].
        *
        * @param   Number  r       The red color value
        * @param   Number  g       The green color value
        * @param   Number  b       The blue color value
        * 
        * @return  Array           The HSL representation
        */
        var rgbToHsl = function(r, g, b)
        {
            r /= 255, g /= 255, b /= 255;
            var max = Math.max(r, g, b), min = Math.min(r, g, b);
            var h, s, l = (max + min) / 2;
            
           if(max == min){
               h = s = 0; // achromatic
           }else{
               var d = max - min;
               s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
               switch(max){
                   case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                   case g: h = (b - r) / d + 2; break;
                   case b: h = (r - g) / d + 4; break;
               }
               h /= 6;
            }
            
            return [h, s, l];
        };
        
        var hsv2hsl = function(a,b,c){return[a,b*c/((a=(2-b)*c)<1?a:2-a),a/2]};
        var hsl2hsv = function(a,b,c){b*=c<.5?c:1-c;return[a,2*b/(c+b),c+b]};
        
        var getPos = function(obj)
        {
            var curleft = curtop = 0;
            if (obj.offsetParent)
            {
                do {
                    curleft += obj.offsetLeft;
                    curtop += obj.offsetTop;
                }
                while (obj = obj.offsetParent);
            }
            return [curleft,curtop];
        };
        
        var setFields = function()
        {
            $(rInput).val(r);
            $(gInput).val(g);
            $(bInput).val(b);
            $(hInput).val(h);
            $(sInput).val(s);
            $(lInput).val(l);
            $("#"+instanceId+" .hexValue").val("#" + hex);
        };
        
        var setSliders = function()
        {
            $(redSlider).val(r);
            $(greenSlider).val(g);
            $(blueSlider).val(b);
            $(hueSlider).val(h);
            $(saturationSlider).val(s);
            $(lightnessSlider).val(l);
        };
        
        /**
         * Sets slider background gradients
         */
        var setSliderBackgrounds = function()
        {
            var rStyle = 'background: -moz-linear-gradient(left, rgb(0,' + g + ',' + b + ') 0%, rgb(255,' + g + ',' + b + ') 100%);';
            rStyle += 'background: -webkit-linear-gradient(left, rgb(0,' + g + ',' + b + ') 0%, rgb(255,' + g + ',' + b + ') 100%);';
        	rStyle += 'background: linear-gradient(to right, rgb(0,' + g + ',' + b + ') 0%, rgb(255,' + g + ',' + b + ') 100%);';
            
            var gStyle = 'background: -moz-linear-gradient(left, rgb(' + r + ',0,' + b + ') 0%, rgb(' + r + ',255,' + b + ') 100%);';
            gStyle += 'background: -webkit-linear-gradient(left, rgb(' + r + ',0,' + b + ') 0%, rgb(' + r + ',255,' + b + ') 100%);';
        	gStyle += 'background: linear-gradient(to right, rgb(' + r + ',0,' + b + ') 0%, rgb(' + r + ',255,' + b + ') 100%);'
            
            var bStyle = 'background: -moz-linear-gradient(left, rgb(' + r + ',' + g + ',0) 0%, rgb(' + r + ',' + g + ',255) 100%);';
            bStyle += 'background: -webkit-linear-gradient(left, rgb(' + r + ',' + g + ',0) 0%, rgb(' + r + ',' + g + ',255) 100%);';
        	bStyle += 'background: linear-gradient(to right, rgb(' + r + ',' + g + ',0) 0%, rgb(' + r + ',' + g + ',255) 100%);';
            
            var lStyle = 'background: -moz-linear-gradient(left, #000 0%, hsl(' + h + ',' + s + '%,50%) 50%, #fff 100%);';
            lStyle += 'background: -webkit-linear-gradient(left, #000 0%, hsl(' + h + ',' + s + '%,50%) 50%, #fff 100%);';
        	lStyle += 'background: linear-gradient(to right, #000 0%, hsl(' + h + ',' + s + '%,50%) 50%, #fff 100%);';
            
            var sStyle = 'background: -moz-linear-gradient(left, hsl(' + h + ',0%,' + l+ '%) 0%, hsl(' + h + ',100%,' + l+ '%) 100%);';
            sStyle += 'background: -webkit-linear-gradient(left, hsl(' + h + ',0%,' + l+ '%) 0%, hsl(' + h + ',100%,' + l+ '%) 100%);';
        	sStyle += 'background: linear-gradient(to right, hsl(' + h + ',0%,' + l+ '%) 0%, hsl(' + h + ',100%,' + l+ '%) 100%);';
            
            $(redSliderBg).attr('style', rStyle);
            $(greenSliderBg).attr('style', gStyle);
            $(blueSliderBg).attr('style', bStyle);
            $(lightnessSliderBg).attr('style', lStyle);
            $(saturationSliderBg).attr('style', sStyle);
            
            /*$(redSliderBg).css('background', 'linear-gradient(to right, rgb(0,' + g + ',' + b + ') 0%, rgb(255,' + g + ',' + b + ') 100%)');
            $(greenSliderBg).css('background', 'linear-gradient(to right, rgb(' + r + ',0,' + b + ') 0%, rgb(' + r + ',255,' + b + ') 100%)');
            $(blueSliderBg).css('background', 'linear-gradient(to right, rgb(' + r + ',' + g + ',0) 0%, rgb(' + r + ',' + g + ',255) 100%)');
            $(lightnessSliderBg).css('background', 'linear-gradient(to right, #000 0%, hsl(' + h + ',' + s + '%,50%) 50%, #fff 100%)');
            $(saturationSliderBg).css('background', 'linear-gradient(to right, hsl(' + h + ',0%,' + l+ '%) 0%, hsl(' + h + ',100%,' + l+ '%) 100%)');*/
        };
        
        /**
         * Pick HSV color from mouse position on the picker
         */
        var pickColor =function(e, el)
        {
            var pos = getPos(el);
            var x = e.pageX - pos[0];
            var y = e.pageY - pos[1];
            
            $(colorPickerIndicator).css("left", Math.ceil(x-$(colorPickerIndicator).outerWidth()/2));
            $(colorPickerIndicator).css("top", Math.ceil(y-$(colorPickerIndicator).outerHeight()/2));
            
            s = x / ($(colorPickerWrapper).width() / 100);
            v = 100 - (y / ($(colorPickerWrapper).height() / 100));
            
            var hsl = hsv2hsl(h,(s/100),(v/100));
            s = Math.round(hsl[1]*100);
            l = Math.round(hsl[2]*100);
            
            $(saturationSlider).val(s);
            $(lightnessSlider).val(l);
            
            setHSL();
        };
        
        var setIndicator = function()
        {
            var hsv = hsl2hsv(h,(s/100),(l/100));
            s = Math.round(hsv[1]*100);
            v = Math.round(hsv[2]*100);
            
            var hMultiplier = ($(colorPickerWrapper).width() / 100);
            var vMultiplier = ($(colorPickerWrapper).height() / 100);
            
            var x = Math.ceil((s*hMultiplier) - ($(colorPickerIndicator).outerWidth()/2));
            var y = Math.ceil(($(colorPickerWrapper).height()-v*vMultiplier) - ($(colorPickerIndicator).outerHeight()/2));
            
            $(colorPickerIndicator).css("left", x);
            $(colorPickerIndicator).css("top", y);
        };
        
        var showHide = function()
        {
            // Center modal Colorpickle before opening
            if (plugin.settings.modal == true)
            {
                if (! $("#"+instanceId).is(":visible")) 
                {
                    center();
                } 
                
                $("#" + instanceId+"overlay").fadeToggle();
            }
            
            $("#"+instanceId).fadeToggle();
        };
        
        /**
         * Centers the Colorpickle in the browser window.
         * 
         * @return  void
         */
        var center = function()
        {
            var x = ($(window).width() / 2) - ($("#"+instanceId).width() / 2);
            var y = ($(window).height() / 2) - ($("#"+instanceId).height() / 2) + $(window).scrollTop();
            
            $("#"+instanceId).css("position", "absolute");
            $("#"+instanceId).css("top", y+"px");
            $("#"+instanceId).css("left", x+"px");
        };
        
        // Call init!
        plugin.init();
    };
 
    // Add the plugin to the jQuery.fn object
    $.fn.colorpickle = function(options) {
        
        var args = arguments;
        
        // Iterate through the DOM elements we are attaching the plugin to
        return this.each(function() {
            
            var instance = $(this).data('colorpickle');
            
            // If the plugin has not already been attached to the element
            if (instance == undefined)
            {
                // Create a new instance of the plugin
                // Pass the DOM element and the user-provided options as arguments
                var plugin = new $.colorpickle(this, options);
                
                /* 
                 * Store a reference to the plugin object in the jQuery version of the element.
                 * You can later access the plugin and its methods and properties like
                 * element.data('colorpickle').publicMethod(arg1, arg2, ... argn) or
                 * element.data('colorpickle').settings.propertyName
                */
                $(this).data('colorpickle', plugin);
            }
            else
            {
                // Plugin already attached, check if the parameter is a method...
                if ($.isFunction(instance[options]))
                {
                    // Call the method
                    instance[options].apply( instance, Array.prototype.slice.call( args, 1 ) );
                    //return instance[options].apply( instance, Array.prototype.slice.call( args, 1 ) );
                }
            }
        });
    }
}(jQuery, window, document));
