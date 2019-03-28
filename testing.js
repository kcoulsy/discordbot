class BotEvent {
  constructor(data) {
    this.id = data.id;
    this.store = {};
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
    this.store[roleName][className].push(playerObj);
  }

  isStored() {
    // return
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
    console.log('args', playerObj, roleName, className);
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
var player = {
  id: 123,
  name: 'bob'
}

var playerTwo = {
  id: 155,
  name: 'john'
}

var store = new BotEvent({ id: 1 });
store.addPlayer(player, "Tank", "Warrior");
store.addPlayer(playerTwo, "Healer", "Paladin");
// console.log(store.getStore());

// store.removePlayer(player, "Tank", "Warrior");
var play = store.findPlayerById(123);
console.log(play);
console.log(store);
store.removePlayer(play.player, play.roleName, play.className);
console.log(store);
