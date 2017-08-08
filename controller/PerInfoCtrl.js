/**
 * Created by Administrator on 2017/1/30.
 * 个人信息控制器
 */
(function (angular) {


//个人信息主页
    PerInfoCtrl.$inject = ['$rootScope','$scope', 'AllService', 'args'];
    function PerInfoCtrl($rootScope,$scope, AllService, args) {
        var account =  angular.copy(args);
        $scope.routeArgs = {
            account:account
        };
        if($rootScope.user){
            $scope.isSelFlag = account === $rootScope.user.account;
        }
        $scope.perInfo = {};
        $scope.hisData = null;
        $scope.refresh = function () {
            var q = AllService.getPerInfoByAccount(account);
            q.then(function (resp) {
                $scope.perInfo = angular.extend($scope.perInfo,resp.data);
            });

        };
        $scope.perInfoMenuFlag = 1;//目录标记默认历史动态
        //改变目录选择
        $scope.changeMenu = function (num) {
            $scope.perInfoMenuFlag = num;
        };
        $scope.changePortrait = function(flag){
            if(flag){
                $('#changeP').css('bottom','0px');
            }else{
                $('#changeP').css('bottom','-30px');
            }

        };

        $scope.refresh();
    }

//最新动态
    function PerInfoActivityCtrl($scope,AllService,args) {
        var account = angular.copy(args.account);

        $scope.q = {
            key:"",
            type:"",
            pageSize:20,
            pageIndex:1,
            itemSum:0,
            account:args.account
        };//查询条件

        var q1 = AllService.getLatestNews($scope.q);
        q1.then(function (resp) {
            $scope.hisData = resp.data.data;
        });
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

    }

//论坛详情
    function PerInfoDiscussionCtrl($scope,AllService,args) {
        var args =angular.copy(args);
        var data = {
            account:args.account
        };
        function refresh(){
            var q = AllService.getDiscussionThemeList(data);
            q.then(function (resp) {
                $scope.hisData = resp.data;
            });
        }
        //打开帖子
        $scope.openNewContent = function(id){
            App.router('discussionReply',{id:id});
        };

        refresh();

    }

//个人信息详情
    function PerInfoDetailCtrl($rootScope,$scope,AllService,args) {


        var account = angular.copy(args.account);
        //头像数组
        $scope.portraitUrl = [
            {url:'image/portrait/1.jpg'}
            ,{url:'image/portrait/2.jpg'}
            ,{url:'image/portrait/3.jpg'}
            ,{url:'image/portrait/4.jpg'}
            ,{url:'image/portrait/5.jpg'}
            ,{url:'image/portrait/6.jpg'}
            ,{url:'image/portrait/7.jpg'}
            ,{url:'image/portrait/8.jpg'}
            ,{url:'image/portrait/9.jpg'}

        ];

        $scope.data =angular.copy($rootScope.user);
        $scope.data.birth = new Date(parseInt(angular.copy($scope.data.birth)));


        //改变头像
        $scope.changePortrait = function(url){
            $scope.data.portrait = url;
        };
        //保存
        $scope.save = function () {
            $scope.data.birth = $scope.data.birth.getTime();
            var q= AllService.editPerInfo($scope.data);
            q.then(function (resp) {
                if(resp.data=="true"){
                    $rootScope.user=angular.copy($scope.data);
                }
            });
        };
    }

//习题收藏
    function PerInfoCollectCtrl($rootScope,$scope,AllService,args) {
        $scope.questionOptionsShowFlag = -1;//是否显示答案选项
        $scope.showAnalysisFlag = -1;//是否显示解析
        $scope.nowOption = '';//现在选中的答案
        $scope.isSubmit = false;//是否已经提交
        $scope.fillingAnswerFlag = false;//填空题答案正确与否显示
        $scope.allExam = 1 ;//不同类型
        $scope.latestData = [];//题目列表

        $scope.q = {
            type:'',
            questionType:'',
            fuzzy:'',
            account:$rootScope.user.account
        };
        $scope.$watch('q', function () {
            $scope.refresh();
        },true);


        //下拉刷新
        $scope.selectChanged = function () {
            $scope.refresh();
        };
        $scope.refresh = function () {
            var q = AllService.getQuestionCollectList($scope.q);
            q.then(function (resp) {
                $scope.latestData =resp.data;
            });
        }
        $scope.refresh();

        //图表
        $scope.echartsOption = {

            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: "{a} <br/>{b}: {c}%"

            },
            grid: {
                top:'1%',
                left: '1%',
                right: '2%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'value',
                boundaryGap: [0, 1],
                min:0,
                max:100
            },
            yAxis: {
                type: 'category',
                data: ['正确率','完成率','收藏率']
            },
            series:
                {
                    name: '试题详细分析',
                    type: 'bar',
                    data: [0, 0, 0]
                }

        };
        //显示试题内容
        $scope.showContent = function(id){
            if($scope.questionOptionsShowFlag == id){
                $scope.questionOptionsShowFlag = -1;
            }else{
                $scope.questionOptionsShowFlag = id;
            }
            $scope.nowOption = '';
            $scope.showAnalysisFlag = -1;
            $scope.isSubmit = false;
            $scope.fillingAnswerFlag = false;
            changeEChartsOption(id);
        };
        //改变echarts图表
        function changeEChartsOption(id){
            var data ={questionId:id};
            var q = AllService.getQuestionCollectStatistics(data);
            q.then(function (resp) {
                var data = {};
                data.collectRate =(resp.data.collectNum/resp.data.doingNum).toFixed(2);//收藏率(几人收藏/几人做过)
                data.doneRate = (resp.data.doingNum/resp.data.doingUserNum).toFixed(2);//完成率（几人做过这道题/几人在网站做过题）
                data.rightRate = (resp.data.correct/resp.data.doingNum).toFixed(2);//正确率（几人做对/几人在做过）
                $scope.echartsOption.series.data = [data.rightRate*100,data.doneRate*100,data.collectRate*100];

            })
        }
        //选择选项
        $scope.changeOption = function (option) {
            $scope.nowOption = option;
            $scope.latestData;
        };
        //显示解析
        $scope.changeAnalysisFlag = function (hashkey) {
            $scope.showAnalysisFlag = hashkey;
        };
        //提交
        $scope.submitAnswer = function (item) {
            if(!App.isLogin())return;

            $scope.score = 0;//得分
            switch (item.analysis.answer.questionType) {
                case 3:
                case 1://单选
                {
                    $scope.answerResult = $scope.nowOption == item.analysis.answer.radio;
                    $scope.score  = $scope.answerResult? 2:-2;
                    break;
                }
                case 2://多选
                {
                    $scope.answerResult = true;
                    item.questionOptions.forEach(function (eachOption) {
                        if(! eachOption.check == item.analysis.answer.check[eachOption.option]) {
                            $scope.answerResult = false;
                        }

                    });
                    $scope.score  = $scope.answerResult? 4:-4;
                    break;
                }
                case 4://填空题
                {
                    item.questionOptions.forEach(function (eachOption) {
                        if(eachOption.detail == eachOption.myAnswer) {
                            eachOption.result = true;
                            $scope.score +=2;
                        }else{
                            eachOption.result = false;
                            $scope.score -=2;
                        }
                    });
                    $scope.fillingAnswerFlag = true;
                    break;
                }

            }
            $scope.isSubmit = true;

            var submitData ={
                id:item.id,
                account:$rootScope.user.account,
                addCredits:$scope.score
            }
            //上传数据库
            var q = AllService.answerQuestion(submitData);
            q.then(function (resp) {
                $scope.answerQuestionResp =( resp.data == 'true'?true:false);
            })

        };
        //取消收藏
        $scope.cancleCollect = function(item){
            var data = {
                account:$rootScope.user.account,
                id:item.id
            };
            var q = AllService.cancleCollectQuestion(data);
            q.then(function (resp) {
                if(resp.data =='true'){
                    $scope.refresh();
                }
            })
        };
    }

//个人肖像
    function PerInfoPortraitCtrl($scope) {
    }

//个人实力统计
    function PerInfoStatisticsCtrl($scope,AllService,args) {

        var account = args.account;
        $scope.echartsOption= {
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b}: {c} ({d}%)"
            },
            legend: {
                orient: 'vertical',
                x: 'left',
                data:['搜索引擎','单选题','多选题','填空题','判断题']
            },
            series: [
                {
                    name:'正确率',
                    type:'pie',
                    selectedMode: 'single',
                    radius: [0, '30%'],

                    label: {
                        normal: {
                            position: 'inner'
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    data:[
                        {value:335, name:'正确'},
                        {value:679, name:'错误'}
                    ]
                },
                {
                    name:'访问来源',
                    type:'pie',
                    radius: ['40%', '55%'],

                    data:[
                        {value:10, name:'单选题'},
                        {value:30, name:'多选题'},
                        {value:234, name:'判断题'},
                        {value:135, name:'填空题'},
                    ]
                }
            ]
        };
        function refresh(){
            var data ={
                account:account
            };
           var q = AllService.getQuestionRecordStatistics(data);
            q.then(function (resp) {
                refreshECharts(resp.data);
            })

        };
        function refreshECharts(data){
            $scope.echartsOption.series[0].data[0].value=data.correct;
            $scope.echartsOption.series[0].data[1].value=data.mistake;
            $scope.echartsOption.series[1].data[0].value=data.radio;
            $scope.echartsOption.series[1].data[1].value=data.check;
            $scope.echartsOption.series[1].data[2].value=data.judge;
            $scope.echartsOption.series[1].data[3].value=data.fill;
        }

        refresh();


    }

    angular.module('paper')
        .controller('PerInfoCtrl', PerInfoCtrl)
        .controller('PerInfoActivityCtrl', PerInfoActivityCtrl)
        .controller('PerInfoDiscussionCtrl', PerInfoDiscussionCtrl)
        .controller('PerInfoDetailCtrl', PerInfoDetailCtrl)
        .controller('PerInfoCollectCtrl', PerInfoCollectCtrl)
        .controller('PerInfoPortraitCtrl', PerInfoPortraitCtrl)
        .controller('PerInfoStatisticsCtrl', PerInfoStatisticsCtrl)

}(window.angular));