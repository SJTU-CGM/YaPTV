var _TREE = {},
    TREE = {},
    DESCRIPTION,
    SELECTION = new Set(),
    HIDEN_NODES = new Set(),
    PRESERVATION = new Set(),
    VIEWER,
    MODE = 'basic',
    MODES = ['basic', 'select', 'unselect', 'preserve', 'view'],
    BUTTON_FUNCTION = "fold",
    BUTTON_FUNCTIONS = ["select", "fold", "preserve"],
    LABEL_FUNCTION = "select",
    LABEL_FUNCTIONS = ["select", "preserve"],
    READY = false, // indicate that the tree is fully loaded
    TREE_PADDING, BRANCH_UNIT

$(document).ready(function() {
  lauchTreeViewer()
})

function lauchTreeViewer () {
  //console.log('now begin', (new Date()).getTime())

  /* load elements */
  VIEWER = $('#viewer')[0]

  /* load resource */
  $.ajax({
	url: './conf.json',
	dataType: 'json',
	success: function (data) {
	  var p = data["path"],
		  dp = data["description_path"]
	  TREE_PADDING = data['tree_padding'] || 0
	  BRANCH_UNIT = data['branch_unit'] || 1000
	  loadTreeFile(p)
	  loadAddingDescription(dp)
	},
	error: function (xhr, errorType, error) {
	      console.log('Fail to load ./conf.json, error type:', errorType);
	}
  })
}

function loadAddingDescription(p) {
  if (p == undefined) return
  $.ajax({
	url: p,
	dataType: 'json',
	success: function(d) {
	  DESCRIPTION = d
	}
  })
}


// new one, which load json
function loadTreeFile (p) { // p: path
  $.ajax({
	url: p,
	dataType: 'json',
	success: function (d) {
	  //console.log('file loaded', (new Date()).getTime())
	  parseTree(d)
	},
	error: function () {
	  console.log(arguments)
	}
  })
}


// old one, which load xml
function loadTreeFile_ (p) { // p: path
  $.ajax({
	url: p,
	dataType: 'xml',
	success: function (d) {
	  //console.log('file loaded', (new Date()).getTime())
	  parseTree(d)
	},
	error: function () {
	  console.log(arguments)
	}
  })
}


function parseTree(d)
{
	let newID = (function(){
		let n = -1;
		return function(){ n ++; return n; };
	})();
	function P(d, pid)
	{
		function Pnode(d, pid)
		{
			let id = newID();
			_TREE[id] = {
				pid: pid,
				id: id,
				name: d.name || "",
				branch_length: d.branch_length,
				children: d.children.map(function(c) { return P(c,id); })
			};
			return id;
		}
		function Pleaf(d, pid)
		{
			let id = d.name || newID();
			_TREE[d.name] = {
				pid: pid,
				id: id,
				name: id,
				branch_length: d.branch_length
			};
			return id;
		}
		return ((d.children && d.children.length > 0) ? Pnode : Pleaf)(d, pid);
	}
	P(d, null);
	loadTree();
}

// the old version, which parse XML.
function parseTree_ (d) { // d: description
  function parseTreeNode (n, pid) { // n: xml node, pid: parent id
	var n = $(n)
	var ch  = n.children('clade'),
	    len = parseFloat(n.children('branch_length').text()) || 1,
	    descr, id, children, name
	if (ch.length > 0) {
	  if (ch.length == 1) return parseTreeNode(ch[0], pid)
	  id = count += 1
	  children = $.map(ch,
			           function(c) {return parseTreeNode(c, id)})
	  name = ''
	} else {
	  id = name = n.children('name').text()
	  children = []
	}
	var descr = {
	  id: id,
	  branch_length: len,
	  children: children,
	  name: name,
	  pid: pid,
	}
	_TREE[id] = descr
	return id
  }

  var doc = d.documentElement
  var root = $(doc).find('phylogeny > clade')
  var count = -1
  
  parseTreeNode(root)
  //console.log('parsing fininshed', (new Date()).getTime())
  loadTree()
}

function loadTree () {
  function loadTreeNode (n, id) {
	// prefix 'c' means child's
	for (var cid of _TREE[id].children) {
	  var d = _TREE[cid],
		  bl = 5 + Math.round(d['branch_length'] * BRANCH_UNIT),
		  cnode
	  if ((! d.children) || d.children.length == 0) {
		var label = d['name']
		cnode = TREE[cid] = n.addLeafChild(cid, bl, label)
	  } else {
		cnode = n.addNodeChild(cid, bl)
		loadTreeNode(cnode, cid)
	  }
	  d['node'] = cnode
	}
	n.refresh()
  }
  var root = _TREE[0].node = new Root(0, null, VIEWER, 50)
  loadTreeNode(root, 0)
  root.setCoord(0, TREE_PADDING)
  /*
    VIEWER.setAttributeNS(null, 'height',
    26 * Object.keys(TREE).length)
  */
  md = 0
  for (var n in TREE) {
	var r = TREE[n].elem.getBoundingClientRect(),
	    d = r.left + r.width
	if (d > md) md = d
  }
  VIEWER.setAttributeNS(null, 'width', md)
  
  READY = true
}
