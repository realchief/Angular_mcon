App.controller('Login', ['$scope', '$localStorage', '$state', '$window',
    function ($scope, $localStorage, $state, $window) {
        $scope.user = {
            username: '',
            password: '',
            remember_me: false
        };
        $scope.login = function () {
            // add login part
            var token = 'asdfasdfasdfasdfasdf';
            $window.sessionStorage.setItem('token', token);
            $state.go('messagesCategories');
        }
    }
]);