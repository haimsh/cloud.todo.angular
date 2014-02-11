/*global todomvc */
'use strict';

/**
 * Services that persists and retrieves TODOs from localStorage
 */
todomvc.factory('todoStorage', function () {
	var STORAGE_ID = 'todos-angularjs';
    var todos = [];
	return {
		get: function () {
			todos = JSON.parse(localStorage.getItem(STORAGE_ID) || '[]');
            return todos.filter(function (elem) {
                return elem !== null;
            });
		},

		put: function (todo) {
            if (!todos.hasOwnProperty(todo.id)) {
                // TODO:
            } else {
                todos[todo.id] = todo;
    			localStorage.setItem(STORAGE_ID, JSON.stringify(todos));
            }
		},
        post: function (todo) {
            if (todos.hasOwnProperty(todo.id)) {
                // TODO:
            } else {
                todos[todo.id] = todo;
                localStorage.setItem(STORAGE_ID, JSON.stringify(todos));
            }
        },
        myDelete: function (id) {
            if (id === -1) {
                todos = [];
            } else {
                todos[id] = null;
            }
            localStorage.setItem(STORAGE_ID, JSON.stringify(todos));
        }
	};
});
