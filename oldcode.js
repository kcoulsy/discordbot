        // fetchMember(user.id).then(user => {
        // user._roles.forEach(roleId => {
        //     if (specRoleMap[roleId]) {
        //         userObj.playerRole = specRoleMap[roleId];
        //     }
        //     if (classRoleMap[roleId]) {
        //         userObj.playerClass = classRoleMap[roleId];
        //     }
        // });
        // if (!userObj.playerRole || !userObj.playerClass) {
        //     user.sendMessage(
        //         'You need to pick a class and role to sign up to an event. You can do this in the #role-assign channel of the discord'
        //     );
        //     return;
        // }
        // const state = store.getState();
        // const storedEvent = state.find(function(ev) {
        //     return ev.id == id;
        // });

        //   reaction.message.edit(
        //       new Discord.RichEmbed()
        //           .setThumbnail(storedEvent.event.img)
        //           .setColor(storedEvent.event.color)
        //           .addField(title, generateMessage(bot, storedEvent.store))
        //   );