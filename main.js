/**
 * Created by ShachorFam on 28/01/14.
 */
'use strict';

(function () {
    var PORT = 8080;
    var Express = require('mini.express.haim.shachor/miniExpress');
    var app = Express();
    var data = {};

    data['singleUser'] = {};
    function getUser(request, response, next) {
        request.username = 'singleUser';
        // TODO: arrange users.
        next();
    }

    app.use(Express.cookieParser());
    app.use(Express.bodyParser());
    app.use(getUser);
    app.get('/item', function (request, response) {
        // TODO: checks
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

    app.use(Express.static(__dirname + '/www'));

    app.listen(PORT);
})();