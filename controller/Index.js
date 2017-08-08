/**
 * Created by SEELE on 2016/11/20.
 */


(function (angular) {
    var app = angular.module('paper', [])
    .controller('IndexController', IndexController)
    .controller('EditPwdController', EditPwdController);


    //头部控制器
    IndexController.$inject = ['$rootScope','$cookies','$scope','AllService'];
    function IndexController($rootScope,$cookies,$scope, AllService) {
        //控制自动下拉
        $scope.user= {};//用户登录信息
        $('li.dropdown').mouseover(function () {
            $(this).addClass('open');
        }).mouseout(function () {
            $(this).removeClass('open');
        });
        //设置cookie
        var setCookie = function (name,value) {
            if(value){
            $cookies.putObject(name,value,{expires:new Date(new Date().getTime() + 5000000)});
            //$cookies.putObject(name,value);
            }else{
                $cookies.putObject(name,value,{expires:new Date(new Date().getTime() + 5000000)});
            }
        };
        //获取cookie
        var getCookie = function () {
            var user = $cookies.getObject("user")  ;
            if(!user){return;}
            if(user.account){
                $scope.user = user;
                $scope.loginClick();
            }
        };

        App.router('/');
        //登录&注册信息重置
        $scope.reset = function () {
            $scope.user = {};
        };
        //登录
        $scope.loginClick = function () {
            var q = AllService.login($scope.user);
            q.success(function (resp) {
                if (resp.status) {
                    $scope.showLoginError = false;
                    resp.pwd=$scope.user.pwd;
                    $rootScope.user = resp;
                    $scope.user = resp;
                    $('#login_Dialog').modal('hide');
                    $('#register_Dialog').modal('hide');
                    $scope.loginFlag = true;
                    setCookie("user",resp);
                }else{
                    $scope.showLoginError = true;
                }
            });
            // $('#login_Dialog').modal('hide');
            //  $scope.loginFlag = true;
        };
        //注销
        $scope.logout = function () {
            $scope.user = {};
            $scope.loginFlag = false;
            setCookie("user",{});
            AllService.logout();
        };
        //注册
        $scope.registerClick = function () {
            debugger
            var q = AllService.register($scope.user);
            q.success(function (resp) {
                if (resp.status) {
                    $scope.user = angular.extend(resp,$scope.user);
                    $scope.loginClick();
                };
            });
        };
        $scope.user.verityAccountFlag = true;
        //注册账号验证
        $scope.verifyAccount = function(){
            var q = AllService.verityAccount($scope.user);
            q.then(function(resp){
                $scope.user.verityAccountFlag = resp.data;
            });

        };
        //重新输入密码验证
        $scope.pwdverify = function(){
            if($scope.user.pwdTwo){
                $scope.user.pwdverifyFlag =!($scope.user.pwd == $scope.user.pwdTwo);
            }
        }
        //修改密码
        $scope.editPwdClick = function(){
            App.showDialog('view/index/editPwd.html','EditPwdController',{},{size:'sm'});
        };
        //忘记密码
        $scope.forgetPwd = function(){
            App.notify('抱歉功能未完善!');
        };
        //登录标记
        $scope.loginFlag = false;
        //选取试卷
        $scope.selectExam = function (params) {

            $scope.selectExamId = params;
        };
        //打开个人中心
        $scope.openPerInfo = function () {
            //App.router('perInfo.activity',$scope.user.account);
            App.globals.$start.go('perInfo.activity',{args:$scope.user.account,activity:{account:$scope.user.account}});
        };

        $scope.show = function (data) {


          App.showDialog('view/diaLog.html','HomeController');
        };

        getCookie();

    }

    //修改密码
    function EditPwdController($scope,$rootScope,AllService){

        $scope.title ='修改密码';
        $scope.data = {
            account:$rootScope.user.account,
            oldPwd:'',
            newPwd:'',
            newPwdTow:''

        };
        $scope.canSave = function(){
            if($scope.data.newPwd == $scope.data.newPwdTow ){
                $scope.errorFlag = false;
            }else{
                $scope.errorFlag = true;
            }
        };
        $scope.save = function () {
           if(!$scope.errorFlag){
              var q = AllService.editPwd($scope.data);
               q.then(function (resp) {
                    if(resp.data == 'true'){
                        $scope.$close();
                    }
               });
           }

        }
    }


}(window.angular));



