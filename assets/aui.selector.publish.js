(function($, Symphony) {
	'use strict';

	Symphony.Language.add({
		'Remove': false,
		'Search and select': false
	});

	Symphony.Extensions.AssociationUISelector = function() {
		var fields;

		var init = function() {
			fields = Symphony.Elements.contents.find('.field-selectbox_link').attr('data-ui', 'aui-selector');
			fields.each(buildInterface);
		};

		var buildInterface = function() {
			var select = $(this).find('select');

			// Apply Selectize
			select.selectize({
				plugins: {
					'remove_button': {
						label : Symphony.Language.get('Remove'),
						title : Symphony.Language.get('Remove'),
						className : 'destructor'
					}
				}			
			});

			// Set placeholder text
			select[0].selectize.$control_input.attr('placeholder', 'Search and select' + ' …');
		};

		// API
		return {
			init: init
		};
	}();

	$(document).on('ready.orderentries', function() {
		Symphony.Extensions.AssociationUISelector.init();
	});

})(window.jQuery, window.Symphony);
