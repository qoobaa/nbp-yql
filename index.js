var NBP = {
    URL: "http://www.nbp.pl/kursy/xml",
    LIMIT: 5000,
    YQL_URL: "//query.yahooapis.com/v1/public/yql",

    ajax: function (q, options) {
        return $.ajax(NBP.YQL_URL, {
            data: $.extend({ format: "json", q: q }, options)
        }).then(function (result) {
            if (!result.hasOwnProperty("query") ||
                !result.query.hasOwnProperty("results") ||
                result.query.results === null) {
                return $.Deferred().reject(result);
            } else {
                return result;
            }
        });
    },

    formatDate: function (date) {
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
    },

    // YQL doesn't play nicely with sets containing 5000+ records - filtering manually
    dir: function (deferred) {
        if (!deferred) {
            deferred = $.Deferred();
            deferred.offset = 0;
            deferred.size = NBP.LIMIT;
            deferred.results = [];
        }

        NBP.ajax('select * from csv(' + deferred.offset + ', ' + deferred.size + ') where url="' + NBP.URL + '/dir.txt"')
            .done(function (result) {
                result.query.results.row.forEach(function (row) {
                    deferred.results.push(row.col0);
                });

                if (result.query.count === deferred.size) {
                    deferred.offset += deferred.size;
                    return NBP.dir(deferred);
                } else {
                    return deferred.resolve(deferred.results);
                }
            })
            .fail(deferred.reject);

        return deferred.promise();
    },

    daily: function (options) {
        if (arguments.length === 0) {
            options = "LastA";
        }

        if (typeof options === "string") {
            return NBP.ajax('select * from xml where url="' + NBP.URL + '/' + options + '.xml"').then(function (result) {
                return result.query.results;
            });
        } else {
            var type = options.type || "A",
                date = options.date || new Date();

            type = type.toLowerCase();

            if (typeof date !== "string") {
                date = NBP.formatDate(date);
            }

            return NBP.dir().then(function (codes) {
                var filtered = $.grep(codes, function (code) {
                        return code[0] === type && code.substr(5, 6) <= date;
                    });

                if (filtered.length) {
                    return NBP.daily(filtered[filtered.length - 1]);
                } else {
                    return $.Deferred().reject("code not found");
                }
            });
        }
    }
};
