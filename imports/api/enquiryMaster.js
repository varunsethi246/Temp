import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Session } from 'meteor/session';
import { Bert } from 'meteor/themeteorchef:bert';

export const Enquiry = new Mongo.Collection('enquiry');

if (Meteor.isServer) {
  // This code only runs on the server
	Meteor.publish('vendorBusinessEnquiry', function vendorBusinessEnquiry() {
		return Enquiry.find({});
	});
	Meteor.publish('userEnquiry', function userEnquiry() {
		return Enquiry.find({'enquirySentBy':this.userId,'deleteStatus': false,});
	});
	Meteor.publish('businessEnquiryCount', function businessEnquiryCount() {
		return Enquiry.find({});
	});
	 Meteor.publish('enquiryCount', function(userID) {
  		// var userID = this.userId;
		// Counts.publish(this, 'enquiryCount', Enquiry.find({'enquirySentBy':this.userId,'businessStatus':'active'}));
		Counts.publish(this, 'enquiryCount', Enquiry.find({'enquirySentBy':userID,'deleteStatusVen' : false}));
  	});
  	Meteor.publish('noOfEnqWeek', function() {
  		var days = 7;
  		var currentDate = new Date();
  		var last = new Date(currentDate.getTime()-(days * 24 *60 *60 *1000));
  		var first = currentDate.getDate() - currentDate.getDay();
  		var lastDate = new Date(last).toLocaleString();
  		var firstWeekDate = new Date(currentDate.setDate(first)).toISOString();
		Counts.publish(this, 'noOfEnqWeek', Enquiry.find({'enquiryCreatedAt' : {$gte : new Date(firstWeekDate), $lt :new Date( new Date().toISOString())}}));
	});
	Meteor.publish('noOfEnqMonth', function() {
  		var currentDate = new Date();
  		var firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  		var lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
		Counts.publish(this, 'noOfEnqMonth', Enquiry.find({'enquiryCreatedAt' : {$gte : new Date(firstDay), $lt :new Date( new Date().toISOString())}}));
	});
	Meteor.publish('noOfEnqYear', function() {
  		var currentDate = new Date();
  		var endDate = new Date(currentDate.getFullYear(),11, 31);
  		var startDate = new Date(new Date().getFullYear(), 0, 1);
		Counts.publish(this, 'noOfEnqYear', Enquiry.find({'enquiryCreatedAt' : {$gte :startDate, $lt :endDate}}));
	});
}

Meteor.methods({
	'insertBusEnquiry':function(formValues){
		var id = Enquiry.insert({ 
			"businessid"		: formValues.businessid,
            "businessTitle"     : formValues.businessTitle,
            "businessLink"		: formValues.businessLink,
			"enquirySentBy" 	: formValues.enquirySentBy,
			"enquiryName" 		: formValues.enquiryName,
			"enquiryEmail" 		: formValues.enquiryEmail,
			"enquiryPhone" 		: formValues.enquiryPhone,
			"enquiryDesc" 		: [
									{"comment"   		: formValues.enquiryDesc,
									 "commentsTS" 		:  new Date(),
									 "commentBy" 		: formValues.enquiryType,
									 "commentImage" 	: formValues.enquiryPhoto,
									 "commentblock"     : formValues.commentblock,
									}
								  ],
			"enquiryCreatedAt" 	: new Date(),
			"vendorReadFlag"	: 'unread',
			"vendorSpecialFlag"	: 'noflag',
			"vendorArchive"		: 'noArchived',
			"userReadFlag"	    : 'unread',
			"userSpecialFlag"	: 'noflag',
			"userArchive"		: 'noArchived',
			'businessStatus'	: 'active',
			'deleteStatus' 		: false,
			'deleteStatusVen' 	: false
		});	
		return id;	
	},

	'insertEnqCommentUser': function(formValues){
		return Enquiry.update(
			{"_id": formValues.id},
			{$push:{"enquiryDesc":{"comment"		: formValues.enquiryCommentNew,
									"commentsTS" 	: new Date(),
									"commentBy" 	: "User",
									"commentImage"  : formValues.enquiryPhoto,
									"commentblock"  : formValues.commentblock,
								  }
					}
			,
			$set:{
				"vendorReadFlag"	: 'unread',
				// "userReadFlag"	    : 'unread',
				}
			});
	},

	'insertEnqCommentVendor': function(formValues){
		return Enquiry.update(
			{"_id": formValues.id},
			{$push:{"enquiryDesc":{"comment"		: formValues.enquiryCommentNew,
									"commentsTS" 	: new Date(),
									"commentBy" 	: "Vendor",
									"commentImage"  : formValues.enquiryPhoto,
								  }
					}
			,
			$set:{
				// "vendorReadFlag"	: 'unread',
				"userReadFlag"	    : 'unread',
				}
			});
	},

	// For Vendor Side
	'updateEnquiryForRead':function(id,value){
		return Enquiry.update({"_id":id},{$set:{"vendorReadFlag":value}});
	},

	'updateEnquiryForFlag':function(id,value){
		return Enquiry.update({"_id":id},{$set:{"vendorSpecialFlag":value}});
	},
	'deleteEnquiry':function(id){
		return Enquiry.remove({"_id":id});
	},
	'updateEnquiryForArchive':function(id,value){
		return Enquiry.update({"_id":id},{$set:{"vendorArchive":value}});
	},

	// For User Side
	'updateEnquiryForUserRead':function(id,value){
		return Enquiry.update({"_id":id},{$set:{"userReadFlag":value}});
	},

	'updateEnquiryForUserFlag':function(id,value){
		return Enquiry.update({"_id":id},{$set:{"userSpecialFlag":value}});
	},
	'deleteUserEnquiry':function(id){
		// return Enquiry.remove({"_id":id});
		return Enquiry.update({"_id":id},{$set:{'deleteStatus' : true}});

		

	},
	'updateUserEnquiry':function(id){
		// return Enquiry.remove({"_id":id});
		return Enquiry.update({"_id":id},{$set:{'deleteStatusVen' : false}});

		

	},
	'updateEnquiryForUserArchive':function(id,value){
		return Enquiry.update({"_id":id},{$set:{"userArchive":value}});
	},
});