import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Bert } from 'meteor/themeteorchef:bert';
import { Business } from '/imports/api/businessMaster.js';
import { Review } from '/imports/api/reviewMaster.js';
import { ReviewCommentLikes } from '/imports/api/reviewCommentLikesMaster.js';
import { FollowUser } from '../../api/userFollowMaster.js';
import { Categories } from '../../api/masterData/categoriesMaster.js';
import { emptyReviewTemplate } from '../../common/emptyReviewTemplate.html';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { BusinessImage } from '/imports/videoUploadClient/businessImageClient.js';
import { VendorImage } from '/imports/videoUploadClient/vendorImageClient.js';
import { ReviewImage } from '/imports/videoUploadClient/reviewImageClient.js';
import ImageCompressor from 'image-compressor.js';

import '../userLayout.js';
import './userReviewPage.html';
import './userReview.html';
import './userReviewSuggestion.html';
import '../../common/tagFrnd.js'
import '../../common/starRating2.html'
import '../../common/starRating.js'


tagedFriends = [];
var filesR = [];
var counterImg = 0;
const uniqueId = [];

sortReviewDateAscending = function(){
    var products = $('.timeLine');
    products.sort(function(a, b){ return $(a).data("date")-$(b).data("date")});
    $("#reviewDateSort").html(products);

}

sortReviewDateDescending = function(){
    var products = $('.timeLine');
    products.sort(function(a, b){ return $(b).data("date") - $(a).data("date")});
    $("#reviewDateSort").html(products);

}

Template.userReviewPage.helpers({
	checkIdExists(){
		var url = FlowRouter.current().path;
		var checkIdExists = url.split('/');
		var data = {};
		if(checkIdExists[2] != '' && checkIdExists[2]){
			return false;
		}else{
			return true;
		}
	}
});

Template.userReview.onRendered(function(){

	$(document).ready(function(){
		$('.userCommentWrapper').each(function(){
			var i = 0;
			$(this).children('.commentReplyArr').each(function(){
				if(i>1){
					$(this).hide();
				}
				i++;
			});
			if ($(this).children('.commentReplyArr').length > 2) {
				
				if($(this).children('.showreplyCmt').length == 0){
					$(this).append("<div class='col-lg-3 pull-right showreplyCmt'> Show all replies </div>");
				}
			}
		});

	});
});

