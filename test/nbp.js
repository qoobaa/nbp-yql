$(document).ready(function () {

    // PhantomJS uses file: protocol by default
    NBP.YQL_URL = "http://query.yahooapis.com/v1/public/yql";

    test("formatDate works properly", function () {
        equal(NBP.formatDate(new Date(Date.parse("2014-02-02"))), "140202");
        equal(NBP.formatDate(new Date(Date.parse("2014-12-31"))), "141231");
    });

    asyncTest("daily works without any arguments", function () {
        NBP.daily()
            .done(function (result) {
                ok(result.hasOwnProperty("tabela_kursow"));
            })
            .fail(function (result) {
                ok(false, "request failed");
            })
            .always(start);
    });

    asyncTest("daily returns friday if sunday given", function () {
        NBP.daily({ date: "140202" })
            .done(function (result) {
                equal(result.tabela_kursow.data_publikacji, "2014-01-31");
            })
            .fail(function (result) {
                ok(false, "request failed");
            })
            .always(start);
    });

    asyncTest("daily returns correct type", function () {
        NBP.daily({ type: "H", date: "140202" })
            .done(function (result) {
                equal(result.tabela_kursow.typ, "H");
                equal(result.tabela_kursow.data_publikacji, "2014-01-31");
            })
            .fail(function (result) {
                ok(false, "request failed");
            })
            .always(start);
    });

    asyncTest("daily fails when code not found", function () {
        NBP.daily({ type: "X" })
            .done(function (result) {
                ok(false);
            })
            .fail(function (result) {
                ok(true);
            })
            .always(start);
    });

    asyncTest("dir works without any arguments", function () {
        NBP.dir()
            .done(function (result) {
                ok(result.length > 5000);
            })
            .fail(function (result) {
                ok(false, "request failed");
            })
            .always(start);
    });

});
