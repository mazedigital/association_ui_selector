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
				},
				hideSelected: true,
				render: {
					item: function(data, escape) {
						return '<div class="item"><span>' + escape(data.text) + '</span></div>';
					}
				},
			});

			// Set placeholder text
			select[0].selectize.$control_input.attr('placeholder', 'Search and select' + ' …');

			// Make sortable
			select[0].selectize.$control.symphonyOrderable({
				items: '.item',
				handles: 'span',
				ignore: 'input, textarea, select, a',
				delay: 250
			});
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
