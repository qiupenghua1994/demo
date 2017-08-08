(function(angular,$){



    function gfGridDirective($compile,$q,$timeout){

        var templateColumnsPanelTitle='<span class="glyphicon glyphicon-th gf-column-panel-title"></span>';

        var templateColumnsPanelBody = '';

        var template =' <div ag-grid="$gridCtrl.gfGrid.agGrid" class="ag-blue gf-grid"></div> ';
        //' <div class="gf-grid-status-bar" ng-show="$gridCtrl.gfGrid.statusBar"> '+
        //
        //'  <span>总记录数:</span> '+
        //'  <span ng-bind="$gridCtrl.agGrid.api.getFilterRowCount()"></span> '+
        //'      <span ng-show="$gridCtrl.gfGrid.selectedCount>0 && $gridCtrl.gfGrid.multiSelect"> '+
        //'     <span class="status-bar">选中行数:<span ng-bind="$gridCtrl.agGrid.selectedCount"></span></span> '+
        //'  <span class="font-red" title="最大可选中行数">/{{$gridCtrl.gfGrid.maxSelectRowCount}}</span> '+
        //' <a ng-click="$gridCtrl.gfGrid.api.clearSelection()">清空选择</a> '+
        //'     </span> '+
        //'    <span ng-show="$gridCtrl.gfGrid.filterDisplayName"> '+
        //'     <span class="status-gap" title="{{$gridCtrl.gfGrid.filterDisplayName}}"> '+
        //'     过滤条件:<b class="filter-text" ng-bind="$gridCtrl.gfGrid.filterDisplayName"></b> '+
        //'     </span> '+
        //'     <a ng-click="$gridCtrl.gfGrid.api.clearFilter()">清空过滤</a> '+
        //'    </span> '+
        //'    <span class="error" ng-bind="$gridCtrl.gfGrid.lastError"></span> '+
        //'    </div> ';


        var localeTextObj = {
            'autosizeThiscolumn':'自动调整列宽'
            ,'autosizeAllColumns':'自动调整所有列宽'
            ,'loadingOoo':'正在加载'
        };

        /**
         * agGrid默认配置
         * @type {{localeText: {autosizeThiscolumn: string, autosizeAllColumns: string, loadingOoo: string}, rowHeight: number, colWidth: number, maxColWidth: number, enableStatusBar: boolean, groupHeaders: boolean, enableColResize: boolean, suppressContextMenu: boolean, enableFilter: boolean, suppressMenuMainPanel: boolean}}
         */
        var defaultAgGrid = {
            localeText:localeTextObj,
            rowHeight:28,
            colWidth:100,
            rowSelection:'multiple',
            maxColWidth:500,
            enableStatusBar:false,
            groupHeaders:false,
            enableColResize:false,
            suppressContextMenu:false,
            enableFilter:false,
            //suppressRowClickSelection:true,
            suppressMenuMainPanel:false,
            suppressMenuColumnPanel:true,
            suppressMenuFilterPanel:false,
            suppressLoadingOverlay:true,//禁止显示 正在加载
            suppressNoRowsOverlay:true,//禁止显示 没有记录

        };

        var defaultVirtualPageGrid= {
            enableSorting:false,
            suppressMenuFilterPanel:true,
            rowModelType:'virtual',
            /**
             * paginationInitialRowCount ：初始化加载的记录数，
             * 例如：如果设置为100，当前页面大小设置为100，当加载完成一页数据后，如果还有数据，那么会再一次加载90条，
             *      如果设置为0，则不会继续加载下一页
             * paginationOverflowSize ：控制加载下一页的时机，例如当前页大小设置为100，那么当滚动到100-10=90行时，会自动加载下一页
             * maxPagesInCache:100 ：最大缓存页数
             * paginationPageSize ：页大小
             */
            paginationInitialRowCount:0,
            paginationOverflowSize:1,
            maxPagesInCache:100
        };
        var setupVirtualPageGrid =function(agGrid,pageSize){
            for(var key in defaultVirtualPageGrid){
                agGrid[key] = defaultVirtualPageGrid[key];
            }
            agGrid.paginationPageSize=pageSize;
            agGrid.paginationOverflowSize=pageSize;
        };


        function gridDirectiveLink(scope,element,attrs){
            element.addClass('gf-grid-container');
        }

        function gridControler($scope,$attrs,$conn){

            var deferGridReady = $q.defer();
            var promiseLoadProfiles;
            var ctrl=this;
            var grid = initGrid(ctrl,$attrs);
            var needAutoFit = true;

            var agGrid = {
             //   rowSelection:grid.multiSelect?'multiple':'single'
            };

            var scopeForLink = $scope.$parent.$new();
            scopeForLink.handlerMap = {};
            scopeForLink.elemCache = angular.$createElementCache(scopeForLink);

            setupAgGrid(grid,agGrid);
            setupGrid(grid,agGrid);
            /**
             * 设置agGrid
             * @param grid
             * @param agGrid
             */
            function setupAgGrid(grid,agGrid){
                angular.extend(agGrid,defaultAgGrid,grid.agGrid);
                if(grid.pageSize>0){
                    //设置虚拟分页
                    setupVirtualPageGrid(agGrid,grid.pageSize);
                    grid.maxSelectRowCount = grid.pageSize*agGrid.maxPagesInCache;
                }

                if(grid.getNodeChildDetails){
                    agGrid.getNodeChildDetails = grid.getNodeChildDetails;
                }

                if(!grid.disabledColumnMenu){
                    angular.extend(agGrid,{
                        suppressMenuMainPanel:true,
                        suppressMenuColumnPanel:true,
                        suppressMuenFilterPanel:false
                    })
                    //自定义选择列面板
                    setupMenuColumnPanel();
                }

                //设置事件
                setupAgGridEvents(grid,agGrid);

                //回传agGrid对象
                grid.agGrid = agGrid;


                /**
                 * 自定义选择列面板
                 */
                function setupMenuColumnPanel(){
                    var panels = [];
                    agGrid.getCustomMenuPanels = function (column) {
                        var colDef = column.colDef;

                        if(panels.length==0){
                            panels[0] = new MenuColumnsPanel($scope,grid,colDef);
                        }else{
                            angular.$apply($scope, function () {
                                panels[0].initColumnState(colDef);
                            });
                        }
                        return panels;
                    }
                }

                function setupAgGridEvents(grid,agGrid){
                    var events = {
                        onGridReady:onAgGridReady,
                        onSelectionChanged:onAgSelectionChanged,
                        onRowDoubleClicked:onAgRowDoubleClicked,
                        onRowClicked:onAgRowClicked
                    };
                    angular.extend(agGrid,events);

                    function onAgRowDoubleClicked(params){
                        grid.callbacks.onRowDoubleClicked(params);
                    }

                    function onAgRowClicked(params){
                        grid.callbacks.onRowClicked(params);

                        var event = params.event;
                        var multiSelectKeyPressed = event.ctrlKey||event.metaKey;
                        var shiftKeyPressed = event.shiftKey;
                        var rowNode = params.node;
                        if(rowNode.allLeafChildren && grid.selectedCount>1
                            && !multiSelectKeyPressed && !shiftKeyPressed){
                            var clear = window.confirm("当前已经选择了"+grid.selectedCount+"行数据，点击确认清除，点击取消返回");
                            if(!clear){
                                params.cancelSelectRow = true;
                            }
                        }
                    }

                    function onAgSelectionChanged(params){
                        angular.$apply($scope, function () {
                            grid.callbacks.onSelectionChanged(params);
                        });
                    }


                    /**
                     * agGrid初始化完成
                     */
                    function onAgGridReady(){
                        deferGridReady.resolve();
                    }
                }
            }

            function setupGrid(grid,agGrid){
                //封装api
                bulidGridApi(grid,agGrid);

                /**
                 * 设置grid回调
                 */
                grid.callbacks=setupCallbacks(grid);

                onAllReady();

                function onAllReady(){
                    if(promiseLoadProfiles){
                        $q.all([promiseLoadProfiles,deferGridReady.promise]).then(grid.callbacks.onReady);
                    }else{
                        deferGridReady.promise.then(grid.callbacks.onReady);
                    }
                }
                /**
                 * 设置grid回调
                 * @param grid
                 */
                function setupCallbacks(grid){

                    /**
                     * 从后台加载数据完成后回调
                     * @param resp
                     */
                    function onResponseData(resp){
                        if(grid.onResponseData){
                            grid.onResponseData(resp);
                        }
                    }

                    /**
                     * 数据加载后回调
                     * @param params
                     */
                    function onDataLoaded(params){
                        if(!needAutoFit){
                            return;
                        }

                        if(params.data && params.data.length>0){
                            needAutoFit = false;
                            grid.api.tryAutoFitColumn();
                        }
                    }

                    function onRowDoubleClicked(params){
                        if(grid.onRowDoubleClicked){
                            grid.onRowDoubleClicked(params);
                        }
                    }

                    function onRowClicked(){
                        if(grid.onRowClicked){
                            grid.onRowClicked(params);
                        }
                    }

                    function onSelectionChanged(params){
                        grid.selectCount = agGrid.api.getSelectedRows.length;
                        if(grid.onSelectionChanged){
                            grid.onSelectionChanged(params);
                        }
                    }

                    /**
                     * 过滤数据完成后回调
                     */
                    function onFilter(){
                        if(grid.onFilter){
                            grid.onFilter();
                        }
                    }

                    function onReady(){
                        if(grid.autoLoad){
                            grid.api.reloadData();
                        }else{
                            grid.api.tryAutoFitColumns();
                        }

                        if(grid.onGridReady){
                            grid.onGridReady();
                        }else if(grid.onReady){
                            grid.onReady();
                        }
                    }

                    function onBuildColumnDefs(columns){
                        if(grid.onBuildColumnDefs){
                            grid.onBuildColumnDefs(columns);
                        }
                    }

                    /**
                     * 重新加载数据前回调
                     * @param args
                     */
                    function onReloadDataBefore(args){
                        scopeForLink.elemCache.clear();
                        if(grid.onReloadDataBefore){
                            grid.onReloadDataBefore(args);
                        }
                    }

                    function getDefaultColumnDefs(){
                        if(grid.getDefaultColumnDefs){
                            return grid.getDefaultColumnDefs();
                        }
                        return null;
                    }

                    function onQueryFromServer(req,params){
                        if(grid.onQueryFromServer){
                            return grid.onQueryFromServer(req.params);
                        }
                    }

                    function onColumnVisibleChanged(params){
                        if(grid.onColumnVisibleChanged){
                            grid.onColumnVisibleChanged(params);
                        }
                    }


                    var callbacks = {
                        onReady:onReady,
                        onResponseData:onResponseData,
                        onDataLoaded:onDataLoaded,
                        onRowDoubleClicked:onRowDoubleClicked,
                        onRowClicked:onRowClicked,
                        onSelectionChanged:onSelectionChanged,
                        onFilter:onFilter,
                        onBuildColumnDefs:onBuildColumnDefs,
                        onReloadDataBefor:onReloadDataBefore,
                        getDefaultColumnDefs:getDefaultColumnDefs,
                        onQueryFromServer:onQueryFromServer,
                        onColumnVisibleChanged:onColumnVisibleChanged
                    }

                    return callbacks;
                }

                /**
                 * 封装api
                 * @param grid
                 * @param agGrid
                 */
                function bulidGridApi(grid,agGrid){
                    grid.api = {
                        reloadData:reloadData,
                        loadUserProfiles:loadUserProfiles,
                        saveUserProfiles:saveUserProfiles,
                        getSelectedNodes: function () {
                            return agGrid.api.getSelectedNodes();
                        },
                        getSelectedRow: function () {
                            return agGrid.api.getSelectedRow();
                        },
                        getRenderedNodes: function () {
                            return agGrid.api.getRenderedNodes();
                        },
                        setQuickFilter: function (text) {
                            agGrid.api.setQuickFilter();
                        },
                        clearFilter:clearFilter,
                        refreshView: function () {
                            agGrid.api.refreshView();
                        },
                        refreshRows:refreshRows,
                        removeSelectedRows:removeSelectedRows,
                        addRows:addRows,
                        filterChanged:filterChanged,
                        clearData:clearData,
                        setRowData:setRowData,
                        getRowData:getRowData,
                        setColumnDefs: function (columnDefs) {
                            grid.columnDefs = columnDefs;
                            setupColumnDefs(columnDefs);
                        },
                        // setupDynamicColumnDefs:setupDynamincColumnDefs,
                        getDynamicColumnDefs: function () {
                            return grid.dynamicColumnDefs;
                        },
                        // getDisplayColumnDefs:getDisplayColumnDefs,
                        //getDictColumnDefs:getDictColumnDefs,
                        getColumnDefs: function (field) {
                            return agGrid.api.getColumnDefs(field);
                        },
                        //clearSelection:clearSelection,
                        tryAutoFitColumns:tryAutoFitColumns
                    };

                    function tryAutoFitColumns(){
                        if(grid.autoColumnSize){
                            agGrid.columnApi.autosizeAllColumns();
                        }else if(grid.autoFit){
                            agGrid.api.sizeColumnToFit();
                        }
                    }

                    function setupDynamincColumnDefs(){

                    }

                    function reloadData(args){
                        if(!grid.queryUrl){
                            throw new Error('invalid queryUrl');
                        }

                        var p;
                        if(grid.pageSize){
                            p=reloadPagingData(args);
                        }else{
                            p=relodaNodePagingData(args);
                        }

                        if(grid.showQueryBolcking){
                            gris.api.showLoading(p);
                        }
                        return p;
                    }
                    function loadUserProfiles(){

                    }
                    function saveUserProfiles(){

                    }
                    function clearFilter(){
                        angular.forEach(agGrid.api.filterManager.allFilters, function (fiterWrapper) {
                            fiterWrapper.column.setFilterActive(false);
                        });
                        agGrid.api.filterManager.destory();
                        agGrid.api.filterManager.onFilterChanged();
                    }

                    /**
                     * 刷新选中行或指定行的数据
                     * @param rowNodes
                     */
                    function refreshRows(rowNodes){
                        if(!rowNodes){
                            rowNodes = agGrid.api.getSelectedNodes();
                        }else if(!angular.isArray(rowNodes)){
                            rowNodes = [rowNodes];
                        }
                        agGrid.api.refreshRows(rowNodes);
                    }

                    /**
                     * 删除选中行
                     * @param q
                     */
                    function removeSelectedRows(q){
                        var api = agGrid.api;
                        var selectedNodes = api.getSelectedNodes();
                        if(selectedNodes.length===0){
                            return;
                        }

                        if(q){
                            q.then(function () {
                                api.removeItem(selectedNodes);
                            });
                        }else{
                            api.removeItem(selectedNodes);
                        }
                        grid.totalRowCount -=selectedNodes.length;

                    }
                    function addRows(){

                    }
                    function filterChanged(){

                    }
                    function clearData(){

                    }
                    function setRowData(rows,rowList){
                        agGrid.api.setRowData(rows);
                        grid.totalRowCount =rowList?rowList.length:rows.length;
                        grid.treeTotalRowCount = rowList?rowList.length:undefined;
                        grid.callbacks.onDataLoaded({data:rows});

                    }
                    function getRowData(){
                        var rowData = [];
                        agGrid.api.forEachNode(function (node) {
                            rowData.push(node.data);
                        });
                        return rowData;

                    }

                    /**
                     * 获得绑定的查询条件
                     * @returns {string|*}
                     */
                    function getBindQueryArgs(){
                        return ctrl.queryArgs || grid.q;
                    }

                    function buildQueryRequestArgs(arg){
                        var reqArgs = {};
                        if(grid.queryArgName){
                            reqArgs[grid.queryArgName] = arg;
                        }else {
                            angular.extend(reqArgs,arg);
                        }
                        return reqArgs;
                    }

                    /**
                     * 分页加载的默认的默认数据源
                     * @type {{queryArgs: null, deferLoader: null, rowCount: Function}}
                     */
                    var dataSource = {
                        queryArgs:null,
                        deferLoader:null,
                        rowCount: function () {
                            return 0;
                        }
                    };

                    function getNextRows(params){
                        var startRow = params.startRow;
                        var endRow = params.endRow;
                        var pageSize = endRow -startRow;
                        var page = {
                            pageIndex:startRow/pageSize,
                            pageSize:pageSize,
                            total:startRow === 0?0 :grid.totalRowCount
                        };
                        var reqArgs = buildQueryRequestArgs(getQueryArgForDatasource());
                        reqArgs.page = page;
                       // setSortModel(page,params.sortModel);
                        var promise = doQueryFromServer(reqArgs,params);
                        promise.success(function (resp) {
                            if(dataSource.deferLoader){
                                dataSource.deferLoader.resolve(resp);
                            }

                            grid.callbacks.onResponseData(resp);
                            if(resp.count>=0){
                                grid.totalRowCount =resp.count;//界面上显示总行数
                            }else if(resp.page&& resp.page.total){
                                grid.totalRowCount = resp.page.total;//界面上显示的总行数
                            }

                            //如果想防止用户将滚动条拉到最下面，则不返回lastRow，但是需要在返回最后一页时设置lastRow
                            var lastRow = endRow>=grid.totalRowCount?grid.totalRowCount:-1;
                            params.successCallback(resp.data,lastRow);
                            grid.callbacks.onDataLoaded({data:resp.data,page:page});
                        }).error(function (e) {
                            if(dataSource.deferLoader){
                                dataSource.deferLoader.reject(e);
                            }
                            params.failCallback(e);
                            if(startRow==0){
                                params.successCallbacks([],startRow);
                            }
                        });
                    }

                    dataSource.getRows = getNextRows;


                    /**
                     * 获得分页查询条件
                     */
                    function getQueryArgForDatasource(){
                        if(dataSource.queryArgs){
                            return dataSource.queryArgs;
                        }
                        return getBindQueryArgs();
                    }

                    /**
                     * 加载分页数据
                     * @param args
                     */
                    function reloadPagingData(args){
                        dataSource.queryArgs = args;
                        grid.callbacks.onReloadDataBefor(getQueryArgForDatasource());

                        dataSource.deferLoader = $q.defer();
                        agGrid.api.setDatasource(dataSource);
                        grid.callbacks.onSelectionChanged();
                        return dataSource.deferLoader.promise;
                    }
                    /**
                     * 加载所有数据
                     * @param args
                     */
                    function relodaNodePagingData(args){
                        if(!args){
                            args = getBindQueryArgs();
                        }
                        grid.callbacks.onReloadDataBefor(args);
                        var reqArgs = buildQueryRequestArgs(args);
                        return doQueryFromServer(reqArgs,null, function (resp) {
                            grid.callbacks.onResponseData(resp);
                            if(resp.data){
                                grid.totalRowCount = resp.data.length;
                            }
                            agGrid.api.setRowData(resp.data);
                            grid.callbacks.onDataLoaded({data:resp.data});
                            grid.callbacks.onSelectionChanged();
                        });
                    }

                    function doQueryFromServer(reqArg,params,success){
                        if(reqArg.page && reqArg.page.pageIndex === 0){
                            scopeForLink.elemCache.clear();
                        }

                        grid.lastError = '';
                        grid.callbacks.onQueryFromServer(reqArg,params);

                        return $conn.biz(grid.queryUrl,reqArg,success,onQueryError);

                        function onQueryError(error,code){
                            if(error && error.message){
                                grid.lastError = error.message;
                            }
                            if(code){
                                grid.lastError += ' '+code;
                            }
                        }
                    }
                }
            }


        }


        /**
         * 初始化grid默认参数
         * @param grid
         * @param $attrs
         */
        function initGrid(ctrl,$attrs){
            var grid = ctrl.gfGrid;
            grid.multiSelect = angular.getBoolAttr($attrs,'multiSelect',grid.multiSelect,true);
            grid.pageSize= angular.getIntAttr($attrs,'pageSize',grid.pageSize,0);
            grid.gridNo = ctrl.gridNo || $attrs.gridNo;
            if(!grid.queryUrl){
                grid.queryUrl = ctrl.url||$attrs.queryUrl;
            }

            grid.queryArgName = angular.getAttrVal($attrs,'queryArgName',grid.queryArgName,'q');
            grid.autoLoad = angular.getBoolAttr($attrs,'autoLoad',grid.autoLoad,false);
            grid.autoFit = angular.getBoolAttr($attrs,'autoFit',grid.autoFit,false);
            grid.autoColumnSize = angular.getBoolAttr($attrs,'autoColumnSize',grid.autoColumnSize,false);

            if(!grid.filter){
                grid.filter = {};
            }
            grid.statusBar = angular.getBoolAttr($attrs,'statusBar',grid.statusBar,false);
            grid.statusCountBar = angular.getBoolAttr($attrs,'statusCountBar',grid.statusCountBar,false);
            grid.disableColumnMenu = angular.getBoolAttr($attrs,'disableColumnMenu',grid.disableColumnMenu,false);
            grid.showQueryBloking = angular.getBoolAttr($attrs,'showQueryBloking',grid.showQueryBloking,false);

            return grid;
        }

        var directive = {
            restrict:'A',
            priority:1,//优先级
            /**
             * link 与controller 的基本区别，
             * link可以通过require与其他的指令控制交互
             * controller可以暴露一个API，可以放入依赖注入
             */
            link:gridDirectiveLink,
            controller:gridControler,
            bindToController:true,
            controllerAs:'$gridCtrl',
            template:template,
            scope:{
                gfGrid:'=',
                gridNo:'@',
                url:'@',
                multiSelect:'@',
                queryArgs:'<'
            }
        };

        return directive;

    }







    angular.module('myDirective').directive('gfGrid',gfGridDirective)
})(window.angular,window.JQuery);