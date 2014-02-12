/**
 * Created by ShachorFam on 12/02/14.
 */
'use strict';

/**
 * The main controller for the app. The controller:
 * - retrieves and persists the model via the todoStorage service
 * - exposes the model to the template and provides event handlers
 */
todomvc.controller('TodoLogin', function TodoCtrl($scope, $routeParams) {
    $scope.password = '';
    $scope.username = '';

    function assertFields() {
        if ($scope.username.length * $scope.password.length === 0) {
            alert('Please fill require fields');
        }
    }

    $scope.login = function () {
        assertFields();
    }

    $scope.register = function () {
        assertFields();
    }
});