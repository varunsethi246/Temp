import './generalHeader.html';
import { Notification } from '/imports/api/notification.js';
import { ConfigSettings } from '/imports/api/companysettingsAPI.js';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { VendorImage } from '/imports/videoUploadClient/vendorImageClient.js';

Template.generalHeader.onCreated(function(){
  this.subscribe('vendorImage',Meteor.userId());
});
Template.generalHeader.helpers({
	'userDetails' : function(){
		// alert('userDetails');
		var id = Meteor.userId();
		if(id){
			var data = Meteor.users.findOne({"_id":id},{"profile":1});
			// console.log(data);
			if(data){
				var pic = VendorImage.findOne({"_id":data.profile.userProfilePic});
				if(pic){
					if(pic.type == 'image/png'){
						data.checkpngImg = 'bkgImgNone';
					}else{
						data.checkpngImg = '';
					}
					data.profile.userProfilePic = pic.link();	
				}
				else{
					data.profile.userProfilePic = "/users/profile/profile_image_dummy.svg";	
				}
				return data;
			}
			
		}
	},
	'displayUserProfileHeader' : function(id){
		if(id){
			return true;
		}
		else{
			return false;
		}
	},

	'notifVal': function(){
    var userId = Meteor.userId();

	var userDetail = Meteor.users.findOne({'_id':userId});
	var notifArr = ["Payment Received", "Vendor Paid for Offer", "Vendor Message Send"];

	if(userDetail.notificationConfiguration){
		if(userDetail.notificationConfiguration.enquiry == "true"){
			var arr = ["User Enquiry Message","User Enquiry Messages", "Vendor Enquiry Message", "Vendor Business Enquiry", "User Business Enquiry", "Enquiry Message Send", "User Business Enquiry All"];
			for(j=0;j<arr.length;j++){
				notifArr.push(arr[j]);
			}
		}
		if(userDetail.notificationConfiguration.rating == "true"){
			var arr = ["Vendor Review and Rating", "User Review and Rating", "User Added Review and Rating", "Business Page Review Share"];
			for(j=0;j<arr.length;j++){
				notifArr.push(arr[j]);
			}
		}
		if(userDetail.notificationConfiguration.follow == "true"){
			var arr = ["Follow User Other", "Follow User Current","Follow"];
			for(j=0;j<arr.length;j++){
				notifArr.push(arr[j]);
			}
		}
		if(userDetail.notificationConfiguration.like == "true"){
			var arr = ["Vendor Modal Image Like", "User Modal Image Like", "Vendor Modal Image Comment Like", "User Modal Image Added Comment Like", "User Modal Image Comment Like", "Vendor Modal Image Comment Reply Like", "User Modal Image Added Comment Reply Like", "User Modal Image Added Comment SubReply Like", "User Modal Image Comment SubReply Like", "Vendor Business Page Like", "User Business Page Like", "Vendor Review and Rating Like", "Other User Review and Rating Like", "Current User Review and Rating Like", "Vendor Review Comment Like", "User Comment Review and Rating Like", "User Review Comment Like", "Current User Review Comment Like", "Vendor Review Comment SubReply Like", "User Added Review and Rating SubReply Like", "User Review Comment SubReply Like", "User Added Review Reply SubReply Like", "Current User Review Comment Reply Like"];
			for(j=0;j<arr.length;j++){
				notifArr.push(arr[j]);
			}
		}
		if(userDetail.notificationConfiguration.comment == "true"){
			var arr = ["Vendor Modal Image Comment", "User Modal Image Comment", "Vendor Modal Image Comment Reply", "User Modal Image Added Comment Reply", "User Modal Image Comment Reply", "Vendor Review and Rating Comment", "Other User Review and Rating Comment", "Current User Review and Rating Comment", "Vendor Review Comment Reply", "User Review Comment", "Current User Review Comment Reply"];
			for(j=0;j<arr.length;j++){
				notifArr.push(arr[j]);
			}
		}
		if(userDetail.notificationConfiguration.report == "true"){
			var arr = ["businessDone-report-acknowledgedOne","business-image-report-acknowledged","business-report-acknowledged"];
			for(j=0;j<arr.length;j++){
				notifArr.push(arr[j]);
			}
		}
		if(userDetail.notificationConfiguration.editbusiness == "true"){
			var arr = ["Delete Business Vendor","Delete Business Admin"];
			for(j=0;j<arr.length;j++){
				notifArr.push(arr[j]);
			}
		}
		if(userDetail.notificationConfiguration){
			var arr = ['Vendor deleted Offer','Vendor Added New Business','Admin Business Page Modal Report','Vendor Business Page Bookmark','User Business Page Been There','User Business Page Report','User Modal Image Report','Payment Successfull','Thanks for Registering','Vendor Business Page Been There','Offer Deleted','Vendor Business Page Report','Thanks for Submiting Offer','Vendor has Submiting Offer','Vendor Modal Image Report','Invoice','Admin Business Page Report','User Business Page Bookmark','You have been Tagged','Thanks for Registering New Business','Anything Else Business Admin','UnFollow','Mail Receipt','Claim','Business Page Share'];
			for(j=0;j<arr.length;j++){
				notifArr.push(arr[j]);
			}
		}
	}
	var notificationLocs = notifArr.map(function(x) { return x } );

    var notifDetails = Notification.find({'toUserId':userId, 'event': {"$in": notificationLocs}},{sort:{'date':-1}}).fetch();
	    if(notifDetails){
	      var notifArray = [];
	      for(i=0 ; i<notifDetails.length ; i++){
	        var statusClass = '';
	        if(notifDetails[i].status == "Read"){
	        statusClass = 'statusColor';
	        }else{
	        	statusClass = 'statusColorBar'
	        }
	        var notificationBody = notifDetails[i].notifBody;
	        // var notif = notificationBody.slice(0,40);
	         var createdAt =  moment(notifDetails[i].date).fromNow();
	         // console.log('createdAt: ', createdAt);
	         // console.log('notifDetails[i].createdAt: ', notifDetails[i].createdAt);
	        notifArray.push({
	          'id'              : notifDetails[i]._id,
	          'notificationId'  : notifDetails[i].notificationId,
	          'notifBody'       : notificationBody,
	          'notifPath'		: notifDetails[i].notifPath,
	          'status'          : notifDetails[i].status,
	          'date'            : notifDetails[i].date,
	          'statusBackground': statusClass,
	          'timestamp'       : notifDetails[i].timestamp,
	          'createdAt'       : createdAt,
	        })
	      }//i
	    }//notifDetails
      return notifArray;

    },

    'notifcount': function(){
      	var userId = Meteor.userId();
		var userDetail = Meteor.users.findOne({'_id':userId});
		var notifArr = ["Payment Received", "Vendor Paid for Offer", "Vendor Message Send"];

		if(userDetail.notificationConfiguration){
			if(userDetail.notificationConfiguration.enquiry == "true"){
				var arr = ["User Enquiry Message","User Enquiry Messages","Vendor Enquiry Message", "Vendor Business Enquiry", "User Business Enquiry", "Enquiry Message Send", "User Business Enquiry All"];
				for(j=0;j<arr.length;j++){
					notifArr.push(arr[j]);
				}
			}
			if(userDetail.notificationConfiguration.rating == "true"){
				var arr = ["Vendor Review and Rating", "User Review and Rating", "User Added Review and Rating", "Business Page Review Share"];
				for(j=0;j<arr.length;j++){
					notifArr.push(arr[j]);
				}
			}
			if(userDetail.notificationConfiguration.follow == "true"){
				var arr = ["Follow User Other", "Follow User Current","Follow"];
				for(j=0;j<arr.length;j++){
					notifArr.push(arr[j]);
				}
			}
			if(userDetail.notificationConfiguration.like == "true"){
				var arr = ["Vendor Modal Image Like", "User Modal Image Like", "Vendor Modal Image Comment Like", "User Modal Image Added Comment Like", "User Modal Image Comment Like", "Vendor Modal Image Comment Reply Like", "User Modal Image Added Comment Reply Like", "User Modal Image Added Comment SubReply Like", "User Modal Image Comment SubReply Like", "Vendor Business Page Like", "User Business Page Like", "Vendor Review and Rating Like", "Other User Review and Rating Like", "Current User Review and Rating Like", "Vendor Review Comment Like", "User Comment Review and Rating Like", "User Review Comment Like", "Current User Review Comment Like", "Vendor Review Comment SubReply Like", "User Added Review and Rating SubReply Like", "User Review Comment SubReply Like", "User Added Review Reply SubReply Like", "Current User Review Comment Reply Like"];
				for(j=0;j<arr.length;j++){
					notifArr.push(arr[j]);
				}
			}
			if(userDetail.notificationConfiguration.comment == "true"){
				var arr = ["Vendor Modal Image Comment", "User Modal Image Comment", "Vendor Modal Image Comment Reply", "User Modal Image Added Comment Reply", "User Modal Image Comment Reply", "Vendor Review and Rating Comment", "Other User Review and Rating Comment", "Current User Review and Rating Comment", "Vendor Review Comment Reply", "User Review Comment", "Current User Review Comment Reply"];
				for(j=0;j<arr.length;j++){
					notifArr.push(arr[j]);
				}
			}
			if(userDetail.notificationConfiguration.report == "true"){
				var arr = ["businessDone-report-acknowledgedOne","business-image-report-acknowledged","business-report-acknowledged"];
				for(j=0;j<arr.length;j++){
					notifArr.push(arr[j]);
				}
			}
			if(userDetail.notificationConfiguration.editbusiness == "true"){
				var arr = ["Delete Business Vendor","Delete Business Admin"];
				for(j=0;j<arr.length;j++){
					notifArr.push(arr[j]);
				}
			}
			if(userDetail.notificationConfiguration){
				var arr = ['Vendor deleted Offer','Vendor Added New Business','Admin Business Page Modal Report','Vendor Business Page Bookmark','User Business Page Been There','User Business Page Report','User Modal Image Report','Payment Successfull','Thanks for Registering','Vendor Business Page Been There','Offer Deleted','Vendor Business Page Report','Thanks for Submiting Offer','Vendor has Submiting Offer','Vendor Modal Image Report','Invoice','Admin Business Page Report','User Business Page Bookmark','You have been Tagged','Thanks for Registering New Business','Anything Else Business Admin','UnFollow','Mail Receipt','Claim','Business Page Share'];
				for(j=0;j<arr.length;j++){
					notifArr.push(arr[j]);
				}
			}
		}
		var notificationLocs = notifArr.map(function(x) { return x } );


      	var notifDetails = Notification.find({'toUserId':userId,'status':'unread', 'event': {"$in": notificationLocs}}).fetch();
        	if(notifDetails){
          		var notifCount = Notification.find({'toUserId':userId,'status':'unread', 'event': {"$in": notificationLocs}}).count();

          		var notifcountZero = Session.set('notifZero',notifCount);
          		// if (notifcountZero == 0) {
          		// 	$('.notifCountIcon').hide();
          		// 	console.log('hello1');
          		// }else{
          		// 	$('.notifCountIcon').show();
          		// 	console.log('hello');
          		// }
        	}
      	return notifCount;
    },
    'notificationZero':function(){
    	var notcount = Session.get('notifZero');
    	if (notcount >0) {
    		return true;
    	}else{
    		return false;
    	}
    }
});

Template.generalHeader.events({
	'click .notifContent':function(event){
	    // event.preventDefault();
	    var id = event.currentTarget.id;
	    // console.log(id);
	    var notifDetails = Notification.findOne({'_id':id});
	    // console.log(notifDetails);

	    Meteor.call('updateNotification', id,function(error, result){
	          if (error) {
	            //   console.log ( error ); 
	          } //info about what went wrong 
	          else {
	            // console.log("updated Successfully");
	            // FlowRouter.go('/viewNotification');
	          }
	    });   
	 },
	//  'click .logo-generalHeader': function(event){
	// 	$('.homeSearchBarList').removeClass('searchDisplayShow').addClass('searchDisplayHide');
		
	//  },
});