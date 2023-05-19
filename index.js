var WIDTHES = [],
    HEIGHTS = [],
    DIRECTIONS = [],
    CODES = [],
    FLOORS = [],
    TYPES = [],
    TOTAL_ROWS = [];

function collectData(rows) {
    WIDTHES = [];
    HEIGHTS = [];
    DIRECTIONS = [];
    CODES = [];
    FLOORS = [];
    TYPES = [];

    TOTAL_ROWS.forEach(function (window) {
        if (WIDTHES.indexOf(window.width) < 0) {
            WIDTHES.push(window.width);
        }
        if (HEIGHTS.indexOf(window.height) < 0) {
            HEIGHTS.push(window.height);
        }
        if (DIRECTIONS.indexOf(window.direction) < 0) {
            DIRECTIONS.push(window.direction);
        }
        if (CODES.indexOf(window.code) < 0) {
            CODES.push(window.code);
        }
        if (FLOORS.indexOf(window.floor) < 0) {
            FLOORS.push(window.floor);
        }
        if (TYPES.indexOf(window.type) < 0) {
            TYPES.push(window.type);
        }
    });
    WIDTHES.sort(function (a, b) {
        return a - b;
    });
    HEIGHTS.sort(function (a, b) {
        return a - b;
    });
    DIRECTIONS.sort(function (a, b) {
        return a.localeCompare(b);
    });
    CODES.sort(function (a, b) {
        return Window.comparesByCode(a, b);
    });
    FLOORS.sort(function (a, b) {
        return a - b;
    });
    TYPES.sort(function (a, b) {
        return a.localeCompare(b);
    });
}

function createReports() {
    var widthAllReport = new DirectionWidthReport(TOTAL_ROWS, WIDTHES, HEIGHTS, DIRECTIONS, CODES, FLOORS, TYPES);
    $('#width-all-report').html(widthAllReport.toHtml());
    var heightAllReport = new DirectionHeightReport(TOTAL_ROWS, WIDTHES, HEIGHTS, DIRECTIONS, CODES, FLOORS, TYPES);
    $('#height-all-report').html(heightAllReport.toHtml());

    var index = 0;
    var rows = [];
    var row = $('<div class="row"></div>');
    DIRECTIONS.forEach(function (direction) {
        if (index > 0 && index % 3 == 0) {
            rows.push(row);
            row = $('<div class="row"></div>');
        }
        var detailReport = new DirectionReport(TOTAL_ROWS, WIDTHES, HEIGHTS, direction, CODES, FLOORS, TYPES);
        if (!detailReport.isEmpty()) {
            var col = $("<div class='col-lg-4 col-md-4 col-sm-4' style='margin-bottom:10px;'></div>").append(detailReport.toHtml());
            row.append(col);
            index++;
        }
    });
    rows.push(row);
    $('#width-direction-report').html(rows);

    index = 0;
    rows = [];
    row = $('<div class="row"></div>');

    DIRECTIONS.forEach(function (direction) {
        if (index > 0 && index % 3 == 0) {
            rows.push(row);
            row = $('<div class="row"></div>');
        }
        var cuttingReport = new CuttingReport(TOTAL_ROWS, WIDTHES, HEIGHTS, direction, CODES, FLOORS, TYPES);
        if (!cuttingReport.isEmpty()) {
            var col = $("<div class='col-lg-4 col-md-4 col-sm-4' style='margin-bottom:10px;'></div>");
            col.append(`<h4>开向：${direction}</h4>`);
            col.append(cuttingReport.toHtml());
            row.append(col);
            index++;
        }
    });
    rows.push(row);
    $('#cutting-report').html(rows);
}

function buildFilter(id, label, filters, sort, selectAll) {
    filters = filters || [];
    sort = sort || function () {
        return 1;
    };
    selectAll = !!selectAll;
    if(filters.length<=1){
        return;
    }
    var html = $(`#${id}`).html(`${label}: `);
    filters.forEach(function (filter, index) {
        var label = $(`<label for="${id}-${filter}">${filter||'其他'}</label>`);
        var input = $(`<input type="checkbox" ${selectAll||index==0?'checked':' '} id="${id}-${filter}" value="${filter}">`).click(function (a, b) {
            var index = filters.indexOf(filter);
            if (index > -1) {
                filters.splice(index, 1);
            } else {
                filters.push(filter);
            }
            filters.sort(sort);
            createReports();
        });
        label.append(input);
        html.append(label);
    });
    if (!selectAll) {
        filters.splice(1);
    }
    $(`#${id} input`).checkboxradio({
        icon: false
    });
}

function buildWidthesFilter() {
    buildFilter('widthes', '选择宽度', WIDTHES, function (a, b) {
        return a - b;
    }, true);
}

function buildHeightsFilter() {
    buildFilter('heights', '选择高度', HEIGHTS, function (a, b) {
        return a - b;
    }, true);
}


function buildCodesFilter() {
    buildFilter('codes', '选择编码', CODES, function (a, b) {
        return a.localeCompare(b);
    }, true);
}

function buildFloorsFilter() {
    buildFilter('floors', '选择楼层', FLOORS, function (a, b) {
        return a - b;
    }, true);
}

function buildDirectionsFilter() {
    buildFilter('directions', '选择开向', DIRECTIONS, function (a, b) {
        return a.localeCompare(b);
    }, false);
}

function buildTypesFilter() {
    buildFilter('types', '选择窗型', TYPES, function (a, b) {
        return a.localeCompare(b);
    }, false);
}

function buildFilters() {
    buildWidthesFilter();
    buildHeightsFilter();
    buildDirectionsFilter();
    buildCodesFilter();
    buildFloorsFilter();
    buildTypesFilter();
}

function refresh() {
    collectData();
    buildFilters();
    createReports();
}
$(function () {
    $("#tabs").tabs({
        beforeActivate: function (event, ui) {
            if (ui.newPanel.attr('id') == 'tabs-detail') {
                refresh();
            }
        }
    });

    const input = document.getElementById('file');
    const schema = {
        '楼层': {
            prop: 'floor',
            type: Number,
            required: true
        },
        '编号': {
            prop: 'code',
            type: String,
            required: true
        },
        '宽': {
            prop: 'width',
            type: Number,
            required: true
        },
        '高': {
            prop: 'height',
            type: Number,
            required: true
        },
        '开向': {
            prop: 'direction',
            type: String,
            required: true
        },
        '防水': {
            prop: 'waterproof',
            type: String
        },
        '窗型': {
            prop: 'type',
            type: String
        },
        '备注': {
            prop: 'note',
            type: String
        }
    };
    input.addEventListener('change', function () {
        TOTAL_ROWS = [];
        readXlsxFile(input.files[0], {
            schema
        }).then(({
            rows,
            errors
        }) => {
            rows = rows || [];
            if (errors.length > 0) {
                alert("数据有错，请核对数据！");
            } else {
                var windows = rows.map(function (row) {
                    return new Window(row);
                });
                TOTAL_ROWS = TOTAL_ROWS.concat(windows);
                var source = new Excel(windows);
                $('#report-source').html(source.toHtml());
            }
        });
    });

    var promise;
    $('#print-detail-reports').click(function () {
        if (!promise) {
            var ele = document.getElementById('reports');
            promise = html2canvas(ele, {
                backgroundColor: null
            }).then(function (canvas) {
                printJS(canvas.toDataURL("image/png"), 'image');
                promise = null;
            }).catch(function () {
                promise = null;
            });
        }
    });
    $('#reset-filter').click(refresh);
});
