$(document).ready(function () {

    asyncTest("daily works without any arguments", function () {
        nbpDaily()
            .done(function (result) {
                ok(result.hasOwnProperty("uid"));
            })
            .fail(function (result) {
                ok(false, "request failed");
            })
            .always(start);
    });

    asyncTest("daily returns friday if sunday given", function () {
        nbpDaily({ date: "140202" })
            .done(function (result) {
                equal(result.data_publikacji, "2014-01-31");
            })
            .fail(function (result) {
                ok(false, "request failed");
            })
            .always(start);
    });

    asyncTest("daily returns correct type", function () {
        nbpDaily({ type: "H", date: new Date(1391299200000) }) // "2014-02-02"
            .done(function (result) {
                equal(result.typ, "H");
                equal(result.data_publikacji, "2014-01-31");
            })
            .fail(function (result) {
                ok(false, "request failed");
            })
            .always(start);
    });

    asyncTest("daily fails when code not found", function () {
        nbpDaily({ type: "X" })
            .done(function (result) {
                ok(false);
            })
            .fail(function (result) {
                ok(true);
            })
            .always(start);
    });

});
