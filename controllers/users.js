const User = require("../models/user");

// GET - Signup Route
module.exports.getSignup = (req, res) => {
    res.render("users/signup.ejs"); 
}

// POST - Signup Route
module.exports.postSignup = async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });

        // Register the new user
        const registeredUser = await User.register(newUser, password);

        // Log the user in after registration
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}

// GET - Login Route
module.exports.getLogin = (req, res) => {
    res.render("users/login.ejs"); 
}

// POST - Login Route
module.exports.postLogin = async (req, res) => {
    req.flash("success", "Welcome back to Wanderlust!");

    // Redirect URL after login (can be customized)
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl); 
}

// GET - Logout Route
module.exports.getLogout = (req, res, next) => {
    req.logout((err) => { 
        if (err) { 
            return next(err); 
        } 
        req.flash("success", "Logged you out!");
        res.redirect("/listings"); 
    });
}
