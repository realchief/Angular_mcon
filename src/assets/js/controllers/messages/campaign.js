App.controller('MessagesCampaigns', ['$rootScope', '$scope', '$localStorage', '$window', '$http', 'apiHostUrl',
    function ($rootScope, $scope, $localStorage, $window, $http, apiHostUrl) {
        // Init full DataTable, for more examples you can check out https://www.datatables.net/
        $scope.search_campaign = '';
        $scope.get_frontend_campaigns = function(){
                    $http({
                        method : 'GET',
                        url: apiHostUrl + '/frontend_campaigns',
                    }).then(function(response){

                        console.log('GOT RESPONSE: ',response)
                        $rootScope.campaigns = response['data']['campaigns']
                        $rootScope.locations = response['data']['locations']



                        if (!$rootScope.campaigns)
                            $rootScope.campaigns = [];

                        var init_cp = {
                            id: 0,
                            name: null,
                            locations: $rootScope.locations,
                            all_day_notification: false,
                            time_zone: 'UTC -06',
                            from_time: {
                                hh: '07',
                                mins: '00',
                                m: 'AM'
                            },
                            to_time: {
                                hh: '07',
                                mins: '00',
                                m: 'PM'
                            },
                            one_message_per_mins:  30,
                            status: true,
                            stacking: 'No'
                        };

                        $scope.new_cp = angular.copy(init_cp);
                        $scope.tm_cp = angular.copy(init_cp);

                        $scope.hrs = [];
                        for (var i=1;i <= 12; i ++) $scope.hrs.push(('0' + i).substr(-2));

                        $scope.mins = [];
                        for (var i=0;i < 60; i ++) $scope.mins.push(('0' + i).substr(-2));

                        $scope.time_zones = [];
                        for (var i=-12; i <= 12; i ++) {
                            if (i < 0) $scope.time_zones.push('UTC -' + ('0' + i * (-1)).substr(-2))
                            else if (i > 0) $scope.time_zones.push('UTC +' + ('0' + i).substr(-2))
                            else $scope.time_zones.push('UTC +00')
                        }


                        $scope.max_idx = 0;

                        $scope.edit = function (index) {
                            var locations = [];
                            for (var i = 0; i < $rootScope.campaigns[index].locations.length; i ++) {
                                locations.push($rootScope.campaigns[index].locations[i]);
                            }
                            $scope.tm_cp = angular.copy($rootScope.campaigns[index]);
                            
                            jQuery('#modal-popin').modal('show');
                        }

                        $scope.update = function () {
                            for (var i = 0;i < $rootScope.campaigns.length; i ++) {

                                if ($scope.tm_cp.id == $rootScope.campaigns[i].id) {
                                    $rootScope.campaigns[i] = angular.copy($scope.tm_cp)
                                    // console.log("DATA:", $scope.tm_cp)
                                    $http({
                                        method: 'POST',
                                        url: apiHostUrl + '/frontend_campaigns',
                                        data: $scope.tm_cp,
                                        headers: {'Custom-Status': "save_campaign"}
                                    }).then(function(response){
                                        console.log("GOT RESPONSE:");
                                        console.log(response);
                                    }, function(error){
                                        console.log(error);
                                        // location.reload();
                                    });
                                    break;
                                }
                            }
                            $scope.tm_cp = angular.copy(init_cp);
                            jQuery('#modal-popin').modal('hide');
                        }


                        $scope.update_status = function (index) {
                            $scope.tm_cp = angular.copy($rootScope.campaigns[index]);
                            $http({
                                method : 'POST',
                                url: apiHostUrl + '/frontend_campaigns',
                                data: {
                                    campaign: $scope.tm_cp
                                },
                                headers: {'Custom-Status': "update_status"}
                            }).then(function(response){
                                console.log("GOT RESPONSE",response)
                            },function(error){
                                console.log(error);
                                // location.reload();
                            });
                        }


                        $scope.add = function () {
                            if ($scope.new_cp.name) {
                                var id = $scope.max_idx + 1;
                                $scope.max_idx = id;
                                $rootScope.campaigns.push(Object.assign({}, $scope.new_cp, {id: id}));
                            }
                            $http({
                                    method: 'POST',
                                    url: apiHostUrl + '/frontend_campaigns',
                                    data: $scope.new_cp,
                                    headers: {'Custom-Status': "save_campaign"}
                                }).then(function(response){
                                    console.log("GOT RESPONSE:");
                                    console.log(response);
                                }, function(error){
                                    console.log(error);
                                    // location.reload();
                                });
                            $scope.new_cp = angular.copy(init_cp);
                            jQuery('#modal-popin').modal('hide');

                        }


                        $scope.delete = function (index) {
                            var delete_id = $rootScope.campaigns[index]["id"]
                            $rootScope.campaigns.splice(index, 1);
                            
                            $http({
                                method: 'PUT',
                                url: apiHostUrl + '/frontend_campaigns',
                                data: { delete_id: delete_id}
                            }).then(function(response){
                                console.log(response)
                            }, function(error){
                                console.log(error);
                                // location.reload();
                            })

                        }

                        $scope.open_location_modal = function () {
                            jQuery('#modal-location').modal('show');
                        }

                        $scope.open_drop = function (elem) {
                            if ($(elem).hasClass('hide')) {
                                $(elem).removeClass('hide');
                                $(elem).focusin();
                            }
                            else $(elem).addClass('hide');
                        }

                        $scope.close_drop = function (elem) {
                            if (!$(elem).hasClass('hide')) $(elem).addClass('hide');
                        }

                        $scope.sel_location_name = function (locations) {
                            var sel_loc = [];
                            for (var i = 0;i < locations.length; i ++) {
                                if (locations[i].checked)
                                    sel_loc.push(locations[i].name);
                            }
                            if (sel_loc.length > 0)
                                return sel_loc.join(',');
                            else return 'Select Locations';
                        }


                    },function(error){
                        console.log(error);
                        // location.reload();
                    });
                }


        $scope.get_frontend_campaigns();

    }
]);