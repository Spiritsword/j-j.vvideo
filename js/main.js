var game;
window.onload = function () {
  var config = {
    type: Phaser.AUTO,
    width: 360,
    height: 740,
    parent: 'phaser-game',
    scene: [SceneMain],
  };
  game = new Phaser.Game(config);
  game.resize(window.innerWidth, window.innerHeight);
};
