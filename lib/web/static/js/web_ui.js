var app = angular.module('myApp', [])
app.controller('myController', ['$scope', '$http', function($scope, $http) {
    $http.get('/admin/user/profile')
    .success(function(data, status, headers, config) {
        $scope.user = data;
        $scope.error = "";
        $scope.module = [];
        $http.get('/admin/'+data._id+'/modules')
        .success(function(data, status, headers, config) {
            $scope.module = data.module;
            $scope.message = data.message;
        })
        .error(function(data, status, headers, config) {
            $scope.module = [];
            $scope.message = data;
        });
    })
    .error(function(data, status, headers, config) {
        $scope.user = {};
        $scope.error = data;
    });

    $scope.editModule = function(module_id) {
        //TODO: edit module button
    }
    $scope.deleteModule = function(module_id) {
        $http.delete('/admin/modules/'+module_id)
        .success(function(data, status, headers, config) {
            $scope.module = data.module;
            $scope.message = data.message;
        })
        .error(function(data, status, headers, config) {
            $scope.message = data;
        });
    }
}]);
