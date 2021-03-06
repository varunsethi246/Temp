import './homepageBanner.html';
import '../../admin/commonAdmin/adminLayout.html';
import '../../admin/commonAdmin/adminSidebar.html';
import '../../admin/commonAdmin/adminHeader.html';
import '../../admin/commonAdmin/adminFooter.html';
import '/imports/common/loading.html';
import '../mainBusinessSearch/mainBusinessSearch.js';

import { BizVideoBanner } from '/imports/videoUploadClient/videoUploadBanner.js';
import { HomeBannerVideo } from '/imports/api/homePageVideo.js';
import { Area } from '/imports/api/masterData/areaMaster.js';
import { City } from '/imports/api/masterData/cityMaster.js';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

// Meteor.subscribe('vendorBusiness');
// Meteor.subscribe('homeBannerVideo');

var options = {
  keepHistory: 0,
  localSearch: false
};

var fields = ['city'];
citySearch1 = new SearchSource('city', fields, options);
var dataIndex = 0;


Template.homepageBanner.onRendered(function(){
  Session.set('showGridView',true);
  
  var userId = Meteor.userId();
  if(userId){
    var cityObject = Meteor.users.findOne({"_id":userId});
    if(cityObject.selectedCity){
      var currentCity = cityObject.selectedCity;
    }else {
      var sesVal = Session.get('userSelecetedRXTCity');
      if(sesVal){
        currentCity = sesVal;
      }else{
        var currentCity = "Pune";
      }
    }
  }else{
    var sesVal = Session.get('userSelecetedRXTCity');
    if(sesVal){
      currentCity = sesVal;
    }else{
      var currentCity = "Pune";
    }
  }
  // $("#video").get(0).play();
  $('#getCity').val(currentCity);
  $('.curUserCity').text(currentCity);
  
    // var video = document.getElementById("myVideo").autoplay;
    // console.log('videoHome:',videoHome);
    // video.autoplay = true;
    // video.load();
});

Template.homepageBanner.helpers({

  bannerVideo: function() {
      var bussData = HomeBannerVideo.findOne({});
      // console.log(bussData);
      if(bussData){
        var data = BizVideoBanner.findOne({"_id":bussData.bannerLink});
        // console.log('data :',data);
          if(data){
            return data;
          }else{
            return false;
          }
      }else{
        return false;
      }
    },

  shwCityAndArea(){
       var currentCityList=citySearch1.getData();
      var currentAreaList = [];

      var userId = Meteor.userId();
      if(userId){
        var cityObject = Meteor.users.findOne({"_id":userId});
        if(cityObject.selectedCity){
          var currentCity = cityObject.selectedCity;
        }else {
          // var currentCity = "Pune";
          var sesVal = Session.get('userSelecetedRXTCity');
          if(sesVal){
            currentCity = sesVal;
          }else{
            var currentCity = "Pune";
          }
        }
      }else{
        var sesVal = Session.get('userSelecetedRXTCity');
        if(sesVal){
          currentCity = sesVal;
        }else{
          var currentCity = "Pune";
        }

        // var city = $('#getCity').val();
        // if(city){
        //   var currentCity = city;
        // }else{
        //   var currentCity = "Pune";
        // }
        // Most Important Sesion to pass Dynamic City to footer links
        Session.set("rxtNxtCityDatlist",currentCity);
      }
    
      var currentAreaList = Area.find({'city':currentCity,"status":"active"}).fetch();
      var areaArray = [];
      var areaList = [];
      if(currentAreaList){
        for(var i=0;i<currentAreaList.length;i++){
          areaArray.push({'area':currentAreaList[i].area})
        }//i
        var pluck = _.pluck(areaArray, 'area');
        data = _.uniq(pluck);
        // console.log('data ...',data);

        if(data.length>0){
          for(var j=0;j<data.length;j++){
              var uniqueArea = data[j];
              var areaLists = Area.findOne({'area':uniqueArea});
              if(areaLists){
                areaList.push({
                              'area'    : uniqueArea,
                              'country' : areaLists.country,
                              'state'   : areaLists.state,
                              'city'    : areaLists.city,
                              'zipcode' : areaLists.zipcode,
                              'status'  : areaLists.status,
                            });
              }
          }//j
        }//length
      }//currentAreaList
      
      areaList.sort(function(a, b) {
        var textA = a.area.toUpperCase();
        var textB = b.area.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
      });
      currentAreaList = areaList;
      return {currentCityList, currentAreaList};
  },
  // tellBrowserName(){
  //   // var videoarr = [];
  //     if((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1 ) 
  //     {
  //         // alert('Opera');
  //         var videoScr = 'video/RightNXT.webm';
  //         var videotype = 'video/webm';
  //     }
  //     else if(navigator.userAgent.indexOf("Chrome") != -1 )
  //     {
  //         // alert('Chrome');
  //         var videoScr = 'video/RightNXT.webm';
  //         var videotype = 'video/webm';
  //     }
  //     else if(navigator.userAgent.indexOf("Safari") != -1)
  //     {
  //         // alert('Safari');
  //         var videoScr = 'video/RightNXT_converted.mp4';
  //         var videotype = 'video/mp4';

  //     }
  //     else if(navigator.userAgent.indexOf("Firefox") != -1 ) 
  //     {
  //          // alert('Firefox');
  //         var videoScr = 'video/RightNXT.webm';
  //         var videotype = 'video/webm';

  //     }
  //     else if((navigator.userAgent.indexOf("MSIE") != -1 ) || (!!document.documentMode == true )) //IF IE > 10
  //     {
  //       // alert('IE');
  //         var videoScr = 'video/RightNXT_converted.mp4';
  //         var videotype = 'video/mp4';
  //     }  
  //     else 
  //     {
  //        console.log('unkonw browser please check!');
  //     }

  //     return {videoScr, videotype};
  //   },
});


