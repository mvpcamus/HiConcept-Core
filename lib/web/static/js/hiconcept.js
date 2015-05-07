var app = angular.module('hiconcept', ['ngRoute', 'ngResource']);

app.constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
});
app.constant('USER_ROLES', {
    admin: 'admin',
    user: 'user'
});

app.factory('AuthService', function($http, Session) {
    var authService = {};
    authService.login = function(credentials) {
        return $http
          .post('/web/login',credentials)
          .then(function(response) { //TODO: success & error
            Session.create(response.data.id, response.data.user.id, response.data.user.role);
            return response.data.user;
        });
    }
    authService.logout = function() {
        $http.post('/web/logout').then(function(response) { //TODO: success & error
            Session.destroy();
        });
    }
    authService.isAuthenticated = function() {
        return !!Session.userId;
    }
    authService.isAuthorized = function(authorizedRoles) {
        if (!angular.isArray(authorizedRoles)) {
            authorizedRoles = [authorizedRoles];
        }
        return (authService.isAuthenticated() &&
          authorizedRoles.indexOf(Session.userRole) !== -1);
    }
    return authService;
});
app.service('Session', function() {
    this.create = function(sessionId, userId, userRole) {
        this.id = sessionId;
        this.userId = userId;
        this.userRole = userRole;
    }
    this.destroy = function() {
        this.id = null;
        this.userId = null;
        this.userRole = null;
    }
});

app.config(function($routeProvider, $locationProvider, USER_ROLES) {
    $routeProvider
      .when('/web/main', {
        templateUrl: '/static/main.html',
        data: {
            authorizedRoles: [USER_ROLES.admin, USER_ROLES.user]
        }
      })
      .when('/web/login', {
        templateUrl: '/static/login.html',
        controller: 'loginCtrl',
        controllerAs: 'loginCt',
        data: {}
      })
      .when('/web/signup', {
        templateUrl: '/static/signup.html',
        controller: 'signupCtrl',
        controllerAs: 'signupCt',
        data: {}
      })
      .otherwise({
        redirectTo: '/web/login',
        data: {}
      });

    $locationProvider.html5Mode(true);
});

app.run(function($rootScope, AUTH_EVENTS, AuthService) {
    $rootScope.$on('$routeChangeStart', function(event, next) {
        if (angular.isDefined(next.data.authorizedRoles)) {
            var authorizedRoles = next.data.authorizedRoles;
            if (!AuthService.isAuthorized(authorizedRoles)) {
                event.preventDefault();
                if (AuthService.isAuthenticated()) {
                    // user is not allowed
                    $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
                } else {
                    // user is not logged in
                    $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
                }
            }
        }
    });
});

app.controller('mainCtrl', function($scope, $rootScope, $route, $resource, $window, $location, USER_ROLES,AUTH_EVENTS, AuthService) {
    this.$route = $route;
    this.$location = $location;
    $scope.currentUser = null;
    $scope.userRoles = USER_ROLES;
    $scope.isAuthorized = AuthService.isAuthorized;
    $scope.setCurrentUser = function(user) {
        $scope.currentUser = user;
    }
    $scope.logout = function() {
        AuthService.logout();
        $scope.setCurrentUser(undefined);
        $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
    }
    $scope.editMode = 0;
    $scope.setEditMode = function(value) {
        $scope.editMode = value;
        $scope.errorMessage = null;
        if (value == 0) {
            $scope.getModules($scope.currentUser.id);
        }
    }
    $scope.getModules = function(userId) {
        var Modules = $resource('/admin/:user/modules');
        Modules.query({user:userId}).$promise.then(function(modules) {
            angular.forEach(modules, function(module, order) {
                order++;
                module.count = order;
            });
            $scope.modules = modules;
        });
    }
    var Module = $resource('/admin/modules/:module', null, {
        'create': {method:'POST'},
        'remove': {method:'DELETE'},
        'update': {method:'PUT'}
    });
    $scope.createModule = function(newItem) {
        var newModule = new Module(newItem);
        newModule.$create(function() {
            $scope.setEditMode(0);
        }, function(error) {
            $scope.errorMessage = error.statusText+': '+error.data;
        });
    }
    $scope.removeModule = function(moduleId) {
        var reply = $window.confirm('Confirm to remove the module');
        if (reply == true) {
            Module.remove({module:moduleId}).$promise.then(function() {
                $scope.setEditMode(0);
            });
        }
    }
    $scope.updateModule = function(moduleId, modItem) {
        Module.update({module:moduleId}, modItem).$promise.then(function() {
            $scope.setEditMode(0);
        }, function(error) {
            $scope.errorMessage = error.statusText+': '+error.data;
        });
    }
});

app.controller('loginCtrl', function($scope, $rootScope, $location, AUTH_EVENTS, AuthService) {
    if(!$scope.currentUser) {
        $scope.errorMessage = "Please sign in to continue";
    } else {
        $scope.errorMessage = null;
        $location.path('/web/main');
    }
    $scope.credentials = {id:'', pass:''}; //TODO
    $scope.login = function(credentials) {
        AuthService.login(credentials).then(function(user) {
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
            $scope.setCurrentUser(user);
            $scope.errorMessage = null;
            $location.path('/web/main');
        }, function() {
            $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
            $scope.errorMessage = 'Authentication failed';
        });
    }
});

app.controller('signupCtrl', function($scope) {

});


