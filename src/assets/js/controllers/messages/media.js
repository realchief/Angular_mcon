/**
 * Created by Dev on 6/15/2018.
 */
// MessagesMedia Controller
App.controller('MessagesMedia', ['$rootScope', '$scope', '$localStorage', '$window', '$state', '$http', 'apiHostUrl', '$stateParams',
    function ($rootScope, $scope, $localStorage, $window, $state, $http, apiHostUrl, $stateParams) {

        // $scope.page_num = $stateParams.page_num;
        $scope.page_num = 1;
        $scope.items_per_page = 10;
        $scope.pages = 0
        $scope.all_data_loaded = false

        function extend(obj, src) {
            for (var key in src) {
                if (src.hasOwnProperty(key)) obj[key] = src[key];
            }
            return obj;
        }

        function roundUp(num, precision) {
          precision = Math.pow(10, precision)
          return Math.ceil(num * precision) / precision
        }


        function search_array_of_obj(obj_key, obj_value, myArray){
            for (var i=0; i < myArray.length; i++) {
                if (myArray[i][obj_key] === obj_value) {
                    return [myArray[i], i];
                }
            }
            return []
        }



        $scope.get_frontend_media = function(items_per_page, items_offset, tags_loaded){

                $http({
                    method : 'POST',
                    url: apiHostUrl + '/frontend_media',
                    data: {
                        items_per_page: items_per_page,
                        items_offset: items_offset,
                        tags_loaded: tags_loaded
                    },
                    headers: {'Custom-Status': 'get_frontend_media_pagination'}
                }).then(function(response){
                    console.log("GET FRONTEND MEDIA RESPONSE: ", response.data)
                    
                    $rootScope['medias'] = extend($rootScope['medias'], response['data']['medias']);
                    $scope.filtered_medias = extend($scope.filtered_medias, response['data']['medias']);
                    $scope.pages = roundUp((Object.keys($rootScope['medias']).length)/$scope.items_per_page, 0);
                    


                    if ('tags' in response['data']){
                        console.log("LOADED TAGS:")
                        $rootScope['tags'] = response['data']['tags']
                        tags_loaded = true
                    } else {
                        console.log("DID NOT NEED TO LOAD TAGS")
                    }

                    if (response['data']['continue_loop']) {
                        $scope.get_frontend_media(items_per_page, items_offset + items_per_page, tags_loaded)
                    } else {
                        $scope.all_data_loaded = true
                    }

                },function(error){
                    console.log("ERROR RETRIEVING FRONTEND MEDIA: ",error);
                });

        }


        $scope.pagination = 30;
        $scope.new_tag = null;
        $scope.is_delete_modal = false;
        $scope.delete_tags = [];
        $scope.selected_all = false;

        if (!$rootScope.tags) {
            $rootScope.tags = {};
        }

        if (!$rootScope.medias) {
            $rootScope.medias = {};
        }
        $scope.filtered_medias = {};
        $scope.search_term = {
            name: '',
            type: '',
            tag: ''
        };

        var init_content = {
            headline: null,
            content: null,
            status: false,
            lan: null,
        };

        $scope.new_content = angular.copy(init_content);
        $scope.files = [];
        $scope.media_type = null;
        $scope.max_id = 0;

        $scope.add_tag_modal = function () {
            $scope.is_delete_modal = false;
            for (var tag in $rootScope.tags) {
                $rootScope.tags[tag].checked = false;
            }
            jQuery('#modal-popin').modal('show');
        };

        $scope.remove_tag_modal = function () {
            $scope.is_delete_modal = true;
            for (var tag in $rootScope.tags) {
                $rootScope.tags[tag].checked = false;
            }
            jQuery('#modal-popin').modal('show');
        };

        $scope.add_media = function () {
            // we should add upload part in here
            
            for (var file = $scope.files.length - 1; file >=0; file --) {
                var total_id = $scope.max_id + 1;
                var max_num_media_type = 0;
                jQuery.each($rootScope.medias, function(key, value){
                    if (value.media_type == $scope.media_type ) {
                        var key_number = key.replace(/\D/g, ""), key_media_type = key.replace(/[^a-z]/gi, "");   
                        if (key_number >= max_num_media_type) {
                            max_num_media_type = key_number
                        }
                        // max_num_media_type++;
                    }
                });

                $scope.max_id = total_id;
                var id = max_num_media_type + 1
                $rootScope.medias[$scope.media_type + id] = {
                    id: null,
                    media_type: $scope.media_type,
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
                        console.log("GOT RESPONSE:", response);
                        $rootScope.medias[$scope.media_type + id].url = response['data']['url']
                        $rootScope.medias[$scope.media_type + id].id = response['data']['id']
                        $scope.filtered_medias[$scope.media_type + id].url = response['data']['url']
                        $scope.filtered_medias[$scope.media_type + id].id = response['data']['id']
                }, function(error){
                    console.log(error);
                    // location.reload();
                });
            }
            $scope.search();
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
            $scope.delete_tags = [];
            $scope.search();
            jQuery('#modal-popin').modal('hide');
        }

        $scope.remove_tag = function (media_id, tag) {

            var output_medias = []
            var output_tags = []
            if (media_id){

                if (media_id in $scope.medias) {
                    var idx = $scope.medias[media_id].tags.indexOf(tag);
                    if (idx >= 0) {
                        $scope.medias[media_id].tags.splice(idx, 1);
                        output_medias.push($scope.medias[media_id])
                        output_tags.push(tag)
                    }
                }
            }

            else {
                //ITERATE THROUGH MEDIAS
                for (var media in $rootScope.medias) {

                    //GET SELECTED MEDIA
                    if ($rootScope.medias[media].selected) {

                        // ITERATE TRHOUGH TAGS
                        for (var tag in $scope.tags) {

                            // GET CHECKED TAGS
                            if ($scope.tags[tag].checked) {

                                // IF TAG NOT IN output_tags APPEND
                                if (output_tags.indexOf($scope.tags[tag]) == -1){
                                    output_tags.push($scope.tags[tag])
                                }


                                jQuery.each(output_tags, function(key, value){
                                    search_array_result = search_array_of_obj("name", value.name, $scope.medias[media].tags);
                                    if (search_array_result.length == 2) {
                                        found_val = search_array_result[0];
                                        found_idx = search_array_result[1];
                                        if (found_idx >= 0) {
                                            $scope.medias[media].tags.splice(found_idx, 1);
                                            if (output_medias.indexOf($scope.medias[media]) == -1){
                                                output_medias.push($scope.medias[media])
                                            }
                                        }
                                    }

                                });
                            }
                        }
                    }
                }
            }
            $http({
                method: 'POST',
                url: apiHostUrl + '/frontend_media',
                 headers: {'Custom-Status': 'remove_tag'},
                data:{ medias: output_medias, tags: output_tags}
            }).then(function(response){
            }, function(error){
                console.log(error);
                // location.reload();
            });
            $scope.search();
            jQuery('#modal-popin').modal('hide');
        };

        $scope.delete_tag = function (tag) {

            if ($scope.delete_tags.indexOf(tag) < 0) {
                $scope.delete_tags.push(tag);
                $http({
                    method: 'PUT',
                    url: apiHostUrl + '/frontend_media',
                     headers: {'Custom-Status': 'delete_tag'},
                    data:tag
                }).then(function(response){
                    console.log("GOT RESPONSE:");
                    console.log(response);
                }, function(error){
                    console.log(error);
                });

                
                jQuery.each($scope.medias, function(key, value){
                    search_array_result = search_array_of_obj('name', tag, value.tags)
                    found_val = search_array_result[0]
                    found_idx = search_array_result[1]
                    if (search_array_result.length == 2){
                        $scope.medias[key].tags.splice(found_idx, 1);
                    }
                });
            }
        };

        $scope.remove_media = function (media_id) {

            var delete_medias = []
            if (media_id){
                delete_medias.push({id:$rootScope.medias[media_id].id, media_type:$rootScope.medias[media_id].media_type})
                delete $rootScope.medias[media_id];
                delete $scope.filtered_medias[media_id];
            }
            else {
                for (var key in $rootScope.medias){
                    if ($rootScope.medias[key].selected) {
                        delete_medias.push({id:$rootScope.medias[key].id, media_type:$rootScope.medias[key].media_type})
                        delete $rootScope.medias[key];
                        delete $scope.filtered_medias[key];
                    }
                }

            }
            $http({
                method: 'PUT',
                url: apiHostUrl + '/frontend_media',
                headers: {'Custom-Status': 'delete_media_file'},
                data: { delete_medias: delete_medias}
            }).then(function(response){
                console.log(response)
            }, function(error){
                console.log(error);
            })
        };
        $scope.preview_url = '';
        $scope.preview_type = 'icon';

        //$scope.preview = function (url, type) {
        $scope.preview = function (url, type) {
            $scope.preview_url = url;
            $scope.preview_type = type.toLowerCase();
            //$scope.preview_type = type.toLowerCase();
            jQuery('.img-preview.hidden').removeClass('hidden');
        };

        $scope.hidden_preview = function () {
            jQuery('.img-preview').not('.hidden').addClass('hidden');
        };

        $scope.search = function () {
            $scope.filtered_medias = {};
            for (var key in $rootScope.medias) {
                var media = $rootScope.medias[key];
                if ($scope.search_term.name !== "" && media.name.toLowerCase().indexOf($scope.search_term.name.toLowerCase()) < 0 ) {
                    continue
                }
                if ($scope.search_term.type !== "" && media.media_type.toLowerCase().indexOf($scope.search_term.type.toLowerCase()) < 0 ) {
                    continue
                }
                if ($scope.search_term.tag !== "") {
                    var f = false;
                    for (var i = 0;i < media.tags.length; i ++) {
                        if (media.tags[i].name.toLowerCase().indexOf($scope.search_term.tag.toLowerCase()) >= 0) {
                            f = true;
                            break;
                        }
                    }
                    if (!f) {
                        continue;
                    }
                }
                $scope.filtered_medias[key] = media;
            }
        };

        $scope.select_all = function () {
            for (var key in $rootScope.medias){
                if (Object.keys($scope.filtered_medias).indexOf(key) >= 0)
                    $rootScope.medias[key].selected = $scope.selected_all;
            }
        };

        $scope.select = function () {
            $scope.selected_all = true;
            for (var key in $rootScope.medias){
                if (Object.keys($scope.filtered_medias).indexOf(key) >= 0)
                    $scope.selected_all = $scope.selected_all && $rootScope.medias[key].selected;
            }
        };

        $scope.get_frontend_media($scope.items_per_page, 0, false)
        console.log("THE ROOT", $rootScope)
        console.log("THE PAGES:", $scope.pages)
    }
]);