Template.userReview.helpers({
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
	checkReviewLoading(){
		var count = Counts.get('ReviewsCount');		
		if(count<=0){
			return true;
		}else{
			return false;
		}
	},
	checkCurrentUser:function(userId){
		// console.log(FlowRouter.getQueryParam("id"));
		if(userId == Meteor.userId() || userId == FlowRouter.getQueryParam("id")){
			return true;
		}else{
			return false;
		}
	},
	'getFrndsList' : function(){
		var data =  tagFriend1.getData();
	    var data1 = [];
		if(tagedFriends.length > 0){
			for(var i = 0 ; i < data.length ; i++){
				var temp = 0 ;
				for(var j = 0 ; j < tagedFriends.length; j++){
					if(tagedFriends[j].selectedUserId == data[i]._id){
						temp = 1;
						break;
					}
				}
				if(temp == 0 ){
					data1.push(data[i]);
				}
			}
		var resultFrnds = tagedFriends.reduce(function(memo, e1){
		var matches = memo.filter(function(e2){
		    return e1.selectedUserId == e2.selectedUserId && e1.selectedUserId == e2.selectedUserId
		  })
		  if (matches.length == 0)
		    memo.push(e1)
		    return memo;
		}, []);

		tagedFriends = resultFrnds;
			data = data1;
			var result =  {data,resultFrnds};
		}else{
			var result =  {data,resultFrnds};
		}
	    return result;
	},
	'businessReviews' :function(){
		var userID  = Meteor.userId();
		if(Session.get('loadmore')){
			limitReviews = Session.get('loadmore');
		}else{
			limitReviews = 5;
		}

		var id = '';
		var url = FlowRouter.current().path;
		var checkIdExists = url.split('/');
		var data = {};
		if(checkIdExists[2] != '' && checkIdExists[2]){
			id = produceURLid(checkIdExists[2]);
		}else{
			id = Meteor.userId();
		}
		
		var returnReviewData = [];
		var reviewDataTotalCount = Review.find({"userId":id},{sort: {reviewDate:-1}}).count();
		var reviewData = Review.find({"userId":id},{sort: {reviewDate:-1},limit:limitReviews }).fetch();
		
		if(reviewData){
			if(reviewData.length < 5  || reviewData.length == reviewDataTotalCount){
				reviewData.showLoadMoreReview = 'hideFollowButton';
			}else{
				reviewData.showLoadMoreReview = '';
			}
			for (var i = 0; i < reviewData.length; i++) {

				var businessLinkVar	= reviewData[i].businessLink;
				var businessData   	= Business.findOne({'businessLink':businessLinkVar,'status':'active'});
				if (businessData){
					var reviewDateNumber = reviewData[i].reviewDate.getTime();
					reviewData[i].reviewDateNumber = reviewDateNumber;
					if(businessData.businesscategories){
						var categories = getCategory(businessData.businesscategories);
						if(categories){
							reviewData[i].categoryClasses = categories;
						}
					}

					reviewData[i].businessTitle = businessData.businessTitle;
					reviewData[i].businessArea 	= businessData.businessArea;
					businessData.businessArea 	= businessData.businessArea.split(' ').join('-');
					reviewData[i].AreaClasses 	= businessData.businessArea.split('.').join('-');
					reviewData[i].businessCity 	= businessData.businessCity;

					if(businessData.publishedImage){
						var pic = BusinessImage.findOne({"_id":businessData.publishedImage});
						if(pic){
							reviewData[i].businessImages = pic.link();
						}else{
							var pic1 = ReviewImage.findOne({"_id":businessData.publishedImage});
							if(pic1){
								reviewData[i].businessImages = pic1.link();
							}else{
								reviewData[i].businessImages = 'https://s3.us-east-2.amazonaws.com/rightnxt1/StaticImages/general/rightnxt_image_nocontent.jpg';
							}
						}
					}
					else if(businessData.businessImages && businessData.businessImages.length > 0){
						var pic = BusinessImage.findOne({"_id":businessData.businessImages[0].img});
						if(pic){
							reviewData[i].businessImages = pic.link();
						}else{
							var pic1 = ReviewImage.findOne({"_id":businessData.businessImages[0].img});
							if(pic1){
								reviewData[i].businessImages = pic1.link();
							}else{
								reviewData[i].businessImages = 'https://s3.us-east-2.amazonaws.com/rightnxt1/StaticImages/general/rightnxt_image_nocontent.jpg';
							}
						}

					}else{
						reviewData[i].businessImages = 'https://s3.us-east-2.amazonaws.com/rightnxt1/StaticImages/general/rightnxt_image_nocontent.jpg';
					}

					reviewData[i].reviewDateAgo = moment(reviewData[i].reviewDate).fromNow();
					var timeAgo = reviewData[i].reviewDateAgo;

					var link = FlowRouter.current().path;
					var checkIdExists = link.split('/');
					var id = '';
					id = Meteor.userId();
					if(id){
						var data = Meteor.users.findOne({"_id":id},{"profile":1});
						if(reviewData[i].userId == id){
							reviewData[i].userIDs = reviewData[i].userId;
						}
						if(data){
							if(data.profile){
								if(data.profile.userProfilePic){
									var pic = VendorImage.findOne({"_id":data.profile.userProfilePic});
									if(pic){
										reviewData[i].userProfilePic = pic.link();	
									}
									else{
										reviewData[i].userProfilePic = "/users/profile/profile_image_dummy.svg";	
									}
								}else{
									reviewData[i].userProfilePic = "/users/profile/profile_image_dummy.svg";
								}
							}
						}						
					}


					if(reviewData[i].tagedFriends.length != 0){
						reviewData[i].tagedFriendsValidate = true;
						var tagedFriendsArray = [];
						for(m=0;m<reviewData[i].tagedFriends.length;m++){
							var userTagObj = Meteor.users.findOne({"_id":reviewData[i].tagedFriends[m]});

							var dataImgUser = '';
							if(userTagObj){
								if(userTagObj.profile){
									if(userTagObj.profile.userProfilePic){
										var imgData = VendorImage.findOne({"_id":userTagObj.profile.userProfilePic});
										if(imgData)	{
											dataImgUser = imgData.link();
										}else{
											dataImgUser = '/users/profile/profile_image_dummy.svg';
										}
									}else{
										dataImgUser = '/users/profile/profile_image_dummy.svg';
									}

									if(userTagObj._id == Meteor.userId()){
										var tagedFriendsUrl = '';
									}else{
										var tagedFriendsUrl = generateURLid(reviewData[i].tagedFriends[m]);
									}

									var obj = {
										'tagedFriends'   : userTagObj.profile.name,
										'tagedFriendsUrl': tagedFriendsUrl,
										'userTagged':reviewData[i].tagedFriends[m],
										'imagePath':dataImgUser,
									}
									tagedFriendsArray.push(obj);
								}
							}
						}
						reviewData[i].tagedFriendsArray = tagedFriendsArray;
					} else{
						reviewData[i].tagedFriendsValidate = false;
					}


					if(reviewData[i].reviewComment){
						if(reviewData[i].reviewComment.length > 300){
							var userRevDesc1 = reviewData[i].reviewComment.substring(0,300);
							var userRevDesc2 = reviewData[i].reviewComment.substring(300,reviewData[i].reviewComment.length);
							reviewData[i].userReviewDesc1 = userRevDesc1;
							reviewData[i].userReviewDesc2 = userRevDesc2;


						}
					}
					
					if(reviewData[i].userComments){		
						reviewData[i].userCommentsCount = reviewData[i].userComments.length;
						reviewData[i].userComments = reviewData[i].userComments.reverse();
						for(k=0;k<reviewData[i].userComments.length; k++){
							var userId  = reviewData[i].userComments[k].userId;
							if(Roles.userIsInRole(userId, ['user'])){
								reviewData[i].userComments[k].redirectid = generateURLid(userId);
							}
							var userObj = Meteor.users.findOne({"_id":userId});
							if(userObj){
								if(userObj.profile){									
									if(userObj._id == Meteor.userId()){
										reviewData[i].userComments[k].userID = userObj._id;
									}
									reviewData[i].userComments[k].commentUserName = userObj.profile.name;
										if(userObj.profile.userProfilePic){	
											var pic = VendorImage.findOne({"_id":userObj.profile.userProfilePic});
											if(pic){
												reviewData[i].userComments[k].userProfileImgPath = pic.link();	
											}
											else{
												reviewData[i].userComments[k].userProfileImgPath = "/users/profile/profile_image_dummy.svg";
											}				
										}else{

											reviewData[i].userComments[k].userProfileImgPath = '/users/profile/profile_image_dummy.svg';
										}

									reviewData[i].userComments[k].userCommentDateAgo = moment(reviewData[i].userComments[k].userCommentDate).fromNow();
								}
							}		

							//=========== Comment Replies =============
							if(reviewData[i].commentReply){
								//create separate of all replies to each comment
								var commentReplyArr = [];
								var rn = 0;
								for(l=0;l<reviewData[i].commentReply.length; l++){
									var replyObj = {};
									if(reviewData[i].commentReply[l].userCommentId == reviewData[i].userComments[k].userCommentId){
										replyObj.commentReplyUserId = reviewData[i].commentReply[l].userId;
										replyObj.commentReply = reviewData[i].commentReply[l].commentReply;
										replyObj.userCommentID = reviewData[i].commentReply[l].userCommentId;

										replyObj.replyId  = reviewData[i].commentReply[l].userReplyId;
										var userId1  = reviewData[i].commentReply[l].userId;
										if(userId1 === Meteor.userId()){
											replyObj.repEditBlock = 'show';
										}else{
											replyObj.repEditBlock = 'hide';
										}

										var userObj1 = Meteor.users.findOne({"_id":userId1});
										if(userObj1){
											if(userObj1.profile){
												replyObj.commentReplyUserName = userObj1.profile.name;
												if(userObj1.profile.userProfilePic){	
													var pic = VendorImage.findOne({"_id":userObj1.profile.userProfilePic});
													if(pic){
														replyObj.replyProfileImgPath = pic.link();	
													}
													else{
														replyObj.replyProfileImgPath = "/users/profile/profile_image_dummy.svg";
													}				
												}else{
													replyObj.replyProfileImgPath = '/users/profile/profile_image_dummy.svg';
												}
											}
											replyObj.commentReplyDateAgo = moment(reviewData[i].commentReply[l].commentReplyDate).fromNow();

											//check if current user has liked the current comment-reply
											var replySelector = {
																"reviewId" 		: reviewData[i]._id,
																"replyId"		: replyObj.replyId.toString(),
																"likedByUserId"	: Meteor.userId(),
															};
											var checkCommentReplyLike =  ReviewCommentLikes.findOne(replySelector);

											// if(checkCommentReplyLike){
											// 	replyObj.replyLikeUnlike = true;
											// }else{
											// 	replyObj.replyLikeUnlike = false;
											// }
											var commentReplyLikeCount = ReviewCommentLikes.find({
																			"reviewId" 		: reviewData[i]._id,
																			"replyId" 		: replyObj.replyId.toString(),
																		}).fetch();
											if(commentReplyLikeCount){
												replyObj.commentReplyLikeCount = commentReplyLikeCount.length;
											}
										}
										commentReplyArr.push(replyObj);
										rn++;
									}//if
								}//for

								reviewData[i].userComments[k].commentReplyArr = commentReplyArr;
								reviewData[i].userComments[k].commentReplyCount = rn;
								// commentReplyArr = [];
							}

							//check if current user has liked the current comment
							var selector = {
												"reviewId" 		: reviewData[i]._id,
												"commentId" 	: reviewData[i].userComments[k].userCommentId.toString(),
												"likedByUserId"	: Meteor.userId(),
												"replyId" 		: ''
											};
							var checkCommentLike =  ReviewCommentLikes.findOne(selector);

							if(checkCommentLike){
								reviewData[i].userComments[k].likeUnlike = true;
							}else{
								reviewData[i].userComments[k].likeUnlike = false;
							}
							var commentLikeCount = ReviewCommentLikes.find({
														"reviewId" 		: reviewData[i]._id,
														"commentId" 	: reviewData[i].userComments[k].userCommentId.toString(),
														"replyId" 		: ''
													}).fetch();
							if(commentLikeCount){
								reviewData[i].userComments[k].commentLikeCount = commentLikeCount.length;
							}
						}
					}else{
						reviewData[i].userCommentsCount = 0;					
					}

					if(reviewData[i].reviewLikes){					
						reviewData[i].reviewLikeCount = reviewData[i].reviewLikes.length;
						reviewData[i].likeClass = '';
						for(l=0; l<reviewData[i].reviewLikes.length; l++){
							if(reviewData[i].reviewLikes[l].likedByUser == Meteor.userId() ){
								reviewData[i].likeClass = 'orangeHeart';
								break;
							}
						}	
					}else{
						reviewData[i].reviewLikeCount = 0;
						reviewData[i].likeClass = '';
					} 

					if(reviewData[i].reviewImages){
						for(j=0;j<reviewData[i].reviewImages.length;j++){
							var reviewPhoto = ReviewImage.findOne({"_id":reviewData[i].reviewImages[j].img});
							if(reviewPhoto){
								reviewData[i].reviewImages[j].imagePath = reviewPhoto.link();
							}
						}
					}
					returnReviewData.push(reviewData[i]);
				}//end of businessData
				// var timeAgo = moment(reviewData[i].createdAt).fromNow();
				// reviewData[i].timeAgo = timeAgo;
			}

			return returnReviewData;
		}
	},

	businessCategoriesList(){
		if(FlowRouter.getQueryParam('id')){
			var userId     = FlowRouter.getQueryParam('id');
		}else{
			var userId     = Meteor.userId();
		}
		var categories =[];

		var reviewData = Review.find({"userId":userId},{sort: {reviewDate:-1} }).fetch();
		if(reviewData){
			for (var i = 0; i < reviewData.length; i++) {
				var businessLinkVar	= reviewData[i].businessLink;
				var businessData   	= Business.findOne({'businessLink':businessLinkVar});
				if(businessData){
					if(businessData.businesscategories){
						var categoriesCount = businessData.businesscategories.length;
						
						for(j = 0 ; j < categoriesCount ; j++)
						{
							var levelDataObject =  businessData.businesscategories[j];

							var levelData  =  String(levelDataObject);

							if (levelData) {
								var levels = levelData.split('>');
								if(levels[1]){
									var level1 = levels[1].trim();
									categories.push(level1);
								}
							}	
						}
					}
				}
			}
			var busCategories = _.uniq(categories);
			return busCategories;
		}

	},

	businessLocationList(){
		if(FlowRouter.getQueryParam('id')){
			var userId     = FlowRouter.getQueryParam('id');
		}else{
			var userId     = Meteor.userId();
		}
		var location =[];
		var reviewData = Review.find({"userId":userId},{sort: {reviewDate:-1} }).fetch();
		if(reviewData){
			for (var i = 0; i < reviewData.length; i++) {
				var businessLinkVar	= reviewData[i].businessLink;
				var businessData   	= Business.findOne({'businessLink':businessLinkVar});
				if(businessData){
					if(businessData.businessArea){
						location.push(businessData.businessArea);
					}
				}

			}
			var busLocation = _.uniq(location);

			return busLocation;
		}

	},
});

