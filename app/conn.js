/**
 * Created by Administrator on 2017/7/28.
 */
(function (angular) {


    function connProvider(){
        var _basePath = '/default/';
        var _suffix = '.rest';
        var _debug = true;
        var _provider = this;

        this.setBasePath = function (basePath) {
            _basePath = basePath;
        };

        this.getBasePath=function(){
            return _basePath;
        };

        this.setSuffix = function (suffix) {
            _suffix = suffix;
        };

        this.getSuffix = function () {
            return _suffix;
        };

        this.setDebug = function (debug) {
            _debug = debug
        }

        this.$get = ['$http','$rootScope',connService];

        function warpAjaxPromise(p,url,success,error){
            if(success){
                p.success(success);
            }
            p.error(onAjaxError);
            p.error = function (fn) {
                if(p.pendingErrors){
                    p.pendingErrors.push(fn);
                }else{
                    p.pendingErrors = [fn];
                }
            };
            if(error){
                p.error(error);
            }
            function onAjaxError(data,statusCode){
                if(statusCode ===401 || statusCode===491){
                    return;
                }
                if(angular.isArray(p.pendingErrors)){
                    angular.forEach(p.pendingErrors, function (fn) {
                        fn(data,statusCode);
                    });
                    return;
                }
               // console.error("$conn failed to request"+url+"! status:"+statusCode+" data:"+angular.toJson(data));
                if(null === error){
                    return;
                }
                if(data && data.message){
                    alert(data.message);
                }else{
                  //  alert("系统错误:"+statusCode);
                }
            }
            return p;
        }

        function connService($http,$rootScope){
            function ajaxGet(url,success,error){
                var actionUrl = _basePath + url +_suffix;
                var user = $rootScope.user;

                var p = $http.get(actionUrl);
                return warpAjaxPromise(p,url,success,error);
            }
            function ajaxPost(url,data,success,error){
                var bParams =url.indexOf('?')>0;
                var actionUrl = _basePath+url+(bParams?'':_suffix);
                var user = $rootScope.user;
                var headers = _debug?{'debug':true}:{};
                var req = {
                    method:'POST',
                    url:actionUrl,
                    headers:headers,
                    data:data
                };
                var p = $http(req);
                return warpAjaxPromise(p,url,success,error);
            }

            var $conn = {
                biz:ajaxPost,
                bizGet:ajaxGet,
                getBasePath:_provider.getBasePath
            };
            return $conn;
        }
    }


    //请求拦截
    ajaxInterceptor.$inject=['$q','$rootScope'];
    function ajaxInterceptor($q,$rootScope){
        function onResponseError(rejection){
            if(rejection.status===401){
                if($rootScope.user){
                    $rootScope.uesr=null;
                    App.notify("当前会话国旗或无效，请重新登录！");
                }
                App.login();
            }else if(rejection.status === 491){
                var p = confirm("当前会话已变更，是否重新加载页面？");
                p.then(function () {
                    //reload
                });
            }
            return $q.reject(rejection);
        }
        return {
            'responseError':onResponseError
        };
    }

    angular.module('myFactory')
        .factory('gfAjaxInterceptor',ajaxInterceptor)
        .provider('$conn',connProvider);
})(window.angular)