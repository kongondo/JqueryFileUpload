/*
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 * 
 * Modified by Francis Otieno (Kongondo) January 2016 for the ProcessWire plugin/module JqueryFileUpload
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*************************************************************/

$(document).ready(function(){

	/*************************************************************/
	// CONFIGS

    if(!jQuery.isEmptyObject(config.JqueryFileUpload)) {
            jfuConfig = config.JqueryFileUpload;
			options = {};
				$.each(jfuConfig, function(k, v){
                    if(k == 'acceptFileTypes') {
                        flags = 'i';
                        var regex = new RegExp("(\.|\/)(" + v + ")$", flags);// @todo: $ and i don't seem to work? otherwise its fine                                          
                        v = regex;
                    }
					options[k] = v;
				});
	}// end if moduleAjaxConfig not empty

    /*************************************************************/
    // GLOBALS

    // show image gallery?
    showGallery = $('table.files_list').attr('data-show-gallery');// @todo: could move to options.showGallery
    showUploaded = options.showUploaded;
    url = options.url;
    container = options.filesContainer;


    /*************************************************************/

    // show individual files delete buttons?
    var deletable = $('table.files_list').attr('data-deletable');
    var deleteButton = '';
    if(deletable == 1) {
        deleteButton =  '<button class="delete"><span>Delete</span></button>' +
                        '<input type="checkbox" name="delete" value="1" class="toggle">';
    }

    'use strict';// @todo ?

      // Initialize the jQuery File Upload widget:
      $('#fileupload').fileupload(options);
      // additional harcoded options
      $('#fileupload').fileupload({   
        // @todo: do this check?
        /*disableImageResize: /Android(?!.*Chrome)|Opera/
                    .test(window.navigator.userAgent)
        */
        uploadTemplate: function (o) {            
            var rows = $();
            $.each(o.files, function (index, file) {
                var row = $('<tr class="template-upload fade">' +
                    '<td><span class="preview"></span></td>' +
                    '<td><p class="name"></p>' +
                    '<strong class="error text-danger"></strong>' +
                    '</td>' +
                    '<td><p class="size"></p>' +
                    '<div class="progress progress-striped active" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">' +
                    '<div class="progress-bar progress-bar-success" style="width:0%;"></div></div>' +
                    '</td>' +
                    '<td>' +
                    (!index && !o.options.autoUpload ?
                        '<button class="start" disabled></i>' +
                        '<span>Start</span></button>' : '') +
                    (!index ? '<button class="cancel"></i>' +
                        '<span>Cancel</span></button>' : '') +
                    '</td>' +
                    '</tr>');
                row.find('.name').text(file.name);
                row.find('.size').text(o.formatFileSize(file.size));
                if (file.error) {
                    row.find('.error').text(file.error);
                }
                rows = rows.add(row);
            });
            return rows;
        },

        downloadTemplate: function (o) {
            var rows = $();
            $.each(o.files, function (index, file) {
                var row = $('<tr class="template-download fade">' +
                    '<td><span class="preview"></span></td>' +
                    '<td><p class="name"></p>' +
                    (file.error ? '<div class="error"></div>' : '') +
                    '</td>' +
                    '<td><span class="size"></span></td>' +
                    '<td data-file="'+ file.name +'">' + 
                        deleteButton
                         +
                    '</td></tr>');
                row.find('.size').text(o.formatFileSize(file.size));
                if (file.error) {
                    row.find('.name').text(file.name);
                    row.find('.error').text(file.error);
                } else {
                    row.find('.name').append($('<a></a>').text(file.name));
                    if (file.thumbnailUrl) {
                        row.find('.preview').append(
                            $('<a></a>').append(
                                $('<img>').prop('src', file.thumbnailUrl)
                            )
                        );
                    }
                    
                    // checking if to make gallery available to images
                    var a = row.find('a');
                    a.prop('href', file.url);
                    if (file.thumbnailUrl && showGallery == 1) (a).attr('data-gallery', '');

                    row.find('button.delete')
                        .attr('data-type', file.deleteType)
                        .attr('data-url', file.deleteUrl);
                }
                rows = rows.add(row);
            });
            return rows;
        },

    });// end additional options

    /* @todo?
    // Enable iframe cross-domain access via redirect option:
    $('#fileupload').fileupload(
        'option',
        'redirect',
        window.location.href.replace(
            /\/[^\/]*$/,
            '/cors/result.html?%s'
        )
    );
    */
});// end .jQuery

/* fetch uploads*/
$(document).ready(function(){
    if(showUploaded === 1) {
       // Send request to load existing files if showUploaded is not disabled (1: show; 0: don't show)
        $('#fileupload').addClass('fileupload-processing'); 
        $.ajax({
            // Uncomment the following to send cross-domain cookies:
            // xhrFields: {withCredentials: true},
            url: $('#fileupload').fileupload('option', 'url'),
            dataType: 'json',
            context: $('#fileupload')[0],
            data:{'jfu_list': 'list'},
            type: 'post',
            }).always(function () {
                $(this).removeClass('fileupload-processing');
            }).done(function (result) {
                $(this).fileupload('option', 'done')
                .call(this, $.Event('done'), {result: result});

            });
    }// end if

});

/** 
    Drop zone effects 
    https://github.com/blueimp/jQuery-File-Upload/wiki/Drop-zone-effects

*/
$(document).bind('dragover', function (e) {
    var dropZone = $('#dropzone'),
        timeout = window.dropZoneTimeout;
    if (!timeout) dropZone.addClass('in');
    else clearTimeout(timeout);
    var found = false,
        node = e.target;
    do {
        if (node === dropZone[0]) {
            found = true;
            break;
        }
        node = node.parentNode;
    } while (node != null);
    if (found) {
        dropZone.addClass('hover');
    } else {
        dropZone.removeClass('hover');
    }
    window.dropZoneTimeout = setTimeout(function () {
        window.dropZoneTimeout = null;
        dropZone.removeClass('in hover');
    }, 100);
});

/* delete uploads */
$(document).ready(function(){    
    $('tbody' + container).on('click', 'button.delete', function(){
        var url = options.url;
        fileName = $(this).parent().attr('data-file');
        // push selected media in array
        var files = [];                
        files.push(fileName);
        //var token = ($('input#_post_token').serialize());
        // ajax
        $.ajax({                                
            url: url,
            type: 'POST',
            data: {'jfu_files':files, 'jfu_delete':'delete'},
            dataType: 'json',
        }).fail(function() {  alert('Error'); })
    });
});

