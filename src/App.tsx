import { Component, For, createEffect } from 'solid-js';
import { createStore, SetStoreFunction, Store } from "solid-js/store";

import logo from './logo.svg';
import styles from './App.module.css';

const arr3 = Array.from({ length: 3 }, (value, index) => index);

function createLocalStore<T extends object>(
  name: string,
  init: T
): [Store<T>, SetStoreFunction<T>] {
  // const localState = localStorage.getItem(name);
  const [state, setState] = createStore<T>(
    init
    // localState ? JSON.parse(localState) : init
  );
  createEffect(() => localStorage.setItem(name, JSON.stringify(state)));
  return [state, setState];
}
export function removeIndex<T>(array: readonly T[], index: number): T[] {
  return [...array.slice(0, index), ...array.slice(index + 1)];
}

interface Block  { id: number; aX: number; aY: number; bX: number; bY: number; value: string, valid: boolean };
interface CheckStruct {
  [key: string]: number,
  '0': number,
  '1': number,
  '2': number,
  '3': number,
  '4': number,
  '5': number,
  '6': number,
  '7': number,
  '8': number,
  '9': number,
};
interface CheckGridStruct {rows: CheckStruct[], columns: CheckStruct[], squares: CheckStruct[] }


const App: Component = () => {

  const idToCoor = (index: number) => {
    return {
      aX: Math.floor(index / (3 * 3 * 3)),
      aY: Math.floor((index / (3 * 3)) % (3)),
      bX: Math.floor((index % (3 * 3)) / 3),
      bY: Math.floor(index % (3)),
    };
  }

  const [blocks, setBlocks] = createLocalStore<Block[]>("blocks", Array.from({ length: 3 * 3 * 3 * 3}, (value, index) : Block => {
    let {aX, aY, bX, bY} = idToCoor(index);
    return {
      id: index,
      aX,
      aY,
      bX,
      bY,
      value: '',
      valid: true
    };
  }));

  const validateBlocks = (blocks: Block[]) => {
    const checks: CheckGridStruct = {
      rows: [],
      columns: [],
      squares: [],
    };

    blocks.forEach((block, idx) => {
      let {aX, aY, bX, bY} = idToCoor(idx);
      const row = (aX * 3) + bX;
      const column = (aY * 3) + bY;
      checks.rows[row] = checks.rows[row] ?? {};
      const val = checks.rows[row];
      if(!block.value) {
        setBlocks(idx, Object.assign({}, block, {
          valid: true
        }));
        return;
      }
      if(val[block.value] !== undefined) {
        setBlocks(idx, Object.assign({}, block, {
          valid: false
        }));
        setBlocks(val[block.value], Object.assign({}, block, {
          valid: false
        }));
      } else {
        setBlocks(idx, Object.assign({}, block, {
          valid: true
        }));
        val[block.value] = idx;
      }
    });
    return blocks
  }
  const setBlockValue = (aX: number, aY: number, bX: number, bY: number, value: string) => {
    setBlocks(getBlockID(aX, aY, bX, bY),{
      id: (aX*3*3*3)+(aY*3*3)+(bX*3)+(bY),
      aX,
      aY,
      bX,
      bY,
      value,
      valid: true
    });
    validateBlocks(blocks);
  };

  const getBlockValue = (aX: number, aY: number, bX: number, bY: number) => {
    return blocks[(aX*3*3*3)+(aY*3*3)+(bX*3)+(bY)].value
  };

  const getBlockClass = (aX: number, aY: number, bX: number, bY: number) => {
    return blocks[(aX*3*3*3)+(aY*3*3)+(bX*3)+(bY)].valid ? '' : 'invalid';
  };

  const getBlockID = (aX: number, aY: number, bX: number, bY: number) => {
    return blocks[(aX*3*3*3)+(aY*3*3)+(bX*3)+(bY)].id;
  };

  const getBlockCoordinates = (aX: number, aY: number, bX: number, bY: number) => {
    const block =  blocks[(aX*3*3*3)+(aY*3*3)+(bX*3)+(bY)];
    return `${block.aX}-${block.aY}-${block.bX}-${block.bY}`;
  };


  return (
    <main class={styles.App}>
      <header class={styles.header}>
      </header>
      <table>
        <For each={arr3} fallback={<div>Loading...</div>}>
          {(aX) => (
            <tr>
              <For each={arr3} fallback={<div>Loading...</div>}>
                {(aY) => (
                  <td>
                    <table>
                      <For each={arr3} fallback={<div>Loading...</div>}>
                        {(bX) => (
                          <tr>
                            <For each={arr3} fallback={<div>Loading...</div>}>
                              {(bY) => (
                                <td
                                  data-pos={getBlockID(aX, aY, bX, bY)}
                                  data-coor={`${aX}-${aY}-${bX}-${bY}`}
                                  data-block={getBlockCoordinates(aX, aY, bX, bY)}
                                  class={getBlockClass(aX, aY, bX, bY)}>
                                  <input
                                    type="text"
                                    value={getBlockValue(aX, aY, bX, bY)}
                                    maxLength="1"
                                    onChange={(e) => setBlockValue(aX, aY, bX, bY, e.currentTarget.value)} />
                                </td>
                              )}
                            </For>
                          </tr>
                        )}
                      </For>
                    </table>
                  </td>
                )}
              </For>
            </tr>
          )}
        </For>
      </table>
    </main>
  );
};

export default App;
