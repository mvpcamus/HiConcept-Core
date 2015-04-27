var app = angular.module('myApp', [])
app.controller('myController', ['$scope', '$http', function($scope, $http) {
    $http.get('/admin/user/profile')
    .success(function(data, status, headers, config) {
        $scope.user = data;
        $scope.error = "";
    })
    .error(function(data, status, headers, config) {
        $scope.user = {};
        $scope.error = data;
    });
}]);
app.controller('moduleController', ['$scope', '$http', function($scope, $http) {
    $scope.module = [];
    $http.get('/admin/module/profile')
    .success(function(data, status, headers, config) {
        $scope.module = data;
    })
    .error(function(data, status, headers, config) {
        $scope.error = data;
    });
    $scope.editModule = function(modulid) {
        //TODO: edit module button
    }
    $scope.deleteModule = function(moduleid) {
        $http.delete('/admin/module/'+moduleid)
        .success(function(data, status, headers, config) {
            $http.get('/admin/module/profile')
            .success(function(data, status, headers, config) {
                $scope.module = data;
            })
            .error(function(data, status, headers, config) {
                $scope.error = data;
            })
        })
        .error(function(data, status, headers, config) {
            $scope.error = 'ERROR: Module Not Found '+data;
        });
    }
}]);
