/* 
   Define 2 Class:
   Node, Root, Leaf

   Methods have been organized into n sections:
   * creation
   * adding
   * position
   * event
   * operation
   ** selected
   ** visible
   ** hidden
   ** preserved
   * reference
   * attributes
   Search '#<section name>' goes to the start of section,
   and '#eo-<section name>' goes to the end.
*/

function Node(id, parent, container, branchLength) {
  this.id = id
  this.parent = parent
  this.branchLength = branchLength
  this.createPack(container)
  // pack: <g> element containing all about this node
  this.createBranchLine()
  this.createBody()
  // body: button, vline, container for child nodes
  this.init()
  this.addHandles()
  // DOM event handles
}
Node.prototype = Object.create(null, {
  /* #creation */
  createPack: {
	value: function (container) {
	  this.elem = SVG.createElement('g')
	  container.appendChild(this.elem)
	}
  },
  createBranchLine: {
	value: function () {	    
	  this.branch = SVG.createLine(0, 0, this.branchLength, 0)
	  this.elem.appendChild(this.branch)
	}
  },			      
  createBody: {
	value: function () {
	  this.createVLine(this.branchLength)
	  this.createButton(this.branchLength)
	  this.createRoom(this.branchLength)
	  // room: container for childrens
	}
  },
  createVLine: {
	value: function() {
	  this.vline = SVG.createLine(this.branchLength, 0,
					              this.branchLength, 0)
	  this.elem.appendChild(this.vline)
	},
  },
  createButton: {
	value: function() {
	  var g = SVG.createGroup(),
		  button = SVG.createCircle(0, 0, this.buttonRadius)
	  SVG.setAttributes(g, {
		'transform': 'translate('+ this.branchLength + ', 0)'
	  })
	  g.appendChild(button)
	  this.elem.appendChild(g)
	  this.button = button
	  this.buttonPack = g

	  var hg = SVG.createGroup() // <g> mark for folding children
	  $(hg).addClass('fold')
	  g.appendChild(hg)
	  var foo = this.buttonRadius - 2
	  hg.appendChild(SVG.createLine(-foo, 0, foo, 0))
	  hg.appendChild(SVG.createLine(0, -foo, 0, foo))

	  var sg = SVG.createGroup() // <g> mark for selecting children
	  $(sg).addClass('select')
	  g.appendChild(sg)
	}
  },
  createRoom: {
	value: function() {
	  this.room = SVG.createGroup()
	  this.room.setAttributeNS(null, 'transform',
				               'translate('+ this.branchLength +', 0)')
	  this.elem.appendChild(this.room)
    }
  },
  init: {
	value: function () {
	  $(this.elem).addClass('node')
	  this.children = []
	},
	writable: false,
	configurable: false
  },
  /* #eo-creation */

  /* #adding */
  addNodeChild: {
	value: function(id, branchLength) {
	  var child = new Node(id, this, this.room, branchLength)
	  this.children.push(child)
	  return child
	},
	writable: false,
	configurable: false
  },
  addLeafChild: {
	value: function(id, branchLength, lable) {
	  var child = new Leaf(id,this,this.room, branchLength, lable)
	  this.children.push(child)
	  return child
	},
	writable: false,
	configurable: false
  },
  /* #eo-adding */

  /* #position */
  setCoord: {
	value: function(x, y) {
	  SVG.setAttributes(this.elem, {
		'transform': "translate("+Math.round(x)+","+Math.round(y)+")"
	  })
	}
  },
  refreshUpward: {
	value: function(){
	  var n = this
	  do {
		n.refresh()
		n = n.parent
	  } while (n != null)
	}
  },
  refreshAll: {
	value: function() {
	  for (var c of this.children) {
		c.refreshAll()
	  }
	  this.refresh()
	}
  },
  refresh: {
	value: function() {
	  var s = 0, b, e; 
      var last;
      function showChild(child) {
        child.display();
        child.setCoord(0, s);
        s += child.size;
        b = (b == undefined) ? child.joint : b;
        last = child;
      }
	  if (this.isHidden()) {
        for (let child of this.children) {
          if (! child.anyPreserved()) {
            child.conceal();
          } else {
            showChild(child);
          }
        }
      } else {
        for (let child of this.children) {
          showChild(child);
        }
      }
	  if (s == 0) {
		// not preserved children
		s = this.hiddenSize
		b = e = s / 2
	  } else {
		e = s - last.size + last.joint
	  }
	  this.size = s
	  this.vbegin = b
	  this.vend = e
	  this.joint = Math.round((b + e)/2)

	  this.refreshVLine()
	  this.refreshBranch()
	  this.refreshButton()
	}
  },
  refreshBranch: {
	value: function() {
	  this.branch.setAttributeNS(null, 'y1', this.joint)
	  this.branch.setAttributeNS(null, 'y2', this.joint)
	}
  },
  refreshVLine: {
	value: function() {
	  this.vline.setAttributeNS(null, 'y1', this.vbegin)
	  this.vline.setAttributeNS(null, 'y2', this.vend)
	}
  },
  refreshButton: {
	value: function() {
	  this.buttonPack.setAttributeNS(null, 'transform',
					                 'translate(' + this.branchLength +
					                 ','+this.joint+')')
	}
  },
  /* #eo-position */
  
  /* #event */
  addHandles: {
	value: function () {
	  // circle handle
	  $(this.button).click(generateClosure(this, this.click))
	  $(this.button).mouseover(generateClosure(this, this.mouseover))
	}
  },			       
  mouseover: {
	value: function() {
	  var txt
	  if (MODE == 'basic' || MODE == 'preserve') {
		var d = this.summarize(),
		    s0 = s1 = '',
		    s = 0
		//console.log(d)
		for (var k in d) {
		  var v = d[k]
		  s += v
		}
		for (var k in d) {
		  var v = d[k]
		  s1 += k + ': ' + v + '(' + (v/s*100).toFixed(2) + '%)\n'
		}
		s0 = 'total: ' + s
		txt = s0 + '\n' + s1
	  } else if (MODE == 'select') {
		txt = 'Select all children recursively.'
	  } else if (MODE == 'unselect') {
		txt = 'Unselect all children recursively.'
	  } else if (MODE == 'view') {
		'do nothing'
	  } else {
		'do nothing'
	  }
	  SVG.setTitle(this.button, txt)
	}
  },
  click: {
	value: function () {
      switch (BUTTON_FUNCTION) {
        case "fold":
		  if (this.isHidden()) {
		    this.show()
		  } else {
		    this.hide()
		  }
          break;
        case "select":
          if (this.isSelected()) {
            this.unselect();
          } else {
            this.select();
          }
          break;
        case "preserve":
          if (this.isPreserved()) {
            this.unpreserve();
          } else {
            this.preserve();
          }
          break;
        default:
          throw "Unknown button function " + BUTTON_FUNCTION;
      }
	}
  },
  /* eo-event */

  /* #operation */
  // #operation-preserved: preserve, unpreserve
  preserve: {
	value: function(){
	  for (var c of this.children) {
		c.preserve()
	  }
	}
  },
  unpreserve: {
	value: function(){
	  for (var c of this.children) {
		c.unpreserve()
	  }
	}
  },
  isPreserved: {
    value: function(){
      for (var c of this.children) {
        if (! c.isPreserved()) {
          return false;
        }
      }
      return true;
    }
  },
  anyPreserved: {
    value: function(){
      for (var c of this.children) {
        if (c.anyPreserved()) {
          return true;
        }
      }
      return false;
    }
  },
  // #operation-selected: select, unselect
  select: {
	value: function(){
	  for (var c of this.children) {
		c.select()
	  }
	}
  },
  unselect: {
	value: function(){
	  for (var c of this.children) {
		c.unselect()
	  }
	}
  },
  isSelected: {
    value: function(){
      for (var c of this.children) {
        if (! c.isSelected()) {
          return false;
        }
      }
      return true;
    }
  },
  // #operation-visible: conceal, display, visible
  conceal: {
	value: function(){
	  $(this.elem).css('display', 'none')
	}
  },
  display: {
	value: function(){
	  $(this.elem).css('display', 'unset')
	}
  },
  visible: {
	get: function(){
	  return ($(this.elem).css('display') != 'none') &&
		((this.parent == null) ||  this.parent.visible)
	}
  },
  // #operation-hidden: hide, show, hidden
  _hide: {
    value: function () {
	  $(this.elem).addClass('pseudo');
    }
  },
  hide: {
	value: function () {
	  if (! this.isHidden()) {
        this._hide();
	    this.refreshUpward();
	  }
    }
  },
  _show: {
    value: function () {
	  $(this.elem).removeClass('pseudo');
    }
  },  
  show: {
	value: function () {
	  if (this.isHidden()) {
	    this._show();
	    this.refreshUpward();
      }
	}
  },
  isHidden: {
	value: function(){ return $(this.elem).hasClass('pseudo') }
  },
  /* #eo-operation */

  /* #reference */
  path: {
	get: function(){
	  if (this.parent == null)
		return new Set()
	  return this.parent.path.add(this.parent.id)
	}
  },
  summarize: {
	value: function() {
	  var d = null
	  for (var c of this.children) {
		if (d == null) {
		  d = c.summarize()
		  continue
		}
		var d0 = c.summarize()
		for (var k in d0) {
		  var v = d0[k]
		  if (d[k] == undefined) d[k] = 0
		  d[k] += v
		}
	  }
	  return d
	}
  },
  /* #eo-reference */

  /* #attributes */
  buttonRadius: {
	value: 5
  },
  hiddenSize: {
	value: 30,
	writable: false
  }
  /* #eo-attributes */
})


