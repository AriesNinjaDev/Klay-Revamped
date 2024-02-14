/*

Things to do:
---------------
Load >50 messages
Group Chats
Order chats / Unread
Re-impliment seen bar
Re-impliment online status
Themes
Settings
Reactions
:: Emojis

*/

const express = require('express')
const app = express()
const port = 3000
const path = require('path');
var server = require('http').Server(app);
const dbc = require('./server/mon.js');
const mail = require('./server/mail.js');
const crypto = require('crypto');

function gsi() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `${timestamp}-${random}`;
}

function hash(string) {
  const hash = crypto.createHash('sha256');
  hash.update(string);
  return hash.digest('hex');
}

app.use(express.static(__dirname + '/scr'));
// Render Html File
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/pub/index.html'));
});

app.get('/login', function(req, res) {
  res.sendFile(path.join(__dirname, '/pub/login.html'));
});

app.get('/onboarding', function(req, res) {
  res.sendFile(path.join(__dirname, '/pub/reg.html'));
});

app.get('/home', function(req, res) {
  res.sendFile(path.join(__dirname, '/pub/home.html'));
});

app.get('/loading-animation', function(req, res) {
  res.sendFile(path.join(__dirname, '/pub/loading.html'));
});

var chatId;

app.get('/testPageA8', function(req, res) {
  res.sendFile(path.join(__dirname, '/pub/test.html'));
});

app.get('/chat/:chatid', function(req, res) {
  chatId = req.params.chatid;
  res.render('chat.ejs', {
    chatId
  });
});


server.listen(8080);
console.log("Server Running.")


