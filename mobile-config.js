App.info({
  id : "com.rightuser",
  name: 'Rightnxt',
  version: "1.3.0", 
  author: 'iAssure IT',
  email: 'rightnxt123@gmail.com',
  website: 'http://mobileappuser.rightnxt.com'
});
App.setPreference("orientation", "portrait");
App.setPreference('loadUrlTimeoutValue', '700000', 'android');
App.accessRule('*://s3.us-east-2.amazonaws.com/rightnxt1/StaticImages/*');
// App.accessRule('*');
App.accessRule('https://*.googleapis.com/*');
App.accessRule('https://*.google.com/*');
App.accessRule('https://*.gstatic.com/*');
App.accessRule('blob:*',{type: 'intent'});
App.accessRule('polyblob:*',{type: 'intent'});
App.accessRule('https://rightnxt.com', { type: 'navigation' });
App.accessRule('https:*');
// App.accessRule('https://s3.us-east-2.amazonaws.com/rightnxt1/BannerVideo/n9a6JFjfWRTtDmM9X-original.mp4');
// App.appendToConfig(`
//   <universal-links>
//     <host name="com.toto.app" />
//   </universal-links>
//   <platform name="android">
//     <config-file target="AndroidManifest.xml" parent="/manifest/application/activity">
//       <intent-filter>               
//         <action android:name="android.intent.action.SEND" xmlns:android="http://schemas.android.com/apk/res/android" />
//         <category android:name="android.intent.category.DEFAULT" xmlns:android="http://schemas.android.com/apk/res/android" />
//         <data android:mimeType="*/*" xmlns:android="http://schemas.android.com/apk/res/android" />                
//       </intent-filter>    
//     </config-file>
//   </platform>
// `);
App.launchScreens({
  'android_mdpi_portrait': 'splashscreen/360X640_Splash-Screen.png',
});
App.icons({
  'android_mdpi': 'splashscreen/48X48.png',
  'android_hdpi': 'splashscreen/72X72.png',
  'android_xhdpi': 'splashscreen/96X96.png',
  'android_xxhdpi': 'splashscreen/144X144.png',
  'android_xxxhdpi': 'splashscreen/192X192.png',
});