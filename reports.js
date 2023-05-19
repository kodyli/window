function Window(data) {
    this.code = data.code;
    this.floor = data.floor;
    this.height = data.height;
    this.width = data.width;
    this.direction = data.direction;
    this.waterproof = data.waterproof ? true : false;
    this.note = data.note || '';
    this.type = data.type || '';
}

Window.prototype = Object.create({
    constructor: Window,
    compares: function (window) {
        var result = this.comparesByWidth(window);
        if (result != 0) {
            return result;
        }
        result = this.comparesByHeight(window);
        if (result != 0) {
            return result;
        }
        result = this.comparesByFloor(window);
        if (result != 0) {
            return result;
        }
        result = this.comparesByCode(window);
        if (result != 0) {
            return result;
        }
        result = this.comparesByDirection(window);
        if (result != 0) {
            return result;
        }
        result = this.comparesByNote(window);
        if (result != 0) {
            return result;
        }
        return 0;
    },
    equals: function (window) {
        return (window instanceof Window) && this.width == window.width && this.height == window.height && this.direction == window.direction && this.waterproof == window.waterproof;
    },
    comparesByWidth: function (window) {
        return this.width - window.width;
    },
    comparesByHeight: function (window) {
        return this.height - window.height;
    },
    comparesByFloor: function (window) {
        return this.floor - window.floor;
    },
    comparesByCode: function (window) {
        return Window.comparesByCode(this.code, window.code);
    },
    comparesByDirection: function (window) {
        return this.direction.localeCompare(window.direction);
    },
    comparesByNote: function (window) {
        return this.note.localeCompare(window.note);
    },
    compareByType: function(window){
        return this.type.localeCompare(window.type);
    }
});

Window.comparesByCode = function (code1, code2) {
    if (Window.isNumberCode(code1) && Window.isNumberCode(code2)) {
        return parseInt(code1) - parseInt(code2);
    } else if (Window.isNumberCode(code1) && !Window.isNumberCode(code2)) {
        return -1;
    } else if (!Window.isNumberCode(code1) && Window.isNumberCode(code2)) {
        return 1;
    } else {
        return code1.localeCompare(code2);
    }
};
Window.isNumberCode = function (code) {
    var isNumber = true;
    for (var i = 0, l = code.length; i < l && isNumber; i++) {
        var ch = code.charAt(i);
        isNumber = '0' <= ch && ch <= '9';
    }
    return isNumber;
};

function AReport(windows) {
    this._windows = windows;
    this._sort();
}
AReport.prototype = Object.create({
    constructor: AReport,
    _sort: function () {
        throw new TypeError('Abstract method called.');
    },
    _toRow: function (window, index) {
        throw new TypeError('Abstract method called.');
    },
    _toHead: function () {
        throw new TypeError('Abstract method called.');
    },
    _toFoot: function () {
        throw new TypeError('Abstract method called.');
    },
    toHtml: function () {
        var tbody = $('<tbody></tbody>');
        for (var i = this._windows.length - 1; i >= 0; i--) {
            var row = this._toRow(this._windows[i], i);
            if (row) {
                tbody.prepend(row);
            }
        }
        var table = $('<table></table>');
        table.append(`<thead>${this._toHead()}</thead>`);
        table.append(tbody);
        var foot = this._toFoot();
        if (foot) {
            table.append(`<tfoot>${foot}</tfoot>`);
        }
        return table;
    },
    isEmpty: function () {
        return this._windows.length <= 0;
    }
});

function Excel(windows) {
    if (!(this instanceof Excel)) {
        return new Excel(windows);
    }
    AReport.call(this, windows);
}
Excel.prototype = Object.create(AReport.prototype);
Excel.prototype.constructor = Excel;
Excel.prototype._sort = function () {
    this._windows.sort(function (w1, w2) {
        var result = w1.comparesByFloor(w2);
        if (result != 0) {
            return result;
        }
        result = w1.comparesByCode(w2);
        if (result != 0) {
            return result;
        }
        result = w1.comparesByWidth(w2);
        if (result != 0) {
            return result;
        }
        result = w1.comparesByHeight(w2);
        if (result != 0) {
            return result;
        }
        return 0;
    });
};
Excel.prototype._toHead = function () {
    return '<tr><th>#</th><th>楼层</th><th>编号</th><th>宽</th><th>高</th><th>开向</th><th>窗型</th><th>防水</th><th>备注</th></tr>';
};
Excel.prototype._toRow = function (window, i) {
    return $(`<tr class='hover'><td>${i+1}</td><td>${window.floor}F</td><td>${window.code}</td><td>${window.width}</td><td>${window.height}</td><td>${window.direction}</td><td>${window.type}</td><td>${window.waterproof?'是':''}</td><td>${window.note}</td></tr>`);
};
Excel.prototype._toFoot = function () {
    return null;
};

