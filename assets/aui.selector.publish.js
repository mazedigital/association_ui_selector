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
				fieldId = field.data('parent-section-field-id'),
				storage = field.find('select:visible, input:visible').first(),
				numeric = false,
				limit = parseInt(field.data('limit')),
				fetched = false,
				selectize;

			// Check for storage element
			if(!storage.length) {
				return false;
			}

			// Get select context
			if(storage.is('select')) {
				numeric = (field.data('type') === 'numeric');
			}

			// Apply Selectize
			storage.selectize({
				preload: (limit === 0),
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
						return '<div class="item"><span>' + data.text + '</span></div>';
					},
					option: function(data, escape) {
						return '<div class="option"><span>' + data.text + '</span></div>';
					}
				},
				load: function(query, callback) {
					if((!query.length && limit > 0) || fetched === true) {
						return callback();
					}

					// Fetch entries
					$.ajax({
						url: Symphony.Context.get('root') + '/symphony/extension/association_ui_selector/get/',
						data: {
							field_id: fieldId,
							query: encodeURIComponent(query),
							limit: limit
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

							//
							if(limit === 0) {
								fetched = true;
							}
						}
					});
				}
			});

			// Set placeholder text
			selectize = storage[0].selectize;
			selectize.$control_input.attr('placeholder', 'Search and select' + ' …');

			// Make sortable
			if(field.is('[data-interface="aui-selector-sortable"]')) {
				selectize.$control.symphonyOrderable({
					items: '.item',
					handles: 'span',
					ignore: 'input, textarea, select, a',
					delay: 250
				}).on('orderstart.orderable', function() {
					selectize.$dropdown.css('opacity', 0);
				}).on('orderstop.orderable', function() {
					setTimeout(function() {
						selectize.blur();
						selectize.$dropdown.css('opacity', 1);
					}, 250);
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
