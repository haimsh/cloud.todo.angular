/**
 * Created by ShachorFam on 13/02/14.
 */
'use strict';

(function () {
    var PORT = 8080;
    var EXPECTED_ASSERTS = 60;
    var TIME_OUT_DELAY = 4000;

    // open clean server.
    console.log = console.info = function (t) {};
    require('./main');
    var http = require('http');
    var assert = require('assert');
    var passed = 0;
    var timeOutEncounterMain = 0;
    var userCounter = 0;

    function passTest() {
        passed++;
        console.error("passed tests: " + passed + " / " + EXPECTED_ASSERTS);
        if (passed === EXPECTED_ASSERTS) {
            console.error("Congratulation, tester passed all " + passed + " tests.");
        }
    }

    function readBody(readStream) {
        readStream.body = "";
        readStream.on('data', function (data) {
            readStream.body += data;
        });
    }

    function testSuccess(res) {
        res.on('error', function (err) {
            console.error(err)
        });
        assert.equal(res.statusCode, 200);
        passTest();
    }

    function testErr(res, err) {
        assert.equal(res.statusCode, err);
        passTest();
    }

    function testData(userCookie) {
        var timeoutCounterTestData = 0;
        var userId = userCounter++;
        var connectionSettings = {
            port: PORT,
            path: '/item'
        };

        /**
         * Test get method with given expected todos.
         * @param todos expected returned value.
         */
        function testGet(todos) {
            var getSettings = {
                port: PORT,
                path: '/item',
                headers : {
                    Cookie: userCookie
                }
            };
            http.get(getSettings, function (res) {
                readBody(res);
                res.on('end', function () {
                    var input = JSON.parse(res.body);
                    assert.deepEqual(todos, input, "Expected: " + JSON.stringify(todos) +
                        "\nActual: " + JSON.stringify(input));
                    passTest();
                });
            });
        }

        function sendMessage(method, msg, callback) {
            connectionSettings.method = method;
            connectionSettings.headers = {
                "content-length": msg.length,
                "content-type": "application/json",
                Cookie: userCookie
            };
            http.request(connectionSettings, callback).end(msg);
        }

        // startTesting:
        // 1. GET Basic:
        // 1.1: get initial object.
        testGet({});

        // 2. POST:
        // 2.1: post first new object.
        setTimeout(function () {
            var message = '{"id": "1", "value":"item1_' + userId + '"}';
            sendMessage('post', message, function (res) {
                testSuccess(res);
                testGet({"1": {"id": "1", "value": "item1_" + userId, "completed": 0}});
            });
        }, ++timeoutCounterTestData * TIME_OUT_DELAY);

        // 2.2: post exists object.
        setTimeout(function () {
            var message = '{"id": "1", "value": "item1new_' + userId + '"}';
            sendMessage('post', message, function (res) {
                testErr(res, 500);
                testGet({"1": {"id": "1", "value": "item1_" + userId , "completed": 0}});
            });
        }, ++timeoutCounterTestData * TIME_OUT_DELAY);

        // 2.3: post second object.
        setTimeout(function () {
            var message = '{"id": "10", "value":"item10_' + userId + '"}';
            sendMessage('post', message, function (res) {
                testSuccess(res);
                testGet({
                    "1": {"id": "1", "value": "item1_" + userId, "completed": 0},
                    "10": {"id": "10", "value": "item10_" + userId, "completed": 0}
                });
            });
        }, ++timeoutCounterTestData * TIME_OUT_DELAY);

        // 3. PUT:
        // 3.1: change item 1 completed
        setTimeout(function () {
            var message = '{"id": "1", "value":"item1_' + userId + '", "completed": 1}';
            sendMessage('put', message, function (res) {
                testSuccess(res);
                testGet({
                    "1": {"id": "1", "value": "item1_" + userId, "completed": 1},
                    "10": {"id": "10", "value": "item10_" + userId, "completed": 0}
                });
            });
        }, ++timeoutCounterTestData * TIME_OUT_DELAY);

        // 3.2: change item 1 completed back to 0
        setTimeout(function () {
            var message = '{"id": "1", "value":"item1_' + userId + '", "completed": 0}';
            sendMessage('put', message, function (res) {
                testSuccess(res);
                testGet({
                    "1": {"id": "1", "value": "item1_" + userId, "completed": 0},
                    "10": {"id": "10", "value": "item10_" + userId, "completed": 0}
                });
            });
        }, ++timeoutCounterTestData * TIME_OUT_DELAY);

        // 3.3: change item 1 value
        setTimeout(function () {
            var message = '{"id": "1", "value":"newName_' + userId + '", "completed": 0}';
            sendMessage('put', message, function (res) {
                testSuccess(res);
                testGet({
                    "1": {"id": "1", "value": "newName_" + userId, "completed": 0},
                    "10": {"id": "10", "value": "item10_" + userId, "completed": 0}
                });
            });
        }, ++timeoutCounterTestData * TIME_OUT_DELAY);

        // 3.4: change un-exist item
        setTimeout(function () {
            var message = '{"id": "2", "value":"newName_' + userId + '", "completed": 0}';
            sendMessage('put', message, function (res) {
                testErr(res, 500);
                testGet({
                    "1": {"id": "1", "value": "newName_" + userId, "completed": 0},
                    "10": {"id": "10", "value": "item10_" + userId, "completed": 0}
                });
            });
        }, ++timeoutCounterTestData * TIME_OUT_DELAY);

        // 4. DELETE:
        // 4.1: delete item 1.
        setTimeout(function () {
            var message = '{"id": "1"}';
            sendMessage('delete', message, function (res) {
                testSuccess(res);
                testGet({"10": {"id": "10", "value": "item10_" + userId, "completed": 0}});
            });
        }, ++timeoutCounterTestData * TIME_OUT_DELAY);

        // 4.2: delete all (when item 10 still active).
        setTimeout(function () {
            var message = '{"id": "-1"}';
            sendMessage('delete', message, function (res) {
                testSuccess(res);
                testGet({"10": {"id": "10", "value": "item10_" + userId, "completed": 0}});
            });
        }, ++timeoutCounterTestData * TIME_OUT_DELAY);

        // 4.3: delete un-exits item
        setTimeout(function () {
            var message = '{"id": "2"}';
            sendMessage('delete', message, function (res) {
                testErr(res, 500);
                testGet({"10": {"id": "10", "value": "item10_" + userId, "completed": 0}});
            });
        }, ++timeoutCounterTestData * TIME_OUT_DELAY);

        // 4.4: change item 10 to completed, and delete all.
        setTimeout(function () {
            var message = '{"id": "10", "value":"item10_' + userId + '", "completed": 1}';
            sendMessage('put', message, function (res) {
                testSuccess(res);
                testGet({"10": {"id": "10", "value": "item10_" + userId, "completed": 1}});
            });
        }, ++timeoutCounterTestData * TIME_OUT_DELAY);
        setTimeout(function () {
            var message = '{"id": "-1"}';
            sendMessage('delete', message, function (res) {
                testSuccess(res);
                testGet({});
            });
        }, ++timeoutCounterTestData * TIME_OUT_DELAY);

        // 4.5: delete un-exits item when list is empty
        setTimeout(function () {
            var message = '{"id": "1"}';
            sendMessage('delete', message, function (res) {
                testErr(res, 500);
                testGet({});
            });
        }, ++timeoutCounterTestData * TIME_OUT_DELAY);
        // timeoutCounter = 14
    }

    // testing users
    // A. register 2 users:
    function register(user, password, callback) {
        var msg = JSON.stringify({
            username: user,
            password: password,
            fullName: user
        });
        http.request({
            method: 'post',
            port: PORT,
            path: '/register',
            headers: {
                "content-length": msg.length,
                "content-type": "application/json"
            }

        }, callback).end(msg);
    }

    // A.a register user a.
    register('a', 'a', testSuccess);

    // A.b register user a again.
    setTimeout(function () {
        register('a', 'b', function (res) {
            testErr(res, 500);
        });
    }, ++timeOutEncounterMain * TIME_OUT_DELAY);

    // A.c register additional user
    setTimeout(function () {
        register('b', 'c', function (res) {
            testSuccess(res);
        });
    }, ++timeOutEncounterMain * TIME_OUT_DELAY);

    // B. login as user, simultanusly test their same data (in some delay so they won't get the same).
    function loginUser (user, pass, callback) {
        var msg = JSON.stringify({
            username: user,
            password: pass
        });
        http.request({
            method: 'post',
            port: PORT,
            path: '/login',
            headers: {
                "content-length": msg.length,
                "content-type": "application/json"
            }
        }, callback).end(msg);
    }

    function runUserTest(res) {
        var cookie = res.headers["set-Cookie".toLowerCase()][0];
        assert(typeof cookie !== 'undefined');
        cookie = cookie.split(";", 1); // take only user='{...}' part!
        testData(cookie);
    }

    // B.a login with user a.
    setTimeout(function () {
        loginUser('a', 'a', runUserTest);
    }, ++timeOutEncounterMain * TIME_OUT_DELAY);

    // B.b login with user b with wrong password
    setTimeout(function () {
        loginUser('b','d', function (res) {
            testErr(res, 500);
        });
    }, ++timeOutEncounterMain * TIME_OUT_DELAY);

    // B.c login with user b
    // This interleave with prev user since runUserTest call long (in timeouts) testData.
    // Connections are sets to x.5 TIME_OUT_DELAY in order to not load the server.
    setTimeout(function () {
        loginUser('b', 'c', runUserTest);
    }, (++timeOutEncounterMain + 0.5) * TIME_OUT_DELAY);

    // B.d login with fake user.
    // B.b login with user b with wrong password
    setTimeout(function () {
        loginUser('c','d', function (res) {
            testErr(res, 500);
        });
    }, ++timeOutEncounterMain * TIME_OUT_DELAY);

    // B.e testGet without cookie
    setTimeout( function () {
        http.get("http://localhost:" + PORT + "/item", function (res) {
            testErr(res, 400);
        });
    }, ++timeOutEncounterMain * TIME_OUT_DELAY);

    setTimeout(process.exit, 30 * TIME_OUT_DELAY);
}) ();
