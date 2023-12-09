

function isAdmin(req, res , next){
    if (req.session.role === "admin"){
        next();
    }else{
        res.status(403).send("Forbidden");
    }

}
module.exports = isAdmin;