getCategory = function(categoriesArray){
	var categories = [];
	if(categoriesArray){
		var categoriesCount = categoriesArray.length;
		for(j = 0 ; j < categoriesCount ; j++)
		{
			var levelDataObject =  categoriesArray[j];
			var levelData  =  String(levelDataObject);
			if (levelData) {
			  var levels     =  levelData.split('>');
				if(levels[1]){
					var level1 = levels[1].trim();
					categories.push(level1);
					// levelData = '';
				}	
			}
		}
		var busCategories = _.uniq(categories);
		var categoryClasses = '';
		for(k=0;k<busCategories.length;k++){
			var businessSplit = busCategories[k].split(' ').join('-');
			categoryClasses = categoryClasses + ' ' + businessSplit;
		}
		return categoryClasses;
	}
}

Template.userReviewSuggestion.events({
	'click .followII':function(event){
		var url = FlowRouter.current().path;
		// var userid = url.split('/');
		// if(userid[2] != ''&& userid[2]){
		// 	id = userid[2];
		// }else{
		// 	var value  = this;
		// 	id     = value._id;
		// }

		var userid = FlowRouter.getQueryParam('id');
		if(userid){
			id = userid;
		}else{
			var value  = this;
			id     = value._id;
		}
		// var value  = this;
		// id     = value._id;
		Meteor.call('insertUserFollow',id,function(error,result){
			if(error){
				// console.log(error.reason);
			}else{
				var getResult = result;
				var followData = FollowUser.findOne({"_id":getResult});
              	if(followData){
                	var usermailId = followData.followUserId;
                	var userVar    = Meteor.users.findOne({'_id':usermailId});
                	if(userVar){
                		var notifConfig = userVar.notificationConfiguration.follow;
                        if(notifConfig == "true"){
		                	var inputObj = {
		                        roles       : 'user',
		                        to          : usermailId,
		                        templateName: 'Follow',
		                        OrderId     : getResult,
		                	}
		                	sendMailNotification(inputObj);
	                    }
                	}//userVar
              	}//followData 
              	$('.followII').hide();

			}
		});
	},
});
Template.userReview.helpers({
	showRating(){
		// userId,businessLink
		var newid = FlowRouter.getQueryParam('id');
		if(newid){
			var userId = newid;
		}else{
			var userId = Meteor.userId();
		}
		var businessUrl = this.businessLink;
		// var businessLinkNew = Business.findOne({"businessLink":businessLinks});
		var ratingInt = Review.find({"userId" : userId,"businessLink":businessUrl}).fetch();
		if(ratingInt){
			for (var i = 0; i < ratingInt.length; i++) {
				
				var latestRating = ratingInt[i].rating;

				var intRating = parseInt(latestRating);
				var balRating = latestRating - intRating;
				var finalRating = intRating + balRating;
				if(balRating > 0 && balRating < 0.5){
					var finalRating = intRating + 0.5;
				}
				if(balRating > 0.5){
					var finalRating = intRating + 1;
				}

				ratingObj = {};

				for(j=1; j<=10; j++){
					var x = "star" + j;
					if(j <= finalRating*2){
						if( j%2 == 0){
							ratingObj[x] = "fixStar2";
						}else{
							ratingObj[x] = "fixStar1";
						}				
					}else{
						ratingObj[x]  = "";
					}
				
				}

			}

			return ratingObj;
		}else{
			return {};
		}
	},
});

Template.userReviewSuggestion.helpers ({
	'reviewsData':function(){
		var countUserId = Session.get('useridone');
		var reviewCount   = Review.find({'userId': countUserId}).count();
		if (reviewCount > 1) {
			return true;
		}else{
			return false;
		}
	},
	'followersData':function(){
		var countUserId = Session.get('useridone');
		var followerCount = FollowUser.find({'followUserId': countUserId}).count();
		if (followerCount > 1) {
			return true;
		}else{
			return false;
		}
	},
	'userSuggestionrender':function(){
		// var uid         = Meteor.userId();
		var userArray      = [];
		var followArray    = [];

		var uid = '';
		var url = FlowRouter.current().path;
		var checkIdExists = url.split('/');
		var data = {};
		if(checkIdExists[2] != '' && checkIdExists[2]){
			uid = produceURLid(checkIdExists[2]);
		}else{
			uid = Meteor.userId();
		}
		var currentUserObj = Meteor.users.findOne({"_id":uid});
	
			if(currentUserObj){
				if(currentUserObj.profile){
					userCity = currentUserObj.profile.city;
					if(userCity){
						var otherUsersData  = Meteor.users.find({"profile.city":userCity, "_id":{$ne: uid}, "roles":{$nin: [ 'admin', 'Vendor','Staff']}}).fetch();
					}else{
						var otherUsersData  = Meteor.users.find({"_id":{$ne: uid}, "roles":{$nin: [ 'admin', 'Vendor','Staff']}}).fetch();
					}
					if(otherUsersData && otherUsersData.length>0){
						for(var i=0;i<otherUsersData.length;i++){
							var name    = otherUsersData[i].profile.name;
							var id      = otherUsersData[i]._id;
							var userID  = Session.set('useridone',id);
							var pic     = VendorImage.findOne({"_id":otherUsersData[i].profile.userProfilePic});
							if(pic){
								otherUsersData[i].profile.userProfilePic = pic.link();	
							}
							else{
								otherUsersData[i].profile.userProfilePic = "/users/profile/profile_image_dummy.svg";	
							}
							var followUser = FollowUser.findOne({'userId': currentUserObj._id, 'followUserId':id});
							if(!followUser){
								var followerCount = FollowUser.find({'followUserId': id}).count();
								var reviewCount   = Review.find({'userId': id}).count();
								var redirectid 	  = generateURLid(id);
								userArray.push({
									'_id'               : id,
									'SuggestionInt'     : name,
									'UsersuggestionImg' : otherUsersData[i].profile.userProfilePic,
									'userSuggestionFol' : followerCount,
									'userSuggestionRev' : reviewCount,
									'redirectid'		: redirectid,
								})
								
								
							}//!followUser
						}//i
					}//otherUsersData
				}
			}
			// var url = FlowRouter.current().path;
			// var checkIdExists = url.split('/');
			// if(checkIdExists[2] != '' && checkIdExists[2]){
			// 	var returnUserArray = userArray.filter(function(el) { return el._id != checkIdExists[2]; });
			// }
			return userArray;
	},
});

