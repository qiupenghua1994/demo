/**
 * Created by SEELE on 2017/4/12.
 * 管理控制器
 */

(function (angular) {


    //管理
    ManageCtrl.$inject = ['$rootScope','$scope', 'AllService', 'args'];
    function ManageCtrl($rootScope,$scope, AllService, args) {
        if(!App.isLogin()){
            App.router('/')
        }
        $scope.isAdmin = $rootScope.user.account=='admin'?true:false;
        $scope.q = {
            type:'',
            fuzzy:'',
            name:'',
            content:'',
            id:'',
            audit:'',
            account:$rootScope.user.account
        }

        $scope.refresh = function(){
            $scope.changeTab();
        };
        //审批操作
        $scope.auditOperation = function(id){
          var q = App.showDialog('view/manage/auditOperation.html','ManageauditOperationCtrl',{id:id}) ;
            q.then(function(resp){
                $scope.refresh();
            });
        };
        //试题管理
        $scope.manageQuestion = function(id){
            var q = App.showDialog('view/manage/manageQuestion.html','ManageQuestionCtrl',{id:id});
            q.then(function(resp){
                $scope.refresh();
            });
        };
        //删除帖子
        $scope.delDiscussion = function(id){
            var q =App.showDialog('view/DeleteDialog.html','DeleteDialogCtrl',{},{size:'sm'});
            q.then(function(resp){
                var b = AllService.delDiscussion({id:id});
                b.then(function(resp){
                   $scope.refresh();
                });
            });
        };
        $scope.changeTab = function(index){
            if(index){
                $scope.tabFlag = index;
            }

            switch ($scope.tabFlag){
                case 1:
                    $scope.q.audit=0;
                    var q =AllService.getQuestionCheck($scope.q);
                    q.then(function(resp){
                        $scope.data = resp.data;
                    });
                    $scope.q.audit=-1;
                    var q_1 =AllService.getQuestionCheck($scope.q);
                    q_1.then(function(resp){
                        $scope.data_1 = resp.data;
                    });
                    $scope.q.audit=1;
                    var q_2 =AllService.getQuestionCheck($scope.q);
                    q_2.then(function(resp){
                        $scope.data_2 = resp.data;
                    });
                    break;
                case 2:

                    var q =AllService.getDiscussionListManage($scope.q);
                    q.then(function(resp){
                        $scope.data = resp.data;
                    });
                    break;
                case 3:
                    $scope.q.audit=1;
                    var q =AllService.getQuestionCheck($scope.q);
                    q.then(function (resp) {
                        $scope.data =resp.data;
                    });
                    break;
            }
        };
        $scope.changeTab(1);
        $scope.refresh();
    }

    //审批操作
    function ManageauditOperationCtrl($scope,$rootScope,AllService,args){

        $scope.title = '试题详情';
        $scope.item = {};//题目内容
        function getQuestionById(){
            var q =AllService.getQuestionById({questionId:args.id});
            q.then(function (resp) {
                $scope.item = resp.data;
            });
        };

        $scope.save = function(){
            uploadAudit(1);
        };
        $scope.fail = function(){
            uploadAudit(-1);
        };
        function uploadAudit(data){
            var q = AllService.uploadAuditQuestion({audit:data,id:args.id});
            q.then(function(resp){
                if(resp.data=="true"){

                    $scope.$close();
                }
            });
        };




        getQuestionById();

    }

    //试题管理
    function ManageQuestionCtrl($scope,$rootScope,AllService,args){

        $scope.title = '试题详情';
        $scope.item = {};//题目内容
        function getQuestionById(){
            var q =AllService.getQuestionById({questionId:args.id});
            q.then(function (resp) {
                $scope.item = resp.data;
                $scope.questionType = resp.data.questionType;
            });
        };

        ////修改
        //$scope.save = function(){
        //    uploadAudit(1);
        //};
        //删除
        $scope.del = function(){
            var q = AllService.delQuestion({id:args.id});
            q.then(function(resp){
                if(resp.data=="true"){
                    $scope.$close();
                }
            });
        };





        getQuestionById();

    }

    angular.module('paper')
        .controller('ManageCtrl', ManageCtrl)
        .controller('ManageauditOperationCtrl', ManageauditOperationCtrl)
        .controller('ManageQuestionCtrl', ManageQuestionCtrl)

}(window.angular));