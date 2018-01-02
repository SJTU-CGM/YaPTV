/*
  This modules implement an Object called SVG, which has 5 methods
  to assist manuplating svg elements embed in HTML.

  2 methods, setAttributes and setText change svg property and inner
  text of svg elements respectively

  The other 3 methods are for creating <g>, <line>, and <circle>

  All of the 5 methods return the DOM elements itself.


  Advandages:
    * extremly fast
    * do only what you want
*/

SVG = {
    xmlns: 'http://www.w3.org/2000/svg',
    createElement: function (tag, descriptor) {
	var elem = document.createElementNS(this.xmlns, tag)
	if (descriptor != undefined) {
	    this.setAttributes(elem, descriptor)
	}
	return elem
    },
    setAttributes: function (element, descriptor) {
	for (var attr in descriptor) {
	    var value = descriptor[attr]
	    element.setAttributeNS(null, attr, value)
	}
	return element
    },
    setText: function (element, text) {
	var textNode = document.createTextNode(text)
	element.appendChild(textNode)
	return element
    },
    setTitle: function (elem, text) {
	$(elem).children('title').remove()
	var title = SVG.createElement('title')
	SVG.setText(title, text)
	elem.appendChild(title)
    },
    createGroup: function () {
	var g = this.createElement('g')
	return g
    },
    createLine: function (x1, y1, x2, y2) {
	var l = this.createElement('line', {
	    'x1': x1,
	    'y1': y1,
	    'x2': x2,
	    'y2': y2
	})
	return l
    },
    createCircle: function (cx, cy, r) {
	var c = this.createElement('circle', {
	    'cx': cx,
	    'cy': cy,
	    'r': r
	})
	return c
    }
}
