/**
 * @package assets
 */

(function($, Symphony) {

	/**
	 * Create orderable elements.
	 *
	 * @name $.symphonyDraggable
	 * @class
	 *
	 * @param {Object} options An object specifying containing the attributes specified below
	 * @param {String} [options.items='li'] Selector to find items to be orderable
	 * @param {String} [options.handles='*'] Selector to find children that can be grabbed to re-order
	 * @param {String} [options.ignore='input, textarea, select'] Selector to find elements that should not propagate to the handle
	 * @param {Integer} [options.delay=250] Time used to delay actions
	 *
	 * @example

			$('table').symphonyDraggable({
				items: 'tr',
				handles: 'td'
			});
	 */
	$.fn.symphonyDraggable = function(options) {
		var objects = this,
			settings = {
				items: 'li',
				handles: '*',
				ignore: 'input, textarea, select, a',
				dropto: 'input, textarea',
				delay: 250
			},
			handle = null;

		$.extend(settings, options);

		function insertAtCaret(item, value) {
			return item.each(function() {
				// Trident:
				if (document.selection) {
					this.focus();
					sel = document.selection.createRange();
					sel.text = value;
					this.focus();
				}
				
				// Gecko:
				else if (this.selectionStart || this.selectionStart == '0') {
					var startPos = this.selectionStart;
					var endPos = this.selectionEnd;
					var scrollTop = this.scrollTop;
					this.value = this.value.substring(0, startPos) + value + this.value.substring(endPos,this.value.length);
					this.focus();
					this.selectionStart = startPos + value.length;
					this.selectionEnd = startPos + value.length;
					this.scrollTop = scrollTop;
						
				// Failsafe:
				} else {
					this.value += value;
					this.focus();
				}
			});
		};

	/*-------------------------------------------------------------------------
		Events
	-------------------------------------------------------------------------*/

		// Start ordering
		objects.on('mousedown.draggable', settings.items + ' ' + settings.handles, function startDragging(event) {
			handle = $(this);

			var item = handle.parents(settings.items),
				object = handle.parents('.draggable');

			// Needed to prevent browsers from selecting texts and focusing textinputs
			if(!$(event.target).is('input, textarea')) {
				event.preventDefault();
			}

			if(!handle.is(settings.ignore) && !$(event.target).is(settings.ignore)) {

				// Highlight item
				if(object.is('.selectable, .collapsible')) {

					// Delay ordering to avoid conflicts with scripts bound to the click event
					setTimeout(function() {
						if(object.data('dragging') == 1) {
							object.trigger('orderstart.draggable', [item]);
							item.addClass('ordering');
						}
					}, settings.delay);
				}
				else {
					object.trigger('orderstart.draggable', [item]);
					item.addClass('ordering');
				}
			}
		});

		// Stop ordering
		$(document).on('mouseup.draggable', function stopDragging(event) {
			var object = $(this),
				item;

			if (handle == null) return;

			var dropItem = handle;
			handle = null;

			if(!$(event.target).is(settings.dropto)) {
				event.preventDefault();
				return;
			}

			insertAtCaret($(event.target),"<image-test name='baba'>");

		});

/*		// Order items
		$(document).on('mousemove.draggable', '.draggable:has(.dragging)', function order(event) {
			var object = $(this);
			if (object.data('dragging') != 1) {
				return;
			}
			// Only keep what we need from event object
			var pageY = event.pageY;
			Symphony.Utilities.requestAnimationFrame(function () {
				var item = object.find('.ordering');

				// If there is still an ordering item in DOM
				if (!item.length) {
					return;
				}

				var top = item.offset().top,
					bottom = top + item.outerHeight(),
					prev, next;

				// Remove text ranges
				if(window.getSelection) {
					window.getSelection().removeAllRanges();
				}

				// Move item up
				if(pageY < top) {
					prev = item.prev(settings.items);
					if(prev.length > 0) {
						item.insertBefore(prev);
						object.trigger('orderchange', [item]);
					}
				}

				// Move item down
				else if(pageY > bottom) {
					next = item.next(settings.items);
					if(next.length > 0) {
						item.insertAfter(next);
						object.trigger('orderchange', [item]);
					}
				}
			});
		});*/

	/*-------------------------------------------------------------------------
		Initialisation
	-------------------------------------------------------------------------*/

		// Make orderable
		objects.addClass('draggable');

	/*-----------------------------------------------------------------------*/

		return objects;
	};

})(window.jQuery, window.Symphony);




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

		var updateFilters = function(id,newfilters) {

			fields.each(function(){
				var field = $(this); 
				if (field.attr('id') == "field-" + id){
					field.data('filtersReset',true);
					field.data("filters",newfilters);
					var storage = field.find('.selectized'),
						selectize = storage[0].selectize,
						fieldId = field.data('parent-section-field-id'),
						limit = parseInt(field.data('limit')),
						numeric = true;

					//store existing option values
					var currentValues = selectize.getValue();

					//repopulate existing values (it will take some time with ajax and options will be already cleared by time there is a response)
					for (var i = 0; i < currentValues.length; i++) {
						//use closure to keep values within the context
						(function(currentID,textValue) {
							$.ajax({
								url: Symphony.Context.get('symphony')  + '/extension/association_ui_selector/query/',
								data: {
									field_id: fieldId,
									query: textValue,
									filter: newfilters,
									limit: 10
								},
								type: 'GET',
								success: function(result) {
									$.each(result.entries, function(id, data) {

										//check in case there are multiple values which match the string value
										if (id != currentID) return;

										selectize.settings.create = true;

										var optgroup = null;
										if (selectize.optgroups){
											$.each(selectize.optgroups, function(key,value){
												if ( data.section.toLowerCase() == key.toLowerCase() ) optgroup = key;
											});
										}
										
										//set the correct data values for proper display
										data.text = data.value;
										data.value = id;
										data.optgroup = optgroup;

										//add item back
										selectize.addOption(data);
										selectize.addItem(data.value);
										selectize.settings.create = false;

									});
								}
							});
						})(currentValues[i],selectize.options[currentValues[i]].text);
					};

					//

					//clear existing options as filters have changed
					selectize.clearOptions();

					fetchOptions(fieldId, "", newfilters, limit, numeric, function(entries){ 
						$.each(entries,function(index, entry){ 
							// console.log(entry);
							selectize.addOption(entry);
						});
					 }, selectize.optgroups);
				}
			});
		};

		var buildInterface = function() {
			var field = $(this),
				fieldId = field.data('parent-section-field-id'),
				filters = {},
				storage = field.find('select:visible, input:visible').first(),
				numeric = false,
				limit = parseInt(field.data('limit')),
				fetched = false,
				selectize;

			$.each(field.data(),function(index, value){ 
				if (index.indexOf("filter") == 0 ){
					var filter = index.substring(6).toLowerCase();

					//convert these parameters into real values
					if (value == "{$entry-id}" ){  
						value = Symphony.Context.get('env').entry_id;
					} else if ( value.indexOf("{") == 0 ){
						//this is some other parameter we need to work out how it should work
						var fieldname = value.slice(1, -1);
						value = jQuery('[name="fields['+ fieldname +']"]').val()
					}

					filters[filter] = value;
				}
			});

			field.data("filters",filters);

			if (Object.keys(filters).length > 0){
				$(this).find('select option:not([selected])').remove();
			}

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

					if (Object.keys(this.options).length <= items.length ){
						filters = this.$wrapper.closest('.field').data('filters');
						fetchOptions(fieldId, "", filters, limit, numeric, function(entries){ 
							if (field.data('filtersReset')) return;
							$.each(entries,function(index, entry){ 
								selectize.addOption(entry);
							});
						 }, this.optgroups);
					}

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

					filters = this.$wrapper.closest('.field').data('filters');

					// Fetch search options
					fetchOptions(fieldId, query, filters, limit, numeric, callback, this.optgroups);

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

			selectize.$control.symphonyDraggable({
				items: '.item',
				handles: 'span',
				ignore: 'input, textarea, select, a',
				delay: 250
			});
	
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
		}

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
				url: Symphony.Context.get('symphony')  + '/extension/association_ui_selector/get/',
				data: {
					entry_id: entryId,
					field_id: fieldId
				},
				type: 'GET',
				success: function(result) {
					item.attr('data-entry-id', entryId);

					if (result.entry){
						item.attr('data-section-handle', result.entry.section);
						item.attr('data-link', result.entry.link);

						if(result.entry.value != '') {
							item.find('span').html(result.entry.value);
						}
					}
				}
			});
		}

		var updateItemByValue = function(index, item) {
			var item = $(item),
				fieldId = item.parents('.field').data('parent-section-field-id'),
				id = item.data('value');

			$.ajax({
				url: Symphony.Context.get('symphony')  + '/extension/association_ui_selector/query/',
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
		}

		var fetchItem = function(entryId, fieldId, numeric, callback) {
			$.ajax({
				url: Symphony.Context.get('symphony')  + '/extension/association_ui_selector/get/',
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

		var fetchOptions = function(fieldId, query, filters, limit, numeric, callback, optgroups) {
			$.ajax({
				url: Symphony.Context.get('symphony')  + '/extension/association_ui_selector/query/',
				data: {
					field_id: fieldId,
					query: encodeURIComponent(query),
					filter: filters,
					limit: limit
				},
				type: 'GET',
				error: function() {
					callback();
				},
				success: function(result) {
					var entries = [];

					$.each(result.entries, function(id, data) {

						var optgroup = null;
						if (optgroups){
							$.each(optgroups, function(key,value){
								if ( data.section.toLowerCase() == key.toLowerCase() ) optgroup = key;
							});
						}

						entries.push({
							value: (numeric === true ? id : data.value),
							text: data.value,
							section: data.section,
							link: data.link,
							id: id,
							optgroup: optgroup
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

		// API
		return {
			init: init,
			updateFilters: updateFilters,
			update: updateItem,
			add: addItem
		};
	}();

	$(document).on('ready.aui-selector', function() {
		Symphony.Extensions.AssociationUISelector.init();
	});

})(window.jQuery, window.Symphony);