Template.homepageBanner.events({
  'click .TopCity':function(e){
    // $("#getCity").val($(e.currentTarget).text());var id=$(e.currentTarget).text().trim();id=id.toLowerCase().replace(/\b[a-z]/g,function(e){return e.toUpperCase()}),Session.set("userSelectedCity",id),$("#changeCityModal").modal("hide");var cityCookie="getCurrentCityName="+id;document.cookie=cityCookie;var currentCity=Cookie.get("getCurrentCityName");if(currentCity)$(".curUserCity").text(currentCity);else{var sesCity=Session.get("userSelectedCity");sesCity?$(".curUserCity").text(sesCity):$(".curUserCity").text("Pune")}
  },

  'click .searchBusList':function(event) {
    event.preventDefault();
    $(".homeSearchBarList").addClass("searchDisplayShow").removeClass("searchDisplayHide");
    var searchString=$("#getBusiness").val().split(' ').join('-');
    var currentCity = $('#getCity').val();
    var currentArea = $('#getArea').val();
    // console.log(searchString,currentCity,currentArea);

    if(currentCity){
      var city = currentCity; 
    }else{
      var city = 'Pune';
    }

    if(currentArea){
      var area = currentArea.split(' ').join('-');
    }else
    {
      var area = 'All Areas'.split(' ').join('-');
    }

    if(searchString){
      var path =  "/search/"+city+"/"+area+"/"+searchString;
      FlowRouter.go(path);
    }else{
      var path =  "/search/"+city+"/"+area;
      FlowRouter.go(path);
    }
  },
  
  'keypress #getCity': function(e) {
    if(e.keyCode === 13){
      $('#changeCityModal').modal('hide');
    }
    var text=$('#getCity').val().trim();

    if(!text){
      text = "Pune";
    }

    citySearch1.search(text);
    $(".curUserCity").text(text);
    Session.set("userSelecetedRXTCity",text);

    var userId = Meteor.userId();
    if(userId){
      Meteor.call("storeUserSelectedCity", userId, text);
    }else{
      Session.set("rxtNxtCityDatlist",text);
    }
  },

  'change #getCity': function(e) {
    // if(e.keyCode === 13){
    $('#changeCityModal').modal('hide');
    $('.modal-backdrop').hide();
    // }
    var text=$('#getCity').val().trim();

    if(!text){
      text = "Pune";
    }
    $(".curUserCity").text(text);
    Session.set("userSelecetedRXTCity",text);

    var userId = Meteor.userId();
    if(userId){
      Meteor.call("storeUserSelectedCity", userId, text);
    }else{
      Session.set("rxtNxtCityDatlist",text);
    }
  },

  'click #getCity':function(e){
    var text=$('#getCity').val().trim();
    if(!text){
      text = "Pune";
    }

    citySearch1.search(text);
    $(".curUserCity").text(text);
  },
  'click .cityShowCloseModal': function(event){
      var text=$('#getCity').val().trim();
      if(!text){
        text = "Pune";
      }
      $(".curUserCity").text(text);
      Session.set("userSelecetedRXTCity",text);
  
      var userId = Meteor.userId();
      if(userId){
        Meteor.call("storeUserSelectedCity", userId, text);
      }
  },

});

HomepageBannerForm = function () {  
  BlazeLayout.render("adminLayout",{main: 'homepage'});
}

export { HomepageBannerForm };



