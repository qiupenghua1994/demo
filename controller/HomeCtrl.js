/**
 * Created by SEELE on 2017/3/12.
 * 主页控制器
 */

/**
 * Created by Administrator on 2017/1/30.
 * 个人信息控制器
 */
(function (angular) {


    //首页
    function homeController($scope,AllService) {

        $scope.pageSize = 1;//分页码
        $scope.pageActiveFlag=1;//分页标记
        $scope.latestData = null;
        $scope.q = {
            key:"",
            type:"",
            pageSize:20,
            pageIndex:1,
            itemSum:0
        };//查询条件

        //doingRank：做题榜，uploadRank：传题榜
        $scope.rankingList = {};

        //查看他人信息
        $scope.openSelfInfo= function (account) {
            App.globals.$start.go('perInfo.activity',{args:account,activity:{account:account}});
        };
        $scope.refresh = function () {
            getLatestNews();
            getRankingList();
        };
        //获取最新消息
        function getLatestNews(){
            var q = AllService.getLatestNews($scope.q);
            q.then(function (params) {
                $scope.latestData = params.data.data;
                if(!$scope.q.itemSum){
                    $scope.q.itemSum = params.data.itemSum;

                }
            })
        }
        //获取排行榜
        function getRankingList(){
            var q = AllService.getRankingList();
            q.then(function(resp){
                $scope.rankingList =resp.data;
            });
        };
        //下一页
        $scope.nextPage = function(size,move){
            if(move){
                if($scope.pageSize>1||size>0){
                    $scope.pageSize+=size;
                }
                if($scope.pageActiveFlag>1||size>0){
                    $scope.pageActiveFlag+=size;
                    $scope.q.pageIndex+=size;
                }
            }else{
                $scope.pageActiveFlag = size;
                $scope.q.pageIndex =size;
            }

            $scope.refresh($scope.q);
        };

        /**
         * 打开消息详细内容
         * @param newsType 内容类型
         * @param contentId 内容对应的Id
         */
        $scope.openNewContent = function (newsType,contentId) {

            switch (newsType){
                case '发表':
                    App.router('discussionReply',{id:contentId});
                    break;
                case '上传':
                    if(!App.isLogin())return;
                    App.showDialog('view/exam/examDialog.html','EcamDialogCtrl',{id:contentId});
                    break;
            }
        };

        $scope.refresh();


    }

    angular.module('paper')
        .controller('HomeController', homeController)

}(window.angular));