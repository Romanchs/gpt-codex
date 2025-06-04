(function (PV) {
	'use strict';

	function symbolVis() { };
	PV.deriveVisualizationFromBase(symbolVis);

	var definition = {
		typeName: "manualentry-layout",
		displayName: 'Manual Entry Layout',
		visObjectType: symbolVis,
		noExpandSelector: '.noExpandSelector',
		datasourceBehavior: PV.Extensibility.Enums.DatasourceBehaviors.Multiple,
		iconUrl: '/Scripts/app/editor/symbols/ext/Icons/grid.png',
		getDefaultConfig: function(){
			return {
				DataShape: "Table",
				Height: 600,
				Width: 800,
				isDarkMode: true,
				initialState: [{
					company: '',
					field: '', 
					text: '',
				}],
				settingsState: {
					company: '',
					field: '', 
					text: '',
					selected: false, 
					sortable: true,
					disableHeatmap: false,
					hidden: false,
					render: null,
					tooltip: false,
					require: false
				},
				isCurrentTime: false,
				isFullLabel: false,
				isDublicateValue: false,
				isFormHidden: true,
				isTooltip: false,
				isTableView: false,
				isRequired: false,
				enumState: {},
				pickerDate: ['Time'],
				initFields: {},
				enumValues: {},
				columnsName: '',
				isSecondInPicker: false,
				requireAll: false,
				fieldCache: {},
				templateCache: {},
			}
		},
        switchSymbolConfig: switchSymbolConfig,
		configOptions: function () {
			return [{
				title: 'Налаштування Manual Entry Layout',
				mode: 'default'
			}];
		},
		inject: [ 'timeProvider' ]
	}
	
	function switchSymbolConfig(symbol) {
		
		var newConfig = {};
        [
			'initialState', 'settingsState'
        ].forEach(function (property) {
            if (symbol.Configuration.hasOwnProperty(property)) {
                newConfig[property] = angular.copy(symbol.Configuration[property]);
            }
        });

        return newConfig;
    }
	
	function selectSymbolDefaultsFromConfig(config) {
        var allowed = [
            'initialState', 'settingsState'
        ];

        var defaults = Object.keys(config)
            .filter(key => allowed.includes(key))
            .reduce(function (obj, key) {
                obj[key] = config[key];
                return obj;
            }, {});
			
        return defaults;
    }
	
	const getEnum = ({ host, path, enumType }) => ({
		[`root|${enumType.replaceAll(' ', '')}`]: {
			"Method": "GET",
			"Resource": `${host}/attributes?path=${path}|${enumType}&selectedFields=Path;Links.EnumerationValues;Links.Attributes;`
		},
		[`enumValue|${enumType.replaceAll(' ', '')}`]: {
			"Method": "GET",
			"RequestTemplate": {
				"Resource": `{0}?selectedFields=Items.Name;Items.Value`
			},
			"ParentIds": [
				`root|${enumType.replaceAll(' ', '')}`
			],
			"Parameters": [
				`$.root|${enumType.replaceAll(' ', '')}.Content.Links.EnumerationValues`
			]
		},
	});
	
	const saveRequestBodyOld = ({ host, path }, initialObj) => {
		const baseStructure = {
			"root": {
				"Method": "GET",
				"Resource": `${host}/elements?path=${path}&selectedFields=WebId;Path;Links.Attributes`
			}
		};

		Object.keys(initialObj).forEach((key) => {
			baseStructure[initialObj[key].sanitizedAttribute] = {
				"Method": "GET",
				"RequestTemplate": {
					"Resource": `${host}/attributes/multiple?selectedFields=Items.Object.WebId;Items.Object.Name;Items.Object.Path;Items.Object.Links.Attributes&path={0}|${initialObj[key].attribute}`
				},
				"ParentIds": [
					"root"
				],
				"Parameters": [
					"$.root.Content.Path"
				]
			};
		});

		return baseStructure;
	};
	
	const initialObj = {
		'Номер заявки РВ': 'Number',
		'Статус': 'Status',
		'Тип ремонту': 'RemontType',
		'Дата початку РВ': 'StartDate',
		'Дата завершення (планова)': 'EndDate',
		'Фактична дата закриття': 'FactDate',
		'Причина': 'Rison',
		'Диспетчер': 'Dispatcher',
	};
	
	const staticSettings = [
		{
			field: 'TextForAll_info',
			type: 'html',
			html: {
				label: '',
				attr: 'style="display: flex; width: 100%; margin: 20px 0; height: 30px; justify-content: end;"',
                column: 'before',
				html: `<button id="duplicate" class="w2ui-btn w2ui-btn-gray">Продублювати значення</button>`
			}
		},
		{
			field: 'Time',
			type: 'html',
			html: {
				label: 'Дата та час внесення',
				group: 'Введіть нове значення',
				groupStyle: 'width: 100%; border: none; background-color: #303030;',
				groupTitleStyle: 'visibility: hidden; color: white;',
				column: 0,
				attr: 'style="display: flex; align-items: center; justify-content: center; height: 12px; width: 201px; color: black; margin-left: 10px; padding: 10px 5px;"'
			}
		},
		{
			field: 'Time_info',
			type: 'html',
			html: {
				group: 'Поточне значення',
				label: '',
				attr: 'style="display: flex; width: 100%; height: 30px;"',
				column: 1,
				groupStyle: 'width: 100%; border: none; background-color: #303030;',
				groupTitleStyle: 'color: white;',
				html: `<div style="display: flex; align-items: center; justify-content: center;"></div>`
			}
		},
	];
	
	
	const staticSettingsTableView = [
		{
			field: 'TextForAll_info',
			type: 'html',
			html: {
				label: '',
				attr: 'style="display: flex; width: 100%; margin: 20px 0; height: 30px; justify-content: end;"',
                column: 'before',
				html: `<button id="duplicate" class="w2ui-btn w2ui-btn-gray">Продублювати значення</button>`
			}
		},
		{
			field: 'Time',
			type: 'html',
			html: {
				label: 'Дата та час внесення',
				group: 'Введіть нове значення',
				groupStyle: 'width: 100%; border: none; background-color: #303030;',
				groupTitleStyle: 'visibility: hidden; color: white;',
				column: 0,
				attr: 'style="display: flex; align-items: center; justify-content: center; height: 12px; width: 201px; color: black; margin-left: 10px; padding: 10px 5px;"'
			}
		},
	];

	let translateObj = {};
	
	let enumState = [];
	let pickerDate = ['Time'];
	
	const fieldsTemplate = (label, id = '', options = [{text: 'Empty', id: 0}], index = 0) => ({
		Default: {
			type: 'text',
			html: {
				label: label,
				attr: 'style="display: flex; margin-left: 10px; width: 211px; height: 17px;"',
				column: index
			}
		},
		DateTime: {
			type: 'html',
			html: { 
				label: label,
				column: index,
				attr: 'style="display: flex; align-items: center; justify-content: center; height: 12px; width: 220px; color: black; margin-left: 10px; padding: 10px 5px;"',
				html: `<div id="${id}" style="display: flex; align-items: center; justify-content: center; height: 12px; width: 220px; color: black; margin-left: -5px; padding: 10px 5px;"></div>` 
			}
		},
		Select: {
			type: 'select',
			options: { items: options },
			html: { label: label, attr: 'style="display: flex; width: 196px; margin-left: 10px; height: 30px;"', column: index }
		},
		TextArea: {
			type: 'textarea',
			html: {
				label: label,
				attr: 'style="display: flex; margin-left: 10px; width: 211px;"',
				column: index
			}
		},
	});

	symbolVis.prototype.init = function(scope, elem, timeProvider, webServices) {
		scope._fieldCache = scope.config.fieldCache;
		scope._templateCache = scope.config.templateCache;
		scope.isAllTimestamp = {};
		scope.isNeedUpdate = false;
		let enumValues = [{text: 'Empty', id: 0}];
		const origin = window.location.origin;
		const baseUrl = origin + "/piwebapi/";
		const sourcePath = processString(scope.symbol.DataSources[0]);
		
		function parseDataSource(ds) {
		  const withoutPrefix = ds.replace(/^af:/, "");
		  const [leftPart, rightPart] = withoutPrefix.split('|');
		  const [rawPath, elementId] = leftPart.split('?');
		  const [attributeName, attributeId] = rightPart.split('?');
		  const transformedCompany = pathTransformCompany(ds);

		  return {
			path: rawPath,
			elementName: transformedCompany.split('|')[0],
			fullAttribute: transformedCompany,
			attributeName,
		  };
		}

		function groupByPath(parsedList) {
		  const result = {};
		  parsedList.forEach(item => {
			if (!result[item.elementName]) {
			  result[item.elementName] = [];
			}
			result[item.elementName].push({
			  fullAttribute: item.fullAttribute,
			  attributeName: item.attributeName,
			  path: item.path
			});
		  });
		  return result;
		}
		
		let parsedList = scope.symbol.DataSources.map(parseDataSource);
		const groupedData = groupByPath(parsedList);

		function saveRequestBody(groupedData, host) {
			const baseStructure = {};
			let rootCounter = 1;

			for (const elementName in groupedData) {
				const items = groupedData[elementName];
				if (!items || !items.length) {
					continue;
				}

				const rootName = `root`;
				const rootMain = `root${rootCounter}`;
				
				baseStructure[rootMain] = {
					Method: "GET",
					Resource: `${host}/elements?path=${items[0].path}&selectedFields=WebId;Path;Links.Attributes`
				};

				items.forEach(({ attributeName, fullAttribute }) => {
					const requestKey = `${rootName}_${sanitizeFieldName(fullAttribute)}`;

					baseStructure[requestKey] = {
						Method: "GET",
						RequestTemplate: {
							Resource: `${host}/attributes/multiple?selectedFields=Items.Object.WebId;Items.Object.Name;Items.Object.Path;Items.Object.Links.Attributes&path={0}|${attributeName}`
						},
						ParentIds: [rootMain],
						Parameters: [
							`$.${rootMain}.Content.Path`
						]
					};
				});

				rootCounter++;
			}

				return baseStructure;
		}
		
		const settings = [
			{
				field: 'Time',
				type: 'html',
				html: { 
					label: 'Дата та час внесення',
					group: 'Введіть нове значення',
					groupStyle: 'border: none; background-color: #303030', 
					groupTitleStyle: 'visibility: hidden; color: white',
					column: 0,
					attr: 'style="display: flex; align-items: center; justify-content: center; height: 12px; width: 201px; color: black; margin-left: 55px; padding: 10px 5px;"'
				}
			},
			{ 
				field: 'Time_info', 
				type: 'html',
				html: { 
					group: 'Поточне значення', 
					label: '', 
					attr: 'style="display: flex; width: 200px; height: 30px;"', 
					column: 1, 
					groupStyle: 'border: none; background-color: #303030', 
					groupTitleStyle: 'color: white', 
					html: `<div style="display: flex; align-items: center; justify-content: center;">--</div>` 
				
				}
			},
		];
		
		const symbolContainerDiv = elem.find("#layout")[0];
		symbolContainerDiv.id = "layout_" + Math.random().toString(36).substr(2, 16);
		scope.config.layoutId = `#${symbolContainerDiv.id}`;
		
		const toolbarId = "Toolbar_" + Math.random().toString(36).substr(2, 16);
		
		const gridId = "grid_" + Math.random().toString(36).substr(2, 16);
		const formId = "form_" + Math.random().toString(36).substr(2, 16);
		const dublicatePopupId = "dublicatePopup_" + Math.random().toString(36).substr(2, 16);
		
		let config = {
			layout: {
				name: symbolContainerDiv.id,
				padding: 4,
				panels: [
					{ type: 'top', size: '100%' },
					{ type: 'main', size: '40%', style: 'overflow: hidden', hidden: scope.config.isFormHidden },
				]
			},
			layoutGrid: {
				name: `${symbolContainerDiv.id}_grid`,
				padding: 4,
				panels: [
					{ type: 'top', size: '7%', style: 'min-height: 30px;' },
					{ type: 'main', size: '93%', style: 'overflow: hidden' },
				]
			},
			grid: {
				name: gridId,
				show: {
					toolbar: false,
				},
				onSort: function (event) {
					event.onComplete = function() {
						const sortData = this.records.map(record => record.recid);
						scope.config.sortData = sortData;
					}
				},
				onColumnResize: function (event) {
					const grid = this;
					let columnSizes = {};
					grid.columns.forEach(col => {
						columnSizes = {...columnSizes, [col.field]: col.size};
					});
					scope.config.columnSizes = columnSizes;
				}
			},
			form: {
				name: formId,
				fields: JSON.parse(JSON.stringify(settings)),
				actions: {
					customReset: {
						text: 'Очистити',
						class: 'w2ui-btn-gray',
						onClick(event) {
							w2ui[gridId].selectNone();
							scope.config.pickerDate.forEach(item => {
								const formatTime = item === 'Time' ? "DD.MM.YYYY 00:00:00" : "DD.MM.YYYY HH:mm:ss"
								setValueToTimePicker(item, moment().format(formatTime), "DD.MM.YYYY HH:mm:ss");
							});
							scope.isAllTimestamp = {};
							this.clear();
						}
					},
					customSave: {
						text: 'Записати',
						class: 'w2ui-btn-blue',
						onClick(event) {
							
							const errors = this.validate(true);
							
							getRequiredPickers().forEach(id => {
								if (!scope.isAllTimestamp[id]) {
									errors.push({ field: id, error: 'Обов’язково' });
									$(`#${symbolContainerDiv.id} #${sanitizeFieldName(id)}`).addClass('picker-error');
								}
							});
							if (errors.length) return; 
							
							const sendData = (body) => {
								fetchBatch(baseUrl, body)
								.then(res => res.json())
								.then(data => {
									w2ui[gridId].selectNone();
									setValueToTimePicker('Time', moment().format("DD.MM.YYYY 00:00"), "DD.MM.YYYY HH:mm");
									scope.isAllTimestamp = {};
									this.clear();
									
									this.unlock();
									this.message({
										body: '<div class="w2ui-centered" style="color: black;">Успiшно записано</div>',
										width: 250,
										height: 150,
									});
									setTimeout(() => {
										this.message();
										scope.$root.$broadcast('refreshDataForChangedSymbols');
									}, 2000);
								}).catch(error => {
									this.message({
										body: '<div class="w2ui-centered" style="color: black;">Сталась помилка!</div>',
										width: 250,
										height: 150,
									});
									setTimeout(() => {
										this.message();
									}, 2000);
								});
							};
							
							const records = removeInfoFields(this.record);
							
							const prepairData = () => {
								if (this.recid == 0) {
									this.lock('Запис...', true);
									const currentDate = moment().format('MM/DD/YYYY HH:mm:00');
									if(!scope.isAllTimestamp['Time']) {
										scope.isAllTimestamp['Time'] = currentDate;
									}
									const recordBody = {
										...records, 
										...scope.isAllTimestamp,
										Time: scope.isAllTimestamp['Time'],
									};
									const body = {...saveRequestBody(groupedData, baseUrl), ...postBody(baseUrl, recordBody)};
									sendData(body);
								} else {
									this.lock('Оновлення...', true);
									const recordBody = {
										...records, 
										...scope.isAllTimestamp,
										Time: moment(this.record.Time, "DD.MM.YYYY HH:mm:ss").format('MM/DD/YYYY HH:mm:ss'),
									};
									const body = {...saveRequestBody(groupedData, baseUrl), ...postBody(baseUrl, recordBody)};
									//sendData(body);
								}
							}
							
							prepairData();
						}
					}
				}
			}
		}
		
		let toolbar = $().w2toolbar({
			name: toolbarId,
			items: [
				{ type: 'break' },
				{ type: 'button', id: 'excel', style: `background-color: white; color: black; padding: 4px; border-radius: 5px;`, text: 'Експорт в Excel', onClick: function() {exportToExcel()} },
			]
		});
		
		let layout = $(`#${symbolContainerDiv.id}`).w2layout(config.layout);
		let layoutGrid = $().w2layout(config.layoutGrid);
		let grid = $().w2grid(config.grid);
		let form = $().w2form(config.form);
		
		let tooltip = (text) => {
			return w2utils.tooltip(text, {
				className: 'w2ui-light',
				position: 'top',
				maxWidth: 200
			})
		}
		
		let isAscending = true;
		grid.on('sort', function(event) {
			const isValueDate = moment(grid.records[0][event.field], 'DD.MM.YYYY H:mm:ss', true).isValid();
			
			if (isValueDate && isAscending) {
				event.preventDefault();
				grid.records = grid.records.toSorted(function(a, b) {
                    return moment(a[event.field], 'DD.MM.YYYY HH:mm').valueOf() - moment(b[event.field], 'DD.MM.YYYY HH:mm').valueOf();
                });
				
				const sortData = grid.records.map(record => record.recid);
				scope.config.sortData = sortData;
				grid.refresh();
			}
			
			if(isValueDate && !isAscending) {
				event.preventDefault();
				grid.records.reverse();
				const sortData = grid.records.map(record => record.recid);
				scope.config.sortData = sortData;
				grid.refresh();
			}
			isAscending = !isAscending;
		});
		
		layout.render(`#${symbolContainerDiv.id}`);
		layoutGrid.html('top', toolbar);
		layoutGrid.html('main', grid);
		layout.html('top', form);
		layout.html('main', layoutGrid);
		
		function duplicateValue() {
			const form = w2ui[formId];
			const formPopup = w2ui[dublicatePopupId]
			const textForAll = formPopup.record['TextForAll'];
			
			if (textForAll) {
				form.fields.forEach(fieldObj => {
					if (fieldObj.type === 'text' || fieldObj.type === 'textarea') {
						form.record[fieldObj.field] = textForAll;
					}
				});
				form.refresh();
			}
		}
		
		
		setTimeout(() => {
			addCalendar('Time');
		}, 40);
		
		
		scope.config.hideMainColumn = function(isHidden, column) {
			isHidden ? grid.hideColumn(column) : grid.showColumn(column);
		}
		
		if(!scope.config.isFormHidden) {
			layout.show('main');
			layout.sizeTo('top', '60%');
		}
		
		scope.config.hideForm = function(isHidden) {
			if(isHidden) {
				layout.hide('main');
				layout.sizeTo('top', '100%');
			} else {
				layout.show('main');
				layout.sizeTo('top', '60%');
			}
		}
		
		scope.config.isDisabled = function() {
			var selectedItems = scope.config.initialState.filter(i => i.selected)
			return selectedItems.length === 0;
		};
		
		scope.config.isDisabledArrows = function() {
			var selectedItems = scope.config.initialState.filter(i => i.selected)
			return selectedItems.length === 0 || selectedItems.length > 1;
		};
		
		function exportToExcel() {
			let data = grid.records;
			const transformedData = grid.records.map(item => {
				const { w2ui, company, 'Текст зауважень2': text2, 'Текст зауважень3': text3, ...rest } = item;
				const transformedItem = { ...rest };

				return transformedItem;
			});
			data = transformedData;
			let wb = XLSX.utils.book_new();
			let ws = XLSX.utils.json_to_sheet(data);
			XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
			XLSX.writeFile(wb, 'ExportRemark' + ".xlsx");
		};
		
		function setDiferentTime(streamTime) {
			let time = streamTime;
			
			grid.records.forEach(item => {
				if(moment(streamTime, 'MM/DD/YYYY HH:mm:ss').valueOf() === moment(item.Time, 'DD.MM.YYYY HH:mm:ss').valueOf()) {
					time = setDiferentTime(moment(streamTime, 'MM/DD/YYYY HH:mm:ss').add(1, 's').format('MM/DD/YYYY HH:mm:ss'));
				}
			});
			return time;
		};
		
		scope.config.removeDatasource = function() {
			const selected = scope.config.initialState.filter(item => item.selected);
			var ds = scope.symbol.DataSources;
			var removed = ds.filter(item => !selected.some(sel => sel.company === pathTransformCompany(item)));
			
			if (confirm("Бажаєте видалити атрибут")) {
				scope.symbol.DataSources = removed;
				scope.config.initialState = scope.config.initialState
					.filter(item => !selected.some(sel => sel.company === item.company))
					.map((item, index) => ({ ...item, index }));
					
					const lastSelectedIndex = selected[selected.length - 1].index;

					if (scope.config.initialState.length > lastSelectedIndex) {
						scope.config.initialState[lastSelectedIndex].selected = true;
					} else if (scope.config.initialState.length > 0) {
						scope.config.initialState[scope.config.initialState.length - 1].selected = true;
					}
				grid.refresh();
				scope.$root.$broadcast('refreshDataForChangedSymbols');
			}
		};
		
		scope.config.onChangeAllRequire = function(require){
			scope.config.initialState = scope.config.initialState.map((item, i) => {
				return {...item, require: require};
			})
			scope.isNeedUpdate = true;
			scope.$root.$broadcast('refreshDataForChangedSymbols');
		};
		
		scope.config.onSelectState = function(index){
			scope.config.initialState = scope.config.initialState.map((item, i) => {
				if(index === i) {
					item = {...item, selected: !item.selected};
					scope.config.columnsName = item.text;
					scope.config.isTooltip = item.tooltip;
					scope.config.isRequired = item.require;
				}
				return item;
			})
		};
		
		scope.config.changeState = function(){
			const selected = scope.config.initialState.find(item => item.selected);
			if(!selected) return;
			
			scope.config.initialState = scope.config.initialState.map(item => {
				if(item.index === selected.index) {
					return {
						...item, 
						text: scope.config.columnsName,
						tooltip: scope.config.isTooltip,
						require: scope.config.isRequired
					};
				}
				return item;
			});
			scope.isNeedUpdate = true;
			scope.$root.$broadcast('refreshDataForChangedSymbols');
		};
		
		function getRequiredPickers () {
			return scope.config.pickerDate.filter(fieldId => {
				const row = scope.config.initialState.find(i => i.field === fieldId);
				return row && row.require;
			});
		}
		
		scope.config.upDatasource = function() {
			const selected = scope.config.initialState.find(item => item.selected);
			var ds = scope.symbol.DataSources;
			var dsTransform = ds.map(item => pathTransformCompany(item).replace(/\./g, ""));
			const selectedField = selected.field;
			const index = dsTransform.indexOf(selectedField);
			scope.isNeedUpdate = true;
			
			if(index === 0) return;
			
			if (index > 0) {
				const temp = ds[index - 1];
				ds[index - 1] = ds[index];
				ds[index] = temp;
			}
			scope.symbol.DataSources = ds;
			updateInitialStateUp(index);
			grid.refresh();
			scope.$root.$broadcast('refreshDataForChangedSymbols');
		};
		
		function updateInitialStateUp(index) {
			const initialState = [...scope.config.initialState];
			
			if (index > 0) {
				const temp = initialState[index - 1];
				initialState[index - 1] = initialState[index];
				initialState[index] = temp;
			}
			const companyIndexMap = new Map();
			initialState.forEach((item, idx) => {
				const companyField = item.company.split('|')[0];
				if (!companyIndexMap.has(companyField)) {
					companyIndexMap.set(companyField, 1);
				} else {
					companyIndexMap.set(companyField, companyIndexMap.get(companyField) + 1);
				}
				item.index = idx;
				item.indexCompany = companyIndexMap.get(companyField);
			});
			scope.config.initialState = initialState;
		};
		
		scope.config.downDatasource = function() {
			const selected = scope.config.initialState.find(item => item.selected);
			var ds = scope.symbol.DataSources;
			var dsTransform = ds.map(item => pathTransformCompany(item).replace(/\./g, ""));
			const selectedField = selected.field;
			const index = dsTransform.indexOf(selectedField);
			scope.isNeedUpdate = true;
			
			if(index > ds.length - 1) return;
			
			if (index < ds.length - 1) {
				const temp = ds[index + 1];
				ds[index + 1] = ds[index];
				ds[index] = temp;
			}
			scope.symbol.DataSources = ds;
			updateInitialStateDown(index);
			grid.refresh();
			scope.$root.$broadcast('refreshDataForChangedSymbols');
		};
		
		function updateInitialStateDown(index) {
			const initialState = [...scope.config.initialState];
			
			if (index < initialState.length - 1) {
				const temp = initialState[index + 1];
				initialState[index + 1] = initialState[index];
				initialState[index] = temp;
			}
			const companyIndexMap = new Map();
			initialState.forEach((item, idx) => {
				const companyField = item.company.split('|')[0];
				if (!companyIndexMap.has(companyField)) {
					companyIndexMap.set(companyField, 1);
				} else {
					companyIndexMap.set(companyField, companyIndexMap.get(companyField) + 1);
				}
				item.index = idx;
				item.indexCompany = companyIndexMap.get(companyField);
			});
			scope.config.initialState = initialState;
		};
		
		scope.config.forceRefresh = function () {
			scope.isNeedUpdate = true;
			scope.$root.$broadcast('refreshDataForChangedSymbols');
		}
		
		scope.config.changeField = function (selectedField) {
			const selected = scope.config.initialState.find(item => item.selected);

			if (!selected) return;
			
			scope.config.initFields = {...scope.config.initFields, [selected.field]: {attribute: selected.attribute, fieldType: selectedField}}
			
			const fieldKey = selected.company + '|' + selected.attribute;

			const payload = {
				fieldType: selectedField,
				picker: selectedField === 'DateTime',
				enumPath: selectedField === 'Select' ? selected.attribute : null
			};

			scope._fieldCache[fieldKey] = payload;
			if (!scope._templateCache[selected.attribute]) scope._templateCache[selected.attribute] = payload;
			if (scope.Runtime) scope.Runtime.saveSymbolConfiguration();

			if (!scope._templateCache[selected.attribute])
				scope._templateCache[selected.attribute] = payload;
			
			switch (selectedField) {
				case 'DateTime':
					if(!scope.config.pickerDate.includes(selected.field)) {
						scope.config.pickerDate.push(selected.field);
					}
					if(scope.config.enumState[selected.field]) {
						delete scope.config.enumState[selected.field];
					}
					//scope.config.enumState = scope.config.enumState.filter(item => item !== selected.field);
					break;
				case 'Select':
					if(!scope.config.enumState[selected.field]) {
						//scope.config.enumState.push(selected.field);
						scope.config.enumState = {...scope.config.enumState, [selected.field]: selected.attribute}
					}
					scope.config.pickerDate = scope.config.pickerDate.filter(item => item !== selected.field);
					break;
				case 'TextArea':
					scope.config.pickerDate = scope.config.pickerDate.filter(item => item !== selected.field);
					if(scope.config.enumState[selected.field]) {
						delete scope.config.enumState[selected.field];
					}
					//scope.config.enumState = scope.config.enumState.filter(item => item !== selected.field);
					break;
				default:
					scope.config.pickerDate = scope.config.pickerDate.filter(item => item !== selected.field);
					if(scope.config.enumState[selected.field]) {
						delete scope.config.enumState[selected.field];
					}
					//scope.config.enumState = scope.config.enumState.filter(item => item !== selected.field);
					if(scope.config.initFields[selected.field]) {
						delete scope.config.initFields[selected.field];
					}
			}
			
			if(Object.keys(scope.config.enumState).length) {
				setFetchEnum();
			}
			
			const template = fieldsTemplate(
				`${scope.config.isFullLabel ? selected.company.split('|')[0] + '<br>' : ''}${selected.attribute}` || 'Default Label', 
				sanitizeFieldName(selected.field), [], !scope.config.isTableView ? 0 : selected.indexCompany
			)[selectedField || 'Default'];
			
			if (template) {
				const fieldIndex = config.form.fields.findIndex(f => f.field === selected.field);
				if (fieldIndex !== -1) {
					config.form.fields[fieldIndex] = {...config.form.fields[fieldIndex], ...template};
				} else {
					return;
				}

				
				form.destroy();
				form = $().w2form(config.form);
				layout.html('top', form);
			}
			setTimeout(() => {
				scope.config.pickerDate.forEach(item => {
					addCalendar(item);
				});
			}, 40);

			scope.$root.$broadcast('refreshDataForChangedSymbols');
			
		};
		
		function rebuildSettings() {
			scope.config.initFields  = {};
			scope.config.pickerDate  = ['Time'];
			scope.config.enumState   = {};

			const usedTemplateFor = {};   // чтобы шаблон не «клонировался» на все дубликаты

			scope.config.initialState.forEach(item => {
				const fieldKey = item.company + '|' + item.attribute;
				let cfg = scope._fieldCache[fieldKey];
				// если для этого конкретного элемента настроек нет –
				// берём «шаблон» атрибута, но только для ПЕРВОГО встретившегося дубликата
				if (!cfg && !usedTemplateFor[item.attribute]) {
					cfg = scope._templateCache[item.attribute];
					usedTemplateFor[item.attribute] = true;
				}

				if (!cfg) return; // никакого кэша – оставляем дефолт

				// поле-тип
				if (cfg.fieldType && cfg.fieldType !== 'Default') {
					scope.config.initFields[item.field] = {
						attribute: item.attribute,
						fieldType: cfg.fieldType
					};
				}

				// календарь
				if (cfg.picker && !scope.config.pickerDate.includes(item.field))
					scope.config.pickerDate.push(item.field);

				// enum-select
				if (cfg.enumPath) scope.config.enumState[item.field] = cfg.enumPath;
			});
		}

		
		function loadStyles() {
			if (scope.config.sortData) {
				grid.records.sort((a, b) => scope.config.sortData.indexOf(a.recid) - scope.config.sortData.indexOf(b.recid));
            }
			grid.refresh();
		}
		
		scope.$watchCollection(
			() => scope.symbol.DataSources,
			(n, o) => { if (!angular.equals(n, o)) scope.isNeedUpdate = true; parsedList = n.map(parseDataSource); }
		);
		scope.$watchCollection(
			'config.initialState',
			(n, o) => { if (!angular.equals(n, o)) scope.isNeedUpdate = true; }
		);
		scope.$watchCollection('config.initialState', function () {
			if (scope.Runtime) scope.Runtime.saveSymbolConfiguration();
		});
		
		this.onDataUpdate = dataUpdate;
		this.onResize = resize;
		
		function dataUpdate(data) {
			if(!data) return;
			
			const newData = transformData(data);
			scope.config.initialState = updateDataSorce(scope.symbol.DataSources);

			grid.columns = newData.columns;
			grid.records = newData.records;
			
			const currentHash = JSON.stringify(
				data.Rows.map(r => `${r.Label}|${r.Value}`)
			);
			if (scope.prevDataHash !== currentHash && !scope.config.isTableView) {
				scope.isNeedUpdate = true;
				scope.prevDataHash  = currentHash;
			}

			if(scope.dataLength !== data.Rows.length || scope.recordLength !== newData.records.length || scope.isNeedUpdate) {
				const result = buildFormFromData(data);
				upgradeForm(form, result);
				setTimeout(() => {
					scope.config.pickerDate.forEach(item => {
						addCalendar(item);
					});
					//w2ui[formId].toggleGroup('Продублювати значення', false);
					if(!scope.config.isDublicateValue) {
						document.querySelector(`#${symbolContainerDiv.id} #duplicate`).addEventListener('click', () => {
							openPopup();
							//duplicateValue();
						});
					}
					
				}, 40);
				
				setFetchEnum();
				
				grid.reload();
				scope.dataLength = data.Rows.length;
				scope.recordLength = newData.records.length;
				scope.isNeedUpdate = false;
			}
			
			if(!scope.config.columnSizes) {
				resizeFirstColumnsToFitContent();
				resizeColumnsEvenly();
			}
			loadStyles();
			
			grid.resize();
		};
		
		function resize() {
			if(layout) {
				layout.resize();
			}
			if(layoutGrid) {
				layoutGrid.resize();
			}
			if(grid) {
				if(!scope.config.columnSizes) {
					resizeColumnsEvenly();
				}
				grid.resize();
			}
			if(form) {
				form.resize();
			}
        };
		
		function fetchBatch(url, body) {
			return fetch(`${url}/batch`, {
				method: "POST",
				credentials: "include",
				headers: {
					"X-Requested-With": "",
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
			});
		}
		
		function postBody(url, record) {
		  const batchRequest = {};
		  let counter = 0;

			for (const [key, value] of Object.entries(record)) {
				if (key === "Time") continue;

				if (translateObj[key]) {
					const { sanitizedAttribute } = translateObj[key];

					const data = {
						Timestamp: record.Time,
						Value: value
					};

					batchRequest[`SendValue${counter}`] = {
						Method: "POST",
						Resource: `${url}/streams/{0}/value`,
						Content: JSON.stringify(data),
						Headers: {
							"Content-Type": "application/json"
						},
						ParentIds: [`root_${sanitizedAttribute}`],
						Parameters: [
							`$.root_${sanitizedAttribute}.Content.Items[0].Content.Items[0].Object.WebId`
						]
					};

					counter++;
				}
			}

			return batchRequest;
		}
		
		function postBodyOld(url, record) {
			const batchRequest = {};
			
			Object.keys(record).forEach((item, index) => {
				const data = {
					"Timestamp": record.Time,
					"Value": record[item]
				};
				
				if(translateObj[item]){
					batchRequest["SendValue" + index] = {
						"Method": "POST",
						"Resource": `${url}/streams/{0}/value`,
						"Content": JSON.stringify(data),
						"Headers": {
							'Content-Type': 'application/json'
						},
						"ParentIds": [translateObj[item]],
						"Parameters": [`$.${translateObj[item]}.Content.Items[0].Content.Items[0].Object.WebId`],
					}
				}
			});
			
			return batchRequest;
		}
		
		function setFetchEnum() {
			let body = {};

			Object.keys(scope.config.enumState).forEach((item, index) => {
				const enumPath = parsedList.find(enumObj => enumObj.fullAttribute === item);
				console.log(enumPath, parsedList, scope.config.enumState)
				const initBody = getEnum({host: baseUrl, path: enumPath.path, enumType: scope.config.enumState[item]});
				Object.assign(body, initBody);
			});
				
			fetchBatch(baseUrl, body)
			.then(res => res.json())
			.then(data => {
				Object.keys(scope.config.enumState).forEach((item) => {
					enumValues = transformArray((data[`enumValue|${scope.config.enumState[item].replaceAll(' ', '')}`].Content.Items[0].Content.Items));
					if(enumValues) {
						w2ui[formId].set(item, { options: { items: enumValues } });
					}
				});
				w2ui[formId].refresh();
			});
		}
		
		function transformArray(arr) {
			return arr.map(item => ({
				text: item.Name,
				id: item.Value
			}))
		}
		
		function processString(str) {
			if (!str) return;
			const isAttribute = /af:/.test(str);
			const attributePath = isAttribute ? str.replace(/af\:(.*)/,'$1') : str.replace(/pi\:(\\\\.*)\?{1}.*(\\.*)\?{1}.*/,'$1$2');
			const parts = attributePath.split('?');
			return parts[0];
		}
		function buildFormFromDataTimeSeries(data) {
			return data.reduce((result, item) => {
				//if (!item.Values.length) return result;
				const splitted = item.Label.split('|');
				const fieldName = splitted[splitted.length - 1].trim() || item.Label;
				const sanitizedFieldName = sanitizeFieldName(fieldName);
				let latest = {};
				if (item.Values.length) {
					latest = item.Values.reduce((acc, current) => {
						const currentTime = moment(current.Time, 'DD.MM.YYYY HH:mm:ss');

						if (!acc || currentTime.isAfter(acc.parsedTime)) {
							return {
								parsedTime: currentTime,
								value: current.Value
							};
						}

						return acc;
					}, null);
				}
				
				
				translateObj = {...translateObj, [fieldName]: sanitizedFieldName};

				result.push({
					label: fieldName,
					field: fieldName,
					addField: `${sanitizedFieldName}_info`,
					value: latest.value || '--'
				});

				return result;
			}, []);
		}
		
		function buildFormFromData(data) {
			const rows = data.Rows || [];
			return rows.map((item) => {
				const splitted = item.Label.split('|');
				const fieldName = splitted[splitted.length - 1].trim() || item.Label;
				const sanitizedFieldName = sanitizeFieldName(fieldName);
				
				translateObj = {...translateObj, [item.Label]: {elmentName: splitted[0], attribute: fieldName, sanitizedAttribute: sanitizeFieldName(item.Label)}};

				return {
					label: fieldName,
					field: fieldName,
					addField: `${sanitizedFieldName}_info`,
					originalLabel: item.Label.replace(/\./g, ""),
					value: item.Value || '--',
					elementLabel: splitted[0],
				};
			});
		}

		function upgradeForm(form, dynamicSettings) {
			rebuildSettings();
			config.form.fields = scope.config.isTableView ? [...staticSettingsTableView] : [...staticSettings];
			const initialLabel = (originalLabel) => scope.config.initialState.find(item => item.field === originalLabel) || null;
			
			config.form.fields.push(
				...dynamicSettings.map(({ field, addField, label, originalLabel, value, elementLabel }, index) => {
					const finalLabel = initialLabel(originalLabel) ? initialLabel(originalLabel).text : label;
					const needTooltip = initialLabel(originalLabel) && initialLabel(originalLabel).tooltip ? tooltip(finalLabel) : '';
					const finalIndex = !scope.config.isTableView ? 0 : initialLabel(originalLabel) ? initialLabel(originalLabel).indexCompany : index + 1;
					const required = initialLabel(originalLabel) ? initialLabel(originalLabel).require : false
					return [
						{
							field: originalLabel,
							required: required,
							...fieldsTemplate(
								`<span ${needTooltip}>${scope.config.isFullLabel ? elementLabel + '<br>' : ''}${finalLabel}</span>` || 'Default Label', 
								sanitizeFieldName(originalLabel), [], finalIndex)[(scope.config.initFields[originalLabel] && scope.config.initFields[originalLabel].fieldType) || 'Default']
						},
						{
							field: addField,
							type: 'html',
							hidden: scope.config.isTableView,
							html: {
								label: '',
								attr: 'style="display: flex; align-items: center; height: 30px; justify-content: start;"',
								column: 1,
								html: `<div style="white-space: nowrap; overflow: hidden; overflow-x: auto;">${value}</div>`
							}
						}
					]
				}).flat()
			);
			
			
			if(scope.config.isDublicateValue) {
				config.form.fields = config.form.fields.filter(item => item.field !== 'TextForAll_info');
			}
			
			form.destroy();
			form = $().w2form(config.form);
			layout.html('top', form);
		}
		
		function addCalendar(id) {
			const sanitizeId = sanitizeFieldName(id);
			const selectDataSeconds = scope.config.isSecondInPicker ? 'DD.MM.YYYY 00:00:00' : 'DD.MM.YYYY 00:00';
			const formatTimeStampSeconds = scope.config.isSecondInPicker ? 'DD.MM.YYYY HH:mm:ss' : 'DD.MM.YYYY HH:mm';
			const selectedTimeSeconds = scope.config.isSecondInPicker ? 'MM/DD/YYYY HH:mm:ss' : 'MM/DD/YYYY HH:mm';
			$(`#${symbolContainerDiv.id} #${sanitizeId}`).dateTimePickerNew({
				locale:'uk',
				selectData: id === 'Time' ? moment().format(selectDataSeconds) : 'now',
				dayCount: 365,
				positionShift: { top: 45, left: 0},
				showSeconds: scope.config.isSecondInPicker,
				dateFormat: formatTimeStampSeconds,
				title: "Вибір часу та дати",
				buttonTitle: "Вибір",
				setValue: function(arg) {
					if(id === 'Time' && !scope.isAllTimestamp[id]) {
						const newMoment = moment(arg);
						const prevMoment = moment();
						if (newMoment.format("DD.MM.YYYY") !== prevMoment.format("DD.MM.YYYY")) {
							$(`#d-hh`).text('00');
							$(`#d-mm`).text('00');
						}
					}
					if(id === 'Time' && scope.isAllTimestamp[id]) {
						const newMoment = moment(arg);
						const prevMoment = moment(scope.isAllTimestamp[id], formatTimeStampSeconds);
						if (newMoment.format("DD.MM.YYYY") !== prevMoment.format("DD.MM.YYYY")) {
							$(`#d-hh`).text('00');
							$(`#d-mm`).text('00');
						}
					}
					const selectedTime = moment(arg).format(selectedTimeSeconds);
					scope.isAllTimestamp = {...scope.isAllTimestamp, [id]: selectedTime};
					$(`#${symbolContainerDiv.id} #${sanitizeFieldName(id)}`).removeClass('picker-error');
					scope.$root.$broadcast('refreshDataForChangedSymbols');
				}
			});
		}
		
		function setValueToTimePicker(elemId, timeValue = {}, timeFormat = ''){
			const sanitizeId = sanitizeFieldName(elemId);
			var $s = $(`#${symbolContainerDiv.id} #${sanitizeId}`).find("#pickerdate");
			$s.text(moment(timeValue, timeFormat).format('DD.MM.YYYY'));
			$(`#${symbolContainerDiv.id} #${sanitizeId}`).empty();
			$(`#${symbolContainerDiv.id} #${sanitizeId}`).append($s);
			$s = $('<i>');
			$s.addClass('fa fa-calendar ico-size');
			$(`#${symbolContainerDiv.id} #${sanitizeId}`).append($s);
			$s = $('<span id="pickertime">');
			$s.text(moment(timeValue, timeFormat).format('HH:mm:ss'));
			$(`#${symbolContainerDiv.id} #${sanitizeId}`).append($s);
			$s = $('<i>');
			$s.addClass('fa fa-clock-o ico-size');
			$(`#${symbolContainerDiv.id} #${sanitizeId}`).append($s);
			$('#result').val(moment(timeValue, timeFormat).format('DD.MM.YYYY HH:mm:ss'));
		};
		
		function findOption(form, record, field) {
			const statusField = form.fields.find(f => f.name === field);
			if (statusField && statusField.options && statusField.options.items) {
				const matchedOption = statusField.options.items.find(item => item.text === record[field]);
				if (matchedOption) {
					return matchedOption.id;
				}
			}
			return 0;
		}
		
		
		function mergeInitialState (newList) {
			const prev = scope.config.initialState || [];

			const prevByField = {};
			const prevByAttr  = {};

			prev.forEach(row => {
				prevByField[row.company] = row;
				if (!prevByAttr[row.attribute]) prevByAttr[row.attribute] = row;
			});

			return newList.map(row => {
				const old = prevByField[row.company] || prevByAttr[row.attribute];

				if (!old) return row;
				return {
					...row,
					text: old.text ? old.text : row.text,
					tooltip: old.tooltip ? old.tooltip : row.tooltip,
					require: old.require ? old.require : row.require,
					selected: old.selected ? old.selected : false
				};
			});
		}
		
		function updateDataSorce(data) {
			const fieldTracker = new Set();
			const companyIndexMap = new Map();
			
			const rawList = data.map((item, index) => {
				const isAttribute = /af:/.test(item);
				const path = isAttribute
				  ? item.replace(/af\:(.*)/, '$1')
				  : item.replace(/pi\:(\\\\.*)\?{1}.*(\\.*)\?{1}.*/, '$1$2');
				const DataSorceLabel = pathTransform(item);
				const transformedCompany = pathTransformCompany(item);
				const companyField = transformedCompany.split('|')[0];
				const hasField = transformedCompany;
				
				if (!companyIndexMap.has(companyField)) {
					companyIndexMap.set(companyField, 1);
				} else {
					companyIndexMap.set(companyField, companyIndexMap.get(companyField) + 1);
				}
				const indexCompany = companyIndexMap.get(companyField);
				
				if (fieldTracker.has(hasField)) {
					return null;
				}
				
				if (scope.config.initialState[0].text === '' || scope.config.initialState[0].field === '') {
					return {
						...scope.config.settingsState,
						company: transformedCompany,
						text: DataSorceLabel,
						field: transformedCompany.replace(/\./g, ""),
						attribute: DataSorceLabel,
						isAttribute,
						path,
						index,
						indexCompany
					};
				}
				
				fieldTracker.add(hasField);

				const existingPaths = scope.config.initialState.map(item => item.company);

				if (existingPaths.includes(transformedCompany)) {
					return scope.config.initialState.find(state => state.company === transformedCompany);
				}

				return {
					...scope.config.settingsState,
					company: transformedCompany,
					text: DataSorceLabel,
					field: transformedCompany.replace(/\./g, ""),
					attribute: DataSorceLabel,
					isAttribute,
					path,
					index,
					indexCompany
				};
			}).filter(item => item !== null);
			return mergeInitialState(rawList);
		}
		
		function splitTextField(obj, maxLength = 900) {
			const fieldName = 'Текст зауважень';

			if (obj[fieldName] && obj[fieldName].length > maxLength) {
				const text = obj[fieldName];
				const chunks = [];
				for (let i = 0; i < text.length; i += maxLength) {
					chunks.push(text.substr(i, maxLength));
				}
				const newObj = { ...obj };
				newObj[fieldName] = chunks[0];
				for (let i = 1; i < chunks.length; i++) {
					newObj[fieldName + (i + 1)] = chunks[i];
					//translateObj[fieldName + (i + 1)] = `Text${i + 1}`;
				}
				return newObj;
			}
			return { ...obj, 'Текст зауважень2': '  ', 'Текст зауважень3': '  ' };
		}
		
		function removeInfoFields(obj) {
			const newObj = {...obj};
			for (const key in newObj) {
				if (key.endsWith('_info')) {
					delete newObj[key];
				}
			}
			delete newObj['TextForAll'];
			return newObj;
		}
		
		function generateRandomString() {
			function getRandomInt(min, max) {
				return Math.floor(Math.random() * (max - min + 1)) + min;
			}
			const randomDigits = getRandomInt(0, 999).toString().padStart(3, '0');
			const randomLetter = String.fromCharCode(getRandomInt(65, 90));
			return randomDigits + randomLetter;
		}
		
		function pathTransform(path) {
			const parts = path.split('\\');
			return !path.includes('afcalc') 
					? `${path.split('|').pop().split('?')[0]}`
					: `${parts[parts.length - 1]}`.replace(/\?.*?(?=\*)/, '');
		}
		
		function pathTransformCompany(path) {
			const parts = path.split('\\');
			return !path.includes('afcalc') 
					? `${path.split('\\').pop().split('?')[0]}|${path.split('|').pop().split('?')[0]}`
					: `${parts[parts.length - 1]}`.replace(/\?.*?(?=\*)/, '');
		}
		
		function sanitizeFieldName(name) {
			return name.replace(/[^a-zA-Z0-9\u0400-\u04FF\u0100-\u017F\u00C0-\u00FF\u00A0\u0370-\u03FF]+/g, '');
		}
		
		function transformData(data) {
			const columns = [
				{ field: 'company', text: 'Елемент', size: '200px', sortable: true },
				{
					field: 'Time',
					text: 'Таймстемп',
					size: '150px',
					sortable: true,
					type: 'date',
					options: { format: 'DD.MM.YYYY HH:mm:ss' },
					render: function (record) {
						return `<div>${moment(record.Time, [
							"DD.MM.YYYY HH:mm:ss",
							"M/D/YYYY hh:mm:ss A"
						]).format("DD.MM.YYYY HH:mm")}</div>`;
					},
				},
			];

			const columnsSet = new Set();
			const records = [];
			const companyMap = new Map();

			// Обрабатываем строки данных и группируем по компании 
			data.Rows.forEach(row => {
				const [company, type] = row.Label.split('|');
				const cleanedType = type.replace(/\./g, "");
				columnsSet.add(cleanedType);

				// Если записи для компании ещё нет – создаём её
				if (!companyMap.has(company)) {
					companyMap.set(company, { company, Time: row.Time });
				} else {
				// Если такая компания уже есть, обновляем Time, если найдено более позднее время
				const record = companyMap.get(company);
				if (
					moment(row.Time, "DD.MM.YYYY HH:mm:ss").isAfter(
						moment(record.Time, "DD.MM.YYYY HH:mm:ss")
					)
					) {
						record.Time = row.Time;
					}
				}

				// Добавляем значение по типу
				const record = companyMap.get(company);
				record[cleanedType] = row.Value;
			});

			// Добавляем динамические колонки для каждого типа
			columnsSet.forEach(type => {
				columns.push({
				  field: type,
				  text: type,
				  size: '150px',
				  sortable: true,
				});
			});

			// Формируем массив записей для таблицы, заполняем отсутствующие поля пробелом
			let recid = 1;
			companyMap.forEach(record => {
				columnsSet.forEach(type => {
				  if (!(type in record)) {
					record[type] = ' ';
				  }
				});
				records.push({ recid: recid++, ...record });
			});

			// Сортируем записи по названию компании (в алфавитном порядке)
			records.sort((a, b) => a.company.localeCompare(b.company));

			return { columns, records };
		}

		
		function transformDataTimeSeries(data) {
			const columnsSet = new Set();
			const companyTimeMap = new Map();

			const columns = [
				{ field: 'Time', text: 'Таймстемп', size: scope.config.columnSizes ? scope.config.columnSizes['Time'] : '150px', sortable: true, hidden: scope.config.isTimeStampHidden,
					type: 'date', options: { format: 'DD.MM.YYYY HH:mm:ss' },
					render: function (record, extra) {
						var html = `<div>${moment(record.Time, ["DD.MM.YYYY HH:mm:ss", "M/D/YYYY hh:mm:ss A"]).format("DD.MM.YYYY HH:mm")}</div>`;
						return html;
					}
				},
			];
			
			data.forEach(entry => {
				const [company, type] = entry.Label.split('|');
				const deltePointsType = type.replace(/\./g, "");
				columnsSet.add(deltePointsType);

				if (!companyTimeMap.has(company)) {
					companyTimeMap.set(company, new Map());
				}
				const timeMap = companyTimeMap.get(company);

				entry.Values.forEach(valueObj => {
					const time = valueObj.Time.split(',')[0];
					if (!timeMap.has(time)) {
						timeMap.set(time, { company, Time: time });
					}
					const record = timeMap.get(time);
					
					
					record[deltePointsType] = valueObj.Value;
					columnsSet.add(deltePointsType);
				});
				
				columns.push({ 
					field: type, 
					text: type, 
					size: scope.config.columnSizes ? scope.config.columnSizes[type] : '150px',
					sortable: true,
				})
			});

			const records = [];
			let recid = 1;

			companyTimeMap.forEach((timeMap, company) => {
				const sortedTimes = Array.from(timeMap.keys()).sort((a, b) => moment(a, "DD.MM.YYYY HH:mm:ss").valueOf() - moment(b, "DD.MM.YYYY HH:mm:ss").valueOf());
				
				sortedTimes.forEach(time => {
					const record = timeMap.get(time);
					columnsSet.forEach(type => {
						if (!(type in record)) {
							record[type] = '  ';
						}
					});
					if (record['Статус'] === 'Видалена') {
						if (!record.w2ui) record.w2ui = {};
						record.w2ui.style = "display: none";
						return;
					}
					records.push({ recid: recid++, ...record });
				});
			});
			
			records.sort((a, b) => moment(b.Date, "DD.MM.YYYY HH:mm:ss").valueOf() - moment(a.Date, "DD.MM.YYYY HH:mm:ss").valueOf());

			return { columns, records };
		}
		
		function resizeFirstColumnsToFitContent() {
			grid.columns.forEach(function(column) {
				if(column.field === 'Time') {
					var maxContentWidth = getMaxContentWidth(grid, column.field);
					var maxHeaderWidth = getTextWidth(column.text);
					var newWidth = Math.max(maxContentWidth, maxHeaderWidth);
					column.size = newWidth + 'px';
				}
			});
			//grid.refresh();
		}
		
		function getMaxContentWidth(grid, field) {
			var maxWidth = 0;
			grid.records.forEach(function(record) {
				var content = record[field] ? record[field].toString() : '';
				var width = getTextWidth(content);
				if (width > maxWidth) {
					maxWidth = width;
				}
			});
			return maxWidth + 10;
		}

		function getTextWidth(text) {
			var canvas = document.createElement('canvas');
			var context = canvas.getContext('2d');
			context.font = '13px Arial';
			return context.measureText(text).width + 10;
		}
		
		function resizeColumnsEvenly() {
			var columnCount = grid.columns.length;
			var gridWidth = $(`#${symbolContainerDiv.id} .w2ui-grid-box`).width()-15;
			
			var totalFixedWidth = 0;
			var adjustableColumns = [];

			grid.columns.forEach(function(column) {
				if (column.hidden) return;
				if (column.field === 'Time') {
					totalFixedWidth += parseInt(column.size, 10);
				} else {
					adjustableColumns.push(column);
				}
			});

			var adjustableWidth = gridWidth - totalFixedWidth;
			var newWidth = Math.floor(adjustableWidth / adjustableColumns.length);

			adjustableColumns.forEach(function(column, index) {
				column.size = newWidth + 'px';
			});

			var remainingWidth = adjustableWidth - (newWidth * adjustableColumns.length);
			if (remainingWidth > 0 && adjustableColumns.length > 0) {
				var lastColumn = adjustableColumns[adjustableColumns.length - 1];
				lastColumn.size = (newWidth + remainingWidth) + 'px';
			}

			//grid.refresh();
		}
		
		function openPopup() {
			const messageId = "message_" + Math.random().toString(36).substr(2, 16);
			if (!w2ui.dublicatePopupId) {
				$().w2form({
					name: dublicatePopupId,
					style: 'border: 0px; background-color: transparent;',
					formHTML: 
						'<div class="w2ui-page page-0">'+
						'    <div class="w2ui-field">'+
						'        <div style="margin-left: 0;">'+
						'           <input name="TextForAll" type="text" maxlength="100" style="width: 250px"/>'+
						'        </div>'+
						'    </div>'+
						'</div>',
					fields: [
						{ field: 'TextForAll', type: 'text' },
					],
				});
			}
			
			w2ui[formId].message({
				body: `<div id="${messageId}" style="width: 100%; height: 100%;"></div>`,
				style: 'padding: 15px 0px 0px 0px',
				width: 500,
				height: 120,
				buttons: `<div class="w2ui-buttons">
						    <button id="dublicateBtn" class="w2ui-btn" name="dublicate">Продублювати</button>
						    <button id="cancelBtn" class="w2ui-btn" name="reset">Закрити</button>
						</div>`,
				onOpen: function (event) {
					event.onComplete = function () {
						$(`#w2ui-message0 #${messageId}`).w2render(dublicatePopupId);
					}
				}
			});
			setTimeout(() => {
				document.getElementById('dublicateBtn').onclick = function () {
					w2ui[formId].message();
					duplicateValue();
				};
				document.getElementById('cancelBtn').onclick = function () {
					w2ui[formId].message();
					return;
				};
			}, 0);
		}
		
	}

	PV.symbolCatalog.register(definition);

})(window.PIVisualization);