var io = require('socket.io')(server);
io.sockets.on('connection', function(socket) {
  var chatId = socket.handshake.headers.referer.split('/').pop();
  socket.join(chatId);

  if (chatId == "testPageA8") {
    chatId = '1704746674555-427243_1704746610377-238626';
  }



  /* socket.emit("credentialdata",{"user1":{"name":u1_name,"pwd":u1_pwd,"cookie":u1_cookie},"user2":{"name":u2_name,"pwd":u2_pwd,"cookie":u2_cookie}})*/

  /*
  dbc.registerUser("ADMIN", "4292bd7cd65c90a1e61a46fc9786eb7f247d8d3789ea5a916687f9f6ec32db35", "100100", "1")
  */

  socket.on('chatOutbound', function(msg) {
    dbc.postChat({
        "content": msg.trs,
        "name": msg.usert,
        "time": msg.timev,
        "r": msg.r,
        "rc": msg.rc,
        "im": msg.tpan,
        "imc": msg.tp_avatar
      }, chatId)
      .then(result => {
        socket.to(chatId).emit("chatIncoming", msg);
      });
  })

  socket.on('clearclear', function(id) {
    dbc.clearChat(id)
      .then(result => {
        io.sockets.emit('forceclosetargeted', chatId)
      });
  })

  socket.on('destroyAllChats', function() {
    dbc.clearAllChats()
      .then(result => {
        io.sockets.emit('forceclose')
      });
  })

  /*socket.on('resp', function(usr) {

      if (usr.user=="Aries") {
        usv.aries = true
        backlog.aries = true
      } else {
        usv.liz = true
        backlog.liz = true
      }
    });*/


  socket.on('forceforce', function(data) {
    io.sockets.emit('forceclose');
  });



  socket.on('login', (r) => {
    /*if (data.userId == "Aries") {
      aries = true;
      aid = socket.id;
    } else {
      liz = true;
      lid = socket.id;
    }*/
    //io.sockets.emit('update', {aries,liz});

    
    dbc.requestChat(chatId,r)
      .then(result => {
        socket.emit("chatData", result[0], result[1])
      })

  });

  socket.on('homelogin', function(data) {
    /*if (data.userId == "Aries") {
      aries = true;
      aid = socket.id;
    } else {
      liz = true;
      lid = socket.id;
    }*/
    io.sockets.emit('pingOnlineStatus');
    dbc.requestUser(data)
      .then(result => {
        socket.emit("userdata", result)
      })
  });

  //  socket.on('reping', function(data){
  //   if (data.userId == "Aries") {
  //     aries = true;
  //     aid = socket.id;
  //   } else {
  //     liz = true;
  //     lid = socket.id;
  //   }
  //    io.sockets.emit('reupdate', {aries,liz});
  // });

  // socket.on("disconnect", (reason) => {
  //   if (aid == socket.id) {
  //     var parm = "Aries"
  //     aries = false;
  //   } else {
  //     var parm = "Liz"
  //     liz = false;
  //   }
  //    io.sockets.emit('update', {aries,liz});
  // });

  socket.on("typingPing", (user) => {
    socket.to(chatId).emit('typingPingBC', user);
  });

  // socket.on("createUserAccount", (user, email) => {
  //   const idI = gsi();
  //   dbc.registerUser(user, idI, email);

  // });

  socket.on('submitUser', function(usr) {
    dbc.chkUsername(usr)
      .then(result => {
        socket.emit("userRes", result);

      });

  });

  socket.on('obtainSSA', function(usr) {
    dbc.SSA(usr)
      .then(result => {
        socket.emit("SSA", result);
      });
  });

  var thisuserdata

  socket.on('verifyId', function(id) {
    var allowed
    dbc.vid(id)
      .then(result => {
        allowed = result;
        thisuserdata = result;
        socket.emit("verifyIdResult", allowed);
      })
      .catch(error => {
        console.log(error);
      });

  });

  socket.on('userToId', function(user) {
    dbc.u2id(user)
      .then(result => {
        socket.emit("userToIdResult", result);
      })
      .catch(error => {
        console.log(error);
      });

  });

  socket.on('onboardUser', function(auth,name) {
    dbc.onboardUser(auth,name)
      .then(result => {
        socket.emit("onboardUserResponse", result);
      })
      .catch(error => {
        console.log(error);
      });

  });

  socket.on('userToIdF', function(user) {
    dbc.u2id(user)
      .then(result => {
        socket.emit("userToIdFResult", result);
      })
      .catch(error => {
        console.log(error);
      });

  });

  socket.on('performGOOGLELogin', function(cred,email) {
    dbc.chkGoogleAuth(cred)
      .then(result => {
        if (result.new) {
          const idI = gsi();
          dbc.registerUser(cred, idI, email);
        }
        socket.emit("loginResults", result);
      })
      .catch(error => {
        console.log(error);
      });

  });

  /*

1. get responder data
2. get sender id from username
3. add sender id to responder friend list
4. add responder id to sender friend list
5. delete pending fr req from sender
6. delete pending fr req from responder

  */

  socket.on("getName", (ide, pendRec, pendType) => {
    if (pendType) {
      dbc.idToName(ide)
        .then(result => {
          if (pendRec) {
            socket.emit("getName", ide, result, "pi");
          } else {
            socket.emit("getName", ide, result, "po");
          }
        })
        .catch(error => {
          console.log(error);
        });

      return false
    }
    dbc.idToName(ide)
      .then(result => {
        allowed = result;
        socket.emit("getName", ide, allowed, "f");
      })
      .catch(error => {
        console.log(error);
      });

  });

  socket.on("getCMName", (ide) => {
    dbc.idToNameAndEmail(ide)
      .then(result => {
        socket.emit("getCMName", result.name, ide, result.email);
      })
      .catch(error => {
        console.log(error);

      });

  });

  socket.on("getCMLName", (ide, xc) => {
    dbc.idToName(ide)
      .then(result => {
        allowed = result;
        socket.emit("getCMLName", allowed, xc);
      })
      .catch(error => {
        console.log(error);

      });

  });

  socket.on("chatCheck", (user, chatid) => {
    dbc.chatCheck(user, chatid)
      .then(result => {
        allowed = result;
        socket.emit("chatResponse", allowed);
      })
      .catch(error => {
        console.log(error);

      });

  });

  socket.on("checkAndSendF", (checked, sender) => {
    dbc.checkExists(checked)
      .then(result => {

        if (result) {
          dbc.pendingSend(checked, sender, true)
            .then(result => {
              if (result) {
                dbc.pendingSend(sender, checked, false)
                  .then(result => {
                    if (result) {



                      dbc.chkInFriends(sender, checked)
                        .then(result => {

                          if (!result) {
                            socket.emit("checkExistsF", true);
                          } else {
                            socket.emit("checkExistsF", false, "This user is already your friend!");
                          }


                        });


                    }
                  });
              } else {
                socket.emit("checkExistsF", false, "This user has friend requests disabled.");
              }

            });
        } else {
          socket.emit("checkExistsF", false, "This user does not exist.");
        }
      })
      .catch(error => {
        console.log(error);

      });

  });

  //--- PAD

  socket.on("checkAndSendC", (checked, sender) => {
    dbc.checkExists(checked)
      .then(result => {
        if (result) {
          dbc.chkInChats(sender, checked)
            .then(result => {
              if (!result) {
                dbc.initChatA(checked, sender, false)
                  .then(result => {
                    if (result) {
                      dbc.initChatA(sender, checked, true)
                        .then(result => {
                          if (result) {
                            dbc.createDMOnGeneric(checked, sender)
                              .then(result => {
                                socket.emit("checkExistsC", true, result);
                              })
                          }
                        });
                    } else {
                      socket.emit("checkExistsC", false, "This user requires you to be friends first.");
                    }
                  });
              } else {
                socket.emit("checkExistsC", false, "You already have a chat with this user!");
              }
            });
        } else {
          socket.emit("checkExistsC", false, "This user does not exist.");
        }
      })
      .catch(error => {
        console.log(error);
      });
  });

  //--- PAD

  socket.on("frResp", (from, ans, resper) => {

    if (ans) {

      dbc.frRespYes(resper, from)
        .then(result => {
          socket.emit("pleaseTerminate");
          io.sockets.emit('updateRequests', from);
        })
        .catch(error => {
          console.log(error);
        });

    } else {

      dbc.frRespNo(resper, from)
        .then(result => {
          socket.emit("pleaseTerminate");
          io.sockets.emit('updateRequests', from);
        })
        .catch(error => {
          console.log(error);
        });

    }



  });

  socket.on("deleteChatObject", (chatId,credential) => {
    if (!credential) {
      return false;
    }
    dbc.deleteChatObject(chatId);
  });

  socket.on("shiftStartPointer", (chatId,user,index) => {
    dbc.shiftStartPointer(chatId,user,index);
  });

  socket.on("removeFriend", (user,friend) => {
    dbc.removeFriend(user,friend)
    .then(result => {
      socket.emit("removeFriendResponse",result);
    });
  });

  socket.on('ping', function(email,id,name,myname) {
    mail.ping(email,id,name,myname)
      .then(result => {
        console.log(result);
      });
  });


});