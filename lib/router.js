function route(handle, pathname, request, response) {
    console.log('Requested route: ' + pathname);
    if(typeof handle[pathname] === 'function') {
        handle[pathname](request, response);
    } else {
        response.sendStatus(404);
        response.end();
    }
}

exports.route = route;
