(function($, Symphony) {
	'use strict';

	Symphony.Language.add({
		'Remove': false,
		'drag to reorder': false,
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
				onInitialize: function() {
					var items = this.$control.find('.item');

					initExistingItems(items, numeric);
				},
				onItemAdd: function(value, item) {
					if(isNaN(item.attr('data-entry-id'))) {
						initExistingItems(item, numeric);
					}
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
			selectize.$control_input.attr('placeholder', Symphony.Language.get('Search and select') + ' …');

			// Don't auto-focus the input in multiple mode
			if(storage.is('[multiple]')) {
				selectize.$control.off('mousedown');
			}

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

			// Hide dropdown after item removal
			selectize.$control.on('mousedown', '.destructor', function() {
				toggleDropdownVisibility(selectize);
			});
			selectize.$control.on('mouseup', '.destructor', function() {
				toggleDropdownVisibility(selectize, true);
			});
		};

		var initExistingItems = function(items, numeric) {
			if(numeric === true) {
				items.each(updateItemByID);
			}
			else {
				items.each(updateItemByValue);
			}
		};

		var updateItemByID = function() {
			var item = $(this),
				entryId = item.attr('data-entry-id'),
				fieldId;

			if(isNaN(entryId)) {
				entryId = item.data('value');
			}
			else {
				fieldId = item.parents('.field').data('parent-section-field-id');
			}

			$.ajax({
				url: Symphony.Context.get('root') + '/symphony/extension/association_ui_selector/get/',
				data: {
					entry_id: entryId,
					field_id: fieldId
				},
				type: 'GET',
				success: function(result) {
					item.attr('data-entry-id', entryId);
					item.attr('data-section-handle', result.entry.section);
					item.attr('data-link', result.entry.link);

					if(result.entry.value !== '') {
						item.find('span').html(result.entry.value);
					}
				}
			});
		};

		var updateItemByValue = function(index, item) {
			var fieldId, id;

			item = $(item);
			fieldId = item.parents('.field').data('parent-section-field-id');
			id = item.data('value');

			$.ajax({
				url: Symphony.Context.get('root') + '/symphony/extension/association_ui_selector/query/',
				data: {
					field_id: fieldId,
					query: item.data('value'),
					limit: 1
				},
				type: 'GET',
				success: function(result) {
					$.each(result.entries, function(id, data) {
						item.attr('data-entry-id', id);
						item.attr('data-section-handle', data.section);
						item.attr('data-link', data.link);
					});
				}
			});
		};

		var fetchItem = function(entryId, fieldId, numeric, callback) {
			$.ajax({
				url: Symphony.Context.get('root') + '/symphony/extension/association_ui_selector/get/',
				data: {
					entry_id: entryId,
					field_id: fieldId
				},
				type: 'GET',
				success: function(result) {
					callback({
						value: (numeric === true ? entryId : result.entry.value),
						text: result.entry.value,
						section: result.entry.section,
						link: result.entry.link,
						id: entryId
					});
				}
			});
		};

		var fetchOptions = function(fieldId, query, limit, numeric, callback) {
			$.ajax({
				url: Symphony.Context.get('root') + '/symphony/extension/association_ui_selector/query/',
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

					$.each(result.entries, function(id, data) {
						entries.push({
							value: (numeric === true ? id : data.value),
							text: data.value,
							section: data.section,
							link: data.link,
							id: id
						});
					});

					callback(entries);
				}
			});
		};

		var renderItem = function(data, escape) {
			return '<div class="item" data-section-handle="' + data.section + '" data-link="' + data.link + '" data-entry-id="' + data.id + '"><span>' + data.text + '</span></div>';
		};

		var renderOption = function(data, escape) {
			return '<div class="option"><span>' + data.text + '</span></div>';
		};

		var orderStart = function(selectize) {
			toggleDropdownVisibility(selectize);
		};

		var orderStop = function(selectize) {
			var values = [];

			// Close and reveal dropdown
			toggleDropdownVisibility(selectize, true);

			// Store order
			selectize.$control.children('[data-value]').each(function() {
				values.push($(this).attr('data-value'));
			});
			selectize.setValue(values);
		};

		var updateItem = function(id) {
			fields.find('.item[data-entry-id="' + id + '"]').each(updateItemByID);
		};

		var addItem = function(field, id) {
			var fieldId = field.attr('data-parent-section-field-id'),
				numeric = (field.attr('data-type') === 'numeric'),
				storage = field.find('.selectized'),
				selectize = storage[0].selectize;

			fetchItem(id, fieldId, numeric, function(data) {
				selectize.settings.create = true;
				selectize.addOption(data);
				selectize.addItem(data.value);
				selectize.settings.create = false;
			});
		};

		var toggleDropdownVisibility = function(selectize, show) {
			if(show === true) {
				setTimeout(function() {
					selectize.blur();
					selectize.$dropdown.css('opacity', 1);
				}, 250);			}
			else {
				selectize.$dropdown.css('opacity', 0);
			}
		};

		var layoutIndex = function(table) {
			var items = table.find('[data-interface^="aui-selector"] li:first-child');

			items.each(function() {
				var item = $(this),
					height = item.innerHeight();

				item.parent().css('max-height', height);
			});
		};

		// API
		return {
			init: init,
			update: updateItem,
			add: addItem,
			layoutIndex: layoutIndex
		};
	}();

	$(document).on('ready.aui-selector', function() {
		var table = $('#contents > form > table');

		// Index
		if (table.length) {
			Symphony.Extensions.AssociationUISelector.layoutIndex(table);
		}

		// Entry
		else {
			Symphony.Extensions.AssociationUISelector.init();
		}
		
    // indicate dragability
    $('.field[data-interface="aui-selector-sortable"]').find('label select').before('<span> – ' + Symphony.Language.get('drag to reorder') + '</span>');
		
	});

})(window.jQuery, window.Symphony);
