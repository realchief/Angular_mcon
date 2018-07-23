App.factory('VoluumService', ['$http', '$window', function ($http, $window) {

    return {
        get: function (url) {
            var token = $window.sessionStorage.getItem('voluum_token');
            var config = {
                headers: {
                    'CWAUTH-TOKEN': token
                }
            };
            return $http.get('https://api.voluum.com' + url, config);
        },
        post: function (url, data) {
            var token = $window.sessionStorage.getItem('voluum_token');
            var config = {
                headers: {
                    'Content-Type': 'application/json',
                    'CWAUTH-TOKEN': token
                }
            };
            return $http.post('https://api.voluum.com' + url, data, config);
        },
        delete: function (url) {
            var token = $window.sessionStorage.getItem('voluum_token');
            var config = {
                headers: {
                    'CWAUTH-TOKEN': token
                }
            };
            return $http.delete('https://api.voluum.com' + url, config);
        }
    }
}]);


App.factory('VoluumAuth', ['$http', function ($http) {
    var data = {
        "accessId": "794b837b-37d0-41a2-95a6-567ea14dd57d",
        "accessKey": "IylRhHEfzg_Bp2uTPlflpD7JrkdMLlBrU7-R"
    };
    var config = {
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    };
    return $http.post('https://api.voluum.com/auth/session', data, config).then(function (res) {
        $window.sessionStorage.setItem('voluum_token', res.data.token);
        return token;
    }, function (err) {
        alert(err.statusText);
    });
}]);

App.factory('VCampaignService', ['VoluumService', 'VoluumAuth', function (VoluumService, VoluumAuth) {
    return {
        all: function () {
            return VoluumService.get('/campaign');
        },
        get: function (campaign_id) {
            if (!campaign_id)
                return this.all();
            return VoluumService.get('/campaign/' + campaign_id);
        },
        update: function (campaign_id, data) {
            return VoluumService.put('/campaign/' + campaign_id, data);
        },
        delete: function (campaign_id) {
            return VoluumService.delete('/campaign/' + campaign_id);
        }
    }
}]);
