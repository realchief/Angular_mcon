
// Messages Categories Controller
App.controller('MessagesCategories', ['$rootScope', '$scope', '$localStorage', '$window', '$http', 'apiHostUrl',
    function ($rootScope, $scope, $localStorage, $window, $http, apiHostUrl) {

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

// Messages Groups Controller
App.controller('MessagesGroups', ['$rootScope', '$scope', '$localStorage', '$window', '$state', '$http', 'apiHostUrl',
    function ($rootScope, $scope, $localStorage, $window, $state, $http, apiHostUrl) {
        // Init full DataTable, for more examples you can check out https://www.datatables.net/

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

        if (!$rootScope.categories)
            $state.go('messagesCategories')
        $scope.new_gp = $scope.tm_gp = {
            id: 0,
            name: null,
            cat: null,
            status: false
        }

        $scope.max_idx = 0;

        $scope.edit = function (index) {
            $scope.tm_gp = {
                id: $rootScope.groups[index].id,
                name: $rootScope.groups[index].name,
                cat: $rootScope.categories.find(x => x.id== $rootScope.groups[index].cat.id),//$rootScope.groups[index].cat
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
        $scope.get_frontend_groups()
    }
]);

// Assign Groups To Campaign Controller
App.controller('AssignGroupToCampaign', ['$rootScope', '$scope', '$localStorage', '$window', '$state', '$stateParams', '$http', 'apiHostUrl',
    function ($rootScope, $scope, $localStorage, $window, $state, $stateParams, $http, apiHostUrl) {

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
        }
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
                    }
                    break;
                }
            }
        }

        $scope.tm_gp_cp = {
            status: false,
            group: {}
        }
        $scope.new_gp = null;
        $scope.edit = function (index) {
            $scope.tm_gp_cp = {
                status: $rootScope.gp_cp[$scope.current_id].groups[index].status,
                group: $rootScope.gp_cp[$scope.current_id].groups[index].group
            };
            jQuery('#modal-popin').modal('show');
        }


        $scope.update = function () {
            for (var i = 0; i < $rootScope.gp_cp[$scope.current_id].groups.length; i ++ ){
                if ($rootScope.gp_cp[$scope.current_id].groups[i].group.id == $scope.tm_gp_cp.group.id) {
                    $rootScope.gp_cp[$scope.current_id].groups[i].status = $scope.tm_gp_cp.status;
                    $http({
                            method : 'POST',
                            url: apiHostUrl + '/frontend_groups_frontend_campaigns',
                            data: {
                                campaign_id:$stateParams.cp_id,
                                new_gp: $scope.tm_gp_cp.group,
                                status: $scope.tm_gp_cp.status
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
        }

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
                        group: $scope.new_gp
                    });
                $http({
                        method : 'POST',
                        url: apiHostUrl + '/frontend_groups_frontend_campaigns',
                        data: {
                            campaign_id:$stateParams.cp_id,
                            new_gp: $scope.new_gp,
                            status: $scope.new_gp.status
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

// Messages Controller
App.controller('Messages', ['$rootScope', '$scope', '$localStorage', '$window', '$state', '$stateParams', '$http', 'apiHostUrl',
    function ($rootScope, $scope, $localStorage, $window, $state, $stateParams, $http, apiHostUrl) {
        
        $scope.get_frontend_messages = function(){
                    $http({
                        method : 'POST',
                        url: apiHostUrl + '/frontend_messages',
                        data: {group_id:$stateParams.gp_id},
                        headers: {'Custom-Status': "load_messages"}
                    }).then(function(response){

                        $rootScope.messages[$stateParams.gp_id] = {"name": $stateParams.gp_name, "messages": response['data']['messages']}
                        $rootScope.icons = response['data']['icons']
                        $rootScope.images = response['data']['images']
                        $rootScope.badges = response['data']['badges']
                        $rootScope.icons_tags = response['data']['icons_tags']
                        $rootScope.images_tags = response['data']['images_tags']
                        $rootScope.badges_tags = response['data']['badges_tags']
                        console.log("GOT RESPONSE: ",response)

                    },function(error){
                        console.log(error);
                        // location.reload();
                    });
                }

        if (!$rootScope.messages) $rootScope.messages = {};

        $scope.max_id = 0;

        $scope.tran_lan = [
            'Bulgarian', 'Croatian', 'Czech', 'Danish', 'Dutch', 'Estonian', 'Hebrew', 'Hindi', 'Hungraian', 'Indonesian', 'Itanlian', 'Japanese', 'Korean', 'Latvian', 'Lithuanian', 'Norwegian', 'Persian', 'Polish', 'Romanian', 'Russian', 'Serbian', 'Thai', 'Turkish', 'Ukrainian', 'Vietnamese'
        ];
        $scope.default_tran_lan = [
            'English', 'Arabic', 'Chinese', 'French', 'German', 'Portuguese', 'Spanish'
        ];
        trans = {};

        for (var i = 0; i < $scope.default_tran_lan.length; i ++ ){
            trans[$scope.default_tran_lan[i]] = {
                headline: null,
                content: null,
                status: true
            }
        }

        if (!$stateParams.gp_id) {
            $state.go('messagesGroups');
        }

        $scope.current_id = $stateParams.gp_id;
        if (!($scope.current_id in $rootScope.messages)) {
            $rootScope.messages[$scope.current_id] = {
                messages: [],
                name: $stateParams.gp_name
            }
        }

        $scope.new_message = $scope.tm_message = {
            id: 0,
            status: true,
            headline: null,
            content: null,
            headlines: null,
            body: null,
            trans: Object.assign({}, trans),
            single: 'single',
            icon: null,
            image: null,
            badge: null
        }


        $scope.edit = function (index) {
            $scope.tm_message = angular.copy($rootScope.messages[$scope.current_id].messages[index]);

            if ($scope.tm_message.icon != null){
                if ($scope.tm_message.icon.media_type != null) {
                    $scope.tm_message.icon = $rootScope.icons.find(x => x.id==$scope.tm_message.icon.id);
                } else {
                    $scope.tm_message.icon = $rootScope.icons_tags.find(x => x.id==$scope.tm_message.icon.id);
                }
                
            }
            if ($scope.tm_message.badge != null){
                if ($scope.tm_message.badge.media_type != null) {

                    $scope.tm_message.badge = $rootScope.badges.find(x => x.id==$scope.tm_message.badge.id);

                } else {
                    $scope.tm_message.badge = $rootScope.badges_tags.find(x => x.id==$scope.tm_message.badge.id);
                }
                
            }
            if ($scope.tm_message.image != null){
                if ($scope.tm_message.image.media_type != null) {

                    $scope.tm_message.image = $rootScope.images.find(x => x.id==$scope.tm_message.image.id);

                } else {
                    $scope.tm_message.image = $rootScope.images_tags.find(x => x.id==$scope.tm_message.image.id);
                }
                
            }
            jQuery('#edit-modal').modal('show');
        }

        $scope.view = function (index) {
            $scope.tm_message = angular.copy($rootScope.messages[$scope.current_id].messages[index]);
            jQuery('#view-modal').modal('show');
        }

        $scope.new_content = {
            headline: null,
            content: null,
            status: false,
            lan: null,
        }

        $scope.update = function () {
            for (var i = 0; i < $rootScope.messages[$scope.current_id].messages.length; i ++ ){
                if ($rootScope.messages[$scope.current_id].messages[i].id == $scope.tm_message.id) {
                    $rootScope.messages[$scope.current_id].messages[i] = $scope.tm_message
                    $http({
                        method : 'POST',
                        url: apiHostUrl + '/frontend_messages',
                        data: {
                            group_id:$stateParams.gp_id,
                            new_message: $scope.tm_message
                        },
                        headers: {'Custom-Status': "save_messages"}
                    }).then(function(response){
                        console.log('GOT RESPONSE', response);
                    },function(error){
                        console.log(error);
                        // location.reload();
                    });
                    break;
                }
            }
            $scope.tm_message = {
                id: 0,
                status: true,
                headline: null,
                content: null,
                trans: trans,
                single: 'single',
                icon: null,
                image: null,
                badge: null
            }
            jQuery('#edit-modal').modal('hide');
        }

        $scope.update_status = function (index) {
            $scope.tm_message = angular.copy($rootScope.messages[$scope.current_id].messages[index]);
            $http({
                method : 'POST',
                url: apiHostUrl + '/frontend_messages',
                data: {
                    message: $scope.tm_message
                },
                headers: {'Custom-Status': "update_status"}
            }).then(function(response){
                console.log("GOT RESPONSE",response)
            },function(error){
                console.log(error);
                // location.reload();
            });
        }


        $scope.add_content = function () {
            if ($scope.new_content.lan && $scope.new_content.headline && $scope.new_content.content) {
                $scope.tm_message.trans[$scope.new_content.lan] = angular.copy($scope.new_content);
            }
            $scope.new_content = {
                headline: null,
                content: null,
                status: false,
                lan: null,
            }
        }


        $scope.add = function () {
            // debugger;
            if ($scope.new_message.single == 'single' && $scope.new_message.headline && $scope.new_message.content) {
                var id = $scope.max_id + 1;
                $scope.max_id = id;
                $rootScope.messages[$scope.current_id].messages.push({
                    id: id,
                    status: true,
                    trans: trans,
                    headline: $scope.new_message.headline,
                    content: $scope.new_message.content,
                    icon: $scope.new_message.icon,
                    image: $scope.new_message.image,
                    badge: $scope.new_message.badge
                });

                $http({
                        method : 'POST',
                        url: apiHostUrl + '/frontend_messages',
                        data: {
                            group_id:$stateParams.gp_id,
                            new_message: $scope.new_message
                        },
                        headers: {'Custom-Status': "save_messages"}
                    }).then(function(response){
                        console.log("GOT RESPONSE",response)
                        var current_group_message = $rootScope['messages'][$scope.current_id]['messages'].find(x => x.id==id)
                        current_group_message['trans'] = response.data['trans']
                        current_group_message['languages'] = response.data['languages']
                        current_group_message['id'] = response.data['message_id']
                    },function(error){
                        console.log(error);
                        // location.reload();
                    });
            }
            else if ($scope.new_message.single == 'bulk' && $scope.new_message.headlines && $scope.new_message.body) {
                var headlines = $scope.new_message.headlines.split('\n');
                var body = $scope.new_message.body.split('\n');
                var input_messages = []
                if (headlines.length == body.length) {
                    for (var i = 0;i < headlines.length; i ++) {
                        if (headlines[i] && body[i]) {
                            var id = $scope.max_id + 1;
                            $scope.max_id = id;
                            $rootScope.messages[$scope.current_id].messages.push({
                                id: id,
                                status: true,
                                trans: trans,
                                headline: headlines[i],
                                content: body[i],
                                icon: $scope.new_message.icon,
                                image: $scope.new_message.image,
                                badge: $scope.new_message.badge
                            });

                            var input_message = JSON.parse(JSON.stringify($scope.new_message));
                            input_messages.push(input_message)
                            input_message.status = true;
                            input_message.trans = trans;
                            input_message.headline = headlines[i];
                            input_message.content = body[i];

                            $http({
                                method : 'POST',
                                url: apiHostUrl + '/frontend_messages',
                                data: {
                                    group_id:$stateParams.gp_id,
                                    // new_message: $rootScope.messages[$scope.current_id].messages[id]
                                    new_message: input_message
                                },
                                headers: {'Custom-Status': "save_messages"}
                            }).then(function(response){
                                    console.log('GOT RESPONSE: ', response)
                                         var current_group_message = $rootScope['messages'][$scope.current_id]['messages'].find(x => x.headline==response.data['trans']['English']['headline'])
                                    current_group_message['trans'] = response.data['trans']
                                    current_group_message['languages'] = response.data['languages']
                                    current_group_message['id'] = response.data['message_id']
                            },function(error){
                                console.log(error);
                                // location.reload();
                            });

                        }
                    }
                }
            }
            $scope.new_message = {
                id: 0,
                status: false,
                trans: trans,
                icon: null,
                image: null,
                badge: null,
                single: 'single',
                headline: null,
                content: null,
                headlines: null,
                body: null
            }
            jQuery('#modal-popin').modal('hide');
        }

        $scope.delete = function (index) {
            


            var delete_id = $rootScope.messages[$scope.current_id].messages[index].id

            $rootScope.messages[$scope.current_id].messages.splice(index, 1);
            
            $http({
                method: 'PUT',
                url: apiHostUrl + '/frontend_messages',
                data: { delete_id: delete_id}
            }).then(function(response){
                console.log(response);
            }, function(error){
                console.log(error);
            })


        }

        $scope.get_frontend_messages()
    }
]);


// MessagesMedia Controller 
App.controller('MessagesMedia', ['$rootScope', '$scope', '$localStorage', '$window', '$state', '$http', 'apiHostUrl',
    function ($rootScope, $scope, $localStorage, $window, $state, $http, apiHostUrl) {
        
        $scope.get_frontend_media = function(){
                    $http({
                        method : 'GET',
                        url: apiHostUrl + '/frontend_media',
                    }).then(function(response){
                        console.log(response)
                        $rootScope['medias'] = response['data']['medias']
                        $rootScope['tags'] = response['data']['tags']
                    },function(error){
                        console.log(error);
                    });
                }

        $scope.pagenation = 30;
        $scope.new_tag = null;

        if (!$rootScope.tags) {
            $rootScope.tags = {};
        }

        if (!$rootScope.medias) {
            $rootScope.medias = {};
        }

        var init_content = {
            headline: null,
            content: null,
            status: false,
            lan: null,
        }

        $scope.new_content = angular.copy(init_content);
        $scope.files = [];
        $scope.media_type = null;
        $scope.max_id = 0;

        $scope.add_tag = function () {
            for (var tag in $rootScope.tags) {
                $rootScope.tags[tag].checked = false;
            }
            jQuery('#modal-popin').modal('show');
        }

        $scope.add = function () {
            // we should add upload part in here
            
            for (var file = $scope.files.length - 1; file >=0; file --) {
                var id = $scope.max_id + 1;
                $scope.max_id = id;
                $rootScope.medias[$scope.media_type + id] = {
                    id: null,
                    // id: id,
                    media_type: $scope.media_type,
                    // file_name: $scope.files[file].name,
                    name: $scope.files[file].name,
                    url: '',
                    tags: [],
                    selected: false
                };

                var formData = new FormData();
                formData.append('file', $scope.files[file]['_file']);



                $http.post(apiHostUrl + '/frontend_media', formData, {

                        headers: {'Custom-Status': 'save_media_file','Content-Type': undefined, 'Media-Type': 
                        $scope.media_type },

                        transformRequest: angular.identity
                    }).then(function(response){
                        console.log("GOT RESPONSE:");
                        console.log(response);

                        $rootScope.medias[$scope.media_type + id].url = response['data']['url']
                        $rootScope.medias[$scope.media_type + id].id = response['data']['id']

                }, function(error){
                    console.log(error);
                    // location.reload();
                });

            }
            jQuery('#example-file-multiple-input').val("");
            $scope.files = [];
        }

        $scope.add_new_tag = function () {
            if ($scope.new_tag && !($scope.new_tag in $rootScope.tags)) {
                $rootScope.tags[$scope.new_tag] = {
                    checked: false,
                    name: $scope.new_tag
                };
                $http({
                    method: 'POST',
                    url: apiHostUrl + '/frontend_media',
                     headers: {'Custom-Status': 'save_tag'},
                    data:$rootScope.tags[$scope.new_tag]
                }).then(function(response){
                    console.log("GOT RESPONSE:");
                    console.log(response);
                }, function(error){
                    console.log(error);
                });
                $scope.new_tag = null;
            }
        }

        $scope.assign_tags = function () {
            for (var media in $rootScope.medias) {
                if ($rootScope.medias[media].selected) {
                    for (var tag in $scope.tags) {
                        if ($scope.tags[tag].checked) {

                            var media_tags_names = []
                            for (var media_tag in $rootScope.medias[media].tags) {
                                media_tags_names.push(media_tag.name)
                            }

                            // if (!($scope.tags[tag].name in $rootScope.medias[media].tags)) {
                            if (!($scope.tags[tag].name in media_tags_names)) {

                                $rootScope.medias[media].tags.push($scope.tags[tag]);
            
                                $http({
                                    method: 'POST',
                                    url: apiHostUrl + '/frontend_media',
                                     headers: {'Custom-Status': 'assign_tag'},
                                    data:{ media: $rootScope.medias[media], tag: tag}
                                }).then(function(response){
                                    console.log("GOT RESPONSE:");
                                    console.log(response);
                                }, function(error){
                                    console.log(error);
                                    // location.reload();
                                });
                            }



                        }
                    }
                }
            }
            jQuery('#modal-popin').modal('hide');
        }

        $scope.remove_tag = function (media_id, tag) {
            var media_ids = []
            if (media_id)
                if (media_id in $scope.medias) {
                    var idx = $scope.medias[media_id].tags.indexOf(tag);
                    if (idx >= 0) {
                        $scope.medias[media_id].tags.splice(idx, 1);
                        media_ids.push(media_id)
                    }
                }
            else {
                for (var key in $rootScope.medias){
                    if ($rootScope.medias[key].selected) {
                        var idx = $scope.medias[key].tags.indexOf(tag);
                        if (idx >= 0) {
                            $scope.medias[key].tags.splice(idx, 1);
                            media_ids.push(key)
                        }
                    }
                }
            }
            $http({
                method: 'POST',
                url: apiHostUrl + '/frontend_media',
                 headers: {'Custom-Status': 'remove_tag'},
                data:{ media_ids: media_ids, tag: tag.name}
            }).then(function(response){
                console.log("GOT RESPONSE:");
                console.log(response);
            }, function(error){
                console.log(error);
                // location.reload();
            });
        }

        $scope.remove_media = function (media_id) {
            var delete_medias = []
            if (media_id){
                delete_medias.push({id:$rootScope.medias[media_id].id, media_type:$rootScope.medias[media_id].media_type})
                delete $rootScope.medias[media_id];
            }
            else {
                for (var key in $rootScope.medias){
                    if ($rootScope.medias[key].selected) {
                        delete_medias.push({id:$rootScope.medias[key].id, media_type:$rootScope.medias[key].media_type})
                        delete $rootScope.medias[key];
                    }
                }

            }
            $http({
                method: 'PUT',
                url: apiHostUrl + '/frontend_media',
                data: { delete_medias: delete_medias}
            }).then(function(response){
                console.log(response)
            }, function(error){
                console.log(error);
            })
        }

        $scope.preview = function (url) {
            $scope.preview_url = url;
            jQuery('.img-preview.hidden').removeClass('hidden');
        }

        $scope.hidden_preview = function () {
            // debugger;
            jQuery('.img-preview').not('.hidden').addClass('hidden');
        }

        $scope.get_frontend_media();
    }
]);


// Messages Campaigns Controller
App.controller('MessagesCampaigns', ['$rootScope', '$scope', '$localStorage', '$window', '$http', 'apiHostUrl',
    function ($rootScope, $scope, $localStorage, $window, $http, apiHostUrl) {
        // Init full DataTable, for more examples you can check out https://www.datatables.net/

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
