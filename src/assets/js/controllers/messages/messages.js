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
        };

        if (!$rootScope.messages) $rootScope.messages = {};

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
        $scope.cp_id = $stateParams.cp_id;
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
            console.log("THE ROOT", $rootScope)
            console.log("THIS IS THE TM MESSAGE", $scope.tm_message)
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
            if ($scope.tm_message.blocked != true){
                jQuery('#edit-modal').modal('show');
            } else {
                console.log("SORRY THIS EDIT IS BLOCKED UNTIL THE TRANSLATIONS RESPONSE IS RECEIVED");
            }
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
            if ($scope.new_message.single == 'single' && $scope.new_message.headline && $scope.new_message.content) {
                var id = Math.max.apply(Math,$rootScope.messages[$scope.current_id].messages.map(function(o){return o.id;})) + 1
                $scope.max_id = id;
                $rootScope.messages[$scope.current_id].messages.push({
                    id: id,
                    status: true,
                    trans: trans,
                    headline: $scope.new_message.headline,
                    content: $scope.new_message.content,
                    icon: $scope.new_message.icon,
                    image: $scope.new_message.image,
                    badge: $scope.new_message.badge,
                    blocked: true
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
                        console.log("CURRENT GROUP MESSAGE", current_group_message)
                        current_group_message['blocked'] = false
                        if ($scope.tm_message.id == id) {
                            $scope.tm_message.trans = response.data['trans']
                            console.log("UPDATED TM MESSAGE TRANSLATIONS", $scope.tm_message)
                        }
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
                            var id = Math.max.apply(Math,$rootScope.messages[$scope.current_id].messages.map(function(o){return o.id;})) + 1
                            $scope.max_id = id;
                            $rootScope.messages[$scope.current_id].messages.push({
                                id: id,
                                status: true,
                                trans: trans,
                                headline: headlines[i],
                                content: body[i],
                                icon: $scope.new_message.icon,
                                image: $scope.new_message.image,
                                badge: $scope.new_message.badge,
                                blocked: true
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
                                    new_message: input_message
                                },
                                headers: {'Custom-Status': "save_messages"}
                            }).then(function(response){
                                    console.log('GOT RESPONSE: ', response)
                                    var current_group_message = $rootScope['messages'][$scope.current_id]['messages'].find(x => x.headline==response.data['trans']['English']['headline'])
                                    current_group_message['trans'] = response.data['trans']
                                    current_group_message['languages'] = response.data['languages']
                                    current_group_message['id'] = response.data['message_id']
                                    current_group_message['blocked'] = false
                                    if ($scope.tm_message.id == id) {
                                        $scope.tm_message.trans = response.data['trans']
                                        console.log("UPDATED TM MESSAGE TRANSLATIONS", $scope.tm_message)
                                    }
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
