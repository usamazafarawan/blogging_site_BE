export const routes = function (app: any): void {

    app.use('/api/signUp', require('./main_apis/signup'));
    app.use('/api/file', require('./main_apis/uploadFeeStrucDoc'));
    app.use('/api/studentRecord', require('./main_apis/studentRecord'));
    app.use('/api/studentAccount', require('./main_apis/studentAccount'));


    // new code

    app.use('/api/auth', require('./main_apis/signup'));
    app.use('/api/categories', require('./main_apis/categories'));
    app.use('/api/blogs', require('./main_apis/blogs'));




  }