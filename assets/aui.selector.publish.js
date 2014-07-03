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
					item: renderItem,
					option: renderOption
				},
				load: function(query, callback) {
					if((!query.length && limit > 0) || fetched === true) {
						return callback();
					}

					// Fetch search options
					fetchOptions(fieldId, query, limit, numeric, callback);

					// Only fetch full list of option once
					if(limit === 0) {
						fetched = true;
					}
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
				});
				selectize.$control.on('orderstart.orderable', function() {
					orderStart(selectize);
				});
				selectize.$control.on('orderstop.orderable', function() {
					orderStop(selectize);
				});
			}
		};

		var fetchOptions = function(fieldId, query, limit, numeric, callback) {
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
				}
			});
		};

		var renderItem = function(data, escape) {
			return '<div class="item"><span>' + data.text + '</span></div>';
		};

		var renderOption = function(data, escape) {
			return '<div class="option"><span>' + data.text + '</span></div>';
		};

		var orderStart = function() {

			// Hide dropdown
			selectize.$dropdown.css('opacity', 0);
		};

		var orderStop = function() {
			var values = [];

			// Close and reveal dropdown
			setTimeout(function() {
				selectize.blur();
				selectize.$dropdown.css('opacity', 1);
			}, 250);

			// Store order
			selectize.$control.children('[data-value]').each(function() {
				values.push($(this).attr('data-value'));
			});
			selectize.setValue(values);
		};

		// API
		return {
			init: init
		};
	}();

	$(document).on('ready.aui-selector', function() {
		Symphony.Extensions.AssociationUISelector.init();
	});

})(window.jQuery, window.Symphony);
