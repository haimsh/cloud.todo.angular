/*global todomvc, angular */
'use strict';

/**
 * The main controller for the app. The controller:
 * - retrieves and persists the model via the todoStorage service
 * - exposes the model to the template and provides event handlers
 */
todomvc.controller('TodoCtrl', function TodoCtrl($scope, $routeParams, todoStorage, filterFilter) {
    function Counter(start) {
        var i = start;
        return function () {
            return ++i;
        }
    }

    function findMaxId(arr) {
        var currMax = 0;
        for (var elem in arr) {
            if (arr.hasOwnProperty(elem) && arr[elem].id > currMax) {
                currMax = arr[elem].id;
            }
        }
        return currMax;
    }

    var todos, idGenerator;

    todos = $scope.todos = [];

    function reloadData() {
        todoStorage.get(function (data) {
            todos = $scope.todos = data;
            var maxId = findMaxId(todos);
            idGenerator = Counter(maxId);
        });
    }

    todoStorage.init(reloadData);
    reloadData();

    $scope.newTodo = '';
    $scope.editedTodo = null;
    $scope.errorMessage = '';

    $scope.$watch('todos', function (newValue, oldValue) {
        $scope.remainingCount = filterFilter(todos, { completed: false }).length;
        $scope.completedCount = todos.length - $scope.remainingCount;
        $scope.allChecked = !$scope.remainingCount;
    }, true);

    // Monitor the current route for changes and adjust the filter accordingly.
    $scope.$on('$routeChangeSuccess', function () {
        var status = $scope.status = $routeParams.status || '';

        $scope.statusFilter = (status === 'active') ?
        { completed: false } : (status === 'completed') ?
        { completed: true } : null;
    });

    $scope.addTodo = function () {
		var newTodo = $scope.newTodo.trim();
		if (!newTodo.length) {
			return;
		}

        var newItem = {
            id: idGenerator(),
			value: newTodo,
			completed: false
		};

        todoStorage.post(newItem);
        todos.push(newItem);
		$scope.newTodo = '';
	};

	$scope.editTodo = function (todo) {
		$scope.editedTodo = todo;
		// Clone the original todo to restore it on demand.
		$scope.originalTodo = angular.extend({}, todo);
	};

	$scope.doneEditing = function (todo) {
		$scope.editedTodo = null;
		todo.value = todo.value.trim();

		if (!todo.value) {
			$scope.removeTodo(todo);
		} else {
            todoStorage.put(todo);
        }
	};

	$scope.revertEditing = function (todo) {
		todos[todos.indexOf(todo)] = $scope.originalTodo;
		$scope.doneEditing($scope.originalTodo);
	};

	$scope.removeTodo = function (todo) {
		todos.splice(todos.indexOf(todo), 1);
        todoStorage.myDelete(todo.id);
	};

	$scope.clearCompletedTodos = function () {
        todoStorage.myDelete(-1);
        return;
        todos.forEach(function (todo) {
           if (todo.completed) {
               todoStorage.myDelete(todo.id);
           }
        });
        $scope.todos = todos = todos.filter(function (val) {
            return !val.completed;
        });
//        $scope.todos = todos = todoStorage.get();
	};

	$scope.markAll = function (completed) {
		todos.forEach(function (todo) {
			todo.completed = !completed;
            todoStorage.put(todo);
		});
	};

    $scope.checkComplete = function (todo) {
        setTimeout(function () {todoStorage.put(todo);}, 0);
    };
});
