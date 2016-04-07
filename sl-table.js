/**
 * Created by harrywang on 15/12/18.
 */

/* 本控件有以下参数：
 * parentDOM：父节点，用于控制控件应该加在哪里
 * _delegate：用于响应点击事件，点击后的处理由父容器完成
 * displayButtons：table上方的按钮，如“新建(new)”、“删除(delete)”
 * rowButtons：每一列右边显示的按钮，如“查看(detail)”、“关闭（close）”、“发货（delivery）”、“取消发货(cancelDelivery)"
 * showCheckBox: 每一列左边是否显示复选框
 * columns
 * dataSource：数据源
 */

var SLTable = SLComponent.extend({
    events: {
        'click .hll-table-top-button': 'handleTableTopBtnClick',
        'click .hll-table-row-button': 'handleTableRowBtnClick',
        'click .hll-table-row': 'handleTableRowClick',
        'click .hll-manager-table-checkbox': 'handleRowCheckboxClick',
        'click .hll-select-all-checkbox': 'handleSelectAllCheckboxClick'
    },

    initialize: function (options) {
        this.super('initialize');
        this.parentDOM = options.parentDOM;
        this._delegate = options._delegate;
        this.displayButtons = options.displayButtons;
        this.showCheckBox = options.showCheckBox;
        this.columns = options.columns;
        this.dataSource = options.dataSource;
        this.tableTitle = options.tableTitle;
        this.selectedId = options.selectedId;
        // 用tableType来标记该表格是上面的主表还是下面的subTable
        this.tableType = options.tableType;
        this.checkedIds = options.checkedIds;
        if (_.isUndefined(options.allowMultiSelected)) {
            this.allowMultiSelected = true;
        } else {
            this.allowMultiSelected = options.allowMultiSelected;
        }
        var self = this;
        self.parentDOM.empty();
        this.templatePromise = application.loadTemplate('control/table/sl-table').then(function (result) {
            self.template = _.template(result);
            self.el = self.template();
            self.setElement(self.el);
            self.render();
        });
    },

    render: function () {
        this.parentDOM && this.parentDOM.append(this.$el);
        this._initUI();
    },

    _initUI: function () {
        if (this.tableTitle.length > 0) {
            this.$('.table-title').text(this.tableTitle);
        } else {
            this.$('.table-title').remove();
        }

        // 添加table上方的按钮
        this._addTableTopButtons();
        // 为table添加header
        this._addTableHeader();
        // 逐行添加table的每一行
        this._addTableRows();
    },

    _addTableTopButtons: function () {
        var self = this;
        _.each(this.displayButtons, function (button) {
            if (button.id === 'new') {
                self.$('.display-buttons').append('<button id="' + button.id + '" class="btn hll-table-top-addBtn hll-table-top-button">' + button.name + '</button>');
            } else if (button.id === 'delete') {
                self.$('.display-buttons').append('<button id="' + button.id + '" class="btn hll-table-top-delBtn hll-table-top-button">' + button.name + '</button>');
            } else if (button.id === 'edit') {
                self.$('.display-buttons').append('<button id="' + button.id + '" class="btn hll-table-top-addBtn hll-table-top-button">' + button.name + '</button>');
            } else {
                self.$('.display-buttons').append('<button id="' + button.id + '" class="btn hll-table-top-addBtn hll-table-top-button">' + button.name + '</button>');
            }

        });

    },

    _addTableHeader: function () {
        var self = this;
        if (this.showCheckBox) {
            // 先判断是否需要加复选框
            var id = Math.random();
            this.$('tr').append($('<th><div class="hll-select-all-checkbox hll-manager-table-checkbox">' +
                '<input type="checkbox" id="' + id + 'CheckBox">' +
                '<label for="' + id + 'CheckBox"><p></p></label>' +
                '</div></th>'));
        }
        _.each(this.columns, function (column) {
            self.$('tr').append($("<th>" + column.label + "</th>"));
        })
        // 加最后一列
        if (self.dataSource.length > 0) {
            if (self.dataSource[0].rowButtons.length > 0) {
                this.$('tr').append($("<th>操作</th>"));
            }
        }

        if (self.tableType === application.delegate.configuration.TABLE_TYPE_SUB) {
            self.$('tr').addClass("hll-manager-first-row");
        }
    },

    _addTableRows: function () {
        var self = this;
        _.each(self.dataSource, function (model, index) {
            var tr;
            if (_.isUndefined(self.selectedId) || self.selectedId.length === 0 || self.selectedId === "undefined") {
                if (index === 0) {
                    tr = '<tr class="hll-table-row success';
                } else {
                    tr = '<tr class="hll-table-row';
                }
            } else {
                if (model.id === self.selectedId) {
                    tr = '<tr class="hll-table-row success';
                } else {
                    tr = '<tr class="hll-table-row';
                }
            }
            if (self.tableType === 1) {
                if (index % 2 === 0) {
                    tr += ' hll-manager-second-row';
                } else {
                    tr += ' hll-manager-first-row';
                }

            }
            tr += '" id="' + model.id + '">';
            if (self.showCheckBox) {
                if (_.isUndefined(model.shouldShowCheckbox)) {
                    tr += '<td><div class="hll-manager-table-checkbox">' +
                        '<input index=' + index + ' type="checkbox" id="' + model.id + '">' +
                        '<label status="unchecked" for="' + model.id + 'CheckBox"><p></p></label>' +
                        '</div></td>';
                } else {
                    if (model.shouldShowCheckbox) {
                        if (jQuery.inArray(model.id, self.checkedIds) !== -1) {
                            tr += '<td><div class="hll-manager-table-checkbox">' +
                                '<input index=' + index + ' type="checkbox" id="' + model.id + '">' +
                                '<label status="checked" style="margin: 0px; background-size: contain; background: url(&quot;assets/image/select_pre.png&quot;) no-repeat;" for="' + model.id + 'CheckBox"><p></p></label>' +
                                '</div></td>';
                        } else {
                            tr += '<td><div class="hll-manager-table-checkbox">' +
                                '<input index=' + index + ' type="checkbox" id="' + model.id + '">' +
                                '<label status="unchecked" for="' + model.id + 'CheckBox"><p></p></label>' +
                                '</div></td>';
                        }
                    } else {
                        tr += '<td></td>';
                    }
                }

            }
            // 构建每一列
            _.each(self.columns, function (column) {
                var value = model[column.field];
                if (value === null) {
                    value = '';
                }
                // 判断是否为图片，即value中是否包含http字样
                if (/http:/i.test(value)) {
                    tr += '<td>' +
                        '<img alt="" border="3" height="100" class="lazy-img" data-original="' +
                        value +
                        '"></td>';
                } else {
                    if (Object.prototype.toString.call(value) == '[object String]') {
                        if (value.length > 20 && self.columns.length > 4) {
                            tr += '<td><div class="hll-manager-ellipsis"><nobr>' + value + '</nobr></div></td>';
                        } else {
                            tr += '<td>' + value + '</td>';
                        }
                    } else {
                        tr += '<td>' + value + '</td>';
                    }
                }

            })
            // 添加最右边的操作按钮
            if (model.rowButtons.length > 0) {
                tr += '<td>';
                _.each(model.rowButtons, function (rowButton) {
                    tr += '<a id="' + rowButton.id + '" class="hll-manager-Btn hll-table-row-button" href="javascript:;">' + rowButton.name + '</a>';
                });
                tr += '</td>';
            }
            tr += '</tr>';
            self.$('.hll-manager-table').append(tr);
        });
        this.registerLazyImage(this.$el);
    },

    // 获取所有被选中行的id
    getAllSelectedRowId: function () {
        var self = this;
        var selectedIds = [];
        _.each(self.$('input:checkbox:checked'), function (inputElement) {
            if (!$(inputElement.parentElement).hasClass('hll-select-all-checkbox')) {
                var id = $(inputElement.parentElement.parentElement.parentElement).attr('id');
                selectedIds.push(id);
            }
        });
        return selectedIds;
    },

    // 获取所有被选中行的id
    getAllSelectedRowIndex: function () {
        var self = this;
        var selectedIndexes = [];
        _.each(self.$('input:checkbox:checked'), function (inputElement) {
            if (!$(inputElement.parentElement).hasClass('hll-select-all-checkbox')) {
                var index = $(inputElement).attr('index');
                selectedIndexes.push(index);
            }
        });
        return selectedIndexes;
    },

    // TABLE右上角按钮
    handleTableTopBtnClick: function (e) {
        e.preventDefault();
        e.stopPropagation();
        var parent = $(e.currentTarget.parentElement.parentElement.parentElement);
        this._delegate.didClickTableTopBtn(e.currentTarget.id, parent.attr('id'));
    },

    // 点击每行最右边的按钮的事件
    handleTableRowBtnClick: function (e) {
        e.preventDefault();
        e.stopPropagation();
        var trElement = $(e.currentTarget.parentElement.parentElement);
        var parent = $(e.currentTarget.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement);
        /*
         * 下面的didClickTableRowBtn有三个参数
         * didClickTableRowBtn(buttonId, parentId, objectId)
         * buttonId: 表示点击的button类型，edit或delete等
         * parentId：标识点击的是哪个table， table或subTable
         * objectId：表示点击这一行的model的id
         */
        var rowIndex = $(trElement).index();
        this._delegate.didClickTableRowBtn(e.currentTarget.id, parent.attr('id'), trElement.attr('id'), rowIndex);
    },

    // 点击一整行之后的事件
    handleTableRowClick: function (e) {
        e.preventDefault();
        e.stopPropagation();
        var parent = $(e.currentTarget.parentElement.parentElement.parentElement.parentElement);
        this.$('tr').removeClass('success');
        $(e.currentTarget).addClass('success');
        this._delegate.didClickTableRowOfObjectId(e.currentTarget.id, parent.attr('id'));
    },

    // 点击全选checkbox的事件
    handleSelectAllCheckboxClick: function (e) {
        e.preventDefault();
        e.stopPropagation();
        var self = this;
        // 先判断判断是否为单选模式
        if (!self.allowMultiSelected) {
            // 如果是单选模式，什么都不做
            return;
        }
        // 然后修改自身的状态
        if (e.currentTarget.childNodes[0].checked) {
            this._setCheckBoxUnchecked(e.currentTarget);
        } else {
            this._setCheckBoxChecked(e.currentTarget);
        }
        // 再修改每一行的checkbox的状态
        if (e.currentTarget.childNodes[0].checked) {
            _.each(self.$('.hll-manager-table-checkbox'), function (div) {
                self._setCheckBoxChecked(div);
            });
        } else {
            _.each(self.$('.hll-manager-table-checkbox'), function (div) {
                self._setCheckBoxUnchecked(div);
            });
        }
    },

    // 点击每行最左边的checkbox的事件
    handleRowCheckboxClick: function (e) {
        e.preventDefault();
        e.stopPropagation();
        var self = this;
        // 如果点的是全选，什么都不做
        if ($(e.currentTarget).hasClass('hll-select-all-checkbox')) {
            return;
        }
        // 接下来判断是否为单选模式
        if (!self.allowMultiSelected) {
            // 如果是单选模式，先将所有checkbox设为未选中状态
            _.each(self.$('.hll-manager-table-checkbox'), function (div) {
                self._setCheckBoxUnchecked(div);
            });
        }
        if ($(e.currentTarget.childNodes[1]).attr('status') === 'checked') {
            this._setCheckBoxUnchecked(e.currentTarget);
            this._delegate.didUncheckRowCheckbox($(e.currentTarget.childNodes[0]).attr('id'), this.tableType);
        } else {
            this._setCheckBoxChecked(e.currentTarget);
            this._delegate.didCheckRowCheckbox($(e.currentTarget.childNodes[0]).attr('id'), this.tableType);
        }
    },

    _setCheckBoxChecked: function (div) {
        div.childNodes[0].checked = true;
        $(div.childNodes[1]).css("background", "url('assets/image/select_pre.png') no-repeat");
        $(div.childNodes[1]).css("background-size", "contain");
        $(div.childNodes[1]).css("margin", "0");
        $(div.childNodes[1]).attr("status", 'checked');
    },

    _setCheckBoxUnchecked: function (div) {
        div.childNodes[0].checked = false;
        $(div.childNodes[1]).css("background", "url('assets/image/select.png') no-repeat");
        $(div.childNodes[1]).css("background-size", "contain");
        $(div.childNodes[1]).css("margin", "0");
        $(div.childNodes[1]).attr("status", 'unchecked');
    }
});