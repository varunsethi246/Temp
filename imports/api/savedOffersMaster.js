import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Session } from 'meteor/session';
import { Bert } from 'meteor/themeteorchef:bert';

import { Business } from './businessMaster.js';

export const SavedOffer = new Mongo.Collection('savedOffer');

if (Meteor.isServer) {
  // This code only runs on the server
  Meteor.publish('savedOffer', function savedOffer(businessLink) {
  	var businessObj = Business.findOne({"businessLink" : businessLink});
  	if(businessObj){
	    return SavedOffer.find({"businessId":businessObj._id});  		
  	}
  });

  Meteor.publish('userOffer', function userOffer(userId) {
	    return SavedOffer.find({"userId":userId});  		
  });

  Meteor.publish('allSavedOffer', function allSavedOffer() {
	    return SavedOffer.find({});  		
  });
  Meteor.publish('saveOfferCount', function(userID) {
  		// var userID = this.userId;
  		// console.log('user :',userID);
		// Counts.publish(this, 'saveOfferCount', SavedOffer.find({'userId':userID,'businessStatus':'active'}));
		Counts.publish(this, 'saveOfferCount', SavedOffer.find({'userId':userID}));
  });
}

Meteor.methods({
	'insertSavedOffer':function(businessurl,actInact,offerId){
		var businessObj = Business.findOne({"businessLink":businessurl});
		if(businessObj){
			businessId 			= businessObj._id;
			if(actInact == 'inactive'){
				SavedOffer.remove({'offerId':offerId});
			}else{
				SavedOffer.insert({ 
				 	'userId'        	: Meteor.userId(),
				 	'businessId'		: businessId,
				 	'businessLink'		: businessurl,
				 	'offerId' 			: offerId,
					'createdAt'     	: new Date(),
					'date'				: moment().format('DD/MM/YYYY'),
					'businessStatus'	: 'active',
					}, function(error,result){
						if(error){
							return error;
						}
						if(result){
							return result; 
						}
					}

				);				
			}
		}		
	},
});