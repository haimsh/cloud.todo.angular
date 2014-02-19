/**
 * Created by ShachorFam on 28/01/14.
 */
'use strict';

(function () {
    var PORT = 8080;
    var COOKIE_TIME = 60000;
    var Express = require('mini.express.haim.shachor/miniExpress');
    var uuid = require('node-uuid');
    var app = Express();
    var data = {};
    var users = {};

    data['singleUser'] = {};

    function getUser(request, response, next) {
        var userCookie = request.cookies.user;
        try {
            if (typeof userCookie !== 'undefined') {
                userCookie = JSON.parse(userCookie);
            }
        } catch (e) {}
        if (typeof userCookie !== 'undefined' &&
            itemContainField(userCookie, ['username', 'key']) &&
            users.hasOwnProperty(userCookie.username) &&
            users[userCookie.username].activeLogin.key === userCookie.key &&
            Date.now() - users[userCookie.username].activeLogin.time < COOKIE_TIME &&
            Date.now() - users[userCookie.username].activeLogin.time >= 0) {
            request.username = userCookie.username;
            users[userCookie.username].activeLogin.time = Date.now();
            next();
        } else {
            response.send(400);
        }
    }

    app.use(Express.cookieParser());
    app.use(Express.bodyParser());
    app.use('/item', getUser);
    app.get('/item', function (request, response) {
        var userData = data[request.username];
        response.send(userData);
    });

    function itemContainField(item, fields) {
        for (var field in fields) {
            if (field.hasOwnProperty(field) && !item.hasOwnProperty(fields[field])) {
                return false;
            }
        }
        return true;
    }

    app.post('/item', function (request, response) {
        var userData = data[request.username];
        var newItem = request.body;
        if (!itemContainField(newItem, ['value', 'id'])) {
            response.send(500, "item should be compromised of value and id.");
            return;
        }
        newItem['completed'] = 0;
        if (userData.hasOwnProperty(newItem.id)) {
            response.send(500, "There already exists item with this ID: " + newItem.id);
        } else {
            userData[newItem.id] = newItem;
            response.send(200);
        }
    });

    app.put('/item', function (request, response) {
        var userData = data[request.username];
        var newItem = request.body;
        if (!itemContainField(newItem, ['value', 'id', 'status'])) {
            response.send(500, "item should be compromised of value, id and status.");
            return;
        }
        if (!userData.hasOwnProperty(newItem.id)) {
            response.send(500, "There doesn't exist item with this ID: " + newItem.id);
        } else {
            userData[newItem.id] = newItem;
            response.send(200);
        }
    });

    app.delete('/item', function (request, response) {
        var userData = data[request.username];
        var itemId = request.body;
        if (!itemContainField(itemId, ['id'])) {
            response.send(500, "body should contain id field");
            return;
        }
        if (itemId.id == -1) {
            for (var elem in userData) {
                if (userData.hasOwnProperty(elem) && userData[elem].completed) {
                    delete userData[elem];
                }
            }
            response.send(200);
        } else {
            if (userData.hasOwnProperty(itemId.id)) {
                delete userData[itemId.id];
                response.send(200);
            } else {
                response.send(500, "There doesn't exist item with this ID: " + itemId.id);
            }
        }

    });

    function setUserCookie(username, request, response) {
        users[username].activeLogin.time = Date.now();
        var host = request.get("host");
        var split = host.indexOf(":");
        if (split > 0) {
            host = host.substring(0, split);
        }
        response.cookie('user', ({
            username: username,
            key: users[username].activeLogin.key
        }), {
            domain: host, // In Express: request.host
            path: '/'
        });
    }

    app.post('/login', function (request, response) {
        var user = request.body;
        if (!itemContainField(user, ['username', 'password'])) {
            // TODO
            return;
        }
        var username = user.username;
        if (users.hasOwnProperty(username) && users[username].password === user.password) {
            users[username].activeLogin = {
                key: uuid.v4(),
                time: Date.now()
            };
            setUserCookie(username, request, response);
            response.send(200);
        } else {
            response.send(500, "Login failed. ");
        }
    });

    app.post('/register', function (request, response) {
        var user = request.body;
        if (!itemContainField(user, ['username', 'fullName', 'password'])) {
            // TODO
            return;
        }
        var username = user.username;
        if (users.hasOwnProperty(username)) {
            response.send(500, "User " + username + "already exists, try another username.");
        } else {
            users[username] = user;
            data[username] = {};
            response.send(200, "user was added successfully.");
        }
    });

    app.use(Express.static(__dirname + '/www'));

    app.listen(PORT);
})();