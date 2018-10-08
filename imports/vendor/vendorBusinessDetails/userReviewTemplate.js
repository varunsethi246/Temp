import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Bert } from 'meteor/themeteorchef:bert';

import { Business } from '/imports/api/businessMaster.js';
import { Review } from '/imports/api/reviewMaster.js';
import { ReviewCommentLikes } from '/imports/api/reviewCommentLikesMaster.js';
import { BusinessImage } from '/imports/videoUploadClient/businessImageClient.js';

var filesR = [];
var counterImg = 0;

Template.userReviewTemplate.onCreated(function(){
  this.subscribe('businessImage');
});

Template.userReviewTemplate.helpers({
	userLoadmoreCmmnt(dataIndex){
		if(dataIndex < 2){
			return true;
		} else{
			return false;
		}
	},
	userLoadmoreCmmntBtn(data){
		if(data){
			if(data.length > 2){
				return true;
			} else{
				return false;
			}
		}else{
			return false;
		}
		
	},
});





Template.userReviewTemplate.events({
	'click .busComentClose':function(event){
		var id = event.currentTarget.id;

		$('#busPageShare').modal('hide');
		$('#toVEmailRev-'+id).val('');
		$('#toVAddNoteRev-'+id).val('');
	},
	'click .shareBussPageRev' : function(event){
	    
		var fromEmail 	= Meteor.users.findOne({roles:'admin'}).emails[0].address;
		var id 		  	= event.currentTarget.id;
		console.log('id +',id);
		var reviewData = Review.findOne({'_id': id});
		
		// var userId = Review.findOne({'_id': id}).userId;

		if(reviewData){
	    	var reviewComment = reviewData.reviewComment;
	    	var subj = "Review Share";
		}
		var regxEmail =/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
		var toEmail = $('#toVEmailRev-'+id).val();
		if (regxEmail.test(toEmail)) {
		    var name = Meteor.users.findOne({_id:Meteor.userId()}).profile.name;
		    var addText = $('#toVAddNoteRev-'+id).val();

		    var msg = 'Hi there, <br/><br/>'+name+ ' has share review comment with you. Check it out.<p>'+addText+'</p><br/><div style="border: 1px solid #ccc;width: 500px;word-break: break-all;"><SPAN style= "font-size: 16px; font-weight: 700; position:absolute; top: 40%; padding-left: 2%;">'+reviewComment+'</SPAN><span style=""></span></div>';

			Meteor.call('commentShareEmail', toEmail, fromEmail, subj, msg,function(error,result){
				if(error){
					// Bert.alert(error.reason, 'danger', 'growl-top-right' );
					// return;
				}else{
					Bert.alert('Review successfully shared with your friend.','success','growl-top-right');
					$('#busPageShare').modal('hide');
					$('#toVEmailRev-'+id).val('');
					$('#toVAddNoteRev-'+id).val('');
				}
			});	
		}else{
			Bert.alert('Please enter valid Email Id.','danger','growl-top-right');
		}
	},
// sendEmailReviewComment
	'keydown .editReviewOneTime':function(event){
      setTimeout(function() {
         var comment = $('.editReviewOneTime').val();
         if(comment){
            var commentlen = comment.length;
            var remainText = 140 - commentlen;
            if(remainText < 0){
	            $('.textRemain').css('display','none');
	            $('.newMsgHide').css('display','none');
            }else{
	            $('.textRemain').css('display','block');
	            $('.newMsgHide').css('display','block');
	            $('.textRemain').text(remainText + ' /140');
            }
         }else{
            $('.textRemain').text('0 /140');
         }
      }, 1);
   	},
	
	'click .showMoreCommntDiv': function(event){
		// To Expant All comments
		var currentClass = $(event.currentTarget).parent().siblings().children();
		currentClass.removeClass('showMoreCommntDivNone');

		// To Change Buttons
		$(event.currentTarget).parent().css('display','none');
		$(event.currentTarget).parent().siblings('showLessCommnt').css('display','block');
		$('.userCommentOne').removeClass('userCommentWrapper');
	},


	'click .review-read-more': function(event){
		$('.ownerDesc4').show();
		$('.review-read-less').show();
		$('.review-read-more').hide();
	},

	'click .review-read-less': function(event){
		$('.ownerDesc4').hide();
		$('.review-read-less').hide();
		$('.review-read-more').show();
	},


	'click .focusInput' : function(event){
		$('.commentReplyEditInput').focus();
	},
	'click .commentLike' : function(event){
		var businessLink 		= $(event.currentTarget).parent().parent().parent().parent().attr('data-businesslink');
		var reviewPostedByUser 	= $(event.currentTarget).parent().parent().parent().parent().attr('data-reviewpostedby');
		var reviewId 			= $(event.currentTarget).parent().parent().parent().parent().attr('data-reviewid');
		var commentId 			= $(event.currentTarget).parent().parent().parent().parent().attr('data-commentid');	
		// console.log('businessLink: '+businessLink+' | reviewPostedByUser: '+reviewPostedByUser+' | reviewId: '+reviewId+' | commentId: '+commentId+' |');	
		var currenCommtUser = $(event.currentTarget).attr('data-userCommentId');
		var userId 	= Meteor.userId();

		var checkReviewCommentLike = ReviewCommentLikes.findOne({
			"businessLink"		: businessLink,
			"reviewPostedBy"	: reviewPostedByUser,
			"reviewId"			: reviewId,
			"commentId"			: commentId,
			"replyId"			: '',			
			"likedByUserId"		: Meteor.userId(),  
		});
		
		Meteor.call('insertReviewCommentLike',businessLink,reviewPostedByUser,reviewId,commentId, function(err,rslt){
			if(err){
				console.log('Error: ', err);
			}else{
				if(!checkReviewCommentLike){
					//============================================================
					// 			Notification Email / SMS / InApp
					//============================================================
					var admin = Meteor.users.findOne({'roles':'admin'});
	                var businessData = Business.findOne({"businessLink":businessLink});
				    if(admin){
				    	var adminId = admin._id;
				    }


	              	if(businessData){
	                    var vendorId = businessData.businessOwnerId;
	                    var userDetail = Meteor.users.findOne({'_id':vendorId});
	                    if(userDetail){
							var userVar = Meteor.users.findOne({'_id':userId});
							var reviewUserVar   = Meteor.users.findOne({'_id':reviewPostedByUser});
							var reviewCmntRplyUsr   = Meteor.users.findOne({'_id':currenCommtUser});
							if(userVar&&reviewUserVar&&reviewCmntRplyUsr){
	                	  		var username 	= userDetail.profile.name;
		                		var date 		= new Date();
		                		var currentDate = moment(date).format('DD/MM/YYYY');
		                		var msgvariable = {
									'[username]' 	: username,
				   					'[LikeDate]'	: currentDate,
					   				'[businessName]': businessData.businessTitle

				               	};

								var inputObj = {
									notifPath	 : businessLink,
								    to           : vendorId,
								    templateName : 'Vendor Review Comment Like',
								    variables    : msgvariable,
								}
								sendInAppNotification(inputObj);

								var inputObj = {
									notifPath	 : businessLink,
									from         : adminId,
								    to           : vendorId,
								    templateName : 'Vendor Review Comment Like',
								    variables    : msgvariable,
								}
								sendMailNotification(inputObj);

								// Send Notification, Mail and SMS to Current User
								var username 	= userVar.profile.name;
		                		var date 		= new Date();
		                		var currentDate = moment(date).format('DD/MM/YYYY');
		                		var msgvariable = {
									'[username]' 	: username,
				   					'[LikeDate]'	: currentDate,
					   				'[businessName]': businessData.businessTitle

				               	};

								var inputObj = {
									notifPath	 : businessLink,
									from         : adminId,
								    to           : userId,
								    templateName : 'Current User Review Comment Like',
								    variables    : msgvariable,
								}
								sendMailNotification(inputObj);

								// Send Notification, Mail and SMS to Only User that added Review
								var username 	= reviewUserVar.profile.name;
		                		var date 		= new Date();
		                		var currentDate = moment(date).format('DD/MM/YYYY');
		                		var msgvariable = {
									'[username]' 	: username,
				   					'[LikeDate]'	: currentDate,
					   				'[businessName]': businessData.businessTitle

				               	};

				               	if(userId!=reviewPostedByUser){
									var inputObj = {
										notifPath	 : businessLink,
									    to           : reviewPostedByUser,
									    templateName : 'User Comment Review and Rating Like',
									    variables    : msgvariable,
									}
									sendInAppNotification(inputObj);
								

									var inputObj = {
										notifPath	 : businessLink,
										from         : adminId,
									    to           : reviewPostedByUser,
									    templateName : 'User Comment Review and Rating Like',
									    variables    : msgvariable,
									}
									sendMailNotification(inputObj);
								}


								// Send Notification, Mail and SMS to Only User that added Review Comment
								var username 	= reviewCmntRplyUsr.profile.name;
		                		var date 		= new Date();
		                		var currentDate = moment(date).format('DD/MM/YYYY');
		                		var msgvariable = {
									'[username]' 	: username,
				   					'[LikeDate]'	: currentDate,
					   				'[businessName]': businessData.businessTitle

				               	};

				               	if(userId!=currenCommtUser){
									var inputObj = {
										notifPath	 : businessLink,
									    to           : currenCommtUser,
									    templateName : 'User Review Comment Like',
									    variables    : msgvariable,
									}
									sendInAppNotification(inputObj);
								

									var inputObj = {
										notifPath	 : businessLink,
										from         : adminId,
									    to           : currenCommtUser,
									    templateName : 'User Review Comment Like',
									    variables    : msgvariable,
									}
									sendMailNotification(inputObj);
								}

								

		                    }
		                }
	              	}
				}
			}
		});
	},

	'click .commentReplyLike':function(event){
		var businessLink 		= $(event.currentTarget).parent().parent().parent().parent().parent().attr('data-businesslink');
		var reviewPostedByUser 	= $(event.currentTarget).parent().parent().parent().parent().parent().attr('data-reviewpostedby');
		var reviewId 			= $(event.currentTarget).parent().parent().parent().parent().parent().attr('data-reviewid');
		var commentId 			= $(event.currentTarget).parent().parent().parent().parent().parent().attr('data-commentid');		
		var replyId 			= $(event.currentTarget).parent().parent().attr('data-replyid');
		
		var commentPostedByUser = $(event.currentTarget).attr('data-commentPostedUser');
		var commentReplyPostedUser = $(event.currentTarget).attr('data-commentReplyPostedUser');
		var userId 	= Meteor.userId();
		var notofData =  ReviewCommentLikes.findOne({"businessLink":businessLink,"reviewPostedBy":reviewPostedByUser,"reviewId":reviewId,"likedByUserId":userId,"commentId":commentId,"replyId":replyId});
		
		Meteor.call('insertReviewCommentReplyLike',businessLink,reviewPostedByUser,reviewId,replyId,commentId, function(err,rslt){
			if(err){
				console.log('Error: ', err);
			}else{
				if(!notofData){
					//============================================================
					// 			Notification Email / SMS / InApp
					//============================================================
					var admin = Meteor.users.findOne({'roles':'admin'});
	                var businessData = Business.findOne({"businessLink":businessLink});
				    if(admin){
				    	var adminId = admin._id;
				    }

	              	if(businessData){
	                    var vendorId = businessData.businessOwnerId;
	                    var userDetail = Meteor.users.findOne({'_id':vendorId});
	                    if(userDetail){
							var reviewUserVar   = Meteor.users.findOne({'_id':reviewPostedByUser});
							var reviewCmntUsr   = Meteor.users.findOne({'_id':commentPostedByUser});
							var reviewCmntRplyUsr   = Meteor.users.findOne({'_id':commentReplyPostedUser});
							var userVar = Meteor.users.findOne({'_id':userId});

							
							// Send Notification, Mail and SMS to Vendor
							if(userVar&&reviewUserVar&&reviewCmntRplyUsr&&reviewCmntUsr){
	                	  		var username 	= userDetail.profile.name;
		                		var date 		= new Date();
		                		var currentDate = moment(date).format('DD/MM/YYYY');
		                		var msgvariable = {
									'[username]' 	: username,
				   					'[LikeDate]'	: currentDate,
					   				'[businessName]': businessData.businessTitle

				               	};

								var inputObj = {
									notifPath	 : businessLink,
								    to           : vendorId,
								    templateName : 'Vendor Review Comment SubReply Like',
								    variables    : msgvariable,
								}
								sendInAppNotification(inputObj);

								var inputObj = {
									notifPath	 : businessLink,
									from         : adminId,
								    to           : vendorId,
								    templateName : 'Vendor Review Comment SubReply Like',
								    variables    : msgvariable,
								}
								sendMailNotification(inputObj);

								// Send Notification, Mail and SMS to Current User
								var username 	= userVar.profile.name;
		                		var date 		= new Date();
		                		var currentDate = moment(date).format('DD/MM/YYYY');
		                		var msgvariable = {
									'[username]' 	: username,
				   					'[LikeDate]'	: currentDate,
					   				'[businessName]': businessData.businessTitle

				               	};

								var inputObj = {
									notifPath	 : businessLink,
									from         : adminId,
								    to           : userId,
								    templateName : 'Current User Review Comment Reply Like',
								    variables    : msgvariable,
								}
								sendMailNotification(inputObj);

								// Send Notification, Mail and SMS to Only User that added Review
								var username 	= reviewUserVar.profile.name;
		                		var date 		= new Date();
		                		var currentDate = moment(date).format('DD/MM/YYYY');
		                		var msgvariable = {
									'[username]' 	: username,
				   					'[LikeDate]'	: currentDate,
					   				'[businessName]': businessData.businessTitle

				               	};

				               	if(userId!=reviewPostedByUser){
									var inputObj = {
										notifPath	 : businessLink,
									    to           : reviewPostedByUser,
									    templateName : 'User Added Review and Rating SubReply Like',
									    variables    : msgvariable,
									}
									sendInAppNotification(inputObj);
								

									var inputObj = {
										notifPath	 : businessLink,
										from         : adminId,
									    to           : reviewPostedByUser,
									    templateName : 'User Added Review and Rating SubReply Like',
									    variables    : msgvariable,
									}
									sendMailNotification(inputObj);
								}


								// Send Notification, Mail and SMS to Only User that added Review Comment
								var username 	= reviewCmntUsr.profile.name;
		                		var date 		= new Date();
		                		var currentDate = moment(date).format('DD/MM/YYYY');
		                		var msgvariable = {
									'[username]' 	: username,
				   					'[LikeDate]'	: currentDate,
					   				'[businessName]': businessData.businessTitle

				               	};

				               	if(userId!=commentPostedByUser){
									var inputObj = {
										notifPath	 : businessLink,
									    to           : commentPostedByUser,
									    templateName : 'User Review Comment SubReply Like',
									    variables    : msgvariable,
									}
									sendInAppNotification(inputObj);
								

									var inputObj = {
										notifPath	 : businessLink,
										from         : adminId,
									    to           : commentPostedByUser,
									    templateName : 'User Review Comment SubReply Like',
									    variables    : msgvariable,
									}
									sendMailNotification(inputObj);
								}

								// Send Notification, Mail and SMS to Only User that added Review Comment Reply
								var username 	= reviewCmntRplyUsr.profile.name;
		                		var date 		= new Date();
		                		var currentDate = moment(date).format('DD/MM/YYYY');
		                		var msgvariable = {
									'[username]' 	: username,
				   					'[LikeDate]'	: currentDate,
					   				'[businessName]': businessData.businessTitle

				               	};

				               	if(userId!=commentReplyPostedUser){
									var inputObj = {
										notifPath	 : businessLink,
									    to           : commentReplyPostedUser,
									    templateName : 'User Added Review Reply SubReply Like',
									    variables    : msgvariable,
									}
									sendInAppNotification(inputObj);
								

									var inputObj = {
										notifPath	 : businessLink,
										from         : adminId,
									    to           : commentReplyPostedUser,
									    templateName : 'User Added Review Reply SubReply Like',
									    variables    : msgvariable,
									}
									sendMailNotification(inputObj);
								}

								

		                    }
		                }
	              	}
					
	                //============================================================
					// 			End Notification Email / SMS / InApp
					//============================================================
				}


			}
		});
	},

	'click .unuserLike': function(event){
		if(!Meteor.userId()){
			$('#loginModal').modal('show');
			$('.loginScreen').show();
			$('.signupScreen').hide();
			$('.thankyouscreen').hide();
			// $('.genLoginSignup').show();
			$('.thankyouscreen').hide();
			$('.signUpBox').hide();
		}
	},

	'click .busPagefbShare':function(event){
		var id = event.currentTarget.id;
		var url = window.location.href;
		var reviewData = Review.findOne({'_id':id});
		if(reviewData){
			var title       = reviewData.businessLink;
			var description = reviewData.reviewComment;

			var businessData = Business.findOne({'businessLink':title});
			if(businessData){
				if(businessData.businessImages){
					var pic = BusinessImage.findOne({"_id":businessData.businessImages[0].img});
					if(pic){
						businessData.businessImages = pic.path;
					}else{
						businessData.businessImages = 'https://s3.us-east-2.amazonaws.com/rightnxt1/StaticImages/general/rightnxt_image_nocontent.jpg';
					}

				}else{
					businessData.businessImages = 'https://s3.us-east-2.amazonaws.com/rightnxt1/StaticImages/general/rightnxt_image_nocontent.jpg';
				}

				var img = businessData.businessImages;
				var image = 'https://rightnxt.s3.amazonaws.com/BusinessImages/'+img;
				
				fBshare(url,title,description,image);
			}//businessData
		}//reviewData
		
	},

	'click .busPagegpShare ':function(){
		var url = window.location.href;
		// googleplusshare(url);

		var id = $('.busPagegpShare').attr('id');
		var reviewData = Review.findOne({'_id':id});
		if(reviewData){
			var title       = reviewData.businessLink;
			var description = reviewData.reviewComment;

			var businessData = Business.findOne({'businessLink':title});
			if(businessData){
				if(businessData.businessImages){
					var pic = BusinessImage.findOne({"_id":businessData.businessImages[0].img});
					if(pic){
						businessData.businessImages = pic.path;
					}else{
						businessData.businessImages = 'https://s3.us-east-2.amazonaws.com/rightnxt1/StaticImages/general/rightnxt_image_nocontent.jpg';
					}

				}else{
					businessData.businessImages = 'https://s3.us-east-2.amazonaws.com/rightnxt1/StaticImages/general/rightnxt_image_nocontent.jpg';
				}

				var img = businessData.businessImages;
				var image = 'https://rightnxt.s3.amazonaws.com/BusinessImages/'+img;

				
				shareToGooglePlus(url,title,description,image);
			}//businessData
		}//reviewData
	}

});
