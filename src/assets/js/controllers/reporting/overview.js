App.controller('ReportingOverview', ['$scope', '$http', 'apiHostUrl',
    function ($scope, $http, apiHostUrl) {

        $scope.get_overview_report = function(period, from_date, from_time, to_date, to_time){
            $http({
                method : 'POST',
                url: apiHostUrl + '/reporting_overview',
                data: {
                    "period": period,
                    "from_date": from_date,
                    "from_time": from_time,
                    "to_date": to_date,
                    "to_time": to_time
                     }
            }).then(function(response){
                $scope.total_values = response['data']['report']['totals']
                $scope.country_source = response['data']['report']['country_source']
                $scope.country_vertical = response['data']['report']['country_category']
                $scope.vertical_country = response['data']['report']['category_country']
                
                $scope.open_index = 0;
                

                $scope.open_cou_source = {};
                for (var i = 0;i < $scope.country_source; i++)
                    $scope.open_cou_source['id_' + $scope.country_source[i].id] = false;

                $scope.open_ver_country = {};
                for (var i = 0;i < $scope.vertical_country; i++)
                    if ($scope.vertical_country[i]){
                                $scope.open_ver_country['id_' + $scope.vertical_country[i].id] = false;
                    }


                $scope.open_cou_vertical = {};
                for (var i = 0;i < $scope.country_vertical; i++)
                    $scope.open_cou_vertical['id_' + $scope.country_vertical[i].id] = false;
                var data_by_country = [];


                var data_by_vertical = [];
                $scope.show_data_by_vertical = function () {
                    if (data_by_vertical.length === 0)
                        for (var i = 0;i < $scope.vertical_country.length;i ++) {
                            data_by_vertical.push(angular.copy($scope.vertical_country[i]));
                            data_by_vertical.push(angular.copy($scope.vertical_country[i]));
                        }
                    return data_by_vertical;
                };


                $scope.show_data_by_country = function () {
                    if (data_by_vertical.length === 0)
                        for (var i = 0;i < $scope.country_source.length;i ++) {
                            data_by_country.push(angular.copy($scope.country_source[i]));
                            data_by_country.push(angular.copy($scope.country_source[i]));
                        }
                    return data_by_country;
                };

                var data_by_country_vertical = [];
                $scope.show_data_by_country_vertical = function () {
                    if (data_by_country_vertical.length === 0)
                        for (var i = 0;i < $scope.country_source.length;i ++) {
                            data_by_country_vertical.push(angular.copy($scope.country_vertical[i]));
                            data_by_country_vertical.push(angular.copy($scope.country_vertical[i]));
                        }
                    return data_by_country_vertical;
                };
                $scope.open_cou_source = {};
                for (var i = 0;i < $scope.country_source; i++)
                    $scope.open_cou_source['id_' + $scope.country_source[i].id] = false;

                var chart_data = {
                    'id_1': [
                        [65, 59, 80, 81, 56, 55, 40],
                        [28, 48, 40, 19, 86, 27, 90],
                        [25, 40, 30, 59, 26, 47, 30]
                    ],
                    'id_2': [
                        [28, 48, 40, 19, 86, 27, 90],
                        [25, 40, 30, 59, 26, 47, 30],
                        [65, 59, 80, 81, 56, 55, 40]
                    ]
                };

                $scope.view = function (id) {
                    $scope.chart_data = angular.copy(chart_data['id_' + id])
                    jQuery('#view-modal').modal('show');
                };

                $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
                $scope.series = ['BTC', 'ETC', 'XRP'];
                $scope.chart_data = [];
                $scope.options = {
                    legend: {
                        display: true
                    },
                    scales: {
                        xAxes: [{
                            display: false

                        }],
                        yAxes: [{
                            display: false
                        }]
                    },
                    elements:{
                        line: {
                            fill:false
                        }
                    }
                };
            },function(error){
                console.log(error);
            });
        }

        $scope.period = 'today';
        $scope.pagination = "10";


        $scope.open = function (index) {
            if (index !== $scope.open_index)
                $scope.open_index = index;
            else $scope.open_index = -1;
        };

        $scope.sort_by_cou_sources = [];
        $scope.sort_by_ver_countrys = [];
        $scope.sort_by_cou_verticals = [];

        $scope.sort_by_cou_source = function (field_name) {
            var idx1 = $scope.sort_by_cou_sources.indexOf(field_name);
            var idx2 = $scope.sort_by_cou_sources.indexOf('-' + field_name);
            if (idx1 >= 0) {
                $scope.sort_by_cou_sources.splice(idx1, 1);
                $scope.sort_by_cou_sources.unshift('-' + field_name);
            }
            else if (idx2 >= 0) {
                $scope.sort_by_cou_sources.splice(idx2, 1);
                $scope.sort_by_cou_sources.unshift(field_name);
            }
            else {
                $scope.sort_by_cou_sources.push(field_name);
            }
        };

        $scope.sort_by_ver_country = function (field_name) {
            var idx1 = $scope.sort_by_ver_countrys.indexOf(field_name);
            var idx2 = $scope.sort_by_ver_countrys.indexOf('-' + field_name);
            if (idx1 >= 0) {
                $scope.sort_by_ver_countrys.splice(idx1, 1);
                $scope.sort_by_ver_countrys.unshift('-' + field_name);
            }
            else if (idx2 >= 0) {
                $scope.sort_by_ver_countrys.splice(idx2, 1);
                $scope.sort_by_ver_countrys.unshift(field_name);
            }
            else {
                $scope.sort_by_ver_countrys.push(field_name);
            }
        };

        $scope.sort_by_cou_vertical = function (field_name) {
            var idx1 = $scope.sort_by_cou_verticals.indexOf(field_name);
            var idx2 = $scope.sort_by_cou_verticals.indexOf('-' + field_name);
            if (idx1 >= 0) {
                $scope.sort_by_cou_verticals.splice(idx1, 1);
                $scope.sort_by_cou_verticals.unshift('-' + field_name);
            }
            else if (idx2 >= 0) {
                $scope.sort_by_cou_verticals.splice(idx2, 1);
                $scope.sort_by_cou_verticals.unshift(field_name);
            }
            else {
                $scope.sort_by_cou_verticals.push(field_name);
            }
        };

        $scope.get_overview_report("today")

    }
]);