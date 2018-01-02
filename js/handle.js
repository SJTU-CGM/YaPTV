/* handle of tree viewer 
   getMode()
   setMode()
   ready
   select, unselect, isSelected
   find: id ==> [x, y]
   scrollTo: x, y ==> [x, y]
   scrollToNextSelected
   getSelection: ==> [...]
   getSortedSelection: ==> [...]
   setSelection: #array / #set ==> #undefined
   loadSelection: like setSelection but hide other nodes
*/

HANDLE = {
  submitHandle: null,
  submit: function()
  {
    this.submitHandle(this.getSelection());
  },
  setSubmitHandle: function (proc)
  {
	  this.submitHandle = proc;
  },
  setButtonFunction: function(func) {
    function bfclass(f) {
      var cls = "bf-" + f;
      return cls;
    }      
    var viewer = $(VIEWER);
    for (var f of BUTTON_FUNCTIONS) {
      viewer.removeClass(bfclass(f));
    }
    viewer.addClass(bfclass(func));
    BUTTON_FUNCTION = func;
  },
  setLabelFunction: function(func) {
    function lfclass(f) {
      var cls = "lf-" + f;
      return cls;
    }      
    var viewer = $(VIEWER);
    for (var f of LABEL_FUNCTIONS) {
      viewer.removeClass(lfclass(f));
    }
    viewer.addClass(lfclass(func));
    LABEL_FUNCTION = func;
  },
  getMode: function() {return MODE},
  setMode: function(m) {
	var v = $(VIEWER)
	MODES.forEach(
	  function (mode) {
		v.removeClass(mode+'-mode')
	  }
	)
	MODE = m
	$(VIEWER).addClass(m+'-mode')
  },
  ready: function() {
	return READY
  },
  showAll: function() {
    var root = _TREE[0].node;
    function showR(node) {
      node._show();
      if (node.children) {
        for (let child of node.children) {
          showR(child);
        }
      }
    }
    showR(root);
    root.refreshAll();
  },
  hideAll: function() {
    var root = _TREE[0].node;
    function hideR(node) {
      node._hide();
      if (node.children) {
        for (let child of node.children) {
          hideR(child);
        }
      }
    }
    hideR(root);
    root.refreshAll();
  },
  select: function(id) {
	if (TREE[id] == undefined) {
	  console.log('Invalid id', id)
	}
	TREE[id].select()
  },
  unselect: function(id) {
	TREE[id].unselect()
  },
  isSelected: function(id) {
	return TREE[id].isSelected();
  },
  preserve: function(id) {
	if (TREE[id] == undefined) {
	  console.log('Invalid id', id)
	}
	TREE[id].preserve()
  },
  unpreserve: function(id) {
	TREE[id].unpreserve()
  },
  isPreserved: function(id) {
	return TREE[id].isPreserved();
  },
  find: function (id) {
	var elem = TREE[id];
	if (elem == undefined) {
	  throw "Cannot find " + id + ".";
    }
	HANDLE.unfoldToVisible(elem.id)
	return elem.position
  },
  unfoldToVisible: function (id) {
	var c = TREE[id]
	var p = c.parent
	while (p != null && (! c.preserved)) {
	  if (p.isHidden()) {
        p.show();
      }
	  c = p
	  p = p.parent
	}
  },
  scrollBy: function(x, y) {
	VIEWER.parentElement.scrollLeft += x
	VIEWER.parentElement.scrollTop += y
  },
  scrollToNode: function (id) {
	var pos = HANDLE.find(id)
	HANDLE.scrollBy(pos[0], pos[1])
  },
  scrollToNextSelectedNode: function () {
    function getNextSelectedNode()
    {
      let selection = HANDLE.getSelection();
      if (selection.length == 0) {
        return null;
      } else {
        for (let acc of selection) {
          let pos = HANDLE.find(acc);
          if (pos[1] > 2) {
            return TREE[acc];
          }
        }
        return TREE[selection[0]];
      }
    }
    let node = getNextSelectedNode();
    if (node != null) {
      let pos = HANDLE.find(node.id);
      console.log(pos);
	  HANDLE.scrollBy(pos[0], pos[1]);
    } else {
      console.log("no selected nodes.");
    }
  },
  getSelection: function(){
    var root = _TREE[0].node;
    var selection = [];
    function dfs(node) {
      if (node.children) {
        for (var child of node.children) {
          dfs(child);
        }
      } else {
        if (node.isSelected()) {
          selection.push(node.id);
        }
      }
    }
    dfs(root);
    return selection;
  },
  clearSelection: function(){
	for (var id of SELECTION) {
	  HANDLE.unselect(id)
	}
  },
  addSelection: function(sel) {
	sel = new Set(sel)
	for (var id of sel) {
	  HANDLE.select(id)
	}
  },
  setSelection: function(sel){
	sel = new Set(sel)
	HANDLE.clearSelection()
	HANDLE.addSelection(sel)
  },
  loadSelection: function(sel) {
	sel = new Set(sel)
	sel.forEach(function(acc){
	  HANDLE.select(acc)
	  HANDLE.preserve(acc)
	})
	if (sel.size > 0) {
	  HANDLE.hideAll()
	  HANDLE.scrollToNextSelectedNode()
	}
  }
}
