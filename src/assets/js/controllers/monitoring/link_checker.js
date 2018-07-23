App.controller('MonitoringLinkChecker', ['$rootScope', '$scope', '$localStorage', '$window', '$state', '$http', 'apiHostUrl',
    function ($rootScope, $scope, $localStorage, $window, $state, $http, apiHostUrl) {
        // Init full DataTable, for more examples you can check out https://www.datatables.net/

        $scope.get_monitoring_links = function(){
            $http({
                method : 'GET',
                url: apiHostUrl + '/virus_check',
            }).then(function(response){
                var data = response['data'];
                $rootScope.monitoring_links = data.checks;

            },function(error){
                console.log(error);
            });
        };

        // Init Monitoring Links Table
        if (!$rootScope.monitoring_links) $rootScope.monitoring_links = [];

        $scope.voluum_data = [];
        $scope.voluum_offers_data = [];
        $scope.voluum_landers_data = [];
        $scope.voluum_data_selected = null;
        $scope.edit_link = $scope.new_link = {
            type: '',
            status: 'Active',
            name: null,
            url: null,
            monitor_active: false
        };

        $scope.max_idx = 0;

        $scope.add = function () {
            console.log();

            if ($scope.new_link.name && (($scope.new_link.type != '' && $scope.voluum_data_selected != null) || ($scope.new_link.type == '' && $scope.new_link.url != '')) ) {

                var id = $scope.max_idx + 1;
                $scope.max_idx = id;
                $scope.new_link = {
                    type: $scope.new_link.type,
                    id: id,
                    status: 'Active',
                    name: $scope.new_link.name,
                    url: $scope.new_link.url,
                    monitor_active: 0
                };

                if($scope.new_link.type != '') {
                    $scope.new_link.url = $scope.voluum_data_selected.description.monitor_link_url;
                }

                $rootScope.monitoring_links.push($scope.new_link);

                delete $scope.new_link.id;
                $scope.voluum_data_selected = null;
                $scope.$broadcast('angucomplete-alt:clearInput', 'ex1');

                $http({
                    method: 'POST',
                    url: apiHostUrl + '/virus_check',
                    data: $scope.new_link
                }).then(function(response){
                    console.log("GOT RESPONSE: "+ response.status);
                    if(response.status == 200) {

                        var current_link = $rootScope.monitoring_links.find(x => x.id==id);
                        current_link['id'] = response.data['id']
                    }

                }, function(error){
                    console.log(error);
                    // location.reload();
                });
            }
            $scope.new_link = {
                id: 0,
                status: null,
                name: null,
                url: null,
                monitor_active: 0
            };

            jQuery('#modal-popin').modal('hide');
        };

        $scope.delete = function (index) {
            var delete_id = $rootScope.monitoring_links[index]["id"];
            console.log(delete_id);
            $rootScope.monitoring_links.splice(index, 1);
            $http({
                method: 'PUT',
                url: apiHostUrl + '/virus_check',
                data: { delete_id: delete_id}
            }).then(function(response){
                console.log("DELETED POST: ");
                console.log(delete_id);
            }, function(error){
                console.log(error);
                // location.reload();
            })
        };

        $scope.monitor = function (index) {
            var monitor = $rootScope.monitoring_links[index];
            console.log(monitor);
            $http({
                method: 'POST',
                url: apiHostUrl + '/virus_check',
                data: monitor
            }).then(function(response){
                console.log("Monitor POST: "+ response.data.success);
            }, function(error){
                console.log(error);
                // location.reload();
            })
        };

        $scope.edit = function (index) {
            $scope.edit_link = {
                id: $rootScope.monitoring_links[index].id,
                name: $rootScope.monitoring_links[index].name,
                url: $rootScope.monitoring_links[index].url,
                monitor_active: $rootScope.monitoring_links[index].monitor_active,
                status: $rootScope.monitoring_links[index].status
        };
            jQuery('#modal-popin').modal('show');
        }

        $scope.update = function () {
            for (var i = 0;i < $rootScope.monitoring_links.length; i ++) {
                if ($scope.edit_link.id == $rootScope.monitoring_links[i].id) {
                    $rootScope.monitoring_links[i] = {
                        id: $scope.edit_link.id,
                        name: $scope.edit_link.name,
                        url: $scope.edit_link.url,
                        monitor_active: $scope.edit_link.monitor_active,
                        status: $scope.edit_link.status
                    }
                    break;
                }
            }
            $http({
                method: 'POST',
                url: apiHostUrl + '/virus_check',
                data: $scope.edit_link
            }).then(function(response){
                console.log("GOT RESPONSE:");
                console.log(response);
            }, function(error){
                console.log(error);
                // location.reload();
            });
            jQuery('#modal-popin').modal('hide');
        };

        $scope.get_monitoring_links();

        $scope.monitor_type_change = function() {
          if($scope.new_link.type == 'offer_url') {
              $scope.voluum_data = $scope.voluum_offers_data;
          }
          else if ($scope.new_link.type == 'lander_url') {
              $scope.voluum_data = $scope.voluum_landers_data
          }
          else {
              $scope.voluum_data = [];
          }

        };

        $scope.get_voluum_offers = function(){
            $http({
                method : 'POST',
                url: apiHostUrl + '/get_voluum_offers',
                data: {
                    start_date:'2018-04-01',
                    end_date:'2018-04-03',
                    report_columns: ['offerId','offerName','offerUrl'],
                    fieldnames: ['monitor_link_id','monitor_link_name','monitor_link_url']
                }
            }).then(function(response){
                console.log("voluum/offers Data Loaded");
                $scope.voluum_offers_data = response.data;
            },function(error){
                console.log(error);
            });
        };

        $scope.get_voluum_landers = function(){
            $http({
                method : 'POST',
                url: apiHostUrl + '/get_voluum_landers',
                data: {
                    start_date:'2018-04-01',
                    end_date:'2018-04-03',
                    report_columns: ['landerId','landerName','landerUrl'],
                    fieldnames: ['monitor_link_id','monitor_link_name','monitor_link_url']
                }
            }).then(function(response){
                console.log("voluum/landers Data Loaded");
                $scope.voluum_landers_data = response.data;
            },function(error){
                console.log(error);
            });
        };
        $scope.get_voluum_offers();
        $scope.get_voluum_landers();
    }
]);