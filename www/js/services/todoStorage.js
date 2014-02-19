/*global todomvc */
'use strict';

/**
 * Services that persists and retrieves TODOs from localStorage
 */
todomvc.factory('todoStorage', function ($http, $location) {
	var STORAGE_ID = 'todos-angularjs';
    var todos = {};
    var reload;

    function objectToArray(obj) {
        var arr = [];
        for (var elem in obj) {
            if (obj.hasOwnProperty(elem)) {
                obj[elem].completed = Boolean(obj[elem].completed);
                arr.push(obj[elem]);
            }
        }
        return arr;
    }

    function handleError(data, status) {
        switch (status) {
            case 500:
                alert("Server encounter internal error: " + data);
                //TODO: put into some error message area.
//                reload();
                break;
            case 400:
                $location.path('/login');
        }
    }

	return {
        init: function (reloadCallback) {
            reload = reloadCallback;
        },
		get: function (callback) {
            $http.get('/item')
                .success(function (data) {
                    callback(objectToArray(data));
                }).error(handleError);
        },

		put: function (todo) {
            var sendTodo = JSON.parse(JSON.stringify(todo));
            sendTodo.completed = sendTodo.completed ? 1 : 0;
            $http.put('/item', sendTodo).error(handleError);
		},

        post: function (todo) {
            var sendTodo = JSON.parse(JSON.stringify(todo));
            delete sendTodo.completed;
            $http.post('/item', sendTodo).error(handleError);
        },
        myDelete: function (id) {
            // For some reason, $http.delete() does not support body.
            $http({
                url: '/item', method: 'DELETE', data: {id: id}, headers: {'Content-Type': 'application/json'}
            }).error(handleError).success(reload);
            return;
        }
	};
});
