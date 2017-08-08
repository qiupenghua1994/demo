/**
 * Created by SEELE on 2017/2/26.
 * 试题、考试页面控制器
 */

(function (angular) {

    //考试页面
    function ExamCtrl($scope,$rootScope, AllService) {

        var questionOptionsNum = 65;//ascll码 A
        $scope.questionOptionsShowFlag = -1;//是否显示答案选项
        $scope.showAnalysisFlag = -1;//是否显示解析
        $scope.nowOption = '';//现在选中的答案
        $scope.isSubmit = false;//是否已经提交
        $scope.fillingAnswerFlag = false;//填空题答案正确与否显示
        $scope.allExam = 1 ;//不同类型
        $scope.latestData = [];//题目列表
        $scope.q = {
            type:'',
            fuzzy:''
        }

        $scope.$watch("allExam",function(){
            $scope.refresh();
        });
        $scope.refresh = function () {
            switch ($scope.allExam){
                case 1:
                    var q = AllService.getQuestionList($scope.q);
                    q.then(function (resp) {
                        $scope.latestData =resp.data;
                    });
                    break;
                case 2:
                    break;
                case 3:
                    break;
                case 4:
                    break;
            }
        }

        //显示试题内容
        $scope.showContent = function(id){
            if(!App.isLogin())return;
            if($scope.questionOptionsShowFlag == id){
                $scope.questionOptionsShowFlag = -1;
            }else{
                $scope.questionOptionsShowFlag = id;
            }
            $scope.nowOption = '';
            $scope.showAnalysisFlag = -1;
            $scope.isSubmit = false;
            $scope.fillingAnswerFlag = false;
        };
        //选择选项
        $scope.changeOption = function (option) {
              $scope.nowOption = option;
            $scope.latestData;
        };
        //显示解析
        $scope.changeAnalysisFlag = function (hashkey) {
            $scope.showAnalysisFlag = hashkey;
        };
        //收藏试题
        $scope.cellectQuestion = function(item){
            var data = {
                account:$rootScope.user.account,
                id:item.id,
                collect:1
            };
            var q = AllService.collectQuestion(data);
            q.then(function(resp){
                App.notify('收藏成功')
            });
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
        //上传试题
        $scope.uploadFiles = function () {
        };

        //上传试题类型 1:单选题 、2：多选题、3：判断题、4：填空题、5：大题
        var questionType=$scope.questionType ;
        $scope.question = {
            digest:''
            ,analysis:{
                why:'',
                answer:[]
            }
            ,questionOptions:[]
        };//上传题目
        //改变上传试题类型
        $scope.changeQuestionType = function (type) {
            questionOptionsNum = 65;
            $scope.questionOptions = [];
            switch(type){
                case 1:$scope.questionType=1;
                    for(var i=0;i<4;i++){
                        $scope.addQuestionOptions();
                    }
                    break;
                case 2:$scope.questionType=2;
                    for(var i=0;i<4;i++){
                        $scope.addQuestionOptions();
                    }
                    break;
                case 3:$scope.questionType=3;
                    $scope.questionOptions.push({option: 'true', detail: ''})
                    $scope.questionOptions.push({option: 'false', detail: ''})
                    break;
                case 4:$scope.questionType=4;

                    $scope.addQuestionOptions();
                    break;
                case 5:$scope.questionType=5;
                    break;
            };
            $scope.question.questionType = $scope.questionType;

        };

        //题目答案选项数组
        $scope.questionOptions = [];
        //答案数组
        $scope.questionOptionsAnswer ={
            questionType:'',
            radio:'',
            check:{},
        };
        //增加选项
        $scope.addQuestionOptions = function () {
            var option = String.fromCharCode(questionOptionsNum++);
            $scope.questionOptions.push({option: option});
        };
        //减少选项
        $scope.deleteQuestionOptions = function () {
            if ($scope.questionOptions.length) {
                $scope.questionOptions.splice($scope.questionOptions.length - 1, 1);
                questionOptionsNum--;
            };

        };
        //提交问题
        $scope.submitQuestion = function () {
            if(!App.isLogin())return;
            $scope.questionOptionsAnswer.questionType = $scope.questionType;
            switch ($scope.questionType){//1:单选题 、2：多选题、3：判断题、4：填空题、5：大题
                case 1:{
                    $scope.question.question = '【单选题】'+$scope.question.question;
                    break;
                }
                case 2:{
                    $scope.question.question = '【多选题】'+$scope.question.question;
                    break;
                }
                case 3:{
                    $scope.question.question = '【判断题】'+$scope.question.question;
                    break;
                }
                case 4:{
                    $scope.question.question = '【填空题】'+$scope.question.question;
                    break;
                }
                case 5:{
                    $scope.question.question = '【大题】'+$scope.question.question;
                    break;
                }
            }
            $scope.question.questionOptions=angular.copy($scope.questionOptions);
            $scope.question.analysis.answer = $scope.questionOptionsAnswer;
            var q=AllService.submitQuestion($scope.question);
            q.then(function () {
                App.notify("上传成功");
                $scope.question = {
                    digest:''
                    ,analysis:{
                        why:'',
                        answer:[]
                    }
                    ,questionOptions:[]
                };//上传题目
                //题目答案选项数组
                $scope.questionOptions = [];
                //答案数组
                $scope.questionOptionsAnswer ={
                    questionType:'',
                    radio:'',
                    check:{},
                };
                $scope.changeQuestionType($scope.questionType);
            });

        };

        $scope.changeQuestionType(1);
    }

    //考场
    function ExamRoomCtrl($scope, $http) {

        $scope.latestData = [
            {newsContent: '网络工程师2016上午场真题', newsTime: '2016年11月20日', newsId: '10116126191600'}
            , {newsContent: '网络工程师2016上午场真题', newsTime: '2016年11月20日', newsId: '10116126191600'}
            , {newsContent: '网络工程师2016上午场真题', newsTime: '2016年11月20日', newsId: '10116126191600'}
            , {newsContent: '网络工程师2016上午场真题', newsTime: '2016年11月20日', newsId: '10116126191600'}

        ];

    }
    //弹窗做题
    function EcamDialogCtrl($scope,$rootScope,AllService,args){

        $scope.title = '请答题';
        $scope.item = {};//题目内容
        function getQuestionById(){
            var q =AllService.getQuestionById({questionId:args.id});
            q.then(function (resp) {
                $scope.item = resp.data;
            });
        };


        //选择选项
        $scope.changeOption = function (option) {
            $scope.nowOption = option;
            $scope.latestData;
        };
        //显示解析
        $scope.changeAnalysisFlag = function (hashkey) {
            $scope.showAnalysisFlag = hashkey;
        };
        //收藏试题
        $scope.cellectQuestion = function(item){
            var data = {
                account:$rootScope.user.account,
                id:item.id,
                collect:1
            };
            var q = AllService.collectQuestion(data);
            var q = AllService.collectQuestion(data);
            q.then(function(resp){
                App.notify('收藏成功')
            });
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

        getQuestionById();

    }

    angular.module('paper')
        .controller('ExamCtrl', ExamCtrl)
        .controller('ExamRoomCtrl', ExamRoomCtrl)
        .controller('EcamDialogCtrl', EcamDialogCtrl)

}(window.angular));