Template.userReview.events({


	'click .userReview-read-more': function(event){
		$('.userReviewDesc2').show();
		$('.userReview-read-less').show();
		$('.userReview-read-more').hide();
	},

	'click .userReview-read-less': function(event){
		$('.userReviewDesc2').hide();
		$('.userReview-read-less').hide();
		$('.userReview-read-more').show();
	},

	'click .showreplyCmt' : function(event){
		event.preventDefault();
		var thisElem = event.currentTarget;

		$(thisElem).siblings('.commentReplyArr').slideDown();
		$(thisElem).removeClass('showreplyCmt');
		$(thisElem).addClass('hideReplyCmt');
		$(thisElem).text("Show Less replies");	

	},
	'click .hideReplyCmt' : function(event){
		event.preventDefault();
		var thisElem = event.currentTarget;

		$(thisElem).siblings('.commentReplyArr').slideUp();
		$(thisElem).siblings('.commentReplyArr').first().slideDown();
		$(thisElem).siblings('.commentReplyArr').first().next().slideDown();

		$(thisElem).text("Show all replies");

		$(thisElem).removeClass('hideReplyCmt');
		$(thisElem).addClass('showreplyCmt');

	},
	'click .showMoreCommntDiv': function(event){
		// To Expant All comments
		var currentClass = $(event.currentTarget).parent().siblings();
		currentClass.removeClass('showMoreCommntDivNone');

		// To Change Buttons
		$(event.currentTarget).parent().css('display','none');
		$(event.currentTarget).parent().siblings('showLessCommnt').css('display','block');
	},
	"keydown #searchFrndsEdit":function(e){
		//For Up and Down arrow selection in dropdown
		$('.tagFrndUlFrieldList').removeClass('searchDisplayHide').addClass('searchDisplayShow');
		
		if(e.keyCode == 9) {
			e.preventDefault();
		}

		var current_index = $('.selectedSearch').index();
		
		var $number_list = $('.tagFrndUlFrieldList');
		
		var $options = $number_list.find('.tagFrndLiFrieldList');
		
		var items_total = $options.length;
		if (e.keyCode == 40) {
	        if (current_index + 1 < items_total) {
	            current_index++;
	            change_selection();
	        }
	    } else if (e.keyCode == 38) {
	        if (current_index > 0) {
	            current_index--;
	            change_selection();
	        }
	    }
	    var selectedUser = $('.selectedSearch').attr('data-username');
		var frndId = $('.selectedSearch').attr('id');
		var userImage = $('.selectedSearch').attr('data-photo');


	    if(e.keyCode===9 &&selectedUser.length>0){
	    	selectedUser = selectedUser.trim();
	    	tagedFriends.push({'selectedUser':selectedUser, 'selectedUserId':frndId, 'userImage':userImage});
			$('#searchFrndsEdit').val('');
		
	    }

	    function change_selection() {
			$options.removeClass('selectedSearch');
			$options.eq(current_index).addClass('selectedSearch');
			// To scroll the selection
			var $s = $('.tagFrndUlFrieldList');
			var optionTop = $('.selectedSearch').offset().top;
			var selectTop = $s.offset().top;
			$s.scrollTop($s.scrollTop() + (optionTop - selectTop)-4);
		}
	},
	"keyup #searchFrndsEdit": _.throttle(function(e) {
		if(e.keyCode != 38 && e.keyCode != 40 && e.keyCode != 37 && e.keyCode != 39){
			$('.tagFrndUlFrieldList').removeClass('searchDisplayHide').addClass('searchDisplayShow');
			var text = $(e.currentTarget).val();
			if (text) {
				$('.tagFrndUlFrieldList').css('display','block');

				tagFriend1.search(text);
			}
		}
	}, 200),
	'click #searchFrndsEdit': function(e){
		e.stopPropagation();
		$('.tagFrndUlFrieldList').removeClass('searchDisplayHide').addClass('searchDisplayShow');
	},
	"click .tagFrndLiFrieldList" : function(e){
		var selectedUser = $(e.currentTarget).attr('data-userName');
		var frndId = $(e.currentTarget).attr('id');
		var userImage = $(e.currentTarget).attr('data-photo');
    	selectedUser = selectedUser.trim();
		tagedFriends.push({'selectedUser':selectedUser, 'selectedUserId':frndId, 'userImage':userImage});
		$('#searchFrndsEdit').trigger('keyup');
		$('#searchFrndsEdit').val('');
		$('.tagFrndUlFrieldList').removeClass('searchDisplayHide').addClass('searchDisplayShow');
		
	},

	"click .bunchTagFrndCross":function(e){
		var userId = $(e.currentTarget).attr('data-userId');
		var tagfrnd = [];
		for(var i = 0 ; i < tagedFriends.length; i++ ){
			if(tagedFriends[i].selectedUserId != userId){
				tagfrnd.push(tagedFriends[i])
			}
		}
		$('#searchFrndsEdit').trigger('keyup');
		tagedFriends = tagfrnd;
		$(e.currentTarget).parent().remove();
		
	},
	// ============================================================
	// ============================================================
	// ============================================================
	
	'click .focusInput' : function(event){
		$('.commentReplyEditInput').focus();
	},
	/*'click .shareBusReview': function(event){
		var currentUserMail = $('#toVEmail').val();
		var currentUserNote = $('#toVAddNote').val();
		var currentPathTwo = Meteor.absoluteUrl();
		var businessLink = $(event.currentTarget).attr('data-busLink');
		var currentPath = currentPathTwo + businessLink;
		var businessData = Business.findOne({"businessLink":businessLink});
		var nameRegex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;
		if (currentUserMail==null||currentUserMail==""||!currentUserMail.match(nameRegex)) {
			// Bert.alert('Please enter the correct email address','danger','growl-top-right');
		} else {
			if(currentUserMail&&currentPath&&businessData){
				//============================================================
				// 			Notification Email / SMS / InApp
				//============================================================
				var currentUserId = Meteor.userId();
				var currentUser = Meteor.users.findOne({'_id':currentUserId});
	
				var admin = Meteor.users.findOne({'roles':'admin'});
				if(admin){
					var adminId = admin._id;
				}
	
				if(currentUser&&admin){
					var username = currentUser.profile.name;
	
					//Send Mail to Shared User Email
					var date 		= new Date();
					var currentDate = moment(date).format('DD/MM/YYYY');
					var msgvariable = {
						'[username]' 		: username,
						'[currentDate]'		: currentDate,
						'[businessName]'	: businessData.businessTitle,
						'[currentPath]' 	: currentPath,
						'[note]'			: currentUserNote,
					   };
	
					var inputObj = {
						from         : adminId,
						to           : currentUserMail,
						templateName : 'Business Page Review Share',
						variables    : msgvariable,
					}
					sendPageShareMail(inputObj);
					
					$('#userReviewShare').modal('hide');
				}
				
				//============================================================
				// 			End Notification Email / SMS / InApp
				//============================================================
			}
	
			$('#toVEmail').val('');
			$('#toVAddNote').val('');
		}

		
	},
*/
	'click .reviewCommentBtnClose':function(event){
		var id 		  	= event.currentTarget.id;
		
		$('#userReviewShare').modal('hide');
		$('#toVEmail-'+id).val('');
		$('#toVAddNote-'+id).val('');
	},
	'click .shareBusReviewOne':function(event){
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
		
		var toEmail = $('#toVEmail-'+id).val();
		if (regxEmail.test(toEmail)) {
		    var name = Meteor.users.findOne({_id:Meteor.userId()}).profile.name;
		    var addText = $('#toVAddNote-'+id).val();

		    var msg = 'Hi there, <br/><br/>'+name+ ' has share review comment with you. Check it out.<p>'+addText+'</p><br/><div style="border: 1px solid #ccc;width: 500px;word-break: break-all;"><SPAN style= "font-size: 16px; font-weight: 700; position:absolute; top: 40%; padding-left: 2%;">'+reviewComment+'</SPAN><span style=""></span></div>';

			Meteor.call('commentShareEmail', toEmail, fromEmail, subj, msg,function(error,result){
				if(error){
					// Bert.alert(error.reason, 'danger', 'growl-top-right' );
					// return;
				}else{
					Bert.alert('Review successfully shared with your friend.','success','growl-top-right');
					$('#userReviewShare').modal('hide');
					$('#toVEmail-'+id).val('');
					$('#toVAddNote-'+id).val('');
				}
			});	
		}else{
			Bert.alert('Please enter a valid email id.','danger','growl-top-right');
		}
	},
	'click .loadmore': function(event){
		if(Session.get('loadmore')){			
			var currentLimit = Session.get('loadmore');
			// /.log("currentLimit",currentLimit);
			var newLimit = currentLimit + 5;
		}else{
			var newLimit = 10;
		}

		Session.set('loadmore',newLimit);

	},

	'keypress .commenTxt': function(event){
		var userComment = $(event.currentTarget).val();
		var reviewedUserId = $(event.currentTarget).attr('data-addedReviewUser');

		if(userComment){
			userComment=userComment.replace(/\s+$/, '');
		}
		if(event.which === 13 &&userComment){
			var id = event.currentTarget.id;
				Meteor.call('insertUserComment', id, userComment, function(error, result){
					if(error){
						// Bert.alert('Some technical issue happened... Your comment is not posted.', 'danger', 'growl-top-right');
					}else{
						$(event.currentTarget).val('');
						// alert('testing');

						// Bert.alert('Your comment posted successfully!', 'success', 'growl-top-right');
						
						//============================================================
						// 			Notification Email / SMS / InApp
						//============================================================
					    var admin = Meteor.users.findOne({'roles':'admin'});
					    if(admin){
					    	var adminId = admin._id;
					    }
	                    var reviewData = Review.findOne({"_id":id});

	                    if(reviewData){
	                      	var businessLink = reviewData.businessLink;
	                      	var businessData = Business.findOne({"businessLink":businessLink});
					    	
	                      	if(businessData){

					    		//Send Notification, Mail and SMS to Vendor
	                        	var vendormailId = businessData.businessOwnerId;
	                        	var userDetail = Meteor.users.findOne({'_id':vendormailId});
	                        	if(userDetail){
	                        		var username 	= userDetail.profile.name;
			                		var date 		= new Date();
			                		var currentDate = moment(date).format('DD/MM/YYYY');
			                		var msgvariable = {
										'[username]' 	: username,
					   					'[currentDate]'	: currentDate,
					   					'[businessName]': businessData.businessTitle

					               	};

									var inputObj = {
										notifPath	 : businessLink,
									    to           : vendormailId,
									    templateName : 'Vendor Review and Rating Comment',
									    variables    : msgvariable,
									}
									sendInAppNotification(inputObj);

									var inputObj = {
										notifPath	 : businessLink,
										from         : adminId,
									    to           : vendormailId,
									    templateName : 'Vendor Review and Rating Comment',
									    variables    : msgvariable,
									}
									sendMailNotification(inputObj); 
			                    }

			                    //Send Notification, Mail and SMS to User
			                    if(reviewData.userComments){
		                      	  	var length = reviewData.userComments.length;
		                      	  	var userId = Meteor.userId();
			                      	var userVar    		= Meteor.users.findOne({'_id':userId});
			                      	var otherUserVar    = Meteor.users.findOne({'_id':reviewedUserId});
			                	  	if(userVar&&otherUserVar){
			                	  		
			                	  		// Send mail, SMS, Notification to user that added review 
			                	  		if(reviewedUserId!=userId){
			                	  			var otherUsername 	= otherUserVar.profile.name;
					                		var otherDate 		= new Date();
					                		var othreCurrentDate = moment(otherDate).format('DD/MM/YYYY');
					                		var otherMsgvariable = {
												'[username]' 	: otherUsername,
							   					'[currentDate]'	: othreCurrentDate,
						   						'[businessName]': businessData.businessTitle
							               	};

											var inputObj = {
												notifPath	 : businessLink,
											    to           : reviewedUserId,
											    templateName : 'Other User Review and Rating Comment',
											    variables    : otherMsgvariable,
											}
											sendInAppNotification(inputObj);

											var inputObj = {
												notifPath	 : businessLink,
												from         : adminId,
											    to           : reviewedUserId,
											    templateName : 'Other User Review and Rating Comment',
											    variables    : otherMsgvariable,
											}
											sendMailNotification(inputObj);
			                	  		}
			                	  		
										// Only send mail, SMS to current user
										var username 	= userVar.profile.name;
				                		var date 		= new Date();
				                		var currentDate = moment(date).format('DD/MM/YYYY');
				                		var msgvariable = {
											'[username]' 	: username,
						   					'[currentDate]'	: currentDate,
					   						'[businessName]': businessData.businessTitle
						               	};
										var inputObj = {
											notifPath	 : businessLink,
											from         : adminId,
										    to           : userId,
										    templateName : 'Current User Review and Rating Comment',
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
				});
			}
	},

	
	'click .heart' : function(event){

		var likeid = event.currentTarget.id.split('-');
		var id = likeid[1];
		Meteor.call('insertReviewLike',id, function(error, result){
			if(error){
				Bert.alert('Some technical issue happened... Your like is not registered.', 'danger', 'growl-top-right');
			}else{
				Bert.alert('Thanks for liking the comment!', 'success', 'growl-top-right');

					//send mail to the vendor//
                    var admin = Meteor.users.findOne({'roles':'admin'});
				     if(admin){
				     	var adminId = admin._id;
				     }//admin

                    var reviewData = Review.findOne({"_id":id});
                    if(reviewData){
						var businessUrl = reviewData.businessLink;
						var heartColor = $(event.currentTarget).hasClass('orangeHeart');
						
						if(heartColor){

							//============================================================
							// 			Notification Email / SMS / InApp
							//============================================================
							var admin = Meteor.users.findOne({'roles':'admin'});
			                var businessData = Business.findOne({"businessLink":businessUrl});

						    if(admin){
						    	var adminId = admin._id;
						    }
			                var reviewData = Review.findOne({"_id":id});
			                if(reviewData){
			                  	if(businessData){
				                    var vendormailId = businessData.businessOwnerId;
				                    var userDetail = Meteor.users.findOne({'_id':vendormailId});
				                    if(userDetail){
										var userId 	= Meteor.userId();
										var userVar = Meteor.users.findOne({'_id':userId});

			                  			var reviewUserId 	= reviewData.userId;
										var reviewUserVar   = Meteor.users.findOne({'_id':reviewUserId});

										// Send Notification, Mail and SMS to Vendor
										if(userVar&&reviewUserVar){
				                	  		var username 	= userDetail.profile.name;
					                		var date 		= new Date();
					                		var currentDate = moment(date).format('DD/MM/YYYY');
					                		var msgvariable = {
												'[username]' 	: username,
							   					'[LikeDate]'	: currentDate,
								   				'[businessName]': businessData.businessTitle

							               	};

											var inputObj = {
												notifPath	 : businessUrl,
											    to           : vendormailId,
											    templateName : 'Vendor Review and Rating Like',
											    variables    : msgvariable,
											}
											sendInAppNotification(inputObj);

											var inputObj = {
												notifPath	 : businessUrl,
												from         : adminId,
											    to           : vendormailId,
											    templateName : 'Vendor Review and Rating Like',
											    variables    : msgvariable,
											}
											sendMailNotification(inputObj);

											// Send Notification, Mail and SMS to Other User
											var username 	= reviewUserVar.profile.name;
					                		var date 		= new Date();
					                		var currentDate = moment(date).format('DD/MM/YYYY');
					                		var msgvariable = {
												'[username]' 	: username,
							   					'[LikeDate]'	: currentDate,
								   				'[businessName]': businessData.businessTitle

							               	};

							               	if(userId!=reviewUserId){
												var inputObj = {
													notifPath	 : businessUrl,
												    to           : reviewUserId,
												    templateName : 'Other User Review and Rating Like',
												    variables    : msgvariable,
												}
												sendInAppNotification(inputObj);
											

												var inputObj = {
													notifPath	 : businessUrl,
													from         : adminId,
												    to           : reviewUserId,
												    templateName : 'Other User Review and Rating Like',
												    variables    : msgvariable,
												}
												sendMailNotification(inputObj);
											}


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
												notifPath	 : businessUrl,
												from         : adminId,
											    to           : userId,
											    templateName : 'Current User Review and Rating Like',
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

					
                    }//reviewData

                   
                    $(this).removeClass('heart');

                 
			}
		});
	},

	'click .orangeHeart' : function(event){
		var likeid = event.currentTarget.id.split('-');
		var id = likeid[1];
		Meteor.call('removeReviewLike',id, function(error, result){
			if(error){
				Bert.alert('Some technical issue happened... Your like is not registered.', 'danger', 'growl-top-right');
			}else{
				Bert.alert('Sorry to see you unliked the comment!', 'success', 'growl-top-right');
				//send mail to the vendor//
			}
		});
	},

	'change #sortReviewDate' : function(event){
		var sortDate = $('#sortReviewDate').val();
		if(sortDate == 'oldestRevFirst'){
			sortReviewDateAscending();
		}else{
			sortReviewDateDescending();
		}
	},

	'change .categorySelect' : function(event){
		event.preventDefault();
		var categoryValueSelected = $(event.target).val();
		var showCat = categoryValueSelected.split(' ').join('-');
		var id = '';
		var url = FlowRouter.current().path;
		var checkIdExists = url.split('/');
		var data = {};
		if(checkIdExists[2] != '' && checkIdExists[2]){
			id = produceURLid(checkIdExists[2]);
		}else{
			id = Meteor.userId();
		}
		var reviewDataTotalCount = Review.find({"userId":id},{sort: {reviewDate:-1}}).count();
		Session.set("loadmore",reviewDataTotalCount);
		if(categoryValueSelected == '-'){
			$('.timeLine').show();
		}else{
			$('.timeLine').hide();
			$('.'+showCat).show();			
		}
	},

	'change .locationSelect' : function(event){
		event.preventDefault();
		var LocationValueSelected = $(event.target).val();
		var showLoc = LocationValueSelected.split(' ').join('-');
		var showLoc = showLoc.split('.').join('-');
		var id = '';
		var url = FlowRouter.current().path;
		var checkIdExists = url.split('/');
		var data = {};
		if(checkIdExists[2] != '' && checkIdExists[2]){
			id = produceURLid(checkIdExists[2]);
		}else{
			id = Meteor.userId();
		}
		var reviewDataTotalCount = Review.find({"userId":id},{sort: {reviewDate:-1}}).count();
		Session.set("loadmore",reviewDataTotalCount);
		if(LocationValueSelected == '-'){
			$('.timeLine').show();
		}else{
			$('.timeLine').hide();
			$('.'+showLoc).show();			
		}
	},

	'click .userReviewFbShare':function(event){
		event.preventDefault();
		var id = $('.userReviewFbShare').attr('id');
		var url = window.location.href;
		var reviewData = Review.findOne({'_id':id});
		if(reviewData){
			var title       = reviewData.businessLink;
			var description = reviewData.reviewComment;

			var businessData = Business.findOne({'businessLink':title});
			if(businessData){
				if(businessData.publishedImage){
					var pic = BusinessImage.findOne({"_id":businessData.publishedImage});
					if(pic){
						businessData.businessImages = pic.path;
					}else{
						var pic1 = ReviewImage.findOne({"_id":businessData.publishedImage});
						if(pic1){
							businessData.businessImages = pic1.path;
						}else{
							businessData.businessImages = 'https://s3.us-east-2.amazonaws.com/rightnxt1/StaticImages/general/rightnxt_image_nocontent.jpg';
						}
					}
				}
				else if(businessData.businessImages.length > 0){
					var pic = BusinessImage.findOne({"_id":businessData.businessImages[0].img});
					if(pic){
						businessData.businessImages = pic.path;
					}else{
						var pic1 = ReviewImage.findOne({"_id":businessData.businessImages[0].img});
						if(pic1){
							businessData.businessImages = pic1.path;
						}else{
							businessData.businessImages = 'https://s3.us-east-2.amazonaws.com/rightnxt1/StaticImages/general/rightnxt_image_nocontent.jpg';
						}
					}

				}else{
					businessData.businessImages = 'https://s3.us-east-2.amazonaws.com/rightnxt1/StaticImages/general/rightnxt_image_nocontent.jpg';
				}

				var img = businessData.businessImages;
				var image = 'https://rightnxt.s3.amazonaws.com/BusinessImages/'+img;

				
				fbShare(url,title,description,image,id);
			}//businessData
		}//reviewData
		
	},

	'click .userReviewGPShare ':function(event){
		event.preventDefault();

		var url = window.location.href;
		// googleplusshare(url);

		var id = $('.userReviewGPShare').attr('id');
		var reviewData = Review.findOne({'_id':id});
		if(reviewData){
			var title       = reviewData.businessLink;
			var description = reviewData.reviewComment;

			var businessData = Business.findOne({'businessLink':title});
			if(businessData){
				if(businessData.publishedImage){
					var pic = BusinessImage.findOne({"_id":businessData.publishedImage});
					if(pic){
						businessData.businessImages = pic.path;
					}else{
						var pic1 = ReviewImage.findOne({"_id":businessData.publishedImage});
						if(pic1){
							businessData.businessImages = pic1.path;
						}else{
							businessData.businessImages = 'https://s3.us-east-2.amazonaws.com/rightnxt1/StaticImages/general/rightnxt_image_nocontent.jpg';
						}
					}
				}
				else if(businessData.businessImages.length > 0){
					var pic = BusinessImage.findOne({"_id":businessData.businessImages[0].img});
					if(pic){
						businessData.businessImages = pic.path;
					}else{
						var pic1 = ReviewImage.findOne({"_id":businessData.businessImages[0].img});
						if(pic1){
							businessData.businessImages = pic1.path;
						}else{
							businessData.businessImages = 'https://s3.us-east-2.amazonaws.com/rightnxt1/StaticImages/general/rightnxt_image_nocontent.jpg';
						}
					}

				}else{
					businessData.businessImages = 'https://s3.us-east-2.amazonaws.com/rightnxt1/StaticImages/general/rightnxt_image_nocontent.jpg';
				}

				var img = businessData.businessImages;
				var image = 'https://rightnxt.s3.amazonaws.com/BusinessImages/'+img;

				
				shareToGooglePlus(url,title,description,image);
			}//businessData
		}//reviewData
	},

	'click .commentLike' : function(event){
		var businessLink 		= $(event.currentTarget).parent().parent().parent().parent().attr('data-businesslink');
		var reviewPostedByUser 	= $(event.currentTarget).parent().parent().parent().parent().attr('data-reviewpostedby');
		var reviewId 			= $(event.currentTarget).parent().parent().parent().parent().attr('data-reviewid');
		var commentId 			= $(event.currentTarget).attr('data-commentId');	

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


		Meteor.call('insertReviewTimelineCommentLike',businessLink,reviewPostedByUser,reviewId,commentId, function(err,rslt){
			if(err){
				console.log('Error: ', err);
			}else{
				// Bert.alert('Thanks for liking the comment!', 'success', 'growl-top-right');
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
							
							// Send Notification, Mail and SMS to Vendor
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
					
	                //============================================================
					// 			End Notification Email / SMS / InApp
					//============================================================
				}
			}
		});
	},

	'click .commentReplyLike':function(event){
		var businessLink 		= $(event.currentTarget).parent().parent().parent().find('.commentReplyInput').attr('data-businesslink');
		var reviewPostedByUser 	= $(event.currentTarget).parent().parent().parent().find('.commentReplyInput').attr('data-reviewPostedBy');
		var reviewId 			= $(event.currentTarget).parent().parent().parent().find('.commentReplyInput').attr('data-reviewId');
		var commentId 			= $(event.currentTarget).parent().parent().parent().find('.commentReplyInput').attr('data-commentId');		
		var replyId 			= $(event.currentTarget).attr('data-replyid');
		

		var commentPostedByUser = $(event.currentTarget).attr('data-commentPostedUser');
		var commentReplyPostedUser = $(event.currentTarget).attr('data-commentReplyPostedUser');
		var userId 	= Meteor.userId();

		var notofData =  ReviewCommentLikes.findOne({
										"businessLink":businessLink,
										"reviewPostedBy":reviewPostedByUser,
										"reviewId":reviewId,
										"likedByUserId":userId,
										"commentId":commentId,
										"replyId":replyId
									});

		Meteor.call('insertReviewCommentReplyLike',businessLink,reviewPostedByUser,reviewId,replyId,commentId, function(err,rslt){
			if(err){
				console.log('Error: ', err);
			}else{
				// Bert.alert('Thanks for liking the comment!', 'success', 'growl-top-right');
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

	'click .commentReply': function(event){
		event.preventDefault();
		var commentID = this.userCommentId;
		$(event.currentTarget).parent().parent().parent().siblings('.commentReplyInputBox-'+commentID).toggle();
		
	},

	'click .usrCommentReply': function(event){
		event.preventDefault();
		var commentID = this.userCommentID;
		$(event.currentTarget).parent().parent().siblings('.commentReplyInputBox-'+commentID).toggle();
	},

	'click .userReviewReplyDel' : function(event){
		event.preventDefault();
		
		var id = event.currentTarget.id;
		var commentId = parseInt($(event.target).attr('data-commentid'));
		var cId = parseInt($(event.target).attr('data-cid'));
		var postedByID = $(event.target).attr('data-reviewPostedBy');
		var businesLink = $(event.target).attr('data-businesslink');


		Meteor.call('deleteReply',id,commentId,cId,postedByID,businesLink, function(error, result){
			if(error){
				Bert.alert('Some technical issue happened... You couldn\'t delete this review.', 'danger', 'growl-top-right');
			}else{
				// Bert.alert('Your review was deleted successfully!', 'success', 'growl-top-right');
				$('.modaldelete').modal('hide');
				$('.modal-backdrop').hide();
			}
		});
	},

	'click .userRevRepEdit':function(event){
		event.preventDefault();
		var id = event.target.id;
		$('.userReplyText-'+id).css('display','none');
		$('.reviewReplyInputBox-'+id).css('display','block');
		$('.reviewReplyCancel-'+id).css('display','block');
	},

	'click .reviewReplyCancel':function(event){
		event.preventDefault();
		var id = $(event.target).attr('id');
		$('.userReplyText-'+id).css('display','block');
		$('.reviewReplyInputBox-'+id).css('display','none');
		$('.reviewReplyCancel-'+id).css('display','none');
	},

	'click .reviewCommCancel':function(event){
		event.preventDefault();
		var id = $(event.target).attr('id');
		$('.userCommentText_'+id).css('display','block');
		$('.editCommentBox_'+id).css('display','none');
		$('.reviewCommCancel-'+id).css('display','none');
	},

	'click .reviewCancel':function(event){
		event.preventDefault();
		var id = $(event.target).attr('id');
		$('.userReviewTempcommTxt-'+id).css('display','block');
		$('.editBoxCommentRev-'+id).css('display','none');
		$('.reviewCancel-'+id).css('display','none');
		$('.reviewBusSave-'+id).css('display','none');
		$('.reviewImages-'+id).css('display','none');
		$('.starRatingblock-'+id).css('display','none');
		
		$('.bus-page-edit-outer1-'+id).css('display','none');
		$('.bus-page-edit-outerFrnd1-'+id).css('display','none');
		$('.tagFrnd-'+id).css('display','none');

		$('.tagedFrndDivPre-'+id).css('display','block');
		tagedFriends = [];
	},

	'keypress .commentReplyEditInput': function(event){
		var replyComment = $(event.currentTarget).val();
		if(event.which === 13 && replyComment){

			var id = $(event.target).attr('id');
			var commentId = parseInt($(event.target).attr('data-replyId'));

			Meteor.call('updateReplyEdit', id, replyComment,commentId, function(error, result){
				if(error){
					Bert.alert('Some technical issue happened... Your comment is not posted.', 'danger', 'growl-top-right');
				}else{
			
					// Bert.alert('Your comment posted successfully!', 'success', 'growl-top-right');
					// $(event.currentTarget).val('');
					$('.userReplyText-'+commentId).css('display','block');
					$('.reviewReplyInputBox-'+commentId).css('display','none');
					$('.reviewReplyCancel-'+commentId).css('display','none');
					
				}
			
			});
		}
	},

	'keypress .commentReplyInput': function(event){
		// event.preventDefault();
		var commentReply = $(event.currentTarget).val().trim();

		if(event.which == 13 && commentReply){
			var reviewId 		= $(event.currentTarget).attr("data-reviewId");
			var reviewUser  	= $(event.currentTarget).attr("data-reviewPostedBy");
			var commentId 		= $(event.currentTarget).attr("data-commentId");
			var businesslink 	= $(event.currentTarget).attr("data-businesslink");
			var currenCommtUser = $(event.currentTarget).attr('data-userCommentId');

			Meteor.call('insertCommentReply', commentReply, reviewId, reviewUser, commentId, businesslink, function(error, result){
				if(error){
					Bert.alert('Some technical issue happened... Your comment is not posted.', 'danger', 'growl-top-right');
				}else{
					$(event.currentTarget).val('');
					
					//============================================================
					// 			Notification Email / SMS / InApp
					//============================================================
					var admin = Meteor.users.findOne({'roles':'admin'});
	                var businessData = Business.findOne({"businessLink":businesslink});
	                
				    if(admin){
				    	var adminId = admin._id;
				    }
	                // var reviewData = Review.findOne({"_id":reviewId});
	                // if(reviewData){
                  	if(businessData){
	                    var vendorId = businessData.businessOwnerId;
	                    var userDetail = Meteor.users.findOne({'_id':vendorId});
	                    if(userDetail){

							var userId 	= Meteor.userId();

							var userVar = Meteor.users.findOne({'_id':userId});
							var reviewUserVar   = Meteor.users.findOne({'_id':reviewUser});
							var reviewCmntRplyUsr   = Meteor.users.findOne({'_id':currenCommtUser});

							// Send Notification, Mail and SMS to Vendor
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
									notifPath	 : businesslink,
								    to           : vendorId,
								    templateName : 'Vendor Review Comment Reply',
								    variables    : msgvariable,
								}
								sendInAppNotification(inputObj);

								var inputObj = {
									notifPath	 : businesslink,
									from         : adminId,
								    to           : vendorId,
								    templateName : 'Vendor Review Comment Reply',
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

				               	if(userId!=reviewUser){
									var inputObj = {
										notifPath	 : businesslink,
									    to           : reviewUser,
									    templateName : 'User Added Review and Rating',
									    variables    : msgvariable,
									}
									sendInAppNotification(inputObj);
								

									var inputObj = {
										notifPath	 : businesslink,
										from         : adminId,
									    to           : reviewUser,
									    templateName : 'User Added Review and Rating',
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
										notifPath	 : businesslink,
									    to           : currenCommtUser,
									    templateName : 'User Review Comment',
									    variables    : msgvariable,
									}
									sendInAppNotification(inputObj);
								

									var inputObj = {
										notifPath	 : businesslink,
										from         : adminId,
									    to           : currenCommtUser,
									    templateName : 'User Review Comment',
									    variables    : msgvariable,
									}
									sendMailNotification(inputObj);
								}

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
									notifPath	 : businesslink,
									from         : adminId,
								    to           : userId,
								    templateName : 'Current User Review Comment Reply',
								    variables    : msgvariable,
								}
								sendMailNotification(inputObj);

		                    }
		                }
                  	}
	                // }
					
	                //============================================================
					// 			End Notification Email / SMS / InApp
					//============================================================
				}
			});
		}
	},


	'click .userRevCommentDel' : function(event){
		event.preventDefault();
		
		var id = event.target.id;
		var commentId = parseInt($(event.target).attr('data-commentId'));
		var reviewID = $(event.target).parent().parent().parent().parent().parent().parent().parent().parent().siblings('.commentReplyInputBox').find('.commentReplyInput').attr('data-reviewId');
		var postedByID = $(event.target).parent().parent().parent().parent().parent().parent().parent().parent().siblings('.commentReplyInputBox').find('.commentReplyInput').attr('data-reviewPostedBy');
		var businesLink = $(event.target).parent().parent().parent().parent().parent().parent().parent().parent().siblings('.commentReplyInputBox').find('.commentReplyInput').attr('data-businesslink');
		// var replyId = $(event.target).parent().parent().parent().parent().parent().siblings('.commReplyArray').find('.commentReplyLike').attr('data-replyid');


		Meteor.call('deletecomment',id,commentId,reviewID,postedByID,businesLink, function(error, result){
			if(error){
				Bert.alert('Some technical issue happened... You couldn\'t delete this review.', 'danger', 'growl-top-right');
			}else{
				// Bert.alert('Your review was deleted successfully!', 'success', 'growl-top-right');
				$('.modal-backdrop').hide();
				$('.modaldelete').modal('hide');
			}
		});
	},

	'click .userRevCommentEditPen':function(event){
		event.preventDefault();
		var id = event.target.id;
		$('.userCommentText_'+id).css('display','none');
		$('.editCommentBox_'+id).css('display','block');
		$('.reviewCommCancel-'+id).css('display','block');
		$('.reviewBusSave-'+id).css('display','block');
		// alert('hi 1');

	},


	'click .userRevComEdit':function(event){
		var id = $(event.target).attr('id');
		$('.userReviewTempcommTxt-'+id).css('display','none');
		$('.editBoxCommentRev-'+id).css('display','block');
		$('.reviewCancel-'+id).css('display','block');
		$('.tagFrnd-'+id).css('display','block');
		$('.reviewImages-'+id).css('display','block');
		$('.starRatingblock-'+id).css('display','block');
		
		$('.reviewBusSave-'+id).css('display','block');
		$('.bus-page-edit-outer1-'+id).css('display','inline');
		$('.bus-page-edit-outerFrnd1-'+id).css('display','inline-block');
		$('.tagedFrndDivPre-'+id).css('display','none');
		$('.userRevComsEdit'+id).css('display','block');
		$('.tagFrndUlFrieldList').css('display','none');
		$('#reviewImglistsEdits').empty();
		

		var userData = Review.findOne({"_id": id});
		tagedFriends = [];

		for(i=0;i<userData.tagedFriends.length;i++){
			var userVar = Meteor.users.findOne({"_id":userData.tagedFriends[i]});
			var userImg = "";
			if(userVar){
				if(userVar.profile){
					if(userVar.profile.userProfilePic){
						var imgData = VendorImage.findOne({"_id":userVar.profile.userProfilePic});
						if(imgData)	{
						var userImg = imgData.link();
						}else{
						var userImg = '/users/profile/profile_image_dummy.svg';
						}
					} else{
						var userImg = '/users/profile/profile_image_dummy.svg';
					}
					var obj = 	{
									'selectedUser':userVar.profile.name,
									'selectedUserId':userData.tagedFriends[i], 
									'userImage':userImg,
								}
					tagedFriends.push(obj);
				}	
			}
		}
		
		tagFriend1.search('');
	},
	'click .bus-page-edit-outer1': function(event){
		var currentImage = $(event.currentTarget).attr('data-imgId');
		var currentId = $(event.currentTarget).attr('data-reviewId');
		if(currentImage && currentId){
			Meteor.call('removePublishedReviewImage', currentId, currentImage);
		}
	},
	'click .bus-page-edit-outerFrnd1': function(event){
		var taggeduser = $(event.currentTarget).attr('data-tagedId');
		var currentId = $(event.currentTarget).attr('data-reviewId');
		if(taggeduser && currentId){
			Meteor.call('removePublishedReviewUser', currentId, taggeduser);
		}
	},
	'change #reviewImgfileEdits' : function(event){
			$('#reviewImgtext').hide();
			// files = event.target.files; // FileList object\
			var file = event.target.files; // FileList object\
			for(var j = 0 , f1;f1 = file[j]; j++){
				filesR[counterImg] = file[j];
				counterImg = counterImg + 1;
			}

			// Loop through the FileList and render image files as thumbnails.
			for (var i = 0, f; f = file[i]; i++) {
				// filesR[i].businessLink = Session.get('SessionBusinessLink');
			    // Only process image files.
			    if (!f.type.match('image.*')) {
			      continue;
				}
				var reader = new FileReader();
				// Closure to capture the file information.
			    reader.onload = (function(theFile) {
			      return function(e) {
			        // Render thumbnail.
			        var span = document.createElement('span');
			        span.innerHTML = ['<img class="draggedReviewImg" src="', e.target.result,
			                          '" title="', escape(theFile.name), '"/>'].join('');
			        document.getElementById('reviewImglistsEdits').insertBefore(span, null);
			      };
			    })(f); //end of onload
			    // Read in the image file as a data URL.
			    reader.readAsDataURL(f);		    
			}// end of for loop
		},
	'click .reviewBusSave': function(event){
		var revComment = $(event.currentTarget).parent().siblings('.editBoxComment').children('.editReviewTextArea').val();
		// var businessLink = FlowRouter.getParam('businessurl');
		
		if(revComment){
			var id = event.currentTarget.id;
			var taggedPpl = tagedFriends;
			var businessLink = $('.reviewBusSave').attr('value');
			
			var starRating = $('.starRatingblock .fixStar1').length;
			// starRating = starRating + $('.starRatingblock .fixStar2').length;
			// var rating = parseFloat(starRating) / 2;
			if(starRating > 0){
				starRating = starRating + $('.starRatingWrapper .fixStar2').length;
				var rating = parseFloat(starRating) / 2;
			}else{
				var ratingInt = Review.findOne({"_id" : id,"businessLink":businessLink});
				var rating = ratingInt.rating;
			}
			if(filesR){
				for(i = 0 ; i < filesR.length; i++){
					const imageCompressor = new ImageCompressor();
				    imageCompressor.compress(filesR[i])
				        .then((result) => {
				       
				          // Handle the compressed image file.
				          // We upload only one file, in case
				        // multiple files were selected
				        const upload = ReviewImage.insert({
				          file: result,
				          streams: 'dynamic',
				          chunkSize: 'dynamic',
				          // imagetype: 'profile',
				        }, false);

				        upload.on('start', function () {
				          // template.currentUpload.set(this);
				        });

				        upload.on('end', function (error, fileObj) {
				          if (error) {
				            console.log('Error during upload 1: ' + error);
				            console.log('Error during upload 1: ' + error.reason);
				          } else {
				            // alert('File "' + fileObj._id + '" successfully uploaded');
				            Bert.alert('Review Image uploaded.','success','growl-top-right');
				            // console.log(fileObj._id);
				            // Session.set("vendorImgFilePath",fileObj._id);
				            var imgId =  fileObj._id ;
					        Meteor.call("updateReviewBulkImg", id, imgId,
					          function(error1, result1) { 
					              if(error1) {
					                console.log ('Error Message: ' + error ); 
					              }else{
									
									$('.publishReview').show();
									$('.openReviewBox').hide();
									$('.reviewImages').hide();
									// event.target.review.value	= '';
					              }
					        });
				          }
				          // template.currentUpload.set(false);
				        });

				        upload.start();
				        })
				        .catch((err) => {
				          // Handle the error
				    })
				}
				filesR = [];
				counterImg = 0;
				$('#reviewImglistEdit').empty();
				$('#reviewImgfileEdits').val('');
			}
			var allReviews = Review.findOne({"_id" : id});
			if(allReviews){
				var allReviewBusLink = allReviews.businessLink;

				var ReviewBussLink = Review.find({"businessLink":allReviewBusLink}).fetch();
				if(ReviewBussLink){						

					var totalRating = 0;
					var totalVote = ReviewBussLink.length;
					for(i=0; i<ReviewBussLink.length; i++){

						totalRating += ReviewBussLink[i].rating;

					}
					totalRating = totalRating / ReviewBussLink.length ;

					if(revComment.length >=0 && revComment.length<=140){

						$('.passwordWrongSpans').text("Your comment is too short, please write min 140 characters.");
			            $('.passwordWrongSpans').addClass('passwordWrongWar');
						// $('.openReviewBox').show();
						// $('.publishReview').hide();
					}else{
						Meteor.call('updateRevCommentEdit', id, revComment, taggedPpl, rating, totalRating, function(error, result){
							if(error){
								Bert.alert('Some technical issue happened... Your review is not posted.', 'danger', 'growl-top-right');
							}else{
								$('.userReviewTempcommTxt-'+id).css('display','block');
								$('.editBoxCommentRev-'+id).css('display','none');
								$('.reviewCancel-'+id).css('display','none');
								$('.reviewBusSave-'+id).css('display','none');
								$('.starRatingblock-'+id).css('display','none');
								$('.bus-page-edit-outer1-'+id).css('display','none');
								$('.bus-page-edit-outerFrnd1-'+id).css('display','none');
								$('.tagedFrndDivPre-'+id).css('display','block');
								$('.tagFrnd-'+id).css('display','none');
								$('.userRevComsEdit'+id).css('display','none');
								$('.reviewImages-'+id).css('display','none');
								
								tagedFriends = [];
							}
						});
					}

				}
			}
		}
	},
	'keydown .userreviewTwo':function(event){
      setTimeout(function() {
         var comment = $('.userreviewTwo').val();
         if(comment){
            var commentlen = comment.length;
            var remainText = 140 - commentlen;
            if(remainText < 0){
	            $('.textRemain').css('display','none');
            }else{
	            $('.textRemain').css('display','block');
	            $('.textRemain').text(remainText + ' /140');
            }
         }else{
            $('.textRemain').text('0 /140');
         }
      }, 1);
   },
	'keypress .editReviewTextArea': function(event){

		var revComment = $(event.currentTarget).val();

		if(event.which === 13 && revComment){
			var id = event.currentTarget.id;
			var taggedPpl = tagedFriends;
			if(revComment.length >=0 && revComment.length<=140){

				$('.passwordWrongSpans').text("Your comment is too short, please write min 140 characters.");
	            $('.passwordWrongSpans').addClass('passwordWrongWar');
				// $('.openReviewBox').show();
				// $('.publishReview').hide();
			}else{
				Meteor.call('updateRevCommentEdit', id, revComment, taggedPpl, function(error, result){
					if(error){
						Bert.alert('Some technical issue happened... Your review is not posted.', 'danger', 'growl-top-right');
					}else{
						$('.userReviewTempcommTxt-'+id).css('display','block');
						$('.editBoxCommentRev-'+id).css('display','none');	
						$('.reviewCancel-'+id).css('display','none');	
						$('.reviewBusSave-'+id).css('display','none');
						$('.tagedFrndDivPre-'+id).css('display','block');
						$('.tagFrnd-'+id).css('display','none');
						$('.bus-page-edit-outer1-'+id).css('display','none');
						$('.bus-page-edit-outerFrnd1-'+id).css('display','none');
						
						tagedFriends = [];
					}
				
				});
			}
		}
	},

	'keypress .editCommentInput': function(event){

		var userComment = $(event.currentTarget).val();

		if(event.which === 13 && userComment){

			var id = event.currentTarget.id;
			var finalId = id.split('-');
			var commentId = parseInt($(event.target).attr('data-commentId'));


			Meteor.call('updateCommentEdit', finalId[1], userComment,commentId, function(error, result){
				if(error){
					Bert.alert('Some technical issue happened... Your comment is not posted.', 'danger', 'growl-top-right');
				}else{
			
					// Bert.alert('Your comment posted successfully!', 'success', 'growl-top-right');
					// $(event.currentTarget).val('');
					$('.userCommentText_'+commentId).css('display','block');
					$('.editCommentBox_'+commentId).css('display','none');
					$('.reviewCommCancel-'+commentId).css('display','none');
				}
			
			});
		}
	},
});

fbShare = function(URL,title,description,image,id){

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));

  window.fbAsyncInit = function() {
    FB.init({
      appId      : '1441873185871088',
      xfbml      : true,
      version    : 'v2.10'
    });

    FB.ui({
        method: 'share_open_graph',
        action_type: 'og.shares',
        action_properties: JSON.stringify({
            object : {
               'og:url'        : URL, 
               'og:title'      : title,
               'og:description': description,
               'og:image'      : image 
            }
        })
        },
      function(response) {});


  };
}


 shareToGooglePlus =function(destination,title,description,imageurl){
    var go = "https://plus.google.com/share?";
    var url = "url="+encodeURIComponent(destination);
    var title = "title="+encodeURIComponent(title);
    var description = "content="+encodeURIComponent(description);
    var images = "image="+encodeURIComponent(imageurl);
    // newwindow=window.open(go+url+"&"+title+"&"+description+"&"+images,'name','height=400,width=600');
		sharelink = "https://plus.google.com/share?url="+url;
  	newwindow=window.open(sharelink,'name','height=400,width=600');
  	if (window.focus) {newwindow.focus()}                                                                                                                                
  	return false;
}

userReviewPageForm = function () {  
  BlazeLayout.render("userLayout",{content : 'userReviewPage'});
  // Blaze.render(Template.userLayout,document.body);
}
export { userReviewPageForm }





