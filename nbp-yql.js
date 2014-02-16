(function () {
    var URL = "http://www.nbp.pl/kursy/xml",
        LIMIT = 5000,
        YQL_URL = "https://query.yahooapis.com/v1/public/yql";

    function yql(query) {
        return $.ajax(YQL_URL, { data: { format: "json", q: query } }).then(function (result) {
            if (!result.hasOwnProperty("query") ||
                !result.query.hasOwnProperty("results") ||
                result.query.results === null) {
                return $.Deferred().reject(result);
            } else {
                return result;
            }
        });
    };

    // YQL doesn't play nicely with sets containing 5000+ records - filtering manually
    function dir(options) {
        options || (options = {});
        options.offset || (options.offset = 0);
        options.size || (options.size = LIMIT);
        options.results || (options.results = []);

        return yql('SELECT * FROM csv(' + options.offset + ', ' + options.size + ') WHERE url="' + URL + '/dir.txt"').then(function (result) {
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
            return yql('SELECT * FROM xml WHERE url="' + URL + '/' + options + '.xml"').then(function (result) {
                return result.query.results.tabela_kursow;
            });
        } else {
            var type = options.type || "A",
                date = options.date || new Date();

            type = type.toLowerCase();

            if (typeof date !== "string") {
                date = date.toISOString().substr(0, 10).replace(/[^0-9]/g, "");
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
                    return $.Deferred().reject(new Error("Code not found"));
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
