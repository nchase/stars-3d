import Mousetrap from 'mousetrap';

export function InitSettings(AppState) {
  Mousetrap.bind('left', event => {
    event.preventDefault();

    var { pointer } = AppState.objects;

    pointer.x = pointer.x - 10;
  });

  Mousetrap.bind('right', event => {
    event.preventDefault();

    var { pointer } = AppState.objects;

    pointer.x = pointer.x + 10;
  });

  Mousetrap.bind('up', event => {
    event.preventDefault();

    var { pointer } = AppState.objects;

    pointer.y = pointer.y - 10;
  });

  Mousetrap.bind('down', event => {
    event.preventDefault();

    var { pointer } = AppState.objects;

    pointer.y = pointer.y + 10;
  });
}

// might want to refactor the whole game state thing to ECS[^1]
// at some point:
export let GameState = (window.AppState = {
  objects: {
    sampleMultiplier: 1,
  },
});

export function updateGameObject(newObjectState) {
  GameState.objects = { ...GameState.objects, ...newObjectState };
}

// [^1]: https://en.wikipedia.org/wiki/Entity_component_system
