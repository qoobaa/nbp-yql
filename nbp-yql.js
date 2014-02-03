(function () {
    var URL = "http://www.nbp.pl/kursy/xml",
        LIMIT = 5000,
        YQL_URL = "https://query.yahooapis.com/v1/public/yql";

    function ajax(q) {
        return $.ajax(YQL_URL, { data: { format: "json", q: q } }).then(function (result) {
            if (!result.hasOwnProperty("query") ||
                !result.query.hasOwnProperty("results") ||
                result.query.results === null) {
                return $.Deferred().reject(result);
            } else {
                return result;
            }
        });
    };

    function formatDate(date) {
        var day, month, year;

        day = date.getDate().toString();

        if (day.length === 1) {
            day = "0" + day;
        }

        month = (date.getMonth() + 1).toString();

        if (month.length === 1) {
            month = "0" + month;
        }

        year = date.getFullYear().toString().substr(2, 2);

        return year + month + day;
    };

    // YQL doesn't play nicely with sets containing 5000+ records - filtering manually
    function dir(options) {
        options || (options = {});
        options.offset || (options.offset = 0);
        options.size || (options.size = LIMIT);
        options.results || (options.results = []);

        return ajax('select * from csv(' + options.offset + ', ' + options.size + ') where url="' + URL + '/dir.txt"').then(function (result) {
            result.query.results.row.forEach(function (row) {
                options.results.push(row.col0);
            });

            if (result.query.count === options.size) {
                options.offset += options.size;
                return dir(options);
            } else {
                return options.results;
            }
        });
    };

    function daily(options) {
        options || (options = "LastA");

        if (typeof options === "string") {
            return ajax('select * from xml where url="' + URL + '/' + options + '.xml"').then(function (result) {
                return result.query.results.tabela_kursow;
            });
        } else {
            var type = options.type || "A",
                date = options.date || new Date();

            type = type.toLowerCase();

            if (typeof date !== "string") {
                date = formatDate(date);
            }

            return dir().then(function (codes) {
                var result = "";

                codes.forEach(function (code) {
                    if (code[0] === type && code.substr(5, 6) <= date && code.substr(5, 6) > result.substr(5, 6)) {
                        result = code;
                    }
                });

                if (result) {
                    return daily(result);
                } else {
                    return $.Deferred().reject("code not found");
                }
            });
        }
    }

    if (typeof exports !== "undefined") {
        if (typeof module !== "undefined" && module.exports) {
            exports = module.exports = daily;
        }
        exports.nbpDaily = daily;
    } else {
        this.nbpDaily = daily;
    }
}).call(this);