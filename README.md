# JqueryFileUpload

This module is a ProcessWire implementation of the awesome [Blueimp jQuery File Upload](https://blueimp.github.io/jQuery-File-Upload/) plugin.  Server-side, the module provides a custom uploads handler enabling you to perform various tasks with ease. The module is an interface of the feature-rich Ajax File Uploads widget provided by the jQuery File Upload plugin.


The module is completely customisable and can be used both in the front- and backend (e.g. in third-party module).

## Security

The module has been written with security in mind and makes no assumptions about any client-side validation. Instead, the module provides robust server-side validation of uploaded files. Server-side, no Ajax requests are honoured unless specifically set via configurable options server-side. This means that client-side requests to upload, delete and list files are not executed unless allowed server-side. By default, files are uploaded to a non-web-accessible (system) folder and files previously uploaded on the server are not sent back for display unless that setting is enabled. However, developers are still strongly advised to implement any other feasible measures to guard against malicious uploads, especially if allowing frontend uploading. For instance, developers can use native ProcessWire checks to limit access to the widget (e.g. only allowing uploads by registered/logged-in users).

## Demo

A short demo can be found [here](https://youtu.be/iwUH1JPa5og).

## Features

*	Fast Ajax uploads.
* 	Client and server-side validation.
*	Client-side image resizing (highly configurable [options](https://github.com/blueimp/jQuery-File-Upload/wiki/Options#image-preview--resize-options)).
*	Beautiful touch-responsive image gallery preview.
*	Audio and video previews pre-upload.
*	[Chunked](https://github.com/blueimp/jQuery-File-Upload/wiki/Chunked-file-uploads) and resumable file uploads (currently client-side only; see [notes](https://github.com/kongondo/JqueryFileUpload#notes) section).
*	Drag and drop support.
*	Copy and paste support (Google Chrome only).
*	Progress bars.
* 	[Cross-domain](https://github.com/blueimp/jQuery-File-Upload/wiki/Cross-domain-uploads) uploads.
* 	Single or multiple uploads.
*	Delete uploaded files.

## Options

JqueryFileUpload implements all the [options](https://github.com/blueimp/jQuery-File-Upload/wiki/Options) that come with the jQuery File Upload plugin. In addition, it includes the following custom server-side options:

*	**showUploaded**: Whether to show uploaded files (default is false).
*	**uploadsDeletable**: Whether clients can delete uploads (default is false).
*	**disableUploads**: If set to true, the widget becomes a file lister only. Default is false.
*	**responseType**: If set to 1, module returns a JSON response to valid Ajax requests. If 2, it returns an Array. This can be useful if further processing is needed, e.g. in a module, before outputting final JSON. Default is to return a JSON response.
*	**privateUploadsDir**: The non-web-accessible folder to save uploads to. If *showUploaded* is set to false, this (system) directory is used for saving uploads.
*	**thumbsPrivateDir**: Set a non-web-accessible folder for thumbnails.
*	**uploadsDir**: Set a web-accessible folder to upload images to. Default is under /sites/. Needed if displaying uploaded images.
*	**thumbsDir**: Set a web-accessible folder for thumbnails. Needed if displaying uploaded images.
*	**setMaxFiles**: Maximum number of files per upload. Default is 30.
*	**setOverwrite**: If to overwrite files in case of name-collision. Default is false.
*	**useCustomForm**: Whether to use a custom form + action buttons for uploads + upload actions.
*	**enableDropZone**: Disable drop-zone features of the widget.
*	**showGallery**: Whether to enable the widget to display uploaded images in a (blueimp) gallery.
*	**thumbsWidth**: Set the width for image thumbnails: Default is 100.
*	**thumbsHeight**: Set the height for image thumbnails. Defaults to 75.
*	**createThumb**: Whether to create image thumbnails for uploads. Default is false.
*	**allowedImageMimeTypes**: Array of allowed image mime types: Default is array('image/gif', 'image/jpeg', 'image/png').
*	**imageTypeConstants**: Array of allowed image type constants. Default is array('gif'	=> IMAGETYPE_GIF, 'jpeg' => IMAGETYPE_JPEG, 'jpg' => IMAGETYPE_JPEG, 'png' => IMAGETYPE_PNG).
*	**allowedNonImageMimeTypes**: Array of allowed non-image files mime types. Default is  array('application/pdf', 'audio/mpeg', 'video/mp4').
*	**noGallery**: Don't output the plugin's gallery scripts and CSS. For use in the two scripts and two styles methods listed below. Also see example usage below.
*	**noIframeTransport**: Same as above; not to output [iframe transport](https://github.com/blueimp/jQuery-File-Upload/wiki/Setup#content-type-negotiation) script.
*	**noResize**: Same as above; not to output client-side [image resizing](https://github.com/blueimp/jQuery-File-Upload/wiki/Client-side-Image-Resizing) script.
*	**noAudioPreview**: Same as above; not to output script that enables preview of audio files pre-uploading them.
*	**noVideoPreview**: Same as above; not to output script that enables preview of video files pre-uploading them.
*	**useCustomScript**: Same as above; not to output the module's main Javascript file *JqueryFileUpload.js* to instead use your own.
*	**useCustomStyle**: Same as above; not to output the module's main CSS file *JqueryFileUpload.css* to instead use your own.
*	**unzipFiles**: Whether to decompress zip files after upload. contents will then be listable if listing. The zip file is deleted after decompression. *Please note unzip is only allowed in the backend*.

## How to Install

Install as any other ProcessWire module.

## How to Use

## API

Developers will mainly directly interact with the following methods:

### render($options)

This method renders the markup of the full uploads widget. The method accepts one argument, an array of *$options*. You can by-pass this method and instead use your own custom form. It will take relevant custom options listed above including *uploadsDeletable* (controls output of file widgets delete buttons) as well as some native jQuery File Upload options such as [paramName](https://github.com/blueimp/jQuery-File-Upload/wiki/Options#paramname). Individual bits of the form can also be output separately using various internal methods (for instance *renderAddUploadsButton()*). Have a look at the code for more details. **Note that** in the backend, *render()* does not output form tags. Instead, it expects the developer to wrap its markup within a ProcessWire generated form. The form must be given the ID *fileupload* (unless you will be implementing your own script to talk to the jQuery File Upload plugin; see below).

### processJFUAjax($options)

This is a very important method that controls client-generated Ajax requests to your server. By default, its default array of *$options* are very restrictive. **Think [carefully](https://www.owasp.org/index.php/Unrestricted_File_Upload) before** overriding any of them. For instance, overriding the uploads directory, showing a list of uploaded files or allowing deletion of uploads. It takes one array argument, $options. If you prefer, you can use your own uploads handler instead of using this method.

### configsJFU($options)

We use this method to pass configuration options to jQuery File Upload plugin. It returns a JSON string if called in the frontend and populates ProcessWire's *$config->js()*. If called in the backend. In the frontend, you need to call and output the method before the page is rendered (see example usage below). The method's *$options* argument must be an array. Any of the jQuery File Upload plugin [options](https://github.com/blueimp/jQuery-File-Upload/wiki/Options) can be passed to it as well as the custom options *showUploaded* and *showGallery*.

### renderJFUScripts($options)

This method's output can be echoed in the <head> or just before the closing </body> in your HTML. It outputs the necessary Javascript jQuery File Upload files, i.e. using <script></script> tags. The method is therefore suitable if you are using this module in the frontend. If not needing certain features of jQuery File Upload (e.g. client-side image resizing), pass it relevant options to suppress output of the related script(s). For instance, if you will not need pre-upload video previews, you can tell the script as follows: *renderJFUScripts(array('noVideoPreview'))*.

### configJFUScripts($options)

This method is equivalent to *renderJFUScripts()* except that it uses ProcessWire's *$config->scripts->add()* to add scripts to the DOM. Hence, the method is suited for cases where the module is being used in the backend. It accepts similar options to its sibling method. For instance, *configJFUScripts(array('useCustomScript'))* will allow you to implement your own script to talk to jQuery File Uploads plugin.

### renderJFUStyles($options)

This method's output should be echoed in the <head> in your HTML. It outputs CSS <link></link> tags. It takes one argument, *$options*. To disable outputting the image gallery CSS, pass it the option as follows: *renderJFUStyles(array('noGallery'))*.

### configJFUStyles($options)

This method is equivalent to *renderJFUStyles()* except that it uses ProcessWire's *$config->styles->add()* to add styles to the DOM. Hence, the method is suited for cases where the module is being used in the backend. It accepts the same options as its counterpart method. For example, to use custom CSS to style the file uploads widget, pass an option as follows: *configJFUStyles(array('useCustomStyle'))*.

### Example usage in a template file (frontend)

```php

// call the module
$jfu = $modules->get('JqueryFileUpload');

// if we got an ajax request deal with it before page is rendered
if ($config->ajax) {
	// server-side options to send to the ajax handler
	$ajaxOptions = array(
		'uploadsDeletable' => 1,// disable attempts to delete upload (this is already the default but included here just as an example)
		'showUploaded' => 1,// don't send back response listing uploads
		//'disableUploads' => true// disable uploads @note: matches similar setting in render()
	);

	// action the ajax request
	echo $jfu->processJFUAjax($ajaxOptions);
}

// example options to send to jQuery File Upload plugin.
// The plugin has its own set of defaults. Here we override some of them
$jfuOptions = array(
	'imageMaxWidth' => 1280,// limit image width (will be resized)
	'imageMaxHeight' => 768,// limit image (ditto)
	'prependFiles' => true,// add new uploads to the top of the file listing
	// allow to resize images. Default is true, i.e. to disable.
	// We set this to false if we want IMAGES TO BE RESIZED CLIENT-SIDE BEFORE UPLOAD
	'disableImageResize' => false,
	// custom option for this module: whether to show list of files currently on the server
	'showUploaded' => true,// if false, will stop the widget from sending requests to list uploads already on the server
);

// prepare configuration options to send to the plugin
// outside the ProcessWire Admin the method configsJSU() returns a JSON string
// Otherwise, it populates the $config->js() array
$jfuConfig = $jfu->configsJFU($jfuOptions);

// options to pass to the render() method
$options = array(
	// useful for allowing uploads to one group of users and not the other (e.g. registered versus non-registered)
	// for security, we also pass this option to processJFUAjax($options) to reject any upload attempts
	//'disableUploads' => true,
);

```

```html

<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8">
	<title><?php echo $page->title; ?></title>

	<!-- echo this modules CSS styles. This is optional; you are free to use your own CSS styles -->
	<?php echo $jfu->renderJFUStyles(); ?>

	<!-- Include the usual suspects. We need both for the module to work -->
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js"></script>
	<script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js"></script>

	<!-- Output the plugins Javascript configurations before the page is fully rendered.
		@note: These are the configs we prepared earlier in the PHP block -->
	<script type="text/javascript">var config = <?php echo $jfuConfig; ?>;</script>

	<!-- Output the scripts needed to make the widget work. We could also output these just before we close </body>
		In the first commented out example, we tell the method renderJFUScripts() not to ouput certain scripts
		since we will not be using them, e.g. we will not be showing previews of videos queued for uploading
		In the second active example, we output all the scripts -->
	<?php //echo $jfu->renderJFUScripts(array('noGallery','noIframeTransport', 'noResize','noAudioPreview', 'noVideoPreview')); ?>
	<?php echo $jfu->renderJFUScripts(); ?>

	<!-- This is a custom CSS file for this page -->
	<link rel="stylesheet" type="text/css" href="<?php echo $config->urls->templates?>styles/main.css">

</head>
<body>
<div id="wrapper">
	<h1><?php echo $page->title; ?></h1>
	<?php
		// echo the file widget's markup using the render() method and passing to it any options we set earlier
		echo $jfu->render($options);
		// can also render without $options if happy with the defaults
		#echo $jfu->render();
	?>

	</div>
</body>
```

## Uninstall
Uninstall like any other third-party ProcessWire module.

## Notes

*	Currently, [chunked](https://github.com/blueimp/jQuery-File-Upload/wiki/Chunked-file-uploads) file uploads have not been implemented on the server-side. You would need to use a custom uploads handler for this.

## Support forum
[Support](https://processwire.com/talk/topic/12050-module-jquery-file-upload/)

## Changelog
#### Version 0.0.8
1. Made the method to process zip archives public so that it can be used with other modules/classes.

#### Version 0.0.7
1. Added option to unzip uploaded ZIP archives (works only if used in backend).
2. Refreshed upload widget look and style.

## Changelog
#### Version 0.0.6
1. Added support for SVGs.

#### Version 0.0.5
1. Fixed a typo in the default setting for maxFileSize.

#### Version 0.0.4
1. Fixed minor bug introduced in last version's commit that caused some images not to be displayed in the gallery.

#### Version 0.0.3
1. Fixed an issue that caused duplicates in image gallery.
2. Some minor enhancements.

#### Version 0.0.2
1. Additional CSS added.
2. filesContainer value now configurable.
3. Added a thumbsPrivateDir option.
4. Response type from module can now be either JSON or an Array (for further processing, say, in a module).

#### Version 0.0.1
1. Initial release.


## License
Released under the [MIT license](http://www.opensource.org/licenses/MIT).

## Credits
[Sebastian Tschan](https://blueimp.net).
