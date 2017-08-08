/**
 * Created by SEELE on 2016/11/20.
 */


(function (angular,$) {

    window.agGrid.initialiseAgGridWithAngular1(angular);

    var app = angular.module('app',
        [
            'ngCookies'
            ,'ui.router'
            ,'ui.bootstrap'
            ,'oc.lazyLoad'
            ,'agGrid'
            ,'service'
            ,'paper'
            ,'myDirective'
            ,'myFactory'
            ,'filter'
            ,'ngFileUpload'

        ]);

    angular.module('myFactory',[]);

    var loadPromise;
    var lazyLoadFiles=[
        'controller/PerInfoCtrl.js',
    ]


    //扩展api,
    function extendAngularApi(){
        //用于指令中原生方法的脏检查
        angular.$apply = function (scope,fn) {
            if(scope.$root.$$phase){
                if(fn){
                    fn();
                }
            }else{
                scope.$apply(fn);
            }
        };

        var injector = angular.injector(['ng']);
        var $timeout = injector.get('$timeout');
        injector = null;

        angular.getAttrVal = getAttrVal;
        function getAttrVal($attrs,name,defaultVal,defaultVal2){
            var val = $attrs[name];
            return angular.isDefined(val)?val:(angular.isDefined(defaultVal)?defaultVal:defaultVal2);
        }

        angular.getIntAttr = getIntAttr;
        function getIntAttr($attrs,name,defaultVal,defaultVal2){
            return parseInt(getAttrVal($attrs,name,defaultVal,defaultVal2));
        }

        angular.getBoolAttr = getBoolAttr;
        function getBoolAttr($attrs,name,defaultVal,defaultVal2){
            var val = getAttrVal($attrs,name,defaultVal,defaultVal2);
            return val != 0 && val!= 'false';
        }


        function unbindElemEvents(elem){
            elem.unbind();
            elem.children().each(function (i,subElem) {
                unbindElemEvents($(subElem));
            })
        }
        angular.$unbind = unbindElemEvents;

        function initElementCache(){
            function ElementCache(scope){
                this.elements={};
                var self = this;
                scope.$on('$destory', function () {
                    self.clear();
                    self.elements=null;
                    self = null;
                });
                scope = null;
            }

            ElementCache.prototype.getElem = function (key) {
                return this.elements(key);
            };

            ElementCache.prototype.addElem= function (key,elem) {
                var existsElem = this.elements[key];
                if(existsElem){
                    unbindElemEvents(existsElem);
                    delete this.elements[key];
                }
                this.elements[key]=elem;
            };

            ElementCache.prototype.createElem = function (key,html) {
                var elem = angular.element(html);
                this.addElem(key,elem);
                return elem;
            };

            ElementCache.prototype.clear = function () {
                angular.forEach(this.elements, function (elem) {
                    unbindElemEvents(elem);
                });
                this.elements={};
            };

            angular.$createElementCache = function (scope) {
                return new ElementCache(scope);
            };

            window.onbeforeunload= function () {
                console.log('unload');
                var vm = App.globals.$rootScope;
                if(!vm){
                    return;
                }
                if(vm.$elemCache){
                    vm.$elemCache.clear();
                    vm.$elemCache.null;

                }
            }
        }
        initElementCache();
    }
    /**
     * 由于整个应用都会和路由打交道，所以这里把$state和$stateParams这两个对象放到$rootScope上，方便其它地方引用和注入。
     * 这里的run方法只会在angular启动的时候运行一次。
     * @param  {[type]} $rootScope
     * @param  {[type]} $state
     * @param  {[type]} $stateParams
     * @return {[type]}
     */
    app.run(runInit);
    runInit.$inject= ['$rootScope','$state','$stateParams','$uibModal','$uibModalStack','$ocLazyLoad','$conn','$q'];
    function runInit($rootScope,$state,$stateParams,$uibModal,$uibModalStack,$ocLazyLoad,$conn,$q) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        function initGlobals(){
            var globals = App.globals;
            globals.$uibModal = $uibModal;
            globals.$uibModalStack = $uibModalStack;
            globals.$start = $state;
            globals.$ocLazyLoad = $ocLazyLoad;
            globals.$q = $q;
        }
        initGlobals();
        extendAngularApi();

        App.login = function () {
            $rootScope.$emit('login');
        };
        App.isLogin = function () {
            if($rootScope.user) {
                if(!$rootScope.user.account){
                    App.notify('请先登录');
                    return false;
                }
            }else{
                App.notify('请先登录');
                return false
            }
            return true;
        }

        loadPromise = App.utils.lazyLoad({
            isLoaded:App.utils.isControllerLoaded('PerInfoActivityCtrl'),
            files:lazyLoadFiles
        });


        //用于验证刷新回话是否过期
        if(top.location.hash != '#/login'){
            loadPromise.then(loadSession);
        }

        function loadSession(){
            console.info("loadSession");
            var p = $conn.biz("getSession");//获取session
            p.then(function(resp){
                try{
                    if(resp && resp.user){
                        $rootScope.user = resp.user;
                        $rootScope.$emit('login',resp.user);
                    }else{
                       //App.goLogin();//登录跳转
                    }
                }catch(e){
                    console.error("load seeesion error"+e);
                    onLoadError();
                }
            },onLoadError);
            return p;
        }

        function onLoadError(){
            //错误处理
        }


    }

    app.config(function ($stateProvider,$urlRouterProvider,$controllerProvider) {

        App.globals.controllerProvider = $controllerProvider;

        $.get("test.cgi", { name: "John", time: "2pm" },
            function(data){
                alert("Data Loaded: " + data);
            });

        $urlRouterProvider.otherwise('/');
        $stateProvider.state('/',{
            url:'/',
            templateUrl: 'view/grid.html',
            controller: 'GridController',
            resolve:{
                deps: function ($q) {
                    return loadPromise?loadPromise:$q.reject();
                }
            }
        }).state('exam',{
            url:'/exam',
            templateUrl: 'view/exam/exam.html',
            controller: 'ExamCtrl',

        }).state('examRoom',{
            url:'/examRoom',
            templateUrl: 'view/exam/examRoom.html',
            controller: 'ExamRoomCtrl'
        })
            .state('perInfo',{
                url:'/perInfo',
                params:{args:null},
                templateUrl:'view/perInfo.html',
                controller:'PerInfoCtrl',
                resolve:{
                    args: ['$stateParams', function($stateParams){
                        //var data = JSON.parse($stateParams.args); //字符转对象
                        var data = $stateParams.args;
                        return data;
                    }]
                }
            })
            .state('perInfo.activity',{
                url:'/activity',
                params:{activity:null},
                templateUrl: 'view/perInfo/activity.html',
                controller: 'PerInfoActivityCtrl',
                resolve:{
                    args: ['$stateParams', function($stateParams){
                        var data = $stateParams.activity;
                        return data;
                    }]
                }
            })
            .state('perInfo.info',{
                url:'/detail',
                params:{info:null},
                templateUrl: 'view/perInfo/info.html',
                controller: 'PerInfoDetailCtrl',
                resolve:{
                    args: ['$stateParams', function($stateParams){
                        var data = $stateParams.info;
                        return data;
                    }]
                }
            })
            .state('perInfo.discussion',{
                url:'/discussion',
                params:{discussion:null},
                templateUrl: 'view/perInfo/discussion.html',
                controller: 'PerInfoDiscussionCtrl',
                resolve:{
                    args: ['$stateParams', function($stateParams){
                        var data = $stateParams.discussion;
                        return data;
                    }]
                }
            })
            .state('perInfo.collect',{
                url:'/collect',
                params:{message:null},
                templateUrl: 'view/perInfo/collect.html',
                controller: 'PerInfoCollectCtrl',
                resolve:{
                    args: ['$stateParams', function($stateParams){
                        var data = $stateParams.collect;
                        return data;
                    }]
                }
            })
            .state('perInfo.statistics',{
                url:'/statistics',
                params:{statistics:null},
                templateUrl: 'view/perInfo/statistics.html',
                controller: 'PerInfoStatisticsCtrl',
                resolve:{
                    args: ['$stateParams', function($stateParams){
                        var data = $stateParams.statistics;
                        return data;
                    }]
                }
            })
            .state('discussion',{
                url:'/discussion',
                params:{args:null},
                templateUrl: 'view/discussion.html',
                controller: 'DiscussionCtrl',
                resolve:{
                    args: ['$stateParams', function($stateParams){
                        var data = $stateParams.args;
                        return data;
                    }]
                }
            })
            .state('discussionReply',{
                url:'/discussionReply',
                params:{args:null},
                templateUrl: 'view/discussion/lookDiscussion.html',
                controller: 'LookDiscussionCtrl',
                resolve:{
                    args: ['$stateParams', function($stateParams){
                        var data = $stateParams.args;
                        return data;
                    }]
                }
            })
            .state('manage',{
                url:'/manage',
                params:{args:null},
                templateUrl: 'view/manage.html',
                controller: 'ManageCtrl',
                resolve:{
                    args: ['$stateParams', function($stateParams){
                        var data = $stateParams.args;
                        return data;
                    }]
                }
            })
    })


}(window.angular,window.jQuery));


//var data = JSON.parse($stateParams.args); //字符转对象
//var ste=JSON.stringify(data)  //转成string
//$state.go('exam', {args: ste});//发起路由请求
//
//params:{args:null},
//resolve:{
//    args: ['$stateParams', function($stateParams){
//        var data = JSON.parse($stateParams.args); //字符转对象
//        return {name :data};
//    }]
//}



