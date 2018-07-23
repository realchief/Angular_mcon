App.controller('AssignGroupToCampaign', ['$rootScope', '$scope', '$localStorage', '$window', '$state', '$stateParams', '$http', 'apiHostUrl',
    function ($rootScope, $scope, $localStorage, $window, $state, $stateParams, $http, apiHostUrl) {
        $scope.orders = [];
        $scope.frequencies = [];
        for (var i = 1;i <=50 ; i ++) {
            $scope.orders.push(i);
            $scope.frequencies.push(i);
        }
        $scope.orders.unshift(0);
        $scope.get_frontend_groups_frontend_campaigns = function(){
            $http({
                method : 'POST',
                url: apiHostUrl + '/frontend_groups_frontend_campaigns',
                data: {campaign_id:$stateParams.cp_id},
                headers: {'Custom-Status': "load_frontend_groups_frontend_campaigns"}
            }).then(function(response){
                $rootScope.gp_cp[$stateParams.cp_id] = {"campaign": response['data']['campaign'], "groups": response['data']['gp_cp']}
                $rootScope.groups = response['data']['all_groups']
                console.log(response)
            },function(error){
                console.log(error);
                // location.reload()
            });
        };
        if (!$rootScope.campaigns)
            $rootScope.campaigns = [];

        if (!$rootScope.gp_cp)
            $rootScope.gp_cp = {}
        
        if (!$stateParams.cp_id) {
            $state.go('messagesCampaigns');
        }

        $scope.current_id = $stateParams.cp_id;
        if (!($scope.current_id && $scope.current_id in $rootScope.gp_cp)) {
            for (var i = 0;i < $rootScope.campaigns.length;i ++) {
                if ($rootScope.campaigns[i].id == $stateParams.cp_id) {
                    $rootScope.gp_cp[$scope.current_id] = {
                        campaign: $rootScope.campaigns[i],
                        groups: []
                    };
                    break;
                }
            }
        }

        $scope.tm_gp_cp = {
            status: false,
            group: {},
            order: 1,
            sent: 0,
            frequency: 1
        };
        $scope.new_gp = null;
        $scope.edit = function (index) {
            $scope.tm_gp_cp = {
                status: $rootScope.gp_cp[$scope.current_id].groups[index].status,
                group: $rootScope.gp_cp[$scope.current_id].groups[index].group,
                order: $rootScope.gp_cp[$scope.current_id].groups[index].order,
                frequency: $rootScope.gp_cp[$scope.current_id].groups[index].frequency,
                sent: $rootScope.gp_cp[$scope.current_id].groups[index].sent
            };
            jQuery('#modal-popin').modal('show');
        };


        $scope.update = function () {
            for (var i = 0; i < $rootScope.gp_cp[$scope.current_id].groups.length; i ++ ){
                if ($rootScope.gp_cp[$scope.current_id].groups[i].group.id == $scope.tm_gp_cp.group.id) {
                    $rootScope.gp_cp[$scope.current_id].groups[i].status = $scope.tm_gp_cp.status;
                    $rootScope.gp_cp[$scope.current_id].groups[i].frequency = $scope.tm_gp_cp.frequency;
                    $rootScope.gp_cp[$scope.current_id].groups[i].order = $scope.tm_gp_cp.order;
                    $rootScope.gp_cp[$scope.current_id].groups[i].sent = $scope.tm_gp_cp.sent;
                    $http({
                            method : 'POST',
                            url: apiHostUrl + '/frontend_groups_frontend_campaigns',
                            data: {
                                campaign_id:$stateParams.cp_id,
                                group: $scope.tm_gp_cp.group,
                                status: $scope.tm_gp_cp.status,
                                order: $scope.tm_gp_cp.order,
                                frequency: $scope.tm_gp_cp.frequency,
                                sent: $scope.tm_gp_cp.sent
                            },
                            headers: {'Custom-Status': "save_frontend_groups_frontend_campaigns"}
                        }).then(function(response){
                            console.log('GOT RESPONSE:', response);
                        },function(error){
                            console.log(error);
                            // location.reload();
                        });
                }
            }
            jQuery('#modal-popin').modal('hide');
        };

        $scope.update_cp_group = function (item) {
            // we have to have endpoint here.
            $http({
                method : 'POST',
                url: apiHostUrl + '/frontend_groups_frontend_campaigns',
                data: {
                    campaign_id: $scope.current_id,
                    group: item.group,
                    status: item.status,
                    order: item.order,
                    frequency: item.frequency,
                    sent: item.sent
                },
                headers: {'Custom-Status': "save_frontend_groups_frontend_campaigns"}
            }).then(function(response){
                console.log('GOT RESPONSE: ', response);
            },function(error){
                console.log(error);
                // location.reload();
            });
        };

        $scope.add = function () {
            if ($scope.new_gp) {
                var f = true;
                for (var i = 0;i < $rootScope.gp_cp[$scope.current_id].groups.length;i ++) {
                    if ($rootScope.gp_cp[$scope.current_id].groups[i].id == $scope.new_gp.id) {
                        f = false;
                        break;
                    }
                }
                if (f)
                    $rootScope.gp_cp[$scope.current_id].groups.push({
                        status: $scope.new_gp.status,
                        group: $scope.new_gp,
                        order: 1,
                        sent: 0,
                        frequency: 1
                    });
                $http({
                        method : 'POST',
                        url: apiHostUrl + '/frontend_groups_frontend_campaigns',
                        data: {
                            campaign_id:$stateParams.cp_id,
                            group: $scope.new_gp,
                            status: $scope.new_gp.status,
                            order: 1,
                            sent: 0,
                            frequency: 1
                        },
                        headers: {'Custom-Status': "save_frontend_groups_frontend_campaigns"}
                    }).then(function(response){
                        console.log('GOT RESPONSE: ', response);
                    },function(error){
                        console.log(error);
                        // location.reload();
                    });
            }
            $scope.new_gp = null;
            jQuery('#modal-popin').modal('hide');
        }

        $scope.delete = function (index) {

            var group_id = $rootScope.gp_cp[$scope.current_id].groups[index].group.id;
            $rootScope.gp_cp[$scope.current_id].groups.splice(index, 1);
            
            $http({
                method: 'PUT',
                url: apiHostUrl + '/frontend_groups_frontend_campaigns',
                data: { 
                    group_id: group_id,
                    campaign_id:$scope.current_id 
                }
            }).then(function(response){
                console.log("DELETED POST: ");
                console.log(group_id);
                console.log("GOT RESPONSE:");
                console.log(response);
            }, function(error){
                console.log(error);
                // location.reload();
            })

        }

        $scope.view = function (index) {
            $scope.gp_cp = angular.copy($rootScope.gp_cp[$scope.current_id].groups[index]);
            jQuery('#view-modal').modal('show');
        }

        $scope.get_frontend_groups_frontend_campaigns()
    }
]);
