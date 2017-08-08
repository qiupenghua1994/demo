
/**
 * Created by SEELE on 2017/1/8.
 * echarts 插件指令
 */
(function (angular,$) {

//柱形图
    function eChartsDirective() {
        return{
            restrict:'AE',
            scope :{
                option:'='
            },
            template:'<div>这是柱图</div>',
            controller: function($scope){
            },
            link:function(scope,element,attr){

                scope.$watch('option', function () {
                    var chart =  element.find('div')[0];
                    var parent = element['context'];
                    //    console.log(parent.clientHeight+":"+parent.clientWidth);
                    chart.style.width =parent.clientWidth+'px';
                    chart.style.height =parent.clientHeight+'px';

                    var myChart = echarts.init(chart);

                    myChart.setOption(scope.option);
                    myChart.resize();
                },true)
            }
        };
    }

    angular.module('myDirective')
        .directive('eCharts',eChartsDirective)


})(window.angular,window.JQuery)