function ADirectionSummarizeReport(windows, widthes, heights, directions, codes, floors, types) {
    var filteredWindows = windows.filter(function (window) {
        return widthes.indexOf(window.width) > -1 && heights.indexOf(window.height) > -1 && directions.indexOf(window.direction) > -1 && codes.indexOf(window.code) > -1 && types.indexOf(window.type) > -1 && floors.indexOf(window.floor) > -1;
    });
    AReport.call(this, filteredWindows);
    this._counts = [0, 0];
}
ADirectionSummarizeReport.prototype = Object.create(AReport.prototype);
ADirectionSummarizeReport.prototype.constructor = ADirectionSummarizeReport;
ADirectionSummarizeReport.prototype._toHead = function () {
    return `<tr><th>${this._getType().head}</th><th>开向</th><th>个数</th></tr>`;
};
ADirectionSummarizeReport.prototype._toRow = function (current, i) {
    var type = this._getType();
    var next = i > 0 ? this._windows[i - 1] : null;
    if (!next || current[type.name] != next[type.name]) {
        var rowspan = this._counts[0] + 1;
        var count = this._counts[1] + 1;
        this._counts = [0, 0];
        return $(`<tr><td rowspan = "${rowspan}">${current[type.name]}</td><td>${current.direction}</td><td>${count}</td></tr>`);
    } else {
        if (current.direction != next.direction) {
            this._counts[0] = this._counts[0] + 1;
            var count = this._counts[1] + 1;
            this._counts[1] = 0;
            return $(`<tr><td>${current.direction}</td><td>${count}</td></tr>`);
        } else {
            this._counts[1] = this._counts[1] + 1;
            return null;
        }
    }
};
ADirectionSummarizeReport.prototype._toFoot = function () {
    return `<tr><td colspan="2">合计</td><td>${this._windows.length}</td></tr>`;
}
ADirectionSummarizeReport.prototype._getType = function () {
    throw new TypeError('Abstract method called.');
};
ADirectionSummarizeReport.HEIGHT = {
    name: 'height',
    head: '高'
};
ADirectionSummarizeReport.WIDTH = {
    name: 'width',
    head: '宽'
};

function DirectionWidthReport(windows, widthes, heights, directions, codes, floors, types) {
    if (!(this instanceof DirectionWidthReport)) {
        return new DirectionWidthReport(windows, widthes, heights, directions, codes, floors, types);
    }
    ADirectionSummarizeReport.call(this, windows, widthes, heights, directions, codes, floors, types);
}
DirectionWidthReport.prototype = Object.create(ADirectionSummarizeReport.prototype);
DirectionWidthReport.prototype.constructor = DirectionWidthReport;
DirectionWidthReport.prototype._sort = function () {
    this._windows.sort(function (w1, w2) {
        var result = w1.comparesByWidth(w2);
        if (result != 0) {
            return result;
        }

        result = w1.comparesByDirection(w2);
        if (result != 0) {
            return result;
        }
        return 0;
    });
};
DirectionWidthReport.prototype._getType = function () {
    return ADirectionSummarizeReport.WIDTH;
};

function DirectionHeightReport(windows, widthes, heights, directions, codes, floors, types) {
    if (!(this instanceof DirectionHeightReport)) {
        return new DirectionHeightReport(windows, widthes, heights, directions, codes, floors, types);
    }
    ADirectionSummarizeReport.call(this, windows, widthes, heights, directions, codes, floors, types);
}
DirectionHeightReport.prototype = Object.create(ADirectionSummarizeReport.prototype);
DirectionHeightReport.prototype.constructor = DirectionHeightReport;
DirectionHeightReport.prototype._sort = function () {
    this._windows.sort(function (w1, w2) {
        var result = w1.comparesByHeight(w2);
        if (result != 0) {
            return result;
        }

        result = w1.comparesByDirection(w2);
        if (result != 0) {
            return result;
        }
        return 0;
    });
};
DirectionHeightReport.prototype._getType = function () {
    return ADirectionSummarizeReport.HEIGHT;
};

