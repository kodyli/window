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

function buildWidthesFilter() {
    var widthesHtml = $('#widthes').html("选择宽度: ");
    WIDTHES.forEach(function (width, index) {
        var label = $(`<label for="width-${width}">${width}</label>`);
        var input = $(`<input type="checkbox" checked id="width-${width}" value="${width}">`).click(function (a, b) {
            var index = WIDTHES.indexOf(width);
            if (index > -1) {
                WIDTHES.splice(index, 1);
            } else {
                WIDTHES.push(width);
            }
            WIDTHES.sort(function (a, b) {
                return a - b;
            });
            createReports();
        });
        label.append(input);
        widthesHtml.append(label);
    });

    $("#widthes input").checkboxradio({
        icon: false
    });
}

function buildHeightsFilter() {
    var heightsHtml = $('#heights').html("选择高度: ");
    HEIGHTS.forEach(function (height, index) {
        var label = $(`<label for="height-${height}">${height}</label>`);
        var input = $(`<input type="checkbox" checked id="height-${height}" value="${height}">`).click(function (a, b) {
            var index = HEIGHTS.indexOf(height);
            if (index > -1) {
                HEIGHTS.splice(index, 1);
            } else {
                HEIGHTS.push(height);
            }
            HEIGHTS.sort(function (a, b) {
                return a - b;
            });
            createReports();
        });
        label.append(input);
        heightsHtml.append(label);
    });

    $("#heights input").checkboxradio({
        icon: false
    });
}

function buildDirectionsFilter() {
    var directionsHtml = $("#directions").html("选择开向: ");
    DIRECTIONS.forEach(function (direction, index) {
        var label = $(`<label for="direction-${direction}">${direction}</label>`);
        var input = $(`<input type="checkbox" ${index==0?'checked ':' '} id="direction-${direction}" value="${direction}">`).click(function (a, b) {
            var index = DIRECTIONS.indexOf(direction);
            if (index > -1) {
                DIRECTIONS.splice(index, 1);
            } else {
                DIRECTIONS.push(direction);
            }
            DIRECTIONS.sort(function (a, b) {
                return a.localeCompare(b);
            });
            createReports();
        });
        label.append(input);
        directionsHtml.append(label);
    });
    DIRECTIONS.splice(1);
    $("#directions input").checkboxradio({
        icon: false
    });
}

function buildCodesFilter() {
    var codesHtml = $("#codes").html("选择编码: ");
    CODES.forEach(function (code, index) {
        var label = $(`<label for="code-${code}">${code}</label>`);
        var input = $(`<input type="checkbox" ${index==0?'checked ':' '} id="code-${code}" value="${code}">`).click(function () {
            var index = CODES.indexOf(code);
            if (index > -1) {
                CODES.splice(index, 1);
            } else {
                CODES.push(code);
            }
            CODES.sort(function (a, b) {
                return a.localeCompare(b);
            });
            createReports();
        });
        label.append(input);
        codesHtml.append(label);
    });
    CODES.splice(1);
    $("#codes input").checkboxradio({
        icon: false
    });
}

function buildFloorsFilter() {
    var floorsHtml = $('#floors').html("选择楼层: ");
    FLOORS.forEach(function (floor) {
        var label = $(`<label for="floor-${floor}">${floor}F</label>`);
        var input = $(`<input type="checkbox" checked id="floor-${floor}" value="${floor}">`).click(function (a, b) {
            var index = FLOORS.indexOf(floor);
            if (index > -1) {
                FLOORS.splice(index, 1);
            } else {
                FLOORS.push(floor);
            }
            FLOORS.sort(function (a, b) {
                return a - b;
            });
            createReports();
        });
        label.append(input);
        floorsHtml.append(label);
    });
    $("#floors input").checkboxradio({
        icon: false
    });
}

function buildTypesFilter() {
    var typesHtml = $("#types").html("选择窗型: ");
    TYPES.forEach(function (type, index) {
        var label = $(`<label for="type-${type}">${type||'全部'}</label>`);
        var input = $(`<input type="checkbox" ${index==0?'checked ':' '} id="type-${type}" value="${type}">`).click(function () {
            var index = TYPES.indexOf(type);
            if (index > -1) {
                TYPES.splice(index, 1);
            } else {
                TYPES.push(type);
            }
            TYPES.sort(function (a, b) {
                return a.localeCompare(b);
            });
            createReports();
        });
        label.append(input);
        typesHtml.append(label);
    });
    TYPES.splice(1);
    $("#types input").checkboxradio({
        icon: false
    });
}

function buildFilters() {
    buildWidthesFilter();
    buildHeightsFilter();
    buildDirectionsFilter();
    buildCodesFilter();
    buildFloorsFilter();
    buildTypesFilter();
}
$(function () {
    $("#tabs").tabs({
        beforeActivate: function (event, ui) {
            if (ui.newPanel.attr('id') == 'tabs-detail') {
                collectData();
                buildFilters();
                createReports();
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
    $('#reset-filter').click(function () {
        collectData();
        buildFilters();
        createReports();
    });
});
