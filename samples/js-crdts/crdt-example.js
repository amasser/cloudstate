/*
 * Copyright 2019 Lightbend Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const crdt = require("cloudstate").crdt;

const entity = new crdt.Crdt(
  "crdts/crdt-example.proto",
  "com.example.crdts.CrdtExample",
  {
    includeDirs: ["../../protocols/example"]
  }
);

entity.commandHandlers = {
  IncrementGCounter: incrementGCounter,
  GetGCounter: getGCounter,
  UpdatePNCounter: updatePNCounter,
  GetPNCounter: getPNCounter,
  MutateGSet: mutateGSet,
  GetGSet: getGSet,
  MutateORSet: mutateORSet,
  GetORSet: getORSet
};

function incrementGCounter(update, ctx) {
  if (update.value < 0) {
    ctx.fail("Cannot decrement gcounter");
  }

  if (ctx.state === null) {
    ctx.state = new crdt.GCounter();
  }

  if (update.value > 0) {
    ctx.state.increment(update.value);
  }
  return {
    value: ctx.state.value
  };
}

function getGCounter(get, ctx) {
  if (ctx.state === null) {
    ctx.state = new crdt.GCounter();
  }

  return {
    value: ctx.state.value
  };
}

function updatePNCounter(update, ctx) {
  if (ctx.state === null) {
    ctx.state = new crdt.PNCounter();
  }

  if (update.value !== 0) {
    ctx.state.increment(update.value);
  }
  return {
    value: ctx.state.value
  };
}

function getPNCounter(get, ctx) {
  if (ctx.state === null) {
    ctx.state = new crdt.PNCounter();
  }

  return {
    value: ctx.state.value
  };
}

function mutateGSet(update, ctx) {
  if (ctx.state === null) {
    ctx.state = new crdt.GSet();
  }

  update.add.forEach(value => {
    ctx.state.add(value)
  });

  return {
    size: ctx.state.size
  }
}

function getGSet(get, ctx) {
  if (ctx.state === null) {
    ctx.state = new crdt.GSet();
  }

  return {
    items: Array.from(ctx.state)
  };
}

function mutateORSet(update, ctx) {
  if (ctx.state === null) {
    ctx.state = new crdt.ORSet();
  }

  if (update.clear) {
    ctx.state.clear();
  }
  update.remove.forEach(value => {
    ctx.state.delete(value);
  });
  update.add.forEach(value => {
    ctx.state.add(value);
  });

  return {
    size: ctx.state.size
  }
}

function getORSet(get, ctx) {
  if (ctx.state === null) {
    ctx.state = new crdt.ORSet();
  }

  return {
    items: Array.from(ctx.state)
  };
}


// Export the entity
module.exports = entity;