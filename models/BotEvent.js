class BotEvent {
    constructor(data) {
      this.id = data.id;
      this.store = {};
      this.event = data.event
    }
  
    getStore() {
      return this.store;
    }
  
    addRole(roleName) {
      this.store[roleName] = {};
    }
  
    hasRole(roleName) {
      return typeof this.store[roleName] === "object";
    }

    returnRole(roleName) {
        if (this.hasRole(roleName)) {
            return this.store[roleName];
        }
        return {};
    }
  
    addClass(roleName, className) {
      if (!this.hasRole(roleName)) {
        this.addRole(roleName);
      }
      this.store[roleName][className] = [];
    }
    hasClass(roleName, className) {
      if (!this.hasRole(roleName)) {
        this.addRole(roleName);
      }
      return Array.isArray(this.store[roleName][className]);
    }
  
    addPlayer(playerObj, roleName, className) {
      if (!this.hasRole(roleName)) {
        this.addRole(roleName);
      }
      if (!this.hasClass(roleName, className)) {
        this.addClass(roleName, className);
      }
      const player = this.findPlayerById(playerObj.id);
      if (player) {
        this.removePlayer(player.player, player.roleName, player.className);
      }
      this.store[roleName][className].push(playerObj);
    }
  
    findPlayerById(playerId) {
      const store = this.getStore();
      for (let role in store) {
        if (store.hasOwnProperty(role)) {
          for (let playerClass in store[role]) {
            if (store[role].hasOwnProperty(playerClass)){
              for (let i = 0; i < store[role][playerClass].length; i++) {
                if (store[role][playerClass][i].id == playerId) {
                  return {
                    player: store[role][playerClass][i],
                    roleName: role,
                    className: playerClass
                  }
                }
              }
            } 
          }
        }
      }
      return false;
    }
  
    removePlayer(playerObj, roleName, className) {
      if (!this.hasRole(roleName)) {
        this.addRole(roleName);
      }
      if (!this.hasClass(roleName, className)) {
        this.addClass(roleName, className);
      }
      this.store[roleName][className] = this.store[roleName][className].filter(
        player => player !== playerObj
      );
    }
  }

  module.exports = {
      BotEvent
  }