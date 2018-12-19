/*
 * blueimp Gallery application/pdf Factory JS
 * https://github.com/blueimp/Gallery
 *
 * Extending the Gallery prototype with a new factory method
 * to display application/pdf content types
 * Based on work by Sebastrian Tschan
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 *
 * @modified by Francis Otieno (Kongondo) for ProcessWire 3
 */

/* global define, window, document */

;(function (factory) {
    'use strict'
    if (typeof define === 'function' && define.amd) {
      // Register as an anonymous AMD module:
      define(['./blueimp-helper', './blueimp-gallery'], factory)
    } else {
      // Browser globals:
      factory(window.blueimp.helper || window.jQuery, window.blueimp.Gallery)
    }
  })(function ($, Gallery) {
    'use strict'

    blueimp.Gallery.prototype.applicationFactory = function (obj, callback) {

        // create a wrapper div for our object
        var $element = $('<div>')
            .addClass('pdf-content')
            .attr('title', obj.title);
        var $htmlObject = $('<object>').attr({
            'type': 'application/pdf',
            'width': '100%',
            'height': '100%'
        });
        $.get(obj.href)
            .done(function (result) {
                $htmlObject.attr('data', obj.href)
                $htmlObject.html(result);
                $element.append($htmlObject);
                callback({
                    type: 'load',
                    target: $element[0]
                });
            })
            .fail(function () {
                callback({
                    type: 'error',
                    target: $element[0]
                });
            });
        return $element[0];
    };
  })