var app = angular.module('hiconcept', ['ngRoute', 'ngResource', 'ngCookies']);

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

app.factory('AuthService', function($http, $cookieStore, Session) {
    var authService = {};
    authService.login = function(credentials) {
        return $http
          .post('/web/login',credentials)
          .then(function(response) { //TODO: success & error
            Session.create(response.data.user);
            $cookieStore.put('_hiconcept_client', response.data.user);
            return response.data.user;
        });
    }
    authService.refresh = function(user) {
        Session.create(user);
    }
    authService.logout = function() {
        $http.post('/web/logout').then(function(response) { //TODO: success & error
            Session.destroy();
            $cookieStore.remove('_hiconcept_client');
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
    this.create = function(user) {
        this.userId = user.id;
        this.userRole = user.role;
    }
    this.destroy = function() {
        this.userId = null;
        this.userRole = null;
    }
});
app.factory('UserService', function($resource) {
    var userService = {};
    var User = $resource('/admin/users/:user', null, {
        'read'  : {method:'GET'},
        'create': {method:'POST'},
        'remove': {method:'DELETE'},
        'update': {method:'PUT'}
    });
    userService.create = function(profiles) {
        return User.create(profiles).$promise;
    }
    userService.read = function(userId) {
        return User.read({user:userId}).$promise;
    }
    userService.remove = function(userId) {
        return User.remove({user:userId}).$promise;
    }
    userService.update = function(userId, profile) {
        return User.update({user:userId}, profile).$promise;
    }
    return userService;
});
app.factory('ModuleService', function($resource) {
    var moduleService = {};
    var Modules = $resource('/admin/:user/modules', null, {
        'read'  : {method:'GET', isArray:true}
    });
    moduleService.list = function(userId) {
        return Modules.read({user:userId}).$promise;
    }
    var Module = $resource('/admin/modules/:module', null, {
        'read'  : {method:'GET'},
        'create': {method:'POST'},
        'remove': {method:'DELETE'},
        'update': {method:'PUT'}
    });
    moduleService.create = function(specs) {
        return Module.create(specs).$promise;
    }
    moduleService.read = function(moduleId) {
        return Module.read({module:moduleId}).$promise;
    }
    moduleService.remove = function(moduleId) {
        return Module.remove({module:moduleId}).$promise;
    }
    moduleService.update = function(moduleId, specs) {
        return Module.update({module:moduleId}, specs).$promise;
    }
    return moduleService;
});

app.config(function($routeProvider, $locationProvider, USER_ROLES) {
    $routeProvider
      .when('/web/main', {
        templateUrl: '/static/main.html',
        controller: 'moduleCtrl',
        data: {
            authorizedRoles: [USER_ROLES.admin, USER_ROLES.user]
        }
      })
      .when('/web/login', {
        templateUrl: '/static/login.html',
        controller: 'loginCtrl',
        data: {}
      })
      .when('/web/signup', {
        templateUrl: '/static/signup.html',
        controller: 'signupCtrl',
        data: {}
      })
      .when('/web/profile', {
        templateUrl: '/static/profile.html',
        controller: 'profileCtrl',
        data: {
        }
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
app.run(function($route) {
    $route.reload();
});

app.controller('mainCtrl', function($scope, $rootScope, $route, $cookies, $location, USER_ROLES, AUTH_EVENTS, AuthService) {
    this.$route = $route;
    this.$location = $location;
    if ($cookies._hiconcept_client) {
        $scope.currentUser = JSON.parse($cookies._hiconcept_client);
        AuthService.refresh($scope.currentUser);
    } else {
        $scope.currentUser = null;
    }
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
        }, function(error) {
            $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
            $scope.errorMessage = 'Authentication failed';
        });
    }
});
app.controller('signupCtrl', function($scope, $location, UserService, USER_ROLES) {
    $scope.signup = function(profiles) {
        if(profiles.pass !== profiles.pass2) {
            $scope.errorMessage = 'Input Error: Passwords discord';
        } else {
            if(!profiles.role) {profiles.role = USER_ROLES.user;}
            UserService.create(profiles).then(function(response) {
                $location.path('/web/login');
            }, function(error) {
                if (angular.isString(error.data)) {
                    if (error.data.substring(0,6) == 'E11000') {
                        $scope.errorMessage =
                            'Account ID is occupied, please try a different ID';
                    } else {
                        $scope.errorMessage = error.statusText+': '+error.data;
                    }
                } else {
                    $scope.errorMessage = error.statusText;
                }
            });
        }
    }
});
app.controller('profileCtrl', function($scope, $location, $window, UserService) {
    UserService.read($scope.currentUser.id).then(function(profile) {
        profile.id = profile._id;
        delete profile.pass;
        $scope.profiles = profile;
    }, function(error) {
        $scope.errorMessage = error.statusText+': '+error.data;
    });
    $scope.deleteUser = function() {
        var reply = $window.confirm('You CANNOT restore your account after deletion!');
        if (reply == true) {
            UserService.remove($scope.currentUser.id).then(function(response) {
                $scope.logout();
                $location.path('/');
            }, function(error) {
                $scope.errorMessage = error.statusText+': '+error.data;
            });
        }
    }
    $scope.updateUser = function(profile) {
        if (profile.pass !== profile.pass2) {
            $scope.errorMessage = 'Input Error: Passwords discord';
        } else {
            UserService.update($scope.currentUser.id, profile).then(function(response) {
                $scope.errorMessage = 'Update Success'; // TODO: errorMessage -> infoMessage
            }, function(error) {
                $scope.errorMessage = error.statusText+': '+error.data;
            });
        }
    }
});
app.controller('moduleCtrl', function($scope, $resource, $window, ModuleService) {
    $scope.editMode = false;
    $scope.modified = false;
    $scope.newtried = false;
    $scope.setEditMode = function(value) {
        $scope.editMode = value;
        $scope.errorMessage = null;
        if (value == false) {
            $scope.getModules($scope.currentUser.id);
            $scope.modified = false;
        }
    }
    $scope.getModules = function(userId) {
        ModuleService.list(userId).then(function(modules) {
            angular.forEach(modules, function(module, order) {
                order++;
                module.count = order;
            });
            $scope.modules = modules;
        }, function(error) {
            $scope.errorMessage = error.statusText+': '+error.data;
        });
    }
    $scope.createModule = function(specs) {
        ModuleService.create(specs).then(function(response) {
            $scope.newItem = null;
            $scope.newtried = false;
            $scope.setEditMode(false);
        }, function(error) {
            $scope.errorMessage = error.statusText+': '+error.data;
            $scope.newtried = false;
        });
    }
    $scope.removeModule = function(moduleId) {
        var reply = $window.confirm('Confirm to remove the module');
        if (reply == true) {
            ModuleService.remove(moduleId).then(function(response) {
                $scope.setEditMode(false);
            }, function(error) {
                $scope.errorMessage = error.statusText+': '+error.data;
            });
        }
    }
    $scope.updateModule = function(moduleId, specs) {
        ModuleService.update(moduleId, specs).then(function(response) {
            $scope.setEditMode(false);
        }, function(error) {
            $scope.errorMessage = error.statusText+': '+error.data;
        });
    }
});

