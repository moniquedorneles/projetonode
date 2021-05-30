const User = require("../models/User");
const crypto = require('crypto');
const mailHandler = require('../handlers/mailHandler');

exports.login = (req, res)=>{
    res.render('login');
};

exports.loginAction = (req, res)=>{
    const auth = User.authenticate();

    auth(req.body.email, req.body.password, (error, result)=>{
        if(!result) {
            req.flash('error', 'E-mail e/ou Senha não conferem.');
            res.redirect('/users/login');
            return;
        }

        req.login(result, ()=>{});
        req.flash('success', 'Login feito com sucesso!');
        res.redirect('/');
    });
};

exports.register = (req, res)=>{
    res.render('register');
};

exports.registerAction = (req, res)=>{
    const newUser = new User(req.body);
    User.register(newUser, req.body.password, (error)=>{
        if(error) {
            req.flash('error', 'Ocorreu um erro, tente mais tarde.');
            res.redirect('/users/register');
            return;
        }

        req.flash('success', 'Cadastro realizado com êxito, faça o login.');
        res.redirect('/users/login');
    });
    
};

exports.logout = (req, res)=>{
    req.logout();
    res.redirect('/');
};

exports.profile = (req, res)=>{
    res.render('profile', {});
};

exports.profileAction = async (req, res)=>{
    try{
        const user = await User.findOneAndUpdate(
            {_id:req.user._id},
            {name:req.body.name, email:req.body.email},
            {new:true, runValidators:true}
        );
    } catch(e) {
        req.flash('error', 'Ocorreu um erro'+e.message);
        res.redirect('/profile');
        return;
    }

    req.flash('success', 'Dados alterados com êxito!');
    res.redirect('/profile');
};

exports.forget = (req, res)=>{
    res.render('forget');
};

exports.forgetAction = async (req, res)=>{
    const user = await User.findOne({email:req.body.email}).exec();
    if(!user) {
        req.flash('error', 'E-mail não cadastrado!');
        res.redirect('/users/forget');
        return;
    }
    
    user.resetPasswordToken = crypto.randonBytes(20).toString('hex');
    user.resetPasswordExpires = Data.now() + 3600000; // 1h

    await user.save();

    const resetLink = `http://${req.headers.host}/users/resert/${user.resetPasswordToken}`;

    const html = `Testando e-mail com link:<br/><a href="${resetLink}>Resetar Senha</a>"`;
    const text = `Testando e-mail com link:${resetLink}`;
    //TODO: enviar e-mail
    mailHandler.send({
        to:user.email,
        subject:'resetar senha',
        html:html,
        text:text
    });

    req.flash('success', 'Foi Enviado um E-mail com Orientações!');
    res.redirect('/users/login');
};

exports.forgetToken = async (req, res)=>{
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {$gt: Date.now()}
    });
    if(!user) {
        req.flash('error', 'O token expirou!');
        res.redirect('/users/forget');
        return;
    }
    res.render('forgetPassword');
};

exports.forgetTokenAction = async (req, res)=>{
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {$gt: Date.now()}
    });
    if(!user) {
        req.flash('error', 'O token expirou!');
        res.redirect('/users/forget');
        return;
    } 
    if(req.body.password != req.body['password-confirm']) {
        req.flash('error', 'As Senhas não conferem!');
        res.redirect('back');
        return;
    }
    user.setPassword(req.body.password, async ()=>{
        await user.save();

        req.flash('success', 'Senha Modificada Com Êxito!');
        res.redirect('/');
    });
};


