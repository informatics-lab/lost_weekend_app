function setView(id) {
    let views = document.querySelectorAll('main section');
    for (var i = 0; i < views.length; i++) {
        var view = views[i];
        view.style.visibility = (view.id == id) ? 'visible' : 'hidden';
    }
}

export { setView };