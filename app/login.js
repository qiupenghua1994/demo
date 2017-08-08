/**
 * Created by SEELE on 2017/8/6.
 */
(function (angular,$) {

    window.agGrid.initialiseAgGridWithAngular1(angular);

    var app = angular.module('login',
        [
            'ngCookies'
            ,'ui.router'
            ,'ui.bootstrap'
        ]);

    app.controller('LoginController',LoginController);

    function LoginController($scope){
        $scope.aa = 'niahao';
    };



    /**
     * 由于整个应用都会和路由打交道，所以这里把$state和$stateParams这两个对象放到$rootScope上，方便其它地方引用和注入。
     * 这里的run方法只会在angular启动的时候运行一次。
     * @param  {[type]} $rootScope
     * @param  {[type]} $state
     * @param  {[type]} $stateParams
     * @return {[type]}
     */
    app.run(runInit);
    runInit.$inject= ['$rootScope','$state','$stateParams','$uibModal','$uibModalStack'];
    function runInit($rootScope,$state,$stateParams,$uibModal,$uibModalStack) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

    }

    app.config(function ($stateProvider,$urlRouterProvider) {

        $urlRouterProvider.otherwise('login');
        $stateProvider.state('login', {
            url:'/login',
            templateUrl: 'person/login/view/login.html',
            controller: 'LoginController'
        }).state('regist', {
            url:'/regist',
            templateUrl: 'person/login/view/regist.html',
            controller: 'RegistController'
        })
    })


}(window.angular,window.jQuery));

