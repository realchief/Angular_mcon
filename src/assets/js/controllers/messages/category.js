// App.controller('MessagesCategories', ['$rootScope', '$scope', '$localStorage', '$window', 'apiHostUrl',
//     function ($rootScope, $scope, $localStorage, $window, apiHostUrl) {
App.controller('MessagesCategories', ['$rootScope', '$scope', '$localStorage', '$window', '$http', 'apiHostUrl',
    function ($rootScope, $scope, $localStorage, $window, $http,apiHostUrl) {

        $scope.get_frontend_categories = function(){
            $http({
                method : 'GET',
                url: apiHostUrl + '/frontend_categories',
            }).then(function(response){

                $rootScope.categories = response['data']

            },function(error){
                console.log(error);
            });
        }

        // it's used for testing, it should be removed after integration with backend.
        $scope.max_idx = 1;

        // Init Categories Table
        if (!$rootScope.categories) $rootScope.categories = [];

        $scope.new_cat = {
            id: 0,
            name: null,
            url: null
        }

        $scope.edit = function (index) {
            $scope.new_cat = {
                id: $rootScope.categories[index].id,
                name: $rootScope.categories[index].name,
                url: $rootScope.categories[index].url
            };
            jQuery('#modal-popin').modal('show');
        }

        $scope.save = function () {

            if ($scope.new_cat.id) {
                for (var i = 0;i < $rootScope.categories.length; i ++)
                {
                    if ($rootScope.categories[i].id == $scope.new_cat.id) {
                        $rootScope.categories[i] = angular.copy($scope.new_cat);
                        var persist_id = $rootScope.categories[i].id
                        break;
                    }
                }
            }
            else if ($scope.new_cat.name && $scope.new_cat.url) {
                var id = $scope.max_idx + 1;
                var persist_id = id
                $scope.max_idx = id;
                $rootScope.categories.push({
                    id: id,
                    name: $scope.new_cat.name,
                    url: $scope.new_cat.url
                });
            }
            $http({
                method: 'POST',
                url: apiHostUrl + '/frontend_categories',
                data: $scope.new_cat
            }).then(function(response){
                console.log(response);
                var current_category = $rootScope.categories.find(x => x.id==persist_id);
                current_category['id'] = response.data['category_id'];
            }, function(error){
                console.log(error);
                // location.reload();
            });
            jQuery('#modal-popin').modal('hide');
        }
        
        $scope.delete = function (index) {
            var delete_id = $rootScope.categories[index]["id"]
            $rootScope.categories.splice(index, 1);
            $http({
                method: 'PUT',
                url: apiHostUrl + '/frontend_categories',
                data: { delete_id: delete_id}
            }).then(function(response){
                console.log("DELETED POST: ");
                console.log(delete_id);
            }, function(error){
                console.log(error);
                // location.reload();
            })
        }

        $scope.add = function () {
            $scope.new_cat = {
                id: 0,
                name: null,
                url: null
            };
            jQuery('#modal-popin').modal('show');
        }

        $scope.get_frontend_categories()
    }
]);
