/*
 *
 * Javascript file for ProcessWire Module Jquery File Upload.
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Modified by Francis Otieno (Kongondo) January 2016 for the ProcessWire plugin/module JqueryFileUpload
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

function JqueryFileUpload($, $anywhereJfuFileUpload = {}) {

    /*************************************************************/
	// SCRIPT GLOBAL VARIABLES

	/*	@note:
		- global variables NOT prefixed with '$'.
		- function parameters and variables PREFIXED with '$'
	*/

	var deletable, deleteButton, dropZone, filesContainer, fileUpload, anywhereFileUpload, jfuAnywhereFileUploadsWidget,jfuAnywhereFileUploadsWidgetInfoList, options, showGallery, showUploaded, url;

    // set values to some variables
	jsJqueryFileUploadConfigs = jqueryFileUploadConfigs();

	// prepare options
    if (jsJqueryFileUploadConfigs) {
        options = {};
        $.each(jsJqueryFileUploadConfigs, function($k, $v){
            if($k == 'acceptFileTypes') {
                var $flags = 'i';
				// @todo: $ and i don't seem to work? otherwise its fine
				var $regex = new RegExp("(\.|\/)(" + $v + ")$", $flags);
                $v = $regex;
            }
            options[$k] = $v;
        });
	}

	/*** check if in AnywhereUpload mode ***/
	// set up properties needed for anywhere upload
	anywhereFileUpload = false;// @todo: set also server-side? Not really an issue since we go through same security checks server-side
	// if $anywhereJfuFileUpload object is NOT empty, we are IN anywhereFileUpload mode
	if (!jQuery.isEmptyObject($anywhereJfuFileUpload)) {

		anywhereFileUpload = true;
		// files container
		if ($anywhereJfuFileUpload.hasOwnProperty('filesContainer')) options.filesContainer = $anywhereJfuFileUpload.filesContainer;
		// target element
		if ($anywhereJfuFileUpload.hasOwnProperty('targetElement')) options.targetElement = $anywhereJfuFileUpload.targetElement;
		// drop zone
		if ($anywhereJfuFileUpload.hasOwnProperty('dropZone')) options.dropZone = $anywhereJfuFileUpload.dropZone;
		// auto upload
		if ($anywhereJfuFileUpload.hasOwnProperty('autoUpload')) options.autoUpload = $anywhereJfuFileUpload.autoUpload;
		// any extra formData @note: we don't want to overwrite existing form data! so we append
		if ($anywhereJfuFileUpload.hasOwnProperty('formData')) {
			$.each($anywhereJfuFileUpload.formData, function($k, $v){
				options.formData[$k] = $v;
			});
		}

		// data type just in case auto upload = true
		options.dataType = 'json';
	}

	/*** set values to some global variables ***/

	// show individual files delete buttons?
	deletable = $('table.files_list').attr('data-deletable');
	if (deletable == 1) deleteButton = renderFileDeleteIcon().html();
	else deleteButton = '';
    // show image gallery?
	showGallery = $('table.files_list').attr('data-show-gallery');
    showUploaded = options.showUploaded;
    url = options.url;

	filesContainer = $(options.filesContainer);
	dropZone = $(options.dropZone);
	fileUpload = $(options.targetElement);
	jfuAnywhereFileUploadsWidget = fileUpload.siblings('div.jfu_upload_anywhere_widget');

    'use strict';// @todo ?


    /*************************************************************/
	// FUNCTIONS

    /**
	 * Get the configs for the module Jquery File Upload.
	 *
	 * @return Object|false jfuConfigs Return configurations if found, else false.
	 *
	*/
	function jqueryFileUploadConfigs(){
		var jfuConfigs = config.JqueryFileUpload;
		if (!jQuery.isEmptyObject(jfuConfigs)) return jfuConfigs;
		else return false;
	}

	/**
	 * Formats filesize into human readable strings
	 *
	 * @param string/integer e The filesize returned by JFU.
	 *
	 */
	function formatFileSize (e) {
		return "number" != typeof e ? "" : e >= 1e9 ? (e / 1e9).toFixed(2) + " GB" : e >= 1e6 ? (e / 1e6).toFixed(2) + " MB" : (e / 1e3).toFixed(2) + " KB"
	}

    /**
	 * Initialiase Blueimp Jquery File Upload widget.
	 *
	 */
	function initJqueryFileUpload() {

		jfuFetchUploads();
		jfuDropZone();
		// enable shift+click of a range of checkboxes
		$table = $("table#jfu-files-list");
		jfuShiftClickSelectCheckboxes($table);
		jfuDeleteUploads();
		jfuToggleSelectAllUploads();

		// initialise widget, passing it options
		fileUpload.fileupload(options);
        // add additional harcoded options
        fileUpload.fileupload({
            // @todo: do this check?
            /*disableImageResize: /Android(?!.*Chrome)|Opera/
                        .test(window.navigator.userAgent)
            */
            uploadTemplate: function ($o) {
				var $rows = uploadTemplate($o);
				return $rows;
			},
		// @note: we are not using downloadTemplate property! but implementing this instead
		}).bind('fileuploaddone', function (e, data) {
			if (data.result && $.isArray(data.result.files)) {
					var files = {};
					files['files'] = data.result.files;
					files['formatFileSize'] = formatFileSize
					var $rows = downloadTemplate(files);
					$('tbody#files').append($rows);
				}
			});// end additional options

	}

	/**
	 * Build uploads template.
	 *
	 * This builds table rows.
	 *
	 * @param object $o File list to upload.
	 * @return jquery Object $rows Populated rows for each file to be uploaded.
	 *
	 */
	function uploadTemplate($o) {

		var $rows = $();
		$.each($o.files, function (index, file) {

			var $row = $('<tr class="template-upload fade">' +
			'<td class="jfu_file_preview"><span class="preview"></span></td>' +
			'<td><p class="name"></p>' +
				'<strong class="error text-danger"></strong>' +
			'</td>' +
			'<td><p class="size"></p>' +
			'<div class="progress progress-striped active" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">' +
			'<div class="progress-bar progress-bar-success" style="width:0%;"></div></div>' +
			'</td>' +
			'<td>' +
			(!index && !$o.options.autoUpload ?
				renderFileUploadStartIcon().html() : '') +
			(!index ? renderFileUploadCancelIcon().html() : '') +
			'</td>' +
			'</tr>');

			// file not allowed
			// @note: @todo? this does not work since it takes some ms for the property to be set. Hence, a settimeout=50 or less works, but by then it is still too late. However, JFU populates the error markup fine.
			/*if (file.error) {
				$row.find('.error').text(file.error);
			}*/
			setTimeout(function () {
				var $error = file.error;
				if ($error) {
					$row.find('span.jfu_start').remove()
				}
			}, 5);

			$row.find('.name').text(file.name);
			$row.find('.size').text($o.formatFileSize(file.size));

			$rows = $rows.add($row);
			return $rows;

		});

		return $rows;
	}

	/**
	 * Build downloads template.
	 *
	 * This builds table rows.
	 *
	 * @param object $o List of uploaded files.
	 * @return jquery Object $rows Populated rows for each uploaed file.
	 *
	 */
	function downloadTemplate($o, $list=true) {

		var $rows = $();
		if(!$list)	return $rows;
		var $preview = false;
		$.each($o.files, function (index, file) {
			var $row = $('<tr class="template-download fade">' +
				'<td class="jfu_file_preview"><span class="preview"></span></td>' +
				'<td class="jfu_file_name"><p class="name"></p>' +
				(file.error ? '<div class="error"></div>' : '') +
				'</td>' +
				'<td class="jfu_file_size"><span class="size"></span></td>' +
				'<td  class="jfu_file_delete" data-file="'+ file.name +'">' +
					deleteButton
					 +
				'</td></tr>');
			$row.find('.size').text($o.formatFileSize(file.size));
			if (file.error) {
				$row.find('.name').text(file.name);
				$row.find('.error').text(file.error);
			} else {
				$row.find('.name').append($('<a></a>').text(file.name));
				if (file.thumbnailUrl) {
					$row.find('.preview').append(
						$('<a></a>').append(
							$('<img uk-img>').prop('src', file.thumbnailUrl).addClass('uk-preserve-width')
						).addClass('jfu_preview_thumb')
					);
				}

				// checking if to make gallery available to images
				var a = $row.find('a.jfu_preview_thumb');
				a.prop('href', file.url);
				if (file.thumbnailUrl && showGallery == 1) (a).attr('data-gallery', '');

				// @todo: are we using this? or does JFU?
				$row.find('.delete')
					.attr('data-type', file.deleteType)
					.attr('data-url', file.deleteUrl);
			}
			$rows = $rows.add($row);
		});

		return $rows;

	}

	/**
	 * Render the start uploads icon/button.
	 *
	 */
	function renderFileUploadStartIcon() {
		var $icon = $('div#jfu_markup_templates').find('div.jfu_uploads_start').clone();
		return $icon;
	}

	/**
	 * Render the cancel uploads icon/button.
	 *
	 */
	function renderFileUploadCancelIcon() {
		var $icon = $('div#jfu_markup_templates').find('div.jfu_uploads_cancel').clone();
		return $icon;
	}

	/**
	 * Render the delete uploads icon/button.
	 */
	function renderFileDeleteIcon() {
		var $icon = $('div#jfu_markup_templates').find('div.jfu_uploads_delete').clone();
		//$icon.find('input.uploaded_file').removeClass('jfu_hide');
		return $icon;
	}

    /**
	 * Fetch uploads for listing.
	 *
	 */
	function jfuFetchUploads() {

        if(showUploaded === 1) {
			// Send request to load existing files if showUploaded is not disabled (1: show; 0: don't show)
			fileUpload.addClass('fileupload-processing');
			$.ajax({
				// Uncomment the following to send cross-domain cookies:
				// xhrFields: {withCredentials: true},
				url: url,
				dataType: 'json',
				context: fileUpload[0],
				data:{'jfu_list': 'list'},
				type: 'post',
			}).always(function () {
					$(this).removeClass('fileupload-processing');
				}).done(function ($result) {
					if ($result && $.isArray($result.files)) {
						// @note: we are not using downloadTemplate property!
						/*$(this).fileupload('option', 'done')
							.call(this, $.Event('done'), { result: $result });*/
						// we use this instead
						var files = $result;
						files['formatFileSize'] = formatFileSize
						var $rows = downloadTemplate(files);
						$('tbody#files').append($rows);
					}
				});
        }


    }

    /**
	 * Initialise file uploads drop zone.
	 *
	 */
	function jfuDropZone() {

		var counter = 0;
		dropZone.bind({
			dragenter: function(e) {
				e.preventDefault(); // needed for IE
				counter++;
				$(this).addClass('in hover');
			},
			dragleave: function() {
				counter--;
				if (counter === 0) {
					$(this).removeClass('in hover');
				}
			},
			drop: function () {
				$(this).removeClass('in hover');
			}
		});

    }

    /**
	 * Initialise file uploads delete.
	 *
	 */
	function jfuDeleteUploads() {
		$(filesContainer).on('click', '.delete', function(){
			$fileName = $(this).parents('td.jfu_file_delete').attr('data-file');
			// push selected media in array
			var $files = [];
			$files.push($fileName);
			// ajax
			$.ajax({
				url: url,
				type: 'POST',
				data: {'jfu_files':$files, 'jfu_delete':'delete'},
				dataType: 'json',
			}).done(function ($result) {
				// uncheck the select all input in the table of uploaded th
				$('div.jfu_files_container input.toggle_all').prop('checked', false);
			}).fail(function() {  alert('Error'); })
		});
	}

	/**
	 * Initialise file uploads list toggle select/deselect all.
	 *
	 */
	function jfuToggleSelectAllUploads() {
		var $table = $('table#jfu-files-list');
		$table.on('change', 'input.toggle_all', function() {
			if ($(this).prop('checked')) $table.find('input.toggle').prop('checked', true);
			else $table.find('input.toggle').prop('checked', false);
		});
	}

	/**
	 * select multiple checkboxes in a range use SHIFT+Click.
	 *
	 */
	function jfuShiftClickSelectCheckboxes($table) {
		//@awt2542 PR #867 for PROCESSWIRE
		var $lastChecked = null;
		$($table).on('click', 'input[type=checkbox].uploaded_file', function(e) {
			var $checkboxes = $(this).closest($table).find('input[type=checkbox].uploaded_file');
			if(!$lastChecked) {
				$lastChecked = this;
				return;
			}
			if(e.shiftKey) {
				var $start = $checkboxes.index(this);
				var $end = $checkboxes.index($lastChecked);
				$checkboxes.slice(Math.min($start,$end), Math.max($start,$end)+ 1).attr('checked', $lastChecked.checked);
			}
			$lastChecked = this;
		});
	}

	/**
	 * Initialise JFU Upload Anywhere.
	 *
	 */
	function initJqueryFileUploadAnywhere() {
		if (anywhereFileUpload) {
			jfuAnywhere();
			//jfuAnywhereCallbacksDebug();// for debugging
		}
	}

	/**
	 * Start JFU Upload Anywhere.
	 *
	 */
	function jfuAnywhere() {
		// if no options provided, alert and return
		if (jQuery.isEmptyObject(options)) {
			alert('Upload options not specified')// @todo?
			return;
		}

		var $jfuAnywhereUploading = jfuAnywhereFileUploadsWidget.find('span.jfu_upload_anywhere_uploading');
		var $jfuAnywhereUploadComplete = jfuAnywhereFileUploadsWidget.find('span.jfu_upload_anywhere_complete');
		var $jfuAnywhereProcessing = jfuAnywhereFileUploadsWidget.find('span.jfu_upload_anywhere_processing');
		var $jfuAnwherePercent = jfuAnywhereFileUploadsWidget.find('span.jfu_upload_anywhere_percent_counter');
		var $jfuAnwhereCancelAll = jfuAnywhereFileUploadsWidget.find('a.jfu_upload_anywhere_cancel_all');
		jfuAnywhereFileUploadsWidgetInfoList = jfuAnywhereFileUploadsWidget.find('ul.jfu_upload_anywhere_widget_info_list');

		fileUpload.fileupload(options);

		fileUpload.fileupload({
			add: function (e, $data) {
				// init uploads widget
				jfuAnywhereShowUploadsWidget($data);

				/* @see:
				- solution for client-side image resizing not working in basic plugin:
				https://stackoverflow.com/questions/21675593/cant-get-image-resizing-to-work-with-jquery-file-upload
				*/
				$.blueimp.fileupload.prototype.options.add.call(this, e, $data);

				// cancel uploads
				jfuAnywhereCancelUpload($data);
				// update files upload's list
				// @note: we need a slight delay for any error properties to be set (otherwise, we miss them! and get, e.g. file.error=undefined)
				setTimeout(function() {
					jfuAnywhereUpdateUploadsWidget($data);
				}, 50);
				// start upload
				//$data.submit();// @note: only if not using auto-upload
			},
			// track upload progress
			progressall: function (e, $data) {
				// display overall progress in jfu anywhere widget
				var $percent = parseInt($data.loaded / $data.total * 100, 10);
				$jfuAnwherePercent.text($percent + '%');
				if ($percent == 100) {
					$jfuAnwherePercent.fadeOut('fast');
					$jfuAnywhereUploading.fadeOut('fast');
					$jfuAnwhereCancelAll.fadeOut('fast');
					$jfuAnywhereUploadComplete.fadeIn('fast').delay(1000).fadeOut('fast', function(){
						$jfuAnywhereProcessing.fadeIn('fast');
					});
				}
			},
			done: function (e, $data) {
				if ($data.textStatus == 'success') {
					jfuAnywhereUpdateUploadsWidget($data, 2);
					// @todo: do we need this now?
					jfuAnywhereShowUploadsWidget($data, 2);
				}

			},
			/*stop: function (e) {
			}*/
		});

	}

	/**
	 * Update and show the JFU Upload Anywhere widget.
	 *
	 * @param object $data Files add or Ajax data to update the widget with.
	 * @param integer $mode Determines if widget called during files add (1) or after ajax done (2).
	 *
	 */
	function jfuAnywhereShowUploadsWidget($data, $mode = 1) {
		var $uploadsCount;
		if (1 == $mode) {
			$uploadsCount = parseInt(jfuAnywhereFileUploadsWidgetInfoList.attr('data-uploads-count'));
			$uploadsCount = $uploadsCount + $data.files.length;
		}

		else $uploadsCount = 0;

		jfuAnywhereFileUploadsWidgetInfoList.attr('data-uploads-count', $uploadsCount);
		jfuAnywhereFileUploadsWidget.find('span.jfu_upload_anywhere_count').text($uploadsCount);
		jfuAnywhereFileUploadsWidget.css({ visibility: "visible", opacity: "1" });
	}

	/**
	 * Update items in the JFU Upload Anywhere widget.
	 *
	 * @param object $data The files add or Ajax done data.
	 * * @param integer $mode Determines if we are in the add files phase (1) vs Ajax done phase (2).
	 *
	 */
	function jfuAnywhereUpdateUploadsWidget($data, $mode = 1) {

		var $obj = 1 == $mode ? $data.files : $data.result.files;

		if (!$obj) return;

		$.each($obj, function ($index, $file) {
			var uploadID = 'file' + $index;
			$file.uploadID = uploadID;

			// append (upload added)
			if (1 == $mode) {
				// #1. SETTING CUSTOM ID TO UPDATE MARKUP ON PROGRESS
				var $list;
				// if file not accepted for upload
				if ($file.hasOwnProperty('error')) {
					// add class and markup to target with CSS
					var $errorMsg = '<span>'+ options.messages.acceptFileTypes +'</span>';
					$list = '<li id="' + uploadID + '" class="jfu_upload_anywhere_file_type_not_allowed">' + $file.name + $errorMsg +'</li>';
				}

				else $list = '<li id="' + uploadID + '">' + $file.name + '</li>';

				$($list).appendTo(jfuAnywhereFileUploadsWidgetInfoList);
			}
			// update as done (upload done)
			else if (2 == $mode) {
				// failed uploads
				var $list = $('li#' + uploadID);
				if ($file.hasOwnProperty('error')) {
					//$list.addClass('NoticeError uk-alert-danger');
					// add class to target with CSS
					$list.addClass('jfu_upload_anywhere_fail');
				}
				// success uploads
				else {
					//$list.addClass('NoticeMessage uk-alert-primary mm_upload_anywhere_success');
				}
			}

		});


	}

	/**
	 * Cancel all uploads in progress in a JFU Upload Anywhere widget.
	 *
	 * @param object $data The data sent from the widget.
	 *
	 */
	function jfuAnywhereCancelUpload($data) {
		$('a.jfu_upload_anywhere_cancel_all').click(function (e) {
			e.preventDefault();
			if ($data) {
				$data.abort();
				jfuAnywhereFileUploadsWidget.find('ul.jfu_upload_anywhere_widget_info_list').children().fadeOut(500).remove()
				jfuAnywhereFileUploadsWidget.css({ visibility: "hidden", opacity: "0" });
			}
			return false;
		});
	}

	/**
	 * For debugging/testing JFU callbacks.
	 *
	 */
	function jfuCallbacksDebug() {

		var $uploadDone = $('.jfu_uploads_done');
		var $uploadDelete = $('.jfu_uploads_delete');
		var $uploadSingleProgress = $('.jfu_progress_single_circle');
		var previews = {};

		fileUpload
			.bind('fileuploadadd', function (e, data) {
			})
			.bind('fileuploadsubmit', function (e, data) {})
			.bind('fileuploadsend', function (e, data) {})
			.bind('fileuploaddone', function (e, data) {})
			.bind('fileuploadfail', function (e, data) {})
			.bind('fileuploadalways', function (e, data) {})
			.bind('fileuploadprogress', function (e, data) {})
			.bind('fileuploadprogressall', function (e, data) {

			})
			.bind('fileuploadstart', function (e) {})
			.bind('fileuploadstop', function (e) {})
			.bind('fileuploadchange', function (e, data) {})
			.bind('fileuploadpaste', function (e, data) {})
			.bind('fileuploaddrop', function (e, data) {})
			.bind('fileuploaddragover', function (e) {})
			.bind('fileuploadchunksend', function (e, data) {})
			.bind('fileuploadchunkdone', function (e, data) {})
			.bind('fileuploadchunkfail', function (e, data) {})
			.bind('fileuploadchunkalways', function (e, data) { });

			// Processing Callback Options
			fileUpload
			.bind('fileuploadprocessstart', function (e) {})
			.bind('fileuploadprocess', function (e, data) {})
			.bind('fileuploadprocessdone', function (e, data) {})
			.bind('fileuploadprocessfail', function (e, data) {})
			.bind('fileuploadprocessalways', function (e, data) {})
			.bind('fileuploadprocessstop', function (e) {});

	}

	/**
	 * For debugging/testing JFU Upload Anywhere callbacks.
	 *
	 */
	function jfuAnywhereCallbacksDebug() {

		fileUpload
			.bind('fileuploadadd', function (e, data) {
			})
			.bind('fileuploadsubmit', function (e, data) {})
			.bind('fileuploadsend', function (e, data) {})
			.bind('fileuploaddone', function (e, data) {
			})
			.bind('fileuploadfail', function (e, data) {})
			.bind('fileuploadalways', function (e, data) {})
			.bind('fileuploadprogress', function (e, data) {})
			.bind('fileuploadprogressall', function (e, data) {})
			.bind('fileuploadstart', function (e) {})
			.bind('fileuploadstop', function (e) {
			})
			.bind('fileuploadchange', function (e, data) {})
			.bind('fileuploadpaste', function (e, data) {})
			.bind('fileuploaddrop', function (e, data) {})
			.bind('fileuploaddragover', function (e) {})
			.bind('fileuploadchunksend', function (e, data) {})
			.bind('fileuploadchunkdone', function (e, data) {})
			.bind('fileuploadchunkfail', function (e, data) {})
			.bind('fileuploadchunkalways', function (e, data) { });

			// Processing Callback Options
			fileUpload
			.bind('fileuploadprocessstart', function (e) {})
			.bind('fileuploadprocess', function (e, data) {
			})
			.bind('fileuploadprocessdone', function (e, data) {})
			.bind('fileuploadprocessfail', function (e, data) {})
			.bind('fileuploadprocessalways', function (e, data) {})
			.bind('fileuploadprocessstop', function (e) {});

	}

	/**
     * Intitialise this script.
     *
     * @note: some code originally from InputfieldImage.js.
     *
     */
	function init() {
		//jfuCallbacksDebug();// for debugging
		// if anywhere file upload
		if (anywhereFileUpload) initJqueryFileUploadAnywhere();
		else initJqueryFileUpload();
    }

    // initialise script
    init();

}// END JqueryFileUpload()


/*************************************************************/
// READY

jQuery(document).ready(function($) {
	JqueryFileUpload($);
});
