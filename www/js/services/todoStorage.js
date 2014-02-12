/*global todomvc */
'use strict';

/**
 * Services that persists and retrieves TODOs from localStorage
 */
todomvc.factory('todoStorage', function ($http, $location) {
	var STORAGE_ID = 'todos-angularjs';
    var todos = {};

    function objectToArray(obj) {
        var arr = [];
        for (var elem in obj) {
            if (obj.hasOwnProperty(elem)) {
                arr.push(obj[elem]);
            }
        }
        return arr;
    }

    function handleError(data, status) {
        switch (status) {
            case 500:
                alert("Server encounter internal error");
                break;
            case 400:
                $location.path('/login');
        }
    }

	return {
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
            return;
            if (!todos.hasOwnProperty(todo.id)) {
                // TODO:
            } else {
                todos[todo.id] = todo;
    			localStorage.setItem(STORAGE_ID, JSON.stringify(todos));
            }
		},

        post: function (todo) {
            var sendTodo = JSON.parse(JSON.stringify(todo));
            delete sendTodo[completed];
            $http.post('/item', sendTodo).error(handleError);
            return;
            if (todos.hasOwnProperty(todo.id)) {
                // TODO:
            } else {
                todos[todo.id] = todo;
                localStorage.setItem(STORAGE_ID, JSON.stringify(todos));
            }
        },
        myDelete: function (id) {
            $http.delete('/item', id).error(handleError);
            return;
            if (id === -1) {
                for (var elem in todos) {
                    if (todos.hasOwnProperty(elem) && todos[elem].completed) {
                        delete todos[id];
                    }
                }
            } else {
                delete todos[id];
            }
            localStorage.setItem(STORAGE_ID, JSON.stringify(todos));
        }
	};
});
