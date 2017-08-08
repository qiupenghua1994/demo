/**
 * Created by SEELE on 2017/1/7.
 */

(function () {
    var app = angular.module('service',[]);
    app.service('AllService', allService);
    //所有的服务控制中心
    function allService($http,$rootScope) {
        /*
        form的enctype属性为编码方式，常用有两种：application/x-www-form-urlencoded和multipart/form-data，
        默认为application/x-www-form-urlencoded。 当action为get时候，
        浏览器用x-www-form-urlencoded的编码方式把form数据转换成一个字串（name1=value1&name2=value2...），
        然后把这个字串append到url后面，用?分割，加载这个新的url。 当action为post时候，
        浏览器把form数据封装到http body中，然后发送到server。 如果没有type=file的控件，
        /x-www-form-urlencoded就可以了。 但是如果有type=file的话，就要用到multipart/form-data了。
        浏览器会把整个表单以控件为单位分割，并为每个部分加上Content-Disposition(form-data或者file),
        Content-Type(默认为text/plain),name(控件name)等信息，并加上分割符(boundary)。
        */
        var userData = {};//登录用户
        var postCfg = {
            headers: {'Content-Type': 'application/json; charset=UTF-8'},

        };
        //var url = 'Gulugulus/setMenu',
        //    data = {
        //        menu: JSON.stringify(menu),
        //        test: 'a String'
        //    },
        //    transFn = function(data) {
        //        return $.param(data);
        //    },
        //    postCfg = {
        //        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
        //        transformRequest: transFn
        //    };
        //
        //$http.post(url, data, postCfg)
        //    .success(function(){
        //        window.location.href = "Gulugulus/subMenu";
        //    });


        //登录
        this.login = function (user) {
            var type = 'login';
            var postData = "data=" + JSON.stringify(user) + "&type=" + type;
            var url = "/paper/LoginServlet.do?"// + postData;
            var q = $http.post(url, {}, postCfg)
            q.success(function (resp) {
                if (resp.status) {
                    userData = resp;
                }
            });
            return q;
        };
        //注册
        this.register = function (user) {
            var type = 'register';
            var postData = "data=" + JSON.stringify(user) + "&type=" + type;
            var url = "paper/LoginServlet.do?" + postData;
            return $http.post(url, {}, postCfg);
        };
        //注销
        this.logout = function () {
            $rootScope.user = null;
            userData = {};
        };
        //修改密码
        this.editPwd = function (data) {
            var postData = "data=" + JSON.stringify(data);
            var url = "paper.index.EditPwdServlet?" + postData;
            return $http.post(url, {}, postCfg);
        }
        //上传题目-自定义
        this.submitQuestion = function (question) {
            var type = 1;
            var postData = "data=" + JSON.stringify([question]) + "&type=" + type+"&account="+userData.account;
            var url = "QuestionService.do?" + postData;
            return $http.post(url, {}, postCfg);
        };
        //回答问题
        this.answerQuestion = function (data) {
            var postData = "data=" + JSON.stringify(data);
            var url = "paper.exam.CreateQuestionRecordServlet?" + postData;
            return $http.post(url, {}, postCfg);
        };
        //获取题目
        this.getQuestionList = function (data) {
            var type = 1;
            var postData = "data=" + JSON.stringify(data) + "&type=" + type;
            var url = "paper.exam.GetQuestionService?" + postData;
            return $http.post(url, {}, postCfg);
        };
        //获取最新消息
        this.getLatestNews = function(data){
            var postData = "data=" + JSON.stringify(data);
            var url = "paper.index.MessageServlet?" + postData;
            return $http.post(url, {}, postCfg);
        };
        //获取个人信息
        this.getPerInfoByAccount = function (account) {
            var data = {
                account:account,
                type:account==userData.account?'my':'other'
            }
            var postData = "data="+JSON.stringify(data);
            var url = "paper.perInfo.PerInfoServlet?" + postData;
            return $http.post(url,{},postCfg);
        };
        //创建帖子
        this.createDiscussion = function (data) {
            var postData = "data=" + JSON.stringify(data);
            var url = "paper.discussion.CreateDiscussionThemeServlet?" + postData;
            return $http.post(url, {}, postCfg);
        };
        //获取帖子列表
        this.getDiscussionThemeList = function (data) {
            var postData = "data=" + JSON.stringify(data);
            var url = "paper.discussion.GetDiscussionThemeServlet?" + postData;
            return $http.post(url, {}, postCfg);
        };
        //获取帖子内容
        this.getDiscussionContent = function (data) {
            var postData = "data="+ JSON.stringify(data);
            var url = "paper.discussion.GetDiscussionContentServlet?" + postData;
            return $http.post(url, {}, postCfg);
        };
        //修改个人资料
        this.editPerInfo = function (data) {
            var postData = "data="+JSON.stringify(data);
            var url = "paper.perInfo.EditPerInfo?" + postData;
            return $http.post(url, {}, postCfg);
        };
        //题目收藏
        this.collectQuestion = function(data){
            var postData = "data="+JSON.stringify(data);
            var url = "paper.exam.UpdateQuestionRecordServlet?" + postData;
            return $http.post(url, {}, postCfg);
        };
        //获取收藏的题目
        this.getQuestionCollectList = function (data) {
            var postData = "data="+JSON.stringify(data);
            var url = "paper.perInfo.GetQuestionCollectListServlet?" + postData;
            return $http.post(url, {}, postCfg);
        };
        //取消收藏
        this.cancleCollectQuestion = function (data) {
            var postData = "data="+JSON.stringify(data);
            var url = "paper.exam.CancelQuestionCollectServlet?" + postData;
            return $http.post(url, {}, postCfg);
        };
        //获取做题统计
        this.getQuestionRecordStatistics = function (data) {
            var postData = "data="+JSON.stringify(data);
            var url = "paper.perInfo.GetQuestionRecordStatisticsServlet?" + postData;
            return $http.post(url, {}, postCfg);
        };
        //获取收藏题目详细统计
        this.getQuestionCollectStatistics = function (data) {
            var postData = "data="+JSON.stringify(data);
            var url = "paper.perInfo.GetQuestionCollectStatisticsServlet?" + postData;
            return $http.post(url, {}, postCfg);
        };
        //获取排行榜
        this.getRankingList = function (data) {
            var postData = "data="+JSON.stringify(data);
            var url = "paper.index.GetRankingServlet?" + postData;
            return $http.post(url, {}, postCfg);
        };
        //回复帖子
        this.replyDiscussion = function (data) {
            var postData = "data="+JSON.stringify(data);
            var url = "paper.discussion.ReplyDiscussionServlet?" + postData;
            return $http.post(url, {}, postCfg);
        };
        //通过Id获取题目详情
        this.getQuestionById = function (data) {
            var postData = "data="+JSON.stringify(data);
            var url = "paper.exam.GetQuestionByIdServlet?" + postData;
            return $http.post(url, {}, postCfg);
        };
        //验证ID是否可用
        this.verityAccount = function (data) {
            var postData = "data="+JSON.stringify(data);
            var url = "paper.index.VerityAccountServlet?" + postData;
            return $http.post(url, {}, postCfg);
        };
        //获取待审核试题
        this.getQuestionCheck = function (data) {
            var postData = "data="+JSON.stringify(data);
            var url = "paper.manage.GetQuestionCheckServlet?" + postData;
            return $http.post(url, {}, postCfg);
        };
        //答复待审核试题
        this.uploadAuditQuestion = function (data) {
            var postData = "data="+JSON.stringify(data);
            var url = "paper.manage.UploadAuditQuestionServlet?" + postData;
            return $http.post(url, {}, postCfg);
        };
        //删除试题
        this.delQuestion = function (data) {
            var postData = "data="+JSON.stringify(data);
            var url = "paper.manage.DelQuestionServlet?" + postData;
            return $http.post(url, {}, postCfg);
        };
        //获取管理帖子列表
        this.getDiscussionListManage = function (data) {
            var postData = "data="+JSON.stringify(data);
            var url = "paper.manage.GetDiscussionListManageServlet?" + postData;
            return $http.post(url, {}, postCfg);
        };
        //删除帖子
        this.delDiscussion = function (data) {
            var postData = "data="+JSON.stringify(data);
            var url = "paper.manage.DelDiscussionServlet?" + postData;
            return $http.post(url, {}, postCfg);
        };
        //获取管理题目
        this.getQuestionManage = function (data) {
            var postData = "data="+JSON.stringify(data);
            var url = "paper.manage.GetQuestionManageServlet?" + postData;
            return $http.post(url, {}, postCfg);
        };
        //获取管理题目
        this.uploadFiles = function (data) {
            var postData = "data="+JSON.stringify(data);
            var url = "paper.file.UploadHandleServlet?" + postData;
            return $http.post(url, {}, postCfg);
        };
        //获取管理题目
        this.download = function (data) {
            debugger
            var postCfg = {
                headers: {'Content-Type': 'application/form-data; charset=UTF-8'},

            };
            var postData = "filename="+data.filename;
            var url = "paper.file.DownLoadServlet?" + postData;
            return $http.post(url, {}, postCfg);
        };


    }
})();