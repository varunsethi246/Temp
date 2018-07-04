import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Template } from 'meteor/templating';
import { Bert } from 'meteor/themeteorchef:bert';
import { Business } from '../../api/businessMaster.js';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { BusinessImgUploadS3 } from '/client/cfsjs/businessImage.js';
import { ReactiveVar } from 'meteor/reactive-var';
// import { BizVideo } from '/imports/videoUploadClient/videoUpload.js';
import { BusinessOwnerImages } from '/imports/videoUploadClient/addBusinessOwner.js';

Template.addvendorAboutOwner.onCreated(function () {
  this.currentUpload = new ReactiveVar(false);
  this.subscribe('getBusinessOwnerImages');
});



import '../vendor.js';
import './AddvendorAboutOwner.html';


Template.addvendorAboutOwner.helpers({

	//meteor Ostrio:files code
	

  	currentUpload: function() {
        return Template.instance().currentUpload.get();
    },

    files: function() {
		var businessLink = FlowRouter.getParam('businessLink');
    	var bussData = Business.findOne({"businessLink":businessLink});
    	if(bussData){
	        var data = BizVideo.find({"_id":bussData.businessVideo}).fetch();
	        return data;
	    }
	 return 0;
    },

	vendorBusOwInfoRetrive() {
		var BusLink = FlowRouter.getParam('businessLink');
	    var busData = Business.findOne({"businessLink":BusLink});
	    if(busData.businessTermNCon){
	        busData.completedPercent = 75;
	    }else{
	        busData.completedPercent = 50;
	    }
	    //owner image
	    if(busData.ownerPhoto){
	    	var pic = BusinessOwnerImages.findOne({"_id":busData.ownerPhoto});
	    	if(pic){
	    		if(pic.copies){
    				if(pic.copies.businessImgS3.type == 'image/png'){
						busData.checkpngImg = 'bkgImgNone';
					}else{
						busData.checkpngImg = '';
					}
	    		}
	    		busData.ownerPhoto = pic.link();
	    	}else{
	    		busData.ownerPhoto = '/images/RightNxt-Loading.gif';
	    	}
	    }else{
	    	busData.ownerPhoto = '/users/profile/profile_image_dummy.svg';
	    }

	    if(busData.ownerMobile){
		    busData.ownerMobile=busData.ownerMobile.substring(3);
		}
	    // Owner Role
		var vendorRoleDataArray = ['Business Owner','Business Manager','Business Coordinator'];

	    busData.vendorRoles = [];

	    for(i=0;i<vendorRoleDataArray.length;i++){
	      if (vendorRoleDataArray[i]==busData.ownerRole) {
	        var roleObj = {'vendorRole':vendorRoleDataArray[i],'selected':'selected'};
	        busData.vendorRoles.push(roleObj);
	      } else {
	        var roleObj = {'vendorRole':vendorRoleDataArray[i],'selected':''};
	        busData.vendorRoles.push(roleObj);
	      }
	    }

	    var currentPathURL = FlowRouter.current().path;
	    var splitPath = currentPathURL.split('/');

	    if(splitPath[1] == "aboutOwnerAdmin") {
	      busData.currentPath = '/openingAndClosingDaysAdmin/'+splitPath[2]; 
	    }
	    if(splitPath[1] == "addNewBusiness") {
	      busData.currentPath = '/addNewBusiness/openingAndClosingDays/'+splitPath[3]; 
	    }

	    return busData;

	},
});

Template.addvendorAboutOwner.onRendered(function(){
  $("#businessFullName").focus();
  $("html,body").scrollTop(0);
});

