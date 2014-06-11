(function($, Symphony) {
	'use strict';

	Symphony.Language.add({
		'Remove': false,
		'Search and select': false
	});

	Symphony.Extensions.AssociationUISelector = function() {
		var fields;

		var init = function() {
			fields = Symphony.Elements.contents.find('.field[data-interface^="aui-selector"]');
			fields.each(buildInterface);
		};

		var buildInterface = function() {
			var field = $(this),
				storage = field.find('select:visible, input:visible').first(),
				multiple = true,
				numeric = false,
				selectize;

			// Check for storage element
			if(!storage.length) {
				return false;
			}

			// Get select context
			if(storage.is('select')) {
				multiple = storage.is('[multiple="multiple"]');
				numeric = $.isNumeric(storage.find('option[value!=""]:first').val());
			}

			// Toggle single or multiple interface
			if(multiple) {
				field.addClass('multiple');
			}
			else {
				field.addClass('single');
			}

			// Apply Selectize
			storage.selectize({
				sortField: [{
					field: 'text', 
					direction: 'asc'
				}],
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
					},
					option: function(data, escape) {
						return '<div class="option"><span>' + escape(data.text) + '</span></div>';
					}
				},
				load: function(query, callback) {
					if(!query.length) return callback();
					$.ajax({
						url: Symphony.Context.get('root') + '/symphony/extension/association_ui_selector/get/',
						data: {
							field_id: field.data('parent-section-field-id'),
							query: encodeURIComponent(query)
						},
						type: 'GET',
						error: function() {
							callback();
						},
						success: function(result) {
							var entries = [];

							$.each(result.entries, function(id, value) {
								entries.push({
									value: (numeric === true ? id : value),
									text: value
								});
							});

							callback(entries);
						}
					});
				}
			});

			// Set placeholder text
			selectize = storage[0].selectize;
			selectize.$control_input.attr('placeholder', 'Search and select' + ' …');

			// Make sortable
			if(field.is('[data-ui="aui-selector-sortable"]')) {
				selectize.$control.symphonyOrderable({
					items: '.item',
					handles: 'span',
					ignore: 'input, textarea, select, a',
					delay: 250
				}).on('orderstart.orderable', function() {
					selectize.close();
				}).on('orderstop.orderable', function() {
					selectize.blur();
				});
			}
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
