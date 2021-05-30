exports.defaultPageTitle = "Site Monique!";

exports.menu = [
    {name:'Home', slug:'/', guest:true, logged:true},
    {name:'Login', slug:'/users/login', guest:true, logged:false},
    {name:'Registro', slug:'/users/register', guest:true, logged:false},
    {name:'Adicionar Post', slug:'/post/add', guest:false, logged:true},
    {name:'Meu Perfil', slug:'/profile', guest:false, logged:true},
    {name:'Sair', slug:'/users/logout', guest:false, logged:true}
];
    