const GithubStrategy = require("passport-github2").Strategy;
const passport = require('passport');
const User = require('./models/user.model')
const InstagramStrategy = require("passport-instagram").Strategy;

     /* ____PASSPORT GITHUBSTRATEGY LOGIN____ */
     
     
     passport.use(new GithubStrategy({
      clientID: "37e9e986ea001cafe03b",
      clientSecret: "2ef221090e8b3b29eb604fb16f8ba8d3d32216af",
      callbackURL: '/auth/github/callback',
      scope:["profile","email"]
    },
    // GitHub authentication callback function
  ));
  
  passport.use(new InstagramStrategy({
      clientID:"6577783689004963" ,
      clientSecret:"6c96ea81ff4e4c5e80981b515dd96782" ,
      callbackURL: "/auth/instagram/callback",
      scope:["profile","email"]
    },
    // Instagram authentication callback function
  ));



passport.use(new InstagramStrategy({
    clientID:"6577783689004963" ,
    clientSecret:"6c96ea81ff4e4c5e80981b515dd96782" ,
    callbackURL: "/auth/instagram/callback",
    scope:["profile","email"]
  },
  async function (accessToken, refreshToken, profile, done)  {
    done(null,profile)
    try {
        
        let user = User.findOne({  login: profile.id  });
               if(user){
              newUser=   new User({
                   //email: profile.emails[0].value,
                   name: profile.displayName,
                   image:profile.photos[0].value,
                   
                   provider: "instagram",
                  })
                   newUser.save();
                  return done(null, newUser);
                }
                else 
                  return done(null, user);
                
              } catch (error) {
                return done(error);
               }
  }
));


passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
