function route(handle, pathname, request, response, callback) {
    console.log('Requested route: ' + pathname); //TODO: remove
    if(typeof handle[pathname] === 'function') {
        handle[pathname](request, response, callback);
    } else {
        response.sendStatus(404);
        response.end();
    }
}

exports.route = route;
