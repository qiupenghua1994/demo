/**
 * Created by SEELE on 2017/1/8.
 * 指令集合
 */
(function (angular,$) {


    var dlgHeader = '<div class="modal-header">' +
        '<button type="button" class="close" ng-click="$dismiss()" aria-label="关闭"><span aria-hidden="true">&times;</span></button>' +
        '<h4 class="modal-title" ng-bind="title"></h4>' +
        '</div>';
    var dlgFooter = '<div class="modal-footer">' +
        '        <button gf-button-save ng-show="$saveButton" type="button" class="btn btn-primary" ng-disabled="$form.$invalid ||$errorForm">' +
        '        <span ng-bind="$saveButton"></span>' +
        '        </button>' +
        '        <button gf-button-close ng-show="$cancelButton" type="button" class="btn btn-default">' +
        '        <span ng-bind="$cancelButton"></span>' +
        '        </button>' +
        '        </div>';
    gfFormDialogDirective.$inject = ['$compile','$templateRequest']
    function gfFormDialogDirective($compile,$templateRequest){
        return {
            restrict:'A',
            require:'?form',
            link:function(scope,elem,attrs,formController){
                elem.addClass('modal-body row');
                var eleHeader = attrs.eleHeader;

                if(eleHeader=='false'){
                    return
                }else{
                    eleHeader =angular.element(dlgHeader);
                    elem.before(eleHeader);

                    $compile(eleHeader)(scope);
                }


                var $dismiss = scope.$dismiss;
                scope.$dismiss = function (args) {
                    if(scope.cancel){
                        scope.cancel(args);
                    }else{
                        $dismiss(args);
                    }
                };

                if(angular.isUndefined(attrs.dlgFooter)||attrs.dlgFooter!='false'){
                    var saveButton = '保存';
                    var cancelButton = '取消';
                    if(angular.isDefined(attrs.saveButton)){
                        saveButton = attrs.saveButton;
                    }
                    if(angular.isDefined(attrs.cancelButton)){
                        cancelButton = attrs.cancelButton;
                    }

                    scope.$saveButton = saveButton === 'false'?'':saveButton;
                    scope.$cancelButton = cancelButton === 'false'?'':cancelButton;

                    var footerTemplateUrl = attrs.footerTemplateUrl;
                    if(footerTemplateUrl){
                        if(footerTemplateUrl=='false'){
                            return;
                        }
                        //使用自定义模版
                        $templateRequest(footerTemplateUrl,true).then(function(response){
                            if(scope.$$destroyed)return;
                            var eleFooter =angular.element(response);
                            elem.after(eleFooter);
                            $compile(eleFooter)(scope);
                        });
                    } else{
                        //使用默认模版
                        var eleFooter = angular.element(dlgFooter);
                        elem.after(eleFooter);
                        $compile(eleFooter)(scope);
                    }
                }

                if(formController){
                    scope.$form = formController;
                }

            },

        };
    }

    /**
     * 图标按钮指令封装
     * @param name
     * @param defaultFn
     * @param iconCls
     */
    function gfIconButtonDirectiveFactory(name,defaultFn,iconCls){
        return ['$parse',function($parse){
            var buttonDirective = {
                restrict:'A',
                link:function(scope,elem,attrs){
                    elem.addClass('gf-button');
                    var el = angular.element('<i class="'+iconCls+'"></i>');
                    elem.prepend(el);
                    if(attrs.ngClick){
                        return;
                    }

                    var fnExpr = attrs[name];
                    var fnOnClick = fnExpr? $parse[fnExpr]:scope[defaultFn];
                    if(!fnOnClick){
                        return;
                    }

                    elem.bind('click',function(evt){
                        if(elem.disabled){
                            return;
                        }
                        angular.$apply(scope,fnOnClick);
                    });
                }
            };
            return buttonDirective;
        }]
    }
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


    angular.module('myDirective',[])
        .directive('gfFormDialog',gfFormDialogDirective)
        .directive('gfButtonSave',gfIconButtonDirectiveFactory('gfButtonSave','save','fa fa-check'))
        .directive('gfButtonClose',gfIconButtonDirectiveFactory('gfButtonClose','$dismiss','fa fa-close'))
        .directive('eCharts',eChartsDirective)


})(window.angular,window.JQuery)