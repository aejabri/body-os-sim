(function(){
  var p=window.BODY_REAL_PARTS||[];
  window.BODY_REAL_IMG='data:image/jpeg;base64,'+p.join('');
  var i=document.getElementById('realbody');
  if(i) i.src=window.BODY_REAL_IMG;
})();
