let router = function(app) {
    app.use('/', require('./blog/'));
    app.use('/admin', require('./admin/'));
};

module.exports = router;