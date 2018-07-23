App.controller('Optimizer', ['$rootScope', '$scope', '$localStorage', '$window', '$http', 'apiHostUrl', '$stateParams',
    function ($rootScope, $scope, $localStorage, $window, $http, apiHostUrl, $stateParams) {

        // $scope.page_num = $stateParams.page_num;
        $scope.page_num = 1;
        $scope.items_per_page = 10;
        $scope.pages = 0
        $scope.all_data_loaded = false

        function roundUp(num, precision) {
          precision = Math.pow(10, precision)
          return Math.ceil(num * precision) / precision
        }

        $scope.get_campaign_rules = function(items_per_page, items_offset, traffic_source_campaigns_loaded){
            $http({
                method : 'POST',
                url: apiHostUrl + '/optimizer/zeropark',
                data: {
                    items_per_page: items_per_page,
                    items_offset: items_offset,
                    traffic_source_campaigns_loaded: traffic_source_campaigns_loaded,
                    traffic_source_campaigns: $rootScope.traffic_source_campaigns
                },
                headers: {'Custom-Status': 'get_optimizer_media_pagination'}
            }).then(function(response){
                console.log("REQUESTED CAMPAIGN RULES AND GOT RESPONSE:", response['data']);

                $rootScope.rules = $rootScope.rules.concat(response['data']['campaign_rules']);
                $scope.pages = roundUp((Object.keys($rootScope.rules).length)/$scope.items_per_page, 0);

                if ('traffic_source_campaigns' in response['data']){
                    console.log("LOADED TRAFFIC SOURCE CAMPAIGNS FROM VOLUUM:")
                    $rootScope.traffic_source_campaigns = response['data']['traffic_source_campaigns']
                    traffic_source_campaigns_loaded = true
                } else {
                    console.log("DID NOT NEED TO LOAD TRAFFIC SOURCE CAMPAIGNS FROM VOLUUM")
                }

                if (response['data']['continue_loop']) {
                    $scope.get_campaign_rules(items_per_page, items_offset + items_per_page, traffic_source_campaigns_loaded)
                } else {
                    $scope.all_data_loaded = true
                }
                
            },function(error){
                console.log("ERROR WHEN REQUESTING ALL CAMPAIGN RULES:", error)
            });
        }


        
        // Init full DataTable, for more examples you can check out https://www.datatables.net/
        if (!$rootScope.rules) {
            $rootScope.rules = [];
        }

        $scope.operators = {
            '>': 'is greater than',
            '<': 'is less than',
            '==': 'equal to'
        };

        $scope.metrics = ['CV', 'Visits', 'Conversions', 'Cost', 'CPV', 'CTR', 'ROI', 'EPV', 'eCPA'];
        $scope.regexes = {
            'CV': '^\\d{1,2}(\\.\\d{1,2})?$',
            'Visits': '^\\d{1,6}$',
            // 'Conversions': '^d{1,6}$',
            'Conversions': '^\\d{1,6}$',
            'Cost': '^\\d{1,4}(\\.\\d{1,2})?$',
            'CPV': '^\\d{1,2}(\\.\\d{1,3})?$',
            'CTR': '^\\d{1,2}(\\.\\d{1,2})?$',
            'ROI': '^\\d{1,3}(\\.\\d{1,2})?$',
            'EPV': '^\\d(\\.\\d{1,4})?$',
            'eCPA': '^\\d(\\.\\d{1,4})?$'
        };
        $scope.placeholders = {
            'CV': '00.00',
            'Visits': '000000',
            'Conversions': '000000',
            'Cost': '0000.00',
            'CPV': '00.000',
            'CTR': '00.00',
            'ROI': '000.00',
            'EPV': '0.0000',
            'eCPA': '0.0000'
        };
        // $scope.actions = ['Pause', 'Stop'];
        $scope.actions = ['Pause'];
        $scope.filtered_data = [{
            id: 1,
            content: 'placement'
        }, {
            id: 2,
            content: 'placement'
        }, {
            id: 3,
            content: 'placement'
        }, {
            id: 4,
            content: 'placement'
        }];

        $scope.max_idx = 0;

        $scope.periods = {
            '1 day': 1,
            '3 day': 3,
            '7 day': 7
        };

        var init_rule = {
            id: $scope.max_idx + 1,
            constraints: [{
                id: 1,
                metric: 'CV',
                value: '',
                operator: '>',
                conjunction: null
            },
            {
                id: 2,
                metric: 'CV',
                value: '',
                operator: '>',
                conjunction: 'and'
            }
            ],
            period: 3,
            campaign: null,
            action: 'Pause',
            status: true
        };

        $scope.new_rules = {
            campaign: null,
            conditions: [angular.copy(init_rule)]
        };
        $scope.tm_rule = angular.copy(init_rule);

        $scope.edit = function (index) {
            $scope.tm_rule = angular.copy($rootScope.rules[index]);
            jQuery('#edit-modal').modal('show');
        };

        $scope.view = function (index) {
            $scope.tm_rule = angular.copy($rootScope.rules[index]);
            jQuery('#view-modal').modal('show');
        };

        $scope.update = function () {
            for (var i = 0;i < $rootScope.rules.length; i ++) {
                if ($scope.tm_rule.id == $rootScope.rules[i].id) {
                    $rootScope.rules[i] = angular.copy($scope.tm_rule)
                }
            }

            $http({
                method : 'POST',
                url: apiHostUrl + '/optimizer/zeropark',
                data: $scope.tm_rule,
                headers: {'Custom-Status': "save_rule"}
            }).then(function(response){
                console.log('GOT RESPONSE', response);
            },function(error){
                console.log(error);
                // location.reload();
            });
            $scope.tm_rule = angular.copy(init_rule);
            jQuery('#edit-modal').modal('hide');
        };


        $scope.update_status = function (index, status) {
            $scope.tm_rule = $rootScope.rules[index]
            $scope.tm_rule.status = status

            $http({
                method: 'POST',
                url: apiHostUrl + '/optimizer/zeropark',
                data: $scope.tm_rule,
                headers: {'Custom-Status': "save_rule"}
            }).then(function(response){
                console.log("GOT RESPONSE:");
                console.log(response);
            }, function(error){
                console.log(error);
                // location.reload()
            });
        }

        function constraint_value_present(constraint) {
          return constraint.value;
        }

        $scope.add_rule = function () {
            if ($scope.new_rules.campaign) {
                for (var i = 0;i < $scope.new_rules.conditions.length; i ++) {
                    var new_rule = angular.copy($scope.new_rules.conditions[i]);

                    if (new_rule.constraints.every(constraint_value_present)) {
                        new_rule.campaign = angular.copy($scope.new_rules.campaign)
                        console.log("THIS IS THE RULE BEING SAVED:", new_rule)
                        var id = $scope.max_idx + 1;
                        new_rule.id = id;
                        $scope.max_idx = id;
                        $rootScope.rules.push(angular.copy(new_rule));

                        $http({
                            method : 'POST',
                            url: apiHostUrl + '/optimizer/zeropark',
                            data: new_rule,
                            headers: {'Custom-Status': "save_rule"}
                        }).then(function(response){
                            var current_campaign_rule = $rootScope.rules.find(x => x.id==id)
                            current_campaign_rule.id = response.data['campaign_rule_id']
                            current_campaign_rule.constraints = response.data['constraints']
                            console.log('GOT RESPONSE WHEN SAVING RULE:', response);
                        },function(error){
                            console.log("ERROR WHEN SAVING RULE:", error)
                            // location.reload();
                        });
                    }
                }
                $scope.new_rules = {
                    campaign: null,
                    conditions: [angular.copy(init_rule)]
                };
            }
            jQuery('#modal-popin').modal('hide');
        };

        $scope.delete = function (index) {
            var delete_id = $rootScope.rules[index]["id"]
            $rootScope.rules.splice(index, 1);
            $http({
                method: 'PUT',
                url: apiHostUrl + '/optimizer/zeropark',
                data: { delete_id: delete_id}
            }).then(function(response){
                console.log("DELETED POST: ");
                console.log(delete_id);
            }, function(error){
                console.log(error);
                // location.reload();
            })
        }
        $scope.add_condition = function () {
            $scope.new_rules.conditions.push(angular.copy(init_rule));
        }

        $scope.inline_rule = function(rule_index, constraint_index){
            return [
                $rootScope.rules[rule_index].constraints[constraint_index].metric,
                $rootScope.rules[rule_index].constraints[constraint_index].operator,
                $rootScope.rules[rule_index].constraints[constraint_index].value
            ].join(' ');
        }

        $scope.get_campaign_rules($scope.items_per_page, 0, false)

    }
]);
