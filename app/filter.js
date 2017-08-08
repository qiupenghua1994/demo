/**
 * Created by Administrator on 2017/4/16.
 * 一些过滤
 */
(function (angular,$) {

    function workTypeFilter(){
        return function (input) {
            var typeArray = {
                '101': '信息处理技术员',
                '102': '程序员',
                '103': '网络管理员',
                '201': '软件设计师',
                '202': '网络工程师',
                '203': '嵌入式系统设计师',
                '301': '电子商务设计师',
                '302': '信息系统项目管理师',
                '303': '系统架构师',
                '304': '网络规划师'
            };
            return typeArray[input];
        }
    }

    angular.module('filter',[])
        .filter('examTypeFilter',workTypeFilter)
})(window.angular,window.JQuery);
