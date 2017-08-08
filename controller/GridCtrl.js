/**
 * Created by Administrator on 2017/7/28.
 */
(function (angular) {


   function GridController($scope){

      $scope.clearFormDate= function () {
         App.utils.clearFormDate($scope.first);
      };
      var data =[
         {no:'1',name:'笑傲王'},
         {no:'2',name:'对对对'},
         {no:'2',name:'对对对'},
         {no:'2',name:'对对对'},
         {no:'2',name:'对对对'},
      ];
      $scope.data1=1;
      $scope.grid = {
         //queryUrl:'test',
         onGridReady: function () {
            $scope.grid.api.setRowData(data);
         },
        // pageSize:20,

         columnDefs:[
            {
               headerName:'客户号',
               field:'no'
            },
            {
               headerName:'客户姓名',
               field:'name'
            }

         ]
      }
   }

   angular.module('paper')
       .controller('GridController', GridController)

}(window.angular));