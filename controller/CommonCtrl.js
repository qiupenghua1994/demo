/**
 * Created by SEELE on 2017/4/13.
 */
/**
 * Created by SEELE on 2017/2/18.
 * 讨论页面控制器
 */
(function (angular) {

    function DeleteDialogCtrl($scope) {
        $scope.title='提示';
        $scope.save = function () {
            $scope.$close(true);
        }
    }

    function FileCtrl($scope,AllService,Upload){
        $scope.title='文件上传';
        $scope.file=null;
        $scope.save = function () {
            var a = $scope.file;
            var a1 = $scope.picFile;
            AllService.uploadFiles(a1);
        };
        $scope.download = function () {
           var q = AllService.download({filename:'1be06bb3-ecdb-4e2c-8ba9-890af121df35_百度下载帐号.txt'});
        }
        $scope.upload = function (file) {
            $scope.fileInfo = file;
            Upload.upload({
                //服务端接收
                url: 'paper.file.UploadHandleServlet',
                //上传的同时带的参数
                data: {'username': 1},
                //上传的文件
                file: file
            }).progress(function (evt) {
                //进度条
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                console.log('progess:' + progressPercentage + '%' + evt.config.file.name);
            }).success(function (data, status, headers, config) {
                //上传成功
                console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                $scope.uploadImg = data;
            }).error(function (data, status, headers, config) {
                //上传失败
                console.log('error status: ' + status);
            });
        };
    }




    angular.module('paper')
        .controller('DeleteDialogCtrl', DeleteDialogCtrl)
        .controller('FileCtrl', FileCtrl)

}(window.angular));
