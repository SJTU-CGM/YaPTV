function generateClosure(scope, func, argv) {
    argv = argv || []
    return function(){func.apply(scope, argv)}
}

function mergeObject(obj0, obj1) {
    for (var i in obj1) {
	var v = obj1[i]
	obj0[i] = v
    }
}
