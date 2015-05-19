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

app.factory('AuthService', function($http, $cookies, Session) {
    var authService = {};
    authService.login = function(credentials) {
        return $http
          .post('/web/login',credentials)
          .then(function(response) { //TODO: success & error
            Session.create(response.data.user);
            $cookies.putObject('_hiconcept_client', response.data.user);
            return response.data.user;
        });
    }
    authService.refresh = function(user) {
        Session.create(user);
    }
    authService.logout = function() {
        $http.post('/web/logout').then(function(response) { //TODO: success & error
            Session.destroy();
            $cookies.remove('_hiconcept_client');
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
app.factory('TopicService', function($resource) {
    var topicService = {};
    var Topics = $resource('/admin/:user/topics', null, {
        'read'  : {method:'GET', isArray:true}
    });
    topicService.list = function(userId) {
        return Topics.read({user:userId}).$promise;
    }
    var Topic = $resource('/admin/topics/:topic', null, {
        'read'  : {method:'GET'},
        'create': {method:'POST'},
        'remove': {method:'DELETE'},
        'update': {method:'PUT'}
    });
    topicService.create = function(specs) {
        return Topic.create(specs).$promise;
    }
    topicService.read = function(topicId) {
        return Topic.read({topic:topicId}).$promise;
    }
    topicService.remove = function(topicId) {
        return Topic.remove({topic:topicId}).$promise;
    }
    topicService.update = function(topicId, specs) {
        return Topic.update({topic:topicId}, specs).$promise;
    }
    return topicService;
});

app.config(function($routeProvider, $locationProvider, USER_ROLES) {
    $routeProvider
      .when('/web/main', {
        templateUrl: '/static/main.html',
        controller: 'mainCtrl',
        data: {
            authorizedRoles: [USER_ROLES.admin, USER_ROLES.user]
        }
      })
      .when('/web/module', {
        templateUrl: '/static/module.html',
        controller: 'moduleCtrl',
        data: {
            authorizedRoles: [USER_ROLES.admin, USER_ROLES.user]
        }
      })
      .when('/web/topic', {
        templateUrl: '/static/topic.html',
        controller: 'topicCtrl',
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
    if ($cookies.getObject('_hiconcept_client')) {
        $scope.currentUser = $cookies.getObject('_hiconcept_client');
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
    $scope.msg = {type:null, text:null};
    if(!$scope.currentUser) {
        $scope.msg = {type:'info', text:"Please sign in to continue"};
    } else {
        $scope.msg.text = null;
        $location.path('/web/main');
    }
    $scope.credentials = {id:'', pass:''}; //TODO
    $scope.login = function(credentials) {
        AuthService.login(credentials).then(function(user) {
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
            $scope.setCurrentUser(user);
            $scope.msg.text = null;
            $location.path('/web/main');
        }, function(error) {
            $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
            $scope.msg = {type:'danger', text:'Authentication failed'};
        });
    }
});
app.controller('signupCtrl', function($scope, $location, UserService, USER_ROLES) {
    $scope.msg = {type:null, text:null};
    $scope.signup = function(profiles) {
        if(profiles.pass !== profiles.pass2) {
            $scope.msg = {type:'danger', text:'Input Error: Passwords discord'};
        } else {
            if(!profiles.role) {profiles.role = USER_ROLES.user;}
            UserService.create(profiles).then(function(response) {
                $location.path('/web/login');
            }, function(error) {
                if (angular.isString(error.data)) {
                    if (error.data.substring(0,6) == 'E11000') {
                        $scope.msg = {type:'danger',
                            text:'Account ID is occupied, please try a different ID'};
                    } else {
                        $scope.msg = {type:'danger', text:error.statusText+': '+error.data};
                    }
                } else {
                    $scope.msg = {type:'danger', text:error.statusText};
                }
            });
        }
    }
});
app.controller('profileCtrl', function($scope, $location, $window, UserService) {
    $scope.msg = {type:null, text:null};
    UserService.read($scope.currentUser.id).then(function(profile) {
        profile.id = profile._id;
        delete profile.pass;
        $scope.profiles = profile;
    }, function(error) {
        $scope.msg = {type:'danger', text:error.statusText+': '+error.data};
    });
    $scope.deleteUser = function() {
        var reply = $window.confirm('You CANNOT restore your account after deletion!');
        if (reply == true) {
            UserService.remove($scope.currentUser.id).then(function(response) {
                $scope.logout();
                $location.path('/');
            }, function(error) {
                $scope.msg = {type:'danger', text:error.statusText+': '+error.data};
            });
        }
    }
    $scope.updateUser = function(profile) {
        if (profile.pass !== profile.pass2) {
            $scope.profiles.pass = $scope.profiles.pass2 = null;
            $scope.modified = false;
            $scope.msg = {type:'danger', text:'Input Error: Passwords discord'};
        } else {
            UserService.update($scope.currentUser.id, profile).then(function(response) {
                $scope.modified = false;
                $scope.msg = {type:'success', text:'User Profile Updated Successfully.'};
            }, function(error) {
                $scope.modified = false;
                $scope.msg = {type:'danger', text:error.statusText+': '+error.data};
            });
        }
    }
});
app.controller('moduleCtrl', function($scope, $resource, $window, ModuleService) {
    $scope.msg = {type:null, text:null};
    $scope.editMode = false;
    $scope.modified = false;
    $scope.newtried = false;
    $scope.setEditMode = function(value) {
        $scope.editMode = value;
        $scope.msg.text = null;
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
            $scope.msg = {type:'danger', text:error.statusText+': '+error.data};
        });
    }
    $scope.createModule = function(specs) {
        ModuleService.create(specs).then(function(response) {
            $scope.newItem = null;
            $scope.newtried = false;
            $scope.setEditMode(false);
        }, function(error) {
            $scope.msg = {type:'danger', text:error.statusText+': '+error.data};
            $scope.newtried = false;
        });
    }
    $scope.removeModule = function(moduleId) {
        var reply = $window.confirm('Confirm to remove the module');
        if (reply == true) {
            ModuleService.remove(moduleId).then(function(response) {
                $scope.setEditMode(false);
            }, function(error) {
                $scope.msg = {type:'danger', text:error.statusText+': '+error.data};
            });
        }
    }
    $scope.updateModule = function(moduleId, specs) {
        ModuleService.update(moduleId, specs).then(function(response) {
            $scope.setEditMode(false);
        }, function(error) {
            $scope.msg = {type:'danger', text:error.statusText+': '+error.data};
        });
    }
});
app.controller('topicCtrl', function($scope, $resource, $window, TopicService) {
    $scope.msg = {type:null, text:null};
    $scope.editMode = false;
    $scope.modified = false;
    $scope.newtried = false;
    $scope.setEditMode = function(value) {
        $scope.editMode = value;
        $scope.msg.text = null;
        if (value == false) {
            $scope.getTopics($scope.currentUser.id);
            $scope.modified = false;
        }
    }
    $scope.getTopics = function(userId) {
        TopicService.list(userId).then(function(topics) {
            angular.forEach(topics, function(topic, order) {
                order++;
                topic.count = order;
            });
            $scope.topics = topics;
        }, function(error) {
            $scope.msg = {type:'danger', text:error.statusText+': '+error.data};
        });
    }
    $scope.createTopic = function(specs) {
        TopicService.create(specs).then(function(response) {
            $scope.newItem = null;
            $scope.newtried = false;
            $scope.setEditMode(false);
        }, function(error) {
            $scope.msg = {type:'danger', text:error.statusText+': '+error.data};
            $scope.newtried = false;
        });
    }
    $scope.removeTopic = function(topicId) {
        var reply = $window.confirm('Confirm to remove the topic');
        if (reply == true) {
            TopicService.remove(topicId).then(function(response) {
                $scope.setEditMode(false);
            }, function(error) {
                $scope.msg = {type:'danger', text:error.statusText+': '+error.data};
            });
        }
    }
    $scope.updateTopic = function(topicId, specs) {
        TopicService.update(topicId, specs).then(function(response) {
            $scope.setEditMode(false);
        }, function(error) {
            $scope.msg = {type:'danger', text:error.statusText+': '+error.data};
        });
    }
});
