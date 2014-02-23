/**
 * Created by ShachorFam on 12/02/14.
 */
'use strict';

/**
 * The main controller for the app. The controller:
 * - retrieves and persists the model via the todoStorage service
 * - exposes the model to the template and provides event handlers
 */
todomvc.controller('TodoLogin', function TodoCtrl($scope, $location, $http, todoStorage) {
    $scope.passwordLogin = '';
    $scope.usernameLogin = '';
    $scope.passwordReg = '';
    $scope.usernameReg = '';
    $scope.passwordVerify = '';
    $scope.fullName = '';
    $scope.loginErrorMessage = '';
    $scope.regErrorMessage = '';



    function assertLoginFields() {
        if ($scope.usernameLogin.length ===0 ||
            $scope.passwordLogin.length === 0) {
            $scope.loginErrorMessage = 'Please fill require fields in order to login!';
            return false;
        } else {
            $scope.loginErrorMessage = '';
            return true;
        }
    }

    $scope.login = function () {
        if (assertLoginFields()) {
            $http.post('login', {
                username: $scope.usernameLogin,
                password: $scope.passwordLogin
            }).success(function (data, status, headers) {
                    todoStorage.setId(headers("x-id"));
                    $location.path('/');
                });
        }
    };

    function assertRegisterFields() {
        if ($scope.usernameReg.length === 0 ||
            $scope.passwordReg.length === 0 ||
            $scope.fullName === 0) {
            $scope.regErrorMessage = 'Please fill require fields in order to register!';
            return false;
        }
        if ($scope.passwordReg !== $scope.passwordVerify) {
            $scope.regErrorMessage = 'Confirmed password should be same as password!';
            return false;
        }
        $scope.regErrorMessage = '';
        return true;
    }

    function copyRegToLogin() {
        $scope.usernameLogin = $scope.usernameReg;
        $scope.passwordLogin = $scope.passwordReg;
        $scope.passwordReg = '';
        $scope.usernameReg = '';
        $scope.passwordVerify = '';
        $scope.fullName = '';
    }

    $scope.register = function () {
        if (assertRegisterFields()) {
            $http.post('register', {
                username: $scope.usernameReg,
                password: $scope.passwordReg,
                fullName: $scope.fullName
            }).success(copyRegToLogin);
        }
    }
});