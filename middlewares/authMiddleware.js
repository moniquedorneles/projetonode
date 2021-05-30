module.exports.isLogged = (req, res, next)=>{
    if(!req.isAuthenticated()) {
        req.flash('error', 'Ops! você não tem permissão para executar essa função, necessário estar logado!');
        res.redirect('/users/login');
        return;
    }

    next();
};

exports.changePassword = (req, res) => {
    if(req.body.password != req.body['password-confirm']) {
        req.flash('error', 'As Senhas não conferem!');
        res.redirect('/profile');
        return;
    }
    req.user.setPassword(req.body.password, async ()=>{
        await req.user.save();

        req.flash('success', 'Senha Modificada Com Êxito!');
        res.redirect('/');
    });
}