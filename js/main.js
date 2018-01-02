function changeButtonFunction() {
  var f = $("#button-function")[0].value;
  HANDLE.setButtonFunction(f);
}

function changeLabelFunction() {
  var f = $("#label-function")[0].value;
  HANDLE.setLabelFunction(f);
}


function changeMode() {
  var mode = $('#mode-select')[0].value
  HANDLE.setMode(mode)
}

function find() {
  var accession = $('#accession-input')[0].value
  HANDLE.scrollToNode(accession.toUpperCase())
}

var toggleAll = (function(){
  var foo = true
  return function () {
	if (foo) {
	  HANDLE.hideAll()
	  $('#toggle-all').text('Show All')
	} else {
	  HANDLE.showAll()
	  $('#toggle-all').text('Hide All')
	}
	foo = ! foo
  } 
})()

function help() {
    window.open("http://cgm.sjtu.edu.cn/3kricedb/about.php#tbrowser");
}

function startScanning() {
  if (HANDLE && HANDLE.ready()) setInterval('$("#selected-acs-num").text(SELECTION.size)', 300)
  else setTimeout('startScanning()', 300)
}

$(document).ready(function(){
  startScanning()
})