function Root(id, parent, container, branchLength) {
  Node.call(this, id, parent, container, branchLength)
}
Root.prototype = Object.create(Node.prototype, {
  refresh: {
	value: function(){
	  Node.prototype.refresh.call(this)
	  s1 = this.size
	  VIEWER.setAttributeNS(null, 'height',
				            this.size + 2 * TREE_PADDING)
	}
  }
})

function Leaf(id, parent, container, branchLength, lable) {
  this.lable = lable
  Node.call(this, id, parent, container, branchLength)
}
Leaf.prototype = Object.create(Node.prototype, {
  /* #creation */
  init: {
	value: function () {
	  $(this.elem).addClass('leaf')
	},
	writable: false,
	configurable: false
  },
  createBody: {
	value: function() {
	  this.createRoom(this.branchLength)
	  this.createLable()
	  this.refreshBranch()
	},
	writable: false,
	configurable: false
  },
  createLable: {
	value: function() {
	  lable = this.lable
	  var r = SVG.createElement('rect')
	  this.button = r
	  SVG.setAttributes(r, {
		'x': 0,
		'y': (this.size - this.lableHeight) / 2,
		'rx': this.lableRadiusX,
		'ry': this.lableRadiusY,
		'width': this.lableWidth,
		'height': this.lableHeight
	  })
	  this.room.appendChild(r)
	  
	  var t = SVG.createElement('text')
	  SVG.setAttributes(t, {
		'x': Math.round(this.lableWidth / 2),
		'y': this.joint - 1
	  })
	  SVG.setText(t, lable)
	  this.room.appendChild(t)
	},
	writable: false,
	configurable: false
  },
  /* #eo-creation */
  
  /* #position */
  refreshAll: {
	value: function() {},
	writable: false,
	configurable: false
  },
  /* #eo-position */

  /* #event */
  addHandles: {
	value: function(){
	  $(this.button).click(generateClosure(this, this.click))
	  $(this.button).mouseover(generateClosure(this, this.mouseover))
	}
  },
  mouseover: {
	value: function(){
	  if (DESCRIPTION == undefined) return
	  var s = ''
	  for (var k in DESCRIPTION[this.id]) {
		var v = DESCRIPTION[this.id][k]
		s += k + ': ' + v + '\n'
	  }
	  //console.log(s)
	  this.button.setAttributeNS(null, 'title', s)
	}
  },
  click: {
	value: function(){
      switch (LABEL_FUNCTION) {
        case "select":
		  if (! this.isSelected()) {
		    this.select()
		  } else {
		    this.unselect()
		  }
          break;
        case "preserve":
		  if (! this.isPreserved()) {
		    this.preserve()
		  } else {
		    this.unpreserve()
		  }
          break;
	    default:
          throw "Unknown label function " + LABEL_FUNCTION;
	  }
    }
  },
  /* #operation */
  select: {
	value: function (){
      this.elem.classList.add('selected');
	  SELECTION.add(this.id)
	}
  },
  unselect: {
	value: function (){
      this.elem.classList.remove('selected');
	  SELECTION.delete(this.id)
	}
  },
  isSelected: {
	value: function() {
      return $(this.elem).hasClass('selected')
    }
  },
  preserve: {
	value: function(){
	  if (this.preserved) return
	  this.preserved = true
	  PRESERVATION.add(this.id)
	  $(this.elem).addClass('preserved')
	}
  },
  unpreserve: {
	value: function(){
	  if (! this.preserved) return
	  this.preserved = false
	  PRESERVATION.delete(this.id)
	  $(this.elem).removeClass('preserved')
	}
  },
  isPreserved: {
	value: function() {
      return $(this.elem).hasClass('preserved')
    }
  },
  anyPreserved: {
	value: function() {
      return this.isPreserved();
    }
  },
  _hide: {
    value: function(){}
  },
  hide: {
	value: function(){}
  },
  _show: {
	value: function(){}
  },
  show: {
	value: function(){}
  },
  /* #eo-operation */
  
  /* #reference */
  position: {
	get: function(){
	  var r0 = this.elem.getBoundingClientRect(),
		  r1 = VIEWER.parentElement.getBoundingClientRect()
	  return [r0.left - r1.left,
		      r0.top - r1.top]
	}
  },
  summarize: {
	value: function () {
	  var g = DESCRIPTION[this.id]['group'],
		  d = {}
	  d[g] = 1
	  return d
	}
  },
  /* #eo-reference */
  
  /* #attributes */
  size: {
	value: 26,
	writable: false,
	configurable: false
  },
  joint: {
	value: 15,
	writable: false,
	configurable: false
  },
  lableWidth: {
	value: 150,
	writable: false,
	configurable: false
  },
  lableHeight: {
	value: 20,
	writable: false,
	configurable: false
  },
  lableRadiusX: {
	value: 5,
	writable: false,
	configurable: false
  },
  lableRadiusY: {
	value: 5,
	writable: false,
	configurable: false
  }
  /* #eo-attributes */
})
