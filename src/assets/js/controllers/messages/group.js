App.controller('MessagesGroups', ['$rootScope', '$scope', '$localStorage', '$window', '$state', '$http', 'apiHostUrl',
    function ($rootScope, $scope, $localStorage, $window, $state, $http, apiHostUrl) {
        // Init full DataTable, for more examples you can check out https://www.datatables.net/

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

        $scope.get_frontend_groups = function(){
            $http({
                method : 'GET',
                url: apiHostUrl + '/frontend_groups',
            }).then(function(response){
                $rootScope.groups = response['data']
            },function(error){
                console.log(error);
            });
        }

        if (!$rootScope.groups)
            $rootScope.groups = [];

        $scope.new_gp = $scope.tm_gp = {
            id: 0,
            name: null,
            cat: null,
            status: false
        };

        $scope.max_idx = 0;

        $scope.edit = function (index) {
            $scope.tm_gp = {
                id: $rootScope.groups[index].id,
                name: $rootScope.groups[index].name,
                cat: $rootScope.categories.find(x => x.id == $rootScope.groups[index].cat.id),//$rootScope.groups[index].cat
                status: $rootScope.groups[index].status
            };
            jQuery('#modal-popin').modal('show');
        }

        $scope.update = function () {
            for (var i = 0;i < $rootScope.groups.length; i ++) {
                if ($scope.tm_gp.id == $rootScope.groups[i].id) {
                    $rootScope.groups[i] = {
                        id: $scope.tm_gp.id,
                        name: $scope.tm_gp.name,
                        cat: $scope.tm_gp.cat,
                        status: $scope.tm_gp.status
                    }
                    break;
                }
            }
            $http({
                method: 'POST',
                url: apiHostUrl + '/frontend_groups',
                data: $scope.tm_gp
            }).then(function(response){
                console.log("GOT RESPONSE:");
                console.log(response);
            }, function(error){
                console.log(error);
                // location.reload();
            });
            jQuery('#modal-popin').modal('hide');
        }

        $scope.update_status = function (index, status) {
            $scope.tm_gp = $rootScope.groups[index]
            $scope.tm_gp.status = status

            $http({
                method: 'POST',
                url: apiHostUrl + '/frontend_groups',
                data: $scope.tm_gp
            }).then(function(response){
                console.log("GOT RESPONSE:");
                console.log(response);
            }, function(error){
                console.log(error);
                // location.reload()
            });
        }

        $scope.add = function () {
            if ($scope.new_gp.name && $scope.new_gp.cat) {
                var id = $scope.max_idx + 1;
                $scope.max_idx = id;
                $rootScope.groups.push({
                    id: id,
                    name: $scope.new_gp.name,
                    cat: $scope.new_gp.cat,
                    status: $scope.new_gp.status
                });

                $http({
                    method: 'POST',
                    url: apiHostUrl + '/frontend_groups',
                    data: $scope.new_gp
                }).then(function(response){
                    console.log("GOT RESPONSE:");
                    var current_group = $rootScope.groups.find(x => x.id==id)
                    current_group['id'] = response.data['group_id']
                }, function(error){
                    console.log(error);
                    // location.reload();
                });
            }
            $scope.new_gp = {
                id: 0,
                name: null,
                cat: $scope.new_gp.cat,
                status: false
            }
            jQuery('#modal-popin').modal('hide');
        }



        $scope.delete = function (index) {
            var delete_id = $rootScope.groups[index]["id"]
            $rootScope.groups.splice(index, 1);
            $http({
                method: 'PUT',
                url: apiHostUrl + '/frontend_groups',
                data: { delete_id: delete_id}
            }).then(function(response){
                console.log("DELETED POST: ");
                console.log(delete_id);
            }, function(error){
                console.log(error);
                // location.reload();
            })
        }

        if (typeof $rootScope.categories == 'undefined' || $rootScope.categories.length == 0)  {
            console.log("GETTING campaigns")
            $scope.get_frontend_categories();
        }

        $scope.get_frontend_groups()

    }
]);