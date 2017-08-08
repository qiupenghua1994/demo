/**
 * Created by SEELE on 2017/2/18.
 * 讨论页面控制器
 */
(function (angular) {

    function DiscussionCtrl($scope,AllService) {

        $scope.q = {
            type:'',
            fuzzy:'',
        };
        $scope.themeList = {};
        //获取帖子列表
        $scope.getDiscussionThemeList = function () {
            var q =AllService.getDiscussionThemeList($scope.q);
            q.then(function (resp) {
                $scope.themeList = resp.data;
            });
        };

        //刷新
        $scope.refresh = function () {
            $scope.getDiscussionThemeList();
        };
        //发帖
        $scope.creatDiscussion = function () {

            if(App.isLogin()){
                var q = App.showDialog('view/discussion/cerate.html','CreateDiscussionCtrl',{name:1});
                q.then(function (resp) {
                    $scope.refresh();
                })

            }
        };

        //查看帖子
        $scope.getDiscussionContent = function(item){
            App.router('discussionReply',item);
        };
        $scope.getDiscussionThemeList();

    }
    //创建新帖子
    function CreateDiscussionCtrl($rootScope,$scope,AllService,args) {

        $scope.title = '发表新贴';


        $scope.data = {
            themeName:'',
            content:'',
            type:'1',
            account:$rootScope.user.account,
            replyNum:0,
            creatTime:'',
            nearReplyTime:''
        };
        $scope.save = function () {
            $scope.data.digest = $scope.data.themeName;
            var q = AllService.createDiscussion($scope.data);
            q.then(function (resp) {
                if(resp.data){
                    $scope.$close(resp.data);
                }
            })

        }

    }
    //查看帖子
    function LookDiscussionCtrl($rootScope,$scope,AllService,args){
        //获取帖子内容
        $scope.args = {};//帖子内容
        $scope.contentList = [];//回复内容
        $scope.floor=1;//楼层
        $scope.refresh = function () {
            //获取帖子主题
            var q2 = AllService.getDiscussionThemeList({id:args.id});
            q2.then(function (resp) {
                $scope.args = resp.data[0];
                //获取发帖人信息
                var q1 = AllService.getPerInfoByAccount($scope.args.account);
                q1.then(function(resp){
                    $scope.args = angular.extend($scope.args,resp.data);
                });
            });

            //获取帖子回复
            var q =  AllService.getDiscussionContent({id:args.id});
            q.then(function (resp) {
                var data =getDiscussionNodes(angular.copy(resp.data));
                for(var i=0;i<$scope.contentList.length;i++){
                    data[i].replyFlag = $scope.contentList[i].replyFlag;//获取之前的展开标记
                }
                $scope.contentList = data;
            });

        };

        //查看他人信息
        $scope.openSelfInfo= function (account) {
            App.globals.$start.go('perInfo.activity',{args:account,activity:{account:account}});
        };
        //回复帖子
        $scope.replyDiscussion = function (item,isChild) {
            if(!App.isLogin())return;
            var data = {
                id:args.id,
                parentAccount:item.account,
                account:$rootScope.user.account,
                floor:0,
                content:item.replyContent
            };
            if(isChild){
                data.floor = item.floor;
                var q =  AllService.replyDiscussion(data);
                q.then(function (resp) {
                    if(resp.data=='true'){
                        $scope.refresh();
                    }
                });
            }else{
                var q =App.showDialog('view/discussion/replyDiscussion.html','ReplyDiscussionCtrl',data);
                q.then(function (params) {
                    $scope.refresh();
                });

            }
        };

        //整理帖子
        function getDiscussionNodes(data){
            var nodes = [];
            $scope.floor = 1;//楼层
            data.forEach(function (item) {
                if (item.floor == 0) {
                    item.floor = $scope.floor++;
                    item.child = [];//子回复
                    nodes.push(item);
                } else {
                    nodes.forEach(function (nodesItem) {
                        if (item.floor == nodesItem.floor) {
                            nodesItem.child.push(item);
                        }
                    })
                }
            });
            return nodes;

        }
        $scope.refresh();
    }

    //回复帖子
    function ReplyDiscussionCtrl($rootScope,$scope,AllService,args){
        $scope.data = args;
        $scope.data.content='';
        $scope.data.floor=0;
        $scope.title = '回复帖子';
        $scope.save = function () {
           var q =  AllService.replyDiscussion($scope.data);
            q.then(function (resp) {
                if(resp.data=='true'){
                    $scope.$close(angular.copy($scope.data));
                }
            })
        }
    }



    angular.module('paper')
        .controller('DiscussionCtrl', DiscussionCtrl)
        .controller('CreateDiscussionCtrl', CreateDiscussionCtrl)
        .controller('LookDiscussionCtrl', LookDiscussionCtrl)
        .controller('ReplyDiscussionCtrl', ReplyDiscussionCtrl)

}(window.angular));
