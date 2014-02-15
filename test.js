/**
 * Created by ShachorFam on 13/02/14.
 */
'use strict';

(function () {
    var PORT = 8080;
    var EXPECTED_ASSERTS = 27;
    var TIME_OUT_DELAY = 1000;

    // open clean server.
    console.log = console.info = function (t) {};
    require('./main');
    var timeoutCounter = 0;
    var http = require('http');
    var assert = require('assert');
    var passed = 0;
    var connectionSettings = {
        port: PORT,
        path: '/item'
    };

    function readBody(readStream) {
        readStream.body = "";
        readStream.on('data', function (data) {
//            console.error(data.toString());
            readStream.body += data;
        });
    }

    function passTest() {
        passed++;
        console.error("passed tests: " + passed + " / " + EXPECTED_ASSERTS);
        if (passed === EXPECTED_ASSERTS) {
            console.error("Congratulation, tester passed all " + passed + " tests.");
        }
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

    /**
     * Test get method with given expected todos.
     * @param todos expected returned value.
     */
    function testGet(todos) {
        http.get('http://localhost:' + PORT + '/item', function (res) {
//            console.error("get return " + JSON.stringify(todos));
            readBody(res);
            res.on('end', function () {
//                console.error("get end "+ JSON.stringify(todos));
                var input = JSON.parse(res.body);
                assert.deepEqual(todos, input, "Expected: "+ JSON.stringify(todos) +
                    "\nActual: " + JSON.stringify(input));
                passTest();
            });
        });
    }

    function sendMessage(method, msg, callback) {
        connectionSettings.method = method;
        connectionSettings.headers = {
            "content-length": msg.length,
            "content-type": "application/json"
        };
        http.request(connectionSettings, callback).end(msg);
    }

    // startTesting:
    // 1. GET Basic:
    // 1.1: get initial object.
    testGet({});

    // 2. POST:
    // 2.1: post first new object.
    setTimeout( function () {
        var message = '{"id": "1", "value":"item1"}';
        sendMessage('post', message, function (res){
            testSuccess(res);
            testGet({"1": {"id": "1", "value": "item1", "completed": 0}});
        });
    }, ++timeoutCounter * TIME_OUT_DELAY);

    // 2.2: post exists object.
    setTimeout(function (){
        var message = '{"id": "1", "value": "item1new"}';
        sendMessage('post', message, function (res){
            testErr(res, 500);
            testGet({"1": {"id": "1", "value": "item1", "completed": 0}});
        });
    }, ++timeoutCounter * TIME_OUT_DELAY);

    // 2.3: post second object.
    setTimeout(function () {
        var message = '{"id": "10", "value":"item10"}';
        sendMessage('post', message, function (res){
            testSuccess(res);
            testGet({
                "1": {"id": "1", "value": "item1", "completed": 0},
                "10": {"id": "10", "value": "item10", "completed": 0}
            });
        });
    }, ++timeoutCounter * TIME_OUT_DELAY);

    // 3. PUT:
    // 3.1: change item 1 completed
    setTimeout(function () {
        var message = '{"id": "1", "value":"item1", "completed": 1}';
        sendMessage('put', message, function (res){
            testSuccess(res);
            testGet({
                "1": {"id": "1", "value": "item1", "completed": 1},
                "10": {"id": "10", "value": "item10", "completed": 0}
            });
        });
    }, ++timeoutCounter * TIME_OUT_DELAY);

    // 3.2: change item 1 completed back to 0
    setTimeout(function () {
        var message = '{"id": "1", "value":"item1", "completed": 0}';
        sendMessage('put', message, function (res){
            testSuccess(res);
            testGet({
                "1": {"id": "1", "value": "item1", "completed": 0},
                "10": {"id": "10", "value": "item10", "completed": 0}
            });
        });
    }, ++timeoutCounter * TIME_OUT_DELAY);

    // 3.3: change item 1 value
    setTimeout(function () {
        var message = '{"id": "1", "value":"newName", "completed": 0}';
        sendMessage('put', message, function (res){
            testSuccess(res);
            testGet({
                "1": {"id": "1", "value": "newName", "completed": 0},
                "10": {"id": "10", "value": "item10", "completed": 0}
            });
        });
    }, ++timeoutCounter * TIME_OUT_DELAY);

    // 3.4: change un-exist item
    setTimeout(function () {
        var message = '{"id": "2", "value":"newName", "completed": 0}';
        sendMessage('put', message, function (res){
            testErr(res, 500);
            testGet({
                "1": {"id": "1", "value": "newName", "completed": 0},
                "10": {"id": "10", "value": "item10", "completed": 0}
            });
        });
    }, ++timeoutCounter * TIME_OUT_DELAY);

    // 4. DELETE:
    // 4.1: delete item 1.
    setTimeout(function () {
        var message = '{"id": "1"}';
        sendMessage('delete', message, function (res){
            testSuccess(res);
            testGet({"10": {"id": "10", "value": "item10", "completed": 0}});
        });
    }, ++timeoutCounter * TIME_OUT_DELAY);

    // 4.2: delete all (when item 10 still active).
    setTimeout(function () {
        var message = '{"id": "-1"}';
        sendMessage('delete', message, function (res){
            testSuccess(res);
            testGet({"10": {"id": "10", "value": "item10", "completed": 0}});
        });
    }, ++timeoutCounter * TIME_OUT_DELAY);

    // 4.3: delete un-exits item
    setTimeout(function () {
        var message = '{"id": "2"}';
        sendMessage('delete', message, function (res){
            testErr(res, 500);
            testGet({"10": {"id": "10", "value": "item10", "completed": 0}});
        });
    }, ++timeoutCounter * TIME_OUT_DELAY);

    // 4.4: change item 10 to completed, and delete all.
    setTimeout(function () {
        var message = '{"id": "10", "value":"item10", "completed": 1}';
        sendMessage('put', message, function (res){
            testSuccess(res);
            testGet({"10": {"id": "10", "value": "item10", "completed": 1}});
        });
    }, ++timeoutCounter * TIME_OUT_DELAY);
    setTimeout(function () {
        var message = '{"id": "-1"}';
        sendMessage('delete', message, function (res){
            testSuccess(res);
            testGet({});
        });
    }, ++timeoutCounter * TIME_OUT_DELAY);

    // 4.5: delete un-exits item when list is empty
    setTimeout(function () {
        var message = '{"id": "1"}';
        sendMessage('delete', message, function (res){
            testErr(res, 500);
            testGet({});
        });
    }, ++timeoutCounter * TIME_OUT_DELAY);

    setTimeout(process.exit, (timeoutCounter + 3) * TIME_OUT_DELAY);
}) ();