Template.addvendorAboutOwner.events({
	'keydown #businessYourDesc':function(event){
      setTimeout(function() {
         var aboutBus = $('#businessYourDesc').val();
         if(aboutBus){
            var aboutBuslen = aboutBus.length;
            var remainText = 1000 - aboutBuslen;
            $('.textRemain').text(remainText + ' Characters Remaining');
         }else{
            $('.textRemain').text('1000 Characters Remaining');
         }
      }, 1);
   },
 
	// 'change .vendorImg2'(e) {
	// 	var businessLink = FlowRouter.getParam('businessLink');
	//     if (e.currentTarget.files && e.currentTarget.files[0]) {
	//     	var file = e.currentTarget.files[0];
	//     	let self = this;
	//       // We upload only one file, in case
	//       // multiple files were selected
	//       addBusinessOwnerImages(file,self,businessLink);
	//       // const upload = Images.insert({
	//       //   file: e.currentTarget.files[0],
	//       //   streams: 'dynamic',
	//       //   chunkSize: 'dynamic'
	//       // }, false);

	//       // upload.on('start', function () {
	//       //   template.currentUpload.set(this);
	//       // });

	//       // upload.on('end', function (error, fileObj) {
	//       //   if (error) {
	//       //     alert('Error during upload: ' + error);
	//       //   } else {
	//       //     alert('File "' + fileObj.name + '" successfully uploaded');
	//       //   }
	//       //   template.currentUpload.set(false);
	//       // });

	//       // upload.start();
	//     }
	// },

	'change #fileInput'(e, template){
		if (e.currentTarget.files && e.currentTarget.files[0]) {
		      // We upload only one file, in case
		      // multiple files were selected
		      	var businessLink = FlowRouter.getParam('businessLink');
				var bussData = Business.findOne({"businessLink":businessLink});
		    	const upload = BusinessOwnerImages.insert({
			        file: e.currentTarget.files[0],
			        streams: 'dynamic',
			        chunkSize: 'dynamic'
			    }, false);

		      upload.on('start', function () {
		        template.currentUpload.set(this);
		      });

		      upload.on('end', function (error, fileObj) {
		        if (error) {
		          // alert('Error during upload: ' + error);
		           console.log('Error during upload 1: ' + error);
		           console.log('Error during upload 1: ' + error.reason);
		        } else {
		          // alert('File "' + fileObj._id + '" successfully uploaded');
		          Bert.alert('Owner image uploaded','success','growl-top-right');
		          
		          	Meteor.call("updateAboutOwnerImage", businessLink,fileObj._id,
			          function(error, result) { 
			              if(error) {
			                  console.log ('Error Message: ' +error ); 
			              }else{
								  // process.exit();
			              }
			        });
		        }
		        template.currentUpload.set(false);
		      });

		      upload.start();
		    
	    }
	},


	'change .vendorImg' : function(event,Template){
     	// event.preventDefault();
		var businessLink = FlowRouter.getParam('businessLink');


     	FS.Utility.eachFile(event, function(file) {
     		Resizer.resize(file, {width: 300, height: 300, cropSquare: false}, function(err, file) {
				if(err){
					console.log('err ' , err.message);
				}else{
			       	BusinessImgUploadS3.insert(file, function (err, fileObj) {
				        if (err){
				            console.log("Error : " + err.message);
				        } else {
				     		var filePath = fileObj._id;
					      	Session.set("vendorImgFilePath",filePath);
				      	   	// userProfilePicId = fileObj._id;
			              	Meteor.call("updateBusinessAboutOwnerImage", businessLink, filePath,
			                function(error, result) { 
			                    if(error) {
			                    // Bert.alert('Error Message: ' +error.reason ); 
			                    }else{
			                    // Bert.alert( 'Image Updated successfully!!!!', 'success', 'growl-top-right' );
			                    }
			                });
				        }
				    });
     			}
     		});
     	});
	




	},

	'submit .businessAboutOwner': function(event){
		event.preventDefault();
		// var agreeTerms = Session.get('agreeTermsACon');
		var agreeTerms = $('#businessTermNCon').prop( "checked" );
		if(agreeTerms){
			agreeTerms = 'checked';
		}else{
			agreeTerms = '';
		}

		var businessLink = FlowRouter.getParam('businessLink');
		var filePath = Session.get("vendorImgFilePath");
		// console.log(agreeTerms);
	    $('.SpanBusinessTandC').removeClass('ErrorRedText hvr-buzz-out tAndCBlock');

		var errorIn = '';
 	   	if ($(".ErrorRedText").length > 0) {
	    	errorIn = "true";
	    }

	    var ownerMob = $('#businessMobile').val();
	    if(ownerMob){
	      ownerMob = '+91' + ownerMob;
	    }

	    var ownerDescription = $('#businessYourDesc').val();
	    if(ownerDescription){
	    	ownerDescription = ownerDescription.trim();
	    }

	    var formValues = {
			"ownerFullName" 	: event.target.ownerFullName.value,
			"ownerRole" 		: event.target.ownerRole.value,
			"ownerMobile" 		: ownerMob,
			"ownerEmail" 		: event.target.ownerEmail.value,
			"ownerDesc" 		: ownerDescription,
			"ownerPhoto" 		: filePath,
			"businessTermNCon" 	: agreeTerms,
		}

		// console.log("formValues.businessTermNCon: ",formValues.businessTermNCon);

	    if(errorIn!="true"&&agreeTerms=='checked') {
			Meteor.call('updateBusinessAboutOwner', businessLink, formValues, 
				function(error,result){
					if(error){
						// Bert.alert('There is some error in submitting this form!','danger','growl-top-right');
						return;
					}else{
						if(result){
							var newBusinessId = result;
							// console.log(agreeTerms);

							// console.log('newBusinessId: ',newBusinessId);

							Bert.alert('Business Owner information submitted successfully!','success','growl-top-right');
							event.target.ownerFullName.value 	= '';
							event.target.ownerRole.value 		= '';
							event.target.ownerMobile.value 		= '';
							event.target.ownerEmail.value 	  	= '';
							event.target.ownerDesc.value 		= '';
							filePath	  						= '';
							// event.target.businessTermNCon.value 	= '';
							// return;
		          			// FlowRouter.go('/addNewBusiness/imagesAndVideos/:id',{'id':result});
					          // ==================
					          var currentVendorURL = "/addNewBusiness/aboutOwner/"+businessLink;
					          var currentPathURL = FlowRouter.current().path;

					          if (currentPathURL == currentVendorURL) {
					              FlowRouter.go('/addNewBusiness/imagesAndVideos/:businessLink',{'businessLink':businessLink});
					          }else{
					              FlowRouter.go('/imagesAndVideosAdmin/:businessLink',{'businessLink':businessLink});
					          }
					          // ======================
							}
					}
				}
			);
	    } else {
	        // Bert.alert('Please fill correct fields in form or You must agree with the Terms and Conditions checkbox','danger','growl-top-right');
	    	if(formValues.businessTermNCon==false){
	    		$('.SpanBusinessTandC').text("Please agree Terms and Conditions");
	    		$('.SpanBusinessTandC').addClass('ErrorRedText hvr-buzz-out tAndCBlock');
	    		$('#businessTermNCon').addClass('SpanLandLineRedBorder');
	    	}
	    	
	    	$('.SpanLandLineRedBorder:visible:first').focus();
	    }
	},

});

addvendorAboutOwnerForm = function () {  
  BlazeLayout.render("vendorLayout",{main: 'addvendorAboutOwner'});
}

export { addvendorAboutOwnerForm };