function DirectionReport(windows, widthes, heights, direction, codes, floors, types) {
    if (!(this instanceof DirectionReport)) {
        return new DirectionReport(windows, widthes, heights, directions, codes, floors, types);
    }
    var filteredWindows = windows.filter(function (window) {
        return widthes.indexOf(window.width) > -1 && heights.indexOf(window.height) > -1 && window.direction == direction && codes.indexOf(window.code) > -1 && types.indexOf(window.type) > -1 && floors.indexOf(window.floor) > -1;
    });
    AReport.call(this, filteredWindows);
    this._counts = [0, 0];
}
DirectionReport.prototype = Object.create(AReport.prototype);
DirectionReport.prototype.constructor = DirectionReport;
DirectionReport.prototype._sort = function () {
    this._windows.sort(function (w1, w2) {
        return w1.compares(w2);
    });
};
DirectionReport.prototype._toHead = function () {
    return '<tr><th>汇总</th><th>宽</th><th>高</th><th>个数</th><th>楼层</th><th>编号</th><th>备注</th><th>开向</th></tr>';
};
DirectionReport.prototype._toRow = function (current, i) {
    var next = i > 0 ? this._windows[i - 1] : null;
    if (!next || current.width != next.width) {
        var widthCount = this._counts[0] + 1;
        var heightCount = this._counts[1] + 1;
        this._counts = [0, 0];
        if (!next) {
            return $(`<tr><td rowspan = "${widthCount}">${widthCount}</td><td rowspan = "${widthCount}">${current.width}</td><td rowspan = "${heightCount}">${current.height}</td><td rowspan = "${heightCount}">${heightCount}</td><td>${current.floor}F</td><td>${current.code}</td><td>${current.waterproof?"防水":""}${current.note?", "+current.note:""}</td><td rowspan = "${this._windows.length}">${current.direction}</td></tr>`);
        }
        return $(`<tr><td rowspan = "${widthCount}">${widthCount}</td><td rowspan = "${widthCount}">${current.width}</td><td rowspan = "${heightCount}">${current.height}</td><td rowspan = "${heightCount}">${heightCount}</td><td>${current.floor}F</td><td>${current.code}</td><td>${current.waterproof?"防水":""}${current.note?", "+current.note:""}</td></tr>`);
    } else {
        if (current.height != next.height) {
            this._counts[0] = this._counts[0] + 1;
            var heightCount = this._counts[1] + 1;
            this._counts[1] = 0;
            return $(`<tr><td rowspan = "${heightCount}">${current.height}</td><td rowspan = "${heightCount}">${heightCount}</td><td>${current.floor}F</td><td>${current.code}</td><td>${current.waterproof?"防水":""}${current.note?", "+current.note:""}</td></tr>`);
        } else {
            this._counts[0] = this._counts[0] + 1;
            this._counts[1] = this._counts[1] + 1;
            return $(`<tr><td>${current.floor}F</td><td>${current.code}</td><td>${current.waterproof?"防水":""}${current.note?", "+current.note:""}</td></tr>`);
        }
    }
};
DirectionReport.prototype._toFoot = function () {
    return `<tr><td>${this._windows.length}</td><td colspan="7">合计</td>`;
};

function CuttingReport(windows, widthes, heights, direction, codes, floors, types) {
    if (!(this instanceof CuttingReport)) {
        return new CuttingReport(windows, widthes, heights, directions, codes, floors, types);
    }
    var filteredWindows = windows.filter(function (window) {
        return widthes.indexOf(window.width) > -1 && heights.indexOf(window.height) > -1 && direction ===window.direction && codes.indexOf(window.code) > -1 && types.indexOf(window.type) > -1 && floors.indexOf(window.floor) > -1;
    });
    AReport.call(this, filteredWindows);
    this._count = 0;
    this._floorCode = '';
}
CuttingReport.prototype = Object.create(AReport.prototype);
CuttingReport.prototype.constructor = CuttingReport;
CuttingReport.prototype._sort = function () {
    this._windows.sort(function (w1, w2) {
        var result = w1.comparesByWidth(w2);
        if (result != 0) {
            return result;
        }

        result = w1.comparesByHeight(w2);
        if (result != 0) {
            return result;
        }
        result = w1.comparesByFloor(w2);
        if (result != 0) {
            return result;
        }
        result = w1.comparesByCode(w2);
        if (result != 0) {
            return result;
        }
        return 0;
    });
};
CuttingReport.prototype._toHead = function () {
    return '<tr><th>个数</th><th>宽</th><th>高</th><th>楼层/编号</th></tr>';
};
CuttingReport.prototype._toRow = function (current, i) {
    var next = i > 0 ? this._windows[i - 1] : null;
    var count = this._count + 1;
    var floorCode = `${current.floor}-${current.code}` + (this._floorCode ? '/' + this._floorCode : this._floorCode);
    if (!next || current.width != next.width || current.height != next.height) {
        this._count = 0;
        this._floorCode = '';
        return $(`<tr><td>${count}</td><td>${current.width*10}</td><td>${current.height*10}</td><td>${floorCode}</td></tr>`);
    } else {
        this._count = count;
        this._floorCode = floorCode;
        return null;
    }
};
CuttingReport.prototype._toFoot = function () {
    return `<tr><td>${this._windows.length}</td><td colspan="3">合计</td>`;
};
