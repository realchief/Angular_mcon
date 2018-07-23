App.controller('MonitoringCampaignAlerts', [ '$rootScope', '$scope','$http', 'apiHostUrl',
    // function ($rootScope, $scope, campaigns, $http, apiHostUrl) {
    function ($rootScope, $scope, $http, apiHostUrl) {

        $scope.get_campaigns_and_campaign_alerts = function(){
            $http({
                method : 'GET',
                url: apiHostUrl + '/campaign_alerts',
            }).then(function(response){
                $rootScope.voluum_campaigns = response.data['voluum_campaigns']
                $rootScope.camp_alerts = response.data['campaign_alerts']
            },function(error){
                console.log(error);
            });
        }

        var init = {
            camps: [],
            metric: 'Visits',
            logic: 'Increase',
            value: 25
        };


        $scope.new_camp_alerts = angular.copy(init);

        $rootScope.camp_alerts = [];

        $scope.camp_alert_statuses = [
            'Normal',
            'Review'
        ]

        $scope.metrics = [
            'Visits',
            'Cost',
            'CPV',
            'eCPA'
        ];

        $scope.logics = [
            'Increase',
            'Decrease'
        ];

        $scope.ui_options = {
            open_camp: false
        };

        $scope.sel_campaigns = function (camps) {
            var titles = [];
            // console.log("THESE ARE THE CAMPS:", camps)
            for (var key in camps) {
                if (camps[key].checked) {
                    titles.push($rootScope.voluum_campaigns[key].campaignName);
                }
            }
            if (titles.length === 0){
                return 'Select Campaign';
            } else if (titles.length >= 4){
                return `${titles.length} Campaigns Selected`
            } else {return titles.join(',');}
        }

        $scope.max_idx = 0
      $scope.add = function () {
        if ($scope.new_camp_alerts.camps.length > 0) {
            for (var i = 0;i < $scope.new_camp_alerts.camps.length; i ++){
                if ($scope.new_camp_alerts.camps[i] && $scope.new_camp_alerts.camps[i].campaignId && $scope.new_camp_alerts.camps[i].checked == true){
                        var id = Math.max.apply(Math,$rootScope.camp_alerts.map(function(o){return o.id;})) + 1;
                        console.log("THE ID:", id)
                        if (id > 0){
                            $scope.max_idx = id;
                        }
                        var persist_id = $scope.max_idx
                        $rootScope.camp_alerts.push({
                            id: $scope.max_idx,
                            campaignName: $scope.new_camp_alerts.camps[i].campaignName,
                            campaignId: $scope.new_camp_alerts.camps[i].campaignId,
                            status: 'normal',
                            campaignUrl: $scope.new_camp_alerts.camps[i].campaignUrl,
                            monitor: true,
                            metric: $scope.new_camp_alerts.metric,
                            logic: $scope.new_camp_alerts.logic,
                            value: $scope.new_camp_alerts.value
                        });
                    var browser_saved_campaign_alert = angular.copy($rootScope.camp_alerts.find(x => x.id==persist_id));
                    browser_saved_campaign_alert.id = null;

                    $http({
                        method: 'POST',
                        url: apiHostUrl + '/campaign_alerts',
                        data: browser_saved_campaign_alert
                    }).then(function(response){
                        console.log(response);
                        var current_camp_alert = $rootScope.camp_alerts.find(x => x.id==persist_id);
                        current_camp_alert['id'] = response.data['camp_alert_id'];
                    }, function(error){
                        console.log(error);
                        // location.reload();
                    });
                }

                }
            }
        }


        $scope.edit = function (index) {
            $scope.tm_camp_alert = {
                id: $rootScope.camp_alerts[index].id,
                campaign: $rootScope.voluum_campaigns.find(x => x.campaignId == $rootScope.camp_alerts[index].campaignId),
                status: $rootScope.camp_alerts[index].status,
                monitor: $rootScope.camp_alerts[index].monitor,
                metric: $rootScope.camp_alerts[index].metric,
                logic: $rootScope.camp_alerts[index].logic,
                value: $rootScope.camp_alerts[index].value
            };
            jQuery('#edit-modal').modal('show');
        }


        $scope.update = function () {
            console.log($scope.tm_camp_alert.campaign['campaignName'])
            for (var i = 0;i < $rootScope.camp_alerts.length; i ++) {
                if ($scope.tm_camp_alert.id == $rootScope.camp_alerts[i].id) {  
                    $rootScope.camp_alerts[i] = {
                        id: $scope.tm_camp_alert.id,          
                        campaignName: $scope.tm_camp_alert.campaign['campaignName'],
                        campaignId: $scope.tm_camp_alert.campaign['campaignId'],
                        campaignUrl: $scope.tm_camp_alert.campaign['campaignUrl'],
                        status: $scope.tm_camp_alert.status,
                        monitor: $scope.tm_camp_alert.monitor,
                        metric: $scope.tm_camp_alert.metric,
                        logic: $scope.tm_camp_alert.logic,
                        value: $scope.tm_camp_alert.value
                    }
                    var campaign_alert_to_save = angular.copy($rootScope.camp_alerts[i])
                    break;

                }

            }
                $http({
                    method: 'POST',
                    url: apiHostUrl + '/campaign_alerts',
                    data: campaign_alert_to_save
                }).then(function(response){
                    console.log("GOT RESPONSE:");
                    console.log(response);
                }, function(error){
                    console.log(error);
                    // location.reload();
                });

            jQuery('#edit-modal').modal('hide');
        }

        $scope.update_monitor = function(index, status) {
            $scope.tm_camp_alert = $rootScope.camp_alerts[index]
            $scope.tm_camp_alert.status = status

            $http({
                method: 'POST',
                url: apiHostUrl + '/campaign_alerts',
                data: $scope.tm_camp_alert
            }).then(function(response){
                console.log("GOT RESPONSE:");
                console.log(response);
            }, function(error){
                console.log(error);
                // location.reload()
            });
        }

        $scope.delete = function (index) {
            var delete_id = $rootScope.camp_alerts[index]["id"]
            $rootScope.camp_alerts.splice(index, 1);
            $http({
                method: 'PUT',
                url: apiHostUrl + '/campaign_alerts',
                data: { delete_id: delete_id}
            }).then(function(response){
                console.log("DELETED CAMPAIGN ALERT: ");
                console.log(delete_id);
            }, function(error){
                console.log(error);
                // location.reload();
            })
        }
        
        
        $scope.get_campaigns_and_campaign_alerts()
    }
]);

// DROP TABLE campaign_alert CASCADE;
// CREATE TABLE campaign_alert (id serial PRIMARY KEY, campaignId varchar(255) NOT NULL, campaignUrl varchar(255) NOT NULL, campaignName varchar(255) NOT NULL, status varchar(10) DEFAULT 'normal' NOT NULL, monitor BOOLEAN DEFAULT true, metric varchar(20) NOT NULL, logic varchar(20) NOT NULL, value int NOT NULL, UNIQUE (campaignId, metric, logic, value));
// INSERT INTO campaign_alert(campaignId, campaignUrl, campaignName, status, monitor, metric, logic, value) VALUES('ba1802e7-85f7-423d-ab24-20680ccda714', 'http://trk.clickchaser.com/182b21e3-1530-414a-9143-0ba5f1664958?zone=[zone]&lang=[lang]&idform=[idform]&time=[time]&campaign=[campaign]&bid=[bid]&clickid=[clickid]', 'Adcash - United States - Push Notice (New Subs)', 'review', false, 'CPV', 'Increase', 123);
